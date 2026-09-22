import type {
  Courier,
  DeliveryZone,
  HoldEventName,
  HoldStatus,
  Merchant,
  OrderStage,
  PaymentMethod,
} from '../types'

import { jodToIdr } from './currency'

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

/**
 * Padanan IDR dari konstanta yang PRD tetapkan dalam JOD. State dan perhitungan
 * tetap IDR; angka JOD di atas hanya nominal kontrak.
 */
export const PLATFORM_FEE_MERCHANT_IDR = jodToIdr(PLATFORM_FEE_MERCHANT_JOD)
export const PLATFORM_FEE_CUSTOMER_IDR = jodToIdr(PLATFORM_FEE_CUSTOMER_JOD)
export const MIN_TOPUP_NEW_ACCOUNT_IDR = jodToIdr(MIN_TOPUP_NEW_ACCOUNT_JOD)

/* ── Pajak (R-TAX-01, F4) ────────────────────────────────────────────────────
 * Dua lapis: GST makanan (merchant yang menyetor, objek = penjualan) dan GST
 * atas fee platform (kewajiban platform, objek = fee 0,37 JOD per order).
 *
 * Tarif 16% ada di acceptance M7, TAPI statusnya belum final: OQ-2/3/4 (tarif
 * GST makanan, PPN ekspor jasa, status PKP) dan OQ-17/18 masih terbuka. Karena
 * itu angkanya dipakai untuk tampilan dengan tanda "belum final" — jangan
 * diklaim sebagai tarif final dan jangan dipakai menghitung setoran.
 */
export const GST_FOOD_PERCENT = 16
export const PLATFORM_GST_PERCENT = 16

/** Nilai GST makanan untuk sebuah subtotal (info-only, tidak masuk total bayar). */
export function gstFoodIdr(subtotalIdr: number): number {
  return Math.round((subtotalIdr * GST_FOOD_PERCENT) / 100)
}

/** GST atas objek fee platform 0,37 JOD (info-only, tak masuk total bayar). */
export function platformGstIdr(): number {
  return Math.round((jodToIdr(PLATFORM_FEE_JOD) * PLATFORM_GST_PERCENT) / 100)
}

/**
 * Gate saldo awal (R-TOPUP-01, guard flow F3): akun wajib punya minimal 3,5 JOD
 * sebelum bisa order — berlaku **semua metode**, bukan cuma bayar pakai saldo.
 * Saldo tepat di ambang dinyatakan lolos (`>=`).
 */
export function needsTopUpGate(availableIdr: number): boolean {
  return availableIdr < MIN_TOPUP_NEW_ACCOUNT_IDR
}

/** Zona pengantaran — tarif naik seiring radius (PRD bab 04). */
export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'A', label: 'Zona A', range: '< 600 m', fee: 5000 },
  { id: 'B', label: 'Zona B', range: '600 m – 1,5 km', fee: 9000 },
  { id: 'C', label: 'Zona C', range: '1,5 km – 2 km', fee: 13000 },
]

/** Metode bayar PRD v2 — saldo wallet dulu; COD & transfer legacy tetap ada (OQ-25). */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'wallet',
    label: 'Saldo Sa7tein',
    description: 'Bayar dari saldo wallet Sa7tein — top-up lewat Xendit (VA/QRIS).',
  },
  {
    id: 'cod',
    label: 'COD — Bayar di Tempat',
    description: 'Saldo dipotong (hold) saat kurir match, settle setelah OTP.',
  },
  {
    id: 'transfer',
    label: 'Transfer Manual (legacy)',
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
  /**
   * Kode satu-satunya order demo yang berjalan. Merchant (`merchantOrders`),
   * kurir (`courierTasks` ct-1), dan baris ledger panel CS memakai kode yang
   * sama supaya M11 bisa memeriksa order yang sama di empat role — bukan empat
   * pesanan berbeda dengan kode berbeda.
   */
  code: 'SA-1041',
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

/**
 * Copy per status hold (F2). `action` = tombol aksi mock yang sah dari status
 * itu, `cancel` = tombol batal, `note` = keterangan di detail order. Status
 * akhir tidak punya aksi lanjutan — di situlah lifecycle berhenti.
 */
export const HOLD_STATUS_COPY: Record<
  HoldStatus,
  { label: string; note: string; action?: string; cancel?: string }
> = {
  none: {
    label: 'Belum ada hold',
    note: 'Hold dibuat saat pesanan COD dibuat.',
    action: 'Buat pesanan',
  },
  held: {
    label: 'Held',
    note: 'Saldo ditahan sejak pesanan dibuat, belum masuk ke merchant.',
    action: 'Kurir match',
    cancel: 'Batal (sebelum match)',
  },
  cut: {
    label: 'Cut',
    note: 'Kurir sudah match; potongan dikunci sampai OTP.',
    action: 'OTP sukses',
    cancel: 'Batal (sesudah match)',
  },
  settled: {
    label: 'Settled',
    note: 'OTP terverifikasi — dana diteruskan ke merchant.',
  },
  released: {
    label: 'Released',
    note: 'Batal sebelum match. Saldo kembali tanpa potongan.',
  },
  reversed: {
    label: 'Reversed',
    note: 'Batal sesudah match. Potongan dikembalikan lewat entry reversal.',
  },
}

/** Label ledger per event hold — tiap transisi = satu entry append-only. */
export const HOLD_EVENT_LABEL: Record<HoldEventName, string> = {
  hold_created: 'hold_created — saldo masuk hold',
  hold_cut: 'hold_cut — potongan dikunci saat kurir match',
  hold_settled: 'hold_settled — dana diteruskan ke merchant',
  hold_released: 'hold_released — hold dilepas (batal sebelum match)',
  hold_reversed: 'hold_reversed — reversal potongan (batal sesudah match)',
}
