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

import { foods } from '../data/foods'
import { mockUser } from '../data/user'

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

// Hanya slice ini yang bertahan setelah reload.
// Key tetap 'delivo' meski app sudah rebrand: mengganti key akan membuang
// keranjang dan favorit pengguna lama tanpa peringatan.
const persistConfig = {
  key: 'delivo',
  version: 2,
  storage,
  whitelist: ['cart', 'favorites', 'accountSetup'],
}

/**
 * Cart versi lama menyimpan id menu Delivo dan belum mengenal alamat apartemen
 * maupun bukti transfer. Kalau dibiarkan, `addresses` tidak ada dan layar
 * checkout gagal render.
 *
 * Sengaja dijalankan sinkron sebelum rehydrate, dan berbasis bentuk data
 * (bukan nomor versi) supaya state yang sudah terlanjur tersimpan tanpa
 * perbaikan pun ikut sembuh. Idempoten: aman dipanggil tiap kali app dibuka.
 */
function repairPersistedCart() {
  try {
    const raw = localStorage.getItem('persist:delivo')
    if (!raw) return
    const outer = JSON.parse(raw)
    const cart = JSON.parse(outer.cart ?? '{}')
    const legacyItems = (cart.items ?? []).some((i: any) => {
      const food = foods.find((f) => f.id === i.id)
      return !food || (!i.modifiers && i.price !== food.price)
    })
    const needsRepair =
      !Array.isArray(cart.addresses) ||
      cart.transferProof === undefined ||
      legacyItems ||
      !['cod', 'transfer'].includes(cart.selectedPaymentId)

    if (!needsRepair) return

    // Baris ber-modifier dibiarkan apa adanya: harganya sudah termasuk tambahan
    // yang tidak bisa direkonstruksi dari katalog.
    const items = (cart.items ?? []).flatMap((item: any) => {
      const food = foods.find((f) => f.id === item.id)
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
    localStorage.setItem('persist:delivo', JSON.stringify(outer))
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
