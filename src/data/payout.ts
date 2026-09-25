import type { PayoutAccount, PayoutEntry, Wallet } from '../types'

/**
 * Dompet merchant (R-WALLET-01, flow f6): saldo masuk otomatis dari order yang
 * selesai, keluar hanya lewat pencairan Xendit payout. Ini pot **berbeda** dari
 * modal/cashback Founding (`merchant.credit`, JOD, non-withdrawal) — dompet ini
 * IDR dan bisa ditarik, mengikuti `source.md:70`.
 *
 * Semua nominal IDR (R-CURR-01). Angka seed tidak nol supaya layar saldo dan
 * riwayat punya isi begitu dibuka.
 */
const SETTLED_AVAILABLE_IDR = 1_106_550

export const mockPayoutBalance: Wallet = {
  balance: SETTLED_AVAILABLE_IDR,
  available: SETTLED_AVAILABLE_IDR,
  pending: 0,
}

/**
 * Seed awal diambil dari rekening toko yang dulu hanya tampil read-only
 * (`mockMerchant.bank`), supaya tidak ada dua sumber yang berbeda.
 */
export const mockPayoutAccounts: PayoutAccount[] = [
  {
    id: 'pa-1',
    bankName: 'BCA',
    accountNumber: '8830 1122 3344',
    holderName: 'Ali Santoso',
    isPrimary: true,
  },
]

/** Riwayat dompet: kredit settle order + pencairan keluar. */
export const mockPayoutHistory: PayoutEntry[] = [
  {
    id: 'pe-1',
    kind: 'settlement',
    amount: 106_550,
    status: 'completed',
    createdAt: '2026-09-24T20:10:00+07:00',
  },
  {
    id: 'pe-2',
    kind: 'settlement',
    amount: 1_000_000,
    status: 'completed',
    createdAt: '2026-09-23T19:40:00+07:00',
  },
  {
    id: 'pe-3',
    kind: 'payout',
    amount: 250_000,
    status: 'completed',
    createdAt: '2026-09-21T10:05:00+07:00',
    destination: 'BCA · 8830 1122 3344',
  },
]

/** Bank tujuan payout di Indonesia (daftar pendek untuk form). */
export const BANK_OPTIONS = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'BSI',
  'CIMB Niaga',
  'Permata',
  'Danamon',
] as const

/**
 * Fee payout Xendit **Rp2.500 per transfer**, dikenakan hanya saat pencairan
 * berhasil (`source.md:573`). Siapa yang menanggungnya untuk merchant belum
 * diputuskan di PRD (yang final baru kurir — PO 2026-09-22), jadi layar hanya
 * menampilkan info ini dan **tidak memotong** saldo. Jangan dikarang.
 */
export const PAYOUT_FEE_IDR = 2_500

/** Label ringkas satu rekening, mis. `BCA · 8830 1122 3344`. */
export function accountLabel(account: PayoutAccount): string {
  return `${account.bankName} · ${account.accountNumber}`
}
