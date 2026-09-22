import type { Payout, TopUp, Wallet } from '../types'

/**
 * Mock wallet customer (R-WALLET-01). Nominal **IDR** — source of truth;
 * padanan JOD dihitung di layer tampilan (R-CURR-01), bukan disimpan.
 *
 * Angka sengaja tidak nol supaya layar M3 (available + pending) langsung punya
 * isi: satu order berjalan menyumbang `pending`.
 */
const AVAILABLE_IDR = 80_500 // = 3,5 JOD, ambang top-up akun baru
const PENDING_IDR = 23_000 // hold satu order berjalan (F2 COD hold)

export const mockWallet: Wallet = {
  balance: AVAILABLE_IDR + PENDING_IDR,
  available: AVAILABLE_IDR,
  pending: PENDING_IDR,
}

export const mockTopUps: TopUp[] = [
  {
    id: 'tu-1',
    amount: AVAILABLE_IDR,
    channel: 'xendit_va',
    status: 'completed',
    createdAt: '2026-09-22T09:15:00+07:00',
  },
  {
    id: 'tu-2',
    amount: 50_000,
    channel: 'xendit_qris',
    status: 'pending',
    createdAt: '2026-09-23T08:40:00+07:00',
  },
]

/** Tanpa field fee — fee cash-out masih `UNRESOLVED` (OQ-22), jangan dikarang. */
export const mockPayouts: Payout[] = [
  {
    id: 'po-1',
    amount: 25_000,
    status: 'completed',
    createdAt: '2026-09-20T14:05:00+07:00',
  },
  {
    id: 'po-2',
    amount: 12_500,
    status: 'processing',
    createdAt: '2026-09-23T07:30:00+07:00',
  },
]
