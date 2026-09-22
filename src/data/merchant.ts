import type { Courier, DeliveryZone, Merchant, OrderStage, PaymentMethod } from '../types'

export const MAX_DELIVERY_METERS = 2000

/**
 * Fee platform flat (PRD v2 "Fee Platform", update PO 2026-09-21):
 * merchant 0,15 + customer 0,22 = 0,37 JOD per order. Berlaku **semua** metode,
 * termasuk COD cash & transfer manual (PO 2026-09-22, OQ-25). Angka JOD =
 * nominal tampilan; settlement tetap IDR (R-CURR-01).
 */
export const PLATFORM_FEE_MERCHANT_JOD = 0.15
export const PLATFORM_FEE_CUSTOMER_JOD = 0.22
export const PLATFORM_FEE_JOD = PLATFORM_FEE_MERCHANT_JOD + PLATFORM_FEE_CUSTOMER_JOD

/** Akun baru wajib top-up minimal 3,5 JOD (Rp80.500) sebelum bisa order (R-TOPUP-01). */
export const MIN_TOPUP_NEW_ACCOUNT_JOD = 3.5

/** Zona pengantaran — tarif naik seiring radius (PRD bab 04). */
export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'A', label: 'Zona A', range: '< 600 m', fee: 5000 },
  { id: 'B', label: 'Zona B', range: '600 m – 1,5 km', fee: 9000 },
  { id: 'C', label: 'Zona C', range: '1,5 km – 2 km', fee: 13000 },
]

/** PRD: tanpa payment gateway — hanya COD dan transfer manual. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cod',
    label: 'COD — Bayar di Tempat',
    description: 'Bayar tunai ke kurir toko saat pesanan tiba.',
  },
  {
    id: 'transfer',
    label: 'Transfer Manual',
    description: 'Transfer ke rekening toko, lalu unggah bukti transfer.',
  },
]

/** Merchant contoh, sama dengan mockup merchant. */
export const mockMerchant: Merchant = {
  id: '1',
  name: 'Warung Sate Pak Ali',
  lat: -6.26,
  lng: 106.78,
  tier: 'free',
  todayOrderCount: 7,
  dailyLimit: 10,
  isActive: true,
  openTime: '07:00',
  closeTime: '22:00',
  bank: { name: 'BCA', account: '8830 1122 3344', holder: 'Ali Santoso' },
}

/**
 * Pin bawaan untuk alamat yang baru ditambahkan, sebelum pengguna menggeser
 * pin di peta. Sengaja di dalam Zona A (540 m < 600 m) supaya alamat baru
 * selalu bisa diantar; kalau angkanya diubah, jaraknya harus ikut dijaga agar
 * tetap satu zona dengan distanceMeters.
 */
export const DEFAULT_NEW_ADDRESS_PIN = {
  lat: -6.2575,
  lng: 106.7812,
  distanceMeters: 540,
} as const

/** Kurir toko bersifat eksklusif milik satu merchant (PRD bab 04). */
export const mockCouriers: Courier[] = [
  { id: '1', merchantId: '1', name: 'Budi Santoso', phone: '+6281234567890', status: 'at_store', activeOrderCount: 0 },
  { id: '2', merchantId: '1', name: 'Andi Pratama', phone: '+6281298765432', status: 'delivering', activeOrderCount: 2 },
  { id: '3', merchantId: '1', name: 'Rizal', phone: '+6281355566677', status: 'offline', activeOrderCount: 0 },
]

export const MAX_COURIERS_PER_MERCHANT = 3

/** Urutan tahap perjalanan; satu sumber untuk Journey Line dan label status. */
export const ORDER_STAGES: { id: OrderStage; label: string }[] = [
  { id: 'diterima', label: 'Diterima' },
  { id: 'dimasak', label: 'Dimasak' },
  { id: 'diantar', label: 'Diantar' },
  { id: 'tiba', label: 'Tiba' },
]

/** Pesanan contoh — nomor, jam, dan estimasi dari PRD. */
export const mockOrder = {
  code: 'S7-772292',
  placedAt: '12:27',
  readyEstimate: '12:47',
  arriveEstimate: '13:05',
  courierRating: 4.7,
} as const

// Formatter uang tinggal di `data/currency.ts` (IDR + padanan JOD, R-CURR-01).
// Diekspor ulang di sini supaya pemakai lama tidak perlu ganti jalur impor.
export { money, moneyPlain } from './currency'

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`
}

/** Zona untuk sebuah jarak, atau null kalau di luar jangkauan kurir toko. */
export function zoneFor(meters: number): DeliveryZone | null {
  if (meters > MAX_DELIVERY_METERS) return null
  if (meters < 600) return DELIVERY_ZONES[0]
  if (meters <= 1500) return DELIVERY_ZONES[1]
  return DELIVERY_ZONES[2]
}

/** Jarak geodesik dua koordinat, dipakai memvalidasi pin peta. */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}

/** Ongkir hanya masuk kas merchant kalau alamatnya masih dalam zona. */
export function deliveryFeeFor(meters: number): number {
  return zoneFor(meters)?.fee ?? 0
}

export function isDeliverable(meters: number): boolean {
  return meters <= MAX_DELIVERY_METERS
}
