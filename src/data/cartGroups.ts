import type { CartItem } from '../types'

/**
 * Satu blok keranjang milik satu toko. Customer boleh menaruh menu di beberapa
 * toko sekaligus (PRD §6/§11), jadi layar Pesanan Saya menampilkan satu kartu
 * per toko — bukan satu kartu gabungan yang menyembunyikan asal menunya.
 */
export interface CartGroup {
  /** `null` hanya untuk keranjang demo lama yang belum menyimpan toko. */
  merchantId: string | null
  items: CartItem[]
  /** Jumlah porsi (bukan jumlah baris menu). */
  count: number
  subtotal: number
  /** Blok ini ikut keranjang checkout (tombolnya langsung ke pembayaran). */
  active: boolean
}

const sumQuantity = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0)
const sumPrice = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)

/**
 * Kelompokkan keranjang aktif + keranjang toko lain menjadi blok per toko.
 *
 * Keranjang aktif disimpan di `items` dan idealnya hanya berisi satu toko,
 * tetapi state yang dipersist dari versi lama bisa memuat item beberapa toko
 * sekaligus, tanpa `activeMerchantId`, bahkan tanpa `item.merchantId` (field
 * itu baru ditulis sejak keranjang mengenal toko). Karena itu item aktif
 * dipisah menurut `item.merchantId`, lalu dicocokkan ke katalog live sebagai
 * cadangan: tanpa ini semua menu tergabung di satu baris "2× Sate Ayam · 1×
 * Sate Ayam" dan customer tak tahu mana dari toko mana.
 */
export function cartGroups(
  items: CartItem[],
  activeMerchantId: string | null,
  otherCarts: Record<string, CartItem[]>,
  catalog: { id: string; merchantId?: string }[] = [],
): CartGroup[] {
  const merchantOfMenu = new Map(catalog.map((menu) => [menu.id, menu.merchantId]))
  const buckets = new Map<string | null, CartItem[]>()
  /** Toko yang itemnya ada di keranjang checkout. */
  const checkoutStores = new Set<string | null>()

  for (const item of items) {
    const key =
      item.merchantId ?? merchantOfMenu.get(item.id) ?? activeMerchantId ?? null
    checkoutStores.add(key)
    const bucket = buckets.get(key)
    if (bucket) bucket.push(item)
    else buckets.set(key, [item])
  }

  for (const [merchantId, cartItems] of Object.entries(otherCarts)) {
    if (!cartItems.length) continue
    const bucket = buckets.get(merchantId)
    if (bucket) bucket.push(...cartItems)
    else buckets.set(merchantId, [...cartItems])
  }

  const groups: CartGroup[] = [...buckets.entries()].map(([merchantId, groupItems]) => ({
    merchantId,
    items: groupItems,
    count: sumQuantity(groupItems),
    subtotal: sumPrice(groupItems),
    // Keranjang checkout selalu di atas. Blok toko lain baru bisa dipindah
    // kalau memang tersimpan di `carts`; item lama yang masih menumpuk di
    // `items` tetap ikut checkout supaya tidak hilang saat dipindah.
    active: checkoutStores.has(merchantId),
  }))

  return groups.sort((a, b) => Number(b.active) - Number(a.active))
}
