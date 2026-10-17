/**
 * Saldo keuntungan platform (konsol SA, M9) ↔ `profit_withdrawals` +
 * `platform_profit`.
 *
 * Kontrak live (diverifikasi 2026-10-17):
 *  - `profit_withdrawals`: `period` (YYYY-MM), `amount_jod`, `method`,
 *    `status`, `created_at`. Check constraint hanya mengizinkan
 *    `processing|paid` (bukan `pending`) — diverifikasi lewat probe insert.
 *  - `platform_profit`: agregat per `period` (`gross_jod`, `cost_jod`,
 *    `net_jod`, `withdrawn_jod`). **Tidak ada** kolom PPh final; angka pajak
 *    tetap dihitung `data/superadmin.ts`, jadi hanya fee bruto + biaya yang
 *    ditimpa dari sini.
 *
 * Dibaca/ditulis lewat sesi `cs@` (`refToken`) — RLS mengizinkannya. Baca
 * mengembalikan `[]` kalau tabel kosong; pemanggil **mempertahankan mock**
 * (pola sama dengan modul API lain).
 */
import type { ProfitWithdrawal } from '../types'
import { refToken } from './reference'
import { apiEnabled, createWith, restWith } from './supabase'

interface WithdrawalRow {
  id: number
  period: string
  amount_jod: number
  method: string
  status: string
  created_at: string
}
interface ProfitRow {
  period: string
  gross_jod: number
  cost_jod: number
}

/** Waktu relatif singkat (menit/jam/hari) — cukup untuk kolom riwayat. */
function relativeTime(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.round(hours / 24)} hari lalu`
}

/** `status` BE (`processing|paid`) → union FE (`processing|settled`). */
function toWithdrawal(row: WithdrawalRow): ProfitWithdrawal {
  return {
    id: `pw-${row.id}`,
    at: relativeTime(row.created_at),
    amountJod: row.amount_jod,
    method: row.method,
    status: row.status === 'paid' ? 'settled' : 'processing',
  }
}

/** Riwayat penarikan keuntungan, terbaru dulu. `[]` = tabel kosong (pakai mock). */
export async function fetchWithdrawals(): Promise<ProfitWithdrawal[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<WithdrawalRow>(
    token,
    'profit_withdrawals',
    '?select=*&order=created_at.desc',
  )
  return rows.map(toWithdrawal)
}

/**
 * Baris agregat keuntungan terbaru. `{}` kalau tabel kosong — pemanggil
 * mempertahankan angka mock (fee bruto/PPh dihitung dari laporan pajak).
 */
export async function fetchPlatformProfit(): Promise<{ feeGrossJod?: number; costJod?: number }> {
  if (!apiEnabled) return {}
  const token = await refToken()
  const rows = await restWith<ProfitRow>(
    token,
    'platform_profit',
    '?select=*&order=period.desc&limit=1',
  )
  const row = rows[0]
  if (!row) return {}
  return { feeGrossJod: row.gross_jod, costJod: row.cost_jod }
}

/**
 * Catat penarikan keuntungan → satu baris `profit_withdrawals` berstatus
 * `processing`. `method` FE (teks tampilan) dipetakan ke nilai ringkas;
 * check constraint kolomnya hanya mengizinkan nilai `processing|paid`, jadi
 * status awal selalu `processing`.
 */
export async function createWithdrawal(input: { amountJod: number; method: string }): Promise<void> {
  if (!apiEnabled) return
  const token = await refToken()
  const method = /kartu/i.test(input.method) ? 'card' : 'bank_transfer'
  await createWith(token, 'profit_withdrawals', {
    period: new Date().toISOString().slice(0, 7),
    amount_jod: input.amountJod,
    method,
    status: 'processing',
  })
}
