# R-MER-COVERAGE — Coverage polygon/radius & delivery fee merchant

Status: partial (zona global + slice coverage ada; mode area/radius beta belum) · sumber §9.1 MER-04, §9.2, §9.3, §18.

## 1. Untuk apa

Coverage menentukan alamat mana yang bisa dilayani merchant dan berapa delivery fee-nya. Fee itu dibayarkan ke merchant, bukan ke kurir, sehingga kesalahan hitung langsung memindahkan uang. Karena cart bersifat realtime, perubahan coverage atau fee harus menghitung ulang semua cart merchant itu.

## 2. Aturan

### Mode coverage

| # | Aturan | Sumber |
|---|---|---|
| A1 | Merchant memilih salah satu mode: area (beberapa polygon, fee per polygon) atau radius (radius maksimum + fee per satuan jarak) | MER-04, §9.1 |
| A2 | Pada mode radius, satuan jarak dipilih merchant: meter atau km | MER-04 |
| A3 | Pada mode radius, coverage diukur jarak garis lurus: alamat di dalam radius termasuk coverage | §9.1 |
| A4 | Alamat di luar coverage: merchant tetap tampil tetapi tidak bisa dipilih | §9.1, CUS-04..13 |
| A5 | Jarak untuk filter dan sort discovery memakai garis lurus, bukan rute | §9.1 |

### Polygon (mode area)

| # | Aturan | Sumber |
|---|---|---|
| A6 | Polygon milik satu merchant tidak boleh tumpang tindih | §9.1 |
| A7 | Saat menggambar area baru atau mengedit satu area, area lain tampil nonaktif (terkunci, tidak bisa diedit/dipilih) | §9.1 |
| A8 | Polygon yang tumpang tindih atau memotong dirinya sendiri ditolak saat disimpan; validasi di client lalu diulang di server sebagai sumber kebenaran | §9.1 |
| A9 | Dua area boleh bersentuhan atau berbagi tepi; alamat tepat di tepi bersama memakai fee terendah di antara area yang bersentuhan | §9.1 |
| A10 | Drawing Library Maps JavaScript API tidak tersedia sejak Mei 2026; implementasi memakai pustaka lain (mis. Terra Draw) dan pengecekan overlap dengan pustaka geometri (mis. Turf.js) | §9.1 catatan teknis |

### Delivery fee

| # | Aturan | Sumber |
|---|---|---|
| A11 | Fee dihitung proporsional dari jarak rute **WALK** antara merchant dan alamat customer, tanpa pembulatan satuan jarak | §9.1, §9.2 |
| A12 | Jarak rute hanya dihitung saat fee dibutuhkan (cart dan checkout), bukan saat browse | §9.1 |
| A13 | Jarak rute dan matriks waktu tidak boleh disimpan untuk dipakai ulang (ketentuan Routes API: penyimpanan sementara lat/long maks 30 hari); setiap perhitungan memakai request baru | §9.1, §9.3 |
| A14 | Perubahan coverage atau delivery fee memicu hitung ulang fee di semua cart merchant itu | §9.1, §18 |
| A15 | Delivery fee dibayarkan ke merchant bersama payout order online; pada order COD diterima tunai. Aplikator tidak melakukan split payout ke karyawan kurir | §9.2, §15.4, §15.5 |
| A16 | Perubahan coverage/fee dikirim realtime ke merchant dan customer yang melihat merchant itu, termasuk yang punya cart | §18 |

## 3. Aktor & permukaan

- Owner/karyawan ber-hak "Pengaturan akun" — editor polygon/radius, input fee.
- Customer — indikator coverage di browse/detail, fee di cart dan checkout.
- Ops — melihat coverage merchant (baca) untuk verifikasi.

## 4. Masukan → keluaran

- Masuk: mode, polygon/radius, satuan, fee per area/satuan jarak, alamat customer.
- Keluar: daftar area tersimpan, status coverage alamat, nilai F (delivery fee) di cart/checkout, event `coverage_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| alamat di luar coverage | merchant tampil, tombol order nonaktif + alasan |
| polygon overlap / self-intersect | simpan ditolak, area ditandai |
| sedang menggambar area | area lain terkunci dan diredupkan |
| fee berubah saat cart terbuka | nilai F di cart berubah realtime + rincian diperbarui |
| Routes API gagal | fee tidak diisi diam-diam; status error ditampilkan |

## 6. Kontrak BE (handoff, repo ini mock)

Validasi polygon client + server (Turf.js); Google Routes API WALK (biaya R4); event `coverage_changed`; tidak ada cache jarak.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Dua polygon overlap ditolak | gambar overlap → simpan → error | ⛔ |
| AC2 | Polygon self-intersect ditolak | gambar polygon bersilang → simpan → error | ⛔ |
| AC3 | Area lain terkunci saat menggambar | mulai gambar → area lama nonaktif | ⛔ |
| AC4 | Titik di tepi bersama memakai fee terendah | uji titik di tepi dua area beda fee → fee = yang terendah | ⛔ |
| AC5 | Mode radius memakai garis lurus untuk coverage | titik di dalam radius tetapi rute 3 km → tetap tercakup | ⛔ |
| AC6 | Fee proporsional jarak WALK tanpa pembulatan satuan | ubah jarak 100 m → fee berubah sesuai tarif per meter | ⛔ |
| AC7 | Mengubah fee menghitung ulang semua cart merchant | buka 2 cart merchant sama → ubah fee → kedua cart berubah | ⛔ |

## 8. UNRESOLVED

- Mode radius: apakah fee dihitung dari jarak 0 atau ada jarak minimum tidak disebut.
- Perilaku bila Routes API tidak tersedia (fallback fee) tidak diatur; bergantung OPEN-01/OPEN-02.

## 9. Bukti

- Kode: `src/pages/MerchantCoverage.tsx`, `src/store/slices/coverageSlice.ts:34`, `src/types.ts:1483` (`MerchantCoverage`), `src/data/merchant.ts` (`deliveryFeeFor`, `haversineMeters`, `zoneFor`).
- Belum ada: mode polygon multi-area, mode radius fee per satuan, validasi overlap.
