/**
 * Panel CS — risiko customer & blacklist COD (flow `f15` / `f24`).
 *
 * BE sudah punya modelnya: tabel `customers` (keadaan: `risk_flag`, `status`)
 * dan `customer_risk_flags` (riwayat: alasan, operator, waktu). Baca/tulis
 * lewat sesi `cs@` (`refToken`) — RLS hanya mengizinkan CS menandai flag
 * (customer/merchant/kurir ditolak 403; terverifikasi 2026-10-12).
 *
 * Semua tulis best-effort: pemanggil `.catch(() => {})`, UI tetap jalan.
 */
import type {
  AdminCustomer,
  CustomerRiskFlag,
  CustomerStatus,
  LedgerEntry,
} from '../types'
import { toLedgerEntry } from '../data/beMapping'
import type { LedgerRow } from '../data/beMapping'
import { apiEnabled, createWith, patch, restWith } from './supabase'
import { refToken } from './reference'

const CS_EMAIL = (import.meta.env.VITE_DEMO_CS_EMAIL as string | undefined) || 'cs@sa7tein.app'

interface CustomerRow {
  id: number
  name: string
  risk_flag: boolean | null
  status: string | null
  /** Join `users(phone)` tak didukung Worker → phone diambil lewat query kedua. */
  user_id: number | null
}
interface UserPhoneRow {
  id: number
  phone: string | null
}
interface FlagRow {
  id: number
  customer_id: number
  reason: string | null
  by_operator_id: number | null
  at: string
}

/** Registri customer BE → opsi picker panel CS (id berawalan `be-`). */
export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  const token = await refToken()
  const rows = await restWith<CustomerRow>(
    token,
    'customers',
    '?select=id,name,risk_flag,status,user_id&order=id.asc',
  )
  // Telepon tinggal di `users`; embed `users(phone)` dibuang Worker, jadi join
  // manual (pola yang sama dipakai audit.ts untuk email aktor).
  const userIds = [...new Set(rows.flatMap((r) => (r.user_id != null ? [r.user_id] : [])))]
  const users = userIds.length
    ? await restWith<UserPhoneRow>(token, 'users', `?select=id,phone&id=in.(${userIds.join(',')})`)
    : []
  const phoneById = new Map(users.map((u) => [u.id, u.phone]))
  return rows.map((r) => ({
    id: `be-${r.id}`,
    name: r.name,
    phone: (r.user_id != null ? phoneById.get(r.user_id) : null) ?? '-',
    status: (r.status as CustomerStatus) ?? 'active',
    riskFlag: Boolean(r.risk_flag),
  }))
}

/** Riwayat flag risiko dari BE → `admin.customerRiskFlags`. */
export async function fetchCustomerRiskFlags(): Promise<CustomerRiskFlag[]> {
  const token = await refToken()
  const rows = await restWith<FlagRow>(
    token,
    'customer_risk_flags',
    '?select=id,customer_id,reason,by_operator_id,at&order=id.desc',
  )
  return rows.map((r) => ({
    id: `be-rf-${r.id}`,
    customerId: `be-${r.customer_id}`,
    reason: r.reason ?? '',
    at: r.at,
    byOperatorId: r.by_operator_id === null ? '' : String(r.by_operator_id),
  }))
}

/**
 * Ledger platform dari `enterprise_ledger` (terbaru dulu). Nominal BE JOD dan
 * bisa negatif (`fee`), jadi `direction` diturunkan dari tandanya dan `amount`
 * disimpan absolut seperti tipe `LedgerEntry`. `[]` = tabel kosong (mock tetap).
 */
export async function fetchEnterpriseLedger(): Promise<LedgerEntry[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<LedgerRow>(
    token,
    'enterprise_ledger',
    '?select=id,order_id,entry_type,party,amount_jod,idempotency_key,note,created_at&order=id.desc',
  )
  return rows.map(toLedgerEntry)
}

/** `users.id` operator CS (`cs@sa7tein.app`) — untuk kolom `by_operator_id`. */
let opId: Promise<number | null> | null = null
function csOperatorId(): Promise<number | null> {
  if (!opId) {
    opId = refToken()
      .then((t) => restWith<{ id: number }>(t, 'users', `?select=id&email=eq.${CS_EMAIL}&limit=1`))
      .then((rows) => rows[0]?.id ?? null)
      .catch(() => null)
  }
  return opId
}

/**
 * Tandai risiko satu customer BE. Hanya menerima id `be-<n>` (customer BE);
 * id mock `cus-N` dilewati karena tak punya padanan di BE.
 */
export async function flagCustomerRisk(input: {
  customerRef: string
  reason: string
}): Promise<void> {
  const m = /^be-(\d+)$/.exec(input.customerRef)
  if (!apiEnabled || !m) return
  const token = await refToken()
  const byOperatorId = await csOperatorId()
  await createWith(token, 'customer_risk_flags', {
    customer_id: Number(m[1]),
    reason: input.reason,
    by_operator_id: byOperatorId,
  })
  // Cermin keadaan (riwayat tetap append-only di customer_risk_flags).
  await patch(token, 'customers', `?id=eq.${m[1]}`, { risk_flag: true }).catch(() => {})
}
