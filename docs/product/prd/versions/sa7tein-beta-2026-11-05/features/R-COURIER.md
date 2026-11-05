# R-COURIER — Karyawan kurir: assignment wajib, auto-sort, lokasi live

Status: partial (layar kurir + auto-sort ada; partner/dispatch/online-offline belum dihapus) · sumber §11 MER-16/MER-37/MER-38, §9.3, §9.4, BR-B21/B22, OPEN-82.

## 1. Untuk apa

Kurir bukan lagi pihak ketiga: ia karyawan merchant dengan hak akses "Antar order", sehingga alur kurir hanya berisi pekerjaan yang memang miliknya (batch yang di-assign) tanpa dispatch, tanpa status online/offline, dan tanpa rekening bank. Pengantaran dilakukan berjalan kaki, sehingga rute dan fee memakai mode WALK.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Kurir inhouse = karyawan merchant dengan hak akses "Antar order" | MER-16, §11.3 |
| A2 | Karyawan kurir hanya melihat dan mengantar batch yang di-assign kepadanya | §11.3, MER-37 |
| A3 | Assignment wajib, tanpa opsi menolak | MER-37 |
| A4 | Kurir melihat batch dan detail delivery beserta rute, navigasi, dan catatan per order; catatan per menu tidak terlihat | MER-37, CUS-31 |
| A5 | Kurir mengatur toggle auto-sort ON/OFF atau mengurutkan manual sebelum delivery dimulai | MER-38, BR-B21 |
| A6 | Kurir memulai delivery batch kapan saja setelah batch di-assign | MER-38, BR-B17 |
| A7 | Setelah delivery dimulai, urutan tidak bisa diubah dan toggle auto-sort terkunci | BR-B21 |
| A8 | Kurir menyelesaikan order satu per satu | MER-38 |
| A9 | Kurir membagikan lokasi live selama delivery | MER-38, §9.4 |
| A10 | Kurir ikut group chat order setelah batch di-assign dan bisa membaca seluruh riwayat chat order itu | §19.1 |
| A11 | Kurir tidak punya status online/offline; batch di-assign tanpa melihat status | §11.3, OPEN-82 |
| A12 | Kurir partner, order Quick, dan dispatch dihapus | MER-16, MER-12/13, OPS-03/10/13/15, B-02 |
| A13 | Aplikator tidak split payout ke karyawan kurir; pembayaran kurir urusan merchant di luar aplikasi | §9.2, §11.3 |
| A14 | Kurir tidak bisa mengakses invoice | §15.8, CUS-38 |
| A15 | Pengantaran oleh karyawan kurir menjadi tanggung jawab merchant dalam dispute; pelaku ditelusuri lewat riwayat aktivitas | §11.3 |

### Rute & lokasi

| # | Aturan | Sumber |
|---|---|---|
| A16 | Rute auto-sort dimulai di lokasi merchant dan berakhir di order terakhir hasil optimasi, tanpa kembali ke merchant | §9.3 |
| A17 | Maksimal 25 titik: lokasi merchant + 24 customer | §9.3 |
| A18 | Semua perhitungan memakai mode WALK tanpa opsi lalu lintas | §9.3 |
| A19 | UI kurir wajib menampilkan peringatan bahwa rute berjalan kaki masih beta dan mungkin tidak mencakup trotoar/jalur pejalan kaki | §9.3 |
| A20 | UI customer tidak menampilkan garis rute jalan kaki, hanya posisi kurir dan ETA | §9.3 |
| A21 | Matriks waktu tempuh tidak disimpan untuk dipakai ulang; setiap auto-sort meminta matriks baru (25×24 = 600 elemen) | §9.3 |
| A22 | Optimasi memakai heuristik nearest neighbor + 2-opt di backend | §9.3 |
| A23 | Lokasi dibagikan realtime ke merchant selama batch delivery, dan ke customer hanya selama order-nya berstatus delivery | §9.4, §18 |
| A24 | ETA per order memperhitungkan urutan pengantaran | §9.4 |
| A25 | L1: di PWA lokasi hanya terkirim andal saat app kurir terbuka dan layar menyala | §21.1 |
| A26 | Notifikasi "kurir hampir sampai" berbasis waktu dengan ambang diatur ops | §9.4, §12.2 |

## 3. Aktor & permukaan

- Karyawan kurir — daftar batch, detail batch (rute + urutan), detail tugas, toggle auto-sort, mulai delivery, selesai per order, chat.
- Merchant — memantau lokasi kurir selama delivery.
- Customer — posisi kurir + ETA hanya saat order `delivery`.
- Ops — menghapus/mengarsipkan fitur partner dan dispatch.

## 4. Masukan → keluaran

- Masuk: batch di-assign, urutan manual/auto-sort, aksi mulai delivery, aksi selesai per order, koordinat lokasi.
- Keluar: urutan pengantaran, status order (`waitingDelivery`/`delivery`/`done`), posisi kurir realtime, ETA per order, event `courier_location`, `order_almost_arrived`.

## 5. State UI

| State | Tampilan |
|---|---|
| batch di-assign belum mulai | urutan bisa diubah, toggle auto-sort aktif |
| auto-sort ON | urutan hasil optimasi + peringatan WALK |
| auto-sort OFF | kurir mengurutkan manual |
| delivery berjalan | urutan terkunci, toggle nonaktif, order aktif ditandai |
| lokasi tidak terkirim | indikator bahwa lokasi butuh app terbuka + layar menyala |
| order selesai satu per satu | order berikutnya otomatis menjadi `delivery` |

## 6. Kontrak BE (handoff, repo ini mock)

Auto-sort: Compute Route Matrix WALK 25×24, NN + 2-opt, tanpa cache, tanpa debounce; lokasi live via WebSocket; event `batch_assigned`, `courier_location`, `order_delivered`.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Kurir tidak punya tombol menolak assignment | buka batch → hanya aksi mulai/lihat | ⛔ |
| AC2 | Kurir hanya melihat batch miliknya | login kurir A → batch kurir B tidak ada | ⛔ |
| AC3 | Catatan per menu tidak tampil di detail tugas kurir | order dengan catatan per menu → detail kurir hanya catatan order | ⛔ |
| AC4 | Toggle auto-sort terkunci setelah delivery mulai | mulai delivery → toggle nonaktif | ⛔ |
| AC5 | Peringatan WALK tampil di UI kurir | buka rute → peringatan tampil | ⛔ |
| AC6 | UI customer hanya menampilkan posisi + ETA | buka detail order delivery → tidak ada garis rute | ⛔ |
| AC7 | Lokasi customer hanya saat order `delivery` | order `waitingDelivery` → tidak ada posisi | ⛔ |
| AC8 | Tidak ada status online/offline di aplikasi kurir | periksa UI → tidak ada toggle status | ⛔ |
| AC9 | Tidak ada invoice di aplikasi kurir | buka detail order → tidak ada tautan invoice | ⛔ |

## 8. UNRESOLVED

- OPEN-82 (assignment tanpa status online) diputuskan di dokumen; rujukan final = §11.3.
- Batas akurasi/interval pengiriman lokasi tidak diatur.

## 9. Bukti

- Kode: `src/pages/CourierBatch.tsx`, `src/pages/CourierTasks.tsx`, `src/pages/CourierTaskDetail.tsx`, `src/pages/CourierPartner.tsx`, `src/pages/CourierPayout*.tsx`, `src/store/slices/partnerSlice.ts`, `src/store/slices/courierSlice.ts`, `src/data/courierBatch.ts`.
- Belum ada: penghapusan partner/Quick/dispatch, auto-sort matriks 25×24, lokasi live, peringatan WALK.
