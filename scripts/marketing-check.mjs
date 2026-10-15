// Self-check program marketing (§15): jendela tanggal, kepemilikan program,
// syarat rule, hitung diskon (persen + nilai tetap + batas maks + poin loyalty),
// hadiah yang belum didukung, dan aturan stacking (§15.3, OPEN-23).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/marketing-check.mjs
import assert from 'node:assert/strict'

import {
  bestProgramCombination,
  listedPrograms,
  programInWindow,
  programMatches,
  rewardDiscountJod,
  ruleSummary,
} from '../src/data/marketing.ts'
import {
  mockLoyaltyCards,
  mockMarketingPrograms,
  mockProgramRewards,
  mockProgramRules,
} from '../src/data/marketing.ts'

const program = (over = {}) => ({
  id: 'p',
  name: 'P',
  owner: 'merchant',
  merchantId: '1',
  type: 'promotion',
  trigger: 'auto',
  appliesOn: 'current',
  dateFrom: '2026-01-01',
  dateTo: null,
  limitUsage: null,
  maxUsage: null,
  isStackable: true,
  ...over,
})

const rule = (over = {}) => ({
  id: 'r',
  programId: 'p',
  minimumQty: 0,
  minimumAmountJod: 0,
  menuIds: [],
  categoryIds: [],
  tagIds: [],
  rewardPointMode: 'per_order',
  rewardPointAmount: 1,
  ...over,
})

const reward = (over = {}) => ({
  id: 'w',
  programId: 'p',
  rewardType: 'discount',
  discountMode: 'percent',
  discountPercent: 10,
  discountApplicability: 'order',
  ...over,
})

const ctx = (over = {}) => ({ merchantId: '1', subtotalJod: 10, qty: 1, ...over })

// Jendela tanggal.
assert.equal(programInWindow(program(), '2026-06-01'), true)
assert.equal(programInWindow(program({ dateFrom: '2026-07-01' }), '2026-06-01'), false)
assert.equal(programInWindow(program({ dateTo: '2026-05-01' }), '2026-06-01'), false)

// Diskon: persen, batas maks, nilai tetap.
assert.equal(rewardDiscountJod(reward(), 10).discountJod, 1)
assert.equal(rewardDiscountJod(reward({ discountMaxAmountJod: 0.4 }), 10).discountJod, 0.4)
assert.equal(
  rewardDiscountJod(reward({ discountMode: 'per_order', discountPercent: 0.75 }), 10).discountJod,
  0.75,
)
// Diskon tak pernah melebihi subtotal.
assert.equal(rewardDiscountJod(reward({ discountPercent: 500 }), 10).discountJod, 10)

// Hadiah yang belum didukung ditandai, bukan dihitung diam-diam.
assert.equal(rewardDiscountJod(reward({ rewardType: 'product' }), 10).discountJod, 0)
assert.match(rewardDiscountJod(reward({ rewardType: 'shipping' }), 10).unsupported, /ongkir/)
assert.match(
  rewardDiscountJod(reward({ discountApplicability: 'cheapest' }), 10).unsupported,
  /termurah/,
)
assert.match(rewardDiscountJod(reward({ discountMode: 'per_point' }), 10).unsupported, /poin/)
// Loyalty: poin kurang → tak berlaku, poin cukup → berlaku.
const loyalty = reward({ requiredPoints: 10 })
assert.match(rewardDiscountJod(loyalty, 10, 4).unsupported, /Butuh 10 poin/)
assert.equal(rewardDiscountJod(loyalty, 10, 12).discountJod, 1)

// Kepemilikan: program merchant hanya di tokonya; program aplikator di mana pun.
const merchant = program({ id: 'm', merchantId: '1' })
const platform = program({ id: 'x', owner: 'platform', merchantId: null })
assert.equal(programMatches([merchant], [], [], ctx({ merchantId: '2' })).length, 0)
assert.equal(programMatches([platform], [], [], ctx({ merchantId: '2' })).length, 1)

// `appliesOn: 'future'` tidak boleh muncul di keranjang sekarang.
assert.equal(programMatches([program({ appliesOn: 'future' })], [], [], ctx()).length, 0)
// `with_code` tetap terdaftar tapi diskonnya 0 (kode = jalur promo BE).
const coded = programMatches([program({ trigger: 'with_code' })], [], [reward()], ctx())
assert.equal(coded.length, 1)
assert.equal(coded[0].requiresCode, true)
assert.equal(coded[0].discountJod, 0)
// Syarat rule menyaring.
assert.equal(
  programMatches([program()], [rule({ minimumAmountJod: 20 })], [reward()], ctx()).length,
  0,
)
assert.equal(programMatches([program()], [rule({ minimumQty: 3 })], [reward()], ctx()).length, 0)
assert.equal(
  programMatches([program()], [rule({ menuIds: ['lain'] })], [reward()], ctx({ menuIds: ['ini'] }))
    .length,
  0,
)
assert.equal(
  programMatches([program()], [rule({ menuIds: ['ini'] })], [reward()], ctx({ menuIds: ['ini'] }))
    .length,
  1,
)

// Stacking: dua stackable digabung.
const s1 = program({ id: 's1', isStackable: true })
const s2 = program({ id: 's2', isStackable: true })
const w1 = reward({ id: 'w1', programId: 's1' })
const w2 = reward({ id: 'w2', programId: 's2', discountPercent: 5 })
const stacked = bestProgramCombination([s1, s2], [], [w1, w2], ctx({ subtotalJod: 10 }))
assert.equal(stacked.discountJod, 1.5)
assert.equal(stacked.chosen.length, 2)

// Non-stackable lebih besar → menang sendirian, yang lain masuk `rejected`.
const s3 = program({ id: 's3', isStackable: false })
const w3 = reward({ id: 'w3', programId: 's3', discountPercent: 40 })
const alone = bestProgramCombination([s1, s3], [], [w1, w3], ctx({ subtotalJod: 10 }))
assert.equal(alone.discountJod, 4)
assert.deepEqual(alone.chosen.map((m) => m.program.id), ['s3'])
assert.deepEqual(alone.rejected.map((m) => m.program.id), ['s1'])

// Pembagian beban diskon mengikuti pemilik program.
const mixed = bestProgramCombination(
  [program({ id: 'p1', isStackable: true }), program({ id: 'p2', owner: 'platform', merchantId: null, isStackable: true })],
  [],
  [reward({ id: 'wa', programId: 'p1' }), reward({ id: 'wb', programId: 'p2', discountPercent: 20 })],
  ctx({ subtotalJod: 10 }),
)
assert.equal(mixed.merchantJod, 1)
assert.equal(mixed.platformJod, 2)

// Seed repo: dua program tampil di toko demo id '1' (promotion + loyalty + bxgy),
// kupon order berikutnya tidak, dan loyalty benar-benar berpoin.
const listed = listedPrograms(
  mockMarketingPrograms,
  mockProgramRules,
  mockProgramRewards,
  '1',
  '2026-10-15',
)
assert.deepEqual(listed.map((e) => e.program.id).sort(), ['prog-1', 'prog-2', 'prog-3', 'prog-4'])
assert.equal(listedPrograms(mockMarketingPrograms, mockProgramRules, mockProgramRewards, '9', '2026-10-15').length, 1)
assert.ok(mockLoyaltyCards.some((c) => c.points > 0))
assert.match(ruleSummary(mockProgramRules[0]), /min\. belanja 5 JOD/)

console.log('marketing-check OK')
