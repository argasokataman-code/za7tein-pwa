# Preflight desain — Radius foto kartu disamakan

Status: disetujui
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber utama: `src/styles/system/_checkout.scss:97` dan `src/styles/system/_checkout.scss:164` — thumb 44 dan tombol drop kartu keranjang memakai `border-radius: var(--radius-md)`; jadi foto baris memang sudut membulat, bukan kotak.
- [x] Sumber kedua: `src/styles/_tokens.scss:71` — `--radius-xs: 8px` (badge, kontrol rapat) satu-satunya token pembulatan terkecil yang sah; dipakai untuk semua foto kartu supaya seragam dan lolos gerbang radius.
- [x] Sumber ketiga: `design/beta-v1.figcraft` node `4883` (`Foto item 1`, vektor 64x69, busur 6,26 px dari 12 verteks) — bentuk acuan yang diminta user ("segitu roundednya"); 6,26 bukan skala token, jadi dibulatkan ke 8 px dan vektornya disetel ulang ke 8 px agar semuanya benar-benar sama.
- [x] Prototipe/irisan: `docs/design/v2-source/src/components/NearbyDishes.tsx` — kartu menu memakai foto dengan sudut membulat; radiusnya tidak dipatok di irisan, jadi angka diambil dari token repo.

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: menyamakan pembulatan semua foto kartu di 58 bingkai supaya satu bahasa bentuk, bukan campuran kotak siku dan membulat.
- [x] State yang ditampilkan: seluruh state yang ada (beranda, cari, detail warung, keranjang, checkout, pesanan) — tidak ada state baru, hanya bentuk foto.
- [x] Sengaja tidak ada: perubahan ukuran/posisi foto, caption, atau teks; tanpa sudut penuh (pill) dan tanpa foto baru.
- [x] Geometri: 45 kotak foto (52, 56, 64x69, 142x148, 168x118, 60x60) + 8 vektor foto baris item; `cornerRadius 8` (`--radius-xs`), `clip true`; gutter 20, padding baris 12, tinggi baris 72-94, target >= 44 tidak berubah.
- [x] Teks: tidak ada teks diubah; kombinasi huruf tetap 8 (`13|Medium`, `13|SemiBold`, `15|Medium`, `15|SemiBold`, `16|SemiBold`, `17|SemiBold`, `21|ExtraBold`, `28|ExtraBold`).
- [x] Dikecualikan sadar: foto hero selebar layar (`Hero foto` 276/303/332/359/741/776/819, `Hero toko` 4252/4314/4753/4811, `Hero menu` 4648) tetap apa adanya karena itu kepala layar, bukan foto kartu.
- [x] Foto `Thumb warung 1/2` (5282, 5288) turun dari 12 ke 8 dan tile `Kategori` (15 frame) turun dari 16 ke 8 supaya satu nilai dipakai di semua foto kartu.

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20 tidak berubah; foto tetap di dalam kotak baris.
- [x] MD-06 tidak berlaku: tidak ada sheet yang disentuh.
- [x] MD-07 status/nominal tidak berubah, hanya sudut foto.
- [x] MD-11 rel kanan baris daftar seragam (lebar tetap) dan tinggi baris tetap; perubahan radius tidak menggeser x/y.
- [x] MD-12 tidak ada anak keluar kotak / terpotong diam-diam; `clip true` hanya memotong foto di dalam kotaknya sendiri.
- [x] MD-13 tidak berlaku: tidak ada navigasi/overlay yang diubah.

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar.
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca.
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu.
- [x] Bayangan dari token `--shadow-*`; variasi kartu tetap dari isi (thumb/judul/chip), bukan dari bentuk foto.
- [x] Warna/ukuran dari token: radius 8 = `--radius-xs`, bukan angka karangan.

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai (bukan hanya JSON).
- [x] Irisan kotak anak dalam satu bingkai = 0 (cek x/y/w/h) setelah perubahan.
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD).

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: 0 interaksi baru di pekerjaan ini; 190 interaksi yang ada tidak disentuh (maju `push` 320, kembali `dissolve` 220, overlay-sheet `dissolve` 200, tab `instant`).
- [x] Yang sengaja TIDAK dianimasikan: sudut foto `instant` — radius adalah atribut bentuk statis, tidak ada transisi radius saat layar masuk, tab replace tetap `instant` (MD-13).
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring/bounce, transisi layar tetap <= 400 ms.
- [x] Teks dan angka tidak dianimasikan; status berubah lewat chip, bukan animasi.
- [x] Angka gerak: mengikuti konvensi file yang sudah ada — `push` 320 ms dan `dissolve` 220 ms dengan easing `easeInOut`; tidak ada durasi baru.
- [x] `prefers-reduced-motion`: transisi jadi instan/crossfade, tanpa pergeseran posisi.
