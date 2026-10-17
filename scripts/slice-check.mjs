#!/usr/bin/env node
// Gerbang statik irisan HTML: docs/design/slice/*.html
//
//   node scripts/slice-check.mjs
//
// Yang diperiksa per berkas: stylesheet terpasang, bingkai ada, kelas yang dipakai
// benar-benar ada di login.css, token `var(--x)` terdefinisi, path aset
// menunjuk ke akar repo, tanpa <script>, tanpa emoji — plus aturan validasi:
// setiap <form> wajib `novalidate`, tanpa `required`/`pattern`/`minlength`
// (pesan bawaan peramban dilarang), setiap input punya `<label for>`, dan setiap
// state salah membawa `role="alert"` + `aria-invalid` + `aria-describedby` yang
// menunjuk id nyata. Keluar dengan kode 1 kalau ada FAIL.
//
// Sengaja statik: nol server, nol peramban, selesai dalam ratusan milidetik —
// hal yang bisa dibaca dari berkas tidak perlu diukur di DOM.

import { readdirSync, readFileSync, existsSync } from 'node:fs'

const DIR = 'docs/design/slice/'
const SKIP = new Set(['index.html'])
// Satu stylesheet: `login.css` (satu bahasa login untuk semua peran).
const css = readFileSync(DIR + 'login.css', 'utf8')

// Kelas & token yang dikenal (cari nama apa pun yang muncul di login.css)
const knownClasses = new Set([...css.matchAll(/\.([A-Za-z][\w-]*)/g)].map(m => m[1]))
const knownTokens = new Set([...css.matchAll(/--([\w-]+)\s*:/g)].map(m => m[1]))

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u
// Kelas yang dipakai hanya sebagai "penanda" di dalam HTML tapi tidak perlu
// punya aturan: aria-current pada `.tabs a`, dsb tidak relevan di sini.
const IGNORE_CLASSES = new Set([])

const fails = []
const warns = []
const files = readdirSync(DIR).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort()

for (const file of files) {
  const src = readFileSync(DIR + file, 'utf8')
  const fail = m => fails.push(`${file}: ${m}`)
  const warn = m => warns.push(`${file}: ${m}`)

  if (!/<link rel="stylesheet" href="(?:slice|login)\.css"/.test(src)) fail('tidak memuat slice.css / login.css')
  if (!/class="phone/.test(src) && !/class="[^"]*\bwide\b/.test(src)) fail('tidak ada bingkai (phone / wide)')

  // Kelas
  for (const m of src.matchAll(/class="([^"]+)"/g)) {
    for (const cls of m[1].trim().split(/\s+/)) {
      if (!cls || IGNORE_CLASSES.has(cls)) continue
      if (/\$|\{/.test(cls)) continue
      if (!knownClasses.has(cls)) fail(`kelas tak punya aturan: .${cls}`)
    }
  }

  // Token di style inline
  for (const m of src.matchAll(/var\(--([\w-]+)/g)) {
    if (!knownTokens.has(m[1])) fail(`token tak terdefinisi: --${m[1]}`)
  }

  // Aset: hanya dari `public/` repo (foto menu ATAU lambang merek di
  // `public/icons/sa7tein-96x96.png` — yang dipakai `AuthLayout.tsx:125`).
  for (const m of src.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const v = m[1]
    if (/^(https?:)?\/\//.test(v)) fail(`aset eksternal: ${v}`)
    if (/\.(webp|png|jpe?g|svg)$/.test(v) && !/^(\.\.\/){3}public\/[a-z]/.test(v)) {
      fail(`path aset salah (harus ../../../public/…): ${v}`)
    }
  }

  if (/<script\b/.test(src)) fail('ada <script> — irisan tanpa JS')
  if (EMOJI.test(src)) fail('ada emoji')
  if (/text-transform:\s*uppercase/.test(src)) fail('uppercase (MD-08)')

  // ── Validasi: TIDAK BOLEH ada pesan bawaan peramban ──────────────────────
  // Ketiga layar masuk repo memakai `<form noValidate>` dan tidak punya
  // `required`/`pattern`/`minlength` (pesannya digambar sendiri lewat
  // `.auth-error`). Aturan yang sama ditegakkan di sini.
  for (const m of src.matchAll(/<form\b[^>]*>/g)) {
    if (!/\bnovalidate\b/.test(m[0])) fail('<form> tanpa novalidate — pesan validasi bisa keluar dari peramban')
  }
  if (/\srequired[\s/>]/.test(src)) fail('atribut `required` memicu pesan bawaan peramban')
  if (/\spattern=/.test(src)) fail('atribut `pattern` memicu pesan bawaan peramban')
  if (/\sminlength=|maxlength=/.test(src)) fail('atribut minlength/maxlength memicu pesan bawaan peramban')

  // Label nyata (`for`↔`id`), sama seperti repo — bukan placeholder
  for (const m of src.matchAll(/<input\b[^>]*\sid="([^"]+)"/g)) {
    if (!new RegExp(`<label[^>]*for="${m[1]}"`).test(src)) fail(`input #${m[1]} tanpa <label for="…">`)
  }

  // State salah wajib lengkap: role="alert" + aria-invalid + aria-describedby
  for (const m of src.matchAll(/<span class="error"[^>]*>/g)) {
    if (!/role="alert"/.test(m[0])) fail('`.error` tanpa role="alert"')
  }
  for (const m of src.matchAll(/<input\b[^>]*class="input is-error"[^>]*>/g)) {
    const tag = m[0]
    if (!/aria-invalid="true"/.test(tag)) fail('input `.is-error` tanpa aria-invalid="true"')
    const d = tag.match(/aria-describedby="([^"]+)"/)
    if (!d) fail('input `.is-error` tanpa aria-describedby')
    else if (!src.includes(`id="${d[1]}"`)) fail(`aria-describedby menunjuk id yang tidak ada: ${d[1]}`)
  }

  // Toast: GAYA dari `toastOptions.style` repo (App.tsx:593) dan POSISI
  // mengapung di atas layar. Ia anak `.phone`, bukan isi `.body` — di dalam
  // `.body` ia jatuh menimpa baris tab (kesalahan yang sudah terjadi). Tanpa
  // titik/ikon karangan: repo tidak menyetel `iconTheme`.
  if (/class="body">\s*<p class="toast"/.test(src)) {
    fail('toast di dalam `.body` — ia harus mengapung sebagai anak `.phone`')
  }
  if (/<p class="toast"[^>]*>\s*<i\b/.test(src)) {
    fail('toast pakai titik/ikon karangan — repo hanya teks (App.tsx:593)')
  }

  // Badge merek: cakram putih di kepala wajib berisi LOGO repo — mark
  // `/icons/sa7tein-mark.svg` (persegi, muat di cakram) atau logo lengkap
  // `/icons/sa7tein-wordmark.svg`. Nama merek sebagai teks = bukan logo; itu
  // yang dulu dikeluhkan pemilik.
  if (!/sa7tein-(?:mark|wordmark)\.svg/.test(src)) {
    fail('badge tanpa logo merek — pakai `/icons/sa7tein-mark.svg`')
  }
  if (!/<img[^>]*sa7tein-(?:mark|wordmark)\.svg[^>]*alt="Sa7tein"/.test(src)) {
    fail('logo merek tanpa `<img … alt="Sa7tein">` yang benar')
  }
  if (/\bhero-name\b|\brole-pill\b|\bauth-brand-name\b|class="brand-name"/.test(src)) {
    fail('merek digambar sebagai teks karangan — badge wajib logo wordmark')
  }

  // Korsel: 5 slide per kepala — 4 foto + duplikat foto pertama di urutan
  // terakhir. Duplikat itu yang menutup putaran, jadi kepala tidak pernah
  // menunjukkan dasar oranye (pernah kejadian: kepala berkedip oranye).
  for (const m of src.matchAll(/<div class="carousel"[^>]*>([\s\S]*?)<\/div>/g)) {
    const imgs = [...m[1].matchAll(/<img class="slide"[^>]*>/g)].map(x => x[0])
    if (imgs.length !== 5) fail(`korsel punya ${imgs.length} slide — harus 5 (4 foto + duplikat foto pertama)`)
    const srcOf = tag => (tag.match(/src="([^"]+)"/) || [, ''])[1]
    if (imgs.length === 5 && srcOf(imgs[0]) !== srcOf(imgs[4])) {
      fail('slide ke-5 bukan duplikat slide pertama — siklus korsel akan berkedip')
    }
  }

  const links = [...src.matchAll(/href="([^"]+\.html)"/g)].map(m => m[1])
  for (const l of new Set(links)) if (!existsSync(DIR + l)) warn(`tautan ke berkas yang belum ada: ${l}`)

  const inline = (src.match(/style="/g) || []).length
  if (inline > 12) warn(`${inline} atribut style inline — pindahkan polanya ke slice.css`)
}

for (const f of fails) console.log('FAIL ' + f)
for (const w of warns) console.log('WARN ' + w)
console.log(`\n${files.length} berkas diperiksa · ${fails.length} FAIL · ${warns.length} WARN`)
process.exit(fails.length ? 1 : 0)
