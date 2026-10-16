import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEMO_MERCHANT_RULE_SELECTION } from '../../data/rules'
import type { MerchantRuleSelection } from '../../types'

/**
 * Pilihan rule dispute milik toko demo (§18: merchant memilih rule yang diikuti
 * lewat multi-select). Disimpan di store, bukan state layar, karena pilihan ini
 * bukan sekadar tampilan: `ruleForOrder()` memakainya untuk menentukan rule mana
 * yang berlaku pada order — termasuk bagi pelanggan dan kurir, yang menurut §18
 * mengikuti rule pilihan merchant itu.
 */
interface RulesState {
  selection: MerchantRuleSelection
}

const initialState: RulesState = {
  selection: DEMO_MERCHANT_RULE_SELECTION,
}

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    toggleRule(state, action: PayloadAction<string>) {
      const ids = state.selection.ruleIds
      state.selection.ruleIds = ids.includes(action.payload)
        ? ids.filter((ruleId) => ruleId !== action.payload)
        : [...ids, action.payload]
      // Pilihan berubah → jadi berlaku sejak hari ini, bukan sejak tanggal seed.
      state.selection.effectiveFrom = new Date().toISOString().slice(0, 10)
    },
  },
})

export const { toggleRule } = rulesSlice.actions
export default rulesSlice.reducer
