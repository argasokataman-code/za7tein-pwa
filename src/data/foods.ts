import { CupSoda, LayoutGrid, UtensilsCrossed } from 'lucide-react'

import type { Category, Food, ModifierGroup } from '../types'

/** Kategori menu toko — Makanan / Minuman (PRD bab 06). */
export const categories: Category[] = [
  { id: 'all', label: 'Semua', icon: LayoutGrid },
  { id: 'makanan', label: 'Makanan', icon: UtensilsCrossed },
  { id: 'minuman', label: 'Minuman', icon: CupSoda },
]

/** Modifier grup dipakai layar detail menu (PRD bab 02). */
const SPICE: ModifierGroup = {
  id: 'spice',
  name: 'TINGKAT PEDAS',
  type: 'single',
  options: [
    { id: 'mild', label: 'Tidak Pedas', extraPrice: 0 },
    { id: 'medium', label: 'Sedang', extraPrice: 0 },
    { id: 'hot', label: 'Pedas', extraPrice: 0 },
  ],
}

const ADDONS: ModifierGroup = {
  id: 'addons',
  name: 'TAMBAHAN',
  type: 'multi',
  options: [
    { id: 'lontong', label: 'Lontong', extraPrice: 8000 },
    { id: 'sambal', label: 'Sambal Extra', extraPrice: 5000 },
  ],
}


const TEMPERATURE: ModifierGroup = {
  id: 'temperature',
  name: 'PILIHAN',
  type: 'single',
  options: [
    { id: 'ice', label: 'Es', extraPrice: 0 },
    { id: 'hot', label: 'Panas', extraPrice: 0 },
  ],
}

const SUGAR: ModifierGroup = {
  id: 'sugar',
  name: 'GULA',
  type: 'single',
  options: [
    { id: 'normal', label: 'Normal', extraPrice: 0 },
    { id: 'less', label: 'Sedikit', extraPrice: 0 },
    { id: 'none', label: 'Tanpa Gula', extraPrice: 0 },
  ],
}

const PORTION: ModifierGroup = {
  id: 'portion',
  name: 'PORSI',
  type: 'single',
  options: [
    { id: 'one', label: '1 Bungkus', extraPrice: 0 },
    { id: 'two', label: '2 Bungkus', extraPrice: 8000 },
  ],
}

const MENU: Array<Omit<Food, 'modifierGroups'> & { modifierGroups?: ModifierGroup[] }> = [
  {
    id: '1',
    name: 'Sate Ayam',
    price: 28000,
    rating: 4.7,
    reviewCount: 92,
    deliveryTime: '15-30 menit',
    distance: '420 m',
    discountPercent: 10,
    category: 'makanan',
    image: '/assets/img/menu/sate-ayam.webp',
    description:
      'Sate ayam kampung dibakar arang, disajikan dengan bumbu kacang dan lontong. Dibuat segar per porsi.',
    isPopular: true,
    modifierGroups: [SPICE, ADDONS],
  },
  {
    id: '2',
    name: 'Sate Kambing',
    price: 32000,
    rating: 4.6,
    reviewCount: 58,
    deliveryTime: '20-35 menit',
    distance: '420 m',
    category: 'makanan',
    image: '/assets/img/menu/sate-kambing.webp',
    description: 'Sate kambing muda tanpa prengus, dibakar dengan arang dan bumbu kecap.',
    modifierGroups: [SPICE, ADDONS],
  },
  {
    id: '3',
    name: 'Nasi Goreng',
    price: 25000,
    rating: 4.5,
    reviewCount: 74,
    deliveryTime: '15-30 menit',
    distance: '420 m',
    discountPercent: 15,
    category: 'makanan',
    image: '/assets/img/menu/nasi-goreng.webp',
    description: 'Nasi goreng kampung dengan telur, ayam, dan kerupuk. Level pedas bisa dipilih.',
    modifierGroups: [SPICE],
  },
  {
    id: '4',
    name: 'Lontong',
    price: 8000,
    rating: 4.4,
    reviewCount: 31,
    deliveryTime: '10-20 menit',
    distance: '420 m',
    category: 'makanan',
    image: '/assets/img/menu/lontong.webp',
    description: 'Lontong daun pisang, pendamping sate.',
    modifierGroups: [PORTION],
  },
  {
    id: '5',
    name: 'Es Teh Manis',
    price: 6000,
    rating: 4.8,
    reviewCount: 120,
    deliveryTime: '10-20 menit',
    distance: '420 m',
    category: 'minuman',
    image: '/assets/img/menu/es-teh-manis.webp',
    description: 'Teh tubruk manis dengan es batu, disajikan dingin.',
    modifierGroups: [TEMPERATURE, SUGAR],
  },
]

export const foods: Food[] = MENU

export function getFood(id: string | undefined): Food | undefined {
  return foods.find((f) => f.id === id)
}

/** Ringkasan pilihan modifier, mis. "Sedang, Lontong". */
export function modifierSummary(groups: ModifierGroup[] | undefined, chosen: string[]): string {
  if (!groups || chosen.length === 0) return ''
  const labels = groups
    .flatMap((g) => g.options)
    .filter((o) => chosen.includes(o.id))
    .map((o) => o.label)
  return labels.join(', ')
}

export function modifierExtra(groups: ModifierGroup[] | undefined, chosen: string[]): number {
  if (!groups) return 0
  return groups
    .flatMap((g) => g.options)
    .filter((o) => chosen.includes(o.id))
    .reduce((sum, o) => sum + o.extraPrice, 0)
}

/** Menu berdiskon — bagian "Super Deals" di beranda. */
export const deals: Food[] = foods.filter((f) => f.discountPercent !== undefined)

/** Menu paling sering dipesan — bagian "Hot Deals" di beranda. */
export const popular: Food[] = [...foods].sort((a, b) => b.reviewCount - a.reviewCount)
