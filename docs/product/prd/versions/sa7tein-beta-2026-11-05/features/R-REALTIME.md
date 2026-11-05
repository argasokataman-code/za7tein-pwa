# R-REALTIME — WebSocket berversi, matriks audiens & resync

Status: partial (event mock via slice; WS, resync, matriks audiens belum) · sumber §18, §20.2 NFR-05/NFR-06, §3, §5.1.

## 1. Untuk apa

Hampir semua nilai di aplikasi ini berubah karena pihak lain (merchant, kurir, ops, sistem waktu). Tanpa event realtime, customer melihat stok, status order, atau promo yang salah sampai ia memuat ulang. Karena itu setiap perubahan state yang bisa diamati harus dipublikasikan ke pihak yang berhak, tanpa diminta, dan client yang reconnect harus menyinkronkan ulang apa yang terlewat.

## 2. Aturan

### Dasar

| # | Aturan | Sumber |
|---|---|---|
| A1 | Setiap event dikirim lewat WebSocket ke semua pihak berhak tanpa diminta | §18 |
| A2 | Kolom Merchant berarti owner dan karyawan dengan hak akses terkait event itu | §18, §11.3 |
| A3 | Perubahan data merchant oleh owner/karyawan/sistem/ops juga dikirim ke anggota tim merchant lain yang punya hak terkait (jam operasional, dismiss open, stok, setting kuota) dan antar pengguna ops | §18 |
| A4 | Event dikirim ke akun untuk semua role-nya, apa pun role aktif, sehingga pindah role langsung menampilkan state terbaru | §18, §5.1 |
| A5 | Event sesi reverse OTP terverifikasi/ditolak dikirim ke client yang sedang registrasi/login | §18, §5.1 |
| A6 | Event publik (buka/tutup, profil, katalog, program, rating, kurs, konfigurasi) bisa punya banyak penerima; pola fan-out diputuskan di desain teknis | §18 |

### Event berbasis waktu

| # | Aturan | Sumber |
|---|---|---|
| A7 | Perubahan yang dipicu waktu dikirim sistem sebagai event saat waktunya tiba: jam availability schedule, program mulai/berakhir, waktu aktif program mulai/berakhir, promo exclusive kedaluwarsa, pembayaran kedaluwarsa, tanggal berlaku UA, penutupan chat, paket berakhir, jatah kuota direset, masa punishment berakhir, banner H-1 dismiss open | §18 |
| A8 | Auto buka/tutup memakai mekanisme yang sama (alarm DO) | ARC-17 |

### Matriks audiens (ringkas per event)

| # | Event | Audiens | Sumber |
|---|---|---|---|
| A9 | Order dibuat & dibayar | customer terkait, merchant | §18 |
| A10 | Order dibatalkan/ditolak/gagal/kedaluwarsa | customer, merchant (order yang sudah diteruskan) | §18 |
| A11 | Order item diubah merchant | customer, merchant | §18 |
| A12 | Order di-accept | customer, merchant, karyawan kurir batch | §18 |
| A13 | Order masuk batch; urutan rute berubah | customer di batch (ETA), merchant, kurir | §18 |
| A14 | Batch di-assign, penuh, selesai | customer di batch, merchant, kurir | §18 |
| A15 | Delivery mulai, order berikutnya mulai diantar, lokasi kurir, kurir hampir sampai | customer (lokasi hanya saat order `delivery`), merchant, kurir | §18, §9.4 |
| A16 | Order selesai | customer (juga customer lain di batch untuk ETA), merchant, kurir | §18 |
| A17 | Dashboard performa berubah | merchant (owner + hak Laporan), ops yang membuka dashboard merchant itu | §18 |
| A18 | Status payout berubah | merchant, ops | §18 |
| A19 | Status refund berubah (termasuk flag pendingRefund, refund selisih, refund gagal) | customer, ops | §18 |
| A20 | Pesan chat; kurir bergabung/akses berakhir/chat ditutup | customer, merchant (hak terima order), kurir batch | §18 |
| A21 | Dispute dibuka/diputus; tiket diperbarui; kompensasi/punishment dijalankan | pihak terlibat, ops | §18 |
| A22 | Merchant buka/tutup/busy; tersembunyi/tampil karena kuota | merchant, customer yang melihat | §18 |
| A23 | Profil merchant berubah | merchant, customer yang melihat | §18 |
| A24 | Coverage/delivery fee berubah | merchant, customer yang melihat (termasuk yang punya cart) | §18 |
| A25 | Katalog berubah (nama, harga, kategori, urutan, attribute, opsi, combo, catatan, aktif, hide, stok, schedule, menu dihapus, varian tidak berlaku) | merchant, customer yang melihat | §18 |
| A26 | Rating/review baru; jumlah order selesai berubah | merchant, customer yang melihat | §18 |
| A27 | Kurs harian diperbarui | merchant & customer yang di layar beli paket/kuota, ops, customer yang melihat | §18 |
| A28 | Konfigurasi aplikasi berubah (Pc, transaction fee, poin, rentang riwayat) | merchant pemakai nilai, ops, customer yang melihat | §18 |
| A29 | Program marketing mulai/berubah/berakhir/dihentikan/dihapus; batas tercapai/pulih; menu hadiah tak tersedia; sisa budget | pemilik program, ops, customer yang melihat | §18 |
| A30 | Jumlah pemakaian/budget terpakai berubah | pemilik program, ops, customer dengan program yang memakai budget manual | §18 |
| A31 | Pembayaran program aplikator berhasil/kedaluwarsa; status refund sisa saldo | ops | §18 |
| A32 | Promo exclusive diterbitkan/penerima berubah/kedaluwarsa | customer penerima, pemilik program, ops | §18 |
| A33 | Saldo/riwayat sa7tein poin berubah | customer pemilik poin | §18 |
| A34 | Merchant baru meng-cover alamat default | customer pemilik alamat | §18 |
| A35 | Kuota tersedia berubah (dibeli, reserve, terpakai, kembali, hangus, reset, dikurangi, dipulihkan, menipis, habis) | customer/merchant pemilik kuota, ops | §18 |
| A36 | Pembayaran paket/kuota alacarte berhasil/kedaluwarsa; paket aktif/berakhir/dihentikan/benefit berubah | pembeli, ops | §18 |
| A37 | Katalog paket atau skema diskon berubah | merchant/customer di layar katalog/beli, ops | §18 |
| A38 | Usulan tag dibuat/disetujui/ditolak; tag global baru | pengusul, semua merchant, ops, customer yang melihat | §18 |
| A39 | Pengajuan membership dibuat/disetujui/ditolak; membership dicabut/keluar/daftar langsung | pemohon/customer, merchant | §18 |
| A40 | Opsi COD di checkout berubah karena kuota merchant | merchant, customer yang punya cart | §18 |
| A41 | Merchant mendaftar/diverifikasi/ditolak | owner, ops, customer yang melihat | §18 |
| A42 | Karyawan didaftarkan/dihapus/hak akses atau nama peran berubah; status owner dipindahkan | peserta chat aktif, owner + akun karyawan, ops (bila ops yang memindahkan) | §18 |
| A43 | User Agreement baru/berubah + tanggal berlaku mulai | semua customer, semua tim merchant, ops | §18 |
| A44 | Aktivitas baru di riwayat aktivitas merchant | owner | §18 |
| A45 | Update kurs gagal | ops | §18 |
| A46 | Entri riwayat baru pada data yang diikuti | ops pengikut | §18 |

### NFR terkait

| # | Aturan | Sumber |
|---|---|---|
| A47 | Saat WebSocket tersambung kembali, client menyinkronkan ulang state yang terlewat | NFR-05 |
| A48 | Kontrak pesan WebSocket diberi versi agar PWA dan native app bisa berjalan berdampingan | NFR-06 |
| A49 | Seluruh sistem asynchronous, reactive, realtime, event-driven | ARC-13 |

## 3. Aktor & permukaan

- Semua peran — penerima event sesuai matriks.
- Sistem — pengirim event saat waktunya tiba.

## 4. Masukan → keluaran

- Masuk: perubahan state domain, waktu terjadwal, reconnect client.
- Keluar: pesan WS berversi per event + audiens, state tersinkron setelah reconnect.

## 5. State UI

| State | Tampilan |
|---|---|
| WS terputus | indikator koneksi; data terakhir tetap tampil |
| reconnect | resync state terlewat, bukan menunggu aksi pengguna |
| event untuk role lain di akun sama | state role itu ikut mutakhir walau tidak aktif |
| event berbasis waktu | perubahan terjadi pada waktunya tanpa reload |

## 6. Kontrak BE (handoff, repo ini mock)

WS berversi; resync saat connect ulang; fan-out pola di desain teknis; event waktu dijadwalkan alarm DO.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Stok habis di merchant A langsung memindahkan item cart customer | set stok 0 → item pindah section tanpa reload | ⛔ |
| AC2 | Perubahan status order tampil tanpa reload di customer dan merchant | accept order → kedua layar berubah | ⛔ |
| AC3 | Lokasi kurir hanya dikirim ke customer saat order `delivery` | order `waitingDelivery` → tidak ada event lokasi | ⛔ |
| AC4 | Event dikirim ke semua role akun | login akun multi-role → event role lain tetap diterima | ⛔ |
| AC5 | Reconnect menyinkronkan state terlewat | putuskan WS, ubah 3 order, sambung → state sesuai | ⛔ |
| AC6 | Kontrak pesan punya versi | periksa payload → field versi ada | ⛔ |
| AC7 | Event waktu terkirim tanpa aksi pengguna | set jadwal 1 menit ke depan → event tepat waktu | ⛔ |
| AC8 | Pesan chat tidak terkirim ke karyawan tanpa hak terima order | kirim chat → akun tanpa hak tidak menerima | ⛔ |

## 8. UNRESOLVED

- Pola fan-out event publik ditunda ke desain teknis.
- Cara menyimpan/menyiarkan ETA per order masih perlu ditinjau (§9.4 catatan).

## 9. Bukti

- Kode: `src/store/slices/notificationsSlice.ts` (`PUSH_CONTRACT` mock), `src/types.ts` event types, tidak ada implementasi WS.
- Belum ada: WS client, resync, versi kontrak, matriks audiens.
