// Self-check `dbTimeMs` (`src/data/dbTime.ts`) — logika waktu yang dipakai
// jendela batal 1 menit. Bentuk string diambil dari keluaran D1/Postgres.
// Jalankan: npm run check:db-time
process.env.TZ = 'Asia/Jakarta' // kalau parsing salah, selisihnya 7 jam, bukan 0

import assert from 'node:assert/strict'

// Import dinamis: `TZ` di atas harus berlaku sebelum mesin tanggal dipakai.
const { dbTimeMs } = await import('../src/data/dbTime.ts')

const utc = Date.UTC(2026, 9, 18, 9, 15, 0) // 2026-10-18T09:15:00Z

assert.equal(dbTimeMs('2026-10-18 09:15:00+00'), utc, 'offset singkat +00')
assert.equal(dbTimeMs('2026-10-18 09:15:00'), utc, 'tanpa offset dibaca UTC, bukan lokal')
assert.equal(dbTimeMs('2026-10-18 09:15:00+00:00'), utc, 'spasi + offset penuh')
assert.equal(dbTimeMs('2026-10-18T09:15:00Z'), utc, 'ISO Z')
assert.equal(dbTimeMs('2026-10-18T09:15:00+00:00'), utc, 'ISO offset penuh')
assert.ok(Number.isFinite(dbTimeMs('bukan-tanggal')), 'string rusak tetap angka (fallback now)')

console.log('ok db-time: 6 assertion')
