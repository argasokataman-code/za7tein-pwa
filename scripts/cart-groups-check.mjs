// Self-check pengelompokan keranjang per toko (Pesanan Saya).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/cart-groups-check.mjs
import assert from 'node:assert/strict'

import { cartGroups } from '../src/data/cartGroups.ts'

const item = (id, name, merchantId, quantity = 1, price = 1000, merchantName) => ({
  id,
  name,
  price,
  quantity,
  image: '/x.webp',
  merchantId,
  merchantName,
})

// Dua toko di keranjang aktif (state lama) tidak boleh tergabung dalam satu blok.
// Keduanya ikut keranjang checkout karena item-nya memang tersimpan di `items`.
{
  const groups = cartGroups(
    [item('a', 'Sate Ayam', '1', 2), item('b', 'Sate Ayam', '10', 1)],
    '1',
    {},
  )
  assert.equal(groups.length, 2)
  assert.deepEqual(
    groups.map((g) => [g.merchantId, g.count, g.active]),
    [
      ['1', 2, true],
      ['10', 1, true],
    ],
  )
}

// Keranjang toko lain ikut tampil sebagai blok sendiri, bukan cuma catatan.
{
  const groups = cartGroups([item('a', 'Nasi Goreng', '1', 1)], '1', {
    '10': [item('b', 'Ayam Bakar', '10', 2)],
    '11': [],
  })
  assert.equal(groups.length, 2)
  assert.equal(groups[0].merchantId, '1')
  assert.equal(groups[0].active, true)
  assert.equal(groups[1].merchantId, '10')
  assert.equal(groups[1].active, false)
  assert.equal(groups[1].subtotal, 2000)
}

// Keranjang di toko lain tetap bisa dibuka walau keranjang aktif kosong.
{
  const groups = cartGroups([], null, { '10': [item('b', 'Ayam Bakar', '10')] })
  assert.equal(groups.length, 1)
  assert.equal(groups[0].active, false)
}

// State demo lama tanpa id toko tetap tampil sebagai satu blok netral.
{
  const groups = cartGroups([item('a', 'Menu Demo', undefined)], null, {})
  assert.equal(groups.length, 1)
  assert.equal(groups[0].merchantId, null)
  assert.equal(groups[0].active, true)
}

// Item lama tanpa `merchantId` dicocokkan ke katalog live, bukan dibiarkan
// menumpuk di blok "Keranjang" tanpa nama toko.
{
  const groups = cartGroups(
    [item('76', 'Nasi Goreng Spesial', undefined), item('77', 'Sate Kambing', undefined)],
    null,
    {},
    [
      { id: '76', merchantId: '1' },
      { id: '77', merchantId: '1' },
    ],
  )
  assert.equal(groups.length, 1)
  assert.equal(groups[0].merchantId, '1')
}

// Dua menu dari dua toko tetap terpisah walau keranjang aktif tak menyebut toko.
{
  const groups = cartGroups(
    [item('76', 'Nasi Goreng Spesial', undefined), item('35', 'Ayam Bakar', undefined)],
    null,
    {},
    [
      { id: '76', merchantId: '1' },
      { id: '35', merchantId: '10' },
    ],
  )
  assert.deepEqual(
    groups.map((group) => group.merchantId),
    ['1', '10'],
  )
}

// Nama toko yang disimpan di item dipakai kalau daftar toko belum termuat.
{
  const groups = cartGroups([item('a', 'Sate', '1', 1, 1000, 'Warung Sate Pak Ali')], '1', {})
  assert.equal(groups[0].items[0].merchantName, 'Warung Sate Pak Ali')
}

console.log('cart-groups-check: OK')
