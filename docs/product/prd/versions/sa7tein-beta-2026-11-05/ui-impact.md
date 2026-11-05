# UI impact: sa7tein-beta-2026-11-05

Dampak revisi aktif terhadap layar repo ini. Sumber: `analysis.md` (34 baris `R-*`), `features/` (acceptance per requirement), `milestones.md` (M0-M9), dan inventaris rute `src/App.tsx` per 2026-11-05: 46 customer + 26 merchant + 10 courier aktif (4 inaktif) + 14 ops + 11 superadmin + 2 web = 109 path.

Dokumen ini **peta kerja**, bukan requirement baru. Angka rute/layar diambil dari kode; perkiraan beban ditulis sebagai jumlah layar yang disentuh, bukan jam.

## 1. Ringkas

| Hal | Nilai |
|---|---|
| Requirement beta | 34 (`R-*` di `analysis.md`) |
| Path aktif sekarang | 109 (46 customer + 26 merchant + 10 courier + 14 ops + 11 superadmin + 2 web, `src/App.tsx`) |
| Milestone | M0-M9, semua `planned` |
| Flow wajib rebase | 7 (`f13`, `f14`, `f17`, `f21`, `f25`, `f26`, `f28`) |

Rute baru ditandai di kolom **Layar baru** tiap milestone. Jangan menambah rute sebelum milestone pemiliknya dikerjakan; jumlah pastinya mengikuti tabel di bawah, bukan angka ringkasan yang mudah basi.

## 2. Dampak per milestone

### M0, model domain (tanpa layar)

| Requirement | Permukaan | Perubahan | Risiko |
|---|---|---|---|
| R-CUS-ORDER, R-BATCH, R-QUOTA, R-MER-PROMO, R-MER-CATALOG, R-HISTORY, R-CONFIG, R-CURRENCY | `src/types.ts:1147` (blok domain mvp), `src/data/marketplace.ts:14`, `src/store/index.ts` | Tambah enum status §7.5 + flag `pendingRefund`, status batch 3 nilai, dua jenis kuota, program 4 tipe + budget, membership, poin, UA, riwayat, 16 key config, konstanta Pc/Pm/Pk/Ft. Slice baru didaftarkan; tipe pensiun (`dana_va`, `dana_qris`, `cod` wallet hold, `HoldStatus`, `courierPartner`) ditandai | Tinggi: satu perubahan tipe menyentuh 22 slice |

### M1, akun & consent

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-ACC | `/customer/signin`, `/signup`, `/verification`, `/forgot-password`, `/forgot-password-otp`, `/create-password`, `/merchant/signin`, `/merchant/signup`, `/courier/signin`, `/courier/onboarding` | Ganti magic link/OTP tampil ke **reverse OTP WhatsApp**: tiga state (kirim kode, menunggu, verifikasi) + state ditolak/kedaluwarsa. `authSlice` jadi `accounts[]` + `activeRole`; satu nomor satu akun; tambah role dari dalam akun | `/role-select` (pemilih role aktif) |
| R-ACC-AGREEMENT | `/customer/onboarding`, `/merchant/onboarding`, `/courier/onboarding` | Consent User Agreement saat daftar (owner & customer), bukan layar pengunci; perubahan rule = notifikasi + pesan inbox | Inbox customer & merchant |
| R-NOTIF | `/customer/notifications`, `/merchant/notifications`, `/courier/notifications`, `/customer/notification-settings` | 14 jenis customer, 10 merchant, 2 karyawan kurir; Inbox khusus UA; payload push ber-versi | `/customer/inbox`, `/merchant/inbox` |

### M2, discovery & katalog

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-CUS-DISCOVERY | `/customer/home`, `/search`, `/filter`, `/merchant/:id` | Group **hanya per tag**, sort jarak/order/rating, filter tag/favorit/jarak/rating/jumlah order, kartu menampilkan status buka/busy/coverage/kuota, merchant blok-kuota disembunyikan, menu hide/schedule ikut pencarian, badge membership | — |
| R-CUS-CART | Home (cart quick bar + sheet), `/merchant/:id`, `/menu-detail/:id`, `/checkout` | Satu cart per merchant, beberapa cart aktif, cart tampil sebagai card di daftar order, section item tak-dapat-diproses per penyebab, catatan per order & per menu, picker poin | Panel cart per merchant (bukan sheet tunggal) |
| R-MER-CATALOG | `/merchant/menu`, `/menu-detail/:id` | Editor combo, schedule mingguan/bulanan, attribute + opsi = varian otomatis, arsip varian + daftar pemakai, stok dua scope, hide + toggle catatan | Editor combo |
| R-MER-PROFILE | `/merchant/settings`, `/merchant/onboarding` | Nomor WA profil, tag global + usul tag, rekening wajib + validasi nama | Pengelola tag |

### M3, uang

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-MONEY | `/customer/checkout`, `/merchant/wallet`, `/merchant/payout`, `/ops/liability`, `/ops/ledger` | Rumus `S − Dm − Da + F + Pc + Ft`, F ke merchant, Pk, Ft hanya QRIS, settlement 3 kolom, status payout "menunggu pencairan" | — |
| R-CURRENCY | `/customer/checkout`, `/merchant/wallet`, `/ops/settings` | Kurs harian terkunci per order, bulat atas (tagihan) / bawah (payout), label "berlaku ±1 menit" | — |
| R-CUS-PAY | `/customer/payment-selection`, `/customer/payment-amount`, `/customer/payment-dana` | Metode jadi QRIS + COD; `/payment-dana` **dihapus**; timer & masa QR dari config; tombol simpan QR (PNG); total IDR dibulatkan | — |
| R-CUS-REFUND | `/customer/refund`, `/customer/orders`, detail order | Input rekening di detail order, status transfer, kirim ulang, badge `pendingRefund`, refund selisih | Layar refund selisih |
| R-INVOICE | `/customer/orders` (receipt), `/merchant/orders`, `/ops` | Pratinjau semua status, PDF A4 hanya status akhir, ACL tanpa kurir | `/customer/invoice/:id` (+ aksi unduh PDF) |

### M4, merchant

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-MER-OPS | `/merchant/settings`, `/merchant` | Jadwal recurring per hari/tanggal, dismiss open + banner H-1 di semua layar merchant, busy terpisah dari buka/tutup | Dialog dismiss + kalender |
| R-MER-COVERAGE | `/merchant/coverage`, `/merchant/:id` (customer) | Mode area polygon / radius dengan fee WALK, validasi tumpang tindih, hitung ulang fee cart saat berubah | — |
| R-MER-ORDER | `/merchant/orders`, detail order | Accept wajib masuk batch, reject ber-alasan, ubah item selama pending + guard subtotal + riwayat perubahan, Quick **dihapus** | Editor item order |
| R-MER-CREW | `/merchant/couriers` → karyawan | 12 hak akses, pindah owner, riwayat aktivitas per tanggal | `/merchant/crew`, `/merchant/activity` |

### M5, batch & kurir

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-BATCH | `/merchant/batches/:batchId`, `/merchant/orders`, detail order customer | 3 status, maks 24, tanpa timer/extend/packing, batch tetap menerima order setelah di-assign, urutan terkunci saat delivery | — |
| R-COURIER | `/courier`, `/courier/batch`, `/courier/task/:id`, `/courier/orders` | Kurir = karyawan ber-hak "Antar order"; assignment wajib tanpa tolak; auto-sort 25×24 WALK + peringatan; lokasi live; **hapus** `/courier/partner`, `/courier/payout`, `/courier/payout-accounts`, `/courier/tips`, status online/offline, dan layar dispatch ops | — |
| R-CUS-ORDER | `/customer/orders` | Daftar gabungan cart + order aktif + riwayat, grouping/sort, beberapa order aktif, badge ganda, tanpa hitung mundur batch | — |

### M6, monetisasi

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-QUOTA | `/merchant/subscription`, `/ops/quotas`, `/customer/checkout` | Dua jenis kuota (customer & merchant), reserve/consume/return, paket periode + alacarte diskon, Pk, setting "terima tanpa kuota" hanya saat tutup, merchant tanpa kuota disembunyikan | `/customer/quota` (katalog paket customer) |
| R-MER-MEMBERSHIP | `/merchant/*` | Daftar pengajuan, approve/reject, member aktif, cabut, daftar langsung lewat nomor persis, penanda member di order | `/merchant/membership` |
| R-CUS-MEMBERSHIP | `/merchant/:id`, `/customer/home` | Ajukan (pending + `wa.me`), status, keluar, ajukan ulang, badge explore, promo terkunci | — |
| R-CUS-POINTS | `/customer/checkout`, `/customer/quota` | Picker poin di cart & pembelian kuota, potongan paling akhir, state toggle nonaktif | `/customer/points` (saldo + riwayat) |

### M7, kepercayaan & realtime

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-DISPUTE | `/customer/dispute`, `/merchant/dispute`, `/ops/disputes`, `/ops/rules`, `/superadmin/appeals` | UA wajib tanpa pilihan merchant, auto dispute final tanpa banding (appeal diarsipkan), tiket manual urut masuk + bukti gambar, kompensasi non-uang, snapshot rule ke order | Detail tiket ops |
| R-CUS-CHAT | `/customer/order-chat`, `/merchant/order-chat` | Peserta dinamis per hak akses + kurir setelah assign, label nama + peran, lampiran gambar, state ditutup | — |
| R-CUS-RATING | `/customer/orders` (detail), `/menu-detail/:id`, `/merchant/reviews` | Rating menu tanpa review, tanpa rating per varian, isi dari riwayat tanpa batas waktu | — |
| R-REALTIME | semua layar | Feed event per halaman tanpa reload, resync saat reconnect, kontrak ber-versi | — |

### M8, backoffice & laporan

| Requirement | Rute/berkas | Perubahan | Layar baru |
|---|---|---|---|
| R-OPS | 14 rute `/ops/*` | Tambah config, riwayat, moderasi tag, program aplikator + bayar/refund budget, skema diskon, dashboard per merchant, invoice, pindah owner; bentuk shell PWA + Access tetap **deviasi tercatat** | 5 layar ops |
| R-HISTORY | `/ops/*`, `/merchant/activity` | Setiap create/update/delete tercatat, jejak per field, delete = arsip, pengikut riwayat | Riwayat + pengikut |
| R-CONFIG | `/ops/settings` | 16 key config + label "berlaku ±1 menit" | — |
| R-MER-DASHBOARD | `/merchant` (dashboard), `/ops/analytics` | Line/pie/pivot, 8 measurement, 5 dimensi, customer type, interval, update realtime | Tab performa |

### M9, verifikasi lintas peran

Tidak ada layar baru. Acceptance: order yang sama konsisten di customer, merchant, karyawan kurir, ops (status, uang, batch, chat, invoice); `browser-gate --strict --click` untuk rute yang disentuh; `npm run scan` 0 FAIL; istilah lama (`DANA`, magic link, hitung mundur batch, F ke kurir) hilang dari UI.

## 3. Yang dihapus atau diarsipkan

| Permukaan | Alasan | Tindakan |
|---|---|---|
| `/customer/payment-dana` + metode `dana_va`, `dana_qris`, `wallet`, `transfer` | Beta hanya QRIS + COD (§7.1, §16) | Hapus rute + tipe, sisakan data seed untuk arsip |
| `/courier/partner`, `partnerSlice`, `CourierPartner.tsx` | Kurir partner dihapus (`R-COURIER`) | Arsipkan, jangan dipakai |
| `/courier/payout`, `/courier/payout-accounts`, `/courier/tips` | Kurir = karyawan merchant, tidak punya payout sendiri | Arsipkan (tips sudah nonaktif via `src/data/features.ts:20`) |
| `/superadmin/appeals` | Auto dispute final tanpa banding (`R-DISPUTE`) | Arsipkan, pertahankan konsol SA sebagai alat audit |
| Hitung mundur batch, extend, packing timer | Batch 3 status tanpa timer (`R-BATCH`) | Hapus dari `batchSlice`, `MerchantBatch*`, layar customer |
| Dispatch ops (`OpsDashboard` bagian dispatch) | Quick/dispatch dihapus | Hapus blok, bukan sembunyikan |
| Flow `f26-quick-dispatch` | Tidak ada lagi mitra kurir | Diarsipkan di `docs/design/flows/` |

## 4. Dampak flow (rebase wajib sebelum kode disentuh)

| Flow | Perubahan bentuk |
|---|---|
| `f21-account-auth` | Reverse OTP WhatsApp, satu nomor satu akun, multi-role + role aktif |
| `f13-courier-view` | Kurir karyawan (hak "Antar order"), tanpa partner/Quick/online-offline |
| `f25-batch-lifecycle` | 3 status, maks 24, tanpa timer/extend/packing, tetap open setelah assign |
| `f26-quick-dispatch` | Dihapus |
| `f17-payment-dana` | QRIS + COD, DANA keluar |
| `f14-chat-order` | Peserta dinamis, lampiran gambar, state ditutup + retensi |
| `f28-coverage-editor` | Fee WALK tanpa cache, mode area/radius dipertahankan |

## 5. Urutan aman

1. M0 model + konstanta (tanpa layar) supaya layar tidak menebak.
2. Rebase `f21` lalu M1 auth, karena semua layar peran bergantung pada role aktif.
3. M2 discovery/katalog, M3 uang, M4 merchant, M5 batch/kurir, M6 monetisasi, M7 trust/realtime, M8 ops, M9 verifikasi.
4. Setiap milestone memperbarui `features/<R-ID>.md` (`Status:` + acceptance) dan `milestones.md` di commit yang sama, karena ratchet menolak milestone `done` selama fitur rujukannya belum `complete`.

## 6. UNRESOLVED yang membatasi pekerjaan UI

| ID | Memblokir |
|---|---|
| OPEN-01 | Seluruh alur QRIS (layar pembayaran, status, refund) |
| OPEN-02 | Kurs harian: provider + fallback, menentukan tampilan gagal update |
| OPEN-25 | Query lintas Durable Object: sort/filter discovery, dashboard, riwayat |
| OPEN-27 | Legal: teks User Agreement dan retensi chat |
| OPEN-28 | Metrik keberhasilan: tidak ada angka target yang boleh dikarang di UI |
| OPEN-31 | Fitur bonus paket kuota: layar katalog paket customer menunggu isi |
