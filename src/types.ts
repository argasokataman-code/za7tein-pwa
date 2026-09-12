import type { LucideIcon } from 'lucide-react'

// Domain model for the Sa7tein marketplace (PRD v1.1).
// Fields are additive over the original Delivo shapes so the ported screens
// keep working while the PRD flows come online.

export interface ModifierOption {
  id: string
  label: string
  extraPrice: number
}

export interface ModifierGroup {
  id: string
  name: string
  /** single = radio (mis. tingkat pedas), multi = checkbox (mis. topping) */
  type: 'single' | 'multi'
  options: ModifierOption[]
}

export interface Food {
  id: string
  name: string
  price: number
  rating: number
  reviewCount: number
  deliveryTime: string
  distance: string
  discountPercent?: number
  category: string
  image: string
  description: string
  isPopular?: boolean
  calories?: number
  modifierGroups?: ModifierGroup[]
}

export interface MenuItem extends Food {
  stock: number
  available: boolean
}

export interface Category {
  id: string
  label: string
  /**
   * Ikon Lucide, bukan emoji. Emoji dirender berbeda di tiap platform —
   * ukuran, warna, dan gayanya di luar kendali kita — sehingga tidak bisa
   * masuk sistem ikon yang strokenya seragam.
   */
  icon?: LucideIcon
}

export interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  text: string
}

/** Zona pengantaran — radius maksimal 2 km (PRD bab 04). */
export type ZoneId = 'A' | 'B' | 'C'

export interface DeliveryZone {
  id: ZoneId
  label: string
  range: string
  fee: number
}

/**
 * Alamat apartemen. PRD mewajibkan gedung, lantai, dan unit karena pin GPS
 * saja tidak cukup untuk kurir menemukan pintu.
 */
export interface Address {
  id: string
  name: string
  /** nama gedung / tower */
  building: string
  floor: string
  unit: string
  /** catatan untuk kurir, mis. "Titip lobi" */
  notes: string
  /** jalan / kawasan */
  address: string
  city: string
  fullAddress: string
  lat: number
  lng: number
  /** jarak geodesik ke toko, dasar penentuan zona */
  distanceMeters: number
}

export interface User {
  id: string
  name: string
  email: string
  /** login utama Sa7tein: nomor HP terverifikasi */
  phone: string
  phoneVerified: boolean
  dob: string
  gender: string
  avatar: string
  addresses: Address[]
}

export interface Card {
  id: string
  brand: 'visa' | 'mastercard'
  last4: string
  holder: string
  expiry: string
  image: string
}

/** PRD: hanya COD dan transfer manual — tanpa payment gateway. */
export type PaymentMethodId = 'cod' | 'transfer'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  description: string
}

export interface Merchant {
  id: string
  name: string
  lat: number
  lng: number
  tier: 'free' | 'pro'
  todayOrderCount: number
  dailyLimit: number
  isActive: boolean
  openTime: string
  closeTime: string
  bank: { name: string; account: string; holder: string }
}

export interface Courier {
  id: string
  merchantId: string
  name: string
  /** Nomor kurir, dipakai tombol "Hubungi" di halaman pelacakan. */
  phone: string
  status: 'at_store' | 'delivering' | 'offline'
  activeOrderCount: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  /** ringkasan modifier terpilih, mis. "Pedas Sedang, + Lontong" */
  modifiers?: string
}

/** Empat tahap perjalanan pesanan, dipakai Sa7tein Journey Line. */
export type OrderStage = 'diterima' | 'dimasak' | 'diantar' | 'tiba'

export type NotificationKind = 'order' | 'promo' | 'payment' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  time: string
  unread: boolean
}

/** Status order dari sudut pandang merchant. Menumpang `OrderStage` yang sudah ada. */
export type MerchantOrderStatus = 'masuk' | OrderStage | 'selesai' | 'ditolak' | 'batal'

export interface MerchantOrder {
  id: string
  code: string
  customerName: string
  address: string
  items: CartItem[]
  total: number
  distanceMeters: number
  zone: ZoneId
  status: MerchantOrderStatus
  placedAt: string
  paymentMethod: PaymentMethod['id']
  cookMinutes?: number
}
