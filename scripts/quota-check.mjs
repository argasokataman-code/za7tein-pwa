// Self-check langganan kuota (§17): aritmetika kuota, status low/habis, aturan
// blokir browse, prioritas kolam order vs COD, dan transisi reserve/consume/return.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/quota-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import { QUOTA_LOW_RATIO, QUOTA_PURCHASE_AVAILABLE, mockQuotaPackages, mockQuotaSubscriptions } from '../src/data/marketplace.ts'
import quotaReducer, {
  codQuotaStatus,
  consumeQuota,
  merchantQuotaBlocked,
  quotaAvailableFor,
  quotaKindForOrder,
  quotaStatusFor,
  reserveQuota,
  returnQuota,
} from '../src/store/slices/quotaSlice.ts'

const sub = (kind, quota, used, reserved, merchantId = 'am-1') => ({
  id: `${merchantId}-${kind}`,
  merchantId,
  kind,
  quota,
  used,
  reserved,
  periodStart: '2026-10-01',
  periodEnd: '2026-10-31',
  active: true,
})

// Kuota tersedia = paket − terpakai − ter-reserve (§17).
const one = [sub('order', 100, 82, 1)]
assert.equal(quotaAvailableFor(one, 'am-1', 'order'), 17)
assert.equal(quotaAvailableFor(one, 'am-1', 'cod'), 0, 'jenis lain tidak ikut terhitung')

// Status: habis, hampir habis (≤ rasio), cukup, dan tak dikenal.
assert.equal(quotaStatusFor([sub('order', 60, 60, 0)], 'am-1', 'order'), 'exhausted')
assert.equal(quotaStatusFor(one, 'am-1', 'order'), 'low')
assert.equal(Math.round(QUOTA_LOW_RATIO * 100) + '%', '20%')
assert.equal(quotaStatusFor([sub('order', 100, 10, 0)], 'am-1', 'order'), 'available')
assert.equal(quotaStatusFor(one, 'am-lain', 'order'), 'unknown', 'data tak ada ≠ habis')

// Blokir browse (§17): hanya kuota ORDER yang habis memblokir, dan setting
// "terima order tanpa kuota" membatalkannya.
assert.equal(merchantQuotaBlocked([sub('order', 60, 60, 0)], 'am-1', false), true)
assert.equal(merchantQuotaBlocked([sub('order', 60, 60, 0)], 'am-1', true), false)
assert.equal(merchantQuotaBlocked(one, 'am-1', false), false, 'hampir habis masih tampil')
assert.equal(merchantQuotaBlocked(one, 'am-lain', false), false, 'tanpa data ≠ diblokir')
assert.equal(
  merchantQuotaBlocked([sub('cod', 40, 40, 0)], 'am-1', false),
  false,
  'kuota COD habis tidak menyembunyikan toko',
)

// Prioritas kolam (§17): COD hanya kuota COD; online → kuota order dulu, lalu COD.
assert.equal(quotaKindForOrder([sub('cod', 5, 0, 0)], 'am-1', true), 'cod')
assert.equal(quotaKindForOrder([sub('cod', 5, 5, 0)], 'am-1', true), null)
assert.equal(quotaKindForOrder(one, 'am-1', false), 'order')
assert.equal(
  quotaKindForOrder([sub('order', 5, 5, 0), sub('cod', 5, 0, 0)], 'am-1', false),
  'cod',
  'kuota order habis → jatuh ke kuota COD',
)
assert.equal(quotaKindForOrder([sub('order', 5, 5, 0)], 'am-1', false), null)

// Gate metode bayar COD: tiga nilai, `unknown` tidak memblokir.
assert.equal(codQuotaStatus([sub('cod', 5, 0, 0)], 'am-1'), 'available')
assert.equal(codQuotaStatus([sub('cod', 5, 5, 0)], 'am-1'), 'exhausted')
assert.equal(codQuotaStatus([sub('cod', 5, 5, 0)], 'am-lain'), 'unknown')

// Transisi order: reserve → consume memindahkan satu kuota dari reserved ke used;
// reserve → return hanya melepas reserved (used tidak berubah).
const stateOf = (subs) => ({ subscriptions: subs, acceptWithoutQuota: false })
const seeded = [sub('order', 100, 10, 0)]
const reserved = quotaReducer(stateOf(seeded), reserveQuota({ kind: 'order', merchantId: 'am-1' }))
assert.equal(reserved.subscriptions[0].reserved, 1)
assert.equal(quotaAvailableFor(reserved.subscriptions, 'am-1', 'order'), 89)

const consumed = quotaReducer(reserved, consumeQuota({ kind: 'order', merchantId: 'am-1' }))
assert.equal(consumed.subscriptions[0].used, 11)
assert.equal(consumed.subscriptions[0].reserved, 0)
assert.equal(quotaAvailableFor(consumed.subscriptions, 'am-1', 'order'), 89)

const returned = quotaReducer(reserved, returnQuota({ kind: 'order', merchantId: 'am-1' }))
assert.equal(returned.subscriptions[0].used, 10, 'kembali ≠ terpakai')
assert.equal(returned.subscriptions[0].reserved, 0)
assert.equal(quotaAvailableFor(returned.subscriptions, 'am-1', 'order'), 90)

// Reserve menolak merchant lain: transisi order toko A tidak menyentuh kuota toko B.
const crossed = quotaReducer(stateOf(seeded), reserveQuota({ kind: 'order', merchantId: 'am-2' }))
assert.equal(crossed.subscriptions[0].reserved, 0, 'merchant lain tak terpengaruh')

// Seed repo konsisten dengan aturan yang dipakai Home + layar langganan.
assert.equal(merchantQuotaBlocked(mockQuotaSubscriptions, 'am-4', false), true)
assert.equal(quotaStatusFor(mockQuotaSubscriptions, '1', 'order'), 'low')
assert.equal(quotaStatusFor(mockQuotaSubscriptions, '1', 'cod'), 'low')

// Paket kuota: dua jenis tersedia (order & COD), harga masuk akal, dan pembelian
// memang belum tersedia (flag) — supaya UI tak bisa menawarkan beli tanpa BE.
assert.deepEqual(
  [...new Set(mockQuotaPackages.map((p) => p.kind))].sort(),
  ['cod', 'order'],
  'paket harus mencakup kuota order dan kuota COD',
)
for (const pkg of mockQuotaPackages) {
  assert.ok(pkg.units > 0, `paket ${pkg.id} harus berisi order`)
  assert.ok(pkg.days > 0, `paket ${pkg.id} harus punya masa berlaku`)
  assert.ok(pkg.priceJod > 0, `paket ${pkg.id} harus punya harga`)
}
assert.equal(QUOTA_PURCHASE_AVAILABLE, false, 'belum ada endpoint kuota di BE')

console.log('quota-check OK')
