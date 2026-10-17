import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  MOCK_OPS_PENALTIES,
  MOCK_OPS_TAGS,
  MOCK_PLATFORM_CONFIG,
  OPS_INCIDENTS,
  OPS_RULES,
} from '../../data/ops'
import { CS_CURRENT_ACTOR } from '../../data/superadmin'
import type {
  DisputeRule,
  Incident,
  OpsPenalty,
  OpsPlatformConfig,
  OpsTag,
} from '../../types'

/**
 * State panel ops (M10, R-OPS). Semua mock: aksi ops = state yang ditampilkan,
 * tidak menyentuh uang/order sungguhan (AGENTS §1). Katalog rule dibaca dari
 * `data/rules.ts` (satu sumber dengan mesin `ruleForOrder`) dan diedit di sini.
 */
interface OpsState {
  config: OpsPlatformConfig
  tags: OpsTag[]
  penalties: OpsPenalty[]
  incidents: Incident[]
  rules: DisputeRule[]
}

const initialState: OpsState = {
  config: MOCK_PLATFORM_CONFIG,
  tags: MOCK_OPS_TAGS,
  penalties: MOCK_OPS_PENALTIES,
  incidents: OPS_INCIDENTS,
  rules: OPS_RULES,
}

/** Id mock unik walau beberapa aksi terjadi di detik yang sama. */
const makeId = (prefix: string, count: number) => `${prefix}-${count + 1}-${Date.now()}`

const opsSlice = createSlice({
  name: 'ops',
  initialState,
  reducers: {
    /** Ubah satu knob setelan platform (multiplier, ambang, flat fee). */
    setConfig(state, action: PayloadAction<Partial<OpsPlatformConfig>>) {
      state.config = { ...state.config, ...action.payload }
    },
    /**
     * API: timpa knob setelan dengan baris `platform_params`. Hanya field yang
     * ada di BE yang dikirim; tabel kosong → mock dipertahankan (pola API lain).
     */
    hydrateConfig(state, action: PayloadAction<Partial<OpsPlatformConfig>>) {
      state.config = { ...state.config, ...action.payload }
    },
    /** API: timpa antrean tag dengan `merchant_tags`. Kosong → mock. */
    hydrateTags(state, action: PayloadAction<OpsTag[]>) {
      if (action.payload.length) state.tags = action.payload
    },
    /** Setujui / tolak usulan tag merchant. */
    decideTag(state, action: PayloadAction<{ id: string; status: OpsTag['status'] }>) {
      const tag = state.tags.find((t) => t.id === action.payload.id)
      if (tag) tag.status = action.payload.status
    },
    /** Terbitkan SP baru. */
    issuePenalty(
      state,
      action: PayloadAction<Omit<OpsPenalty, 'id' | 'status' | 'issuedAt'>>,
    ) {
      state.penalties.unshift({
        ...action.payload,
        id: makeId('sp', state.penalties.length),
        status: 'issued',
        issuedAt: 'Baru saja',
      })
    },
    /** Cabut SP yang sudah berlaku. */
    revokePenalty(state, action: PayloadAction<{ id: string }>) {
      const penalty = state.penalties.find((p) => p.id === action.payload.id)
      if (penalty) penalty.status = 'revoked'
    },
    /** Tutup insiden dengan keputusan ops. */
    resolveIncident(
      state,
      action: PayloadAction<{ id: string; decision: string; status: Incident['status'] }>,
    ) {
      const incident = state.incidents.find((i) => i.id === action.payload.id)
      if (!incident) return
      incident.status = action.payload.status
      incident.decision = action.payload.decision
      incident.decidedBy = CS_CURRENT_ACTOR.name
    },
    /** Aktif/nonaktifkan satu rule di katalog ops. */
    toggleRuleActive(state, action: PayloadAction<{ id: string }>) {
      const rule = state.rules.find((r) => r.id === action.payload.id)
      if (rule) rule.active = !rule.active
    },
  },
})

export const {
  setConfig,
  hydrateConfig,
  hydrateTags,
  decideTag,
  issuePenalty,
  revokePenalty,
  resolveIncident,
  toggleRuleActive,
} = opsSlice.actions
export default opsSlice.reducer
