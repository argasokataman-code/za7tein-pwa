#!/usr/bin/env node
// Galeri irisan HTML: docs/design/slice/index.html
//
//   node scripts/slice-index.mjs
//
// Folder ini berisi halaman login + 14 layar panel ops (permintaan pemilik
// 2026-10-25). Layar aplikasi lain sempat dibuat keliru dan sudah dihapus
// (2026-10-17) — jangan didaftarkan lagi di sini tanpa diminta.

import { existsSync, writeFileSync } from 'node:fs'

const ROOT = 'docs/design/slice/'
const AUTH = ROOT + 'auth/'

// [berkas, judul, rute asli, catatan]
const SCREENS = [
  ['login-1to1.html', 'Login — customer (pembeli)', '/customer/signin', 'ACUAN — reproduksi 1:1 mockup pemilik (teks Inggris sesuai mockup). Kode repo: SignIn.tsx:18 — teksnya Indonesia'],
  ['signup-customer.html', 'Daftar — customer (pembeli)', '/signup', 'dari kode: SignUp.tsx:38 — Nama, Nomor WhatsApp, Email, Kata sandi, persetujuan, `Buat akun`'],
  ['login-merchant.html', 'Login — penjual', '/merchant/signin', 'dari kode: MerchantSignIn.tsx:14 — Email + Kata sandi, `Masuk`; tab Masuk/Daftar ke signup-merchant.html'],
  ['signup-merchant.html', 'Daftar — penjual', '/merchant/signup', 'dari kode: MerchantSignUp.tsx:39 — Nama toko, Email, Nomor HP opsional, zona, Kata sandi, `Kirim pendaftaran`; tab Masuk/Daftar'],
  ['login-courier.html', 'Login — kurir (toko/partner)', '/courier/signin', 'USULAN: switch `Kurir toko`/`Kurir partner` + email magic link (PRD aktif); kode masih WA + kata sandi'],
  ['login-ops.html', 'Login — panel ops', '/ops', 'USULAN — halaman login ops belum ada; PRD belum menurunkan requirement auth ke layar'],
  ['login-superadmin.html', 'Login — super admin', '/superadmin', 'USULAN — superAdminRoutes tanpa auth; isi minim']
]

const rows = SCREENS.map(([file, title, route, note]) => {
  const ok = existsSync(AUTH + file)
  const href = `auth/${file}`
  const label = ok ? `<a href="${href}">${title}</a>` : `<span class="todo">${title} <em>belum</em></span>`
  return `<tr><td>${label}<div class="note">${note}</div></td><td class="route">${route}</td><td class="file">${href}</td></tr>`
})

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Irisan HTML Sa7tein — login &amp; panel ops</title>
<style>
  :root { --merek: #E44220; --ink: #172434; --muted: #64748B; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 24px 80px; background: #f7f7f2; color: var(--ink);
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
  .wrap { max-width: 900px; margin: 0 auto; }
  h1 { margin: 0 0 6px; font-size: 30px; letter-spacing: -.02em; }
  .lead { margin: 0 0 22px; color: var(--muted); font-size: 15px; }
  .bar { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin: 0 0 28px; padding: 14px 18px;
         border-radius: 16px; background: #fff; box-shadow: 0 2px 8px rgba(23,36,52,.06); font-size: 14px; }
  .bar a { color: var(--merek); font-weight: 600; text-decoration: none; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden;
          box-shadow: 0 2px 8px rgba(23,36,52,.06); }
  td { padding: 12px 16px; border-top: 1px solid #ededed; font-size: 14px; vertical-align: top; }
  tr:first-child td { border-top: 0; }
  a { color: var(--ink); font-weight: 600; text-decoration: none; }
  a:hover { color: var(--merek); }
  .note { color: var(--muted); font-size: 12.5px; margin-top: 3px; }
  .route, .file { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; width: 26%; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Login, daftar &amp; panel ops</h1>
  <p class="lead">Satu berkas per layar, dibuka langsung lewat peramban. Arsip review, bukan kode produksi. Panel ops: 14 layar, mulai dari dashboard.</p>
  <div class="bar">
    <a href="auth/login-1to1.html">customer (acuan)</a>
    <a href="auth/login-merchant.html">penjual</a>
    <a href="auth/login-courier.html">kurir</a>
    <a href="auth/login-ops.html">ops</a>
    <a href="auth/login-superadmin.html">super admin</a>
    <a href="ops/ops-dashboard.html">panel ops (14 layar)</a>
    <a href="README.md">cara kerja</a>
  </div>
  <table>${rows.join('\n')}</table>
</div>
</body>
</html>
`

writeFileSync(ROOT + 'index.html', html)
console.log(`galeri ditulis: ${ROOT}index.html · ${SCREENS.filter(([f]) => existsSync(AUTH + f)).length}/${SCREENS.length} berkas login ada`)
