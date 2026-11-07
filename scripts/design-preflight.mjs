#!/usr/bin/env node
/**
 * Preflight desain — gerbang "isi dulu, baru kerja".
 *
 * Masalah yang dicegah: bingkai FigCraft/layar digambar dari ringkasan percakapan,
 * lalu dibangun ulang setelah gate FigCraft ternyata lolos (gate hanya mengukur
 * invarian: 44px, token, kontras, luberan). Kejadian 2026-11-07: `Pesanan / 1`
 * digambar dengan rel kemajuan + `Pesan lagi` selebar kartu, padahal sumbernya
 * kaki terbagi dua dan thumb 84x70 (OrderHistoryCard.tsx:103-130).
 *
 * Alur:
 *   npm run design:preflight -- --frame "Pesanan / 1"   # tulis template checklist
 *   <isi checklist: sumber path:line, brief, DNA, anti-slop, verifikasi>
 *   npm run design:preflight -- --approve --frame "Pesanan / 1"
 *
 * `--approve` menolak checklist yang belum lengkap, lalu menulis
 * `.design-preflight.json` di akar repo. Plugin `plugins2/design-preflight`
 * membaca berkas itu dan menolak tool FigCraft yang mengubah dokumen selama
 * persetujuan belum ada / kedaluwarsa. Tanpa persetujuan, menggambar = menebak.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'docs/design/preflight');
const STATE = join(ROOT, '.design-preflight.json');
const TTL_HOURS = 12;

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'desain';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);

const template = (frame) => `# Preflight desain — ${frame}

Status: draft
Isi setiap kotak. \`--approve\` menolak checklist yang masih punya \`- [ ]\`.
Kotak yang memang tidak berlaku diganti \`- [x] tidak berlaku: <alasan>\`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [ ] Sumber utama: <path/file.tsx:baris-baris> — <elemen apa yang diambil>
- [ ] Sumber kedua: <path/file.tsx:baris> — <mis. geometri CSS, copy, state>
- [ ] Prototipe/irisan (kalau ada): <path:baris>

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [ ] Tujuan bingkai: <satu kalimat, apa yang diputuskan user di layar ini>
- [ ] State yang ditampilkan: <mis. tab Aktif, keranjang terisi, toko tutup>
- [ ] Sengaja tidak ada: <elemen + alasan, mis. rel kemajuan karena tab Aktif tidak menampilkannya>
- [ ] Geometri: gutter 20, padding <n>, tinggi kartu <n> px, jarak blok <n> px, nav di y<n>, target >= 44 px
- [ ] Teks: ukuran/gaya yang dipakai (maks 8 kombinasi), copy persis dari sumber

## 3. DNA mobile yang diawasi

- [ ] MD-01/02 kolom 430 + gutter 20
- [ ] MD-06 sheet satu daftar <= 60% viewport (kalau ada sheet)
- [ ] MD-07 status = chip bertitik warna peran, nominal rata kanan sebaris judul
- [ ] MD-11 rel kanan baris daftar seragam (lebar tetap), tinggi baris meta seragam
- [ ] MD-12 tidak ada anak keluar kotak / terpotong diam-diam
- [ ] MD-13 back menutup overlay dulu, tab replace (kalau ada overlay/navigasi)

## 4. Anti-slop (dicek sebelum menulis)

- [ ] Tidak ada uppercase eyebrow / label seksi huruf besar
- [ ] Tidak ada teks gradien, backdrop-filter, atau kaca
- [ ] Tidak ada palet bergilir per item (--tone-0/1/2) dan tidak ada garis aksen tepi kartu
- [ ] Bayangan dari token --shadow-*; variasi kartu datang dari isi (thumb/judul/chip)
- [ ] Warna/ukuran dari token, bukan nilai karangan

## 5. Verifikasi sebelum kata selesai

- [ ] Screenshot + deskripsi bingkai (bukan hanya JSON)
- [ ] Irirsan kotak anak dalam satu bingkai = 0 (cek x/y/w/h)
- [ ] \`npm run figcraft:audit\` PASS + senior-fe Delivery Gate (HG/PG/QL/MD)

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [ ] Peta gerak: <jumlah> interaksi di bingkai ini dan transisinya — maju \`push\` 320 / kembali \`dissolve\` 220 / overlay-sheet \`dissolve\` 200 / tab \`instant\` (sebut mana yang dipakai)
- [ ] Yang sengaja TIDAK dianimasikan: <daftar + alasan, mis. tab replace MD-13, angka stepper, konten statis>
- [ ] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring/bounce tanpa alasan, transisi layar <= 400 ms
- [ ] Teks dan angka tidak dianimasikan (tanpa count-up/per-karakter); status berubah lewat chip, bukan animasi
- [ ] Angka gerak: durasi <n> ms + easing <nama>, dari konvensi file (F21/F12/F16) atau token \`--motion-*\`
- [ ] \`prefers-reduced-motion\`: transisi jadi instan/crossfade, tanpa pergeseran posisi
`;

const MOTION_TERMS = /(push|dissolve|smartAnimate|slideIn|slideOut|moveIn|moveOut|instant)/g;

function problemsOf(text) {
  const problems = [];
  const unchecked = text.split('\n').filter((l) => /^\s*[-*]\s*\[ \]/.test(l));
  if (unchecked.length) problems.push(`${unchecked.length} kotak belum dicentang`);
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (!new RegExp(`^##\\s+${n}\\.`, 'm').test(text)) problems.push(`bagian ${n} hilang`);
  }
  const refs = text.match(/\b[\w./-]+\.(?:tsx|ts|scss|json|html|md):\d+/g) ?? [];
  if (refs.length < 2) problems.push(`rujukan path:line kurang (${refs.length}/2)`);
  const dna = new Set(text.match(/MD-\d{2}/g) ?? []);
  if (dna.size < 4) problems.push(`butir DNA kurang (${dna.size}/4)`);
  // Anti-slop gerak: tanpa angka durasi dan tanpa pilihan transisi, "motion"
  // hanya jadi tempelan yang ditempel setelah bingkai jadi.
  const motion = text.split(/^## 6\./m)[1] ?? '';
  const motionTypes = new Set(motion.match(MOTION_TERMS) ?? []);
  if (motionTypes.size < 2) problems.push(`pilihan transisi di bagian 6 kurang (${motionTypes.size}/2)`);
  if (!/\b\d{2,4}\s*ms\b/i.test(motion)) problems.push('bagian 6 belum menyebut durasi ms');
  if (!/prefers-reduced-motion/i.test(motion)) problems.push('bagian 6 belum memutuskan prefers-reduced-motion');
  if (!/tidak dianimasikan|instant/i.test(motion)) problems.push('bagian 6 belum menyebut yang sengaja TIDAK dianimasikan');
  const brief = text.split(/^## 2\./m)[1]?.split(/^## 3\./m)[0] ?? '';
  if (!/(px|--space|--touch-min|44)/.test(brief) || (brief.match(/\d+/g) ?? []).length < 6) {
    problems.push('brief belum memuat angka geometri');
  }
  if (/<[^>\n]+>/.test(brief.replace(/`[^`]*`/g, ''))) problems.push('brief masih berisi placeholder <...>');
  if (/Status:\s*draft/i.test(text)) problems.push('status masih draft');
  return problems;
}

function check(frame) {
  const file = join(DIR, `${slugify(frame)}.md`);
  if (!existsSync(file)) return { ok: false, file, problems: ['checklist belum ada: jalankan --frame'] };
  const text = readFileSync(file, 'utf8');
  const problems = problemsOf(text);
  return { ok: problems.length === 0, file, problems };
}

if (has('--approve')) {
  const frame = flag('--frame');
  if (!frame) {
    console.error('--approve butuh --frame "<nama bingkai/layar>"');
    process.exit(2);
  }
  const result = check(frame);
  if (!result.ok) {
    console.error(`GAGAL — preflight "${frame}" belum lengkap:`);
    for (const p of result.problems) console.error(`  - ${p}`);
    console.error(`Berkas: ${result.file}`);
    process.exit(1);
  }
  const at = new Date().toISOString();
  writeFileSync(
    STATE,
    JSON.stringify({ frame, file: result.file.replace(`${ROOT}/`, ''), approvedAt: at, ttlHours: TTL_HOURS }, null, 2) + '\n'
  );
  console.log(`DISETUJUI — ${frame}\n  checklist: ${result.file.replace(`${ROOT}/`, '')}\n  berlaku ${TTL_HOURS} jam`);
  process.exit(0);
}

if (has('--status')) {
  if (!existsSync(STATE)) {
    console.log('belum ada persetujuan (jalankan --frame lalu --approve)');
    process.exit(1);
  }
  const state = JSON.parse(readFileSync(STATE, 'utf8'));
  const age = (Date.now() - Date.parse(state.approvedAt)) / 3600000;
  console.log(`${state.frame} · ${age.toFixed(1)} jam lalu · ${state.file}`);
  process.exit(age <= (state.ttlHours ?? TTL_HOURS) ? 0 : 1);
}

const frame = flag('--frame');
if (!frame) {
  console.log('usage: node scripts/design-preflight.mjs --frame "<nama>" [--approve|--status]');
  process.exit(2);
}
const file = join(DIR, `${slugify(frame)}.md`);
if (existsSync(file)) {
  console.log(`sudah ada: ${file.replace(`${ROOT}/`, '')}`);
} else {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(file, template(frame));
  console.log(`dibuat: ${file.replace(`${ROOT}/`, '')}\nisi dulu, lalu --approve --frame "${frame}"`);
}
