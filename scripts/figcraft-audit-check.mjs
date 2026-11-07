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
  pages: [1, 30],
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
      children: [11, 12, 13, 14, 15, 16, 17, 18, 20, 21],
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
    // Ikon di dalam kotak kecil yang tidak di tengah (kejadian nyata: `Ikon pin`
    // 20x20 di tile 40 duduk di (15,13), `Ikon kurs` 22x22 di (13,14)).
    21: node(21, 'frame', 'Tile Ikon', {
      parent: 10,
      x: 300,
      y: 600,
      w: 40,
      h: 40,
      children: [22, 23],
      props: { fills: [], corners: { radii: [16, 16, 16, 16] } },
    }),
    22: node(22, 'vector', 'Ikon Geser', {
      parent: 21,
      x: 15,
      y: 13,
      w: 20,
      h: 20,
      props: { strokes: [{ type: 'solid', color: COLOR }] },
    }),
    // Pembanding: ikon yang sudah center tidak boleh ikut dilaporkan.
    23: node(23, 'vector', 'Ikon Center', {
      parent: 21,
      x: 10,
      y: 10,
      w: 20,
      h: 20,
      props: { strokes: [{ type: 'solid', color: COLOR }] },
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
    // Halaman kedua, BUKAN halaman aktif: pelanggaran di sini harus tetap terbaca.
    // Gerbang lama hanya membaca halaman aktif, jadi memindahkan bingkai bermasalah
    // ke halaman lain membuatnya lolos tanpa jejak (kejadian nyata 2026-11-07).
    30: {
      id: 30,
      type: 'page',
      name: 'Page 2',
      children: [31],
      flows: [],
      background: { r: 1, g: 1, b: 1, a: 1 },
    },
    31: node(31, 'frame', 'Uji halaman dua', {
      w: 390,
      h: 844,
      children: [32, 33, 34, 35],
      props: {
        fills: [{ type: 'solid', color: { r: 0.956, g: 0.956, b: 0.965, a: 1 } }],
        corners: { radii: [30, 30, 30, 30], smoothing: 0 },
        layout: { mode: 'none' },
      },
    }),
    32: node(32, 'frame', 'Button Kecil', {
      parent: 31,
      x: 20,
      y: 20,
      w: 20,
      h: 20,
      props: {
        fills: [],
        interactions: [
          { trigger: { type: 'onClick' }, actions: [{ type: 'navigate', dest: 10 }] },
        ],
      },
    }),
    // Kontrol yang aksinya dikecualikan tetap wajib 44 px (FR-24). Tanpa node ini,
    // pengecualian `deadButton` diam-diam mematikan pemeriksaan ukuran: kejadian
    // nyata `Button lacak` 90x36 lolos karena namanya masuk DEAD_BUTTON_EXEMPT.
    33: node(33, 'frame', 'Button Kecil Tanpa Aksi', {
      parent: 31,
      x: 20,
      y: 80,
      w: 90,
      h: 36,
      props: { fills: [] },
    }),
    // Tombol stepper bernama `Tombol*`: dulu tak diukur karena pemeriksaan hanya
    // mencari `Button*`. Kejadian nyata 2026-11-07: `Tombol kurang` 32x32.
    34: node(34, 'frame', 'Tombol Stepper Kecil', {
      parent: 31,
      x: 20,
      y: 140,
      w: 32,
      h: 32,
      props: { fills: [] },
    }),
    // Chip dengan teks selebar chip-nya (padding 0). Kejadian nyata: `Pil jumlah
    // menu`, `Chip zona`, `Chip stok habis`, `Chip nonaktif`.
    35: node(35, 'frame', 'Chip Tanpa Padding', {
      parent: 31,
      x: 130,
      y: 140,
      w: 80,
      h: 24,
      children: [36],
      props: { fills: [{ type: 'solid', color: COLOR }], corners: { radii: [12, 12, 12, 12] } },
    }),
    36: node(36, 'text', 'Teks Chip', {
      parent: 35,
      x: 0,
      y: 4,
      w: 80,
      h: 16,
      props: {
        characters: 'Chip',
        style: {
          font_family: 'Plus Jakarta Sans',
          font_style: 'Medium',
          font_size: 13,
          line_height: { unit: 'percent', value: 150 },
          letter_spacing: { unit: 'percent', value: 0 },
        },
        fills: [{ type: 'solid', color: COLOR }],
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
    return { code: err.status ?? 1, out: String(err.stdout || "") , err: String(err.stderr || "")};
  }
};

const { code, out, err: stderr } = run();
rmSync(tmp, { recursive: true, force: true });

let report;
try {
  report = JSON.parse(out);
} catch {
  console.error("GAGAL — keluaran audit bukan JSON:\n" + out.slice(0, 800) + "\nSTDERR:" + (stderr||""));
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
  ['iconCenter', 'ikon 20x20 di (15,13) dalam tile 40 (tidak di tengah) tidak tertangkap'],
  ['chipFlush', 'teks chip selebar chip (padding 0) tidak tertangkap'],
];
const failures = expectations.filter(([check]) => !has(check)).map(([, msg]) => msg);

// Halaman non-aktif wajib ikut diaudit: gerbang lama melewatkannya diam-diam.
const offPage = (report.findings || []).filter((f) => f.page === 'Page 2');
if (!offPage.length) failures.push('pelanggaran di halaman non-aktif (Page 2) tidak terbaca');
if (!offPage.some((f) => f.check === 'hotspot')) {
  failures.push('hotspot 20x20 di halaman non-aktif tidak tertangkap');
}
// Pengecualian aksi (deadButton) tidak boleh mematikan FR-24.
if (
  !(report.findings || []).some(
    (f) => f.check === 'hotspot' && f.node === 'Button Kecil Tanpa Aksi'
  )
) {
  failures.push('tombol tanpa aksi 90x36 tidak diperiksa FR-24 (lubang pengecualian deadButton)');
}
// Kontrol bernama `Tombol*` (stepper qty) juga wajib 44 px.
if (
  !(report.findings || []).some(
    (f) => f.check === 'hotspot' && f.node === 'Tombol Stepper Kecil'
  )
) {
  failures.push('tombol stepper 32x32 bernama `Tombol*` tidak diperiksa FR-24');
}

if (code !== 1) failures.push(`exit code ${code}, harusnya 1 (ada regresi)`);
if (!(report.regressions || []).length) failures.push('regresi tidak dilaporkan ke baseline');

if (failures.length) {
  console.error('GAGAL — ' + failures.length + ' pemeriksaan tidak bekerja:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

console.log(
  `LULUS — ${expectations.length} pemeriksaan tertangkap, halaman non-aktif ikut diaudit, ` +
    `exit 1, ${report.regressions.length} regresi dilaporkan.`
);
