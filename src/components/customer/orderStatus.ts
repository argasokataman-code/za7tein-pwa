import type { CustomerActiveOrder } from '../../api/orders'
import { orderStatusLabel } from '../../data/merchantOrders'

/**
 * Satu bahasa untuk baris pesanan berjalan, dipakai dua tempat: sheet dok
 * keranjang dan tab "Aktif" di halaman Pesanan Saya. Ditaruh di modul sendiri
 * supaya label/aksi/tone tidak pernah berbeda antar dua daftar itu (AGENTS §12).
 */

/** Warna titik status: selesai/hampir tiba, dibatalkan, baru, atau sedang jalan. */
export type StatusTone = 'new' | 'run' | 'done' | 'bad'

export function statusTone(status: string): StatusTone {
  if (status === 'tiba' || status === 'selesai') return 'done'
  if (status === 'ditolak' || status === 'batal') return 'bad'
  if (status === 'baru') return 'new'
  return 'run'
}

/**
 * Jendela batal customer: **1 menit sejak checkout** (keputusan produk
 * 2026-10-18). Merchant belum menerima order, jadi membatalkan tidak merugikan
 * siapa pun; lewat jendela ini jalurnya refund lewat CS, bukan tombol batal.
 */
export const CANCEL_WINDOW_MS = 60_000

/**
 * Sisa jendela batal dalam milidetik (0 = sudah lewat / memang tak bisa batal).
 * Waktu dibaca dari `createdAtMs`, bukan teks `placedAt` yang dibulatkan ke
 * menit — itu selalu tampak "1 menit lalu" bahkan saat baru 3 detik.
 */
export function cancelWindowRemainingMs(order: CustomerActiveOrder, now = Date.now()): number {
  if (order.dbStatus !== 'cart' && order.dbStatus !== 'quotation') return 0
  return Math.max(0, order.createdAtMs + CANCEL_WINDOW_MS - now)
}

/**
 * Order masih boleh dibatalkan customer selama merchant belum menerimanya:
 * `cart` (draft) dan `quotation` (sudah dikirim, belum dijawab) — **dan** masih
 * di dalam jendela 1 menit. `prepare` ke atas = dapur sudah mulai, jalurnya
 * refund lewat CS, bukan tombol batal.
 */
export function canCancelOrder(order: CustomerActiveOrder, now = Date.now()): boolean {
  return cancelWindowRemainingMs(order, now) > 0
}

/** Label baris: draft dan "menunggu toko" tidak boleh menyamar jadi "Baru". */
export function statusLabelOf(order: CustomerActiveOrder): string {
  if (order.dbStatus === 'cart') return 'Draft'
  if (order.dbStatus === 'quotation') return 'Menunggu toko'
  return orderStatusLabel(order.status)
}

/** Item yang diringkas ke satu baris sebelum ditulis "+N". */
export const ITEMS_SHOWN = 3

/** "2× Sate Ayam · 1× Es Teh · +1" — ringkasan isi satu keranjang/order. */
export function itemsLine(
  items: { name: string; qty?: number; quantity?: number }[],
  shown = ITEMS_SHOWN,
): string {
  const shownItems = items.slice(0, shown)
  const rest = items.length - shownItems.length
  return (
    shownItems
      .map((it) => `${it.qty ?? it.quantity ?? 1}× ${it.name}`)
      .join(' · ') + (rest > 0 ? ` · +${rest}` : '')
  )
}
