// Self-check nama toko di baris keranjang (sheet dok + checkout).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/store-name-check.mjs
import assert from 'node:assert/strict'

import { storeNameFor } from '../src/data/storefronts.ts'

const live = [
  { id: '1', name: 'Warung Sate Pak Ali' },
  { id: '10', name: 'Waroeng Nusantara' },
]

// Id toko live (numerik dari BE) dipetakan lewat daftar yang sedang dimuat.
assert.equal(storeNameFor('1', live), 'Warung Sate Pak Ali')
assert.equal(storeNameFor('10', live), 'Waroeng Nusantara')

// Daftar live belum termuat: nama yang disimpan saat item masuk keranjang dipakai.
assert.equal(storeNameFor('10', [], 'Waroeng Nusantara'), 'Waroeng Nusantara')

// Id mock tetap dikenali tanpa daftar live.
assert.equal(storeNameFor('am-1', []), 'Warung Sate Pak Ali')

// Keranjang demo lama tanpa id toko tidak diberi nama toko sungguhan.
assert.equal(storeNameFor(null), 'Keranjang')
assert.equal(storeNameFor('default'), 'Toko')

// Id yang tidak dikenal dan tanpa nama simpanan tidak boleh menipu dengan
// nama toko lain yang kebetulan ada.
assert.equal(storeNameFor('999', live), 'Toko')

// Nama simpanan kosong/spasi tidak menimpa hasil daftar toko.
assert.equal(storeNameFor('1', live, '   '), 'Warung Sate Pak Ali')
assert.equal(storeNameFor('999', live, '   '), 'Toko')

console.log('store-name-check: OK')
