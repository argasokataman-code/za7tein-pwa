// Self-check deteksi alamat tersimpan terdekat (flow f20).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/address-location-check.mjs
import assert from 'node:assert/strict'

import {
  NEAREST_ADDRESS_METERS,
  nearestSavedAddress,
} from '../src/data/addressLocation.ts'

/** Titik acuan; jarak diukur geodesik, bukan selisih derajat mentah. */
const here = { lat: -6.2575, lng: 106.7812 }

const home = { id: 'addr-1', name: 'Rumah', lat: -6.258, lng: 106.7812 }
const office = { id: 'addr-2', name: 'Kantor', lat: -6.265, lng: 106.79 }

// Daftar kosong tidak memaksa memilih alamat.
assert.equal(nearestSavedAddress(here, []), null)

// Titik yang sama persis = jarak nol.
const same = nearestSavedAddress(here, [{ ...home, lat: here.lat }])
assert.equal(same?.address.id, 'addr-1')
assert.equal(Math.round(same?.meters ?? -1), 0)

// Dua alamat: yang lebih dekat menang, bukan yang pertama di daftar.
const nearest = nearestSavedAddress(here, [office, home])
assert.equal(nearest?.address.id, 'addr-1')
assert.ok((nearest?.meters ?? Infinity) < NEAREST_ADDRESS_METERS)

// Alamat jauh tetap dikembalikan sebagai kandidat; ambang diputuskan pemanggil.
const far = nearestSavedAddress(here, [office])
assert.equal(far?.address.id, 'addr-2')
assert.ok((far?.meters ?? 0) > NEAREST_ADDRESS_METERS)

// 0,001 derajat lintang ≈ 111 m, masih di dalam ambang 200 m.
const oneStep = nearestSavedAddress(here, [home])
assert.ok((oneStep?.meters ?? 0) > 40 && (oneStep?.meters ?? 0) < 80)

console.log('address-location-check: OK')
