# Decision: bukti transfer di konsol merchant (legacy)

Status: **UNRESOLVED** — permukaan UI dibangun untuk order legacy, arah produk belum berubah.
Tanggal: 2026-10-25. Revisi PRD: `sa7tein-mvp-2026-10-11`.

## Konteks

Konsol merchant punya gerbang konfirmasi order (`paymentGate`) yang memperlakukan
`transfer` sebagai `verify`: tombol berubah menjadi "Verifikasi & Terima" dan klik
menulis `orders.payment_status = 'paid'` (`src/api/orders.ts` → `markOrderPaid`).
Masalahnya, merchant **tidak pernah bisa melihat bukti** yang ia verifikasi:
`transferProof` hanya hidup di `cartSlice` sisi customer, `OrderRow` tidak punya
kolom bukti, dan `MerchantOrder` tidak punya field untuk itu.

Pada saat yang sama, PRD aktif `R-CUS-PAY` (`analysis.md:24`) menetapkan metode
bayar QRIS / saldo DANA / COD, dengan catatan kode: "perlu `qris`, buang/batasi
`transfer`". `src/data/merchant.ts:152-156` juga sudah menyebut `transfer` sebagai
metode legacy yang tidak lagi ditawarkan.

## Keputusan

1. Permintaan pemilik (2026-10-25): bangun **UI bukti transfer** untuk order legacy.
   Permukaan dibuat, tetapi **tidak** menghidupkan kembali `transfer` sebagai metode
   baru: katalog metode bayar tidak diubah, dan checkout tidak menawarkan transfer.
2. `MerchantOrder.paymentProof` dibaca dari kolom masa depan `orders.payment_proof_url`
   (`src/api/orders.ts`). Selama kolom itu belum ada, merchant melihat keadaan
   "belum ada bukti" secara eksplisit, dan label tombol menjadi "Terima tanpa bukti".
3. Jam operasional per hari ditambahkan di Setelan. Server baru punya satu pasang
   kolom (`open_time`/`close_time`), jadi jadwal 7 hari hidup di state sesi dan
   hanya jam hari berjalan yang ditulis ke BE lewat `setStoreHours`.

## Konsekuensi & pekerjaan BE

- `orders.payment_proof_url` (atau tabel `order_proofs`) belum ada. Tanpa itu
  bukti tidak pernah sampai ke merchant, dan klaim "sudah diverifikasi" tetap
  tidak bisa dibuktikan.
- `merchants` butuh jadwal 7 hari (mis. tabel `merchant_hours`) supaya jadwal
  per hari bertahan setelah reload dan terbaca sisi customer.
- Sampai keduanya ada, kedua permukaan ini berstatus **UNRESOLVED** dan harus
  disebut begitu di dokumentasi, bukan diklaim selesai.

## Bukti

- `src/data/operatingHours.ts`, `src/store/slices/merchantSlice.ts`
  (`setOperatingHours`, `hoursEdited`), `src/pages/MerchantSettings.tsx` (panel
  "Atur jam"), `scripts/hours-check.mjs`.
- `src/components/merchant/OrderPaymentProof.tsx`,
  `src/components/ui/EvidencePhotos.tsx`, `src/pages/MerchantOrders.tsx`,
  `src/api/orders.ts` (`paymentProof`).
- Dokumentasi: `src/pages/documentation/sections/MerchantFlowDetailSection.tsx`.
