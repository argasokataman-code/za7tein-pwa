import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { merchantOrders as seedOrders } from '../../data/merchantOrders'
import { merchantReviewReplies } from '../../data/merchantReviews'
import { mockMerchant } from '../../data/merchant'
import type { MerchantOrder, MerchantOrderStatus } from '../../types'

interface MerchantState {
  orders: MerchantOrder[]
  isActive: boolean
  todayOrderCount: number
  dailyLimit: number
  /** Balasan merchant per id ulasan. Tidak dipersist — reset saat reload. */
  reviewReplies: Record<string, string>
}

const initialState: MerchantState = {
  orders: seedOrders,
  isActive: mockMerchant.isActive,
  todayOrderCount: mockMerchant.todayOrderCount,
  dailyLimit: mockMerchant.dailyLimit,
  reviewReplies: merchantReviewReplies,
}

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
  },
})

export const {
  toggleActive,
  setOrderStatus,
  setCookMinutes,
  setReviewReply,
} = merchantSlice.actions
export default merchantSlice.reducer
