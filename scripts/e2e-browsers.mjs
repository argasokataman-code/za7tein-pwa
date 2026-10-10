#!/usr/bin/env node
/**
 * e2e-browsers.mjs — kelola + pakai SATU **jendela PWA** per peran (customer,
 * merchant, courier, admin, superadmin) untuk testing flow e2e.
 *
 * Tiap peran = INSTANCE browser sendiri, bukan tab di browser yang sama.
 * Keempat PWA berbagi satu origin, jadi beberapa tab di browser yang sama
 * berbagi `localStorage` (redux-persist: cart/favorites/accountSetup) dan sesi
 * bisa saling menimpa. Browser terpisah = profil + storage sendiri, seperti
 * beberapa pengguna di perangkat berbeda — itu yang membuat e2e jujur.
 *
 * WAJIB app-mode: tiap jendela dibuka `--app=<url>` (display-mode: standalone),
 * bukan tab browser biasa.
 *
 * ── ATURAN KUNCI: subcommand aksi TIDAK PERNAH membuka jendela/tab baru ──
 * `nav`/`eval`/`click`/`shot` hanya memakai ulang jendela role yang sudah
 * hidup. Jendela role tidak ada → perintah GAGAL dengan pesan jelas, bukan
 * diam-diam spawn browser baru. Membuka jendela hanya lewat `npm run e2e`
 * (dijalankan sekali, disengaja). Ini yang menghentikan kebiasaan
 * "tiap langkah buka browser baru".
 *
 * PETA PORT TERKUNCI (biar tak bentrok ke depan):
 *   9355  klon kerja user (gambar/ChatGPT)     — JANGAN dipakai e2e
 *   9359  klon gate (browser-gate.mjs)         — JANGAN dipakai e2e
 *   9360  customer     profil profile-e2e-customer
 *   9361  merchant     profil profile-e2e-merchant
 *   9362  courier      profil profile-e2e-courier
 *   9363  admin        profil profile-e2e-admin
 *   9364  superadmin   profil profile-e2e-superadmin
 * Port e2e = E2E_PORT_BASE + indeks urutan di ROLE_DEFS (default base 9360).
 * Tambah peran baru di AKHIR daftar, jangan sisipkan di tengah.
 *
 * Pakai:
 *   npm run e2e                       # BUKA semua jendela (sekali, disengaja)
 *   npm run e2e -- --pwa              # pakai hasil build (localhost:4173)
 *   npm run e2e -- --pwa --only=customer,merchant,courier   # hanya peran ini
 *   npm run e2e -- --list             # cetak peta port terkunci, tanpa buka apa pun
 *   npm run e2e -- --stop             # matikan semua klon e2e
 *   npm run e2e -- preflight          # WAJIB dulu: cek server + tiap jendela role & portnya
 *
 *   npm run e2e -- status             # jendela role hidup/tidak + URL
 *   npm run e2e -- nav customer /customer/home
 *   npm run e2e -- eval customer "document.title"
 *   npm run e2e -- click customer ".category-btn:nth-child(2)"
 *   npm run e2e -- shot customer /tmp/home.png
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'

const BIN_DIR = path.join(process.env.HOME || '', '.local/share/brave-debug-mcp/bin')
const LAUNCH_SH = process.env.BRAVE_DEBUG_LAUNCH || path.join(BIN_DIR, 'launch.sh')
const STOP_SH = path.join(path.dirname(LAUNCH_SH), 'stop.sh')
const DEV_PORTS = [5173, 5174, 5175, 5176]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── peta peran ── urutan = indeks port. Tambah di akhir, jangan sisipkan. ──
const PORT_BASE = Number(process.env.E2E_PORT_BASE) || 9360
const ROLE_DEFS = [
  { role: 'customer', path: '/customer/signin', pos: '20,40' },
  { role: 'merchant', path: '/merchant/signin', pos: '470,40' },
  { role: 'courier', path: '/courier/signin', pos: '920,40' },
  { role: 'admin', path: '/admin/', pos: '20,1000' },
  { role: 'superadmin', path: '/superadmin/', pos: '470,1000' },
]

const INSTANCES = ROLE_DEFS.map((def, i) => {
  const key = `E2E_${def.role.toUpperCase()}`
  return {
    role: def.role,
    prefix: `/${def.role}`,
    port: Number(process.env[`${key}_PORT`]) || PORT_BASE + i,
    profile: path.join(BIN_DIR, process.env[`${key}_PROFILE`] || `profile-e2e-${def.role}`),
    path: process.env[`${key}_PATH`] || def.path,
    pos: def.pos,
  }
})

const SUBCOMMANDS = ['preflight', 'status', 'nav', 'eval', 'click', 'shot']

const argv = process.argv.slice(2)
const op = SUBCOMMANDS.includes(argv[0]) ? argv[0] : null
const opArgs = op ? argv.slice(1).filter((a) => !a.startsWith('--')) : []
const pwa = argv.includes('--pwa')
const stop = argv.includes('--stop')
const list = argv.includes('--list')
const baseArg = argv.find((a) => a.startsWith('--base='))?.slice('--base='.length)

const endpoint = (port) => `http://127.0.0.1:${port}`
const fail = (msg) => {
  process.stderr.write(`${msg}\n`)
  process.exit(1)
}
const byRole = (role) => INSTANCES.find((i) => i.role === role)

// Filter peran opsional: `--only=customer,merchant,courier`. Hanya peran
// terpilih yang dibuka/dimatikan/dicek; port tetap dari indeks ROLE_DEFS.
const onlyArg = argv.find((a) => a.startsWith('--only='))?.slice('--only='.length)
const onlyRoles = onlyArg ? onlyArg.split(',').map((s) => s.trim()).filter(Boolean) : null
const TARGETS = onlyRoles ? INSTANCES.filter((i) => onlyRoles.includes(i.role)) : INSTANCES
const unknownRoles = onlyRoles?.filter((r) => !byRole(r))
if (unknownRoles?.length) {
  fail(`role tak dikenal di --only: ${unknownRoles.join(', ')}. Pilih: ${INSTANCES.map((i) => i.role).join(', ')}`)
}

function printMap() {
  process.stdout.write('Peta port e2e terkunci (9355 kerja & 9359 gate dicadangkan untuk hal lain):\n')
  for (const inst of INSTANCES) {
    process.stdout.write(
      `  ${String(inst.port).padEnd(5)} ${inst.role.padEnd(11)} ${inst.path.padEnd(18)} profil ${path.basename(inst.profile)}\n`,
    )
  }
}

async function resolveBase() {
  if (baseArg) return baseArg.replace(/\/$/, '')
  if (pwa) return 'http://localhost:4173'
  for (const port of DEV_PORTS) {
    try {
      if ((await fetch(`http://localhost:${port}/`)).ok) return `http://localhost:${port}`
    } catch {
      // port kosong, coba berikutnya
    }
  }
  process.stderr.write(
    `Tidak ada dev server di ${DEV_PORTS.map((p) => `:${p}`).join(' / ')}.\n` +
      `Jalankan \`npm run dev\` SEKALI di terminal lain (atau pakai --pwa setelah \`npm run build\`).\n` +
      `Script ini tidak menghidupkan server sendiri.\n`,
  )
  process.exit(2)
}

async function cdpList(port) {
  try {
    const res = await fetch(`${endpoint(port)}/json/list`)
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

function tcpOpen(port, ms = 400) {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host: '127.0.0.1' })
    const done = (v) => {
      sock.destroy()
      resolve(v)
    }
    sock.setTimeout(ms)
    sock.once('connect', () => done(true))
    sock.once('timeout', () => done(false))
    sock.once('error', () => done(false))
  })
}

// ── CDP mentah (WebSocket global) ──────────────────────────────────────────

/** Kirim satu perintah CDP ke target, balikan `result` mentah. `null` kalau gagal. */
function cdpSend(wsUrl, method, params) {
  return new Promise((resolve) => {
    let settled = false
    const done = (v) => {
      if (settled) return
      settled = true
      try {
        ws.close()
      } catch {
        // ws belum terbuka; abaikan
      }
      resolve(v)
    }
    let ws
    try {
      ws = new WebSocket(wsUrl)
    } catch {
      return done(null)
    }
    const timer = setTimeout(() => done(null), 8000)
    ws.onerror = () => {
      clearTimeout(timer)
      done(null)
    }
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, method, params }))
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.id === 1) {
          clearTimeout(timer)
          done(msg.result ?? null)
        }
      } catch {
        // pesan non-JSON; abaikan
      }
    }
  })
}

/** Evaluasi JS via CDP, balikan nilai (by value). `null` kalau gagal/timeout. */
async function cdpEval(wsUrl, expression) {
  const r = await cdpSend(wsUrl, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  return r?.result?.value ?? null
}

async function waitReady(wsUrl, timeout = 8000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if ((await cdpEval(wsUrl, 'document.readyState')) === 'complete') return true
    await sleep(150)
  }
  return false
}

/**
 * Cari jendela app-mode milik role ini yang sudah hidup. TIDAK membuka baru.
 * `null` kalau tidak ada → pemanggil gagal dengan pesan jelas.
 */
async function roleTab(inst) {
  const tabs = await cdpList(inst.port)
  if (!tabs) return null
  const pages = tabs.filter((t) => t.type === 'page')
  const mine = pages.filter((t) => {
    try {
      return new URL(t.url).pathname.startsWith(inst.prefix)
    } catch {
      return false
    }
  })
  return mine[0] ?? null
}

// Jendela PWA = ukuran ponsel; shell repo terkunci `--shell-max` 430px.
const PWA_W = 430
const PWA_H = 920

/** Klon ini jendela PWA yang benar (standalone + lebar sesuai shell)? */
async function isAppMode(tabs) {
  for (const p of (tabs || []).filter((t) => t.type === 'page')) {
    const r = await cdpEval(
      p.webSocketDebuggerUrl,
      "({ standalone: matchMedia('(display-mode: standalone)').matches, w: window.innerWidth })",
    )
    if (r && r.standalone === true && r.w && Math.abs(r.w - PWA_W) <= 16) return true
  }
  return false
}

async function newTab(port, url) {
  const res = await fetch(`${endpoint(port)}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
  if (!res.ok) throw new Error(`gagal buka tab ${url}: HTTP ${res.status}`)
  return await res.json()
}

async function closeBlankTabs(port, tabs) {
  for (const t of tabs || []) {
    if (t.type === 'page' && /^(chrome:\/\/newtab\/?|about:blank)$/.test(t.url || '')) {
      await fetch(`${endpoint(port)}/json/close/${t.id}`).catch(() => {})
    }
  }
}

/** Port CDP harus bebas, atau dipakai klon CDP (milik kita). Jangan tabrak proses asing. */
async function assertPortFree(inst) {
  if (await cdpList(inst.port)) return
  if (await tcpOpen(inst.port)) {
    throw new Error(
      `port ${inst.port} (${inst.role}) dipakai proses lain yang bukan CDP. ` +
        `Bebaskan port itu atau ganti E2E_PORT_BASE.`,
    )
  }
}

function launchClone(inst, url) {
  if (!existsSync(LAUNCH_SH)) throw new Error(`launch.sh tidak ada di ${LAUNCH_SH}`)
  mkdirSync(inst.profile, { recursive: true })
  process.stderr.write(`[${inst.role}] luncurkan PWA app-mode (--app ${url}, port ${inst.port})\n`)
  execFileSync(LAUNCH_SH, ['--fresh'], {
    stdio: 'ignore',
    env: {
      ...process.env,
      BRAVE_CDP_PORT: String(inst.port),
      BRAVE_PROFILE: inst.profile,
      // `--app=` = jendela PWA (tanpa chrome browser). Wajib PWA, bukan browser biasa.
      BRAVE_EXTRA_ARGS:
        process.env.E2E_EXTRA_ARGS ||
        `--app=${url} --window-size=${PWA_W},${PWA_H} --window-position=${inst.pos} --touch-events=enabled`,
    },
  })
}

function stopClone(inst) {
  if (!existsSync(STOP_SH)) return
  execFileSync(STOP_SH, [], {
    stdio: 'ignore',
    env: { ...process.env, BRAVE_CDP_PORT: String(inst.port), BRAVE_PROFILE: inst.profile },
  })
}

async function ensureInstance(base, inst) {
  const url = inst.path.startsWith('http') ? inst.path : base + inst.path
  const matcher = new URL(url).pathname

  let tabs = await cdpList(inst.port)
  const appReady = tabs !== null && (await isAppMode(tabs))
  if (!appReady) {
    if (tabs !== null) {
      process.stderr.write(`[${inst.role}] klon masih mode browser — restart ke PWA\n`)
      stopClone(inst)
      await sleep(800)
    }
    await assertPortFree(inst)
    launchClone(inst, url)
    await sleep(2500)
    tabs = (await cdpList(inst.port)) || []
  }

  const tab = (tabs || []).find((t) => t.type === 'page' && (t.url || '').includes(matcher))
  if (!tab) {
    const opened = await newTab(inst.port, url)
    tabs = [...(tabs || []), opened]
  }
  await closeBlankTabs(inst.port, tabs)
  return url
}

// ── subcommand aksi (reuse-only, TIDAK PERNAH buka jendela baru) ───────────

/** Jendela role hidup? Kalau tidak, hentikan dengan pesan — jangan spawn. */
async function requireTab(inst) {
  const tab = await roleTab(inst)
  if (!tab) {
    fail(
      `[${inst.role}] tidak ada jendela app-mode di port ${inst.port}. ` +
        `Jalankan \`npm run e2e${pwa ? ' -- --pwa' : ''}\` SEKALI dulu (script ini tidak membuka browser baru).`,
    )
  }
  return tab
}

async function runStatus() {
  for (const inst of TARGETS) {
    const tabs = await cdpList(inst.port)
    if (!tabs) {
      process.stdout.write(`  ${inst.role.padEnd(11)} port ${inst.port}  MATI\n`)
      continue
    }
    const app = await isAppMode(tabs)
    const tab = await roleTab(inst)
    process.stdout.write(
      `  ${inst.role.padEnd(11)} port ${inst.port}  HIDUP${app ? ' app-mode' : ' (bukan app-mode!)'}` +
        `  ${tab ? tab.url : '— tak ada tab role'}\n`,
    )
  }
}

async function portAlive(port) {
  try {
    return (await fetch(`http://localhost:${port}/`)).ok
  } catch {
    return false
  }
}

/** Server mana yang hidup? preview 4173 diutamakan, lalu dev 5173–5176. */
async function detectServer() {
  if (await portAlive(4173)) return { label: 'preview', base: 'http://localhost:4173' }
  for (const port of DEV_PORTS) {
    if (await portAlive(port)) return { label: 'dev', base: `http://localhost:${port}` }
  }
  return null
}

/**
 * Preflight WAJIB sebelum testing per-peran: server hidup + tiap jendela role
 * ada di portnya (app-mode). TIDAK membuka apa pun — hanya memeriksa. Keluar
 * non-nol kalau ada yang kurang, supaya agent berhenti, bukan spawn browser.
 */
async function runPreflight() {
  const server = await detectServer()
  process.stdout.write('PREFLIGHT e2e — server + jendela per role (port terkunci)\n')
  process.stdout.write(
    `  server : ${server ? `${server.base} (${server.label})` : 'TIDAK ADA — jalankan `npm run dev` atau `npm run preview`'}\n`,
  )
  process.stdout.write(`  ${'role'.padEnd(11)}${'port'.padEnd(6)}${'jendela'.padEnd(17)}url\n`)
  let ok = 0
  for (const inst of TARGETS) {
    const tabs = await cdpList(inst.port)
    if (!tabs) {
      process.stdout.write(`  ${inst.role.padEnd(11)}${String(inst.port).padEnd(6)}MATI\n`)
      continue
    }
    const app = await isAppMode(tabs)
    const tab = await roleTab(inst)
    const ready = app && tab
    if (ready) ok += 1
    process.stdout.write(
      `  ${inst.role.padEnd(11)}${String(inst.port).padEnd(6)}${(app ? 'HIDUP app-mode' : 'bukan app-mode!').padEnd(17)}${tab ? tab.url : '— tak ada tab role'}\n`,
    )
  }
  const total = TARGETS.length
  if (!server || ok < total) {
    process.stdout.write(
      `\nHASIL: ${ok}/${total} jendela siap, server ${server ? 'ada' : 'mati'}.\n` +
        `Perbaiki: \`npm run e2e${server?.label === 'preview' ? ' -- --pwa' : ''}\` SEKALI (buka jendela; tool aksi tidak membuka sendiri).\n`,
    )
    process.exit(2)
  }
  process.stdout.write(
    `\nHASIL: ${ok}/${total} jendela siap, server ${server.label} ${server.base}. Lanjut aksi reuse-only.\n`,
  )
}

async function runNav() {
  const [role, target] = opArgs
  const inst = byRole(role)
  if (!inst) fail(`role tak dikenal: ${role}. Pilih: ${INSTANCES.map((i) => i.role).join(', ')}`)
  if (!target) fail('pakai: nav <role> <path|url>')
  const tab = await requireTab(inst)
  // Base = origin jendela role itu sendiri (sudah pasti hidup & benar),
  // bukan nebak port dev. `--base`/`--pwa` hanya relevan saat membuka jendela.
  const url = /^https?:\/\//.test(target) ? target : new URL(tab.url).origin + target
  const ws = tab.webSocketDebuggerUrl
  await cdpSend(ws, 'Page.navigate', { url })
  await waitReady(ws)
  const title = await cdpEval(ws, 'document.title')
  process.stdout.write(`${url}\n${title}\n`)
}

async function runEval() {
  const [role, ...rest] = opArgs
  const inst = byRole(role)
  if (!inst) fail(`role tak dikenal: ${role}. Pilih: ${INSTANCES.map((i) => i.role).join(', ')}`)
  const expression = rest.join(' ')
  if (!expression) fail('pakai: eval <role> "<expr>"')
  const tab = await requireTab(inst)
  const value = await cdpEval(tab.webSocketDebuggerUrl, expression)
  process.stdout.write(
    typeof value === 'string' ? `${value}\n` : `${JSON.stringify(value, null, 2)}\n`,
  )
}

async function runClick() {
  const [role, selector] = opArgs
  const inst = byRole(role)
  if (!inst) fail(`role tak dikenal: ${role}. Pilih: ${INSTANCES.map((i) => i.role).join(', ')}`)
  if (!selector) fail('pakai: click <role> "<selector>"')
  const tab = await requireTab(inst)
  const ws = tab.webSocketDebuggerUrl
  // Titik tengah + hit-test: apa yang BENAR-BENAR kena di titik itu.
  const hit = await cdpEval(
    ws,
    `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return { error: 'selector tak ada' };
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const top = document.elementFromPoint(x, y);
      return { x, y, w: r.width, h: r.height,
        self: el.contains(top), top: top ? (top.className || top.tagName) : null };
    })()`,
  )
  if (!hit || hit.error) fail(`[${inst.role}] ${selector}: ${hit?.error ?? 'eval gagal'}`)
  const { x, y } = hit
  await cdpSend(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1,
  })
  await cdpSend(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1,
  })
  process.stdout.write(
    `click ${selector} @ ${Math.round(x)},${Math.round(y)} (${Math.round(hit.w)}x${Math.round(hit.h)})` +
      `${hit.self ? '' : ` ⚠ OVERLAY: yang kena <${hit.top}>`}\n`,
  )
}

async function runShot() {
  const [role, out] = opArgs
  const inst = byRole(role)
  if (!inst) fail(`role tak dikenal: ${role}. Pilih: ${INSTANCES.map((i) => i.role).join(', ')}`)
  if (!out) fail('pakai: shot <role> <out.png>')
  const tab = await requireTab(inst)
  const r = await cdpSend(tab.webSocketDebuggerUrl, 'Page.captureScreenshot', { format: 'png' })
  if (!r?.data) fail(`[${inst.role}] screenshot gagal`)
  writeFileSync(out, Buffer.from(r.data, 'base64'))
  process.stdout.write(`${out}\n`)
}

async function main() {
  if (list) return printMap()
  if (stop) {
    for (const inst of TARGETS) stopClone(inst)
    process.stdout.write(onlyRoles ? 'Klon e2e terpilih dimatikan.\n' : 'Semua klon e2e dimatikan.\n')
    return
  }
  if (op === 'preflight') return runPreflight()
  if (op === 'status') return runStatus()
  if (op === 'nav') return runNav()
  if (op === 'eval') return runEval()
  if (op === 'click') return runClick()
  if (op === 'shot') return runShot()

  // Tidak ada subcommand → mode BUKA (disengaja): launch semua jendela role.
  const base = await resolveBase()
  const ready = []
  for (const inst of TARGETS) {
    ready.push({ inst, url: await ensureInstance(base, inst) })
  }

  process.stdout.write(`\nBrowser e2e siap — ${ready.length} INSTANCE TERPISAH (PWA app-mode)\n`)
  process.stdout.write(`base: ${base}\n`)
  process.stdout.write(`Aksi pakai jendela ini (reuse-only): npm run e2e -- status|nav|eval|click|shot\n`)
  for (const { inst, url } of ready) {
    process.stdout.write(`  • ${inst.role.padEnd(11)} ${url}\n`)
    process.stdout.write(`      CDP ${endpoint(inst.port)}\n`)
  }
  process.stdout.write(`\nBiarkan jendela terbuka. Tutup: npm run e2e -- --stop\n`)
}

main().catch((err) => {
  process.stderr.write(`Gagal: ${err.message}\n`)
  process.exit(1)
})
