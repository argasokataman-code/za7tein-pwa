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
 * Order masih boleh dibatalkan customer selama merchant belum menerimanya:
 * `cart` (draft) dan `quotation` (sudah dikirim, belum dijawab). `prepare` ke
 * atas = dapur sudah mulai, jalurnya refund lewat CS, bukan tombol batal.
 */
export function canCancelOrder(order: CustomerActiveOrder): boolean {
  return order.dbStatus === 'cart' || order.dbStatus === 'quotation'
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
