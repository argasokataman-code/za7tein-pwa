/**
 * Rekening pencairan (R-WALLET-01, flow f6) ↔ tabel `payout_accounts`.
 *
 * Kontrak live (diverifikasi 2026-10-17): `id, user_id, bank_name,
 * account_number, holder_name, is_primary, created_at`. Baris milik **user**
 * (`user_id`), bukan peran: merchant demo = user 2, kurir demo = user 3. RLS
 * membuka tulis ke pemilik baris; sesi CS (`refToken`) juga boleh, jadi modul ini
 * memakai CS seperti `admin.ts`/`chat.ts` dan menyaring sendiri per `user_id`.
 *
 * Semua tulis best-effort: pemanggil `.catch(() => {})`, UI tetap jalan. Id mock
 * (`pa-*`/`cpa-*`) bukan angka, jadi tak pernah ditulis ke BE.
 */
import { refToken } from './reference'
import { apiEnabled, createWithReturn, deleteWith, patch, restWith } from './supabase'
import type { PayoutAccount } from '../types'

/** `users.id` pemilik rekening demo (sejajar `reference.ts`/`orders.ts`). */
export const PAYOUT_MERCHANT_USER_ID = 2
export const PAYOUT_COURIER_USER_ID = 3

interface PayoutAccountRow {
  id: number
  user_id: number
  bank_name: string | null
  account_number: string | null
  holder_name: string | null
  is_primary: boolean | null
}

export interface PayoutAccountInput {
  bankName: string
  accountNumber: string
  holderName: string
}

function toAccount(row: PayoutAccountRow): PayoutAccount {
  return {
    id: String(row.id),
    bankName: row.bank_name ?? '',
    accountNumber: row.account_number ?? '',
    holderName: row.holder_name ?? '',
    isPrimary: Boolean(row.is_primary),
  }
}

/** Id mock (`pa-*`/`cpa-*`) → NaN; id BE (`"7"`) → 7. */
function numericId(id: string): number {
  return /^\d+$/.test(id) ? Number(id) : NaN
}

/** Rekening satu user; utama dulu, lalu urut id. */
export async function fetchPayoutAccounts(userId: number): Promise<PayoutAccount[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<PayoutAccountRow>(
    token,
    'payout_accounts',
    `?select=id,user_id,bank_name,account_number,holder_name,is_primary&user_id=eq.${userId}&order=is_primary.desc,id.asc`,
  )
  return rows.map(toAccount)
}

/** Tambah rekening; rekening pertama user otomatis jadi utama. */
export async function createPayoutAccount(
  userId: number,
  input: PayoutAccountInput,
): Promise<PayoutAccount | undefined> {
  if (!apiEnabled) return undefined
  const token = await refToken()
  const existing = await restWith<{ id: number }>(
    token,
    'payout_accounts',
    `?select=id&user_id=eq.${userId}&limit=1`,
  )
  const rows = await createWithReturn<PayoutAccountRow>(
    token,
    'payout_accounts',
    {
      user_id: userId,
      bank_name: input.bankName,
      account_number: input.accountNumber,
      holder_name: input.holderName,
      is_primary: existing.length === 0,
    },
    'id,user_id,bank_name,account_number,holder_name,is_primary',
  )
  return rows[0] ? toAccount(rows[0]) : undefined
}

/** Ubah rekening milik backend (id non-numerik dilewati). */
export async function updatePayoutAccount(id: string, input: PayoutAccountInput): Promise<void> {
  if (!apiEnabled) return
  const pid = numericId(id)
  if (!Number.isFinite(pid)) return
  const token = await refToken()
  await patch(token, 'payout_accounts', `?id=eq.${pid}`, {
    bank_name: input.bankName,
    account_number: input.accountNumber,
    holder_name: input.holderName,
  })
}

/** Hapus rekening backend (id non-numerik dilewati). */
export async function deletePayoutAccount(id: string): Promise<void> {
  if (!apiEnabled) return
  const pid = numericId(id)
  if (!Number.isFinite(pid)) return
  const token = await refToken()
  await deleteWith(token, 'payout_accounts', `?id=eq.${pid}`)
}

/** Jadikan satu rekening utama: matikan utama seluruh user dulu, lalu nyalakan satu. */
export async function setPrimaryPayoutAccount(userId: number, id: string): Promise<void> {
  if (!apiEnabled) return
  const pid = numericId(id)
  if (!Number.isFinite(pid)) return
  const token = await refToken()
  await patch(token, 'payout_accounts', `?user_id=eq.${userId}`, { is_primary: false })
  await patch(token, 'payout_accounts', `?id=eq.${pid}`, { is_primary: true })
}
