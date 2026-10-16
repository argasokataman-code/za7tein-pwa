// Self-check `mergeOrders` (BUG-88046): kolom yang hanya hidup di klien harus
// selamat dari refetch BE. Jalankan:
//   node --import ./scripts/lib/ts-resolve.mjs scripts/merge-orders-check.mjs
import assert from 'node:assert/strict'

import reducer, { mergeOrders, setOrderBatch, setOrderPacked } from '../src/store/slices/merchantSlice.ts'

const rowFromBe = (id, extra = {}) => ({
  id,
  code: 'SA-X',
  customerId: '1',
  customerName: 'Customer 1',
  buyerAvatar: '',
  buyerRating: 0,
  address: 'Zona hijazi',
  items: [],
  total: 1000,
  distanceMeters: 0,
  zone: 'hijazi',
  status: 'baru',
  placedAt: 'baru saja',
  paymentMethod: 'cod',
  deliveryType: 'regular',
  ...extra,
})

// State awal: satu order dengan tanda klien (packed/batchId/cookMinutes).
let state = reducer(undefined, { type: '@@init' })
state = reducer(state, mergeOrders([rowFromBe('api-832')]))
state = reducer(state, setOrderPacked({ id: 'api-832', packed: true }))
state = reducer(state, setOrderBatch({ id: 'api-832', batchId: 'batch-1' }))

// Refetch realtime: baris BE datang tanpa kolom klien.
const before = state.orders[0]
assert.equal(before.packed, true)
assert.equal(before.batchId, 'batch-1')

state = reducer(state, mergeOrders([rowFromBe('api-832', { status: 'diantar' })]))

const after = state.orders[0]
assert.equal(after.status, 'diantar', 'kolom BE tetap menang')
assert.equal(after.packed, true, 'packed harus selamat dari refetch (syarat BR-B09)')
assert.equal(after.batchId, 'batch-1', 'batchId harus selamat dari refetch')

// Nilai eksplisit dari BE tidak ditimpa oleh state lama.
state = reducer(state, mergeOrders([rowFromBe('api-832', { packed: false, status: 'diantar' })]))
assert.equal(state.orders[0].packed, false, 'packed=false dari BE tidak boleh di-resurrect')

// Order baru (belum ada di state) masuk apa adanya, tanpa mewarisi milik orang lain.
// Payload selalu daftar penuh dari BE (useApiOrders/useApiRealtime), bukan tambalan.
state = reducer(state, mergeOrders([rowFromBe('api-832', { packed: false }), rowFromBe('api-833')]))
assert.equal(state.orders.length, 2)
assert.equal(state.orders.find((o) => o.id === 'api-833').packed, undefined)

// Order yang hilang dari respons BE (mis. dibatalkan di luar sesi) ikut terbuang.
state = reducer(state, mergeOrders([rowFromBe('api-832')]))
assert.deepEqual(
  state.orders.map((o) => o.id),
  ['api-832'],
)

console.log('merge-orders-check: OK')
