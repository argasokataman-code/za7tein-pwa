# Preflight desain — Nominal keranjang lain JOD

Status: disetujui
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber utama: `src/pages/Checkout.tsx:90-100` — rel kanan baris keranjang lain berisi nominal `formatAmount(cart.subtotal)` lalu tombol buang; nominal memang ada, tapi diformat `useMoney`.
- [x] Sumber kedua: `src/hooks/useMoney.ts:16` + `src/data/currency.ts:173` — `DEFAULT_CURRENCY = 'JOD'` dan `jod()` selalu menghasilkan `"<angka> JOD"`; tidak ada lagi tampilan rupiah di layar peran.
- [x] Sumber ketiga: `src/styles/system/_checkout.scss:69` — kolom rel kanan lebar tetap `calc(var(--space-8) * 4 + var(--space-2))` = 136 (84 nominal + 8 gap + 44 tombol).
- [x] Prototipe/irisan: `docs/design/slice/beta/` — blok daftar memakai satu rel kanan, nominal sebaris judul (MD-07/MD-11).

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: memperbaiki isi baris "Keranjang lain" di `Checkout / 2` supaya nominal memakai JOD seperti seluruh layar, bukan rupiah.
- [x] State yang ditampilkan: dua keranjang lain aktif ("Warung Sate Pak Ali" 5 item, "Kopi Kenangan Kecil" 3 item), keranjang aktif berisi 3 baris.
- [x] Sengaja tidak ada: perubahan struktur baris, thumb 44, tombol buang 44, chip status, atau teks lain.
- [x] Geometri: baris 350x60 (kedua baris sama; baris ke-2 sebelumnya 61), pemisah 348x1 di y60, blok 350x121; gutter kiri 12, kanan 12; rel kanan 136 = nominal 84 (rata kanan di x286 lokal) + gap 8 + tombol 44.
- [x] Teks: nominal 13 SemiBold `130%`; nilai `4,52 JOD` (104.000 IDR / 23.000) dan `0,78 JOD` (18.000 IDR / 23.000), dihitung dengan `jod()` yang sama seperti frame `Pesanan / 2`.
- [x] Angka kurs: `src/data/currency.ts:17` `rate: 23000`, bukan angka karangan.

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20 tetap; blok 350 di dalam kolom.
- [x] MD-06 tidak berlaku: tidak ada sheet di layar ini.
- [x] MD-07 nominal rata kanan sebaris dengan nama warung (beda 1 px, sama seperti `Pesanan / 2`).
- [x] MD-11 rel kanan seragam antar baris: nominal rata kanan x286 lokal, tinggi baris dua-duanya 60.
- [x] MD-12 tidak ada anak keluar kotak; clip blok tetap true.
- [x] MD-13 tidak berlaku: tidak ada navigasi/overlay diubah.

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar.
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca.
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu.
- [x] Bayangan/tinta dari token yang sudah dipakai blok ini (`#172434`, `#475569`).
- [x] Tidak ada warna/radius baru.

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi blok (bukan hanya JSON).
- [x] Selisih tinggi baris 0 dan nominal kedua baris rata kanan satu nilai.
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD).

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: 0 interaksi baru; 190 interaksi yang ada tidak disentuh (maju `push` 320, kembali `dissolve` 220, overlay-sheet `dissolve` 200, tab `instant`).
- [x] Yang sengaja TIDAK dianimasikan: perubahan teks nominal `instant` — nominal adalah data, bukan transisi; tab replace tetap `instant` (MD-13).
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, transisi layar <= 400 ms.
- [x] Teks dan angka tidak dianimasikan (tanpa count-up); nilai berganti langsung.
- [x] Angka gerak: konvensi file tidak berubah — `push` 320 ms `easeInOut`, `dissolve` 220 ms.
- [x] `prefers-reduced-motion`: transisi jadi instan/crossfade, tanpa pergeseran posisi.
