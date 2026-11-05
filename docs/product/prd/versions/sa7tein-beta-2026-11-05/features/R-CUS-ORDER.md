# R-CUS-ORDER — Daftar & detail order, perubahan item oleh merchant

Status: partial (status 5 tahap; model beta belum) · sumber §7, §7.5, §8, §10 CUS-21..CUS-24, CUS-40.

## 1. Untuk apa

Customer memantau beberapa order sekaligus dari satu daftar, dan merchant kadang perlu mengubah isi order sebelum menerimanya (mis. stok bagian ayam habis). Perubahan itu harus terlihat, tercatat, dan punya konsekuensi uang yang jelas.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Beberapa order aktif sekaligus, merchant sama atau berbeda | CUS-21 |
| A2 | Status order: `draft, waitingPayment, pending, prepare, waitingDelivery, delivery, done, failed, canceled, rejected` + **flag** `pendingRefund` | §7.5, OPEN-26 |
| A3 | `pending` = menunggu merchant (online setelah bayar, COD langsung); selama pending merchant boleh ubah item | §7.5, §7.4 |
| A4 | `prepare` sejak accept sampai batch mulai delivery; `waitingDelivery` menunggu giliran; `delivery` sedang diantar (order pertama langsung, berikutnya setelah order sebelumnya done) | §7.5, BR-B14 |
| A5 | Customer batal hanya dari `waitingPayment`/`pending` (sebelum accept); merchant tanpa batas waktu accept | §7, CUS-22 |
| A6 | Merchant ubah item: ubah/ganti menu atau opsi, tambah, kurangi qty, hapus — **tanpa persetujuan sistem** | §7.4, MER-40 |
| A7 | Semua perubahan tidak boleh membuat subtotal-sebelum-promo **lebih besar** dari subtotal saat order dibuat; pembanding tetap subtotal awal walau diubah berkali-kali | §7.4 |
| A8 | Bila subtotal akhir < subtotal awal setelah promo → refund selisih saat accept | §7.4 |
| A9 | Promo **tidak** dihitung ulang (termasuk ongkir & free product); Ft tidak dihitung ulang/direfund | §7.4 |
| A10 | Reservasi stok disesuaikan; menu pengganti wajib aktif, sesuai schedule, stok cukup, harga saat perubahan | §7.4, §13.6 |
| A11 | Customer dapat notifikasi + melihat item terbaru; tetap bisa batal selama belum accept | CUS-40, §7.4 |
| A12 | Setiap perubahan tercatat di riwayat aktivitas order + merchant, jadi bukti dispute | §7.4, §11.4 |
| A13 | Daftar menggabungkan cart + order aktif + riwayat; group per merchant/status; sort status/nilai transaksi | CUS-24, §7.1 |
| A14 | Detail order menampilkan status realtime **tanpa hitung mundur**; ETA tiba saat delivery | BR-B14, CUS-23 |
| A15 | Badge ganda: badge status + badge pending refund | §7.1 |

## 3. Aktor & permukaan

- Customer — daftar order, detail order, notifikasi perubahan.
- Merchant — detail order, editor item (hak "terima order").
- Ops — riwayat perubahan sebagai bukti.

## 4. Masukan → keluaran

- Masuk: order + order item, aksi merchant, status batch.
- Keluar: status order, snapshot subtotal awal, riwayat perubahan item, refund selisih, event order*.

## 5. State UI

| State | Tampilan |
|---|---|
| draft | card cart dengan CTA lanjutkan |
| menunggu bayar | timer + CTA bayar |
| pending | "menunggu konfirmasi merchant" |
| prepare | "sedang disiapkan" |
| waitingDelivery | "menunggu giliran pengantaran" |
| delivery | peta posisi kurir + ETA |
| pendingRefund | badge kedua + CTA isi rekening |
| final | badge done/failed/canceled/rejected |

## 6. Kontrak BE (handoff, repo ini mock)

Enum §7.5; flag `pendingRefund`; snapshot `subtotal_awal`; guard subtotal server-side; event `order_created`, `order_item_changed`, `order_status_changed`.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Daftar memuat cart + order aktif + riwayat dalam satu layar | hitung card per kategori | ⛔ `MyOrder.tsx` belum gabungan |
| AC2 | Sort default: draft → waitingPayment → pending → pendingRefund | urutan kartu | ⛔ |
| AC3 | Merchant menaikkan subtotal di atas subtotal awal → ditolak | simpan perubahan → pesan error | ⛔ |
| AC4 | Subtotal turun di bawah nilai setelah promo → refund selisih muncul | hitung selisih vs refund | ⛔ |
| AC5 | Promo tidak berubah setelah item diubah | diskon sebelum vs sesudah | ⛔ |
| AC6 | Tidak ada hitung mundur di detail order customer | inspeksi layar | 🟡 masih ada countdown batch |
| AC7 | Status order berubah tanpa reload | dua tab / event | ⛔ |

## 8. UNRESOLVED

- Perhitungan refund selisih yang melibatkan poin (OPEN-86) diputuskan "tanpa pengembalian poin", tetapi contoh angkanya perlu verifikasi saat uang diimplementasikan.
- Enum final menunggu ERD (OPEN-26 sudah diputuskan di PRD, nama kolom di ERD belum).

## 9. Bukti

- Kode: `src/types.ts:536,591`, `src/pages/MyOrder.tsx`, `src/components/OrderStageScreen.tsx`, `src/store/slices/customerOrdersSlice.ts:17`.
