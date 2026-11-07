// Self-check uang tunai COD + ambang label loyalitas.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/cod-cash-check.mjs
import assert from 'node:assert/strict'

import {
  COD_CASH_MAX_JOD,
  codCashDue,
  codCashHint,
  codCashOptions,
  codChangeIdr,
  parseCodCashJod,
} from '../src/data/codCash.ts'
import { jodToIdr } from '../src/data/currency.ts'
import { LOYAL_ORDER_MIN, isLoyalCustomer } from '../src/data/people.ts'


const total = jodToIdr(0.42)
const options = codCashOptions(total)

// Uang pas selalu pilihan pertama dan kembaliannya nol.
assert.equal(options[0].label, 'Uang pas')
assert.equal(options[0].receivedIdr, total)
assert.equal(options[0].changeIdr, 0)

// Nominal tidak berulang, dan setiap pilihan menutup tagihan.
assert.equal(new Set(options.map((option) => option.receivedIdr)).size, options.length)
for (const option of options) assert.ok(option.receivedIdr >= total)

// Kembalian = selisih, tidak pernah negatif.
assert.equal(codChangeIdr(total, options[1].receivedIdr), options[1].receivedIdr - total)
assert.equal(codChangeIdr(total, 0), 0)

// Kalau tagihan sudah pas 1 JOD, pilihan "1 JOD" tidak diulang.
const exactJod = codCashOptions(jodToIdr(1))
assert.equal(exactJod.length, 2)

// Hint menyebut uang pas atau nominal + kembalian, bukan kalimat kosong.
assert.match(codCashHint(total, total), /uang pas/i)
assert.match(codCashHint(total, options[1].receivedIdr), /kembalian/i)

// Nominal bebas yang diketik customer: koma dan titik sama-sama diterima, dan
// hasilnya IDR yang dipakai store supaya struk tidak menyimpan angka lain.
assert.equal(parseCodCashJod('50')?.idr, jodToIdr(50))
assert.equal(parseCodCashJod('50,5')?.idr, jodToIdr(50.5))
assert.equal(parseCodCashJod('50.5')?.idr, jodToIdr(50.5))
assert.equal(parseCodCashJod(' 50 ')?.idr, parseCodCashJod('50')?.idr)
// Kosong, bukan angka, nol, minus, dan di atas batas ditolak (null), bukan 0.
for (const bad of ['', '  ', '.', ',', 'abc', '0', '-5', '1,234', '50,505', String(COD_CASH_MAX_JOD + 1)]) {
  assert.equal(parseCodCashJod(bad), null, `harus null: ${bad}`)
}
// Batas atas sendiri masih sah, dan kembaliannya dihitung dari angka itu.
assert.equal(parseCodCashJod(String(COD_CASH_MAX_JOD))?.idr, jodToIdr(COD_CASH_MAX_JOD))
assert.equal(codChangeIdr(total, parseCodCashJod('50')?.idr ?? 0), jodToIdr(50) - total)

// Rincian merchant/kurir: subtotal dari item, sisa = ongkir + layanan.
const due = codCashDue(
  [
    { price: jodToIdr(0.2), quantity: 1 },
    { price: jodToIdr(0.1), quantity: 2 },
  ],
  total,
)
assert.equal(due.subtotalIdr, jodToIdr(0.4))
assert.equal(due.extraIdr, total - due.subtotalIdr)
assert.equal(due.totalIdr, total)
assert.deepEqual(due.options, options)
// Total di bawah subtotal (mis. diskon penuh) tidak menghasilkan ongkir negatif.
assert.equal(codCashDue([{ price: total * 2, quantity: 1 }], total).extraIdr, 0)

const baseCustomer = {
  id: 'cus-test',
  name: 'Tes',
  phone: '+620000',
  phoneVerified: true,
  avatar: '',
  addressCount: 0,
  status: 'active',
  joinedAt: 'hari ini',
}
const loyal = { ...baseCustomer, lifetimeOrders: LOYAL_ORDER_MIN }
const notLoyal = { ...baseCustomer, lifetimeOrders: LOYAL_ORDER_MIN - 1 }
assert.equal(isLoyalCustomer(loyal), true)
assert.equal(isLoyalCustomer(notLoyal), false)
assert.equal(isLoyalCustomer(undefined), false)

console.log('cod-cash-check: ok')
