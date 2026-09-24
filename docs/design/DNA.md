# Sa7tein UI/UX DNA — kontrak desain

Dokumen ini berlaku untuk **fix, development, dan layar baru**. Sumber implementasi tetap `src/styles/_tokens.scss`, `src/styles/_system.scss`, komponen bersama, dan pengukuran DOM. Jika aturan ini berbeda dari CSS yang ada, catat sebagai debt; jangan menyalin penyimpangan lama.

## Karakter produk

Sa7tein adalah antarmuka makanan hyperlocal yang hangat, jelas, dan cepat dipakai dengan satu tangan. Aksi utama terlihat pertama; status pesanan dan biaya dapat dipahami tanpa menebak. Copy menggunakan Bahasa Indonesia yang singkat dan spesifik. Nama zona, nominal, dan status harus berasal dari PRD aktif, bukan dari contoh layar lama.

## Aturan visual wajib

| Dimensi | Kontrak | Sumber kode / verifikasi |
|---|---|---|
| Lebar | Shell mobile maksimal 430px, ditengahkan pada lebar berapa pun. Tidak ada mode preview terpisah | `--shell-max`; DOM pada 390px dan 1440px |
| Gutter | 20px kiri/kanan | `--space-5`; DOM |
| Surface | Latar `--bg-warm`, kartu `--surface`, batas `--border-strong` | `_tokens.scss`; computed style |
| Warna aksi | Brand `--sa7tein-orange`; teks oranye pada putih memakai `--orange-ink` | token dan kontras |
| Radius | Kontainer maksimal 12px; pill hanya untuk kontrol pill/badge | `--radius-*` |
| Tipografi | `--font-sans`, skala `--text-xs` sampai `--text-2xl` | token, bukan angka baru |
| Spasi | `--space-1..8`; touch target minimal `--touch-min` | token; DOM |
| Ikon | `lucide-react`, `strokeWidth={1.75}`, tanpa emoji | source review |
| Motion | `--motion-*` dan `--ease-*`; hormati reduced motion | token; UI review |
| Scroll | Dokumen satu-satunya scroll vertikal; `body` bukan scroll container (`overflow: clip`) supaya header sticky benar-benar menempel; tanpa pantulan overscroll (`overscroll-behavior-y: none`) | DOM overflow audit |
| Fixed bar | Dibatasi shell, tidak melintasi kolom | DOM pada 1440px |
| PWA | Tiap prefix peran (`/customer/*`, `/merchant/*`, `/courier/*`, `/admin/*`) punya boot screen tanpa jeda buatan dan manifest sendiri; momentum gulir native dan safe area tetap hidup, tapi overscroll tidak memantul | `index.html`, manifest per peran, audit gestur |

Gaya baru masuk `_system.scss`; jangan memperbesar stylesheet porting `_app.scss`. Ikon fungsi tidak memakai SVG inline. Foto dan ilustrasi dari `public/assets/`. Tanpa gradient, warna dekoratif baru, atau URL gambar eksternal tanpa keputusan desain tercatat.

**Pengecualian sadar, keputusan pemilik 2026-09-24:** teks putih (`--on-brand`) di atas `--sa7tein-orange` hanya mencapai kontras **3.36:1**, di bawah ambang WCAG AA 4.5:1. Ini dipertahankan karena identitas merek, bukan cacat yang menunggu diperbaiki. Pasangan yang lolos AA tetap dipakai untuk teks oranye di latar terang (`--orange-ink`, 4.88:1).

Untuk seluruh rute peran (`/customer/*`, `/merchant/*`, `/courier/*`, `/admin/*`): **satu mode saja, murni PWA.** Kolom aplikasi dikunci `--shell-max` dan ditengahkan; dokumen adalah satu-satunya penggulung, di lebar berapa pun. Simulator perangkat desktop pernah ada dan **dihapus** (keputusan 2026-09-23): ia menciptakan mode layout kedua yang hanya hidup di laptop — pengguna nyata tidak pernah melihatnya — dan menuntut pengecualian "scroll bersarang di dalam bezel". Dengan frame itu hilang, invarian dokumen-satu-satunya-penggulung berlaku tanpa pengecualian, dan media query tidak lagi membuat jalur tata letak terpisah. Untuk landing marketing `/`: komposisi editorial full-width adalah pengecualian shell yang disengaja. Foto makanan nyata menjadi fokus; tiket dapur, Journey Line, dan status kurir menjelaskan produk. Setiap section mengutamakan satu pesan dan satu aksi primer; bila ada jalur untuk peran lain, pisahkan dan beri konteks yang jelas. Banner penutup harus punya latar visual yang nyata dan tombol pelanggan yang dominan, bukan dua tombol setara tanpa penjelasan. Hindari deret kartu fitur identik, mockup ponsel generik, blob gradient, klaim metrik tanpa sumber, dan copy startup umum. Pada layar kecil, bagian disusun ulang vertikal; jangan sekadar mengecilkan desktop.

## Pola pengalaman wajib

1. Setiap layar punya satu tujuan dan satu aksi primer yang jelas. Aksi destruktif atau penolakan diberi label yang menjelaskan akibatnya.
2. Pakai komponen bersama sebelum membuat yang baru: `FoodCard`, `AddToCartButton`, `FavoriteButton`, `BackButton`, `BottomNav`, `MerchantBottomNav`, `OrderStageScreen`. Jika pola sama muncul dua kali, ekstrak komponen bersama.
3. Untuk setiap state domain, desain `default`, `loading`, `empty`, `error`, `disabled`, dan `success` bila relevan. Mock boleh mensimulasikan semua state, tetapi jangan memberi kesan transaksi sungguhan terjadi.
4. Setiap biaya tampil dengan komponen dan mata uang yang jelas; jangan menyembunyikan buyer fee, ongkir, kurs, atau pembulatan yang diwajibkan PRD aktif.
5. Status pesanan harus berasal dari satu model lintas pembeli, merchant, dan kurir. Journey Line tidak dibuat ulang per role.
6. Alamat pembeli lain tidak boleh tampil pada tracking multi-drop. Kontak pribadi tidak dijadikan pengganti chat yang diwajibkan PRD aktif.
7. Form memiliki label, bantuan, error yang spesifik, dan target sentuh minimal 44px. Disabled state menjelaskan sebab dan langkah berikutnya.

## Definition of done tiap perubahan UI

- Requirement aktif dan sumber halaman/section dicatat; konflik ditandai, bukan ditebak.
- Komponen dan token yang dipakai disebut; pola baru punya alasan dan dokumentasi.
- Ukur shell, gutter, overflow horizontal, fixed bars, touch target, dan scroll pada 390px serta 1440px. Catat angka aktual.
- Uji keyboard, label form, fokus, kontras, dan reduced motion untuk state yang berubah.
- `npm run governance:check`, `npm run lint`, `npm run build` lulus; `/documentation` dan atlas diperbarui untuk perubahan signifikan.

Pemeriksaan otomatis hanya menangkap bagian yang deterministik (versi, hash sumber, token tidak terdefinisi, build/lint). Konsistensi visual, kontras komposit, dan interaksi tetap perlu QA DOM/browser. Jangan mengklaim “enforced” untuk aspek yang belum diuji mesin.

`docs/design/legacy-debt.json` mengizinkan SVG inline yang tersisa sebagai grafik data dan ornamen: pola dekoratif hero Home, kanvas zona SaZones, donut Ringkasan, dan sparkline pendapatan merchant. Layar masuk/daftar tidak lagi memakai SVG inline — logo Google/Apple/Facebook dan bendera negara ikut terhapus bersama tombol sosial dan pemilih negara yang tidak melakukan transaksi apa pun. Tidak ada ikon fungsional SVG inline. Pemeriksaan `governance:check` mengunci isinya dengan hash dan menolak SVG baru atau perubahan tanpa peninjauan pengecualian. Baseline warna mentah porting adalah batas maksimum yang harus menyusut; 54 kemunculan tersisa, termasuk komentar, logo, dan nilai alpha untuk compositing. Jika pengecualian baru diperlukan, catat keputusan desain dan perbarui daftar secara eksplisit pada perubahan yang sama.
