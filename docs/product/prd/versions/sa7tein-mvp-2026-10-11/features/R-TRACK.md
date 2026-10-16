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
| AC1 | Peta customer menampilkan posisi kurir **yang bergerak** selama tahap diantar | posisi marker berubah antar dua waktu; nilai turunan `courierPositionAt()` | ⚠️ pin ada tapi statis (`useLeafletMap` mode `delivery`) |
| AC2 | Peta merchant menampilkan posisi kurir untuk order yang sedang diantar | peta di konsol merchant / detail order | ❌ konsol merchant hanya `JourneyLine` |
| AC3 | Notifikasi "kurir hampir sampai" muncul saat **ambang** terlewati, ambang = konfigurasi ops | ambang konstanta bertanda ops + `almostArrived()`; assert 2 sisi ambang | ❌ label tidak ada di kode |
| AC4 | ETA per order memperhitungkan urutan antar dalam batch | ETA order ke-2 > order ke-1; `etaForStop()` | ⚠️ hanya teks statis dari `mockOrder` |
| AC5 | Tidak ada siaran lokasi saat delivery tidak aktif | `tracksLocation(stage)`; assert stage non-diantar = false | ❌ belum ada |

## 4. State & layar

- Customer: `OrderStageScreen` (`#order-map`, mode `delivery`) — pin kurir + kartu tahap.
- Kurir: `/courier/batch` (peta rute `stops`) + halaman tugas per order.
- Merchant: belum ada peta; hanya `JourneyLine`.
- Ambang ops: satu nilai, ditandai sebagai **konfigurasi ops** sampai panel ops (M10) berdiri.

## 5. Data & kontrak BE

- Event PRD: `courier_location`, `courier_almost_arrived`.
- Kontrak: ambang notif = config ops (aplikasi internal).
- Batasan teknis: ETA tak boleh diambil dari cache matriks waktu tempuh (T5).

## 6. Yang belum (blocked)

- GPS perangkat kurir nyata (BE + izin lokasi) — demo memakai posisi mock sepanjang rute batch.
- Panel ops untuk **mengubah** ambang (M10, `R-OPS`); sampai itu, ambang = konstanta bertanda.
- Peta merchant (AC2) baru punya data kalau batch/assignment demo berjalan.

## 7. UNRESOLVED

- **Angka ambang** "kurir hampir sampai" — ditentukan ops, belum ada (§9.7).
- **Cara menyiarkan ETA**: PRD sendiri menulis "perlu ditinjau di desain teknis" (§9.7).
- Interval siaran lokasi (berapa detik) — tidak disebut PRD.

## 8. Bukti

- Kode saat ini: `src/hooks/useLeafletMap.ts` (mode `preview|delivery|picker|stops`; pin kurir dibuat sekali), `src/hooks/leafletHelpers.ts` (`COURIER`, `drawBatchRoute`), `src/components/OrderStageScreen.tsx:262`, `src/data/order-stage-copy.ts`.
- Flow: `docs/design/flows/f13-courier-view/` (status `partial`; node `berangkat` = "lokasi live mulai", `tiba` = "notif hampir sampai").
