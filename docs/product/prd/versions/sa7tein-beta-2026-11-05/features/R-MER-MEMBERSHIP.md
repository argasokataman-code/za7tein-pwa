# R-MER-MEMBERSHIP — Pengajuan, approve/reject, member aktif & daftar langsung

Status: blocked (belum ada model membership; 0 hit `membership` di `src/`) · sumber §14.4 MER-24..MER-27, MER-33, OPEN-76/OPEN-77.

## 1. Untuk apa

Membership menggantikan gift card dan eWallet: ikatan eksklusif antara satu customer dan satu merchant, selalu tersedia dan tidak bisa dinonaktifkan merchant. Nilainya ada pada dua hal: badge/pengakuan di sisi customer dan akses promo khusus member, serta penanda di setiap order masuk agar merchant tahu order itu datang dari member.

## 2. Aturan

### Pengajuan (customer → merchant)

| # | Aturan | Sumber |
|---|---|---|
| A1 | Customer menekan tombol ajukan membership di layar detail merchant | CUS-34, §14.4 |
| A2 | Sistem menambahkan pengajuan berstatus pending di aplikasi merchant berisi nama dan nomor HP customer | MER-24, §14.4 |
| A3 | Bersamaan, aplikasi customer membuka `wa.me/{nomor WhatsApp merchant}` dengan pesan siap kirim berisi kalimat pengajuan + link ke detail pengajuan | §14.4 |
| A4 | Pesan dikirim dari WhatsApp customer, bukan nomor sa7tein; pesan hanya disiapkan, customer yang menekan kirim | §14.4 |
| A5 | Pengajuan tetap masuk daftar pending walau pesan WhatsApp tidak dikirim | §14.4 |
| A6 | Link hanya bisa dibuka merchant pemilik pengajuan, termasuk karyawan dengan hak akses terkait | §14.4, §11.3 |
| A7 | Detail pengajuan memuat tombol approve dan reject; approve menjadikan customer member aktif | MER-24 |
| A8 | Merchant mendapat notifikasi pengajuan baru; customer mendapat notifikasi saat disetujui atau ditolak | §14.4, R-NOTIF |
| A9 | Selama pengajuan pending atau membership aktif, customer tidak bisa mengajukan lagi ke merchant yang sama | §14.4 |
| A10 | Status pengajuan atau membership tampil di detail merchant | CUS-34..36 |
| A11 | Merchant wajib punya nomor WhatsApp di profil | §14.4, R-MER-PROFILE |
| A12 | Customer bisa keluar dari membership dan boleh mengajukan ulang berkali-kali setelah ditolak | CUS-36, §14.4 |
| A13 | Merchant bisa mencabut membership lewat tombol | MER-26 |

### Daftar langsung oleh merchant

| # | Aturan | Sumber |
|---|---|---|
| A14 | Merchant bisa mendaftarkan customer sebagai member aktif tanpa pengajuan | MER-33 |
| A15 | Pencarian customer memakai nomor WhatsApp akun dengan pencocokan persis, agar merchant tidak bisa menelusuri daftar customer | MER-33, §14.4 |
| A16 | Membership hasil pendaftaran langsung aktif tanpa persetujuan customer; customer dinotifikasi dan tetap bisa keluar kapan saja | §14.4 |
| A17 | Customer yang sudah member aktif tidak bisa didaftarkan lagi; bila ada pengajuan pending, merchant cukup approve | §14.4 |
| A18 | Customer yang pernah keluar sendiri tidak bisa didaftarkan langsung lagi; hanya bisa bergabung lewat pengajuan sendiri | §14.4 |

### Member aktif, badge & penanda order

| # | Aturan | Sumber |
|---|---|---|
| A19 | Merchant melihat daftar member aktif | MER-25 |
| A20 | Setiap order dari member aktif diberi penanda membership, apa pun metode bayarnya | MER-27 |
| A21 | Penanda tampil di daftar order masuk, order aktif, riwayat, dan detail order | §14.4 |
| A22 | Penanda mengikuti status membership saat order dibuat, tidak berubah bila membership berakhir setelahnya | MER-27, §14.4 |
| A23 | Badge membership tampil di screen explore merchant customer hanya untuk membership aktif, bukan pengajuan pending | CUS-39, §14.4 |
| A24 | Promo merchant bertanda khusus member hanya berlaku untuk member aktif; bagi non-member promo tampil terkunci sebagai ajakan bergabung | CUS-35, §14.4 |
| A25 | Member aktif mendapat web push setiap kali merchant itu punya program baru, khusus member maupun bukan | §14.4, R-NOTIF |

## 3. Aktor & permukaan

- Customer — tombol ajukan di detail merchant, status (pending/aktif/ditolak), tombol keluar, badge di explore.
- Merchant (hak "Membership") — daftar pengajuan pending, detail pengajuan, daftar member aktif, pencarian nomor persis, tombol cabut.
- Ops — melihat data membership (baca).

## 4. Masukan → keluaran

- Masuk: pengajuan customer, approve/reject, nomor WA persis, aksi cabut/keluar.
- Keluar: entitas membership {customer, merchant, status, waktu}, tautan `wa.me`, penanda order, badge explore, event `membership_*`.

## 5. State UI

| State | Tampilan |
|---|---|
| belum mengajukan | tombol ajukan membership |
| pengajuan pending | status pending, tombol ajukan nonaktif |
| member aktif | status aktif + tombol keluar (customer) / cabut (merchant) |
| ditolak | status ditolak, boleh ajukan lagi |
| pencarian nomor tidak ketemu | hasil kosong, tanpa daftar customer |
| nomor cocok tapi pernah keluar sendiri | pendaftaran langsung ditolak + alasan |

## 6. Kontrak BE (handoff, repo ini mock)

Entitas membership + riwayat status; keunikan pengajuan per pasangan; pencarian persis (anti-enumerasi); event `membership_requested`, `membership_approved`, `membership_rejected`, `membership_revoked`, `membership_left`; notifikasi hasil.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Ajukan membership membuat 1 pengajuan pending + membuka `wa.me` nomor merchant | klik ajukan → 1 entri pending, tab `wa.me` terbuka | ⛔ |
| AC2 | Pengajuan tetap masuk walau pesan WA tidak dikirim | batalkan kirim → entri pending tetap ada | ⛔ |
| AC3 | Approve menjadikan member aktif dan mengirim notifikasi | approve → status aktif + notifikasi customer | ⛔ |
| AC4 | Customer tidak bisa mengajukan dua kali saat pending/aktif | klik ajukan lagi → nonaktif | ⛔ |
| AC5 | Pencarian langsung hanya cocok persis | cari sebagian nomor → hasil kosong | ⛔ |
| AC6 | Customer yang keluar sendiri tidak bisa didaftarkan langsung | cari nomor itu → ditolak | ⛔ |
| AC7 | Badge explore hanya untuk member aktif | set pending → badge tidak tampil | ⛔ |
| AC8 | Penanda order mengikuti status saat order dibuat | order lalu cabut membership → penanda tetap | ⛔ |
| AC9 | Promo khusus member terkunci untuk non-member | buka promo sebagai non-member → terkunci | ⛔ |

## 8. UNRESOLVED

- OPEN-76/OPEN-77 diputuskan di §14.4; rujukan final = §14.4.
- Apakah reject butuh alasan tidak diatur.

## 9. Bukti

- Kode: belum ada (`grep -ri membership src/` = 0 hit).
- Aset terkait: `src/pages/MerchantPage.tsx` (tombol ajukan), `src/pages/Home.tsx` (badge explore), `src/store/slices/marketingSlice.ts` (promo khusus member).
