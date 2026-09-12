import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FavoritesState {
  ids: string[]
}

const initialState: FavoritesState = { ids: [] }

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload
      state.ids = state.ids.includes(id)
        ? state.ids.filter((x) => x !== id)
        : [...state.ids, id]
    },
    clearFavorites(state) {
      state.ids = []
    },
  },
})

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer
