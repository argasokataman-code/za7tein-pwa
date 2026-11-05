# R-BATCH — Batch lahir saat accept, 24 order, open → delivery → done

Status: partial (batch + countdown + extend + packing ada; model beta belum) · sumber §8 BR-B01..BR-B22, §7.2, §7.5, MER-11/MER-14.

## 1. Untuk apa

Batch adalah wadah pengantaran: satu karyawan kurir mengantar sekumpulan order dari satu merchant. Model beta menghapus semua timer dan tombol tutup karena batas batch bukan waktu, melainkan jumlah order dan momen kurir mulai berjalan. Akibatnya status batch menjadi tiga nilai sederhana, dan urutan pengantaran terkunci saat delivery dimulai.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Batch hanya bisa dibuat saat merchant accept order; merchant tidak bisa membuat batch kosong | BR-B01 |
| A2 | Saat accept, order wajib dimasukkan ke batch baru atau batch open yang belum berisi 24 order | BR-B02, MER-11 |
| A3 | Satu batch maksimal 24 order (hard limit sistem) | BR-B04 |
| A4 | Merchant tidak bisa memindahkan order antar batch | BR-B05 |
| A5 | Timer, extend, dan packing timer dihapus | BR-B06..B13, BR-B15, BR-B18 |
| A6 | Order hanya bisa masuk ke batch berstatus open; batch tetap open sampai kurir memulai delivery, termasuk setelah di-assign; merchant tidak bisa menutup batch | BR-B08 |
| A7 | Batch yang belum di-assign berstatus open | BR-B19 |
| A8 | Batch yang sudah di-assign tetapi belum mulai delivery tetap open dan masih menerima order baru | BR-B20 |
| A9 | Merchant wajib meng-assign batch ke satu karyawan kurir agar batch bisa diantar | BR-B16, MER-14 |
| A10 | Assign bisa dilakukan kapan saja selama batch open | MER-14 |
| A11 | Kurir bisa memulai delivery kapan saja setelah batch di-assign | BR-B17 |
| A12 | Status batch hanya tiga: open, delivery, done | §7.5, BR-B19 |
| A13 | Saat batch mulai delivery, batch tidak menerima order baru dan urutan pengantaran terkunci | §7.5, BR-B21 |
| A14 | Batch done bila semua order di dalamnya done | §7.5 |
| A15 | Toggle auto-sort ON mengurutkan pengantaran berdasarkan total waktu tempuh tercepat, mulai dari lokasi merchant dan berakhir di order terakhir tanpa kembali ke merchant | BR-B21 |
| A16 | Auto-sort dipicu ulang setiap ada order masuk ke batch yang sudah di-assign, tanpa debounce | BR-B22, §9.3 |
| A17 | Setelah delivery dimulai, kurir tidak bisa mengubah urutan dan toggle auto-sort ikut terkunci | BR-B21 |
| A18 | Detail order customer menampilkan status realtime tanpa hitung mundur: prepare sejak accept sampai batch mulai delivery, waitingDelivery, lalu delivery dengan live tracking + ETA | BR-B14, §7.5 |
| A19 | Saat batch mulai delivery, order pertama di urutan menjadi delivery dan lainnya waitingDelivery; setelah satu order done, order berikutnya menjadi delivery | §7.5 |

## 3. Aktor & permukaan

- Merchant (hak "Terima order") — pilih batch saat accept, assign batch ke karyawan kurir, daftar batch.
- Karyawan kurir — lihat batch yang di-assign, toggle auto-sort, mulai delivery, selesaikan order satu per satu.
- Customer — status order realtime tanpa countdown, ETA.
- Ops — melihat batch (baca) untuk dispute.

## 4. Masukan → keluaran

- Masuk: order accepted, pilihan batch, assign karyawan kurir, toggle auto-sort, mulai delivery.
- Keluar: batch {merchant, courier?, order_ids[], status}, urutan pengantaran tersimpan saat delivery mulai, event `batch_created`, `batch_assigned`, `batch_full`, `batch_delivery_started`, `batch_done`.

## 5. State UI

| State | Tampilan |
|---|---|
| batch open belum di-assign | daftar order + tombol assign |
| batch open sudah di-assign | tetap menerima order baru; tombol mulai delivery tersedia |
| batch penuh 24 order | tidak muncul sebagai pilihan saat accept |
| delivery berjalan | urutan terkunci, toggle auto-sort nonaktif |
| semua order done | batch done, tidak bisa menerima order |
| batch kosong | tidak mungkin ada (batch hanya lahir dari accept) |

## 6. Kontrak BE (handoff, repo ini mock)

Entitas batch {merchant, courier?, order_ids[], status}; hard limit 24 divalidasi server; event `batch_*`; urutan final disimpan saat delivery mulai; auto-sort memakai Compute Route Matrix WALK 25×24 tanpa cache.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Tidak ada tombol buat batch kosong di merchant | buka layar batch → tidak ada CTA buat batch | ⛔ |
| AC2 | Accept tanpa batch ditolak | accept tanpa pilih batch → error | ⛔ |
| AC3 | Batch berisi 24 order tidak bisa menerima order ke-25 | isi 24 → accept ke-25 → batch penuh tidak bisa dipilih | ⛔ |
| AC4 | Batch yang sudah di-assign masih menerima order baru | assign → accept order baru → masuk batch sama | ⛔ |
| AC5 | Tidak ada timer/extend/packing di layar batch | periksa UI → tidak ada countdown | ⛔ |
| AC6 | Urutan terkunci setelah delivery mulai | mulai delivery → coba ubah urutan → ditolak | ⛔ |
| AC7 | Auto-sort terpicu setiap order masuk tanpa debounce | assign 1 batch → masukkan 3 order cepat → 3 request auto-sort | ⛔ |
| AC8 | Status batch hanya open/delivery/done | cek semua transisi → tidak ada status lain | ⛔ |

## 8. UNRESOLVED

- Perilaku bila kurir yang di-assign dihapus dari merchant sebelum mulai delivery tidak diatur.
- ETA per order disiarkan bagaimana (penyimpanan) ditunda ke desain teknis (§9.4 catatan).

## 9. Bukti

- Kode: `src/store/slices/batchSlice.ts:21`, `src/types.ts:1163,1172` (`Batch`), `src/pages/MerchantBatchDetail.tsx`, `src/pages/CourierBatch.tsx`, `src/data/courierBatch.ts`, `scripts/courier-batch-check.mjs`.
- Belum ada: status 3 nilai, larangan tutup batch, assign-before-start, urutan terkunci.
