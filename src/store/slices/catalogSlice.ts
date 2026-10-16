import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Category, MenuItem } from '../../types'
import { CATEGORIES, menuSeed } from '../../data/catalog'

interface CatalogState {
  items: MenuItem[]
  /**
   * Kategori menu merchant (MER-06): bisa ditambah/dihapus, bukan lagi 4 tetap.
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
    addCategory(state, action: PayloadAction<Category>) {
      if (state.categories.some((c) => c.id === action.payload.id)) return
      state.categories.push(action.payload)
    },
    /**
     * Hapus kategori hanya bila tak ada item memakainya dan bukan kategori
     * terakhir — kategori kosong boleh dihapus, kategori berisi item tidak
     * (item akan kehilangan rumahnya).
     */
    removeCategory(state, action: PayloadAction<string>) {
      if (state.categories.length <= 1) return
      if (state.items.some((item) => item.category === action.payload)) return
      state.categories = state.categories.filter((c) => c.id !== action.payload)
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
  addCategory,
  removeCategory,
} = catalogSlice.actions

export const selectCatalogItems = (state: { catalog: CatalogState }) =>
  state.catalog.items

export const selectCategories = (state: { catalog: CatalogState }) =>
  state.catalog.categories

export default catalogSlice.reducer
