# R-NOTIF — Notifikasi in-app, web push & Inbox User Agreement

Status: partial (slice notifikasi + pusat preferensi ada; Inbox dan matriks jenis belum) · sumber §19.3, §10 CUS-29, §11.2, §11.3 MER-23, §9.4, §12.2.

## 1. Untuk apa

Notifikasi adalah kanal agar perubahan state yang tidak dilihat pengguna tetap sampai: status order, order item yang diubah merchant, kurir hampir sampai, program baru, hasil membership, kuota menipis, dan perubahan User Agreement. Inbox dipisahkan karena perubahan User Agreement wajib bisa dibaca ulang kapan saja, bukan sekadar lewat notifikasi yang hilang saat dihapus.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Kanal: event realtime in-app dan web push; keduanya untuk jenis yang sama | §19.3 |
| A2 | Di iOS, web push hanya berfungsi bila PWA di-install ke home screen (L2, diterima MVP) | §19.3, §21.1 |
| A3 | Inbox khusus perubahan User Agreement; isinya detail perubahan yang bisa dibuka kapan saja di aplikasi customer dan merchant | §19.3, §17 |
| A4 | Customer menerima 14 jenis: perubahan status order, perubahan order item oleh merchant, kurir hampir sampai, program baru dari aplikator, program baru dari merchant tempat ia member aktif, promo exclusive, hasil pengajuan membership, pendaftaran membership oleh merchant, kuota customer menipis/habis, perubahan UA, update tiket & hasil dispute, refund gagal yang perlu perbaikan rekening, merchant di cart yang tidak lagi busy, merchant baru yang meng-cover alamat default | §19.3 |
| A5 | Merchant menerima 10 jenis: order baru, order dibatalkan, pesan chat, dispute, perubahan UA, payout, kuota merchant menipis/habis, hasil moderasi tag, pengajuan membership baru, perubahan status buka/tutup oleh jam operasional | §19.3 |
| A6 | Karyawan kurir menerima 2 jenis: batch di-assign, order baru masuk batch | §19.3 |
| A7 | Notifikasi merchant dikirim ke owner dan karyawan yang punya hak akses terkait (contoh: order baru ke hak "Terima order") | §11.3 |
| A8 | Ops yang menjadi pengikut riwayat menerima notifikasi setiap entri riwayat baru pada data yang diikuti | §19.3, §12.1 |
| A9 | Ambang "kurir hampir sampai" berbasis waktu dan nilainya diatur ops lewat config | §9.4, §12.2 |
| A10 | Ambang kuota menipis diatur ops, terpisah untuk merchant dan customer | §12.2 |
| A11 | Notifikasi "merchant tidak busy lagi" dikirim ke customer yang cart-nya tertahan | §11.2 |
| A12 | Semua jenis notifikasi punya event realtime pasangannya di §18; tidak ada jenis notifikasi tanpa event | §18 |

## 3. Aktor & permukaan

- Customer — daftar notifikasi, pengaturan notifikasi, halaman Inbox.
- Merchant (owner + karyawan) — daftar notifikasi, pengaturan, Inbox.
- Karyawan kurir — notifikasi batch.
- Ops — notifikasi entri riwayat (pengikut).

## 4. Masukan → keluaran

- Masuk: event domain (order, batch, chat, dispute, kuota, program, membership, UA, riwayat), config ambang.
- Keluar: daftar notifikasi per akun, badge belum dibaca, pesan inbox UA, push payload ber-versi.

## 5. State UI

| State | Tampilan |
|---|---|
| izin push belum diberikan | daftar in-app tetap jalan; ajakan mengaktifkan push |
| iOS, PWA belum di-install | keterangan bahwa push butuh install |
| inbox kosong | empty state, bukan daftar kosong tanpa teks |
| UA berubah | pesan inbox baru + detail perubahan (rule tambah/ubah/hapus + tanggal berlaku) |
| push gagal terkirim | tidak menghapus entri in-app; entri tetap ada |

## 6. Kontrak BE (handoff, repo ini mock)

Push payload ber-versi; entitas inbox message (versi rule, waktu, ringkasan perubahan); event per jenis mengikuti matriks §18; pengiriman ulang tidak boleh menggandakan entri (NFR-01).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Inbox hanya berisi perubahan UA, tidak menampung notifikasi order | buka Inbox → tidak ada entri status order | ⛔ halaman belum ada |
| AC2 | Setiap perubahan UA menghasilkan satu pesan inbox berisi rule yang ditambah/diubah/dihapus + tanggal berlaku | ubah 1 rule di ops → 1 pesan, isinya menyebut rule itu | ⛔ |
| AC3 | Customer menerima 14 jenis, merchant 10, kurir 2 | hitung jenis pada daftar notifikasi tiap peran | ⛔ |
| AC4 | Karyawan tanpa hak "Terima order" tidak menerima notifikasi order baru | hapus hak → order baru masuk → tidak ada notifikasi | ⛔ |
| AC5 | Pengikut riwayat menerima notifikasi entri baru hanya untuk data yang diikuti | set pengikut 1 data → ubah data lain → tidak ada notifikasi | ⛔ |
| AC6 | Ambang "hampir sampai" mengikuti config, bukan konstanta | ubah config → notifikasi bergeser sesuai nilai baru | ⛔ |

## 8. UNRESOLVED

- Isi persis push payload per jenis tidak diatur PRD; hanya "ber-versi" (NFR-06).
- Perilaku bila pengguna menolak izin push permanen tidak diatur.

## 9. Bukti

- Kode: `src/store/slices/notificationsSlice.ts`, `src/pages/Notifications.tsx`, `src/pages/NotificationSettings.tsx` (`PUSH_CONTRACT` mock).
- Belum ada: halaman Inbox, matriks 14/10/2 jenis, config ambang.
