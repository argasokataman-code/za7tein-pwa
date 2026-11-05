# R-MER-CATALOG — Menu, kategori, schedule, attribute, varian otomatis, stok & combo

Status: partial (slice atribut + menu ada; varian otomatis, combo, arsip belum) · sumber §13.1–§13.7 MER-05..MER-08, §13.6, §13.7.

## 1. Untuk apa

Katalog adalah sumber harga dan ketersediaan yang dipakai cart, order, invoice, promo, dan stok. Model beta berbeda mendasar dari model Odoo di PRD aktif: opsi customisasi **adalah** varian menu, varian dibuat otomatis saat pertama dipakai dan diarsipkan saat tidak berlaku, tanpa pengelolaan manual dan tanpa toggle per varian.

## 2. Aturan

### Menu (§13.1)

| # | Aturan | Sumber |
|---|---|---|
| A1 | Menu punya nama, deskripsi, gambar, harga dasar JOD; nama dan harga wajib, deskripsi dan gambar opsional | §13.1, MER-05 |
| A2 | Menu punya flag aktif dan flag hide | §13.1, MER-05 |
| A3 | Menu yang di-hide tidak tampil sebagai menu utama tetapi variannya tetap bisa menjadi opsi customisasi; menu itu juga tidak muncul di pencarian menu maupun pencarian merchant | §13.1 |
| A4 | Menu nonaktif tidak tampil, baik sebagai menu utama maupun sebagai opsi attribute | §13.1 |
| A5 | Setiap menu wajib berada di tepat satu kategori | §13.1, MER-06 |
| A6 | Catatan per menu bisa dinyalakan merchant; bila nyala, customer bisa menambah catatan yang hanya terlihat merchant; bila dimatikan, item cart yang sudah punya catatan pindah ke section tidak dapat diproses | §13.1, CUS-31 |
| A7 | Menu dihapus hilang dari katalog dan dari attribute yang memakainya sebagai opsi, tetapi datanya tetap tersimpan untuk riwayat order | §13.1 |
| A8 | Menu tidak bisa dihapus bila penghapusannya membuat sebuah attribute, atau attribute di sebuah menu, tidak punya opsi lagi | §13.1 |
| A9 | Harga diinput JOD; harga disimpan per order item saat order dibuat sehingga perubahan harga tidak mengubah riwayat | §13.1, §13.5 |

### Kategori (§13.2)

| # | Aturan | Sumber |
|---|---|---|
| A10 | Satu menu hanya boleh berada di satu kategori | §13.2 |
| A11 | Kategori yang masih berisi menu tidak bisa dihapus; menu dipindahkan lebih dulu | §13.2 |
| A12 | Merchant mengatur urutan kategori dan urutan menu di dalam kategori; customer melihat sesuai urutan itu | §13.2 |
| A13 | Kategori tanpa menu yang tampil (mis. hanya menu hide) tidak ditampilkan ke customer | §13.2 |

### Availability schedule (§13.3)

| # | Aturan | Sumber |
|---|---|---|
| A14 | Satu schedule bisa mengikat beberapa menu; satu menu hanya boleh punya satu schedule | §13.3, MER-08 |
| A15 | Tipe mingguan: beberapa hari, maksimal 7; tipe bulanan: tanggal 1–28 | §13.3 |
| A16 | Setiap hari/tanggal boleh punya lebih dari satu pasangan jam mulai–selesai; tidak boleh bentrok, boleh beririsan; jam mulai < jam selesai; rentang lewat tengah malam dipecah | §13.3 |
| A17 | Hari/tanggal tidak boleh dipilih dua kali dalam satu schedule dan wajib punya minimal satu pasangan jam | §13.3 |
| A18 | Menu tanpa schedule tersedia 24 jam; di luar schedule menu tetap tampil tetapi tidak bisa masuk cart | §13.3 |
| A19 | Varian yang menjadi opsi dan memakai menu berschedule hanya bisa dipilih sesuai schedule itu | §13.3 |
| A20 | Semua jam memakai zona waktu Yordania | §13.3 |

### Attribute & opsi (§13.4)

| # | Aturan | Sumber |
|---|---|---|
| A21 | Attribute wajib berisi minimal satu opsi; setiap opsi adalah varian menu, termasuk varian combo | §13.4 |
| A22 | Satu attribute bisa diikat ke beberapa menu; opsi yang berlaku boleh berbeda antar menu tetapi berasal dari attribute yang sama; setiap attribute terikat wajib punya minimal satu opsi untuk menu itu | §13.4, MER-07 |
| A23 | Attribute bisa single/multiple selection dan bisa mandatory | §13.4 |
| A24 | Mandatory + multiple: merchant mengatur minimal opsi; multiple tidak mandatory: hanya maksimal opsi; mandatory multiple boleh punya maksimal juga, dan minimal tidak boleh lebih dari maksimal | §13.4 |
| A25 | Jumlah opsi mandatory di setiap menu tidak boleh kurang dari minimal opsi wajib | §13.4 |
| A26 | Sebuah opsi bisa meng-exclude opsi attribute lain di menu yang sama; pengecualian diatur per menu | §13.4 |
| A27 | Opsi tidak tampil bila menu utama atau salah satu menu di variannya nonaktif; opsi dengan stok kurang, di luar schedule, atau varian tidak berlaku tidak bisa dipilih; opsi dari menu hide tetap bisa dipilih | §13.4 |
| A28 | Bila opsi yang bisa dipilih pada attribute mandatory kurang dari minimal wajib, menu utama tidak bisa masuk cart | §13.4 |
| A29 | Harga opsi = persentase × harga varian opsinya, default 100%, boleh >100% dan boleh 0%, diatur per opsi di attribute sehingga berlaku di semua menu; hasil dibulatkan bawah 2 desimal JOD | §13.4 |
| A30 | Varian sebuah menu tidak boleh menjadi opsi di attribute yang terikat ke menu itu sendiri, langsung maupun bertingkat | §13.4, §13.5 |
| A31 | Opsi yang dipilih customer tidak bisa dicustom lagi | §13.4 |

### Varian (§13.5)

| # | Aturan | Sumber |
|---|---|---|
| A32 | Varian = instansiasi menu untuk setiap kombinasi attribute dan opsi; kombinasi multiple selection juga varian | §13.5 |
| A33 | Order item dan menu hadiah selalu merujuk ke satu varian | §13.5 |
| A34 | Varian dibuat otomatis saat kombinasinya pertama dipakai (cart, menu hadiah, opsi customisasi, combo item), bukan di muka; kombinasi sama selalu memakai varian sama selama berlaku | §13.5 |
| A35 | Harga varian = harga dasar menu + harga semua opsi yang dipilih; price order item = harga varian × qty | §13.5 |
| A36 | Merchant tidak mengelola varian manual dan tidak ada toggle ketersediaan per varian | §13.5 |
| A37 | Varian tidak berlaku bila opsinya dilepas, combo item berubah, menu dihapus, atau nama/harga berubah (termasuk karena menu di dalamnya); perubahan deskripsi/gambar tidak membatalkan varian | §13.5 |
| A38 | Varian tidak berlaku diarsipkan bila masih dirujuk order item (status apa pun) dan dihapus bila tidak; varian di cart juga diarsipkan lalu dihapus setelah tidak dirujuk | §13.5 |
| A39 | Bila yang berubah hanya nama/harga, opsi customisasi, combo item, dan menu hadiah otomatis pindah ke varian baru; merchant memilih ulang hanya bila isi varian berubah | §13.5 |
| A40 | Sebelum menyimpan perubahan yang membatalkan varian, aplikasi merchant menampilkan daftar combo, attribute, dan promo yang memakainya | §13.5 |
| A41 | Item cart dengan varian tidak berlaku tetap ada tetapi pindah ke section tidak dapat diproses | §13.5, §7.1 |

### Stok (§13.6)

| # | Aturan | Sumber |
|---|---|---|
| A42 | Stok opsional; hanya aktif bila merchant menyalakan toggle stok; menu dengan toggle mati tidak dibatasi stok | §13.6, MER-05 |
| A43 | Reservasi dua scope: cart (hanya membatasi isi cart customer itu) dan global saat order dibuat | §13.6 |
| A44 | Satu varian memakai stok menu utamanya + semua menu di dalamnya (opsi, combo item, bertingkat); pemakaian = qty item × qty combo di setiap tingkat | §13.6 |
| A45 | Menu hadiah free product juga memakai stok | §13.6 |
| A46 | Stok tersedia = stok − stok ter-reserve; merchant tidak bisa mengisi stok di bawah stok ter-reserve | §13.6 |
| A47 | Reservasi global gagal (stok habis bersamaan) → order tidak dibuat, tidak ada stok ter-reserve, item pindah ke section | §13.6 |
| A48 | Stok ter-reserve dikembalikan bila order batal, ditolak, atau pembayaran gagal/kedaluwarsa; stok fisik berkurang saat order selesai | §13.6 |
| A49 | Menu stok habis tetap tampil tetapi tidak bisa masuk cart | §13.6 |
| A50 | Tidak ada pengecekan ulang item sebelum order dibuat; cart selalu menampilkan kondisi terbaru realtime | §13.6 |

### Combo (§13.7)

| # | Aturan | Sumber |
|---|---|---|
| A51 | Menu punya flag combo; bila true muncul pengaturan combo item berisi varian, qty, base price; combo wajib punya minimal satu combo item | §13.7 |
| A52 | Isi combo tetap; customer tidak memilih atau mengubah combo item | §13.7 |
| A53 | Combo bisa diikat ke attribute seperti menu biasa; customer memilih opsi, combo item tetap; harga varian combo = harga combo + harga opsi | §13.7 |
| A54 | Base price terisi otomatis dari harga varian dan tidak bisa diedit; merchant melihat total price = Σ base price × qty sebagai informasi; harga akhir memakai field price yang bisa diedit | §13.7 |
| A55 | Varian boleh jadi combo item bila menunya tidak di-hide dan tidak terikat schedule; menu yang menjadi combo item tidak bisa di-hide, diikat schedule, atau dihapus | §13.7 |
| A56 | Perubahan combo item membatalkan semua varian combo itu, lalu varian baru dibuat saat dibutuhkan | §13.7 |
| A57 | Combo bisa masuk cart bila menu combo + semua menu di dalamnya aktif, varian berlaku, stok cukup, dan (bila ada schedule) waktu saat ini masuk schedule | §13.7 |
| A58 | Stok combo item ikut di-reserve dan berkurang sebanyak qty combo item × qty order item, termasuk bertingkat | §13.7 |
| A59 | Detail order merchant menampilkan isi combo sampai tingkat terdalam, termasuk combo yang menjadi opsi | §13.7 |
| A60 | Untuk syarat rule promo dan poin per unit, combo dihitung satu item | §13.7, §14.2, §14.5 |
| A61 | Perubahan katalog (nama, harga, kategori, urutan, attribute, opsi, combo, catatan, aktif, hide, stok, schedule) dikirim realtime ke merchant dan customer yang melihat | §18 |

## 3. Aktor & permukaan

- Owner/karyawan ber-hak "Kelola menu" — menu, kategori, attribute, schedule, combo.
- Karyawan ber-hak "Mengelola stok" — stok saja.
- Customer — katalog, detail menu, pemilihan opsi, cart.
- Ops — melihat katalog merchant (baca).

## 4. Masukan → keluaran

- Masuk: menu, kategori, attribute + opsi, schedule, stok, combo item.
- Keluar: katalog terurut, varian otomatis, daftar pemakai varian, section stok & item tak dapat diproses, event `catalog_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| menu di-hide | tidak tampil sebagai menu utama; tetap muncul sebagai opsi attribute |
| menu nonaktif | tidak tampil di UI customer; form merchant menampilkan info |
| di luar schedule | menu tampil, CTA nonaktif + alasan |
| stok habis / toggle stok mati | stok habis: tampil tanpa CTA; toggle mati: tanpa batas |
| varian tidak berlaku | item cart pindah section; daftar pemakai ditampilkan sebelum simpan |
| combo false | combo item kosong, nonaktif, tersembunyi |
| attribute mandatory tidak terpenuhi | CTA tambah ke cart nonaktif |

## 6. Kontrak BE (handoff, repo ini mock)

Model attribute/value/option-varian/line per menu/exclusion; varian auto-create + arsip; reservasi stok dua scope; event `catalog_changed`; validasi siklus combo/opsi di server.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Menu tanpa kategori atau dengan dua kategori ditolak | simpan menu → error | ⛔ |
| AC2 | Hari sama dua kali dalam satu schedule ditolak | tambah Senin 2× → error | ⛔ |
| AC3 | Tanggal 29–31 tidak bisa dipilih pada schedule bulanan | buka pemilih → hanya 1–28 | ⛔ |
| AC4 | Varian terbuat otomatis saat kombinasi pertama masuk cart | tambah menu + opsi baru → 1 varian baru, tanpa aksi merchant | ⛔ |
| AC5 | Mengubah harga menu membatalkan variannya dan menampilkan daftar pemakai sebelum simpan | ubah harga → dialog daftar combo/attribute/promo | ⛔ |
| AC6 | Perubahan deskripsi/gambar tidak membatalkan varian | ubah deskripsi → varian tetap | ⛔ |
| AC7 | Harga opsi 0% menghasilkan opsi gratis dan pembulatan bawah 2 desimal | set 0% → +0 JOD; set 33% pada 1,999 → 0,65 | ⛔ |
| AC8 | Varian menu tidak bisa jadi opsi attribute menu itu sendiri | coba ikat → ditolak | ⛔ |
| AC9 | Reservasi cart tidak mengurangi stok yang terlihat customer lain | 2 customer, stok 5, cart 3 → customer lain masih lihat 5 | ⛔ |
| AC10 | Reservasi global gagal → order tidak dibuat dan item pindah section | 2 order stok terakhir bersamaan → satu gagal | ⛔ |
| AC11 | Combo item dari menu hide atau berschedule ditolak | pilih menu hide → error | ⛔ |
| AC12 | Detail order merchant menampilkan isi combo bertingkat | order combo → detail menampilkan varian + qty tiap isi | ⛔ |

## 8. UNRESOLVED

- OPEN-66/67/68/69/70 (detail teknis katalog) sudah diputuskan di dokumen; rujukan final = §13.
- Wording info "menu nonaktif tidak tampil" di form merchant ditentukan desain.

## 9. Bukti

- Kode: `src/pages/MerchantMenu.tsx`, `src/pages/MenuDetail.tsx`, `src/store/slices/catalogAttributesSlice.ts:43`, `src/types.ts:1247` (`CatalogAttribute`), `:1283` (`MenuVariant`), `:430` (`OperatingHoursDay`).
- Belum ada: schedule per menu, varian otomatis + arsip, combo, reservasi dua scope.
