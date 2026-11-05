# R-CUS-DISCOVERY — Discovery, detail merchant & menu

Status: partial (aset repo ada; aturan beta belum diterapkan) · sumber §10 CUS-04..CUS-13, §5 (larangan order sendiri), §13.

## 1. Untuk apa

Customer harus bisa menemukan merchant yang **benar-benar bisa melayani alamatnya sekarang**, tanpa menebak dari kartu yang tampak sama. Karena itu status tutup, di luar coverage, busy, dan blok kuota dibedakan secara visual dan perilaku.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Browse merchant dalam beberapa layout | CUS-04 |
| A2 | Cari berdasarkan nama, menu, tag, atau data merchant lain | CUS-05 |
| A3 | Urut jarak, jumlah order terbanyak, rating, kriteria lain | CUS-06 |
| A4 | Group **hanya per tag**; tanpa group tipe/area | CUS-07, OPEN-22 |
| A5 | Filter hanya: tag, favorit, jarak maksimum, rating minimum, jumlah minimum order selesai | CUS-08 |
| A6 | Merchant tutup / di luar coverage **tampil tapi tidak bisa dipilih** | CUS-09 |
| A7 | Merchant **busy**: menu tetap bisa masuk cart, tetapi order baru menunggu busy off | CUS-09, §11.2 |
| A8 | Merchant blok kuota **disembunyikan** dari browse | CUS-09, §16 |
| A9 | Favorit dari browse & detail; hapus dari profil | CUS-10 |
| A10 | Detail merchant: nama, deskripsi, lokasi, kontak, logo, cover, rating, review, rating menu, program marketing merchant+aplikator | CUS-11 |
| A11 | Menu bisa browse/search/sort; menu **hide** tidak tampil & tidak muncul di pencarian | CUS-12, §13.1 |
| A12 | Menu di luar availability schedule tetap tampil tapi tidak bisa masuk cart; menu/opsi **nonaktif** tidak tampil; stok habis tidak bisa dipilih | CUS-13, §13.3/13.6 |
| A13 | Jarak untuk filter & sort memakai **garis lurus** | §9.1 |
| A14 | Akun tidak bisa memilih merchant miliknya sendiri | §5.1 |

## 3. Aktor & permukaan

- Customer — home/browse, search, filter, favorit, detail merchant, daftar menu.
- Merchant — status buka/busy/coverage/kuota mengubah tampilannya.
- Ops — moderasi tag, config yang memengaruhi discovery.

## 4. Masukan → keluaran

- Masuk: alamat default terpilih, query, filter, sort.
- Keluar: daftar merchant + status pilihan, hasil pencarian, detail merchant + program, daftar menu + ketersediaan.

## 5. State UI

| State | Tampilan |
|---|---|
| memuat | skeleton kartu |
| kosong | "Tidak ada merchant yang cocok" + reset filter |
| merchant tutup | kartu normal + label Tutup, tidak bisa dibuka untuk order |
| di luar coverage | label "Di luar jangkauan alamat ini" |
| busy | label Busy; detail bisa dibuka, CTA order nonaktif |
| blok kuota | tidak muncul sama sekali |
| menu hide | tidak muncul di list & pencarian |
| menu di luar schedule | muncul + label jam tersedia |

## 6. Kontrak BE (handoff, repo ini mock)

Tag[], rating, completed_order_count, jarak garis lurus. Status turunan (buka/tutup, busy, coverage, kuota) dihitung server dan dikirim bersama kartu. Program marketing yang berlaku disertakan di detail merchant. Event: merchant_open/close/busy, coverage_changed, catalog_changed, program* (§18).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Group hanya per tag (tidak ada opsi tipe/area) | daftar opsi group | 🟡 group belum ada |
| AC2 | Merchant di luar coverage tampil dan tidak bisa dipilih | pilih merchant → CTA nonaktif + alasan | 🟡 |
| AC3 | Merchant blok kuota tidak muncul | cari namanya → 0 hasil | ⛔ |
| AC4 | Merchant busy masih bisa diisi cart | tambah menu → cart bertambah; checkout ditahan | ⛔ |
| AC5 | Menu hide tidak muncul di pencarian menu maupun merchant | query nama menu hidden | 🟡 |
| AC6 | Menu di luar schedule tampil tapi tak bisa masuk cart | klik tambah → pesan jam tersedia | ⛔ |
| AC7 | Filter yang tersedia hanya 5 jenis | inspeksi panel filter | 🟡 |

## 8. UNRESOLVED

- Query lintas instance DO untuk browse/search belum diputuskan (OPEN-25); di mock cukup filter lokal.
- "Kriteria lain" pada sort (CUS-06) tidak dirinci.

## 9. Bukti

- Kode: `src/pages/Home.tsx`, `Search.tsx`, `Filter.tsx`, `Favorites.tsx`, `MerchantPage.tsx`, `MenuDetail.tsx`, `src/data/merchant.ts` (`deliveryFeeFor`, `isDeliverable`).
