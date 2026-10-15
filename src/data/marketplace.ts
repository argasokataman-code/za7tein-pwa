import type {
  Batch,
  CourierAssignment,
  CourierPartner,
  Incident,
  MarketingProgram,
  MerchantCoverage,
  MerchantRuleSelection,
  OrderSettlement,
  PriceBreakdown,
  ProgramReward,
  ProgramRule,
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

// — Batch —

export const mockBatches: Batch[] = [
  {
    id: 'batch-1',
    merchantId: 'merchant-1',
    courierId: 'courier-1',
    orderIds: ['ord-1', 'ord-2'],
    status: 'countdown',
    estimateMinutes: 25,
    countdownSeconds: 1500,
    autoSort: true,
    routeOrder: ['ord-1', 'ord-2'],
    createdAt: '2026-10-15T08:00:00.000Z',
  },
]

// — Kurir partner & assignment —

export const mockCourierPartners: CourierPartner[] = [
  {
    id: 'partner-1',
    name: 'Rani',
    phone: '+962790000001',
    status: 'available',
    completedToday: 3,
    warningLetters: 0,
    lastLocationAt: '2026-10-15T08:05:00.000Z',
    joinedAt: '2026-09-20T00:00:00.000Z',
  },
  {
    id: 'partner-2',
    name: 'Hadi',
    phone: '+962790000002',
    status: 'busy',
    completedToday: 5,
    warningLetters: 1,
    lastLocationAt: '2026-10-15T07:58:00.000Z',
    joinedAt: '2026-09-25T00:00:00.000Z',
  },
]

export const mockAssignments: CourierAssignment[] = [
  {
    id: 'assign-1',
    orderId: 'ord-3',
    partnerId: 'partner-1',
    status: 'pending',
    sentAt: '2026-10-15T08:10:00.000Z',
  },
]

// — Langganan kuota —

export const mockQuotaSubscriptions: QuotaSubscription[] = [
  {
    id: 'quota-order-1',
    merchantId: 'merchant-1',
    kind: 'order',
    quota: 100,
    used: 12,
    reserved: 1,
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    active: true,
  },
  {
    id: 'quota-cod-1',
    merchantId: 'merchant-1',
    kind: 'cod',
    quota: 40,
    used: 3,
    reserved: 0,
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    active: true,
  },
]

/** Setting "Terima order tanpa kuota order?" (§17). */
export const mockAcceptWithoutQuota = true

// — Program marketing —

export const mockMarketingPrograms: MarketingProgram[] = [
  {
    id: 'prog-1',
    owner: 'merchant',
    merchantId: 'merchant-1',
    type: 'promotion',
    trigger: 'auto',
    appliesOn: 'current',
    dateFrom: '2026-10-01',
    dateTo: '2026-12-31',
    limitUsage: null,
    maxUsage: null,
    isStackable: true,
  },
  {
    id: 'prog-2',
    owner: 'platform',
    merchantId: null,
    type: 'promo_code',
    trigger: 'with_code',
    appliesOn: 'current',
    dateFrom: '2026-10-01',
    dateTo: null,
    limitUsage: 1000,
    maxUsage: null,
    isStackable: false,
  },
]

export const mockProgramRules: ProgramRule[] = [
  {
    id: 'rule-1',
    programId: 'prog-1',
    minimumQty: 0,
    minimumAmountJod: 5,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_order',
    rewardPointAmount: 1,
  },
]

export const mockProgramRewards: ProgramReward[] = [
  {
    id: 'reward-1',
    programId: 'prog-1',
    rewardType: 'discount',
    discountMode: 'percent',
    discountPercent: 10,
    discountApplicability: 'order',
    discountMaxAmountJod: 1.5,
  },
]

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

// — Rule dispute —

export const mockRuleSelections: MerchantRuleSelection[] = [
  {
    merchantId: 'merchant-1',
    ruleIds: ['rule-late-1'],
    effectiveFrom: '2026-10-01',
  },
]

export const mockIncidents: Incident[] = [
  {
    id: 'incident-1',
    orderId: 'ord-9',
    reporter: 'customer',
    reporterId: 'cus-1',
    categoryId: 'cat-late',
    description: 'Pesanan tiba lebih dari 20 menit dari estimasi.',
    photoCount: 0,
    status: 'investigating',
    ruleId: 'rule-late-1',
    filedAt: '2026-10-15T07:35:00.000Z',
  },
]

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

