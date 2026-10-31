/**
 * Kurir partner: identitas mitra, assignment, dan SP.
 *
 * Kontrak live (diverifikasi 2026-10-20):
 *  - `couriers.user_id` menunjuk akun login mitra; `courier_type = 'partner'`
 *    untuk mitra aplikator (bukan karyawan merchant).
 *  - `dispatch_assignments.status` default `reserved` = **menunggu respons**.
 *    Baris dibuat saat merchant menugaskan mitra (`assignOrderCourier`), lalu
 *    mitra menulis `approved`/`rejected` + `responded_at`. Status `expired`
 *    tetap milik BE (`expire_assignments()`, OPEN-11) — belum ada.
 *  - `punishments` dengan `subject_type='courier'` = SP aktif mitra.
 *
 * Sesi memakai akun demo mitra (`partner@sa7tein.app`) karena login WA E.164
 * belum ada (R-COU-PARTNER AC12). API gagal = pemanggil tetap memakai mock.
 */
import { refToken } from './reference'
import { apiEnabled, authUser, patch, restWith, sessionFor } from './supabase'
import type { CourierAssignment, CourierPartner, CourierPartnerStatus } from '../types'

const PARTNER_EMAIL =
  (import.meta.env.VITE_DEMO_PARTNER_EMAIL as string | undefined) || 'partner@sa7tein.app'
const PARTNER_PASSWORD =
  (import.meta.env.VITE_DEMO_PARTNER_PASSWORD as string | undefined) || 'demo1234'

/** Token mitra (lazy, sekali per sesi halaman). */
function partnerToken(): Promise<string> {
  return sessionFor(PARTNER_EMAIL, PARTNER_PASSWORD)
}

export interface PartnerCourierRow {
  id: number
  user_id: number | null
  name: string
  phone: string | null
  availability: string | null
  active_order_count: number | null
  last_seen_at: string | null
  created_at: string
}

interface AssignmentRow {
  id: number
  order_id: number
  courier_id: number
  status: string
  reject_reason: string | null
  reserved_at: string | null
  responded_at: string | null
}

const AVAILABILITY_IN: Record<string, CourierPartnerStatus> = {
  available: 'available',
  reserved: 'reserved',
  busy: 'busy',
  on_delivery: 'busy',
  unavailable: 'offline',
  offline: 'offline',
}

/** SQLite `datetime('now')` = UTC tanpa zona; `new Date` butuh bentuk ISO. */
export function sqlIso(value: string | null): string | null {
  if (!value) return null
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value
}

/** Status assignment BE → status layar. `reserved` = menunggu respons. */
export function toAssignmentStatus(status: string): CourierAssignment['status'] | null {
  if (status === 'reserved' || status === 'pending') return 'pending'
  if (status === 'approved' || status === 'rejected' || status === 'expired') return status
  return null
}

export function toPartner(
  row: PartnerCourierRow,
  warningLetters: number,
  hasPending: boolean,
): CourierPartner {
  const status: CourierPartnerStatus = hasPending
    ? 'reserved'
    : (AVAILABILITY_IN[row.availability ?? ''] ?? 'offline')
  return {
    id: String(row.id),
    name: row.name,
    phone: row.phone ?? '',
    status,
    activeOrders: row.active_order_count ?? 0,
    warningLetters,
    lastLocationAt: sqlIso(row.last_seen_at),
    joinedAt: sqlIso(row.created_at) ?? row.created_at,
  }
}

export function toAssignment(row: AssignmentRow): CourierAssignment | null {
  const status = toAssignmentStatus(row.status)
  if (!status) return null
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    partnerId: String(row.courier_id),
    status,
    sentAt: sqlIso(row.reserved_at) ?? new Date(0).toISOString(),
    ...(row.responded_at ? { respondedAt: sqlIso(row.responded_at) ?? row.responded_at } : {}),
    ...(row.reject_reason ? { rejectReason: row.reject_reason } : {}),
  }
}

export interface PartnerBoard {
  partner: CourierPartner
  assignments: CourierAssignment[]
}

/** Baris mitra milik sesi ini + assignment + SP aktif. `null` = bukan mitra. */
export async function fetchPartnerBoard(): Promise<PartnerBoard | null> {
  if (!apiEnabled) return null
  const token = await partnerToken()
  const me = await authUser<{ id: number }>(token)
  const rows = await restWith<PartnerCourierRow>(
    token,
    'couriers',
    `?select=*&user_id=eq.${Number(me.id)}&limit=1`,
  )
  const row = rows[0]
  if (!row) return null

  const [assignments, letters] = await Promise.all([
    restWith<AssignmentRow>(
      token,
      'dispatch_assignments',
      `?select=*&courier_id=eq.${row.id}&order=id.desc`,
    ).catch(() => [] as AssignmentRow[]),
    restWith<{ id: number }>(
      await refToken(),
      'punishments',
      `?select=id&subject_type=eq.courier&subject_id=eq.${row.id}&status=eq.issued`,
    ).catch(() => [] as { id: number }[]),
  ])

  const mapped = assignments.map(toAssignment).filter((a): a is CourierAssignment => a !== null)
  return {
    partner: toPartner(row, letters.length, mapped.some((a) => a.status === 'pending')),
    assignments: mapped,
  }
}

function numericId(value: string): number | null {
  return /^\d+$/.test(value) ? Number(value) : null
}

/** Tulis status mitra. `reserved` hanya dari dispatch, bukan aksi mitra. */
export async function setPartnerAvailability(
  partnerId: string,
  status: Exclude<CourierPartnerStatus, 'reserved'>,
): Promise<void> {
  if (!apiEnabled) return
  const id = numericId(partnerId)
  if (id === null) return
  const token = await partnerToken()
  await patch(token, 'couriers', `?id=eq.${id}`, {
    availability: status === 'offline' ? 'offline' : status,
    last_seen_at: new Date().toISOString(),
  })
}

/** Respons mitra: `approved`/`rejected` + waktu (COU-18). */
export async function respondPartnerAssignment(
  assignmentId: string,
  decision: 'approved' | 'rejected',
  reason?: string,
): Promise<void> {
  if (!apiEnabled) return
  const id = numericId(assignmentId)
  if (id === null) return
  const token = await partnerToken()
  await patch(token, 'dispatch_assignments', `?id=eq.${id}`, {
    status: decision,
    responded_at: new Date().toISOString(),
    ...(decision === 'rejected' ? { reject_reason: reason ?? '' } : {}),
  })
}
