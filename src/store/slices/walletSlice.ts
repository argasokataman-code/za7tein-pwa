import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockPayouts, mockTopUps, mockWallet } from '../../data/wallet'
import type { Payout, TopUp, TopUpChannel, Wallet } from '../../types'

interface WalletState {
  balance: Wallet
  topUpHistory: TopUp[]
  payoutHistory: Payout[]
}

const initialState: WalletState = {
  balance: mockWallet,
  topUpHistory: mockTopUps,
  payoutHistory: mockPayouts,
}

/** Id mock yang tetap unik walau beberapa aksi terjadi di detik yang sama. */
const makeId = (prefix: string, count: number) => `${prefix}-${count + 1}-${Date.now()}`

/**
 * Satu wallet untuk user yang sedang aktif (mock). Top-up mengikuti alur F3:
 * request → `pending` → webhook → `completed` + saldo naik. Penarikan (F6)
 * menahan nominal saat diminta; fee penarikan belum final (OQ-22) sehingga tidak
 * ada potongan yang dikarang di sini.
 */
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    requestTopUp(state, action: PayloadAction<{ amount: number; channel: TopUpChannel }>) {
      const { amount, channel } = action.payload
      if (amount <= 0) return
      state.topUpHistory.unshift({
        id: makeId('tu', state.topUpHistory.length),
        amount,
        channel,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
    },
    /** Pengganti webhook Xendit di demo: `top_up_completed` menaikkan saldo. */
    settleTopUp(state, action: PayloadAction<{ id: string }>) {
      const topUp = state.topUpHistory.find((t) => t.id === action.payload.id)
      if (!topUp || topUp.status !== 'pending') return
      topUp.status = 'completed'
      state.balance.available += topUp.amount
      state.balance.balance += topUp.amount
    },
    requestPayout(state, action: PayloadAction<{ amount: number }>) {
      const { amount } = action.payload
      if (amount <= 0 || amount > state.balance.available) return
      state.payoutHistory.unshift({
        id: makeId('po', state.payoutHistory.length),
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      // ponytail: nominal ditahan begitu diminta; fee payout menyusul saat OQ-22 final.
      state.balance.available -= amount
      state.balance.balance -= amount
    },
  },
})

export const { requestTopUp, settleTopUp, requestPayout } = walletSlice.actions
export default walletSlice.reducer
