# R-CUS-REFUND — pendingRefund & refund selisih

Status: partial (refund bank ada; flag order belum) · sumber §7.3, §7.4, §15.6, §10 CUS-25.

## 1. Untuk apa

Uang customer ditahan aplikator sampai order selesai. Saat order batal/ditolak, atau saat merchant mengubah isi order sehingga nilainya turun, customer harus menerima kembali nominal yang benar — lewat transfer bank, karena tidak ada e-wallet.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Refund order online = **penuh**: seluruh nominal IDR yang dibayar termasuk Ft dan pembulatan | §15.6 |
| A2 | Refund selalu lewat **transfer bank**: customer isi bank + nomor rekening di detail order | CUS-25, §15.6 |
| A3 | `pendingRefund` adalah **flag**, bukan status; dipasang pada canceled/rejected yang sudah dibayar, dan pada order yang punya refund selisih | §7.5 |
| A4 | Order `failed` **tidak** ber-flag pendingRefund | §7.5 |
| A5 | Refund selisih ditetapkan **saat merchant accept** (setelah itu item tak bisa diubah) | §7.4 |
| A6 | Transfer gagal → status tampil di detail order; kirim ulang otomatis atau setelah rekening diperbaiki | §15.6 |
| A7 | Refund baru dikirim setelah dana order dicairkan gateway; aplikator tidak menalangi | §15.6 |
| A8 | COD batal/tolak tanpa refund | §7.3 |
| A9 | Setelah payout tidak ada penarikan/refund; kompensasi non-uang | §15.6, §17, OPEN-08 |
| A10 | Biaya transfer refund ditanggung aplikator | §15.6 |
| A11 | Refund selisih tidak mengembalikan poin yang sudah dipakai | §7.4, OPEN-86 |

## 3. Aktor & permukaan

- Customer — detail order: saldo pending refund, input rekening, status.
- Merchant — tidak mengisi rekening customer.
- Ops — memantau pending refund & kegagalan transfer.

## 4. Masukan → keluaran

- Masuk: nominal refund, rekening customer.
- Keluar: `pendingRefund` flag, status transfer, event `refund_status_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| butuh rekening | CTA isi bank + nomor rekening |
| menunggu pencairan | "menunggu dana dicairkan" |
| transfer diproses | status proses |
| gagal | alasan + CTA perbaiki rekening / kirim ulang |
| selesai | nominal + waktu + rekening tersamar |

## 6. Kontrak BE (handoff, repo ini mock)

Flag pada order + entity refund (nominal, metode, bank, rekening, status, alasan gagal). Disbursement gateway; biaya ditanggung aplikator; daftar penyebab gagal mengikuti gateway (OPEN-01).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Badge kedua "pending refund" muncul bersama badge status | inspeksi card order | ⛔ `types.ts:1449` masih enum `RefundStatus` |
| AC2 | Order failed tidak ber-flag pendingRefund | set status failed → tidak ada badge | ⛔ |
| AC3 | Input bank + rekening wajib sebelum tombol proses aktif | submit kosong → nonaktif/error | 🟡 `CustomerRefund.tsx` |
| AC4 | Refund penuh = total IDR termasuk Ft + pembulatan | banding nominal vs rincian | ⛔ |
| AC5 | Refund selisih = subtotal awal setelah promo − subtotal akhir | hitung contoh §7.4 (10→6 JOD, promo 2) → refund 2 | ⛔ |
| AC6 | COD batal tidak menampilkan form refund | buka detail order COD batal | ⛔ |

## 8. UNRESOLVED

- Perilaku bila refund selisih melebihi nominal yang dibayar dengan uang (OPEN-86) — keputusan "refund tanpa poin" menghasilkan angka yang perlu dikonfirmasi produk.

## 9. Bukti

- Kode: `src/types.ts:1449`, `src/pages/CustomerRefund.tsx`, `src/pages/ops/OpsDisputes.tsx`, `src/store/slices/opsSlice.ts`.
