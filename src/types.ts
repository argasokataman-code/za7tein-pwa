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

/**
 * Zona pengantaran PRD v2 (`C-13`, flow F20) — dua kawasan Irbid: **Hijazi**
 * (pemukiman barat) & **Syimali** (utara kampus), masing-masing ≤2 km Haversine
 * dari dapur merchant. Pita radius A/B/C 600 m/1,5 km/2 km adalah model PRD
 * lama (`radius-mvp-legacy`) dan bukan ketentuan aktif.
 */
export type ZoneId = 'hijazi' | 'syimali'

export interface DeliveryZone {
  id: ZoneId
  label: string
  /** Arah kawasan, dipakai sebagai keterangan di layar. */
  area: string
}

/**
 * Konfigurasi pengantaran merchant (F20/F16) — di produksi dihitung server,
 * di repo ini hanya tampilan mock (AGENTS.md §1). Ongkir **100% milik merchant,
 * 0% fee platform** (`C-07`).
 */
export interface MerchantDeliveryConfig {
  mode: 'radius' | 'area'
  maxKm: number
  isActiveHijazi: boolean
  isActiveSyimali: boolean
  /** Ongkir yang dibayar customer, diteruskan utuh ke merchant. */
  ongkirIdr: number
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
  /** jarak geodesik ke toko, dasar penentuan coverage */
  distanceMeters: number
  /**
   * Zona hasil validasi server (poligon Hijazi/Syimali + ≤2 km + merchant
   * mengaktifkan zona itu). `null` = di luar coverage. Dihitung di luar repo,
   * layar hanya menampilkan nilainya (flow F20).
   */
  zone: ZoneId | null
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

/**
 * Subscription Web Push (R-PUSH-01, M8). Bentuknya mengikuti kontrak BE
 * (`endpoint`, `keys`, `platform`, `expiresAt`); di repo ini registrasinya mock —
 * tidak ada service worker push yang mengirim (AGENTS §1).
 *
 * Namanya diberi akhiran `Record` supaya tidak bentrok dengan `PushSubscription`
 * milik DOM — kalau namanya sama, TypeScript diam-diam memakai tipe global dan
 * errornya baru muncul jauh dari penyebabnya.
 */
export interface PushSubscriptionRecord {
  endpoint: string
  keys: { p256dh: string; auth: string }
  platform: string
  /** ISO — kapan subscription perlu diperbarui. */
  expiresAt: string
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
  deliveryConfig: MerchantDeliveryConfig
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
  /** Banding ke Super Admin setelah putusan level-1 CS (keputusan PO 2026-09-23). */
  appeal?: DisputeAppeal
}

/** Putusan banding: putusan CS diperkuat, atau diubah SA. */
export type AppealVerdict = 'upheld' | 'overturned'

/** Banding sengketa — jalur SA meninjau putusan level-1 CS. */
export interface DisputeAppeal {
  requestedAt: string
  requestedBy: 'customer' | 'merchant'
  note: string
  verdict?: AppealVerdict
  decidedAt?: string
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

/** Tier rebate bulanan (R-INCENTIVE-01, F9). */
export type RebateTier = 'tier_1' | 'tier_2' | 'tier_3'

/** Event modal/rebate merchant — sama dengan kontrak BE (M10). */
export type MerchantCreditEventName =
  | 'merchant_credit_granted'
  | 'merchant_credit_debited'
  | 'rebate_tier_reached'
  | 'rebate_paid'

/** Entry modal/rebate — append-only, alasan sama dengan ledger (M9). */
export interface MerchantCreditEvent {
  id: string
  event: MerchantCreditEventName
  /** JOD — nominal yang dipotong dari modal atau cashback yang dibayar. */
  amountJod: number
  at: string
}

/**
 * State insentif merchant (M10). Semua nominal JOD karena kontraknya JOD
 * (`merchant_credit_balance`, `rebate_amount_jod`); padanan IDR dihitung di
 * layer tampilan seperti aturan R-CURR-01.
 */
export interface MerchantCreditState {
  /** Sisa modal awal 5 JOD — non-tunai & non-withdrawal (I-3 belum final). */
  merchantCreditBalance: number
  /** `YYYY-MM` periode tier berjalan. */
  rebatePeriod: string
  /** Order settled pada periode ini — dasar ambang tier. */
  settledThisPeriod: number
  rebateTier: RebateTier | null
  rebateAmountJod: number
  /** null = tier sudah tercapai tapi cashback belum dibayar. */
  rebatePaidAt: string | null
  /** Dompet deposit merchant; cashback masuk ke sini, bukan ke modal. */
  depositBalanceJod: number
  /** Riwayat event modal & cashback, append-only. */
  events: MerchantCreditEvent[]
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

// ── Konsol Super Admin (role terpisah, website penuh non-PWA) ───────────────
// Cakupan dari keputusan PO 2026-09-23 (`decision-irbid-mvp.md`). Repo ini
// front-end saja: semua angka di bawah adalah mock yang ditampilkan.

/**
 * Poligon zona master, digambar di kanvas skematik (0..100), bukan peta
 * geografis: repo ini tidak memakai tile eksternal (AGENTS.md §6), dan
 * poligon sebenarnya ditentukan server. Layar SA hanya menampilkan & menggeser
 * titik, lalu menyimpan — geometri aslinya milik backend.
 */
export interface ZoneGeometry {
  id: ZoneId
  label: string
  note: string
  vertices: { x: number; y: number }[]
}

/** Satu izin yang bisa diberikan ke role. `group` hanya untuk pengelompokan UI. */
export interface SaPermission {
  id: string
  label: string
  group: 'platform' | 'operasi'
}

/**
 * Role operator. `scope: 'sa'` = konsol ini; `scope: 'cs'` = panel CS
 * (`/admin/*`). Akun CS dibuat SA (OQ-30, PO 2026-09-23), bukan self-service.
 */
export interface SaRole {
  id: string
  name: string
  scope: 'sa' | 'cs'
  permissionIds: string[]
  /** Role pemilik platform: izinnya tidak bisa dicabut dari UI. */
  locked: boolean
}

/** Operator (akun) yang dibuat SA; role menentukan izinnya. */
export interface SaOperator {
  id: string
  name: string
  contact: string
  roleId: string
  createdAt: string
  status: 'active' | 'invited' | 'suspended'
}

/** Jenis aksi yang tercatat di audit trail — dipakai filter di layar. */
export type AuditKind =
  | 'onboarding'
  | 'dispute'
  | 'merchant'
  | 'zone'
  | 'role'
  | 'operator'
  | 'tax'
  | 'profit'
  | 'switch'
  | 'escalate'

/** Entry audit trail; append-only, satu baris per aksi SA maupun CS. */
export interface AuditEntry {
  id: string
  at: string
  actor: string
  actorRole: 'sa' | 'cs'
  kind: AuditKind
  /** Kalimat aksi yang sudah siap tampil, mis. "Setujui deposit tenant". */
  action: string
  /** Objek yang kena aksi, mis. order code atau nama merchant. */
  target: string
}

/**
 * Laporan pajak aplikasi per periode (PO 2026-09-23). Dua objek berbeda:
 * GST makanan ditanggung merchant atas penjualan (info-only), sedangkan PPh
 * final 0,5% atas fee platform adalah beban platform.
 */
export interface TaxReportRow {
  period: string
  orders: number
  /** Penjualan bruto merchant, IDR. */
  salesIdr: number
  /** Fee platform terkumpul (0,37 JOD/order), JOD. */
  feeGrossJod: number
  /** GST atas objek fee platform (16%), JOD — belum dipungut (OQ-17). */
  gstOnFeeJod: number
  /** PPh final 0,5% atas fee platform, JOD. */
  pphFinalJod: number
}

/** Penarikan saldo keuntungan platform. Hanya dana ini yang boleh ditarik SA. */
export interface ProfitWithdrawal {
  id: string
  at: string
  amountJod: number
  method: string
  status: 'settled' | 'processing'
}

/** Saldo keuntungan platform: fee terkumpul dikurangi biaya, pajak, penarikan. */
export interface ProfitState {
  feeGrossJod: number
  costJod: number
  pphFinalJod: number
  withdrawals: ProfitWithdrawal[]
}

/**
 * Kill switch platform. `true` = jalur normal hidup; `false` = jalur
 * dihentikan. Maintenance memblokir seluruh order baru.
 */
export interface PlatformSwitches {
  cod: boolean
  payout: boolean
  maintenance: boolean
}
