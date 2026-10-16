import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Category, MenuItem } from '../../types'
import { CATEGORIES, menuSeed } from '../../data/catalog'

interface CatalogState {
  items: MenuItem[]
  /**
   * Kategori menu (MER-06) — **taksonomi ops/BE, bukan dikelola merchant**.
   * Daftar baca-saja: merchant memilihnya lewat dropdown di form item. Sumber
   * sekarang konstanta modul `data/catalog`; kelak diisi dari BE.
   * **Tanpa ikon** — `Category.icon` adalah komponen React (lucide forwardRef),
   * dan slice ini ikut persist; JSON tidak menyimpan fungsi, jadi ikon yang
   * tersimpan jadi `{}` dan render melempar React #130. Ikon dipetakan dari
   * modul `data/catalog` di layar, bukan dari state.
   */
  categories: Category[]
}

const initialState: CatalogState = {
  items: menuSeed,
  categories: CATEGORIES.map(({ id, label }) => ({ id, label })),
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    addMenuItem(state, action: PayloadAction<MenuItem>) {
      state.items.push(action.payload)
    },
    updateMenuItem(state, action: PayloadAction<MenuItem>) {
      const index = state.items.findIndex((m) => m.id === action.payload.id)
      if (index >= 0) state.items[index] = action.payload
    },
    removeMenuItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((m) => m.id !== action.payload)
    },
    adjustStock(state, action: PayloadAction<{ id: string; delta: number }>) {
      const item = state.items.find((m) => m.id === action.payload.id)
      if (item) item.stock = Math.max(0, item.stock + action.payload.delta)
    },
    setStock(state, action: PayloadAction<{ id: string; stock: number }>) {
      const item = state.items.find((m) => m.id === action.payload.id)
      if (item) item.stock = Math.max(0, action.payload.stock)
    },
    toggleAvailable(state, action: PayloadAction<string>) {
      const item = state.items.find((m) => m.id === action.payload)
      if (item) item.available = !item.available
    },
  },
})

export const {
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  adjustStock,
  setStock,
  toggleAvailable,
} = catalogSlice.actions

export const selectCatalogItems = (state: { catalog: CatalogState }) =>
  state.catalog.items

export const selectCategories = (state: { catalog: CatalogState }) =>
  state.catalog.categories

export default catalogSlice.reducer
