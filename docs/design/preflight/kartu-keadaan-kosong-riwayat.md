# Preflight desain — keadaan kosong riwayat jadi kartu

Status: disetujui
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Isi keadaan kosong: `src/pages/MyOrder.tsx:366-380` — `ReceiptText` 40, judul tebal (`Belum ada pesanan selesai`), satu baris keterangan `Pesanan yang sudah selesai dikelompokkan per tanggal di sini.`; tanpa aksi.
- [x] Geometri teks & ikon: `src/styles/system/_order-history.scss:453-475` — `.oh-empty` flex kolom, `align-items: center`, gap `--space-2` 8, padding `--space-9` 48 / `--space-6` 32, ikon `--border-strong` `#CBD5E1`, judul `--text-sm` 15 SemiBold, keterangan `--text-xs` 13.
- [x] Bentuk kartu acuan di file yang sama: `design/beta-v1.figcraft` node `Kartu kosong` 4172 dan 4217 — putih `#FFFFFF`, garis `#E2E8F0` 1 px, radius 16 (`--radius-lg`), padding 48/32; dipakai juga oleh `Kartu acuan harga` 4630 dan `Dialog buang` 4510.
- [x] Kontrak radius kartu repo: `src/styles/system/_cards.scss:3` ("Kartu: satu radius, satu garis, satu elevasi") + `src/styles/_tokens.scss:74` (`--radius-lg: 16px`).
- [x] Deviasi yang dicatat: `.oh-empty` di app **tidak** berlatar kartu; di dokumen desain ia disajikan sebagai kartu supaya seksi "keadaan kosong" seragam dengan `Kartu kosong` lain di file ini (permintaan pemilik 2026-11-07: "card layout masih kotak").

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan: `Pesanan / 4 · riwayat kosong` memakai satu permukaan kartu putih membulat, bukan blok transparan yang terbaca sebagai kotak.
- [x] State: tab `Riwayat · 0`, chip `Selesai` aktif, tanpa kelompok tanggal dan tanpa kartu pesanan.
- [x] Sengaja tidak ada: tombol aksi di dalam kartu (sumber tidak punya aksi), ilustrasi tambahan, lencana, dan strip tanggal.
- [x] Angka: kartu 350 lebar, y 228 (20 px di bawah chip yang berakhir di 208), padding 48 atas/bawah + 32 kiri/kanan, radius 16, isi gap 8.
- [x] Isi: ikon `ReceiptText` 40 (`#CBD5E1`), judul 15 SemiBold `#172434`, keterangan 13 Medium `#475569` rata tengah lebar 286.
- [x] Yang diubah: node 5552 `Keadaan kosong` — `fill` none -> `#FFFFFF`, `stroke` `#E2E8F0` 1 px, `cornerRadius` 16, `clip` tetap false; teks/ikon tidak dipindah.
- [x] Tidak ada perubahan pada 59 bingkai lain, tidak ada lapisan ditambah/dihapus, tidak ada interaksi baru.

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20; kartu 350 di dalam kolom.
- [x] MD-06 tidak berlaku: tidak ada sheet.
- [x] MD-07 tidak berlaku: tidak ada nominal/status di bingkai ini.
- [x] MD-11 tidak berlaku: tidak ada baris daftar.
- [x] MD-12 isi tidak keluar kotak: teks 286 di dalam kartu 350 (padding 32 kiri-kanan), `maxLines` tidak dipaksa sehingga dua baris keterangan tetap utuh.
- [x] MD-13 tidak berlaku: tidak ada overlay/back di bingkai statis ini.

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar.
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca.
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu.
- [x] Bayangan tidak ditambah; elevasi tetap garis `#E2E8F0` seperti kartu lain.
- [x] Warna dari token peran: `#FFFFFF` permukaan, `#E2E8F0` `--border`, `#172434` `--text-primary`, `#475569` `--text-secondary-strong`, `#CBD5E1` `--border-strong`.

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai `Pesanan / 4` (bukan hanya JSON).
- [x] Angka: kartu 350x203 di (20,228), radius 16, tidak ada anak keluar kotak.
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD).

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: 0 interaksi baru; perpindahan tab tetap `instant` (MD-13, `replace`), buka rincian `dissolve` 200 ms, kembali `dissolve` 220 ms.
- [x] Yang sengaja TIDAK dianimasikan: munculnya kartu kosong (state hasil saringan, diganti di tempat), radius, teks, dan jumlah.
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring/bounce, transisi layar <= 400 ms.
- [x] Teks dan angka tidak dianimasikan (tanpa count-up/per-karakter).
- [x] `prefers-reduced-motion`: tidak ada gerak baru; konvensi file (instan/crossfade tanpa geser) tetap berlaku.
