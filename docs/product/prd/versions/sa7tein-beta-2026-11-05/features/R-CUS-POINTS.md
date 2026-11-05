# R-CUS-POINTS — Sa7tein poin

Status: blocked (belum ada; hanya `LoyaltyCard.points` lama) · sumber §14.5, §10 CUS-37, §12.2 OPS-19.

## 1. Untuk apa

Poin loyalty milik **aplikator** memberi alasan memesan lewat sa7tein di merchant mana pun. Poin bukan program marketing dan tidak punya reward; ia hanya mengurangi total order atau harga pembelian kuota/paket.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Toggle on/off + nilai konversi poin→JOD disimpan di `applicationConfiguration` | §14.5, §12.2 |
| A2 | Saat toggle aktif, semua customer otomatis punya saldo (boleh 0) | §14.5 |
| A3 | Saat toggle aktif **wajib** ada minimal 1 rule; rule terakhir tidak bisa dihapus | §14.5, OPS-19 |
| A4 | Toggle nonaktif: poin tetap ada, tidak bisa didapat/dipakai | §14.5 |
| A5 | Rule: syarat seperti rule program (min qty/min belanja) + besaran poin; 3 mode (per order, per 1 JOD, per unit) | §14.5 |
| A6 | Poin semua rule yang cocok dijumlahkan, dibulatkan **ke bawah** ke bilangan bulat | §14.5 |
| A7 | Poin masuk **setelah order selesai** (termasuk COD), dari order item akhir | §14.5 |
| A8 | Poin dipakai **di-reserve** saat order dibuat; kembali bila batal/tolak/gagal | §14.5, OPEN-40 |
| A9 | Customer memilih sendiri jumlah poin, maksimal senilai total yang harus dibayar | §14.5, CUS-37, OPEN-61 |
| A10 | Potongan poin diterapkan **paling akhir**, setelah semua diskon promo | §14.5, §14.3 |
| A11 | Pada pembelian kuota/paket, poin di-reserve saat pembayaran dibuat | §14.5 |
| A12 | Poin tidak pernah hangus; hanya satu sa7tein poin untuk seluruh aplikasi | §14.5 |
| A13 | Pilihan poin terlepas bila toggle off / saldo turun / keluar dari detail cart | §14.5, §7.1 |
| A14 | Potongan poin ditanggung aplikator dan masuk `Da` | §14.5, §15.3 |
| A15 | Riwayat poin per baris: deskripsi, masuk/terpakai, referensi order/pembelian | §14.5 |

## 3. Aktor & permukaan

- Customer — saldo + riwayat, picker poin di cart & pembelian kuota.
- Ops — toggle, konversi, rule.
- Merchant — tidak mengelola poin.

## 4. Masukan → keluaran

- Masuk: total order, jumlah poin dipilih, rule.
- Keluar: potongan JOD, saldo, baris riwayat, event `points_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| toggle off | saldo tampil, kontrol pakai nonaktif + alasan |
| saldo 0 | list riwayat kosong + keterangan cara dapat poin |
| saldo tersedia | input/slider jumlah poin + estimasi potongan JOD |
| poin berubah di perangkat lain | pilihan terlepas otomatis + pesan |

## 6. Kontrak BE (handoff, repo ini mock)

Rule DO (multi) + toggle & konversi di KV; reserve/consume/return; ledger baris poin; event + notifikasi saldo.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Toggle off → tombol pakai poin nonaktif, saldo tetap tampil | toggle → inspeksi | ⛔ |
| AC2 | Potongan = jumlah poin × konversi, diterapkan setelah semua diskon | banding total vs urutan hitung | ⛔ |
| AC3 | Poin tidak bisa dipakai melebihi total yang harus dibayar | input melebihi → dibatasi | ⛔ |
| AC4 | Batal order mengembalikan poin sebagai baris tersendiri | batal → riwayat +1 baris masuk | ⛔ |
| AC5 | Poin masuk hanya setelah order done | set pending → saldo tidak berubah | ⛔ |

## 8. UNRESOLVED

- Nilai konversi & nilai awal toggle = `applicationConfiguration` tanpa nilai di PRD (§12.2).
- Perhitungan poin saat order item diubah (OPEN-86) perlu verifikasi angka.

## 9. Bukti

- Kode lama: `src/types.ts:1395` (`LoyaltyCard.points`), `src/hooks/useProgramDiscount.ts:51`.
