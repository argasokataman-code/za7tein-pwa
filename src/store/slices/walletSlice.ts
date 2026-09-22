import { createSlice } from '@reduxjs/toolkit'

import { mockPayouts, mockTopUps, mockWallet } from '../../data/wallet'
import type { Payout, TopUp, Wallet } from '../../types'

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

/**
 * M0 hanya menaruh state + tipe. Belum ada reducer: M2 membaca `balance` untuk
 * gate checkout, M3 menambah aksi top-up/payout, M4 memindahkan saldo ke
 * `pending` saat hold. Tambahkan saat layarnya menyusul — bukan sekarang.
 */
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
})

export default walletSlice.reducer
