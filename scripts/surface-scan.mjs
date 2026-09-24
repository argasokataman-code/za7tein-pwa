#!/usr/bin/env node
/**
 * Surface scan — statik, tanpa browser. Langkah 2 dari alur di AGENTS.md §0.
 *
 * Dipakai sebelum `browser-gate`: menemukan hal yang bisa dibaca dari berkas
 * (token tak terdefinisi, kelas tanpa aturan CSS, kontrol mati, tautan mati).
 * Yang tetap milik gate dan tidak bisa dijawab di sini: ukuran hasil render,
 * lebar kolom, gutter, overflow-x, scroller bersarang, PWA, safe-area, hit-test.
 *
 * Jalankan: npm run scan
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const argv = process.argv.slice(2)
const AS_JSON = argv.includes('--json')
const ROUTE_FILTER = argv.reduce((acc, a, i) => (argv[i - 1] === '--route' ? [...acc, a] : acc), [])

const fail = []
const warn = []
const info = []

const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const exists = (p) => existsSync(join(ROOT, p))

/** Semua berkas di bawah sebuah direktori dengan ekstensi tertentu. */
function walk(dir, exts, out = []) {
  const abs = join(ROOT, dir)
  if (!existsSync(abs)) return out
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const rel = join(dir, entry.name)
    if (entry.isDirectory()) walk(rel, exts, out)
    else if (exts.includes(extname(entry.name))) out.push(rel)
  }
  return out
}

const tsxFiles = () => walk('src', ['.tsx'])
const tsFiles = () => [...walk('src', ['.ts']), ...walk('src', ['.tsx'])]
const scssFiles = () => walk('src/styles', ['.scss'])
// Komponen besar boleh punya `.css` co-located (CustomerHomeHero.css). Kalau
// tidak ikut discan, semua kelas di dalamnya dilaporkan sebagai "tanpa aturan".
const styleFiles = () => [...scssFiles(), ...walk('src/components', ['.css'])]

// ── 1. Token: apakah setiap var(--x) punya definisi? ────────────────────────
// Ini pernah bikin seluruh halaman rusak: satu var() tak terdefinisi membatalkan
// seluruh deklarasi shorthand, jadi padding kiri-kanan ikut hilang.
function checkTokens() {
  // Token bisa didefinisikan di berkas SCSS mana pun, bukan cuma _tokens.scss:
  // `_menu.scss` memasang `:root { --success-soft: … }`. Jadi definisi
  // dikumpulkan lintas-berkas dulu, baru dipakai sebagai daftar sah.
  const defined = new Set(['--app-vh', '--shell-max'])
  for (const file of scssFiles()) {
    for (const m of read(file).matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1])
  }

  const undefinedRefs = []
  for (const file of scssFiles()) {
    const src = read(file)
    // Hanya var() di deklarasi, bukan yang cuma disebut di komentar.
    const withoutComments = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    for (const m of withoutComments.matchAll(/var\((--[\w-]+)/g)) {
      if (!defined.has(m[1])) undefinedRefs.push(`${file}: ${m[1]}`)
    }
  }
  if (undefinedRefs.length) fail.push(`var() tanpa definisi: ${undefinedRefs.length} (${undefinedRefs.slice(0, 5).join(', ')})`)
  else info.push('Token: semua var() punya definisi')
}

// ── 2. Kelas CSS yang dipakai TSX tapi tidak ada di SCSS (dan sebaliknya) ───
// Kelas salah ketik = elemen tanpa gaya sama sekali, dan itu tidak terlihat di
// lint maupun build.
function checkClassNames() {
  const declared = new Set()
  for (const file of styleFiles()) {
    for (const m of read(file).matchAll(/\.([a-zA-Z][\w-]*)/g)) declared.add(m[1])
  }
  // Kelas dinamis: `journey-cell--${state}` menghasilkan `journey-cell--done`
  // dan seterusnya, dan aturan CSS-nya ada. Jadi kelas yang diakhiri `--` atau
  // `-` saat dipecah regex dianggap prefiks yang sah.
  const dynamicPrefix = (cls) => cls.endsWith('--') || cls.endsWith('-')
  const used = new Map()
  for (const file of tsxFiles()) {
    const src = read(file)
    for (const m of src.matchAll(/className=(?:"([^"]+)"|\{`([^`]+)`\}|\{'([^']+)'\})/g)) {
      const raw = m[1] || m[2] || m[3] || ''
      // Buang ekspresi `${...}` dulu: isinya kode JS (`courier-step--${state}`),
      // jadi `state`, `st`, `isDelivery` di situ adalah nama variabel, bukan
      // kelas. Yang tersisa setelah itu baru nama kelas sungguhan.
      const literal = raw.replace(/\$\{[^}]*\}/g, ' ')
      for (const cls of literal.split(/[\s?:'"`]+/)) {
        if (!cls || !/^[a-z][\w-]*$/.test(cls)) continue
        if (dynamicPrefix(cls)) continue
        if (!used.has(cls)) used.set(cls, file)
      }
    }
  }
  const unknown = [...used].filter(([cls]) => !declared.has(cls))
  if (unknown.length) {
    warn.push(
      `className tanpa aturan CSS: ${unknown.length} (${unknown.slice(0, 8).map(([c, f]) => `${c} @ ${f}`).join(', ')})`,
    )
  } else {
    info.push('className: semua punya aturan CSS')
  }
}

// ── 3. Kontrol mati: <button> tanpa onClick/type=submit ─────────────────────
// Tombol "Keluar" di Setelan merchant persis kasus ini: bisa ditekan, tidak
// melakukan apa pun. Mustahil dilihat lint/build, mudah dilihat dari sumber.
/**
 * Ambil tag pembuka `<button …>` dengan benar.
 *
 * Tidak bisa pakai `<button\b([\s\S]*?)>`: `>` muncul di dalam ekspresi JSX
 * (`rating >= 1`) dan di dalam string, jadi regex naif berhenti terlalu cepat
 * dan atribut sesudahnya tidak terbaca — akibatnya tombol yang punya `onClick`
 * dilaporkan sebagai kontrol mati. Fungsi ini melacak kedalaman `{}` dan
 * keadaan string supaya `>` yang menutup tag saja yang dikenali.
 */
function openingTags(src, tagName) {
  const out = []
  const open = `<${tagName}`
  let i = 0
  while ((i = src.indexOf(open, i)) !== -1) {
    const after = src[i + open.length]
    if (after && /[\w-]/.test(after)) { i += open.length; continue } // <buttonx>
    let depth = 0
    let quote = null
    let j = i + open.length
    for (; j < src.length; j++) {
      const ch = src[j]
      if (quote) {
        if (ch === quote) quote = null
        continue
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
      if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (ch === '>' && depth === 0) { j++; break }
    }
    out.push({ attrs: src.slice(i + open.length, j - 1), index: i })
    i = j
  }
  return out
}

function checkDeadControls() {
  const dead = []
  for (const file of tsxFiles()) {
    const src = read(file)
    // Buang komentar dulu: komentar yang menyebut `<button>` bukan elemen.
    const stripped = src
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    // `documentation/sections/ButtonsSection.tsx` sengaja memajang tombol sebagai
    // contoh visual — bukan kontrol yang harus diklik. Sama seperti aturan "tanpa
    // emoji" yang tidak berlaku di cuplikan kode dokumentasi.
    if (file.includes('documentation/sections/')) continue
    for (const { attrs, index } of openingTags(stripped, 'button')) {
      if (/onClick|type="submit"|type=\{['"]submit|disabled|aria-hidden|tabIndex=\{-1\}/.test(attrs)) continue
      const line = stripped.slice(0, index).split('\n').length
      const label = (attrs.match(/className="([^"]*)"/)?.[1] ?? '') || attrs.trim().replace(/\s+/g, ' ').slice(0, 30)
      dead.push(`${file}:${line} ${label}`)
    }
  }
  if (dead.length) fail.push(`button tanpa handler (kontrol mati): ${dead.length}\n      ${dead.slice(0, 10).join('\n      ')}`)
  else info.push('Kontrol: tidak ada button tanpa handler')
}

// ── 4. Tautan mati: href="#"/kosong, atau <a> tanpa href ───────────────────
function checkDeadLinks() {
  const dead = []
  for (const file of tsxFiles()) {
    const src = read(file)
    for (const m of src.matchAll(/<a\b([^>]*)>/gs)) {
      const attrs = m[1]
      if (/\shref="#"/.test(attrs)) {
        const line = src.slice(0, m.index).split('\n').length
        dead.push(`${file}:${line} href="#"`)
      }
    }
  }
  if (dead.length) fail.push(`tautan mati href="#": ${dead.length} (${dead.slice(0, 6).join(', ')})`)
  else info.push('Tautan: tidak ada href="#"')
}

// ── 5. preserveAspectRatio="none" (aturan repo) ────────────────────────────
// Termasuk di dalam komentar: pernah gagal commit karena komentarku sendiri.
function checkAspectRatio() {
  const hits = []
  for (const file of [...tsxFiles(), ...walk('src', ['.ts'])]) {
    const src = read(file)
    src.split('\n').forEach((line, i) => {
      if (line.includes('preserveAspectRatio="none"')) hits.push(`${file}:${i + 1}`)
    })
  }
  if (hits.length) fail.push(`preserveAspectRatio="none": ${hits.join(', ')}`)
  else info.push('SVG: tidak ada preserveAspectRatio="none"')
}

// ── 6. Pola terlarang lain (sama dengan pre-commit) ────────────────────────
function checkForbidden() {
  const rules = [
    ['dangerouslySetInnerHTML', /dangerouslySetInnerHTML/],
    ['eval()/new Function()', /(eval|new Function)\s*\(/],
    ['innerHTML =', /innerHTML\s*=/],
    ['console.log di src/', /console\.log/],
    ['useAppStore(', /useAppStore\(/],
    ['URL gambar eksternal', /(src|href)=["']https?:\/\//],
    ['emoji di UI', /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u],
  ]
  for (const [name, re] of rules) {
    const hits = []
    for (const file of tsFiles()) {
      read(file).split('\n').forEach((line, i) => {
        if (re.test(line) && !line.trimStart().startsWith('//') && !line.trimStart().startsWith('*')) {
          hits.push(`${file}:${i + 1}`)
        }
      })
    }
    if (hits.length) fail.push(`${name}: ${hits.length} (${hits.slice(0, 4).join(', ')})`)
  }
  info.push('Pola terlarang: diperiksa')
}

// ── 7. Baris berkas melebihi batas ────────────────────────────────────────
function checkLineCaps() {
  const caps = [
    ['src/components', ['.tsx'], 600, 'Components'],
    ['src/pages', ['.tsx'], 700, 'Pages'],
    ['src/hooks', ['.ts'], 150, 'Hooks'],
    ['src/data', ['.ts'], 500, 'Mock data'],
    ['src/styles', ['.scss'], 600, 'Stylesheets'],
  ]
  for (const [dir, exts, max, label] of caps) {
    const over = []
    for (const file of walk(dir, exts)) {
      if (file.endsWith('Documentation.tsx')) continue
      const n = read(file).split('\n').length
      if (n > max) over.push(`${file} (${n} > ${max})`)
    }
    if (over.length) fail.push(`${label} lewat ${max} baris: ${over.join(', ')}`)
  }
  info.push('Batas baris: diperiksa')
}

// ── 8. Rute: setiap rute punya komponen, setiap komponen terdaftar ─────────
// Rute yang salah daftar = halaman 404 padahal kodenya ada.
function checkRoutes() {
  const app = read('src/App.tsx')
  const tables = ['webRoutes', 'customerRoutes', 'merchantRoutes', 'courierRoutes', 'adminRoutes', 'superAdminRoutes']
  const registered = new Set()
  for (const t of tables) {
    const m = app.match(new RegExp(`const ${t}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`))
    if (!m) continue
    for (const x of m[1].matchAll(/\[\s*'([^']+)'\s*,\s*(\w+)\s*\]/g)) registered.add(x[2])
  }
  // Hanya halaman tingkat atas `src/pages/`, bukan subfolder seperti
  // `documentation/sections/` — itu bagian halaman dokumentasi, bukan rute.
  const pageFiles = readdirSync(join(ROOT, 'src/pages'), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.tsx'))
    .map((e) => e.name.replace('.tsx', ''))
  const unregistered = pageFiles.filter((p) => !registered.has(p) && !['Documentation'].includes(p))
  if (unregistered.length) {
    warn.push(`halaman di src/pages tidak terdaftar sebagai rute: ${unregistered.length} (${unregistered.slice(0, 8).join(', ')})`)
  } else {
    info.push('Rute: semua halaman terdaftar')
  }
}

// ── 9. Wizard wajib: berkas yang di commit harus sinkron dokumentasi ──────
function checkDocsSync() {
  if (!exists('src/pages/Documentation.tsx')) {
    warn.push('Documentation.tsx tidak ada (pre-commit check #6 akan menolak)')
  } else {
    info.push('Dokumentasi global: ada')
  }
}

// ── jalankan ──────────────────────────────────────────────────────────────
checkTokens()
checkClassNames()
checkDeadControls()
checkDeadLinks()
checkAspectRatio()
checkForbidden()
checkLineCaps()
checkRoutes()
checkDocsSync()

if (ROUTE_FILTER.length) {
  info.push(`Filter rute ${ROUTE_FILTER.join(', ')} dicatat — scan ini statik, tidak menjelajah rute`)
}

const report = { fail, warn, info }
if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2))
} else {
  const C = { r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', d: '\x1b[2m', o: '\x1b[0m' }
  console.log(`\n${C.d}Surface scan — statik, tanpa browser${C.o}`)
  for (const i of info) console.log(`  ${C.g}ok${C.o}   ${i}`)
  for (const w of warn) console.log(`  ${C.y}WARN${C.o} ${w}`)
  for (const f of fail) console.log(`  ${C.r}FAIL${C.o} ${f}`)
  console.log(
    `\n  ${fail.length} FAIL · ${warn.length} WARN\n` +
      `  ${C.d}Yang tetap butuh browser: lebar kolom, gutter runtime, overflow-x, scroller\n` +
      `  bersarang, ukuran hasil render, PWA, safe-area, dan hit-test klik.${C.o}\n`,
  )
}

process.exit(fail.length ? 1 : 0)
