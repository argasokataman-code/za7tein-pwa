import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockAcceptWithoutQuota, mockQuotaSubscriptions } from '../../data/marketplace'
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

/** Kuota tersedia = paket - terpakai - ter-reserve (§17). */
export const quotaAvailable = (subs: QuotaSubscription[], kind: QuotaKind) =>
  subs
    .filter((s) => s.active && s.kind === kind)
    .reduce((sum, s) => sum + (s.quota - s.used - s.reserved), 0)

/**
 * Langganan kuota merchant (PRD §17). Kuota di-reserve saat customer membuat
 * order, dikonsumsi saat selesai, dikembalikan saat batal/tolak/gagal setelah
 * accept. Prioritas pemakaian: kuota order dulu, lalu kuota COD (online);
 * order COD hanya kuota COD. Repo ini mock (AGENTS.md §1).
 */
const quotaSlice = createSlice({
  name: 'quota',
  initialState,
  reducers: {
    reserveQuota(state, action: PayloadAction<{ kind: QuotaKind; amount?: number }>) {
      const sub = state.subscriptions.find((s) => s.active && s.kind === action.payload.kind)
      if (sub) sub.reserved += action.payload.amount ?? 1
    },
    consumeQuota(state, action: PayloadAction<{ kind: QuotaKind; amount?: number }>) {
      const sub = state.subscriptions.find((s) => s.active && s.kind === action.payload.kind)
      if (!sub) return
      const amount = action.payload.amount ?? 1
      sub.reserved = Math.max(0, sub.reserved - amount)
      sub.used += amount
    },
    /** Batal/tolak/gagal setelah accept: kuota ter-reserve dikembalikan (§17). */
    returnQuota(state, action: PayloadAction<{ kind: QuotaKind; amount?: number }>) {
      const sub = state.subscriptions.find((s) => s.active && s.kind === action.payload.kind)
      if (sub) sub.reserved = Math.max(0, sub.reserved - (action.payload.amount ?? 1))
    },
    setAcceptWithoutQuota(state, action: PayloadAction<boolean>) {
      state.acceptWithoutQuota = action.payload
    },
    purchaseSubscription(state, action: PayloadAction<QuotaSubscription>) {
      state.subscriptions.unshift(action.payload)
    },
  },
})

export const { reserveQuota, consumeQuota, returnQuota, setAcceptWithoutQuota, purchaseSubscription } =
  quotaSlice.actions
export default quotaSlice.reducer
