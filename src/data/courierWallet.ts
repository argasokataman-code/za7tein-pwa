import { courierSelf, totalTips } from './courier'
import type { CourierTask, PayoutAccount, PayoutEntry } from '../types'

/**
 * Dompet kurir (R-WALLET-01, flow f6): **hanya menampung tips**. Gaji kurir
 * dibayar merchant dan platform tidak menahan dana kurir (C-06), jadi ongkir
 * tidak pernah masuk ke sini. Semua nominal IDR (R-CURR-01).
 *
 * Saldo = tips pengiriman sebelumnya (mock) + tips tugas yang sudah selesai −
 * pencairan yang sudah diminta. Tips dari tugas aktif belum bisa ditarik.
 */

/**
 * Ambang minimum penarikan tips. Angka **belum final di PRD** — `source.md:83`
 * menyebut contoh akumulasi ≥Rp50.000, dan `f6-cashout-payout/README.md:36`
 * menandainya UNRESOLVED. Dipakai sementara supaya aturan akumulasi punya
 * bentuk; kalau PO menetapkan angka lain, ganti di sini saja.
 */
export const COURIER_TIPS_MIN_WITHDRAW_IDR = 50_000

/**
 * Fee payout Xendit Rp2.500/transfer, **ditanggung kurir** (PO 2026-09-22,
 * `source.md:84`): dipotong dari nilai withdraw, bukan beban platform.
 */
export const COURIER_PAYOUT_FEE_IDR = 2_500

/**
 * Tips dari pengiriman sebelum aplikasi ini dibuka (mock). Tanpa ini saldo awal
 * cuma dari tugas contoh dan selalu di bawah ambang, sehingga alur pencairan
 * tak pernah bisa diperiksa.
 */
export const mockCourierTips: PayoutEntry[] = [
  {
    id: 'ctip-1',
    kind: 'tip',
    amount: 25_000,
    status: 'completed',
    createdAt: '2026-09-22T18:20:00+07:00',
  },
  {
    id: 'ctip-2',
    kind: 'tip',
    amount: 20_000,
    status: 'completed',
    createdAt: '2026-09-21T19:05:00+07:00',
  },
  {
    id: 'ctip-3',
    kind: 'tip',
    amount: 15_000,
    status: 'completed',
    createdAt: '2026-09-20T17:40:00+07:00',
  },
]

export const mockCourierPayoutAccounts: PayoutAccount[] = [
  {
    id: 'cpa-1',
    bankName: 'BCA',
    accountNumber: '5290 7788 1122',
    holderName: courierSelf.name,
    isPrimary: true,
  },
]

/** Saldo tips yang bisa ditarik: tips lama + tips tugas selesai − pencairan. */
export function courierTipsAvailable(tasks: CourierTask[], payouts: PayoutEntry[]): number {
  const seed = mockCourierTips.reduce((sum, entry) => sum + entry.amount, 0)
  const withdrawn = payouts
    .filter((entry) => entry.kind === 'payout')
    .reduce((sum, entry) => sum + entry.amount, 0)
  return Math.max(0, seed + totalTips(tasks) - withdrawn)
}

/** Nilai bersih yang diterima kurir setelah fee payout dipotong. */
export function courierPayoutNet(gross: number): number {
  return Math.max(0, gross - COURIER_PAYOUT_FEE_IDR)
}
