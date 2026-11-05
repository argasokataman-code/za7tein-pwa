# R-ACC — Akun, reverse OTP WhatsApp & multi-role

Status: partial (definisi lengkap; implementasi belum dimulai) · sumber `sa7tein-beta-2026-11-05` §5, §5.1, §11.3, ACC-01..ACC-08.

## 1. Untuk apa

Login menentukan siapa yang boleh melihat order, uang, dan batch. PRD beta memakai **satu identitas (nomor WhatsApp) untuk semua peran**: mahasiswa bisa sekaligus customer, karyawan di dua merchant, dan owner di merchant ketiga. Reverse OTP dipilih karena pesan pengguna→bisnis tidak dikenai biaya dan identitasnya sudah nomor yang dipakai merchant menghubungi customer.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Registrasi & login hanya lewat reverse OTP: pengguna **mengirim** kode ke nomor sa7tein, bukan menerima | §5 ACC-01, §5.1 |
| A2 | Nomor pengirim WA **wajib sama** dengan nomor yang diisi; beda = ditolak + minta ulang | §5.1 |
| A3 | Kode sekali pakai; ada masa berlaku & batas permintaan per nomor per rentang, diatur ops | §5.1, §12.2 |
| A4 | Login → buka **role terakhir** dipakai | §5.1 |
| A5 | Satu nomor = satu akun; boleh banyak role merchant (owner/karyawan di merchant berbeda), **satu** role customer | §5 ACC-02, §5.1 |
| A6 | Role tambahan didaftarkan **dari dalam akun** (sudah login); halaman registrasi hanya untuk nomor belum terdaftar | §5.1 |
| A7 | Pindah role tanpa login ulang, termasuk antar merchant; notifikasi semua role tetap diterima dan membuka notifikasi berpindah role | §5.1 |
| A8 | Akun tidak bisa membuat order ke merchant miliknya sendiri (termasuk sebagai karyawan) | §5.1, §11.3 |
| A9 | Kurir inhouse **didaftarkan owner** sebagai karyawan (ACC-03 dihapus sebagai peran tersendiri) | §5 ACC-03/07, §11.3 |
| A10 | Onboarding & verifikasi merchant oleh ops; karyawan tidak butuh verifikasi ops | §5 ACC-04/07, §11.3 |
| A11 | Merchant wajib rekening bank dengan validasi nama pemilik; customer tidak wajib | §5 ACC-05 |
| A12 | Status owner bisa dipindah owner ke karyawan, atau ops setelah verifikasi bila owner tak bisa login | §5 ACC-08, §11.3 |
| A13 | Email tidak lagi dipakai sebagai identitas akun | §5.1 |

## 3. Aktor & permukaan

- Customer/merchant/karyawan kurir — satu PWA; layar masuk, daftar, verifikasi, pemilih role.
- Ops — verifikasi merchant, pindah owner (aplikasi ops).
- Semua role melihat **satu akun** dengan role aktif.

## 4. Masukan → keluaran

- Masuk: nomor WA, kode unik sesi, pesan WA masuk lewat webhook (BE).
- Keluar: sesi terverifikasi, role aktif, daftar role yang dimiliki, event `otp_verified|otp_rejected`.

## 5. State UI

| State | Tampilan |
|---|---|
| nomor belum diisi | input nomor + CTA lanjut |
| kode terkirim | tombol "Buka WhatsApp" berisi pesan siap kirim + hitung waktu berlaku + "kirim ulang" (nonaktif sampai batas permintaan lewat) |
| menunggu webhook | indikator menunggu, bisa dibatalkan |
| kode kedaluwarsa | pesan + minta kode baru |
| nomor tidak cocok | pesan "kirim dari nomor yang Anda isi" |
| banyak role | pemilih role setelah verifikasi |
| tidak ada role merchant | CTA daftar merchant |

## 6. Kontrak BE (handoff, repo ini mock)

Actor: akun (nomor WA). Sesi: akun + role aktif. Webhook WhatsApp Cloud API memverifikasi nomor pengirim dan kode. OTP single-use + rate limit dari `applicationConfiguration`. Event sesi terverifikasi/ditolak dikirim ke client yang sedang login (§18).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Tidak ada field email pada form registrasi/login | inspeksi form | ⛔ halaman lama masih email/magic link (`api/supabase.ts:99`) |
| AC2 | Pesan pra-isi menyebut registrasi/login + peringatan jangan kirim atas permintaan orang lain | teks pesan | ⛔ belum ada |
| AC3 | Tombol kirim ulang nonaktif sampai batas permintaan lewat | state tombol + countdown | ⛔ belum ada |
| AC4 | Nomor pengirim berbeda → verifikasi ditolak dengan pesan spesifik | simulasi state ditolak | ⛔ belum ada |
| AC5 | Satu akun menampilkan ≥2 role merchant + 1 customer, bisa pindah tanpa login ulang | daftar role + klik pindah, URL/role aktif berubah, tidak keluar sesi | ⛔ `authSlice.ts:14` masih satu role |
| AC6 | Akun merchant tidak bisa memilih merchant miliknya di discovery | kartu merchant sendiri nonaktif + pesan | ⛔ belum ada |
| AC7 | Login membuka role terakhir | reload → role aktif sama | ⛔ belum ada |

## 8. UNRESOLVED

- Webhook WhatsApp Business Platform tidak ada di repo mock; verifikasi nomor hanya bisa disimulasikan sebagai state.
- Masa berlaku kode & batas permintaan = nilai `applicationConfiguration`; PRD tidak mencantumkan nilai awal (§12.2).

## 9. Bukti

- Kode lama: `api/supabase.ts:99`, `src/pages/SignIn.tsx`, `SignUp.tsx`, `Verification.tsx`, `CourierSignIn.tsx:23`, `src/store/slices/authSlice.ts:14`.
- Flow terkait: `docs/design/flows/INDEX.json` → `auth` (mismatch terbuka), `f21-account-auth`, `f16` (rekrut kurir).
