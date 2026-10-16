// Self-check aturan batch kurir inhouse (M5, PRD §8/§9.6, BR-B07/B12).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/courier-batch-check.mjs
// Tanpa framework: assert pertama yang gagal sudah menunjuk komponennya.
import assert from 'node:assert/strict'

import {
  autoSortRoute,
  autoSortTasks,
  batchDisplayStatus,
  batchProgress,
  canStartBatch,
  courierBatchTasks,
  mockCourierBatch,
  nextBatchTask,
  routeDistanceMeters,
} from '../src/data/courierBatch.ts'
import { courierTasks } from '../src/data/courier.ts'

// Batch demo mengikat tugas kurir yang ber-batchId (3 order aktif; ct-4 selesai).
assert.deepEqual(mockCourierBatch.orderIds, ['ct-1', 'ct-2', 'ct-3'])

// Manual (auto-sort OFF): `routeOrder` menang atas `orderIds`; sisanya ikut `orderIds`.
const ranked = courierBatchTasks(
  { ...mockCourierBatch, autoSort: false, routeOrder: ['ct-3', 'ct-1'] },
  courierTasks,
)
assert.deepEqual(
  ranked.map((t) => t.id),
  ['ct-3', 'ct-1', 'ct-2'],
  'routeOrder menentukan dua teratas, sisa mengikuti orderIds',
)

// Satu sumber urutan (BR-B12): saat auto-sort ON, `routeOrder` manual diabaikan
// supaya daftar, peta, dan "berikutnya" tak bisa berbeda pendapat.
const onWithManual = courierBatchTasks(
  { ...mockCourierBatch, autoSort: true, routeOrder: ['ct-3', 'ct-2', 'ct-1'] },
  courierTasks,
)
assert.deepEqual(
  onWithManual.map((t) => t.id),
  ['ct-1', 'ct-2', 'ct-3'],
  'auto-sort ON → urutan diturunkan, bukan dibaca dari routeOrder',
)
assert.equal(
  nextBatchTask({ ...mockCourierBatch, autoSort: true, routeOrder: ['ct-3'] }, courierTasks)?.id,
  onWithManual[0].id,
  'elemen pertama urutan efektif = langkah berikutnya',
)

// Auto-sort: greedy nearest-neighbour dari dapur → ct-1 (terdekat), lalu ct-2, ct-3.
const sorted = autoSortTasks(courierBatchTasks(mockCourierBatch, courierTasks))
assert.deepEqual(sorted.map((t) => t.id), ['ct-1', 'ct-2', 'ct-3'])
assert.deepEqual(autoSortRoute(courierBatchTasks(mockCourierBatch, courierTasks)), [
  'ct-1',
  'ct-2',
  'ct-3',
])

// Elemen pertama auto-sort = yang terdekat dari dapur (bukan kebetulan urutan input).
const shuffled = autoSortTasks([...courierTasks].slice(0, 3).reverse())
assert.equal(shuffled[0].id, 'ct-1', 'titik terdekat dari dapur selalu jadi langkah pertama')

// Tanpa koordinat lengkap (jalur BE), jatuh ke urutan jarak merchant→tujuan.
const noCoords = [
  { ...courierTasks[0], latitude: undefined, longitude: undefined, distanceMeters: 900 },
  { ...courierTasks[1], latitude: undefined, longitude: undefined, distanceMeters: 480 },
]
assert.deepEqual(autoSortTasks(noCoords).map((t) => t.distanceMeters), [480, 900])

// Panjang rute: angka saat koordinat lengkap, null saat ada yang tanpa koordinat.
const routeLength = routeDistanceMeters(autoSortTasks(courierBatchTasks(mockCourierBatch, courierTasks)))
assert.ok(routeLength !== null && routeLength > 0, 'rute berkoordinat punya panjang positif')
assert.equal(routeDistanceMeters(noCoords), null, 'koordinat tak lengkap → rute tak terukur')

// Kemajuan & langkah berikutnya: order selesai tak dihitung sebagai "berikutnya".
const withDone = courierTasks.map((task) =>
  task.id === 'ct-1' ? { ...task, checkpoint: 'selesai' } : task,
)
assert.deepEqual(batchProgress(mockCourierBatch, withDone), { done: 1, total: 3 })
assert.equal(nextBatchTask(mockCourierBatch, withDone)?.id, 'ct-2')
assert.equal(
  nextBatchTask(mockCourierBatch, courierTasks.map((t) => ({ ...t, checkpoint: 'selesai' }))),
  null,
  'semua selesai → tak ada langkah berikutnya',
)

// Boleh mulai: hitung mundur habis ATAU batch ditutup lebih awal (BR-B09).
assert.equal(canStartBatch({ ...mockCourierBatch, status: 'closed', countdownSeconds: 720 }), true)
assert.equal(canStartBatch({ ...mockCourierBatch, status: 'assigned', countdownSeconds: 0 }), true)
assert.equal(
  canStartBatch({ ...mockCourierBatch, status: 'assigned', countdownSeconds: 720 }),
  false,
  'batch masih hitung mundur dan belum ditutup → belum boleh mulai',
)

// Status tampilan: `done` turunan saat semua order batch selesai (BR-B11).
assert.equal(batchDisplayStatus(mockCourierBatch, courierTasks), 'closed')
const allDone = courierTasks.map((task) =>
  mockCourierBatch.orderIds.includes(task.id) ? { ...task, checkpoint: 'selesai' } : task,
)
assert.equal(batchDisplayStatus(mockCourierBatch, allDone), 'done')

// Rute hasil auto-sort tak lebih panjang dari urutan input yang belum diurutkan.
const batchTasks = courierBatchTasks(mockCourierBatch, courierTasks)
const shuffledTasks = [...batchTasks].reverse()
const sortedLength = routeDistanceMeters(autoSortTasks(shuffledTasks))
const shuffledLength = routeDistanceMeters(shuffledTasks)
assert.ok(
  typeof sortedLength === 'number' &&
    typeof shuffledLength === 'number' &&
    sortedLength <= shuffledLength,
  `auto-sort harus memendekkan rute (${sortedLength} ≤ ${shuffledLength})`,
)

console.log('courier-batch-check: OK')
