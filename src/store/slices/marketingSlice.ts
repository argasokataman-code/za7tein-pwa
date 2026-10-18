import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { mockMarketingPrograms, mockProgramRewards, mockProgramRules } from '../../data/marketing'
import { mockPromoSlides } from '../../data/promoSlides'
import type { MarketingProgram, ProgramReward, ProgramRule, PromoSlide } from '../../types'

interface MarketingState {
  programs: MarketingProgram[]
  rules: ProgramRule[]
  rewards: ProgramReward[]
  /**
   * Slide carousel promo beranda toko. Urutan array = urutan tampil. Hanya
   * slide `active` yang dirender customer; kalau kosong, carousel jatuh ke
   * perilaku lama (menu berdiskon otomatis). Ikut persist bersama `marketing`.
   */
  slides: PromoSlide[]
  /**
   * Kupon program yang sudah **diklaim** customer di halaman toko. Ini murni
   * tampilan — diskon tetap dihitung otomatis oleh §15.3 (`useProgramDiscount`),
   * klaim cuma menandai "punyaku" supaya pembeli yakin kuponnya terpasang.
   * Ikut persist karena `marketing` ada di whitelist `src/store/index.ts`.
   */
  claimedProgramIds: string[]
}

/** Bundle program dari BE — tanpa klaim/slide, supaya keduanya tidak tertimpa. */
export type MarketingBundle = Pick<MarketingState, 'programs' | 'rules' | 'rewards'>

const initialState: MarketingState = {
  programs: mockMarketingPrograms,
  rules: mockProgramRules,
  rewards: mockProgramRewards,
  slides: mockPromoSlides,
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
    /** Tambah slide di urutan paling akhir (carousel mengikuti urutan array). */
    addPromoSlide(state, action: PayloadAction<PromoSlide>) {
      state.slides.push(action.payload)
    },
    /** Ganti isi slide; id dan merchant tidak boleh berpindah. */
    updatePromoSlide(state, action: PayloadAction<PromoSlide>) {
      const index = state.slides.findIndex((slide) => slide.id === action.payload.id)
      if (index >= 0) state.slides[index] = action.payload
    },
    removePromoSlide(state, action: PayloadAction<string>) {
      state.slides = state.slides.filter((slide) => slide.id !== action.payload)
    },
    setPromoSlideActive(
      state,
      action: PayloadAction<{ id: string; active: boolean }>,
    ) {
      const slide = state.slides.find((item) => item.id === action.payload.id)
      if (slide) slide.active = action.payload.active
    },
    /**
     * Geser satu langkah di antara slide milik merchant yang sama. Slide
     * merchant lain boleh terselip di array; yang ditukar hanya dua slide
     * merchant ini, jadi urutan toko lain tidak berubah.
     */
    movePromoSlide(
      state,
      action: PayloadAction<{ id: string; direction: -1 | 1 }>,
    ) {
      const slide = state.slides.find((item) => item.id === action.payload.id)
      if (!slide) return
      const siblings = state.slides.filter((item) => item.merchantId === slide.merchantId)
      const position = siblings.indexOf(slide)
      const neighbour = siblings[position + action.payload.direction]
      if (!neighbour) return
      const a = state.slides.indexOf(slide)
      const b = state.slides.indexOf(neighbour)
      const displaced = state.slides[a]
      state.slides[a] = state.slides[b]
      state.slides[b] = displaced
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
      // State lama belum punya daftar slide; isi dengan contoh mock supaya
      // carousel tetap tampil. `slides: []` yang memang disimpan merchant tetap
      // dihormati karena bentuknya array.
      if (!Array.isArray(payload?.marketing?.slides)) state.slides = mockPromoSlides
    })
  },
})

export const {
  addProgram,
  removeProgram,
  setStackable,
  addRule,
  addReward,
  addPromoSlide,
  updatePromoSlide,
  removePromoSlide,
  setPromoSlideActive,
  movePromoSlide,
  claimProgram,
  releaseProgram,
  replaceMarketing,
} = marketingSlice.actions
export default marketingSlice.reducer
