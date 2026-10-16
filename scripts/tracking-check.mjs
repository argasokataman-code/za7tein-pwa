// Self-check aturan pelacakan kurir (M7, PRD §9.7, COU-06, L1).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/tracking-check.mjs
import assert from 'node:assert/strict'

import {
  ALMOST_ARRIVED_CONFIGURABLE,
  ALMOST_ARRIVED_MINUTES,
  almostArrived,
  etaMinutesRemaining,
  positionAlong,
  tracksLocation,
  travelProgress,
  walkMinutes,
} from '../src/data/tracking.ts'

// Lokasi hanya disiarkan selama pengantaran aktif (§9.7).
assert.equal(tracksLocation('diantar'), true)
assert.equal(tracksLocation('tiba'), true)
assert.equal(tracksLocation('disiapkan'), false)
assert.equal(tracksLocation('selesai'), false)
assert.equal(tracksLocation('dibatalkan'), false)

// Ambang berbasis waktu, bukan jarak: tepat di ambang sudah "hampir sampai".
assert.equal(almostArrived(ALMOST_ARRIVED_MINUTES), true)
assert.equal(almostArrived(ALMOST_ARRIVED_MINUTES + 1), false)
assert.equal(almostArrived(0), true)
assert.equal(almostArrived(null), false, 'ETA belum diketahui bukan berarti hampir sampai')
// Ambang belum bisa diubah dari UI: panel ops (M10) belum ada.
assert.equal(ALMOST_ARRIVED_CONFIGURABLE, false)

// Kemajuan terkurung 0..1 walau waktunya lewat.
assert.equal(travelProgress(0, 10), 0)
assert.equal(travelProgress(5, 10), 0.5)
assert.equal(travelProgress(30, 10), 1)
assert.equal(travelProgress(-3, 10), 0)
assert.equal(travelProgress(5, 0), 1, 'waktu tempuh 0 = sudah sampai, bukan NaN')

// Sisa menit dibulatkan ke atas dan tidak pernah negatif.
assert.equal(etaMinutesRemaining(10, 0), 10)
assert.equal(etaMinutesRemaining(10, 0.5), 5)
assert.equal(etaMinutesRemaining(10, 1), 0)
assert.equal(etaMinutesRemaining(10, 1.4), 0)

// Posisi kurir menyusuri rute dan berhenti di ujung-ujungnya.
const path = [
  [0, 0],
  [10, 0],
  [10, 10],
]
assert.deepEqual(positionAlong(path, 0), [0, 0])
assert.deepEqual(positionAlong(path, 1), [10, 10])
assert.deepEqual(positionAlong(path, 0.5), [10, 0])
assert.deepEqual(positionAlong(path, 0.25), [5, 0])
assert.deepEqual(positionAlong(path, 2), [10, 10], 'kemajuan lewat 1 tetap di tujuan')
assert.equal(positionAlong([], 0.5), null)
assert.deepEqual(positionAlong([[3, 4]], 0.5), [3, 4])

// Menit jalan kaki: minimal 1 menit untuk jarak > 0, dan jarak 0 = 0 menit.
assert.equal(walkMinutes(0), 0)
assert.equal(walkMinutes(10), 1)
assert.equal(walkMinutes(1.4 * 60 * 10), 10)
assert.equal(walkMinutes(1.4 * 60 * 10, 2.8), 5)

console.log('tracking-check: OK')
