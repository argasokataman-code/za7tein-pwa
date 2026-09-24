import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types'
import { mockUser } from '../../data/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  /**
   * Peran yang sedang masuk. Keempat PWA dilayani satu origin, jadi
   * `localStorage` — dan karenanya sesi ini — dipakai bersama. Tanpa pemisah
   * per peran, masuk di app pembeli ikut membuka app merchant dan kurir, dan
   * app yang baru dipasang tidak menampilkan layar masuk sama sekali.
   */
  role: string | null
  isLoading: boolean
}

// Aplikasi dibuka dalam keadaan BELUM masuk. Flow `f21-account-auth` memulai
// lane customer di onboarding → masuk, jadi installer baru harus mendarat di
// sana, bukan langsung di beranda. `user` tetap terisi karena layar di dalam
// aplikasi membacanya (`Home.tsx`) dan membacanya dengan `?.`; yang dijaga
// gerbang rute adalah `isAuthenticated`, bukan ada-tidaknya `user`.
const initialState: AuthState = {
  user: mockUser,
  isAuthenticated: false,
  role: null,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) state.user = { ...state.user, ...action.payload }
    },
    /**
     * Masuk mode demo: tidak ada verifikasi apa pun (AGENTS.md §1), hanya
     * menandai sesi aktif supaya gerbang rute membuka layar di dalam aplikasi.
     * Dipakai keempat layar masuk (customer, merchant, kurir) dan tombol
     * "Buka beranda merchant" di layar menunggu persetujuan. Parameternya
     * prefix peran (`/customer`, `/merchant`, `/courier`) — sama dengan
     * `basename` router-nya.
     */
    signIn(state, action: PayloadAction<string>) {
      state.user = state.user ?? mockUser
      state.isAuthenticated = true
      state.role = action.payload
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.role = null
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setUser, updateUser, signIn, logout, setLoading } = authSlice.actions
export default authSlice.reducer
