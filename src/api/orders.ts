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
import { deliveryTypeFor, orderStatusLabel } from '../data/merchantOrders'
import type {
  CartItem,
  CourierTask,
  MerchantOrder,
  MerchantOrderStatus,
  OrderPaymentStatus,
  OrderStage,
  PaymentMethod,
  ZoneId,
} from '../types'
import { createWith, createWithReturn, patch, rest, restWith, rpc, sessionFor } from './supabase'
import { refToken } from './reference'
import { chunkIds } from '../data/beMapping'

export const DEMO_CUSTOMER_ID = 1
export const DEMO_MERCHANT_ID = 1
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

interface OrderRow {
  id: number
  code: string
  status: string
  customer_id: number
  merchant_id: number
  total_jod: number
  /** Rincian harga tingkat order (IDR saat dipakai FE). Item-level ada di `order_items`. */
  sub_total_jod?: number | null
  delivery_fee_jod?: number | null
  platform_fee_jod?: number | null
  /** Potongan platform yang dibebankan ke merchant (bukan ke customer). */
  platform_fee_merchant_jod?: number | null
  payment_method: string
  payment_status?: string
  /** Kolom masa depan untuk bukti transfer legacy (belum ada di BE). */
  payment_proof_url?: string | null
  zone_code: string | null
  created_at: string
  placed_at: string | null
  courier_id: number | null
  /** Kolom nyata di D1 (`orders.batch_id`) — batch kurir inhouse order Regular. */
  batch_id?: number | null
  /** `regular` | `quick` (PRD §7). Sebelumnya overlay demo per kode. */
  delivery_type?: string | null
  cook_minutes?: number | null
}

export interface NewOrder {
  code: string
  /** Baris keranjang saat checkout; ditulis ke `order_items` (best-effort). */
  items?: CartItem[]
  subTotalIdr: number
  deliveryFeeIdr: number
  platformFeeIdr: number
  totalIdr: number
  paymentMethod: PaymentMethod['id']
  /** Zona kirim (hijazi/syimali) — dibaca merchant/kurir sebagai alamat. */
  zoneCode?: ZoneId
  /** Promo terpasang di checkout (`marketing.id`) — null kalau tanpa kode. */
  promoId?: number | null
  /** Nilai diskon promo (IDR) yang sudah dipotong dari total. */
  promoDiscountIdr?: number
}

/**
 * Metode bayar app → kolom backend. Enum DB (`orders_payment_method_check`)
 * dan RPC `create_order` sama-sama hanya menerima `qris | dana_balance | cod`.
 * VA/QRIS DANA sama-sama online → `qris`; saldo app → `dana_balance`.
 */
const OUT_PAYMENT: Record<PaymentMethod['id'], string> = {
  wallet: 'dana_balance',
  cod: 'cod',
  // ponytail: `transfer` legacy, tak lagi ditawarkan (PAYMENT_METHODS); BE tak
  // punya enum-nya. Fallback `cod` bila state lama masih menyimpannya.
  transfer: 'cod',
  dana_va: 'qris',
  dana_qris: 'qris',
}

/** Kolom backend → metode bayar app (kebalikan `OUT_PAYMENT`, termasuk nilai DANA lama). */
const IN_PAYMENT: Record<string, PaymentMethod['id']> = {
  cod: 'cod',
  transfer: 'transfer',
  qris: 'dana_qris',
  dana_balance: 'wallet',
  // Nilai lama (pra-alignment) tetap dibaca agar order seed tetap tampil benar.
  xendit_va: 'dana_va',
  xendit_qris: 'dana_qris',
  wallet: 'wallet',
}

/**
 * `payment_status` awal saat checkout (f18). Wallet sudah terpotong (`paid`);
 * DANA/transfer menunggu (`pending`); COD (`unpaid`) tetap boleh dikonfirmasi
 * karena checkout menahan hold saldo (f2) — gerbang merchant memakai aturan ini.
 */
const INITIAL_PAYMENT_STATUS: Record<PaymentMethod['id'], OrderPaymentStatus> = {
  cod: 'unpaid',
  transfer: 'pending',
  wallet: 'paid',
  dana_va: 'pending',
  dana_qris: 'pending',
}

/** `SA-` + epoch basis-36 — cukup unik untuk demo, tak menabrak kode seed `SA-10xx`. */
export function nextOrderCode(): string {
  return `SA-${Date.now().toString(36).toUpperCase()}`
}

/**
 * Tulis order baru; kembalikan `{id, code}` baris BE untuk pelacakan customer.
 *
 * `status` wajib ditulis eksplisit. Default kolom `orders.status` adalah
 * `'cart'` — nilai itu **draft** (keranjang), jadi checkout tanpa `status`
 * meninggalkan order yang tak pernah jadi pesanan dan tak muncul di antrean
 * sebagai order sungguhan. Enum DB tak punya `'placed'`; tahap "sudah dikirim
 * ke toko, menunggu diterima" adalah `'quotation'` (transisi berikutnya
 * `prepare` saat merchant menerima).
 */
export async function createOrder(order: NewOrder): Promise<{ id: string; code: string }> {
  const token = await ensureCustomerToken()
  const rows = await createWithReturn<{ id: number; code: string }>(token, 'orders', {
    code: order.code,
    status: 'quotation',
    placed_at: new Date().toISOString(),
    customer_id: DEMO_CUSTOMER_ID,
    merchant_id: DEMO_MERCHANT_ID,
    delivery_address_id: DEMO_ADDRESS_ID,
    sub_total_jod: idrToJod(order.subTotalIdr),
    delivery_fee_jod: idrToJod(order.deliveryFeeIdr),
    platform_fee_jod: idrToJod(order.platformFeeIdr),
    total_jod: idrToJod(order.totalIdr),
    payment_method: OUT_PAYMENT[order.paymentMethod] ?? 'cod',
    payment_status: INITIAL_PAYMENT_STATUS[order.paymentMethod] ?? 'unpaid',
    zone_code: order.zoneCode ?? null,
    promo_id: order.promoId ?? null,
    promo_amount_jod: idrToJod(order.promoDiscountIdr ?? 0),
    // Serah terima dikunci OTP; tanpa kode, `my_order_otp` mengembalikan null
    // dan `verify_order_otp` kurir tak pernah cocok — order tak bisa selesai
    // sehingga merchant menggantung di Diantar. Kode diturunkan dari kode order
    // supaya customer (menampilkan) dan kurir (mengetik) melihat angka yang sama.
    otp: otpOf(order.code),
  }, 'id,code')
  const row = rows[0]
  const id = String(row?.id ?? '')
  // Rincian item ditulis setelah order ada (butuh `order_id`). Best-effort:
  // checkout tetap jalan kalau tabel menolak, dan layar order jatuh ke
  // snapshot invoice lokal. Kolom nyata D1: `unit_price_jod`, `line_total_jod`.
  if (id && order.items?.length) {
    await Promise.all(
      order.items.map((item) =>
        createWith(token, 'order_items', {
          order_id: Number(id),
          menu_id: /^\d+$/.test(item.menuId ?? '') ? Number(item.menuId) : null,
          name: item.name,
          qty: item.quantity,
          unit_price_jod: idrToJod(item.price),
          line_total_jod: idrToJod(item.price * item.quantity),
          modifiers: item.modifiers ?? null,
          note: item.notes ?? null,
        }).catch(() => {}),
      ),
    )
  }
  return { id, code: row?.code ?? order.code }
}

/** `api-<n>` / `<n>` → id numerik; seed non-numerik → NaN. */
function numericOrderId(orderId: string): number {
  const raw = String(orderId)
  return Number(/^api-(\d+)$/.exec(raw)?.[1] ?? (/^\d+$/.test(raw) ? raw : NaN))
}

/**
 * Antrean tulis per order.
 *
 * Worker D1 menulis satu baris utuh pada PATCH, jadi dua PATCH bersamaan pada
 * order yang sama saling menimpa kolom: `batch_id` hilang kalau `status`
 * ditulis berbarengan (terbukti: dua PATCH paralel → `batch_id` kembali null).
 * Terima order memang menulis keduanya sekaligus, jadi semua penulis baris
 * `orders` lewat antrean ini supaya berurutan, bukan balapan.
 */
const orderWriteQueue = new Map<number, Promise<unknown>>()

export function serializeOrderWrite<T>(orderId: number, task: () => Promise<T>): Promise<T> {
  if (!Number.isFinite(orderId)) return task()
  const prev = orderWriteQueue.get(orderId) ?? Promise.resolve()
  const next = prev.then(task, task)
  orderWriteQueue.set(orderId, next)
  void next
    .catch(() => undefined)
    .then(() => {
      if (orderWriteQueue.get(orderId) === next) orderWriteQueue.delete(orderId)
    })
  return next
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
  await serializeOrderWrite(oid, () => patch(token, 'orders', `?id=eq.${oid}`, { courier_id: cid }))
  // Assignment milik **aplikator** (PRD P1), bukan merchant: RLS menolak tulis
  // `dispatch_assignments`/`couriers` dari sesi merchant (403), jadi penjadwalan
  // memakai sesi CS. Default BE `reserved` = menunggu respons.
  const dispatchToken = await refToken()
  // Guard agar menekan tombol dua kali tidak membuat dua assignment untuk order
  // yang sama.
  const pending = await restWith<{ id: number }>(
    dispatchToken,
    'dispatch_assignments',
    `?select=id&order_id=eq.${oid}&status=eq.reserved&limit=1`,
  ).catch(() => [] as { id: number }[])
  if (!pending.length) {
    await createWith(dispatchToken, 'dispatch_assignments', {
      order_id: oid,
      courier_id: cid,
    }).catch(() => {})
  }
  // Reservasi mitra (PRD P3).
  await patch(dispatchToken, 'couriers', `?id=eq.${cid}`, { availability: 'reserved' }).catch(
    () => {},
  )
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

/**
 * Tulis status order ke `orders.status` (best-effort; id seed dilewati).
 *
 * `extra` menampung kolom yang menyertai sebuah transisi. Untuk pembatalan
 * customer, `f18-order-state` mewajibkan `cancel_by` + `cancel_reason` ikut
 * terkirim, jadi alasan yang dipilih customer tidak berhenti di layar.
 */
export async function updateOrderStatus(
  orderId: string,
  status: MerchantOrderStatus,
  by: 'merchant' | 'courier' | 'customer' = 'merchant',
  extra?: { cancelReason?: string },
): Promise<void> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return
  const token =
    by === 'courier'
      ? await ensureCourierToken()
      : by === 'customer'
        ? await ensureCustomerToken()
        : await ensureMerchantToken()
  await serializeOrderWrite(oid, () =>
    patch(token, 'orders', `?id=eq.${oid}`, {
      status: OUT_STATUS[status] ?? 'cart',
      ...(status === 'batal' || status === 'ditolak'
        ? { cancel_by: by, ...(extra?.cancelReason ? { cancel_reason: extra.cancelReason } : {}) }
        : {}),
    }),
  )
}

/**
 * Tandai `orders.payment_status = 'paid'` — gerbang konfirmasi merchant (f18).
 * Customer memakainya setelah pembayaran DANA/QRIS diterima; merchant memakainya
 * saat memverifikasi bukti transfer. Best-effort (id seed non-numerik dilewati).
 */
export async function markOrderPaid(
  orderId: string,
  by: 'customer' | 'merchant' = 'customer',
): Promise<void> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return
  const token = by === 'merchant' ? await ensureMerchantToken() : await ensureCustomerToken()
  await serializeOrderWrite(oid, () =>
    patch(token, 'orders', `?id=eq.${oid}`, { payment_status: 'paid' }),
  )
}

/** Titik verifikasi kurir — nilai `checkpoints.kind` backend. */
export type CheckpointKind = 'at_store' | 'picked_up' | 'arrived' | 'otp_verified'

const CHECKPOINT_KIND: Partial<Record<CourierTask['checkpoint'], CheckpointKind>> = {
  masuk: 'at_store',
  ambil: 'picked_up',
  berangkat: 'picked_up',
  tiba: 'arrived',
  // `selesai` tidak di sini: `verify_order_otp` sudah menulis `otp_verified`
  // beserta cap waktunya, jadi mencatatnya lagi akan menggandakan checkpoint.
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
 * Kode OTP order untuk **customer** pemiliknya (RPC `my_order_otp`,
 * `SECURITY DEFINER`). Kolom `orders.otp` sengaja tak bisa dibaca langsung, jadi
 * satu-satunya jalur sah adalah RPC ini.
 */
export async function fetchOrderOtp(orderId: string): Promise<string | null> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return null
  const token = await ensureCustomerToken()
  const code = await rpc<string | null>(token, 'my_order_otp', { p_order_id: oid })
  return code || null
}

/**
 * Verifikasi OTP oleh kurir (RPC `verify_order_otp`): BE mencocokkan kode,
 * menandai `orders.otp_verified`, dan mencatat checkpoint `otp_verified`.
 * Kembalikan `true` hanya saat kode benar — kurir tak pernah melihat OTP-nya.
 */
export async function verifyOrderOtp(orderId: string, code: string): Promise<boolean> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return false
  const token = await ensureCourierToken()
  const ok = await rpc<boolean>(token, 'verify_order_otp', { p_order_id: oid, p_code: code })
  return ok === true
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

import { dbTimeMs } from '../data/dbTime'

function relativeTime(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - dbTimeMs(iso)) / 60000))
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.round(hours / 24)} hari lalu`
}

/** Baris `order_items` (nama barang sudah didenormalisasi di BE). */
interface OrderItemRow {
  order_id: number
  menu_id: number | null
  name: string
  qty: number
  line_total_jod: number
  modifiers: string | null
}

/** Baris `customers` — nama/avatar pembeli, join manual (embed dibuang Worker). */
interface CustomerNameRow {
  id: number
  name: string | null
  avatar: string | null
}

function toCartItems(orderId: number, rows: OrderItemRow[]): CartItem[] {
  return rows.map((row, index) => ({
    id: `api-${orderId}-${index}`,
    // `menu_id` yang stabil lintas order; dipakai peringkat menu supaya satu
    // menu tidak muncul sekali per order (id baris di atas memang unik per
    // baris, itu yang membuat daftar "Menu terjual" membengkak).
    menuId: row.menu_id != null ? String(row.menu_id) : undefined,
    name: row.name,
    price: jodToIdr(row.line_total_jod / Math.max(1, row.qty)),
    quantity: row.qty,
    image: '',
    modifiers: row.modifiers ?? undefined,
  }))
}

function toMerchantOrder(
  row: OrderRow,
  items: OrderItemRow[] = [],
  customer?: CustomerNameRow,
): MerchantOrder {
  const zone: ZoneId = row.zone_code === 'syimali' ? 'syimali' : 'hijazi'
  const status: MerchantOrderStatus = STATUS_MAP[row.status] ?? 'baru'
  return {
    id: `api-${row.id}`,
    code: row.code,
    customerId: String(row.customer_id),
    // `order_items` & `customers` di-join manual di `fetchMerchantOrders`
    // (embed PostgREST tak didukung Worker) — kalau kosong, tetap netral.
    customerName: customer?.name ?? `Customer ${row.customer_id}`,
    buyerAvatar: customer?.avatar ?? '/assets/img/reviewer/user1.png',
    buyerRating: 0,
    address: row.zone_code ? `Zona ${row.zone_code}` : 'Alamat belum tersedia',
    items: toCartItems(row.id, items),
    total: jodToIdr(row.total_jod),
    // Subtotal & ongkir dipakai detail order saat baris `order_items` tidak ada
    // (order lama): angka order tetap bisa ditampilkan tanpa mengarang menu.
    subTotalIdr: row.sub_total_jod != null ? jodToIdr(row.sub_total_jod) : undefined,
    deliveryFeeIdr: row.delivery_fee_jod != null ? jodToIdr(row.delivery_fee_jod) : undefined,
    platformFeeIdr: row.platform_fee_jod != null ? jodToIdr(row.platform_fee_jod) : undefined,
    platformFeeMerchantIdr:
      row.platform_fee_merchant_jod != null ? jodToIdr(row.platform_fee_merchant_jod) : undefined,
    distanceMeters: 0,
    zone,
    status,
    // `packed` bukan kolom BE, jadi tiap sync dari BE dulu menghapus centang
    // merchant: status `siap` (waitingCourier) tampil benar di tiket, tapi panel
    // Batch kurir membaca `packed` dan menolak "Setujui mulai lebih awal"
    // dengan alasan "Belum packing" — order 839 (SA-114C6EC2) macet di situ.
    // Status adalah sumber kebenaran; centang lokal hanya untuk dapur.
    packed: status === 'siap' || status === 'diantar' || status === 'tiba' || status === 'selesai',
    placedAt: relativeTime(row.placed_at ?? row.created_at),
    placedAtMs: new Date(row.placed_at ?? row.created_at).getTime(),
    paymentMethod: IN_PAYMENT[row.payment_method] ?? 'cod',
    paymentStatus: (row.payment_status ?? 'unpaid') as OrderPaymentStatus,
    // BE belum punya kolom bukti transfer; kalau nanti ada, UI merchant sudah
    // membaca field ini tanpa perubahan lain.
    paymentProof: row.payment_proof_url ?? undefined,
    // Kolom nyata D1: `delivery_type` menentukan cabang alur terima (Regular →
    // batch, Quick → partner). Overlay per-kode hanya cadangan kalau BE kosong.
    deliveryType: row.delivery_type === 'quick' ? 'quick' : row.delivery_type === 'regular' ? 'regular' : deliveryTypeFor(row.code),
    batchId: row.batch_id != null ? String(row.batch_id) : undefined,
    cookMinutes: row.cook_minutes ?? undefined,
    courierId: row.courier_id != null ? String(row.courier_id) : undefined,
  }
}

/**
 * Token per akun demo (login sekali per sesi halaman, lihat `sessionFor`).
 * Token eksplisit dipakai untuk tiap tulis — token global `supabase.ts` tak
 * dipakai di sini supaya customer/merchant/courier tidak saling menimpa.
 */
export function ensureCustomerToken(): Promise<string> {
  return sessionFor(DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD)
}

/** Sesi merchant demo — dipakai juga oleh modul batch (`api/batches.ts`). */
export function ensureMerchantToken(): Promise<string> {
  return sessionFor(DEMO_MERCHANT_EMAIL, DEMO_MERCHANT_PASSWORD)
}

/** Sesi kurir demo — dipakai modul batch untuk membaca batch yang ditugaskan. */
export function ensureCourierToken(): Promise<string> {
  return sessionFor(DEMO_COURIER_EMAIL, DEMO_COURIER_PASSWORD)
}

/**
 * `in.(...)` dipecah per potongan id. D1 menolak query dengan terlalu banyak
 * variabel SQL; satu query besar membuat seluruh join order 400 dan layar
 * jatuh ke cache ("Gagal memuat data terbaru").
 */
async function restWithIn<T>(
  token: string,
  table: string,
  select: string,
  column: string,
  ids: number[],
): Promise<T[]> {
  const out: T[] = []
  for (const part of chunkIds(ids)) {
    const rows = await restWith<T>(token, table, `?select=${select}&${column}=in.(${part.join(',')})`)
    out.push(...rows)
  }
  return out
}

export async function fetchMerchantOrders(merchantId = DEMO_MERCHANT_ID): Promise<MerchantOrder[]> {
  const token = await ensureMerchantToken()
  const rows = await restWith<OrderRow>(
    token,
    'orders',
    `?select=id,code,status,customer_id,merchant_id,total_jod,sub_total_jod,delivery_fee_jod,platform_fee_jod,platform_fee_merchant_jod,payment_method,payment_status,zone_code,created_at,placed_at,courier_id,batch_id,delivery_type,cook_minutes&merchant_id=eq.${merchantId}&order=created_at.desc`,
  )
  if (!rows.length) return []
  // Embed PostgREST tak didukung Worker → item & pembeli di-join manual dengan
  // `in.(...)` (didukung), satu query per tabel, bukan per order.
  const orderIds = rows.map((row) => row.id)
  const customerIds = [...new Set(rows.map((row) => row.customer_id))]
  const [items, customers] = await Promise.all([
    restWithIn<OrderItemRow>(
      token,
      'order_items',
      'order_id,menu_id,name,qty,line_total_jod,modifiers',
      'order_id',
      orderIds,
    ),
    restWith<CustomerNameRow>(
      token,
      'customers',
      `?select=id,name,avatar&id=in.(${customerIds.join(',')})`,
    ),
  ])
  const itemsByOrder = new Map<number, OrderItemRow[]>()
  for (const item of items) {
    const list = itemsByOrder.get(item.order_id)
    if (list) list.push(item)
    else itemsByOrder.set(item.order_id, [item])
  }
  const customerById = new Map(customers.map((c) => [c.id, c]))
  return rows.map((row) =>
    toMerchantOrder(row, itemsByOrder.get(row.id) ?? [], customerById.get(row.customer_id)),
  )
}

export interface OrderHistoryRow {
  from_status: string | null
  to_status: string
  actor_id: number | null
  at: string
}

/**
 * Riwayat status satu order dari `order_status_history` D1 — satu baris per
 * transisi, lengkap dengan waktunya. Inilah sumber lini masa yang selama ini
 * tidak ada di FE (tabelnya sudah diekspos Worker, `GET /rest/v1/order_status_history`).
 */
export async function fetchOrderHistory(orderId: string): Promise<OrderHistoryRow[]> {
  const numeric = Number(orderId.replace(/^api-/, ''))
  if (!Number.isFinite(numeric)) return []
  return rest<OrderHistoryRow>(
    'order_status_history',
    `?select=from_status,to_status,actor_id,at&order_id=eq.${numeric}&order=at.asc`,
  )
}

/** Label Indonesia dari status DB (untuk baris riwayat). */
export function statusLabelOf(dbStatus: string): string {
  return orderStatusLabel(STATUS_MAP[dbStatus] ?? 'baru')
}

/** Baris `checkpoints` — tonggak fisik kurir, sumber lini masa kedua. */
export interface OrderCheckpointRow {
  kind: string
  at: string
}

/**
 * Checkpoint kurir satu order dari tabel `checkpoints` D1 (`picked_up` /
 * `arrived` / `otp_verified`, ber-cap waktu). Melengkapi `order_status_history`:
 * riwayat status mencatat transisi status, ini mencatat tonggak pengantaran
 * kurir yang tidak selalu memindahkan status order. Tabelnya diekspos Worker.
 */
export async function fetchOrderCheckpoints(orderId: string): Promise<OrderCheckpointRow[]> {
  const numeric = numericOrderId(orderId)
  if (!Number.isFinite(numeric)) return []
  return rest<OrderCheckpointRow>(
    'checkpoints',
    `?select=kind,at&order_id=eq.${numeric}&order=at.asc`,
  )
}

/** `orders.status` → tahap kurir (Journey Line, `OrderStage` — flow f18). */
const STAGE_OF_STATUS: Record<string, OrderStage> = {
  cart: 'baru',
  quotation: 'baru',
  placed: 'baru',
  // Merchant menulis `prepare` saat Terima (`OUT_STATUS`), tapi kontrak draft
  // (`POST /orders/{id}/accept`) memakai `accepted` — dua-duanya masuk dapur.
  accepted: 'disiapkan',
  prepare: 'disiapkan',
  preparing: 'disiapkan',
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

/**
 * Baris RPC `courier_orders()` — tugas kurir yang sudah diperkaya di BE (join
 * customer, alamat, item, tip, jarak) dan dibatasi ke kurir pemanggil.
 */
interface CourierOrderRpcRow {
  id: number
  code: string
  status: string
  customer_id: number
  customer_name: string | null
  customer_phone: string | null
  address_label: string | null
  address_line: string | null
  building: string | null
  floor: string | null
  unit: string | null
  full_address: string | null
  distance_m: number | null
  total_jod: number
  tip_jod: number | null
  payment_method: string
  payment_status: string | null
  zone_code: string | null
  otp_verified: boolean | null
  created_at: string
  placed_at: string | null
  courier_id: number | null
  checkpoint_at: string | null
  items: { name: string; qty: number; line_total_jod: number; modifiers: string | null }[] | null
}

/** Kolom order yang dibutuhkan layar kurir tapi tidak dikirim RPC `courier_orders()`. */
interface CourierTaskExtraRow {
  id: number
  merchant_id: number | null
  order_note: string | null
  delivery_fee_jod: number | null
  delivery_deadline: string | null
  delivery_address_id: number | null
}

interface PickupRow {
  id: number
  store_name: string | null
  store_address: string | null
  store_phone: string | null
  latitude: number | null
  longitude: number | null
}

interface CoordRow {
  id: number
  latitude: number | null
  longitude: number | null
}

/** Data tambahan per order kurir: titik ambil, catatan, tenggat, koordinat antar. */
interface CourierTaskExtra {
  pickup?: { name?: string; address?: string; phone?: string; latitude?: number; longitude?: number }
  note?: string
  deadlineAt?: string | null
  deliveryFeeIdr: number
  latitude?: number
  longitude?: number
}

/**
 * Kumpulkan data yang tidak ada di RPC kurir (toko, catatan, tenggat, koordinat
 * antar). Tiga query per penyegaran, bukan per order, dan semuanya best-effort:
 * gagal baca = layar tetap tampil tanpa blok tambahan, bukan kosong.
 */
async function fetchCourierTaskExtras(
  token: string,
  orderIds: number[],
): Promise<Map<number, CourierTaskExtra>> {
  const out = new Map<number, CourierTaskExtra>()
  if (!orderIds.length) return out
  try {
    const rows = await restWithIn<CourierTaskExtraRow>(
      token,
      'orders',
      'id,merchant_id,order_note,delivery_fee_jod,delivery_deadline,delivery_address_id',
      'id',
      orderIds,
    )
    const merchantIds = [
      ...new Set(rows.map((row) => row.merchant_id).filter((id): id is number => id != null)),
    ]
    const addressIds = [
      ...new Set(rows.map((row) => row.delivery_address_id).filter((id): id is number => id != null)),
    ]
    const [merchants, addresses] = await Promise.all([
      merchantIds.length
        ? restWith<PickupRow>(
            token,
            'merchants',
            `?select=id,store_name,store_address,store_phone,latitude,longitude&id=in.(${merchantIds.join(',')})`,
          )
        : Promise.resolve<PickupRow[]>([]),
      addressIds.length
        ? restWith<CoordRow>(
            token,
            'addresses',
            `?select=id,latitude,longitude&id=in.(${addressIds.join(',')})`,
          )
        : Promise.resolve<CoordRow[]>([]),
    ])
    const merchantById = new Map(merchants.map((m) => [m.id, m]))
    const addressById = new Map(addresses.map((a) => [a.id, a]))
    for (const row of rows) {
      const store = row.merchant_id != null ? merchantById.get(row.merchant_id) : undefined
      const point =
        row.delivery_address_id != null ? addressById.get(row.delivery_address_id) : undefined
      out.set(row.id, {
        pickup: store
          ? {
              name: store.store_name ?? undefined,
              address: store.store_address ?? undefined,
              phone: store.store_phone ?? undefined,
              latitude: store.latitude ?? undefined,
              longitude: store.longitude ?? undefined,
            }
          : undefined,
        note: row.order_note ?? undefined,
        deadlineAt: row.delivery_deadline,
        deliveryFeeIdr: jodToIdr(row.delivery_fee_jod ?? 0),
        latitude: point?.latitude ?? undefined,
        longitude: point?.longitude ?? undefined,
      })
    }
  } catch {
    /* best-effort: blok tambahan hilang, tugas tetap tampil */
  }
  return out
}

function toCourierTask(row: CourierOrderRpcRow, extra?: CourierTaskExtra): CourierTask {
  const zone: ZoneId = row.zone_code === 'syimali' ? 'syimali' : 'hijazi'
  const items: CartItem[] = (row.items ?? []).map((it, index) => ({
    id: `api-${row.id}-${index}`,
    name: it.name,
    price: jodToIdr(it.line_total_jod / Math.max(1, it.qty)),
    quantity: it.qty,
    image: '',
    modifiers: it.modifiers ?? undefined,
  }))
  return {
    id: `api-${row.id}`,
    code: row.code,
    customerId: String(row.customer_id),
    customerName: row.customer_name ?? `Customer ${row.customer_id}`,
    customerPhone: row.customer_phone ?? '-',
    // Jalan dulu, bukan `full_address`: `full_address` di BE sudah memuat
    // lantai/unit ("Meral · 2 · A1"), lalu layar menambahkannya lagi sehingga
    // alamat terbaca "Meral · 2 · A1 · 2 · A1".
    address:
      row.address_line ??
      row.full_address ??
      (row.zone_code ? `Zona ${row.zone_code}` : 'Alamat belum tersedia'),
    floor: row.floor ?? '-',
    unit: row.unit ?? '-',
    items,
    total: jodToIdr(row.total_jod),
    // `distance_m` dari RPC masih null; jangan diisi 0 (= "sudah di depan pintu").
    distanceMeters: row.distance_m ?? null,
    zone,
    paymentMethod: IN_PAYMENT[row.payment_method] ?? 'cod',
    tip: jodToIdr(row.tip_jod ?? 0),
    orderStage: STAGE_OF_STATUS[row.status] ?? 'baru',
    checkpoint: CHECKPOINT_OF_STATUS[row.status] ?? 'masuk',
    checkpointStartedAt: row.checkpoint_at ?? undefined,
    pickupName: extra?.pickup?.name,
    pickupAddress: extra?.pickup?.address,
    pickupPhone: extra?.pickup?.phone,
    pickupLatitude: extra?.pickup?.latitude,
    pickupLongitude: extra?.pickup?.longitude,
    note: extra?.note,
    deadlineAt: extra?.deadlineAt ?? null,
    deliveryFeeIdr: extra?.deliveryFeeIdr ?? 0,
    latitude: extra?.latitude,
    longitude: extra?.longitude,
    // Kurir tidak pernah tahu OTP (customer yang menunjukkan); verifikasinya
    // lewat RPC `verify_order_otp`, bukan perbandingan lokal.
    otp: '',
    otpVerified: row.otp_verified ?? false,
  }
}

/**
 * Tugas kurir live = order yang ditugaskan ke kurir pemanggil, diperkaya di BE
 * lewat RPC `courier_orders()`. RPC-nya `SECURITY DEFINER` dan menyaring dengan
 * `app_uid()`, jadi kurir hanya menerima order miliknya tanpa perlu grant tabel
 * `customers`/`addresses` (yang menutup aksesnya lewat RLS).
 */
export async function fetchCourierOrders(): Promise<CourierTask[]> {
  const token = await ensureCourierToken()
  const rows = await rpc<CourierOrderRpcRow[]>(token, 'courier_orders')
  if (!rows.length) return []
  const extras = await fetchCourierTaskExtras(
    token,
    rows.map((row) => row.id),
  )
  return rows.map((row) => toCourierTask(row, extras.get(row.id)))
}

/**
 * Satu baris riwayat kurir (`/courier/orders` tab Riwayat). Sengaja bukan
 * `CourierTask`: order yang sudah berakhir tidak butuh checkpoint, OTP, atau
 * item, dan D1 **tidak menyimpan waktu selesai** — yang ada hanya
 * `created_at`. Karena itu `at` diisi waktu order dibuat dan halaman
 * menampilkannya sebagai tanggal, bukan mengaku waktu antar selesai.
 */
export interface CourierHistoryItem {
  /** `api-<orders.id>`; id mentah dipakai untuk tautan detail. */
  id: string
  code: string
  customerName: string
  status: 'selesai' | 'batal'
  /** `orders.created_at` (ISO) atau null bila BE tak mengirimnya. */
  at: string | null
  /** Ongkir yang jadi hak kurir; 0 untuk COD (dibayar merchant di luar app). */
  feeIdr: number
}

interface CourierHistoryRow {
  id: number
  code: string
  status: string
  customer_id: number | null
  delivery_fee_jod: number | null
  created_at: string | null
}

/** `sub` JWT = id user BE; `couriers.user_id` memakainya, bukan `couriers.id`. */
function jwtSub(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Number(payload?.sub)
  } catch {
    return NaN
  }
}

/**
 * Riwayat order kurir yang sedang masuk: order `done`/`canceled` dengan
 * `courier_id` miliknya, terbaru dulu. `courier_orders()` hanya mengembalikan
 * tugas berjalan, jadi riwayat dibaca dari tabel `orders` langsung; nama
 * customer diambil sekali lewat `customers` dan namanya kosong bila tak
 * ditemukan (bukan dikarang).
 */
export async function fetchCourierHistory(): Promise<CourierHistoryItem[]> {
  const token = await ensureCourierToken()
  const uid = jwtSub(token)
  if (!Number.isFinite(uid)) return []
  const couriers = await rest<{ id: number }>('couriers', `?select=id&user_id=eq.${uid}&limit=1`)
  const courierId = couriers[0]?.id
  if (!courierId) return []
  const rows = await rest<CourierHistoryRow>(
    'orders',
    `?select=id,code,status,customer_id,delivery_fee_jod,created_at&courier_id=eq.${courierId}` +
      '&status=in.(done,canceled)&order=id.desc&limit=50',
  )
  if (!rows.length) return []
  const customerIds = [...new Set(rows.map((row) => row.customer_id).filter((id): id is number => !!id))]
  const names = new Map<number, string>()
  if (customerIds.length) {
    try {
      const customers = await rest<{ id: number; name: string | null }>(
        'customers',
        `?select=id,name&id=in.(${customerIds.join(',')})`,
      )
      for (const customer of customers) names.set(customer.id, customer.name ?? '')
    } catch {
      /* best-effort: nama kosong lebih baik daripada riwayat hilang */
    }
  }
  return rows.map((row) => ({
    id: `api-${row.id}`,
    code: row.code,
    customerName: row.customer_id ? names.get(row.customer_id) || 'Pelanggan' : 'Pelanggan',
    status: row.status === 'canceled' ? 'batal' : 'selesai',
    at: row.created_at,
    feeIdr: jodToIdr(row.delivery_fee_jod ?? 0),
  }))
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

/** Rincian order customer untuk layar journey (`/order-placed`). */
export interface CustomerOrderDetail {
  id: string
  code: string
  dbStatus: string
  stage: OrderStage
  createdAt: string
  /** Toko asal beserta jam buka (jam D1, bukan konstanta mock). */
  merchantName: string | null
  merchantOpen: string | null
  merchantClose: string | null
  /** Kurir yang ditugaskan; `null` selama order belum punya `courier_id`. */
  courierName: string | null
  courierPhone: string | null
  address: {
    label: string
    building: string
    floor: string
    unit: string
    line: string
  } | null
  items: { id: string; name: string; qty: number; lineTotalIdr: number }[]
  subTotalIdr: number
  deliveryFeeIdr: number
  platformFeeIdr: number
  promoAmountIdr: number
  totalIdr: number
  paymentMethod: PaymentMethod['id'] | null
}

interface OrderDetailRow extends OrderRow {
  sub_total_jod: number | null
  delivery_fee_jod: number | null
  platform_fee_jod: number | null
  promo_amount_jod: number | null
  delivery_address_id: number | null
}

/**
 * Satu order customer + relasi yang dibutuhkan layar journey: toko, kurir,
 * alamat, dan rincian item. Join dikerjakan manual (Worker menolak embed
 * PostgREST), dan tiap bagian gagal-sendiri supaya order tetap tampil walau
 * salah satu tabel menolak.
 */
export async function fetchCustomerOrderDetail(
  orderId: string,
): Promise<CustomerOrderDetail | null> {
  const oid = numericOrderId(orderId)
  if (!Number.isFinite(oid)) return null
  const token = await ensureCustomerToken()
  const rows = await restWith<OrderDetailRow>(
    token,
    'orders',
    `?select=id,code,status,merchant_id,courier_id,delivery_address_id,sub_total_jod,delivery_fee_jod,platform_fee_jod,promo_amount_jod,total_jod,payment_method,created_at&id=eq.${oid}&limit=1`,
  )
  const row = rows[0]
  if (!row) return null

  const [merchants, couriers, addresses, items] = await Promise.all([
    restWith<{ id: number; store_name: string | null; open_time: string | null; close_time: string | null }>(
      token,
      'merchants',
      `?select=id,store_name,open_time,close_time&id=eq.${row.merchant_id}&limit=1`,
    ).catch(() => []),
    row.courier_id
      ? restWith<{ id: number; name: string; phone: string | null }>(
          token,
          'couriers',
          `?select=id,name,phone&id=eq.${row.courier_id}&limit=1`,
        ).catch(() => [])
      : Promise.resolve([]),
    row.delivery_address_id
      ? restWith<{
          label: string | null
          name: string | null
          building: string | null
          floor: string | null
          unit: string | null
          address: string | null
        }>(
          token,
          'addresses',
          `?select=label,name,building,floor,unit,address&id=eq.${row.delivery_address_id}&limit=1`,
        ).catch(() => [])
      : Promise.resolve([]),
    restWith<{ id: number; name: string; qty: number; line_total_jod: number | null }>(
      token,
      'order_items',
      `?select=id,name,qty,line_total_jod&order_id=eq.${row.id}&order=id.asc`,
    ).catch(() => []),
  ])

  const merchant = merchants[0]
  const courier = couriers[0]
  const addr = addresses[0]
  return {
    id: String(row.id),
    code: row.code,
    dbStatus: row.status,
    stage: STAGE_OF_STATUS[row.status] ?? 'baru',
    createdAt: row.created_at,
    merchantName: merchant?.store_name ?? null,
    merchantOpen: merchant?.open_time ?? null,
    merchantClose: merchant?.close_time ?? null,
    courierName: courier?.name ?? null,
    courierPhone: courier?.phone ?? null,
    address: addr
      ? {
          label: addr.label ?? addr.name ?? '',
          building: addr.building ?? '',
          floor: addr.floor ?? '',
          unit: addr.unit ?? '',
          line: addr.address ?? '',
        }
      : null,
    items: items.map((item) => ({
      id: String(item.id),
      name: item.name,
      qty: item.qty,
      lineTotalIdr: jodToIdr(item.line_total_jod ?? 0),
    })),
    subTotalIdr: jodToIdr(row.sub_total_jod ?? 0),
    deliveryFeeIdr: jodToIdr(row.delivery_fee_jod ?? 0),
    platformFeeIdr: jodToIdr(row.platform_fee_jod ?? 0),
    promoAmountIdr: jodToIdr(row.promo_amount_jod ?? 0),
    totalIdr: jodToIdr(row.total_jod ?? 0),
    paymentMethod: IN_PAYMENT[row.payment_method] ?? null,
  }
}

/** Status `orders` yang masih berjalan (belum `done`/`canceled`). */const ACTIVE_DB_STATUSES = [
  'cart',
  'quotation',
  'placed',
  'prepare',
  'waitingCourier',
  'waitingDelivery',
  'delivery',
]

/** Satu order customer yang masih berjalan — satu baris di ringkasan pesanan. */
export interface CustomerActiveOrder {
  id: string
  code: string
  merchantId: string
  merchantName: string
  /**
   * Status mentah `orders.status`. Dua nilai artinya beda UX: `cart` = draft
   * (belum pernah dikirim ke toko), `quotation` = menunggu toko menerima.
   * Keduanya dipetakan ke `status: 'baru'`, jadi tanpa kolom ini baris draft
   * tak bisa dibedakan dari pesanan sungguhan.
   */
  dbStatus: string
  status: MerchantOrderStatus
  stage: OrderStage
  totalIdr: number
  /** Waktu relatif order dibuat ("12 menit lalu") — pembeda saat satu toko
      punya beberapa order, memakai format yang sama dengan konsol merchant. */
  placedAt: string
  /** `created_at` dalam milidetik epoch — dipakai jendela batal 1 menit
      (`cancelWindowRemainingMs`); `placedAt` teks tak bisa dihitung mundur. */
  createdAtMs: number
  items: { name: string; qty: number }[]
}

/**
 * Semua order customer yang masih berjalan, satu baris per order. Customer boleh
 * punya beberapa order dari toko berbeda sekaligus (§6 multi-order), jadi ini
 * daftar, bukan satu `activeOrder`. RLS `orders_participant` membatasi ke order
 * milik pemanggil; join nama toko + rincian item gagal-per-bagian (catch) supaya
 * ringkasan tetap tampil walau salah satu tabel tak terbaca.
 */
export async function fetchCustomerActiveOrders(
  customerId = DEMO_CUSTOMER_ID,
): Promise<CustomerActiveOrder[]> {
  const token = await ensureCustomerToken()
  const rows = await restWith<OrderRow>(
    token,
    'orders',
    `?select=id,code,status,merchant_id,total_jod,created_at&customer_id=eq.${customerId}&status=in.(${ACTIVE_DB_STATUSES.join(',')})&order=created_at.desc`,
  )
  if (!rows.length) return []

  const merchantIds = [...new Set(rows.map((r) => r.merchant_id))]
  const orderIds = rows.map((r) => r.id)
  const [merchants, dishes] = await Promise.all([
    restWith<{ id: number; store_name: string | null }>(
      token,
      'merchants',
      `?select=id,store_name&id=in.(${merchantIds.join(',')})`,
    ).catch(() => []),
    restWithIn<{ order_id: number; name: string; qty: number }>(
      token,
      'order_items',
      'order_id,name,qty',
      'order_id',
      orderIds,
    ).catch(() => []),
  ])

  const byId = new Map(merchants.map((m) => [m.id, m.store_name ?? 'Toko']))
  const itemsBy = new Map<number, { name: string; qty: number }[]>()
  for (const dish of dishes) {
    itemsBy.set(dish.order_id, [...(itemsBy.get(dish.order_id) ?? []), { name: dish.name, qty: dish.qty }])
  }
  return rows.map((r) => ({
    id: String(r.id),
    code: r.code,
    merchantId: String(r.merchant_id),
    merchantName: byId.get(r.merchant_id) ?? 'Toko',
    dbStatus: r.status,
    status: STATUS_MAP[r.status] ?? 'baru',
    stage: STAGE_OF_STATUS[r.status] ?? 'baru',
    totalIdr: jodToIdr(r.total_jod),
    placedAt: relativeTime(r.created_at),
    createdAtMs: dbTimeMs(r.created_at),
    items: itemsBy.get(r.id) ?? [],
  }))
}
