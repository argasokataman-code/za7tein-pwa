// Self-check periode kartu pendapatan merchant (harian per jam, mingguan, tahunan).
// Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/trend-check.mjs
import assert from 'node:assert/strict'

import {
  REVENUE_PERIODS,
  hourlyRevenueSeries,
  merchantTrend,
  merchantYearlyTrend,
  revenueSeries,
} from '../src/data/merchantTrend.ts'

const at = (iso) => new Date(iso).getTime()
const NOW = at('2026-10-27T15:30:00')

const orders = [
  { status: 'selesai', total: 30_000, placedAtMs: at('2026-10-27T10:10:00') },
  { status: 'baru', total: 20_000, placedAtMs: at('2026-10-27T14:40:00') },
  // Batal tidak pernah jadi pendapatan.
  { status: 'batal', total: 99_000, placedAtMs: at('2026-10-27T11:00:00') },
  // Kemarin tidak masuk "hari ini".
  { status: 'selesai', total: 77_000, placedAtMs: at('2026-10-26T23:00:00') },
  // Tanpa jam tidak bisa ditempatkan pada satu batang.
  { status: 'selesai', total: 88_000 },
]

const daily = hourlyRevenueSeries(orders, NOW)
assert.equal(daily.bars.length, 24, 'harian = 24 jam')
assert.equal(daily.totalIdr, 50_000)
assert.equal(daily.orders, 2)
assert.equal(daily.peak, '10:00')
assert.equal(daily.bars[10].value, 30)
assert.equal(daily.bars[14].value, 20)
assert.equal(daily.bars[11].value, 0)
// Hover membaca nominal asli + jumlah order pembentuk batang, bukan tinggi batang.
assert.equal(daily.bars[10].revenueIdr, 30_000)
assert.equal(daily.bars[10].orders, 1)
assert.equal(daily.bars[10].fullLabel, '10:00–10:59')
assert.equal(daily.bars[11].orders, 0)
assert.equal(daily.averageIdr, 25_000)
assert.equal(daily.peakIndex, 10)
// Label hanya tiap 3 jam supaya 24 batang tetap terbaca.
assert.equal(daily.bars.filter((bar) => bar.label !== '').length, 8)
assert.equal(daily.bars[12].label, '12')

// Mingguan & tahunan memakai deret yang sama untuk total dan bentuk.
const weekly = revenueSeries('weekly', orders, NOW)
assert.equal(weekly.bars.length, merchantTrend.length)
assert.equal(weekly.bars.length, 7)
assert.ok(weekly.totalIdr > 0)
assert.equal(weekly.averageIdr, Math.round(weekly.totalIdr / weekly.orders))
assert.match(weekly.bars[6].fullLabel, /^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu), \d{1,2} \w+$/)
assert.equal(weekly.peakIndex, weekly.bars.findIndex((bar) => bar.value === Math.max(...weekly.bars.map((b) => b.value))))

const yearly = revenueSeries('yearly', orders, NOW)
assert.equal(yearly.bars.length, merchantYearlyTrend.length)
assert.equal(yearly.bars.length, 12)
assert.ok(yearly.totalIdr > 0)
assert.equal(new Set(merchantYearlyTrend.map((point) => point.label)).size, 12)
// Dua belas batang dilabeli nomor bulan (01-12), bukan nama yang terpotong.
assert.equal(yearly.bars.filter((bar) => bar.label !== '').length, 12)
assert.ok(yearly.bars.every((bar) => /^\d{2}$/.test(bar.label)))
// Nama bulan lengkap tetap terbaca di keterangan hover.
assert.match(yearly.bars[0].fullLabel, /^(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember) \d{4}$/)
assert.ok(yearly.bars.every((bar) => bar.orders > 0))

// Default UI = harian, dan itu urutan pertama tombolnya.
assert.equal(REVENUE_PERIODS[0].id, 'daily')
assert.deepEqual(
  REVENUE_PERIODS.map((option) => option.id),
  ['daily', 'weekly', 'yearly'],
)

console.log('trend-check: OK')
