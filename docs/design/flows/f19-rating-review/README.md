# F19 — Rating & Review

> **Status: requirement baru, revisi `proposed`.** Keputusan PO 2026-09-22: rating masuk MVP (bintang + ulasan, pola umum aplikasi pesan-antar makanan). BRS: `docs/product/prd/versions/rating-review-2026-09-22/source.md`; analisis: `analysis.md` + `milestones.md` di folder yang sama. Revisi ini **belum** mengubah `activeRevision` (tetap `irbid-mvp-v2-2026-09-21`) — lihat `../BUSINESS.md` §2.

Flow **layar** rating setelah order `done`: prompt penilaian → bintang merchant (wajib) → bintang kurir & per hidangan → teks & tag → kirim → ulasan tampil (rata-rata, distribusi, terbaru) dan bisa dibalas merchant. Repo ini front-end saja — semuanya layar mock (AGENTS.md §1).

| Berkas | Isi |
|---|---|
| `f19-rating-review.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f19-rating-review.html` | Artefak jadi |
| `f19-rating-review.visual-check.*` | Bukti visual-check |

## Alur layar

**Lane Prompt & tampilan ulasan:** Order `done` (`f18-order-state`) → prompt pasca-order (nilai + tip) ke customer (jendela pengisian UNRESOLVED; customer boleh lewati) → customer buka prompt → mengisi form → setelah kirim, ulasan tampil: rata-rata + jumlah di kartu merchant, halaman ulasan (rata-rata, distribusi 5→1, terbaru), rata-rata per hidangan di detail menu; merchant bisa membalas.

**Lane Form penilaian:** Bintang merchant 1..5 (wajib) → bintang kurir (wajib bila order pakai kurir) & bintang per hidangan (opsional) → teks & tag **+ tip kurir** (semua opsional; bintang saja tetap sah) → tombol kirim dengan validasi tampilan (bintang merchant kosong = tidak bisa kirim).

**Lane Guard tampilan:** Yang terlihat customer saat ditolak: bukan peserta order, atau order itu sudah dinilai (satu penilaian per order).

## Aturan keras (jangan dilupakan)

- Satu penilaian per order; hanya peserta order; order wajib sudah `done` (BR-1, BR-5, BR-6).
- Bintang merchant wajib bila customer mengirim penilaian; bintang kurir wajib bila order diantar kurir; bintang per hidangan opsional (BR-2).
- Teks ulasan opsional — bintang saja tetap sah (BR-3).
- Rating **bukan** jalur sengketa: tidak membekukan dana, tidak mengubah status order, tidak memicu incident (`f8-dispute`); tanpa insentif/kupon untuk menilai (BR-7, BR-11).
- Kurir dinilai **untuk merchant** (`C-06`) — tampil di konsol merchant, bukan halaman publik.
- Merchant boleh membalas ulasan; state balasan sudah ada di repo (`setReviewReply`). Batas balasan per ulasan UNRESOLVED.
- **Tip kurir digabung di layar pasca-order ini** (keputusan PO 2026-09-22): opsional & sukarela, 100% ke kurir tanpa komisi platform, dipotong dari wallet customer → wallet kurir via internal ledger. Aturan & UNRESOLVED tip ada di `f6-cashout-payout` (ambang minimum withdraw). **Fee payout ditanggung kurir** (PO 2026-09-22). Tip **tidak** memengaruhi status order dan tidak membuka sengketa.
- **Besar nominal tip belum diputuskan.** Deret praset di layar (`Tanpa tip`, Rp3.000, Rp5.000, Rp10.000) adalah **state tampilan**, bukan aturan bisnis. Yang diimplementasikan di repo ini baru separuh customer: `tipCourier` di `walletSlice` memotong saldo wallet customer; sisi kredit wallet kurir belum punya model (wallet kurir masih angka mock di panel CS) sehingga tidak dikarang.
- Rata-rata, distribusi, dan jumlah ulasan = angka turunan dari satu sumber data mock; jangan tulis perhitungan backend di JSX seolah sudah jalan.
- Frontend saja di repo ini: prompt, form, dan tampilan ulasan adalah layar mock (AGENTS.md §1).

## Terhubung (lihat ../INDEX.json)

`f18-order-state` → event `review_prompt` saat order `done` (feeds prompt); `f12-merchant-console` → rata-rata tampil di kartu merchant & konsol merchant menerima ulasan masuk + balasan; `f8-dispute` → catatan: rating bukan jalur dispute, tidak mengalir ke incident.

## Sumber (jangan dikarang)

- **BRS `rating-review-2026-09-22`** — `docs/product/prd/versions/rating-review-2026-09-22/` (`source.md` BR-1…BR-11, `analysis.md`, `milestones.md`); revisi `proposed`, belum mengubah `activeRevision`
- Keputusan PO 2026-09-22: rating masuk MVP (bintang + ulasan, pola umum aplikasi pesan-antar makanan) **dan tip kurir digabung di layar pasca-order yang sama** — aturan tip sendiri dari PRD §Tips (`source.md:78-84`), bukan requirement baru
- Silang: `C-06` (kurir = karyawan merchant), `C-12` (dispute jalur terpisah), `R-INCENTIVE-01`, `R-WALLET-01` (tip = internal ledger), `f6-cashout-payout` (withdraw tips)
- Layar yang sudah ada di repo: `src/pages/RatingDriver.tsx`, `src/pages/Reviews.tsx`, `src/pages/MerchantReviews.tsx`, `src/data/merchantReviews.ts` (`averageRating`, `ratingDistribution`, `reviewFilters`), `setReviewReply` di `src/store/slices/merchantSlice.ts`
- `docs/product/schema-draft-v1.md` entri 17 — **rancangan data**, dipakai hanya untuk nama tabel/field
- **UNRESOLVED (jangan ditebak):** jendela pengisian (berapa hari) · edit/hapus penilaian · daftar tag cepat · batas balasan per ulasan · moderasi ulasan · rating kurir tetap di MVP? · ambang jumlah ulasan sebelum rata-rata tampil · pengisian dari riwayat pesanan · tip: ambang minimum withdraw (`f6`; fee payout sudah diputuskan = ditanggung kurir)

## Update

```bash
./scripts/flows-gate.sh f19-rating-review   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-24 — tip kurir **dipasang di layar rating** (state tampilan): deret chip nominal memakai pola `.wallet-preset`, dipotong dari wallet customer lewat `tipCourier`, dan kode order dibawa dari `/order-arrived` supaya penilaian terikat ke order yang sama. Layar perayaan `/order-arrived` diberi gerakan (pop centang, konfeti mekar, teks naik berurutan) dan kontrasnya diperbaiki — centang, pesan, dan tombol CTA sebelumnya tidak terbaca di atas oranye. Nominal praset tip masih UNRESOLVED. Gate `browser-gate --strict --click` kedua rute 2/2 PASS, `flows-gate` validate 9/9.

Terakhir diperbarui (sebelumnya): 2026-09-22 — **tip kurir digabung di layar pasca-order** (keputusan PO 2026-09-22): prompt jadi "nilai + tip", node form jadi "teks, tag & tip"; aturan tip dari PRD §Tips, withdraw di `f6`, **fee payout ditanggung kurir** (PO 2026-09-22). Validate 9/9 pass, deliver exit 0 (spec `02c7c5f2`, artifact `9e7afd2a`), visual-check pass (1440x900, 2048x1320 light + dark, overflow 0).
