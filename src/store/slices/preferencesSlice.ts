import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { CurrencyCode } from '../../types'

/**
 * Preferensi tampilan pengguna — klien saja, tidak ada padanannya di DB.
 *
 * Mata uang disimpan **per peran** (kunci = `auth.role`, mis. `/customer`)
 * karena keempat PWA satu origin dan berbagi `localStorage`: pilihan pembeli
 * tak boleh ikut mengubah tampilan merchant/kurir/CS. Kunci yang belum ada
 * berarti default `JOD` (lihat `useDisplayCurrency`).
 */
interface PreferencesState {
  currency: Record<string, CurrencyCode>
}

const initialState: PreferencesState = {
  currency: {},
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setCurrency(
      state,
      action: PayloadAction<{ role: string; currency: CurrencyCode }>,
    ) {
      state.currency[action.payload.role] = action.payload.currency
    },
  },
})

export const { setCurrency } = preferencesSlice.actions
export default preferencesSlice.reducer
