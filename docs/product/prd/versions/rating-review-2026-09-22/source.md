# BRS — Rating & Review (customer → merchant, kurir, menu)

| Field | Isi |
|---|---|
| Jenis | BRS (Business Requirement Specification) — pelengkap PRD aktif |
| Status | `proposed` (menunggu keputusan aktivasi tertulis di `manifest.json`) |
| Tanggal | 2026-09-22 |
| Keputusan PO | 2026-09-22: **rating masuk MVP sebagai requirement**; bentuknya mengikuti pola umum aplikasi pesan-antar makanan (bintang + ulasan). Nama produk lain tidak dipakai di dokumen ini. |
| Berlaku untuk | `sa7tein-pwa` (Irbid MVP), repo front-end saja (AGENTS.md §1) |
| Dasar | Keputusan PO 2026-09-22 · silang `C-12` (dispute = jalur terpisah), `C-06` (kurir = karyawan merchant) · `docs/product/schema-draft-v1.md` entri 17 hanya dipakai untuk nama tabel/field, bukan aturan |

## 1. Masalah bisnis

Pembeli memilih merchant berdasarkan rasa percaya. Di MVP belum ada sinyal kualitas apa pun: merchant baru dan merchant lama tampil sama. Tanpa sinyal itu pembeli cenderung mengulang merchant yang sudah dikenal, merchant baru sulit dapat order, dan insentif Founding Merchant (`R-INCENTIVE-01`) bekerja tanpa umpan balik kualitas. Ulasan juga memberi merchant masukan konkret (rasa, porsi, kecepatan) yang tidak tertangkap angka order.

## 2. Aktor & kepentingan

| Aktor | Kepentingan |
|---|---|
| Customer | Menilai pengalaman setelah pesanan selesai; melihat penilaian orang lain sebelum memesan |
| Merchant | Mendapat umpan balik kualitas; melihat penilaian kurirnya sendiri (kurir = karyawan merchant, `C-06`) |
| Kurir | Dinilai atas pengantaran; nilainya masuk ke merchant, bukan ke platform |
| Platform | Menyediakan sinyal kualitas + bahan pertimbangan; **tidak** memakai rating sebagai jalur sengketa (`C-12`) |

## 3. Aturan bisnis

**BR-1 — Kapan dinilai.** Penilaian hanya untuk order berstatus `done`. Prompt muncul setelah order selesai; customer boleh **melewati** tanpa menilai.

**BR-2 — Tiga sasaran penilaian, satu penilaian per order.**
- bintang 1–5 untuk **merchant** — wajib bila customer mengirim penilaian
- bintang 1–5 untuk **kurir** — wajib bila order diantar kurir (order tanpa kurir: bagian ini tidak tampil). Layar penilaian kurir sudah ada di repo: `src/pages/RatingDriver.tsx`.
- bintang 1–5 per **menu** — opsional, melekat pada hidangan yang dipesan. Model data yang sudah ada menyimpan ulasan per hidangan (`src/data/merchantReviews.ts`: `foodId`, `foodName`).

**BR-3 — Ulasan teks.** Teks ulasan opsional, satu kolom untuk pengalaman keseluruhan (bukan per menu). Boleh kosong: penilaian bintang saja tetap sah.

**BR-4 — Tag cepat.** Daftar tag pendek yang bisa dipilih cepat (mis. soal rasa, porsi, kecepatan, keramahan). Sifatnya opsional dan mempercepat pengisian di ponsel. **Daftar tag final belum ditetapkan** (UNRESOLVED).

**BR-5 — Satu penilaian per order.** Order yang sama tidak bisa dinilai dua kali. Mengubah atau menghapus penilaian setelah dikirim belum diputuskan (UNRESOLVED).

**BR-6 — Hanya peserta order.** Yang boleh menilai hanya customer pemilik order itu.

**BR-7 — Rating bukan sengketa.** Penilaian buruk tidak membekukan dana, tidak membuka sengketa, dan tidak mengubah status order. Sengketa tetap lewat jalur sendiri (`C-12`), dan tidak ada hukuman finansial yang dipicu rating.

**BR-8 — Kurir dinilai untuk merchant.** Karena kurir digaji merchant (`C-06`), penilaian kurir tampil di konsol merchant sebagai penilaian karyawan — bukan di halaman publik merchant.

**BR-9 — Yang ditampilkan ke pembeli.**
- kartu merchant: rata-rata bintang + jumlah penilaian
- halaman merchant: rata-rata, sebaran bintang, dan ulasan terbaru
- detail menu: rata-rata bintang menu itu (bila ada penilaian menu)
- angka yang ditampilkan hanya dari order yang benar-benar dinilai; merchant tanpa penilaian tidak menampilkan angka nol palsu (tampil "belum ada penilaian")

**BR-10 — Balasan merchant.** Merchant boleh membalas ulasan masuk. **Sudah diputuskan dan sudah ada di repo:** state balasan per ulasan (`setReviewReply` di `src/store/slices/merchantSlice.ts`, data awal `merchantReviewReplies`). Batas jumlah balasan per ulasan belum ditetapkan (usulan: satu).

**BR-11 — Tanpa insentif.** Tidak ada uang, kupon, atau kredit yang diberikan untuk memberi penilaian.

**Catatan layar (bukan requirement baru).** Layar pasca-order ini juga memuat **tip kurir** — keputusan PO 2026-09-22 (digabung, bukan layar terpisah). Aturan tip milik PRD §Tips (`source.md:78-84`): opsional & sukarela, 100% ke kurir tanpa komisi platform, dipotong dari wallet customer → wallet kurir via internal ledger, withdraw menunggu akumulasi. **Fee payout tips ditanggung kurir** (keputusan PO 2026-09-22 — `source.md:84`). UNRESOLVED tip yang tersisa: **angka ambang minimum withdraw** — catatannya di `docs/design/flows/f6-cashout-payout/`.

## 4. Dampak tampilan (front-end mock)

| Layar | Isi | Bukti di repo |
|---|---|---|
| Prompt penilaian | Muncul dari layar order selesai; tombol "Nilai" + "Nanti/lewati" | belum ada (baru di BRS ini) |
| Form penilaian kurir | Bintang 1–5 + tombol kirim | `src/pages/RatingDriver.tsx` |
| Form penilaian merchant & menu | Bintang merchant, bintang per menu, kolom teks | belum ada layar terpadu; data ulasan per hidangan sudah ada |
| Halaman ulasan merchant | Rata-rata, distribusi bintang 5→1, daftar ulasan + nama + bintang | `src/pages/Reviews.tsx` |
| Konsol merchant | Daftar ulasan masuk + balasan + filter per hidangan | `src/pages/MerchantReviews.tsx`, `src/data/merchantReviews.ts` (`averageRating`, `ratingDistribution`, `reviewFilters`, `setReviewReply`) |
| Detail menu | Rata-rata bintang menu | belum ada |
| Riwayat pesanan | Penanda "sudah dinilai / belum dinilai" | belum ada |

Data mock hidup di `src/data/`, state di Redux; tidak ada perhitungan backend di repo ini.

## 5. UNRESOLVED (jangan ditebak)

1. Jendela pengisian: berapa hari setelah `done` penilaian masih boleh dikirim?
2. Boleh mengubah / menghapus penilaian setelah dikirim? Berapa lama?
3. Daftar tag cepat final (dan apakah tag wajib dipilih salah satu)?
4. Batas balasan merchant per ulasan (repo sekarang: satu balasan per ulasan).
5. Moderasi ulasan (kata kasar, spam, ulasan palsu) — siapa menangani?
6. Penilaian kurir: tetap masuk MVP? (layar `RatingDriver.tsx` sudah ada, tetapi bukan berarti fitur aktif)
7. Ambang jumlah penilaian sebelum rata-rata ditampilkan ke publik?
8. Apakah penilaian bisa diisi dari riwayat pesanan (bukan hanya dari prompt)?

## 6. Kontrak backend masa depan (catatan, bukan implementasi)

- Field per penilaian: `order`, `customer`, `merchant`, `courier | null`, `rating_merchant`, `rating_courier | null`, `review | null`, `tags[]`, `created_at`, `updated_at`
- Field per menu: `order`, `menu`, `rating`
- Aturan validasi milik server: satu penilaian per order, hanya peserta order, order wajib `done`
- Event: `review_prompted`, `review_submitted`, `review_replied` (bila BR-10 diputuskan)
- Agregat: rata-rata per merchant, per menu, per kurir — dihitung di luar repo ini
