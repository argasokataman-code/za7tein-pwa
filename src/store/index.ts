import { combineReducers, configureStore, type Middleware } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createMigrate,
  persistReducer,
  persistStore,
} from 'redux-persist'

import { menuSeed } from '../data/catalog'
import { mockPromoSlides } from '../data/promoSlides'
import { KNOWN_PAYMENT_METHOD_IDS } from '../data/merchant'
import { DISPUTE_RESOLUTION_LABEL } from '../data/admin'
import { CS_CURRENT_ACTOR, SA_CURRENT_ACTOR } from '../data/superadmin'
import { findCustomer } from '../data/people'
import { mockUser } from '../data/user'

import auth from './slices/authSlice'
import accountSetup from './slices/accountSetupSlice'
import cart from './slices/cartSlice'
import favorites from './slices/favoritesSlice'
import catalog from './slices/catalogSlice'
import merchant from './slices/merchantSlice'
import courier from './slices/courierSlice'
import wallet from './slices/walletSlice'
import payout from './slices/payoutSlice'
import admin from './slices/adminSlice'
import superAdmin, { logAudit } from './slices/superAdminSlice'
import ops from './slices/opsSlice'
import notifications from './slices/notificationsSlice'
import batch from './slices/batchSlice'
import partner from './slices/partnerSlice'
import quota from './slices/quotaSlice'
import rules from './slices/rulesSlice'
import marketing from './slices/marketingSlice'
import coverage from './slices/coverageSlice'
import catalogAttributes from './slices/catalogAttributesSlice'
import customerOrders from './slices/customerOrdersSlice'
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
  payout,
  admin,
  superAdmin,
  ops,
  notifications,
  batch,
  partner,
  quota,
  marketing,
  coverage,
  rules,
  catalogAttributes,
  customerOrders,
  ui,
  accountSetup,
})

// Hanya slice ini yang bertahan setelah reload.
// Key persist milik Sa7tein.
// `admin` ikut persist sejak M6: putusan sengketa dan entry ledger harus terbaca
// lintas role (customer → panel CS), dan perpindahan role me-reload halaman.
// `superAdmin` ikut persist sejak konsol SA dibangun: konfigurasi zona, role,
// operator, kill switch, dan audit trail harus bertahan lintas reload.
// `auth` ikut persist sejak gerbang rute dipasang: sesi yang tidak bertahan
// berarti setiap reload melempar pengguna kembali ke onboarding, dan justru
// itulah yang bikin mode terinstal terasa rusak.
/**
 * Migrasi state tersimpan. v3: vertices poligon zona pindah dari koordinat
 * gambar (`{x,y}`) ke lat/lng sungguhan supaya gate coverage bisa menguji
 * "titik di dalam poligon". Hanya `superAdmin` yang dibuang, karena hanya itu
 * yang berubah bentuk, keranjang dan saldo demo tidak perlu ikut hilang.
 *
 * v4: rujukan antar-entitas pindah dari nama ke id — entry ledger dapat
 * `party`, sengketa dapat `partyId`/`customerId`/`merchantId`, merchant dapat
 * identitas pemilik, dan audit dapat `actorId`. State tersimpan dari versi lama
 * tidak punya kolom itu, dan `entry.party` yang `undefined` langsung
 * melempar error saat tabel ledger dirender. `admin` + `superAdmin` dibuang
 * supaya di-seed ulang; keranjang, saldo, dan katalog tidak berubah bentuk.
 */
/** Versi skema state tersimpan. Naikkan saat bentuk slice berubah (lihat `migrations`). */
const PERSIST_VERSION = 9

/**
 * Buang slice dari state tersimpan supaya di-seed ulang.
 *
 * **Key-nya dihapus, bukan di-set `undefined`.** `autoMergeLevel1` menyalin tiap
 * key yang ADA di state tersimpan menimpa initial state, jadi `{ batch: undefined }`
 * membuat `state.batch` benar-benar `undefined` dan pembaca pertama
 * (`s.batch.batches`) melempar error — halaman jadi "Terjadi kesalahan" persis
 * sekali, pada boot pertama setelah upgrade, lalu sembuh sendiri di reload
 * berikutnya (state sudah terversi baru). Dengan menghapus key, slice-nya jatuh
 * kembali ke initial state di reducer.
 */
function dropPersisted(state: any, keys: string[]): any {
  const next = { ...state }
  for (const key of keys) delete next[key]
  return next
}

const migrations = {
  3: (state: any) => dropPersisted(state, ['superAdmin']),
  4: (state: any) => dropPersisted(state, ['admin', 'superAdmin']),
  /**
   * v5: `superAdmin` dibuang supaya di-seed ulang. Dipakai saat `superAdmin`
   * sempat dapat field `incentive` (master insentif di konsol SA) yang kemudian
   * dicabut kembali: state tersimpan dari masa itu masih membawa field itu, dan
   * membiarkannya berarti `state.superAdmin` tidak pernah cocok lagi dengan
   * bentuk yang dipakai kode. Keranjang, saldo, dan katalog tidak berubah bentuk.
   */
  5: (state: any) => dropPersisted(state, ['superAdmin']),
  /**
   * v6: `catalog` dibuang supaya di-seed ulang. `MenuItem` dapat field
   * `merchantId` (katalog kini dikelompokkan per toko); state tersimpan dari
   * versi lama tidak punya field itu, sehingga halaman toko selalu kosong.
   * Keranjang/favorit memakai id menu yang sama, jadi tidak perlu ikut hilang.
   */
  6: (state: any) => dropPersisted(state, ['catalog']),
  /**
   * v7: `batch` dibuang supaya di-seed ulang. Batch berubah arti di M4: lahir
   * **hanya** dari order Regular yang di-accept (BR-B01), jadi seed batch dulu
   * (`ord-1`/`ord-2`, kurir tetap) menunjuk order yang tidak pernah ada di BE
   * (`orders` ber-id `api-<n>`). Batch nyangkut itu tampil sebagai "Batch #1,
   * 0/24 order" yang tak bisa dimengerti. Keranjang/saldo tidak berubah bentuk.
   */
  7: (state: any) => dropPersisted(state, ['batch']),
  /**
   * v8: `catalog` dibuang supaya di-seed ulang. M4c menambah `categories` (dulu
   * 4 kategori tetap di modul) dan `MenuItem.noteEnabled` (MER-05, toggle catatan
   * per menu). State tersimpan lama tak punya `categories` — `autoMergeLevel1`
   * menyalin seluruh slice, jadi `state.catalog.categories` jadi `undefined` dan
   * peta kategori langsung melempar error. Keranjang/favorit memakai id menu yang
   * sama, jadi tidak perlu ikut hilang.
   */
  8: (state: any) => dropPersisted(state, ['catalog']),
  /**
   * v9: `marketing.slides` kosong/hilang diisi slide contoh. Fitur carousel
   * baru punya `slides`, jadi state tersimpan lama tidak punya field itu dan
   * carousel customer kosong. Migrasi sekali jalan: setelah merchant menghapus
   * semua slide, `slides: []` yang ia simpan tetap dihormati di versi 9.
   */
  9: (state: any) => {
    const marketing = state?.marketing
    if (!marketing) return state
    if (Array.isArray(marketing.slides) && marketing.slides.length > 0) return state
    return { ...state, marketing: { ...marketing, slides: mockPromoSlides } }
  },
}

const persistConfig = {
  key: 'sa7tein',
  version: PERSIST_VERSION,
  storage,
  whitelist: ['cart', 'favorites', 'accountSetup', 'catalog', 'wallet', 'payout', 'admin', 'superAdmin', 'ops', 'auth', 'batch', 'partner', 'quota', 'marketing', 'coverage', 'rules', 'catalogAttributes'],
  migrate: createMigrate(migrations, { debug: false }),
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
    // Kanal VA/QRIS berganti nama saat provider pindah ke DANA (2026-10-13):
    // cart tersimpan dari versi lama masih memakai id kanal lama. Dipetakan
    // sebelum validasi, supaya pilihan metode tidak jatuh ke `wallet` hanya
    // karena namanya berganti.
    if (cart.selectedPaymentId === 'xendit_va') cart.selectedPaymentId = 'dana_va'
    if (cart.selectedPaymentId === 'xendit_qris') cart.selectedPaymentId = 'dana_qris'
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
      !KNOWN_PAYMENT_METHOD_IDS.includes(cart.selectedPaymentId) ||
      // Keranjang ganda per toko (M1c): state lama belum punya tiga field ini.
      cart.activeMerchantId === undefined ||
      cart.carts === undefined ||
      cart.orderNote === undefined

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
      selectedPaymentId: KNOWN_PAYMENT_METHOD_IDS.includes(cart.selectedPaymentId)
        ? cart.selectedPaymentId
        : 'wallet',
      activeMerchantId: cart.activeMerchantId ?? null,
      carts: cart.carts ?? {},
      orderNote: cart.orderNote ?? '',
    })
    const meta = JSON.parse(outer._persist ?? '{}')
    // Slice yang bentuknya sudah tidak cocok dengan kode (sama seperti yang
    // dibuang `migrations`) dibuang di sini juga — jangan menurunkan penanda
    // versi ke angka lama: itu memaksa migrasi jalan, hasilnya slice
    // `undefined`, dan render pertama app pecah (layar putih) sebelum
    // rehydrate selesai.
    delete outer.superAdmin
    delete outer.admin
    delete outer.catalog
    outer._persist = JSON.stringify({ ...meta, version: PERSIST_VERSION })
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
  /** Aksi yang dijalankan SA lewat slice CS (mis. putusan banding) ditandai `sa`. */
  actor?: 'sa' | 'cs' | ((payload: any) => 'sa' | 'cs')
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
    // Pelaku menentukan bunyi barisnya: "Suspend merchant" tanpa pelaku ambigu
    // kalau CS dan SA punya tombol yang sama.
    action: (p) => (p.by === 'sa' ? 'Suspend merchant dari konsol SA' : 'Suspend merchant dari panel CS'),
    target: (p, s) => s.admin.merchants.find((m) => m.id === p.id)?.name ?? p.id,
    actor: (p) => (p.by === 'sa' ? 'sa' : 'cs'),
  },
  'admin/reinstateMerchant': {
    kind: 'merchant',
    action: 'Aktifkan kembali merchant',
    target: (p, s) => s.admin.merchants.find((m) => m.id === p.id)?.name ?? p.id,
    actor: 'sa',
  },
  'admin/blacklistCod': {
    kind: 'merchant',
    action: 'Blacklist COD merchant + tandai riskFlag customer',
    target: (p, s) =>
      `${s.admin.merchants.find((m) => m.id === p.id)?.name ?? p.id} · ${
        findCustomer(p.customerId)?.name ?? p.customerId
      }`,
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
  'admin/decideAppeal': {
    kind: 'dispute',
    actor: 'sa',
    action: (p) => (p.verdict === 'upheld' ? 'Perkuat putusan CS (banding)' : 'Ubah putusan CS (banding)'),
    target: (p, s) => s.admin.disputes.find((d) => d.id === p.id)?.orderCode ?? p.id,
  },
}

const auditBridge: Middleware = (api) => (next) => (action) => {
  const result = next(action)
  const rule = CS_AUDIT_RULES[(action as { type?: string }).type ?? '']
  if (rule) {
    const payload = (action as { payload?: any }).payload ?? {}
    // Aktor dibaca dari operator yang sedang bertugas, bukan konstanta: aksi CS
    // tidak boleh semuanya tercatat atas nama satu orang. Id-nya ikut dicatat —
    // nama bisa berubah, dan baris audit harus bisa ditautkan ke akun pelakunya.
    const state = api.getState() as RootState
    const isSa = (typeof rule.actor === 'function' ? rule.actor(payload) : rule.actor) === 'sa'
    const actorId = isSa ? state.superAdmin.activeOperatorId : state.superAdmin.csActorId
    const operatorName = (id: string, fallback: string) =>
      state.superAdmin.operators.find((operator) => operator.id === id)?.name ?? fallback
    api.dispatch(
      logAudit({
        actor: operatorName(actorId, isSa ? SA_CURRENT_ACTOR.name : CS_CURRENT_ACTOR.name),
        actorId,
        role: isSa ? 'sa' : 'cs',
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
