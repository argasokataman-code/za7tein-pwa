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

import { menuSeed } from '../data/catalog'
import { mockUser } from '../data/user'

import auth from './slices/authSlice'
import accountSetup from './slices/accountSetupSlice'
import cart from './slices/cartSlice'
import favorites from './slices/favoritesSlice'
import catalog from './slices/catalogSlice'
import merchant from './slices/merchantSlice'
import courier from './slices/courierSlice'
import notifications from './slices/notificationsSlice'
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
  catalog,
  merchant,
  courier,
  notifications,
  ui,
  accountSetup,
})

// Hanya slice ini yang bertahan setelah reload.
// Key persist milik Sa7tein.
const persistConfig = {
  key: 'sa7tein',
  version: 2,
  storage,
  whitelist: ['cart', 'favorites', 'accountSetup', 'catalog'],
}

/**
 * Cart versi lama menyimpan id menu versi lama dan belum mengenal alamat apartemen
 * maupun bukti transfer. Kalau dibiarkan, `addresses` tidak ada dan layar
 * checkout gagal render.
 *
 * Sengaja dijalankan sinkron sebelum rehydrate, dan berbasis bentuk data
 * (bukan nomor versi) supaya state yang sudah terlanjur tersimpan tanpa
 * perbaikan pun ikut sembuh. Idempoten: aman dipanggil tiap kali app dibuka.
 */
function repairPersistedCart() {
  try {
    const raw = localStorage.getItem('persist:sa7tein')
    if (!raw) return
    const outer = JSON.parse(raw)
    const cart = JSON.parse(outer.cart ?? '{}')
    const legacyItems = (cart.items ?? []).some((i: any) => {
      const food = menuSeed.find((f) => f.id === i.id)
      return !food || (!i.modifiers && i.price !== food.price)
    })
    const needsRepair =
      !Array.isArray(cart.addresses) ||
      cart.transferProof === undefined ||
      legacyItems ||
      !['cod', 'transfer'].includes(cart.selectedPaymentId)

    if (!needsRepair) return

    const items = (cart.items ?? []).flatMap((item: any) => {
      const food = menuSeed.find((f) => f.id === item.id)
      if (!food) return []
      if (item.modifiers) return [item]
      return [{ ...item, name: food.name, image: food.image, price: food.price }]
    })

    outer.cart = JSON.stringify({
      ...cart,
      items,
      addresses: Array.isArray(cart.addresses) ? cart.addresses : mockUser.addresses,
      transferProof: cart.transferProof ?? null,
      selectedAddressId: mockUser.addresses.some((a) => a.id === cart.selectedAddressId)
        ? cart.selectedAddressId
        : mockUser.addresses[0].id,
      selectedPaymentId: ['cod', 'transfer'].includes(cart.selectedPaymentId)
        ? cart.selectedPaymentId
        : 'cod',
    })
    const meta = JSON.parse(outer._persist ?? '{}')
    outer._persist = JSON.stringify({ ...meta, version: 2 })
    localStorage.setItem('persist:sa7tein', JSON.stringify(outer))
  } catch {
    // State rusak tidak boleh menghalangi app terbuka.
  }
}

repairPersistedCart()

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
