# Preflight desain — Beranda kartu menu

Status: approved
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber utama: `docs/design/v2-source/src/components/NearbyDishes.tsx:96-199` — urutan elemen kartu menu: media, favorit kanan-atas, badge hemat kiri-bawah, judul, nama warung, baris rating+waktu, harga+tombol tambah satu baris
- [x] Sumber kedua: `docs/design/v2-source/src/components/NearbyDishes.tsx:177-198` — baris harga: `mt-2.5`, `pt-1`, `border-t border-slate-100`, justify-between, harga `text-sm font-black`, tombol plus `w-7 h-7 rounded-full bg-[#FFF0EB]`
- [x] Sumber ketiga: `docs/design/v2-source/src/components/NearbyDishes.tsx:80` — grid 2 kolom `gap-3.5` (14 px) di dalam gutter 20, jadi kartu `(350-14)/2 = 168 px`
- [x] Target sentuh: `src/styles/system/_food-card.scss:244-259` — repo menuntut tombol tambah 44x44 (`--touch-min`), jadi cakram 28 px duduk di dalam kotak 44 px (cakram = visual prototipe, kotak = target jari)

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: memilih menu dari beranda tanpa membuka halaman warung; kartu menampilkan harga dan tombol tambah langsung
- [x] State yang ditampilkan: warung buka, dua menu dengan diskon 20%, satu item sudah masuk keranjang (frame 5008 memakai salinan kartu yang sama)
- [x] Sengaja tidak ada: status buka/tutup, chip ETA, dan tombol favorit berlabel — prototipe menaruh semuanya di baris warung, bukan di kartu menu; kartu menu hanya hati tanpa teks
- [x] Sengaja tidak ada: deskripsi menu dan jumlah terjual — tidak ada di `NearbyDishes.tsx:96-199`
- [x] Geometri: gutter 20, kartu 168x244 di x20 dan x202 (jarak 14), media 118, padding isi 12, badge 92x24 di 8/86, favorit cakram 32 di (128,8) dalam kotak 44 di (122,2), nav di y780
- [x] Deviasi tercatat: media 118, bukan 4:3 (126) seperti `NearbyDishes.tsx:102`, karena anggaran tinggi dari chip (y534) ke nav (y780) cuma 244 px; 4:3 membuat kartu 252 px dan tertutup nav
- [x] Irama vertikal: judul 130-150, nama warung 154-172 (jarak 4), baris rating 176-194 (jarak 4), garis pemisah 200 (jarak 6), harga 208-226, tombol tambah 44 di (120,195), sisa bawah 13
- [x] Teks: `15|SemiBold` judul, `13|Medium` nama warung/waktu/dot, `13|SemiBold` rating/harga/badge — semuanya kombinasi yang sudah ada, tidak menambah kombinasi ke-9
- [x] Warna peran: judul `#172434`, meta `#64748B`, harga `#B83213`, bintang `#D97706` (isi + garis), cakram tambah `#FFF0EB` + ikon `#E44220`, garis pemisah `#E2E8F0`

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20, dua kolom kartu berakhir di 370
- [x] MD-05 target sentuh: favorit 44, tambah 44 (cakram 28 dan 32 hanya visual)
- [x] MD-07 angka rata: harga memakai `tabular-nums` lewat font yang sama, jarak 4,5 dan waktu tidak bertumpuk dengan harga (dulu harga y208 menabrak baris rating y190)
- [x] MD-11 tidak berlaku: kartu bukan baris daftar `list-row` (tidak ada rel kanan nominal+aksi)
- [x] MD-12 tidak ada anak keluar kartu: kotak tombol tambah 44 di y195-239 masih di dalam kartu 244
- [x] MD-13 tidak berlaku: kartu tidak punya overlay/riwayat sendiri; tab beranda tetap `instant` di bingkai induk

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu; kedua kartu identik kecuali isi
- [x] Tanpa bayangan karangan; kedalaman dari border `#E2E8F0` + radius 16 (prototipe `shadow-xs` dilepas, bukan dinaikkan)
- [x] Warna/ukuran dari token (`--text-primary`, `--text-secondary`, `--orange-ink`, `--border`, `--radius-lg`), bukan nilai karangan

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai (bukan hanya JSON): 3873/3874 dan 5054/5070
- [x] Irisan kotak anak dalam satu bingkai = 0 (cek x/y/w/h): harga 12-102 vs tombol tambah 120-164, badge 8-100 vs favorit 122-166
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD)

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: kartu sendiri nol interaksi; bingkai induk 2673 punya 10 (`Kartu nasi goreng` dan `Kartu sate ayam` maju `push` 320 ms ke Detail, sisanya `push` + 1 tab `instant`); bingkai 5008 punya 11
- [x] Yang sengaja TIDAK dianimasikan: tombol `+` (menambah item, angka dan badge berubah tanpa transisi layar), hati favorit (state, bukan perpindahan ruang), pindah tab beranda (`instant`, MD-13)
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring/bounce, transisi layar 320 ms (<= 400)
- [x] Teks dan angka tidak dianimasikan; harga dan rating tidak count-up
- [x] Angka gerak: 320 ms `easeInOut` untuk maju, 220 ms `easeInOut` untuk kembali, konvensi file F21/F12/F16
- [x] `prefers-reduced-motion`: transisi jadi instan, tanpa pergeseran posisi
