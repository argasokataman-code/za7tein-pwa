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
const CDP = process.env.GATE_CDP || 'http://127.0.0.1:9355'
// PWA murni harus diukur pada hasil build (service worker hanya ada di build),
// bukan di dev server.
const BASE =
  process.env.GATE_BASE ||
  (process.argv.includes('--pwa') ? 'http://localhost:4173' : 'http://localhost:5173')
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
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const C = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', dim: '\x1b[2m', off: '\x1b[0m' }

// ── angka pembanding, dibaca dari kode ─────────────────────────────────────
function tokensFromSource() {
  const scss = readFileSync(path.join(ROOT, 'src/styles/_tokens.scss'), 'utf8')
  const px = (name) => {
    const m = scss.match(new RegExp(`--${name}\\s*:\\s*([0-9.]+)px`))
    return m ? Number(m[1]) : null
  }
  return { shellMax: px('shell-max'), touchMin: px('touch-min'), space5: px('space-5') }
}

const ROUTE_TABLES = {
  customer: { base: '/customer', table: 'customerRoutes' },
  merchant: { base: '/merchant', table: 'merchantRoutes' },
  courier: { base: '/courier', table: 'courierRoutes' },
  admin: { base: '/admin', table: 'adminRoutes' },
  superadmin: { base: '/superadmin', table: 'superAdminRoutes' },
  web: { base: '', table: 'webRoutes' },
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
    let list
    try {
      list = await (await fetch(`${CDP}/json/list`)).json()
    } catch {
      if (LAUNCH_SH && existsSyncSafe(LAUNCH_SH)) {
        process.stderr.write(`${C.yellow}CDP mati — menjalankan ${LAUNCH_SH}${C.off}\n`)
        execFileSync(LAUNCH_SH, { stdio: 'ignore' })
        await sleep(2500)
        list = await (await fetch(`${CDP}/json/list`)).json()
      } else {
        throw new Error(
          `CDP ${CDP} tidak hidup. Jalankan tools["brave-debug"].launch({}) dari agent, lalu ulangi.`,
        )
      }
    }
    const page = list.find((t) => t.type === 'page')
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
  const shell = document.querySelector('.app-shell')
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
  const controls = [...document.querySelectorAll(
    'button, input:not([type=hidden]), select, textarea, [role="radio"], [role="button"], [role="tab"]'
  )].filter(vis)
  const smallTargets = controls
    .map((el) => ({ label: name(el), ...box(el) }))
    .filter((b) => b.w < runtime.touchMin || b.h < runtime.touchMin)
  // Dokumen (html/body) memang scroller yang sah — yang dilarang scroller
  // bersarang DI DALAM halaman.
  const scrollers = [...document.querySelectorAll('*')]
    .filter((el) => el !== document.documentElement && el !== document.body)
    .filter((el) => {
      const oy = getComputedStyle(el).overflowY
      return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1
    })
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
        const b = el.getBoundingClientRect()
        return Math.abs(b.width - sr.width) < 2 && b.height > 40
          && parseFloat(getComputedStyle(el).paddingLeft) > 0
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
  // Bukti override safe-area benar-benar berlaku: baca env() yang sama yang
  // dipakai stylesheet (part-01/part-06 hanya aktif saat standalone).
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;'
    + 'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)'
  document.body.appendChild(probe)
  const ps = getComputedStyle(probe)
  const safe = { top: parseFloat(ps.paddingTop) || 0, bottom: parseFloat(ps.paddingBottom) || 0 }
  probe.remove()

  return {
    path: location.pathname,
    runtime,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    pwa: {
      displayMode: matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : 'browser',
      touchEvents: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints,
      swCount,
      controlled,
      cacheCount,
      safe,
    },
    shell: { w: Math.round(sr.width), x: Math.round(sr.x) },
    col,
    overflowX: doc.scrollWidth - doc.clientWidth,
    controls: controls.length,
    smallTargets,
    scrollers,
    fixed,
    gutters,
    crashed: !!document.querySelector('[data-app-error], .app-error-boundary, [data-error-boundary]'),
    textLen: document.body.innerText.trim().length,
  }
})()`

const SIGNATURE = `(() => {
  const el = document.activeElement
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
const clickable = () => [...document.querySelectorAll('${CLICKABLE}')]
  .filter(vis)
  .filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true')`

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
  el.scrollIntoView({ block: 'center' })
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
  const expectedShell = tokens.shellMax ? Math.min(viewportWidth, tokens.shellMax) : null

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
  }
  // Buktikan emulasi benar-benar berlaku. Mengukur di jendela klon (500px)
  // pernah menghasilkan angka yang tidak ada hubungannya dengan app.
  if (Math.abs(measured.viewport.w - viewportWidth) > 1) {
    push(fail, `viewport ${measured.viewport.w}px != emulasi ${viewportWidth}px (angka tidak sah)`)
  }
  for (const key of ['shellMax', 'touchMin', 'space5']) {
    if (tokens[key] !== null && measured.runtime[key] !== tokens[key]) {
      push(fail, `token --${key} runtime ${measured.runtime[key]} != sumber ${tokens[key]}px`)
    }
  }
  if (expectedShell && Math.abs(measured.shell.w - expectedShell) > 1) {
    push(fail, `lebar kolom ${measured.shell.w}px != ${expectedShell}px (min(viewport, --shell-max))`)
  }
  if (measured.overflowX !== 0) push(fail, `overflow-x ${measured.overflowX}px (harus 0)`)
  if (measured.scrollers.length) push(fail, `scroller bersarang: ${measured.scrollers.join(', ')}`)

  // Invarian bilah fixed: tidak menyeberang keluar kolom visual.
  for (const f of measured.fixed) {
    const left = measured.col.x - 2
    const right = measured.col.x + measured.col.w + 2
    if (f.x < left || f.x + f.w > right) {
      push(warn, `fixed keluar kolom: "${f.label}" ${f.w}px @x${f.x} (kolom ${measured.col.w}px @x${measured.col.x})`)
    }
  }
  for (const t of measured.smallTargets) {
    push(warn, `target < --touch-min ${tokens.touchMin}px: "${t.label}" ${t.w}x${t.h}`)
  }
  const badGutters = measured.gutters.filter((g) => tokens.space5 && g !== tokens.space5)
  if (badGutters.length) {
    push(warn, `gutter != --space-5 (${tokens.space5}px): ${badGutters.join('px, ')}px`)
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

// ── jalankan ───────────────────────────────────────────────────────────────
async function main() {
  try {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error(String(res.status))
  } catch {
    process.stderr.write(
      `${C.red}Server tidak jalan di ${BASE}.${C.off} Jalankan: ` +
        `${OPTS.pwa ? 'npm run build && npm run preview' : 'npm run dev'}\n`,
    )
    process.exit(2)
  }

  const tokens = tokensFromSource()
  const roles = OPTS.role === 'all' ? Object.keys(ROUTE_TABLES) : [OPTS.role]
  let urls = OPTS.routes.length
    ? OPTS.routes.map((r) => r.startsWith('/') && !r.startsWith('/customer') && !r.startsWith('/merchant') && !r.startsWith('/courier') && !r.startsWith('/admin') && OPTS.role !== 'web' ? ROUTE_TABLES[OPTS.role].base + r : r)
    : roles.flatMap((r) => routesFromSource(r))

  // DNA: ukur di 390px DAN 1440px. Dua-duanya, bukan salah satu.
  const widths = OPTS.width ? [Number(OPTS.width)] : [390, 1440]

  const cdp = await Cdp.connect()
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

  for (const url of urls) {
    const abs = url.startsWith('http') ? url : BASE + url
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
          const pwaInfo = OPTS.pwa ? ` · ${measured.pwa.displayMode} · sw ${measured.pwa.swCount}${measured.pwa.controlled ? '/ctrl' : ''}` : ''
          logLine(`  ${mark} ${url} @${width}px${tag}  ${C.dim}inner ${measured.viewport.w}px · shell ${measured.shell.w}px · overflow ${measured.overflowX}px · ${measured.controls} kontrol${pwaInfo}${C.off}`)
          for (const m of verdict.fail) logLine(`      ${C.red}✗${C.off} ${m}`)
          for (const m of errors) logLine(`      ${C.red}✗${C.off} ${m}`)
          for (const m of verdict.warn.slice(0, 6)) logLine(`      ${C.yellow}!${C.off} ${m}`)
          if (verdict.warn.length > 6) logLine(`      ${C.dim}+${verdict.warn.length - 6} peringatan lain${C.off}`)
        }
      }
    }
  }

  await cdp.send('Emulation.clearDeviceMetricsOverride').catch(() => {})
  await restoreWindow(cdp)
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
  await evaluate(cdp, `(async () => {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.update().catch(() => {})))
    return regs.length
  })()`)
  await sleep(1500)
  await cdp.send('Page.reload', {})
  await sleep(900)
}

main().catch((err) => {
  process.stderr.write(`${C.red}gerbang browser gagal: ${err.message}${C.off}\n`)
  process.exit(2)
})
