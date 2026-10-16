import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  buildVariants,
  mockAttributeExclusions,
  mockCatalogAttributes,
  mockMenuAttributeLines,
  mockMenuAttributeValues,
  mockMenuVariants,
} from '../../data/catalogOdoo'
import type {
  AttributeExclusion,
  CatalogAttribute,
  MenuAttributeLine,
  MenuAttributeValue,
  MenuVariant,
} from '../../types'

/**
 * Katalog ala Odoo (§14, MER-07/MER-08): attribute/nilai global milik merchant,
 * pemasangannya ke menu (`price_extra` + ketersediaan), exclusion, dan varian.
 * Slice terpisah dari `catalog` supaya menambahnya tidak perlu migrasi persist
 * (kunci baru = initial state dipakai apa adanya). Logika murni tinggal di
 * `src/data/catalogOdoo.ts`.
 */
interface CatalogAttributesState {
  attributes: CatalogAttribute[]
  lines: MenuAttributeLine[]
  values: MenuAttributeValue[]
  exclusions: AttributeExclusion[]
  variants: MenuVariant[]
}

const initialState: CatalogAttributesState = {
  attributes: mockCatalogAttributes,
  lines: mockMenuAttributeLines,
  values: mockMenuAttributeValues,
  exclusions: mockAttributeExclusions,
  variants: mockMenuVariants,
}

const catalogAttributesSlice = createSlice({
  name: 'catalogAttributes',
  initialState,
  reducers: {
    /** Pasang atribut ke menu: satu baris + satu nilai per nilai attribute (§14). */
    addMenuAttributeLine(state, action: PayloadAction<{ menuId: string; attributeId: string }>) {
      const { menuId, attributeId } = action.payload
      if (state.lines.some((l) => l.menuId === menuId && l.attributeId === attributeId)) return
      const attribute = state.attributes.find((a) => a.id === attributeId)
      if (!attribute) return

      state.lines.push({ menuId, attributeId, valueIds: attribute.values.map((v) => v.id) })
      for (const value of attribute.values) {
        state.values.push({
          menuId,
          attributeValueId: value.id,
          priceExtra: value.defaultExtraPrice,
          available: true,
          excludeValueIds: [],
        })
      }
      state.variants = buildVariants(state.lines, state.attributes, state.variants, menuId)
    },

    /** Lepas atribut dari menu: buang baris, nilainya, dan variannya. */
    removeMenuAttributeLine(state, action: PayloadAction<{ menuId: string; attributeId: string }>) {
      const { menuId, attributeId } = action.payload
      const line = state.lines.find((l) => l.menuId === menuId && l.attributeId === attributeId)
      if (!line) return
      state.lines = state.lines.filter((l) => !(l.menuId === menuId && l.attributeId === attributeId))
      state.values = state.values.filter(
        (v) => !(v.menuId === menuId && line.valueIds.includes(v.attributeValueId)),
      )
      state.variants = buildVariants(state.lines, state.attributes, state.variants, menuId)
    },

    setMenuValueExtra(
      state,
      action: PayloadAction<{ menuId: string; attributeValueId: string; priceExtra: number }>,
    ) {
      const { menuId, attributeValueId, priceExtra } = action.payload
      const value = state.values.find(
        (v) => v.menuId === menuId && v.attributeValueId === attributeValueId,
      )
      if (value) value.priceExtra = Math.max(0, priceExtra)
    },

    /** Ketersediaan level nilai attribute per menu (MER-08). */
    toggleMenuValueAvailable(
      state,
      action: PayloadAction<{ menuId: string; attributeValueId: string }>,
    ) {
      const { menuId, attributeValueId } = action.payload
      const value = state.values.find(
        (v) => v.menuId === menuId && v.attributeValueId === attributeValueId,
      )
      if (value) value.available = !value.available
    },

    /** Ketersediaan level varian (MER-08). */
    toggleMenuVariantAvailable(state, action: PayloadAction<{ variantId: string }>) {
      const variant = state.variants.find((v) => v.id === action.payload.variantId)
      if (variant) variant.available = !variant.available
    },

    resetCatalogAttributes() {
      return initialState
    },
  },
})

export const {
  addMenuAttributeLine,
  removeMenuAttributeLine,
  setMenuValueExtra,
  toggleMenuValueAvailable,
  toggleMenuVariantAvailable,
  resetCatalogAttributes,
} = catalogAttributesSlice.actions

export const selectCatalogAttributes = (state: { catalogAttributes: CatalogAttributesState }) =>
  state.catalogAttributes.attributes
export const selectMenuAttributeLines = (state: { catalogAttributes: CatalogAttributesState }) =>
  state.catalogAttributes.lines
export const selectMenuAttributeValues = (state: { catalogAttributes: CatalogAttributesState }) =>
  state.catalogAttributes.values
export const selectMenuVariants = (state: { catalogAttributes: CatalogAttributesState }) =>
  state.catalogAttributes.variants
export const selectAttributeExclusions = (state: { catalogAttributes: CatalogAttributesState }) =>
  state.catalogAttributes.exclusions

export default catalogAttributesSlice.reducer
