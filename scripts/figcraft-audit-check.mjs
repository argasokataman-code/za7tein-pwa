#!/usr/bin/env node
/**
 * Self-check untuk scripts/figcraft-audit.mjs.
 *
 * Membuat file .figcraft sintetis berisi pelanggaran yang disengaja, menjalankan
 * audit, lalu memastikan tiap pemeriksaan benar-benar menangkapnya. Tanpa ini,
 * gerbang FigCraft bisa lolos diam-diam saat pemeriksaannya rusak (pernah
 * terjadi di surface-scan: parser tag berhenti di ">" dan melaporkan tombol
 * ber-onClick sebagai kontrol mati).
 *
 *   node scripts/figcraft-audit-check.mjs   (ikut otomatis lewat npm run check:self)
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLOR = { r: 0.07, g: 0.14, b: 0.2, a: 1 }; // #123456 (bukan token)

const node = (id, type, name, extra = {}) => ({
  id,
  type,
  name,
  parent: extra.parent ?? 1,
  transform: [1, 0, 0, 1, extra.x ?? 0, extra.y ?? 0],
  width: extra.w ?? 100,
  height: extra.h ?? 40,
  child_layout: {
    sizing_h: 'fixed',
    sizing_v: 'fixed',
    absolute: Boolean(extra.absolute),
  },
  children: extra.children,
  ...extra.props,
});

const doc = {
  format: 'figcraft',
  version: 1,
  imageIndex: [],
  name: 'fixture',
  pages: [1],
  current_page: 1,
  styles: [],
  variables: { collections: [], variables: [] },
  nodes: {
    1: {
      id: 1,
      type: 'page',
      name: 'Page 1',
      children: [10, 19],
      flows: [{ name: 'Mulai', start: 10 }],
      background: { r: 1, g: 1, b: 1, a: 1 },
    },
    10: node(10, 'frame', 'Uji / 1', {
      w: 390,
      h: 844,
      children: [11, 12, 13, 14, 15, 16, 17, 18, 20],
      props: {
        fills: [{ type: 'solid', color: { r: 0.956, g: 0.956, b: 0.965, a: 1 } }],
        corners: { radii: [30, 30, 30, 30], smoothing: 0 },
        layout: { mode: 'none' },
      },
    }),
    // Body dengan padding 20 kiri/kanan, satu anak meluber keluar kotak.
    11: node(11, 'frame', 'Body', {
      parent: 10,
      w: 390,
      h: 844,
      absolute: true,
      x: 0,
      y: 0,
      children: [12, 13, 14, 15, 16, 17, 18],
      props: { layout: { mode: 'vertical', padding: [0, 20, 16, 20] }, fills: [] },
    }),
    // Tombol tanpa aksi
    12: node(12, 'frame', 'Button Tanpa Aksi', {
      parent: 11,
      x: 0,
      y: 0,
      w: 350,
      h: 52,
      props: { fills: [{ type: 'solid', color: COLOR }], corners: { radii: [14, 14, 14, 14] } },
    }),
    // Navigate ke bingkai yang tidak ada + hotspot 20x20
    13: node(13, 'rectangle', 'Tautan Kecil', {
      parent: 11,
      x: 0,
      y: 60,
      w: 20,
      h: 20,
      props: {
        fills: [{ type: 'solid', color: COLOR }],
        interactions: [{ trigger: { type: 'onClick' }, actions: [{ type: 'navigate', dest: 999 }] }],
      },
    }),
    // Meluber keluar induk (y negatif)
    14: node(14, 'rectangle', 'Meluber', {
      parent: 11,
      x: 0,
      y: -30,
      w: 350,
      h: 20,
      props: { fills: [{ type: 'solid', color: COLOR }] },
    }),
    // Radius di luar skala
    15: node(15, 'rectangle', 'Radius Aneh', {
      parent: 11,
      x: 0,
      y: 100,
      w: 350,
      h: 40,
      props: { fills: [{ type: 'solid', color: COLOR }], corners: { radii: [20, 20, 20, 20] } },
    }),
    // Teks kontras rendah di atas putih
    16: node(16, 'text', 'Teks Pucat', {
      parent: 11,
      x: 0,
      y: 150,
      w: 200,
      h: 20,
      props: {
        characters: 'Teks pucat sekali',
        style: {
          font_family: 'Plus Jakarta Sans',
          font_style: 'Medium',
          font_size: 13,
          line_height: { unit: 'percent', value: 150 },
          letter_spacing: { unit: 'percent', value: 0 },
        },
        fills: [
          {
            type: 'solid',
            color: { r: 0.58, g: 0.64, b: 0.7, a: 1 }, // #94A3B8
          },
        ],
      },
    }),
    // Ikon melar: vektor senama 6x14 vs 158x14 (kejadian nyata Chevron 2396)
    17: node(17, 'vector', 'Chevron', {
      parent: 11,
      x: 0,
      y: 180,
      w: 6,
      h: 14,
      props: { strokes: [{ type: 'solid', color: COLOR }] },
    }),
    18: node(18, 'vector', 'Chevron', {
      parent: 11,
      x: 100,
      y: 180,
      w: 158,
      h: 14,
      props: { strokes: [{ type: 'solid', color: COLOR }] },
    }),
    // Ikon dengan `sizingH: fill` di dalam baris: 26x26 -> 56x26 (kejadian nyata:
    // 9 vektor di-stretch massal 2026-11-07, lingkaran jadi elips, gerbang lama lolos).
    20: node(20, 'vector', 'Ikon Melar', {
      parent: 10,
      x: 200,
      y: 400,
      w: 56,
      h: 26,
      props: {
        child_layout: { sizing_h: 'fill', sizing_v: 'fixed', absolute: false },
        strokes: [{ type: 'solid', color: COLOR }],
      },
    }),
    // Bingkai kedua digeser 6 px dari kolom 454 (kejadian nyata: `Verifikasi / 4` x1368).
    19: node(19, 'frame', 'Uji / 2', {
      w: 390,
      h: 844,
      x: 6,
      y: 1120,
      children: [],
      props: {
        fills: [{ type: 'solid', color: { r: 0.956, g: 0.956, b: 0.965, a: 1 } }],
        corners: { radii: [30, 30, 30, 30], smoothing: 0 },
        layout: { mode: 'none' },
      },
    }),
  },
};

const tmp = mkdtempSync(join(tmpdir(), 'figcraft-audit-'));
const jsonPath = join(tmp, 'document.json');
const zipPath = join(tmp, 'fixture.figcraft');
writeFileSync(jsonPath, JSON.stringify(doc));

let zipOk = true;
try {
  execFileSync('zip', ['-q', '-j', zipPath, jsonPath], { stdio: 'ignore' });
} catch {
  zipOk = false;
}

if (!zipOk) {
  console.log('SKIP — perintah `zip` tidak ada, fixture .figcraft tidak bisa dibuat.');
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}

const run = () => {
  try {
    const out = execFileSync(
      'node',
      [resolve(ROOT, 'scripts/figcraft-audit.mjs'), '--file', zipPath, '--json'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
    );
    return { code: 0, out };
  } catch (err) {
    return { code: err.status ?? 1, out: String(err.stdout || '') };
  }
};

const { code, out } = run();
rmSync(tmp, { recursive: true, force: true });

let report;
try {
  report = JSON.parse(out);
} catch {
  console.error('GAGAL — keluaran audit bukan JSON:\n' + out.slice(0, 800));
  process.exit(1);
}

const has = (check) => (report.findings || []).some((f) => f.check === check);
const expectations = [
  ['overflow', 'anak yang keluar kotak induk tidak tertangkap'],
  ['deadButton', 'tombol tanpa aksi tidak tertangkap'],
  ['danglingDest', 'navigate ke dest yang tidak ada tidak tertangkap'],
  ['hotspot', 'hotspot 20x20 tidak tertangkap'],
  ['offTokenColor', 'warna #123456 tidak tertangkap'],
  ['offScaleRadius', 'radius 20 tidak tertangkap'],
  ['contrast', 'teks #94A3B8 di putih tidak tertangkap'],
  ['stretchedIcon', 'Chevron 158x14 vs 6x14 (ikon melar) tidak tertangkap'],
  ['canvasGrid', 'bingkai x6 (di luar kolom 454) tidak tertangkap'],
  ['iconFill', 'vektor dengan sizingH fill (ikon melar 26x26 -> 56x26) tidak tertangkap'],
];
const failures = expectations.filter(([check]) => !has(check)).map(([, msg]) => msg);

if (code !== 1) failures.push(`exit code ${code}, harusnya 1 (ada regresi)`);
if (!(report.regressions || []).length) failures.push('regresi tidak dilaporkan ke baseline');

if (failures.length) {
  console.error('GAGAL — ' + failures.length + ' pemeriksaan tidak bekerja:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

console.log(
  `LULUS — ${expectations.length} pemeriksaan tertangkap, exit 1, ` +
    `${report.regressions.length} regresi dilaporkan.`
);
