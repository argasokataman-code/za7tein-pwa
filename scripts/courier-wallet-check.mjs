// Self-check dompet kurir (M5, R-DELIV-FEE + R-WALLET-01 + PRD §16.4): fee
// pengantaran order Regular online yang selesai dikirim otomatis ke DANA —
// TIDAK masuk saldo tarik. Saldo tarik = tips − pencairan. COD dan order belum
// selesai tidak masuk ke mana pun.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/courier-wallet-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import { courierTasks } from '../src/data/courier.ts'
import {
  COURIER_MIN_WITHDRAW_IDR,
  courierFeeEntries,
  courierFeesPaid,
  courierTipsAvailable,
  courierTipsBreakdown,
} from '../src/data/courierWallet.ts'

const payout = (amount) => [
  { id: `p-${amount}`, kind: 'payout', amount, status: 'pending', createdAt: '2026-10-15T12:00:00Z' },
]

// Ledger fee: hanya order selesai dengan fee > 0 yang jadi baris (COD ber-fee 0).
const fees = courierFeeEntries(courierTasks)
assert.deepEqual(fees.map((entry) => entry.id), ['cfee-ct-4'], 'fee hanya dari order selesai')
assert.equal(fees[0].amount, courierTasks.find((t) => t.id === 'ct-4').deliveryFeeIdr)
assert.ok(fees.every((entry) => entry.kind === 'settlement' && entry.status === 'completed'))
// ct-3 Regular online tapi belum selesai (checkpoint tiba) → fee belum dikirim.
assert.ok(!fees.some((entry) => entry.id === 'cfee-ct-3'), 'order belum selesai belum dibayar')
assert.equal(courierFeesPaid(courierTasks), fees.reduce((sum, entry) => sum + entry.amount, 0))

// Saldo tarik = tips saja. `available === tips` membuktikan fee (yang > 0 di
// data demo) tidak ikut menambah saldo — inti keputusan §16.4.
const { tips, withdrawn, available } = courierTipsBreakdown(courierTasks, [])
assert.ok(courierFeesPaid(courierTasks) > 0, 'ada fee di data demo untuk diuji')
assert.equal(withdrawn, 0)
assert.equal(available, tips, 'saldo = tips saja saat belum ada pencairan, tanpa fee')
assert.equal(courierTipsAvailable(courierTasks, []), available)

// Pencairan mengurangi saldo; tak pernah negatif.
assert.equal(courierTipsAvailable(courierTasks, payout(10_000)), available - 10_000)
assert.equal(courierTipsAvailable(courierTasks, payout(10_000_000)), 0, 'saldo dijepit di 0')

// Data demo harus melewati ambang supaya alur pencairan bisa diperiksa.
assert.ok(available >= COURIER_MIN_WITHDRAW_IDR, 'saldo tips demo ≥ ambang penarikan')

console.log('courier-wallet-check: OK')
