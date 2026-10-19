// Self-check mapper baris D1 → tipe domain (data/beMapping.ts).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/be-mappers-check.mjs
//
// Baris contoh di bawah disalin apa adanya dari D1 (bentuk kolom nyata), supaya
// perubahan bentuk BE terdeteksi di sini, bukan di layar.
import assert from 'node:assert/strict'

import {
  parsePunishment,
  penaltyKind,
  penaltyLevel,
  toDisputeCatalog,
  toLedgerEntry,
  toRebateTiers,
} from '../src/data/beMapping.ts'

// Tier: nilai asing dilewati (tipe FE tertutup), urutan kolom dipertahankan.
assert.deepEqual(toRebateTiers([
  { tier: 'tier_1', threshold_orders: 500, amount_jod: 15 },
  { tier: 'tier_9', threshold_orders: 999, amount_jod: 99 },
]), [{ id: 'tier_1', threshold: 500, amountJod: 15 }])

// Punishment JSON: valid → objek; rusak/null → undefined (bukan throw).
assert.deepEqual(parsePunishment('{"kind":"sp","level":1}'), { kind: 'sp', level: 1 })
assert.deepEqual(parsePunishment('{"kind":"fine"}'), { kind: 'fine', level: undefined })
assert.equal(parsePunishment(null), undefined)
assert.equal(parsePunishment('{bukan json'), undefined)

// Katalog rule: id dari code, tanpa punishment → tidak ada entri punishment.
const catalog = toDisputeCatalog([
  {
    code: 'DR-LATE',
    name: 'Kurir terlambat',
    category: 'delivery',
    trigger_condition: 'delivery melewati SLA',
    responsible_party: 'courier',
    mitigation: 'notifikasi + kompensasi customer',
    punishment: '{"kind":"sp","level":1}',
    version: 1,
    active: 1,
  },
  {
    code: 'DR-CANCEL',
    name: 'Batal setelah accept',
    category: 'order',
    trigger_condition: 'order dibatalkan setelah accept',
    responsible_party: 'customer',
    mitigation: 'catat alasan + mitigasi',
    punishment: null,
    version: 1,
    active: 1,
  },
])
assert.deepEqual(catalog.rules.map((r) => r.id), ['rule-dr-late', 'rule-dr-cancel'])
assert.equal(catalog.rules[0].trigger, 'delivery melewati SLA')
assert.equal(catalog.rules[0].active, true)
assert.equal(catalog.punishments.length, 1)
assert.deepEqual(catalog.punishments[0], {
  id: 'pun-dr-late',
  ruleId: 'rule-dr-late',
  subject: 'courier',
  form: 'Surat peringatan (SP)',
  level: 'tingkat 1',
})
// Nilai `responsible_party` asing jatuh ke customer, tidak lolos mentah.
assert.equal(catalog.rules[1].responsibleParty, 'customer')

// Ledger: fee negatif → debit + nominal absolut; party asing → platform.
const fee = toLedgerEntry({
  id: 3,
  order_id: 838,
  entry_type: 'fee',
  party: 'applicator',
  amount_jod: -0.1,
  idempotency_key: 'settle:838:applicator',
  note: null,
  created_at: '2026-10-16T13:17:31.17529+00:00',
})
assert.equal(fee.direction, 'debit')
assert.equal(fee.amount, 0.1)
assert.equal(fee.type, 'fee')
assert.deepEqual(fee.party, { kind: 'platform', id: null, name: 'Platform' })
assert.equal(fee.ref, 'settle:838:applicator')
const payout = toLedgerEntry({
  id: 1,
  order_id: 838,
  entry_type: 'payout',
  party: 'merchant',
  amount_jod: 6.5,
  idempotency_key: null,
  note: 'settle',
  created_at: '2026-10-16T13:17:31.17529+00:00',
})
assert.equal(payout.direction, 'credit')
assert.equal(payout.type, 'settlement')
assert.equal(payout.ref, 'order-838')
assert.equal(payout.memo, 'settle')

// Form bebas ketik → kind BE; level apa pun → angka atau null.
assert.equal(penaltyKind('Surat peringatan (SP)'), 'sp')
assert.equal(penaltyKind('Denda'), 'fine')
assert.equal(penaltyKind('Suspend sementara bila berulang'), 'suspend')
assert.equal(penaltyKind('apa saja'), 'sp')
assert.equal(penaltyLevel('SP-2'), 2)
assert.equal(penaltyLevel('tingkat 3'), 3)
assert.equal(penaltyLevel('ringan'), null)

console.log('be-mappers: ok')
