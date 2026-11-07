#!/usr/bin/env node
/**
 * Self-check plugin `design-preflight`.
 *
 * Tanpa ini, penegakan bisa diam-diam mati: berkas state yang salah bentuk
 * dianggap "ok" hanya karena tidak ada yang memeriksa. Fixture meniru kondisi
 * nyata (belum ada, draft, kedaluwarsa) dan memastikan keputusannya.
 *
 *   node scripts/design-preflight-check.mjs   (ikut npm run check:self)
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { preflightStatus, isBlockedCall } = await import('./opencode/design-preflight/index.ts');

// Pencocokan panggilan: di Code Mode FigCraft masuk sebagai tool `execute`.
const cases = [
  ['execute + figcraft.batch', 'execute', ['tools.figcraft.batch({})'], true],
  ['execute + figcraft.get_node', 'execute', ['tools.figcraft.get_node({id:1})'], false],
  ['execute + screenshot', 'execute', ['tools.figcraft.screenshot({ids:[1]})'], false],
  ['write checklist', 'write', ['docs/design/preflight/uji.md'], false],
  ['shell audit', 'shell', ['npm run figcraft:audit'], false],
];
for (const [label, action, resources, want] of cases) {
  if (isBlockedCall(action, resources) !== want) {
    failures.push(`pencocokan salah: ${label} seharusnya ${want ? 'diblokir' : 'diizinkan'}`);
  }
}

const root = mkdtempSync(join(tmpdir(), 'preflight-'));
const checklist = (boxes) => `# Preflight — Uji

Status: approved

## 1. Sumber
${boxes}

## 2. Brief
- [x] padding 20 px, tinggi 206 px

## 3. DNA
- [x] MD-07
- [x] MD-11

## 4. Anti-slop
- [x] token

## 5. Verifikasi
- [x] audit

## 6. Gerak (motion)
- [x] maju push 320 ms, kembali dissolve 220 ms, tab instant
- [x] tidak dianimasikan: tab replace
- [x] prefers-reduced-motion: instan
`;

const failures = [];
const write = (state, text) => {
  mkdirSync(join(root, 'docs/design/preflight'), { recursive: true });
  writeFileSync(join(root, 'docs/design/preflight/uji.md'), text);
  writeFileSync(join(root, '.design-preflight.json'), JSON.stringify(state));
};
const now = new Date().toISOString();
const state = (extra = {}) => ({
  frame: 'Uji',
  file: 'docs/design/preflight/uji.md',
  approvedAt: now,
  ttlHours: 12,
  ...extra,
});

if (preflightStatus(root).ok) failures.push('tanpa state seharusnya ditolak');

write(state({ approvedAt: new Date(Date.now() - 13 * 3600e3).toISOString() }), checklist('- [x] src/pages/A.tsx:10'));
if (preflightStatus(root).ok) failures.push('persetujuan 13 jam seharusnya kedaluwarsa');

write(state(), checklist('- [ ] src/pages/A.tsx:10'));
if (preflightStatus(root).ok) failures.push('checklist dengan kotak kosong seharusnya ditolak');

write(state(), checklist('- [x] tanpa rujukan'));
if (preflightStatus(root).ok) failures.push('checklist tanpa path:line seharusnya ditolak');

write(state(), checklist('- [x] src/pages/A.tsx:10\n- [x] src/pages/B.tsx:20'));
if (!preflightStatus(root).ok) failures.push('checklist lengkap seharusnya diterima');

// Bagian 6 (gerak) wajib: tanpa itu animasi jadi tempelan setelah bingkai jadi.
write(state(), checklist('- [x] src/pages/A.tsx:10\n- [x] src/pages/B.tsx:20').replace(/## 6\.[\s\S]*$/, ''));
if (preflightStatus(root).ok) failures.push('checklist tanpa bagian 6 (gerak) seharusnya ditolak');

write(
  state(),
  checklist('- [x] src/pages/A.tsx:10\n- [x] src/pages/B.tsx:20').replace(
    'maju push 320 ms, kembali dissolve 220 ms, tab instant',
    'push 320 ms'
  )
);
if (preflightStatus(root).ok) failures.push('bagian 6 dengan satu jenis transisi seharusnya ditolak');

write(
  state(),
  checklist('- [x] src/pages/A.tsx:10\n- [x] src/pages/B.tsx:20').replace('- [x] prefers-reduced-motion: instan', '- [x] tidak diputuskan')
);
if (preflightStatus(root).ok) failures.push('bagian 6 tanpa prefers-reduced-motion seharusnya ditolak');

rmSync(root, { recursive: true, force: true });

if (failures.length) {
  console.error('GAGAL — design-preflight:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('ok   design-preflight-check.mjs (7 state + 5 pencocokan panggilan)');
