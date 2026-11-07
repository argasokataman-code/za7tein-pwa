# Preflight desain — Tombol filter beranda

Status: approved
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber utama: `src/components/customer/CustomerHomeHero.css:445-462` — `.s7-search__filter`: 48x48, `border-radius: var(--radius-lg)` 16, `background: var(--surface)`, `color: var(--text-primary)`, `box-shadow: var(--shadow-md), inset 0 0 0 1px color-mix(in srgb, var(--on-brand) 80%, transparent)`, `display: grid; place-items: center`, `flex: 0 0 auto`; hover `:464-468` latar `--bg-warm`
- [x] Sumber ikon: `src/components/customer/CustomerHomeHero.tsx:50-51` — `SlidersHorizontal` (lucide), `size` 20 lewat CSS `CustomerHomeHero.css:495-505`, `strokeWidth={2}`
- [x] Sumber baris: `src/components/customer/CustomerHomeHero.css:254-263` (`.s7-search` flex, `gap: var(--space-2)` 8, `margin-top: var(--space-4)` 16) dan `:267-288` (`.s7-search__box` 48, radius 16, `--surface`, border 1px putih 80%, `--shadow-md`)
- [x] Sumber state aktif (prototipe): `docs/design/v2-source/src/components/HeroGreeting.tsx:113-124` — filter aktif mengubah isi tombol (bukan menambah elemen baru) + badge angka 20 px di pojok, cincin 2 px putih
- [x] Sumber bayangan: `src/styles/_tokens.scss:203` — `--shadow-md: 0 8px 24px rgba(23, 36, 52, 0.10)`; dipakai field dan tombol sekaligus supaya baris terbaca satu benda terangkat

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: membuka panel filter dari header beranda; tombol harus terbaca "kontrol" di atas latar oranye, bukan kotak putih tanpa tepi
- [x] State yang ditampilkan: non-aktif (2673, 3952, 5008; dan 2930 di halaman cari) dan aktif dengan 2 filter (4075)
- [x] Sengaja tidak ada: teks label di dalam tombol (ikon saja, `aria-label` di kode), panah, gradien, ikon dekoratif
- [x] Sengaja tidak ada: badge di tiga tombol non-aktif — badge hanya muncul saat ada filter aktif (`HeroGreeting.tsx:118-124`)
- [x] Geometri: 48x48 di x322, radius 16, jarak 8 dari field 294 (`20+294+8 = 322`), sama tinggi 48 dengan field, ikon 20 di (14,14)
- [x] Geometri state aktif: badge 20x20 di (28,0) di dalam kotak (prototipe menggantung -4 px di luar; FigCraft menolak anak keluar induk, jadi dibuat rata pojok dalam), cincin putih 2 px diganti bidang putih 2 px di sekeliling angka
- [x] Ikon diganti: lambang tiga garis menurun (bukan ikon lucide) diganti `SlidersHorizontal` asli — tiga rel horizontal dengan tiga kenop, 20x20, `strokeWidth` 2, `fill: none`
- [x] Tepi: `#FFFFFFCC` (putih 80%, sama dengan `color-mix(on-brand 80%)`) 1 px di tombol dan field; tanpa tepi ini tombol putih di atas oranye kehilangan bentuk
- [x] Bayangan: `--shadow-md` = offset (0,8), blur 24, `rgba(23,36,52,0.10)` di tombol dan field, supaya baris cari terbaca satu grup terangkat seperti sumber
- [x] State aktif tanpa warna baru: latar `#172434` (`--navy`), ikon putih, badge `#E44220` (`--sa7tein-orange`); prototipe memakai amber-300 yang tidak ada di token repo, dan menambah hue ke-3 di header oranye melanggar `QL-02` (satu aksen)
- [x] Teks: hanya angka badge, `13|SemiBold` putih (kombinasi yang sudah ada, tetap 8 kombinasi)

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20: baris berakhir di 370
- [x] MD-05 target sentuh: tombol 48x48 >= 44
- [x] MD-07 status: state aktif ditandai isi tombol (latar navy + badge angka), bukan kata abu
- [x] MD-11 tidak berlaku: ini tombol ikon, bukan baris daftar `list-row`
- [x] MD-12 tidak ada anak keluar kotak: ikon 20 di (14,14) dalam 48; badge 20 di (28,0) dalam 48
- [x] MD-13 tidak berlaku: tombol tidak membuka overlay sendiri; sheet filter hidup di bingkai `Filter / 1` dan menutup lewat `dissolve` 220 ms

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu
- [x] Bayangan dari token `--shadow-md`, bukan nilai karangan; satu bayangan untuk field dan tombol, bukan bayangan per elemen
- [x] Ikon dari set yang dipakai repo (lucide `SlidersHorizontal`), bukan lambang karangan; tiga garis menurun sebelumnya adalah ikon buatan tangan yang tidak ada di kode mana pun
- [x] Warna dari peran token (`--surface`, `--navy`, `--sa7tein-orange`, `--text-primary`, putih 80% untuk tepi)

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai (bukan hanya JSON): 3865, 4091, dan baris cari utuh
- [x] Irisan kotak anak dalam satu bingkai = 0 (cek x/y/w/h): ikon 14-34, badge 28-48 di dalam 48
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD)

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: tombol sendiri nol animasi; interaksi `navigate` ke `Filter / 1` (4698) sudah ada di bingkai induk, transisi `push` 320 ms
- [x] Yang sengaja TIDAK dianimasikan: perubahan state aktif/non-aktif (warna dan badge berganti seketika, tanpa transisi layar), ikon (tanpa rotasi/bounce), angka badge (tanpa count-up)
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring, durasi <= 400 ms
- [x] Tekan tombol mengikuti `system/_interaction.scss:57-67` (`scale` saat `:active`) di kode, bukan animasi tambahan di file desain
- [x] Angka gerak: maju ke panel filter `push` 320 ms `easeInOut`, menutup panel `dissolve` 220 ms `easeInOut`
- [x] `prefers-reduced-motion`: transisi jadi instan, tanpa pergeseran posisi
