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
    openTime: '08:00',
    closeTime: '21:00',
    isOpen: true,
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
    openTime: '09:00',
    closeTime: '23:00',
    // Satu toko sengaja tutup supaya badge "Buka/Tutup" punya dua keadaan nyata.
    isOpen: false,
  },
]

/** Toko by id, untuk halaman toko. */
export function getStorefront(id: string): Storefront | undefined {
  return storefronts.find((store) => store.id === id)
}
