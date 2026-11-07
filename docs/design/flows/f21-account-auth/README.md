# F21 — Registrasi & Masuk Akun

Login beta: **satu nomor WhatsApp, banyak peran, reverse OTP** — pengguna *mengirim* kode ke nomor
sa7tein, bukan menerima OTP. Milestone **M8**; PRD aktif `sa7tein-beta-2026-11-05` §5 `ACC-01..ACC-08`,
`R-ACC` A1..A13.

| Berkas | Isi |
|---|---|
| `f21-account-auth.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f21-account-auth.html` | Artefak jadi (generated, di-gitignore) |
| `f21-account-auth.visual-check.*` | Bukti visual-check (generated, di-gitignore) |

## Bisnis (kenapa flow ini ada)

- **Masalah:** login menentukan siapa yang boleh melihat order, uang, dan batch. Satu nomor WhatsApp
  menjadi identitas tunggal, sekaligus nomor yang dipakai merchant menghubungi pembeli.
- **Kenapa arah pesannya dibalik:** pesan pengguna→bisnis tidak dikenai biaya, sedangkan OTP keluar
  butuh WhatsApp Business API berbayar (§5 ACC-01, §5.1).
- **Aktor & nilai:** mahasiswa bisa sekaligus customer, karyawan di dua warung, dan owner di warung
  ketiga tanpa akun tambahan (§5 ACC-02). Kurir bukan pihak ketiga: ia karyawan merchant (§11.3).

## Alur layar (5 kolom, 3 lane)

**Lane Akun:** `Nomor WhatsApp` → `Kirim kode` (dari WhatsApp) → `Cocokkan nomor` (pengirim harus sama
dengan nomor yang diisi) → `Kode sekali pakai` (masa berlaku + batas permintaan) → `Peran terakhir`
(login membuka peran terakhir, pindah peran tanpa login ulang).

**Lane Peran warung, ops & karyawan:** `Tambah peran` (dari dalam akun) → `Rekening + nama` (wajib
merchant, nama pemilik harus cocok) → `Ops verifikasi` (aplikasi ops, PRD §12) → `Karyawan & kurir`
(ditambah owner, tanpa verifikasi ops).

**Lane Guard:** `Batas kirim` (kirim ulang nonaktif sementara) · `Nomor beda` (minta kirim dari nomor
yang diisi) · `Kode batal` (kedaluwarsa atau sudah dipakai).

## Aturan keras (jangan dilupakan)

- Hanya **reverse OTP**; tidak ada email, tidak ada tautan ajaib, tidak ada OTP terkirim.
- Nomor pengirim WA **wajib sama** dengan nomor yang diisi (A2); kode **sekali pakai** (A3); login buka
  **peran terakhir** (A4); satu nomor satu akun, banyak peran merchant (A5).
- Peran tambahan didaftarkan **dari dalam akun** (A6). Halaman registrasi hanya untuk nomor baru.
- Merchant wajib rekening dengan **validasi nama pemilik** (A11); customer tidak.
- Verifikasi warung oleh **ops** (A10). Karyawan dan kurir **tidak** butuh verifikasi ops.
- `A8` (tidak bisa order ke warung sendiri) milik discovery; `A12` (pindah owner) menunggu
  `R-MER-CREW` yang masih **blocked**.
- Frontend saja di repo ini: webhook WhatsApp, sesi, dan token tidak berjalan sungguhan (AGENTS.md §1).

## Desain layar

`design/beta-v1.figcraft` memuat 28 bingkai auth: `Masuk` 4, `Kirim kode` 4, `Verifikasi` 4 (termasuk
`kode sudah dipakai`), `Pilih peran` 5 (termasuk `peran terakhir`), `Daftar` 3, `Tambah peran` 4
(termasuk galat rekening), `Verifikasi merchant` 3, dan `User Agreement / 1 · baca penuh` (dibuka dari
ringkasan consent di `Daftar / 3` 845 dan dari baris persetujuan `Tambah peran / 2` 933). Angka gerbang:
`npm run figcraft:audit` → 38 bingkai, 91 interaksi, PASS.

## Terhubung (lihat ../INDEX.json)

`f16-merchant-onboarding` (profil warung + persetujuan ops) · `f13-courier-view` (kurir = karyawan
merchant) · `f11-push-notification` (nomor = tujuan `wa.me`) · `f3-wallet-topup` (gate order setelah
akun aktif).

## Sumber (jangan dikarang)

- `docs/product/prd/versions/sa7tein-beta-2026-11-05/features/R-ACC.md` A1–A13, AC1–AC7.
- PRD `sa7tein-beta-2026-11-05` §5, §5.1, §11.3, §12.
- UNRESOLVED tercatat di kartu terakhir diagram: nilai masa berlaku/batas permintaan
  (`applicationConfiguration`, §12.2) dan ketiadaan webhook WhatsApp di repo mock.

## Update

```bash
./scripts/flows-gate.sh f21-account-auth     # deliver + visual-check, satu baris hasil
```

Gate butuh browser: set `ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"`
kalau Chrome tidak terpasang (di mesin ini Chrome tidak ada, Brave yang dipakai).
