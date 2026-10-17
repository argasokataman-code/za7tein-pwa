import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  QUOTA_LOW_RATIO,
  mockAcceptWithoutQuota,
  mockQuotaSubscriptions,
} from '../../data/marketplace'
import type { QuotaKind, QuotaSubscription } from '../../types'

interface QuotaState {
  subscriptions: QuotaSubscription[]
  /** Setting "Terima order tanpa kuota order?" (§17); hanya berubah saat merchant tutup. */
  acceptWithoutQuota: boolean
}

const initialState: QuotaState = {
  subscriptions: mockQuotaSubscriptions,
  acceptWithoutQuota: mockAcceptWithoutQuota,
}

/** Status kuota satu jenis untuk satu merchant (PRD §17). */
export type QuotaStatus = 'available' | 'low' | 'exhausted' | 'unknown'

/** Langganan aktif satu merchant satu jenis; `merchantId` null = semua merchant. */
const ownSubs = (subs: QuotaSubscription[], merchantId: string | null, kind: QuotaKind) =>
  subs.filter((s) => s.active && s.kind === kind && (!merchantId || s.merchantId === merchantId))

/** Kuota tersedia = paket − terpakai − ter-reserve (§17), dijumlahkan. */
export const quotaAvailableFor = (
  subs: QuotaSubscription[],
  merchantId: string | null,
  kind: QuotaKind,
) => ownSubs(subs, merchantId, kind).reduce((sum, s) => sum + (s.quota - s.used - s.reserved), 0)

/** Kuota tersedia seluruh merchant (semua langganan aktif jenis itu). */
export const quotaAvailable = (subs: QuotaSubscription[], kind: QuotaKind) =>
  quotaAvailableFor(subs, null, kind)

/**
 * Status kuota (§17). `unknown` = belum ada catatan langganan untuk merchant itu
 * (mis. data BE belum memuatnya) — jangan memblokir order karena data yang
 * memang tidak ada. `low` = sisa ≤ `QUOTA_LOW_RATIO` dari total paket.
 */
export function quotaStatusFor(
  subs: QuotaSubscription[],
  merchantId: string | null,
  kind: QuotaKind,
): QuotaStatus {
  const mine = ownSubs(subs, merchantId, kind)
  if (mine.length === 0) return 'unknown'
  const available = quotaAvailableFor(subs, merchantId, kind)
  if (available <= 0) return 'exhausted'
  const total = mine.reduce((sum, s) => sum + s.quota, 0)
  return available <= Math.ceil(total * QUOTA_LOW_RATIO) ? 'low' : 'available'
}

/**
 * Status kuota COD untuk gate metode bayar (§17) — dipakai `PaymentSelection`.
 * Tiga nilai saja: gate hanya peduli habis atau tidak.
 */
export function codQuotaStatus(
  subs: QuotaSubscription[],
  merchantId: string | null,
): 'available' | 'exhausted' | 'unknown' {
  const status = quotaStatusFor(subs, merchantId, 'cod')
  if (status === 'unknown' || status === 'exhausted') return status
  return 'available'
}

/**
 * Toko disembunyikan dari daftar (§17) bila kuota **order** habis dan merchant
 * tidak mengizinkan order tanpa kuota. `unknown` ≠ blokir (§17: data yang tak
 * ada tidak boleh memblokir order).
 */
export function merchantQuotaBlocked(
  subs: QuotaSubscription[],
  merchantId: string | null,
  acceptWithoutQuota: boolean,
): boolean {
  if (acceptWithoutQuota) return false
  return quotaStatusFor(subs, merchantId, 'order') === 'exhausted'
}

/**
 * Kuota mana yang dipakai satu order (§17): order COD hanya kuota COD; order
 * online memakai kuota order lebih dulu, lalu kuota COD. `null` = tidak ada
 * kuota tersisa (merchant harus punya setting "terima tanpa kuota").
 */
export function quotaKindForOrder(
  subs: QuotaSubscription[],
  merchantId: string | null,
  isCod: boolean,
): QuotaKind | null {
  if (isCod) return quotaAvailableFor(subs, merchantId, 'cod') > 0 ? 'cod' : null
  if (quotaAvailableFor(subs, merchantId, 'order') > 0) return 'order'
  return quotaAvailableFor(subs, merchantId, 'cod') > 0 ? 'cod' : null
}

/** Langganan mana yang menerima transisi — merchant spesifik, atau yang pertama. */
const targetSub = (state: QuotaState, merchantId: string | null, kind: QuotaKind) =>
  state.subscriptions.find((s) => s.active && s.kind === kind && (!merchantId || s.merchantId === merchantId)) ??
  (merchantId ? undefined : state.subscriptions.find((s) => s.active && s.kind === kind))

/**
 * Langganan kuota merchant (PRD §17). Kuota di-reserve saat customer membuat
 * order, dikonsumsi saat selesai, dikembalikan saat batal/tolak/gagal setelah
 * accept. Repo ini mock (AGENTS.md §1).
 */
const quotaSlice = createSlice({
  name: 'quota',
  initialState,
  reducers: {
    reserveQuota(
      state,
      action: PayloadAction<{ kind: QuotaKind; merchantId?: string | null; amount?: number }>,
    ) {
      const sub = targetSub(state, action.payload.merchantId ?? null, action.payload.kind)
      if (sub) sub.reserved += action.payload.amount ?? 1
    },
    consumeQuota(
      state,
      action: PayloadAction<{ kind: QuotaKind; merchantId?: string | null; amount?: number }>,
    ) {
      const sub = targetSub(state, action.payload.merchantId ?? null, action.payload.kind)
      if (!sub) return
      const amount = action.payload.amount ?? 1
      sub.reserved = Math.max(0, sub.reserved - amount)
      sub.used += amount
    },
    /** Batal/tolak/gagal setelah accept: kuota ter-reserve dikembalikan (§17). */
    returnQuota(
      state,
      action: PayloadAction<{ kind: QuotaKind; merchantId?: string | null; amount?: number }>,
    ) {
      const sub = targetSub(state, action.payload.merchantId ?? null, action.payload.kind)
      if (sub) sub.reserved = Math.max(0, sub.reserved - (action.payload.amount ?? 1))
    },
    setAcceptWithoutQuota(state, action: PayloadAction<boolean>) {
      state.acceptWithoutQuota = action.payload
    },
    purchaseSubscription(state, action: PayloadAction<QuotaSubscription>) {
      state.subscriptions.unshift(action.payload)
    },
    /** Ganti seluruh langganan dengan data BE (API menimpa mock). */
    replaceQuotaSubscriptions(state, action: PayloadAction<QuotaSubscription[]>) {
      state.subscriptions = action.payload
    },
  },
})

export const {
  reserveQuota,
  consumeQuota,
  returnQuota,
  setAcceptWithoutQuota,
  purchaseSubscription,
  replaceQuotaSubscriptions,
} = quotaSlice.actions
export default quotaSlice.reducer
