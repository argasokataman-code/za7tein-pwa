import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockMarketingPrograms, mockProgramRewards, mockProgramRules } from '../../data/marketing'
import type { MarketingProgram, ProgramReward, ProgramRule } from '../../types'

interface MarketingState {
  programs: MarketingProgram[]
  rules: ProgramRule[]
  rewards: ProgramReward[]
}

const initialState: MarketingState = {
  programs: mockMarketingPrograms,
  rules: mockProgramRules,
  rewards: mockProgramRewards,
}

/**
 * Program marketing ala Odoo (PRD §15). Program aplikator dikelola ops, program
 * merchant dikelola merchant; `isStackable` menandai promo yang boleh digabung
 * (semantik kombinasi masih OPEN-23). Biaya diskon ditanggung pemilik program.
 * Repo ini mock (AGENTS.md §1).
 */
const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    addProgram(state, action: PayloadAction<MarketingProgram>) {
      state.programs.unshift(action.payload)
    },
    removeProgram(state, action: PayloadAction<string>) {
      state.programs = state.programs.filter((p) => p.id !== action.payload)
      state.rules = state.rules.filter((r) => r.programId !== action.payload)
      state.rewards = state.rewards.filter((r) => r.programId !== action.payload)
    },
    /** Boleh digabung promo lain atau tidak (§15.3, OPEN-23). */
    setStackable(state, action: PayloadAction<{ programId: string; isStackable: boolean }>) {
      const program = state.programs.find((p) => p.id === action.payload.programId)
      if (program) program.isStackable = action.payload.isStackable
    },
    addRule(state, action: PayloadAction<ProgramRule>) {
      state.rules.push(action.payload)
    },
    addReward(state, action: PayloadAction<ProgramReward>) {
      state.rewards.push(action.payload)
    },
    /** Ganti seluruh program dengan data BE (API menimpa mock bila ada baris). */
    replaceMarketing(state, action: PayloadAction<MarketingState>) {
      state.programs = action.payload.programs
      state.rules = action.payload.rules
      state.rewards = action.payload.rewards
    },
  },
})

export const { addProgram, removeProgram, setStackable, addRule, addReward, replaceMarketing } =
  marketingSlice.actions
export default marketingSlice.reducer
