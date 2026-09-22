import type { LucideIcon } from 'lucide-react'

// Domain model for the Sa7tein marketplace (PRD v1.1).
// Fields are additive over the original Sa7tein shapes so the ported screens
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

/**
 * Ulasan dari sudut pandang merchant — terikat ke satu hidangan katalog
 * supaya pemilik toko tahu menu mana yang dikomentari. Di luar PRD aktif:
 * FR-MC tidak menyebut ulasan/respons; ditandai UNRESOLVED di
 * docs/product/prd/milestones-irbid-mvp.md.
 */
export interface MerchantReview {
  id: string
  customerName: string
  avatar: string
  rating: number
  text: string
  /** id MenuItem di katalog, mis. 'mm-1' */
  foodId: string
  foodName: string
  createdAt: string
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

/** Metode bayar PRD v2: `wallet` (top-up Xendit) + channel VA/QRIS. `cod` & `transfer` legacy. */
export type PaymentMethodId = 'cod' | 'transfer' | 'wallet' | 'xendit_va' | 'xendit_qris'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  description: string
}

/** Status transaksi uang (top-up, payout) — R-WALLET-01. */
export type WalletTxStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** Channel top-up Xendit (PRD §2 Xendit). */
export type TopUpChannel = 'xendit_va' | 'xendit_qris'

/**
 * Saldo satu wallet. `pending` = dana hold order berjalan, `available` = sisa yang
 * bisa dipakai. Semua nominal **IDR** — source of truth; JOD hanya tampilan
 * (R-CURR-01), jadi jangan simpan nominal JOD di sini.
 */
export interface Wallet {
  balance: number
  available: number
  pending: number
}

export interface TopUp {
  id: string
  amount: number
  channel: TopUpChannel
  status: WalletTxStatus
  createdAt: string
}

export interface Payout {
  id: string
  amount: number
  status: WalletTxStatus
  createdAt: string
}

/** Satu baris tabel `exchange_rates` — rate IDR→JOD, display-only (R-CURR-01). */
export interface ExchangeRate {
  base: string
  quote: string
  rate: number
  fetchedAt: string
  source: string
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
  buyerAvatar: string
  buyerRating: number
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

/**
 * Checkpoint pengantaran dari sisi kurir. Sumbu ini cermin urutan flow F13
 * (`docs/design/flows/f13-courier-view/`) — masuk → ambil → berangkat → tiba →
 * (OTP) → selesai, plus cabang `batal` saat customer lalai. Berbeda dari
 * `OrderStage` (sumbu customer/merchant): kurir menekan aksi, customer melihat
 * tahap. Layar detail menampilkan keduanya berdampingan.
 *
 * Catatan: node `otp` di flow bukan state tersimpan — ia langkah di dalam
 * state `tiba` (sudah tiba, menunggu kode customer). Karena itu nilai di sini
 * berhenti di `tiba`, dan stepper menampilkan `otp` sebagai langkah kelima.
 */
export type CourierCheckpoint =
  | 'masuk'
  | 'ambil'
  | 'berangkat'
  | 'tiba'
  | 'selesai'
  | 'batal'

/** Satu tugas pengantaran milik kurir toko (PRD M4/M5). */
export interface CourierTask {
  id: string
  code: string
  customerName: string
  /** Nomor customer, dipakai tombol "Hubungi customer" saat guard customer lalai. */
  customerPhone: string
  /** Jalan / kawasan alamat tujuan. */
  address: string
  /** Lantai & unit wajib — pin GPS saja tidak cukup untuk kurir (PRD bab 04). */
  floor: string
  unit: string
  items: CartItem[]
  total: number
  distanceMeters: number
  zone: ZoneId
  paymentMethod: PaymentMethod['id']
  /** Tips customer. Kurir karyawan merchant: hanya tips yang jadi miliknya (C-06). */
  tip: number
  /** Tahap order dari sisi customer/merchant, dipakai Journey Line. */
  orderStage: OrderStage
  checkpoint: CourierCheckpoint
  /** Waktu mulai jeda checkpoint ini — dasar hitung mundur SLA. */
  checkpointStartedAt?: string
  /** Kode OTP 4 digit dari customer. Tanpa OTP kurir tidak bisa settle (C-09). */
  otp: string
  otpVerified?: boolean
}

/**
 * Status tenant merchant. `pending` menunggu approval tim CS; `blacklisted`
 * lahir dari aksi blacklist COD dan wajib dibarengi `riskFlag` customer (F15).
 */
export type TenantStatus = 'pending' | 'approved' | 'suspended' | 'blacklisted'

/** Deposit COD merchant (3,50 JOD, PRD §5C). Approve = verifikasi transfer dulu. */
export type DepositStatus = 'unpaid' | 'held' | 'released'

/** Antrean onboarding tenant di panel admin (CS) — feeder F16. */
export interface AdminTenant {
  id: string
  name: string
  owner: string
  city: string
  submittedAt: string
  /** Jumlah foto tempat usaha yang diunggah merchant saat onboarding. */
  photoCount: number
  /** Konfigurasi pengantaran yang diajukan merchant. */
  deliveryConfig: { maxKm: number; zones: string }
  deposit: number
  depositStatus: DepositStatus
  tenantStatus: TenantStatus
}

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'rejected'

/** Empat resolusi F8. `no_action` = tolak, tanpa ubah saldo. */
export type DisputeResolution =
  | 'refund_full'
  | 'refund_partial'
  | 'released'
  | 'no_action'

/** Sengketa satu order. `disputed` membekukan hold sampai SA memutuskan (M6). */
export interface Dispute {
  id: string
  orderCode: string
  /** Pihak yang mengajukan; form submit ada di sisi customer dan merchant. */
  filedBy: 'customer' | 'merchant'
  /** Nama pihak pengaju. */
  party: string
  merchant: string
  category: string
  reason: string
  photoCount: number
  filedAt: string
  /** Nilai order yang disengketakan, JOD. */
  amount: number
  status: DisputeStatus
  resolution?: DisputeResolution
  /** Persentase refund sebagian saat `refund_partial` (belum final, OQ-29). */
  partialPercent?: number
}

/**
 * Status hold COD via wallet (R-COD-01, flow F2). `held` = order dibuat, saldo
 * ditahan; `cut` = kurir match; `settled` = OTP sukses, uang pindah ke merchant.
 * Dua jalur batal: `released` (sebelum match, hold dilepas) dan `reversed`
 * (sesudah match, potongan dikembalikan lewat entry reversal).
 */
export type HoldStatus = 'none' | 'held' | 'cut' | 'settled' | 'released' | 'reversed'

/** Nama event hold — sama dengan kontrak BE, satu event per transisi (M4). */
export type HoldEventName =
  | 'hold_created'
  | 'hold_cut'
  | 'hold_settled'
  | 'hold_released'
  | 'hold_reversed'

/** Entry hold append-only. Tiap transisi menambah satu; tidak ada yang diubah. */
export interface HoldEvent {
  id: string
  event: HoldEventName
  /** IDR — nominal hold saat event terjadi. */
  amountIdr: number
  at: string
}

export type LedgerEntryType =
  | 'deposit_hold'
  | 'cod_hold'
  | 'settlement'
  | 'fee'
  | 'refund'
  | 'protection_fund'

/** Entry ledger — append-only, tanpa aksi edit atau hapus dari UI (M9). */
export interface LedgerEntry {
  id: string
  at: string
  type: LedgerEntryType
  direction: 'debit' | 'credit'
  /** JOD. */
  amount: number
  ref: string
  memo: string
}

/** Kewajiban platform = saldo wallet yang belum di-payout (view agregat, M9). */
export interface LiabilitySummary {
  customerWallets: number
  merchantWallets: number
  courierTips: number
  /** Saldo Xendit mock; dipakai membandingkan dengan total liability. */
  xenditBalance: number
}

/** Merchant aktif di konsol SA, dengan aksi guard suspend/blacklist. */
export interface AdminMerchant {
  id: string
  name: string
  tenantStatus: TenantStatus
  deposit: number
  depositStatus: DepositStatus
  /** Riwayat COD bermasalah — dasar aksi blacklist (F15). */
  codIssues: number
}

/** Alert SLA breach yang naik ke SA (`batch.escalatedToAdmin: true`, feeder F21). */
export interface AdminEscalation {
  id: string
  orderCode: string
  merchant: string
  detail: string
  minutesLate: number
}
