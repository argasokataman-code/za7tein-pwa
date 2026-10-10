# HANDOFF — hidupkan push notification otomatis (untuk BE)

Dokumen ini buat **siapa pun yang memegang akses backend Supabase**. Tujuan: dari
"pengirim manual" jadi "pengirim selalu hidup". Ikuti urut. Total ±10 menit.

---

## 0. Ringkasan (baca ini dulu)

```
aplikasi tulis baris notifications
        │
        ▼
Database Webhook (tabel notifications, event Insert)
        │  POST + Authorization: Bearer <service_role>
        ▼
Edge Function  send-push
        │  1. ambil push_subscriptions WHERE user_id = notifications.user_id
        │  2. tanda tangan VAPID, kirim payload {title, body, url, tag} lewat web-push
        │  3. hapus langganan mati (HTTP 404/410)
        ▼
FCM (push service) ──▶ perangkat (notif masuk walau app/ponsel tidak aktif)
```

Semua kode sudah ada di repo. **Yang belum: deploy Function + pasang webhook +
set secret.** Itu satu-satunya pekerjaan BE.

| Bahan | Lokasi di repo | Status |
|---|---|---|
| Function | `supabase/functions/send-push/index.ts` | ✅ ada |
| Perintah deploy | `npm run push:deploy` | ✅ ada |
| Tabel `push_subscriptions` | Supabase (sudah dipakai klien) | ✅ ada |
| Tabel `notifications` | Supabase | ✅ ada |
| Secret VAPID | **belum di-set di server** | ❌ tugas kamu |
| Webhook | **belum dipasang** | ❌ tugas kamu |

**Tidak ada migrasi DB. Tidak ada perubahan RLS.**

---

## 1. Prasyarat

- Akses **pemilik** project Supabase `dwzxtnfesmpobnepilhl` (atau Personal Access Token).
- Supabase CLI (`supabase --version` — repo ini dites di `2.109.0`).
- Node 20+ (skrip lokal opsional).

> ⚠️ Akun CLI yang sedang login di mesin pengembang **bukan** pemilik project ini
> (`supabase projects list` tidak memuat ref di atas). Kalau bukan pemilik, minta
> token ke pemilik, jangan coba-coba pakai project lain.

---

## 2. Langkah 1 — Link project

```bash
supabase link --project-ref dwzxtnfesmpobnepilhl
```

Kalau muncul `Cannot find project ref. Have you run supabase link?` → berarti
belum link / akun salah. Ulangi setelah `supabase login`.

---

## 3. Langkah 2 — Siapkan kunci VAPID

Ada dua pilihan. **Pilih satu, jangan campur.**

### Opsi A — pakai pasangan demo repo (paling cepat, langsung nyambung)
- Kunci **publik**: `BKWCaAXObPvPcOI3H-TgixCL6ngktR2x3saHoc9S6I_bpPjvEmdloL--Vo62cYKmDFbk9GjYiQ2e-8bpjtC_pvA`
- Kunci **privat**: ada di berkas `.env.local` repo (di-.gitignore, **tidak ikut commit**).
  Minta ke pemilik repo. Kalau `.env.local` hilang → pakai Opsi B.
- Klien sudah memakai kunci publik ini (`src/api/push.ts`), jadi **tidak perlu**
  ubah/rebuild front-end.

### Opsi B — generate pasangan baru
```bash
npx web-push generate-vapid-keys
# tampilkan: Public Key = ...   Private Key = ...
```
- Simpan private key **hanya** sebagai secret server.
- ⚠️ **Konsekuensi:** kunci publik klien harus diganti ke nilai baru
  (`VITE_VAPID_PUBLIC_KEY` / default di `src/api/push.ts`) **lalu front-end build
  ulang & deploy**. Kalau tidak, semua `push_subscriptions` lama jadi tak valid dan
  user harus menyalakan sakelar push lagi (langganan baru).
- Oper nilai `Public Key` baru ke tim front-end.

---

## 4. Langkah 3 — Set secret

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY=<public key> \
  VAPID_PRIVATE_KEY=<private key> \
  VAPID_SUBJECT=mailto:support@sa7tein.app
```

- `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` **disuntik platform otomatis** —
  jangan di-set manual.
- Cek: `supabase secrets list` → harus ada `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.
- `VAPID_SUBJECT` = kontak (mailto/URL). Boleh diganti email asli.

---

## 5. Langkah 4 — Deploy Function

```bash
npm run push:deploy          # = supabase functions deploy send-push
```

- Biarkan **`verify_jwt = true`** (default). Webhook akan mengirim service-key JWT,
  jadi lolos verifikasi platform. **Jangan** tambah `--no-verify-jwt`.
- Sukses → Dashboard → **Edge Functions** → `send-push` muncul.

---

## 6. Langkah 5 — Pasang Database Webhook

Dashboard → **Database** → **Webhooks** → *Create a new hook*:

| Field | Isi |
|---|---|
| Name | `notifications-push` (bebas) |
| Table | `public.notifications` |
| Events | centang **Insert** saja |
| Type | **Supabase Edge Function** |
| Edge Function | `send-push` |
| Method | `POST` |
| Timeout | `5000` (default aman) |
| HTTP Headers | klik *Add auth header with service key* → `Authorization: Bearer <service_role>`, dan `Content-Type: application/json` |

Simpan.

> Kenapa Insert saja? Notifikasi baru ditulis sebagai baris baru. `UPDATE`
> (mis. menandai `read`) tidak perlu memicu push.

---

## 7. Skema — tidak perlu diubah

Tidak ada migrasi. Kontrak yang sudah dipakai:

**`notifications`** (sumber) — kolom yang dipakai function:
`id, user_id, title, body, audience, kind`
- `user_id` → penerima (harus sama dengan `push_subscriptions.user_id`)
- `audience` → `customer | merchant | courier | cs`, menentukan `url` saat diklik
- `title` + `body` → isi notifikasi

**`push_subscriptions`** (tujuan):
`id, user_id, endpoint, p256dh, auth, created_at`

**RLS:** tidak disentuh. Edge Function memakai `SUPABASE_SERVICE_ROLE_KEY` (bypass
RLS) untuk baca/hapus `push_subscriptions`.

---

## 8. Verifikasi (bukti, bukan asumsi)

### 8a. Cek log Function
Dashboard → Edge Functions → `send-push` → **Logs**. Tiap ada notif, harus muncul
salah satu:
- `{"sent":1,"total":1}` → sukses.
- `{"sent":0,"reason":"tidak ada langganan"}` → user itu belum punya baris di
  `push_subscriptions` (suruh nyalakan sakelar push di app dulu).
- `{"error":"VAPID keys belum di-set"}` → Langkah 3 belum benar.

### 8b. Uji manual (paling cepat)
Insert manual 1 baris ke `notifications` (Table Editor) untuk `user_id` yang **sudah
punya langganan**, isi `title`/`body`/`audience`. Dalam beberapa detik notif harus
muncul di perangkat. Log Function harus `{"sent":1,...}`.

### 8c. Uji lewat aplikasi
Lakukan transisi order (checkout / terima / siap / serahkan) di app. App sudah
menulis `notifications`, jadi webhook otomatis jalan.

### 8d. Uji pengirim lokal (opsional, tanpa webhook)
```bash
npm run push:send -- --title "Test" --body "Pipeline VAPID" --url /customer/orders
# diharapkan: "OK -> subscription <id>" dan "Terkirim: 1/1"
```
Ini membuktikan secret + langganan benar, terlepas dari webhook.

---

## 9. Troubleshooting

| Gejala | Sebab | Fix |
|---|---|---|
| Klien: `Registration failed - push service error` | sisi **klien/Brave** (transport push), bukan BE | bukan urusan BE — lihat catatan di bawah |
| Function balas `401 / Unauthorized` | webhook tak mengirim JWT / `verify_jwt` dimatikan | pastikan header service key terpasang, `verify_jwt=true` |
| `{"sent":0,"reason":"tidak ada langganan"}` | user belum subscribe | nyalakan "Notifikasi push" di app, cek baris `push_subscriptions` |
| Webhook tak pernah jalan | event/table/type salah | ulangi Langkah 6: table `notifications`, **Insert**, type Edge Function |
| `{"error":"body bukan JSON"}` | dipanggil bukan sebagai webhook | panggil via webhook/Dashboard, bukan manual tanpa body |
| Log: `Invalid PEM label` / `Argument 2 is not of type CryptoKey` | crypto `npm:web-push` bentrok di Deno tertentu | ganti impor function ke `jsr:@negrel/webpush` (lihat `supabase/README.md` §Catatan runtime) |
| Notif tak muncul walau `sent:1` | permission perangkat dicabut / browser mati total di desktop | cek izin notifikasi perangkat |
| `410` di log lalu dihapus | langganan mati (uninstall/izin dicabut) | normal — function sudah bersihkan otomatis |

> **Catatan "push service error" sisi klien:** itu terjadi di browser saat
> `PushManager.subscribe`, sebelum BE terlibat. Di clone e2e repo ini sudah
> ditangani (`brave.gcm.channel_status`). Bukan tanda BE salah.

---

## 10. Rollback / matikan

- Matikan sementara: hapus webhook di Dashboard (Function tetap ada).
- Hapus permanen: `supabase functions delete send-push`.
- Langganan perangkat dihapus user lewat sakelar push (klien panggil
  `unsubscribe` + hapus baris `push_subscriptions`).

---

## 11. Yang harus dikembalikan ke front-end

Cuma **satu**, dan **hanya kalau Opsi B** (ganti pasangan VAPID):
- nilai `VAPID_PUBLIC_KEY` baru.

Kalau pakai Opsi A: **tidak ada** yang perlu diubah di front-end.

---

## 12. Checklist

- [ ] `supabase login` sebagai pemilik project
- [ ] `supabase link --project-ref dwzxtnfesmpobnepilhl`
- [ ] secret `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` ter-set
- [ ] `npm run push:deploy` sukses (function muncul di Dashboard)
- [ ] Database Webhook `notifications` / Insert → `send-push` + header service key
- [ ] Insert 1 notif uji → log `{"sent":1,...}` + notif muncul di perangkat
- [ ] (Opsi B) kunci publik baru sudah dikirim ke front-end & klien di-rebuild
