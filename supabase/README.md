# Supabase — pengirim push yang selalu hidup

Repo front-end ini tak punya server sendiri (AGENTS §1). Agar notifikasi tetap
masuk saat aplikasi/ponsel tidak aktif, pengirimannya dijalankan di sisi Supabase:

```
notifications INSERT ──(Database Webhook)──▶ Edge Function send-push ──(VAPID)──▶ FCM ──▶ perangkat
```

- **Pemicu** = Database Webhook pada tabel `public.notifications`, event `Insert`.
  Aplikasi sudah menulis baris `notifications` pada tiap transisi order
  (`src/api/reference.ts`), jadi begitu ada notifikasi baru, push ikut terkirim —
  tanpa polling, tanpa laptop menyala.
- **Pengirim** = Edge Function `send-push` (`supabase/functions/send-push/index.ts`).
  Membaca `push_subscriptions` milik `notifications.user_id`, menandatangani
  payload dengan kunci VAPID, mengantar, lalu menghapus langganan kedaluwarsa
  (404/410).
- **Isi notifikasi** = judul/isi baris `notifications`. Tautan klik mengikuti
  `audience` (customer → beranda, merchant → konsol, courier → tugas, cs → panel).

## Deploy (sekali)

```bash
# 1. Sambungkan ke project (butuh akses pemilik project)
supabase link --project-ref dwzxtnfesmpobnepilhl

# 2. Rahasia VAPID (kunci privat TIDAK pernah masuk repo)
supabase secrets set \
  VAPID_PUBLIC_KEY=BKWCaAXObPvPcOI3H-TgixCL6ngktR2x3saHoc9S6I_bpPjvEmdloL--Vo62cYKmDFbk9GjYiQ2e-8bpjtC_pvA \
  VAPID_PRIVATE_KEY=<dari .env.local> \
  VAPID_SUBJECT=mailto:support@sa7tein.app

# 3. Deploy function
npm run push:deploy          # = supabase functions deploy send-push
```

`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` disuntik platform otomatis.

> Kunci VAPID di atas = pasangan demo repo. **Ganti untuk produksi** dan samakan
> dengan `VITE_VAPID_PUBLIC_KEY` yang dipakai klien (`src/api/push.ts`).

## Pasang webhook (Dashboard)

1. Dashboard → **Database Webhooks** → *Create a new hook*.
2. Table: `public.notifications`, Events: centang **Insert**.
3. Type: **Supabase Edge Function** → pilih `send-push`, method `POST`.
4. Headers → *Add auth header with service key* (Authorization: Bearer
   `service_role`), biarkan `Content-type: application/json`.

Edge Function default `verify_jwt = true`, dan webhook mengirim service-role JWT —
jadi hanya pemanggil ber-jwt valid yang bisa memicunya.

## Uji

```bash
# sisipkan notifikasi → webhook memanggil function → push terkirim
# (atau pakai skrip lokal untuk pengujian tanpa cloud)
npm run push:send -- --title "Pesanan siap" --body "Sate Ayam sedang dimasak" --url /customer/orders
```

`scripts/send-push.mjs` tetap ada sebagai **pengirim lokal dev** (membaca
`.env.local`) untuk uji cepat tanpa deploy — pakai jalur produksi di atas untuk
yang selalu hidup.

## Catatan runtime

Function memakai `npm:web-push@3.6.7` (sama dengan pengirim lokal). Bila runtime
Edge menolak crypto-nya di versi Deno tertentu (gejala: `Invalid PEM label` atau
`Argument 2 is not of type CryptoKey`), ganti impor ke pustaka Deno-native
`jsr:@negrel/webpush` — API-nya beda sedikit (`ApplicationServer.new` +
`PushSubscriber`), sisanya alur tetap sama. Kunci VAPID harus pasangan yang sama
dengan `VITE_VAPID_PUBLIC_KEY` di klien.
