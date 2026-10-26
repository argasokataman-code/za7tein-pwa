# Matriks kepatuhan UI terhadap PRD aktif

Revisi: `sa7tein-mvp-2026-10-11`. Sumber aturan: `source.pdf` (§ dirujuk per baris).
Repo ini FE + mock; status "sesuai" berarti **state/layar** mengikuti aturan, bukan
alur uang nyata.

Status: `sesuai` · `partial` · `absent` · `deviasi tercatat` (sengaja beda, ada
keputusan) · `bukan PRD` (permintaan pemilik di luar dokumen).

| Area | PRD | Status | Bukti / catatan |
|---|---|---|---|
| COD = tunai, tanpa hold | §16.5, C-09 | sesuai | `PaymentAmount` tidak membuat hold; kartu COD tunai |
| Uang tunai + kembalian (customer/kurir) | turunan §16.5 | sesuai (bukan requirement eksplisit) | `data/codCash.ts`, `CodCashSection`, `CourierTaskDetail` |
| COD hanya dengan kuota COD | §17, MER-19 | partial | Gate di `PaymentSelection` + `PaymentAmount`; data `unknown` masih diloloskan (mock tanpa BE) |
| COD: `Pc` 100% merchant | §17 tabel | sesuai | `merchantInvoice` menambah baris Pc untuk COD |
| COD: `Pm` tidak dipotong | §16.5 | sesuai | `merchantInvoice` COD tanpa fee |
| Online berkuota: `Pm` tidak dipotong | §17 tabel | partial | Rumus siap (`quotaKind`), tetapi order BE belum menyimpan kolom kuota → invoice online masih tarif default |
| Reserve/konsumsi/kembali kuota | §17 | sesuai | `useOrderQuota`, `quotaSlice` |
| Pembayaran online: timer 30 mnt + simpan QR | R-CUS-PAY, CUS-32 | sesuai (UI) | `PaymentDana` timer 30 mnt + `saveQr` PNG; hold akun enterprise tetap BE |
| State `menunggu_pembayaran` + event `payment_expired` | R-CUS-PAY, §7.5 | partial | Kedaluwarsa kini membatalkan order + melepas kuota + notifikasi; `payment_status` belum dibaca di order customer |
| Refund penuh + pending refund BI-FAST | §16.6 | partial | `CustomerRefund` + `api/refunds`; cabang metode selesai (DANA / bank / pilih) dengan flag mock `danaBound`; tautan dari order dibatalkan sudah ada. Binding DANA asli tetap BE |
| Cakupan antar per merchant | §9.1 | sesuai (mock) | Gate + ongkir memakai `coverage` merchant (`useDeliveryQuote`, fee per polygon / per satuan); jarak masih garis lurus, bukan rute WALK |
| Penerima delivery fee = kurir | §9.2 | partial | Invoice merchant tidak memuat ongkir; dompet kurir mock memakai `deliveryFeeIdr`. Aturan COD (kurir bayar merchant saat pickup) belum disimulasikan |
| Quick COD (talangan kurir) | §16.5 | absent | Belum ada |
| Kurir partner + assignment approve/reject | §12 | absent | Hanya kurir inhouse |
| Batch & auto-sort | §8 | partial | Ada batch kurir; aturan lengkap belum |
| Ops = PWA + Cloudflare Access | §13 | deviasi tercatat | Implementasi desktop penuh, tanpa auth (`decision-ops-canonical.md`) |
| Gate top-up 3,5 JOD semua metode | bukan PRD aktif | deviasi | Warisan `R-TOPUP-01`; masih aktif |
| Label "Pelanggan Setia" | bukan PRD | bukan PRD | Permintaan pemilik; `decision-cod-cash-loyalty.md` |
| Beli paket kuota (QRIS + Ft / saldo DANA) | §17, MER-18 | partial | Paket + flag API ada; alur bayar belum |
| Sembunyikan toko saat kuota habis + setting | §17 | sesuai | `merchantQuotaBlocked`, setting di merchant |

## Urutan pengerjaan FE

1. **Invoice lengkap** — `Pc` COD, `Pm` online berkuota (butuh `quotaKind` di order/mock). *(sebagian selesai)*
2. **Pembayaran online** — timer 30 menit, simpan QR, state `menunggu_pembayaran`. *(timer, QR, dan batal-otomatis saat kedaluwarsa selesai; `payment_status` di order customer belum)*
3. **Refund** — status refund, form rekening, pending refund. *(layar + cabang metode + tautan dari order batal selesai; binding DANA masih mock)*
4. **Cakupan & fee** — coverage per merchant + ongkir; gate checkout selesai, aturan penerima fee COD (§9.2) belum. *(sebagian selesai)*
5. **Quick COD** — alur talangan kurir partner (setelah 1–4 stabil).
6. **Keputusan PO** — ops PWA/auth, gate top-up legacy: butuh keputusan, bukan tebakan FE.
