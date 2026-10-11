#!/usr/bin/env node
// Self-check kontrak provider kurs live (keputusan OQ-26).
//
// Yang bisa rusak di luar kode kita: URL provider berubah / skema JSON berubah.
// Skrip ini memvalidasi dua URL yang dipakai `src/data/currency.ts` masih
// mengembalikan `jod.idr` berupa angka positif. Jalankan manual:
//
//   node scripts/live-rate-check.mjs
//
// Keluar != 0 kalau kontraknya putus (provider bergeser, mirror mati).

const URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jod.json',
  'https://latest.currency-api.pages.dev/v1/currencies/jod.json',
]

let failed = 0

for (const url of URLS) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const rate = Number(data?.jod?.idr)
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`jod.idr bukan angka positif: ${JSON.stringify(data?.jod?.idr)}`)
    }
    console.log(`ok   ${url}\n     date=${data.date} 1 JOD = ${rate.toFixed(2)} IDR`)
  } catch (err) {
    failed += 1
    console.error(`FAIL ${url}\n     ${err.message}`)
  }
}

if (failed) {
  console.error(`\n${failed}/${URLS.length} URL provider kurs gagal.`)
  process.exit(1)
}
console.log('\nSemua URL provider kurs valid.')
