// Self-check logika jam operasional (dipakai Setelan merchant dan slice).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/hours-check.mjs
import assert from 'node:assert/strict'

import {
  DEFAULT_CLOSE,
  DEFAULT_OPEN,
  WEEKDAY_ORDER,
  hoursForDay,
  hoursLabel,
  invalidHoursRows,
  mockOperatingHours,
} from '../src/data/operatingHours.ts'

// Urutan tampilan mulai Senin dan mencakup ketujuh hari sekali.
assert.deepEqual([...WEEKDAY_ORDER].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6])
assert.equal(mockOperatingHours.length, 7)

// Hari Minggu punya jam berbeda dari hari kerja (bukti jadwal benar per hari).
assert.equal(hoursForDay(mockOperatingHours, 0).open, '09:00')
assert.equal(hoursForDay(mockOperatingHours, 1).open, DEFAULT_OPEN)
assert.equal(hoursForDay(mockOperatingHours, 1).close, DEFAULT_CLOSE)

// Hari di luar jadwal jatuh ke jam cadangan, bukan `undefined`.
const missing = hoursForDay([], 3)
assert.equal(missing.open, DEFAULT_OPEN)
assert.equal(missing.close, DEFAULT_CLOSE)
assert.equal(missing.closed, false)

// Libur mengabaikan jam saat dilabeli.
assert.equal(hoursLabel({ day: 0, open: '09:00', close: '20:00', closed: false }), '09:00 – 20:00')
assert.equal(hoursLabel({ day: 0, open: '09:00', close: '20:00', closed: true }), 'Tutup')

// Validasi: tutup <= buka ditolak, tetapi hari libur tidak ikut dianggap salah.
const invalid = invalidHoursRows([
  { day: 1, open: '22:00', close: '07:00', closed: false },
  { day: 2, open: '08:00', close: '08:00', closed: false },
  { day: 3, open: '10:00', close: '09:00', closed: true },
  { day: 4, open: '07:00', close: '22:00', closed: false },
])
assert.deepEqual(invalid.map((row) => row.day), [1, 2])

console.log('hours-check: ok')
