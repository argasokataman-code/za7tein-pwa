# R-NOTIF — In-app + web push per peran

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §20.3, §10 (CUS-29), §11 (MER-23), §12 (COU-10), §19 · flow `f11-push-notification` · milestone **M7**.
Status: partial · terakhir ditinjau: 2026-10-16.

## 1. Untuk apa

Perubahan status order harus sampai ke pihak yang berkepentingan tanpa harus membuka aplikasi berkali-kali. Inbox in-app jadi catatan yang bisa dibuka lagi; web push mengejar saat aplikasi tertutup.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| N1 | Kanal: **event realtime in-app + web push** | §20.3 |
| N2 | Di iOS web push hanya berfungsi bila PWA **di-install** ke home screen (batasan diterima) | §20.3, L2 |
| N3 | Customer menerima: setiap perubahan status order, kurir hampir sampai, program marketing baru dari aplikator, merchant baru yang meng-cover alamat default | §20.3, CUS-29 |
| N4 | Merchant & kurir: daftar minimal — order baru, pembatalan, minta mulai lebih awal, hitung mundur batch, pesan chat, dispute, payout, kuota menipis/habis, moderasi tag (merchant); assignment, batch, SP, payout (kurir) — **Usulan** | §20.3, MER-23, COU-10 |
| N5 | Audience notifikasi: `customer` / `merchant` / `courier` / `cs` | BRS `notif-order-e2e` (proposed), `analysis.md:45` |
| N6 | Payload/event ber-version | `analysis.md:45` |

## 3. Acceptance (cara ukur)

| AC | Perilaku | Cara ukur | Status |
|---|---|---|---|
| AC1 | Inbox per peran (bell + daftar) hanya menampilkan audience miliknya | `notificationsFor()` + `notifVisibleTo()`; assert silang peran di `scripts/notif-check.mjs` | ✅ penjaga di klien, di atas filter query BE |
| AC2 | Badge jumlah belum dibaca akurat dan persist antar sesi | `selectUnreadCount` + baca ulang setelah reload | ⚠️ ada; persist lewat BE |
| AC3 | Web push benar-benar terkirim ke perangkat kurir/customer | langganan `PushManager` + SW `push` handler | ⚠️ jalur ada (`api/push.ts`, `public/push-sw.js`); pengiriman masih manual/script |
| AC4 | "Kurir hampir sampai" memakai **ambang ops** | satu sumber ambang bertanda ops, dipakai notif & R-TRACK | ✅ `NOTIF_EMIT.courier_almost_arrived` memakai `ALMOST_ARRIVED_MINUTES` yang sama; diuji `notif-check` |
| AC5 | Keempat kanal daftar customer (§20.3) masing-masing punya jalur emit | `NOTIF_EMIT` + penanda `emit: fe\|be`; assert tiap jenis punya pemetaan | ⚠️ 2 dari 4 punya pemanggil di repo (`order_status`, `courier_almost_arrived`); promo & toko-baru = job BE, ditandai `emit: 'be'` |

## 4. State & layar

- Inbox: `src/pages/Notifications.tsx`, baris `components/ui/NotificationRow.tsx`, badge `components/ui/NotificationBell.tsx`.
- Preferensi: `src/pages/NotificationSettings.tsx` (sakelar push hanya produksi).
- Bentuk data: `AppNotification` (+ kolom `audience`), `NotificationKind`, `NotifAudience`, `PushSubscriptionRecord` (`src/types.ts`).
- Katalog emit + penjaga audience: `src/data/notif.ts` (fungsi murni, diuji `scripts/notif-check.mjs`).
- Seed mock app-side kosong (data datang dari BE `notifications`, yang kini juga mengirim kolom `audience`).

## 5. Data & kontrak BE

- Emit per audience + push fan-out per `user_id` sudah ada di BE demo; `POST /push/subscriptions` untuk langganan.
- Plan lama: `docs/plan-notifikasi.md` N0–N5 (basisnya revisi **lama** `irbid-mvp-v2-2026-09-21`; perlu dirujuk ulang ke revisi aktif).
- Matriks per transisi ada di BRS `notif-order-e2e-2026-10-11` (**proposed**), bukan di PRD aktif — jangan diperlakukan sebagai requirement aktif.

## 6. Yang belum (blocked)

- Pengiriman push otomatis dari BE (bukan script manual).
- **Mengubah** ambang "kurir hampir sampai" dari panel ops (`R-OPS`, M10); nilainya kini konstanta bertanda di `src/data/tracking.ts` dan sudah dipakai bersama R-TRACK.
- Jalur emit promo baru + toko baru menjangkau alamat default: dua-duanya job BE (butuh data lintas pengguna), ditandai `emit: 'be'` di katalog.

## 7. UNRESOLVED

- **Kanal final**: push saja, atau push + fallback WA/SMS untuk langkah kritis (BRS `notif-order-e2e` §89–97).
- **SLA & pemilik alert CS**, ambang "tolak berulang", window cancel sesudah match — semuanya di BRS proposed, bukan PRD aktif.
- Retensi & sifat notifikasi (notifikasi saja vs flag/state order).

## 8. Bukti

- Katalog + penjaga: `src/data/notif.ts` (`NOTIF_EMIT` empat kanal §20.3 dengan penanda `emit: fe|be` + baris sumber, `notifAudienceOf`, `notifVisibleTo`, `notificationsFor`); self-check `node --import ./scripts/lib/ts-resolve.mjs scripts/notif-check.mjs` (katalog lengkap, ambang = R-TRACK, silang peran, siaran `all`, nilai mentah tak dikenal → `undefined`).
- Kolom `audience` kini ikut dibaca: `src/api/reference.ts` (`toNotification`, `select=...,audience`); tipe `AppNotification.audience` di `src/types.ts`; penjaga dipakai di `src/pages/Notifications.tsx`.
- Emit "kurir hampir sampai": `src/hooks/useCourierTracking.ts` (sekali per pengantaran, ambang sama dengan label R-TRACK).
- Komentar usang "repo tak punya SW push" **diperbaiki** di `src/types.ts` + `src/data/notifications.ts`; service workernya memang ada (`public/push-sw.js`, di-`importScripts` di `vite.config.ts`).
- Kode lama: `src/store/slices/notificationsSlice.ts`, `src/hooks/useApiNotifications.ts`, `src/api/notifications.ts`, `src/api/realtime.ts`, `src/api/push.ts`, `supabase/functions/send-push/`.
- Flow: `docs/design/flows/f11-push-notification/` (status `done`), `f24-cs-problem` (basis BRS proposed).
