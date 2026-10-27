#!/usr/bin/env node
/**
 * browser-gate — verifikasi UI di browser nyata lewat CDP (brave-debug, port 9355).
 *
 * Kenapa ada: pre-commit tidak bisa mengukur tata letak atau membuktikan sebuah
 * tombol benar-benar bisa diklik. Gerbang ini yang menutup celah itu.
 *
 * Dua prinsip:
 *   1. Angka pembanding diambil dari KODE (token di src/styles/_tokens.scss,
 *      invarian di .rules.json), bukan selera. Nilai runtime yang berbeda dari
 *      sumber dianggap bug — pernah kejadian satu `var()` tak terdefinisi
 *      membatalkan seluruh deklarasi padding.
 *   2. Klik memakai input nyata (Input.dispatchMouseEvent) yang di-hit-test di
 *      titik tengah elemen, lalu dilaporkan kalau ada elemen lain menutupi
 *      (OVERLAY). `eval("el.click()")` menembus lapisan apa pun dan tidak
 *      membuktikan apa pun — karena itu skrip ini tidak pernah memakainya.
 *
 * Pemakaian:
 *   node scripts/browser-gate.mjs --role customer
 *   node scripts/browser-gate.mjs --route /home --strict
 *   node scripts/browser-gate.mjs --route /address-selection --strict --click
 *   node scripts/browser-gate.mjs --role all --json
 */

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// `GATE_CDP` = klon khusus pengukuran (port 9359, profil `profile-gate`).
// Bukan 9355/9356: kalau gate memakai klon kerja agent, ia memindahkan tab
// kerja ke rute terakhir yang diukur sehingga jendela app-mode role lain
// tertinggal di sana, dan Chromium menamai jendela dari `start_url` manifest —
// akibatnya dua role tampak menjadi aplikasi yang sama.
const CDP = process.env.GATE_CDP || 'http://127.0.0.1:9359'
// PWA murni harus diukur pada hasil build (service worker hanya ada di build),
// bukan di dev server. Di mode biasa, BASE dideteksi dari dev server yang SUDAH
// hidup — gate tidak pernah menghidupkan server sendiri (dan tidak pernah
// menyarankan `npm run dev` kalau salah satu port sudah melayani).
let BASE =
  process.env.GATE_BASE ||
  (process.argv.includes('--pwa') ? 'http://localhost:4173' : '')
const LAUNCH_SH =
  process.env.BRAVE_DEBUG_LAUNCH ||
  path.join(process.env.HOME || '', '.local/share/brave-debug-mcp/bin/launch.sh')

// ── argumen ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const has = (flag) => argv.includes(flag)
const valueOf = (flag, fallback) => {
  const i = argv.indexOf(flag)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
const routesArg = argv.reduce((acc, a, i) => (argv[i - 1] === '--route' ? [...acc, a] : acc), [])
const OPTS = {
  role: valueOf('--role', 'customer'),
  routes: routesArg,
  strict: has('--strict'),
  click: has('--click'),
  clickLimit: Number(valueOf('--click-limit', '15')),
  width: valueOf('--width', null),
  json: has('--json'),
  // Mode PWA murni: app-mode window (display-mode: standalone), input sentuh,
  // safe-area, dan syarat service worker.
  pwa: has('--pwa'),
  offline: has('--offline'),
  insetTop: Number(valueOf('--inset-top', '59')),
  insetBottom: Number(valueOf('--inset-bottom', '34')),
  // Audit khusus: rute pertama jadi titik berangkat, tiap rute berikutnya
  // DIBUKA DARI situ lewat tautan/klik supaya ada riwayat gulir nyata. Itu satu
  // -satunya cara menemukan halaman yang mewarisi posisi gulir; navigasi
  // langsung lewat CDP selalu mulai dari atas.
  audit: has('--audit'),
  auditPause: Number(valueOf('--audit-pause', '450')),
  /** Dari mana halaman sebelumnya ditinggalkan: 'top' (default) atau 'bottom'. */
  auditFrom: valueOf('--audit-from', 'top'),
}

// Butir DNA yang punya cek mekanis di gerbang ini (MD-04 zona jempol & MD-08/09
// tipografi/bayangan dipegang `npm run scan` + review; dicetak apa adanya supaya
// tidak ada butir yang tampak "lolos" padahal tidak pernah diperiksa).
const DNA_IDS_GATE = ['MD-01', 'MD-02', 'MD-03', 'MD-05', 'MD-06', 'MD-07', 'MD-10', 'MD-11', 'MD-12']

if (has('--help') || has('-h')) {
  process.stdout.write(
    `browser-gate — ukur UI di klon Brave lewat CDP (${CDP})\n\n` +
      `  node scripts/browser-gate.mjs --route <path> [--strict] [--click]\n` +
      `  node scripts/browser-gate.mjs --role <customer|merchant|courier|ops|superadmin|web>\n\n` +
      `  --route <path>    rute (boleh diulang). Tanpa ini, SATU role default diukur.\n` +
      `  --role <nama>     role yang diukur (default customer).\n` +
      `  --strict          promosikan WARN jadi FAIL.\n` +
      `  --click           uji klik nyata tiap kontrol.\n` +
      `  --pwa             mode app-mode + input sentuh + syarat service worker.\n` +
      `  --offline         ukur juga saat offline.\n` +
      `  --json            keluarkan laporan JSON.\n` +
      `  --help            tampilkan bantuan ini (tidak mengukur apa pun).\n\n` +
      `Tiap pengukuran mencetak checklist DNA (MD-01..MD-12) dengan ✗ temuan, — bila\n` +
      `tidak ada yang diperiksa di halaman itu, dan ✓ bila lolos. Panel sheet dibuka\n` +
      `otomatis (klik nyata bilah keranjang) supaya MD-06/07/11 diukur di dalamnya.\n` +
      `Rute non-app (/ dan /documentation) tidak dicetak DNA-nya: keduanya website\n` +
      `penuh, bukan permukaan app (lihat AGENTS.md §1).\n\n` +
      `Klon direuse: gate memakai ulang klon/ tab yang sudah hidup, tidak menumpuk.\n`,
  )
  process.exit(0)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const C = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', dim: '\x1b[2m', off: '\x1b[0m' }

// ── deteksi klon ───────────────────────────────────────────────────────────
// Setiap klon punya fingerprint sendiri: port CDP + profil. Gate tidak boleh
// menumpuk klon/tab baru kalau salah satu sudah hidup — cukup pakai ulang.
const KNOWN_CLONE_PORTS = [9355, 9356, 9357, 9358, 9359]
const CDP_HOST = new URL(CDP).hostname || '127.0.0.1'

/** Daftar target CDP, atau `null` kalau endpoint mati (bukan array kosong). */
async function cdpList(endpoint) {
  try {
    const res = await fetch(`${endpoint}/json/list`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** Buka satu tab baru di klon yang sudah hidup (jangan hidupkan klon baru). */
async function cdpNewTab(endpoint, url) {
  try {
    const res = await fetch(`${endpoint}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ── dev server ─────────────────────────────────────────────────────────────
// Deteksi server yang SUDAH hidup. Gate tidak pernah menghidupkan dev server:
// menjalankan `npm run dev` saat satu sudah jalan membuat Vite pindah ke port
// berikutnya (5174, 5175, ...) dan menumpuk proses. Kalau tak ada yang hidup,
// berhenti dengan pesan jelas — bukan menghidupkan sendiri.
const DEV_PORTS = [5173, 5174, 5175, 5176]

async function resolveBase() {
  if (process.env.GATE_BASE) return process.env.GATE_BASE
  if (OPTS.pwa) return 'http://localhost:4173'
  for (const port of DEV_PORTS) {
    try {
      const res = await fetch(`http://localhost:${port}/`)
      if (res.ok) return `http://localhost:${port}`
    } catch {
      // port ini kosong; coba berikutnya
    }
  }
  process.stderr.write(
    `${C.red}Tidak ada dev server di ${DEV_PORTS.map((p) => `:${p}`).join(' / ')}.${C.off}\n` +
      `Jalankan \`npm run dev\` SEKALI di terminal lain, lalu ulangi. Gate tidak menghidupkan server.\n`,
  )
  process.exit(2)
}

// ── angka pembanding, dibaca dari kode ─────────────────────────────────────
function tokensFromSource() {
  const scss = readFileSync(path.join(ROOT, 'src/styles/_tokens.scss'), 'utf8')
  const px = (name) => {
    const m = scss.match(new RegExp(`--${name}\\s*:\\s*([0-9.]+)px`))
    return m ? Number(m[1]) : null
  }
  return {
    shellMax: px('shell-max'),
    touchMin: px('touch-min'),
    space5: px('space-5'),
    navHeight: px('nav-height'),
  }
}

const ROUTE_TABLES = {
  // `pwa: true` = rute yang benar-benar bisa diinstal: punya manifest sendiri
  // (public/manifest-<peran>.json) dan jadi sasaran mode PWA. `/` dan
  // `/documentation` ada di `navigateFallbackDenylist` vite.config.ts, dan
  // /ops + /superadmin memang diputuskan sebagai website penuh non-PWA —
  // mengukurnya dengan safe-area paksa + syarat service worker hanya
  // menghasilkan angka palsu dan mengaburkan batas produk.
  // `startUrl` = `start_url` manifest peran (`public/manifest-<role>.json`).
  // Dipakai gate untuk mengembalikan jendela app-mode ke beranda perannya
  // sesudah diukur, supaya tidak tertinggal di rute terakhir.
  customer: { base: '/customer', table: 'customerRoutes', pwa: true, startUrl: '/customer/home' },
  merchant: { base: '/merchant', table: 'merchantRoutes', pwa: true, startUrl: '/merchant' },
  courier: { base: '/courier', table: 'courierRoutes', pwa: true, startUrl: '/courier' },
  ops: { base: '/ops', table: 'opsRoutes', pwa: false },
  superadmin: { base: '/superadmin', table: 'superAdminRoutes', pwa: false },
  web: { base: '', table: 'webRoutes', pwa: false },
}

function routesFromSource(role) {
  const src = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8')
  const meta = ROUTE_TABLES[role]
  if (!meta) throw new Error(`role tidak dikenal: ${role}`)
  const m = src.match(new RegExp(`const ${meta.table}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`))
  if (!m) throw new Error(`tabel rute ${meta.table} tidak ketemu di src/App.tsx`)
  return [...m[1].matchAll(/\[\s*'([^']+)'/g)].map((x) => meta.base + x[1])
}

// ── CDP ────────────────────────────────────────────────────────────────────
class Cdp {
  constructor(ws) {
    this.ws = ws
    this.seq = 0
    this.pending = new Map()
    this.handlers = new Set()
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      } else if (msg.method) {
        for (const h of this.handlers) h(msg)
      }
    }
  }

  static async connect() {
    const endpoint = CDP
    let list = await cdpList(endpoint)

    // Deteksi: klon lain sudah hidup? Lapor, tapi JANGAN dipakai — memindahkan
    // tab klon kerja (9355-9358) akan mengusik sesi login di dalamnya. Gate
    // hanya memakai klon pengukurannya sendiri (9359) supaya tidak menumpuk.
    if (list === null) {
      const alive = []
      for (const port of KNOWN_CLONE_PORTS) {
        const candidate = `http://${CDP_HOST}:${port}`
        if (candidate === endpoint) continue
        if (await cdpList(candidate)) alive.push(port)
      }
      if (alive.length) {
        process.stderr.write(
          `${C.dim}klon lain hidup (${alive.join(', ')}) — dibiarkan, gate pakai ${CDP}${C.off}\n`,
        )
      }
    }

    // Belum ada klon pengukuran → baru hidupkan (sekali).
    if (list === null) {
      if (LAUNCH_SH && existsSyncSafe(LAUNCH_SH)) {
        process.stderr.write(`${C.yellow}CDP mati — menjalankan ${LAUNCH_SH}${C.off}\n`)
        // Port + profil klon gate ikut disebut, supaya fallback tidak menghidupkan
        // klon default (9355) dan lalu mengukur di mesin yang salah.
        const port = new URL(CDP).port || '9355'
        execFileSync(LAUNCH_SH, ['--fresh'], {
          stdio: 'ignore',
          env: {
            ...process.env,
            BRAVE_CDP_PORT: port,
            BRAVE_PROFILE: process.env.GATE_PROFILE ||
              path.join(process.env.HOME || '', '.local/share/brave-debug-mcp/bin/profile-gate'),
            BRAVE_EXTRA_ARGS: process.env.GATE_EXTRA_ARGS ||
              `--app=${BASE}/customer/home --touch-events=enabled --window-size=430,920`,
          },
        })
        await sleep(2500)
        list = await cdpList(endpoint)
      } else {
        throw new Error(
          `CDP ${CDP} tidak hidup. Jalankan tools["brave-debug"].launch({}) dari agent, lalu ulangi.`,
        )
      }
    }

    if (list === null) throw new Error(`CDP ${endpoint} tidak hidup`)

    // Klon hidup tapi tanpa tab page (semua tab ditutup): buka satu tab di klon
    // itu. Jangan hidupkan klon baru hanya karena tidak ada tab.
    if (!list.some((t) => t.type === 'page')) {
      const opened = await cdpNewTab(endpoint, `${BASE}/customer/home`)
      if (opened) list = [opened, ...list]
    }

    const page = list.find((t) => t.type === 'page' && (t.url || '').startsWith(BASE))
      ?? list.find((t) => t.type === 'page')
    if (!page) throw new Error('tidak ada tab page di klon Brave')
    const ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((res, rej) => {
      ws.onopen = res
      ws.onerror = () => rej(new Error('websocket CDP gagal'))
    })
    const cdp = new Cdp(ws)
    cdp.targetId = page.id
    return cdp
  }

  send(method, params = {}) {
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  on(fn) {
    this.handlers.add(fn)
    return () => this.handlers.delete(fn)
  }

  once(method, timeoutMs = 8000) {
    return new Promise((resolve) => {
      const off = this.on((m) => {
        if (m.method !== method) return
        off()
        clearTimeout(timer)
        resolve(true)
      })
      const timer = setTimeout(() => {
        off()
        resolve(false)
      }, timeoutMs)
    })
  }

  close() {
    this.ws.close()
  }
}

const existsSyncSafe = (p) => {
  try {
    readFileSync(p)
    return true
  } catch {
    return false
  }
}

async function evaluate(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || 'evaluate gagal')
  }
  return r.result.value
}

async function goto(cdp, url) {
  const loaded = cdp.once('Page.loadEventFired', 10000)
  await cdp.send('Page.navigate', { url })
  await loaded
  // ponytail: tunggu render React; kalau flaky, ganti dengan wait-for-selector
  await sleep(350)
}

// Jendela OS disamakan dengan viewport yang diukur: kalau tidak, yang terlihat
// di layar (jendela klon 500x600) tidak ada hubungannya dengan yang diukur.
// Ukuran asli diingat sekali lalu dipulihkan di akhir — tanpa itu jendela
// pengguna ditinggal melebar di lebar terakhir yang diukur.
let originalBounds = null

async function fitWindow(cdp, width, height) {
  if (!cdp.targetId) return
  try {
    const { windowId } = await cdp.send('Browser.getWindowForTarget', { targetId: cdp.targetId })
    if (!originalBounds) {
      const { bounds } = await cdp.send('Browser.getWindowBounds', { windowId })
      originalBounds = {
        windowId,
        bounds: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
      }
    }
    await cdp.send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'normal', width: width + 40, height: height + 110 },
    })
  } catch {
    // headless / tanpa window: tidak apa-apa
  }
}

/** Kembalikan jendela ke ukuran sebelum gerbang mengukur. */
async function restoreWindow(cdp) {
  if (!originalBounds) return
  try {
    await cdp.send('Browser.setWindowBounds', originalBounds)
  } catch {
    // jendela sudah ditutup / headless
  }
}

// ── pengukuran di halaman ──────────────────────────────────────────────────
const MEASURE = `(async () => {
  const cs = getComputedStyle(document.documentElement)
  const runtime = {
    shellMax: parseFloat(cs.getPropertyValue('--shell-max')) || null,
    touchMin: parseFloat(cs.getPropertyValue('--touch-min')) || null,
    space5: parseFloat(cs.getPropertyValue('--space-5')) || null,
  }
  // Konsol SA (.sa-root) adalah shell-nya sendiri: root flex selebar jendela
  // dengan sidebar + konten, bukan kolom 430px, dan bukan elemen main di
  // dalamnya. Memilih .sa-root di sini membuat pengecualian lebar yang
  // DIDOKUMENTASIKAN (AGENTS bagian 9, decision-irbid-mvp) benar-benar dikenali
  // wideShell di bawah, bukan cuma disebut di komentar.
  const shell = document.querySelector('.sa-root')
    || document.querySelector('.app-shell')
    || document.querySelector('div[class*="-screen"]')
    || document.querySelector('div[class*="-page"]')
    || document.querySelector('main')
    || document.body.firstElementChild
  const sr = shell ? shell.getBoundingClientRect() : { width: 0, x: 0 }
  // Kolom visual = lebar terluar yang masih lebih sempit dari jendela. Di
  // desktop ini frame perangkat (462px), bukan kolom dalam (430px), dan bilah
  // fixed memang boleh selebar frame — yang dilarang menyeberang jendela.
  const col = (() => {
    let el = shell
    let best = { w: Math.round(sr.width), x: Math.round(sr.x) }
    while (el && el.parentElement && el.parentElement !== document.body) {
      el = el.parentElement
      const r = el.getBoundingClientRect()
      if (r.width > best.w && r.width < window.innerWidth - 1) {
        best = { w: Math.round(r.width), x: Math.round(r.x) }
      }
    }
    return best
  })()
  const doc = document.documentElement
  const vis = (el) => {
    const s = getComputedStyle(el)
    if (s.display === 'none' || s.visibility === 'hidden') return false
    const b = el.getBoundingClientRect()
    return b.width > 0 && b.height > 0
  }
  const box = (el) => {
    const b = el.getBoundingClientRect()
    return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), y: Math.round(b.y) }
  }
  const name = (el) => (el.getAttribute('aria-label') || el.innerText || el.className || el.tagName)
    .trim().replace(/\\s+/g, ' ').slice(0, 40)
  // Kelas pertama yang aman dibaca: elemen SVG menyimpan kelas di
  // className.baseVal, sehingga String(el.className) jadi "[object SVGAnimatedString]"
  // dan pesan temuan tak bisa dipakai.
  const cls1 = (el) => {
    const c = typeof el.className === 'string'
      ? el.className
      : (el.className && el.className.baseVal) || ''
    return (String(c).split(' ')[0] || el.tagName)
  }
  // Panel sheet yang terlihat: menempel tepi bawah, punya permukaan sendiri
  // (bukan scrim gelap), lebar >= separuh viewport. Dua butir DNA bergantung
  // padanya, dan keduanya adalah PENGECUALIAN yang ditulis di mobile-dna.md:
  //   MD-03 — sheet adalah satu-satunya scroller bersarang yang sah
  //           ("panel max-height + isi menggulir di dalam").
  //   MD-10 — saat modal menutupi bilah bawah, titik tengah bilah memang
  //           tertutup; memeriksanya di situ menghasilkan temuan palsu.
  const sheetPanels = [...document.querySelectorAll('*')].filter((el) => {
    const s = getComputedStyle(el)
    if (s.display === 'none' || s.visibility === 'hidden') return false
    const b = el.getBoundingClientRect()
    if (b.height < 120 || b.width < window.innerWidth * 0.5) return false
    if (Math.abs(b.bottom - window.innerHeight) > 4) return false
    const mm = s.backgroundColor.match(/rgba?\(([^)]+)\)/)
    const alpha = mm && mm[1].split(',').length === 4 ? parseFloat(mm[1].split(',')[3]) : 1
    if (alpha < 0.5) return false
    // Harus TERIKAT ke tepi bawah lewat leluhur fixed/absolute — kalau tidak,
    // wadah halaman yang kebetulan berakhir di dasar viewport (halaman pendek)
    // ikut terhitung sebagai sheet, dan MD-10 salah dilewati di semua halaman.
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n).position
      if (p === 'fixed' || p === 'absolute') return true
    }
    return false
  })
  const insideSheet = (el) => sheetPanels.some((p) => p === el || p.contains(el))
  // Tiga pengecualian, semuanya elemen yang tidak pernah jadi sasaran jari —
  // bukan pelonggaran aturan. Ditulis di luar blok yang dikirim ke halaman
  // supaya tidak ada backtick/tanda kutip yang mengganggu parser skrip ini.
  //
  //   1. .sr-only dan elemen ber-clip: sengaja 1x1 supaya hanya dibaca pembaca
  //      layar. Memperbesarnya ke 44px justru merusak gunanya.
  //   2. Elemen peta Leaflet: marker digambar di koordinat peta dan ukurannya
  //      bagian dari visual peta, bukan kontrol aplikasi.
  //   3. Apa pun di dalam [aria-hidden="true"]: sudah disembunyikan dari
  //      teknologi bantu, jadi tidak ada tangan yang menggapainya.
  const controls = [...document.querySelectorAll(
    'button, input:not([type=hidden]), select, textarea, [role="radio"], [role="button"], [role="tab"]'
  )].filter(vis).filter((el) => {
    if (el.closest('[aria-hidden="true"]')) return false
    // closest() hanya melihat leluhur; marker Leaflet membawa kelasnya sendiri,
    // jadi diperiksa dua arah.
    if (el.closest('.leaflet-container, .leaflet-pane')) return false
    if (el.className && /(^|\\s)leaflet-/.test(String(el.className))) return false
    const s = getComputedStyle(el)
    if (s.clip !== 'auto' || s.clipPath === 'inset(50%)') return false
    if (el.classList.contains('sr-only') || el.classList.contains('visually-hidden')) return false
    return true
  })
  const smallTargets = controls
    .map((el) => {
      const b = box(el)
      if (b.w >= runtime.touchMin && b.h >= runtime.touchMin) return { label: name(el), ...b }
      // Kotak centang/radio kecil di dalam label: yang benar-benar disentuh
      // adalah labelnya, bukan kotak 18px-nya. Ukur target efektif itu — kalau
      // labelnya cukup besar, kontrolnya memang bisa ditepuk.
      const wrap = el.closest('label')
      if (!wrap) return { label: name(el), ...b }
      const wb = box(wrap)
      return { label: name(el), ...(wb.w >= runtime.touchMin && wb.h >= runtime.touchMin ? wb : b) }
    })
    .filter((b) => b.w < runtime.touchMin || b.h < runtime.touchMin)
  // Dokumen (html/body) memang scroller yang sah — yang dilarang scroller
  // bersarang DI DALAM halaman.
  const scrollers = [...document.querySelectorAll('*')]
    .filter((el) => el !== document.documentElement && el !== document.body)
    .filter((el) => {
      const oy = getComputedStyle(el).overflowY
      return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1
    })
    // MD-03: sheet adalah pengecualian tunggal yang ditulis di mobile-dna.md —
    // daftarnya dibatasi tinggi lalu menggulir DI DALAM panel. Tanpa pengecualian
    // ini, gerbang menghukum pola yang justru diperintahkan DNA.
    .filter((el) => !insideSheet(el))
    .map(name)
  // Hanya elemen selebar bilah yang dinilai; scrim/toast mengambang bukan bilah.
  const fixed = [...document.querySelectorAll('*')]
    .filter((el) => getComputedStyle(el).position === 'fixed' && vis(el))
    .filter((el) => !/overlay|backdrop|scrim|toaster|sheet-overlay/i.test(String(el.className || '')))
    .map((el) => ({ label: name(el), ...box(el) }))
    .filter((f) => f.w >= 200)
  const gutters = [...new Set(
    [...document.querySelectorAll('*')]
      .filter((el) => {
        // Elemen yang disembunyikan tidak menetapkan apa pun di layar. Panel
        // modal ber-visibility hidden tetap punya padding 24px di DOM dan
        // dulu ikut terhitung sebagai gutter halaman, padahal ia tidak terlihat
        // dan bukan bagian dari kontrak tepi halaman.
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false
        const b = el.getBoundingClientRect()
        return Math.abs(b.width - sr.width) < 2 && b.height > 40
          && parseFloat(cs.paddingLeft) > 0
      })
      .map((el) => parseFloat(getComputedStyle(el).paddingLeft))
  )].sort((a, b) => a - b)
  let swCount = 0
  let controlled = false
  let cacheCount = 0
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    swCount = regs.length
    controlled = !!navigator.serviceWorker.controller
  } catch { /* service worker tidak didukung */ }
  try {
    cacheCount = (await caches.keys()).length
  } catch { /* cache storage tidak tersedia */ }
  // Siapa penggulung dokumen ini, dan apakah gulirnya benar-benar berangkat
  // dari atas. Dipakai untuk membuktikan satu hal yang tidak bisa dilihat dari
  // sumber: aturan "dokumen satu-satunya penggulung" (_app-shell.scss) plus
  // "gulir selalu mulai dari atas" berlaku di SEMUA halaman.
  //
  // scrollTop di sini diukur SESUDAH navigasi ke rute baru, jadi angka != 0
  // berarti posisi gulir warisan yang bocor antar halaman.
  const scroll = (() => {
    const html = document.documentElement
    const body = document.body
    const oy = (el) => getComputedStyle(el).overflowY
    const isC = (el) => (oy(el) === 'auto' || oy(el) === 'scroll')
      && el.scrollHeight > el.clientHeight + 1
    return {
      htmlScrollTop: Math.round(html.scrollTop),
      bodyScrollTop: Math.round(body.scrollTop),
      bodyIsScroller: isC(body),
      htmlIsScroller: isC(html),
      // Bila body yang menggulir, dokumen benar-benar tidak bisa menggulir:
      // gulirnya nyangkut di body dan window.scrollTo tidak berpengaruh.
      htmlScrollable: html.scrollHeight > html.clientHeight + 1,
      docScrollTop: Math.round(window.scrollY),
      // Permukaan yang memang dibuka di konten terbaru (thread chat). Gulirnya
      // disengaja, bukan warisan halaman sebelumnya — lihat MD-03.
      openAtLatest: !!document.querySelector('[data-open-at="latest"]'),
    }
  })()

  // Bukti override safe-area benar-benar berlaku: baca env() yang sama yang  // dipakai stylesheet (part-01/part-06 hanya aktif saat standalone).
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;'
    + 'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)'
  document.body.appendChild(probe)
  const ps = getComputedStyle(probe)
  const safe = { top: parseFloat(ps.paddingTop) || 0, bottom: parseFloat(ps.paddingBottom) || 0 }
  probe.remove()

  // ── butir DNA yang hanya terbukti dari DOM (MD-06/07/10/11) ──────────────
  // Sebelum ini gerbang cuma mengukur lebar kolom dan target sentuh, jadi ia
  // meloloskan hal yang justru dilihat pemilik: rel kanan baris daftar yang
  // bergerigi, panel sheet yang melar, nominal yang tidak sebaris judul. Tiap
  // temuan menyebut ID DNA-nya supaya laporan langsung menunjuk aturannya.
  const dnaFaults = []
  // MD-11 — elemen ber-kelas .list-row adalah MARKER baris daftar (primitif
  // src/styles/system/_list-row.scss). Baris sejenis dikelompokkan per induk,
  // lalu lebar kolom 1-nya harus SATU nilai: dengan rel "auto", track pertama
  // mengikuti isi tiap baris dan batas kolomnya bergerigi (nyata: 268/277).
  const lrGroups = new Map()
  for (const el of document.querySelectorAll('.list-row')) {
    if (!vis(el) || !el.parentElement) continue
    const k = cls1(el.parentElement)
    if (!lrGroups.has(k)) lrGroups.set(k, [])
    lrGroups.get(k).push(el)
  }
  for (const [k, rows] of lrGroups) {
    if (rows.length < 2) continue
    const col1 = [...new Set(rows.map(
      (r) => Math.round(parseFloat(getComputedStyle(r).gridTemplateColumns.split(' ')[0]) || 0),
    ))]
    if (col1.length > 1) {
      dnaFaults.push('MD-11 rel kolom-1 bergeser antar baris (induk .' + k + '): ' + col1.join('/') + 'px')
    }
    const heights = new Map()
    for (const r of rows) {
      const kids = [...r.children]
      for (const c of kids) {
        const cs = getComputedStyle(c)
        const key = cs.gridColumnStart + '/' + cs.gridRowStart + '/' + String(c.className).split(' ')[0]
        if (!heights.has(key)) heights.set(key, new Set())
        heights.get(key).add(Math.round(c.getBoundingClientRect().height))
      }
      // MD-07 — nominal (kolom 2 baris 1) rata kanan dan sebaris judul.
      const title = kids.find((c) => getComputedStyle(c).gridColumnStart === '1'
        && getComputedStyle(c).gridRowStart === '1')
      const sum = kids.find((c) => getComputedStyle(c).gridColumnStart === '2'
        && getComputedStyle(c).gridRowStart === '1')
      if (title && sum) {
        const tb = title.getBoundingClientRect()
        const sb = sum.getBoundingClientRect()
        const d = Math.round((tb.top + tb.height / 2) - (sb.top + sb.height / 2))
        if (Math.abs(d) > 2.5) {
          dnaFaults.push('MD-07 nominal tidak sebaris judul (.list-row): selisih ' + d + 'px')
        }
        if (getComputedStyle(sum).justifySelf !== 'end') {
          dnaFaults.push('MD-07 nominal tidak rata kanan (.list-row)')
        }
      }
    }
    for (const [key, hs] of heights) {
      if (hs.size > 1) {
        dnaFaults.push('MD-11 tinggi ' + key + ' tidak seragam: ' + [...hs].join('/') + 'px (teks membungkus?)')
      }
    }
  }
  // MD-10 — titik tengah bilah bawah harus bilahnya sendiri: posisinya ditanya
  // ke DOM, bukan ditebak dari pathname (pernah menimpa bilah di /merchant/:id).
  // Dilewati saat sheet terbuka: modal memang menutupi bilahnya, jadi memeriksa
  // di situ bukan temuan.
  const nav = sheetPanels.length ? null : [...document.querySelectorAll('[class*="bottom-nav"]')].find(vis)
  const hasNav = !!nav
  if (nav) {
    const nb = nav.getBoundingClientRect()
    const hit = document.elementFromPoint(
      Math.round(nb.left + nb.width / 2),
      Math.round(nb.top + nb.height / 2),
    )
    if (!hit || !(hit === nav || nav.contains(hit))) {
      dnaFaults.push('MD-10 titik tengah bilah bawah tertutup: '
        + (hit ? String(hit.className || hit.tagName).slice(0, 40) : 'null'))
    }
  }
  // MD-06 — panel yang menempel tepi bawah dan punya permukaan sendiri (bukan
  // scrim gelap) tidak boleh melewati ~60% viewport; lebih dari itu ia berhenti
  // menjadi sheet dan berubah jadi halaman yang menutupi layar.
  const vh = window.innerHeight
  for (const el of sheetPanels) {
    const pct = Math.round((el.getBoundingClientRect().height / vh) * 100)
    if (pct > 60) {
      dnaFaults.push('MD-06 panel bawah ' + pct + '% viewport (>60%): ' + cls1(el))
    }
  }
  // MD-12 — konten tak boleh keluar dari kotak induknya, dan tak boleh terpotong
  // diam-diam. Gerbang lama cuma melihat overflow tingkat HALAMAN
  // (documentElement), sehingga baris badge yang dipangkas overflow: clip di
  // level shell lolos tanpa suara — persis "ada yang keluar dari card".
  const skipBox = (el) => {
    if (el.closest('[aria-hidden="true"]')) return true
    const s = getComputedStyle(el)
    if (s.display === 'none' || s.visibility === 'hidden') return true
    if (el.classList.contains('sr-only') || el.classList.contains('visually-hidden')) return true
    if (el.closest('.leaflet-container, .leaflet-pane')) return true
    if (s.clipPath === 'inset(50%)') return true
    return false
  }
  // Permukaan app = tiga peran PWA + konsol backoffice. Landing dan /documentation
  // adalah website penuh yang didokumentasikan bukan app (navigateFallbackDenylist),
  // jadi kontrak DNA mobile (kolom 430px, target sentuh, kotak kartu) tidak
  // berlaku di sana. Yang tetap berlaku di semua halaman: overflow-x + penggulung.
  const appRoute = ['/customer/', '/merchant/', '/courier/', '/ops/', '/superadmin/']
    .some((p) => location.pathname === p.slice(0, -1) || location.pathname.startsWith(p))
  const boxFail = []
  if (appRoute) {
  // Rail geser (carousel): induk yang menghela dua anak atau lebih selebar
  // hampir-penuh ke samping memang sengaja lebih lebar dari kotaknya, dan itu
  // pola sah (banner /customer/signin). Kalau tidak dikecualikan, carousel jadi
  // temuan palsu dan gerbangnya berisik.
  const isRail = (el) => {
    const kids = [...el.children].filter((c) => c.getBoundingClientRect().width > 0)
    if (kids.length < 2) return false
    const pw = el.getBoundingClientRect().width
    if (pw <= 0) return false
    return kids.filter((c) => c.getBoundingClientRect().width >= pw * 0.8).length >= 2
  }
  const containsRail = (el) => {
    if (isRail(el)) return true
    for (const c of el.querySelectorAll('*')) {
      if (isRail(c)) return true
    }
    return false
  }
  const hasControl = (el) => !!el.querySelector('button, a[href], input, select, textarea, [role="button"]')
  // (a) TERPOTONG — kotak memangkas isinya (hidden/clip). Kalau yang terpotong
  // sebuah KONTROL, itu isi yang hilang, selalu FAIL. Art dekoratif yang
  // dipangkas (kartu, preview) memang begitu desainnya, dan text-overflow:
  // ellipsis sengaja memangkas, jadi keduanya bukan temuan.
  for (const el of document.querySelectorAll('body *')) {
    if (skipBox(el)) continue
    const s = getComputedStyle(el)
    if (s.overflowX !== 'hidden' && s.overflowX !== 'clip') continue
    if (s.textOverflow === 'ellipsis') continue
    const over = el.scrollWidth - el.clientWidth
    if (over <= 1 || el.clientWidth <= 0) continue
    if (!hasControl(el) || containsRail(el)) continue
    boxFail.push('MD-12 isi terpotong ' + over + 'px: .' + cls1(el))
  }
  // (b) KELUAR KOTAK — anak melewati content-box induk yang overflow-nya
  // terlihat. Selalu FAIL: isinya benar-benar lari keluar dari kotaknya (nyata:
  // .merchant-ticket-stub-end meluber 89px lalu dipangkas clip di level shell;
  // label nav ops melebar 9px). Bleed sengaja (header margin negatif,
  // dekorasi position absolute) dan rail geser dilewati.
  for (const el of document.querySelectorAll('body *')) {
    if (skipBox(el)) continue
    const p = el.parentElement
    if (!p) continue
    const ps = getComputedStyle(p)
    if (ps.overflowX !== 'visible') continue
    if (isRail(p)) continue
    const s = getComputedStyle(el)
    if (parseFloat(s.marginLeft) < 0 || parseFloat(s.marginRight) < 0) continue
    if (s.position === 'absolute' || s.position === 'fixed') continue
    const r = el.getBoundingClientRect()
    if (r.width === 0) continue
    const pr = p.getBoundingClientRect()
    const innerLeft = pr.left + parseFloat(ps.paddingLeft)
    const innerRight = pr.right - parseFloat(ps.paddingRight)
    const overR = r.right - innerRight
    const overL = innerLeft - r.left
    if (overR > 2.5 || overL > 2.5) {
      const d = Math.round(Math.max(overR, overL))
      // Sebut kalau ada leluhur yang memangkasnya: itu yang membuat isinya
      // benar-benar HILANG, bukan sekadar menonjol.
      let clipper = null
      for (let n = p; n; n = n.parentElement) {
        const ns = getComputedStyle(n)
        if (ns.overflowX !== 'hidden' && ns.overflowX !== 'clip') continue
        const nb = n.getBoundingClientRect()
        const nl = nb.left + parseFloat(ns.paddingLeft)
        const nr = nb.right - parseFloat(ns.paddingRight)
        if (r.right > nr + 0.5 || r.left < nl - 0.5) { clipper = cls1(n); break }
      }
      boxFail.push('MD-12 keluar kotak ' + d + 'px: .' + cls1(el) + ' di dalam .' + cls1(p)
        + (clipper ? ' (dipangkas .' + clipper + ')' : ''))
    }
  }
  }

  // Konten teratas harus turun melewati inset status bar di jendela app-mode;
  // kalau tidak, judulnya tertutup jam/baterai OS atau kamera punch-hole.
  //
  // Diukur dari dua sisi, sebab header saja tidak cukup: ada halaman yang
  // konten teratasnya bukan kelas -header sama sekali (judul, hero, baris chip).
  // Versi lama hanya memeriksa header sticky dan melewatkan sisanya tanpa
  // suara — gerbang lolos padahal di perangkat kontennya menabrak kamera.
  //   1. tepi anak pertama header sticky teratas (padding header yang menyerap
  //      inset, bukan wadah halaman)
  //   2. elemen berteks paling atas di dalam shell (daun teks, bukan wadah)
  const headerTop = (() => {
    const stickyHeaders = [...document.querySelectorAll('[class*="-header"]')]
      .filter((el) => getComputedStyle(el).position === 'sticky' && vis(el))
    return stickyHeaders.length
      ? Math.min(...stickyHeaders.map((el) => {
          const f = el.firstElementChild
          return Math.round((f || el).getBoundingClientRect().top)
        }))
      : null
  })()
  let textTop = null
  let textWho = null
  for (const el of document.querySelectorAll('body *')) {
    if (el.children.length || !vis(el)) continue
    if (el.closest('[aria-hidden="true"], [class*="toaster"], [class*="overlay"], [class*="backdrop"]')) continue
    if (!(el.textContent || '').trim()) continue
    const t = Math.round(el.getBoundingClientRect().top)
    if (textTop === null || t < textTop) {
      textTop = t
      // Sertakan satu leluhur: cukup untuk menebak halaman/komponennya tanpa
      // membuka DOM, dan itu yang dibutuhkan saat gerbang melaporkan temuan.
      const parent = String((el.parentElement && (el.parentElement.className || el.parentElement.tagName)) || '').slice(0, 30)
      textWho = (String(el.className || el.tagName).slice(0, 30) + ' < ' + parent).slice(0, 64)
    }
  }
  const topContent = headerTop === null
    ? textTop
    : textTop === null ? headerTop : Math.min(headerTop, textTop)
  const topWho = textTop !== null && (headerTop === null || textTop < headerTop)
    ? textWho
    : 'anak header sticky'

  // Bar halaman teratas: kelas, tinggi, tepi atas. Dipakai untuk membuktikan
  // tinggi bar satu nilai (--nav-height) di semua halaman, dan bahwa bar
  // fixed benar-benar mulai dari tepi atas di app-mode. Hanya bilah yang
  // menempel (sticky/fixed), selebar kolom, dan berlatar tidak tembus
  // pandang — jadi bar mengambang di atas foto/map tidak ikut terukur.
  const topbar = (() => {
    const bars = [...document.querySelectorAll('[class*="-header"]')].filter((el) => {
      if (!vis(el)) return false
      const p = getComputedStyle(el).position
      if (p !== 'sticky' && p !== 'fixed') return false
      const r = el.getBoundingClientRect()
      if (r.width < sr.width * 0.9) return false
      const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/)
      if (m && m[1].split(',').length === 4 && parseFloat(m[1].split(',')[3]) === 0) return false
      return true
    })
    if (!bars.length) return null
    bars.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    const el = bars[0]
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      cls: cls1(el).slice(0, 32),
      h: Math.round(r.height),
      top: Math.round(r.top),
      pad: [Math.round(parseFloat(cs.paddingTop)), Math.round(parseFloat(cs.paddingBottom))],
      minH: Math.round(parseFloat(cs.minHeight)) || 0,
    }
  })()

  // Manifest yang BENAR-BENAR dibaca peramban di halaman ini. Aturan produk:
  // hanya tiga prefix peran yang boleh punya manifest. Rute lain (landing,
  // /documentation, /ops, /superadmin) harus null — kalau tidak, peramban menawarkan
  // pasang untuk halaman yang bukan app, dan scope manifestnya bisa menelan
  // prefix peran. Diukur dari DOM, bukan dari komentar atau niat.
  const manifestHref = (() => {
    const link = document.querySelector('link[rel=manifest]')
    return link ? link.getAttribute('href') : null
  })()

  return {
    path: location.pathname,
    // Permukaan app = empat peran PWA + konsol SA. Landing dan /documentation
    // adalah website penuh yang didokumentasikan bukan app
    // (navigateFallbackDenylist), jadi kontrak DNA mobile — kolom 430px, target
    // sentuh, kotak kartu — tidak berlaku di sana. Yang tetap berlaku di semua
    // halaman: overflow-x dan aturan penggulung.
    appRoute,
    manifestHref,
    runtime,
    topbar,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    pwa: {
      displayMode: matchMedia('(display-mode: fullscreen)').matches
        ? 'fullscreen'
        : matchMedia('(display-mode: standalone)').matches
          ? 'standalone'
          : matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : 'browser',
      touchEvents: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints,
      swCount,
      controlled,
      cacheCount,
      safe,
      headerTop: topContent,
      topWho,
    },
    shell: { w: Math.round(sr.width), x: Math.round(sr.x) },
    // Pengecualian lebar yang DIDOKUMENTASIKAN: konsol desktop (ops + SA
    // .sa-root) sengaja tidak memakai kolom 430px di layar lebar
    // (decision-ops-canonical.md). Gerbang membacanya dari DOM supaya aturan
    // kolom tetap berlaku untuk peran lain dan untuk konsol ini di bawah 901px.
    wideShell: !!(shell && shell.classList
      && shell.classList.contains('sa-root')),
    col,
    overflowX: doc.scrollWidth - doc.clientWidth,
    controls: controls.length,
    smallTargets,
    scrollers,
    scroll,
    fixed,
    gutters,
    crashed: !!document.querySelector('[data-app-error], .app-error-boundary, [data-error-boundary]'),
    textLen: document.body.innerText.trim().length,
    // Butir DNA yang diukur di DOM. warn = MD-06 (ambang rasa, bukan batas
    // keras): panel 61% masih mungkin disengaja, dan --strict yang memutuskan.
    dna: {
      fail: [...new Set([
        ...dnaFaults.filter((m) => !m.startsWith('MD-06')),
        ...boxFail,
      ])].slice(0, 8),
      warn: [...new Set(dnaFaults.filter((m) => m.startsWith('MD-06')))].slice(0, 4),
      // Butir yang preconditions-nya tidak ada di halaman ini (tidak ada baris
      // daftar, tidak ada sheet, tidak ada bilah bawah) tidak boleh dicetak "✓":
      // itu mengklaim lolos untuk hal yang tidak pernah diperiksa.
      checked: appRoute ? {
        'MD-06': sheetPanels.length > 0,
        'MD-10': hasNav,
        'MD-11': lrGroups.size > 0,
        'MD-12': true,
      } : {},
    },
  }
})()`

const SCROLL_AUDIT = `(() => {
  const html = document.documentElement
  const body = document.body
  const oy = (el) => getComputedStyle(el).overflowY
  const scrollable = (el) => {
    const o = oy(el)
    return (o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1
  }
  // Siapa saja yang menggulir selain dokumen. Kosong = kontrak terjaga.
  const scrollableBy = [...document.querySelectorAll('body *')]
    .filter((el) => scrollable(el))
    .map((el) => String(el.className || el.tagName).split(' ')[0].slice(0, 28))
  return {
    scrollY: Math.round(window.scrollY),
    htmlScrollTop: Math.round(html.scrollTop),
    bodyScrollTop: Math.round(body.scrollTop),
    bodyIsScroller: scrollable(body),
    htmlIsScroller: scrollable(html),
    htmlScrollable: html.scrollHeight > html.clientHeight + 1,
    maxScroll: Math.max(0, html.scrollHeight - html.clientHeight),
    bodyH: Math.round(body.getBoundingClientRect().height),
    docH: html.scrollHeight,
    scrollableBy: [...new Set(scrollableBy)].slice(0, 6),
  }
})()`

const SIGNATURE = `(() => {  const el = document.activeElement
  return [location.href, document.body.innerText.length, document.querySelectorAll('*').length,
    el ? el.tagName + (el.getAttribute('aria-label') || '') : ''].join('|')
})()`

const VIS = `const vis = (el) => {
  const s = getComputedStyle(el)
  if (s.display === 'none' || s.visibility === 'hidden') return false
  const b = el.getBoundingClientRect()
  return b.width > 0 && b.height > 0
}`

const CLICKABLE = 'button, a[href], [role="radio"], [role="button"]'

// Kontrol nonaktif tidak diklik (memang tidak boleh berefek) — dilaporkan
// terpisah sebagai "dilewati", bukan sebagai klik mati.
const CLICKABLE_VIS = `${VIS}
// Tombol yang keluar app (WA/tel/mail/sms) tidak dites: kliknya memicu dialog
// protokol eksternal atau navigasi keluar yang menggantung CDP tanpa balasan.
const externalNav = (el) => {
  const href = el.getAttribute('href') || ''
  if (el.getAttribute('target') === '_blank') return true
  if (/^(tel:|mailto:|sms:|whatsapp:)/i.test(href)) return true
  return /wa\\.me|whatsapp\\.com|api\\.whatsapp\\.com/i.test(href)
}
const clickable = () => [...document.querySelectorAll('${CLICKABLE}')]
  .filter(vis)
  .filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true')
  .filter((el) => !externalNav(el))`

const TARGETS = `(() => { ${CLICKABLE_VIS}
  const all = [...document.querySelectorAll('${CLICKABLE}')].filter(vis)
  const items = clickable()
  return {
    skipped: all.length - items.length,
    items: items.map((el) => ({
      tag: el.tagName,
      label: (el.getAttribute('aria-label') || el.innerText || el.tagName)
        .trim().replace(/\\s+/g, ' ').slice(0, 40),
      href: el.getAttribute('href'),
    })),
  }
})()`

// Target dicocokkan lewat identitas (tag + label + href), bukan indeks: sweep ini
// mengklik dan mengubah state (mis. tombol "−" pada kuantitas 1 menghapus baris
// keranjang), sehingga indeks bergeser dan label yang dilaporkan jadi milik
// elemen lain.
const AIM = (t) => `(() => { ${CLICKABLE_VIS}
  const want = ${JSON.stringify(t)}
  const norm = (s) => (s || '').trim().replace(/\\s+/g, ' ').slice(0, 40)
  const el = clickable().find((e) =>
    e.tagName === want.tag &&
    norm(e.getAttribute('aria-label') || e.innerText || e.tagName) === want.label &&
    (e.getAttribute('href') || null) === (want.href || null))
  if (!el) return null
  // behavior 'instant' penting: html memakai smooth scroll, jadi
  // scrollIntoView mengembalikan posisi lama kalau animasinya belum jalan.
  // Rail horizontal (mis. kupon) jadi dilaporkan OVERLAY padahal cuma belum
  // tergeser. Klik nyata tetap di titik tengah setelah elemen benar-benar pas.
  el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
  const b = el.getBoundingClientRect()
  const cx = Math.round(b.x + b.width / 2)
  const cy = Math.round(b.y + b.height / 2)
  const hit = document.elementFromPoint(cx, cy)
  return {
    cx, cy,
    hitSelf: !!hit && (hit === el || el.contains(hit) || hit.contains(el)),
    hitWhat: hit ? String(hit.className || hit.tagName).slice(0, 50) : null,
  }
})()`

// ── perbandingan: sumber vs runtime ────────────────────────────────────────
function judge(measured, tokens, strict, viewportWidth) {
  const fail = []
  const warn = []
  const push = (bucket, msg) => bucket.push(msg)
  // Kolom = lebar viewport kalau viewport lebih sempit dari --shell-max.
  // Konsol desktop yang terdokumentasi (sa-root) melebar penuh di
  // ≥901px, jadi harapannya = lebar viewport, bukan 430px.
  const wide = measured.wideShell && viewportWidth >= 901
  const expectedShell = tokens.shellMax
    ? wide ? viewportWidth : Math.min(viewportWidth, tokens.shellMax)
    : null

  if (measured.crashed) push(fail, 'error boundary tampil (halaman crash)')
  if (measured.textLen === 0) push(fail, 'halaman kosong (tidak ada teks)')
  // Mode PWA murni: yang tidak bisa dibuktikan emulasi CSS — display-mode,
  // touch event, service worker, dan safe-area — harus benar-benar berlaku.
  if (OPTS.pwa) {
    if (measured.pwa.displayMode !== 'standalone') {
      push(fail, `display-mode "${measured.pwa.displayMode}" != standalone (bukan jendela app-mode)`)
    }
    if (!measured.pwa.touchEvents) push(fail, 'touch event tidak aktif (butuh --touch-events=enabled)')
    if (measured.pwa.swCount === 0) push(fail, 'service worker tidak terdaftar (harus diukur pada hasil build)')
    if (!measured.pwa.controlled) push(fail, 'service worker tidak mengendalikan halaman')
    // SW bisa terdaftar & mengendalikan tapi tidak menyimpan apa pun kalau
    // precache-nya gagal (mis. add-to-cache-list-conflicting-entries) — dan
    // kegagalan itu ditelan diam-diam.
    if (measured.pwa.cacheCount === 0) {
      push(fail, 'tidak ada cache sama sekali: precache workbox gagal, offline tidak akan jalan')
    }
    if (Math.abs(measured.pwa.safe.top - OPTS.insetTop) > 1) {
      push(fail, `safe-area atas ${measured.pwa.safe.top}px != ${OPTS.insetTop}px yang diset`)
    }
    if (Math.abs(measured.pwa.safe.bottom - OPTS.insetBottom) > 1) {
      push(fail, `safe-area bawah ${measured.pwa.safe.bottom}px != ${OPTS.insetBottom}px yang diset`)
    }
    // Konten teratas tidak boleh tertutup status bar OS atau kamera punch-hole.
    // Inset di atas cuma berguna kalau ada elemen yang benar-benar menyerapnya.
    if (measured.pwa.headerTop !== null && measured.pwa.headerTop < measured.pwa.safe.top - 1) {
      push(
        warn,
        `konten teratas terpotong status bar: tepi ${measured.pwa.headerTop}px < safe-area ${measured.pwa.safe.top}px (${measured.pwa.topWho})`,
      )
    }
  }
  // Manifest: hanya tiga prefix peran yang boleh punya. Kalau rute non-app
  // mendapat manifest, peramban menawarkan pasang di halaman yang bukan app —
  // dan manifest ber-scope "/" bahkan menelan seluruh prefix peran. Gerbang
  // ini yang menahannya kalau `index.html` kembali memasang manifest statis.
  if (measured.manifestHref) {
    const rolePath = measured.path.match(/^\/(customer|merchant|courier)(\/|$)/)
    if (!rolePath) {
      push(fail, `manifest di rute non-app: ${measured.path} memakai ${measured.manifestHref}`)
    } else if (measured.manifestHref !== `/manifest-${rolePath[1]}.json`) {
      push(
        fail,
        `manifest salah untuk ${measured.path}: ${measured.manifestHref} != /manifest-${rolePath[1]}.json`,
      )
    }
  }

  // Tinggi bar halaman satu nilai (DNA baris 20: tinggi minimum --nav-height).
  // Sebelum kontrak `_topbar.scss` terukur 60/64/76px menurut halaman. Di
  // app-mode tingginya bar + inset, jadi lantainya tetap token ini.
  if (measured.topbar && tokens.navHeight && measured.topbar.h < tokens.navHeight - 1) {
    push(
      warn,
      `bar halaman ${measured.topbar.h}px < --nav-height ${tokens.navHeight}px (${measured.topbar.cls})`,
    )
  }

  // Buktikan emulasi benar-benar berlaku. Mengukur di jendela klon (500px)
  // pernah menghasilkan angka yang tidak ada hubungannya dengan app.
  if (Math.abs(measured.viewport.w - viewportWidth) > 1) {
    push(fail, `viewport ${measured.viewport.w}px != emulasi ${viewportWidth}px (angka tidak sah)`)
  }
  for (const key of ['shellMax', 'touchMin', 'space5']) {
    if (tokens[key] !== null && measured.runtime[key] !== tokens[key]) {
      push(fail, `MD-01 token --${key} runtime ${measured.runtime[key]} != sumber ${tokens[key]}px`)
    }
  }
  if (expectedShell && measured.appRoute && Math.abs(measured.shell.w - expectedShell) > 1) {
    push(fail, `MD-01 lebar kolom ${measured.shell.w}px != ${expectedShell}px (min(viewport, --shell-max))`)
  }
  if (measured.overflowX !== 0) push(fail, `MD-01 overflow-x ${measured.overflowX}px (harus 0)`)
  if (measured.scrollers.length && measured.appRoute) {
    push(fail, `MD-03 scroller bersarang: ${measured.scrollers.join(', ')}`)
  }

  // Gulir harus berangkat dari atas di setiap halaman baru, dan penggulungnya
  // tetap dokumen. Dua hal berbeda:
  //   - `bodyIsScroller` benar = kontrak `_app-shell.scss` bocor (stylesheet
  //     porting memasang overflow non-visible ke body), dan window.scrollTo
  //     jadi tidak berpengaruh sama sekali.
  //   - `docScrollTop != 0` = posisi gulir warisan dari halaman sebelumnya.
  //     React Router tidak mereset gulir, jadi tanpa ini halaman baru bisa
  //     terbuka tepat di tengah — persis keluhan "harus scroll ke atas sendiri".
  if (measured.scroll) {
    if (measured.scroll.bodyIsScroller && !measured.scroll.htmlIsScroller) {
      push(fail, 'MD-03 body jadi scroll container: window.scrollTo tidak berpengaruh (lihat _app-shell.scss)')
    }
    if (measured.scroll.docScrollTop !== 0 && !measured.scroll.openAtLatest) {
      push(
        warn,
        `MD-03 gulir tidak mulai dari atas: scrollY ${measured.scroll.docScrollTop}px saat halaman dibuka`,
      )
    }
  }

  // Invarian bilah fixed: tidak menyeberang keluar kolom visual.
  if (measured.appRoute) {
    for (const f of measured.fixed) {
      const left = measured.col.x - 2
      const right = measured.col.x + measured.col.w + 2
      if (f.x < left || f.x + f.w > right) {
        push(warn, `MD-02 fixed keluar kolom: "${f.label}" ${f.w}px @x${f.x} (kolom ${measured.col.w}px @x${measured.col.x})`)
      }
    }
    for (const t of measured.smallTargets) {
      push(warn, `MD-05 target < --touch-min ${tokens.touchMin}px: "${t.label}" ${t.w}x${t.h}`)
    }
  }
  const badGutters = measured.gutters.filter((g) => tokens.space5 && g !== tokens.space5)
  if (badGutters.length && measured.appRoute) {
    push(warn, `MD-01 gutter != --space-5 (${tokens.space5}px): ${badGutters.join('px, ')}px`)
  }
  // Butir DNA yang diukur langsung di DOM (MD-06/07/10/11/12).
  if (measured.appRoute) {
    for (const m of measured.dna?.fail || []) push(fail, m)
    for (const m of measured.dna?.warn || []) push(warn, m)
  }

  if (strict) return { fail: [...fail, ...warn], warn: [] }
  return { fail, warn }
}

// ── klik nyata ─────────────────────────────────────────────────────────────
async function clickSweep(cdp, url, errors, log) {
  await goto(cdp, url)
  const found = (await evaluate(cdp, TARGETS)) || { items: [], skipped: 0 }
  const targets = found.items
  const limit = Math.min(targets.length, OPTS.clickLimit)
  log(`  klik nyata: ${limit}/${targets.length} elemen${found.skipped ? ` (${found.skipped} nonaktif dilewati)` : ''}`)

  let vanished = 0
  for (let i = 0; i < limit; i++) {
    const t = targets[i]
    await goto(cdp, url)
    const aim = await evaluate(cdp, AIM(t))
    if (!aim) {
      // Tidak ada di muat segar = sweep sebelumnya mengubah state, bukan bug.
      vanished++
      continue
    }
    if (!aim.hitSelf) {
      errors.push(`"${t.label}": OVERLAY — titik tengah tertutup oleh ${aim.hitWhat}`)
      continue
    }
    const before = await evaluate(cdp, SIGNATURE)
    const drain = cdp.on((m) => {
      if (m.method === 'Runtime.exceptionThrown') {
        errors.push(`"${t.label}": exception — ${m.params.exceptionDetails?.exception?.description?.slice(0, 120)}`)
      }
    })

    if (OPTS.pwa) {
      // Jari sungguhan: satu urutan tap di dalam satu sesi CDP.
      const pt = { x: aim.cx, y: aim.cy, radiusX: 12, radiusY: 12, force: 1, id: 1 }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] })
      await sleep(60)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [pt] })
    } else {
      for (const type of ['mousePressed', 'mouseReleased']) {
        await cdp.send('Input.dispatchMouseEvent', {
          type,
          x: aim.cx,
          y: aim.cy,
          button: 'left',
          buttons: type === 'mousePressed' ? 1 : 0,
          clickCount: 1,
        })
      }
    }
    await sleep(450)
    const after = await evaluate(cdp, SIGNATURE)
    drain()

    if (before === after) log(`    ${C.yellow}~${C.off} tanpa efek terlihat: "${t.label}"`)
    const crashed = await evaluate(cdp, `!!document.querySelector('[data-app-error], .app-error-boundary')`)
    if (crashed) errors.push(`"${t.label}": klik memicu error boundary`)
  }
  if (vanished) {
    log(`    ${C.yellow}~${C.off} ${vanished} elemen hilang setelah klik sebelumnya (dilewati)`)
  }
}

// ── laporan per pengukuran ─────────────────────────────────────────────────
/** Cetak satu verdict: baris status, temuan, dan checklist butir DNA. */
function printVerdict(label, verdict, errors, measured) {
  const bad = verdict.fail.length + errors.length
  const mark = bad ? `${C.red}FAIL${C.off}` : verdict.warn.length ? `${C.yellow}WARN${C.off}` : `${C.green}PASS${C.off}`
  const pwaInfo = OPTS.pwa ? ` · ${measured.pwa.displayMode} · sw ${measured.pwa.swCount}${measured.pwa.controlled ? '/ctrl' : ''}` : ''
  const barInfo = measured.topbar ? ` · bar ${measured.topbar.h}px ${measured.topbar.cls}` : ''
  const sc = measured.scroll
  const scrollInfo = sc ? ` · gulir ${sc.docScrollTop}px${sc.bodyIsScroller ? ' body=scroller' : ''}` : ''
  logLine(
    `  ${mark} ${label}  ${C.dim}inner ${measured.viewport.w}px · shell ${measured.shell.w}px` +
      ` · overflow ${measured.overflowX}px · ${measured.controls} kontrol${barInfo}${scrollInfo}${pwaInfo}${C.off}`,
  )
  for (const m of verdict.fail) logLine(`      ${C.red}✗${C.off} ${m}`)
  for (const m of errors) logLine(`      ${C.red}✗${C.off} ${m}`)
  for (const m of verdict.warn.slice(0, 6)) logLine(`      ${C.yellow}!${C.off} ${m}`)
  if (verdict.warn.length > 6) logLine(`      ${C.dim}+${verdict.warn.length - 6} peringatan lain${C.off}`)
  // Bukti cek mana yang benar-benar jalan: tanpa baris ini, butir DNA yang tidak
  // punya cek tampak "lolos" padahal tidak pernah diperiksa.
  const seen = [...verdict.fail, ...verdict.warn].join(' ')
  const checked = measured.dna?.checked || {}
  if (!measured.appRoute) {
    logLine(`      ${C.dim}DNA dilewati: ${measured.path} bukan permukaan app (website penuh, bukan shell PWA) · yang tetap diperiksa: overflow-x${C.off}`)
    return
  }
  logLine(
    `      ${C.dim}DNA ${DNA_IDS_GATE.map((id) => {
      if (checked[id] === false) return `${id}—`
      return `${id}${seen.includes(id) ? '✗' : '✓'}`
    }).join(' ')} · MD-04/MD-08/MD-09 lewat npm run scan + review` +
      `${DNA_IDS_GATE.some((id) => checked[id] === false) ? ' · "—" = tak ada yang diperiksa di halaman ini' : ''}${C.off}`,
  )
}

/**
 * Tunggu halaman "diam" sebelum diukur. Data daftar mendarat dari BE SETELAH
 * render pertama; mengukur terlalu cepat = mengukur layar loading, dan gerbang
 * melaporkan "lolos" untuk DOM yang belum ada (nyata: kartu /merchant/orders
 * belum ter-render saat diukur, sehingga temuan overflow mana pun lolos).
 * Dua sampel berturut-turut sama = render stabil.
 */
async function settlePage(cdp, stableNeeded = 3, tries = 20) {
  // Kerangka loading juga "diam", jadi kehadiran `aria-busy` harus jadi bagian
  // dari sidik: tanpa ini tiga sampel stabil berturut-turut bisa berarti halaman
  // masih memuat data (terukur: /merchant lolos dengan 0 kontrol).
  const sig = `(() => {
    const busy = document.querySelector('[aria-busy="true"]') ? 'busy|' : ''
    const root = document.getElementById('root')
    const mounted = root && root.childElementCount > 0 ? '' : 'unmounted|'
    return busy + mounted + document.body.innerText.length + '|' + document.querySelectorAll('*').length
  })()`
  let prev = null
  let same = 0
  for (let i = 0; i < tries; i++) {
    const now = await evaluate(cdp, sig)
    if (process.env.GATE_DEBUG) process.stderr.write(`[settle] ${now}\n`)
    // Kerangka dan root kosong bukan halaman: sampel yang identik di kondisi itu
    // tetap "diam", jadi jangan pernah dihitung sebagai stabil.
    if (now.startsWith('busy|') || now.startsWith('unmounted|')) {
      prev = null
      same = 0
      await sleep(350)
      continue
    }
    // Butuh BEBERAPA sampel sama berturut-turut, bukan dua: layar loading pun
    // "diam" selama ratusan milidetik, dan dua sampel sebelum data mendarat
    // membuat gerbang mengukur kerangka, bukan halaman.
    same = now === prev ? same + 1 : 0
    prev = now
    if (same >= stableNeeded) return
    await sleep(350)
  }
}

/**
 * Buka panel mengambang lewat klik NYATA (bukan `el.click()`) kalau rute ini
 * punya bilah pemicunya. Dipakai agar MD-06/07/11 diukur di panel terbuka —
 * di halaman tertutup, butir-butir itu tidak punya apa pun untuk diukur.
 */
async function openFloatingPanel(cdp) {
  const at = `(() => {
    const el = [...document.querySelectorAll('.cart-quick-bar, [class*="quick-bar"]')].find((e) => {
      const s = getComputedStyle(e)
      const b = e.getBoundingClientRect()
      return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0
    })
    if (!el) return null
    el.scrollIntoView({ block: 'center' })
    const b = el.getBoundingClientRect()
    return { cx: Math.round(b.x + b.width / 2), cy: Math.round(b.y + b.height / 2) }
  })()`
  // Bilah pemicunya muncul setelah data (order aktif) sampai — bukan seketika
  // setelah navigasi. Jadi dicari sampai ada, bukan sekali lihat.
  let pos = null
  for (let i = 0; i < 12 && !pos; i++) {
    pos = await evaluate(cdp, at)
    if (!pos) await sleep(250)
  }
  if (process.env.GATE_DEBUG) {
    process.stderr.write(`${C.dim}  [sheet] pos=${JSON.stringify(pos)}${C.off}\n`)
  }
  if (!pos) return false
  for (const type of ['mousePressed', 'mouseReleased']) {
    await cdp.send('Input.dispatchMouseEvent', {
      type,
      x: pos.cx,
      y: pos.cy,
      button: 'left',
      buttons: type === 'mousePressed' ? 1 : 0,
      clickCount: 1,
    })
  }
  await sleep(250)
  // Panel punya animasi geser masuk; menunggu angka tetap gampang flaky. Poll
  // sampai panel benar-benar terlihat (maks ~3s), bukan menebak satu durasi.
  const visible = `(() => { ${VIS}
    return [...document.querySelectorAll('.list-row, [class*="sheet-panel"]')].some(vis)
        || [...document.querySelectorAll('[class*="sheet-panel"]')].some((e) => e.getBoundingClientRect().height > 0)
  })()`
  for (let i = 0; i < 12; i++) {
    if (await evaluate(cdp, visible)) break
    await sleep(250)
  }
  // Tunggu animasi geser-masuk SELESAI sebelum diukur: di tengah animasi panel
  // masih tergeser turun sehingga tepi bawahnya belum jatuh di viewport, deteksi
  // sheet gagal, dan MD-03/MD-10 melaporkan temuan palsu (pernah kejadian).
  const settled = `(() => {
    const ps = [...document.querySelectorAll('[class*="sheet-panel"]')].filter((e) => {
      const s = getComputedStyle(e)
      return s.display !== 'none' && s.visibility !== 'hidden' && e.getBoundingClientRect().height > 0
    })
    if (!ps.length) return false
    return ps.every((e) => Math.abs(e.getBoundingClientRect().bottom - window.innerHeight) < 2)
  })()`
  for (let i = 0; i < 10; i++) {
    if (await evaluate(cdp, settled)) break
    await sleep(200)
  }
  const ok = await evaluate(cdp, visible)
  if (process.env.GATE_DEBUG) {
    const why = await evaluate(cdp,
      `(() => { const b = document.querySelector('.cart-quick-bar'); return JSON.stringify({ path: location.pathname, bar: !!b, rows: document.querySelectorAll('.list-row').length }) })()`)
    process.stderr.write(`${C.dim}  [sheet] ok=${ok} ${why}${C.off}\n`)
  }
  return ok
}

// ── jalankan ───────────────────────────────────────────────────────────────
async function main() {
  // Deteksi dev/preview server yang sudah hidup lebih dulu. `resolveBase`
  // berhenti dengan pesan jelas kalau tak ada — gate tidak menghidupkan server.
  BASE = await resolveBase()

  const tokens = tokensFromSource()
  // Mode PWA cuma untuk rute yang bisa diinstal. `--role all --pwa` menyapu
  // tiga peran app saja; memaksa PWA ke landing/dokumentasi/ops/superadmin berarti
  // mengukur halaman yang tidak pernah diinstal (dan /ops + /superadmin memang
  // dashboard lebar non-PWA). Menyebut role non-app secara eksplisit = error, bukan diam.
  let roles = OPTS.role === 'all' ? Object.keys(ROUTE_TABLES) : [OPTS.role]
  if (OPTS.pwa) {
    const nonPwa = roles.filter((r) => !ROUTE_TABLES[r].pwa)
    if (nonPwa.length === roles.length) {
      process.stderr.write(
        `${C.red}--pwa tidak berlaku untuk role "${roles[0]}".${C.off} Rute ini bukan app terinstal: ` +
          `tidak punya manifest, dan / serta /documentation ada di navigateFallbackDenylist. ` +
          `Role yang bisa: ${Object.keys(ROUTE_TABLES).filter((r) => ROUTE_TABLES[r].pwa).join(', ')}.\n`,
      )
      process.exit(2)
    }
    if (nonPwa.length) {
      process.stderr.write(
        `${C.dim}  mode PWA dilewati untuk role non-app: ${nonPwa.join(', ')}${C.off}\n`,
      )
      roles = roles.filter((r) => ROUTE_TABLES[r].pwa)
    }
  }
  let urls = OPTS.routes.length
    ? OPTS.routes.map((r) => r.startsWith('/') && !r.startsWith('/customer') && !r.startsWith('/merchant') && !r.startsWith('/courier') && !r.startsWith('/ops') && !r.startsWith('/superadmin') && OPTS.role !== 'web' ? ROUTE_TABLES[OPTS.role].base + r : r)
    : roles.flatMap((r) => routesFromSource(r))

  // DNA: ukur di 390px DAN 1440px. Dua-duanya, bukan salah satu.
  const widths = OPTS.width ? [Number(OPTS.width)] : [390, 1440]

  const cdp = await Cdp.connect()

  // Audit gulir: rute pertama jadi titik berangkat, sisanya dibuka dari situ.
  // Navigasi dokumen penuh supaya Chromium bisa memulihkan posisi gulir persis
  // seperti yang dialami pengguna, bukan angka yang dibuat-buat.
  if (OPTS.audit) {
    const rows = []
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
    })
    await fitWindow(cdp, 390, 844)
    if (OPTS.pwa) {
      await cdp.send('Emulation.setSafeAreaInsetsOverride', {
        insets: { top: OPTS.insetTop, bottom: OPTS.insetBottom, left: 0, right: 0 },
      }).catch(() => {})
    }
    const first = urls[0].startsWith('http') ? urls[0] : BASE + urls[0]
    await goto(cdp, first)
    for (const url of urls) {
      const abs = url.startsWith('http') ? url : BASE + url
      if (url !== urls[0]) {
        const fromTop = OPTS.auditFrom !== 'bottom'
        if (fromTop) {
          // "Buka dari atas": halaman berikutnya ditinggalkan dalam keadaan
          // tergulir ke atas. Ini justru menguji hal yang paling sering bocor:
          // Chromium menetapkan `scrollRestoration` dan aplikasi tidak
          // meresetnya, jadi halaman baru bisa terbuka di posisi warisan.
          await evaluate(cdp, "history.scrollRestoration = 'auto'; window.scrollTo(0, 0); 'ok'")
        } else {
          const prevMax = await evaluate(
            cdp,
            'Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight)',
          )
          await evaluate(cdp, `history.scrollRestoration = 'auto'; window.scrollTo(0, ${prevMax}); 'ok'`)
        }
        await sleep(150)
        await goto(cdp, abs)
      }
      await sleep(OPTS.auditPause)
      const m = await evaluate(cdp, SCROLL_AUDIT)
      rows.push({ url, ...m })
      const flag = m.bodyIsScroller
        ? `${C.red}body=scroller${C.off}`
        : m.scrollY > 0 ? `${C.yellow}${m.scrollY}px${C.off}` : `${C.green}0px${C.off}`
      logLine(
        `  ${url.padEnd(26)} ${C.dim}scrollY=${m.scrollY} · html ${m.htmlScrollTop} · body ${m.bodyScrollTop}` +
          ` · htmlScrollable=${m.htmlScrollable} · max=${m.maxScroll}${C.off}  ${flag}` +
          `${m.scrollableBy.length ? `  ${C.yellow}${m.scrollableBy.join(', ')}${C.off}` : ''}`,
      )
    }
    const bad = rows.filter((r) => r.bodyIsScroller || r.scrollY > 0)
    logLine(
      `\n${bad.length ? C.red : C.green}${rows.length - bad.length}/${rows.length} halaman mulai dari atas` +
        ` dan menggulir lewat dokumen${C.off}`,
    )
    cdp.close()
    process.exit(bad.length ? 1 : 0)
  }

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable').catch(() => {})

  // PWA murni butuh jendela app-mode: `display-mode: standalone` tidak bisa
  // dibuat lewat CDP (Emulation.setEmulatedMedia tidak mendukungnya), jadi
  // hanya bisa dari flag launch. Lebih baik berhenti dengan perintah tepat
  // daripada mengukur angka yang tidak berlaku.
  if (OPTS.pwa) {
    const mode = await evaluate(cdp, `matchMedia('(display-mode: standalone)').matches`)
    if (!mode) {
      process.stderr.write(
        `${C.red}Mode PWA: tab ini bukan jendela app-mode (display-mode masih "browser").${C.off}\n` +
          `Jalankan klon ulang dengan app-mode:\n\n` +
          `  BRAVE_EXTRA_ARGS="--app=${BASE}/app/home --touch-events=enabled" \\\n` +
          `    ~/.local/share/brave-debug-mcp/bin/launch.sh --fresh\n\n` +
          `Lalu ulangi perintah ini. Detail: docs/design/pwa-testing.md\n`,
      )
      cdp.close()
      process.exit(2)
    }
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {})
    // Paksa service worker terbaru mengambil alih sebelum mengukur.
    await cdp
      .send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
      .catch(() => {})
    await warmUpShell(cdp, BASE + (urls[0] || '/'))
    if (!OPTS.json) logLine(`${C.dim}warm-up: service worker diperbarui, shell dimuat ulang${C.off}`)
  } else {
    // Mode biasa mengukur apa yang disajikan server, bukan apa yang tersimpan
    // di cache service worker dari pengukuran sebelumnya. Profil klon gate
    // menyimpan SW antar jalan, dan tanpa ini gate bisa melaporkan CSS lama
    // sebagai "masih gagal" padahal build baru sudah benar — pernah kejadian:
    // tombol 93x34 dilaporkan gagal padahal versi terbaru sudah 44px.
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => {})
    await evaluate(cdp, `(async () => {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister().catch(() => {})))
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => {})))
      return { regs: regs.length, caches: keys.length }
    })()`).catch(() => {})
  }

  const report = []
  let failed = 0
  let warned = 0
  const total = urls.length * widths.length

  if (!OPTS.json) {
    process.stdout.write(
      `\n${C.dim}gerbang browser — ${urls.length} rute × ${widths.join('/')}px` +
        `${OPTS.pwa ? ` · mode PWA${OPTS.offline ? ' + offline' : ''} (app-mode, input sentuh, safe-area ${OPTS.insetTop}/${OPTS.insetBottom})` : ''}` +
        ` · token sumber: shell-max ${tokens.shellMax}px, touch-min ${tokens.touchMin}px, space-5 ${tokens.space5}px${C.off}\n\n`,
    )
  }

  let seededRole = null

  for (const url of urls) {
    const abs = url.startsWith('http') ? url : BASE + url
    const urlRole = (abs.match(/\/(customer|merchant|courier)(?:\/|$)/) || [])[1]
    if (urlRole && urlRole !== seededRole) {
      await seedSession(cdp, `/${urlRole}`)
      seededRole = urlRole
    }
    for (const width of widths) {
      const height = width >= 900 ? 900 : 844
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: width >= 900 ? 1 : 2,
        mobile: width < 900,
      })
      await fitWindow(cdp, width, height)
      const passes = OPTS.offline ? ['online', 'offline'] : ['online']
      for (const pass of passes) {
        if (OPTS.pwa) {
          await cdp
            .send('Emulation.setSafeAreaInsetsOverride', {
              insets: { top: OPTS.insetTop, bottom: OPTS.insetBottom, left: 0, right: 0 },
            })
            .catch(() => {})
        }
        if (pass === 'offline') await setOffline(cdp, true)

        const errors = []
        await goto(cdp, abs)
        await settlePage(cdp)
        const measured = await evaluate(cdp, MEASURE)
        const verdict = judge(measured, tokens, OPTS.strict, width)
        if (pass === 'offline') {
          if (measured.textLen === 0) {
            verdict.fail.push('offline: halaman kosong (service worker tidak melayani cache)')
          }
          if (measured.pwa.swCount === 0) verdict.fail.push('offline: service worker hilang')
        }
        failed += verdict.fail.length ? 1 : 0
        warned += verdict.warn.length ? 1 : 0

        if (OPTS.click && width === widths[0] && pass === 'online') {
          await clickSweep(cdp, abs, errors, (s) => !OPTS.json && logLine(s))
        }
        if (pass === 'offline') await setOffline(cdp, false)

        report.push({ url, width, pass, fail: verdict.fail, warn: verdict.warn, clickErrors: errors, measured })

        if (!OPTS.json) {
          const bad = verdict.fail.length + errors.length
          const mark = bad ? `${C.red}FAIL${C.off}` : verdict.warn.length ? `${C.yellow}WARN${C.off}` : `${C.green}PASS${C.off}`
          const tag = pass === 'offline' ? ' offline' : ''
          printVerdict(`${url} @${width}px${tag}`, verdict, errors, measured)
          // Butir DNA MD-06/07/11 hidup DI DALAM panel mengambang (sheet
          // keranjang): mengukurnya di halaman tertutup = tidak mengukurnya.
          // Panel dibuka dengan klik nyata, lalu diukur sebagai laporan sendiri.
          if (width === widths[0] && pass === 'online') {
            const opened = await openFloatingPanel(cdp)
            if (opened) {
              // MD-03 mengukur "gulir saat halaman DIBUKA". Baris ini datang
              // setelah sweep klik + membuka panel, yang keduanya menggulir
              // halaman (tiap target di-scrollIntoView). Tanpa memulihkan ke
              // atas, baris sheet melaporkan gulir buatan gate sendiri sebagai
              // "gulir warisan" — temuan palsu yang bergantung pada target
              // terakhir sweep, bukan pada halaman.
              await evaluate(cdp, "window.scrollTo(0, 0); 'ok'")
              await sleep(100)
              const m2 = await evaluate(cdp, MEASURE)
              const v2 = judge(m2, tokens, OPTS.strict, width)
              failed += v2.fail.length ? 1 : 0
              warned += v2.warn.length ? 1 : 0
              report.push({
                url: `${url} (sheet)`, width, pass, fail: v2.fail, warn: v2.warn,
                clickErrors: [], measured: m2,
              })
              printVerdict(`${url} @${width}px (sheet terbuka)`, v2, [], m2)
            }
          }
        }
      }
    }
  }

  await cdp.send('Emulation.clearDeviceMetricsOverride').catch(() => {})
  await restoreWindow(cdp)
  // Kembalikan tab kerja ke start_url peran yang diukur. Tanpa ini jendela
  // app-mode ditinggal di rute terakhir, dan karena Chromium menamai jendela
  // dari `start_url` manifest, dua role tampak jadi "aplikasi" yang sama.
  if (OPTS.pwa) {
    const mulai = ROUTE_TABLES[OPTS.role]?.startUrl
    if (mulai) await cdp.send('Page.navigate', { url: BASE + mulai }).catch(() => {})
  }
  cdp.close()

  if (OPTS.json) {
    process.stdout.write(JSON.stringify({ tokens, report }, null, 2) + '\n')
  } else {
    process.stdout.write(
      `\n${failed ? C.red : C.green}${total - failed}/${total} pengukuran lolos${C.off}${warned ? ` · ${warned} dengan peringatan` : ''}\n` +
        `${C.dim}peringatan = warisan/legacy; pakai --strict untuk menjadikannya gagal di halaman yang kamu sentuh${C.off}\n\n`,
    )
  }
  process.exit(failed ? 1 : 0)
}

const logLine = (s) => process.stdout.write(s + '\n')

async function setOffline(cdp, offline) {
  await cdp.send('Network.emulateNetworkConditions', {
    offline,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  })
}

/**
 * Setelah `npm run build`, muat pertama masih menyajikan shell LAMA dari
 * precache: service worker baru mengambil alih lalu memuat ulang. Mengukur
 * terlalu cepat = mengukur build sebelumnya (pernah muncul sebagai "scroller
 * bersarang" yang hilang begitu diukur ulang). Jadi paksa update + muat ulang
 * sekali sebelum angkanya dipakai.
 */
async function warmUpShell(cdp, url) {
  await goto(cdp, url)
  // Modal pasang aplikasi (`InstallPromptSheet`) menutupi layar pada kunjungan
  // pertama dan akan membuat tiap klik dilaporkan OVERLAY. Gate menolaknya
  // lebih dulu — sama seperti pengguna yang menekan "Nanti saja" — supaya yang
  // diukur adalah halamannya, bukan modalnya.
  await evaluate(
    cdp,
    `localStorage.setItem('sa7tein:install-prompt-dismissed', '1')`,
  )
  await evaluate(cdp, `(async () => {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.update().catch(() => {})))
    return regs.length
  })()`)
  await sleep(1500)
  await cdp.send('Page.reload', {})
  await sleep(900)
}

/**
 * Gerbang rute (`authGate` di App.tsx) memantulkan layar di dalam aplikasi ke
 * onboarding/layar masuk saat belum ada sesi. Gate mengukur halamannya, bukan
 * gerbangnya, jadi sesi demo di-seed lebih dulu — sama seperti pengguna yang
 * sudah masuk. Sesi dipisah per peran, jadi peran ikut dari rute yang diukur
 * (`--role all` menyapu beberapa peran dalam satu kali jalan). `user: null`
 * aman: `Home.tsx` membacanya dengan `?.`.
 *
 * `GATE_SEED_PAYMENT` memilih metode bayar di state cart sebelum halaman diukur.
 * Dibutuhkan rute yang hanya untuk satu metode (`/payment-dana` memantul ke
 * `/payment-selection` kalau metodenya bukan VA/QRIS). Nilai itu juga disuntik
 * lewat `Page.addScriptToEvaluateOnNewDocument` — kalau hanya ditulis ke
 * localStorage dari dokumen yang sedang hidup, store yang berjalan menimpanya
 * pada aksi berikutnya dan seed-nya hilang.
 */
async function seedSession(cdp, role) {
  const payment = process.env.GATE_SEED_PAYMENT
  const source = `(() => {
      const key = 'persist:sa7tein'
      const raw = JSON.parse(localStorage.getItem(key) || '{}')
      raw.auth = JSON.stringify({ user: null, isAuthenticated: true, role: ${JSON.stringify(role)}, isLoading: false })
      ${
        payment
          ? `const cart = JSON.parse(raw.cart || '{}')
      cart.selectedPaymentId = ${JSON.stringify(payment)}
      raw.cart = JSON.stringify(cart)`
          : ''
      }
      raw._persist = JSON.stringify({ version: 6, rehydrated: true })
      localStorage.setItem(key, JSON.stringify(raw))
    })()`
  if (payment) await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source })
  await evaluate(cdp, source)
}

main().catch((err) => {
  process.stderr.write(`${C.red}gerbang browser gagal: ${err.message}${C.off}\n`)
  process.exit(2)
})
