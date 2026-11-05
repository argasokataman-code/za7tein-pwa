# R-MONEY — Rumus harga, settlement 3 kolom, payout & COD

Status: partial (rumus lama flat fee + F ke kurir; Pk dan Ft dinamis belum) · sumber §15.1–§15.5, OPS-08, OPS-12, OPEN-03/04/05/08/45/46/84/85/86.

## 1. Untuk apa

Uang adalah bagian yang paling mahal bila salah: satu komponen yang salah tempat memindahkan dana antar pihak. PRD beta mengubah arah penerima delivery fee (F ke merchant, bukan kurir), menambah Pk, dan membuat Ft bergantung kurs harian. Settlement wajib selalu berjumlah sama dengan total yang dibayar customer, sehingga bisa direkonsiliasi.

## 2. Aturan

### Prinsip (§15.1)

| # | Aturan | Sumber |
|---|---|---|
| A1 | Harga menu, opsi, delivery fee, dan platform fee diinput dalam JOD | §15.1 |
| A2 | Semua transaksi in-app dalam IDR; order COD dibayar tunai dalam JOD | §15.1, §15.5 |
| A3 | Pembayaran online terjadi saat order dibuat; dana penuh masuk saldo aplikator di gateway dan ditahan sampai order selesai, batal, atau ditolak | §15.1 |
| A4 | Payout order online memakai dana order itu; dikirim otomatis setelah order selesai dan dana dicairkan gateway | §15.1, §15.4 |
| A5 | Aplikator tidak menalangi payout; saldo disbursement hanya untuk subsidi promo aplikator | §15.1 |
| A6 | Biaya transfer payout ditanggung aplikator dan ditutup lewat transaction fee | §15.1, §15.2 |
| A7 | MVP memakai gateway Indonesia tanpa e-wallet: bayar QRIS, payout/refund transfer bank | §15.1 |
| A8 | sa7tein tidak menyimpan saldo merchant/customer sendiri | §15.1 |

### Komponen harga (§15.3)

| # | Aturan | Sumber |
|---|---|---|
| A9 | S = jumlah price semua order item (harga varian × qty) | §15.3 |
| A10 | Dm = total diskon program merchant; Da = total diskon program aplikator + potongan sa7tein poin | §15.3, §14.5 |
| A11 | F = delivery fee merchant | §15.3 |
| A12 | Pc = platform fee customer flat per order JOD; 0 bila order mengonsumsi kuota customer; masuk aplikator kecuali pada order ber-kuota merchant (jadi hak merchant) | §15.3 |
| A13 | Pk = payout Pc ke merchant, sebesar Pc yang dikonfigurasi ops, pada order yang mengonsumsi kuota customer + merchant bersamaan; 0 untuk order lain | §15.3 |
| A14 | Pm = platform fee merchant flat per order, hanya untuk order online tanpa kuota merchant | §15.3 |
| A15 | Total dibayar customer = S − Dm − Da + F + Pc + Ft | §15.3 |
| A16 | Ft = final transaction fee × (S − Dm − Da + F + Pc), hanya QRIS; 0 untuk COD | §15.3, §15.2 |
| A17 | Total JOD dikonversi kurs acuan dan dibulatkan ke atas ke ratusan rupiah | §15.3, §15.2 |

### Settlement (§15.4)

| # | Aturan | Sumber |
|---|---|---|
| A18 | Tanpa kuota merchant: merchant menerima S − Dm − Pm + F | §15.4 |
| A19 | Dengan kuota merchant: merchant menerima S − Dm + Pc + Pk + F | §15.4 |
| A20 | Aplikator (tetap di saldo): tanpa kuota = Pc + Pm − Da; dengan kuota merchant = −Da − Pk | §15.4 |
| A21 | Ketiga bagian selalu berjumlah sama dengan total dibayar customer | §15.4 |
| A22 | Promo merchant mengurangi payout merchant; promo aplikator tidak | §15.4 |
| A23 | Diskon merchant atas delivery fee mengurangi payout merchant | §15.4 |
| A24 | Aplikator selalu menanggung Da; bila Da > bagian aplikator, selisih ditutup dari saldo disbursement promo | §15.4 |
| A25 | Tagihan dibulatkan ke atas ke ratusan, payout dibulatkan ke bawah ke rupiah penuh | §15.2, §15.4 |
| A26 | Order yang order item-nya diubah dihitung dari order item akhir, dengan aturan pembagian diskon §7.4 | §15.4 |
| A27 | Subsidi promo aplikator dibayar dari saldo disbursement promo; promo menu dan ongkir keduanya ke merchant sehingga merchant menerima seolah tanpa promo aplikator | §15.4 |

### COD (§15.5)

| # | Aturan | Sumber |
|---|---|---|
| A28 | COD adalah transaksi offline di luar aplikasi, dibayar tunai JOD | §15.5 |
| A29 | Order COD hanya bisa dibuat bila merchant punya kuota tersedia | §15.5, MER-19 |
| A30 | COD mengonsumsi kuota merchant sehingga tidak dikenai Pm | §15.5 |
| A31 | Customer tanpa kuota tetap membayar Pc tunai; Pc itu sepenuhnya hak merchant | §15.5 |
| A32 | Bila customer memakai kuota, Pc = 0 dan merchant menerima Pk lewat payout saat order selesai | §15.5 |
| A33 | Setiap COD mengonsumsi 1 kuota merchant saat selesai, ditambah 1 kuota customer bila ada | §15.5, §16 |
| A34 | Subsidi promo aplikator pada COD dibayarkan IDR dengan kurs harian saat order dibuat | §15.5 |
| A35 | Aplikator tidak melakukan payout F; merchant menerima F tunai | §15.5 |
| A36 | Merchant menerima tunai S − Dm − Da + F + Pc + subsidi Da, sehingga total S − Dm + F + Pc | §15.5 |
| A37 | Bila order item diubah saat pending, tagihan tunai mengikuti §7.4 | §15.5 |

### Payout, refund & rekonsiliasi

| # | Aturan | Sumber |
|---|---|---|
| A38 | Merchant melihat riwayat payout berisi nominal, order terkait, waktu, dan status transfer | MER-20 |
| A39 | Payout yang menunggu pencairan gateway tampil dengan status tersendiri | §15.1 |
| A40 | Transfer payout gagal → status tampil, dikirim ulang otomatis atau setelah rekening diperbaiki | §15.1 |
| A41 | Refund penuh termasuk Ft dan pembulatan; refund selisih memakai alur sama | §15.6, §7.4 |
| A42 | Biaya transfer refund ditanggung aplikator | §15.6 |
| A43 | Setelah payout tidak ada refund atau penarikan dana; kompensasi non-uang | §15.6, §17, OPEN-08 |
| A44 | Semua pergerakan dana dicatat di ledger append-only + rekonsiliasi harian terhadap laporan gateway | NFR-02 |
| A45 | Setiap langkah Workflow yang menyentuh uang memakai kunci idempotensi | NFR-01 |
| A46 | Ops mengatur nominal flat Pc dan Pm per order | OPS-08 |
| A47 | Ops memantau payout, pending refund, saldo disbursement promo, dan rekonsiliasi | OPS-12 |

## 3. Aktor & permukaan

- Customer — rincian harga di cart/checkout, metode bayar, status refund.
- Merchant — payout, riwayat transaksi, rincian harga order, dashboard.
- Ops — Pc/Pm, pemantauan payout/refund/saldo promo, rekonsiliasi, ledger.
- Aplikator — menanggung Da dan biaya transfer.

## 4. Masukan → keluaran

- Masuk: S, Dm, Da, F, Pc, Pm, Ft, kuota yang dikonsumsi, kurs terkunci, pembulatan.
- Keluar: total dibayar customer (JOD dan IDR), payout merchant, bagian aplikator, Pk, status payout/refund, entri ledger.

## 5. State UI

| State | Tampilan |
|---|---|
| order QRIS | rincian S, diskon, F, Pc, Ft, total; total IDR dibulatkan |
| order COD | total JOD tunai, tanpa Ft |
| payout menunggu pencairan | status khusus, bukan "gagal" |
| transfer payout gagal | status + alasan + aksi kirim ulang |
| refund gagal | status + permintaan perbaikan rekening |
| kompensasi pasca-payout | hanya bentuk non-uang |

## 6. Kontrak BE (handoff, repo ini mock)

Ledger append-only + rekonsiliasi harian (NFR-02); idempotency per langkah Workflow (NFR-01); disbursement payout/refund; status payout "menunggu pencairan"; gateway belum dipilih (OPEN-01).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Total dibayar = S − Dm − Da + F + Pc + Ft | bandingkan rincian checkout dengan rumus | ⛔ rumus repo masih fee lama |
| AC2 | Settlement 3 kolom berjumlah total dibayar | jumlahkan merchant + aplikator + gateway | ⛔ |
| AC3 | Payout tanpa kuota = S − Dm − Pm + F | order tanpa promo/kuota → payout = S − Pm + F | ⛔ |
| AC4 | Payout dengan kuota = S − Dm + Pc + Pk + F | order ber-kuota → cek komponen | ⛔ |
| AC5 | Ft hanya muncul pada QRIS dan nol pada COD | bandingkan dua order identik beda metode | ⛔ |
| AC6 | Ft memakai final transaction fee = kenaikan kurs + persen ops | ubah kurs hari ini → Ft berubah | ⛔ |
| AC7 | Payout dibulatkan bawah, tagihan dibulatkan atas ke ratusan | total 126.040 → tagihan 126.100; payout tanpa pembulatan ratusan | ⛔ |
| AC8 | COD tanpa kuota: Pc tunai jadi hak merchant | order COD → merchant menerima Pc tunai | ⛔ |
| AC9 | Da > bagian aplikator ditutup saldo disbursement promo | promo aplikator besar → saldo promo berkurang | ⛔ |
| AC10 | Setelah payout tidak ada refund | refund setelah payout → ditolak, tawarkan kompensasi non-uang | ⛔ |

## 8. UNRESOLVED

- OPEN-01 (payment gateway) belum dipilih; menentukan biaya, penyebab gagal transfer, dan status pencairan.
- OPEN-02 (provider kurs + fallback) terbuka.
- Nilai awal Pc, Pm, transaction fee tidak dicantumkan PRD.

## 9. Bukti

- Kode: `src/types.ts:1589-1621` (komponen harga lama), `src/data/merchant.ts:143` (fee), `src/data/currency.ts`, `src/pages/Checkout.tsx`, `src/pages/MerchantEarnings.tsx`, `src/pages/MerchantPayout.tsx`, `src/pages/OpsLiability.tsx`, `src/store/slices/payoutSlice.ts`, `src/store/slices/walletSlice.ts`.
- Belum ada: Ft dinamis (kenaikan kurs + persen), Pk, F sebagai hak merchant, ledger append-only.
