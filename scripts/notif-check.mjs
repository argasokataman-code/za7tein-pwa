// Self-check katalog emit + penjaga audience notifikasi (M7, PRD §20.3, CUS-29).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/notif-check.mjs
import assert from 'node:assert/strict'

import { NOTIF_EMIT, notifAudienceOf, notifVisibleTo, notificationsFor } from '../src/data/notif.ts'

// Empat kanal customer §20.3 masing-masing punya entri katalog.
const evts = Object.keys(NOTIF_EMIT)
assert.deepEqual(
  evts.sort(),
  ['courier_almost_arrived', 'merchant_new_coverage', 'order_status', 'promo_published'],
  'katalog harus memuat tepat empat kanal customer §20.3',
)
for (const [name, e] of Object.entries(NOTIF_EMIT)) {
  assert.equal(e.audience, 'customer', `${name}: kanal §20.3 semuanya ke customer`)
  assert.ok(e.sumber.includes('§'), `${name}: tiap entri wajib menyebut baris sumbernya`)
  assert.ok(e.title.length > 0 && e.body.length > 0, `${name}: judul & isi tidak boleh kosong`)
  assert.ok(['fe', 'be'].includes(e.emit), `${name}: jalur emit harus fe atau be`)
}
// Yang belum ada pemanggilnya jujur ditandai `be` (job backend), bukan diklaim ada.
assert.equal(NOTIF_EMIT.promo_published.emit, 'be')
assert.equal(NOTIF_EMIT.merchant_new_coverage.emit, 'be')
assert.equal(NOTIF_EMIT.courier_almost_arrived.emit, 'fe')
// Ambang di katalog & ambang di R-TRACK harus satu angka, bukan dua.
const { ALMOST_ARRIVED_MINUTES } = await import('../src/data/tracking.ts')
assert.ok(
  NOTIF_EMIT.courier_almost_arrived.body.includes(String(ALMOST_ARRIVED_MINUTES)),
  'isi notifikasi hampir sampai harus memakai ambang yang sama dengan R-TRACK',
)

// Penjaga audience: baris peran lain ditolak, siaran diterima semua peran.
assert.equal(notifVisibleTo('merchant', 'customer'), false, 'baris merchant tak boleh masuk customer')
assert.equal(notifVisibleTo('cs', 'merchant'), false)
assert.equal(notifVisibleTo('customer', 'customer'), true)
assert.equal(notifVisibleTo('all', 'courier'), true, 'siaran terlihat semua peran')
assert.equal(notifVisibleTo('all', 'cs'), true)
assert.equal(notifVisibleTo(undefined, 'customer'), true, 'baris tanpa kolom audience tidak disembunyikan')

// Nilai mentah kolom: `all` dikenali, sampah tidak ditebak jadi peran.
assert.equal(notifAudienceOf('all'), 'all')
assert.equal(notifAudienceOf('merchant'), 'merchant')
assert.equal(notifAudienceOf('cs@test.com'), undefined)
assert.equal(notifAudienceOf(null), undefined)

// Daftar: peran customer hanya melihat miliknya + siaran.
const rows = [
  { id: 'n1', kind: 'order', title: 'a', body: '', time: '10.00', unread: true, audience: 'customer' },
  { id: 'n2', kind: 'order', title: 'b', body: '', time: '10.01', unread: true, audience: 'merchant' },
  { id: 'n3', kind: 'promo', title: 'c', body: '', time: '10.02', unread: false, audience: 'all' },
  { id: 'n4', kind: 'system', title: 'd', body: '', time: '10.03', unread: false },
]
assert.deepEqual(notificationsFor(rows, 'customer').map((n) => n.id), ['n1', 'n3', 'n4'])
assert.deepEqual(notificationsFor(rows, 'merchant').map((n) => n.id), ['n2', 'n3', 'n4'])
assert.deepEqual(notificationsFor(rows, 'courier').map((n) => n.id), ['n3', 'n4'])
assert.deepEqual(notificationsFor([], 'customer'), [])

console.log('notif-check: OK')
