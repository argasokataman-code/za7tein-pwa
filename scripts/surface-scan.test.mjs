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

// ── Design gate (ratchet nilai mentah) ────────────────────────────────────
// 7. Counter ini yang menentukan gagal/lolos commit, jadi diuji langsung.
const debtSrc = src.slice(src.indexOf('function stripComments'), src.indexOf('function designMetrics'))
// eslint-disable-next-line no-new-func
const { countScssDebt, countTsxDebt, debtGrowth } = new Function(
  `${debtSrc}; return { countScssDebt, countTsxDebt, debtGrowth }`,
)()

check('font-size px dihitung', countScssDebt('a { font-size: 14px; }').fontSizePx, 1)
check('font-size token tidak dihitung', countScssDebt('a { font-size: var(--text-sm); }').fontSizePx, 0)
check('rgba dihitung', countScssDebt('a { background: rgba(0,0,0,.5); }').color, 1)
check('radius token tidak dihitung', countScssDebt('a { border-radius: var(--radius-lg); }').radiusPx, 0)
check('radius px besar dihitung', countScssDebt('a { border-radius: 12px; }').radiusPx, 1)
check('radius mikro (3px) ditoleransi', countScssDebt('a { border-radius: 3px; }').radiusPx, 0)
check('jarak token tidak dihitung', countScssDebt('a { padding: var(--space-4); }').spacePx, 0)
check('nudge mikro (3px) ditoleransi', countScssDebt('a { padding: 3px var(--space-2); }').spacePx, 0)
check('jarak px besar dihitung', countScssDebt('a { gap: 12px; }').spacePx, 1)
check('eyebrow uppercase dihitung', countScssDebt('a { text-transform: uppercase; }').uppercase, 1)
check('uppercase di komentar tidak dihitung', countScssDebt('/* text-transform: uppercase */').uppercase, 0)
check('shadow token tidak dihitung', countScssDebt('a { box-shadow: var(--shadow-md); }').rawShadow, 0)
check('shadow karangan dihitung', countScssDebt('a { box-shadow: 0 2px 6px #0002; }').rawShadow, 1)
check('eyebrow baru terdeteksi', debtGrowth({ a: { uppercase: 1 } }, { a: { uppercase: 0 } }).length, 1)
check('shadow baru terdeteksi', debtGrowth({ a: { rawShadow: 3 } }, { a: { rawShadow: 2 } }).length, 1)
check('komentar blok tidak dihitung', countScssDebt('/* #fff font-size: 12px */ a { color: red; }').fontSizePx, 0)
check('komentar baris tidak dihitung', countScssDebt('a { // font-size: 12px\n}').fontSizePx, 0)
check('token-ok melewati baris', countScssDebt('a { color: rgba(0,0,0,.2); } // token-ok').color, 0)
check('style TSX mentah dihitung', countTsxDebt("<b style={{ color: '#fff', fontSize: 14 }} />").color, 1)
check('style TSX token tidak dihitung', countTsxDebt("<b style={{ color: 'var(--text-primary)' }} />").color, 0)
check('debt naik terdeteksi', debtGrowth({ a: { fontSizePx: 2 } }, { a: { fontSizePx: 1 } }).length, 1)
check('debt turun bukan pelanggaran', debtGrowth({ a: { fontSizePx: 0 } }, { a: { fontSizePx: 1 } }).length, 0)
check('berkas baru dgn nilai mentah terdeteksi', debtGrowth({ b: { color: 1 } }, {}).length, 1)

// ── Detektor slop (stripe, palet tone, fx) ────────────────────────────────
check('kelas tone bergilir dihitung', countScssDebt('.x--tone-0 { background: var(--orange-soft); }').toneCycle, 1)
check('tone ganda dihitung', countScssDebt('.a--tone-0 {} .b--tone-1 {}').toneCycle, 2)
check('kata mengandung tone bukan hitungan', countScssDebt('.stone-ax { color: var(--text-primary); }').toneCycle, 0)
check('tone semantik bernama tidak dihitung', countScssDebt('.tone-info { --tone-soft: var(--info-soft); }').toneCycle, 0)
check('stripe var space dihitung', countScssDebt('.x { border-left: var(--space-1) solid var(--orange-ink); }').decorativeStripe, 1)
check('stripe px tebal dihitung', countScssDebt('.x { border-left: 4px solid var(--danger); }').decorativeStripe, 1)
check('garis rambut 1px ditoleransi', countScssDebt('.x { border-left: 1px solid var(--border); }').decorativeStripe, 0)
check('border-left-color bukan stripe', countScssDebt('.x { border-left-color: var(--sa7tein-orange); }').decorativeStripe, 0)
check('teks gradien dihitung', countScssDebt('.x { -webkit-background-clip: text; }').slopFx, 1)
check('glassmorphism dihitung', countScssDebt('.x { backdrop-filter: blur(8px); }').slopFx, 1)
check('gradien dgn token-ok diizinkan', countScssDebt('.x { background-clip: text; } /* token-ok */').slopFx, 0)
check('kunci detektor baru ikut ratchet', debtGrowth({ a: { toneCycle: 1 } }, { a: { color: 0 } }).length, 1)
check('detektor baru diabaikan saat hanya kunci dikenal', debtGrowth({ a: { toneCycle: 1 } }, { a: { color: 0 } }, { onlyKnownKeys: true }).length, 0)
check('kunci dikenal tetap dijaga saat onlyKnownKeys', debtGrowth({ a: { color: 1 } }, { a: { color: 0 } }, { onlyKnownKeys: true }).length, 1)

console.log(failed ? `\n${failed} gagal` : '\nsemua lolos')
process.exit(failed ? 1 : 0)
