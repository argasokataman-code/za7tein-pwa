// Jalankan semua self-check murni (`scripts/*-check.mjs`) satu perintah.
//
// Alasannya: tiap check butuh loader `ts-resolve` (impor tanpa ekstensi + shim
// `import.meta.env`), jadi menjalankannya satu-satu lewat `node scripts/x.mjs`
// gagal -- dan karena itu tak ada yang menjalankannya, assertion-nya basi
// diam-diam (mis. flag "belum tersedia" yang sudah lama `true`).
//
// Dikecualikan: `api-spec-check.mjs` (menembak Supabase + jaringan, bukan
// logika murni). Jalankan manual kalau memang perlu.
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
// `--offline` dipakai pre-commit: `live-rate-check` memanggil API kurs, dan
// commit tak boleh gagal hanya karena jaringan mati.
const OFFLINE = process.argv.includes('--offline')
const SKIP = new Set(['api-spec-check.mjs', ...(OFFLINE ? ['live-rate-check.mjs'] : [])])
const checks = readdirSync(here)
  .filter((f) => f.endsWith('-check.mjs') && !SKIP.has(f))
  .sort()

const run = (file) =>
  new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['--import', path.join(here, 'lib/ts-resolve.mjs'), path.join(here, file)],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.on('close', (code) => resolve({ file, code, out }))
  })

const results = []
for (const file of checks) results.push(await run(file)) // serial: hindari beban bareng

const failed = results.filter((r) => r.code !== 0)
for (const r of results) {
  console.log(`${r.code === 0 ? 'ok  ' : 'FAIL'} ${r.file}`)
  if (r.code !== 0) console.log(r.out.trim().split('\n').slice(-6).join('\n'))
}
console.log(`\ncheck-self: ${results.length - failed.length}/${results.length} lolos`)
if (failed.length) process.exitCode = 1
