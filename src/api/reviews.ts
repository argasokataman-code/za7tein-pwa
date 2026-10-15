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

/** Order customer yang sudah selesai dan belum diulas. */
export interface ReviewableOrder {
  id: number
  code: string
  merchantId: number
  merchantName: string
  createdAt: string
}

interface ReviewRow {
  id: number
  order_id: number | null
  customer_id: number | null
  menu_id: number | null
  rating: number
  review: string | null
  created_at: string
  menus?: { name: string; merchant_id: number } | null
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

const STORE_SELECT = 'id,order_id,customer_id,menu_id,rating,review,created_at'
const DISH_SELECT = `${STORE_SELECT},menus!inner(name,merchant_id)`

/** Satu ulasan → bentuk tampilan; `menus` hanya ada di query hidangan. */
function toReview(row: ReviewRow, customers: Map<number, CustomerRow>, replies: Map<number, ReplyRow>): ReviewItem {
  const customer = row.customer_id != null ? customers.get(row.customer_id) : undefined
  const reply = replies.get(row.id)
  return {
    id: String(row.id),
    kind: row.menu_id != null ? 'dish' : 'store',
    rating: row.rating,
    text: row.review,
    createdAt: row.created_at,
    customerName: customer?.name ?? 'Pelanggan',
    avatar: customer?.avatar ?? '/assets/img/profile.png',
    dishName: row.menus?.name ?? null,
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
      `?select=${DISH_SELECT}&menu_id=not.is.null&deleted_at=is.null&menus.merchant_id=eq.${merchantId}&order=created_at.desc`,
    ),
    restWith<ReplyRow>(token, 'review_replies', '?select=id,review_id,body,created_at'),
  ])

  const rows = [...store, ...dish]
  const customerIds = [...new Set(rows.flatMap((r) => (r.customer_id != null ? [r.customer_id] : [])))]
  const customers = customerIds.length
    ? await restWith<CustomerRow>(
        token,
        'customers',
        `?select=id,name,avatar&id=in.(${customerIds.join(',')})`,
      )
    : []
  const byCustomer = new Map(customers.map((c) => [c.id, c]))
  const byReview = new Map(replies.map((r) => [r.review_id, r]))

  return rows
    .map((row) => toReview(row, byCustomer, byReview))
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
}

/** Order customer yang selesai tapi belum diulas — bahan prompt pasca-order (f19). */
export async function fetchReviewableOrders(
  customerId = DEMO_CUSTOMER_ID,
): Promise<ReviewableOrder[]> {
  const token = await ensureCustomerToken()
  const [orders, reviewed] = await Promise.all([
    restWith<OrderRow>(
      token,
      'orders',
      `?select=id,code,merchant_id,created_at&customer_id=eq.${customerId}&status=eq.done&order=created_at.desc`,
    ),
    restWith<{ order_id: number }>(
      token,
      'rating_reviews',
      `?select=order_id&customer_id=eq.${customerId}`,
    ),
  ])
  const done = new Set(reviewed.map((r) => r.order_id))
  const pending = orders.filter((o) => !done.has(o.id))
  if (!pending.length) return []

  const merchantIds = [...new Set(pending.map((o) => o.merchant_id))]
  const merchants = await restWith<{ id: number; store_name: string | null }>(
    token,
    'merchants',
    `?select=id,store_name&id=in.(${merchantIds.join(',')})`,
  )
  const byId = new Map(merchants.map((m) => [m.id, m.store_name ?? 'Toko']))
  return pending.map((o) => ({
    id: o.id,
    code: o.code,
    merchantId: o.merchant_id,
    merchantName: byId.get(o.merchant_id) ?? 'Toko',
    createdAt: o.created_at,
  }))
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
