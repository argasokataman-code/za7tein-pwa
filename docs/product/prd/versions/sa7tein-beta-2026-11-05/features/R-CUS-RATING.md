# R-CUS-RATING — Rating merchant & rating menu

Status: partial (rating merchant ada) · sumber §19.2, §10 CUS-27/CUS-28.

## 1. Untuk apa

Customer memilih merchant dari rating, dan merchant perlu tahu menu mana yang lemah. Rating menu dipisahkan dari merchant karena satu menu buruk tidak berarti tokonya buruk.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Rating merchant: bintang 1–5 **+ review**, untuk order yang selesai | §19.2, CUS-27 |
| A2 | Rating menu item: bintang 1–5 **tanpa review**, dari order yang selesai | §19.2, CUS-27 |
| A3 | **Tidak ada rating per varian**; varian opsi tidak dinilai terpisah | §19.2 |
| A4 | Diisi di **detail order** yang dibuka dari riwayat order | §19.2 |
| A5 | **Tanpa batas waktu** pengisian | §19.2, OPEN-21 |
| A6 | Review **tidak dimoderasi** ops | §19.2, OPEN-21 |
| A7 | Rating merchant tampil di browse + detail; review merchant + rating menu tampil di detail | CUS-28 |
| A8 | Rating baru memicu event ke merchant dan customer yang melihat merchant itu | §18 |

## 3. Aktor & permukaan

- Customer — detail order selesai, form rating merchant + menu.
- Merchant — melihat rating/review (via detail merchant); event realtime.
- Customer lain — melihat agregat di browse/detail.

## 4. Masukan → keluaran

- Masuk: bintang, review (merchant), bintang per menu.
- Keluar: rating merchant, rating menu, event `rating_submitted`.

## 5. State UI

| State | Tampilan |
|---|---|
| belum dinilai | CTA "Beri rating" di detail order |
| sudah dinilai | bintang + review tampil, tidak bisa diubah (belum diatur PRD) |
| rating menu | bintang per item, tanpa kolom teks |

## 6. Kontrak BE (handoff, repo ini mock)

Field `rating` 1–5 + `review` (merchant) dan `rating` per menu item. Tanpa entitas rating varian. Agregat ditampilkan di browse/detail.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Form rating menu tidak punya kolom teks | inspeksi form | ⛔ |
| AC2 | Tidak ada rating per varian | inspeksi model + form | ⛔ |
| AC3 | Rating hanya muncul untuk order `done` | buka order non-done → tidak ada CTA | 🟡 |
| AC4 | Rating merchant tampil di kartu browse | banding nilai agregat | 🟡 `types.ts:21` |
| AC5 | Rating tersimpan tanpa batas waktu | buka order lama → form masih bisa | 🟡 |

## 8. UNRESOLVED

- Perilaku mengubah rating yang sudah dikirim tidak diatur PRD; jangan dikarang.

## 9. Bukti

- Kode: `src/pages/RatingDriver.tsx`, `Reviews.tsx`, `MerchantReviews.tsx`, `src/types.ts:21,100`.
