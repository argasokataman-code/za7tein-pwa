// Self-check logika discovery (PRD §6) — fungsi murni di `src/data/storefronts.ts`.
// Jalankan: node scripts/discovery-check.mjs
// Tanpa framework: kalau logika ini rusak, assert pertama yang gagal sudah menunjuk.
import assert from 'node:assert/strict'

import {
  filterStorefronts,
  groupStorefrontsByTag,
  isSelectable,
  sortStorefronts,
  storefronts,
  visibleStorefronts,
} from '../src/data/storefronts.ts'

// Toko yang memblokir kuota order (am-4) disembunyikan; sisanya tetap.
assert.equal(visibleStorefronts(storefronts).some((s) => s.id === 'am-4'), false)
assert.equal(visibleStorefronts(storefronts).length, storefronts.length - 1)

// Tutup / di luar coverage tetap tampil, tapi tak bisa dipilih.
const byId = (id) => storefronts.find((s) => s.id === id)
assert.equal(isSelectable(byId('am-1')), true)
assert.equal(isSelectable(byId('am-2')), false) // di luar coverage
assert.equal(isSelectable(byId('am-3')), false) // tutup

// Grup hanya per tag; toko multi-tag muncul di beberapa grup.
const groups = groupStorefrontsByTag(visibleStorefronts(storefronts))
const tags = groups.map((g) => g.tag)
assert.ok(tags.includes('Sate') && tags.includes('Kopi'))
assert.ok(groups.find((g) => g.tag === 'Rumahan').stores.length >= 2)
assert.equal(groups.some((g) => g.tag === null), false) // semua toko bertag → tanpa grup null
const withUntagged = groupStorefrontsByTag([...storefronts, { ...storefronts[0], id: 'x', tags: [] }])
assert.equal(withUntagged.at(-1).tag, null) // toko tanpa tag dikumpulkan terakhir, tak hilang

// Sort: jarak menaik, rating menurun, order menurun.
const distance = sortStorefronts(storefronts, 'distance').map((s) => s.distanceMeters)
assert.deepEqual(distance, [...distance].sort((a, b) => a - b))
const rating = sortStorefronts(storefronts, 'rating').map((s) => s.rating)
assert.deepEqual(rating, [...rating].sort((a, b) => b - a))

// Filter: tag, jarak maksimum, rating minimum.
assert.equal(filterStorefronts(storefronts, { tags: ['Kopi'] }).length, 1)
assert.ok(
  filterStorefronts(storefronts, { maxDistanceMeters: 800 }).every(
    (s) => s.distanceMeters <= 800,
  ),
)
assert.ok(filterStorefronts(storefronts, { minRating: 4.7 }).every((s) => s.rating >= 4.7))

console.log('discovery-check OK')
