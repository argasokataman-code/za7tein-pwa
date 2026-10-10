import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  locationLabel: string
  cartBadgeCount: number
  /** Titik asal customer (alamat default live) untuk menghitung jarak ke toko. */
  origin: { lat: number; lng: number } | null
}

const initialState: UiState = {
  locationLabel: '',
  cartBadgeCount: 1,
  origin: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLocationLabel(state, action: PayloadAction<string>) {
      state.locationLabel = action.payload
    },
    setCustomerLocation(
      state,
      action: PayloadAction<{ label: string; lat: number; lng: number }>,
    ) {
      state.locationLabel = action.payload.label
      state.origin = { lat: action.payload.lat, lng: action.payload.lng }
    },
    setCartBadgeCount(state, action: PayloadAction<number>) {
      state.cartBadgeCount = action.payload
    },
  },
})

export const { setLocationLabel, setCustomerLocation, setCartBadgeCount } =
  uiSlice.actions
export default uiSlice.reducer
