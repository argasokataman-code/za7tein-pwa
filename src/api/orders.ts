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
import type { MerchantOrder, MerchantOrderStatus, PaymentMethod, ZoneId } from '../types'
import { create, patchRow, rest, signIn } from './supabase'

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

/** Tulis order baru. Detail item tidak dikirim: `order_items` belum dipetakan. */
export async function createOrder(order: NewOrder): Promise<void> {
  await ensureCustomerSession()
  await create('orders', {
    code: order.code,
    customer_id: DEMO_CUSTOMER_ID,
    merchant_id: DEMO_MERCHANT_ID,
    delivery_address_id: DEMO_ADDRESS_ID,
    sub_total_jod: idrToJod(order.subTotalIdr),
    delivery_fee_jod: idrToJod(order.deliveryFeeIdr),
    platform_fee_jod: idrToJod(order.platformFeeIdr),
    total_jod: idrToJod(order.totalIdr),
    payment_method: OUT_PAYMENT[order.paymentMethod] ?? 'cod',
  })
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
  const oidRaw = String(orderId)
  const oid = Number(/^api-(\d+)$/.exec(oidRaw)?.[1] ?? (/^\d+$/.test(oidRaw) ? oidRaw : NaN))
  const cidRaw = String(courierId)
  const cid = /^\d+$/.test(cidRaw) ? Number(cidRaw) : NaN
  if (!Number.isFinite(oid) || !Number.isFinite(cid)) return
  await ensureMerchantSession()
  await patchRow('orders', `?id=eq.${oid}`, { courier_id: cid })
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
  disiapkan: 'disiapkan',
  ready: 'siap',
  siap: 'siap',
  delivering: 'diantar',
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

let customerSession: Promise<void> | null = null
let merchantSession: Promise<void> | null = null

/** Login sekali per sesi halaman; RLS `orders` menuntut token, bukan anon key. */
function ensureCustomerSession(): Promise<void> {
  if (!customerSession) customerSession = signIn(DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD)
  return customerSession
}

function ensureMerchantSession(): Promise<void> {
  if (!merchantSession) {
    merchantSession = signIn(DEMO_MERCHANT_EMAIL, DEMO_MERCHANT_PASSWORD)
  }
  return merchantSession
}

export async function fetchMerchantOrders(merchantId = DEMO_MERCHANT_ID): Promise<MerchantOrder[]> {
  await ensureMerchantSession()
  const rows = await rest<OrderRow>(
    'orders',
    `?select=id,code,status,customer_id,merchant_id,total_jod,payment_method,zone_code,created_at,placed_at,courier_id&merchant_id=eq.${merchantId}&order=created_at.desc`,
  )
  return rows.map(toMerchantOrder)
}
