// Self-check katalog rule dispute (§18) — M9, R-DISPUTE-RULE.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/rule-check.mjs
import assert from 'node:assert/strict'

import {
  DEMO_MERCHANT_RULE_SELECTION,
  DISPUTE_RULES,
  INCIDENT_CATEGORIES,
  MOCK_INCIDENTS,
  RULE_COMPENSATIONS,
  RULE_PUNISHMENTS,
  compensationForRule,
  punishmentForRule,
  ruleById,
  ruleForOrder,
  rulesForCategory,
  rulesForMerchant,
  snapshotRule,
  unknownRuleIds,
} from '../src/data/rules.ts'

// Katalog utuh: setiap rule menunjuk kategori yang ada, dan setiap bagian
// kompensasi/punishment menunjuk rule yang ada. Id menggantung pernah terjadi
// (`rule-late-1`, `cat-late`) dan itu yang membuat katalog tak bisa dipakai.
const categoryIds = new Set(INCIDENT_CATEGORIES.map((category) => category.id))
for (const rule of DISPUTE_RULES) {
  assert.ok(categoryIds.has(rule.categoryId), `rule ${rule.id} menunjuk kategori tak dikenal`)
  assert.ok(rule.mitigation.length > 0, `rule ${rule.id} tanpa mitigasi`)
  assert.ok(Number.isInteger(rule.version) && rule.version >= 1, `rule ${rule.id} tanpa versi`)
}
for (const part of [...RULE_COMPENSATIONS, ...RULE_PUNISHMENTS]) {
  assert.ok(ruleById(part.ruleId), `bagian ${part.id} menunjuk rule tak dikenal`)
}

// Tidak ada id menggantung di pilihan merchant demo maupun di insiden demo.
assert.deepEqual(unknownRuleIds(DEMO_MERCHANT_RULE_SELECTION), [])
for (const incident of MOCK_INCIDENTS) {
  assert.ok(ruleById(incident.ruleId ?? ''), `insiden ${incident.id} menunjuk rule tak dikenal`)
  assert.ok(categoryIds.has(incident.categoryId), `insiden ${incident.id} kategori tak dikenal`)
}

// Katalog per kategori: aktif saja.
assert.ok(rulesForCategory('cat-late').length >= 2, 'kategori lambat punya beberapa rule')
assert.ok(rulesForCategory('tidak-ada').length === 0)

// Rule yang diikuti toko: hanya yang dipilih DAN aktif.
const followed = rulesForMerchant(DEMO_MERCHANT_RULE_SELECTION)
assert.deepEqual(
  followed.map((rule) => rule.id),
  ['rule-late-courier', 'rule-missing-item', 'rule-noshow'],
)
assert.deepEqual(
  rulesForMerchant({ merchantId: 'm', ruleIds: ['tidak-ada', 'rule-noshow'], effectiveFrom: '2026-10-01' }).map(
    (rule) => rule.id,
  ),
  ['rule-noshow'],
  'id tak dikenal dibuang, bukan ditampilkan',
)

// Rule siapa yang berlaku pada satu order: pilihan merchant menang.
const resolved = ruleForOrder(DEMO_MERCHANT_RULE_SELECTION, 'cat-late')
assert.equal(resolved.source, 'merchant')
assert.equal(resolved.rule.id, 'rule-late-courier')

// Kategori yang tidak dipilih merchant → belum ada rule, dan OPEN-18 tidak
// dijawab dengan mengarang rule dasar.
const unresolved = ruleForOrder(DEMO_MERCHANT_RULE_SELECTION, 'cat-damaged')
assert.equal(unresolved.source, 'unresolved')
assert.equal(unresolved.rule, null)
assert.equal(unresolved.open, 'OPEN-18')

// Order yang dibuat sebelum pilihan berlaku memakai pilihan sebelumnya — belum
// ada riwayat pilihan, jadi jangan mengarang.
const before = ruleForOrder(DEMO_MERCHANT_RULE_SELECTION, 'cat-late', { effectiveAt: '2026-09-01' })
assert.equal(before.source, 'unresolved')

// Konsekuensi: kompensasi & punishment resolvable, dan SP kurir memang ada
// sebagai salah satu bentuk punishment (§18).
assert.equal(compensationForRule('rule-late-courier').recipient, 'customer')
assert.equal(punishmentForRule('rule-late-courier').subject, 'courier')
const noShowPunishment = punishmentForRule('rule-noshow')
assert.equal(noShowPunishment.subject, 'courier')
assert.match(noShowPunishment.form, /SP/, 'SP = bentuk punishment salah satunya (§18)')

// Snapshot (bagian "usulan" §18): versi rule dibekukan ke order, dan ditandai
// masih usulan sampai BE menyimpannya.
const snapshot = snapshotRule(ruleById('rule-late-courier'))
assert.equal(snapshot.ruleId, 'rule-late-courier')
assert.equal(snapshot.code, 'LATE-COU-01')
assert.equal(snapshot.version, 2)
assert.equal(snapshot.usulan, true)

console.log('rule-check: OK')
