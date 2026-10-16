// Self-check aturan rating & review (M8, PRD §20.2, §10 CUS-27/28, §14).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/rating-check.mjs
import assert from 'node:assert/strict'

import {
  MENU_RATING_AVAILABLE,
  RATING_EVENT,
  RATING_FROM_HISTORY,
  RATING_MAX,
  RATING_MODERATED,
  RATING_NEEDS_REVIEW,
  RATING_SCALE,
  RATING_WINDOW_DAYS,
  VARIANT_RATING_SUPPORTED,
  isValidRating,
  ratingSummary,
  ratingTargetsFor,
} from '../src/data/rating.ts'

// Skala bintang 1..5 untuk merchant maupun menu item (§20.2).
assert.deepEqual([...RATING_SCALE], [1, 2, 3, 4, 5])
assert.equal(RATING_MAX, 5)

// Bentuk pengisian berbeda: merchant dengan review, menu item tanpa review.
assert.equal(RATING_NEEDS_REVIEW.merchant, true)
assert.equal(RATING_NEEDS_REVIEW.item, false)

// §14: tidak ada rating per variant.
assert.equal(VARIANT_RATING_SUPPORTED, false)

// §20.2: tanpa batas waktu, tanpa moderasi ops, diisi lewat riwayat order.
assert.equal(RATING_WINDOW_DAYS, null, 'tak boleh ada jendela waktu pengisian')
assert.equal(RATING_MODERATED, false)
assert.equal(RATING_FROM_HISTORY, true)

// Nama event dari analysis.md (PRD tidak menamainya) — pastikan tidak berubah diam-diam.
assert.equal(RATING_EVENT, 'rating_submitted')

// Rating menu ditahan sampai BE mengirim daftar hidangan pesanan.
assert.equal(MENU_RATING_AVAILABLE, false)

// Sasaran penilaian: toko + tiap menu yang dipesan, dan TIDAK ada sasaran varian.
const targets = ratingTargetsFor({
  merchantName: 'Ayam Geprek Bu Rina',
  items: [
    { id: 'l1', name: 'Geprek Original' },
    { id: 'l2', name: 'Es Teh Manis' },
  ],
})
assert.equal(targets.length, 3, 'satu toko + dua hidangan')
assert.equal(targets[0].kind, 'merchant')
assert.equal(targets[0].needsReview, true)
assert.deepEqual(
  targets.slice(1).map((t) => [t.kind, t.id, t.needsReview]),
  [
    ['item', 'l1', false],
    ['item', 'l2', false],
  ],
  'hidangan = bintang saja (tanpa review), satu baris per menu',
)
assert.ok(
  targets.every((t) => !('variant' in t)),
  'varian tidak pernah jadi sasaran penilaian sendiri (§14)',
)
// Order tanpa item tetap punya sasaran toko (order merkantil kosong tak bikin crash).
assert.equal(ratingTargetsFor({ merchantName: 'Toko', items: [] }).length, 1)

// Rata-rata + jumlah: satu desimal, kosong → null (jangan menampilkan 0 palsu).
assert.deepEqual(ratingSummary([]), { average: null, count: 0 })
assert.deepEqual(ratingSummary([5]), { average: 5, count: 1 })
assert.deepEqual(ratingSummary([5, 4]), { average: 4.5, count: 2 })
assert.deepEqual(ratingSummary([4, 5, 4]), { average: 4.3, count: 3 })

// Validasi bintang sebelum kirim.
assert.equal(isValidRating(0), false)
assert.equal(isValidRating(1), true)
assert.equal(isValidRating(5), true)
assert.equal(isValidRating(6), false)
assert.equal(isValidRating(4.5), false)
assert.equal(isValidRating(Number.NaN), false)

console.log('rating-check: OK')
