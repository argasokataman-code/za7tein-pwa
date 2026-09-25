import { Cookie, CupSoda, UtensilsCrossed } from 'lucide-react'

import type { Category, MenuItem } from '../types'
import { foods } from './foods'

export const MENU_LOW_STOCK_THRESHOLD = 5

export const CATEGORIES: Category[] = [
  { id: 'Makanan Utama', label: 'Makanan', icon: UtensilsCrossed },
  { id: 'Minuman', label: 'Minuman', icon: CupSoda },
  { id: 'Camilan', label: 'Camilan', icon: Cookie },
]

/** Override lowercase category values from foods.ts to match CATEGORIES ids. */
const FOOD_CATEGORY: Record<string, string> = {
  makanan: 'Makanan Utama',
  minuman: 'Minuman',
}

/** Seed catalog — combined from foods.ts (customer-facing) + merchant menu items. */
export const menuSeed: MenuItem[] = [
  // ── foods.ts (5 items, spread modifierGroups) ──
  {
    ...foods[0],
    category: FOOD_CATEGORY[foods[0].category] ?? foods[0].category,
    modifierGroups: foods[0].modifierGroups,
    stock: 3,
    available: true,
  },
  {
    ...foods[1],
    category: FOOD_CATEGORY[foods[1].category] ?? foods[1].category,
    modifierGroups: foods[1].modifierGroups,
    stock: 25,
    available: true,
  },
  {
    ...foods[2],
    category: FOOD_CATEGORY[foods[2].category] ?? foods[2].category,
    modifierGroups: foods[2].modifierGroups,
    stock: 0,
    available: true,
  },
  {
    ...foods[3],
    category: FOOD_CATEGORY[foods[3].category] ?? foods[3].category,
    modifierGroups: foods[3].modifierGroups,
    stock: 18,
    available: true,
  },
  {
    ...foods[4],
    category: FOOD_CATEGORY[foods[4].category] ?? foods[4].category,
    modifierGroups: foods[4].modifierGroups,
    stock: 40,
    available: true,
  },

  // ── merchant menu items (10 items) ──
  {
    id: 'mm-1',
    name: 'Ayam Geprek + Nasi',
    price: 22000,
    rating: 4.8,
    reviewCount: 67,
    deliveryTime: '15-25 menit',
    distance: '1.2 km',
    category: 'Makanan Utama',
    image: '/assets/img/menu/nasi-goreng.webp',
    description: 'Ayam goreng tepung dengan sambal geprek dan nasi putih hangat.',
    stock: 15,
    available: true,
    discountPercent: 20,
  },
  {
    id: 'mm-2',
    name: 'Nasi Uduk Komplit',
    price: 20000,
    rating: 4.7,
    reviewCount: 43,
    deliveryTime: '15-25 menit',
    distance: '1.1 km',
    category: 'Makanan Utama',
    image: '/assets/img/menu/lontong.webp',
    description: 'Nasi uduk gurih dengan tempe orek, telur, dan kerupuk.',
    stock: 8,
    available: true,
    discountPercent: 15,
  },
  {
    id: 'mm-3',
    name: 'Mie Goreng Spesial',
    price: 18000,
    rating: 4.6,
    reviewCount: 38,
    deliveryTime: '15-25 menit',
    distance: '1.3 km',
    category: 'Makanan Utama',
    image: '/assets/img/menu/nasi-goreng.webp',
    description: 'Mie goreng kampung dengan sayur, telur, dan ayam suwir.',
    stock: 3,
    available: true,
  },
  {
    id: 'mm-4',
    name: 'Sate Ayam (10 tusuk)',
    price: 25000,
    rating: 4.9,
    reviewCount: 112,
    deliveryTime: '20-30 menit',
    distance: '1.2 km',
    category: 'Makanan Utama',
    image: '/assets/img/menu/sate-ayam.webp',
    description: 'Sate ayam 10 tusuk porsi besar dengan bumbu kacang.',
    stock: 12,
    available: true,
    isPopular: true,
    discountPercent: 25,
  },
  {
    id: 'mm-5',
    name: 'Es Teh Manis',
    price: 6000,
    rating: 4.7,
    reviewCount: 95,
    deliveryTime: '10-15 menit',
    distance: '1.1 km',
    category: 'Minuman',
    image: '/assets/img/menu/es-teh-manis.webp',
    description: 'Teh tubruk manis dengan es batu segar.',
    stock: 40,
    available: true,
    discountPercent: 10,
  },
  {
    id: 'mm-6',
    name: 'Es Jeruk',
    price: 8000,
    rating: 4.6,
    reviewCount: 29,
    deliveryTime: '10-15 menit',
    distance: '1.1 km',
    category: 'Minuman',
    image: '/assets/img/menu/es-teh-manis.webp',
    description: 'Jeruk peras segar dengan es batu, manis alami.',
    stock: 0,
    available: true,
  },
  {
    id: 'mm-7',
    name: 'Kopi Susu Gula Aren',
    price: 18000,
    rating: 4.8,
    reviewCount: 86,
    deliveryTime: '10-20 menit',
    distance: '1.2 km',
    category: 'Minuman',
    image: '/assets/img/menu/es-teh-manis.webp',
    description: 'Kopi robusta dengan susu segar dan gula aren asli.',
    stock: 18,
    available: true,
    discountPercent: 10,
  },
  {
    id: 'mm-8',
    name: 'Pisang Goreng (5 pcs)',
    price: 12000,
    rating: 4.7,
    reviewCount: 52,
    deliveryTime: '10-20 menit',
    distance: '1.1 km',
    category: 'Camilan',
    image: '/assets/img/menu/lontong.webp',
    description: 'Pisang goreng renyah tepung, porsi 5 potong.',
    stock: 4,
    available: true,
  },
  {
    id: 'mm-9',
    name: 'Tahu Crispy',
    price: 10000,
    rating: 4.6,
    reviewCount: 34,
    deliveryTime: '10-15 menit',
    distance: '1.1 km',
    category: 'Camilan',
    image: '/assets/img/menu/sate-kambing.webp',
    description: 'Tahu goreng crispy dengan bumbu racik pedas manis.',
    stock: 22,
    available: true,
  },
  {
    id: 'mm-10',
    name: 'Kerupuk Udang',
    price: 5000,
    rating: 4.6,
    reviewCount: 21,
    deliveryTime: '10-15 menit',
    distance: '1.1 km',
    category: 'Camilan',
    image: '/assets/img/menu/sate-kambing.webp',
    description: 'Kerupuk udang renyah, pelengkap makan ideal.',
    stock: 2,
    available: true,
  },
]

// ── Helpers ──

/** Item bisa dipesan: tersedia DAN stok > 0. */
export function isOrderable(item: MenuItem): boolean {
  return item.available && item.stock > 0
}

/** Jumlah item dengan stok menipis (0 < stock <= threshold). */
export function countLowStock(items: MenuItem[]): number {
  return items.filter(
    (i) => i.stock > 0 && i.stock <= MENU_LOW_STOCK_THRESHOLD,
  ).length
}

/** Jumlah item stok habis (stock <= 0). */
export function countOutOfStock(items: MenuItem[]): number {
  return items.filter((i) => i.stock <= 0).length
}

/** Kategori yang punya setidaknya satu item orderable. */
export function categoriesFrom(items: MenuItem[]): Category[] {
  const orderableCats = new Set(
    items.filter(isOrderable).map((i) => i.category),
  )
  return CATEGORIES.filter((c) => orderableCats.has(c.id))
}

/** Item berdiskon yang bisa dipesan. */
export function dealsFrom(items: MenuItem[]): MenuItem[] {
  return items.filter((i) => i.discountPercent != null && isOrderable(i))
}

/** Item populer yang bisa dipesan. */
export function popularFrom(items: MenuItem[]): MenuItem[] {
  return items.filter((i) => i.isPopular && isOrderable(i))
}
