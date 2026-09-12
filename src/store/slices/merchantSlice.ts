import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { merchantOrders as seedOrders } from '../../data/merchantOrders'
import { mockMerchant } from '../../data/merchant'
import type { MerchantOrder, MerchantOrderStatus } from '../../types'

interface MerchantState {
  orders: MerchantOrder[]
  isActive: boolean
  todayOrderCount: number
  dailyLimit: number
}

const initialState: MerchantState = {
  orders: seedOrders,
  isActive: mockMerchant.isActive,
  todayOrderCount: mockMerchant.todayOrderCount,
  dailyLimit: mockMerchant.dailyLimit,
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
  },
})

export const {
  toggleActive,
  setOrderStatus,
  setCookMinutes,
} = merchantSlice.actions
export default merchantSlice.reducer
