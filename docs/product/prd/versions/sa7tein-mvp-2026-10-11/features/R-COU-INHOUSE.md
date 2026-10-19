# R-COU-INHOUSE — Kurir karyawan merchant (kerja per batch)

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §7.2, §12 (COU-11..14), §9.6 · flow `f13-courier-view`, `f25-batch-lifecycle` · milestone **M5**.
Status: partial · terakhir ditinjau: 2026-10-19.

## 1. Untuk apa

Kurir **inhouse** adalah karyawan merchant (bukan mitra aplikator). Ia mengantar batch Regular milik tokonya. Karena ia karyawan, **assignment bersifat wajib** — tak ada tombol tolak. Tugasnya berurutan: menunggu izin mulai, lalu menyelesaikan order satu per satu dengan checkpoint + OTP customer.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| I1 | Kurir inhouse **milik merchant** (`merchantId`); akunnya dibuat merchant | §7.2 |
| I2 | Assignment **wajib, tanpa tolak** | §12 COU-11 |
| I3 | Bekerja **per batch**, bukan per order lepas | §9.6 |
| I4 | Mulai delivery setelah hitung mundur selesai, **atau** lebih awal seizin merchant | §9.6 BR-B09 |
| I5 | Menyelesaikan order **satu per satu**, dipandu checkpoint; settle hanya lewat **OTP** | §12 COU-12..14 |
| I6 | Delivery fee Regular **online** dikirim ke akun DANA kurir saat order selesai | R-DELIV-FEE |
| I7 | Regular **COD** dibayar merchant di luar aplikasi | §16.3 |

## 3. Aktor & permukaan

- **Kurir inhouse** — `/courier/batch` (kepala batch + urutan + mulai), `/courier/tasks` + `/task/:id` (checkpoint, OTP).
- **Merchant** — assign kurir per batch (lihat R-BATCH).

## 4. Masukan → keluaran

- Masuk: batch yang `courierId` cocok + daftar `CourierTask` (+ checkpoints/OTP).
- Keluar: progres checkpoint per order, status batch (`delivering` → `done` turunan), entri fee ke DANA.

## 5. State UI

| State | Tampilan |
|---|---|
| tak ada batch | "Belum ada batch yang ditugaskan merchant." |
| belum boleh mulai | catatan tunggu hitung mundur / izin merchant |
| boleh mulai | tombol **Mulai antar** (aksen merek) |
| dalam pengantaran | "Antar order paling atas lebih dulu" |
| order selesai | badge centang + penanda berikutnya bergeser |
| semua selesai | status batch `Selesai` (turunan) |

## 6. Kontrak BE (handoff, repo ini mock)

- Field `merchant_id`, `type: inhouse`.
- Event: `batch_assigned`, `delivery_started`, `order_completed`.
- Fee → DANA kurir (online) — auto-payout saat selesai (§16.4).

## 7. Acceptance (terukur)

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Tak ada tombol tolak assignment | tak ada kontrol reject di `/courier/batch`/tugas | ✅ (inhouse tak memakai `partnerSlice`) |
| AC2 | Kerja per batch | layar batch membaca `courier.batch` | ✅ `src/pages/CourierBatch.tsx:36,40` |
| AC3 | Mulai setelah hitung mundur atau izin merchant | `canStartBatch(batch)` = countdown habis \|\| `closed` | ✅ `src/data/courierBatch.ts:79-81` |
| AC4 | Mulai menggeser batch ke `delivering` | `startBatchDelivery` | ✅ `src/store/slices/courierSlice.ts:110` |
| AC5 | Selesai satu per satu via checkpoint | `advanceCheckpoint` maju 1 langkah | ✅ `courierSlice.ts:72` |
| AC6 | Settle hanya lewat OTP | `completeTask` (dipanggil setelah OTP benar) | ✅ `courierSlice.ts:86` |
| AC7 | Fee online ke DANA, bukan saldo tarik | `courierFeeEntries`/`courierFeesPaid`; payout hanya tips | ✅ `src/data/courierWallet.ts` |
| AC8 | COD ditandai dibayar merchant, bukan ke DANA | label "COD, dibayar merchant" | ✅ `CourierBatch.tsx:189` |
| AC9 | Akun kurir dibuat merchant, bukan daftar mandiri | alur auth inhouse | ✅ form pendaftaran kurir ada di konsol merchant (`MerchantCouriers.tsx:71` → `merchantSlice.addCourier`, cek kuota + `toE164`); catatan: kredensial/login inhouse masih mock (`f21`) |
| AC10 | Identitas order sama dengan batch merchant | id order kurir == id order merchant | ❌ kurir `ct-*`, merchant `mo-*`/`api-*` |
| AC11 | Order berikutnya = urutan antar efektif | `nextBatchTask` = order pertama belum selesai | ✅ `courierBatch.ts:54`, dipakai `CourierBatch.tsx:65` |

## 8. UNRESOLVED

- Identitas lintas peran (`ct-*` vs `mo-*`) menyatu di **M11** (unifikasi identitas), belum sekarang.
- Pembuatan akun kurir inhouse oleh merchant menunggu auth nyata (di luar repo mock).

## 9. Bukti

- Kode: `src/pages/CourierBatch.tsx`, `src/pages/CourierTaskDetail.tsx`, `src/store/slices/courierSlice.ts`, `src/data/courier.ts` (checkpoint + OTP), `src/data/courierWallet.ts`, `src/data/courierBatch.ts:40-81`.
- Self-check: `scripts/courier-batch-check.mjs`, `scripts/courier-wallet-check.mjs`.
- Flow: `docs/design/flows/f13-courier-view/`, `f25-batch-lifecycle`.
