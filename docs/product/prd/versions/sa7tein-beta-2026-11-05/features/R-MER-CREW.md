# R-MER-CREW — Karyawan merchant, 12 hak akses & pemindahan owner

Status: blocked (belum ada karyawan multi-hak-akses; kurir masih role terpisah `courierSlice`) · sumber §11.3 MER-34/MER-35/MER-39, §11.4, §5.1, §12.1.

## 1. Untuk apa

Satu akun bisa bekerja di beberapa merchant dengan peran berbeda. Model karyawan menggantikan role kurir terpisah: kurir inhouse adalah karyawan merchant dengan hak akses "Antar order", sehingga tidak perlu rekening bank sendiri dan tidak ada split payout. Hak akses membatasi apa yang bisa dilakukan seorang karyawan, dan pemindahan owner menjaga merchant tetap bisa dipulihkan bila owner kehilangan akses.

## 2. Aturan

### Pendaftaran & identitas

| # | Aturan | Sumber |
|---|---|---|
| A1 | Owner mendaftarkan karyawan dengan nomor WhatsApp, nama peran, dan hak aksesnya | MER-34, §11.3 |
| A2 | Bila nomor belum terdaftar, akun dibuat saat itu; karyawan login lewat reverse OTP | §11.3, R-ACC |
| A3 | Sistem tidak mendefinisikan nama peran; nama peran ditentukan owner dan tampil di chat order | §11.3, §19.1 |
| A4 | Owner bisa mengubah nama peran kapan saja; akun yang bekerja di beberapa merchant punya nama peran terpisah di tiap merchant | §11.3 |
| A5 | Pesan chat lama tetap memakai nama peran lama | §11.3, §19.1 |
| A6 | Satu akun bisa owner atau karyawan di banyak merchant, tetapi hanya satu role per merchant | §11.3, §5.1 |
| A7 | Akun yang mendaftarkan merchant menjadi owner, selalu punya semua hak akses, tidak bisa dibatasi atau dihapus | §11.3 |
| A8 | Hanya owner yang bisa mendaftarkan, menghapus, dan mengatur hak akses karyawan; kelola karyawan bukan hak akses yang bisa diberikan | §11.3 |
| A9 | Karyawan dihapus → role merchant untuk merchant itu dihapus, role lain di akun tetap | §11.3 |
| A10 | Role merchant karyawan tidak butuh verifikasi ops maupun rekening bank sendiri | §11.3 |
| A11 | Larangan order ke merchant sendiri berlaku juga untuk karyawan | §11.3, R-ACC |

### 12 hak akses

| # | Aturan | Sumber |
|---|---|---|
| A12 | Pengaturan akun: profil, tag, coverage, delivery fee | §11.3 (MER-01/02/04) |
| A13 | Riwayat order: riwayat dan detail order serta invoice | §11.3 (MER-15/32) |
| A14 | Terima order: accept/reject, ubah order item, batch, chat order | §11.3 (MER-10..14/21/40) |
| A15 | Kelola jam operasional: buka/tutup manual, jadwal, dismiss open, busy | §11.3 (MER-03/28..30) |
| A16 | Kelola marketing program | §11.3 (MER-09) |
| A17 | Kelola menu: menu, kategori, attribute, schedule, combo | §11.3 (MER-05..08) |
| A18 | Mengelola stok | §11.3 (§13.6) |
| A19 | Payout: riwayat transaksi payout (tanpa hak ganti rekening) | §11.3 (MER-20), MER-36 |
| A20 | Membership: pengajuan, daftar member, pendaftaran langsung | §11.3 (MER-24..27/33) |
| A21 | Antar order: batch yang di-assign, detail delivery, auto-sort, delivery, lokasi live, chat order | §11.3 (MER-37/38) |
| A22 | Langganan dan kuota: pembelian paket/kuota + setting "Terima order tanpa kuota" | §11.3 (MER-17/18) |
| A23 | Dispute: laporan insiden lewat tiket | §11.3 (MER-22) |
| A24 | Laporan: dashboard performa merchant | §11.3 (MER-41) |

### Notifikasi & pencatatan

| # | Aturan | Sumber |
|---|---|---|
| A25 | Notifikasi merchant dikirim ke owner dan karyawan yang punya hak akses terkait | §11.3, R-NOTIF |
| A26 | Setiap aksi karyawan tercatat bersama akun pelakunya di riwayat aktivitas | §11.3, §12.1 |
| A27 | Karyawan tidak menyetujui User Agreement; hanya owner. Karyawan bisa melihat isinya dan menerima notifikasi/inbox perubahannya | §11.3, R-ACC-AGREEMENT |

### Pemindahan owner

| # | Aturan | Sumber |
|---|---|---|
| A28 | Owner bisa memindahkan status owner ke salah satu karyawan dari aplikasi | MER-35 |
| A29 | Bila owner tidak bisa login, ops bisa memindahkan setelah verifikasi, ke karyawan atau ke nomor WhatsApp baru | OPS-22, §11.3 |
| A30 | Setelah pindah, role merchant di akun owner lama dihapus; role lain tetap | §11.3 |
| A31 | Owner lama yang tetap bekerja bisa didaftarkan lagi sebagai karyawan oleh owner baru | §11.3 |
| A32 | Rekening bank tidak berubah saat pemindahan; owner baru bisa menggantinya kapan saja | §11.3, MER-36 |

### Riwayat aktivitas merchant (§11.4)

| # | Aturan | Sumber |
|---|---|---|
| A33 | Hanya owner yang bisa melihat riwayat aktivitas merchant | MER-39, §11.4 |
| A34 | Isi: aksi owner + karyawan merchant itu + log otomatis sistem (pelaku "Sistem") + perubahan oleh ops (pelaku "Ops sa7tein", tanpa nama petugas) | §11.4 |
| A35 | Tampilan default hari ini; bagian atas ringkasan karyawan yang beraktivitas, lalu daftar aktivitas terbaru; filter hanya tanggal | §11.4 |
| A36 | Tanggal mengikuti waktu lokal Yordania | §11.4 |
| A37 | Kolom: waktu, pelaku (nama akun + nama peran; owner berlabel Owner), aktivitas dalam kalimat, objek terkait dengan tautan | §11.4 |
| A38 | Data teknis (ID internal, metadata sistem) tidak ditampilkan | §11.4 |
| A39 | Karyawan yang hanya membaca tidak muncul di ringkasan, karena membaca tidak dicatat | §11.4, §12.1 |
| A40 | Rentang riwayat yang bisa dilihat diatur ops lewat config | §11.4, §12.2 |

## 3. Aktor & permukaan

- Owner — daftar karyawan, form karyawan (nomor WA, nama peran, hak akses), pindah owner, riwayat aktivitas.
- Karyawan — aplikasi merchant yang menunya mengikuti hak aksesnya; nama peran tampil di chat.
- Karyawan kurir — batch yang di-assign saja.
- Ops — pindah owner setelah verifikasi, melihat riwayat.

## 4. Masukan → keluaran

- Masuk: nomor WA, nama peran, daftar hak akses, aksi pindah owner.
- Keluar: role merchant per akun, menu yang tampil per hak akses, entri riwayat aktivitas, event `crew_added`/`crew_removed`/`crew_access_changed`/`owner_transferred`.

## 5. State UI

| State | Tampilan |
|---|---|
| nomor WA sudah terdaftar | akun yang ada langsung mendapat role merchant |
| karyawan tanpa hak "Terima order" | menu order dan chat order tidak tampil |
| hak akses dicabut saat chat aktif | akses chat berakhir, riwayat tidak bisa dibuka |
| owner pindah | akun lama kehilangan menu owner, akun baru mendapat semua hak |
| riwayat kosong pada tanggal itu | empty state + tanggal terpilih |

## 6. Kontrak BE (handoff, repo ini mock)

Field karyawan {merchant, akun, nama peran, akses[]}; validasi owner-only; event `crew_*`; riwayat aktivitas query per merchant per tanggal; pengikut riwayat.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Karyawan baru dengan nomor belum terdaftar mendapat akun dan bisa login reverse OTP | daftarkan nomor baru → login → masuk sebagai karyawan merchant itu | ⛔ |
| AC2 | 12 hak akses tersedia dan masing-masing membuka menu yang disebut | centang tiap hak → menu yang muncul sesuai tabel | ⛔ |
| AC3 | Hak "Payout" tidak membuka penggantian rekening | login karyawan ber-hak payout → form rekening tidak ada | ⛔ |
| AC4 | Satu akun punya nama peran berbeda di dua merchant | daftarkan akun sama di 2 merchant → chat menampilkan peran masing-masing | ⛔ |
| AC5 | Mengubah nama peran tidak mengubah pesan lama | ubah peran → pesan lama tetap | ⛔ |
| AC6 | Karyawan dihapus kehilangan role merchant, role lain tetap | hapus → akun masih customer | ⛔ |
| AC7 | Pindah owner memindahkan semua hak dan mempertahankan rekening | pindah → owner baru punya semua hak; rekening sama | ⛔ |
| AC8 | Riwayat aktivitas hanya bisa dibuka owner dan memuat pelaku Sistem/Ops | login karyawan → menu riwayat tidak ada | ⛔ |
| AC9 | Karyawan yang hanya membaca tidak muncul di ringkasan | buka order sebagai karyawan → ringkasan tidak memuatnya | ⛔ |

## 8. UNRESOLVED

- Rentang hari riwayat aktivitas merchant = config ops; nilai awal tidak dicantumkan.
- Apakah karyawan bisa punya lebih dari satu nama peran di satu merchant tidak diatur (satu role per merchant).

## 9. Bukti

- Kode: `src/store/slices/courierSlice.ts`, `src/pages/MerchantCouriers.tsx`, `src/store/slices/authSlice.ts:14`, `src/pages/SaRoles.tsx`, `src/pages/SaAudit.tsx`.
- Belum ada: model karyawan + 12 hak akses, pindah owner, riwayat aktivitas merchant.
