# Preflight desain — Pesanan / 1 · cart sebagai card

Status: approved
Disetujui: 2026-11-07

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber utama: `src/pages/MyOrder.tsx:286-437` — tab `Aktif`/`Riwayat` berhitung, kartu keranjang (`oh-cart`), dan daftar order aktif
- [x] Sumber kedua: `src/components/customer/OrderHistoryCard.tsx:28-40` — thumb 84x70 + fallback; `:141-187` — kepala (nama, `code · waktu`, chip tahap), baris item + total, kaki dua kolom
- [x] Geometri dari CSS: `src/styles/system/_order-history.scss:178-450` (kartu radius 16, kepala padding 12, thumb 84x70, kaki min 44, divider 1x16)
- [x] Requirement: `docs/product/prd/versions/sa7tein-beta-2026-11-05/features/R-CUS-CART.md` A3/A5

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: customer memutuskan melanjutkan keranjang ke checkout atau melacak order berjalan
- [x] State yang ditampilkan: tab `Aktif` aktif, keranjang berisi 2 menu, dua order berjalan (tahap `disiapkan` dan `diantar`)
- [x] Sengaja tidak ada: kartu riwayat dan rel kemajuan — tab `Aktif` tidak menampilkannya (`MyOrder.tsx:415-437` hanya keranjang + order berjalan)
- [x] Geometri: gutter 20, padding kartu 16, tinggi kartu keranjang 164 px, tinggi kartu order 206 px, jarak antar blok 16 px, nav di y780, target tombol >= 44 px
- [x] Teks: 21/ExtraBold judul, 17/SemiBold nama, 15/SemiBold toko & CTA, 16/SemiBold nominal, 13/Medium meta dan 13/SemiBold chip; 6 kombinasi dari 8 yang diizinkan
- [x] Copy persis sumber: `Lanjut ke pembayaran`, `2 item pesanan`, `Estimasi siap 12:47`, `Lacak pesanan`

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20
- [x] MD-06 tidak berlaku: bingkai ini tanpa sheet
- [x] MD-07 status = chip bertitik warna peran, nominal rata kanan sebaris judul kartu
- [x] MD-11 rel kanan baris daftar seragam (nominal x338 pada kedua kartu), tinggi baris meta seragam 16 px
- [x] MD-12 tidak ada anak keluar kotak atau terpotong diam-diam (cek irisan = 0)
- [x] MD-13 tidak berlaku: bingkai tanpa back/overlay, tab adalah state Redux bukan riwayat

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu
- [x] Bayangan dari token; variasi kartu datang dari isi (thumb, nama, chip tahap)
- [x] Warna/ukuran dari token: `#172434`, `#475569`, `#E2E8F0`, `#E44220`, `#F0F9FF`, `#0369A1`, `#ECFDF5`, `#047857`

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai 4942 (bukan hanya JSON)
- [x] Irisan kotak anak dalam satu bingkai = 0 untuk 5113, 5115, 5118
- [x] `npm run figcraft:audit` PASS (56 bingkai, 2555 lapisan, 0 temuan) + senior-fe Delivery Gate tanpa temuan HG/PG/MD terbuka

## 6. Gerak (motion)

- [x] Peta gerak: 3 interaksi — `Lanjut ke pembayaran` maju `push` 320 ms, `Lacak pesanan` maju `push` 320 ms, dua tab `instant` (MD-13 replace)
- [x] Yang sengaja TIDAK dianimasikan: pindah tab `Aktif`/`Riwayat` (replace, tanpa slide), nominal dan chip status (perubahan data, bukan perpindahan ruang)
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, durasi layar 320 ms (<= 400)
- [x] Teks dan angka tidak dianimasikan; status berubah lewat chip
- [x] Angka gerak: 320 ms + easeInOut, konvensi file F21/F12/F16
- [x] `prefers-reduced-motion`: transisi jadi instan, tanpa pergeseran posisi
