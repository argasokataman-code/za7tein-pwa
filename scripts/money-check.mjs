// Self-check uang (§16.2–§16.4): rincian harga, settlement 3 kolom, pembulatan.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/money-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import {
  PLATFORM_FEE_CUSTOMER_DEFAULT_JOD,
  PLATFORM_FEE_MERCHANT_DEFAULT_JOD,
  QUICK_MULTIPLIER_DEFAULT,
  TRANSACTION_FEE_RATE,
  priceBreakdown,
  roundBillUpToHundreds,
  roundPayoutDownToRupiah,
  settlementFor,
} from '../src/data/marketplace.ts'

const base = { subtotalJod: 10, deliveryFeeJod: 1.5 }

// Ft: hanya QRIS, dan = 1,5% x (S - Dm - Da + F + Pc).
const qris = priceBreakdown({ ...base, method: 'qris' })
const net = 10 - 0 - 0 + 1.5 + PLATFORM_FEE_CUSTOMER_DEFAULT_JOD
assert.equal(qris.transactionFeeJod, TRANSACTION_FEE_RATE * net)
assert.equal(
  qris.totalJod,
  net + qris.transactionFeeJod,
  'total = S - Dm - Da + F + Pc + Ft',
)

const dana = priceBreakdown({ ...base, method: 'dana' })
const cod = priceBreakdown({ ...base, method: 'cod' })
assert.equal(dana.transactionFeeJod, 0, 'saldo DANA tidak kena Ft')
assert.equal(cod.transactionFeeJod, 0, 'COD tidak kena Ft')
assert.equal(dana.totalJod, cod.totalJod)

// Pengali Quick mengalikan fee kurir saja (F), bukan subtotal.
const quick = priceBreakdown({ ...base, method: 'qris', quick: true })
assert.equal(quick.deliveryFeeJod, 1.5 * QUICK_MULTIPLIER_DEFAULT)
assert.equal(quick.subtotalJod, 10)

// Diskon masuk ke total dan ke kolom yang tepat.
const disc = priceBreakdown({
  subtotalJod: 10,
  deliveryFeeJod: 1.5,
  discountMerchantJod: 1,
  discountPlatformJod: 0.5,
  method: 'qris',
})
assert.equal(
  disc.totalJod,
  10 - 1 - 0.5 + 1.5 + PLATFORM_FEE_CUSTOMER_DEFAULT_JOD + disc.transactionFeeJod,
)

// Settlement: 3 kolom selalu berjumlah total.
for (const [quota, b] of [
  ['none', qris],
  ['order', qris],
  ['cod', cod],
]) {
  const s = settlementFor(b, quota)
  assert.equal(
    Number((s.merchantJod + s.courierJod + s.platformJod).toFixed(9)),
    Number(b.totalJod.toFixed(9)),
    `kolom settlement harus = total (quota ${quota})`,
  )
  assert.equal(s.courierJod, b.deliveryFeeJod, 'delivery fee utuh ke kurir')
}

// Online tanpa kuota: Pm dipotong dari merchant.
const noneS = settlementFor(qris, 'none')
assert.equal(
  noneS.merchantJod,
  qris.subtotalJod - qris.discountMerchantJod - PLATFORM_FEE_MERCHANT_DEFAULT_JOD,
)
// Kuota order: Pm tidak dipotong.
assert.equal(settlementFor(qris, 'order').merchantJod, qris.subtotalJod)
// COD berkuota: Pc jadi hak merchant.
assert.equal(settlementFor(cod, 'cod').merchantJod, cod.subtotalJod + PLATFORM_FEE_CUSTOMER_DEFAULT_JOD)

// Pembulatan: tagihan ke atas ratusan, payout ke bawah rupiah penuh.
assert.equal(roundBillUpToHundreds(1234), 1300)
assert.equal(roundBillUpToHundreds(1200), 1200)
assert.equal(roundPayoutDownToRupiah(1234.9), 1234)
assert.equal(roundBillUpToHundreds(1234) - roundPayoutDownToRupiah(1234.9), 66, 'sisa = aplikator')

console.log('money-check OK')
