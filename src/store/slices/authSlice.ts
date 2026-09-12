import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types'
import { mockUser } from '../../data/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// The app boots signed in so every screen is browsable without an account.
const initialState: AuthState = {
  user: mockUser,
  isAuthenticated: true,
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
    logout(state) {
      state.user = null
      state.isAuthenticated = false
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setUser, updateUser, logout, setLoading } = authSlice.actions
export default authSlice.reducer
