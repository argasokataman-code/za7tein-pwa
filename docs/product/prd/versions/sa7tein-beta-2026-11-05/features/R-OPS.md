# R-OPS — Aplikasi ops: 24 kebutuhan, Cloudflare Access, backoffice kanonik

Status: partial (14 layar `/ops` website penuh; PWA + Access, config/riwayat/dashboard belum) · sumber §12 OPS-01..OPS-24, §4, §20.1 ARC-10, §20.2 NFR-07.

## 1. Untuk apa

Ops adalah satu-satunya peran yang boleh mengubah aturan platform: platform fee, katalog paket, rule dispute, konfigurasi aplikasi, moderasi tag, verifikasi merchant, dan pemantauan uang. Karena itu aksesnya harus di balik Cloudflare Access dan semua aksinya tercatat di riwayat aktivitas.

## 2. Aturan

### Platform & akses

| # | Aturan | Sumber |
|---|---|---|
| A1 | Aplikasi ops memakai PWA dan Worker terpisah dari client customer/merchant | §12, ARC-02 |
| A2 | Di balik Cloudflare Access/Zero Trust | §12, ARC-10 |
| A3 | Analitik memakai Workers Analytics Engine, log memakai Workers Logs | OPS-11, ARC-10 |
| A4 | Semua aksi ops (verifikasi, moderasi, keputusan dispute, perubahan rule dan config) tercatat di riwayat aktivitas | NFR-07, R-HISTORY |
| A5 | `/ops` tetap backoffice kanonik repo ini; `/admin` sudah dihapus | AGENTS §9, docs decision-ops-canonical |

### 24 kebutuhan

| # | Kebutuhan | Sumber |
|---|---|---|
| A6 | OPS-01 memverifikasi dan meng-onboard merchant | OPS-01 |
| A7 | OPS-02 memoderasi usulan tag merchant | OPS-02 |
| A8 | OPS-04 mengatur ambang waktu notifikasi "kurir hampir sampai" | OPS-04 |
| A9 | OPS-05 mengelola program marketing aplikator, memilih penerima exclusive, membayar budget maksimal sebelum tanggal mulai | OPS-05 |
| A10 | OPS-06 mengelola rule auto dispute + tanggal berlaku paling cepat H+1 | OPS-06 |
| A11 | OPS-07 menangani tiket manual dispute sesuai urutan masuk (periksa chat, minta bukti, moderasi, putuskan) | OPS-07 |
| A12 | OPS-08 mengatur nominal flat Pc dan Pm per order (JOD) | OPS-08 |
| A13 | OPS-09 mengatur katalog paket merchant dan customer: nama, deskripsi, harga persentase (maks 100%), hasil JOD tidak bisa diubah, satuan masa aktif, status aktif, kuota per periode, fitur bonus | OPS-09 |
| A14 | OPS-11 melihat analitik dan log | OPS-11 |
| A15 | OPS-12 memantau payout, pending refund, saldo disbursement promo, dan rekonsiliasi gateway | OPS-12 |
| A16 | OPS-14 memantau update kurs harian dan kegagalannya | OPS-14 |
| A17 | OPS-16 melihat riwayat aktivitas semua data dan mengatur pengikut riwayat | OPS-16 |
| A18 | OPS-17 mengatur skema diskon kuota alacarte (bisa lebih dari 1) | OPS-17 |
| A19 | OPS-18 mengatur config aplikasi (transaction fee, batas bayar + masa QR, jam kurs, ambang kuota, durasi tutup chat, batas dispute = retensi chat, masa berlaku + batas kode OTP, rentang riwayat, batas titik grafik) | OPS-18 |
| A20 | OPS-19 mengatur toggle sa7tein poin + nilai konversi + rule (minimal 1 rule saat aktif) | OPS-19 |
| A21 | OPS-21 melihat invoice semua status dan men-download PDF saat status akhir | OPS-21 |
| A22 | OPS-22 memindahkan status owner merchant setelah verifikasi | OPS-22 |
| A23 | OPS-23 melihat dashboard performa setiap merchant | OPS-23 |
| A24 | OPS-24 me-refund sisa saldo program aplikator ke rekening yang diisi manual | OPS-24 |
| A25 | OPS-03, OPS-10, OPS-13, OPS-15, OPS-20 dihapus bersama kurir partner / merchant open session | OPS-03/10/13/15/20 |

### Batasan

| # | Aturan | Sumber |
|---|---|---|
| A26 | Shell ops adalah website penuh non-PWA tanpa kolom 430px; deviasi dari PRD (yang menyebut PWA) wajib tercatat | AGENTS §9, `.rules.json` browserTesting.ops |
| A27 | Perubahan config dari ops tampil berlaku sekitar 1 menit dan client menerima event bernilai baru | ARC-14 |
| A28 | Ops tidak bisa menjadi pengikut riwayat dirinya sendiri otomatis | §12.1 |

## 3. Aktor & permukaan

- Ops — 14 layar saat ini: dashboard, analitik, kewajiban, ledger, onboarding, merchant, sengketa, insiden, moderasi, program, kuota, rule sengketa, SP, setelan.
- Merchant/customer — penerima efek aksi ops (verifikasi, punishment, tag, program).

## 4. Masukan → keluaran

- Masuk: aksi ops pada tiap kebutuhan.
- Keluar: perubahan data + entri riwayat aktivitas, event realtime ke pihak terkait.

## 5. State UI

| State | Tampilan |
|---|---|
| akses tanpa Cloudflare Access | ditolak sebelum aplikasi termuat |
| program aplikator belum dibayar | tombol Bayar program + status |
| rule baru disimpan | tanggal berlaku minimal H+1, status "akan berlaku" |
| tiket dispute | daftar urut masuk + status penanganan |
| config diubah | label "berlaku ±1 menit" |

## 6. Kontrak BE (handoff, repo ini mock)

Worker ops terpisah; Cloudflare Access; audit via riwayat aktivitas; event antar-ops; KV prefix key untuk config.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | `/ops` hanya bisa dibuka dengan sesi Cloudflare Access | buka tanpa sesi → ditolak | ⛔ belum ada |
| AC2 | 24 kebutuhan punya layar/aksi yang bisa ditunjuk | petakan tiap OPS-ID ke elemen UI | ⛔ sebagian |
| AC3 | Setiap aksi ops menghasilkan entri riwayat dengan pelaku akun ops | ubah config → entri riwayat muncul | ⛔ |
| AC4 | Harga paket tampil sebagai hasil hitung yang tidak bisa diubah | buka form paket → hasil read-only | ⛔ |
| AC5 | Skema diskon alacarte tidak punya periode berlaku dan dihapus untuk menonaktifkan | form skema tanpa tanggal | ⛔ |
| AC6 | Refund sisa saldo program hanya dari akun yang membayar | login ops lain → tombol tidak tampil | ⛔ |
| AC7 | Dashboard merchant di ops identik dengan yang dilihat merchant | bandingkan angka pada range sama | ⛔ |

## 8. UNRESOLVED

- Bentuk shell ops (PWA vs website penuh) adalah deviasi tercatat; keputusan akhir menunggu pemilik.
- OPEN-01/OPEN-02/OPEN-25/OPEN-31 memblokir sebagian layar (pembayaran, kurs, query lintas DO, fitur bonus).

## 9. Bukti

- Kode: `src/App.tsx:304-319` (`opsRoutes`), `src/pages/ops/*` (14 layar), `src/store/slices/opsSlice.ts:49`, `src/store/slices/rulesSlice.ts`, `src/components/layout/OpsShell`.
- Belum ada: Worker ops terpisah, Cloudflare Access, layar config lengkap, riwayat + pengikut, dashboard per merchant, skema diskon.
