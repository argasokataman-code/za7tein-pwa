/**
 * Profil customer: identitas, alamat pengantaran, dan registrasi push.
 *
 * Backend yang tersedia hari ini: `users` (email/phone saja — tanpa nama/
 * avatar), `addresses` (CRUD lengkap), `push_subscriptions` (endpoint + keys).
 * Semua tulis bersifat best-effort seperti `orders`: kalau RLS/API menolak,
 * pemanggil menangkapnya dan state lokal tetap jalan (mock-first).
 */
import { resolveCoverage } from '../data/zones'
import type { Address, ZoneId } from '../types'
import { refToken } from './reference'
import { authUpdateUser, authUser, createWith, createWithReturn, deleteWith, patch, restWith, rpc, signInToken } from './supabase'

/** User demo customer di backend (sama dengan `reference.ts`). */
const DEMO_CUSTOMER_USER_ID = 1
/** Merchant demo — coverage alamat dihitung relatif ke tokonya (`resolve_coverage`). */
const DEMO_MERCHANT_ID = 1
const DEMO_CUSTOMER_EMAIL =
  (import.meta.env.VITE_DEMO_CUSTOMER_EMAIL as string | undefined) || 'customer@sa7tein.app'
const DEMO_CUSTOMER_PASSWORD =
  (import.meta.env.VITE_DEMO_CUSTOMER_PASSWORD as string | undefined) || 'demo1234'

/** Sesi auth milik customer demo — metadata akun (nama/avatar) hanya lewat sini. */
let customerSession: Promise<string> | null = null
function customerToken(): Promise<string> {
  if (!customerSession) customerSession = signInToken(DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD)
  return customerSession
}

/** Zona master (bentuk argumen `resolveCoverage`) untuk hitung zona + jarak. */
type Zones = Parameters<typeof resolveCoverage>[1]

interface UserRow {
  email: string | null
  phone: string | null
}

export interface AddressRow {
  id: number
  name: string | null
  label: string | null
  building: string | null
  floor: string | null
  unit: string | null
  notes: string | null
  address: string | null
  city: string | null
  full_address: string | null
  latitude: number | null
  longitude: number | null
  is_default: boolean | null
}

export interface PushRow {
  id: number
  endpoint: string
  p256dh: string
  auth: string
  created_at?: string
}

/** Identitas login customer (email + nomor HP). Nama/avatar belum ada di BE. */
export async function fetchCustomerUser(
  userId = DEMO_CUSTOMER_USER_ID,
): Promise<{ email: string; phone: string } | undefined> {
  const token = await refToken()
  const rows = await restWith<UserRow>(token, 'users', `?select=email,phone&id=eq.${userId}&limit=1`)
  const row = rows[0]
  if (!row) return undefined
  return { email: row.email ?? '', phone: row.phone ?? '' }
}

/** Akun auth customer (metadata): nama + avatar. Sumber nama, karena tabel `users` tak punya kolomnya. */
export interface CustomerAccount {
  name: string
  avatar: string
}

interface AuthAccount {
  email?: string
  user_metadata?: { name?: string; avatar?: string }
}

export async function fetchCustomerAccount(): Promise<CustomerAccount | undefined> {
  const token = await customerToken()
  const user = await authUser<AuthAccount>(token)
  const meta = user.user_metadata ?? {}
  return { name: meta.name ?? '', avatar: meta.avatar ?? '' }
}

/** Simpan nama / avatar ke `user_metadata` akun auth customer. */
export async function updateCustomerAccount(input: {
  name?: string
  avatar?: string
}): Promise<void> {
  const token = await customerToken()
  await authUpdateUser(token, input)
}

/** Semua alamat customer, alamat utama lebih dulu. */
export async function fetchCustomerAddresses(
  userId = DEMO_CUSTOMER_USER_ID,
): Promise<AddressRow[]> {
  const token = await refToken()
  return restWith<AddressRow>(
    token,
    'addresses',
    `?select=*&user_id=eq.${userId}&order=is_default.desc,id.asc`,
  )
}

/** Bentuk tulis alamat (subset kolom `addresses`, tanpa `user_id`). */
export interface AddressInput {
  name: string
  building: string
  floor: string
  unit: string
  notes: string
  address: string
  city: string
  fullAddress: string
  lat: number
  lng: number
  isDefault: boolean
}

function rowBody(a: AddressInput): Record<string, unknown> {
  return {
    name: a.name,
    building: a.building,
    floor: a.floor,
    unit: a.unit,
    notes: a.notes,
    address: a.address,
    city: a.city,
    full_address: a.fullAddress,
    latitude: a.lat,
    longitude: a.lng,
    is_default: a.isDefault,
  }
}

export async function createCustomerAddress(
  input: AddressInput,
  userId = DEMO_CUSTOMER_USER_ID,
): Promise<void> {
  const token = await refToken()
  await createWith(token, 'addresses', { user_id: userId, ...rowBody(input) })
}

export async function updateCustomerAddress(id: string, input: AddressInput): Promise<void> {
  if (!/^\d+$/.test(id)) return // id lokal (belum tersinkron) → lewati
  const token = await refToken()
  await patch(token, 'addresses', `?id=eq.${id}`, rowBody(input))
}

/** `is_default` ditulis terpisah supaya hanya satu alamat utama. */
export async function setDefaultCustomerAddress(
  id: string,
  userId = DEMO_CUSTOMER_USER_ID,
): Promise<void> {
  if (!/^\d+$/.test(id)) return
  const token = await refToken()
  await patch(token, 'addresses', `?user_id=eq.${userId}`, { is_default: false })
  await patch(token, 'addresses', `?id=eq.${id}`, { is_default: true })
}

export async function deleteCustomerAddress(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) return
  const token = await refToken()
  await deleteWith(token, 'addresses', `?id=eq.${id}`)
}

/**
 * `users.id` numerik pemilik token — `auth.uid()` (uuid) → `users.auth_user_id`.
 * Baris `push_subscriptions` harus milik user yang menandatangani (RLS
 * `push_owner`: `user_id = app_uid()`), jadi id ini yang dipakai saat menulis.
 */
export async function resolveUserId(token: string): Promise<number | null> {
  const me = await authUser<{ id?: string }>(token)
  if (!me?.id) return null
  const rows = await restWith<{ id: number }>(
    token,
    'users',
    `?select=id&auth_user_id=eq.${me.id}&limit=1`,
  )
  return rows[0]?.id ?? null
}

/** Sesi pemilik baris push: token customer demo + `users.id` (dari token, bukan hardcode). */
async function pushOwner(): Promise<{ token: string; userId: number }> {
  const token = await customerToken()
  const userId = (await resolveUserId(token)) ?? DEMO_CUSTOMER_USER_ID
  return { token, userId }
}

/** Registrasi push perangkat (endpoint + kunci), baris terbaru dulu. */
export async function fetchPushSubscription(): Promise<PushRow | undefined> {
  const { token, userId } = await pushOwner()
  const rows = await restWith<PushRow>(
    token,
    'push_subscriptions',
    `?select=id,endpoint,p256dh,auth,created_at&user_id=eq.${userId}&order=id.desc&limit=1`,
  )
  return rows[0]
}

/** Simpan registrasi push → mengembalikan baris (beserta `id`) untuk dihapus nanti. */
export async function savePushSubscription(
  endpoint: string,
  p256dh: string,
  auth: string,
): Promise<PushRow | undefined> {
  const { token, userId } = await pushOwner()
  const rows = await createWithReturn<PushRow>(token, 'push_subscriptions', {
    user_id: userId,
    endpoint,
    p256dh,
    auth,
  }, 'id,endpoint,p256dh,auth,created_at')
  return rows[0]
}

export async function deletePushSubscription(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) return
  const { token } = await pushOwner()
  await deleteWith(token, 'push_subscriptions', `?id=eq.${id}`)
}

/** Coverage alamat: zona server + jarak, plus flag `covered` dari RPC. */
export interface AddressCoverage {
  zone: ZoneId | null
  distanceMeters: number
  /** Lolos poligon zona **dan** ≤ radius **dan** zona diaktifkan merchant. */
  covered: boolean
}

/**
 * Coverage otoritatif dari server (RPC `resolve_coverage`): poligon zona +
 * jarak ≤ radius + toggle zona aktif merchant. Ini keputusan "alamat bisa
 * diantar" yang sebenarnya; `resolveCoverage()` di klien cuma poligon global
 * tanpa radius/toggle, jadi dipakai hanya saat offline atau sebagai fallback.
 */
export async function resolveAddressCoverage(
  lat: number,
  lng: number,
  merchantId = DEMO_MERCHANT_ID,
): Promise<AddressCoverage> {
  const token = await refToken()
  const res = await rpc<{ covered: boolean; zone: string | null; distanceMeters: number | null }>(
    token,
    'resolve_coverage',
    { p_lat: lat, p_lng: lng, p_merchant_id: merchantId },
  )
  return {
    covered: Boolean(res.covered),
    zone: res.covered && res.zone ? (res.zone.toLowerCase() as ZoneId) : null,
    distanceMeters: res.distanceMeters ?? 0,
  }
}

/**
 * Baris `addresses` → `Address` domain. Zona + jarak idealnya dari server
 * (`coverage`, hasil `resolveAddressCoverage`); kalau tidak diberi, jatuh ke
 * hitung poligon master di klien (mock/offline).
 */
export function toAddress(
  row: AddressRow,
  zones: Zones,
  kitchen?: { lat: number; lng: number },
  coverage?: AddressCoverage,
): Address {
  const lat = row.latitude ?? 0
  const lng = row.longitude ?? 0
  const resolved = coverage ?? resolveCoverage({ lat, lng }, zones, kitchen)
  return {
    id: String(row.id),
    name: row.name ?? row.label ?? 'Alamat',
    isDefault: Boolean(row.is_default),
    building: row.building ?? '',
    floor: row.floor ?? '',
    unit: row.unit ?? '',
    notes: row.notes ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    fullAddress: row.full_address ?? '',
    lat,
    lng,
    distanceMeters: resolved.distanceMeters,
    zone: resolved.zone as ZoneId | null,
  }
}

/** Titik dapur merchant live (dipakai menghitung jarak alamat → toko). */
export async function fetchMerchantLocation(
  merchantId = 1,
): Promise<{ lat: number; lng: number } | undefined> {
  const token = await refToken()
  const rows = await restWith<{ latitude: number | null; longitude: number | null }>(
    token,
    'merchants',
    `?select=latitude,longitude&id=eq.${merchantId}&limit=1`,
  )
  const row = rows[0]
  if (!row || row.latitude == null || row.longitude == null) return undefined
  return { lat: row.latitude, lng: row.longitude }
}

/** Perbarui email / nomor HP di baris `users`. Nama & avatar belum ada kolomnya. */
export async function updateCustomerContact(
  input: { email?: string; phone?: string },
  userId = DEMO_CUSTOMER_USER_ID,
): Promise<void> {
  const token = await refToken()
  await patch(token, 'users', `?id=eq.${userId}`, input)
}

/** `Address` domain → bentuk tulis `addresses`. */
export function addressInput(a: Address): AddressInput {
  return {
    name: a.name,
    building: a.building,
    floor: a.floor,
    unit: a.unit,
    notes: a.notes,
    address: a.address,
    city: a.city,
    fullAddress: a.fullAddress,
    lat: a.lat,
    lng: a.lng,
    isDefault: a.isDefault,
  }
}
