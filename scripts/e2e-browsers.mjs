#!/usr/bin/env node
/**
 * e2e-browsers.mjs — buka SATU browser TERPISAH per peran (customer,
 * merchant, courier, admin, superadmin) untuk testing flow e2e.
 *
 * Tiap peran = INSTANCE browser sendiri, bukan tab di browser yang sama.
 * Keempat PWA berbagi satu origin, jadi beberapa tab di browser yang sama
 * berbagi `localStorage` (redux-persist: cart/favorites/accountSetup) dan sesi
 * bisa saling menimpa. Browser terpisah = profil + storage sendiri, seperti
 * beberapa pengguna di perangkat berbeda — itu yang membuat e2e jujur.
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
 *   npm run e2e                # buka semua (dev server 5173-5176)
 *   npm run e2e -- --pwa       # pakai hasil build (localhost:4173)
 *   npm run e2e -- --base http://localhost:5173
 *   npm run e2e -- --list      # cetak peta port terkunci, tanpa buka apa pun
 *   npm run e2e -- --stop      # matikan semua klon e2e
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
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
  { role: 'merchant', path: '/merchant/signin', pos: '860,40' },
  { role: 'courier', path: '/courier/signin', pos: '1700,40' },
  { role: 'admin', path: '/admin/', pos: '20,960' },
  { role: 'superadmin', path: '/superadmin/', pos: '860,960' },
]

const INSTANCES = ROLE_DEFS.map((def, i) => {
  const key = `E2E_${def.role.toUpperCase()}`
  return {
    role: def.role,
    port: Number(process.env[`${key}_PORT`]) || PORT_BASE + i,
    profile: path.join(BIN_DIR, process.env[`${key}_PROFILE`] || `profile-e2e-${def.role}`),
    path: process.env[`${key}_PATH`] || def.path,
    pos: def.pos,
  }
})

const argv = process.argv.slice(2)
const pwa = argv.includes('--pwa')
const stop = argv.includes('--stop')
const list = argv.includes('--list')
const baseArg = argv.find((a) => a.startsWith('--base='))?.slice('--base='.length)

const endpoint = (port) => `http://127.0.0.1:${port}`

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

function launchClone(inst) {
  if (!existsSync(LAUNCH_SH)) throw new Error(`launch.sh tidak ada di ${LAUNCH_SH}`)
  mkdirSync(inst.profile, { recursive: true })
  process.stderr.write(`[${inst.role}] klon belum hidup — luncurkan klon Brave headed (port ${inst.port})\n`)
  execFileSync(LAUNCH_SH, ['--fresh'], {
    stdio: 'ignore',
    env: {
      ...process.env,
      BRAVE_CDP_PORT: String(inst.port),
      BRAVE_PROFILE: inst.profile,
      BRAVE_EXTRA_ARGS:
        process.env.E2E_EXTRA_ARGS ||
        `--window-size=820,900 --window-position=${inst.pos} --touch-events=enabled`,
    },
  })
}

async function ensureInstance(base, inst) {
  let tabs = await cdpList(inst.port)
  if (tabs === null) {
    await assertPortFree(inst)
    launchClone(inst)
    await sleep(2500)
    tabs = (await cdpList(inst.port)) || []
  }
  const url = inst.path.startsWith('http') ? inst.path : base + inst.path
  const matcher = new URL(url).pathname
  let tab = (tabs || []).find((t) => t.type === 'page' && (t.url || '').includes(matcher))
  if (!tab) {
    tab = await newTab(inst.port, url)
    tabs = [...(tabs || []), tab]
  }
  await closeBlankTabs(inst.port, tabs)
  return url
}

function stopClone(inst) {
  if (!existsSync(STOP_SH)) return
  execFileSync(STOP_SH, [], {
    stdio: 'ignore',
    env: { ...process.env, BRAVE_CDP_PORT: String(inst.port), BRAVE_PROFILE: inst.profile },
  })
}

async function main() {
  if (list) return printMap()

  if (stop) {
    for (const inst of INSTANCES) stopClone(inst)
    process.stdout.write('Semua klon e2e dimatikan.\n')
    return
  }

  const base = await resolveBase()
  const ready = []
  for (const inst of INSTANCES) {
    ready.push({ inst, url: await ensureInstance(base, inst) })
  }

  process.stdout.write(`\nBrowser e2e siap — ${ready.length} INSTANCE TERPISAH (headed)\n`)
  process.stdout.write(`base: ${base}\n`)
  for (const { inst, url } of ready) {
    const { Browser } = await (await fetch(`${endpoint(inst.port)}/json/version`)).json()
    process.stdout.write(`  • ${inst.role.padEnd(11)} ${url}\n`)
    process.stdout.write(`      MCP brave-debug-${inst.role}  CDP ${endpoint(inst.port)}  ${Browser}\n`)
  }
  process.stdout.write(`\nBiarkan jendela terbuka. Tutup: npm run e2e -- --stop\n`)
}

main().catch((err) => {
  process.stderr.write(`Gagal: ${err.message}\n`)
  process.exit(1)
})
