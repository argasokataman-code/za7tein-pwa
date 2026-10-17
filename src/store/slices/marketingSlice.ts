import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockMarketingPrograms, mockProgramRewards, mockProgramRules } from '../../data/marketing'
import type { MarketingProgram, ProgramReward, ProgramRule } from '../../types'

interface MarketingState {
  programs: MarketingProgram[]
  rules: ProgramRule[]
  rewards: ProgramReward[]
  /**
   * Kupon program yang sudah **diklaim** customer di halaman toko. Ini murni
   * tampilan — diskon tetap dihitung otomatis oleh §15.3 (`useProgramDiscount`),
   * klaim cuma menandai "punyaku" supaya pembeli yakin kuponnya terpasang.
   * Ikut persist karena `marketing` ada di whitelist `src/store/index.ts`.
   */
  claimedProgramIds: string[]
}

/** Bundle program dari BE — tanpa daftar klaim, supaya klaim tidak ikut tertimpa. */
export type MarketingBundle = Omit<MarketingState, 'claimedProgramIds'>

const initialState: MarketingState = {
  programs: mockMarketingPrograms,
  rules: mockProgramRules,
  rewards: mockProgramRewards,
  claimedProgramIds: [],
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
    /** Klaim kupon program (halaman toko customer). Idempoten. */
    claimProgram(state, action: PayloadAction<string>) {
      if (!state.claimedProgramIds.includes(action.payload)) {
        state.claimedProgramIds.push(action.payload)
      }
    },
    /** Batalkan klaim — kupon yang sama bisa diklaim lagi nanti. */
    releaseProgram(state, action: PayloadAction<string>) {
      state.claimedProgramIds = state.claimedProgramIds.filter((id) => id !== action.payload)
    },
    /** Ganti seluruh program dengan data BE (API menimpa mock bila ada baris). */
    replaceMarketing(state, action: PayloadAction<MarketingBundle>) {
      state.programs = action.payload.programs
      state.rules = action.payload.rules
      state.rewards = action.payload.rewards
    },
  },
  /**
   * State persist lama bisa datang tanpa `claimedProgramIds` (field yang baru
   * ditambah). `redux-persist` mengganti seluruh slice, bukan menggabung
   * per-field, jadi slice lama akan membuat `claimedProgramIds` `undefined` dan
   * `.includes()` meledak (terbukti: halaman toko jatuh ke error boundary).
   * Normalisasi di sini — satu tempat, semua pembaca aman.
   */
  extraReducers: (builder) => {
    builder.addCase('persist/REHYDRATE', (state, action) => {
      const payload = (action as { payload?: { marketing?: Partial<MarketingState> } }).payload
      if (!Array.isArray(payload?.marketing?.claimedProgramIds)) state.claimedProgramIds = []
    })
  },
})

export const {
  addProgram,
  removeProgram,
  setStackable,
  addRule,
  addReward,
  claimProgram,
  releaseProgram,
  replaceMarketing,
} = marketingSlice.actions
export default marketingSlice.reducer
