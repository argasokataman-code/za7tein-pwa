# Decision: COD tunai (uang disiapkan & kembalian) + label Pelanggan Setia

Status: **UNRESOLVED** — permukaan UI dibangun, kontrak BE dan ambang produk belum ditetapkan PRD.
Tanggal: 2026-10-25. Revisi PRD: `sa7tein-mvp-2026-10-11`.

## Konteks

PRD aktif menetapkan COD sebagai **tunai offline JOD** (`analysis.md` C-09, R-MONEY;
`decision-sa7tein-mvp.md:19`), menggantikan COD via wallet hold. Kode masih
menampilkan hold di tiga layar customer, dan tidak ada satu pun tempat yang
menyebut uang tunai yang disiapkan atau kembalian. Kurir melihat tagihan
(`CourierTaskDetail`) tanpa input uang diterima, jadi serah terima tunai tidak
tercatat. Merchant hanya melihat kata "COD".

Label loyalitas customer juga tidak ada: registri customer punya `joinedAt`
tetapi tidak ada jumlah order seumur akun, dan PRD tidak menyebut loyalitas
(program `loyalty` di PRD adalah program marketing merchant, bukan badge).

## Keputusan

1. Permintaan pemilik (2026-10-25): customer harus melihat **jumlah pembayaran
   dan sisa kembalian / info siapkan uang pas** pada COD, dan label
   **"Pelanggan Setia"** harus ada di sisi customer dan merchant.
2. COD dibayar tunai. Checkout COD **tidak lagi membuat hold** saldo; gate saldo
   untuk COD dihapus. Slice hold tetap ada untuk sesi tersimpan (legacy) dan
   dokumentasi hold ditandai sebagai perilaku lama.
3. Customer memilih nominal tunai yang disiapkan (uang pas / dibulatkan ke 1 JOD
   / 5 JOD) di ringkasan bayar. Pilihannya disimpan di `cart.codCashIdr` dan
   ikut snapshot invoice, sehingga layar pesanan dan invoice memakai angka yang
   sama.
4. Kurir memasukkan uang yang benar-benar diterima (chip atau input JOD).
   Kembalian dihitung `max(0, diterima − tagihan)`; tombol OTP/serah terima
   ditolak kalau uang kurang. Merchant melihat "COD tunai · ditagih kurir".
5. Label loyalitas memakai `Customer.lifetimeOrders` dengan ambang
   `LOYAL_ORDER_MIN = 5`. Satu komponen `LoyalBadge` dipakai di profil customer
   dan detail order merchant.
6. Pembulatan kembalian memakai JOD 2 desimal (mata uang tunai di tempat);
   nominal internal tetap IDR. Tidak ada dependency baru.
7. Opsi COD ditutup bila kuota COD merchant habis (§17, MER-19), termasuk saat
   layar bayar dibuka langsung tanpa lewat pemilihan metode.
8. Invoice merchant order COD tidak memotong `Pm` (§16.5); net = subtotal item.
9. Permintaan pemilik (2026-10-29): merchant dan kurir melihat **rincian uang
   tunai** yang dibayar customer di detail order/tugas COD, bukan hanya satu
   nominal. Rincian = subtotal menu, ongkir/layanan/tips (sisa
   `total − subtotal`, tidak dipecah karena order tidak menyimpan kolomnya),
   tagihan tunai, lalu kembalian untuk tiap nominal `codCashOptions`. Merchant
   melihatnya di detail order masuk sebelum menerima; kurir melihatnya sejak
   tugas masuk, sedangkan input uang diterima tetap hanya di checkpoint `tiba`.
   Satu komponen `CodCashDue` dipakai kedua sisi.

## Konsekuensi & pekerjaan BE

- `orders` perlu `cod_amount_jod`, `cash_received_jod`, dan `change_jod` (atau
  satu tabel pembayaran tunai) supaya bukti serah terima tunai tersimpan dan
  bisa direkonsiliasi ops. Sekarang semuanya hanya state sesi.
- `customers` perlu agregat `lifetime_orders` (atau query agregat) supaya label
  tidak bergantung pada mock. Ambang 5 adalah keputusan produk, bukan angka PRD.
- Rekonsiliasi setoran tunai di panel ops **tidak dibangun**: metode bayar hanya
  menentukan cara membayar nominal order. Biaya layanan/ongkir tetap dihitung
  checkout, dan gate top-up akun (R-TOPUP-01) tetap berlaku untuk semua metode —
  COD tidak menghapus kewajiban top-up minimum. Rekonsiliasi butuh tabel setoran
  kurir yang belum ada, dan bukan permukaan yang diminta.
- COD Quick (kurir menalangi merchant, P7/AC10) memakai alur uang berbeda dan
  belum diimplementasikan; UI ini untuk COD Regular.

## Bukti

- `src/data/codCash.ts` (`codCashOptions`, `codChangeIdr`, `codCashHint`).
- `src/components/customer/CodCashSection.tsx`,
  `src/components/ui/CodCashDue.tsx` (rincian tagihan + kembalian merchant/kurir),
  `src/components/ui/LoyalBadge.tsx`.
- `src/pages/PaymentAmount.tsx`, `src/pages/CourierTaskDetail.tsx`,
  `src/pages/MerchantOrders.tsx`, `src/pages/Profile.tsx`.
- Self-check: `scripts/cod-cash-check.mjs` (ikut `npm run check:self`).
- Dokumentasi: `src/pages/documentation/sections/CodLoyaltySection.tsx` (nav 41).
