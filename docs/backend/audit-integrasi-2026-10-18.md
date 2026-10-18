# Audit integrasi FE ↔ Worker (api v2) — 2026-10-18

Alat: `node scripts/be-audit.mjs` (+ `--all`, `--json`, `BE_BASE=…`). Skrip
mengekstrak **setiap** query `/rest/v1/...` dari `src/api/*.ts`, mengganti
placeholder `${…}` dengan `1`, lalu menembaknya ke Worker. Read publik, jadi
tidak perlu login.

## Hasil

| Metrik | Angka |
|---|---|
| Query FE diekstrak | **89** |
| Gagal (`≥400`) | **0** |
| Benar tapi tabelnya kosong (`200 []`) | 26 |
| Tabel D1 disentuh FE | **40 / 64** |

26 query kosong itu **bukan bug**: sebagian memang disaring dengan nilai
placeholder (`audience=eq.1`, `email=eq.1`, `auth_user_id=eq.1`) atau tabelnya
memang nol baris (lihat daftar kosong di bawah).

## Kolom salah — sudah dibereskan

Worker membalas `400 no such column` kalau `select` menyebut kolom yang tidak
ada; satu kolom fiktif **mematikan seluruh daftar**, bukan mengosongkan satu sel.
Yang ditemukan dan diperbaiki:

- `audit_logs.kind`, `platform_params.almost_arrived_minutes` — ada di
  `supabase/migrations/2026-10-17-ops-sa-columns.sql`, **belum diterapkan ke D1**
  → ditambahkan.
- `payout_accounts.holder_name`, `profit_withdrawals.period`/`method`,
  `platform_profit.gross_jod`/`cost_jod`/`net_jod` — ditambahkan ke D1 secara
  **additive** (tanpa `rename`, penulis BE lama tetap aman).
- `audit_logs.target` tidak ada → FE membaca `target_id`.
- `couriers.availability = 'unavailable'` → dipetakan (dulu jatuh ke default).
- Embed PostgREST dibuang/ditolak (`users(phone)` dibuang; `menus!inner(…)` →
  400) → join manual dengan `in.(…)` di: `order_items` + `customers` (order
  merchant), `users.phone` (panel CS), `menus` (nama hidangan di ulasan).

## Sudah disambung (2026-10-18, lanjutan)

Empat tabel berisi data kini **dibaca** FE:

| Tabel | Dipakai di | Cara |
|---|---|---|
| `checkpoints` | lini masa order merchant | `fetchOrderCheckpoints` digabung dengan `order_status_history`, urut `at` |
| `chat_participants` | peserta `OrderChat` | `fetchChatParticipants` (role + `joined_at`); kurir masih turunan demo |
| `deposits` | riwayat setoran `/merchant/insentif` | `fetchMerchantCredit` → `MerchantCreditState.deposits` |
| `menu_categories` | kategori menu konsol merchant (`/merchant/menu`) | `fetchMenuCategories` + hook `useMenuCategories`; item ditandai `menus.category_id` (`MenuItem.categoryId`) |

Catatan `menu_categories`: kolom `is_active` bertipe **integer 0/1**, dan Worker
tak meng-coerce — filter harus `is_active=eq.1` (`eq.true` mengembalikan daftar
kosong tanpa error).

## BE sudah punya data, FE belum membaca (9 tabel)

Prioritas dari yang paling kentara di produk:

| Tabel | Baris | Yang hilang di FE |
|---|---|---|
| `enterprise_ledger` | 9 | ledger platform per order (`entry_type`, `party`, `amount_jod/idr`) |
| `product_attributes` / `product_attribute_values` | 2 / 5 | atribut produk + nilainya (`display_type`, `html_color`, `price_extra`) |
| `courier_types` | 3 | jenis kurir (`code`, `label`) |
| `dispute_rules` | 3 | aturan sengketa (`trigger_condition`, `responsible_party`, `mitigation`, `compensation`, `punishment`) |
| `cashback_tiers` | 3 | tangga cashback (`tier`, `min_volume_jod`, `pct`, …) |
| `exchange_rates` | 2 | kurs (`base`, `quote`, `rate`, `effective_on`) — saat ini RPC `fx_rate_latest` yang dipakai |
| `wallet_ledgers` | 1 | mutasi dompet (`direction`, `ref_type`, `ref_id`, `amount_jod`, `balance_after_jod`) |
| `punishments` | 1 | sanksi (`subject_type`, `subject_id`, `kind`, `level`, `reason`, `dispute_id`) |
| `magic_links` | 438 | internal auth — memang tak perlu dibaca FE |

Kosong & belum diintegrasi (10): `cashouts`, `dispatch_assignments`, `disputes`,
`incident_resolutions`, `menu_attribute_lines`, `merchant_dispute_rules`,
`payments`, `protection_fund`, `topups`, `wallet_holds`.

## Batas

- Skrip menembak query dengan parameter placeholder `1`, jadi hasil "kosong"
  untuk query ber-filter bisa jadi karena filternya, bukan datanya.
- Nama kolom yang benar hanya terbukti lewat status HTTP; skrip tidak
  memeriksa semantik nilai.
- Satu konvensi masih bercabang: id kurir FE `cr-N` (`batches.ts`) vs
  `String(id)` (`reference.ts`, `orders.ts`) — perlu satu keputusan sebelum
  kurir nyata dari BE ditampilkan lintas layar.
