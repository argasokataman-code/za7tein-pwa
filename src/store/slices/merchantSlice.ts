import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { merchantOrders as seedOrders } from '../../data/merchantOrders'
import { merchantMenu as seedMenu } from '../../data/merchantMenu'
import { mockMerchant } from '../../data/merchant'
import type { MerchantMenuItem, MerchantOrder, MerchantOrderStatus } from '../../types'

interface MerchantState {
  orders: MerchantOrder[]
  menu: MerchantMenuItem[]
  isActive: boolean
  todayOrderCount: number
  dailyLimit: number
}

const initialState: MerchantState = {
  orders: seedOrders,
  menu: seedMenu,
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
    adjustStock(state, action: PayloadAction<{ id: string; delta: number }>) {
      const item = state.menu.find((m) => m.id === action.payload.id)
      if (item) item.stock = Math.max(0, item.stock + action.payload.delta)
    },
    upsertMenuItem(state, action: PayloadAction<MerchantMenuItem>) {
      const index = state.menu.findIndex((m) => m.id === action.payload.id)
      if (index >= 0) state.menu[index] = action.payload
      else state.menu.push(action.payload)
    },
    removeMenuItem(state, action: PayloadAction<string>) {
      state.menu = state.menu.filter((m) => m.id !== action.payload)
    },
  },
})

export const {
  toggleActive,
  setOrderStatus,
  setCookMinutes,
  adjustStock,
  upsertMenuItem,
  removeMenuItem,
} = merchantSlice.actions
export default merchantSlice.reducer
