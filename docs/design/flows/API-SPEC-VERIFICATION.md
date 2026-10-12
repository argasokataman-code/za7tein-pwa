# API-SPEC — Laporan verifikasi E2E

Verifikasi otomatis `API-SPEC.md` terhadap BE live (Supabase). Tujuan: memastikan dokumen
yang diserahkan ke tim BE **1:1** dengan kenyataan, tanpa klaim yang tak terbukti.

- **Tanggal:** 2026-10-12
- **Target:** `https://dwzxtnfesmpobnepilhl.supabase.co` (anon + token demo `cs`/`customer`/`merchant`/`courier`)
- **Alat:** `node scripts/api-spec-check.mjs` (read-only; 3 tulisan sengaja ditolak untuk membuktikan 403)
- **Hasil:** **139 OK · 0 FAIL · 20 INFO**
- **Diagram:** 20 blok mermaid `API-SPEC.md` di-parse dengan `mermaid@11` → **20/20 OK**

## 1. Yang diuji

| Grup | Cakupan |
|---|---|
| 1 | Kolom tiap tabel berisi (§2.1) — set kolom **persis** sama dengan live (23 tabel) |
| 1b | Label jumlah kolom `(N)` di §2.1 sama dengan jumlah kolom live |
| 2 | 19 tabel yang ditandai "kosong" benar ada dan benar kosong |
| 3 | 2 tabel yang ditandai absen benar 404 `PGRST205` |
| 4 | Relasi FK (§2.5) — embed `?select=...,tabel(kolom)`; relasi yang memang tidak ada tetap 400 |
| 5 | 30 query klien yang didokumentasikan berjalan di peran yang benar |
| 6 | Klaim negatif: `customer` INSERT `chat_messages` = 403; **`customer` INSERT `customer_risk_flags` = 403** (hak CS); `orders.otp` terbaca kurir/merchant/customer; OpenAPI root = 401 |
| 7 | Nilai enum nyata (informasi, dibanding §11) |
| 8 | Gateway draft `api.sa7tein.app` belum ada (sesuai §0) |

## 2. Temuan besar: tabel yang lolos probe awal

Probe 2026-10-12 awal melewatkan tiga tabel. Semuanya **ada** di BE:

| tabel | kolom (nyata) | isi |
|---|---|---|
| `customers` | `id, user_id, name, risk_flag, created_at, avatar, status` | ada baris |
| `customer_risk_flags` | `id, customer_id, reason, by_operator_id, at` | 1 baris (customer 6, "COD gagal 2× berturut", operator 4) |
| `dispute_appeals` | (kosong, kolom belum terbaca) | kosong |

Konsekuensi penting (**koreksi relasi**):

- `orders.customer_id` ber-FK ke **`customers.id`**, **bukan** `users.id`. Embed
  `orders?select=id,users(email)` memang 400 — tapi ini bukan "tidak ada relasi", melainkan
  relasinya ke `customers`. Klien memakai `customers.user_id` untuk menautkan ke akun `users`.
- `customers.user_id → users.id`; `customer_risk_flags.customer_id → customers.id`;
  `customer_risk_flags.by_operator_id → users.id`.
- Total tabel terjangkau: **42** (23 berisi + 19 kosong); 2 absen.

Klarifikasi ini masuk §5.11 (risiko customer & blacklist COD), §2.1, §2.2, §2.5, §3, §4, §7,
§10, dan ERD §16.

## 3. Koreksi yang dilakukan pada `API-SPEC.md`

| # | Sebelum | Sesudah (terverifikasi) |
|---|---|---|
| 1 | `merchants (31)` | `merchants (28)` |
| 2 | `menus (16)` | `menus (14)` |
| 3 | `orders (29)` | `orders (30)` |
| 4 | `deposits (7)` | `deposits (8)` |
| 5 | `cashback_tiers (5)` | `cashback_tiers (6)` |
| 6 | `rating_reviews (12)` | `rating_reviews (11)` |
| 7 | `users (14)` | `users (13)` |
| 8 | `addresses (18)` | `addresses (17)` |
| 9 | `orders.customer_id` diklaim "tanpa FK" | ber-FK ke `customers` (bukan `users`); ditambah baris `customers` |
| 10 | `merchant_credit_events` diklaim ber-FK ke `merchant_credits` | ber-FK ke `merchants` |
| 11 | hanya `operators.user_id` | `operators` punya **dua** FK ke `users` (`user_id`, `created_by`); embed butuh hint |
| 12 | hanya 39 tabel | +`customers`, `customer_risk_flags`, `dispute_appeals` → 42 |
| 13 | tidak ada seksi risiko customer | §5.11 baru: keadaan (`customers.status`/`risk_flag`), histori (`customer_risk_flags`), efek ganda dengan `merchants.tenant_status`, event, kontrak usulan, UNRESOLVED |
| 14 | event catalog tanpa blacklist | +`cod_blocked` dan `customer_risk_flagged` |

Tambahan: §11 "nilai enum nyata" dilengkapi (`orders.status`, `orders.payment_method` termasuk
`wallet`, `orders.hold_status`, `checkpoints.kind`, `users.role`, `couriers.availability`,
`cashback_tiers.tier`).

## 4. Fakta yang dikonfirmasi (bukan asumsi)

- 23 tabel berisi: set kolom **persis** cocok dengan §2.1.
- 19 tabel kosong (§2.2) dan 2 tabel absen (§2.3) benar.
- Semua relasi §2.5 yang diklaim ada **benar ada**, termasuk `orders → customers`,
  `customers → users`, `customer_risk_flags → customers/users`, `chats → chat_participants`,
  `orders → order_items/batches`, `addresses → zones`.
- `customer` tidak bisa INSERT `chat_messages` (403) maupun `customer_risk_flags` (403).
- `orders.otp` **terbaca** oleh kurir, merchant, dan customer (§5.5.1, temuan keamanan).
- Root OpenAPI PostgREST 401 tanpa `service_role` (§2.2, batas pemetaan).
- `api.sa7tein.app` belum resolve (§0, layer gateway masih draft).

## 5. Yang belum bisa diverifikasi dari sini

- **View, RPC/function, trigger, Edge Function, storage bucket, dan daftar publikasi Realtime.**
  OpenAPI PostgREST butuh `service_role`; token anon/JWT dijawab 401.
- **Enumerasi tabel lengkap.** Tiga tabel di atas lolos dari probe awal; kemungkinan masih ada
  tabel lain di luar daftar probe (M8/M10). Konfirmasi ke BE.
- **Kolom tabel kosong.** 19 tabel tak berisi baris, jadi spec kolomnya di §5 tetap **usulan**.
- **Perilaku tulis** (insert/update/ledger/hold). Skrip ini read-only kecuali 3 tulisan yang
  memang harus ditolak.
- **Endpoint kontrak target (§12).** Gateway belum dideploy.

## 6. Cara menjalankan ulang

```bash
node scripts/api-spec-check.mjs            # verifikasi dokumen default
node scripts/api-spec-check.mjs path.md    # dokumen lain
# override: SBE_URL, SBE_ANON, SBE_PASSWORD
```

Exit code `1` bila ada `FAIL`. Jalankan **serial**, satu proses, tanpa paralel.
