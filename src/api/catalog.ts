/**
 * Pemetaan baris PostgREST → tipe domain repo ini (`Storefront`, `MenuItem`).
 *
 * Harga backend dalam **JOD** (`price_jod`, `priceDeltaJod`); repo ini menyimpan
 * IDR sebagai source of truth (R-CURR-01), jadi konversi lewat `jodToIdr` sekali
 * di sini. Tabel `menus`/`menu_variants` = kontrak `Menu`/`MenuVariant`
 * (docs/design/flows/INDEX.json §contract).
 */
import { jodToIdr } from '../data/currency'
import type { MenuItem, ModifierGroup, Storefront } from '../types'
import { rest } from './supabase'

/** Foto pengganti bila backend belum punya gambar (tanpa URL eksternal). */
const FALLBACK_IMAGE = '/assets/img/menu/nasi-goreng.webp'

export interface MerchantRow {
  id: number
  store_name: string
  description: string | null
  photo: string | null
  /** Backend memakai `store_status` ('open'/'closed'), rename dari `available`. */
  store_status: string | null
}

export interface MenuRow {
  id: number
  merchant_id: number
  name: string
  description: string | null
  price_jod: number
  available: boolean
  image: string | null
  stock: number | null
  category: string | null
}

export interface VariantRow {
  id: number
  menu_id: number
  name: string
  max_select: number
  options: Array<{ id: number; name: string; priceDeltaJod: number }>
}

function toStorefront(row: MerchantRow): Storefront {
  return {
    id: String(row.id),
    name: row.store_name,
    tagline: row.description ?? '',
    logo: row.photo ?? FALLBACK_IMAGE,
    cover: row.photo ?? FALLBACK_IMAGE,
    // Backend belum menyimpan rating/jam/jarak merchant (rating_reviews kosong).
    rating: 0,
    reviewCount: 0,
    deliveryTime: '—',
    distance: '—',
    openTime: '',
    closeTime: '',
    isOpen: row.store_status === 'open',
  }
}

function toModifierGroups(rows: VariantRow[]): ModifierGroup[] {
  return rows.map((variant) => ({
    id: String(variant.id),
    name: variant.name,
    type: variant.max_select > 1 ? 'multi' : 'single',
    options: variant.options.map((option) => ({
      // Id opsi unik lintas varian (backend mengulang id 1,2,3 per varian).
      id: `${variant.id}-${option.id}`,
      label: option.name,
      extraPrice: jodToIdr(option.priceDeltaJod),
    })),
  }))
}

function toMenuItem(row: MenuRow, variants: VariantRow[]): MenuItem {
  return {
    id: String(row.id),
    name: row.name,
    price: jodToIdr(row.price_jod),
    rating: 0,
    reviewCount: 0,
    deliveryTime: '—',
    distance: '—',
    category: row.category ?? '',
    image: row.image ?? FALLBACK_IMAGE,
    description: row.description ?? '',
    merchantId: String(row.merchant_id),
    // `stock` null = tak dilacak; pakai nilai layak jual supaya tombol tambah hidup.
    stock: row.stock ?? 99,
    available: row.available,
    modifierGroups: variants.length ? toModifierGroups(variants) : undefined,
  }
}

export async function fetchStorefronts(): Promise<Storefront[]> {
  const rows = await rest<MerchantRow>('merchants', '?select=*&order=id.asc')
  return rows.map(toStorefront)
}

export async function fetchStorefront(id: string): Promise<Storefront | undefined> {
  const rows = await rest<MerchantRow>(
    'merchants',
    `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
  )
  return rows[0] ? toStorefront(rows[0]) : undefined
}

export async function fetchMenuItems(merchantId: string): Promise<MenuItem[]> {
  const menus = await rest<MenuRow>(
    'menus',
    `?select=*&merchant_id=eq.${encodeURIComponent(merchantId)}&order=id.asc`,
  )
  if (!menus.length) return []
  const ids = menus.map((m) => m.id).join(',')
  const variants = await rest<VariantRow>('menu_variants', `?select=*&menu_id=in.(${ids})`)
  const byMenu = new Map<number, VariantRow[]>()
  for (const variant of variants) {
    const list = byMenu.get(variant.menu_id) ?? []
    list.push(variant)
    byMenu.set(variant.menu_id, list)
  }
  return menus.map((menu) => toMenuItem(menu, byMenu.get(menu.id) ?? []))
}

export async function fetchFood(id: string): Promise<MenuItem | undefined> {
  const rows = await rest<MenuRow>('menus', `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
  const menu = rows[0]
  if (!menu) return undefined
  const variants = await rest<VariantRow>('menu_variants', `?select=*&menu_id=eq.${menu.id}`)
  return toMenuItem(menu, variants)
}
