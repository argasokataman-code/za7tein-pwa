// Self-check aturan batch (PRD §8, BR-B01..B13).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/batch-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import {
  MAX_BATCH_ORDERS,
  batchAllPacked,
  batchCapacityLeft,
  batchIsFull,
  canStartEarly,
  countdownLabel,
  joinableBatches,
  nextBatchId,
} from '../src/data/batch.ts'

const batch = (over = {}) => ({
  id: 'batch-1',
  merchantId: 'merchant-1',
  courierId: null,
  orderIds: [],
  status: 'countdown',
  estimateMinutes: 25,
  countdownSeconds: 1500,
  autoSort: true,
  routeOrder: [],
  createdAt: '2026-10-15T08:00:00.000Z',
  ...over,
})

// Batas keras 24 order (BR-B04).
assert.equal(MAX_BATCH_ORDERS, 24)
const full = batch({ orderIds: Array.from({ length: 24 }, (_, i) => `o-${i}`) })
assert.equal(batchIsFull(full), true)
assert.equal(batchCapacityLeft(full), 0)
assert.equal(batchCapacityLeft(batch({ orderIds: ['a'] })), 23)

// Hanya batch ber-hitung-mundur yang belum penuh yang menerima order baru (BR-B02).
const list = [
  batch({ id: 'countdown-loose', status: 'countdown', orderIds: ['a'] }),
  batch({ id: 'countdown-full', status: 'countdown', orderIds: Array.from({ length: 24 }, (_, i) => `f-${i}`) }),
  batch({ id: 'closed', status: 'closed', orderIds: ['b'] }),
]
assert.deepEqual(
  joinableBatches(list).map((b) => b.id),
  ['countdown-loose'],
  'batch penuh atau sudah ditutup tidak boleh menerima order',
)

// Hitung mundur ringkas.
assert.equal(countdownLabel(1500), '25 mnt')
assert.equal(countdownLabel(0), 'selesai')
assert.equal(countdownLabel(-5), 'selesai')
assert.equal(countdownLabel(3600), '1 j 00 m')
assert.equal(countdownLabel(3900), '1 j 05 m')

// Mulai lebih awal: butuh batch ditutup DAN semua order packing (BR-B09).
const orders = [
  { id: 'a', packed: true, code: 'SA-1' },
  { id: 'b', packed: true, code: 'SA-2' },
]
const twoOrders = batch({ orderIds: ['a', 'b'], status: 'closed' })
assert.equal(batchAllPacked(twoOrders, orders), true)
assert.equal(canStartEarly(twoOrders, orders), true)

// Satu order belum packing → belum boleh mulai, walau batch sudah ditutup.
assert.equal(canStartEarly(twoOrders, [{ id: 'a', packed: true }, { id: 'b', packed: false }]), false)
// Batch masih hitung mundur → belum boleh mulai, walau packing sudah selesai.
assert.equal(canStartEarly(batch({ orderIds: ['a', 'b'], status: 'countdown' }), orders), false)
// Batch tanpa order nyata → jangan anggap "semua packing" (list kosong).
assert.equal(batchAllPacked(batch({ orderIds: [] }), orders), false)

// Id batch baru tidak boleh menabrak id yang ada.
assert.equal(nextBatchId([]), 'batch-1')
assert.equal(nextBatchId([batch({ id: 'batch-1' }), batch({ id: 'batch-2' })]), 'batch-3')
assert.equal(
  nextBatchId([batch({ id: 'batch-1' }), batch({ id: 'batch-3' })]),
  'batch-2',
  'lubang id di tengah dipakai dulu supaya tidak menabrak batch-3',
)

console.log('batch-check: OK')
