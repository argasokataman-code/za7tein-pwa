# R-MER-PROFILE — Profil merchant, tag global & rekening bank

Status: partial (profil + tag ada; nomor WA profil & validasi rekening belum) · sumber §10 MER-01/MER-02, §11.3 MER-36, §5 ACC-05.

## 1. Untuk apa

Profil merchant adalah identitas yang dilihat customer (nama, deskripsi, logo, cover, tag) sekaligus data operasional yang mengikat uang (rekening bank untuk payout) dan membership (nomor WhatsApp yang dipakai customer untuk mengajukan membership). Karena rekening menentukan tujuan uang, perubahannya hanya boleh dilakukan owner dan divalidasi atas nama pemilik.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Owner mengedit nama dan deskripsi merchant | MER-01 |
| A2 | Owner mengunggah atau mengganti logo dan cover; aset disimpan di R2 | MER-01, ARC-09 |
| A3 | Nomor WhatsApp profil dipakai untuk pengajuan membership; terisi otomatis dari nomor WhatsApp akun dan boleh diganti | MER-01, §14.4 |
| A4 | Nomor WhatsApp profil wajib ada bila merchant ingin menerima pengajuan membership | §14.4 |
| A5 | Tag dipilih dari daftar tag global; merchant bisa mengusulkan tag baru | MER-02 |
| A6 | Usulan tag dimoderasi ops; tag yang disetujui menjadi tag global dan bisa dipakai merchant lain | MER-02, OPS-02 |
| A7 | Rekening bank wajib diisi saat onboarding merchant | ACC-05, MER-36 |
| A8 | Rekening divalidasi atas nama pemilik rekening sebelum dipakai | MER-36, §15.7 butir 4 |
| A9 | Hanya owner yang bisa mengganti rekening bank merchant, kapan saja; hak akses payout karyawan tidak mencakup penggantian rekening | §11.3 |
| A10 | Payout setelah penggantian masuk ke rekening baru | MER-36 |
| A11 | Penggantian rekening tercatat di riwayat aktivitas, termasuk nilai lama dan baru | §12.1 |
| A12 | Perubahan profil (nama, deskripsi, logo, cover, WA, tag) dikirim realtime ke merchant dan customer yang sedang melihat merchant itu | §18 |

## 3. Aktor & permukaan

- Owner — form profil, unggah aset, pengelola tag, form rekening.
- Karyawan dengan hak "Pengaturan akun" — profil, tag, coverage, delivery fee (tanpa rekening).
- Ops — moderasi usulan tag, verifikasi merchant.
- Customer — melihat profil di browse, detail merchant, dan filter tag.

## 4. Masukan → keluaran

- Masuk: teks profil, berkas gambar, tag global/usulan, bank + nomor rekening + nama pemilik.
- Keluar: profil merchant tersimpan, status validasi rekening, tag global baru, event `merchant_profile_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| rekening belum diisi | onboarding tidak selesai; payout tidak bisa diterima |
| validasi nama rekening gagal | pesan penyebab + rekening tidak dipakai |
| tag usulan pending | tag tidak muncul di filter discovery sampai disetujui |
| tag usulan ditolak | status ditolak + alasan dari ops |
| unggahan logo/cover gagal | profil lama tetap dipakai, error ditampilkan |

## 6. Kontrak BE (handoff, repo ini mock)

R2 untuk logo/cover; entitas tag global + usulan tag (status pending/approved/rejected); validasi nama rekening lewat payment gateway (OPEN-01); event `merchant_profile_changed`, `tag_proposed`, `tag_moderated`.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Nomor WA profil terisi otomatis dari nomor akun saat onboarding | buka form → nilai awal = nomor akun | ⛔ |
| AC2 | Mengganti nomor WA profil mengubah tujuan `wa.me` di pengajuan membership customer | ganti nomor → ajukan membership → tautan memakai nomor baru | ⛔ |
| AC3 | Tag usulan tidak bisa dipakai merchant lain sebelum disetujui | usul tag → cari di filter merchant lain → tidak ada | ⛔ |
| AC4 | Tag disetujui muncul di daftar tag global | approve di ops → tag tampil di form merchant lain | ⛔ |
| AC5 | Rekening dengan nama pemilik tidak cocok ditolak | isi nama berbeda → simpan → status gagal, rekening tidak aktif | ⛔ |
| AC6 | Karyawan ber-hak "Pengaturan akun" tidak bisa mengganti rekening | login karyawan → form rekening tidak tersedia | ⛔ |
| AC7 | Payout setelah penggantian rekening masuk ke rekening baru | ganti rekening → order selesai → status payout menunjuk rekening baru | ⛔ (mock) |

## 8. UNRESOLVED

- Daftar tag global awal tidak dicantumkan PRD; isinya keputusan data.
- Format dan batas ukuran unggahan logo/cover tidak diatur.

## 9. Bukti

- Kode: `src/pages/MerchantSettings.tsx`, `src/pages/MerchantOnboarding.tsx`, `src/store/slices/merchantSlice.ts`, `src/pages/MerchantPayoutAccounts.tsx`.
- Belum ada: field nomor WA profil, validasi nama rekening, status usulan tag.
