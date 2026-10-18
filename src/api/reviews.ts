/**
 * Ulasan merchant & hidangan + balasan (`rating_reviews`, `review_replies`).
 *
 * Satu tabel `rating_reviews` menampung dua jenis baris:
 *   - ulasan **toko**: `merchant_id` terisi, `menu_id` null
 *   - ulasan **hidangan**: `menu_id` terisi, `merchant_id` null
 * jadi ulasan hidangan milik seorang merchant disaring lewat join
 * `menus.merchant_id`, bukan kolom `merchant_id` di baris ulasan.
 *
 * Baca memakai sesi referensi (`refToken`, akun cs): nama pemberi ulasan ada di
 * `customers`, yang RLS-nya hanya terbuka untuk ops/pemilik — sesi merchant
 * mengembalikan nol baris. Tulis balasan memakai sesi merchant
 * (`merchantToken`), sesuai RLS `review_replies_owner`.
 */
import { DEMO_MERCHANT_ID, merchantToken, refToken } from './reference'
import { DEMO_CUSTOMER_ID, ensureCustomerToken } from './orders'
import { jodToIdr } from '../data/currency'
import { createWith, restWith } from './supabase'

export interface ReviewReply {
  id: string
  body: string
  createdAt: string
}

export interface ReviewItem {
  id: string
  /** `store` = penilaian toko, `dish` = penilaian satu hidangan. */
  kind: 'store' | 'dish'
  rating: number
  text: string | null
  createdAt: string
  customerName: string
  avatar: string
  /** Nama hidangan untuk `kind: 'dish'`, `null` untuk ulasan toko. */
  dishName: string | null
  orderId: number | null
  reply: ReviewReply | null
}

/** Satu hidangan yang bisa dinilai pada sebuah order (§20.2: bintang, tanpa review). */
export interface RateableDish {
  /** Id baris `order_items` — kunci daftar/UI. */
  id: string
  /** `menus.id` sasaran rating; `null` bila item tak tertaut menu. */
  menuId: number | null
  name: string
  /** Jumlah porsi — dasar "Pesan lagi" mengisi keranjang dengan angka yang sama. */
  qty?: number
}

/** Order customer yang sudah selesai dan belum diulas. */
export interface ReviewableOrder {
  id: number
  code: string
  merchantId: number
  merchantName: string
  createdAt: string
  /** Hidangan yang dipesan — sasaran rating menu item. Kosong bila BE belum mengirimnya. */
  items: RateableDish[]
}

interface ReviewRow {
  id: number
  order_id: number | null
  customer_id: number | null
  menu_id: number | null
  rating: number
  review: string | null
  created_at: string
}

interface ReplyRow {
  id: number
  review_id: number
  body: string
  created_at: string
}

interface CustomerRow {
  id: number
  name: string | null
  avatar: string | null
}

/** `menus` di-join manual: embed `menus!inner(...)` ditolak Worker (400). */
interface MenuNameRow {
  id: number
  name: string | null
}

const STORE_SELECT = 'id,order_id,customer_id,menu_id,rating,review,created_at'

/** Satu ulasan → bentuk tampilan; `dishName` diisi dari peta `menus`. */
function toReview(
  row: ReviewRow,
  customers: Map<number, CustomerRow>,
  replies: Map<number, ReplyRow>,
  menus: Map<number, MenuNameRow>,
): ReviewItem {
  const customer = row.customer_id != null ? customers.get(row.customer_id) : undefined
  const reply = replies.get(row.id)
  const dish = row.menu_id != null ? menus.get(row.menu_id) : undefined
  return {
    id: String(row.id),
    kind: row.menu_id != null ? 'dish' : 'store',
    rating: row.rating,
    text: row.review,
    createdAt: row.created_at,
    customerName: customer?.name ?? 'Pelanggan',
    avatar: customer?.avatar ?? '/assets/img/profile.png',
    dishName: dish?.name ?? null,
    orderId: row.order_id,
    reply: reply ? { id: String(reply.id), body: reply.body, createdAt: reply.created_at } : null,
  }
}

/**
 * Semua ulasan yang menyangkut satu merchant: ulasan toko + ulasan hidangannya,
 * terbaru dulu, lengkap dengan balasan toko bila ada.
 */
export async function fetchMerchantReviews(
  merchantId = DEMO_MERCHANT_ID,
): Promise<ReviewItem[]> {
  const token = await refToken()
  const [store, dish, replies] = await Promise.all([
    restWith<ReviewRow>(
      token,
      'rating_reviews',
      `?select=${STORE_SELECT}&merchant_id=eq.${merchantId}&menu_id=is.null&deleted_at=is.null&order=created_at.desc`,
    ),
    restWith<ReviewRow>(
      token,
      'rating_reviews',
      `?select=${STORE_SELECT}&merchant_id=eq.${merchantId}&menu_id=not.is.null&deleted_at=is.null&order=created_at.desc`,
    ),
    restWith<ReplyRow>(token, 'review_replies', '?select=id,review_id,body,created_at'),
  ])

  const rows = [...store, ...dish]
  const customerIds = [...new Set(rows.flatMap((r) => (r.customer_id != null ? [r.customer_id] : [])))]
  const menuIds = [...new Set(rows.flatMap((r) => (r.menu_id != null ? [r.menu_id] : [])))]
  const [customers, menus] = await Promise.all([
    customerIds.length
      ? restWith<CustomerRow>(
          token,
          'customers',
          `?select=id,name,avatar&id=in.(${customerIds.join(',')})`,
        )
      : Promise.resolve([]),
    menuIds.length
      ? restWith<MenuNameRow>(token, 'menus', `?select=id,name&id=in.(${menuIds.join(',')})`)
      : Promise.resolve([]),
  ])
  const byCustomer = new Map(customers.map((c) => [c.id, c]))
  const byMenu = new Map(menus.map((m) => [m.id, m]))
  const byReview = new Map(replies.map((r) => [r.review_id, r]))

  return rows
    .map((row) => toReview(row, byCustomer, byReview, byMenu))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Balasan toko atas satu ulasan. Satu ulasan satu balasan (yang sudah ada diganti). */
export async function replyToReview(
  reviewId: string,
  body: string,
  merchantId = DEMO_MERCHANT_ID,
): Promise<void> {
  const token = await merchantToken()
  await createWith(token, 'review_replies', {
    review_id: Number(reviewId),
    merchant_id: merchantId,
    body: body.trim(),
  })
}

interface OrderRow {
  id: number
  code: string
  merchant_id: number
  created_at: string
  total_jod?: number
}

/** Baris `order_items` saat dibaca bersama nama hidangannya. */
interface OrderItemRow {
  id: number
  order_id: number
  menu_id: number | null
  qty?: number
  menus?: { name: string } | null
}

/**
 * Hidangan per order untuk rating menu item (§20.2). **Best-effort**: tabel
 * `order_items` di BE demo masih kosong dan bentuk kolomnya belum final, jadi
 * kegagalan apa pun dikembalikan sebagai peta kosong — riwayat pesanan tidak
 * boleh ikut gagal hanya karena hidangan belum tersedia.
 */
async function fetchOrderDishes(
  token: string,
  orderIds: number[],
): Promise<Map<number, RateableDish[]>> {
  const byOrder = new Map<number, RateableDish[]>()
  if (!orderIds.length) return byOrder
  try {
    const rows = await restWith<OrderItemRow>(
      token,
      'order_items',
      `?select=id,order_id,menu_id,qty,menus(name)&order_id=in.(${orderIds.join(',')})`,
    )
    for (const row of rows) {
      const list = byOrder.get(row.order_id) ?? []
      list.push({
        id: String(row.id),
        menuId: row.menu_id,
        name: row.menus?.name ?? `Menu ${row.menu_id ?? row.id}`,
        qty: row.qty ?? undefined,
      })
      byOrder.set(row.order_id, list)
    }
  } catch {
    // Hidangan belum tersedia di BE; menu item tetap bisa dinilai begitu ada.
  }
  return byOrder
}

/** Satu baris riwayat pesanan: order selesai + sudah dinilai atau belum (§20.2). */
export interface OrderHistoryItem extends ReviewableOrder {
  reviewed: boolean
  /** Nominal order (IDR) — baris riwayat memberi total, bukan hanya tanggal. */
  totalIdr: number
}

/**
 * Riwayat pesanan customer: order `done`, terbaru dulu, dengan penanda sudah
 * dinilai. **Tanpa batas waktu** (§20.2 "tidak ada batas waktu pengisian"), jadi
 * tidak ada penyaring tanggal di sini.
 */
export async function fetchOrderHistory(
  customerId = DEMO_CUSTOMER_ID,
): Promise<OrderHistoryItem[]> {
  const token = await ensureCustomerToken()
  const [orders, reviewed] = await Promise.all([
    restWith<OrderRow>(
      token,
      'orders',
      `?select=id,code,merchant_id,created_at,total_jod&customer_id=eq.${customerId}&status=eq.done&order=created_at.desc`,
    ),
    restWith<{ order_id: number }>(
      token,
      'rating_reviews',
      `?select=order_id&customer_id=eq.${customerId}`,
    ),
  ])
  if (!orders.length) return []

  const done = new Set(reviewed.map((r) => r.order_id))
  const merchantIds = [...new Set(orders.map((o) => o.merchant_id))]
  const [merchants, dishes] = await Promise.all([
    restWith<{ id: number; store_name: string | null }>(
      token,
      'merchants',
      `?select=id,store_name&id=in.(${merchantIds.join(',')})`,
    ),
    fetchOrderDishes(token, orders.map((o) => o.id)),
  ])
  const byId = new Map(merchants.map((m) => [m.id, m.store_name ?? 'Toko']))
  return orders.map((o) => ({
    id: o.id,
    code: o.code,
    merchantId: o.merchant_id,
    merchantName: byId.get(o.merchant_id) ?? 'Toko',
    createdAt: o.created_at,
    reviewed: done.has(o.id),
    totalIdr: jodToIdr(o.total_jod ?? 0),
    items: dishes.get(o.id) ?? [],
  }))
}

/** Order customer yang selesai tapi belum diulas — bahan prompt pasca-order (f19). */
export async function fetchReviewableOrders(
  customerId = DEMO_CUSTOMER_ID,
): Promise<ReviewableOrder[]> {
  const history = await fetchOrderHistory(customerId)
  return history.filter((order) => !order.reviewed)
}

/**
 * Kirim ulasan toko untuk sebuah order (endpoint `POST /orders/{id}/review`).
 * Ulasan hidangan butuh `menu_id`, sedangkan `order_items` di BE masih kosong,
 * jadi untuk sekarang hanya penilaian toko yang bisa dikirim dari sini.
 */
export async function submitOrderReview(input: {
  orderId: number
  merchantId: number
  rating: number
  text?: string
}): Promise<void> {
  const token = await ensureCustomerToken()
  await createWith(token, 'rating_reviews', {
    order_id: input.orderId,
    customer_id: DEMO_CUSTOMER_ID,
    merchant_id: input.merchantId,
    menu_id: null,
    rating: input.rating,
    review: input.text?.trim() ? input.text.trim() : null,
  })
}

/**
 * Kirim rating **menu item** untuk sebuah order (§20.2): bintang saja, tanpa
 * review, dan tanpa rating per variant. `menu_id` ditulis, `merchant_id` null —
 * kebalikan baris ulasan toko.
 */
export async function submitDishReview(input: {
  orderId: number
  menuId: number
  rating: number
}): Promise<void> {
  const token = await ensureCustomerToken()
  await createWith(token, 'rating_reviews', {
    order_id: input.orderId,
    customer_id: DEMO_CUSTOMER_ID,
    merchant_id: null,
    menu_id: input.menuId,
    rating: input.rating,
    review: null,
  })
}
