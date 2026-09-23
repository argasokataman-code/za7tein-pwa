import { combineReducers, configureStore, type Middleware } from '@reduxjs/toolkit'
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
import { DISPUTE_RESOLUTION_LABEL } from '../data/admin'
import { CS_CURRENT_ACTOR } from '../data/superadmin'
import { mockUser } from '../data/user'

import auth from './slices/authSlice'
import accountSetup from './slices/accountSetupSlice'
import cart from './slices/cartSlice'
import favorites from './slices/favoritesSlice'
import catalog from './slices/catalogSlice'
import merchant from './slices/merchantSlice'
import courier from './slices/courierSlice'
import wallet from './slices/walletSlice'
import admin from './slices/adminSlice'
import superAdmin, { logAudit } from './slices/superAdminSlice'
import notifications from './slices/notificationsSlice'
import ui from './slices/uiSlice'
import type { AuditKind, DisputeResolution } from '../types'

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
  wallet,
  admin,
  superAdmin,
  notifications,
  ui,
  accountSetup,
})

// Hanya slice ini yang bertahan setelah reload.
// Key persist milik Sa7tein.
// `admin` ikut persist sejak M6: putusan sengketa dan entry ledger harus terbaca
// lintas role (customer → panel CS), dan perpindahan role me-reload halaman.
// `superAdmin` ikut persist sejak konsol SA dibangun: konfigurasi zona, role,
// operator, kill switch, dan audit trail harus bertahan lintas reload.
const persistConfig = {
  key: 'sa7tein',
  version: 2,
  storage,
  whitelist: ['cart', 'favorites', 'accountSetup', 'catalog', 'wallet', 'admin', 'superAdmin'],
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
    // Alamat versi lama belum menyimpan `zone` (snapshot coverage Hijazi/Syimali,
    // migrasi zona 2026-09-23). Tanpa field itu semua alamat jadi "di luar
    // jangkauan", jadi state lama dikembalikan ke alamat mock.
    const zonesOutdated =
      Array.isArray(cart.addresses) && cart.addresses.some((a: any) => !('zone' in a))
    const needsRepair =
      !Array.isArray(cart.addresses) ||
      zonesOutdated ||
      cart.transferProof === undefined ||
      legacyItems ||
      !['wallet', 'cod', 'transfer'].includes(cart.selectedPaymentId)

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
      addresses:
        Array.isArray(cart.addresses) && !zonesOutdated ? cart.addresses : mockUser.addresses,
      transferProof: cart.transferProof ?? null,
      selectedAddressId: mockUser.addresses.some((a) => a.id === cart.selectedAddressId)
        ? cart.selectedAddressId
        : mockUser.addresses[0].id,
      selectedPaymentId: ['wallet', 'cod', 'transfer'].includes(cart.selectedPaymentId)
        ? cart.selectedPaymentId
        : 'wallet',
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

/**
 * Jembatan audit: tiap aksi panel CS (`admin/*`) menulis satu baris ke audit
 * trail SA. Ditaruh di middleware, bukan di 8 reducer/halaman CS, supaya tidak
 * ada aksi CS yang lolos pengawasan dan halaman CS tidak perlu disentuh.
 */
interface CsAuditRule {
  kind: AuditKind
  action: string | ((payload: any) => string)
  target: (payload: any, state: RootState) => string
}

const CS_AUDIT_RULES: Record<string, CsAuditRule> = {
  'admin/approveDeposit': {
    kind: 'onboarding',
    action: 'Setujui deposit tenant, status jadi Aktif',
    target: (p, s) => s.admin.tenants.find((t) => t.id === p.id)?.name ?? p.id,
  },
  'admin/rejectOnboarding': {
    kind: 'onboarding',
    action: 'Tolak onboarding tenant',
    target: (p, s) => s.admin.tenants.find((t) => t.id === p.id)?.name ?? p.id,
  },
  'admin/suspendMerchant': {
    kind: 'merchant',
    action: 'Suspend merchant',
    target: (p, s) => s.admin.merchants.find((m) => m.id === p.id)?.name ?? p.id,
  },
  'admin/blacklistCod': {
    kind: 'merchant',
    action: 'Blacklist COD merchant + tandai riskFlag customer',
    target: (p, s) =>
      `${s.admin.merchants.find((m) => m.id === p.id)?.name ?? p.id} · ${p.customerName}`,
  },
  'admin/startInvestigation': {
    kind: 'dispute',
    action: 'Mulai investigasi sengketa',
    target: (p, s) => s.admin.disputes.find((d) => d.id === p.id)?.orderCode ?? p.id,
  },
  'admin/resolveDispute': {
    kind: 'dispute',
    action: (p) =>
      `Putusan level-1: ${DISPUTE_RESOLUTION_LABEL[p.resolution as DisputeResolution] ?? p.resolution}`,
    target: (p, s) => s.admin.disputes.find((d) => d.id === p.id)?.orderCode ?? p.id,
  },
  'admin/fileDispute': {
    kind: 'dispute',
    action: 'Sengketa baru diajukan',
    target: (p) => p.orderCode,
  },
  'admin/clearEscalation': {
    kind: 'escalate',
    action: 'Tindak alert SLA',
    target: (p, s) => s.admin.escalations.find((e) => e.id === p.id)?.orderCode ?? p.id,
  },
}

const auditBridge: Middleware = (api) => (next) => (action) => {
  const result = next(action)
  const rule = CS_AUDIT_RULES[(action as { type?: string }).type ?? '']
  if (rule) {
    const payload = (action as { payload?: any }).payload ?? {}
    api.dispatch(
      logAudit({
        actor: CS_CURRENT_ACTOR.name,
        kind: rule.kind,
        action: typeof rule.action === 'function' ? rule.action(payload) : rule.action,
        target: rule.target(payload, api.getState() as RootState),
      }),
    )
  }
  return result
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(auditBridge),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
