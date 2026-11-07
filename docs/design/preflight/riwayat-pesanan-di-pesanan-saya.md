# Preflight desain — Riwayat pesanan di Pesanan Saya

Status: disetujui
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Sumber utama: `src/pages/MyOrder.tsx:286-304` — tab pil `Aktif` | `Riwayat` berbagi satu wadah, tiap tab membawa jumlah (`Riwayat · 3`); isi tab diganti, bukan ditumpuk.
- [x] Sumber kedua: `src/pages/MyOrder.tsx:306-357` — baris saring `Semua / Selesai / Dibatalkan / Refund` (chip 44 tinggi) berbagi satu baris dengan kolom cari; kolom cari hanya terbuka lewat tombol di kepala, jadi bingkai riwayat menampilkan chip saja.
- [x] Sumber ketiga: `src/pages/MyOrder.tsx:385-417` — daftar dikelompokkan per hari (`oh-day__head`: label + jumlah) lalu catatan penutup `Semua pesanan yang sudah selesai atau dibatalkan`.
- [x] Sumber keempat: `src/components/customer/OrderHistoryCard.tsx:74-131` — anatomi kartu: kepala (thumb 84x70, nama, kode · cap waktu, lencana, chevron), baris item (ikon, `N item pesanan`, ringkasan, total), kaki 44 (kiri status rating/refund, kanan aksi `Beri rating` / `Pesan lagi`).
- [x] Geometri: `src/styles/system/_order-history.scss:97-140` (tabs), `:144-176` (strip tanggal 39 px), `:178-286` (kartu, thumb 84x70 radius 12), `:395-451` (kaki 44) dan `src/styles/system/_order-search.scss:34-70` (chip 44).
- [x] Prototipe/irisan: `docs/design/slice/order-history.html` (dirujuk `_order-history.scss:3` sebagai sumber geometri).

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai: menambah keadaan yang belum ada — `Pesanan Saya` tab `Riwayat` (dua pesanan selesai/dibatalkan) dan keadaan riwayat kosong.
- [x] State yang ditampilkan: `Pesanan / 3` = tab Riwayat aktif, chip `Semua` aktif, satu kelompok tanggal `6 November 2026` berisi 2 kartu (Selesai belum dinilai, Dibatalkan dengan dana dikembalikan); `Pesanan / 4` = chip `Selesai` tanpa hasil.
- [x] Sengaja tidak ada: kolom cari terbuka (pemicunya di kepala halaman, bukan di baris saring), sheet rincian pesanan (bingkai terpisah), dan tombol kembali/cari/bantuan di kepala — kepala memakai bentuk yang sama dengan `Pesanan / 1` dan `/ 2` supaya tiga bingkai satu baris tidak berbeda kepala.
- [x] Geometri: frame 390x844, gutter 20; kepala judul y44, sub y74, tab 350x40 di y104, baris chip 44 di y164, strip tanggal 350x39 di y228, kartu 350x206 di y275 dan y497 (jarak 16), catatan y719; nav di y776; target sentuh chip/tab/kaki >= 44.
- [x] Teks: judul `Pesanan Saya` 21 ExtraBold; sub 13 Medium; tab & chip 13 (SemiBold untuk aktif); nama warung 16 SemiBold; meta 13; lencana 13 SemiBold; total 16 ExtraBold; catatan 13. Kombinasi huruf tetap 8 yang sudah dipakai file.
- [x] Isi: `SA7-2481 · 6 Nov 2026, 12:20` (format `orderStampLabel`, `orderStatus.ts:105-112`), total `3,89 JOD` dan `2,05 JOD`, label kelompok `6 November 2026` (`orderDayLabel`).
- [x] Lencana: `Selesai` hijau (`--green-soft` / `--success-ink`) dan `Dibatalkan` netral (`--border` / `--text-secondary-strong`), titik status 6 px — MD-07.

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20; semua blok 350 di dalam kolom.
- [x] MD-06 tidak berlaku: tidak ada sheet di bingkai ini.
- [x] MD-07 status dibaca dari chip bertitik warna peran; total rata kanan sebaris label item, `tabular-nums` lewat satu nilai lebar kolom tetap.
- [x] MD-11 rel kanan seragam: total kartu berakhir di x338 lokal pada kedua kartu, kaki kanan rata pada x338.
- [x] MD-12 tidak ada anak keluar kotak; meta panjang dipotong `maxLines 1`, bukan meluber.
- [x] MD-13 tidak berlaku untuk bingkai statis: perpindahan tab `Aktif`↔`Riwayat` di app memakai `replace` (bukan riwayat tumpuk), dan itu dicatat di peta gerak.

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar; label kelompok tanggal memakai huruf normal.
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca.
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu; dua kartu dibedakan oleh isi (lencana, aksi) bukan warna kartu.
- [x] Bayangan/tinta dari token yang sudah dipakai blok `Pesanan / 1` (kartu putih + garis `#E2E8F0`, radius 16).
- [x] Warna/ukuran dari token: `--green-soft` `#ECFDF5`, `--success-ink` `#047857`, `--border` `#E2E8F0`, `--sa7tein-orange` `#E44220`; chip memakai radius pill yang sudah ada.

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai (bukan hanya JSON).
- [x] Irisan kotak anak dalam satu bingkai = 0 (cek x/y/w/h) dan total kedua kartu berakhir di x yang sama.
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD).

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: 3 interaksi di bingkai ini — pindah tab `Aktif`↔`Riwayat` `instant` (ganti isi, `replace`), ganti chip `instant` (daftar disaring di tempat), buka rincian pesanan `dissolve` 200 (sheet naik dari bawah); kembali dari sheet `dissolve` 220.
- [x] Yang sengaja TIDAK dianimasikan: tab (isi diganti, bukan halaman baru, MD-13), chip saring (daftar berganti di tempat), angka total dan jumlah item (data, bukan transisi), lencana status.
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring/bounce, transisi layar <= 400 ms.
- [x] Teks dan angka tidak dianimasikan (tanpa count-up/per-karakter); status berubah lewat lencana, bukan animasi.
- [x] Angka gerak: `dissolve` 200 ms untuk sheet dan 220 ms untuk kembali, easing `easeInOut`, sama dengan konvensi file F29.
- [x] `prefers-reduced-motion`: transisi jadi instan/crossfade, tanpa pergeseran posisi.
