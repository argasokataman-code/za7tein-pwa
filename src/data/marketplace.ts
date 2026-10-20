import type {
  Batch,
  CourierAssignment,
  CourierPartner,
  MerchantCoverage,
  OrderSettlement,
  PriceBreakdown,
  QuotaPackage,
  QuotaSubscription,
  Refund,
} from '../types'
import { jodToIdr } from './currency'

// ── Domain M0: PRD sa7tein-mvp-2026-10-11 (marketplace + delivery) ───────────
// Konstanta + seed mock untuk slice batch, partner, kuota, marketing, refund,
// coverage, dan rule dispute. Semua nilai **mock** (repo ini front-end saja,
// AGENTS.md §1); kontrak BE ada di analysis.md. Nominal uang dalam JOD kecuali
// dinyatakan IDR.

/** Batas keras order per batch, BR-B04. */
export const MAX_BATCH_ORDERS = 24

/**
 * Pengali delivery fee Quick (OPS-03) — contoh PRD "1,x"; di produksi di-setup
 * ops, bukan nilai final.
 */
export const QUICK_MULTIPLIER_DEFAULT = 1.2

/**
 * Transaction fee pembayaran QRIS = 1,5% x (S - Dm - Da + F + Pc) (§16.2).
 * Tidak berlaku untuk saldo DANA maupun COD.
 */
export const TRANSACTION_FEE_RATE = 0.015

/**
 * Platform fee customer default (JOD, flat per order). **Contoh PRD §16.4**;
 * nominal final di-setup ops (OPS-08). Menggantikan pasangan flat lama
 * `PLATFORM_FEE_CUSTOMER_JOD` di `data/merchant.ts` selama migrasi.
 */
export const PLATFORM_FEE_CUSTOMER_DEFAULT_JOD = 0.2

/** Platform fee merchant default (JOD). Contoh PRD §16.4; di-setup ops (OPS-08). */
export const PLATFORM_FEE_MERCHANT_DEFAULT_JOD = 0.25

/** Biaya transfer BI-FAST per refund ke rekening bank; ditanggung aplikator (§16.6). */
export const REFUND_BI_FAST_FEE_IDR = 2500

/**
 * Refund aktif: `refunds` ada di BE dan jalur tulisnya di
 * `src/api/refunds.ts` (`POST` + baca baris). Kalau BE mati, layar tetap maju
 * dalam mode demo — mock-first, bukan penanda "belum tersedia" lagi.
 */
export const REFUND_AVAILABLE = true

/**
 * Dispatch kurir partner (PRD §9.4/M6): kandidat mitra dibaca live dari
 * `couriers` non-inhouse (`src/api/dispatch.ts`), dan penugasan kurir menulis
 * `orders.courier_id`. Yang belum: penjadwalan `dispatch_courier()` + evaluasi
 * kandidat (OPEN-11) serta talangan COD Quick.
 */
export const QUICK_DISPATCH_AVAILABLE = true

// — Batch —

/**
 * Tidak ada batch awal. PRD BR-B01: **batch lahir hanya dari order Regular yang
 * di-accept** — batch kosong yang di-seed akan menampilkan hitung mundur tanpa
 * order nyata, dan id order seed tak cocok dengan baris BE (order live ber-id
 * `api-<n>`). Jadi konsol mulai kosong dan batch dibuat dari aksi merchant.
 */
export const mockBatches: Batch[] = []

// — Kurir partner & assignment —

export const mockCourierPartners: CourierPartner[] = [
  {
    id: 'partner-1',
    name: 'Rani',
    phone: '+962790000001',
    status: 'available',
    activeOrders: 3,
    warningLetters: 0,
    lastLocationAt: '2026-10-15T08:05:00.000Z',
    joinedAt: '2026-09-20T00:00:00.000Z',
  },
  {
    id: 'partner-2',
    name: 'Hadi',
    phone: '+962790000002',
    status: 'busy',
    activeOrders: 5,
    warningLetters: 1,
    lastLocationAt: '2026-10-15T07:58:00.000Z',
    joinedAt: '2026-09-25T00:00:00.000Z',
  },
  {
    id: 'partner-3',
    name: 'Salim',
    phone: '+962790000003',
    status: 'available',
    activeOrders: 1,
    warningLetters: 0,
    lastLocationAt: '2026-10-15T08:02:00.000Z',
    joinedAt: '2026-10-01T00:00:00.000Z',
  },
]

/**
 * Kurir partner yang dipakai sebagai "aku" di layar kurir partner (demo). BE
 * belum punya sesi partner (M6); satu id tetap supaya assignment demo bisa
 * di-approve/reject dari sisi kurir.
 */
export const PARTNER_SELF_ID = 'partner-1'

export const mockAssignments: CourierAssignment[] = [
  {
    id: 'assign-1',
    orderId: 'ord-3',
    partnerId: 'partner-1',
    status: 'pending',
    sentAt: '2026-10-15T08:10:00.000Z',
  },
]

// — Langganan kuota (§17) —

/**
 * Sisa kuota dianggap **hampir habis** bila ≤ rasio ini dari total paket.
 * Dipakai status `low` di `quotaSlice` (peringatan, bukan blokir).
 */
export const QUOTA_LOW_RATIO = 0.2

/**
 * `merchantId` memakai id merchant seperti yang dipakai sisi lain: toko demo
 * console merchant = `1` (`DEMO_MERCHANT_ID`, id live `merchants.id`), dan
 * `am-4` (id toko mock `storefronts.ts`) untuk kasus blokir di jalur mock.
 * Merchant live yang tak tercantum di sini → `unknown`, tidak diblokir — BE
 * belum punya tabel kuota (`ui-impact.md` §8).
 */
export const mockQuotaSubscriptions: QuotaSubscription[] = [
  {
    // Hampir habis (sisa 17 dari 100) — status `low`, tampil sebagai peringatan
    // di console merchant, bukan blokir di beranda.
    id: 'quota-order-1',
    merchantId: '1',
    kind: 'order',
    quota: 100,
    used: 82,
    reserved: 1,
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    active: true,
  },
  {
    // Habis (sisa 0) — tokonya disembunyikan dari daftar selama setting
    // "terima order tanpa kuota" mati.
    id: 'quota-order-2',
    merchantId: 'am-4',
    kind: 'order',
    quota: 60,
    used: 60,
    reserved: 0,
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    active: true,
  },
  {
    // Kuota COD juga hampir habis (sisa 2 dari 40) supaya layar langganan punya
    // dua keadaan nyata sekaligus: cukup dan hampir habis.
    id: 'quota-cod-1',
    merchantId: '1',
    kind: 'cod',
    quota: 40,
    used: 38,
    reserved: 0,
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    active: true,
  },
]

/**
 * Setting "Terima order tanpa kuota order?" (§17) — hanya bisa diubah saat toko
 * tutup. Default **mati**: kalau default-nya menyala, aturan kuota habis →
 * toko disembunyikan tak akan pernah terlihat.
 */
export const mockAcceptWithoutQuota = false

/**
 * Paket kuota yang bisa dibeli merchant (§17). Dua jenis bisa aktif bersamaan:
 * kuota **order** (order online) dan kuota **COD** — order COD hanya memakai
 * kuota COD. Harga mock JOD; pembeliannya transaksi biasa, jadi QRIS kena `Ft`
 * 1,5% dan saldo DANA tidak. **Belum ada jalur beli ke BE** (tidak ada tabel
 * langganan) — layar langganan menampilkan paketnya tapi menandai pembelian
 * belum tersedia.
 */
export const mockQuotaPackages: QuotaPackage[] = [
  { id: 'pkg-order-50', kind: 'order', units: 50, days: 30, priceJod: 1.5 },
  { id: 'pkg-order-150', kind: 'order', units: 150, days: 30, priceJod: 3.9 },
  { id: 'pkg-order-400', kind: 'order', units: 400, days: 30, priceJod: 9.5 },
  { id: 'pkg-cod-30', kind: 'cod', units: 30, days: 30, priceJod: 1.2 },
  { id: 'pkg-cod-100', kind: 'cod', units: 100, days: 30, priceJod: 3.4 },
]

/**
 * Pembelian kuota aktif: `quota_packages` + `quota_subscriptions` ada di BE dan
 * jalur tulisnya di `src/api/quota.ts` (`purchaseQuotaPackage`). Pengurangan
 * saldo & pencatatan pembayaran paket belum ada di BE.
 */
export const QUOTA_PURCHASE_AVAILABLE = true

// Program marketing (§15) pindah ke `./marketing` — berkas ini menyentuh batas
// 500 baris. Seed program, rule, reward, dan kartu loyalty ada di sana.
// — Refund —

export const mockRefunds: Refund[] = [
  {
    id: 'refund-1',
    orderId: 'ord-9',
    amountIdr: 46000,
    method: 'bank',
    status: 'pending_refund',
    createdAt: '2026-10-15T07:30:00.000Z',
  },
]

// — Coverage —

export const mockCoverage: MerchantCoverage = {
  merchantId: 'merchant-1',
  mode: 'radius',
  polygons: [],
  radiusMeters: 2000,
  feePerUnitJod: 0.5,
  unit: 'km',
}

// — Rule dispute & insiden pindah ke `src/data/rules.ts` (id-nya dulu menggantung
//   ke `rule-late-1` / `cat-late` yang tidak pernah ada di katalog) —

// ── Uang: rincian harga & settlement (§16.2–§16.4) ──────────────────────────
// Fungsi murni, JOD. Layar tinggal menampilkan hasilnya — tidak menghitung ulang
// (AGENTS §11: logika turunan tinggal di modul data).

/** Metode bayar yang memengaruhi `Ft` dan kolom settlement (§16.2). */
export type PayMethodKind = 'qris' | 'dana' | 'cod'

/** Konteks kuota merchant pada satu order (§16.4, §17). */
export type QuotaContext = 'none' | 'order' | 'cod'

export interface PriceInput {
  /** `S` — subtotal menu. */
  subtotalJod: number
  /** `Dm` — diskon program merchant (ditanggung merchant). */
  discountMerchantJod?: number
  /** `Da` — diskon program aplikator (ditanggung aplikator). */
  discountPlatformJod?: number
  /** Fee kurir **sebelum** pengali Quick. */
  deliveryFeeJod?: number
  /** `true` = order Quick; fee kurir dikali pengali. */
  quick?: boolean
  quickMultiplier?: number
  /** `Pc` — platform fee customer, flat per order (termasuk COD). */
  platformFeeCustomerJod?: number
  /** `Pm` — platform fee merchant; hanya ditagih saat online tanpa kuota. */
  platformFeeMerchantJod?: number
  method: PayMethodKind
}

/**
 * Rincian harga satu order (§16.3). `total = S − Dm − Da + F + Pc + Ft`.
 *
 * `Ft` = 1,5% × (S − Dm − Da + F + Pc) dan **hanya QRIS**; saldo DANA dan COD
 * tidak kena transaction fee (§16.2). `Pm` tidak masuk total — ia dipotong dari
 * bagian merchant di settlement.
 */
export function priceBreakdown(input: PriceInput): PriceBreakdown {
  const subtotalJod = input.subtotalJod
  const discountMerchantJod = input.discountMerchantJod ?? 0
  const discountPlatformJod = input.discountPlatformJod ?? 0
  const baseDelivery = Math.max(0, input.deliveryFeeJod ?? 0)
  const deliveryFeeJod = input.quick
    ? baseDelivery * (input.quickMultiplier ?? QUICK_MULTIPLIER_DEFAULT)
    : baseDelivery
  const platformFeeCustomerJod = input.platformFeeCustomerJod ?? PLATFORM_FEE_CUSTOMER_DEFAULT_JOD
  const platformFeeMerchantJod = input.platformFeeMerchantJod ?? PLATFORM_FEE_MERCHANT_DEFAULT_JOD
  const net =
    subtotalJod - discountMerchantJod - discountPlatformJod + deliveryFeeJod + platformFeeCustomerJod
  const transactionFeeJod = input.method === 'qris' ? TRANSACTION_FEE_RATE * net : 0
  return {
    subtotalJod,
    discountMerchantJod,
    discountPlatformJod,
    deliveryFeeJod,
    platformFeeCustomerJod,
    platformFeeMerchantJod,
    transactionFeeJod,
    totalJod: net + transactionFeeJod,
  }
}

/**
 * Pembagian settlement tiga kolom (§16.4): merchant / kurir / aplikator,
 * **selalu berjumlah `totalJod`** — sisa pembulatan jadi milik aplikator.
 *
 * - `quota: 'none'` → online tanpa kuota: `Pm` ditagih ke merchant.
 * - `quota: 'order'` → kuota order menutup `Pm` (konsumsinya ditangani slice kuota).
 * - `quota: 'cod'` → COD berkuota: `Pm` nol **dan** `Pc` jadi hak merchant.
 *
 * `Dm` ditanggung merchant (memotong bagiannya), `Da` ditanggung aplikator
 * (tampil sebagai selisih di kolomnya).
 */
export function settlementFor(b: PriceBreakdown, quota: QuotaContext): OrderSettlement {
  const courierJod = b.deliveryFeeJod
  const merchantBase =
    b.subtotalJod - b.discountMerchantJod - (quota === 'none' ? b.platformFeeMerchantJod : 0)
  const merchantJod = quota === 'cod' ? merchantBase + b.platformFeeCustomerJod : merchantBase
  return {
    merchantJod,
    courierJod,
    platformJod: b.totalJod - merchantJod - courierJod,
    quota,
  }
}

/**
 * Tagihan dibulatkan **ke atas** ke ratusan rupiah; sisa jadi milik aplikator
 * (§16.2). Payout memakai arah sebaliknya — lihat `roundPayoutDownToRupiah`.
 */
export function roundBillUpToHundreds(idr: number): number {
  return Math.ceil(idr / 100) * 100
}

/** Payout dibulatkan **ke bawah** ke rupiah penuh (§16.2). */
export function roundPayoutDownToRupiah(idr: number): number {
  return Math.floor(idr)
}

/** Petakan `PaymentMethodId` (kanal) ke jenis pembayaran PRD (§16.2). */
export function payMethodKind(paymentMethodId: string): PayMethodKind {
  if (paymentMethodId === 'dana_qris') return 'qris'
  if (paymentMethodId === 'cod') return 'cod'
  return 'dana'
}

/**
 * Rincian **yang benar-benar ditagih** ke customer, dalam IDR (R-CURR-01: IDR
 * sumber kebenaran, JOD hanya tampilan). Cerminan `priceBreakdown` dengan
 * `Pc` dikonversi dari JOD pada kurs aktif dan `Ft` dihitung sebelum pembulatan
 * tagihan. Dipakai checkout & layar bayar supaya keduanya tak bisa berbeda.
 *
 * `priceBreakdown` (JOD) tetap jadi acuan settlement/ops; `money-check`
 * memastikan kedua jalur itu sepakat.
 */
export interface ChargedBreakdown {
  subtotalIdr: number
  deliveryFeeIdr: number
  discountIdr: number
  platformFeeCustomerIdr: number
  transactionFeeIdr: number
  totalIdr: number
}

export interface ChargedInput {
  subtotalIdr: number
  deliveryFeeIdr?: number
  discountIdr?: number
  method: PayMethodKind
}

export function chargedBreakdown(input: ChargedInput): ChargedBreakdown {
  const subtotalIdr = input.subtotalIdr
  const deliveryFeeIdr = Math.max(0, input.deliveryFeeIdr ?? 0)
  const discountIdr = Math.min(input.discountIdr ?? 0, subtotalIdr + deliveryFeeIdr)
  const platformFeeCustomerIdr = jodToIdr(PLATFORM_FEE_CUSTOMER_DEFAULT_JOD)
  const net = subtotalIdr - discountIdr + deliveryFeeIdr + platformFeeCustomerIdr
  const transactionFeeIdr = input.method === 'qris' ? Math.round(net * TRANSACTION_FEE_RATE) : 0
  return {
    subtotalIdr,
    deliveryFeeIdr,
    discountIdr,
    platformFeeCustomerIdr,
    transactionFeeIdr,
    totalIdr: roundBillUpToHundreds(net + transactionFeeIdr),
  }
}

