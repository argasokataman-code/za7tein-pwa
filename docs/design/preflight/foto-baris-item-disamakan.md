# Preflight desain — Foto baris item disamakan

Status: approved
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Acuan revisi pemilik: bingkai `Keranjang / 3 · item tak diproses` node `Foto item 1` (4883) — vektor gambar 64x69 di (6,13) dalam baris 350x94, sudut membulat; baris 4882 juga sudah memakai bentuk ini
- [x] Sumber kode geometri foto: `src/styles/system/_cart.scss:118-133` — `.checkout-item__image` 52x52 `border-radius: var(--radius-sm)`; `src/styles/app/part-09.scss:459-467` padding baris 12; jadi foto 64x69 adalah revisi desain, bukan angka dari kode (dicatat sebagai deviasi)
- [x] Sumber bentuk membulat: `src/styles/_tokens.scss` `--radius-md` 12 (skala radius v2), dipakai konsisten untuk thumb keranjang lain (`src/styles/system/_checkout.scss:89-100`, thumb 44 radius 12)
- [x] Sumber isi tiap baris (foto mana milik menu mana): `src/data/foods.ts:64-130` — Sate Ayam `sate-ayam.webp`, Sate Kambing `sate-kambing.webp`, Es Teh Manis `es-teh-manis.webp`, Lontong `lontong.webp`; aset di `public/assets/img/menu/`

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan: satu bentuk foto untuk semua baris item 94 px, supaya tidak ada baris dengan foto kotak 52x52 di sebelah foto 64x69 dalam satu layar yang sama
- [x] State yang disamakan: 9 baris item 94 px — 4387 & 4388 (`Keranjang / 1`), 4456 & 4469 (`Keranjang / 2`), 4895 (`Keranjang / 3`), 5238, 5250, 5262 (`Checkout / 2`); 4882 sudah sesuai dan jadi acuan
- [x] Angka: foto 64x69 di (6,13), sudut membulat sama seperti 4883 (bentuk vektor dipakai ulang apa adanya, radius tidak ditebak)
- [x] Angka: teks tetap di x76 (jarak 6 px dari tepi foto 70), nama y14, opsi y35, satuan y55, total (214,12), stepper (214,38) 124x44 — tidak ada yang bergeser
- [x] Sengaja tidak ada: perubahan tinggi baris (tetap 94), perubahan lebar baris (350), perubahan ukuran stepper, badge, atau tipografi
- [x] Sengaja tidak diubah: baris `tidak diproses` (tinggi 72/76) tetap 52x52 karena foto 69 px hanya menyisakan 1,5 px tepi atas-bawah; kalau mau ikut disamakan, tingginya harus dinaikkan lebih dulu
- [x] Gambar per baris dipertahankan sesuai menunya: Sate Ayam, Es Teh Manis, Sate Kambing, Lontong — tidak semua diseragamkan jadi satu foto
- [x] Sudut baris tetap radius 16 (`cornerRadius` baris) dan `clip: true`, jadi foto ikut terpotong rapi di tepi baris

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20: baris tetap 350 di x20
- [x] MD-05 target sentuh: stepper 44x44 tidak berubah
- [x] MD-07 status & angka: total tetap rata kanan di x214..338, `tabular-nums`
- [x] MD-11 satu rel kanan: kolom kanan (total + stepper) tidak digeser
- [x] MD-12 tidak ada anak keluar kotak: foto 6..70 x 13..82 di dalam 350x94; teks mulai 76
- [x] MD-13 tidak berlaku: perubahan hanya di dalam baris, tanpa navigasi atau overlay baru
- [x] MD-14 tidak berlaku: tidak ada state gulir atau overlay yang berubah

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase/eyebrow, teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu
- [x] Tidak ada bayangan karangan di foto; kedalaman kartu tetap dari tepi 1 px `#E2E8F0`
- [x] Bentuk membulat memakai radius token (`--radius-md` 12) yang sama dengan thumb keranjang lain, bukan radius karangan
- [x] Tidak menambah ikon baru; stepper dan chip tetap seperti aslinya

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi baris sebelum/sesudah (bukan hanya JSON): 4387, 4456, 4895, 5238, 5250, 5262
- [x] Irisan kotak anak dalam satu bingkai = 0: foto 64x69 di (6,13), nama 126 di x76 (berakhir 202) sebelum total 214
- [x] Foto tiap baris memuat menu yang benar (cek mata, bukan nama layer saja)
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD)

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: tidak ada gerak baru; baris ini statis, tombol stepper tetap seperti sebelumnya
- [x] Yang sengaja TIDAK dianimasikan: pergantian foto (tidak ada), perubahan qty (angka berganti seketika), sorotan baris
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring, durasi <= 400 ms
- [x] Angka gerak: `push` 320 ms `easeInOut` untuk masuk ke checkout, `dissolve` 220 ms `easeInOut` saat kembali (sudah ada di bingkai induk, tidak diubah)
- [x] `prefers-reduced-motion`: transisi jadi instan, tanpa pergeseran posisi
