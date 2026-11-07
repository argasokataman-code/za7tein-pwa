/**
 * Dispatch kurir partner (§9.3–§9.5) ↔ `dispatch_assignments` + `couriers`.
 *
 * Kontrak live (diverifikasi 2026-10-17):
 *  - `dispatch_assignments`: `id, order_id, courier_id, status, reject_reason,
 *    reserved_at, responded_at`; `status` default `reserved` = **menunggu
 *    respons**, lalu `approved | rejected` (ditulis saat mitra merespons) atau
 *    `expired` (milik BE, OPEN-11). Merchant menulis baris `reserved` lewat
 *    `assignOrderCourier`; mitra merespons di `src/api/partner.ts`.
 *  - `couriers`: `courier_type` berisi kode `courier_types` (`inhouse`,
 *    `partner`, `partner_ondemand`); `availability` = available/busy/offline.
 *
 * Kandidat dispatch = kurir **bukan inhouse** (partner aplikator). Baca memakai
 * sesi CS (`refToken`) karena RLS `couriers` menutup daftar lintas merchant.
 */
import { refToken } from './reference'
import { apiEnabled, restWith, rpc } from './supabase'
import type { CourierPartner, CourierPartnerStatus } from '../types'

interface CourierRow {
  id: number
  name: string
  phone: string | null
  availability: string | null
  active_order_count: number | null
  last_seen_at: string | null
  latitude: number | null
  longitude: number | null
  courier_type: string | null
  created_at: string
}

const STATUS: Record<string, CourierPartnerStatus> = {
  available: 'available',
  reserved: 'reserved',
  busy: 'busy',
  on_delivery: 'busy',
  unavailable: 'offline',
  offline: 'offline',
}

/** Kurir partner (bukan inhouse) sebagai kandidat dispatch. */
export async function fetchPartnerCouriers(): Promise<CourierPartner[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<CourierRow>(
    token,
    'couriers',
    '?select=*&courier_type=neq.inhouse&order=id.asc',
  )
  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    phone: row.phone ?? '',
    status: STATUS[row.availability ?? ''] ?? 'offline',
    activeOrders: row.active_order_count ?? 0,
    warningLetters: 0,
    lastLocationAt: row.last_seen_at,
    lastLat: row.latitude,
    lastLng: row.longitude,
    joinedAt: row.created_at,
  }))
}

/**
 * Tugaskan order ke kurir partner pilihan BE (`dispatch_partner(p_order)`).
 *
 * BE yang memilih kandidat (idle terlama + batas jarak, tie-break OPEN-11),
 * jadi argumen kurir tidak dikirim. Mengembalikan id `dispatch_assignments`
 * yang dibuat, atau `null` bila BE menolak/API mati.
 */
export async function dispatchPartnerOrder(orderId: string): Promise<number | null> {
  if (!apiEnabled) return null
  const oid = Number(/^api-(\d+)$/.exec(orderId)?.[1] ?? (/^\d+$/.test(orderId) ? orderId : NaN))
  if (!Number.isFinite(oid)) return null
  try {
    const token = await refToken()
    const id = await rpc<number>(token, 'dispatch_partner', { p_order: oid })
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}
