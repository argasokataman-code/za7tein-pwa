import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  notificationCount: number
  locationLabel: string
  cartBadgeCount: number
}

const initialState: UiState = {
  notificationCount: 3,
  locationLabel: '44 Street Town',
  cartBadgeCount: 1,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNotificationCount(state, action: PayloadAction<number>) {
      state.notificationCount = action.payload
    },
    setLocationLabel(state, action: PayloadAction<string>) {
      state.locationLabel = action.payload
    },
    setCartBadgeCount(state, action: PayloadAction<number>) {
      state.cartBadgeCount = action.payload
    },
  },
})

export const { setNotificationCount, setLocationLabel, setCartBadgeCount } =
  uiSlice.actions
export default uiSlice.reducer
