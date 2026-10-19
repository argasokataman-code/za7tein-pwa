/**
 * Aturan rating & review (PRD aktif `sa7tein-mvp-2026-10-11` §20.2, §10 CUS-27/28,
 * §14). Fungsi murni: "apa yang dinilai dan dengan bentuk apa" tinggal di sini
 * supaya bisa diuji tanpa browser, dan supaya layar tidak menebak sendiri.
 *
 * Yang **tidak** ada di sini: angka rata-rata hasil backend. Repo ini mock —
 * rata-rata yang tampil dihitung dari data yang ada, bukan dikarang.
 */

/** §20.2: skala bintang 1–5, untuk merchant maupun menu item. */
export const RATING_SCALE = [1, 2, 3, 4, 5] as const
export const RATING_MAX = 5

/**
 * §20.2: rating merchant **dengan** review; rating menu item **tanpa** review.
 * Bedanya penting: kalau keduanya butuh teks, form menu item jadi lebih berat
 * dari yang diminta PRD.
 */
export const RATING_NEEDS_REVIEW = { merchant: true, item: false } as const

/** §14: "Rating hanya di level menu item, tidak per variant." */
export const VARIANT_RATING_SUPPORTED = false

/** §20.2: "Tidak ada batas waktu pengisian." `null` = tanpa jendela waktu. */
export const RATING_WINDOW_DAYS: number | null = null

/** §20.2: "Review tidak dimoderasi ops." */
export const RATING_MODERATED = false

/** §20.2: "Rating dan review diisi di layar detail order, yang dibuka lewat menu riwayat order." */
export const RATING_FROM_HISTORY = true

/**
 * Nama event BE. PRD **tidak** menamai eventnya; nama ini dari
 * `analysis.md:27` (tabel requirement delta) — jangan diklaim sebagai kutipan PRD.
 */
export const RATING_EVENT = 'rating_submitted'

/**
 * Rating menu item kini bisa diisi: form membaca daftar hidangan order dari
 * `order_items` (`fetchOrderDishes`, best-effort) dan menulis baris rating
 * ber-`menu_id` lewat `submitDishReview`. Blok bintang per hidangan hanya
 * muncul bila order itu memang punya baris `order_items` — tanpa mengarang
 * nama menu.
 */
export const MENU_RATING_AVAILABLE = true

export interface RateableOrderLine {
  id: string
  name: string
}

export interface RateableOrder {
  merchantName: string
  items: RateableOrderLine[]
}

export interface RatingTarget {
  kind: 'merchant' | 'item'
  /** Id baris order untuk menu item, atau `merchant` untuk penilaian toko. */
  id: string
  label: string
  needsReview: boolean
}

/**
 * Sasaran penilaian satu order: toko + **tiap menu yang dipesan**. Varian tidak
 * pernah jadi sasaran sendiri (§14) — baris order memang per menu, bukan per
 * varian, jadi bentuk datanya sudah menegakkan aturan itu.
 */
export function ratingTargetsFor(order: RateableOrder): RatingTarget[] {
  return [
    {
      kind: 'merchant',
      id: 'merchant',
      label: order.merchantName,
      needsReview: RATING_NEEDS_REVIEW.merchant,
    },
    ...order.items.map((item) => ({
      kind: 'item' as const,
      id: item.id,
      label: item.name,
      needsReview: RATING_NEEDS_REVIEW.item,
    })),
  ]
}

/** Rata-rata + jumlah dari satu daftar bintang. Kosong → rata-rata `null`. */
export function ratingSummary(values: number[]): { average: number | null; count: number } {
  if (!values.length) return { average: null, count: 0 }
  const total = values.reduce((sum, value) => sum + value, 0)
  return { average: Math.round((total / values.length) * 10) / 10, count: values.length }
}

/**
 * Nilai bintang mentah saja yang sah: angka, dalam skala, dan bukan pecahan.
 * Dipakai form sebelum mengirim, supaya keranjang bintang kosong tak lolos.
 */
export function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= RATING_MAX
}
