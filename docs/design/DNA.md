# Sa7tein UI/UX DNA — kontrak desain

Dokumen ini berlaku untuk **fix, development, dan layar baru**. Sumber implementasi tetap `src/styles/_tokens.scss`, `src/styles/_system.scss`, komponen bersama, dan pengukuran DOM. Jika aturan ini berbeda dari CSS yang ada, catat sebagai debt; jangan menyalin penyimpangan lama.

## Karakter produk

Sa7tein adalah antarmuka makanan hyperlocal yang hangat, jelas, dan cepat dipakai dengan satu tangan. Aksi utama terlihat pertama; status pesanan dan biaya dapat dipahami tanpa menebak. Copy menggunakan Bahasa Indonesia yang singkat dan spesifik. Nama zona, nominal, dan status harus berasal dari PRD aktif, bukan dari contoh layar lama.

## Arah desain (dibaca sebelum menggambar)

> Aplikasi pesan-antar makanan untuk pembeli hyperlocal, PWA mobile (mode native),
> bahasa visual hangat-oranye, dial **ENERGY 2 / RHYTHM 2 / MOTION 1 / DENSITY 2 / FEEL 1**.

Dial ini kontrak, bukan saran: layar baru mengikuti nilai ini, tidak menebak. MOTION **1** = hanya
umpan mikro (tekan, hover ganti warna, chip). Parallax dipakai dengan izin tercatat (lihat di bawah),
di luar itu gerak dekoratif tidak ditambah. DENSITY 2 = satu tugas primer per layar, tetap lega.
FEEL 1 = tanpa haptic (PWA tidak punya jalur haptic yang konsisten).

## Aturan visual wajib

| Dimensi | Kontrak | Sumber kode / verifikasi |
|---|---|---|
| Lebar | Shell mobile maksimal 430px, ditengahkan pada lebar berapa pun; konsol CS `/admin` beralih ke layout desktop ≥901px (pengecualian terdokumentasi, keputusan 2026-10-11). Tidak ada mode preview terpisah | `--shell-max`; DOM pada 390px dan 1440px |
| Gutter | 20px kiri/kanan | `--space-5`; DOM |
| Surface | Latar `--bg-warm`, kartu `--surface`, batas `--border-strong` | `_tokens.scss`; computed style |
| Warna aksi | Brand `--sa7tein-orange`; teks oranye pada putih memakai `--orange-ink` | token dan kontras |
| Radius | Kontainer maksimal 32px (UI v2); pill hanya untuk kontrol pill/badge | `--radius-*` |
| Tipografi | `--font-sans`, skala `--text-xs` sampai `--text-2xl` | token, bukan angka baru |
| Judul halaman | Dua jenis menurut markup: judul **header** (berbagi baris dengan tombol kembali 44px) `--text-lg`/700; judul **hero** (barisnya tidak dibagi kontrol) `--text-2xl`/800. Tidak ada ukuran ketiga untuk peran yang setara | `system/_type.scss`; DOM |
| Header halaman | Satu pola untuk semua role: judul + tombol kembali opsional + `eyebrow` opsional (`--text-xs`/700/uppercase), tinggi minimum `--nav-height`, latar `--bg-warm`, jarak tepi `--space-5`. Pola sama di dua role atau lebih memakai komponen bersama, bukan salinan kelas. Judulnya mengecil ke langkah header begitu ada kontrol di barisnya. **Tidak ada slot aksi di kanan** (`PageHeader` sengaja tidak punya prop `action`), dan **lonceng hanya di layar akar peran** — selubung `*PageHeader` default `bell={false}`, hanya beranda CS yang menyalakannya | source review; DOM |
| Aksi utama | Zona jempol: bilah bawah atau tombol melayang `.page-fab` (kanan bawah, di atas `--nav-height`, dibatasi kolom). Pojok kanan atas header bukan tempatnya | `system/_actions.scss`; DOM |
| Spasi | `--space-1..8`; touch target minimal `--touch-min` | token; DOM |
| Ikon | `lucide-react`, `strokeWidth={1.75}`, tanpa emoji | source review |
| Motion | `--motion-*` dan `--ease-*`; hormati reduced motion | token; UI review |
| Scroll | Dokumen satu-satunya scroll vertikal; `body` bukan scroll container (`overflow: clip`) supaya header sticky benar-benar menempel; tanpa pantulan overscroll (`overscroll-behavior-y: none`) | DOM overflow audit |
| Fixed bar | Dibatasi shell, tidak melintasi kolom | DOM pada 1440px |
| PWA | Tiap prefix peran (`/customer/*`, `/merchant/*`, `/courier/*`, `/admin/*`) punya boot screen tanpa jeda buatan dan manifest sendiri; momentum gulir native dan safe area tetap hidup, tapi overscroll tidak memantul | `index.html`, manifest per peran, audit gestur |

Gaya baru masuk `_system.scss`; jangan memperbesar stylesheet porting `_app.scss`. Ikon fungsi tidak memakai SVG inline. Foto dan ilustrasi dari `public/assets/`. Tanpa gradient, warna dekoratif baru, atau URL gambar eksternal tanpa keputusan desain tercatat.

Aturan yang berlaku lintas layar (audit 001, 2026-10-13):

- **Lantai huruf mikro 12px** (`--text-xs`). Tidak ada lagi nilai 10px/11px untuk label kecil.
- **Glow merek** (`--shadow-brand`) hanya menandai **aksi primer**, bukan umpan hover dan bukan
  penanda status terpilih. Pemakaian lain dihapus di akarnya.
- **Umpan hover** dibungkus `@media (hover: hover) and (pointer: fine)`; di layar sentuh ia tidak
  pernah terlihat, jadi tidak ikut dimuat.
- **Radius bersarang**: radius dalam = radius luar − padding. Bukan nilai terpisah.
- **Permukaan `position: fixed` yang selalu terlihat tidak memakai `backdrop-filter`** (bilah bawah):
  blur men-sampel ulang latar tiap frame gulir.
- **Parallax** hanya lewat kelas `s7-parallax--*` dan lapisan otomatis di `_parallax.scss`
  (satu properti `translate`, amplitudo 12-26px, `animation-timeline: view()`), dan mati total saat
  `prefers-reduced-motion`. Tidak ada listener `scroll` baru untuk dekorasi.
- **Easing `--ease-emphasized`** (overshoot melewati 1) hanya boleh di satu tempat sebagai motif
  tanda tangan — sekarang `badge-pop` bilah bawah (diterima sebagai **CL-02**, alasan: badge butuh
  "pasang" yang terbaca, bukan memantul). Transisi lain memakai `--ease-out`/`--ease-decelerate`.

**Satu gradient tercatat, keputusan 2026-10-12:** banner promo beranda (`.home-promo`) memakai gradient biru `--promo-from` → `--promo-to` (`#175273` → `#1D648B`), warna diambil apa adanya dari prototype EDISI 02. Dipakai HANYA di komponen itu; aturan "tanpa gradient" tetap berlaku untuk elemen lain.

**Pengecualian sadar, keputusan pemilik 2026-09-24 (diperbarui 2026-10-12):** teks putih (`--on-brand`) di atas `--sa7tein-orange` (`#E44220`) hanya mencapai kontras **4.12:1**, di bawah ambang WCAG AA 4.5:1 untuk teks normal. Ini dipertahankan karena identitas merek, bukan cacat yang menunggu diperbaiki. Pasangan yang lolos AA tetap dipakai untuk teks oranye di latar terang (`--orange-ink`, 5.99:1). Tombol berlabel 14px memakai `--orange-ink` sebagai latar bila target AA normal diwajibkan.

Palet dan elevasi mengikuti **EDISI 02 (UI v2 "Masakan Tetangga", Oktober 2026)**: brand `#E44220`, ink aksi `#B83213`, teks utama navy `#172434`, latar `#F4F4F6`, batas `#E2E8F0`, status green/blue/red. Tipografi: **Plus Jakarta Sans** (self-host `public/assets/fonts/plus-jakarta-sans.woff2`, variabel 400-800; Inter dan Manrope tinggal fallback). Radius naik dari langit-langit 12px: kartu `--radius-lg` 16px, sheet/modal `--radius-2xl` 32px. Kartu default memakai border 1px tanpa shadow; shadow hanya untuk lapisan terangkat (pin peta, pil onboarding, sheet). Token tambahan: `--navy`/`--on-navy`, `--info`/`--info-ink`/`--info-soft`, `--text-disabled`, `--icon-decor`, `--space-9`/`--space-10`, `--radius-2xl`. Sumber nilai tetap `_tokens.scss`.

Batas pengecualian itu diperjelas 2026-09-24 (audit keseragaman role): berlaku untuk **teks aksi dan nominal** — label tombol, angka besar. Teks keterangan kecil di atas oranye **dilarang menambah penurunan di atas pengecualian ini**: tanpa `opacity`, tanpa warna yang lebih muda. Kalau sebuah keterangan kecil memang perlu ada di bidang oranye dan terbaca, ia memakai `--orange-soft-ink` atau setaranya sampai lolos AA, bukan putih beropasitas rendah.

**Pengecualian Super Admin:** `/superadmin/*` adalah website penuh non-PWA untuk owner/team — keputusan PO 2026-09-23. Ia **tidak** memakai kolom `--shell-max` dan diukur dengan aturan dokumen, bukan aturan app. FAIL gerbang pada rute ini karena lebar kolom bukan cacat; yang cacat adalah ukuran yang memakai aturan app untuk halaman yang memang bukan app.

Untuk rute peran `/customer/*`, `/merchant/*`, dan `/courier/*`: **satu mode saja, murni PWA.** Kolom aplikasi dikunci `--shell-max` dan ditengahkan; dokumen adalah satu-satunya penggulung, di lebar berapa pun. **Pengecualian kedua (keputusan 2026-10-11):** konsol CS `/admin/*` memakai dua shell — 430px + bottom nav di ponsel (tetap murni PWA), dan rail sidebar 248px + area konten selebar jendela dari 901px ke atas, mengikuti pola konsol Super Admin; satu pohon komponen yang sama melayani keduanya, tanpa jalur layout kedua yang terpisah. `/superadmin/*` tetap pengecualian tersendiri di atas. Simulator perangkat desktop pernah ada dan **dihapus** (keputusan 2026-09-23): ia menciptakan mode layout kedua yang hanya hidup di laptop — pengguna nyata tidak pernah melihatnya — dan menuntut pengecualian "scroll bersarang di dalam bezel". Dengan frame itu hilang, invarian dokumen-satu-satunya-penggulung berlaku tanpa pengecualian, dan media query tidak lagi membuat jalur tata letak terpisah. Untuk landing marketing `/`: komposisi editorial full-width adalah pengecualian shell yang disengaja. Foto makanan nyata menjadi fokus; tiket dapur, Journey Line, dan status kurir menjelaskan produk. Setiap section mengutamakan satu pesan dan satu aksi primer; bila ada jalur untuk peran lain, pisahkan dan beri konteks yang jelas. Banner penutup harus punya latar visual yang nyata dan tombol pelanggan yang dominan, bukan dua tombol setara tanpa penjelasan. Hindari deret kartu fitur identik, mockup ponsel generik, blob gradient, klaim metrik tanpa sumber, dan copy startup umum. Pada layar kecil, bagian disusun ulang vertikal; jangan sekadar mengecilkan desktop.

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

**Gerbang browser memeriksa struktur, bukan keputusan visual.** Yang tertangkap: lebar kolom, gutter runtime, overflow horizontal, scroller bersarang, token runtime, ukuran hasil render, hit-test klik, PWA. Yang **tidak** tertangkap: warna, hierarki huruf, bentuk header, kontras komposit, tumpang tindih lapisan (z-index), dan copy. Tiga cacat nyata lolos dari gerbang dan hanya ketahuan dengan membaca DOM — nama putih di atas krem, modal tertutup bilah nav, label oranye beropasitas rendah (`docs/design/audit-role-2026-09-24.md` bagian 2.3). Sebaliknya, FAIL pada role yang dikecualikan (Super Admin) bukan cacat. Perlakukan laporan gerbang sebagai satu lapisan bukti, bukan keseluruhan jawaban.

`docs/design/legacy-debt.json` mengizinkan SVG inline yang tersisa sebagai grafik data dan ornamen: pola dekoratif hero Home, kanvas zona SaZones, donut Ringkasan, dan sparkline pendapatan merchant. Layar masuk/daftar tidak lagi memakai SVG inline — logo Google/Apple/Facebook dan bendera negara ikut terhapus bersama tombol sosial dan pemilih negara yang tidak melakukan transaksi apa pun. Tidak ada ikon fungsional SVG inline. Pemeriksaan `governance:check` mengunci isinya dengan hash dan menolak SVG baru atau perubahan tanpa peninjauan pengecualian. Baseline warna mentah porting adalah batas maksimum yang harus menyusut; 54 kemunculan tersisa, termasuk komentar, logo, dan nilai alpha untuk compositing. Jika pengecualian baru diperlukan, catat keputusan desain dan perbarui daftar secara eksplisit pada perubahan yang sama.
