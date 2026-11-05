# R-NFR — Idempotensi uang, ledger append-only, presisi waktu & rekonsiliasi

Status: partial (sebagian tercermin di mock; idempotensi & ledger belum) · sumber §20.2 NFR-01..NFR-07, §21.1, §21.2.

## 1. Untuk apa

Kebutuhan non-fungsional di sini bukan soal kecepatan, melainkan soal uang dan bukti: Workflow bisa mengulang langkah, jadi langkah uang wajib idempoten; dan ledger harus catatan yang tidak bisa diubah agar bisa direkonsiliasi terhadap laporan gateway. Sisanya mengatur presisi angka dan waktu, serta resync realtime.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Setiap langkah Workflow yang menyentuh uang (charge, payout, refund, debit) memakai kunci idempotensi | NFR-01 |
| A2 | Semua pergerakan dana dicatat di ledger audit yang tidak bisa diubah | NFR-02 |
| A3 | Ledger direkonsiliasi harian terhadap laporan transaksi payment gateway | NFR-02 |
| A4 | Ledger hanya catatan, bukan saldo yang dikelola sa7tein | NFR-02, §15.1 |
| A5 | JOD disimpan 3 desimal; IDR sebagai bilangan bulat | NFR-03 |
| A6 | Waktu disimpan UTC dan ditampilkan dalam zona Asia/Amman | NFR-04 |
| A7 | Saat WebSocket tersambung kembali, client menyinkronkan ulang state yang terlewat | NFR-05 |
| A8 | Kontrak pesan WebSocket diberi versi | NFR-06 |
| A9 | Semua aksi, termasuk aksi ops (verifikasi, moderasi, keputusan dispute, perubahan rule dan konfigurasi), tercatat di riwayat aktivitas | NFR-07 |
| A10 | Batasan diterima L1: di PWA lokasi kurir hanya terkirim andal saat app kurir terbuka dan layar menyala | §21.1 |
| A11 | Batasan diterima L2: di iOS web push hanya berfungsi bila PWA di-install | §21.1 |
| A12 | Risiko material wajib punya mitigasi: R1 gateway, R2 legal, R3 registry, R4 biaya Routes, R6 payout, R7 kuota, R8 kurs, R9 tracking, R12 WhatsApp, R13 pencairan, R14 ledakan DO | §21.2 |

## 3. Aktor & permukaan

- Sistem — idempotensi, ledger, rekonsiliasi.
- Ops — melihat status rekonsiliasi dan selisih.
- Customer/merchant — melihat status akhir (payout "menunggu pencairan", refund gagal) tanpa detail teknis.

## 4. Masukan → keluaran

- Masuk: langkah Workflow uang, transaksi gateway, timestamp, pesan WS.
- Keluar: efek uang tepat sekali, entri ledger append-only, laporan rekonsiliasi harian, state tersinkron.

## 5. State UI

| State | Tampilan |
|---|---|
| langkah Workflow diulang | tidak ada efek ganda; status tetap satu |
| rekonsiliasi harian menemukan selisih | tampil di ops sebagai selisih, bukan disembunyikan |
| waktu ditampilkan | Asia/Amman, bukan UTC mentah |
| nominal JOD | 3 desimal konsisten; IDR tanpa pecahan |

## 6. Kontrak BE (handoff, repo ini mock)

NFR-01..07; risiko R1..R14 dengan mitigasi §21.2; ledger bukan saldo.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Mengulang langkah payout tidak menggandakan transfer | jalankan ulang langkah dengan kunci sama → 1 entri ledger | ⛔ |
| AC2 | Ledger tidak bisa diubah/dihapus | coba update entri → ditolak | ⛔ |
| AC3 | Rekonsiliasi harian menghasilkan laporan yang bisa dibandingkan dengan gateway | bandingkan total ledger vs laporan | ⛔ |
| AC4 | Nilai JOD tampil 3 desimal dan IDR bulat | periksa rincian order dan total IDR | ⛔ |
| AC5 | Waktu tersimpan UTC dan tampil Asia/Amman | bandingkan entri riwayat dengan waktu lokal | ⛔ |
| AC6 | Reconnect WS menyinkronkan state terlewat | putus → ubah state → sambung | ⛔ |
| AC7 | Aksi ops tercatat di riwayat | verifikasi merchant → entri riwayat | ⛔ |
| AC8 | Pesan WS punya versi | periksa payload | ⛔ |

## 8. UNRESOLVED

- OPEN-01 (gateway) menentukan bentuk rekonsiliasi dan penyebab gagal transfer.
- OPEN-02 (kurs + fallback) terbuka; OPEN-28 metrik keberhasilan terbuka.
- Angka target performa (latensi, throughput) tidak dicantumkan PRD.

## 9. Bukti

- Kode: `src/types.ts` (`LedgerEntry`, `LiabilitySummary`), `src/pages/OpsLedger.tsx`, `src/pages/OpsLiability.tsx`, `src/store/slices/walletSlice.ts`, `src/store/slices/payoutSlice.ts` (mock, tanpa idempotensi/ledger nyata).
- Belum ada: kunci idempotensi, ledger append-only, rekonsiliasi, versi kontrak WS.
