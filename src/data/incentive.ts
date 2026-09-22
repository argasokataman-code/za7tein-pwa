/**
 * Insentif merchant (R-INCENTIVE-01, flow F9).
 *
 * Dua hal yang berbeda dan mudah tertukar:
 * 1. **Modal** — kredit sistem 5 JOD untuk merchant baru. Non-tunai dan
 *    non-withdrawal, hanya memotong fee platform merchant 0,15 JOD per order,
 *    jadi sekitar 33 order pertama tidak terasa. Terpisah dari deposit COD
 *    3,50 JOD (PO 2026-09-22).
 * 2. **Cashback tier** — dibayar akhir bulan kalau ambang order settled
 *    terlewati, dan masuk ke dompet **deposit**, bukan ke modal.
 *
 * I-3 (cashback withdrawable?), I-4 (periode & naik tier di tengah bulan),
 * I-5 (kuota Founding), dan I-6 (sisa modal kalau merchant berhenti) belum
 * final — jangan dianggap aturan terkunci.
 */
import type { MerchantCreditEventName, MerchantCreditState, RebateTier } from '../types'

/** Modal awal merchant baru (I-1/I-2 resolved). */
export const MERCHANT_CREDIT_JOD = 5

/** Fee platform merchant per order yang dipotong dari modal (R-FEE-01). */
export const MERCHANT_CREDIT_FEE_JOD = 0.15

/** Perkiraan order yang tertutup modal: 5 ÷ 0,15 ≈ 33. */
export const MERCHANT_CREDIT_ORDERS = Math.floor(MERCHANT_CREDIT_JOD / MERCHANT_CREDIT_FEE_JOD)

/** Ambang tier bulanan + cashbacknya (F9). */
export const REBATE_TIERS: { id: RebateTier; threshold: number; amountJod: number }[] = [
  { id: 'tier_1', threshold: 500, amountJod: 15 },
  { id: 'tier_2', threshold: 1000, amountJod: 40 },
  { id: 'tier_3', threshold: 1250, amountJod: 62.5 },
]

/** Tier tertinggi yang ambangnya sudah terlewati, atau null kalau belum ada. */
export function rebateTierFor(settledOrders: number): RebateTier | null {
  let reached: RebateTier | null = null
  for (const tier of REBATE_TIERS) {
    if (settledOrders >= tier.threshold) reached = tier.id
  }
  return reached
}

export function rebateAmountFor(tier: RebateTier | null): number {
  return REBATE_TIERS.find((t) => t.id === tier)?.amountJod ?? 0
}

/**
 * Ambang berikutnya dan progres menuju ambang itu (0–1). Kalau semua ambang
 * lewat, `next` null dan ratonya 1 — bukan diam-diam menghitung dari nol.
 */
export function rebateProgress(settledOrders: number): { next: number | null; ratio: number } {
  const next = REBATE_TIERS.find((t) => settledOrders < t.threshold)
  if (!next) return { next: null, ratio: 1 }
  const previous =
    REBATE_TIERS.filter((t) => t.threshold <= settledOrders).at(-1)?.threshold ?? 0
  const span = next.threshold - previous
  return { next: next.threshold, ratio: span > 0 ? (settledOrders - previous) / span : 0 }
}

/** Label event modal/cashback — satu tempat dengan kontrak BE. */
export const CREDIT_EVENT_LABEL: Record<MerchantCreditEventName, string> = {
  merchant_credit_granted: 'Modal diberikan',
  merchant_credit_debited: 'Fee merchant dipotong dari modal',
  rebate_tier_reached: 'Ambang tier terlewati',
  rebate_paid: 'Cashback dibayar ke dompet deposit',
}

/** `YYYY-MM` untuk field `rebate_period`. */
export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * State awal demo. Tier 1 sengaja sudah terlewati (512 order settled) supaya UI
 * penanda tier + cashback 15 JOD langsung terlihat; sisa modal 3,05 JOD berarti
 * sekitar 20 order sudah memakan modal.
 */
export const mockMerchantCredit: MerchantCreditState = {
  merchantCreditBalance: 3.05,
  rebatePeriod: currentPeriod(),
  settledThisPeriod: 999,
  rebateTier: 'tier_1',
  rebateAmountJod: 15,
  rebatePaidAt: null,
  depositBalanceJod: 12.5,
  events: [
    { id: 'mc-1', event: 'merchant_credit_granted', amountJod: MERCHANT_CREDIT_JOD, at: '1 Sep' },
    { id: 'mc-2', event: 'merchant_credit_debited', amountJod: 1.95, at: '18 Sep' },
    { id: 'mc-3', event: 'rebate_tier_reached', amountJod: 15, at: '22 Sep' },
  ],
}
