# R-AUTOSORT — Auto-sort rute batch kurir

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §9.6 (BR-B12, BR-B13) · §22.2 R4 · flow `f25-batch-lifecycle` (M08) · milestone **M5**.
Status: partial (lihat Acceptance) · terakhir ditinjau: 2026-10-16.

## 1. Untuk apa

Regular batching mengumpulkan sampai 24 order satu merchant ke satu kurir inhouse, dan **semua kurir berjalan kaki** (§9). Tanpa urutan, kurir mengantar mengikuti urutan order masuk: total jalan lebih panjang, makanan lebih dingin, ETA melenceng, kurir (karyawan merchant) buang waktu.

Auto-sort memilih **urutan singgah dengan total waktu tempuh paling kecil** dari merchant melewati semua customer. Prioritasnya kecepatan pesanan sampai ke customer, bukan rute rapi.

## 2. Aturan (dan alasannya)

| # | Aturan | Alasan (sumber) |
|---|---|---|
| A1 | Rute mulai di merchant, **berakhir di order terakhir hasil optimasi**, bukan order yang terakhir masuk | prioritas kecepatan (§9.6) |
| A2 | Rute **tidak kembali ke merchant**, walaupun titik terakhir jadi jauh | §9.6 |
| A3 | Urut berdasar **waktu tempuh tercepat**, bukan jarak | kurir jalan kaki; jalur pejalan kaki ≠ garis lurus |
| A4 | Selalu mode **WALK**, tanpa opsi lalu lintas | `routingPreference` hanya untuk DRIVE/TWO_WHEELER (§9.6) |
| A5 | Maks **25 titik** (merchant + 24 order) | batas satu batch (§9.6) |
| A6 | **Wajib** peringatan rute WALK (beta) di UI batch kurir | WALK beta bisa tak tahu trotoar/jalur (§9.6) |
| A7 | **UI customer tidak menampilkan garis rute** — cukup posisi kurir + ETA | auto-sort opsional lewat toggle kurir (§9.6) |
| A8 | Rute kurir **partner** yang ditampilkan memuat peringatan WALK yang sama | §9.6 |
| A9 | **Tanpa debounce**: tiap order masuk batch memicu satu request | beberapa order berdekatan tetap request masing-masing (§9.6) |
| A10 | Hasil Routes API / matriks **tidak boleh disimpan** untuk dipakai ulang | biaya, R4 (§22.2) |
| A11 | Toggle **ON/OFF**; OFF = kurir menyusun sendiri | auto-sort opsional (§9.6) |
| A12 | Heuristik **NN + 2-opt** di atas Compute Route Matrix | Compute Routes optimization butuh titik akhir tetap, jadi tak bisa dipakai untuk rute yang titik akhirnya hasil optimasi (§9.6) |
| A13 | Dipicu ulang tiap order masuk **selagi hitung mundur jalan dan batch sudah di-assign** | §9.6 |

## 3. Aktor & permukaan

- **Kurir inhouse** — pemegang toggle; melihat & mengatur urutan di `/courier/batch`.
- **Merchant** — menutup batch lebih awal + gate packing (`canStartEarly`), memicu bisa-mulai.
- **Customer** — hanya posisi kurir + ETA; **tanpa** garis rute.

## 4. Masukan → keluaran

- Masuk: posisi merchant (dapur) + titik customer; matriks waktu (BE).
- Keluar: `batch.autoSort`, `routeOrder` → daftar stop bernomor, ETA per order, garis peta (kurir), highlight berikutnya.

## 5. State UI (`/courier/batch`)

| State | Tampilan |
|---|---|
| belum ada batch | `Belum ada batch yang ditugaskan merchant.` |
| auto-sort ON | daftar bernomor = hasil optimasi + label `(otomatis)` |
| auto-sort OFF | tombol naik/turun pada tiap henti (target 44×44, jarak 8 px) menggeser urutan; label `(manual)` |
| belum bisa mulai | catatan tunggu hitung mundur / izin merchant |
| memperbarui (order masuk) | urutan + ETA ikut berubah |
| koordinat tak lengkap | fallback urut `distanceMeters`, peta mungkin tak tampil |

## 6. Kontrak BE (handoff, repo ini mock)

- `batch.autoSort`, `batch.routeOrder` (BR-B13).
- Google Routes API mode WALK / Route Optimization; Compute Route Matrix 25×24 (≤625); cost watch R4.
- Event: order masuk batch memicu satu request auto-sort (A9).

## 7. Acceptance (terukur)

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Daftar "Urutan antar" saat ON = hasil auto-sort | nomor 1..n == `autoSortTasks` | ✅ `courierBatchTasks` menurunkan urutan saat ON (`src/data/courierBatch.ts:40`); satu sumber di `CourierBatch.tsx:40` |
| AC2 | Nomor daftar, nomor pin peta, dan "berikutnya" = satu urutan | banding daftar vs `mapStops` vs `nextBatchTask` | ✅ ketiganya membaca `stops` yang sama |
| AC3 | OFF → kurir bisa mengubah urutan, dan garis rute + nomor ikut | kontrol reorder ada + ubah `routeOrder` | ✅ tombol naik/turun per henti **di dalam kartu baris** (`CourierBatch.tsx:164-240`, gaya `_courier-batch.scss:86-221`) → `setBatchRouteOrder`, urutan dari `moveBatchStop` (`courierBatch.ts:129`). Bukti Chromium asli: geser SA-1039 naik → daftar `SA-1041, SA-1039, SA-1040`, "berikutnya" jadi `SA-1039`, panjang rute 4,0 → 4,7 km, naik nonaktif di puncak & turun nonaktif di ekor (opasitas 0,35), target 44×44 px, jarak antar target 8 px, baris seragam 122 px, overflow-x 0 |
| AC4 | Urut berdasar waktu tempuh | BE (matriks WALK); mock sekarang haversine | ⚠️ mock jarak garis lurus |
| AC5 | Heuristik NN + 2-opt | BE/mock | ⚠️ NN saja |
| AC6 | Peringatan WALK ada di UI batch kurir | teks tampil (`WALK_ROUTE_BETA_NOTE`) | ✅ |
| AC7 | UI customer tanpa garis rute | peta tahap `diantar` tanpa polyline | ✅ `useLeafletMap.ts:98-118` (delivery = pin kurir + tujuan, tanpa garis); bukti DOM: `?stage=diantar` overlayPaths 0 vs `?stage=disiapkan` 1 |
| AC8 | Maks 25 titik | `MAX_BATCH_ORDERS` + 1 | ✅ |
| AC9 | Rute tak kembali ke merchant | panjang rute berakhir di stop terakhir | ✅ |
| AC10 | Dipicu ulang saat order masuk | urutan berubah saat `addOrderToBatch` | ⚠️ belum tersimulasi/ditampilkan |
| AC11 | ON tidak bergantung `routeOrder` (urutan diturunkan) | seed boleh `routeOrder: []` walau `autoSort: true` | ✅ `courierBatch.ts:27`; assert "ON mengabaikan routeOrder" di `scripts/courier-batch-check.mjs` |
| AC12 | Peta & daftar membaca satu urutan, tak menghitung ulang sendiri | satu ekspresi urutan di layar | ✅ `CourierBatch.tsx:40` (`stops`) dipakai daftar, `mapStops`, dan panjang rute |
| AC13 | `batchSlice.setAutoSort` ON tidak menulis `routeOrder` mentah | cek `batchSlice.ts` | ✅ `routeOrder = []` (urutan manual saja) |

## 8. UNRESOLVED

- Nilai matriks waktu bergantung Google Routes (BE) — tidak ada di repo mock.
- "Tanpa debounce" & "matriks tak disimpan" = perilaku BE, tak bisa dibuktikan di FE.

## 9. Bukti

- Kode: `src/data/courierBatch.ts` (`autoSortTasks:93`, `autoSortRoute:122`, `moveBatchStop:129`, `routeDistanceMeters:133`, `courierBatchTasks:40`, `nextBatchTask:54`, `WALK_ROUTE_BETA_NOTE:32`, seed `mockCourierBatch:16`), `src/pages/CourierBatch.tsx:38-50,64-67,154-253`, `src/styles/system/_courier-batch.scss:86-221` (kartu `.courier-batch-row` + kolom geser `.courier-batch-move/-move-btn`, meta satu item per baris), `src/store/slices/courierSlice.ts:93-112`, `src/store/slices/batchSlice.ts:27-33,55-65`, `src/hooks/useLeafletMap.ts:91-119` (mode `delivery` tanpa garis rute).
- Self-check: `scripts/courier-batch-check.mjs` (termasuk `moveBatchStop`: tepi, tetangga, henti selesai, id asing).
- Flow: `docs/design/flows/f25-batch-lifecycle/` (M08).
