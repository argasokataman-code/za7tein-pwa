# Analysis: rating-review-2026-09-22

Status: REVIEWED. Active baseline: irbid-mvp-v2-2026-09-21 (revisi ini **proposed**; belum mengubah `activeRevision`).

## Source inventory
- Version printed in document: UNVERIFIED (BRS baru, tidak ada versi cetak)
- Pages/sections read: seluruh `source.md` (1–6: masalah bisnis, aktor, BR-1…BR-11, dampak tampilan, UNRESOLVED, kontrak BE)
- SHA-256: ef0aea351b8bc8dcedce9b0a0b524f95ac8d182aee3091fb3586a25eace12e26
- Keputusan PO 2026-09-22: **rating masuk MVP sebagai requirement**; bentuk mengikuti pola umum aplikasi pesan-antar makanan (bintang + ulasan). Nama produk lain tidak dipakai.
- Dasar silang: `C-06` (kurir = karyawan merchant), `C-12` (dispute jalur terpisah), `R-INCENTIVE-01` (insentif Founding tanpa umpan balik kualitas)

## Requirement delta
| Requirement ID | Source page/section | Current rule | New rule | UI/state impact | BE contract | Decision/status |
|---|---|---|---|---|---|---|
| R-RATE-01 | BR-1, BR-2, BR-3, BR-5, BR-6 | Tidak ada penilaian di PRD aktif. Repo punya layar tanpa aturan: `src/pages/RatingDriver.tsx` (bintang kurir), `src/data/merchantReviews.ts` mencatat "Di luar PRD aktif — UNRESOLVED: FR-MC tidak menyebut ulasan/respons" | Penilaian hanya untuk order `done`; satu penilaian per order; bintang merchant wajib, bintang kurir wajib bila order pakai kurir, bintang per menu opsional; teks ulasan opsional (bintang saja tetap sah); hanya peserta order | Prompt dari layar order selesai + form penilaian terpadu + status terkirim + penanda "sudah/belum dinilai" di riwayat pesanan. `RatingDriver.tsx` jadi bagian form (kurir), bukan layar terpisah tanpa konteks order | Field: `order`, `customer`, `merchant`, `courier \| null`, `rating_merchant`, `rating_courier \| null`, `review \| null`, `tags[]`, `created_at`. Event: `review_prompted`, `review_submitted`. Validasi milik server: 1 penilaian/order, peserta saja, order wajib `done` | DECIDED (aturan inti) |
| R-RATE-02 | BR-9 | Repo menampilkan angka mock tanpa dasar aturan: `src/pages/Reviews.tsx` (rata-rata 4.9, distribusi 5→1, daftar ulasan) | Rata-rata + jumlah penilaian di kartu merchant; halaman merchant: rata-rata, distribusi, ulasan terbaru; detail menu: rata-rata bintang menu; merchant tanpa penilaian menampilkan "belum ada penilaian", bukan 0 | Halaman `Reviews.tsx` dipertahankan sebagai halaman ulasan merchant; perlu sumber data tunggal (sekarang `merchantReviews` per hidangan + angka hardcode di `Reviews.tsx`) | Agregat rata-rata per merchant/menu/kurir dihitung di luar repo ini | DECIDED (bentuk tampilan) / UNRESOLVED (ambang jumlah ulasan sebelum tampil) |
| R-RATE-03 | BR-10 | Balasan merchant sudah ada tapi tanpa dasar PRD: `setReviewReply` di `src/store/slices/merchantSlice.ts`, data awal `merchantReviewReplies`, UI `src/pages/MerchantReviews.tsx` (filter per hidangan) | Merchant boleh membalas ulasan; batas balasan per ulasan belum ditetapkan (usulan satu) | Konsol merchant: daftar ulasan + balasan + filter per hidangan | Field balasan: `review_reply`, `replied_at`; event `review_replied` | DECIDED (adopsi yang sudah ada) / UNRESOLVED (batas balasan) |
| R-RATE-04 | BR-7, BR-11 | Tidak ada aturan | Rating **bukan** jalur sengketa: tidak membekukan dana, tidak mengubah status order, tidak memicu incident (`C-12`); tidak ada insentif/kupon untuk menilai | Tidak ada tombol/aksi finansial di layar penilaian | Tidak ada event finansial dari rating | DECIDED |
| R-RATE-05 | BR-4 | Tidak ada | Tag cepat opsional untuk mempercepat pengisian di ponsel | Chip pilihan di form penilaian | Field `tags[]` | UNRESOLVED (daftar tag final, wajib atau tidak) |

## Conflicts and open questions
- **Tidak ada konflik** dengan PRD aktif `irbid-mvp-v2-2026-09-21`: revisi itu tidak menyebut rating sama sekali.
- **Konflik internal repo:** `src/data/merchantReviews.ts` menyatakan ulasan "di luar PRD aktif" — setelah BRS ini aktif, komentar itu harus diperbarui (jangan tinggalkan kebenaran ganda).
- **Dua sumber angka di UI:** `Reviews.tsx` memakai angka hardcode (4.9 / 120 ulasan) sementara `src/data/merchantReviews.ts` punya `averageRating()` + `ratingDistribution()`. Saat diimplementasikan, pakai satu sumber.
- Open questions yang belum boleh ditebak: jendela pengisian (BR-1), edit/hapus penilaian (BR-5), daftar tag (BR-4), batas balasan (BR-10), moderasi ulasan, rating kurir tetap di MVP?, ambang ulasan sebelum rata-rata tampil (BR-9), pengisian dari riwayat pesanan.

## Repo impact and evidence
Target: repo ini (`sa7tein-pwa`), front-end saja (AGENTS.md §1).

### Existing files — affected
| File | Requirement | Status | Notes |
|---|---|---|---|
| `src/pages/RatingDriver.tsx` | R-RATE-01 | **partial** | Layar bintang kurir sudah ada (state lokal `rating`, submit → toast). Belum terhubung ke order, belum ada bintang merchant/menu/teks |
| `src/pages/Reviews.tsx` | R-RATE-02 | **partial** | Halaman ulasan merchant: rata-rata, distribusi 5→1, daftar ulasan. Angka **hardcode** (4.9, 120) — belum dari data |
| `src/pages/MerchantReviews.tsx` | R-RATE-03 | **partial** | Daftar ulasan merchant + balasan (`setReviewReply`) + filter per hidangan |
| `src/data/merchantReviews.ts` | R-RATE-01, R-RATE-02 | **partial** | 8 ulasan mock per hidangan; `averageRating()`, `ratingDistribution()`, `reviewFilters()`, `reviewsForFilter()`. Komentar "di luar PRD aktif" perlu diperbarui |
| `src/store/slices/merchantSlice.ts` | R-RATE-03 | **partial** | `reviewReplies` + `setReviewReply` |
| `src/types.ts` | R-RATE-01 | **partial** | Tipe `MerchantReview` ada (per hidangan, belum per order) |
| `src/App.tsx` | R-RATE-01 | **partial** | Rute layar rating/ulasan sudah terdaftar (46 rute legacy) |

### New files needed (bila revisi diaktifkan)
| File | Requirement | Purpose |
|---|---|---|
| Layar form penilaian terpadu (nama menyusul, mis. `OrderRating.tsx`) | R-RATE-01 | Bintang merchant + kurir + menu, teks, tag, kirim — dalam konteks satu order |
| `src/data/ratings.ts` | R-RATE-01 | Data mock penilaian per order + fungsi turunan (bukan angka di JSX) |
| Slice state penilaian (mis. `ratingSlice.ts`) | R-RATE-01 | Status "sudah dinilai / belum" per order |
| Rata-rata bintang di `src/pages/MenuDetail.tsx` | R-RATE-02 | Satu sumber dengan `averageRating()` |

### Files NOT affected
- `src/components/OrderStageScreen.tsx` — alur order tidak berubah; penilaian terjadi setelah `done`
- `src/data/merchant.ts` — tidak menyentuh fee/zona

### Acceptance criteria (front-end mock, dapat diuji)
1. Order `done` menampilkan prompt penilaian; tombol lewati berfungsi.
2. Form menolak kirim bila bintang merchant kosong; bintang kurir hanya muncul bila order punya kurir.
3. Penilaian teks kosong tetap bisa dikirim (bintang saja).
4. Order yang sudah dinilai tidak bisa dinilai lagi — tampil sebagai "sudah dinilai" di riwayat.
5. Rata-rata & distribusi di halaman ulasan dihitung dari satu sumber data mock.
6. Balasan merchant tersimpan di state dan tampil di bawah ulasan.
7. Tidak ada aksi finansial apa pun di layar penilaian (BR-7, BR-11).

## Status aktivasi
- Revisi ini **proposed**. `activeRevision` tetap `irbid-mvp-v2-2026-09-21`.
- Untuk mengaktifkan: tulis keputusan produk, ubah status revisi di `manifest.json`, lalu perbarui AGENTS.md, `.rules.json`, `/documentation`, dan atlas agar tidak ada kebenaran ganda (PRD README langkah 5).
