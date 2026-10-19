# R-COU-DISPATCH — Penjadwalan kurir mitra untuk Quick

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §9.4 (**usulan**), §13 OPS-13, §22.2 R5 · flow `f26-quick-dispatch` · milestone **M6**.
Status: blocked · terakhir ditinjau: 2026-10-19.

## 1. Untuk apa

Saat merchant menerima order Quick, aplikator harus memilih **satu** kurir mitra yang layak. Tanpa aturan ini, Quick hanya bisa jalan manual dan tidak bisa dijanjikan. PRD menuliskan algoritmanya sebagai **usulan** (OPEN-11 masih terbuka), jadi UI dibangun terhadap mock dan jalur nyatanya ditahan.

## 2. Aturan (usulan PRD, bukan keputusan final)

| # | Aturan | Sumber |
|---|---|---|
| D1 | Kandidat diambil dari **antrean giliran**: online terlama menunggu lebih dulu | §9.4 |
| D2 | Ada **batas jarak** kurir ke merchant | §9.4 |
| D3 | Tie-break: **jumlah order selesai hari ini** lalu **jarak terdekat** | §9.4 |
| D4 | Kandidat harus: online, tidak busy, tidak suspend, **lokasi masih segar** | §9.4 |
| D5 | Tak ada kandidat dalam batas → **Quick tak tersedia** | §9.4 |
| D6 | Ambang jarak + kesegaran lokasi = **config ops**, bukan konstanta FE | §13 OPS-13 |

## 3. Aktor & permukaan

- **Ops** — menyetel parameter dispatch + memantau antrean.
- **Merchant** — memicu dispatch (tombol ditahan selama flag `false`).
- **Kurir mitra** — menerima assignment (lihat R-COU-PARTNER).

## 4. Masukan → keluaran

- Masuk: order Quick + daftar kurir mitra (status, lokasi, `completedToday`, `lastLocationAt`) + parameter ops.
- Keluar: assignment `pending` ke satu kandidat + status kandidat `reserved`.

## 5. State UI

| State | Tampilan |
|---|---|
| Quick tak tersedia | notice + tombol dispatch nonaktif |
| kandidat ada | assignment terkirim (mock) |
| flag jalur mati | `PlatformNotice` menyatakan assignment demo |

## 6. Kontrak BE (handoff, repo ini mock)

- RPC `dispatch_courier(p_order_id)`: pilih kandidat (idle terlama + batas jarak; tie-break `completed_today` lalu jarak), set `reserved`, insert assignment `pending`.
- Parameter `platform_config`: `dispatch_max_kms`, `location_freshness_seconds`, `quick_fee_multiplier` (OPS-13).
- Detail: `docs/integration/courier-partner/be-contract.md` §1.5, §2.

## 7. Acceptance (terukur)

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Kandidat = online, tidak busy, tidak suspend | filter kandidat | ⚠️ filter parsial: `busy`/`reserved` dibuang (`MerchantOrders.tsx:240`); `offline` dan status suspend belum disaring — urutan/ambang tetap OPEN-11 |
| AC2 | Idle terlama didahulukan | urut by waktu tunggu | ❌ tidak ada |
| AC3 | Batas jarak diterapkan | banding jarak vs `dispatch_max_kms` | ❌ tidak ada |
| AC4 | Tie-break `completedToday` lalu jarak | urutan deterministik | ❌ tidak ada |
| AC5 | Lokasi segar (ambang ops) | `lastLocationAt` vs ambang | ❌ tidak ada |
| AC6 | Tanpa kandidat → Quick tak tersedia | pesan + jalur nonaktif | ⚠️ flag `QUICK_DISPATCH_AVAILABLE=true` (`src/data/marketplace.ts`) membuka pilihan Quick; **pemilihan kandidat** belum dievaluasi (OPEN-11), jadi tidak ada cabang "tanpa kandidat" |
| AC7 | Assignment terkirim ke mitra terpilih | `sendAssignment` dipanggil dispatch nyata | ❌ mock; `sendAssignment` hanya ada di slice (baris `dispatch_assignments` ditulis saat mitra merespons, OPEN-11) |
| AC8 | UI jujur menyatakan jalur belum ada | `PlatformNotice` di layar mitra | ✅ `src/pages/CourierPartner.tsx:122` (menyebut OPEN-11 + penerbit SP UNRESOLVED, bukan memura-purakan dispatch nyata) |

## 8. UNRESOLVED

- **OPEN-11**: algoritma dispatch masih **usulan**; jangan diimplementasikan sebagai keputusan final.
- Angka `dispatch_max_kms` / `location_freshness_seconds` / `quick_fee_multiplier` belum ada (config ops).
- Sumber lokasi kurir mitra (M7 realtime) belum ada, padahal D4 butuh kesegaran lokasi.

## 9. Bukti

- Kode: `src/pages/CourierPartner.tsx:102`, `src/store/slices/partnerSlice.ts:31-41` (`sendAssignment`), `src/data/marketplace.ts` (`QUICK_DISPATCH_AVAILABLE`).
- Kontrak BE: `docs/integration/courier-partner/be-contract.md` §1.5, §2, §5.
- Flow: `docs/design/flows/f26-quick-dispatch/`.
