# R-CUS-RATING — Rating merchant & menu item

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §20.2, §10 (CUS-27, CUS-28), §14 · flow `f19-rating-review` · milestone **M8**.
Status: partial · terakhir ditinjau: 2026-10-17.

## 1. Untuk apa

Penilaian adalah satu-satunya umpan balik yang tersisa setelah uang berpindah. Karena itu bentuknya sengaja ringan: toko dinilai bintang 1–5 **dengan** review, hidangan dinilai bintangnya saja **tanpa** review. PRD juga memisahkan dua hal yang gampang tercampur: rating **bukan** jalur sengketa, dan review **tidak** dimoderasi ops.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| R1 | Rating merchant: bintang 1–5 **+ review** untuk order yang selesai | §20.2, CUS-27 |
| R2 | Rating menu item dari order yang selesai: bintang 1–5 **tanpa** review | §20.2, CUS-28 |
| R3 | **Tidak ada rating per variant** — penilaian hanya di level menu item | §14, §20.2 |
| R4 | Rating dan review diisi di **layar detail order yang dibuka lewat menu riwayat order** | §20.2, CUS-27/28 |
| R5 | **Tanpa batas waktu** pengisian | §20.2 |
| R6 | Review **tidak** dimoderasi ops | §20.2 |
| R7 | Rating merchant tampil di **browse** dan **detail merchant**; review merchant + rating menu tampil di **detail** | §20.2 |
| R8 | Rating bukan jalur sengketa: tidak membekukan dana, tidak mengubah status order, tidak memicu insiden | §20.2 + `f19` (BR-7/BR-11) |

## 3. Acceptance (cara ukur)

| AC | Perilaku | Cara ukur | Status |
|---|---|---|---|
| AC1 | Merchant dinilai bintang 1–5 + review, satu penilaian per order | form `/reviews` (sheet) → `rating_reviews`; index unik parsial BE | ✅ sudah tersambung BE |
| AC2 | Menu item dinilai **bintang saja**, tanpa review, **tanpa** sasaran varian | `ratingTargetsFor()` + `VARIANT_RATING_SUPPORTED=false`; assert di `scripts/rating-check.mjs` | ⚠️ aturan + bentuk sasaran sudah pasti; jalur tulis ditahan BE (`order_items` kosong) |
| AC3 | Diisi dari detail order via **menu riwayat**, **tanpa batas waktu** | `/orders` (riwayat) → deep link `/reviews?order=<kode>`; `RATING_WINDOW_DAYS === null`; `fetchOrderHistory` tanpa penyaring tanggal | ✅ halaman riwayat baru + deep link; menu riwayat sebelumnya **tidak ada** |
| AC4 | Skala bintang 1–5 untuk merchant maupun menu item | `RATING_SCALE` + `isValidRating()`; radiogroup di form | ✅ diuji |
| AC5 | Review tidak dimoderasi ops; rating tidak mengalir ke sengketa | `RATING_MODERATED=false`; tidak ada layar moderasi; `DisputeSubmit` tak memakai rating | ✅ diuji |
| AC6 | Rating toko tampil di browse + detail; rating menu tampil di detail | `MerchantCard`, `MerchantPage` (bintang + jumlah ulasan), `MenuDetail` (bintang menu) | ✅ tampilan sudah ada; daftar ulasan sisi customer sengaja tidak dibuat (lihat §6) |

## 4. State & layar

- Riwayat + pintu masuk: `/orders` (`src/pages/OrderHistory.tsx`, baru) — order selesai, penanda sudah dinilai atau belum, tanpa penyaring tanggal; pintu dari Profil.
- Form: `/reviews` (`src/pages/Reviews.tsx`, sheet "Beri ulasan") — bintang toko (wajib) + catatan (opsional); menerima deep link `?order=<kode>` dari riwayat.
- Aturan murni: `src/data/rating.ts` (skala, bentuk pengisian, larangan varian, jendela waktu, event, sasaran penilaian, rata-rata).
- Data & API: `src/api/reviews.ts` (`fetchOrderHistory` + `fetchReviewableOrders` yang kini menurunkan diri dari riwayat, `submitOrderReview` → tabel `rating_reviews`).
- Konsol merchant: `/merchant/reviews` (`MerchantReviews.tsx`) menerima ulasan + membalas (`review_replies`); ditahan flow `f12`.

## 5. Data & kontrak BE

- Tabel `rating_reviews` menampung dua jenis baris: ulasan **toko** (`merchant_id` terisi, `menu_id` null) dan ulasan **hidangan** (`menu_id` terisi) — jadi tidak ada kolom "variant" sama sekali, sejalan R3.
- Field: `order_id`, `customer_id`, `merchant_id`, `menu_id`, `rating` (1–5), `review` (teks opsional).
- Event: `rating_submitted` — nama ini dari `analysis.md:27` (tabel requirement delta), **bukan** dari PDF PRD; jangan dikutip sebagai teks PRD.
- Rata-rata yang tampil di browse memakai kolom agregat BE (`merchants.rating_avg` / `rating_count`), bukan hitung sendiri di JSX.

## 6. Yang belum (blocked)

- **Jalur tulis rating menu item (R2).** Form butuh daftar hidangan yang dipesan, dan `order_items` di BE masih kosong; `rating_reviews.menu_id` ada, tapi tak ada sumber nama/urutan hidangan. Selama itu `MENU_RATING_AVAILABLE = false` dan form menyebut alasannya, bukan menampilkan bintang per hidangan tanpa nama hidangan.
- **Daftar ulasan sisi customer.** §20.2 hanya meminta rating tampil di browse + detail, dan daftar ulasan lengkap sudah ada di konsol merchant (`/merchant/reviews`). Tautan "Lihat semua" di detail menu yang dulu menunjuk halaman **form** ulasan customer dihapus (salah tujuan).
- Moderasi (memang tidak diminta, R6) dan pengubahan/penghapusan penilaian setelah kirim (lihat §7).

## 7. UNRESOLVED

- **Ambil-ulang/penghapusan penilaian** setelah dikirim — tidak disebut PRD (§20.2 hanya menolak moderasi dan batas waktu).
- **Ambang jumlah ulasan sebelum rata-rata layak tampil** — tidak disebut PRD; sekarang angka BE ditampilkan apa adanya.
- **Tag cepat ulasan** (daftar tag) — disebut di BRS `rating-review-2026-09-22` (`proposed`), tidak ada di revisi aktif; jangan dikarang.
- **Rating kurir** — BRS lama menaruhnya di layar pasca-order (`/rating-driver`, masih state tampilan); revisi aktif §20.2 hanya menyebut merchant dan menu item, jadi statusnya tidak dipaksakan di sini.

## 8. Bukti

- `src/data/rating.ts` + self-check `node --import ./scripts/lib/ts-resolve.mjs scripts/rating-check.mjs` (skala 1–5, merchant butuh review vs menu tanpa review, larangan varian, `RATING_WINDOW_DAYS === null`, `RATING_MODERATED === false`, sasaran penilaian = toko + tiap menu, rata-rata satu desimal, `ratingSummary([])` → `null` bukan 0).
- `src/pages/OrderHistory.tsx` (baru, rute `/orders` di `src/App.tsx`, pintu dari `src/pages/Profile.tsx`) + `fetchOrderHistory` di `src/api/reviews.ts`; `fetchReviewableOrders` kini menurunkan diri dari riwayat supaya dua daftar tak bisa berbeda.
- Deep link: `src/pages/Reviews.tsx` menerima `?order=<kode>` (kode, bukan id, agar sama dengan `/order-arrived?order=`).
- Tampilan: `src/components/ui/MerchantCard.tsx`, `src/pages/MerchantPage.tsx`, `src/pages/MenuDetail.tsx`.
- Flow: `docs/design/flows/f19-rating-review/` (catatan status di README), `features/_baseline.json` (R-CUS-RATING keluar dari daftar requirement tanpa definisi).
