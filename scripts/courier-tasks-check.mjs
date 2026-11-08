// Self-check reducer daftar tugas kurir (`setTasks`).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/courier-tasks-check.mjs
//
// Empat sifat yang dijaga: daftar mulai KOSONG (tak ada seed), muatan kosong
// dari BE benar-benar mengosongkan daftar, progres checkpoint lokal tidak mundur
// saat realtime menyegarkan, dan order yang baru dituntaskan tetap ada di
// riwayat (RPC kurir tidak lagi mengirim order `done`).
import assert from 'node:assert/strict'

import reducer, { setTasks, advanceCheckpoint, completeTask } from '../src/store/slices/courierSlice.ts'
import { distanceLabel, taskAddress } from '../src/data/courier.ts'

const seedTask = {
  id: 'ct-1',
  code: 'SA-1041',
  customerId: 'c-1',
  customerName: 'Rani',
  customerPhone: '+62811',
  address: 'Menara',
  floor: '1',
  unit: 'A',
  items: [],
  total: 1000,
  distanceMeters: 480,
  zone: 'hijazi',
  paymentMethod: 'cod',
  tip: 0,
  orderStage: 'disiapkan',
  checkpoint: 'masuk',
  otp: '1234',
}

const apiTask = (id, checkpoint = 'ambil') => ({
  ...seedTask,
  id: `api-${id}`,
  code: `SA-${id}`,
  checkpoint,
})

// Daftar awal kosong: beranda kurir tidak boleh menampilkan tugas seed.
let state = reducer(undefined, { type: '@@init' })
assert.equal(state.tasks.length, 0)
// Sebelum BE menjawab, layar detail belum boleh mengklaim "tidak ditemukan".
assert.equal(state.tasksLoaded, false)
// Daftar = muatan BE apa adanya.
state = reducer(state, setTasks([apiTask(1), apiTask(2)]))
assert.equal(state.tasks.length, 2)
assert.ok(state.tasks.some((task) => task.id === 'api-1'))
assert.ok(state.tasks.some((task) => task.id === 'api-2'))
assert.ok(!state.tasks.some((task) => task.checkpoint !== 'selesai' && !task.id.startsWith('api-')))

// Progres lokal bertahan saat BE mengirim ulang baris yang sama.
state = reducer(state, advanceCheckpoint({ id: 'api-1' }))
state = reducer(state, setTasks([apiTask(1), apiTask(2)]))
assert.equal(state.tasks.find((task) => task.id === 'api-1').checkpoint, 'berangkat')

// Order tuntas hilang dari muatan BE, tapi riwayat sesi tetap memuatnya.
state = reducer(state, completeTask({ id: 'api-1' }))
state = reducer(state, setTasks([apiTask(2)]))
assert.ok(state.tasks.some((task) => task.id === 'api-1' && task.checkpoint === 'selesai'))
assert.equal(state.tasks.find((task) => task.id === 'api-2').checkpoint, 'ambil')

// Muatan kosong = kurir memang tidak punya tugas aktif. Yang tersisa hanya
// riwayat sesi yang baru dituntaskan (api-1); seed demo tidak pernah kembali.
state = reducer(state, setTasks([]))
assert.ok(state.tasks.every((task) => task.checkpoint === 'selesai'))
assert.deepEqual(state.tasks.map((task) => task.id), ['api-1'])
assert.equal(state.tasksLoaded, true)

// Alamat tidak boleh mencetak lantai/unit dua kali: `full_address` BE sudah
// memuatnya ("Meral · 2 · A1"), dan layar dulu menambahkannya lagi.
assert.equal(taskAddress({ address: 'Meral · 2 · A1', floor: '2', unit: 'A1' }), 'Meral · 2 · A1')
assert.equal(
  taskAddress({ address: 'Jl. Hijazi No. 12, Irbid', floor: '2', unit: 'A1' }),
  'Jl. Hijazi No. 12, Irbid · 2 · A1',
)
// Jarak tak terukur ≠ 0 meter (RPC kurir tidak mengirim `distance_m`).
assert.equal(distanceLabel(null), 'jarak belum tersedia')
assert.equal(distanceLabel(480), '480 m')
assert.equal(distanceLabel(1500), '1,5 km')

console.log('courier-tasks: ok')
