# Permintaan FE ke BE — API v2 (Cloudflare Worker + D1 + R2)

- **Tanggal:** 2026-10-18
- **Dari:** tim FE (PWA Sa7tein, repo `sa7tein-pwa`)
- **Untuk:** tim BE (Cloudflare Worker / D1 / R2)
- **Base URL:** `https://sa7tein-api-cf.sa7tein-pwa.workers.dev`
- **Kontrak acuan:** `CONSUME-cloudflare.md`
- **Status FE:** baca + auth + media + sebagian RPC **sudah dikonsumsi & terverifikasi**; sisanya menunggu BE.

> Dokumen ini ditulis supaya BE tidak perlu menebak: tiap butir memuat **endpoint persis**, **argumen**, **bentuk balikan yang FE harapkan**, **flow/PRD terkait**, dan **cara memverifikasi** (status HTTP hasil probe hari ini).

## 0. Cara membaca

- **Status** memakai kode HTTP hasil probe langsung ke Worker (bukan asumsi).
- **P0** = memblokir fitur inti / ada di jalur uang. **P1** = penting, ada fallback mock. **P2** = rapi/operasional.
- Tanda `?` = perlu konfirmasi BE.
- FE repo ini **front-end saja**; semua data mock punya fallback. Jadi butir BE yang belum ada **tidak** membuat app crash — ia membuat fitur diam-diam kembali ke mock.

## 1. Ringkasan status (hasil probe 2026-10-18)

| Bagian | Status | Bukti |
|---|---|---|
| Baca tabel `GET /rest/v1/{table}` | ✅ 35/39 hidup | `merchants`, `menus`, `orders`, `marketing` → `200` |
| 4 tabel | ❌ `400 no such table` | `payout_accounts`, `payment_methods`, `platform_profit`, `profit_withdrawals` |
| Tulis tabel `POST/PATCH/DELETE /rest/v1/{table}` | ❌ `404 Not Found` | `POST /rest/v1/marketing` → `404` |
| Auth magic-link → JWT | ✅ | `POST /auth/magic-link` `200`, `/auth/verify` `200`, `/auth/me` `200` |
| Auth password (`/auth/v1/*`) | ❌ | tidak dilayani |
| Media R2 `PUT/GET` | ✅ PUT wajib JWT (401 tanpa token) | `PUT /media/menu-images/x` tanpa JWT → `401`; dengan JWT merchant → `201` |
| RPC baca | ✅ | `check_coverage`, `price_order`, `browse_merchants`, `search_merchants`, `fx_rate_latest` → `200` |
| RPC tulis (authz) | ✅ gerbang jalan | tanpa JWT → `401` |
| RPC FE lama | ❌ `501` | `my_order_otp`, `verify_order_otp`, `courier_orders`, `ops_set_platform_params` |
| Embed PostgREST | ❌ `400` | `users(phone)`, `menus(name)` |
| Realtime | ⚠ terbatas | cuma broadcast `{type:'rpc'}` ke topic `orders` |

---

## 2. P0 — memblokir / jalur uang

1. **Tulis tabel** (atau RPC tulis) — §4.
2. **RPC OTP & tugas kurir** — `my_order_otp`, `verify_order_otp`, `courier_orders` — §5.
3. **Spek RPC** (arg `p_*` + bentuk balikan) untuk semua RPC tulis — §5.0.
4. **Tabel hilang** `payout_accounts`, `payment_methods`, `platform_profit`, `profit_withdrawals` — §3.
5. **Auth produksi** (magic-link kirim email + endpoint profil) — §6.
6. **Media: bucket `chat-media`/`review-media` + kolom media** — auth PUT & `DELETE` sudah beres; §8.

## 3. Tabel D1 yang belum ada

Semua dipakai FE dan balas `400 no such table`:

| Tabel | Dipakai flow | Dipakai halaman | Operasi FE |
|---|---|---|---|
| `payout_accounts` | f6-cashout-payout | `/merchant/payout-accounts`, `/courier/payout-accounts` | R + W |
| `payment_methods` | f17-payment-dana | `/payment-selection`, `/payment-dana`, `/payment-amount` | R |
| `platform_profit` | f15-super-admin, f22-super-admin-sa | `/profit` (SaProfit) | R |
| `profit_withdrawals` | f15/f22 | `/profit` (SaProfit) | R + W |

**Minta:** tambahkan ke `cloudflare/schema.sql` + seed, atau sediakan endpoint pengganti.

## 4. Tulis tabel belum didukung (`POST/PATCH/DELETE /rest/v1/{table}` → `404`)

FE memanggil bentuk PostgREST (bukan RPC) untuk semua tulis di bawah. **Minta:** dukung tulis generik sesuai semantik PostgREST:

- `POST /rest/v1/{table}` — body JSON objek/array; dengan `Prefer: return=representation` + `?select=...` mengembalikan baris yang dibuat.
- `PATCH /rest/v1/{table}?<filter>` — body JSON; balas `204` atau baris bila `return=representation`.
- `DELETE /rest/v1/{table}?<filter>` — balas `204`.
- Filter yang FE pakai: `id=eq.`, `merchant_id=eq.`, `user_id=eq.`, `is_default=eq.`, `order_id=eq.`, `code=eq.`, `email=eq.`, `id=in.(...)`.
- **Authz per baris wajib** (setara RLS): jangan sampai merchant bisa menulis baris merchant lain. Token sesi dikirim di `Authorization: Bearer <JWT>`; `apikey` diabaikan.

Kalau BE **tidak** mau tulis generik, sediakan RPC tulis ekuivalen. Berikut daftar aksi yang harus ditutup:

| Tabel | Operasi FE | Modul FE | Halaman / flow |
|---|---|---|---|
| `orders` | create, patch (status, payment_status, courier_id, otp_verified) | `orders.ts` | Checkout, OrderStage, MerchantOrders (f1, f18, f2) |
| `order_items` | (via create_order / create orders) | `orders.ts` | Checkout (f1) |
| `checkpoints` | create | `orders.ts` | CourierTaskDetail (f5, f13) |
| `addresses` | create, patch, delete | `profile.ts` | address-selection (f20) |
| `marketing` (promo) | create, delete | `promos.ts` | `/merchant/promos` (f12) |
| `marketing_programs` / `_rewards` / `_rules` | create (merchant & ops) | `programs.ts` | MerchantPromos, OpsPrograms (f12) |
| `menus`, `menu_variants` | (FE belum menulis? `?` — tulis menu masih mock) | `catalog.ts` | MerchantMenu (f12) |
| `merchant_tags` | patch | `ops.ts` | OpsModeration (f15) |
| `merchants` | patch (store_status, delivery_config) | `reference.ts`, `coverage.ts` | MerchantSettings, MerchantCoverage (f12, f28) |
| `coverage_zones` | create, patch | `coverage.ts` | MerchantCoverage (f28) |
| `chat_messages`, `chats` | create | `chat.ts` | order-chat (f14) |
| `notifications` | create, patch (read) | `notifications.ts` | notifications (f11) |
| `rating_reviews`, `review_replies` | create | `reviews.ts` | reviews customer/merchant (f19) |
| `refunds` | create | `refunds.ts` | CustomerRefund (f8) |
| `quota_subscriptions` | create | `quota.ts` | MerchantSubscription (f1 §17) |
| `customers` | patch (risk flag) | `admin.ts` | AdminMerchants (f24) |
| `customer_risk_flags` | create | `admin.ts` | AdminMerchants (f24) |
| `users` | patch (email, phone) | `profile.ts` | personal-data (f21) |
| `push_subscriptions` | create, delete | `profile.ts` | notification-settings (f11) |
| `platform_params` | patch | `ops.ts` | OpsSettings (f15) |
| `zones` | patch (polygon) | `reference.ts` | SaZones (f22) |
| `payout_accounts` | create, patch, delete | `payout.ts` | payout-accounts (f6) |
| `profit_withdrawals` | create | `profit.ts` | SaProfit (f22) |

## 5. RPC

### 5.0 Minta spek lengkap (P0)

Untuk **setiap** RPC yang diimplementasikan, kirim: **nama argumen persis (`p_*`) + tipe**, **bentuk balikan (field + tipe, mana `null`-able)**, dan **prasyarat peran**. Idealnya lewat `openapi.yaml` terbaru atau `cloudflare/schema.sql`.

Alasan konkret: `check_coverage` ternyata balas **boolean** (bukan `{covered,zone,distanceMeters}`), dan argumennya `p_merchant` — `p_merchant_id` didiamkan Worker sehingga balas `false` (nyaris jadi bug false-negative di FE). FE tak boleh menebak.

RPC yang paling dipakai FE dan bentuknya harus dipastikan:

`price_order`, `compute_discounts`, `browse_merchants`, `search_merchants`, `create_order`, `complete_order`, `cancel_order`, `reserve_quota`, `consume_quota`, `release_quota`, `assign_batch`, `auto_sort_batch`, `close_batch`, `dispatch_partner`, `respond_assignment`, `set_courier_status`, `submit_review`, `reply_review`, `open_dispute`, `resolve_dispute`, `appeal_dispute`, `send_chat_message`, `close_stale_chats`, `emit_notification`, `buy_quota_package`, `issue_sp`, `fx_rate_latest`.

### 5.1 RPC hilang (`501 belum diimplementasikan`)

| RPC | FE pemanggil | Argumen FE kirim | Balikan yang FE baca | Halaman / flow |
|---|---|---|---|---|
| `my_order_otp` | `orders.ts:258` | `p_order_id` | `string \| null` (kode OTP customer) | OrderStageScreen — `/order-placed`, `/order-arrived` (f5, f13) |
| `verify_order_otp` | `orders.ts:271` | `p_order_id`, `p_code` | `boolean` (lolos?) → set `otp_verified` + checkpoint | `/task/:id` CourierTaskDetail (f5, f13) |
| `courier_orders` | `orders.ts:490` | — | `CourierTask[]` (lihat §5.2) | beranda kurir (f13) |
| `ops_set_platform_params` | `ops.ts:70` | `p_fee_customer`, `p_fee_merchant`, `p_quick_multiplier` | dibuang (fire-and-forget, best-effort) | OpsSettings (f15) |

Catatan: dokumen kontrak menyebut `ops_set_platform_params` "sudah diimplementasikan", tetapi probe balas **`501`** bahkan dengan JWT `role:"cs"`. Mohon dikonfirmasi mana yang benar.

### 5.2 `courier_orders` — bentuk `CourierTask[]` yang FE baca

```ts
{
  id, code, status,
  customer_id, customer_name, customer_phone,
  zone_code, full_address, address_line, floor, unit,
  total_jod, distance_m, payment_method, tip_jod,
  checkpoint_at, otp_verified,
  items: [{ name, qty, line_total_jod, modifiers }]
}
```
(Dideklarasikan tapi **tidak** dibaca FE — aman dipangkas: `address_label`, `building`, `payment_status`, `created_at`, `placed_at`, `courier_id`.)

### 5.3 Dua RPC lama — **tidak perlu** dikerjakan

FE sudah mengalihkannya:

- `resolve_coverage` → sekarang memanggil **`check_coverage`** (`p_lat`, `p_lng`, `p_merchant`) → boolean; zona + jarak dihitung klien.
- `validate_promo` → sekarang **membaca tabel `marketing`** langsung (`?code=eq.<KODE>`), jendela/kuota/scope diperiksa klien.

Jadi nama lama itu boleh tetap `501`; cukup pastikan `check_coverage` + tulis/baca `marketing` stabil.

## 6. Auth

| Kebutuhan | Sekarang | Minta |
|---|---|---|
| Magic-link kirim **email** | stub: `{..., "note":"email stub"}`, token dibalikkan di response | kirim email sungguhan; sediakan jalur dev stabil (mis. response tetap memuat token di mode dev) |
| `PATCH /auth/me` (atau tulis `users`) | `/auth/me` hanya `{id,role,email}` | endpoint ubah `name`/`avatar` (FE: `/personal-data`, `CustomerAccount`) — sekarang `authUpdateUser` tidak ada, profil jatuh ke mock |
| Peran `superadmin` | tak ada di tabel `users` (vocab: `customer,merchant,courier,cs`) | konfirmasi peran resmi + tempatnya; RPC ops butuh `cs`/`superadmin` |
| Logout / refresh token | tak ada | kalau JWT 24 jam diperpanjang, sediakan refresh/logout |
| Login password | `/auth/v1/*` tidak dilayani | tidak wajib (FE pakai magic-link); konfirmasi kalau tetap tidak ada |

## 7. Embed PostgREST (`400`)

Query berelasi yang FE pakai gagal:

```
GET /rest/v1/customers?select=id,name,risk_flag,status,users(phone)   → 400
GET /rest/v1/order_items?select=id,order_id,menu_id,qty,menus(name)   → 400
```

Dipakai: daftar customer panel CS (f24), rincian item order (f1/f19).

**Minta:** dukung embed (`users(phone)`, `menus(name)`) **atau** RPC view khusus yang mengembalikan gabungan itu.

## 8. Media (R2)

| Butir | Sekarang | Minta |
|---|---|---|
| `PUT /media/{bucket}/{key}` | ✅ **wajib JWT** — tanpa token `401`, dengan JWT `201` | terima (sudah beres). Konfirmasi apakah authz per-peran selain sekadar "ada token". |
| `DELETE /media/{bucket}/{key}` | ✅ ada (`204`) | terima (sudah beres). |
| Daftar bucket | hanya `menu-images`, `merchant-photos`, `avatars` — `chat-media`/`review-media` → **`404`** | **tambah bucket** `chat-media` (lampiran chat §20.1) dan `review-media` (foto ulasan §20.2). Sementara FE menumpang `menu-images` untuk lampiran chat, dan foto ulasan tetap lokal. |
| `GET` publik | `200` | konfirmasi tetap anonim, atau presigned bila perlu privat. |
| Kolom media | `chat_messages` tanpa kolom media (FE kirim URL di `body`) ; `rating_reviews` tanpa kolom media | tambah kolom lampiran (mis. `chat_messages.media jsonb`, `rating_reviews.photos jsonb`) supaya lampiran tidak menumpang teks. |

FE sudah punya helper `uploadMedia()` (`src/api/supabase.ts`) yang menembak URL ini; tinggal dipakai UI begitu auth jelas.

## 9. Realtime

FE sekarang memakai protokol Phoenix (Supabase) di `src/api/realtime.ts`. Worker `WS /ws?topic=orders` cuma menyiarkan `{type:'rpc',fn,at}`.

**Minta:** event **perubahan baris** minimal `{table, type: insert|update|delete, row}` dengan topic per tabel. Publication Supabase lama mencakup: `orders, merchants, menus, wallet_ledgers, disputes, couriers, batches`. FE butuh minimal: `orders`, `notifications`, `checkpoints`, `chats`. Sertakan `ping`/`pong` bila ada.

## 10. Count / pagination

`Range`/`Content-Range` belum ada. FE butuh **total count** untuk hitungan ("9 toko", "50 notifikasi") — `limit/offset` sudah cukup untuk halaman.

**Minta:** dukung `Prefer: count=exact` (balas `Content-Range: 0-9/35`) **atau** field `count` pada respons.

## 11. Cron & push (P2)

- `run_cron_jobs` masih manual (C6): `expire_unpaid_orders`, `close_stale_chats`, `quota_low_alerts` belum terjadwal.
- Push fan-out: `send-push` belum pindah dari Supabase Functions. FE sudah punya VAPID publik + tabel `push_subscriptions` (hidup) tapi pengirimnya hilang.

## 12. CORS produksi (P2)

`ALLOWED_ORIGIN` masih `*`. Kalau FE dikunci, kirim daftar origin yang diizinkan (host per-peran: customer/merchant/courier/admin + superadmin).

---

## 13. Flow → endpoint yang dibutuhkan

Kolom **Butuh** = endpoint yang harus hidup agar flow berjalan penuh (bukan mock).

| Flow | Peran | Resource/RPC | Butuh |
|---|---|---|---|
| f20-address-zone | customer | `addresses` (R/W), `coverage_zones` (R), RPC `check_coverage` | tulis `addresses` |
| f1-order-lifecycle | customer/merchant | `orders`, `order_items` (W), RPC `price_order`, `create_order`, `reserve/consume/release_quota` | tulis + RPC tulis |
| f18-order-state | merchant/customer | `orders` (R/W), RPC `complete_order`, `cancel_order` | tulis + RPC |
| f2-cod-hold | customer/merchant | `orders` payment/COD, RPC | tulis + RPC |
| f5-delivery-verification | kurir | `checkpoints` (W), RPC `my_order_otp`, `verify_order_otp`, `set_courier_status` | RPC OTP + tulis |
| f13-courier-view | kurir | `couriers`, `orders` (R), RPC `courier_orders` | RPC + baca |
| f25-batch-lifecycle | merchant/kurir | RPC `assign_batch`, `auto_sort_batch`, `close_batch` | RPC tulis |
| f26-quick-dispatch | merchant | RPC `dispatch_partner`, `respond_assignment` | RPC tulis |
| f12-merchant-console | merchant | `merchants`, `menus`, `menu_variants`, `marketing`, `couriers` (R/W) | tulis |
| f28-coverage-editor | merchant | `coverage_zones` (W), `merchants.delivery_config` (W) | tulis |
| f14-chat-order | 3 pihak | `chats`, `chat_messages` (R/W), RPC `send_chat_message`, `close_stale_chats` | tulis + RPC + realtime |
| f19-rating-review | customer/merchant | `rating_reviews`, `review_replies` (R/W), RPC `submit_review`, `reply_review` | tulis + RPC |
| f8-dispute | customer/CS | `refunds` (W), RPC `open_dispute`, `resolve_dispute`, `appeal_dispute`, `snapshot_dispute_rules` | tulis + RPC |
| f24-cs-problem | CS | `customers`, `customer_risk_flags` (W), embed `users(phone)` | tulis + embed |
| f15/f22-super-admin | owner/CS | `operators`, `roles`, `platform_switches`, `zones`, `audit_logs`, `platform_params`, RPC `issue_sp`, `ops_set_platform_params` | tabel hilang + RPC + tulis |
| f16-merchant-onboarding | merchant | `merchants`, `merchant_tags`, `merchant_credits`, `merchant_credit_events` | tulis |
| f3/f6/f7 wallet-payout-ledger | customer/merchant | `wallets`, `payout_accounts` (R/W), `merchant_credits` | tabel hilang + tulis |
| f4-fee-tax | merchant | `platform_params`, RPC `price_order`, `compute_discounts` | spek RPC |
| f9-incentive | merchant | `merchant_credits`, `merchant_credit_events` (R) | — (baca cukup) |
| f10-exchange-rate | semua | RPC `fx_rate_latest` | ✅ hidup |
| f11-push-notification | semua | `push_subscriptions` (R/W), `notifications` (R/W), `send-push` | tulis + pengirim |
| f17-payment-dana | customer | `payment_methods` (R), `orders` (W) | tabel hilang + tulis |
| f21-account-auth | semua | `users` (R/W), `/auth/*` | auth produksi + tulis profil |

## 14. Cara verifikasi (repro)

```bash
W=https://sa7tein-api-cf.sa7tein-pwa.workers.dev

# baca tabel hidup vs mati
curl -s -o /dev/null -w '%{http_code}\n' "$W/rest/v1/merchants?limit=1"          # 200
curl -s -o /dev/null -w '%{http_code}\n' "$W/rest/v1/payout_accounts?limit=1"    # 400

# tulis tabel (sekarang 404)
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$W/rest/v1/marketing" \
  -H 'Content-Type: application/json' -d '{"code":"X"}'                          # 404

# RPC hilang (sekarang 501)
curl -s -w '\n%{http_code}\n' -X POST "$W/rest/v1/rpc/courier_orders" \
  -H 'Content-Type: application/json' -d '{}'                                    # 501

# embed (sekarang 400)
curl -s -o /dev/null -w '%{http_code}\n' \
  "$W/rest/v1/customers?select=id,name,users(phone)&limit=1"                     # 400

# media PUT: tanpa JWT 401, dengan JWT 201; DELETE 204
curl -s -o /dev/null -w '%{http_code}\n' -X PUT "$W/media/menu-images/probe.txt" \
  -H 'Content-Type: text/plain' --data 'x'                                       # 401
# bucket di luar allowlist → 404
curl -s -o /dev/null -w '%{http_code}\n' -X PUT "$W/media/chat-media/probe.txt" \
  -H 'Content-Type: text/plain' --data 'x'                                       # 404
```

Skrip cek ringkas yang sudah ada di repo: `./scripts/be-check.sh` (health/version/rest) dan `./scripts/r2-check.sh` (R2 SigV4).

## 15. Yang **sudah** hidup — jangan sampai rusak

- `GET /health`, `GET /version`, prefix `/v1/...`.
- `GET /rest/v1/{table}` (35 tabel) + filter `eq/neq/gte/lte/ilike/in/is.null/not.is.null` + `order/limit/offset/select`.
  - Catatan: `numeric` dibalas **number** (bukan string) — FE sudah menyesuaikan.
- `POST /auth/magic-link` → `POST /auth/verify` → `GET /auth/me` (JWT HS256, 24 jam).
- RPC baca: `check_coverage`, `fx_rate_latest`, `browse_merchants`, `search_merchants`, `price_order`, `compute_discounts`.
- RPC tulis balas `401` tanpa JWT (authz jalan), `403` untuk ops tanpa peran.
- `GET/PUT /media/{bucket}/{key}`.

## 16. Definisi selesai (acceptance)

1. Semua tabel di §3 ada; `GET` balas `200` (bukan `400`).
2. `POST/PATCH/DELETE /rest/v1/{table}` (atau RPC tulis ekuivalen) untuk daftar §4, **dengan authz per baris**.
3. `my_order_otp`, `verify_order_otp`, `courier_orders` balas `200` dengan bentuk §5.2.
4. `openapi.yaml`/`schema.sql` memuat arg `p_*` + bentuk balikan tiap RPC.
5. Embed §7 balas `200` (atau diganti RPC view).
6. `PATCH /auth/me` + magic-link kirim email.
7. ✅ `PUT /media` balas `401` tanpa JWT (dengan JWT `201`); `DELETE /media` ada (`204`). Sisa: bucket `chat-media`/`review-media` + kolom media untuk lampiran chat/ulasan.
8. Realtime menyiarkan perubahan baris minimal untuk `orders`, `notifications`, `checkpoints`, `chats`.
9. `Prefer: count=exact` mengembalikan total.

---

### Lampiran A — matriks resource FE (baca/tulis)

`R` = read, `W` = write. Sesi = token yang FE pakai (`anon`/`ref` = `cs@`, `merchant`, `customer`, `courier`).

| Tabel | R | W | Sesi | Halaman |
|---|---|---|---|---|
| `merchants` | ✅ | ✅ | anon/ref | home, search, merchant/:id, settings, coverage |
| `menus` | ✅ | `?` | anon | home, search, menu-detail, merchant/:id |
| `menu_variants` | ✅ | — | anon | idem |
| `payment_methods` | ❌ tabel | — | anon | payment-* |
| `customers` | ✅ | ✅ | ref | admin merchants, reviews |
| `customer_risk_flags` | ✅ | ✅ | ref | admin merchants |
| `users` | ✅ | ✅ | anon/ref/customer | personal-data, audit, operators |
| `rating_reviews` | ✅ | ✅ | ref/customer | reviews, orders |
| `review_replies` | ✅ | ✅ | ref/merchant | reviews merchant |
| `chats` | ✅ | ✅ | ref | order-chat |
| `chat_messages` | ✅ | ✅ | ref | order-chat |
| `notifications` | ✅ | ✅ | ref | notifications |
| `audit_logs` | ✅ | — | ref | audit |
| `orders` | ✅ | ✅ | customer/merchant/courier | orders, payment, refund |
| `order_items` | ✅ | (via order) | customer | orders, reviews |
| `checkpoints` | — | ✅ | courier | task/:id |
| `payout_accounts` | ❌ tabel | ❌ tabel | ref | payout-accounts |
| `addresses` | ✅ | ✅ | ref | address-selection |
| `push_subscriptions` | ✅ | ✅ | customer | notification-settings |
| `refunds` | ✅ | ✅ | ref | refund |
| `coverage_zones` | ✅ | ✅ | merchant | coverage |
| `quota_subscriptions` | ✅ | ✅ | merchant | subscription |
| `quota_packages` | ✅ | — | merchant | subscription, quotas |
| `marketing` | ✅ | ✅ | merchant/ref | promos, checkout |
| `marketing_programs` | ✅ | ✅ | merchant/ref | promos, programs |
| `marketing_rewards` | ✅ | ✅ | merchant/ref | promos, programs |
| `marketing_rules` | ✅ | ✅ | merchant/ref | promos, programs |
| `platform_params` | ✅ | ✅ | ref | settings |
| `merchant_tags` | ✅ | ✅ | ref | moderation |
| `couriers` | ✅ | — | ref | reference, orders |
| `wallets` | ✅ | — | ref | wallet |
| `merchant_credits` | ✅ | — | ref | wallet/ledger |
| `merchant_credit_events` | ✅ | — | ref | wallet/ledger |
| `zones` | ✅ | ✅ | ref | zones |
| `roles` | ✅ | — | ref | roles |
| `operators` | ✅ | — | ref | reference |
| `platform_switches` | ✅ | — | ref | switches |
| `platform_profit` | ❌ tabel | — | ref | profit |
| `profit_withdrawals` | ❌ tabel | ❌ tabel | ref | profit |

### Lampiran B — bukti probe (ringkas)

```
GET /rest/v1/merchants?limit=1                          → 200
GET /rest/v1/{payout_accounts,payment_methods,platform_profit,profit_withdrawals} → 400 no such table
POST /rest/v1/marketing                                 → 404 Not Found
PATCH /rest/v1/merchants?id=eq.1                        → 404
DELETE /rest/v1/marketing?id=eq.999999                  → 404
POST /rest/v1/rpc/{my_order_otp,verify_order_otp,courier_orders,ops_set_platform_params} → 501
POST /rest/v1/rpc/{create_order,cancel_order,buy_quota_package} tanpa JWT → 401
GET  /rest/v1/customers?select=...,users(phone)         → 400
PUT  /media/menu-images/probe.txt                       → 201 (tanpa JWT)
POST /auth/magic-link → 200   POST /auth/verify → 200   GET /auth/me → 200
```
