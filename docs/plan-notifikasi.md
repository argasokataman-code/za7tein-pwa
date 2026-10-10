# Plan — Notifikasi (Emit + Inbox Per Peran)

Front-end showcase. Data mock, Redux; **baca live** dari PostgREST `notifications`,
**emit best-effort** (POST) saat transisi order, fallback mock bila API mati.
Sumber: flow `f11-push-notification` (+ `f1-order-lifecycle`, `f8-dispute`),
R-PUSH-01 / C-18, PRD aktif `irbid-mvp-v2-2026-09-21`.

**Status: N0–N4 rencana.** Web Push asli (service worker, `PushManager`,
`POST /push/subscriptions`) **tetap di luar scope** — repo ini tak punya SW push
(AGENTS §1, R-PUSH-01 M8). Milestone ini mengurus **inbox + emit data**, bukan
pengiriman ke perangkat.

## Prinsip

- **Baca audience-aware**: satu inbox, difilter `audience` sesuai peran aktif
  (`customer`/`merchant`/`courier`/`cs`) — bukan satu daftar global.
- **Emit best-effort**: pemanggil `.catch(() => {})`; UI tidak menunggu jaringan.
  Tulis butuh sesi auth (RLS menolak anon 401), jadi memakai sesi `cs@`
  (`refToken`) — sudah pola `reference.ts`.
- **Kind jujur**: tambah `courier` ke `NotificationKind` (BE mengirim `courier`;
  sebelumnya jatuh ke `system` → ikon salah).
- **Satu sumber judul**: katalog event terpusat, bukan string tersebar di JSX.
- **Persist `read`**: `markRead`/`markAllRead` menulis balik `notifications.read`.
- Tanpa dependency baru. Batas baris `.rules.json`: hook ≤150, data ≤500,
  component ≤600, page ≤700, style ≤600.

## Katalog event (emit → audience/kind/judul)

| Event order | audience | kind | judul |
|---|---|---|---|
| Order dibuat (checkout) | merchant | order | Order baru masuk |
| Customer bayar (VA/QRIS/transfer) | customer | payment | Pembayaran diterima |
| Merchant terima | customer | order | Pesanan sedang dimasak |
| Merchant tolak | customer | order | Pesanan ditolak |
| Merchant siap | customer | order | Pesanan siap diantar |
| Merchant serah ke kurir (diantar) | customer | order | Kurir menuju lokasimu |
| Merchant serahkan / batch siap | merchant | order | Batch siap diantar |
| Merchant batal | customer | order | Pesanan dibatalkan |
| Assign kurir | courier | courier | Tugas baru |
| Kurir ambil | customer | order | Kurir sedang mengambil pesanan |
| Kurir berangkat | customer | order | Kurir menuju lokasimu |
| Kurir tiba | customer | order | Kurir sudah sampai |
| Kurir batal | customer | order | Pesanan dibatalkan |
| OTP kurir (selesai) | customer | order | Pesanan selesai |
| OTP customer (selesai) | merchant | order | Pesanan selesai |
| Sengketa diajukan | cs | order | Sengketa baru diajukan |

## Milestone

### N0 — Fondasi tulis + kind + audience (done bila build hijau)
- `src/api/supabase.ts` — `createWith(token, table, body)`: POST token eksplisit
  (varian `create` untuk sesi reference).
- `src/api/reference.ts` — ekspor `refToken`; `fetchNotifications(audience)` +
  `NOTIF_KIND` tambah `courier`.
- `src/api/notifications.ts` (baru) — `insertNotification({audience,kind,title,body})`,
  `markNotificationRead(id)`, `markAllNotificationsRead(audience)`
  (id lokal `ntf-<n>` → hanya PATCH yang numerik), konstanta `AUDIENCE_USER`.
- `src/types.ts` — `NotificationKind` += `courier`.

### N1 — Emit journey order (semua transisi)
Tempel `void insertNotification(...).catch(() => {})` di tiap handler yang
mengubah status:
- `PaymentAmount.tsx` (order dibuat → merchant), `MerchantOrders.tsx`
  (terima/tolak/siap/serahkan/batal/assign/setCookMinutes),
  `CourierTaskDetail.tsx` (advance/ambil/berangkat/OTP/batal),
  `OrderStageScreen.tsx` (OTP customer selesai, advance mock).
- `CourierTaskDetail.tsx` yang tadinya `pushNotification` lokal → ganti
  `insertNotification` (agar terlihat lintas peran + tersimpan).

### N2 — Inbox per peran (audience-aware)
- `useApiNotifications(audience)` — audience dari peran aktif (`roleFromPath`).
- Rute `/notifications` + `/notification-settings` untuk merchant, courier,
  admin (reuse `Notifications`/`NotificationSettings`).
- Lonceng + badge di header beranda tiap peran (`selectUnreadCount`).
- `Notifications.tsx` — `KIND_ICON` tambah `courier`; teks audience-aware.

### N3 — Persist `read`
- `notificationsSlice` `markRead`/`markAllRead` memicu PATCH (thunk/efek),
  optimistic: UI berubah dulu, PATCH `.catch(() => {})`.

### N4 — Verifikasi & dokumen
- `npm run scan` 0 FAIL; `./scripts/verify.sh` hijau.
- Gerbang browser rute inbox tiap peran (390/1440, `--strict`).
- `./scripts/flows-gate.sh f11-push-notification` (+ `f1-order-lifecycle` bila
  menyentuh kontrak order); update flow + PRD + `Documentation.tsx` di commit.
