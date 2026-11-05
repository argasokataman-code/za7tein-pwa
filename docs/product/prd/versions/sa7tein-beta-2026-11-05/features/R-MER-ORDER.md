# R-MER-ORDER — Accept/reject, ubah order item & riwayat perubahan

Status: partial (order masuk + accept/reject ada; ubah item, guard subtotal, Quick belum dihapus) · sumber §7.2 MER-10/MER-11/MER-14/MER-15, §7.4 MER-40, §7.5, §15.5.

## 1. Untuk apa

Merchant adalah pihak yang memutuskan order diterima atau tidak, dan satu-satunya pihak yang boleh mengubah isi order setelah order dibuat. Karena perubahan itu terjadi tanpa persetujuan sistem, jejaknya harus lengkap: subtotal pembanding tersimpan, refund selisih dihitung saat accept, dan riwayat aktivitas mencatat pelakunya untuk dipakai bila terjadi dispute.

## 2. Aturan

### Menerima order

| # | Aturan | Sumber |
|---|---|---|
| A1 | Merchant menerima order masuk secara realtime | MER-10, §18 |
| A2 | Merchant accept atau reject; reject wajib alasan berupa teks bebas dan alasan ditampilkan ke customer | MER-10, §7.3 |
| A3 | Tidak ada batas waktu untuk accept maupun reject | MER-10, §7.2 |
| A4 | Saat accept, merchant wajib memasukkan order ke batch baru atau batch berstatus open yang belum berisi 24 order | MER-11, BR-B02 |
| A5 | Order online baru diteruskan ke merchant setelah pembayaran berhasil; order COD langsung pending saat dibuat | §15.2, §7.5 |
| A6 | Hanya owner dan karyawan ber-hak "Terima order" yang bisa accept/reject, mengubah order item, mengelola batch, dan ikut chat order | §11.3 |
| A7 | Order Quick dihapus bersama kurir partner | MER-12, MER-13, B-02 |

### Ubah order item (§7.4)

| # | Aturan | Sumber |
|---|---|---|
| A8 | Perubahan hanya selama order pending (menunggu respons merchant); setelah accept atau reject tidak bisa diubah | §7.4 |
| A9 | Perubahan yang bisa dilakukan: mengubah menu/opsi, menambah item, mengurangi qty, menambah qty, dan menghapus order item | MER-40 |
| A10 | Sistem tidak meminta persetujuan customer; persetujuan cukup lewat chat order | §7.4, §19.1 |
| A11 | Subtotal sebelum promo subtotal tidak boleh melebihi subtotal sebelum promo subtotal saat order dibuat; pembanding selalu subtotal awal walau diubah beberapa kali | §7.4 |
| A12 | Bila subtotal akhir sebelum promo lebih kecil dari subtotal awal setelah promo, aplikator wajib refund selisihnya | §7.4, R-CUS-REFUND |
| A13 | Promo tidak dihitung ulang setelah perubahan, termasuk promo ongkir dan free product | §7.4 |
| A14 | Menu yang ditambahkan/dipakai sebagai pengganti wajib aktif, sesuai schedule, stok cukup, dengan harga menu saat perubahan | §7.4, §13.6 |
| A15 | Reservasi stok disesuaikan: item dihapus/dikurangi melepas reservasi, item ditambah me-reserve stok | §7.4 |
| A16 | Customer menerima notifikasi setiap perubahan dan melihat item terbaru di detail order | §7.4, R-NOTIF |
| A17 | Setiap perubahan tercatat di riwayat aktivitas order beserta pelakunya dan tampil di riwayat aktivitas merchant | §7.4, §11.4, §12.1 |
| A18 | Invoice mengikuti order item terbaru dan mencatat refund selisih bila ada | §7.4, §15.8 |

### Uang pada perubahan item

| # | Aturan | Sumber |
|---|---|---|
| A19 | Refund selisih ditetapkan saat merchant accept (karena setelah itu item tidak bisa diubah), lalu mengikuti alur refund ke rekening bank | §7.4, §15.6 |
| A20 | Bila order ditolak/dibatalkan, berlaku refund penuh, bukan refund selisih | §7.4, §7.3 |
| A21 | Order COD tidak menghasilkan refund; selisih mengurangi tagihan tunai customer | §7.4, §15.5 |
| A22 | Transaction fee tidak dihitung ulang dan tidak ikut di-refund | §7.4 |
| A23 | Payout merchant dihitung dari order item akhir; diskon yang hilang dikurangkan dari potongan poin lebih dulu, lalu promo subtotal | §7.4 |
| A24 | Poin yang sudah dipakai tidak dikembalikan; refund selisih = uang, bukan poin | §7.4, OPEN-85/OPEN-86 |

### Melihat order

| # | Aturan | Sumber |
|---|---|---|
| A25 | Merchant melihat order aktif, riwayat order, detail order termasuk catatan per order dan per menu, serta live tracking delivery | MER-15 |
| A26 | Detail order menampilkan isi combo sampai tingkat terdalam, penanda membership, dan status realtime | §13.7, §14.4, §18 |
| A27 | Catatan per menu hanya terlihat merchant; catatan per order terlihat merchant dan kurir | CUS-31 |

## 3. Aktor & permukaan

- Owner/karyawan ber-hak "Terima order" — daftar order masuk, detail order, editor item, pilih batch.
- Customer — menerima notifikasi perubahan dan melihat item terbaru.
- Karyawan kurir — melihat detail delivery (tanpa catatan per menu).
- Ops — melihat order untuk dispute.

## 4. Masukan → keluaran

- Masuk: order masuk, aksi accept/reject + alasan, pilihan batch, perubahan item.
- Keluar: status order (`pending`→`prepare`/`rejected`), batch berisi order, refund selisih, entri riwayat aktivitas, event `order_accepted`/`order_rejected`/`order_item_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| order baru (online, sudah dibayar) | kartu order dengan CTA accept + pilih batch / reject + alasan |
| order COD | kartu order tanpa status pembayaran online |
| reject tanpa alasan | tombol simpan nonaktif |
| ubah item melebihi subtotal awal | simpan ditolak + nilai pembanding ditampilkan |
| ubah item menurunkan subtotal | indikator refund selisih akan diproses saat accept |
| order sudah accept/reject | editor item tidak tersedia |

## 6. Kontrak BE (handoff, repo ini mock)

Snapshot subtotal awal sebelum promo disimpan di order; event `order_created`, `order_accepted`, `order_rejected`, `order_item_changed`; guard subtotal divalidasi server-side; refund selisih lewat alur refund; riwayat perubahan item sebagai bukti dispute.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Reject tanpa alasan ditolak | kosongkan alasan → simpan gagal | ⛔ |
| AC2 | Accept tanpa memilih batch ditolak | accept tanpa batch → error | ⛔ |
| AC3 | Batch penuh 24 order tidak bisa dipilih saat accept | isi batch 24 → opsi batch nonaktif | ⛔ |
| AC4 | Menambah item melebihi subtotal awal ditolak | tambah item sampai > subtotal awal → error | ⛔ |
| AC5 | Perubahan yang menurunkan subtotal menghasilkan nilai refund selisih | ubah 10 JOD → 6 JOD dengan promo 2 JOD → refund 2 JOD | ⛔ |
| AC6 | Promo tidak dihitung ulang setelah perubahan | ubah item → nilai promo tetap | ⛔ |
| AC7 | Editor item hilang setelah accept | accept → tombol ubah tidak ada | ⛔ |
| AC8 | Setiap perubahan muncul di riwayat aktivitas merchant dengan pelaku | ubah 1 item → entri riwayat memuat akun + field lama/baru | ⛔ |
| AC9 | COD tidak memicu refund selisih | ubah item pada COD → tagihan tunai turun, tanpa refund | ⛔ |

## 8. UNRESOLVED

- OPEN-85/OPEN-86 sudah diputuskan di §7.4 (pembagian diskon dan poin yang tidak kembali); rujukan final = §7.4.
- Wording alasan reject tidak dibatasi panjangnya di PRD.

## 9. Bukti

- Kode: `src/pages/MerchantOrders.tsx`, `src/pages/MerchantBatchDetail.tsx`, `src/types.ts:536,591` (`MerchantOrderStatus`), `src/store/slices/batchSlice.ts`.
- Belum ada: editor order item + guard subtotal, riwayat perubahan item, penghapusan Quick.
