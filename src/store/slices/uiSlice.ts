import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  locationLabel: string
  cartBadgeCount: number
}

const initialState: UiState = {
  locationLabel: '44 Street Town',
  cartBadgeCount: 1,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLocationLabel(state, action: PayloadAction<string>) {
      state.locationLabel = action.payload
    },
    setCartBadgeCount(state, action: PayloadAction<number>) {
      state.cartBadgeCount = action.payload
    },
  },
})

export const { setLocationLabel, setCartBadgeCount } =
  uiSlice.actions
export default uiSlice.reducer
