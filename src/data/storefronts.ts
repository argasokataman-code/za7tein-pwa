import type { Storefront } from '../types'

/**
 * Daftar toko untuk sisi customer — langkah pertama alur belanja (pilih toko,
 * baru pilih menu). Data mock, tapi **tidak mengarang**: id-nya sama dengan
 * `MerchantRecord.id` di `merchant.ts` (Warung Sate Pak Ali = `am-1`, dst.),
 * sehingga toko yang tampil di beranda customer adalah toko yang juga ada di
 * registri. Field tampilan (rating, jarak, jam buka) memang belum ada di tipe
 * registri; di sini ia hidup sebagai proyeksi customer (`Storefront`).
 *
 * Aset foto memakai ulang gambar menu yang sudah ada (tanpa file baru).
 */
export const storefronts: Storefront[] = [
  {
    id: 'am-1',
    name: 'Warung Sate Pak Ali',
    tagline: 'Sate & masakan rumahan',
    logo: '/assets/img/menu/sate-ayam.webp',
    cover: '/assets/img/menu/sate-kambing.webp',
    rating: 4.7,
    reviewCount: 312,
    deliveryTime: '15-30 menit',
    distance: '420 m',
    distanceMeters: 420,
    orderCount: 312,
    tags: ['Sate', 'Rumahan'],
    openTime: '07:00',
    closeTime: '22:00',
    isOpen: true,
  },
  {
    id: 'am-2',
    name: 'Bakso Pak Kumis',
    tagline: 'Bakso, mie & gorengan',
    logo: '/assets/img/menu/nasi-goreng.webp',
    cover: '/assets/img/menu/nasi-goreng.webp',
    rating: 4.6,
    reviewCount: 188,
    deliveryTime: '20-35 menit',
    distance: '1,1 km',
    distanceMeters: 1100,
    orderCount: 188,
    tags: ['Bakso', 'Rumahan'],
    openTime: '08:00',
    closeTime: '21:00',
    isOpen: true,
    // Buka, tapi di luar jangkauan customer: kartu tetap tampil, tak bisa dipilih.
    outOfCoverage: true,
  },
  {
    id: 'am-3',
    name: 'Kopi Kenangan Kecil',
    tagline: 'Kopi & minuman dingin',
    logo: '/assets/img/menu/es-teh-manis.webp',
    cover: '/assets/img/menu/es-teh-manis.webp',
    rating: 4.8,
    reviewCount: 254,
    deliveryTime: '10-20 menit',
    distance: '1,2 km',
    distanceMeters: 1200,
    orderCount: 254,
    tags: ['Kopi', 'Minuman'],
    openTime: '09:00',
    closeTime: '23:00',
    // Satu toko sengaja tutup supaya badge "Buka/Tutup" punya dua keadaan nyata.
    isOpen: false,
  },
  {
    id: 'am-4',
    name: 'Ayam Geprek Bu Rina',
    tagline: 'Ayam geprek & nasi',
    logo: '/assets/img/menu/nasi-goreng.webp',
    cover: '/assets/img/menu/nasi-goreng.webp',
    rating: 4.5,
    reviewCount: 96,
    deliveryTime: '18-28 menit',
    distance: '700 m',
    distanceMeters: 700,
    orderCount: 96,
    tags: ['Ayam', 'Rumahan'],
    openTime: '10:00',
    closeTime: '21:00',
    isOpen: true,
    // Kuota order diblokir (PRD §17): toko DISEMBUNYIKAN dari daftar, bukan di-disable.
    quotaBlocked: true,
  },
]

/** Toko by id, untuk halaman toko. */
export function getStorefront(id: string): Storefront | undefined {
  return storefronts.find((store) => store.id === id)
}

/**
 * Foto pengganti bila backend menunjuk gambar yang tidak ada — mis. path
 * `/assets/img/merchant/*.svg` yang tak pernah dikirim ke repo ini. Dipakai
 * saat `photo` null (catalog.ts) maupun saat gambar gagal dimuat (`onError`).
 */
export const IMAGE_FALLBACK = '/assets/img/menu/nasi-goreng.webp'

/** Handler `onError` `<img>`: ganti ke foto pengganti sekali, cegah loop. */
export function swapBrokenImage(e: { currentTarget: HTMLImageElement }): void {
  const img = e.currentTarget
  img.onerror = null
  if (img.getAttribute('src') === IMAGE_FALLBACK) return
  img.src = IMAGE_FALLBACK
}

// ── Discovery customer (PRD §6) ──────────────────────────────────────────────
// Aturan daftar toko: grup **hanya** per tag; toko tutup atau di luar coverage
// tetap tampil tapi tak bisa dipilih; toko yang memblokir kuota order
// disembunyikan. Semua fungsi murni, tanpa DOM, jadi bisa diuji lewat Node.

/** Bisa dipilih customer? Toko tutup / di luar coverage tetap tampil, tapi mati. */
export const isSelectable = (store: Storefront): boolean =>
  store.isOpen && !store.outOfCoverage

/** Buang toko yang memblokir kuota order (PRD §17) dari daftar. */
export function visibleStorefronts(stores: Storefront[]): Storefront[] {
  return stores.filter((store) => !store.quotaBlocked)
}

/**
 * Kelompokkan per tag (satu toko muncul di beberapa grup). Toko tanpa tag
 * dikumpulkan di grup `null` terakhir supaya tetap tampil, tidak hilang diam-diam.
 */
export function groupStorefrontsByTag(
  stores: Storefront[],
): { tag: string | null; stores: Storefront[] }[] {
  const groups = new Map<string, Storefront[]>()
  const untagged: Storefront[] = []
  for (const store of stores) {
    if (!store.tags?.length) {
      untagged.push(store)
      continue
    }
    for (const tag of store.tags) {
      const list = groups.get(tag) ?? []
      list.push(store)
      groups.set(tag, list)
    }
  }
  const out: { tag: string | null; stores: Storefront[] }[] = [...groups].map(([tag, list]) => ({
    tag,
    stores: list,
  }))
  if (untagged.length) out.push({ tag: null, stores: untagged })
  return out
}

export type MerchantSortKey = 'distance' | 'orders' | 'rating'

/** Urutkan toko: jarak (dekat dulu), jumlah order (banyak dulu), atau rating. */
export function sortStorefronts(stores: Storefront[], key: MerchantSortKey): Storefront[] {
  const sorted = [...stores]
  if (key === 'distance') {
    sorted.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
  } else if (key === 'orders') {
    sorted.sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
  } else {
    sorted.sort((a, b) => b.rating - a.rating)
  }
  return sorted
}

/** Filter discovery (PRD §6): tag, rating minimum, jarak maksimum, order minimum. */
export interface StorefrontFilter {
  tags?: string[]
  minRating?: number
  maxDistanceMeters?: number
  minOrders?: number
}

export function filterStorefronts(stores: Storefront[], filter: StorefrontFilter): Storefront[] {
  return stores.filter((store) => {
    if (filter.tags?.length && !store.tags?.some((tag) => filter.tags!.includes(tag))) return false
    if (filter.minRating != null && store.rating < filter.minRating) return false
    if (
      filter.maxDistanceMeters != null &&
      (store.distanceMeters ?? Infinity) > filter.maxDistanceMeters
    ) {
      return false
    }
    if (filter.minOrders != null && (store.orderCount ?? 0) < filter.minOrders) return false
    return true
  })
}
