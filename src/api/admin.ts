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
import type { AdminCustomer, CustomerRiskFlag, CustomerStatus } from '../types'
import { apiEnabled, createWith, patch, restWith } from './supabase'
import { refToken } from './reference'

const CS_EMAIL = (import.meta.env.VITE_DEMO_CS_EMAIL as string | undefined) || 'cs@sa7tein.app'

interface CustomerRow {
  id: number
  name: string
  risk_flag: boolean | null
  status: string | null
  users: { phone: string | null } | null
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
    '?select=id,name,risk_flag,status,users(phone)&order=id.asc',
  )
  return rows.map((r) => ({
    id: `be-${r.id}`,
    name: r.name,
    phone: r.users?.phone ?? '-',
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
