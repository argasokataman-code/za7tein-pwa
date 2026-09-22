import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { merchantOrders as seedOrders } from '../../data/merchantOrders'
import { merchantReviewReplies } from '../../data/merchantReviews'
import { mockMerchant } from '../../data/merchant'
import {
  MERCHANT_CREDIT_FEE_JOD,
  MERCHANT_CREDIT_JOD,
  currentPeriod,
  mockMerchantCredit,
  rebateAmountFor,
  rebateTierFor,
} from '../../data/incentive'
import type {
  MerchantCreditEvent,
  MerchantCreditEventName,
  MerchantCreditState,
  MerchantOrder,
  MerchantOrderStatus,
} from '../../types'

interface MerchantState {
  orders: MerchantOrder[]
  isActive: boolean
  todayOrderCount: number
  dailyLimit: number
  /** Balasan merchant per id ulasan. Tidak dipersist — reset saat reload. */
  reviewReplies: Record<string, string>
  /** Modal 5 JOD + cashback tier bulanan (M10). */
  credit: MerchantCreditState
}

const initialState: MerchantState = {
  orders: seedOrders,
  isActive: mockMerchant.isActive,
  todayOrderCount: mockMerchant.todayOrderCount,
  dailyLimit: mockMerchant.dailyLimit,
  reviewReplies: merchantReviewReplies,
  credit: mockMerchantCredit,
}

/** Entry insentif: urutan + waktu, cukup unik untuk mock satu sesi. */
const creditEvent = (
  event: MerchantCreditEventName,
  amountJod: number,
  index: number,
): MerchantCreditEvent => ({
  id: `${event}-${index + 1}-${Date.now()}`,
  event,
  amountJod,
  at: new Date().toISOString(),
})

const merchantSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    toggleActive(state) {
      state.isActive = !state.isActive
    },
    setOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: MerchantOrderStatus }>,
    ) {
      const order = state.orders.find((o) => o.id === action.payload.id)
      if (order) order.status = action.payload.status
    },
    setCookMinutes(state, action: PayloadAction<{ id: string; minutes: number }>) {
      const order = state.orders.find((o) => o.id === action.payload.id)
      if (order) order.cookMinutes = action.payload.minutes
    },
    setReviewReply(state, action: PayloadAction<{ id: string; text: string }>) {
      state.reviewReplies[action.payload.id] = action.payload.text
    },
    /** Merchant baru dapat modal 5 JOD (event `merchant_credit_granted`). */
    grantCredit(state) {
      state.credit.merchantCreditBalance += MERCHANT_CREDIT_JOD
      state.credit.events.unshift(
        creditEvent('merchant_credit_granted', MERCHANT_CREDIT_JOD, state.credit.events.length),
      )
    },
    /**
     * Fee merchant 0,15 JOD dipotong dari modal, bukan dari dompet. Diklem di 0
     * supaya sisa modal tidak pernah negatif.
     */
    debitCredit(state) {
      if (state.credit.merchantCreditBalance <= 0) return
      const amount = Math.min(MERCHANT_CREDIT_FEE_JOD, state.credit.merchantCreditBalance)
      state.credit.merchantCreditBalance =
        Math.round((state.credit.merchantCreditBalance - amount) * 100) / 100
      state.credit.events.unshift(
        creditEvent('merchant_credit_debited', amount, state.credit.events.length),
      )
    },
    /**
     * Order settled menambah hitungan periode. Kalau ambang tier baru terlewati,
     * tier dan nilai cashbacknya ikut naik (event `rebate_tier_reached`).
     */
    recordSettledOrder(state) {
      state.credit.settledThisPeriod += 1
      const tier = rebateTierFor(state.credit.settledThisPeriod)
      if (!tier || tier === state.credit.rebateTier) return
      state.credit.rebateTier = tier
      state.credit.rebateAmountJod = rebateAmountFor(tier)
      state.credit.rebatePaidAt = null
      state.credit.events.unshift(
        creditEvent(
          'rebate_tier_reached',
          state.credit.rebateAmountJod,
          state.credit.events.length,
        ),
      )
    },
    /** Cashback dibayar ke dompet deposit (bukan ke modal) — event `rebate_paid`. */
    payRebate(state) {
      const { rebateTier, rebateAmountJod, rebatePaidAt } = state.credit
      if (!rebateTier || rebateAmountJod <= 0 || rebatePaidAt) return
      state.credit.depositBalanceJod =
        Math.round((state.credit.depositBalanceJod + rebateAmountJod) * 100) / 100
      state.credit.rebatePaidAt = new Date().toISOString()
      state.credit.events.unshift(
        creditEvent('rebate_paid', rebateAmountJod, state.credit.events.length),
      )
    },
    /** Periode baru: hitungan order per periode direset (I-4 belum final). */
    startNewPeriod(state) {
      state.credit.rebatePeriod = currentPeriod()
      state.credit.settledThisPeriod = 0
      state.credit.rebateTier = null
      state.credit.rebateAmountJod = 0
      state.credit.rebatePaidAt = null
    },
  },
})

export const {
  toggleActive,
  setOrderStatus,
  setCookMinutes,
  setReviewReply,
  grantCredit,
  debitCredit,
  recordSettledOrder,
  payRebate,
  startNewPeriod,
} = merchantSlice.actions
export default merchantSlice.reducer
