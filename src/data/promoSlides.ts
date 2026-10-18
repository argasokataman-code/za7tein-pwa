import type { PromoSlide } from '../types'
import { mockMerchant } from './merchant'

/** Aturan tampilan carousel promo beranda merchant. */

/** Batas jumlah slide: carousel berbatas, bukan daftar tak berujung (PG-10). */
export const MAX_PROMO_SLIDES = 5

/** Latar kartu customer saat slide tidak punya banner unggahan. */
export const DEFAULT_PROMO_BANNER = '/assets/img/promo/promo-spread.webp'

/**
 * Slide contoh untuk demo. Menunjuk menu berdiskon yang sudah ada di
 * `data/catalog.ts` (tanpa angka baru), jadi carousel langsung tampil sebelum
 * merchant mengisi apa pun. Diganti begitu merchant menyimpan slide sendiri.
 */
export const mockPromoSlides: PromoSlide[] = [
  {
    id: 'promo-slide-mock-1',
    merchantId: mockMerchant.id,
    menuItemId: 'mm-1',
    title: 'Ayam Geprek Spesial',
    image: null,
    active: true,
  },
  {
    id: 'promo-slide-mock-2',
    merchantId: mockMerchant.id,
    menuItemId: 'mm-2',
    title: 'Nasi Uduk Komplit',
    image: null,
    active: true,
  },
]
