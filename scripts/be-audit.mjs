#!/usr/bin/env node
/**
 * Audit integrasi FE ↔ Worker (api v2) tanpa perlu login.
 *
 * Ekstrak setiap query `/rest/v1/...` dari `src/api/*.ts`, tembak ke Worker
 * dengan placeholder `${…}` diganti `1`, lalu laporkan status per query.
 * Tujuannya menangkap dua kelas bug:
 *   1. `400` — kolom/tabel yang tak ada di D1 (satu kolom salah mematikan daftar)
 *   2. `200 []` — query benar tapi tabelnya kosong (UI jatuh ke mock, bukan bug)
 *
 * Pakai:
 *   node scripts/be-audit.mjs                 # ringkas: hanya masalah (400/5xx)
 *   node scripts/be-audit.mjs --all           # semua query + jumlah baris
 *   node scripts/be-audit.mjs --json          # keluaran mesin
 *   BE_BASE=https://... node scripts/be-audit.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = (process.env.BE_BASE || 'https://sa7tein-api-cf.sa7tein-pwa.workers.dev').replace(/\/+$/, '')
const showAll = process.argv.includes('--all')
const asJson = process.argv.includes('--json')
const API_DIR = join(process.cwd(), 'src', 'api')

/** Kumpulan query unik per tabel. */
function extractQueries() {
  const found = new Map()
  for (const file of readdirSync(API_DIR).filter((f) => f.endsWith('.ts'))) {
    const text = readFileSync(join(API_DIR, file), 'utf8')
    // Delimiter boleh berisi kutip lain (mis. `join(',')` di dalam template) —
    // karena itu isi literal diambil lazy sampai delimiter pembuka yang sama.
    const re = /(['"`])([a-z_][a-z0-9_]*)\1\s*,\s*(['"`])(\?[\s\S]*?)\3/g
    let m
    while ((m = re.exec(text))) {
      const table = m[2]
      // `${PROMO_SELECT}` (konstanta) diganti `1` lalu `select=1` → `select=*`
      // supaya tak jadi false positive "identifier tidak valid: 1".
      const query = m[4].replace(/\$\{[^}]*\}/g, '1').replace(/select=1(?=[&"`']|$)/g, 'select=*')
      const key = `${table}${query}`
      if (!found.has(key)) found.set(key, { file, table, query })
    }
  }
  return [...found.values()]
}

async function probe({ table, query, file }) {
  const q = /limit=/.test(query) ? query : `${query}&limit=1`
  const url = `${BASE}/rest/v1/${table}${q}`
  try {
    const res = await fetch(url)
    const body = await res.text()
    let rows = null
    let message = ''
    try {
      const parsed = JSON.parse(body)
      if (Array.isArray(parsed)) rows = parsed.length
      else message = JSON.stringify(parsed).slice(0, 90)
    } catch {
      message = body.slice(0, 90)
    }
    return { file, table, query, status: res.status, rows, message }
  } catch (e) {
    return { file, table, query, status: 'ERR', rows: null, message: String(e) }
  }
}

const queries = extractQueries()
const results = await Promise.all(queries.map(probe))
const bad = results.filter((r) => typeof r.status === 'number' && r.status >= 400)
const empty = results.filter((r) => r.status === 200 && r.rows === 0)

if (asJson) {
  console.log(JSON.stringify({ total: results.length, bad, empty, tables: [...new Set(results.map((r) => r.table))].sort(), results }, null, 2))
} else {
  console.log(`BE: ${BASE}`)
  console.log(`query FE diekstrak: ${results.length} · gagal(>=400): ${bad.length} · kosong(200 []): ${empty.length}\n`)
  const rows = showAll ? results : bad
  for (const r of rows) {
    const flag = typeof r.status === 'number' && r.status >= 400 ? 'FAIL' : r.rows === 0 ? 'EMPTY' : 'ok'
    console.log(`  ${flag.padEnd(5)} ${String(r.status).padEnd(4)} ${r.table.padEnd(24)} ${r.query.slice(0, 78)}`)
    if (flag !== 'ok') console.log(`        ${r.file} · ${r.message}`)
  }
  if (!showAll) {
    console.log(`\n${empty.length} query benar tapi tabelnya kosong (UI pakai mock):`)
    for (const r of empty) console.log(`  - ${r.table}`)
  }
}
process.exit(bad.length ? 1 : 0)
