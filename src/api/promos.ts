/**
 * Promo & diskon merchant (tabel `marketing`).
 *
 * `marketing.merchant_id` menandai promo milik satu merchant; `null` = promo
 * platform buatan ops. RLS `marketing_merchant` hanya mengizinkan merchant
 * menulis baris yang `merchant_id`-nya miliknya (`merchants.user_id = app_uid()`),
 * jadi baca + tulis memakai sesi merchant (`merchantToken`). Tabelnya juga punya
 * `marketing_public_read`, jadi customer boleh membacanya.
 *
 * Validasi kode untuk checkout lewat RPC `validate_promo` (SECURITY DEFINER):
 * hitung diskon + cek jendela/tembus kuota di server, bukan di klien.
 *
 * Nilai backend dalam JOD (`marketing.value`, `orders.*_jod`); repo menyimpan
 * IDR (R-CURR-01) — konversi sekali di sini, seperti `reference.ts`.
 */
import { idrToJod, jodToIdr } from '../data/currency'
import { DEMO_MERCHANT_ID, merchantToken, refToken } from './reference'
import { createWith, deleteWith, restWith, rpc } from './supabase'

export type PromoType = 'discount_pct' | 'discount_fixed' | 'promo_delivery'

/** `value` = persen untuk `discount_pct`, nominal JOD untuk dua tipe lain. */
export interface MerchantPromo {
  id: string
  code: string
  type: PromoType
  value: number
  activeFrom: string
  activeTo: string
  maxUses: number | null
  usedCount: number
  status: 'active' | 'scheduled' | 'expired' | 'used_up'
}

export interface NewPromoInput {
  code: string
  type: PromoType
  value: number
  activeFrom: string
  activeTo: string
  maxUses: number | null
}

interface PromoRow {
  id: number
  code: string | null
  type: string
  value: number
  active_from: string
  active_to: string
  max_uses: number | null
  used_count: number
  merchant_id: number | null
}

/** Tipe yang dikenal UI; `promo_delivery` = bebas/ongkir, bukan potongan item. */
export const PROMO_TYPES: PromoType[] = ['discount_pct', 'discount_fixed', 'promo_delivery']

const PROMO_SELECT = 'id,code,type,value,active_from,active_to,max_uses,used_count,merchant_id'

function asType(value: string): PromoType {
  return (PROMO_TYPES as string[]).includes(value) ? (value as PromoType) : 'discount_pct'
}

/** Status diturunkan dari jendela + kuota, bukan kolom (tabel tak punya `active`). */
function promoStatus(row: PromoRow): MerchantPromo['status'] {
  const now = Date.now()
  if (row.max_uses != null && row.used_count >= row.max_uses) return 'used_up'
  if (new Date(row.active_from).getTime() > now) return 'scheduled'
  if (new Date(row.active_to).getTime() < now) return 'expired'
  return 'active'
}

function toPromo(row: PromoRow): MerchantPromo {
  return {
    id: String(row.id),
    code: row.code ?? '',
    type: asType(row.type),
    value: row.value,
    activeFrom: row.active_from,
    activeTo: row.active_to,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    status: promoStatus(row),
  }
}

/** Promo milik satu merchant, terbaru dulu. */
export async function fetchMerchantPromos(merchantId = DEMO_MERCHANT_ID): Promise<MerchantPromo[]> {
  const token = await merchantToken()
  const rows = await restWith<PromoRow>(
    token,
    'marketing',
    `?select=${PROMO_SELECT}&merchant_id=eq.${merchantId}&order=id.desc`,
  )
  return rows.map(toPromo)
}

/** Buat promo baru atas nama merchant. Kode di-uppercase supaya validasi tak beda huruf. */
export async function createPromo(
  input: NewPromoInput,
  merchantId = DEMO_MERCHANT_ID,
): Promise<void> {
  const token = await merchantToken()
  await createWith(token, 'marketing', {
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    active_from: input.activeFrom,
    active_to: input.activeTo,
    max_uses: input.maxUses,
    merchant_id: merchantId,
  })
}

export async function deletePromo(id: string): Promise<void> {
  const token = await merchantToken()
  await deleteWith(token, 'marketing', `?id=eq.${id}`)
}

export interface PromoCheck {
  valid: boolean
  promoId?: number
  code?: string
  type?: PromoType
  /** Diskon dalam IDR (repo menyimpan IDR; BE menjawab JOD). */
  discountIdr: number
  message: string
}

interface PromoCheckRow {
  valid?: boolean
  promoId?: number
  code?: string
  type?: string
  discount?: number
  message?: string
}

/**
 * Validasi kode untuk sebuah order. `amountIdr` = subtotal yang jadi dasar
 * potongan persen. Kode milik merchant lain / kedaluwarsa / kuota habis →
 * `valid: false` dengan pesan dari server.
 */
export async function validatePromo(
  code: string,
  amountIdr: number,
  merchantId = DEMO_MERCHANT_ID,
): Promise<PromoCheck> {
  // Kode promo boleh dibaca siapa saja (`marketing_public_read`); RPC-nya
  // SECURITY DEFINER, jadi sesi mana pun cukup. Dipakai sesi referensi supaya
  // tak menambah login baru.
  const token = await refToken()
  const res = await rpc<PromoCheckRow>(token, 'validate_promo', {
    p_code: code,
    p_amount: idrToJod(amountIdr),
    p_merchant_id: merchantId,
  })
  return {
    valid: Boolean(res?.valid),
    promoId: res?.promoId,
    code: res?.code,
    type: res?.type ? asType(res.type) : undefined,
    discountIdr: jodToIdr(res?.discount ?? 0),
    message: res?.message ?? 'Kode promo tidak valid.',
  }
}
