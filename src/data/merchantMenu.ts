import type { MerchantMenuItem } from '../types'

/** Ambang stok menipis — dipakai halaman menu untuk label "Stok menipis". */
export const MENU_LOW_STOCK_THRESHOLD = 5

export const merchantMenu: MerchantMenuItem[] = [
  { id: 'mm-1', name: 'Ayam Geprek + Nasi', price: 22000, category: 'Makanan Utama', stock: 15 },
  { id: 'mm-2', name: 'Nasi Uduk Komplit', price: 20000, category: 'Makanan Utama', stock: 8 },
  { id: 'mm-3', name: 'Mie Goreng Spesial', price: 18000, category: 'Makanan Utama', stock: 3 },
  { id: 'mm-4', name: 'Sate Ayam (10 tusuk)', price: 25000, category: 'Makanan Utama', stock: 12 },
  { id: 'mm-5', name: 'Es Teh Manis', price: 6000, category: 'Minuman', stock: 40 },
  { id: 'mm-6', name: 'Es Jeruk', price: 8000, category: 'Minuman', stock: 0 },
  { id: 'mm-7', name: 'Kopi Susu Gula Aren', price: 18000, category: 'Minuman', stock: 18 },
  { id: 'mm-8', name: 'Pisang Goreng (5 pcs)', price: 12000, category: 'Camilan', stock: 4 },
  { id: 'mm-9', name: 'Tahu Crispy', price: 10000, category: 'Camilan', stock: 22 },
  { id: 'mm-10', name: 'Kerupuk Udang', price: 5000, category: 'Camilan', stock: 2 },
]

export function menuCategories(items: MerchantMenuItem[]): string[] {
  return [...new Set(items.map((item) => item.category))]
}

export function countLowStock(items: MerchantMenuItem[]): number {
  return items.filter((i) => i.stock > 0 && i.stock <= MENU_LOW_STOCK_THRESHOLD).length
}

export function countOutOfStock(items: MerchantMenuItem[]): number {
  return items.filter((i) => i.stock === 0).length
}
