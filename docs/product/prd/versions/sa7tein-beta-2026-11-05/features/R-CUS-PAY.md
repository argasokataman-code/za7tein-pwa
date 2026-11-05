# R-CUS-PAY — QRIS, COD & layar pembayaran

Status: partial (layar pembayaran ada; metode beta belum) · sumber §7.1, §15.2, §10 CUS-19/20/32, §16.

## 1. Untuk apa

Customer Indonesia membayar dengan rupiah dari rekening/e-wallet Indonesia, sementara merchant menetapkan harga dalam JOD. Pembayaran terjadi **sebelum merchant accept**, dan dana ditahan aplikator sampai order selesai/batal.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Metode: **QRIS** atau **COD**; tidak ada saldo/e-wallet aplikasi | CUS-19, §15.1 |
| A2 | COD hanya tersedia bila merchant punya kuota order tersedia | CUS-19, §16 |
| A3 | Pembayaran online terjadi **saat order dibuat**; order diteruskan ke merchant setelah pembayaran berhasil | CUS-20, §7.1 |
| A4 | Batas waktu pembayaran = config ops; QR memakai masa berlaku yang sama dan tersinkron realtime | §15.2, §12.2 |
| A5 | Tombol "simpan QR" menyimpan PNG berisi nominal IDR | CUS-32 |
| A6 | Layar pembayaran menampilkan **total IDR** dibulatkan ke atas ratusan; kurs tidak ditampilkan; rincian tetap JOD | CUS-16, §15.2 |
| A7 | Lewat batas waktu → order `failed`, kuota ter-reserve dilepas | §7.5, §15.2, §16 |
| A8 | Bila customer punya kuota, kuota dipakai lebih dulu untuk metode apa pun (Pc = 0) | §16 |
| A9 | Order tidak dibuat bila reserve stok global gagal | §13.6 |

## 3. Aktor & permukaan

- Customer — pilih metode, layar QR/timer, simpan QR, status.
- Merchant — menerima order hanya setelah pembayaran berhasil.
- Ops — mengatur batas waktu & masa QR, transaction fee.

## 4. Masukan → keluaran

- Masuk: cart, metode bayar, kuota tersedia.
- Keluar: order `waitingPayment` → `pending` (online) atau langsung `pending` (COD); QR image + expiry; event `order_created`, `payment_confirmed`, `payment_expired`.

## 5. State UI

| State | Tampilan |
|---|---|
| COD tak tersedia | opsi COD nonaktif + alasan kuota merchant |
| menunggu bayar | QR + hitung waktu + simpan QR |
| QR kedaluwarsa | status gagal + CTA ulangi (order baru) |
| pembayaran berhasil | pindah ke status menunggu merchant |
| kuota dipakai | baris Pc = 0 + keterangan kuota terpakai |

## 6. Kontrak BE (handoff, repo ini mock)

Dynamic QRIS + API cancel/cek status; webhook pembayaran; nominal IDR dikunci saat order dibuat; kuota reserve→release. Transaksi IDR, harga JOD.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Hanya dua metode tampil (QRIS, COD) | daftar metode | 🟡 `types.ts:341` masih memuat `wallet/transfer/dana_va/dana_qris` |
| AC2 | COD nonaktif saat kuota merchant 0 | set kuota 0 → opsi COD disabled + alasan | ⛔ |
| AC3 | Timer QR sesuai config dan berhenti di 0 → status failed | ubah config → durasi berubah | ⛔ |
| AC4 | Tombol simpan QR menghasilkan file PNG | klik → file terunduh | ⛔ |
| AC5 | Total di layar = pembulatan ke atas ke ratusan; kurs tidak muncul | banding total JOD×kurs vs tampil | 🟡 `PaymentAmount.tsx` |
| AC6 | Pc = 0 saat customer punya kuota | rincian harga | ⛔ |

## 8. UNRESOLVED

- Payment gateway belum dipilih (OPEN-01): kapabilitas QR/cancel/webhook belum bisa dibuktikan.
- Nilai awal batas waktu pembayaran tidak dicantumkan (OPEN-20/12.2).

## 9. Bukti

- Kode: `src/pages/PaymentSelection.tsx`, `PaymentAmount.tsx`, `PaymentDana.tsx`, `Checkout.tsx`, `src/types.ts:341,1577`.
