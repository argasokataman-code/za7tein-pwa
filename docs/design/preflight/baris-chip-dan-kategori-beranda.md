# Preflight desain — Baris chip dan kategori beranda

Status: approved
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber chip filter (prototipe): `docs/design/v2-source/src/components/NearbyDishes.tsx:43-77` — kontainer `flex items-center gap-2`, tiga chip berutility sama `px-3 py-1.5 rounded-full text-xs font-bold shrink-0`: `Paling cocok`, `Rating 4,5+`, `Ongkir hemat`; aktif `bg-[#FFEAE2] text-[#E44222] border border-[#E44222]/30`, non-aktif `bg-slate-100 text-slate-600 border border-transparent`
- [x] Sumber target dan tinggi minimum (repo): `src/styles/system/_storefront.scss:227-242` — `.sort-pill` `min-height: var(--touch-min)` 44, `padding: 0 var(--space-3)`, `border-radius: var(--radius-pill)`, `font-size: var(--text-sm)`; `.is-on` `:257-261` border `--sa7tein-orange` + teks `--orange-ink`
- [x] Sumber barisnya: `src/styles/system/_storefront.scss:211-223` — `.merchants-toolbar` dan `__group` `display: flex; gap: var(--space-2)` 8
- [x] Sumber kategori (prototipe): `docs/design/v2-source/src/components/CategoryList.tsx:133` grid `grid-cols-5 gap-2 sm:gap-3`, tile `w-14 h-14` (`:146`), label `text-xs font-bold` (`:157-159`)
- [x] Sumber chip keadaan kosong aktif: `src/pages/Home.tsx:183-190` — label `Rating 4,5+`, kelas `sort-pill` + `is-on` saat `minRating >= 4.5`

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: menyaring daftar toko tanpa membuka panel; baris chip harus terbaca satu tingkat kontrol yang setara, bukan tiga kotak dengan ukuran berbeda
- [x] State yang ditampilkan: beranda biasa (chip 1 aktif `Paling cocok`) di 2673/3952/5008; beranda kosong dengan dua filter aktif (`Rating ≥ 4,5`, `Jarak ≤ 1 km`) + `Reset` di 4075
- [x] Sengaja tidak ada: ikon di dalam chip, badge angka, tombol tutup per chip; prototipe hanya teks
- [x] Geometri chip: tinggi 44 (`--touch-min`), lebar sama 111,3 = `(350 - 2x8) / 3`, gap 8, x 20 / 139,3 / 258,6, ujung kanan 369,9 (gutter 20)
- [x] Deviasi tercatat: prototipe memakai tinggi ~30 (`py-1.5` + `text-xs`); di file desain dipakai 44 supaya sama dengan `.sort-pill` (`min-height: var(--touch-min)`) dan MD-05; tiga chip dibuat selebar sama supaya baris simetris, walau `.sort-pill` di kode selebar isinya
- [x] Teks chip: x 12, lebar 87,3, `13|SemiBold`, rata tengah, y 14 = `(44-16)/2`; sebelumnya y 12 di chip 44 dan y 7 di chip 34, jadi teks ikut meleset 2 px
- [x] Geometri kategori: lima tile 60x60 dengan jarak sama 12,5 — x 0 / 72,5 / 145 / 217,5 / 290, label 60 px di x yang sama; sebelumnya jarak bergilir 12 dan 13 px
- [x] Warna tetap peran yang sudah ada: aktif `#FFF0EB` + tepi `#FED7AA` + teks `#9E3416`; non-aktif `#FFFFFF` + tepi `#E2E8F0` + teks `#475569`
- [x] Yang tidak diubah: label chip, urutan, radius pill 9999, tepi 1 px, fill, ukuran tile kategori 60 dan label 16 px

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20: baris mulai 20, ujung 369,9
- [x] MD-05 target sentuh: chip 44 tinggi, kategori tile 60
- [x] MD-07 status: chip aktif dibedakan isi (latar + tepi + teks), bukan kata abu
- [x] MD-08 sentence case: `Paling cocok`, `Rating 4,5+`, `Ongkir hemat`, `Reset` seperti sumber
- [x] MD-11 tidak berlaku: chip bukan baris daftar `list-row`
- [x] MD-12 tidak ada anak keluar kotak: teks 87,3 di x12 dalam chip 111,3; teks tidak menyentuh tepi (aturan FR-40 chipFlush)
- [x] MD-13 tidak berlaku: chip tidak membuka overlay; filter membuka layar `Filter / 1` lewat `push` 320 ms yang sudah ada

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu
- [x] Bayangan bukan penanda keadaan di sini; chip memakai isian dan tepi, bukan shadow
- [x] Warna/ukuran dari peran token (`--radius-pill`, `--touch-min`, `--space-2`), bukan nilai karangan

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai (bukan hanya JSON): baris chip 2673 dan 4075, baris kategori 2673
- [x] Irisan kotak anak dalam satu bingkai = 0 (cek x/y/w/h): teks di dalam chip, label kategori di bawah tile
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD)

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: chip aktif/non-aktif berganti isi tanpa transisi layar; menekan chip membuka `Filter / 1` (4698) lewat interaksi `push` 320 ms yang sudah ada di bingkai induk
- [x] Yang sengaja TIDAK dianimasikan: perubahan aktif chip (warna berganti seketika), jumlah hasil, dan badge; tidak ada slide/scale saat memilih
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring, durasi <= 400 ms
- [x] Tekan chip mengikuti `system/_interaction.scss:57-67` (`scale` saat `:active`) di kode, bukan animasi tambahan di file desain
- [x] Angka gerak: maju ke panel filter `push` 320 ms `easeInOut`, kembali `dissolve` 220 ms `easeInOut`
- [x] `prefers-reduced-motion`: transisi jadi instan, tanpa pergeseran posisi
