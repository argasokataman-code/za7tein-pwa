# Preflight desain — satu radius kartu di semua seksi

Status: disetujui
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Kontrak kartu repo: `src/styles/system/_cards.scss:3` — komentar "Kartu: satu radius, satu garis, satu elevasi", semua kelas kartu di bawahnya memakai `border-radius: var(--radius-lg)` (`:13`).
- [x] Bukti pemakaian berulang: `src/styles/system/_order-history.scss:180` (`.oh-card`), `src/styles/system/_checkout.scss:24,50,197,312` (kartu checkout, keranjang lain, dialog) semuanya `--radius-lg`.
- [x] Skala token: `src/styles/_tokens.scss:71-76` — `--radius-xs` 8 (thumb/badge), `sm` 10 (input), `md` 12 (tombol), `lg` 16 (kartu, list item), `xl` 24 (banner/kartu besar), `2xl` 32 (sheet/modal), `pill`.
- [x] Deviasi yang sedang diseragamkan: `src/styles/system/_currency-converter.scss:129` (`.cc__rate`) dan `:236` (`.cc__convert`) memakai `--radius-xl` 24, sementara kartu di `:436` (`.cc__reference`) memakai `--radius-lg` 16 — satu layar Kurs memuat dua peringkat radius untuk benda yang sama-sama "kartu".
- [x] Peringkat yang TIDAK ikut disamakan (sengaja beda dan tetap): sheet `--radius-2xl` 32 (`src/styles/system/_sheet.scss`, `.oh-*`), tombol `--radius-md` 12, field `--radius-sm` 10, thumb/badge `--radius-xs` 8, chip `--radius-pill`.
- [x] Peta bingkai yang disentuh: `design/beta-v1.figcraft` — `Banner promo` (3866, 5026), `Kartu kosong` (4172, 4217), `Dialog buang` (4510), `Kartu kurs acuan` (4579), `Kartu konversi` (4586), `Kartu acuan harga` (4630), `Banner` 12 px di F21.

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan: satu nilai radius untuk semua permukaan berperingkat kartu, supaya tidak ada seksi yang memuat kartu 24 dan kartu 16 berdampingan.
- [x] State yang ditampilkan: tidak ada state baru; hanya bentuk. 60 bingkai tetap 60, tidak ada lapisan ditambah/dihapus.
- [x] Nilai sasaran: **16 px (`--radius-lg`)** untuk semua frame berisi yang berperan kartu (`Kartu …`, `Card`, `Banner`, `Banner promo`, `Dialog`, `Dialog buang`, `List`, `Message`, baris item/menu/warung).
- [x] Daftar ubahan: `Banner promo` 24→16 (×2), `Kartu kosong` 24→16 (×2), `Dialog buang` 24→16, `Kartu kurs acuan` 24→16, `Kartu konversi` 24→16, `Kartu acuan harga` 24→16, `Banner` F21 12→16.
- [x] Sengaja TIDAK diubah: `Sheet tutup` 32 (sheet, peringkat `--radius-2xl`), `Brandmark` 72 px r24 (logo kotak, bukan kartu), thumb foto 8, `Button …` 12, `Input`/`Code input` 10, chip/pil 9999, `Track` pil, root bingkai r30 (sudut mock perangkat).
- [x] Angka: 7 frame kartu berubah radius; 0 perubahan x/y/width/height; 0 perubahan warna, teks, atau isi.
- [x] Geometri tetap: gutter 20, kartu 350 lebar, jarak antar kartu 16, tinggi kartu tidak berubah.

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20 tidak disentuh; radius tidak menggeser kotak.
- [x] MD-06 tidak berlaku: tidak ada sheet baru; sheet yang ada tetap 32 sesuai peringkatnya.
- [x] MD-07 tidak berlaku: tidak ada nominal/status yang dipindah.
- [x] MD-11 tidak berlaku: rel kanan baris tidak disentuh.
- [x] MD-12 tidak berlaku: radius tidak menambah luberan; `clip` tiap frame dipertahankan.
- [x] MD-13 tidak berlaku: tidak ada interaksi/perilaku berubah.

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar.
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca.
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu.
- [x] Tidak ada bayangan baru; elevasi tetap dari garis `#E2E8F0` yang sudah ada.
- [x] Semua nilai radius berasal dari skala token (`--radius-lg` 16), bukan angka karangan.

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai Kurs, Beranda / 3, Keranjang / 2 (bukan hanya JSON).
- [x] Rekap radius seluruh frame berisi: hanya 8/10/12/16/32/9999/30 (root) yang tersisa untuk peringkatnya masing-masing.
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD).

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: 0 interaksi baru; 196 interaksi yang ada tidak disentuh (maju `push` 320 ms, kembali `dissolve` 220 ms, overlay/sheet `dissolve` 200 ms, tab `instant`).
- [x] Yang sengaja TIDAK dianimasikan: radius (properti bentuk statis, bukan transisi), isi kartu, tab, chip.
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring/bounce, transisi layar <= 400 ms.
- [x] Teks dan angka tidak dianimasikan (tanpa count-up/per-karakter).
- [x] `prefers-reduced-motion`: tidak relevan karena tidak ada gerak baru; konvensi lama tetap berlaku.
