# Milestones: rating-review-2026-09-22

Status: REVIEWED. Revisi **proposed** — milestone di bawah rencana, jangan dijadwalkan sebagai pekerjaan aktif sampai aktivasi tertulis di `manifest.json`.

Baseline: `irbid-mvp-v2-2026-09-21`. Repo: front-end mock (AGENTS.md §1) — tidak ada API/DB.

| ID | Requirement IDs | Dependencies | Owner | Acceptance criteria | Mock state | BE contract | Status |
|---|---|---|---|---|---|---|---|
| M-RATE-0 | R-RATE-04 | — | produk | Aturan "rating bukan sengketa" & "tanpa insentif" tertulis dan disetujui | — | tanpa event finansial | ready |
| M-RATE-1 | R-RATE-01 | M-RATE-0, `f18-order-state:done` | front-end | Order `done` menampilkan prompt; form menolak kirim tanpa bintang merchant; bintang kurir hanya bila ada kurir; teks kosong boleh; order yang sudah dinilai tidak bisa dinilai dua kali | `src/data/ratings.ts` + slice penilaian; prompt di riwayat pesanan | `review_submitted` (order, customer, merchant, courier, rating_merchant, rating_courier, review, tags) | blocked-by-activation |
| M-RATE-2 | R-RATE-02 | M-RATE-1 | front-end | Rata-rata + jumlah ulasan di kartu merchant; halaman ulasan menampilkan rata-rata, distribusi 5→1, ulasan terbaru dari **satu** sumber data; merchant tanpa ulasan tampil "belum ada penilaian" (bukan 0) | `merchantReviews` jadi sumber tunggal; hapus angka hardcode di `Reviews.tsx`; rata-rata di `MenuDetail.tsx` | agregat dihitung di luar repo | blocked-by-activation |
| M-RATE-3 | R-RATE-03 | M-RATE-1 | front-end | Merchant bisa membalas ulasan; balasan tampil di bawah ulasan; filter per hidangan tetap jalan | `setReviewReply` di `merchantSlice` (sudah ada) + UI `MerchantReviews.tsx` | `review_replied` | blocked-by-activation |
| M-RATE-4 | R-RATE-05 | M-RATE-1 | produk → front-end | Daftar tag cepat ditetapkan produk; chip tag tampil di form; tag opsional | chip di form penilaian | `tags[]` | blocked-by-open-question |

## Urutan
1. **M-RATE-0** dulu (aturan bisnis) — selesai di BRS ini, tinggal keputusan aktivasi.
2. **M-RATE-1** → **M-RATE-2** → **M-RATE-3** (satu alur: isi penilaian → tampil → dibalas).
3. **M-RATE-4** menunggu daftar tag dari produk; jangan dikerjakan dengan tag karangan.

## Catatan konsistensi
- Komentar di `src/data/merchantReviews.ts` ("Di luar PRD aktif — UNRESOLVED") **wajib diperbarui** saat revisi aktif, supaya tidak ada dua kebenaran.
- `RatingDriver.tsx` tidak dihapus: jadi bagian form penilaian (kurir) di dalam konteks order.
- Flow diagram: `docs/design/flows/f19-rating-review/` — diselaraskan dengan BRS ini.
