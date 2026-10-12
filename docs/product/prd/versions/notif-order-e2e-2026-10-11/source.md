# BRS — Notifikasi Order End-to-End & Jalur Masalah CS

| Field | Isi |
|---|---|
| Jenis | BRS (Business Requirement Specification) — pelengkap PRD aktif |
| Status | `proposed` (menunggu keputusan aktivasi tertulis di `manifest.json`) |
| Tanggal | 2026-10-11 |
| Keputusan PO | 2026-10-11: **journey order wajib end-to-end** — tiap langkah memberi tahu ketiga pihak (customer, merchant, kurir); **CS menangani masalah**, **Super Admin mengawasi/eskalasi**. |
| Berlaku untuk | `sa7tein-pwa` (Irbid MVP), repo front-end saja (AGENTS.md §1) |
| Dasar | PRD aktif `irbid-mvp-v2-2026-09-21` · `R-PUSH-01` (`f11`), `R-DELIV-01` (`f5`/`f13`), `R-DISPUTE-01` (`f8`), `C-12` (dispute/CS) · state kanonik `f18-order-state` · SLA keputusan PO sementara OQ-13 (`src/data/courier.ts`) · `docs/design/flows/BUSINESS.md` §2b · schema draft hanya untuk nama tabel/field |

## 1. Masalah bisnis

Journey order sekarang tidak end-to-end: sebuah order berubah status tanpa memberi tahu pihak yang berkepentingan, sehingga customer menanyakan status lewat WA pribadi, merchant tidak tahu kurirnya sudah bergerak, dan kurir tidak tahu ada tugas baru. Lebih parah, **tidak ada satu pun notifikasi yang sampai ke CS** — padahal CS adalah tempat masalah order (sengketa, batal sesudah kurir jalan, SLA lewat) seharusnya bermuara. Bell CS di `/admin` tak pernah menerima event order hari ini. Akibatnya CS hanya tahu masalah kalau ada yang menelepon, dan keputusan approve/reject/cancel tidak punya aturan notifikasi maupun aturan dana yang jelas.

BRS ini menutup tiga hal: (1) matriks notifikasi per langkah untuk ketiga pihak, (2) aturan notifikasi + dana untuk tiap cabang approve/reject/cancel, (3) pemicu yang mengantarkan masalah ke CS dan eskalasi ke Super Admin.

## 2. Aktor & kepentingan

| Aktor | Kepentingan |
|---|---|
| Customer | Tahu perjalanan pesanannya (dibayar → diproses → kurir jalan → tiba → selesai); menerima OTP untuk settle |
| Merchant | Tahu order baru masuk, tahu kurir berangkat/tiba, tahu order selesai & dana cair |
| Kurir | Tahu ada tugas baru (saat match), tahu order dibatalkan; kurir = karyawan merchant (`C-06`), bukan mitra platform |
| CS (`/admin`) | **Hanya saat masalah**: sengketa, batal sesudah match, SLA lewat, eskalasi. Portal CS merangkap Super Admin hari ini (`C-12`, `f15`) |
| Super Admin | **Hanya eskalasi**: dispute tak selesai, protection fund, appeal |

## 3. Aturan bisnis

**BR-1 — Notifikasi tiap langkah ke ketiga pihak.** Setiap transisi order (`f18-order-state`) memicu notifikasi ke pihak yang berkepentingan sesuai matriks berikut. Kurir masuk mulai langkah 4 (`courier_matched`).

| # | State/event (f18) | Customer | Merchant | Kurir | CS | SA |
|---|---|---|---|---|---|---|
| 1 | `checkout_submitted` → `quotation` | — | — | — | — | — |
| 2 | `payment_confirmed` → `prepare` | "Pembayaran diterima" | "Pesanan baru masuk" | — | — | — |
| 3 | `merchant_ready` → `waitingCourier` | "Pesanan siap, menunggu kurir" | — | — | — | — |
| 4 | `courier_matched` → `waitingDelivery` | "Kurir ditugaskan" | — | "Tugas baru: order #" | — | — |
| 5 | `courier_picked_up` → `delivery` | "Kurir dalam perjalanan" | "Kurir berangkat" | — | — | — |
| 6 | Tiba di lokasi (menuju OTP) | "Kurir sudah tiba, siapkan OTP" | "Kurir tiba" | — | — | — |
| 7 | `otp_verified` → `done` | "Pesanan selesai" | "Selesai — dana cair" | "Pengantaran selesai" | — | — |
| 8 | `cancel_order` (sebelum match) | "Dibatalkan" | "Dibatalkan — hold release" | — | — | — |
| 9 | `order_canceled` / `merchant_rejected` (sesudah match) | "Dibatalkan setelah match" | "Dibatalkan" | "Tugas dibatalkan" | **"Reversal + potensi fee"** | — |
| 10 | `dispute_filed` → `disputed` | "Sengketa dibuka" | "Sengketa dibuka" | info | **"Sengketa baru"** | — |
| 11 | SLA lewat (lihat BR-8) | — | peringatan | peringatan | **"Alert SLA"** | — |
| 12 | SLA lewat tak ditangani / dispute macet / protection fund | — | — | — | — | **eskalasi** |

**BR-2 — Kanal.** Notifikasi masuk ke inbox in-app (bell) dan di-*push* ke perangkat (`R-PUSH-01`). Event kritis (langkah 6 & 11) wajib punya fallback `wa.me`/SMS karena push di iOS bisa bisu (force-quit, ITP 7 hari). Audience `cs` sudah valid di kode (`src/api/notifications.ts`), tetapi **belum ada pemanggil** yang mengirim ke `cs`.

**BR-3 — Kurir masuk saat match.** Kurir tidak menerima notifikasi sebelum `courier_matched` (sebelum itu belum ada tugas). "Kurir bersedia" adalah toggle online di konsol merchant dan **tidak** menghasilkan event order hari ini; bila journey harus memberi tahu, toggle itu perlu event sendiri (`courier_available`) — keputusan belum diambil (UNRESOLVED).

**BR-4 — CS hanya saat masalah.** CS menerima notifikasi **hanya** untuk: sengketa (`dispute_filed`), batal sesudah match (langkah 9), dan SLA lewat (langkah 11). Bukan untuk happy path.

**BR-5 — Super Admin hanya eskalasi.** SA menerima hanya kalau masalah tak ditangani CS: dispute macet (> SLA penanganan), pemakaian protection fund, atau appeal. Batas ini menjaga pemisahan peran (`C-12`, `DEC-2003`).

**BR-6 — Cabang approve/reject/cancel.** Aturan + notifikasi + dana:

| Cabang | Siapa | Sebelum/sesudah match | Dampak dana | Notif |
|---|---|---|---|---|
| Terima order (`payment_confirmed`) | merchant | sebelum | prepaid: saldo sudah dipotong · COD: hold | BR-1 #2 |
| Tolak order (`merchant_rejected`) | merchant | sebelum match | prepaid → refund internal penuh · COD: hold release | BR-1 #8 |
| Batal oleh customer | customer | window cancel belum final (UNRESOLVED) | sama seperti tolak | BR-1 #8 |
| Batal sesudah match (`order_canceled`) | customer/merchant | sesudah | reversal **append-only** (`f2`), bukan edit | BR-1 #9 + CS |
| Sengketa (`dispute_filed`) | customer/merchant | sesudah settle | hold dibekukan, auto-settle pause (`f8`) | BR-1 #10 + CS |

"Approve" = `merchant_ready`, bukan aksi terpisah. Reject/batal **selalu** menulis satu ledger entry baru (`f7`), tidak pernah mengubah entry lama. **Fee pada cancel sesudah match = UNRESOLVED.**

**BR-7 — Sengketa berjalan lewat jalur yang sudah ada.** Dispute memakai `f8` (4 resolusi, window 24 jam, protection fund 2%). BRS ini hanya menambah **notifikasi** ke peserta + CS saat `dispute_filed`; tidak mengubah aturan resolusi.

**BR-8 — SLA lewat menghasilkan alert nyata.** SLA = keputusan PO sementara OQ-13, sudah ada di kode: `ambil 15m · berangkat 30m · tiba 10m` (dihitung dari `placedAt`), `AUTO_SETTLE_MINUTES = 10`, `COURIER_GUARD_MINUTES = { call: 5, batal: 10 }` (`src/data/courier.ts`). Saat ini angka itu hanya dipakai untuk tampilan hitung mundur, **bukan** untuk memicu alert; `adminEscalations` masih seed statis. BRS ini menuntut SLA yang lewat **menghasilkan event → notifikasi CS**. Apakah angka SLA bisa diubah dari UI (editor di CS/SA) belum diputuskan (UNRESOLVED).

**BR-9 — Auto-settle.** Setelah tiba, bila OTP tidak diketik dalam `AUTO_SETTLE_MINUTES` (10), order tetap diselesaikan otomatis dan (bila terpicu) mengirim alert CS. Hari ini aturan ini hanya teks, belum ada reducer yang menutup order dari timeout.

**BR-10 — OTP (sudah ada).** OTP 4 digit ditampilkan ke customer, diketik kurir, dan settle order (`R-DELIV-01`). BRS ini tidak mengubah OTP.

**BR-11 — BRS ini tidak mengubah uang.** Tidak ada fee/ongkir/komisi baru. Notifikasi dan alert tidak memindahkan dana; perubahan dana hanya lewat cabang BR-6 / resolusi `f8`.

## 4. Dampak tampilan (front-end mock)

| Layar | Isi | Bukti di repo |
|---|---|---|
| Konsol merchant | Bell + notifikasi order baru, kurir berangkat/tiba, order selesai | belum lengkap — `src/api/notifications.ts` ada, emit hanya 2 call-site |
| Layar order customer | Notifikasi status + OTP | `src/components/OrderStageScreen.tsx`, `PaymentAmount.tsx` |
| Konsol kurir | Notifikasi tugas baru + batal | `src/pages/CourierTaskDetail.tsx` (1 call-site) |
| Panel CS `/admin` | Bell menerima sengketa / batal sesudah match / alert SLA | `src/pages/admin/*` — bell baca `s.notifications.items`, **0 emit ke `cs`** |
| Queue CS | Master-detail masalah + tindakan | sudah ada (audit 017 F-01…F-12) |

Data mock hidup di `src/data/`, state di Redux; tidak ada perhitungan backend di repo ini.

## 5. UNRESOLVED (jangan ditebak)

1. Window cancel order & fee pada cancel sesudah match.
2. Ambang "tolak berulang" yang memicu CS.
3. Kanal final: push saja, atau push + fallback WA untuk semua langkah kritis.
4. SLA penanganan CS (berapa lama sebelum naik ke SA) & pemilik alert SLA (CS triage vs SA).
5. Apakah angka SLA boleh diubah dari panel (editor) atau tetap konstanta keputusan PO.
6. Apakah "kurir bersedia" (toggle online) perlu jadi event notifikasi.
7. Jenis alert untuk SLA lewat: notifikasi saja, atau juga flag/state order.

## 6. Kontrak backend masa depan (catatan, bukan implementasi)

- Notifikasi order: `notifications` INSERT dengan `audience ∈ {customer, merchant, courier, cs}` + `order_id` + `event` (nama event `f18`) + `created_at`; push fan-out per `user_id` (sudah ada di BE).
- Event yang perlu emit: `payment_confirmed`, `merchant_ready`, `courier_matched`, `courier_picked_up`, `arrived`, `otp_verified`, `cancel_order`, `order_canceled`, `dispute_filed`, `sla_breached`, `escalated_to_sa`.
- Status & checkpoint: sudah ada jalur (`PATCH orders.status`, INSERT `checkpoints`).
- Belum dimodelkan di BE: tabel `disputes` (+ `resolve`/`appeal`), alert SLA turunan timer, ledger tulis (reversal/refund/settle), editor SLA.
- Notifikasi "dikirim" adalah data tersimpan yang ditampilkan sebagai mock; pengiriman push nyata di luar repo ini.
