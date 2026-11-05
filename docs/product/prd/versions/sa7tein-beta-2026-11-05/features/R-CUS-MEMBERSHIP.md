# R-CUS-MEMBERSHIP — Membership merchant sisi customer

Status: blocked (belum ada di repo; menunggu model membership) · sumber §14.4, §10 CUS-34..CUS-36, CUS-39.

## 1. Untuk apa

Merchant ingin mengenali pelanggan tetapnya dan memberi promo khusus member. Membership menggantikan gift card/eWallet yang berisiko stored value, dan dipakai sebagai kanal pengajuan lewat WhatsApp yang memang sudah dipakai merchant.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Membership selalu tersedia di semua merchant; merchant tidak bisa menonaktifkan | §14.4 |
| A2 | Customer ajukan dari detail merchant → pengajuan `pending` berisi nama + nomor HP | §14.4, CUS-34 |
| A3 | Bersamaan, aplikasi membuka `wa.me/{nomor merchant}` dengan pesan + link detail pengajuan siap kirim | §14.4 |
| A4 | Pengajuan tetap masuk daftar walau pesan WA tidak dikirim | §14.4 |
| A5 | Link pengajuan hanya bisa dibuka merchant pemilik (termasuk karyawan ber-hak) | §14.4, CUS-35 |
| A6 | Customer melihat status pengajuan/membership di detail merchant | CUS-35 |
| A7 | Selama pending/aktif, customer tidak bisa mengajukan lagi | §14.4 |
| A8 | Customer bisa **keluar**; boleh ajukan ulang setelah ditolak/dicabut/keluar | CUS-36 |
| A9 | Badge membership tampil di screen explore untuk member aktif (bukan pending) | CUS-39, §14.4 |
| A10 | Promo khusus member tampil **terkunci** bagi non-member | §14.3, §14.4 |
| A11 | Nomor HP customer diambil dari nomor WhatsApp akun | CUS-34, §5.1 |

## 3. Aktor & permukaan

- Customer — detail merchant (tombol ajukan/keluar/status), badge di explore, list promo terkunci.
- Merchant — lihat R-MER-MEMBERSHIP.
- Ops — tidak terlibat langsung.

## 4. Masukan → keluaran

- Masuk: aksi ajukan/keluar, nomor WA merchant.
- Keluar: membership {customer, merchant, status}, pesan WA pra-isi, event membership*.

## 5. State UI

| State | Tampilan |
|---|---|
| bukan member | CTA "Ajukan membership" + penjelasan benefit |
| pending | label "Menunggu persetujuan" + tombol batal? (tidak diatur) |
| aktif | label "Member" + CTA keluar |
| ditolak | alasan? (tidak diatur) + CTA ajukan ulang |
| badge explore | ikon member di kartu merchant |
| promo member (non-member) | kartu promo terkunci + ajakan bergabung |

## 6. Kontrak BE (handoff, repo ini mock)

Entity membership + riwayat status; keunikan (customer, merchant) untuk pending/aktif; pencarian merchant by nomor WA persis; deep link pengajuan; event + notifikasi hasil.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Ajukan membership membuka WA dengan pesan + link terisi | klik → URL wa.me berisi teks | ⛔ |
| AC2 | Pengajuan tampil di merchant walau WA tidak dikirim | buat pengajuan tanpa kirim WA → muncul di daftar | ⛔ |
| AC3 | Tidak bisa ajukan lagi saat pending/aktif | tombol ajukan tidak tersedia | ⛔ |
| AC4 | Badge hanya untuk status aktif | set pending → badge hilang | ⛔ |
| AC5 | Promo khusus member terkunci untuk non-member | lihat list promo sebagai non-member | ⛔ |

## 8. UNRESOLVED

- Tampilan/alasan saat pengajuan ditolak tidak dirinci.
- Nomor WhatsApp merchant wajib ada di profil (MER-01) — belum ada field di kode.

## 9. Bukti

- Kode: tidak ada (0 hit `membership` di `src/`).
- Terkait: `src/pages/MerchantPage.tsx`, `src/pages/MerchantPromos.tsx`.
