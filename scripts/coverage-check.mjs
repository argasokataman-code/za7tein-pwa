// Self-check aturan coverage merchant (§9.1, MER-04).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/coverage-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import {
  DEFAULT_POLYGON_FEE_JOD,
  MAX_COVERAGE_RADIUS_METERS,
  MIN_POLYGON_VERTICES,
  coverageAreaKm2,
  coverageContainsPoint,
  coverageFeeJod,
  deliveryQuote,
  nextPolygonId,
  polygonAround,
  polygonSelfIntersects,
  polygonsOverlap,
  segmentsIntersect,
  unitMeters,
  validateCoverage,
} from '../src/data/coverage.ts'

const KITCHEN = { lat: -6.26, lng: 106.78 }

const square = (dLat, dLng, lat = 0, lng = 0) => [
  { lat: lat + dLat, lng: lng - dLng },
  { lat: lat + dLat, lng: lng + dLng },
  { lat: lat - dLat, lng: lng + dLng },
  { lat: lat - dLat, lng: lng - dLng },
]

// Satuan jarak.
assert.equal(unitMeters('km'), 1000)
assert.equal(unitMeters('meter'), 1)

// Persilangan ruas.
assert.equal(segmentsIntersect({ lat: 0, lng: -1 }, { lat: 0, lng: 1 }, { lat: -1, lng: 0 }, { lat: 1, lng: 0 }), true)
assert.equal(segmentsIntersect({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 0 }, { lat: 1, lng: 1 }), false)

// Polygon sederhana vs bersilangan sendiri (bentuk pita).
assert.equal(polygonSelfIntersects(square(0.01, 0.01)), false)
const bowtie = [
  { lat: 0, lng: 0 },
  { lat: 1, lng: 1 },
  { lat: 1, lng: 0 },
  { lat: 0, lng: 1 },
]
assert.equal(polygonSelfIntersects(bowtie), true)

// Tumpang tindih: terpisah = tidak, sama = ya, satu di dalam yang lain = ya.
assert.equal(polygonsOverlap(square(0.01, 0.01, 0, 0), square(0.01, 0.01, 0.5, 0.5)), false)
assert.equal(polygonsOverlap(square(0.01, 0.01), square(0.01, 0.01)), true)
assert.equal(polygonsOverlap(square(0.05, 0.05, 0, 0), square(0.01, 0.01, 0, 0)), true)

// Coverage titik: radius (garis lurus) vs area.
const radiusCoverage = {
  merchantId: 'merchant-1',
  mode: 'radius',
  polygons: [],
  radiusMeters: 2000,
  feePerUnitJod: 0.5,
  unit: 'km',
}
assert.equal(coverageContainsPoint(radiusCoverage, { lat: -6.26, lng: 106.79 }, KITCHEN), true)
assert.equal(coverageContainsPoint(radiusCoverage, { lat: -6.30, lng: 106.78 }, KITCHEN), false)

// Fee radius proporsional jarak, satuan km vs meter.
const near = { lat: -6.261, lng: 106.78 } // ~111 m
const feeKm = coverageFeeJod(radiusCoverage, near, KITCHEN)
assert.ok(feeKm > 0.04 && feeKm < 0.08, `fee km di luar dugaan: ${feeKm}`)
const feeMeter = coverageFeeJod({ ...radiusCoverage, unit: 'meter' }, near, KITCHEN)
assert.ok(feeMeter > 40 && feeMeter < 80, `fee meter di luar dugaan: ${feeMeter}`)

// Area: fee melekat per polygon.
const areaCoverage = {
  merchantId: 'merchant-1',
  mode: 'area',
  polygons: [{ id: 'area-1', vertices: polygonAround(KITCHEN, 400), feeJod: DEFAULT_POLYGON_FEE_JOD }],
}
assert.equal(coverageContainsPoint(areaCoverage, KITCHEN, KITCHEN), true, 'dapur harus di dalam polygon bawaannya')
assert.equal(coverageFeeJod(areaCoverage, KITCHEN, KITCHEN), DEFAULT_POLYGON_FEE_JOD)
assert.equal(coverageContainsPoint(areaCoverage, { lat: -6.30, lng: 106.78 }, KITCHEN), false)

// Satu jawaban gate + ongkir: di luar coverage fee nol, di dalam fee proporsional.
assert.deepEqual(deliveryQuote(radiusCoverage, { lat: -6.30, lng: 106.78 }, KITCHEN), {
  covered: false,
  feeJod: 0,
})
const nearQuote = deliveryQuote(radiusCoverage, near, KITCHEN)
assert.equal(nearQuote.covered, true)
assert.ok(Math.abs(nearQuote.feeJod - feeKm) < 1e-9)
assert.equal(deliveryQuote(areaCoverage, KITCHEN, KITCHEN).feeJod, DEFAULT_POLYGON_FEE_JOD)

// Luas: radius = lingkaran, area = jumlah polygon.
assert.ok(Math.abs(coverageAreaKm2(radiusCoverage) - Math.PI * 4) < 0.01, 'radius 2 km = π·2² km²')
assert.ok(coverageAreaKm2(areaCoverage) > 0)

// Validasi.
assert.deepEqual(validateCoverage(areaCoverage), [])
assert.ok(validateCoverage({ ...areaCoverage, polygons: [] }).some((i) => /minimal satu area/.test(i.message)))
assert.ok(
  validateCoverage({
    ...areaCoverage,
    polygons: [{ id: 'area-1', vertices: [{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }], feeJod: 1 }],
  }).some((i) => /minimal 3 titik/.test(i.message)),
)
assert.ok(
  validateCoverage({
    ...areaCoverage,
    polygons: [
      { id: 'area-1', vertices: square(0.01, 0.01), feeJod: 1 },
      { id: 'area-2', vertices: square(0.01, 0.01), feeJod: 1 },
    ],
  }).some((i) => /tumpang tindih/.test(i.message)),
  'polygon kembar harus ditolak',
)
assert.ok(
  validateCoverage({
    ...areaCoverage,
    polygons: [{ id: 'area-1', vertices: bowtie, feeJod: 1 }],
  }).some((i) => /bersilangan/.test(i.message)),
)
assert.ok(
  validateCoverage({ ...radiusCoverage, radiusMeters: 5000 }).some((i) =>
    /melebihi batas/.test(i.message),
  ),
)
assert.equal(MAX_COVERAGE_RADIUS_METERS, 2000)
assert.equal(MIN_POLYGON_VERTICES, 3)

// Id polygon baru tidak menabrak id yang ada.
assert.equal(nextPolygonId([]), 'area-1')
assert.equal(nextPolygonId([{ id: 'area-1' }, { id: 'area-2' }]), 'area-3')

// Regresi produksi: dapur & alamat live sama-sama di Irbid (32.555, 35.85).
// Titik dapur WAJIB ikut `coverage.origin` dari BE; memakai konstanta mock
// Jakarta membuat semua alamat live dianggap "di luar jangkauan".
const IRBID = { lat: 32.555, lng: 35.85 }
const liveCoverage = { ...radiusCoverage, origin: IRBID }
const livePoint = { lat: 32.5559, lng: 35.8509 }
assert.equal(deliveryQuote(liveCoverage, livePoint, liveCoverage.origin).covered, true, 'alamat Irbid harus masuk radius dapur Irbid')
assert.equal(deliveryQuote(liveCoverage, livePoint, KITCHEN).covered, false, 'dapur mock Jakarta memang menolak alamat Irbid — bukan yang dipakai kalau origin ada')

console.log('coverage-check: OK')
