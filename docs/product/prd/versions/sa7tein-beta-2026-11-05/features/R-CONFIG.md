# R-CONFIG — applicationConfiguration: daftar nilai, KV prefix & berlaku ±1 menit

Status: partial (layar setelan ops + konstanta di `src/data/`; daftar config lengkap & label berlaku belum) · sumber §12.2 OPS-18, §20.1 ARC-14/ARC-15/ARC-16, §12.1.

## 1. Untuk apa

Konfigurasi menentukan angka yang mengubah uang dan perilaku di seluruh aplikasi (Pc, Pm, transaction fee, batas pembayaran, ambang, konversi poin). Karena disimpan di Workers KV dan dibaca banyak client, satu key harus punya satu penulis dan setiap perubahan harus membawa nilainya ke client agar tidak ada client yang memakai nilai basi.

## 2. Aturan

### Tempat penyimpanan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Konfigurasi disimpan di Workers KV di bawah root key `applicationConfiguration` | §12.2, ARC-14 |
| A2 | Root key diterapkan sebagai prefix key (mis. `applicationConfiguration:platformFeeCustomer`), bukan satu value JSON, karena KV membatasi 1 penulisan/detik per key dan penulisan bersamaan saling menimpa | ARC-16 |
| A3 | Setiap key punya satu instance DO sebagai penulis tunggal nilainya, sehingga urutan nilai sama dengan urutan entri riwayatnya | ARC-15 |
| A4 | Setiap perubahan config tercatat di riwayat aktivitas | §12.2, §12.1 |
| A5 | Konfigurasi multi row (paket langganan, skema diskon alacarte, program marketing + rule, rule sa7tein poin) disimpan di instance DO, bukan KV | ARC-14 |
| A6 | Nilai di Workers KV adalah nilai utama dan tidak disimpan ulang di DO | ARC-14 |
| A7 | Perubahan KV bisa butuh sampai 60 detik terlihat di semua lokasi, sehingga aplikasi ops menyebut perubahan berlaku sekitar 1 menit | ARC-14 |
| A8 | Event perubahan konfigurasi membawa nilai barunya, sehingga client tidak perlu membaca ulang KV | ARC-14, §18 |

### Daftar konfigurasi

| # | Konfigurasi | Bentuk | Sumber |
|---|---|---|---|
| A9 | Platform fee customer | nominal flat per order, JOD | §12.2, §15.3, OPS-08 |
| A10 | Platform fee merchant | nominal flat per order, JOD | §12.2, §15.3, OPS-08 |
| A11 | Ambang notifikasi "kurir hampir sampai" | durasi menit | §12.2, §9.4, OPS-04 |
| A12 | Kurs harian JOD→IDR + waktu update | dari provider, sekali sehari | §12.2, §15.2 |
| A13 | Jam update kurs harian | jam dalam sehari | §12.2, OPS-14 |
| A14 | Transaction fee | persentase; ditambah persen kenaikan kurs hari itu menjadi final transaction fee | §12.2, §15.2 |
| A15 | Batas waktu pembayaran + masa berlaku QR | durasi menit | §12.2, §15.2 |
| A16 | Ambang kuota menipis | jumlah sisa kuota, terpisah merchant dan customer | §12.2, §19.3 |
| A17 | Durasi penutupan chat | jeda penutupan setelah order selesai | §12.2, §19.1 |
| A18 | Batas waktu pengajuan manual dispute = retensi riwayat chat | satu nilai, dihitung sejak order status akhir; wajib lebih lama dari durasi penutupan chat | §12.2, §17, §19.1 |
| A19 | Toggle sa7tein poin | on/off; rule disimpan di instance DO | §12.2, §14.5, OPS-19 |
| A20 | Nilai konversi sa7tein poin ke JOD | nilai 1 poin dalam JOD | §12.2, §14.5 |
| A21 | Masa berlaku kode reverse OTP | durasi menit | §12.2, §5.1 |
| A22 | Batas permintaan kode reverse OTP | jumlah permintaan per nomor dalam satu rentang + panjang rentang | §12.2, §5.1 |
| A23 | Rentang riwayat aktivitas merchant | jumlah hari ke belakang yang bisa dilihat owner | §12.2, §11.4 |
| A24 | Batas jumlah titik grafik dashboard merchant | jumlah titik maksimal per grafik | §12.2, §11.5 |

### Batasan

| # | Aturan | Sumber |
|---|---|---|
| A25 | Nilai awal setiap konfigurasi tidak dicantumkan di PRD; wajib diisi ops, tidak boleh ditebak implementasi | §12.2 |
| A26 | Batas dispute wajib > durasi penutupan chat (validasi silang) | §12.2 |
| A27 | Update kurs dijadwalkan lewat alarm DO pada jam yang diatur ops, bukan Cron Trigger | ARC-15 |
| A28 | Ops melihat daftar config + label "berlaku ±1 menit" | OPS-18, ARC-14 |

## 3. Aktor & permukaan

- Ops — layar setelan config, label masa berlaku, riwayat perubahan.
- Client customer/merchant — membaca nilai yang tampil di layar (fee, batas, ambang) dan menerima event bernilai baru.
- Sistem — update kurs harian, penulisan nilai lewat DO key.

## 4. Masukan → keluaran

- Masuk: nilai config dari ops, kurs harian dari provider.
- Keluar: nilai per key di KV, entri riwayat, event `config_changed` dengan nilai baru.

## 5. State UI

| State | Tampilan |
|---|---|
| nilai belum diisi | layar ops menandai wajib diisi; client memakai nilai aman yang eksplisit, bukan 0 diam-diam |
| config berubah | label "berlaku ±1 menit" + nilai baru dikirim lewat event |
| batas dispute ≤ durasi tutup chat | simpan ditolak |
| update kurs gagal | status gagal di ops + event |

## 6. Kontrak BE (handoff, repo ini mock)

KV prefix key; 1 penulis per key (DO); event config membawa nilai baru; validasi silang batas dispute vs durasi tutup chat; riwayat aktivitas per key.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Semua 16 konfigurasi punya field di layar ops | hitung field vs daftar §12.2 | ⛔ |
| AC2 | Menyimpan batas dispute ≤ durasi tutup chat ditolak | isi 1 jam vs tutup 2 jam → error | ⛔ |
| AC3 | Perubahan config muncul di riwayat aktivitas | ubah Pc → entri riwayat dengan nilai lama/baru | ⛔ |
| AC4 | Client memakai nilai baru tanpa reload | ubah transaction fee → layar checkout berubah lewat event | ⛔ |
| AC5 | Label "berlaku ±1 menit" tampil setelah simpan | simpan config → label muncul | ⛔ |
| AC6 | Tidak ada nilai config yang ditebak implementasi | periksa konstanta di `src/data/` vs KV | ⛔ |

## 8. UNRESOLVED

- Nilai awal semua config tidak dicantumkan PRD (§12.2); wajib keputusan ops.
- OPEN-02 (provider kurs + fallback) dan OPEN-31 (fitur bonus) terbuka.

## 9. Bukti

- Kode: `src/pages/OpsSettings.tsx`, `src/store/slices/opsSlice.ts:49`, konstanta `PLATFORM_FEE_*` di `src/data/merchant.ts`, `src/data/currency.ts` (`MOCK_EXCHANGE_RATE`).
- Belum ada: KV prefix key, daftar 16 config, label berlaku, validasi silang.
