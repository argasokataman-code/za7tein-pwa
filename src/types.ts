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
  /**
   * Estimasi waktu masak dari BE (`menus.cook_minutes`). Ditampilkan di kartu
   * menu toko menggantikan estimasi antar yang tidak dimiliki item tunggal.
   */
  cookMinutes?: number
  modifierGroups?: ModifierGroup[]
  /**
   * Toko pemilik item ini (id sama dengan `MerchantRecord.id`). Ditambahkan
   * supaya katalog bisa dikelompokkan per merchant; sebelumnya datar dan tiap
   * item diperlakukan seolah milik satu toko.
   */
  merchantId?: string
}

export interface MenuItem extends Food {
  stock: number
  available: boolean
  /**
   * Opsi catatan per menu (MER-05): pelanggan boleh menulis catatan khusus untuk
   * item ini di halaman detail. Merchant mengaturnya per item; `false` = textarea
   * catatan disembunyikan.
   */
  noteEnabled?: boolean
}

/**
 * Proyeksi merchant untuk sisi customer: cukup untuk kartu daftar toko dan
 * header halaman toko. Terpisah dari `Merchant` (profil operasional PWA
 * merchant: rekening, kuota order) dan `MerchantRecord` (registri CS/SA) —
 * customer hanya perlu identitas usaha + info jangkauan. Terhubung lewat `id`
 * yang sama dengan `MenuItem.merchantId`.
 */
export interface Storefront {
  id: string
  name: string
  /** Deskripsi singkat di bawah nama, mis. jenis masakan. */
  tagline: string
  logo: string
  cover: string
  rating: number
  reviewCount: number
  deliveryTime: string
  distance: string
  openTime: string
  closeTime: string
  isOpen: boolean
  /**
   * Tag merchant untuk pengelompokan beranda (PRD §6: grup **hanya** per tag,
   * bukan per kategori). Satu toko boleh punya beberapa tag, jadi ia muncul di
   * beberapa grup. BE mengirim daftar ini; mock repo mengisinya eksplisit.
   */
  tags?: string[]
  /**
   * Jarak terukur dalam meter, untuk sort/filter "jarak" (PRD §6). `distance`
   * tetap string tampilan ("420 m"); angka ini yang dibandingkan.
   */
  distanceMeters?: number
  /** Jumlah order selesai (30 hari) untuk sort/filter "jumlah order" (PRD §6). */
  orderCount?: number
  /**
   * Toko di luar coverage customer (PRD §6/§9.1): **tetap tampil** tapi tidak
   * bisa dipilih. Di produksi dihitung dari `MerchantCoverage`; mock di sini.
   */
  outOfCoverage?: boolean
  /**
   * Merchant memblokir kuota order (PRD §17): tokonya **disembunyikan** dari
   * daftar, bukan sekadar di-disable. Di produksi dihitung dari kuota aktif.
   */
  quotaBlocked?: boolean
}

/** Filter yang diteruskan layar Filter ke Search (satu modul memproduksi, satu membaca). */
export interface SearchFilters {
  maxPrice?: number
  categories?: string[]
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
  /**
   * Foto potongan transparan untuk chip kategori customer (keputusan pemilik
   * 2026-10-18). Berkas di `public/assets/img/categories/`, 224px (2x kotak
   * 112px). `icon` tetap dipakai konsol merchant yang butuh ikon garis.
   */
  image?: string
}

/**
 * Ulasan dari sudut pandang merchant — terikat ke satu hidangan katalog
 * supaya pemilik toko tahu menu mana yang dikomentari. Di luar PRD aktif:
 * FR-MC tidak menyebut ulasan/respons; ditandai UNRESOLVED di
 * docs/product/prd/milestones-irbid-mvp.md.
 */
export interface MerchantReview {
  id: string
  /** `Customer.id` — sebelum ini hanya nama, jadi ulasan tidak bisa ditautkan. */
  customerId: string
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
  /** Alamat utama — dipilih otomatis saat checkout kalau belum ada pilihan. */
  isDefault: boolean
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

export type CustomerStatus = 'active' | 'suspended' | 'blacklisted'

/**
 * Satu penandaan risiko customer. Disimpan sebagai **riwayat**, bukan keadaan:
 * sebelumnya `customerRiskFlags` hanya `{ id, name }`, jadi alasan, waktu, dan
 * operator penanda hilang begitu halaman dimuat ulang.
 */
export interface CustomerRiskFlag {
  id: string
  /** `Customer.id` — dulu hanya nama, jadi flag tidak bisa ditautkan ke akun. */
  customerId: string
  reason: string
  at: string
  /** `SaOperator.id` — id, bukan nama, supaya bisa ditautkan ke akun pelaku. */
  byOperatorId: string
}

/**
 * Customer dari BE (`customers`) untuk panel CS. `id` diberi awalan `be-`
 * supaya tidak bentrok dengan registri mock (`cus-N`, `data/people.ts`).
 */
export interface AdminCustomer {
  id: string
  name: string
  phone: string
  status: CustomerStatus
  riskFlag: boolean
}

/**
 * Registri customer platform. Sebelum ini customer hanya hidup sebagai
 * `MerchantOrder.customerName` (string tanpa id), sehingga tidak ada satu pun
 * pertanyaan per-customer yang bisa dijawab — berapa order, kena berapa
 * sengketa, uangnya masuk ledger yang mana.
 *
 * Profil lengkap (alamat, tanggal lahir) tetap di `User`; di sini hanya kolom
 * yang dibutuhkan untuk mengenali dan memantau akun.
 */
export interface Customer {
  id: string
  name: string
  /** E.164 (+962/+62) — identitas utama Sa7tein (R-PUSH-01). */
  phone: string
  phoneVerified: boolean
  avatar: string
  /** Jumlah alamat tersimpan; rinciannya di profil customer. */
  addressCount: number
  status: CustomerStatus
  joinedAt: string
}

export interface Card {
  id: string
  brand: 'visa' | 'mastercard'
  last4: string
  holder: string
  expiry: string
  image: string
}

/**
 * Metode bayar (keputusan PO 2026-10-13): DANA jadi satu-satunya provider, jadi
 * kanal VA/QRIS `dana_va`/`dana_qris`. `transfer` legacy juga tetap ada di tipe
 * walau tidak lagi ditawarkan di layar. Kolom backend masih memakai nilai string
 * lama sampai BE memperbarui `orders_payment_method_check` — pemetaannya di
 * `src/api/orders.ts` (OUT_PAYMENT).
 */
export type PaymentMethodId =
  | 'cod'
  | 'transfer'
  | 'wallet'
  | 'dana_va'
  | 'dana_qris'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  description: string
}

/** Status transaksi uang (top-up, payout) — R-WALLET-01. */
export type WalletTxStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** Channel top-up DANA (VA/QRIS). */
export type TopUpChannel = 'dana_va' | 'dana_qris'

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

/**
 * Rekening pencairan (R-WALLET-01, flow f6). Merchant bisa punya beberapa;
 * tepat satu bertanda `isPrimary` sebagai tujuan default. Menggantikan rekening
 * tunggal read-only `Merchant['bank']`, yang dulu hanya bisa dilihat.
 */
export interface PayoutAccount {
  id: string
  bankName: string
  accountNumber: string
  holderName: string
  isPrimary: boolean
}

/**
 * Satu baris dompet merchant: `settlement` = kredit dari order selesai,
 * `payout` = dana keluar ke rekening. `destination` disimpan sebagai snapshot
 * supaya riwayat tetap terbaca walau rekeningnya kemudian dihapus.
 */
export interface PayoutEntry {
  id: string
  kind: 'settlement' | 'tip' | 'payout'
  amount: number
  status: WalletTxStatus
  createdAt: string
  destination?: string
  /** Fee payout yang dipotong dari nilai withdraw (kurir menanggungnya). */
  fee?: number
}

/** Satu baris tabel `exchange_rates` — rate IDR→JOD, display-only (R-CURR-01). */
export interface ExchangeRate {
  base: string
  quote: string
  rate: number
  fetchedAt: string
  source: string
}

/**
 * Kode mata uang. Nominal tetap disimpan IDR (source of truth); JOD hanya
 * tampilan. Tidak ada lagi pemilih mata uang tampilan — layar peran selalu JOD
 * (`useMoney`), dan konsol SA menampilkan pasangan lewat `data/currency`.
 */
export type CurrencyCode = 'IDR' | 'JOD'

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
  /** Foto toko (field `photo` D1, f16). Path aset atau object URL sesi unggah. */
  logo: string
  bank: { name: string; account: string; holder: string }
}

/**
 * Registri merchant platform: identitas usaha + keadaan tenant dalam satu
 * record. Ini yang dibaca konsol SA dan panel CS.
 *
 * Sengaja **tidak** mewarisi `Merchant`: `Merchant` adalah profil operasional
 * PWA merchant (koordinat dapur, rekening, jam buka) yang dimiliki satu toko,
 * sedangkan registri ini tentang siapa merchantnya dan bagaimana statusnya di
 * platform. Keduanya terhubung lewat `id` yang sama — dulu `mockMerchant` (id
 * `'1'`) dan daftar CS (id `'am-1'`) tidak punya penghubung sama sekali.
 *
 * Menggantikan `AdminMerchant`.
 */
export interface MerchantRecord {
  id: string
  name: string
  /** Nama pemilik usaha, dipisah dari nama usaha supaya kontaknya bisa disimpan. */
  owner: string
  /** WA pemilik, E.164. Sebelum ini `AdminTenant.owner` hanya nama tanpa kontak. */
  ownerPhone: string
  city: string
  tier: 'free' | 'pro'
  /** Zona master yang diaktifkan merchant (poligonnya milik SA). */
  isActiveHijazi: boolean
  isActiveSyimali: boolean
  tenantStatus: TenantStatus
  deposit: number
  depositStatus: DepositStatus
  /** Riwayat COD bermasalah — dasar aksi blacklist (F15). */
  codIssues: number
  joinedAt: string
  /** `null` selama tenant belum di-approve. */
  approvedAt: string | null
  /** Alasan saat `suspended`/`blacklisted`; `null` saat normal. */
  statusReason: string | null
}

export interface Courier {
  id: string
  merchantId: string
  name: string
  /** Nomor kurir, dipakai tombol "Hubungi" di halaman pelacakan. */
  phone: string
  /** Verifikasi nomor kurir. Sebelum ini hanya customer yang punya flag ini. */
  phoneVerified: boolean
  status: 'at_store' | 'delivering' | 'offline'
  activeOrderCount: number
  joinedAt: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  /** ringkasan modifier terpilih, mis. "Pedas Sedang, + Lontong" */
  modifiers?: string
  /** catatan bebas customer untuk dapur (layar detail menu), mis. "sambal dipisah" */
  notes?: string
  /** Toko asal item — keranjang dipisah per merchant (PRD §6/§11). */
  merchantId?: string
}

/**
 * Lima tahap perjalanan pesanan — model status Patterns EDISI 01
 * (New → Preparing → Ready → Diantar → Delivered). Dipakai Sa7tein Journey Line.
 */
export type OrderStage = 'baru' | 'disiapkan' | 'siap' | 'diantar' | 'selesai'

export type NotificationKind = 'order' | 'promo' | 'payment' | 'courier' | 'system'

/** Penerima notifikasi — sejajar kolom `notifications.audience` di BE. */
export type NotifAudience = 'customer' | 'merchant' | 'courier' | 'cs'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  time: string
  unread: boolean
  /**
   * Penerima baris ini (`all` = siaran). Opsional karena baris lama/tanpa kolom
   * `audience` tak boleh hilang dari inbox; lihat `notifVisibleTo` di
   * `src/data/notif.ts`.
   */
  audience?: NotifAudience | 'all'
}

/**
 * Subscription Web Push (R-PUSH-01, M8). Registrasinya **disimpan** ke tabel
 * `push_subscriptions` (endpoint + kunci + waktu daftar). Service worker push
 * sudah ada di `public/push-sw.js` (diimpor `importScripts`, lihat `vite.config.ts`);
 * yang belum ada adalah pengiriman otomatis dari BE (sekarang lewat
 * `supabase/functions/send-push` secara manual).
 *
 * Namanya diberi akhiran `Record` supaya tidak bentrok dengan `PushSubscription`
 * milik DOM — kalau namanya sama, TypeScript diam-diam memakai tipe global dan
 * errornya baru muncul jauh dari penyebabnya.
 */
export interface PushSubscriptionRecord {
  /** `id` baris `push_subscriptions` (ada setelah tersimpan di backend). */
  id?: string
  endpoint: string
  keys: { p256dh: string; auth: string }
  platform: string
  /** ISO — kapan perangkat terdaftar. */
  registeredAt: string
}

/**
 * Status order dari sudut pandang merchant. Lima tahap kanonik (`OrderStage`)
 * ditambah dua sub-state operasional dan dua status terminal: `diterima`
 * (merchant menerima, sebelum dapur mulai) dan `tiba` (kurir sampai, menunggu
 * OTP) bukan langkah Journey Line; `ditolak`/`batal` sudah keluar rel.
 */
export type MerchantOrderStatus = OrderStage | 'diterima' | 'tiba' | 'ditolak' | 'batal'

/**
 * `orders.payment_status` BE (f18). Gerbang konfirmasi merchant: prepaid harus
 * `paid` dulu; COD lewat hold; transfer diverifikasi saat diterima.
 */
export type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

export interface MerchantOrder {
  id: string
  code: string
  /** `Customer.id` — kunci yang membuat order bisa dihitung per customer. */
  customerId: string
  customerName: string
  buyerAvatar: string
  buyerRating: number
  address: string
  items: CartItem[]
  total: number
  distanceMeters: number
  zone: ZoneId
  status: MerchantOrderStatus
  /** Teks siap tampil, mis. "2 menit lalu" (`relativeTime`). */
  placedAt: string
  /**
   * Epoch ms dari `placed_at`/`created_at` — sumber numerik untuk umur order.
   * `placedAt` sudah jadi teks, jadi kontrol urgensi (chip umur di tiket) butuh
   * angka ini. Opsional: order dari jalur tanpa kolom waktu tetap render, hanya
   * tanpa sinyal umur.
   */
  placedAtMs?: number
  paymentMethod: PaymentMethod['id']
  /**
   * `orders.payment_status`. Kosong pada order seed (tak punya baris BE) —
   * dianggap lunas supaya seed lama tetap bisa dikonfirmasi.
   */
  paymentStatus?: OrderPaymentStatus
  /**
   * Jenis pengantaran (PRD §7.2/§7.3). `regular` masuk **batch** kurir inhouse,
   * `quick` ditangani satu kurir partner. Menentukan bentuk alur accept di
   * konsol merchant. Kosong bila `orders` BE belum punya kolomnya — pakai
   * `orderDeliveryType()` (`src/data/merchantOrders.ts`) untuk membacanya.
   */
  deliveryType?: OrderType
  /** `Batch.id` tempat order Regular ini bergabung; kosong untuk Quick. */
  batchId?: string
  /** Ditandai selesai packing (MER-13). Batch boleh mulai lebih awal bila semua `packed`. */
  packed?: boolean
  cookMinutes?: number
  /**
   * `Courier.id` yang dipilih merchant untuk order ini. Platform tidak pernah
   * menugaskan kurir (C-06) — kurir karyawan merchant, jadi rujukan ini hanya
   * diisi dari aksi merchant (F12 `:assign` → `hold_cut`).
   */
  courierId?: string
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
  /** `Customer.id` — sama dengan yang dipakai order, jadi satu orang satu kunci. */
  customerId: string
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
  /**
   * Koordinat tujuan (M5) — dasar auto-sort rute (§9.6) dan peta batch. Opsional:
   * jalur BE (`courier_orders()`) belum mengirimnya, jadi auto-sort jatuh ke
   * urutan `distanceMeters` saat kosong.
   */
  latitude?: number
  longitude?: number
  /** Batch kurir inhouse tempat tugas ini diantar (M5, BR-B07). Kosong = di luar batch. */
  batchId?: string
  /**
   * Ongkir yang jadi hak kurir saat order selesai (R-COU-INHOUSE, R-DELIV-FEE).
   * Diisi hanya untuk order **Regular online**; Regular COD dibayar merchant di
   * luar aplikasi, jadi nol. IDR (R-CURR-01).
   */
  deliveryFeeIdr?: number
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
  /** URL foto tempat usaha (aset mock). `undefined` = hanya hitungan. */
  photos?: string[]
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
  /** `Customer.id` atau `MerchantRecord.id`, mengikuti `filedBy`. */
  partyId: string
  /** Nama pihak pengaju (tampilan). */
  party: string
  /** `Customer.id` pemilik order yang disengketakan — terpisah dari `partyId`. */
  customerId: string
  /** `MerchantRecord.id` — dulu hanya nama, jadi sengketa per merchant tak bisa dihitung. */
  merchantId: string
  merchant: string
  category: string
  reason: string
  photoCount: number
  /** URL foto bukti (aset mock). `undefined` = hanya hitungan, tanpa pratinjau. */
  photos?: string[]
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

/** Jenis pemilik dana di satu entry ledger. */
export type LedgerPartyKind = 'customer' | 'merchant' | 'courier' | 'platform'

/**
 * Pihak yang uangnya bergerak di satu entry ledger. Sebelum ini `LedgerEntry`
 * tidak punya field pihak sama sekali, sehingga janji PRD "monitoring ledger
 * detail merchant & customer" (`decision-irbid-mvp.md:52`) tidak bisa dipenuhi:
 * uangnya terlihat bergerak, pemiliknya tidak.
 */
export interface LedgerParty {
  kind: LedgerPartyKind
  /** `Customer.id` / `MerchantRecord.id` / `Courier.id`; `null` untuk `platform`. */
  id: string | null
  name: string
}

/** Entry ledger — append-only, tanpa aksi edit atau hapus dari UI (M9). */
export interface LedgerEntry {
  id: string
  at: string
  type: LedgerEntryType
  direction: 'debit' | 'credit'
  /** JOD. */
  amount: number
  /** Dana siapa yang bergerak di entry ini. */
  party: LedgerParty
  ref: string
  memo: string
}

/** Kewajiban platform = saldo wallet yang belum di-payout (view agregat, M9). */
export interface LiabilitySummary {
  customerWallets: number
  merchantWallets: number
  courierTips: number
  /** Saldo DANA mock; dipakai membandingkan dengan total liability. */
  danaBalance: number
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

/** Alert SLA breach yang naik ke SA (`batch.escalatedToAdmin: true`, feeder F21). */
export interface AdminEscalation {
  id: string
  orderCode: string
  /** `MerchantRecord.id` — dulu hanya nama. */
  merchantId: string
  merchant: string
  detail: string
  minutesLate: number
}

// ── Konsol Super Admin (role terpisah, website penuh non-PWA) ───────────────
// Cakupan dari keputusan PO 2026-09-23 (`decision-irbid-mvp.md`). Repo ini
// front-end saja: semua angka di bawah adalah mock yang ditampilkan.

/** Titik koordinat geografis. Bentuk yang sama dipakai alamat dan poligon zona. */
export interface GeoPoint {
  lat: number
  lng: number
}

/**
 * Poligon zona master. Vertices disimpan sebagai **lat/lng sungguhan** karena
 * inilah bentuk yang dipakai gate coverage (titik di dalam poligon), bukan
 * koordinat gambar. Kanvas SA hanya memproyeksikan lat/lng itu ke layar supaya
 * bisa digeser; repo ini tidak memakai tile peta eksternal (AGENTS.md §6).
 */
export interface ZoneGeometry {
  id: ZoneId
  label: string
  note: string
  vertices: GeoPoint[]
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
  /**
   * `SaOperator.id` pelaku; `null` untuk aksi sistem yang tidak dijalankan akun.
   * Dulu hanya ada `actor` (nama), jadi audit tidak bisa ditautkan ke akun.
   */
  actorId: string | null
  actorRole: 'sa' | 'cs'
  kind: AuditKind
  /** Kalimat aksi yang sudah siap tampil, mis. "Setujui deposit tenant". */
  action: string
  /**
   * Objek yang kena aksi, mis. order code atau nama merchant. **Masih string
   * tampilan, bukan id** — taksonomi target belum ada di PRD, jadi sengaja
   * dibiarkan apa adanya dan ditandai `UNRESOLVED` di dokumentasi konsol.
   */
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

// ── Data-viz konsol (donut & bar) ───────────────────────────────────────────
// Tipe view-model, bukan tipe domain: chart menggambarkan data yang sudah ada
// (`LiabilitySummary`, `ProfitState`, `TaxReportRow`, `AuditEntry`), tidak
// menambah aturan bisnis. Lihat `src/data/dashboard.ts`.

/**
 * Nada warna elemen data-viz. Nama **peran**, bukan nomor palet, supaya chart
 * memakai token yang sudah ada dan tidak menambah warna baru (DNA §4).
 */
export type ChartTone = 'brand' | 'success' | 'warning' | 'danger' | 'muted'

/** Satu potongan donut. */
export interface ChartSegment {
  label: string
  value: number
  tone: ChartTone
  /**
   * Id tab antrean yang mewakili potongan ini, kalau ada padanannya.
   * Dipakai legenda yang bisa ditekan: potongan donut tanpa jalan menuju
   * daftar ordernya hanya bisa dilihat, tidak bisa ditindaklanjuti.
   *
   * Tipenya `string`, bukan `QueueTabId`, karena `QueueTabId` diturunkan dari
   * `QUEUE_TABS` di `data/merchantOrders.ts` yang sudah mengimpor berkas ini —
   * memakainya di sini akan membuat lingkaran impor. Nilainya tetap wajib
   * berasal dari `QUEUE_TABS`; itu dijaga di pemanggilnya (`merchantTrend.ts`).
   */
  tab?: string
}

/** Satu batang bar chart. */
export interface ChartBar {
  label: string
  value: number
}

// ── Layar masuk / daftar ────────────────────────────────────────────────────
// Foto panel atas layar auth. Dimensinya bagian dari tipe karena ketiganya
// aset portrait (800x1422 atau 800x1200) dan pemanggil harus meneruskannya ke
// atribut `width`/`height` <img>: tanpa itu browser mengalokasikan ruang
// sebelum gambar dimuat dengan rasio yang salah, dan panel foto melompat.

export interface AuthPhoto {
  src: string
  alt: string
  /** Lebar asli berkas, dipakai atribut `width` <img>. */
  width: number
  /** Tinggi asli berkas, dipakai atribut `height` <img>. */
  height: number
}

/**
 * Satu slide banner carousel di layar auth. Gambarnya sudah memuat satu janji
 * produk (teks besar di dalamnya), jadi `alt` menyalin janji itu supaya
 * pembaca layar tetap menerima pesannya.
 */
export interface AuthBannerSlide {
  src: string
  alt: string
}

// ── Domain PRD sa7tein-mvp-2026-10-11 (marketplace + delivery) ───────────────
// Tipe di bawah milik revisi aktif (aktif 2026-10-15), menggantikan model
// `irbid-mvp-v2-2026-09-21` (COD hold, zona Hijazi/Syimali, kurir karyawan
// merchant). Ditulis **aditif**: tipe lama tetap ada sampai bagiannya
// dimigrasikan di M1-M11 (lihat versions/sa7tein-mvp-2026-10-11/milestones.md).
// Semua nominal harga domain ini **JOD**; konversi ke IDR terjadi saat transaksi.

// — Order & batch (PRD §7, §8) —

/**
 * Jenis pengiriman order (§6). `regular` lewat batch kurir inhouse; `quick`
 * tanpa batch, satu order per kurir partner.
 */
export type OrderType = 'regular' | 'quick'

/** Status batch (PRD §7.5, BR-B10/B11). */
export type BatchStatus =
  | 'countdown' // hitung mundur berjalan, menerima order baru
  | 'closed' // ditutup lebih awal oleh merchant (BR-B08)
  | 'awaiting_courier' // hitung mundur selesai, belum di-assign kurir
  | 'assigned' // selesai, kurir di-assign, belum menekan mulai delivery
  | 'delivering' // dalam pengantaran
  | 'done' // semua order di dalamnya selesai

/** Batch antrian order Regular kurir inhouse (§8). Maks 24 order (BR-B04). */
export interface Batch {
  id: string
  merchantId: string
  /** `Courier.id` kurir inhouse yang di-assign; `null` sebelum di-assign (BR-B07). */
  courierId: string | null
  orderIds: string[]
  status: BatchStatus
  /** Estimasi waktu masak (menit) yang diinput merchant saat membuat batch. */
  estimateMinutes: number
  /** Sisa hitung mundur (detik); 0 saat sudah selesai. */
  countdownSeconds: number
  /** Toggle auto-sort kurir (BR-B12). */
  autoSort: boolean
  /** Urutan pengantaran hasil auto-sort (id order); kosong saat OFF/manual. */
  routeOrder: string[]
  createdAt: string
}

// — Kurir partner & dispatch (PRD §7.3, §9.3, §9.4, §9.5) —

/** Status kurir partner (§9.3). */
export type CourierPartnerStatus = 'offline' | 'available' | 'reserved' | 'busy'

/** Kurir partner aplikator: satu order per waktu, approve/reject assignment. */
export interface CourierPartner {
  id: string
  name: string
  phone: string
  status: CourierPartnerStatus
  /** Jumlah order selesai hari ini; tie-break dispatch (§9.4). */
  completedToday: number
  /** SP aktif; kelayakan antrian dispatch (OPEN-11). */
  warningLetters: number
  /** ISO; kesegaran lokasi untuk kandidat dispatch (§9.4). */
  lastLocationAt: string | null
  joinedAt: string
}

/** Assignment order ke kurir partner, menunggu approve/reject (§9.5). */
export interface CourierAssignment {
  id: string
  orderId: string
  partnerId: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  /** Alasan reject (COU-18). */
  rejectReason?: string
  sentAt: string
  respondedAt?: string
  /**
   * Mitra pengganti saat assignment kedaluwarsa (COU-17). Id mitra, bukan nama
   * (nama bisa berubah). Pemilihan penggantinya milik `dispatch_courier()`
   * (§9.4, OPEN-11); FE hanya menyimpan siapa yang menerima (mock).
   */
  replacedBy?: string
}

// — Katalog ala Odoo (§14) —

/** `create_variant` Odoo: pola pembentukan variant dari attribute. */
export type AttributeVariantMode = 'always' | 'dynamic' | 'no_variant'

/** `display_type` Odoo; `multi` hanya untuk `no_variant` (§14). */
export type AttributeDisplayType = 'radio' | 'pills' | 'select' | 'color' | 'multi'

/** Nilai attribute global milik merchant (padanan `product.attribute.value`). */
export interface CatalogAttributeValue {
  id: string
  name: string
  /** Tambahan harga default (JOD). */
  defaultExtraPrice: number
  /** Customer mengisi teks bebas (mis. tulisan di kue). */
  isCustom: boolean
}

/** Attribute milik merchant (padanan `product.attribute`, PRD membedakannya per merchant). */
export interface CatalogAttribute {
  id: string
  merchantId: string
  name: string
  createVariant: AttributeVariantMode
  displayType: AttributeDisplayType
  values: CatalogAttributeValue[]
}

/** Attribute yang dipasang pada satu menu (padanan `product.template.attribute.line`). */
export interface MenuAttributeLine {
  menuId: string
  attributeId: string
  /** Id `CatalogAttributeValue` yang berlaku untuk menu ini. */
  valueIds: string[]
}

/** Nilai attribute per menu: harga tambahan + pengecualian (§14). */
export interface MenuAttributeValue {
  menuId: string
  attributeValueId: string
  /** `price_extra` (JOD) menimpa default nilai. */
  priceExtra: number
  /** Flag ketersediaan per menu (terpisah dari arsip `ptav_active` Odoo). */
  available: boolean
  /** Nilai lain yang tidak boleh dipilih bersamaan. */
  excludeValueIds: string[]
}

/** Kombinasi nilai yang dilarang (padanan `product.template.attribute.exclusion`). */
export interface AttributeExclusion {
  menuId: string
  attributeValueIds: string[]
}

/** Variant menu: kombinasi nilai pembentuk variant (padanan `product.product`). */
export interface MenuVariant {
  id: string
  menuId: string
  attributeValueIds: string[]
  /** Toggle ketersediaan level variant (§14). */
  available: boolean
}

// — Program marketing ala Odoo (§15) —

/** `program_type` Odoo 18 yang diadopsi (§15.1). */
export type MarketingProgramType =
  | 'promotion'
  | 'promo_code'
  | 'coupons'
  | 'buy_x_get_y'
  | 'next_order_coupons'
  | 'loyalty'
  | 'gift_card' // stored value, OPEN-10
  | 'ewallet' // stored value, OPEN-10

/** Pemilik program: aplikator (ops) atau merchant (loyalty merchant lokal). */
export type ProgramOwner = 'platform' | 'merchant'

/** `trigger` Odoo: otomatis atau dengan kode. */
export type ProgramTrigger = 'auto' | 'with_code'

/** `applies_on` Odoo: order saat ini, order berikutnya, atau keduanya. */
export type ProgramAppliesOn = 'current' | 'future' | 'both'

/** Jenis hadiah (§15.2). `shipping` dari modul sale_loyalty_delivery. */
export type RewardType = 'discount' | 'product' | 'shipping'

/** Mode diskon Odoo. */
export type DiscountMode = 'percent' | 'per_order' | 'per_point'

/** Sasaran diskon Odoo. */
export type DiscountApplicability = 'order' | 'cheapest' | 'specific'

/** Basis perolehan poin Odoo. */
export type RewardPointMode = 'per_order' | 'per_currency' | 'per_unit'

/** Program marketing (padanan `loyalty.program`). Mata uang JOD. */
export interface MarketingProgram {
  id: string
  /** Nama yang dibaca customer/merchant di daftar program. */
  name: string
  owner: ProgramOwner
  /** `MerchantRecord.id` saat owner = merchant; `null` untuk aplikator. */
  merchantId: string | null
  type: MarketingProgramType
  trigger: ProgramTrigger
  appliesOn: ProgramAppliesOn
  dateFrom: string
  dateTo: string | null
  limitUsage: number | null
  maxUsage: number | null
  /** Boleh digabung promo lain (OPEN-23 untuk semantiknya). */
  isStackable: boolean
}

/**
 * Slide carousel promo beranda toko. Dikelola merchant; customer melihat
 * slide aktif milik toko itu, berurutan sesuai posisi di state.
 *
 * `image` opsional (data URL hasil unggah). Tanpa gambar, kartu memakai latar
 * promo bawaan yang sama dengan carousel lama.
 */
export interface PromoSlide {
  id: string
  /** `MerchantRecord.id` pemilik slide. */
  merchantId: string
  menuItemId: string
  /** Judul kartu. Kosong = pakai nama menu saat dirender. */
  title: string
  image: string | null
  active: boolean
}

/** Syarat program (padanan `loyalty.rule`). */
export interface ProgramRule {
  id: string
  programId: string
  minimumQty: number
  minimumAmountJod: number
  /** Batas pada menu/kategori/tag tertentu; kosong = semua. */
  menuIds: string[]
  categoryIds: string[]
  tagIds: string[]
  rewardPointMode: RewardPointMode
  rewardPointAmount: number
}

/** Hadiah program (padanan `loyalty.reward`). */
export interface ProgramReward {
  id: string
  programId: string
  rewardType: RewardType
  discountMode?: DiscountMode
  discountPercent?: number
  discountApplicability?: DiscountApplicability
  discountMaxAmountJod?: number
  requiredPoints?: number
  rewardMenuId?: string
  rewardQty?: number
}

/** Kartu/kupon milik customer (padanan `loyalty.card`). */
export interface LoyaltyCard {
  id: string
  programId: string
  customerId: string
  points: number
  code: string | null
  expiresAt: string | null
}

// — Langganan kuota (§17) —

/** Jenis kuota: order online, atau order COD (online + COD, selalu lebih mahal). */
export type QuotaKind = 'order' | 'cod'

/** Langganan kuota merchant (§17). Kuota tersedia = paket - terpakai - ter-reserve. */
export interface QuotaSubscription {
  id: string
  merchantId: string
  kind: QuotaKind
  /** Kuota paket untuk satu periode. */
  quota: number
  used: number
  reserved: number
  periodStart: string
  periodEnd: string
  active: boolean
}

/** Turunan ketersediaan kuota merchant untuk UI (§17). */
export interface QuotaState {
  /** Kuota order online tersedia. */
  orderAvailable: number
  /** Kuota COD tersedia. */
  codAvailable: number
  /** Setting boolean merchant; hanya bisa diubah saat tutup (§17). */
  acceptWithoutQuota: boolean
}

/**
 * Paket kuota yang bisa dibeli merchant (§17). `priceJod` = harga paket;
 * pembayarannya transaksi biasa, jadi QRIS kena `Ft` dan saldo DANA tidak.
 */
export interface QuotaPackage {
  id: string
  kind: QuotaKind
  /** Jumlah order dalam paket ini. */
  units: number
  /** Masa berlaku paket, dalam hari. */
  days: number
  priceJod: number
}

// — Refund (§7.4, §16.6) —

/** Tujuan refund; QRIS tanpa akun DANA = `bank` (BI-FAST, biaya Rp2.500 ditanggung aplikator). */
export type RefundMethod = 'dana' | 'bank'

/** Status refund. `pending_refund` = order customer tanpa akun DANA menunggu isi rekening. */
export type RefundStatus = 'pending_refund' | 'processing' | 'completed' | 'failed'

/** Refund satu order online yang batal/ditolak (§16.6). */
export interface Refund {
  id: string
  orderId: string
  /** Nominal IDR penuh yang dibayar (termasuk transaction fee + pembulatan). */
  amountIdr: number
  method: RefundMethod
  status: RefundStatus
  /** Diisi saat `method = bank`. */
  bankName?: string
  bankAccount?: string
  createdAt: string
  completedAt?: string
}

// — Coverage merchant (§9.1) —

/** Mode coverage merchant: area (polygon) atau radius. */
export type CoverageMode = 'area' | 'radius'

/** Satu polygon coverage mode area; fee (JOD) melekat per polygon. */
export interface CoveragePolygon {
  id: string
  vertices: GeoPoint[]
  feeJod: number
}

/**
 * Coverage merchant (§9.1). Mode area: beberapa polygon yang tidak boleh tumpang
 * tindih. Mode radius: radius maksimum + fee per satuan jarak. Menggantikan
 * `MerchantDeliveryConfig` zona global Hijazi/Syimali.
 */
export interface MerchantCoverage {
  merchantId: string
  mode: CoverageMode
  polygons: CoveragePolygon[]
  /** Mode radius: radius maksimum (meter). */
  radiusMeters?: number
  /** Mode radius: fee per satuan jarak (JOD). */
  feePerUnitJod?: number
  /** Satuan jarak pilihan merchant. */
  unit?: 'meter' | 'km'
}

// — Dispute berbasis rule (§18) —

/** Kategori insiden yang dipetakan ops ke rule (§18). */
export interface IncidentCategory {
  id: string
  label: string
}

/** Rule (mitigasi/kompensasi/punishment) yang dikelola ops (§18). */
export interface DisputeRule {
  id: string
  code: string
  name: string
  categoryId: string
  /** Kondisi pemicu (teks), dievaluasi ops/sistem. */
  trigger: string
  /** Pihak penanggung jawab. */
  responsibleParty: 'customer' | 'merchant' | 'courier'
  mitigation: string
  active: boolean
  version: number
}

/** Kompensasi bagian dari rule. */
export interface Compensation {
  id: string
  ruleId: string
  recipient: 'customer' | 'merchant' | 'courier'
  /** Bentuk (mis. "refund 50%") + formula nilai. */
  form: string
  formula: string
}

/** Punishment bagian dari rule; SP kurir partner salah satu bentuknya (§18). */
export interface Punishment {
  id: string
  ruleId: string
  subject: 'customer' | 'merchant' | 'courier'
  form: string
  /** Tingkat atau formula. */
  level: string
}

/** Pilihan rule merchant (multi-select) + tanggal mulai berlaku (§18). */
export interface MerchantRuleSelection {
  merchantId: string
  ruleIds: string[]
  effectiveFrom: string
}

/** Status insiden/dispute berbasis rule. */
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'rejected'

/** Insiden/dispute satu order (§18). */
export interface Incident {
  id: string
  orderId: string
  reporter: 'customer' | 'merchant' | 'courier'
  reporterId: string
  categoryId: string
  description: string
  photoCount: number
  photos?: string[]
  status: IncidentStatus
  /** Rule yang diterapkan (snapshot saat order dibuat, usulan §18). */
  ruleId?: string
  decision?: string
  decidedBy?: string
  filedAt: string
}

// — Komponen harga & settlement (§16.3, §16.4) —

/**
 * Rincian harga satu order dalam JOD (§16.3). `total` = S - Dm - Da + F + Pc + Ft.
 * `Ft` (transaction fee 1,5%) hanya untuk QRIS; 0 untuk saldo DANA dan COD.
 */
export interface PriceBreakdown {
  /** Subtotal menu. */
  subtotalJod: number
  /** Diskon program merchant. */
  discountMerchantJod: number
  /** Diskon program aplikator. */
  discountPlatformJod: number
  /** Delivery fee (Regular: fee merchant; Quick: multiplier x fee merchant). */
  deliveryFeeJod: number
  /** Platform fee customer, flat per order (termasuk COD). */
  platformFeeCustomerJod: number
  /** Platform fee merchant, flat per order (hanya online tanpa kuota). */
  platformFeeMerchantJod: number
  /** Transaction fee 1,5% (QRIS saja). */
  transactionFeeJod: number
  totalJod: number
}

/** Pembagian settlement satu order online selesai (§16.4), dalam JOD. */
export interface OrderSettlement {
  merchantJod: number
  courierJod: number
  platformJod: number
  /** Konteks kuota yang menentukan kolom pembagian. */
  quota: 'none' | 'order' | 'cod'
}

// — Panel ops (M10, R-OPS) —

/**
 * Konfigurasi platform yang diubah ops, bukan developer. Nilai-nilainya
 * menyalin konstanta yang sudah dipakai kode (`QUICK_MULTIPLIER_DEFAULT`,
 * `ALMOST_ARRIVED_MINUTES`, `PLATFORM_FEE_JOD`) supaya panel ops ini terlihat
 * sebagai pemiliknya — panel ini mock, jadi mengubah di sini tidak (belum)
 * mengubah konstanta sumber.
 */
export interface OpsPlatformConfig {
  /** Multiplier tarif delivery Quick atas fee merchant (§13). */
  quickMultiplier: number
  /** Ambang notifikasi "kurir hampir sampai", menit (R-TRACK). */
  almostArrivedMinutes: number
  /** Pc — platform fee customer, flat per order (§16.3). */
  platformFeeCustomerJod: number
  /** Pm — platform fee merchant, hanya saat online tanpa kuota (§16.3). */
  platformFeeMerchantJod: number
}

/** Status usulan tag merchant (moderasi ops, R-OPS). */
export type OpsTagStatus = 'pending' | 'approved' | 'rejected'

/** Usulan tag yang menunggu moderasi ops. */
export interface OpsTag {
  id: string
  label: string
  merchantName: string
  status: OpsTagStatus
  submittedAt: string
}

/** Status surat peringatan (SP) yang diterbitkan ops — bentuk punishment §18. */
export type OpsPenaltyStatus = 'issued' | 'revoked'

/**
 * SP yang sudah diterbitkan ops ke satu pihak. Terpisah dari `Punishment`
 * (bagian dari rule §18): ini catatan penerbitan nyata dengan pelaku & alasan.
 */
export interface OpsPenalty {
  id: string
  subject: 'customer' | 'merchant' | 'courier'
  subjectName: string
  form: string
  level: string
  reason: string
  status: OpsPenaltyStatus
  issuedAt: string
}

