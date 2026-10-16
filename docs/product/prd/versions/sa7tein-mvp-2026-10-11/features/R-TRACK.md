# R-TRACK — Lokasi live kurir + notifikasi hampir sampai

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §9.7, §12 (COU-06), §22.1 L1, §19 · flow `f13-courier-view` · milestone **M7**.
Status: partial · terakhir ditinjau: 2026-10-16.

## 1. Untuk apa

Customer dan merchant berhak tahu kurir sudah di mana, tanpa menelepon. Pelacakan juga menentukan kapan notifikasi "kurir hampir sampai" layak dikirim, karena ETA order dalam batch bergantung pada urutan antar.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| T1 | Lokasi kurir dibagikan **realtime selama delivery aktif** ke customer terkait **dan merchant** | §9.7, COU-06 |
| T2 | Batasan PWA yang diterima: lokasi hanya andal saat **app kurir terbuka dan layar menyala** | §9.7, L1 |
| T3 | Notifikasi "kurir hampir sampai" berbasis **waktu**; ambangnya di-setup **aplikator lewat aplikasi internal** (ops) | §9.7 |
| T4 | Usulan: **ETA per order dalam batch memperhitungkan urutan** (order ke-3 menunggu dua tujuan sebelumnya) | §9.7 |
| T5 | Waktu tempuh dari Routes API **tidak boleh disimpan** untuk dipakai ulang | §9.7 + R4 |
| T6 | Pelacakan berhenti saat delivery tidak aktif (tidak ada siaran lokasi setelah order selesai) | §9.7 ("selama delivery aktif") |

## 3. Acceptance (cara ukur)

| AC | Perilaku | Cara ukur | Status |
|---|---|---|---|
| AC1 | Peta customer menampilkan posisi kurir **yang bergerak** selama tahap diantar | `useCourierTracking` menggeser marker tiap tick; `positionAlong()` diuji di `scripts/tracking-check.mjs` | ✅ pin bergerak (satu marker, `setLatLng`) |
| AC2 | Peta merchant menampilkan posisi kurir untuk order yang sedang diantar | peta di konsol merchant / detail order | ❌ konsol merchant hanya `JourneyLine` |
| AC3 | Notifikasi "kurir hampir sampai" muncul saat **ambang** terlewati, ambang = konfigurasi ops | `ALMOST_ARRIVED_MINUTES` bertanda ops + `almostArrived()`; assert 2 sisi ambang; label berganti + `role="status"` | ✅ label + ambang bertanda ops (kanal kirim = R-NOTIF) |
| AC4 | ETA per order memperhitungkan urutan antar dalam batch | ETA order ke-2 > order ke-1 | ⚠️ ETA sisa dinamis ada; per-urutan batch belum bisa dipetakan (id batch `ct-*` ≠ id order `api-*`) |
| AC5 | Tidak ada siaran lokasi saat delivery tidak aktif | `tracksLocation(stage)`; assert stage non-diantar = false | ✅ diuji (`diantar`/`tiba` = true, sisanya false) |

## 4. State & layar

- Customer: `OrderStageScreen` (`#order-map`, mode `delivery`) — pin kurir + kartu tahap.
- Kurir: `/courier/batch` (peta rute `stops`) + halaman tugas per order.
- Merchant: belum ada peta; hanya `JourneyLine`.
- Ambang ops: satu nilai (`ALMOST_ARRIVED_MINUTES`, `ALMOST_ARRIVED_CONFIGURABLE = false`), ditandai sebagai **konfigurasi ops** sampai panel ops (M10) berdiri.

## 5. Data & kontrak BE

- Event PRD: `courier_location`, `courier_almost_arrived`.
- Kontrak: ambang notif = config ops (aplikasi internal).
- Batasan teknis: ETA tak boleh diambil dari cache matriks waktu tempuh (T5).

## 6. Yang belum (blocked)

- GPS perangkat kurir nyata (BE + izin lokasi) — demo memakai posisi mock sepanjang rute batch.
- Panel ops untuk **mengubah** ambang (M10, `R-OPS`); sampai itu, ambang = konstanta bertanda.
- Peta merchant (AC2) baru punya data kalau batch/assignment demo berjalan.
- ETA **per urutan batch** (AC4): id tugas batch (`ct-*`) tidak bergabung dengan id order (`api-*`), jadi order customer belum bisa dipetakan ke indeks henti. Butuh id bersama dari BE (`orders` ↔ `batches`).

## 7. UNRESOLVED

- **Angka ambang** "kurir hampir sampai" — ditentukan ops, belum ada (§9.7).
- **Cara menyiarkan ETA**: PRD sendiri menulis "perlu ditinjau di desain teknis" (§9.7).
- Interval siaran lokasi (berapa detik) — tidak disebut PRD.

## 8. Bukti

- Kode: `src/data/tracking.ts` (aturan murni: `tracksLocation`, `ALMOST_ARRIVED_MINUTES` bertanda ops, `almostArrived`, `travelProgress`, `etaMinutesRemaining`, `positionAlong`, `walkMinutes`, `etaCopy`), `src/hooks/useCourierTracking.ts` (tick mock 1 menit/4 detik), `src/hooks/useLeafletMap.ts` (opsi `courier` → `setLatLng`, peta tidak dibangun ulang), `src/lib/leaflet-draw.ts` (`COURIER`, `drawBatchRoute`, `drawOrderMap`; pindah dari `src/hooks/leafletHelpers.ts` agar patuh batas 150 baris `src/hooks/`), `src/components/OrderStatusPanel.tsx`, `src/components/OrderStageScreen.tsx`.
- Self-check: `node --import ./scripts/lib/ts-resolve.mjs scripts/tracking-check.mjs` (lokasi per tahap, dua sisi ambang, kemajuan terkurung, posisi di ujung rute).
- Flow: `docs/design/flows/f13-courier-view/` (status `partial`; node `berangkat` = "lokasi live mulai", `tiba` = "notif hampir sampai"). Pin bergerak juga diukur di Chromium (lihat "Status UI" di README flow).
