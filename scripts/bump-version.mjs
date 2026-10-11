#!/usr/bin/env node
// Naikkan patch BASE_VERSION di src/data/appInfo.ts, cetak versi baru ke stdout.
// Dipakai CI (lihat .github/workflows/deploy.yml).
//
// ponytail: hanya patch yang dinaikkan otomatis. major/minor tetap keputusan
// manusia (rilis fitur) — CI tak bisa tahu itu breaking atau bukan.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/appInfo.ts');
const src = readFileSync(file, 'utf8');

const re = /(BASE_VERSION\s*=\s*')(\d+)\.(\d+)\.(\d+)(')/;
const match = src.match(re);
if (!match) {
  console.error('BASE_VERSION (x.y.z) tidak ditemukan di src/data/appInfo.ts');
  process.exit(1);
}

const next = `${match[2]}.${match[3]}.${Number(match[4]) + 1}`;
writeFileSync(file, src.replace(re, `$1${next}$5`));
console.log(next);
