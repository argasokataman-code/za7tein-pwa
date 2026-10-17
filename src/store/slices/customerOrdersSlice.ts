import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { CustomerActiveOrder } from '../../api/orders'

interface CustomerOrdersState {
  /** Order customer yang masih berjalan (boleh beberapa, lintas toko). */
  active: CustomerActiveOrder[]
  /** Sudah pernah mendarat dari BE? Dipakai membedakan "kosong" vs "belum dimuat". */
  hydrated: boolean
}

// Tidak di-persist: ini potret BE, bukan state pilihan user. Ditarik ulang tiap
// sesi oleh `useApiRealtime` (audience customer).
const initialState: CustomerOrdersState = { active: [], hydrated: false }

const customerOrdersSlice = createSlice({
  name: 'customerOrders',
  initialState,
  reducers: {
    hydrateActiveOrders(state, action: PayloadAction<CustomerActiveOrder[]>) {
      state.active = action.payload
      state.hydrated = true
    },
  },
})

export const { hydrateActiveOrders } = customerOrdersSlice.actions

export default customerOrdersSlice.reducer
