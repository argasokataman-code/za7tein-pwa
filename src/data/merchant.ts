import type { Courier, DeliveryZone, Merchant, PaymentMethod } from '../types'

export const MAX_DELIVERY_METERS = 2000

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

/** Kurir toko bersifat eksklusif milik satu merchant (PRD bab 04). */
export const mockCouriers: Courier[] = [
  { id: '1', merchantId: '1', name: 'Budi Santoso', status: 'at_store', activeOrderCount: 0 },
  { id: '2', merchantId: '1', name: 'Andi Pratama', status: 'delivering', activeOrderCount: 2 },
  { id: '3', merchantId: '1', name: 'Rizal', status: 'offline', activeOrderCount: 0 },
]

export const MAX_COURIERS_PER_MERCHANT = 3

/** Semua jarak memakai format rupiah tanpa desimal, tabular-friendly. */
export function rupiah(value: number): string {
  return 'Rp' + Math.round(value).toLocaleString('id-ID')
}

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
