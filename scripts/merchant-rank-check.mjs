// Self-check peringkat "Menu terjual" (beranda merchant).
// Aturan intinya: satu menu dihitung SEKALI, bukan sekali per order.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/merchant-rank-check.mjs
import assert from 'node:assert/strict'

import { menuSalesRanking, topMenuShare } from '../src/data/merchantTrend.ts'
import { QUEUE_TABS, isOrderToday } from '../src/data/merchantOrders.ts'

const item = (menuId, name, quantity, price) => ({
  id: `api-line-${Math.random().toString(36).slice(2, 8)}`,
  menuId,
  name,
  quantity,
  price,
  image: '',
})

const order = (id, status, items) => ({ id, status, items })

// `menu_id` sama di dua order → satu baris, qty & omzet dijumlahkan.
const collapsed = menuSalesRanking([
  order('o1', 'selesai', [item('11', 'Lontong Sayur', 3, 20000), item('5', 'Sate Ayam', 2, 30000)]),
  order('o2', 'diproses', [item('11', 'Lontong Sayur', 1, 20000)]),
])
assert.equal(collapsed.length, 2, 'satu menu = satu baris lintas order')
assert.deepEqual(
  collapsed.map((row) => [row.id, row.name, row.sold, row.revenueIdr, row.orders]),
  [
    ['11', 'Lontong Sayur', 4, 80000, 2],
    ['5', 'Sate Ayam', 2, 60000, 1],
  ],
  'urut qty desc, qty/omzet/order dijumlahkan',
)

// Tanpa `menuId` (data mock) jatuh ke `id`, jadi tetap satu baris per menu.
const fallback = menuSalesRanking([
  order('o3', 'selesai', [{ id: '1', name: 'Sate Ayam', quantity: 2, price: 28000, image: '' }]),
  order('o4', 'selesai', [{ id: '1', name: 'Sate Ayam', quantity: 2, price: 28000, image: '' }]),
])
assert.equal(fallback.length, 1, 'tanpa menuId, kunci = id item')
assert.equal(fallback[0].sold, 4)

// Order ditolak/batal tidak pernah jadi penjualan.
assert.equal(
  menuSalesRanking([order('o5', 'ditolak', [item('9', 'Es Teh', 5, 5000)])]).length,
  0,
)
assert.equal(
  menuSalesRanking([order('o6', 'batal', [item('9', 'Es Teh', 5, 5000)])]).length,
  0,
)

// `menuId` berbeda dengan nama sama tetap dua baris (dua menu berbeda).
assert.equal(
  menuSalesRanking([
    order('o7', 'selesai', [item('a', 'Nasi Goreng', 1, 10000), item('b', 'Nasi Goreng', 1, 10000)]),
  ]).length,
  2,
)

// Ringkasan porsi teratas: 4 dari 6 porsi.
const share = topMenuShare(collapsed)
assert.deepEqual(share, { name: 'Lontong Sayur', share: 4 / 6, orders: 2 })
assert.equal(topMenuShare([]), null)

// Pendapatan dashboard = hari kalender berjalan saja, bukan seluruh riwayat.
const siang = new Date('2026-10-26T12:00:00+07:00').getTime()
assert.equal(
  isOrderToday({ placedAtMs: new Date('2026-10-26T01:00:00+07:00').getTime() }, siang),
  true,
  'order pagi ini dihitung',
)
assert.equal(
  isOrderToday({ placedAtMs: new Date('2026-10-25T23:59:00+07:00').getTime() }, siang),
  false,
  'order kemarin tidak dihitung',
)
assert.equal(isOrderToday({}, siang), true, 'seed tanpa tanggal tetap terhitung')

// Tab antrean memecah proses dapur: Disiapkan, Siap, Diantar (bukan satu tab).
assert.deepEqual(
  QUEUE_TABS.filter((t) => ['disiapkan', 'siap', 'diantar'].includes(t.id)).map((t) => t.label),
  ['Disiapkan', 'Siap', 'Diantar'],
)

console.log('merchant-rank-check: OK')
