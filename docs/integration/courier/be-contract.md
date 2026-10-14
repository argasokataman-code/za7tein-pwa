# Kontrak BE — API kurir

Repo ini front-end (AGENTS.md §1). Dokumen ini mencatat jalur data yang dipakai
layar kurir ke PostgREST Supabase, termasuk satu RPC yang perlu ada di BE.

Ringkas: kurir **tidak** membaca tabel `customers`/`addresses` langsung (RLS-nya
hanya untuk pemilik baris), jadi data tugas datang dari satu RPC
`courier_orders()` yang `SECURITY DEFINER` dan menyaring dengan `app_uid()`.

## 1. Tugas kurir — `courier_orders()`

`fetchCourierOrders()` (`src/api/orders.ts`) memanggil
`POST /rest/v1/rpc/courier_orders` tanpa argumen. Fungsi mengembalikan semua order
milik kurir pemanggil, sudah diperkaya:

| kolom | sumber |
|---|---|
| `customer_name`, `customer_id` | `customers` |
| `customer_phone` | `users.phone` (lewat `customers.user_id`) |
| `address_label`, `address_line`, `building`, `floor`, `unit`, `full_address` | `addresses` |
| `distance_m` | haversine `couriers.latitude/longitude` → `addresses.latitude/longitude` |
| `tip_jod`, `total_jod`, `payment_method`, `payment_status`, `zone_code`, `otp_verified` | `orders` |
| `checkpoint_at` | `max(checkpoints.at)` order itu |
| `items` | `order_items` sbg `jsonb` (`name`, `qty`, `line_total_jod`, `modifiers`) |

Diperlukan karena RLS `customers_owner` (`user_id = app_uid()`) dan
`addresses_owner` menolak kurir; memberi grant tabel akan membocorkan data semua
customer. RPC menyaring ke `co.user_id = app_uid()` sehingga hanya kurir yang
ditugaskan ke order itu yang bisa membacanya.

### SQL (apply ulang bila project dibuat ulang)

```sql
create or replace function public.courier_orders()
returns table(
  id bigint, code text, status text, customer_id bigint,
  customer_name text, customer_phone text,
  address_label text, address_line text, building text, floor text, unit text,
  full_address text, distance_m double precision,
  total_jod numeric, tip_jod numeric, payment_method text, payment_status text,
  zone_code text, otp_verified boolean,
  created_at timestamptz, placed_at timestamptz, courier_id bigint,
  checkpoint_at timestamptz, items jsonb
)
language sql
stable
security definer
set search_path to 'public'
as $fn$
  with me as (
    select co.id, co.latitude, co.longitude
    from couriers co
    where co.user_id = public.app_uid()
  )
  select
    o.id, o.code, o.status, o.customer_id,
    c.name, u.phone,
    a.name, a.address, a.building, a.floor, a.unit, a.full_address,
    case
      when me.latitude is not null and a.latitude is not null then
        6371000 * 2 * asin(sqrt(
          power(sin(radians((a.latitude - me.latitude) / 2)), 2) +
          cos(radians(me.latitude)) * cos(radians(a.latitude)) *
          power(sin(radians((a.longitude - me.longitude) / 2)), 2)
        ))
    end,
    o.total_jod, o.tip_jod, o.payment_method, o.payment_status, o.zone_code, o.otp_verified,
    o.created_at, o.placed_at, o.courier_id,
    (select max(cp.at) from checkpoints cp where cp.order_id = o.id),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', oi.name, 'qty', oi.qty,
        'line_total_jod', oi.line_total_jod, 'modifiers', oi.modifiers
      ) order by oi.id)
      from order_items oi where oi.order_id = o.id
    ), '[]'::jsonb)
  from orders o
  join me on me.id = o.courier_id
  left join customers c on c.id = o.customer_id
  left join users u on u.id = c.user_id
  left join addresses a on a.id = o.delivery_address_id
  order by o.created_at desc;
$fn$;
```

Setelah DDL: `notify pgrst, 'reload schema';` (PostgREST cache skema).

## 2. OTP

Kode OTP ada di `orders.otp` (dari trigger `orders_assign_otp`, 4 digit acak) dan
**tidak** bisa dibaca `authenticated` — sengaja, supaya tak bocor lewat select.

- **Customer** membacanya lewat RPC `my_order_otp(p_order_id)` (pemilik order) →
  ditampilkan sebagai kartu serah-terima.
- **Kurir** tidak pernah melihatnya; ia memanggil `verify_order_otp(p_order_id,
  p_code)`. Fungsi mencocokkan kode, menandai `orders.otp_verified`, dan mencatat
  checkpoint `otp_verified`. Kembalian `true` hanya saat benar.
- `otpOf(code)` di FE hanya fallback mock untuk order tanpa baris BE.

## 3. Tulis status & checkpoint

- Status order ditulis kurir dengan **sesi kurir**:
  `updateOrderStatus(id, status, 'courier')`. RLS `orders_participant` mengizinkan
  karena `courier_id` milik kurir itu.
- Checkpoint kurir ditulis ke `checkpoints(kind)` dengan nilai yang diizinkan
  `at_store | picked_up | arrived | otp_verified`. Pemetaan ada di
  `CHECKPOINT_KIND` (`src/api/orders.ts`); `otp_verified` **tidak** ditulis FE
  karena `verify_order_otp` sudah melakukannya (hindari duplikat).

## 4. Metode bayar

`orders_payment_method_check` = `cod | transfer | xendit_va | xendit_qris | wallet`.
Aplikasi memetakan `wallet → wallet`; DANA VA/QRIS masih proksi `xendit_*`
(kontrak DANA belum diperbarui, lihat `docs/integration/dana/be-contract.md` D2).
Saat membaca, `IN_PAYMENT` memetakan `xendit_va → dana_va`, `xendit_qris →
dana_qris`.
