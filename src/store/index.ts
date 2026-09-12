import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'

import auth from './slices/authSlice'
import accountSetup from './slices/accountSetupSlice'
import cart from './slices/cartSlice'
import favorites from './slices/favoritesSlice'
import ui from './slices/uiSlice'

// Minimal localStorage-backed storage so we don't depend on redux-persist's
// CJS entry point, which Vite struggles to pre-bundle.
const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
}

const rootReducer = combineReducers({
  auth,
  cart,
  favorites,
  ui,
  accountSetup,
})

// Only these three slices survive a reload, same as the app it mirrors.
const persistConfig = {
  key: 'delivo',
  version: 1,
  storage,
  whitelist: ['cart', 'favorites', 'accountSetup'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
