# R-MER-OPS — Jam operasional, dismiss open & busy

Status: partial (jam operasional per hari ada; recurring/tanggal, dismiss open, busy terpisah belum) · sumber §11.1 MER-03/MER-28/MER-29, §11.2 MER-30, ARC-17.

## 1. Untuk apa

Status buka/tutup menentukan apakah customer bisa membuat order, sedangkan busy adalah alat merchant menahan order baru tanpa menutup tokonya. Keduanya harus bisa dijadwalkan otomatis tetapi tetap bisa di-override manual, dan perubahan otomatis harus setara dengan perubahan manual termasuk event realtime.

## 2. Aturan

### Data jam operasional

| # | Aturan | Sumber |
|---|---|---|
| A1 | Data jam operasional berisi: recurring (boolean), hari (bila recurring), tanggal (bila tidak recurring), 24 jam (boolean), satu atau lebih pasangan jam buka–tutup, dan active | §11.1 |
| A2 | Hari pada data recurring unik; tanggal pada data tanggal unik | §11.1 |
| A3 | 24 jam berarti buka 00:00–24:00 pada hari/tanggal itu | §11.1 |
| A4 | Jam buka wajib lebih awal dari jam tutup; satu rentang tidak boleh melewati tengah malam, dipecah menjadi sampai 24:00 + mulai 00:00 hari berikutnya | §11.1 |
| A5 | Rentang tidak boleh bentrok, tetapi boleh beririsan (contoh 08:00–12:00 dan 12:00–15:00 = tetap buka tanpa tutup sesaat) | §11.1 |
| A6 | Data active=false tidak memicu auto buka maupun auto tutup | §11.1 |
| A7 | Semua jam memakai zona waktu Yordania | §11.1, NFR-04 |
| A8 | Auto buka/tutup dijadwalkan lewat alarm Durable Object, bukan Cron Trigger | ARC-17 |

### Buka, tutup, delay

| # | Aturan | Sumber |
|---|---|---|
| A9 | Auto buka mengubah status ke buka pada setiap jam buka; auto tutup pada setiap jam tutup; efeknya sama dengan manual, termasuk event realtime | §11.1, §18 |
| A10 | Merchant bisa menutup manual saat buka dan membuka manual saat tutup | MER-03 |
| A11 | Status manual berlaku sampai jadwal berikutnya mengubahnya (tutup manual 12:00 pada jadwal 08:00–17:00 tetap tutup sampai besok 08:00) | §11.1 |
| A12 | Saat tutup (manual atau otomatis), order pending tetap boleh accept/reject (tolak wajib alasan), sedangkan order yang sudah di-accept wajib diselesaikan | MER-03, §11.1 |

### Dismiss open

| # | Aturan | Sumber |
|---|---|---|
| A13 | Merchant bisa dismiss open untuk satu atau beberapa tanggal mendatang yang punya jadwal buka; tanggal hari ini tidak bisa | MER-29 |
| A14 | Pada tanggal yang di-dismiss, auto buka dan auto tutup tidak aktif; bila merchant buka manual, ia juga harus tutup manual | §11.1 |
| A15 | Dismiss hanya bisa dibatalkan paling lambat H-1; setelah dibatalkan, jadwal otomatis aktif lagi | MER-29 |
| A16 | Pada H-1 setiap tanggal yang di-dismiss, aplikasi merchant menampilkan banner peringatan di semua screen | §11.1, §18 |
| A17 | Tombol Dismiss open ada di halaman utama merchant; dialog berisi daftar tanggal + tombol Add date (kalender hanya tanggal mendatang yang punya jadwal buka) + tombol batal per tanggal | MER-29, §11.1 |

### Busy

| # | Aturan | Sumber |
|---|---|---|
| A18 | Busy terpisah dari status buka/tutup, bernilai on/off, hanya bisa diatur saat merchant buka | MER-30, §11.2 |
| A19 | Saat merchant tutup, busy otomatis off dan config nonaktif; saat buka, config aktif kembali | §11.2 |
| A20 | Busy hanya manual; tidak ada auto busy (User Agreement tidak memicu auto busy) | §11.2 |
| A21 | Selama busy, customer tetap bisa menambah menu ke cart tetapi tidak bisa membuat order | §11.2 |
| A22 | Bila customer menutup aplikasi saat cart-nya tertahan busy, ia mendapat notifikasi ketika busy merchant itu nonaktif | §11.2, R-NOTIF |
| A23 | Order yang masuk sebelum busy aktif tetap diproses seperti biasa | §11.2 |

## 3. Aktor & permukaan

- Owner/karyawan ber-hak "Kelola jam operasional" — editor jadwal, toggle buka/tutup, dialog dismiss open, toggle busy.
- Customer — melihat status buka/busy di browse dan detail merchant; cart tertahan saat busy.
- Sistem — alarm auto buka/tutup, banner H-1.

## 4. Masukan → keluaran

- Masuk: data recurring/tanggal, pasangan jam, flag active, dismiss dates, toggle busy.
- Keluar: status merchant (buka/tutup), status busy, daftar tanggal dismissed, banner H-1, event `merchant_open`/`merchant_close`/`merchant_busy`.

## 5. State UI

| State | Tampilan |
|---|---|
| tutup karena jadwal | detail merchant menampilkan tutup; checkout diblokir |
| tutup manual | sama seperti tutup otomatis; status berlaku sampai jadwal berikutnya |
| busy | detail merchant menampilkan busy; item bisa masuk cart, order ditahan |
| busy saat merchant tutup | toggle busy nonaktif dan off |
| ada tanggal di-dismiss, hari H-1 | banner di semua screen merchant |
| dismiss dibatalkan setelah H-1 | tombol batal tidak aktif |

## 6. Kontrak BE (handoff, repo ini mock)

Alarm DO per merchant untuk auto buka/tutup dan banner H-1 (ARC-17); event `merchant_open`, `merchant_close`, `merchant_busy`, `dismiss_open_changed`; validasi bentrok rentang di server.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Dua data recurring dengan hari sama ditolak | simpan hari Senin dua kali → error | ⛔ |
| AC2 | Rentang 08:00–12:00 + 12:00–15:00 diterima dan merchant tetap buka | simpan → status buka pada 12:00 | ⛔ |
| AC3 | Rentang 08:00–12:00 + 11:00–14:00 ditolak sebagai bentrok | simpan → error bentrok | ⛔ |
| AC4 | Rentang melewati tengah malam ditolak | isi 22:00–02:00 → error | ⛔ |
| AC5 | Dismiss tanggal hari ini tidak bisa | buka kalender → hari ini tidak dapat dipilih | ⛔ |
| AC6 | Dismiss tidak bisa dibatalkan pada hari H | lewat H-1 → tombol batal nonaktif | ⛔ |
| AC7 | Banner H-1 muncul di semua screen merchant | set dismiss besok → hari ini semua screen menampilkan banner | ⛔ |
| AC8 | Busy otomatis off saat merchant tutup | toggle busy on → tutup merchant → busy off dan toggle nonaktif | ⛔ |
| AC9 | Busy menahan order tetapi tidak menahan cart | tambah menu ke cart berhasil; tombol order nonaktif | ⛔ |
| AC10 | Status manual bertahan sampai jadwal berikutnya | tutup manual 12:00 pada jadwal 08:00–17:00 → tetap tutup sampai besok 08:00 | ⛔ |

## 8. UNRESOLVED

- Zona waktu "Yordania" pada PRD = Asia/Amman; tidak ada konfigurasi per merchant.
- Batas jumlah tanggal dismiss tidak disebut.

## 9. Bukti

- Kode: `src/pages/MerchantSettings.tsx` (jam operasional), `src/types.ts:430` (`OperatingHoursDay`), `src/pages/Documentation.tsx` bagian MerchantFlowDetail.
- Belum ada: recurring/tanggal, dismiss open, busy terpisah.
