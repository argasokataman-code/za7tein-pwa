# R-CUS-ADDRESS — Alamat customer: tambah dari profil & cart, alamat default

Status: partial (CRUD alamat ada di `cartSlice`; jalur ganda profil/cart & penanda default belum dipastikan) · sumber §10 p.25–26 (CUS-02, CUS-03).

## 1. Untuk apa

Alamat adalah syarat order: merchant hanya menerima order di dalam coverage-nya, dan kurir butuh titik yang jelas. Customer mengelola alamat dari dua tempat yang sama-sama wajar, **profil** (saat tidak sedang memesan) dan **cart** (saat sedang memesan), dengan satu alamat default agar checkout tidak menebak.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Customer bisa **menambah alamat lewat profil** | CUS-02 |
| A2 | Customer bisa **menambah alamat lewat cart** (tanpa keluar dari alur order) | CUS-02 |
| A3 | Customer bisa **memilih alamat default lewat profil** | CUS-03 |
| A4 | Customer bisa **mengganti alamat pengiriman** order berjalan lewat cart | CUS-03 |
| A5 | Customer bisa **mengganti alamat default** lewat cart | CUS-03 |
| A6 | Checkout memakai alamat terpilih; bila belum memilih, alamat default dipakai | CUS-03, §7.1 |
| A7 | Alamat membawa komponen yang dipakai kurir: nama penerima, gedung/lantai/unit, catatan, jalan/kawasan, kota, koordinat | §10 p.26 |
| A8 | Alamat di luar coverage merchant tidak bisa dipakai untuk order merchant itu | §9.1, §10 p.26 |

## 3. Aktor & permukaan

- Customer — `/personal-data` (profil, daftar + tambah alamat + set default), `/address-selection` (pilih alamat saat checkout), cart/checkout (tambah & ganti alamat), `/merchant/:id` (validasi coverage).
- Merchant — tidak mengelola alamat customer; hanya menerima titik + catatan pada order.
- Karyawan kurir — melihat alamat + catatan per order di detail tugas.

## 4. Masukan → keluaran

- Masuk: label, nama penerima, gedung/lantai/unit, catatan, jalan, kota, pin peta.
- Keluar: `addresses[]`, `selectedAddressId`, `isDefault`, `fullAddress`, `lat/lng`, `distanceMeters`.

## 5. State UI

| State | Tampilan |
|---|---|
| belum punya alamat | daftar kosong + aksi tambah; checkout memblokir sampai alamat ada |
| punya banyak alamat | daftar radio, satu bertanda default |
| menambah dari cart | form sama, kembali ke cart dengan alamat baru terpilih |
| alamat di luar coverage | baris tidak bisa dipilih + alasan jarak/area |
| pin belum valid | simpan dinonaktifkan sampai koordinat terisi |

## 6. Kontrak BE (handoff, repo ini mock)

Entity `address` {customer, label, name, building, floor, unit, notes, address, city, lat, lng, is_default}; unik satu default per customer; validasi coverage dihitung server per merchant; event `address_changed` + `coverage_changed` (hitung ulang fee cart).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Tambah alamat dari profil tersimpan | `/personal-data` → "Alamat Pengantaran" → tambah → muncul di daftar | ✅ `Profile.tsx:145` ke `/address-selection`, `cartSlice.ts:270`, `AddressSelection.tsx:154` |
| AC2 | Tambah alamat dari cart tersimpan dan langsung terpilih | checkout → ubah alamat → tambah → `selectedAddressId` = id baru | ✅ `Checkout.tsx:414,444`, `AddressSelection.tsx:170` |
| AC3 | Set default mengubah `isDefault` tunggal | dua alamat, jadikan default kedua → hanya satu `isDefault: true` | ✅ `cartSlice.ts` `setDefaultAddress` menimpa semua baris |
| AC4 | Ganti alamat pengiriman dari cart mengubah order aktif | ubah radio di cart → checkout memakai alamat baru | ✅ `AddressSelection.tsx:168-169,225` |
| AC5 | Checkout tanpa pilihan memakai default | kosongkan `selectedAddressId` → checkout memakai `isDefault` | ✅ `cartSlice.ts:273` |
| AC6 | Alamat di luar coverage tidak bisa dipilih | jarak melewati batas → baris nonaktif + alasan | ⛔ `resolveCoverage` masih zona lama (`address-selection` gate), bukan coverage merchant beta |

## 8. UNRESOLVED

- Batas jumlah alamat per customer tidak disebut PRD; jangan mengarang angka.
- Form apartemen (gedung/lantai/unit) diwarisi dari revisi lama; beta hanya menyebut "alamat" tanpa field rinci (§10 p.25–26). Struktur field final menunggu ERD.

## 9. Bukti

- Tipe: `src/types.ts:217` (`Address`), `src/store/slices/cartSlice.ts:20-21,251,270-274`.
- Layar: `src/pages/AddressSelection.tsx`, `src/pages/PersonalData.tsx`, `src/pages/Checkout.tsx`.
- Flow terkait: `f20-address-zone` (masih model zona lama, wajib rebase saat R-CUS-ADDRESS dikerjakan).
