// Self-check keranjang ganda per toko + catatan pesanan (PRD §6/§11).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/cart-multicart-check.mjs
import assert from 'node:assert/strict'

import cartReducer, {
  addItem,
  clearCart,
  removeCart,
  setOrderNote,
  switchCart,
} from '../src/store/slices/cartSlice.ts'

const food = (id, merchantId, price = 10000) => ({
  id,
  name: `F${id}`,
  price,
  rating: 0,
  reviewCount: 0,
  deliveryTime: '',
  distance: '',
  category: 'c',
  image: 'x',
  description: '',
  merchantId,
})

let s = cartReducer(undefined, { type: '@@init' })
s = cartReducer(s, clearCart())

s = cartReducer(s, addItem({ food: food('m1', 'A'), merchantId: 'A' }))
assert.equal(s.activeMerchantId, 'A')
assert.equal(s.items.length, 1)
assert.equal(s.items[0].merchantId, 'A')

// Toko lain TIDAK menimpa keranjang aktif; masuk `carts`.
s = cartReducer(s, addItem({ food: food('m2', 'B'), merchantId: 'B' }))
assert.equal(s.items.length, 1)
assert.equal(s.carts.B.length, 1)

// Baris identik di toko lain digabung (kuantitas), bukan diduplikasi.
s = cartReducer(s, addItem({ food: food('m2', 'B'), merchantId: 'B' }))
assert.equal(s.carts.B[0].quantity, 2)

// Pindah keranjang: aktif jadi B, keranjang A tersimpan.
s = cartReducer(s, switchCart('B'))
assert.equal(s.activeMerchantId, 'B')
assert.equal(s.items[0].id, 'm2')
assert.equal(s.carts.A.length, 1)

s = cartReducer(s, removeCart('A'))
assert.equal(s.carts.A, undefined)

// Keranjang aktif tanpa `activeMerchantId` (state persist lama) tetap disimpan
// saat pindah — dulu item itu ikut terbuang.
let legacy = cartReducer(undefined, { type: '@@init' })
legacy = cartReducer(legacy, clearCart())
legacy = cartReducer(legacy, addItem({ food: food('m1', 'A'), merchantId: 'A' }))
legacy = { ...legacy, activeMerchantId: null }
legacy = cartReducer(legacy, switchCart('B'))
assert.equal(legacy.activeMerchantId, 'B')
assert.equal(legacy.carts.default.length, 1, 'keranjang lama tidak boleh hilang')

s = cartReducer(s, setOrderNote('tanpa bawang'))
assert.equal(s.orderNote, 'tanpa bawang')

console.log('cart-multicart-check OK')
