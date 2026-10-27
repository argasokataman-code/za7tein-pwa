// Self-check reducer daftar tugas kurir (`setTasks`).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/courier-tasks-check.mjs
//
// Tiga sifat yang dijaga: seed hilang begitu BE menjawab, progres checkpoint
// lokal tidak mundur saat realtime menyegarkan, dan order yang baru dituntaskan
// tetap ada di riwayat (RPC kurir tidak lagi mengirim order `done`).
import assert from 'node:assert/strict'

import reducer, { setTasks, advanceCheckpoint, completeTask } from '../src/store/slices/courierSlice.ts'

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

// Daftar awal = seed; setelah BE mengirim tugas, seed hilang.
let state = reducer(undefined, { type: '@@init' })
const seedCount = state.tasks.length
assert.ok(seedCount > 0)
// Seed yang sudah selesai boleh bertahan sebagai riwayat; sisanya hilang.
const doneSeed = state.tasks.filter((task) => task.checkpoint === 'selesai').length
state = reducer(state, setTasks([apiTask(1), apiTask(2)]))
assert.equal(state.tasks.length, 2 + doneSeed)
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

// Muatan kosong (BE belum siap) tidak menghapus daftar yang sudah ada.
state = reducer(state, setTasks([]))
assert.ok(state.tasks.some((task) => task.id === 'api-2'))

console.log('courier-tasks: ok')
