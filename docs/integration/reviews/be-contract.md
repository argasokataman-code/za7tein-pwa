# Kontrak BE — Ulasan & balasan (`rating_reviews`, `review_replies`)

Status: **terpasang** di proyek Supabase `dwzxtnfesmpobnepilhl`. Tabelnya sudah ada
dari skema awal; yang ditambahkan lewat kontrak ini hanya dua index unik parsial
(bagian §5) supaya aturan "satu penilaian per order" benar-benar ditegakkan.

Scope produknya (`f19-rating-review`) berstatus revisi **`proposed`** — belum
mengubah `activeRevision`. Lapisan ini membangun kontrak teknis di atas tabel yang
sudah ada; ia tidak mengklaim rating/review sebagai requirement aktif. Lihat
API-SPEC §2.1/G16.

## 1. Tabel

### `rating_reviews`

| kolom | tipe | catatan |
|---|---|---|
| `id` | bigint PK | |
| `order_id` | bigint FK `orders` | wajib |
| `customer_id` | bigint FK `customers` | wajib |
| `merchant_id` | bigint FK `merchants` | terisi ⟺ ulasan **toko** |
| `menu_id` | bigint FK `menus` | terisi ⟺ ulasan **hidangan** |
| `rating` | int | `check 1..5` |
| `review` | text | opsional (bintang saja sah) |
| `window_closes_at` / `edited_at` / `deleted_at` | timestamptz | belum dipakai FE; jendela pengisian masih UNRESOLVED di f19 |
| `created_at` | timestamptz | `default now()` |

Satu baris hanya boleh salah satu jenis — `check ((merchant_id is not null) <>
(menu_id is not null))`. Jadi **ulasan hidangan tidak membawa `merchant_id`**;
ulasan hidangan milik seorang merchant disaring lewat join `menus.merchant_id`.

### `review_replies`

| kolom | tipe | catatan |
|---|---|---|
| `id` | bigint PK | |
| `review_id` | bigint FK `rating_reviews` | `on delete cascade` |
| `merchant_id` | bigint FK `merchants` | pemilik balasan |
| `body` | text | |
| `created_at` | timestamptz | `default now()` |

Tidak ada batas jumlah balasan per ulasan (f19 menandainya UNRESOLVED). FE
menampilkan balasan terbaru; kalau kelak dibatasi satu, tambahkan index unik
`(review_id)`.

### `menu_reviews` (legacy)

`id, menu_id, name, avatar, rating, text, created_at` — ulasan menu lama **tanpa
kaitan order**. Tidak dipakai FE: `name` datang dari kolom sendiri (bukan
`customers`), tidak terhubung ke merchant mana pun, dan tak bisa dibalas karena
`review_id`-nya bukan baris `rating_reviews`.

## 2. RLS

| tabel | policy | efek |
|---|---|---|
| `rating_reviews` | `rating_reviews_public_read` (SELECT, `true`) | siapa pun boleh baca |
| `rating_reviews` | `rating_reviews_customer` (ALL) | customer hanya baris `customer_id` miliknya |
| `rating_reviews` | `rating_reviews_ops` (ALL, `app_is_ops()`) | panel CS |
| `review_replies` | `review_replies_public_read` (SELECT, `true`) | balasan tampil publik |
| `review_replies` | `review_replies_owner` (ALL) | merchant hanya untuk `merchant_id` miliknya |
| `review_replies` | `review_replies_ops` (ALL, `app_is_ops()`) | panel CS |
| `customers` | `customers_ops` / `customers_owner` | **nama pemberi ulasan hanya terbaca ops/pemilik** — sesi merchant mengembalikan nol baris |

Konsekuensi FE: daftar ulasan merchant dibaca memakai sesi **referensi**
(`refToken`, akun CS) supaya nama reviewer ikut; tulis balasan memakai sesi
**merchant** (`merchantToken`).

## 3. Endpoint

| endpoint | tabel | sesi | catatan |
|---|---|---|---|
| `GET /merchants/{id}/reviews` | `rating_reviews` | publik | `merchant_id=eq.{id}` + join `menus.merchant_id` untuk hidangan |
| `POST /orders/{id}/review` | `rating_reviews` | customer | `customer_id` = pemilik token |
| `POST /reviews/{id}/reply` | `review_replies` | merchant | `merchant_id` = milik token |
| `GET /menu_reviews` | `menu_reviews` | publik | legacy — belum dipakai FE |

Query nyata yang dipakai `src/api/reviews.ts`:

```
rating_reviews?select=id,order_id,customer_id,menu_id,rating,review,created_at
  &merchant_id=eq.1&menu_id=is.null&deleted_at=is.null&order=created_at.desc

rating_reviews?select=…,menus!inner(name,merchant_id)
  &menu_id=not.is.null&deleted_at=is.null&menus.merchant_id=eq.1&order=created_at.desc

review_replies?select=id,review_id,body,created_at

customers?select=id,name,avatar&id=in.(…)
```

## 4. Yang sudah diuji (bukti)

- Baca publik: `GET rating_reviews?merchant_id=eq.1` → 200, 67 ulasan toko; join
  hidangan → 13 baris; `menu_reviews` → 3 baris; `review_replies` → kosong.
- Tulis balasan (sesi merchant 1): `POST review_replies {review_id, merchant_id:1,
  body}` → `201`; baca publik melihatnya; `DELETE` id sendiri → `204`.
- Kirim ulasan (sesi customer): `POST rating_reviews {order_id, customer_id:1,
  merchant_id:1, menu_id:null, rating:5}` → `201`; ulangan → `409 23505`
  (`rating_reviews_store_uniq`); hapus → `204`.
- Merchant menulis `merchant_id` merchant lain → `403 42501` (policy owner).

## 5. SQL (index unik parsial)

Unique lama `(order_id, customer_id, merchant_id, menu_id)` **bocor**: Postgres
menganggap `NULL` berbeda, jadi baris ulasan toko (`menu_id` null) dan ulasan
hidangan (`merchant_id` null) bisa dibuat berkali-kali untuk order yang sama.
Tambahan ini yang menutupnya:

```sql
create unique index if not exists rating_reviews_store_uniq
  on public.rating_reviews (order_id, customer_id)
  where menu_id is null and deleted_at is null;

create unique index if not exists rating_reviews_menu_uniq
  on public.rating_reviews (order_id, customer_id, menu_id)
  where menu_id is not null and deleted_at is null;

notify pgrst, 'reload schema';
```

Kondisi `deleted_at is null` membuat ulasan yang di-soft-delete tidak menghalangi
penilaian ulang. Index ini terpasang 2026-10-15.

## 6. FE

- `src/api/reviews.ts` — `fetchMerchantReviews`, `replyToReview`,
  `fetchReviewableOrders`, `submitOrderReview`.
- `src/pages/MerchantReviews.tsx` — rute `/merchant/reviews`: baca ulasan toko +
  hidangan, ringkasan rata-rata/distribusi dihitung dari daftar yang dimuat,
  balas lewat sheet (`review_replies`).
- `src/pages/Reviews.tsx` — rute customer `/reviews`: daftar pesanan `done` yang
  belum diulas → form bintang toko + catatan.

## 7. Sisa (UNRESOLVED / belum)

- **Ulasan hidangan dari customer** butuh `menu_id`; `order_items` di BE masih
  kosong → belum bisa menentukan hidangan mana dari order. Untuk sekarang
  customer hanya mengirim penilaian toko.
- **Bintang kurir** (`C-06`, dinilai *untuk merchant*) belum punya kolom di
  `rating_reviews`; layar `RatingDriver` masih state tampilan.
- Jendela pengisian (`window_closes_at`), edit/hapus, tag cepat, moderasi,
  tip — UNRESOLVED di `f19-rating-review`.
