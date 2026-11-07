# Preflight desain — Keranjang lain & dua cart aktif

Status: approved
Isi setiap kotak. `--approve` menolak checklist yang masih punya `- [ ]`.
Kotak yang memang tidak berlaku diganti `- [x] tidak berlaku: <alasan>`.

## 1. Sumber anatomi (wajib path:line, minimal 2)

- [x] Seksi keranjang lain (markup): `src/pages/Checkout.tsx:57-105` — `.checkout-section` > `h2` "Keranjang lain" + `.checkout-other-carts` > baris `.checkout-other-cart list-row`; tiap baris = tombol `__open` (thumb 44 + nama + meta "n item") dan rail kanan (`__total` + `__drop` Trash2 16)
- [x] Seksi keranjang lain (CSS): `src/styles/system/_checkout.scss:43-52` kontainer `border: 1px solid var(--border-strong)`, `border-radius: var(--radius-lg)` 16, `background: var(--surface)`, `overflow: hidden`; `:54-64` baris grid `minmax(0,1fr) 136px`, padding `8px 12px`, pemisah `border-top: 1px solid var(--border)`; `:89-100` thumb 44x44 radius 12 `var(--bg-warm)`; `:116-134` nama 15/700, meta 13 `--text-secondary`; `:136-151` rail rata kanan, total 13/700 tabular; `:153-176` drop 44x44 radius 12, hover `--danger-ink`, active `--bg-warm`
- [x] Judul seksi: `src/styles/system/_checkout.scss:13-17` `.checkout-section .section-title` = `var(--text-sm)` 15, `font-weight: 700`, `color: var(--text-secondary)`; jarak antar seksi `_cart.scss:103-105` = `var(--space-5)` 20
- [x] Kartu keranjang di Pesanan Saya (markup): `src/pages/MyOrder.tsx:416-438` — `oh-cart` > `oh-cart__head` (ikon Store 16 + nama toko + `oh-badge` "n menu") > `oh-cart__items` > `oh-cart__foot` (Subtotal + nominal) > `oh-cta` "Lanjut ke pembayaran" > baris "n keranjang di toko lain"
- [x] Kartu keranjang (CSS): `src/styles/system/_order-history.scss:487-494` padding 16, gap 12, radius 16, border 1px; `:284-297` chip `3px 8px` radius pill `--green-soft`/`--success-ink` 13/700; `:554-558` nominal 16/800 tabular; `:560-565` tombol `s-btn-shape` 44 radius 12 oranye
- [x] Data keranjang ganda: `src/store/slices/cartSlice.ts` `carts: Record<merchantId, CartItem[]>` + `switchCart`; nama/logam toko `src/data/storefronts.ts:14-67`; item & harga `src/data/foods.ts:64-130` (Sate Ayam 28.000, Sate Kambing 32.000, Lontong 8.000, Es Teh Manis 6.000); format `src/data/currency.ts:155-157` `moneyPlain` → `Rp56.000`

## 2. Brief (8-12 baris: tujuan, state, yang sengaja tidak ada, angka)

- [x] Tujuan bingkai 1 (`Checkout / 2 · keranjang lain`): memperlihatkan bahwa satu checkout hanya membayar satu warung, sementara keranjang warung lain tetap terjangkau dan bisa dipindah atau dibuang
- [x] State bingkai 1: keranjang aktif Warung Sate Pak Ali (5 item, Rp104.000) + satu keranjang lain Kopi Kenangan Kecil (3 item, Rp18.000); halaman di posisi atas sehingga seksi keranjang lain, catatan, dan daftar item terlihat sekaligus, metode pembayaran ada di bawah lipatan
- [x] Tujuan bingkai 2 (`Pesanan / 2 · dua cart aktif`): daftar pesanan menggabungkan dua keranjang aktif jadi dua kartu terpisah, masing-masing dengan tombol bayar sendiri
- [x] State bingkai 2: dua `Kartu keranjang` (Warung Sate Pak Ali 5 menu, Kopi Kenangan Kecil 3 menu) + satu `Kartu order aktif` di bawahnya; tab `Aktif` terpilih
- [x] Sengaja tidak ada: satu tombol "bayar semua", checkbox gabung, badge angka di tab, dan teks "keranjang lain" di dalam kartu pesanan (kartu keranjang di daftar adalah daftar, bukan checkout)
- [x] Geometri keranjang lain: kontainer 350x124 di (20,130); dua baris 350x60 (padding 8/12, thumb 44 di (12,8), teks x68, rail 136 rata kanan, drop 44 di x294); pemisah 1 px di y61; radius 16; ujung kanan 370
- [x] Geometri teks keranjang lain: nama 15/600 y11 h19, meta 13 y32 h16, total 13/600 tabular y13, semua di kolom kanan yang sama supaya nominal tidak bergerigi (MD-11)
- [x] Geometri checkout lanjutan: judul "Catatan untuk pesanan" y274, textarea 350x64 y300, judul "5 item" y384, tiga baris item 350x94 di y406/512/618, berakhir 712 tepat di atas action bar 716
- [x] Geometri bingkai 2: judul 44, sub 74, segmented 104 h40, kartu keranjang 160 dan 336 (h164, gap 12), kartu order 512 h206, bottom nav 780
- [x] Warna peran saja: kartu `#FFFFFF` + tepi `#E2E8F0`, nama `#172434`, meta/total-sekunder `#475569`, nominal `#172434`, chip jumlah `#ECFDF5`/`#047857`, tombol `#E44220`

## 3. DNA mobile yang diawasi

- [x] MD-01/02 kolom 430 + gutter 20: semua blok 350 mulai x20, ujung 370
- [x] MD-05 target sentuh: drop 44x44, baris `__open` tinggi 60 (>= 44), tombol bayar 44, tombol checkout 48
- [x] MD-07 status & angka: nominal rata kanan sebaris judul di rel 136 px; `tabular-nums`; chip "n menu" berwarna peran, bukan kata abu di dalam string
- [x] MD-08 sentence case: "Keranjang lain", "Catatan untuk pesanan", "5 item", "Lanjut ke pembayaran"
- [x] MD-11 satu rel kanan: rel keranjang lain lebar tetap 136 (total + drop), rel kartu keranjang memakai baris Subtotal/nominal yang sama di semua kartu
- [x] MD-12 tidak ada anak keluar kotak: nama toko 220 di dalam 350, nama keranjang lain dipotong `ellipsis` pada 194 px, tidak ada teks menempel tepi (FR-40)
- [x] MD-13 tidak berlaku: kedua bingkai adalah keadaan halaman, bukan overlay; tombol buang memakai konfirmasi `Keranjang / 2` (4445) lewat `dissolve` 220 ms yang sudah ada
- [x] MD-14 tidak berlaku: bingkai desain statis, tidak ada state gulir yang perlu dipulihkan

## 4. Anti-slop (dicek sebelum menulis)

- [x] Tidak ada uppercase eyebrow / label seksi huruf besar
- [x] Tidak ada teks gradien, backdrop-filter, atau kaca
- [x] Tidak ada palet bergilir per item dan tidak ada garis aksen tepi kartu; pemisah baris 1 px rambut, bukan kartu putih berulang di dalam kartu
- [x] Bayangan tidak dipakai sebagai penanda keadaan: kartu memakai tepi 1 px `#E2E8F0`
- [x] Warna/ukuran dari peran token (`--radius-lg` 16, `--radius-md` 12, `--touch-min` 44, `--space-3` 12), bukan nilai karangan
- [x] Ikon dari lucide saja: `Trash2` 16 stroke 1.75 di drop, `Store` 16 di kepala kartu keranjang

## 5. Verifikasi sebelum kata selesai

- [x] Screenshot + deskripsi bingkai (bukan hanya JSON): kedua bingkai utuh dan crop seksi keranjang lain
- [x] Irisan kotak anak dalam satu bingkai = 0: thumb 44 di (12,8) dalam baris 60; teks x68 lebar 194 berakhir 262 sebelum rel 136; drop 44 di x294 berakhir 338 dalam 350
- [x] Isi tidak menyentuh tepi: teks bait berhenti 12 px sebelum tepi kanan, 8 px sebelum tepi bawah
- [x] `npm run figcraft:audit` PASS + senior-fe Delivery Gate (HG/PG/QL/MD)

## 6. Gerak (motion) — diputuskan sebelum menggambar

Anti-slop gerak: animasi dipilih karena **hubungan ruang**, bukan karena "biar hidup".
Diputuskan di preflight, bukan ditempel setelah bingkai jadi.

- [x] Peta gerak: keranjang lain adalah keadaan halaman; tombol buang membuka konfirmasi `Keranjang / 2` (4445) dengan transisi `dissolve` 200 ms, kembali dari konfirmasi `dissolve` 220 ms
- [x] Peta gerak bingkai 2: kartu keranjang membuka `Checkout / 1` (3224) lewat `navigate` `push` 320 ms; tidak ada animasi daftar
- [x] Yang sengaja TIDAK dianimasikan: baris yang dibuang (hilang seketika setelah konfirmasi), nominal subtotal, chip jumlah; tab `Aktif`/`Riwayat` berganti `instant` (MD-13)
- [x] Tidak ada animasi dekoratif: tanpa loop/parallax/auto-play, tanpa spring, durasi <= 400 ms
- [x] Angka gerak: maju `push` 320 ms `easeInOut`, kembali `dissolve` 220 ms `easeInOut`, overlay/konfirmasi `dissolve` 200 ms
- [x] `prefers-reduced-motion`: semua transisi jadi instan, tanpa pergeseran posisi
