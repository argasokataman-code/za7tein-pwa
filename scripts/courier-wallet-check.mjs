// Self-check saldo dompet kurir (M5, R-DELIV-FEE + R-WALLET-01): fee pengantaran
// order Regular online yang sudah selesai masuk saldo; COD dan order belum
// selesai tidak.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/courier-wallet-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import { courierTasks } from '../src/data/courier.ts'
import {
  COURIER_MIN_WITHDRAW_IDR,
  courierFeeEntries,
  courierWalletAvailable,
  courierWalletBreakdown,
} from '../src/data/courierWallet.ts'

const payout = (amount) => [
  { id: `p-${amount}`, kind: 'payout', amount, status: 'pending', createdAt: '2026-10-15T12:00:00Z' },
]

// Hanya order selesai dengan fee > 0 yang jadi baris ledger (COD ber-fee 0).
const fees = courierFeeEntries(courierTasks)
assert.deepEqual(fees.map((entry) => entry.id), ['cfee-ct-4'], 'fee hanya dari order selesai')
assert.equal(fees[0].amount, courierTasks.find((t) => t.id === 'ct-4').deliveryFeeIdr)
assert.ok(fees.every((entry) => entry.kind === 'settlement' && entry.status === 'completed'))
// ct-3 Regular online tapi belum selesai (checkpoint tiba) → fee ditahan.
assert.ok(!fees.some((entry) => entry.id === 'cfee-ct-3'), 'order belum selesai belum dibayar')

// Saldo = fee + tips − pencairan, tanpa state saldo tersendiri.
const { tips, fees: feeTotal, withdrawn, available } = courierWalletBreakdown(courierTasks, [])
assert.equal(withdrawn, 0)
assert.equal(available, tips + feeTotal, 'saldo = tips + fee saat belum ada pencairan')
assert.equal(courierWalletAvailable(courierTasks, []), available)

// Pencairan mengurangi saldo; tak pernah negatif.
assert.equal(courierWalletAvailable(courierTasks, payout(10_000)), available - 10_000)
assert.equal(courierWalletAvailable(courierTasks, payout(10_000_000)), 0, 'saldo dijepit di 0')

// Data demo harus melewati ambang supaya alur pencairan bisa diperiksa.
assert.ok(available >= COURIER_MIN_WITHDRAW_IDR, 'saldo demo ≥ ambang penarikan')

console.log('courier-wallet-check: OK')
