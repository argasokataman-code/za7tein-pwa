# Preflight desain — Keranjang 1 dan Checkout 1 · kerapian baris

Status: approved
Disetujui: 2026-11-07

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Baris item keranjang: `src/pages/Checkout.tsx:375` (stepper jumlah per item) dan `src/components/customer/CartSummarySheet.tsx:38` (tiap baris membawa aksinya sendiri)
- [x] Item tak diproses + chip: `src/pages/Checkout.tsx:375` (baris item) dan `src/styles/system/_cart.scss` aturan chip
- [x] Kartu checkout: `src/pages/Checkout.tsx:409` (alamat antar) dan `src/pages/Checkout.tsx:527` (biaya QRIS)
- [x] Requirement: `R-CUS-CART.md` A3/A6/A8 dan `R-CUS-CHECKOUT` aturan metode + kuota

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: customer memeriksa isi keranjang lalu memilih metode bayar sebelum order dikirim
- [x] State yang ditampilkan: keranjang berisi 2 item + 1 item tak diproses; checkout dengan QRIS aktif dan COD nonaktif
- [x] Sengaja tidak ada: rel kemajuan, banner promo, dan isi keranjang penuh di checkout (cukup ringkasan 2 baris)
- [x] Geometri: gutter 20, padding kartu 16, jarak antar blok 12 px, foto 56, aksi 44, stepper 100x34, nav/action bar tetap di y716
- [x] Jarak dalam baris: atas 12, bawah 12; pusat vertikal tiap kontrol = pusat baris (42 untuk baris 84, 36 untuk baris 72)
- [x] Chip: teks di dalam chip dengan padding 6-10 px, bukan menempel di tepi
- [x] Teks: 21/ExtraBold judul kartu, 17/SemiBold nama, 13/Medium meta, 13/SemiBold aksi; kombinasi tetap 8

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20
- [x] MD-06 tidak berlaku: tanpa sheet di bingkai ini
- [x] MD-07 chip bertitik/bertepi untuk status, nominal rata kanan sebaris label
- [x] MD-11 rel kanan seragam: nilai `3,22 JOD`/`0,45 JOD` berakhir di x334 pada semua baris
- [x] MD-12 tidak ada anak keluar kotak (stepper + tombol buang tidak bertumpuk)
- [x] MD-13 tidak berlaku: tanpa overlay

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu
- [x] Bayangan dari token; variasi kartu dari isi (foto, nama, chip)
- [x] Warna/ukuran dari token yang sudah dipakai bingkai ini

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi kedua bingkai
- [x] Cek angka: pusat vertikal kontrol = pusat baris, jarak antar blok = 12, irisan kotak = 0
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate tanpa temuan HG/PG/MD terbuka

## 6. Gerak (motion)

- [x] Peta gerak: 3129 punya 4 interaksi (3 maju `push` 320 ms, 1 kembali `dissolve` 220 ms); 3224 punya 2 (`Bayar` maju `push` 320 ms, kembali `dissolve` 220 ms)
- [x] Yang sengaja TIDAK dianimasikan: stepper qty dan perubahan total (angka, bukan perpindahan ruang), chip stok habis (keadaan, bukan animasi)
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/count-up, durasi layar 320 ms (<= 400)
- [x] Teks dan angka tidak dianimasikan
- [x] Angka gerak: 320 ms maju / 220 ms kembali, easeInOut, konvensi file F21/F12/F16
- [x] `prefers-reduced-motion`: transisi jadi instan, tanpa pergeseran posisi
