import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockPayoutAccounts, mockPayoutBalance, mockPayoutHistory } from '../../data/payout'
import type { PayoutAccount, PayoutEntry, Wallet } from '../../types'

interface PayoutState {
  balance: Wallet
  accounts: PayoutAccount[]
  history: PayoutEntry[]
}

const initialState: PayoutState = {
  balance: mockPayoutBalance,
  accounts: mockPayoutAccounts,
  history: mockPayoutHistory,
}

/** Id mock yang tetap unik walau beberapa aksi terjadi di detik yang sama. */
const makeId = (prefix: string, count: number) => `${prefix}-${count + 1}-${Date.now()}`

/**
 * Dompet + rekening pencairan merchant (R-WALLET-01, flow f6). Pencairan
 * menahan nominal saat diminta; fee Rp2.500 belum dipotong di sini karena
 * penanggungnya untuk merchant belum diputuskan PRD (`data/payout.ts`).
 */
const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    addAccount(
      state,
      action: PayloadAction<{ bankName: string; accountNumber: string; holderName: string }>,
    ) {
      state.accounts.push({
        id: makeId('pa', state.accounts.length),
        ...action.payload,
        // Rekening pertama otomatis jadi utama supaya pencairan selalu punya tujuan.
        isPrimary: state.accounts.length === 0,
      })
    },
    updateAccount(
      state,
      action: PayloadAction<{
        id: string
        bankName: string
        accountNumber: string
        holderName: string
      }>,
    ) {
      const account = state.accounts.find((a) => a.id === action.payload.id)
      if (!account) return
      account.bankName = action.payload.bankName
      account.accountNumber = action.payload.accountNumber
      account.holderName = action.payload.holderName
    },
    /** Hapus rekening; kalau yang dihapus utama, rekening tersisa pertama naik jadi utama. */
    removeAccount(state, action: PayloadAction<{ id: string }>) {
      const wasPrimary = state.accounts.find((a) => a.id === action.payload.id)?.isPrimary
      state.accounts = state.accounts.filter((a) => a.id !== action.payload.id)
      if (wasPrimary && state.accounts.length > 0) state.accounts[0].isPrimary = true
    },
    setPrimaryAccount(state, action: PayloadAction<{ id: string }>) {
      for (const account of state.accounts) account.isPrimary = account.id === action.payload.id
    },
    requestPayout(state, action: PayloadAction<{ amount: number; accountId: string }>) {
      const { amount, accountId } = action.payload
      const account = state.accounts.find((a) => a.id === accountId)
      if (!account || amount <= 0 || amount > state.balance.available) return
      state.history.unshift({
        id: makeId('pe', state.history.length),
        kind: 'payout',
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        destination: `${account.bankName} · ${account.accountNumber}`,
      })
      state.balance.available -= amount
      state.balance.balance -= amount
    },
  },
})

export const {
  addAccount,
  updateAccount,
  removeAccount,
  setPrimaryAccount,
  requestPayout,
} = payoutSlice.actions
export default payoutSlice.reducer
