#!/usr/bin/env node
/**
 * FigCraft audit — gerbang mekanis untuk aturan di docs/design/figcraft-rules.md.
 *
 * Membaca file .figcraft (zip berisi document.json), bukan aplikasi hidup, jadi
 * bisa jalan tanpa app FigCraft dan ikut pre-commit/CI. Ratchet: baseline di
 * docs/design/figcraft-debt.json hanya boleh turun. Menambah pelanggaran baru =
 * exit 1.
 *
 *   node scripts/figcraft-audit.mjs
 *   node scripts/figcraft-audit.mjs --file design/beta-v1.figcraft
 *   node scripts/figcraft-audit.mjs --update-baseline   (menolak kalau naik)
 *   node scripts/figcraft-audit.mjs --json
 */
import { execFileSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_FILE = 'design/beta-v1.figcraft';
const BASELINE_PATH = 'docs/design/figcraft-debt.json';
const TOKENS_PATH = 'src/styles/_tokens.scss';

// ── acuan angka (docs/design/figcraft-rules.md §0) ──────────────────────────
const FRAME_W = 390;
const FRAME_H = 844;
const GUTTER = 20; // --space-5
const CONTENT_W = FRAME_W - GUTTER * 2;
const TOUCH_MIN = 44; // --touch-min
const MAX_FONT_COMBOS = 8;

// Pengecualian yang disengaja, wajib disebut alasan di komentar.
const OVERFLOW_EXEMPT_NAMES = new Set([
  'Brandmark', // tile merek sengaja menimpa tepi bawah hero (-40), beta.css:247
  'Link Ganti nomor', // tautan sengaja duduk di atas bilah aksi (y=-68)
]);
// Nama lapisan umum dipakai banyak ikon berbeda, jadi tidak bisa dibandingkan.
const GENERIC_LAYER_NAMES = new Set(['Layer', 'Rectangle', 'Ikon', 'Group']);

const DEAD_BUTTON_EXEMPT = new Set([
  'Button Kirim ulang dalam 04:12', // nonaktif: state batas permintaan
]);
const CONTRAST_EXEMPT_PAIRS = new Set([
  '#FFFFFF/#E44220', // putih di oranye merek 4,12:1, keputusan pemilik ui-v2.md:98
]);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const targetFile = valueOf('--file', DEFAULT_FILE);

// ── baca dokumen ───────────────────────────────────────────────────────────
// Baca entry dari zip tanpa bergantung pada perintah `unzip`.
function zipEntry(file, name) {
  const buf = readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('bukan zip (EOCD tidak ditemukan)');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('central directory rusak');
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const entryName = buf.toString('utf8', off + 46, off + 46 + nameLen);
    if (entryName === name) {
      const lNameLen = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const data = buf.subarray(start, start + compSize);
      return method === 0 ? data : inflateRawSync(data);
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`entry ${name} tidak ada di zip`);
}

function readDocument(file) {
  const abs = resolve(ROOT, file);
  if (!existsSync(abs)) {
    console.error(`figcraft-audit: file tidak ada: ${abs}`);
    process.exit(2);
  }
  let raw;
  const useUnzip = !process.env.FIGCRAFT_AUDIT_NO_UNZIP;
  try {
    if (!useUnzip) throw new Error('unzip dilewati (FIGCRAFT_AUDIT_NO_UNZIP)');
    raw = execFileSync('unzip', ['-p', abs, 'document.json'], {
      maxBuffer: 128 * 1024 * 1024,
    });
  } catch {
    try {
      raw = zipEntry(abs, 'document.json');
    } catch (err) {
      console.error(`figcraft-audit: gagal membaca .figcraft: ${err.message}`);
      process.exit(2);
    }
  }
  const doc = JSON.parse(raw.toString('utf8'));
  const nodes = new Map();
  for (const [id, node] of Object.entries(doc.nodes)) nodes.set(Number(id), node);

  // Koordinat absolut dihitung sekali di sini: transform anak relatif ke induk,
  // jadi menambahkan kotak bingkai saja salah untuk lapisan bersarang.
  const absCache = new Map();
  const absOf = (node) => {
    if (!node) return { x: 0, y: 0, w: 0, h: 0 };
    if (absCache.has(node.id)) return absCache.get(node.id);
    const local = {
      x: node.transform ? node.transform[4] : 0,
      y: node.transform ? node.transform[5] : 0,
      w: node.width || 0,
      h: node.height || 0,
    };
    const parent = nodes.get(node.parent);
    const base = parent && parent.type !== 'page' ? absOf(parent) : { x: 0, y: 0 };
    const out = { x: base.x + local.x, y: base.y + local.y, w: local.w, h: local.h };
    absCache.set(node.id, out);
    return out;
  };
  for (const node of nodes.values()) absOf(node);
  // doc.pages berisi id halaman; objek halaman hidup di nodes (type "page").
  const pageId = Array.isArray(doc.pages) ? doc.pages[0] : doc.pages;
  const page =
    nodes.get(Number(doc.current_page ?? pageId)) ||
    nodes.get(Number(pageId)) ||
    [...nodes.values()].find((n) => n.type === 'page') ||
    { children: [], flows: [] };
  return { doc, nodes, page, absOf };
}

// ── util ───────────────────────────────────────────────────────────────────
const hex = (c) =>
  '#' +
  [c.r, c.g, c.b]
    .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

const solidColors = (node) =>
  (node.fills || [])
    .filter((f) => f && f.type === 'solid' && f.color && f.visible !== false)
    .map((f) => hex(f.color));

// Garis tepi bisa datang dari dua bentuk: `stroke` (satu) dan `strokes` (daftar).
// Mengabaikan `strokes` membuat 43 garis luar token lolos tanpa terlihat.
const strokeColors = (node) => {
  const out = [];
  if (node.stroke && node.stroke.color) out.push(hex(node.stroke.color));
  for (const s of node.strokes || []) {
    if (s && s.type === 'solid' && s.color && s.visible !== false) out.push(hex(s.color));
  }
  return out;
};

const box = (node) => ({
  x: node.transform ? node.transform[4] : 0,
  y: node.transform ? node.transform[5] : 0,
  w: node.width || 0,
  h: node.height || 0,
});

const isAbsolute = (node) => Boolean(node.child_layout && node.child_layout.absolute);
const actionsOf = (node) =>
  (node.interactions || []).flatMap((it) => it.actions || [it.action].filter(Boolean));

function tokens() {
  const abs = resolve(ROOT, TOKENS_PATH);
  if (!existsSync(abs)) return new Set();
  const text = readFileSync(abs, 'utf8');
  return new Set((text.match(/#[0-9a-fA-F]{6}\b/g) || []).map((h) => h.toUpperCase()));
}

// Skala radius dibaca dari _tokens.scss (--radius-*), bukan daftar karangan:
// kalau token berubah, gerbang ikut berubah. 0 dan pill selalu sah.
function radiusScale() {
  const abs = resolve(ROOT, TOKENS_PATH);
  const scale = new Set([0, 9999]);
  if (!existsSync(abs)) return scale;
  const text = readFileSync(abs, 'utf8');
  const re = /--radius-[a-z0-9-]+:\s*([\d.]+)px/g;
  let m;
  while ((m = re.exec(text))) scale.add(Math.round(Number(m[1])));
  return scale;
}

// kontras WCAG
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const blendHex = (fg, bg, alpha) => {
  const ch = (h, i) => parseInt(h.slice(i, i + 2), 16);
  const mix = [1, 3, 5]
    .map((i) => Math.round(ch(fg, i) * alpha + ch(bg, i) * (1 - alpha)))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
  return `#${mix.toUpperCase()}`;
};

// ── audit ──────────────────────────────────────────────────────────────────
function audit() {
  const { nodes, page, doc, absOf } = readDocument(targetFile);
  const frames = (page.children || [])
    .map((id) => nodes.get(id))
    .filter((n) => n && n.type === 'frame');
  const frameIds = new Set(frames.map((f) => f.id));
  const allowed = tokens();
  const radiusOk = radiusScale();

  const findings = [];
  const add = (check, rule, severity, detail) =>
    findings.push({ check, rule, severity, ...detail });

  const walk = (start, visit) => {
    const stack = [start];
    while (stack.length) {
      const node = stack.pop();
      visit(node);
      const kids = (node.children || []).map((id) => nodes.get(id)).filter(Boolean);
      for (let i = kids.length - 1; i >= 0; i -= 1) stack.push(kids[i]);
    }
  };

  const stats = {
    frames: frames.length,
    nodes: nodes.size,
    hotspots: 0,
    interactions: 0,
    navigate: 0,
    back: 0,
    fontCombos: 0,
  };

  const fontComboKeys = new Set();
  const incoming = new Map(frames.map((f) => [f.id, 0]));
  const hasBack = new Map(frames.map((f) => [f.id, false]));

  // hitungan warna/radius untuk ratchet
  const offTokenColors = new Map();
  const offScaleRadii = new Map();

  for (const frame of frames) {
    const flat = [];

    walk(frame, (node) => {
      node.__abs = absOf(node);
      flat.push(node);
    });

    // interaksi & hotspot
    for (const node of flat) {
      const acts = actionsOf(node);
      if (!acts.length) continue;
      stats.interactions += acts.length;
      const b = box(node);
      stats.hotspots += 1;
      if (b.w < TOUCH_MIN || b.h < TOUCH_MIN) {
        if (!OVERFLOW_EXEMPT_NAMES.has(node.name)) {
          add('hotspot', 'FR-24', 'fail', {
            frame: frame.name,
            node: node.name,
            detail: `${Math.round(b.w)}x${Math.round(b.h)} < ${TOUCH_MIN}`,
          });
        }
      }
      for (const a of acts) {
        if (a.type === 'navigate') {
          stats.navigate += 1;
          if (!a.dest) {
            add('danglingDest', 'FR-25', 'fail', {
              frame: frame.name,
              node: node.name,
              detail: 'navigate tanpa dest',
            });
          } else if (!frameIds.has(a.dest)) {
            add('danglingDest', 'FR-25', 'fail', {
              frame: frame.name,
              node: node.name,
              detail: `dest ${a.dest} bukan bingkai`,
            });
          } else {
            incoming.set(a.dest, (incoming.get(a.dest) || 0) + 1);
          }
        }
        if (a.type === 'back') {
          stats.back += 1;
          hasBack.set(frame.id, true);
        }
      }
    }

    // tombol tanpa aksi
    for (const node of flat) {
      if (!/^Button\b/i.test(node.name || '')) continue;
      if (actionsOf(node).length) continue;
      if (DEAD_BUTTON_EXEMPT.has(node.name)) continue;
      add('deadButton', 'FR-26', 'fail', { frame: frame.name, node: node.name });
    }

    // luberan keluar kotak induk
    for (const node of flat) {
      const parent = nodes.get(node.parent);
      if (!parent || parent.id === page.id) continue;
      if (node.visible === false) continue;
      const b = box(node);
      const p = box(parent);
      const out =
        b.x < -0.5 || b.y < -0.5 || b.x + b.w > p.w + 1 || b.y + b.h > p.h + 1;
      if (!out) continue;
      if (OVERFLOW_EXEMPT_NAMES.has(node.name)) continue;
      // Tautan yang sengaja duduk di atas bilah aksi (y negatif, mis. "Ganti nomor").
      if (isAbsolute(node) && parent.name === 'Action bar' && b.y < -0.5) continue;
      if (parent.clip === false && isAbsolute(node)) continue; // nongol tanpa dipotong = sengaja
      add('overflow', 'FR-15', 'fail', {
        frame: frame.name,
        node: `${parent.name} > ${node.name}`,
        detail: `x${Math.round(b.x)} y${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)} dalam ${Math.round(p.w)}x${Math.round(p.h)}`,
      });
    }

    // warna & radius
    for (const node of flat) {
      for (const c of [...solidColors(node), ...strokeColors(node)]) {
        if (allowed.has(c)) continue;
        const key = c;
        if (!offTokenColors.has(key)) offTokenColors.set(key, { count: 0, where: [] });
        const rec = offTokenColors.get(key);
        rec.count += 1;
        if (rec.where.length < 3) rec.where.push(`${frame.name} > ${node.name}`);
      }
      const radii = node.corners && node.corners.radii;
      if (radii && node.id !== frame.id) { // radius bingkai = selubung perangkat, bukan UI
        for (const r of radii) {
          if (Math.round(r) >= 500) continue; // pill (--radius-pill)
          if (radiusOk.has(Math.round(r))) continue;
          const key = String(Math.round(r));
          if (!offScaleRadii.has(key)) offScaleRadii.set(key, { count: 0, where: [] });
          const rec = offScaleRadii.get(key);
          rec.count += 1;
          if (rec.where.length < 3) rec.where.push(`${frame.name} > ${node.name}`);
        }
      }
    }

    // tipografi
    for (const node of flat) {
      if (node.type !== 'text' || !node.style) continue;
      const s = node.style;
      const key = `${s.font_family}|${s.font_size}|${s.font_style}`;
      if (!fontComboKeys.has(key)) fontComboKeys.add(key);
    }

    // kontras teks (latar: kotak berisi titik teks yang dicat sebelumnya, lalu isi bingkai)
    const painted = [
      { __abs: absOf(frame), name: frame.name, fills: frame.fills, type: 'frame', id: frame.id },
      ...flat.filter((n) => n.type !== 'text' && solidColors(n).length),
    ];
    for (const node of flat) {
      if (node.type !== 'text' || !node.characters) continue;
      const fg = solidColors(node)[0];
      if (!fg) continue;
      const cx = node.__abs.x + node.__abs.w / 2;
      const cy = node.__abs.y + node.__abs.h / 2;
      const idx = flat.indexOf(node);
      const bgNode = painted
        .filter((r) => flat.indexOf(r) < idx)
        .filter((r) => {
          const a = r.__abs;
          return cx >= a.x && cx <= a.x + a.w && cy >= a.y && cy <= a.y + a.h;
        })
        .pop();
      if (!bgNode) continue;
      const bg = solidColors(bgNode)[0];
      // Opasitas lapisan ikut dihitung: putih 72% di navy BUKAN putih penuh.
      const alpha = typeof node.opacity === 'number' ? node.opacity : 1;
      const fgEff = alpha >= 1 ? fg : blendHex(fg, bg, alpha);
      const size = Number(node.style?.font_size || 15);
      const bold = /Bold/.test(node.style?.font_style || '');
      const large = size >= 24 || (bold && size >= 18.66);
      const need = large ? 3 : 4.5;
      const pair = `${fg}/${bg}`;
      if (CONTRAST_EXEMPT_PAIRS.has(pair)) continue;
      const ratio = contrast(fgEff, bg);
      if (ratio < need) {
        add('contrast', 'FR-22', 'warn', {
          frame: frame.name,
          node: `${node.name}: "${node.characters.slice(0, 32)}"`,
          detail: `${ratio.toFixed(2)}:1 (butuh ${need}) ${fgEff}${alpha < 1 ? ` (${fg} @${Math.round(alpha * 100)}%)` : ''} di ${bg}`,
        });
      }
    }
  }

  // gutter: anak Body yang mengalir wajib x=20 selebar isi
  for (const frame of frames) {
    const flat = [];
    walk(frame, (n) => flat.push(n));
    const body = flat.find((n) => n.name === 'Body');
    if (!body) continue;
    for (const id of body.children || []) {
      const node = nodes.get(id);
      if (!node || isAbsolute(node)) continue;
      const b = box(node);
      if (Math.abs(b.x - GUTTER) > 0.5 || Math.abs(b.w - CONTENT_W) > 0.5) {
        add('gutter', 'FR-10', 'warn', {
          frame: frame.name,
          node: `${body.name} > ${node.name}`,
          detail: `x${Math.round(b.x)} w${Math.round(b.w)} (acuan ${GUTTER}/${CONTENT_W})`,
        });
      }
    }
  }

  // Kanvas: satu grid untuk semua bingkai, caption, dan judul seksi.
  // Gerbang lama hanya memeriksa ISI bingkai, jadi bingkai yang digeser 6 px dari
  // kolomnya (kejadian: `Verifikasi / 4` di x=1368, kolomnya 1362) lolos tanpa
  // jejak dan section tampak mencong di kanvas. Grid: kolom 454, baris 1120.
  const GRID_X = 454;
  const GRID_Y = 1120;
  const firstRow = Math.min(...frames.map((f) => box(f).y));
  for (const frame of frames) {
    const b = box(frame);
    const offX = Math.round(b.x) % GRID_X;
    const offY = (Math.round(b.y) - Math.round(firstRow)) % GRID_Y;
    if (offX === 0 && offY === 0) continue;
    add('canvasGrid', 'FR-37', 'fail', {
      frame: frame.name,
      node: 'bingkai',
      detail: `x${Math.round(b.x)} y${Math.round(b.y)} bukan kolom ${GRID_X} / baris ${GRID_Y}`,
    });
  }
  const pageChildren = (page.children || []).map((id) => nodes.get(id)).filter(Boolean);
  const columnX = new Set(frames.map((f) => Math.round(box(f).x)));
  for (const node of pageChildren) {
    if (node.type !== 'text') continue;
    const b = box(node);
    if (node.name === 'Caption sub') {
      if (!columnX.has(Math.round(b.x))) {
        add('canvasGrid', 'FR-37', 'fail', {
          frame: '-',
          node: `Caption sub "${String(node.characters || '').slice(0, 40)}"`,
          detail: `x${Math.round(b.x)} tidak ada kolom bingkai di situ`,
        });
        continue;
      }
      const aligned = frames.some(
        (f) => Math.round(box(f).x) === Math.round(b.x) && Math.abs(box(f).y - 80 - b.y) <= 1,
      );
      if (!aligned) {
        add('canvasGrid', 'FR-37', 'fail', {
          frame: '-',
          node: `Caption sub "${String(node.characters || '').slice(0, 40)}"`,
          detail: `y${Math.round(b.y)} bukan 80 px di atas bingkai kolomnya`,
        });
      }
      continue;
    }
    if (node.name === 'Screen title') {
      const sectionOk = Math.abs(b.x) <= 1 && frames.some((f) => Math.abs(box(f).y - 150 - b.y) <= 1);
      if (!sectionOk) {
        add('canvasGrid', 'FR-37', 'fail', {
          frame: '-',
          node: `Screen title "${String(node.characters || '').slice(0, 40)}"`,
          detail: `x${Math.round(b.x)} y${Math.round(b.y)} bukan x0 dan 150 px di atas baris bingkai`,
        });
      }
    }
  }

  // bingkai tanpa jalan masuk dan tanpa kembali.
  // Varian keadaan ("Masuk / 2 · nomor tidak sah") bukan tujuan navigasi: ia
  // dicapai dengan melakukan halnya (mengetik nomor salah), bukan dengan klik.
  // Jadi varian sah selama ada saudara seasal ("Masuk / 1 · …") yang punya
  // jalan masuk. Tanpa pengecualian ini gerbang menyuruh menautkan layar error.
  const prefixOf = (name) => String(name || '').split(' / ')[0];
  const reachablePrefix = new Set(
    frames
      .filter((f) => (incoming.get(f.id) || 0) > 0 || (page.flows || []).some((x) => x.start === f.id))
      .map((f) => prefixOf(f.name))
  );
  for (const frame of frames) {
    if ((incoming.get(frame.id) || 0) > 0) continue;
    if (hasBack.get(frame.id)) continue;
    if ((page.flows || []).some((f) => f.start === frame.id)) continue;
    if (reachablePrefix.has(prefixOf(frame.name))) continue;
    add('orphanFrame', 'FR-27', 'warn', {
      frame: frame.name,
      node: '',
      detail: 'tanpa navigate masuk, tanpa aksi back, tanpa saudara seasal yang terjangkau',
    });
  }

  // ikon tidak boleh melar. Vektor menyimpan geometri di vertices-nya, jadi
  // vektor yang di-stretch ke lebar induk TIDAK terlihat "salah" oleh cek
  // luberan (bentuknya ikut melar, tetap di dalam kotak). Yang terbaca adalah
  // pembanding: vektor bernama sama di file ini harus seukuran.
  // Kejadian nyata: Chevron 2396 jadi 158x14 (26x) karena `sizingH: fill` di
  // baris `mainAlign: spaceBetween`, dan teks di sebelahnya terhimpit jadi 2 baris.
  const iconGroups = new Map();
  for (const node of nodes.values()) {
    if (node.type !== 'vector' || GENERIC_LAYER_NAMES.has(node.name)) continue;
    const list = iconGroups.get(node.name) || [];
    list.push(node);
    iconGroups.set(node.name, list);
  }
  for (const [name, group] of iconGroups) {
    if (group.length < 2) continue;
    const minW = Math.min(...group.map((n) => n.width || 0));
    const minH = Math.min(...group.map((n) => n.height || 0));
    for (const node of group) {
      const wide = node.width > minW * 2 && node.width - minW > 8;
      const tall = node.height > minH * 2 && node.height - minH > 8;
      if (!wide && !tall) continue;
      const frame = frames.find((f) => {
        let cur = nodes.get(node.parent);
        while (cur) {
          if (cur.id === f.id) return true;
          cur = nodes.get(cur.parent);
        }
        return false;
      });
      add('stretchedIcon', 'FR-19', 'fail', {
        frame: frame ? frame.name : '-',
        node: `${name} (${node.id}) di ${nodes.get(node.parent)?.name ?? '?'}`,
        detail: `${Math.round(node.width)}x${Math.round(node.height)} vs ${Math.round(minW)}x${Math.round(minH)} senama`,
      });
    }
  }

  // Akar dari ikon melar di atas: `sizingH: "fill"` pada vektor di dalam baris.
  // Pemeriksaan pembanding di atas hanya menangkap vektor BERNama sama; ikon yang
  // di-stretch seragam (semua 56x26) lolos tanpa jejak, padahal lingkaran berubah
  // jadi elips. Kejadian nyata: satu suntingan massal memberi `fill` ke 9 vektor
  // sekaligus (gelembung chat 26x26 -> 56x26, ikon 16x18 -> 56x18, centang
  // 13x13 -> 18x13) dan gerbang tetap PASS. Jadi mekanismenya yang diperiksa.
  for (const node of nodes.values()) {
    if (node.type !== 'vector') continue;
    if ((node.child_layout || {}).sizing_h !== 'fill') continue;
    let owner = null;
    for (let cur = nodes.get(node.parent); cur; cur = nodes.get(cur.parent)) {
      if (frameIds.has(cur.id)) {
        owner = cur;
        break;
      }
    }
    add('iconFill', 'FR-20b', 'fail', {
      frame: owner ? owner.name : '-',
      node: `${node.name} (${node.id}) di ${nodes.get(node.parent)?.name ?? '?'}`,
      detail: `${Math.round(node.width)}x${Math.round(node.height)} memakai sizingH fill (ikon bisa melar)`,
    });
  }

  stats.fontCombos = fontComboKeys.size;
  if (fontComboKeys.size > MAX_FONT_COMBOS) {
    add('fontCombos', 'FR-20', 'fail', {
      frame: '-',
      node: [...fontComboKeys].sort().join(' · '),
      detail: `${fontComboKeys.size} kombinasi > ${MAX_FONT_COMBOS}`,
    });
  }

  // warna/radius luar token masuk findings sebagai ratchet (satu baris per nilai)
  for (const [color, rec] of offTokenColors) {
    add('offTokenColor', 'FR-21', 'fail', {
      frame: '-',
      node: rec.where.join(' | '),
      detail: `${color} (${rec.count} isian)`,
    });
  }
  for (const [radius, rec] of offScaleRadii) {
    add('offScaleRadius', 'FR-23', 'fail', {
      frame: '-',
      node: rec.where.join(' | '),
      detail: `radius ${radius} (${rec.count} lapisan)`,
    });
  }

  return { findings, stats, flows: page.flows || [], doc };
}

// ── ratchet ────────────────────────────────────────────────────────────────
function keyOf(f) {
  if (f.check === 'offTokenColor' || f.check === 'offScaleRadius') return f.detail.split(' (')[0];
  return `${f.frame}|${f.node}|${f.detail}`;
}

function summarise(findings) {
  const map = {};
  for (const f of findings) {
    map[f.check] = map[f.check] || {};
    const k = keyOf(f);
    map[f.check][k] = (map[f.check][k] || 0) + 1;
  }
  return map;
}

const { findings, stats, flows } = audit();
const summary = summarise(findings);

if (flag('--update-baseline')) {
  const abs = resolve(ROOT, BASELINE_PATH);
  const prev = existsSync(abs) ? JSON.parse(readFileSync(abs, 'utf8')) : { checks: {} };
  const rises = [];
  for (const [check, keys] of Object.entries(summary)) {
    for (const [key, count] of Object.entries(keys)) {
      const before = prev.checks?.[check]?.[key];
      if (before === undefined && !flag('--force')) rises.push(`${check} / ${key} baru (${count})`);
      else if (before !== undefined && count > before && !flag('--force'))
        rises.push(`${check} / ${key} ${before} -> ${count}`);
    }
  }
  if (rises.length) {
    console.error('figcraft-audit: baseline menolak naik. Turunkan dulu, atau --force bila memang disengaja:');
    for (const rise of rises) console.error(`  - ${rise}`);
    process.exit(1);
  }
  const payload = {
    version: 1,
    file: targetFile,
    note: 'Ratchet: angka hanya boleh turun. Perbarui setelah utang benar-benar turun.',
    checks: summary,
  };
  writeFileSync(abs, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`figcraft-audit: baseline ditulis ke ${BASELINE_PATH}`);
  process.exit(0);
}

const baselineAbs = resolve(ROOT, BASELINE_PATH);
const baseline = existsSync(baselineAbs)
  ? JSON.parse(readFileSync(baselineAbs, 'utf8'))
  : { checks: {} };

const regressions = [];
const improved = [];
for (const [check, keys] of Object.entries(summary)) {
  for (const [key, count] of Object.entries(keys)) {
    const before = baseline.checks?.[check]?.[key] ?? 0;
    if (count > before) regressions.push(`${check} / ${key} ${before} -> ${count}`);
    else if (count < before) improved.push(`${check} / ${key} ${before} -> ${count}`);
  }
}
for (const [check, keys] of Object.entries(baseline.checks || {})) {
  for (const [key, before] of Object.entries(keys)) {
    if ((summary[check]?.[key] ?? 0) === 0) improved.push(`${check} / ${key} ${before} -> 0`);
  }
}

if (flag('--json')) {
  console.log(
    JSON.stringify({ stats, findings, regressions, improved, baseline: BASELINE_PATH }, null, 2)
  );
} else {
  const byCheck = {};
  for (const f of findings) {
    byCheck[f.check] = byCheck[f.check] || { rule: f.rule, severity: f.severity, items: [] };
    byCheck[f.check].items.push(f);
  }
  console.log(`FigCraft audit — ${targetFile}`);
  console.log(
    `bingkai ${stats.frames} · lapisan ${stats.nodes} · interaksi ${stats.interactions} ` +
      `(navigate ${stats.navigate}, back ${stats.back}) · hotspot ${stats.hotspots} · kombinasi huruf ${stats.fontCombos}`
  );
  console.log(`flow: ${flows.map((f) => `${f.name}@${f.start}`).join(', ') || '-'}\n`);

  const order = [...Object.keys(byCheck)].sort();
  if (!order.length) console.log('PASS — tidak ada temuan.');
  for (const check of order) {
    const group = byCheck[check];
    const tag = group.severity === 'fail' ? 'FAIL' : 'WARN';
    console.log(`${tag} ${check} (${group.rule}) — ${group.items.length}`);
    for (const item of group.items.slice(0, 12)) {
      const where = item.frame === '-' ? '' : `${item.frame} > `;
      console.log(`  · ${where}${item.node ?? ''}${item.detail ? ` — ${item.detail}` : ''}`);
    }
    if (group.items.length > 12) console.log(`  · … ${group.items.length - 12} lagi`);
  }

  if (regressions.length) {
    console.log('\nREGRESI terhadap baseline (gagal):');
    for (const r of regressions) console.log(`  + ${r}`);
  }
  if (improved.length) {
    console.log('\nTurun dari baseline (boleh, perbarui dengan --update-baseline):');
    for (const r of improved) console.log(`  - ${r}`);
  }
  console.log(
    regressions.length
      ? `\nGAGAL — ${regressions.length} regresi.`
      : '\nLULUS — tidak ada regresi terhadap baseline.'
  );
}

process.exit(regressions.length ? 1 : 0);
