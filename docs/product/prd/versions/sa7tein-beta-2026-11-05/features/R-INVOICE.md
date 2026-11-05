# R-INVOICE — Invoice order (preview & PDF A4)

Status: partial (ringkasan invoice ada; PDF & ACL belum) · sumber §15.8, CUS-38, MER-32, OPS-21.

## 1. Untuk apa

Invoice adalah bukti transaksi yang bisa dipakai customer, merchant, dan ops. Ia terbentuk saat order dibuat dan **tidak berubah** mengikuti perubahan menu/promo setelahnya, kecuali perubahan order item oleh merchant.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Satu invoice per order, terbentuk saat order dibuat; nomor invoice unik | §15.8 |
| A2 | Preview tersedia **semua status** sebagai screen PWA (bukan PDF di dalam app) | §15.8, CUS-38 |
| A3 | Download PDF **hanya** saat status akhir: done/canceled/rejected/failed | §15.8 |
| A4 | Cart tidak punya invoice | §15.8, CUS-38 |
| A5 | PDF A4, template sendiri; data sama dengan preview | §15.8, OPEN-74 |
| A6 | Harga, diskon, nominal IDR, nama+logo merchant memakai data **saat order dibuat** | §15.8 |
| A7 | Pengecualian: perubahan order item selama pending + refund selisih | §15.8, §7.4 |
| A8 | Status order & pembayaran mengikuti kondisi **terkini** saat preview/download | §15.8 |
| A9 | Isi: identitas (nomor invoice/order, tanggal-jam Yordania), merchant, customer+alamat, item (menu/combo, opsi, qty, harga, penanda hadiah), rincian harga JOD, metode bayar + total IDR, status | §15.8 |
| A10 | Akses: customer pemilik, merchant, ops. **Kurir tidak boleh** | §15.8, OPEN-73 |

## 3. Aktor & permukaan

- Customer — detail order → preview + download.
- Merchant — detail order → preview + download.
- Ops — aplikasi internal.
- Karyawan kurir — tidak ada akses.

## 4. Masukan → keluaran

- Masuk: order + order item + snapshot harga.
- Keluar: screen preview, PDF A4, status terkini di dalam dokumen.

## 5. State UI

| State | Tampilan |
|---|---|
| status belum final | preview saja, tombol download nonaktif + alasan |
| status final | preview + tombol download |
| pendingRefund | status refund tercantum di preview/PDF |
| item diubah merchant | item terbaru + baris refund selisih |

## 6. Kontrak BE (handoff, repo ini mock)

Nomor invoice; snapshot teks/harga/logo; PDF dibuat saat request; ACL per peran; status pembayaran & refund dibaca terkini.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Preview bisa dibuka di semua status | buka order waitingPayment..done | 🟡 `OrderInvoice.tsx:15` |
| AC2 | Download nonaktif sebelum status final | inspeksi tombol | ⛔ |
| AC3 | PDF berukuran A4 dan memuat 6 bagian | cek ukuran + isi | ⛔ |
| AC4 | Harga di invoice tidak berubah setelah menu dinaikkan | ubah harga menu → invoice lama tetap | 🟡 |
| AC5 | Kurir tidak punya akses invoice | buka sebagai kurir → 404/tidak ada | ⛔ |
| AC6 | Invoice order batal menampilkan status batal, bukan lunas | buka invoice canceled | 🟡 |

## 8. UNRESOLVED

- Kewajiban JoFotara belum diputuskan (OPEN-27); apakah invoice sa7tein diterima sebagai dokumen pajak belum ada keputusan.

## 9. Bukti

- Kode: `src/components/customer/OrderInvoice.tsx:15`, `src/data/invoice.ts`, `src/types.ts:69,81`.
- Flow: `f8-dispute` (bukti order), `f13-courier-view` (kurir tanpa invoice).
