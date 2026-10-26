// Self-check baris invoice (customer + merchant).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/invoice-check.mjs
import assert from 'node:assert/strict'

import { jodToIdr } from '../src/data/currency.ts'
import { customerInvoiceRows, invoiceShareText, merchantInvoice } from '../src/data/invoice.ts'
import {
  PLATFORM_FEE_CUSTOMER_DEFAULT_JOD,
  PLATFORM_FEE_MERCHANT_DEFAULT_JOD,
} from '../src/data/marketplace.ts'

const base = {
  subtotalIdr: 56_000,
  deliveryFeeIdr: 9_000,
  discountIdr: 0,
  platformFeeCustomerIdr: 2_000,
  transactionFeeIdr: 0,
  totalIdr: 67_000,
}

// Non-QRIS: tiga baris, tanpa biaya transaksi & tanpa potongan.
assert.deepEqual(
  customerInvoiceRows(base).map((row) => row.label),
  ['Subtotal menu', 'Ongkir', 'Biaya layanan'],
)

// QRIS menambah baris Ft; diskon jadi baris terakhir bertanda `discount`.
const qris = customerInvoiceRows({
  ...base,
  transactionFeeIdr: 1_005,
  discountIdr: 5_000,
})
assert.equal(qris.length, 5)
assert.equal(qris.at(-1)?.kind, 'discount')
assert.equal(qris.at(-1)?.amountIdr, 5_000)

// Merchant: dasar subtotal item, bukan total order (ongkir bukan pendapatannya).
const merchant = merchantInvoice([
  { price: 28_000, quantity: 2 },
  { price: 10_000, quantity: 1 },
])
const feeIdr = jodToIdr(PLATFORM_FEE_MERCHANT_DEFAULT_JOD)
assert.equal(merchant.subtotalIdr, 66_000)
assert.equal(merchant.netIdr, 66_000 - feeIdr)
assert.equal(merchant.rows.length, 2)
assert.equal(merchant.rows[1].kind, 'discount')
assert.equal(merchant.rows[1].amountIdr, feeIdr)

// Order COD: Pm tidak ditagih (§16.5) dan Pc jadi hak merchant (§17).
const codInvoice = merchantInvoice(
  [
    { price: 28_000, quantity: 2 },
    { price: 10_000, quantity: 1 },
  ],
  { paymentMethod: 'cod' },
)
const customerFeeIdr = jodToIdr(PLATFORM_FEE_CUSTOMER_DEFAULT_JOD)
assert.equal(codInvoice.netIdr, 66_000 + customerFeeIdr)
assert.equal(codInvoice.rows.length, 2)
assert.equal(codInvoice.rows[0].label, 'Subtotal menu')
assert.match(codInvoice.rows[1].label, /Platform fee customer \(COD/)
assert.equal(codInvoice.rows[1].amountIdr, customerFeeIdr)

// Online dengan kuota: Pm juga tidak dipotong (§17).
assert.equal(
  merchantInvoice([{ price: 10_000, quantity: 1 }], { quotaKind: 'order' }).netIdr,
  10_000,
)
assert.equal(
  merchantInvoice([{ price: 10_000, quantity: 1 }], { quotaKind: 'cod' }).rows.length,
  1,
)

// Order receh tidak menghasilkan pendapatan negatif.
assert.equal(merchantInvoice([{ price: 1_000, quantity: 1 }]).netIdr, 0)

// Teks share: judul, semua baris, total di akhir, potongan bertanda minus.
const text = invoiceShareText('Invoice #S7-1', merchantInvoice([
  { price: 28_000, quantity: 2 },
]).rows, { label: 'Bersih untuk toko', amountIdr: 56_000 - feeIdr })
const lines = text.split('\n')
assert.equal(lines[0], 'Sa7tein · Invoice #S7-1')
assert.equal(lines.length, 4)
assert.match(lines[2], /^Biaya platform .*−/)
assert.match(lines[3], /^Bersih untuk toko {2}/)

console.log('invoice-check: ok')
