// Self-check `openCart` — tombol Checkout harus membuka keranjang toko yang
// ditekan, bukan isi keranjang yang kebetulan sedang aktif.
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/cart-open-check.mjs
import assert from 'node:assert/strict'

import { cartGroups } from '../src/data/cartGroups.ts'
import cartReducer, { openCart } from '../src/store/slices/cartSlice.ts'

const item = (id, name, merchantId, quantity = 1, price = 1000, merchantName) => ({
  id,
  name,
  price,
  quantity,
  image: '/x.webp',
  merchantId,
  merchantName,
})

const state = (patch = {}) => ({ ...cartReducer(undefined, { type: '@@init' }), ...patch })

// Keranjang lama: `items` memuat dua toko, `activeMerchantId` menunjuk toko
// kedua. Menekan Checkout toko pertama dulu membuka isi toko kedua karena
// `switchCart` melihat penandanya sudah "benar".
{
  const s = state({
    items: [item('1', 'Sate Ayam', '1', 2), item('99', 'Ayam Gongso', '10', 1)],
    carts: {},
    activeMerchantId: '10',
  })
  const groups = cartGroups(s.items, s.activeMerchantId, s.carts)
  const next = cartReducer(s, openCart({ merchantId: '1', groups }))
  assert.deepEqual(
    next.items.map((line) => line.name),
    ['Sate Ayam'],
  )
  assert.deepEqual(
    next.carts['10'].map((line) => line.name),
    ['Ayam Gongso'],
  )
  assert.equal(next.activeMerchantId, '1')
}

// Setelah itu, baris toko lain tetap bisa dibuka dengan cara yang sama.
{
  const s = state({
    items: [item('1', 'Sate Ayam', '1', 2)],
    carts: { '10': [item('99', 'Ayam Gongso', '10', 1)] },
    activeMerchantId: '1',
  })
  const groups = cartGroups(s.items, s.activeMerchantId, s.carts)
  const next = cartReducer(s, openCart({ merchantId: '10', groups }))
  assert.deepEqual(
    next.items.map((line) => line.name),
    ['Ayam Gongso'],
  )
  assert.deepEqual(
    next.carts['1'].map((line) => line.name),
    ['Sate Ayam'],
  )
  assert.equal(next.activeMerchantId, '10')
}

// Baris lama tanpa `merchantId` yang tokonya terbaca dari katalog ikut
// ditulisi, jadi pengelompokan berikutnya tidak menebak lagi.
{
  const s = state({
    items: [item('76', 'Nasi Goreng Spesial', undefined, 1)],
    carts: { '10': [item('35', 'Ayam Bakar', '10', 1)] },
    activeMerchantId: '10',
  })
  const groups = cartGroups(s.items, s.activeMerchantId, s.carts, [
    { id: '76', merchantId: '1' },
  ])
  const next = cartReducer(s, openCart({ merchantId: '1', groups }))
  assert.equal(next.items.length, 1)
  assert.equal(next.items[0].merchantId, '1')
  assert.equal(next.activeMerchantId, '1')
}

// Tombol basi (toko sudah tak ada di daftar) tidak boleh mengosongkan keranjang.
{
  const s = state({
    items: [item('1', 'Sate Ayam', '1', 1)],
    carts: {},
    activeMerchantId: '1',
  })
  const groups = cartGroups(s.items, s.activeMerchantId, s.carts)
  const next = cartReducer(s, openCart({ merchantId: '404', groups }))
  assert.deepEqual(next.items, s.items)
  assert.equal(next.activeMerchantId, '1')
}

// `addItem` tidak boleh mencampur menu toko baru ke `items` yang masih berisi
// baris lama tanpa toko.
{
  const s = state({
    items: [item('1', 'Sate Ayam', undefined, 1)],
    carts: {},
    activeMerchantId: null,
  })
  const next = cartReducer(
    s,
    {
      type: 'cart/addItem',
      payload: { food: { id: '99', name: 'Ayam Gongso', price: 2000, image: '/x.webp', merchantId: '10' }, quantity: 1, merchantId: '10' },
    },
  )
  assert.deepEqual(
    next.items.map((line) => line.name),
    ['Sate Ayam'],
  )
  assert.deepEqual(
    next.carts['10'].map((line) => line.name),
    ['Ayam Gongso'],
  )
}

console.log('cart-open-check: OK')
