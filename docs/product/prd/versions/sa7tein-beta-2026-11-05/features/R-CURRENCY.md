# R-CURRENCY — Kurs harian, pembulatan asimetris & nominal terkunci

Status: partial (kurs mock statis; kurs harian, penguncian nominal, pembulatan asimetris belum) · sumber §15.2, §20.2 NFR-03/NFR-04, §12.2 OPS-14, OPEN-02.

## 1. Untuk apa

Harga dijual dalam JOD, uang berpindah dalam IDR, dan kurs berubah setiap hari. Tanpa aturan penguncian, total yang dibayar customer bisa berbeda dari payout dan refund untuk order yang sama. Karena itu nominal IDR order dikunci saat order dibuat, dan arah pembulatan ditetapkan berbeda untuk tagihan dan payout.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Semua harga diinput dan ditampilkan dalam JOD | §15.2, §15.1 |
| A2 | Konversi ke IDR hanya dilakukan saat transaksi dijalankan, memakai kurs acuan | §15.2 |
| A3 | Kurs acuan JOD→IDR berasal dari provider dan diperbarui sekali sehari pada jam yang diatur ops | §15.2, §12.2 |
| A4 | Provider kurs belum dipilih | OPEN-02 |
| A5 | Pecahan rupiah pada kurs dibulatkan ke atas | §15.2 |
| A6 | Nominal IDR yang ditagih ke customer atau merchant dibulatkan ke atas ke ratusan, untuk semua jenis transaksi; sisa pembulatan menjadi milik aplikator | §15.2 |
| A7 | Nominal IDR setiap order dikunci saat order dibuat; payout dan refund memakai nominal terkunci itu, termasuk subsidi promo aplikator pada order COD | §15.2 |
| A8 | Payout dihitung dari nominal JOD × kurs acuan yang dikunci, dibulatkan ke bawah tanpa pembulatan ke ratusan | §15.2 |
| A9 | Transaction fee = final transaction fee × (S − Dm − Da + F + Pc) | §15.2, §15.3 |
| A10 | Final transaction fee (%) = persen kenaikan kurs hari itu dari hari kemarin + persen transaction fee dari ops | §15.2 |
| A11 | Bila kurs hari ini sama atau lebih rendah dari kemarin, persen kenaikan dihitung 0% | §15.2 |
| A12 | Ft berlaku untuk semua pembayaran QRIS, termasuk paket langganan dan kuota alacarte; tidak berlaku untuk COD | §15.2 |
| A13 | Ft dalam JOD dibulatkan ke 2 desimal: digit ke-3 ≥6 dibulatkan ke atas, ≤5 ke bawah (1,754 → 1,75; 1,756 → 1,76) | §15.2 |
| A14 | Layar pembayaran menampilkan total IDR yang sudah dibulatkan; kurs tidak ditampilkan | §15.2 |
| A15 | Rincian harga tetap dalam JOD, dan nominal di gambar QR sudah dibulatkan ke ratusan | §15.2 |
| A16 | JOD disimpan 3 desimal, IDR sebagai bilangan bulat | NFR-03 |
| A17 | Waktu disimpan UTC dan ditampilkan Asia/Amman | NFR-04 |
| A18 | Update kurs dijadwalkan lewat alarm Durable Object, bukan Cron Trigger | ARC-15, ARC-17 |
| A19 | Ops memantau update kurs harian dan kegagalannya | OPS-14 |
| A20 | Kegagalan update kurs dikirim sebagai event realtime khusus ke ops | §18 |
| A21 | Perubahan config yang tampil di client berlaku sekitar 1 menit, dan client diberi tahu lewat event yang membawa nilai baru | ARC-14, §18 |

## 3. Aktor & permukaan

- Customer — total IDR di layar pembayaran, rincian JOD, QR dengan nominal terkunci.
- Merchant — nilai payout dalam IDR, rincian pemakaian kurs.
- Ops — jam update kurs, transaction fee, pemantauan kegagalan update.
- Sistem — update harian kurs, penulisan nilai ke KV lewat DO key kurs.

## 4. Masukan → keluaran

- Masuk: kurs provider harian, jam update, persen transaction fee, nilai JOD transaksi.
- Keluar: kurs acuan tersimpan + waktu update, total IDR terkunci per order, nilai payout/refund dalam IDR, event kurs diperbarui/gagal.

## 5. State UI

| State | Tampilan |
|---|---|
| layar pembayaran QRIS | total IDR bulat ke ratusan; kurs tidak tampil |
| rincian order | semua komponen JOD 3 desimal |
| kurs belum diperbarui hari ini | status di ops; perilaku fallback belum diputuskan (OPEN-02) |
| update kurs gagal | event + notifikasi/tampilan ops |
| payout | IDR dibulatkan bawah, tanpa pembulatan ratusan |

## 6. Kontrak BE (handoff, repo ini mock)

Field `exchange_rate` harian + waktu update; event kurs diperbarui/gagal; alarm DO untuk update; nilai kurs dikunci per order; fallback = OPEN-02 (terbuka).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Total tagihan dibulatkan ke atas ke ratusan | total 126.040 → 126.100 | ⛔ |
| AC2 | Payout dibulatkan ke bawah ke rupiah penuh | nominal 120.750,9 → 120.750 | ⛔ |
| AC3 | Kurs tidak tampil di layar pembayaran | buka layar bayar → hanya total IDR | ⛔ |
| AC4 | Nominal IDR order tidak berubah walau kurs berubah setelah order dibuat | buat order → ubah kurs → nilai order tetap | ⛔ |
| AC5 | Final transaction fee memakai kenaikan kurs 0% bila kurs turun | kurs hari ini < kemarin → Ft = persen ops saja | ⛔ |
| AC6 | Ft dibulatkan 2 desimal dengan aturan digit ke-3 | 1,754 → 1,75; 1,756 → 1,76 | ⛔ |
| AC7 | Ft = 0 pada COD | order COD → tidak ada baris Ft | ⛔ |
| AC8 | Update kurs dijadwalkan alarm DO, bukan Cron | ubah jam update di ops → jadwal ikut berubah tanpa deploy | ⛔ |

## 8. UNRESOLVED

- OPEN-02: provider kurs, jam update, dan perilaku bila update gagal masih terbuka.
- OPEN-04 (aturan pembulatan konversi) dirujuk NFR-03; aturan yang dipakai = §15.2.

## 9. Bukti

- Kode: `src/data/currency.ts` (`MOCK_EXCHANGE_RATE`, `money`, `jod`, `idrToJod`), komponen `Currency*`, `src/pages/PaymentAmount.tsx`.
- Belum ada: kurs harian dari provider, penguncian nominal, pembulatan asimetris, Ft dinamis.
