// Self-check parser tag di surface-scan.mjs.
// Logika non-trivial: naif `<button([\s\S]*?)>` salah karena `>` muncul di
// dalam ekspresi JSX (`rating >= 1`) dan di string, sehingga atribut sesudahnya
// tidak terbaca dan tombol yang punya onClick dilaporkan sebagai kontrol mati.
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../scripts/surface-scan.mjs', import.meta.url), 'utf8')
// Ambil fungsi openingTags apa adanya, lalu evaluasi di scope ini.
const fnSrc = src.slice(src.indexOf('function openingTags'), src.indexOf('function checkDeadControls'))
// eslint-disable-next-line no-new-func
const openingTags = new Function(`${fnSrc}; return openingTags`)()

let failed = 0
const check = (name, got, want) => {
  const ok = got === want
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` (dapat ${got}, harusnya ${want})`}`)
}

// 1. `>` di dalam ekspresi JSX tidak mengakhiri tag lebih awal.
const a = '<button type="button" className={`star${rating >= 1 ? " active" : ""}`} onClick={() => setRating(1)}>'
const ta = openingTags(a, 'button')
check('tag dengan >= dan onClick terdeteksi utuh', ta.length, 1)
check('onClick ikut terbaca', /onClick/.test(ta[0].attrs), true)

// 2. `>` di dalam string tidak mengakhiri tag.
const b = '<button title="a > b" onClick={f}>'
check('> di dalam string tidak memotong tag', openingTags(b, 'button')[0].attrs.includes('onClick={f}'), true)

// 3. Tag multi-baris.
const c = '<button\n  type="button"\n  onClick={f}\n>'
check('tag multi-baris', openingTags(c, 'button')[0].attrs.includes('onClick={f}'), true)

// 4. Dua tombol berurutan tidak saling menelan.
const d = '<button onClick={a}>x</button><button onClick={b}>y</button>'
check('dua tombol', openingTags(d, 'button').length, 2)

// 5. `<buttonx>` bukan tombol.
check('buttonx tidak dihitung', openingTags('<buttonx onClick={f}>', 'button').length, 0)

// 6. Tag tanpa handler tetap ditemukan (positif palsu tidak boleh semua lolos).
const e = '<button type="button" className="merchant-signout">'
check('tombol mati terdeteksi', openingTags(e, 'button')[0].attrs.includes('onClick'), false)

console.log(failed ? `\n${failed} gagal` : '\nsemua lolos')
process.exit(failed ? 1 : 0)
