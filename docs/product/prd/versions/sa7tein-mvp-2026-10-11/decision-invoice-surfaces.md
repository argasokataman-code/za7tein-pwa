# Decision: invoice order & rincian pendapatan (permukaan UI)

Status: **UNRESOLVED** — permukaan dibangun di atas data yang ada; kontrak BE belum mendukung.
Tanggal: 2026-10-25. Revisi PRD: `sa7tein-mvp-2026-10-11`.

## Konteks

PRD aktif tidak punya requirement invoice/struk/bukti transaksi. Yang diatur hanya
**struktur biaya** (`analysis.md` C-05, §16.2–16.4): subtotal, diskon, ongkir,
`Pc`, `Ft` QRIS, dan pembagian settlement tiga kolom.

Kondisi kode sebelum perubahan ini:

- Rincian biaya hanya tampil **sebelum** bayar, dan JSX-nya disalin dua kali
  (`Checkout.tsx`, `PaymentAmount.tsx`). Setelah bayar, pecahan biaya hilang —
  `PaymentDana`, `OrderPlaced`, `OrderStageScreen`, dan `MyOrder` hanya menampilkan total.
- `settlementFor()` (`src/data/marketplace.ts:313`) menghitung pembagian
  merchant/kurir/aplikator, tetapi **tidak pernah dirender** di layar transaksi.
- Tidak ada struk, cetak, atau unduh bukti transaksi.

## Keputusan

1. Permintaan pemilik (2026-10-25): sediakan invoice untuk **kedua sisi** —
   tagihan customer setelah bayar, dan rincian pendapatan bersih merchant —
   sekaligus tombol cetak.
2. **Satu komponen** `OrderPriceBreakdown` dipakai dua sisi. Barisnya berasal dari
   `src/data/invoice.ts`, bukan dirakit di JSX tiap layar.
3. Invoice customer memutar **snapshot checkout** (`cart.lastReceipt`): rincian
   yang benar-benar ditagih disimpan sekali saat order dibuat, karena tabel
   `orders` BE hanya menyimpan total. Invoice tidak pernah dihitung ulang dari
   total, dan order tanpa snapshot tidak menampilkan invoice.
4. Invoice merchant memakai **subtotal item − `Pm`**. Ongkir dan `Pc` bukan
   pendapatan toko (§16.4), jadi keduanya tidak dimasukkan. Order `batal`
   menampilkan "Tidak ada pendapatan".
5. Aksi bagikan memakai `navigator.share` (share sheet bawaan) dengan clipboard
   sebagai cadangan. **Cetak tidak dipakai**: ini PWA ponsel, dan dialog printer
   bukan cara orang mengirim bukti transaksi. Tidak ada dependency PDF baru.
6. Pemilihan cakupan (customer + merchant + cetak sekaligus) adalah keputusan
   pemilik, dicatat di sini karena tidak ada requirement PRD yang menaunginya.

## Konsekuensi & pekerjaan BE

- `orders` perlu kolom pecahan biaya (`subtotal`, `delivery_fee`,
  `platform_fee`, `discount`, `transaction_fee`) supaya invoice berlaku untuk
  seluruh riwayat, bukan hanya order yang dibuat di sesi browser ini.
- Potongan `Pm` per order (termasuk kuota order/COD yang menihilkan `Pm`) belum
  tersimpan; invoice merchant sekarang memakai tarif platform yang berlaku dan
  menyebutnya di catatan.
- Riwayat pesanan lama dan ledger wallet tetap agregat; tidak ada invoice per
  baris di sana sampai data di atas tersedia.
- Sampai itu ada, permukaan ini berstatus **UNRESOLVED** dan tidak boleh
  diklaim sebagai bukti transaksi final.

## Bukti

- `src/data/invoice.ts` (`customerInvoiceRows`, `merchantInvoice`,
  `invoiceShareText`), `src/components/ui/OrderPriceBreakdown.tsx`,
  `src/components/customer/OrderInvoice.tsx`,
  `src/components/merchant/MerchantEarnings.tsx`.
- Self-check: `scripts/invoice-check.mjs` (ikut `npm run check:self`).
- Dokumentasi: `src/pages/documentation/sections/InvoiceSection.tsx` (nav 40).
