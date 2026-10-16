# R-BATCH — Batch order Regular satu kurir inhouse

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §8 (BR-B01..B13), §7.2, §22.2 R7 · flow `f25-batch-lifecycle` · milestone **M4** (+ dipakai M5).
Status: partial · terakhir ditinjau: 2026-10-16.

## 1. Untuk apa

Order Regular (bukan Quick) tidak diantar satu-satu. Beberapa order satu merchant dikumpulkan jadi **satu batch** yang diantar berurutan oleh **satu** kurir inhouse. Ini yang membuat kurir karyawan merchant efisien dan membuat estimasi tiba bisa dijanjikan ke customer.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| B1 | Batch **hanya lahir** dari order Regular yang di-accept merchant (Quick tidak masuk batch) | §8 BR-B01 |
| B2 | Saat accept Regular, merchant **wajib** memilih batch baru atau batch berjalan | §8 BR-B02 |
| B3 | Batch menampung maks **24 order** (batas keras) | §8 BR-B04 |
| B4 | Batch **tidak bisa diperpanjang** dan order **tidak bisa pindah** antar batch | §8 |
| B5 | Estimasi batch **tampil ke customer**; order belakangan melihat sisa hitung mundur | §8 |
| B6 | Batch **wajib di-assign ke satu** kurir inhouse | §8 BR-B07 |
| B7 | Batch boleh **ditutup lebih awal** | §8 BR-B08 |
| B8 | Boleh **mulai lebih awal** hanya bila sudah ditutup **dan** semua order selesai packing | §8 BR-B09 |
| B9 | Batch selesai saat semua ordernya selesai (status turunan) | §8 BR-B11 |

## 3. Aktor & permukaan

- **Merchant** — `/merchant/orders`: accept Regular → pilih batch; `BatchPanel` (assign kurir, tutup lebih awal, setujui mulai lebih awal).
- **Kurir inhouse** — `/courier/batch` membaca batch yang `courierId` cocok.
- **Customer** — hanya melihat estimasi (tanpa konsep batch di UI).

## 4. Masukan → keluaran

- Masuk: order Regular yang di-accept + estimasi masak + id batch pilihan.
- Keluar: `Batch{id, merchantId, courierId?, orderIds[], status, estimateMinutes, countdownSeconds}` + status turunan.

## 5. State UI

| State | Tampilan |
|---|---|
| belum ada batch | panel batch tidak dirender |
| batch baru | kartu baru + hitung mundur + `0/24` |
| batch berjalan | sisa kapasitas + daftar order; bisa digabung |
| batch penuh | batch baru tidak muncul di daftar "gabung" |
| ditutup lebih awal | status "Ditutup lebih awal" |
| semua packing | tombol "mulai lebih awal" aktif (izin merchant) |
| semua order selesai | status `Selesai` (turunan, bukan disimpan) |

## 6. Kontrak BE (handoff, repo ini mock)

- Entity `Batch{merchant_id, courier_id?, countdown, order_ids[], status}` (§7.5): status batch = hitung mundur berjalan, ditutup lebih awal, selesai tanpa kurir, selesai kurir belum mulai, dalam pengantaran, selesai.
- BE demo **belum punya** tabel `batches`; state batch hidup di Redux dan tidak dibagi lintas peran (`ui-impact.md` §8).
- Event: `batch_assigned`, `batch_closed`, `batch_started`.

## 7. Acceptance (terukur)

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Batas 24 order keras | `MAX_BATCH_ORDERS === 24` + `joinableBatches` membuang batch penuh | ✅ `src/data/batch.ts:11,26` |
| AC2 | Batch hanya dari order Regular yang di-accept | jalur accept Regular memanggil `setOrderBatch`; Quick tidak | ✅ `MerchantOrders` + `batchSlice` |
| AC3 | Wajib pilih batch saat accept Regular | sheet accept menawarkan "Batch baru"/"gabung berjalan" | ✅ |
| AC4 | Tak bisa diperpanjang / pindah order antar batch | tak ada reducer pemindah order | ✅ (di-assert `scripts/batch-check.mjs`) |
| AC5 | Wajib assign satu kurir inhouse | assign per batch, bukan per order | ✅ `BatchPanel` |
| AC6 | Bisa ditutup lebih awal | `closeBatchEarly` | ✅ `batchSlice` |
| AC7 | Mulai lebih awal butuh ditutup + semua packing | `canStartEarly(batch, orders)` = `closed` && `batchAllPacked` | ✅ `src/data/batch.ts:56-68` |
| AC8 | Status `done` turunan saat semua order selesai | `batchDisplayStatus` | ✅ `src/data/courierBatch.ts:67` |
| AC9 | Estimasi batch tampil ke customer | customer melihat estimasi dari batch | ⚠️ customer masih memakai ETA statis `mockOrder.readyEstimate` |
| AC10 | State batch satu sumber lintas peran (merchant & kurir) | id order sama di kedua layar | ❌ kurir pakai `ct-*`, merchant `mo-*`/`api-*`; BE tanpa tabel `batches` |
| AC11 | Hitung mundur nyata | penghitung berjalan | ⚠️ nilai demo (`BATCH_COUNTDOWN_SECONDS`), AGENTS §1 |

## 8. UNRESOLVED

- Tabel `batches` di BE dan pemilik status (merchant vs kurir) — belum ada; jangan diisi tebakan.
- Snapshot estimasi ke customer (field + event) menunggu M7 (realtime).

## 9. Bukti

- Kode: `src/data/batch.ts` (seluruh), `src/store/slices/batchSlice.ts`, `src/components/merchant/BatchPanel.tsx`, `src/pages/MerchantOrders.tsx`, `src/data/courierBatch.ts:16-71`, `src/store/slices/courierSlice.ts:109-112`.
- Self-check: `scripts/batch-check.mjs`.
- Flow: `docs/design/flows/f25-batch-lifecycle/`.
- Gap BE: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/ui-impact.md` §8.
