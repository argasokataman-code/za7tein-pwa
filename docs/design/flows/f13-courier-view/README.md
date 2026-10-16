# F13 — Tugas kurir inhouse (sisi pengantaran)

Workflow sisi kurir **inhouse** pada PRD aktif `sa7tein-mvp-2026-10-11`: tugas datang **per batch**, order dikerjakan **satu per satu** (checkpoint), lokasi dipantau **live**, fee Regular online masuk **DANA**. Milestone **M4/M5**; rencana & keputusan implementasi ada di `docs/plan-courier.md` (K0–K5) — spec ini sumber gambaran alurnya. Pasangan sisi merchant: `f25-batch-lifecycle`.

| Berkas | Isi |
|---|---|
| `f13-courier-view.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f13-courier-view.html` | Artefak jadi |
| `f13-courier-view.visual-check.*` | Bukti visual-check (gitignored) |

## Alur

**Lane Tugas & ambil:** tugas **batch** masuk (satu kurir per batch, BR-B07) → kurir tap **"Ambil"** per order (checkpoint, COU-13) → tap **"Berangkat"**: lokasi live mulai dipublikasikan (R-TRACK).

**Lane Perjalanan:** lokasi kurir realtime (`courier_location`) → tap **"Tiba"** memicu notifikasi **"kurir hampir sampai"** (`courier_almost_arrived`). Cabang gagal: customer tidak menerima → masalah order ke **CS**, bukan aksi kurir.

**Lane Serah terima:** verifikasi serah terima → **order selesai** (`order_completed`) → **fee Regular online masuk DANA kurir**. Order berikutnya dalam batch lanjut dari "Ambil".

## Aturan keras

- **Per batch, bukan per order.** Satu kurir inhouse ditunjuk untuk satu batch dan menerima **tanpa tolak** (BR-B07, COU-12); order diselesaikan **satu per satu** (COU-13).
- **Urutan antar dari auto-sort batch** (BR-B12); ETA per order memperhitungkan urutan itu.
- **Fee pindah penerima.** Fee Regular online → **DANA kurir** saat order selesai; Regular **COD dibayar merchant di luar aplikasi** (`deliveryFeeIdr = 0`) — bukan lagi `ongkirIdr` 100% merchant (C-07, R-DELIV-FEE).
- **Lokasi live, bukan snapshot.** R-TRACK menggantikan model checkpoint+snapshot lama; **batasan PWA**: hanya andal saat app kurir terbuka dan layar menyala. Notifikasi "hampir sampai" berbasis waktu, ambangnya config ops (belum ada).
- Notif customer = mock tapi tersambung (AGENTS.md §1, R-PUSH-01) — bukan klaim kirim Web Push sungguhan. Emit "hampir sampai" dipisah ke `useAlmostArrivedNotice` supaya konsol merchant (yang memakai pelacakan sama) tidak ikut mengirim notif milik customer.

## Status UI (R-TRACK, M7)

- **Pin kurir bergerak.** Sisi customer (`OrderStageScreen`, `#order-map` mode `delivery`) memakai opsi `courier` di `useLeafletMap`: satu marker, digeser `setLatLng` tiap tick — peta tidak dibangun ulang. Di demo posisinya diturunkan **waktu tempuh** (`useCourierTracking`, 1 tick = 1 menit mock), bukan event `courier_location` yang belum ada.
- **Hampir sampai.** Ambang berbasis **waktu** (`ALMOST_ARRIVED_MINUTES` = 5) bertanda konfigurasi ops; sudah terlewati → label berganti "Kurir hampir sampai" + `role="status"`. Panel ops untuk mengubahnya (M10) belum ada, dan itu ditulis di baris ETA.
- **Siaran berhenti di luar delivery.** `tracksLocation()` hanya benar untuk `diantar`/`tiba` (§9.7 "selama delivery aktif").
- **Sisi merchant ikut melihat kurir (AC2).** Sheet detail order di `/merchant/orders` memasang `MerchantCourierMap` untuk order `diantar`/`tiba` — peta + baris ETA memakai **aturan yang sama** (`useCourierTracking`, ambang ops yang sama), jadi merchant dan customer tak bisa melihat kurir di tempat berbeda. Notifikasi "hampir sampai" sengaja **tidak** dipancarkan dari konsol merchant (`useAlmostArrivedNotice` hanya dipakai sisi customer).
- **Belum:** ETA per urutan batch (AC4 — id batch `ct-*` belum bergabung dengan id order `api-*`), GPS perangkat nyata.


## Terhubung (lihat `../INDEX.json`)

`f25-batch-lifecycle:assign → f13-courier-view:masuk` (`batch_assigned`); `f13:selesai → f25:fee_dana` (`order_completed`); `f13:selesai → f14-chat-order:courierjoin` (chat order).

## Sumber (jangan dikarang)

- PRD `sa7tein-mvp-2026-10-11` §7.2, §9.2, §9.7, §12 (COU-06, COU-11..13) — `analysis.md` baris 34–40 · Milestone **M4/M5** — `versions/sa7tein-mvp-2026-10-11/milestones.md`
- Implementasi: `src/pages/CourierTaskDetail.tsx`, `src/data/courier.ts` (`COURIER_STEPS`), `src/api/orders.ts` (`recordCheckpoint`, `verifyOrderOtp`), `src/data/courierWallet.ts`
- **UNRESOLVED (jangan ditebak):** OTP tidak disebut di alur baru PRD aktif (`analysis.md` C-11) padahal implementasi masih memakainya; nasib timer SLA lama (`COURIER_SLA_MINUTES`) belum diputuskan; ambang notifikasi "hampir sampai" = config ops.
- **UNRESOLVED-by-absence:** layar kurir untuk melaporkan masalah order (BR-B10, keluhan/tidak menerima) belum ada di PRD aktif.

## Catatan revisi

Spec ini sebelumnya menggambarkan revisi **superseded** `irbid-mvp-v2-2026-09-21` (4 checkpoint + SLA timer + `hold_settled`, kurir "tips only" C-06). Basisnya kini diikat ke `sa7tein-mvp-2026-10-11`; istilah `hold_settled`/"hold cut" sudah keluar dari alur aktif.

## Update

```bash
ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  ./scripts/flows-gate.sh f13-courier-view   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate 0 error; deliver exit 0; visual-check pass 4 viewport (light + dark).
