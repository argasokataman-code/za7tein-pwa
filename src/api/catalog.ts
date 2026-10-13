/**
 * Pemetaan baris PostgREST → tipe domain repo ini (`Storefront`, `MenuItem`).
 *
 * Harga backend dalam **JOD** (`price_jod`, `priceDeltaJod`); repo ini menyimpan
 * IDR sebagai source of truth (R-CURR-01), jadi konversi lewat `jodToIdr` sekali
 * di sini. Tabel `menus`/`menu_variants` = kontrak `Menu`/`MenuVariant`
 * (docs/design/flows/INDEX.json §contract).
 */
import { jodToIdr } from '../data/currency'
import { foodBucket } from '../data/catalog'
import { estimateDeliveryTime, formatDistance, haversineMeters } from '../data/merchant'
import { IMAGE_FALLBACK } from '../data/storefronts'
import type { MenuItem, ModifierGroup, Storefront } from '../types'
import { rest } from './supabase'

/** Titik asal customer untuk menghitung jarak ke toko (alamat yang dipilih). */
export interface Origin {
  lat: number
  lng: number
}

/** 'HH:MM:SS' dari backend → 'HH:MM' untuk tampilan. */
function hhmm(value: string | null): string {
  return value ? value.slice(0, 5) : ''
}

export interface MerchantRow {
  id: number
  store_name: string
  description: string | null
  photo: string | null
  /** Backend memakai `store_status` ('open'/'closed'), rename dari `available`. */
  store_status: string | null
  rating_avg: number | null
  rating_count: number | null
  open_time: string | null
  close_time: string | null
  latitude: number | null
  longitude: number | null
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
  /** Ada di BE, dulu dibuang mapper — dipakai banner promo & kartu menu. */
  discount_percent: number | null
  is_popular: boolean | null
  /** Estimasi waktu masak (menit) — ditampilkan di kartu menu toko. */
  cook_minutes: number | null
}

export interface VariantRow {
  id: number
  menu_id: number
  name: string
  max_select: number
  options: Array<{ id: number; name: string; priceDeltaJod: number }>
}

function toStorefront(row: MerchantRow, origin?: Origin): Storefront {
  // Jarak/waktu antar dihitung dari titik asal customer, bukan disimpan BE.
  const meters =
    origin && row.latitude != null && row.longitude != null
      ? haversineMeters(origin, { lat: row.latitude, lng: row.longitude })
      : null
  return {
    id: String(row.id),
    name: row.store_name,
    tagline: row.description ?? '',
    logo: row.photo ?? IMAGE_FALLBACK,
    cover: row.photo ?? IMAGE_FALLBACK,
    // Rating & jam buka tersedia langsung di `merchants` — tak perlu agregasi
    // rating_reviews. Jarak/waktu dihitung lokal; kosong bila asal tak diketahui
    // (kartu menyembunyikan bagian itu, bukan menampilkan `—` menggantung).
    rating: row.rating_avg ?? 0,
    reviewCount: row.rating_count ?? 0,
    deliveryTime: meters == null ? '' : estimateDeliveryTime(meters),
    distance: meters == null ? '' : formatDistance(meters),
    openTime: hhmm(row.open_time),
    closeTime: hhmm(row.close_time),
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
    deliveryTime: '',
    distance: '',
    category: foodBucket(row.category ?? '', row.name),
    image: row.image ?? IMAGE_FALLBACK,
    description: row.description ?? '',
    merchantId: String(row.merchant_id),
    // `stock` null = tak dilacak; pakai nilai layak jual supaya tombol tambah hidup.
    stock: row.stock ?? 99,
    available: row.available,
    discountPercent: row.discount_percent ?? undefined,
    isPopular: row.is_popular ?? undefined,
    cookMinutes: row.cook_minutes ?? undefined,
    modifierGroups: variants.length ? toModifierGroups(variants) : undefined,
  }
}

export async function fetchStorefronts(origin?: Origin): Promise<Storefront[]> {
  const rows = await rest<MerchantRow>('merchants', '?select=*&order=id.asc')
  return rows.map((row) => toStorefront(row, origin))
}

export async function fetchStorefront(id: string, origin?: Origin): Promise<Storefront | undefined> {
  const rows = await rest<MerchantRow>(
    'merchants',
    `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
  )
  return rows[0] ? toStorefront(rows[0], origin) : undefined
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

/**
 * Seluruh menu (semua toko) sekali baca — dipakai beranda untuk menghitung
 * promo per toko dan kategori yang benar-benar dilayani. Varian tidak diambil:
 * ringkasan ini tak butuh modifier, hanya `discount_percent`/`category`.
 */
export async function fetchAllMenuItems(): Promise<MenuItem[]> {
  const menus = await rest<MenuRow>('menus', '?select=*&order=id.asc')
  return menus.map((menu) => toMenuItem(menu, []))
}

export async function fetchFood(id: string): Promise<MenuItem | undefined> {
  const rows = await rest<MenuRow>('menus', `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
  const menu = rows[0]
  if (!menu) return undefined
  const variants = await rest<VariantRow>('menu_variants', `?select=*&menu_id=eq.${menu.id}`)
  return toMenuItem(menu, variants)
}
