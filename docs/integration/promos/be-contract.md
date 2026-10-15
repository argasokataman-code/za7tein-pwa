# Kontrak BE — Promo & Diskon (`marketing`)

Status: **terpasang** di proyek Supabase `dwzxtnfesmpobnepilhl`. Sumber tunggal SQL
ada di bagian bawah; jalankan ulang bila proyek direset.

Scope produk (`MARK-1`, `docs/product/schema-draft-v1.md`) **belum diputuskan
PRD**. Lapisan ini membangun kontrak teknis di atas tabel yang sudah ada; ia
tidak mengklaim fitur promo sebagai requirement aktif. Lihat API-SPEC §2.4/G15.

## 1. Tabel `marketing`

| kolom | tipe | catatan |
|---|---|---|
| `id` | bigint PK | |
| `type` | text | `discount_pct` \| `discount_fixed` \| `promo_delivery` |
| `value` | numeric | persen untuk `discount_pct`; JOD untuk dua tipe lain |
| `code` | text null | di-uppercase saat validasi |
| `active_from` / `active_to` | timestamptz | jendela berlaku |
| `max_uses` | int null | `null` = tanpa batas |
| `used_count` | int default 0 | naik otomatis saat order ber-promo dibuat |
| `merchant_id` | bigint null → `merchants(id)` | **`null` = promo platform** (ops); terisi = promo milik satu merchant |
| `created_at` | timestamptz | |

Tidak ada kolom `active`: status diturunkan dari jendela + kuota (`promoStatus`
di `src/api/promos.ts`), jadi tak ada dua sumber kebenaran.

## 2. RLS

| policy | peran | aturan |
|---|---|---|
| `marketing_public_read` | semua | `SELECT using (true)` — kode promo boleh dibaca customer |
| `marketing_ops` | `cs`/`superadmin` | `ALL using/with check app_is_ops()` |
| `marketing_merchant` | pemilik | `ALL` dengan `merchant_id is not null and merchant_id in (select id from merchants where user_id = app_uid())` |

Pemilik = user di mana `merchants.user_id = app_uid()` (pola sama dengan
`orders_participant`; tak ada helper `app_merchant_id`).

Terbukti:
- merchant POST `merchant_id` miliknya → `201`
- merchant POST `merchant_id` merchant lain → `403 42501`
- merchant GET `merchant_id=eq.1` (sesi merchant 1) → baris miliknya saja

## 3. RPC

### `validate_promo(p_code text, p_amount numeric, p_merchant_id bigint default null) returns jsonb`

`SECURITY DEFINER`. Cari kode yang cocok (tanpa beda huruf besar/kecil),
jendela aktif, kuota belum habis, dan `merchant_id` kosong **atau** sama dengan
`p_merchant_id`. Kembalian:

```json
{ "valid": true, "promoId": 2, "code": "TOKO50", "type": "discount_pct",
  "value": 15, "discount": 3.00, "merchantId": 1, "message": "Kode promo diterapkan." }
```

Gagal → `{ "valid": false, "reason": "empty" | "not_found", "message": "…" }`.

Perhitungan diskon: `discount_pct` → `amount × value / 100`; `discount_fixed` →
`min(value, amount)`; `promo_delivery` → `value` (dasar bebas ongkir). `discount`
selalu dalam **JOD** (seperti seluruh kolom `*_jod`).

`grant execute … to anon, authenticated`.

### Pemicu `bump_promo_used`

`AFTER INSERT ON orders` — kalau `promo_id` terisi, `used_count` baris promo naik
1. Ini yang menegakkan `max_uses` pada validasi berikutnya.

> ponytail: order batal tetap menambah `used_count`. Cukup untuk demo; upgrade =
> pindahkan perhitungan ke transisi `done` atau ledger pemakaian.

## 4. FE

- `src/api/promos.ts` — `fetchMerchantPromos`, `createPromo`, `deletePromo`,
  `validatePromo`.
- `src/pages/MerchantPromos.tsx` — rute `/merchant/promos` (titik masuk: kartu
  "Promo & Diskon" di beranda merchant).
- Checkout customer: `src/pages/Checkout.tsx` mevalidasi kode dan menaruhnya di
  `cart.promo`; `src/pages/PaymentAmount.tsx` mengirim `promo_id` /
  `promo_amount_jod` saat `createOrder`.

## 5. SQL

```sql
alter table public.marketing
  add column if not exists merchant_id bigint references public.merchants(id) on delete cascade;
create index if not exists marketing_merchant_idx on public.marketing(merchant_id);

create policy marketing_merchant on public.marketing
  for all to public
  using (merchant_id is not null
         and merchant_id in (select id from public.merchants where user_id = app_uid()))
  with check (merchant_id is not null
         and merchant_id in (select id from public.merchants where user_id = app_uid()));

create or replace function public.validate_promo(
  p_code text, p_amount numeric, p_merchant_id bigint default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare m marketing; disc numeric := 0;
begin
  if p_code is null or length(btrim(p_code)) = 0 then
    return jsonb_build_object('valid', false, 'reason', 'empty', 'message', 'Masukkan kode promo.');
  end if;
  select * into m from marketing
   where upper(code) = upper(btrim(p_code))
     and (merchant_id is null or merchant_id = p_merchant_id)
     and now() between active_from and active_to
     and (max_uses is null or used_count < max_uses)
   order by (merchant_id = p_merchant_id) desc nulls last, id asc limit 1;
  if not found then
    return jsonb_build_object('valid', false, 'reason', 'not_found',
      'message', 'Kode promo tidak valid atau sudah berakhir.');
  end if;
  if m.type = 'discount_pct' then disc := round(p_amount * m.value / 100, 2);
  elsif m.type = 'discount_fixed' then disc := least(m.value, p_amount);
  else disc := m.value; end if;
  if disc < 0 then disc := 0; end if;
  return jsonb_build_object('valid', true, 'promoId', m.id, 'code', m.code, 'type', m.type,
    'value', m.value, 'discount', disc, 'merchantId', m.merchant_id,
    'message', 'Kode promo diterapkan.');
end $$;

grant execute on function public.validate_promo(text, numeric, bigint) to anon, authenticated;

create or replace function public.bump_promo_used() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.promo_id is not null then
    update marketing set used_count = used_count + 1 where id = new.promo_id;
  end if;
  return new;
end $$;
create trigger orders_bump_promo after insert on public.orders
  for each row execute function public.bump_promo_used();

notify pgrst, 'reload schema';
```
