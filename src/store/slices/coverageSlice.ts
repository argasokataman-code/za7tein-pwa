import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  DEFAULT_POLYGON_FEE_JOD,
  type CoverageUnit,
  nextPolygonId,
} from '../../data/coverage'
import { mockCoverage } from '../../data/marketplace'
import type { CoverageMode, GeoPoint, MerchantCoverage } from '../../types'

/**
 * Coverage merchant (§9.1, MER-04) — mode area (polygon non-overlap) atau radius.
 *
 * Seed-nya `mockCoverage` yang sudah ada di `src/data/marketplace.ts`; slice ini
 * yang membuatnya hidup (dulu diekspor tapi tak dipakai layar mana pun). Ikut
 * persist supaya bentuk area yang disusun merchant bertahan lintas reload, sama
 * seperti kuota/marketing/batch.
 *
 * Tulis ke BE **belum ada**: `merchants.delivery_config` belum punya endpoint
 * tulis (lihat `ui-impact.md` §8); halaman menandainya lewat
 * `COVERAGE_SAVE_AVAILABLE`.
 */
const initialState: MerchantCoverage = mockCoverage

const cloneCoverage = (source: MerchantCoverage): MerchantCoverage => ({
  ...source,
  polygons: source.polygons.map((polygon) => ({
    ...polygon,
    vertices: polygon.vertices.map((vertex) => ({ ...vertex })),
  })),
})

const coverageSlice = createSlice({
  name: 'coverage',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<CoverageMode>) {
      state.mode = action.payload
    },
    addPolygon(state, action: PayloadAction<GeoPoint[]>) {
      state.polygons.push({
        id: nextPolygonId(state.polygons),
        vertices: action.payload,
        feeJod: DEFAULT_POLYGON_FEE_JOD,
      })
    },
    removePolygon(state, action: PayloadAction<string>) {
      state.polygons = state.polygons.filter((polygon) => polygon.id !== action.payload)
    },
    setPolygonVertices(state, action: PayloadAction<{ id: string; vertices: GeoPoint[] }>) {
      const polygon = state.polygons.find((item) => item.id === action.payload.id)
      if (polygon) polygon.vertices = action.payload.vertices
    },
    setPolygonFee(state, action: PayloadAction<{ id: string; feeJod: number }>) {
      const polygon = state.polygons.find((item) => item.id === action.payload.id)
      if (polygon) polygon.feeJod = action.payload.feeJod
    },
    setRadiusMeters(state, action: PayloadAction<number>) {
      state.radiusMeters = action.payload
    },
    setUnit(state, action: PayloadAction<CoverageUnit>) {
      state.unit = action.payload
    },
    setFeePerUnitJod(state, action: PayloadAction<number>) {
      state.feePerUnitJod = action.payload
    },
    resetCoverage(state) {
      const seed = cloneCoverage(initialState)
      state.mode = seed.mode
      state.polygons = seed.polygons
      state.radiusMeters = seed.radiusMeters
      state.feePerUnitJod = seed.feePerUnitJod
      state.unit = seed.unit
    },
    /** Ganti coverage dengan data BE (API menimpa mock bila merchant punya zona). */
    replaceCoverage(state, action: PayloadAction<MerchantCoverage>) {
      const next = cloneCoverage(action.payload)
      state.mode = next.mode
      state.polygons = next.polygons
      state.radiusMeters = next.radiusMeters
      state.feePerUnitJod = next.feePerUnitJod
      state.unit = next.unit
    },
  },
})

export const {
  setMode,
  addPolygon,
  removePolygon,
  setPolygonVertices,
  setPolygonFee,
  setRadiusMeters,
  setUnit,
  setFeePerUnitJod,
  resetCoverage,
  replaceCoverage,
} = coverageSlice.actions
export default coverageSlice.reducer
