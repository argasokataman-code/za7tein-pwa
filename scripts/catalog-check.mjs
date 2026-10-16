// Self-check aturan katalog Odoo (§14, MER-07/MER-08).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/catalog-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import {
  attributeById,
  buildVariants,
  isCombinationExcluded,
  isVariantAvailable,
  linesForMenu,
  menuValuesOf,
  mockCatalogAttributes,
  mockMenuAttributeLines,
  mockMenuAttributeValues,
  mockMenuVariants,
  priceExtraFor,
  unitPriceFor,
  variantsForMenu,
} from '../src/data/catalogOdoo.ts'

// Baris ditemukan per menu; menu lain tidak ikut.
assert.equal(linesForMenu(mockMenuAttributeLines, '1').length, 2)
assert.equal(linesForMenu(mockMenuAttributeLines, '4').length, 1)
assert.equal(linesForMenu(mockMenuAttributeLines, 'tidak-ada').length, 0)

// Nilai per baris mengikuti `valueIds` baris (sumber kebenaran pemasangan).
const spiceLine = linesForMenu(mockMenuAttributeLines, '1').find((l) => l.attributeId === 'attr-spice')
assert.ok(spiceLine)
assert.deepEqual(
  menuValuesOf(mockMenuAttributeValues, spiceLine).map((v) => v.attributeValueId),
  ['spice-0', 'spice-1', 'spice-2'],
)

// Tambahan harga = Σ price_extra per menu.
assert.equal(priceExtraFor(mockMenuAttributeValues, '1', ['spice-1', 'addon-sambal']), 0.25)
assert.equal(priceExtraFor(mockMenuAttributeValues, '1', []), 0)
// Nilai yang tak dipasang ke menu itu tidak menambah harga.
assert.equal(priceExtraFor(mockMenuAttributeValues, '4', ['spice-1']), 0)

// Harga satuan = dasar + tambahan.
assert.equal(unitPriceFor(1.1, mockMenuAttributeValues, '1', ['spice-2']), 1.3)

// Attribute global diambil per id.
assert.equal(attributeById(mockCatalogAttributes, 'attr-portion')?.createVariant, 'always')
assert.equal(attributeById(mockCatalogAttributes, 'nope'), undefined)

// Varian menu difilter per menu.
assert.equal(variantsForMenu(mockMenuVariants, '4').length, 2)
assert.equal(variantsForMenu(mockMenuVariants, '1').length, 0)

// Exclusion: menang bila SEMUA anggotanya terpilih.
const exclusions = [{ menuId: '1', attributeValueIds: ['spice-2', 'addon-kerupuk'] }]
assert.equal(isCombinationExcluded(exclusions, '1', ['spice-2', 'addon-kerupuk']), true)
assert.equal(isCombinationExcluded(exclusions, '1', ['spice-2']), false)
assert.equal(isCombinationExcluded(exclusions, '4', ['spice-2', 'addon-kerupuk']), false)

// Ketersediaan level variant: kombinasi mati → tak tersedia.
assert.equal(isVariantAvailable(mockMenuVariants, '4', ['portion-jumbo']), true)
const off = mockMenuVariants.map((v) =>
  v.id === '4:portion-jumbo' ? { ...v, available: false } : v,
)
assert.equal(isVariantAvailable(off, '4', ['portion-jumbo']), false)
// Tanpa varian tercatat: dianggap tersedia.
assert.equal(isVariantAvailable(mockMenuVariants, '1', ['spice-1']), true)

// buildVariants: `no_variant` tak menghasilkan varian, `always` kartesian.
const none = buildVariants(
  [{ menuId: 'm', attributeId: 'attr-spice', valueIds: ['spice-0', 'spice-1'] }],
  mockCatalogAttributes,
  [],
  'm',
)
assert.equal(none.length, 0)

const combos = buildVariants(
  [{ menuId: 'm', attributeId: 'attr-portion', valueIds: ['portion-reg', 'portion-jumbo'] }],
  mockCatalogAttributes,
  [],
  'm',
)
assert.equal(combos.length, 2)
assert.deepEqual(
  combos.map((v) => v.attributeValueIds[0]).sort(),
  ['portion-jumbo', 'portion-reg'],
)

// Varian lama dipertahankan (flag ketersediaan tidak hilang saat build ulang).
const existing = [{ id: 'm:portion-jumbo', menuId: 'm', attributeValueIds: ['portion-jumbo'], available: false }]
const rebuilt = buildVariants(
  [{ menuId: 'm', attributeId: 'attr-portion', valueIds: ['portion-reg', 'portion-jumbo'] }],
  mockCatalogAttributes,
  existing,
  'm',
)
const jumbo = rebuilt.find((v) => v.attributeValueIds.includes('portion-jumbo'))
assert.equal(jumbo?.available, false, 'varian lama harus mempertahankan flag ketersediaan')
const reg = rebuilt.find((v) => v.attributeValueIds.includes('portion-reg'))
assert.equal(reg?.available, true, 'varian baru default tersedia')

console.log('catalog-check: OK')
