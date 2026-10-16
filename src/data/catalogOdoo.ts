import type {
  AttributeExclusion,
  CatalogAttribute,
  MenuAttributeLine,
  MenuAttributeValue,
  MenuVariant,
} from '../types'

/**
 * Katalog ala Odoo (§14) — attribute/nilai global milik merchant, lalu nilai itu
 * dipasang ke menu dengan harga tambahan (`price_extra`) dan flag ketersediaan.
 * Tipe modelnya sudah lama ada di `src/types.ts` tapi menganggur; berkas ini
 * menghidupkannya plus fungsi murni yang dipakai kedua sisi (merchant & pelanggan).
 * Aturan murni ditahan `scripts/catalog-check.mjs`.
 */

// ── Seed demo ──

export const mockCatalogAttributes: CatalogAttribute[] = [
  {
    id: 'attr-spice',
    merchantId: 'am-1',
    name: 'Tingkat pedas',
    createVariant: 'no_variant',
    displayType: 'radio',
    values: [
      { id: 'spice-0', name: 'Original', defaultExtraPrice: 0, isCustom: false },
      { id: 'spice-1', name: 'Pedas', defaultExtraPrice: 0.1, isCustom: false },
      { id: 'spice-2', name: 'Extra pedas', defaultExtraPrice: 0.2, isCustom: false },
    ],
  },
  {
    id: 'attr-addon',
    merchantId: 'am-1',
    name: 'Tambahan',
    createVariant: 'no_variant',
    displayType: 'multi',
    values: [
      { id: 'addon-sambal', name: 'Sambal', defaultExtraPrice: 0.15, isCustom: false },
      { id: 'addon-bawang', name: 'Bawang goreng', defaultExtraPrice: 0.1, isCustom: false },
      { id: 'addon-kerupuk', name: 'Kerupuk', defaultExtraPrice: 0.1, isCustom: false },
    ],
  },
  {
    id: 'attr-portion',
    merchantId: 'am-1',
    name: 'Porsi',
    createVariant: 'always',
    displayType: 'pills',
    values: [
      { id: 'portion-reg', name: 'Reguler', defaultExtraPrice: 0, isCustom: false },
      { id: 'portion-jumbo', name: 'Jumbo', defaultExtraPrice: 0.5, isCustom: false },
    ],
  },
]

/** Nilai yang dipasang ke menu: `price_extra` menimpa `defaultExtraPrice`. */
export const mockMenuAttributeValues: MenuAttributeValue[] = [
  { menuId: '1', attributeValueId: 'spice-0', priceExtra: 0, available: true, excludeValueIds: [] },
  { menuId: '1', attributeValueId: 'spice-1', priceExtra: 0.1, available: true, excludeValueIds: [] },
  { menuId: '1', attributeValueId: 'spice-2', priceExtra: 0.2, available: true, excludeValueIds: [] },
  { menuId: '1', attributeValueId: 'addon-sambal', priceExtra: 0.15, available: true, excludeValueIds: [] },
  { menuId: '1', attributeValueId: 'addon-bawang', priceExtra: 0.1, available: true, excludeValueIds: [] },
  { menuId: '1', attributeValueId: 'addon-kerupuk', priceExtra: 0.1, available: true, excludeValueIds: [] },
  { menuId: '4', attributeValueId: 'portion-reg', priceExtra: 0, available: true, excludeValueIds: [] },
  { menuId: '4', attributeValueId: 'portion-jumbo', priceExtra: 0.5, available: true, excludeValueIds: [] },
]

export const mockMenuAttributeLines: MenuAttributeLine[] = [
  { menuId: '1', attributeId: 'attr-spice', valueIds: ['spice-0', 'spice-1', 'spice-2'] },
  { menuId: '1', attributeId: 'attr-addon', valueIds: ['addon-sambal', 'addon-bawang', 'addon-kerupuk'] },
  { menuId: '4', attributeId: 'attr-portion', valueIds: ['portion-reg', 'portion-jumbo'] },
]

export const mockAttributeExclusions: AttributeExclusion[] = []

export const mockMenuVariants: MenuVariant[] = [
  { id: '4:portion-reg', menuId: '4', attributeValueIds: ['portion-reg'], available: true },
  { id: '4:portion-jumbo', menuId: '4', attributeValueIds: ['portion-jumbo'], available: true },
]

// ── Fungsi murni ──

export function attributeById(
  attributes: CatalogAttribute[],
  attributeId: string,
): CatalogAttribute | undefined {
  return attributes.find((a) => a.id === attributeId)
}

/** Baris attribute yang dipasang pada satu menu, urut seperti tersimpan. */
export function linesForMenu(lines: MenuAttributeLine[], menuId: string): MenuAttributeLine[] {
  return lines.filter((line) => line.menuId === menuId)
}

/**
 * Nilai per menu yang boleh dipilih dari sebuah attribute. Ambil dari `valueIds`
 * baris (sumber kebenaran pemasangan), bukan dari tebakan awalan id.
 */
export function menuValuesOf(
  values: MenuAttributeValue[],
  line: MenuAttributeLine,
): MenuAttributeValue[] {
  return line.valueIds
    .map((id) => values.find((v) => v.menuId === line.menuId && v.attributeValueId === id))
    .filter((v): v is MenuAttributeValue => Boolean(v))
}

/**
 * Harga tambahan dari pilihan. `price_extra` per menu; nilai yang tak dipasang
 * ke menu itu dianggap 0 (tidak menambah harga).
 */
export function priceExtraFor(
  values: MenuAttributeValue[],
  menuId: string,
  selectedValueIds: string[],
): number {
  return selectedValueIds.reduce((sum, id) => {
    const match = values.find((v) => v.menuId === menuId && v.attributeValueId === id)
    return sum + (match ? match.priceExtra : 0)
  }, 0)
}

/** Harga satuan = harga dasar + Σ price_extra pilihan (JOD). */
export function unitPriceFor(
  basePrice: number,
  values: MenuAttributeValue[],
  menuId: string,
  selectedValueIds: string[],
): number {
  return basePrice + priceExtraFor(values, menuId, selectedValueIds)
}

/** Kombinasi dilarang: exclusion menang bila SEMUA anggotanya terpilih. */
export function isCombinationExcluded(
  exclusions: AttributeExclusion[],
  menuId: string,
  selectedValueIds: string[],
): boolean {
  return exclusions.some(
    (ex) =>
      ex.menuId === menuId &&
      ex.attributeValueIds.length > 0 &&
      ex.attributeValueIds.every((id) => selectedValueIds.includes(id)),
  )
}

/** Nilai tersedia = flag ketersediaan level nilai belum dimatikan (MER-08). */
export function isValueSelectable(value: MenuAttributeValue): boolean {
  return value.available
}

/** Ketersediaan level variant (MER-08): kombinasi terpilih punya variant mati. */
export function isVariantAvailable(
  variants: MenuVariant[],
  menuId: string,
  selectedValueIds: string[],
): boolean {
  const sorted = [...selectedValueIds].sort().join('|')
  const match = variants.find(
    (v) => v.menuId === menuId && v.attributeValueIds.slice().sort().join('|') === sorted,
  )
  return match ? match.available : true
}

/** Varian yang lahir dari kombinasi nilai baris `create_variant != no_variant`. */
export function variantsForMenu(variants: MenuVariant[], menuId: string): MenuVariant[] {
  return variants.filter((v) => v.menuId === menuId)
}

/**
 * Bangun ulang daftar varian sebuah menu dari baris `always` (kombinasi kartesian).
 * `no_variant` tidak menghasilkan varian (§14). Varian yang sudah ada dipertahankan
 * (termasuk flag ketersediaannya), yang baru dibuat `available: true`.
 */
export function buildVariants(
  lines: MenuAttributeLine[],
  attributes: CatalogAttribute[],
  existing: MenuVariant[],
  menuId: string,
): MenuVariant[] {
  const variantLines = linesForMenu(lines, menuId).filter(
    (line) => attributeById(attributes, line.attributeId)?.createVariant !== 'no_variant',
  )
  if (variantLines.length === 0) return []

  let combos: string[][] = [[]]
  for (const line of variantLines) {
    const next: string[][] = []
    for (const combo of combos) {
      for (const valueId of line.valueIds) next.push([...combo, valueId])
    }
    combos = next
  }

  return combos.map((ids) => {
    const id = `${menuId}:${[...ids].sort().join('+')}`
    const prior = existing.find((v) => v.id === id)
    return prior ?? { id, menuId, attributeValueIds: ids, available: true }
  })
}
