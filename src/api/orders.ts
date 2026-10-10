/**
 * Order flow ↔ PostgREST. Dua arah dari satu tabel `orders`: customer menulis
 * (`POST /orders`), merchant membaca (`GET /orders?merchant_id=eq.<id>`).
 *
 * Kontrak kolom live (Supabase) memakai JOD + snake_case; repo ini menyimpan
 * IDR (R-CURR-01), jadi konversi lewat `idrToJod`/`jodToIdr` sekali di sini.
 *
 * Id demo tunggal: `customer@` & `merchant@` = baris 1 di backend. Repo ini
 * mock (AGENTS.md §1) tanpa sesi sungguhan, jadi id pelanggan/merchant/alamat
 * dipatok. Saat auth nyata masuk, ketiganya berasal dari sesi.
 */
import { idrToJod, jodToIdr } from '../data/currency'
import type {
  CourierTask,
  MerchantOrder,
  MerchantOrderStatus,
  OrderStage,
  PaymentMethod,
  ZoneId,
} from '../types'
import { createWith, createWithReturn, patch, restWith, signInToken } from './supabase'

const DEMO_CUSTOMER_ID = 1
const DEMO_MERCHANT_ID = 1
const DEMO_ADDRESS_ID = 1

/** Akun demo — RLS `orders` menuntut sesi login (anon ditolak), jadi login dulu. */
const DEMO_MERCHANT_EMAIL =
  (import.meta.env.VITE_DEMO_MERCHANT_EMAIL as string | undefined) || 'merchant@sa7tein.app'
const DEMO_MERCHANT_PASSWORD =
  (import.meta.env.VITE_DEMO_MERCHANT_PASSWORD as string | undefined) || 'demo1234'
const DEMO_CUSTOMER_EMAIL =
  (import.meta.env.VITE_DEMO_CUSTOMER_EMAIL as string | undefined) || 'customer@sa7tein.app'
const DEMO_CUSTOMER_PASSWORD =
  (import.meta.env.VITE_DEMO_CUSTOMER_PASSWORD as string | undefined) || 'demo1234'
/** Akun demo kurir (Budi, `couriers.id = 1`, `user_id = 3`). */
const DEMO_COURIER_EMAIL =
  (import.meta.env.VITE_DEMO_COURIER_EMAIL as string | undefined) || 'courier@sa7tein.app'
const DEMO_COURIER_PASSWORD =
  (import.meta.env.VITE_DEMO_COURIER_PASSWORD as string | undefined) || 'demo1234'
const DEMO_COURIER_ID = Number(import.meta.env.VITE_DEMO_COURIER_ID ?? 1)

interface OrderRow {
  id: number
  code: string
  status: string
  customer_id: number
  merchant_id: number
  total_jod: number
  payment_method: string
  zone_code: string | null
  created_at: string
  placed_at: string | null
  courier_id: number | null
}

export interface NewOrder {
  code: string
  subTotalIdr: number
  deliveryFeeIdr: number
  platformFeeIdr: number
  totalIdr: number
  paymentMethod: PaymentMethod['id']
  /** Zona kirim (hijazi/syimali) — dibaca merchant/kurir sebagai alamat. */
  zoneCode?: ZoneId
}

/**
 * Metode bayar app → kolom backend. Backend belum memodelkan pembayaran saldo
 * (`wallet`): check `orders_payment_method_check` hanya menerima
 * cod/transfer/xendit_va/xendit_qris, jadi saldo dipetakan ke VA sebagai proksi
 * (MISMATCH, menunggu keputusan kontrak). Nilai baca kembali lewat `PAYMENT_IDS`.
 */
const OUT_PAYMENT: Record<PaymentMethod['id'], string> = {
  wallet: 'xendit_va',
  cod: 'cod',
  transfer: 'transfer',
  xendit_va: 'xendit_va',
  xendit_qris: 'xendit_qris',
}

const PAYMENT_IDS: readonly string[] = ['cod', 'transfer', 'xendit_va', 'xendit_qris']

/** `SA-` + epoch basis-36 — cukup unik untuk demo, tak menabrak kode seed `SA-10xx`. */
export function nextOrderCode(): string {
  return `SA-${Date.now().toString(36).toUpperCase()}`
}

/** Tulis order baru; kembalikan `{id, code}` baris BE untuk pelacakan customer. */
export async function createOrder(order: NewOrder): Promise<{ id: string; code: string }> {
  const token = await ensureCustomerToken()
  const rows = await createWithReturn<{ id: number; code: string }>(token, 'orders', {
    code: order.code,
    customer_id: DEMO_CUSTOMER_ID,
    merchant_id: DEMO_MERCHANT_ID,
    delivery_address_id: DEMO_ADDRESS_ID,
    sub_total_jod: idrToJod(order.subTotalIdr),
    delivery_fee_jod: idrToJod(order.deliveryFeeIdr),
    platform_fee_jod: idrToJod(order.platformFeeIdr),
    total_jod: idrToJod(order.totalIdr),
    payment_method: OUT_PAYMENT[order.paymentMethod] ?? 'cod',
    zone_code: order.zoneCode ?? null,
  })
  const row = rows[0]
  return { id: String(row?.id ?? ''), code: row?.code ?? order.code }
}

/** `api-<n>` / `<n>` → id numerik; seed non-numerik → NaN. */
function numericOrderId(orderId: string): number {
  const raw = String(orderId)
  return Number(/^api-(\d+)$/.exec(raw)?.[1] ?? (/^\d+$/.test(raw) ? raw : NaN))
}

/**
 * Persist penugasan kurir ke `orders.courier_id` (best-effort).
 *
 * Bentuk id di state: order = `api-<id>` hasil sync BE (atau numerik polos),
 * kurir = `String(id)` BE (numerik) atau seed `cr-*`. Ditulis hanya kalau id
 * benar-benar numerik (`api-N`/`N`, kurir `N`) — seed `cr-*` tak pernah menulis
 * id kurir palsu ke baris order live.
 */
export async function assignOrderCourier(orderId: string, courierId: string): Promise<void> {
  const oid = numericOrderId(orderId)
  const cidRaw = String(courierId)
  const cid = /^\d+$/.test(cidRaw) ? Number(cidRaw) : NaN
  if (!Number.isFinite(oid) || !Number.isFinite(cid)) return
  const token = await ensureMerchantToken()
  await patch(token, 'orders', `?id=eq.${oid}`, { courier_id: cid })
}

/**
 * Status app → nilai `orders_status_check` backend. Backend tak punya
 * `diterima`/`tiba` (OST-1 unresolved), jadi `diterima`→`prepare`,
 * `tiba`→`delivery`; `ditolak`/`batal` sama-sama `canceled`.
 */
const OUT_STATUS: Record<MerchantOrderStatus, string> = {
  baru: 'cart',
  diterima: 'prepare',
  disiapkan: 'prepare',
  siap: 'waitingCourier',
  diantar: 'delivery',
  tiba: 'delivery',
  selesai: 'done',
  ditolak: 'canceled',
  batal: 'canceled',
}

/** Tulis status order ke `orders.status` (best-effort; id seed dilewati). */
export async function updateOrderStatus(
  orderId: string,
  status: MerchantOrderStatus,
): Promise<void> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return
  const token = await ensureMerchantToken()
  await patch(token, 'orders', `?id=eq.${oid}`, { status: OUT_STATUS[status] ?? 'cart' })
}

/** Titik verifikasi kurir — nilai `checkpoints.kind` backend. */
export type CheckpointKind = 'at_store' | 'picked_up' | 'arrived' | 'otp_verified'

const CHECKPOINT_KIND: Partial<Record<CourierTask['checkpoint'], CheckpointKind>> = {
  ambil: 'picked_up',
  berangkat: 'picked_up',
  tiba: 'arrived',
  selesai: 'otp_verified',
}

/** Catat checkpoint kurir ke tabel `checkpoints` (best-effort). */
export async function recordCheckpoint(
  orderId: string,
  checkpoint: CourierTask['checkpoint'],
): Promise<void> {
  const oid = numericOrderId(orderId)
  const kind = CHECKPOINT_KIND[checkpoint]
  if (!Number.isFinite(oid) || !kind) return
  const token = await ensureCourierToken()
  await createWith(token, 'checkpoints', { order_id: oid, kind })
}

/**
 * Status kolom backend → `MerchantOrderStatus`. Backend belum punya `placed`
 * (OST-1 unresolved) dan menandai order baru `cart`, yang dipetakan ke `baru`
 * supaya masuk tab "Antrean".
 */
const STATUS_MAP: Record<string, MerchantOrderStatus> = {
  cart: 'baru',
  quotation: 'baru',
  placed: 'baru',
  baru: 'baru',
  accepted: 'diterima',
  diterima: 'diterima',
  preparing: 'disiapkan',
  prepare: 'disiapkan',
  disiapkan: 'disiapkan',
  ready: 'siap',
  siap: 'siap',
  waitingCourier: 'siap',
  waitingDelivery: 'siap',
  delivering: 'diantar',
  delivery: 'diantar',
  diantar: 'diantar',
  arrived: 'tiba',
  tiba: 'tiba',
  done: 'selesai',
  completed: 'selesai',
  selesai: 'selesai',
  rejected: 'ditolak',
  ditolak: 'ditolak',
  cancelled: 'batal',
  canceled: 'batal',
  batal: 'batal',
}

function relativeTime(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.round(hours / 24)} hari lalu`
}

function toMerchantOrder(row: OrderRow): MerchantOrder {
  const zone: ZoneId = row.zone_code === 'syimali' ? 'syimali' : 'hijazi'
  return {
    id: `api-${row.id}`,
    code: row.code,
    customerId: String(row.customer_id),
    // Backend belum menyediakan join nama/alamat/item untuk baris `orders`
    // (tabel `order_items` masih kosong) — kolom yang tak ada diisi netral.
    customerName: `Customer ${row.customer_id}`,
    buyerAvatar: '/assets/img/reviewer/user1.png',
    buyerRating: 0,
    address: row.zone_code ? `Zona ${row.zone_code}` : 'Alamat belum tersedia',
    items: [],
    total: jodToIdr(row.total_jod),
    distanceMeters: 0,
    zone,
    status: STATUS_MAP[row.status] ?? 'baru',
    placedAt: relativeTime(row.placed_at ?? row.created_at),
    paymentMethod: (PAYMENT_IDS.includes(row.payment_method)
      ? row.payment_method
      : 'cod') as PaymentMethod['id'],
    courierId: row.courier_id != null ? String(row.courier_id) : undefined,
  }
}

let customerToken: Promise<string> | null = null
let merchantToken: Promise<string> | null = null
let courierToken: Promise<string> | null = null

/**
 * Token per akun demo (login sekali per sesi halaman). Token eksplisit dipakai
 * untuk tiap tulis — token global `supabase.ts` tak dipakai di sini supaya
 * customer/merchant/courier tidak saling menimpa saat dipanggil bergantian.
 */
function ensureCustomerToken(): Promise<string> {
  if (!customerToken) customerToken = signInToken(DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD)
  return customerToken
}

function ensureMerchantToken(): Promise<string> {
  if (!merchantToken) merchantToken = signInToken(DEMO_MERCHANT_EMAIL, DEMO_MERCHANT_PASSWORD)
  return merchantToken
}

function ensureCourierToken(): Promise<string> {
  if (!courierToken) courierToken = signInToken(DEMO_COURIER_EMAIL, DEMO_COURIER_PASSWORD)
  return courierToken
}

export async function fetchMerchantOrders(merchantId = DEMO_MERCHANT_ID): Promise<MerchantOrder[]> {
  const token = await ensureMerchantToken()
  const rows = await restWith<OrderRow>(
    token,
    'orders',
    `?select=id,code,status,customer_id,merchant_id,total_jod,payment_method,zone_code,created_at,placed_at,courier_id&merchant_id=eq.${merchantId}&order=created_at.desc`,
  )
  return rows.map(toMerchantOrder)
}

/** `orders.status` → tahap kurir (Journey Line, `OrderStage`). */
const STAGE_OF_STATUS: Record<string, OrderStage> = {
  cart: 'baru',
  quotation: 'baru',
  prepare: 'disiapkan',
  waitingCourier: 'siap',
  waitingDelivery: 'siap',
  delivery: 'diantar',
  done: 'selesai',
}

/** `orders.status` → checkpoint yang sudah terlampaui (stepper kurir). */
const CHECKPOINT_OF_STATUS: Record<string, CourierTask['checkpoint']> = {
  cart: 'masuk',
  quotation: 'masuk',
  prepare: 'masuk',
  waitingCourier: 'ambil',
  waitingDelivery: 'berangkat',
  delivery: 'tiba',
  done: 'selesai',
}

/** OTP 4 digit deterministik dari kode order (backend belum memodelkan OTP). */
export function otpOf(code: string): string {
  let sum = 0
  for (const ch of code) sum = (sum * 31 + ch.charCodeAt(0)) % 10000
  return String(sum).padStart(4, '0')
}

function toCourierTask(row: OrderRow): CourierTask {
  const zone: ZoneId = row.zone_code === 'syimali' ? 'syimali' : 'hijazi'
  return {
    id: `api-${row.id}`,
    code: row.code,
    customerId: String(row.customer_id),
    customerName: `Customer ${row.customer_id}`,
    customerPhone: '-',
    address: row.zone_code ? `Zona ${row.zone_code}` : 'Alamat belum tersedia',
    floor: '-',
    unit: '-',
    items: [],
    total: jodToIdr(row.total_jod),
    distanceMeters: 0,
    zone,
    paymentMethod: (PAYMENT_IDS.includes(row.payment_method)
      ? row.payment_method
      : 'cod') as PaymentMethod['id'],
    tip: 0,
    orderStage: STAGE_OF_STATUS[row.status] ?? 'baru',
    checkpoint: CHECKPOINT_OF_STATUS[row.status] ?? 'masuk',
    otp: otpOf(row.code),
  }
}

/** Tugas kurir live = order BE yang ditugaskan ke kurir demo (`courier_id`). */
export async function fetchCourierOrders(courierId = DEMO_COURIER_ID): Promise<CourierTask[]> {
  const token = await ensureCourierToken()
  const rows = await restWith<OrderRow>(
    token,
    'orders',
    `?select=id,code,status,customer_id,merchant_id,total_jod,payment_method,zone_code,created_at,placed_at,courier_id&courier_id=eq.${courierId}&order=created_at.desc`,
  )
  return rows.map(toCourierTask)
}

export interface CustomerOrderLive {
  id: string
  code: string
  status: MerchantOrderStatus
  stage: OrderStage
}

/** Order milik customer demo — dipelacak halaman order customer (live + realtime). */
export async function fetchCustomerOrder(orderId: string): Promise<CustomerOrderLive | null> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return null
  const token = await ensureCustomerToken()
  const rows = await restWith<OrderRow>(
    token,
    'orders',
    `?select=id,code,status&id=eq.${oid}&limit=1`,
  )
  const row = rows[0]
  if (!row) return null
  return {
    id: String(row.id),
    code: row.code,
    status: STATUS_MAP[row.status] ?? 'baru',
    stage: STAGE_OF_STATUS[row.status] ?? 'baru',
  }
}
