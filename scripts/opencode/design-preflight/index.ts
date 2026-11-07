// design-preflight — OpenCode v2 plugin.
//
// Menegakkan urutan "preflight dulu, gambar kemudian". Tanpa persetujuan
// preflight, tool FigCraft yang MENGUBAH dokumen ditolak. Protokol di AGENTS.md
// §0b tidak cukup: 2026-11-07 bingkai `Pesanan / 1` digambar dari ringkasan
// percakapan lalu dibangun ulang karena gate FigCraft hanya mengukur invarian
// (44px, token, kontras, luberan), bukan kepadatan/hierarki.
//
// Alur yang diizinkan:
//   node scripts/design-preflight.mjs --frame "<nama>"   (template)
//   <isi: sumber path:line, brief + angka, DNA, anti-slop, verifikasi>
//   node scripts/design-preflight.mjs --approve --frame "<nama>"
//
// Persetujuan disimpan di `<repo>/.design-preflight.json` dan kedaluwarsa
// (default 12 jam) supaya bukan izin permanen.
//
// Diagnosa: /tmp/design-preflight.log. Mode bayangan: DESIGN_PREFLIGHT_SHADOW=1

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

const SHADOW = process.env.DESIGN_PREFLIGHT_SHADOW === '1';
const LOG = '/tmp/design-preflight.log';
const TTL_FALLBACK = 12;

const STEER = (why) =>
  `Design preflight belum disetujui (${why}). ` +
  'Isi checklist dulu: `npm run design:preflight -- --frame "<nama bingkai>"`, ' +
  'lengkapi sumber path:line + brief berangka + butir DNA + anti-slop, lalu ' +
  '`npm run design:preflight -- --approve --frame "<nama bingkai>"`. ' +
  'Belum ada preflight = belum boleh menggambar (AGENTS.md §0b).';

function note(obj) {
  try {
    appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...obj }) + '\n');
  } catch {}
}

/** Akar repo dicari dari cwd; tanpa .rules.json plugin fail-open (proyek lain). */
function repoRoot() {
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(join(dir, '.rules.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

function readState(root) {
  const stateFile = join(root, '.design-preflight.json');
  if (!existsSync(stateFile)) return { ok: false, why: 'belum ada .design-preflight.json' };
  let state;
  try {
    state = JSON.parse(readFileSync(stateFile, 'utf8'));
  } catch {
    return { ok: false, why: 'state tidak terbaca' };
  }
  if (!state?.frame) return { ok: false, why: 'state tanpa frame' };
  const ttl = Number(state.ttlHours ?? TTL_FALLBACK);
  const ageHours = (Date.now() - Date.parse(state.approvedAt)) / 3600000;
  if (!Number.isFinite(ageHours) || ageHours > ttl) return { ok: false, why: `persetujuan kedaluwarsa (${Math.round(ageHours)} jam)` };
  const rel = String(state.file ?? '');
  const file = isAbsolute(rel) ? rel : join(root, rel);
  if (!existsSync(file)) return { ok: false, why: 'checklist hilang' };
  const text = readFileSync(file, 'utf8');
  if (/^\s*[-*]\s*\[ \]/m.test(text)) return { ok: false, why: 'checklist masih punya kotak kosong' };
  if ((text.match(/\b[\w./-]+\.(?:tsx|ts|scss|json|html|md):\d+/g) ?? []).length < 2) {
    return { ok: false, why: 'checklist tanpa 2 rujukan path:line' };
  }
  // Gerak ikut diputuskan di awal: tanpa bagian 6 yang berisi pilihan transisi,
  // durasi, dan prefers-reduced-motion, animasi jadi tempelan setelah bingkai jadi.
  if (!/^##\s+6\./m.test(text)) return { ok: false, why: 'bagian 6 (gerak) hilang' };
  const motion = text.split(/^## 6\./m)[1] ?? '';
  const types = new Set(motion.match(/(push|dissolve|smartAnimate|slideIn|slideOut|moveIn|moveOut|instant)/g) ?? []);
  if (types.size < 2) return { ok: false, why: 'bagian 6 tanpa pilihan transisi yang jelas' };
  if (!/\b\d{2,4}\s*ms\b/i.test(motion)) return { ok: false, why: 'bagian 6 tanpa durasi ms' };
  if (!/prefers-reduced-motion/i.test(motion)) return { ok: false, why: 'bagian 6 tanpa prefers-reduced-motion' };
  return { ok: true, frame: state.frame };
}

export function preflightStatus(root) {
  return readState(root);
}

// Tool FigCraft yang mengubah dokumen. Baca-saja (get_node, inspect_*,
// list_*, screenshot, export, has_children) sengaja tidak diblokir.
//
// Catatan penting: di Code Mode, panggilan FigCraft masuk sebagai tool
// `execute` dengan kode di resources, bukan sebagai action `figcraft_batch`.
// Karena itu pencocokan memakai gabungan action + resources.
const MUTATING = /(create|set_properties|batch|delete|duplicate|reparent|save_file|import|node\.set)/i;

export function isBlockedCall(action, resources) {
  const haystack = `${action} ${resources.join(' ')}`;
  if (!/figcraft/i.test(haystack)) return false;
  if (/design\/preflight\//.test(haystack)) return false;
  return MUTATING.test(haystack);
}

export default {
  id: 'design-preflight',

  async setup(ctx) {
    await ctx.permission.hook('evaluate', (event) => {
      const action = String(event?.action ?? '');
      const resources = Array.isArray(event?.resources) ? event.resources.map(String) : [];
      if (!isBlockedCall(action, resources)) return;

      const root = repoRoot();
      if (!root) return;
      const state = readState(root);
      note({ action, resources: resources.slice(0, 3), root, ok: state.ok, why: state.why, shadow: SHADOW });
      if (state.ok) return;
      if (SHADOW) return;

      event.effect = 'deny';
      event.message = STEER(state.why ?? 'belum ada persetujuan');
    });
  },
};
