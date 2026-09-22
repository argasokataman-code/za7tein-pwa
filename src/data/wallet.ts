import type { Payout, TopUp, TopUpChannel, Wallet, WalletTxStatus } from '../types'

import { jodToIdr } from './currency'

/**
 * Mock wallet customer (R-WALLET-01). Nominal **IDR** — source of truth;
 * padanan JOD dihitung di layer tampilan (R-CURR-01), bukan disimpan.
 *
 * Angka sengaja tidak nol supaya layar M3 (available + pending) langsung punya
 * isi: satu order berjalan menyumbang `pending`.
 */
const AVAILABLE_IDR = 40_000 // 1,74 JOD — di bawah ambang, jadi gate checkout terlihat (M2)
const PENDING_IDR = 23_000 // hold satu order berjalan (F2 COD hold)

export const mockWallet: Wallet = {
  balance: AVAILABLE_IDR + PENDING_IDR,
  available: AVAILABLE_IDR,
  pending: PENDING_IDR,
}

export const mockTopUps: TopUp[] = [
  {
    id: 'tu-1',
    amount: AVAILABLE_IDR + PENDING_IDR, // = saldo terkredit; 23.000 di antaranya ter-hold
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

/**
 * Nominal preset top-up. Ditulis dalam JOD karena itu yang dipikirkan user,
 * lalu diturunkan ke IDR sekali supaya state tetap IDR (R-CURR-01). 3,5 JOD =
 * ambang gate akun baru (R-TOPUP-01).
 */
export const TOP_UP_PRESETS_JOD = [3.5, 5, 10] as const
export const TOP_UP_PRESETS_IDR = TOP_UP_PRESETS_JOD.map((value) => jodToIdr(value))

/** Preset penarikan dalam IDR — batasnya saldo tersedia, bukan nominal JOD bulat. */
export const PAYOUT_PRESETS_IDR = [25_000, 50_000]

/** Kanal top-up Xendit (PRD §2). */
export const TOP_UP_CHANNELS: { id: TopUpChannel; label: string; note: string }[] = [
  {
    id: 'xendit_va',
    label: 'Virtual Account',
    note: 'Nomor VA dibuat per top-up, dibayar lewat m-banking.',
  },
  {
    id: 'xendit_qris',
    label: 'QRIS',
    note: 'Scan QR dari aplikasi bank atau e-wallet apa pun.',
  },
]

export function channelLabel(channel: TopUpChannel): string {
  return TOP_UP_CHANNELS.find((c) => c.id === channel)?.label ?? channel
}

/** Top-up `pending` = menunggu pembayaran; `completed` = webhook masuk, saldo naik. */
export function topUpStatusLabel(status: WalletTxStatus): string {
  return {
    pending: 'Menunggu bayar',
    processing: 'Diproses',
    completed: 'Masuk saldo',
    failed: 'Gagal',
  }[status]
}

export function payoutStatusLabel(status: WalletTxStatus): string {
  return {
    pending: 'Diproses',
    processing: 'Diproses',
    completed: 'Terkirim',
    failed: 'Gagal',
  }[status]
}
