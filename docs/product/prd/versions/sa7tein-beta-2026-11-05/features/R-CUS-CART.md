# R-CUS-CART — Cart per merchant, item tak dapat diproses & catatan

Status: partial (cart tunggal ada; model beta belum) · sumber §7.1, §13.6, §10 CUS-14..CUS-18, CUS-31, CUS-41.

## 1. Untuk apa

Cart adalah **order draft**, bukan keranjang terpisah: ia tampil di daftar order yang sama dengan order aktif dan riwayat. Customer memesan dari beberapa merchant sekaligus, dan item yang tidak bisa diproses tidak boleh hilang diam-diam atau memblokir seluruh order.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Satu cart per merchant; beberapa cart aktif bersamaan | CUS-14 |
| A2 | Cart hanya terlihat customer pemilik; merchant melihat order setelah dibuat (online: setelah dibayar) | §7.1 |
| A3 | Cart tampil sebagai card di daftar order bersama order aktif + riwayat | §7.1 |
| A4 | Daftar bisa group per merchant/status, sort status/nilai transaksi; default tidak group, sort status | §7.1 |
| A5 | Urutan status mendahulukan aksi customer: draft → waitingPayment → pending → ber-flag pendingRefund, lalu delivery → waitingDelivery → prepare → done → canceled → rejected → failed | §7.1 |
| A6 | Item tak dapat diproses **tidak dihapus**; dipisah per penyebab (stok, varian tak berlaku, di luar schedule, menu/opsi nonaktif dihapus, catatan per menu dimatikan) | §7.1, CUS-41 |
| A7 | Order tetap bisa dibuat dari item yang bisa diproses; item lain tetap di cart | §7.1, CUS-41 |
| A8 | Item kembali ke bagian bisa-diproses saat penyebab hilang, realtime; item bervarian usang tetap sampai dihapus customer | §7.1 |
| A9 | Rincian harga hanya menghitung item yang bisa diproses | §7.1 |
| A10 | Keluar dari layar detail cart tanpa order → **semua promo & poin terlepas** (termasuk menu hadiah) | §7.1, §14.3, §14.5 |
| A11 | Catatan **per order** selalu ada & terlihat merchant + kurir; catatan **per menu** hanya bila merchant menyalakan dan hanya terlihat merchant | CUS-31, §13.1 |
| A12 | Stok di-reserve di scope cart (lokal) saat menambah; reserve **global** saat order dibuat | §13.6 |
| A13 | Rincian menampilkan S, diskon, F, Pc, Ft (QRIS), total — semua JOD; kurs tidak ditampilkan | CUS-16 |

## 3. Aktor & permukaan

- Customer — daftar order/cart, detail cart, tambah menu, picker promo & poin.
- Merchant — melihat catatan per order dan per menu di order yang masuk.
- Karyawan kurir — melihat catatan per order saja.

## 4. Masukan → keluaran

- Masuk: varian + qty, catatan, promo, poin, alamat.
- Keluar: `carts{merchantId→cart}`, section able/unable, rincian harga, order draft card.

## 5. State UI

| State | Tampilan |
|---|---|
| cart kosong | tidak tampil di daftar order |
| ada item bisa diproses | ringkasan + CTA checkout |
| ada item tak bisa diproses | section terpisah per penyebab + aksi hapus/pilih ulang |
| stok habis tepat saat checkout | order tidak dibuat; item pindah ke section |
| catatan per menu dimatikan merchant | item dengan catatan pindah ke section |

## 6. Kontrak BE (handoff, repo ini mock)

State `carts{merchantId→cart}`; reservasi stok dua scope; event `cart_updated`, `catalog_changed`, `coverage_changed` (hitung ulang fee); `order_note`, `item_note`, flag `note_enabled` per menu.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Dua cart merchant berbeda aktif bersamaan | tambah menu 2 merchant → 2 card di daftar | ✅ `cartSlice.ts:59` (`carts: Record<merchantId, CartItem[]>`), `:222` `switchCart`; tampilan `Checkout.tsx:45-107` + `MyOrder.tsx:409-438` |
| AC2 | Item stok habis pindah ke section tanpa hilang | set stok 0 → item di section "tidak dapat diproses", qty tetap | ⛔ |
| AC3 | Order tetap bisa dibuat dari item yang bisa diproses | checkout dengan 1 item able + 1 unable → order berisi 1 item | ⛔ |
| AC4 | Keluar detail cart tanpa order melepas promo & poin | pilih promo → back → buka lagi → tidak terpilih | ⛔ |
| AC5 | Catatan per menu tidak tampil di sisi kurir | buka detail batch kurir → hanya catatan order | ⛔ |
| AC6 | Sort default mendahulukan draft/waitingPayment/pending/pendingRefund | urutan kartu di daftar | ⛔ |

## 8. UNRESOLVED

- Wording section "tidak dapat diproses" ditentukan desain UI (§7.1) — label final belum ada.
- Reservasi stok global gagal bersamaan = perilaku BE.

## 9. Bukti

- Kode: `src/store/slices/cartSlice.ts:17,30,132`, `src/pages/Checkout.tsx`, `MyOrder.tsx`, `src/components/CartQuickBar` (pemicu sheet).
