# Analysis: notif-order-e2e-2026-10-11

Status: REVIEWED. Active baseline: irbid-mvp-v2-2026-09-21 (revisi ini **proposed**; belum mengubah `activeRevision`).

## Source inventory
- Version printed in document: UNVERIFIED (BRS baru, tidak ada versi cetak)
- Pages/sections read: seluruh `source.md` (§1 masalah bisnis, §2 aktor, §3 BR-1…BR-11, §4 dampak tampilan, §5 UNRESOLVED, §6 kontrak BE)
- SHA-256: 63129f28f610821640f5bb155197a1f9999556175c02e74c80c85d01bdbb3a0d
- Keputusan PO 2026-10-11: **journey order wajib end-to-end** — tiap langkah memberi tahu ketiga pihak; **CS menangani masalah**, **Super Admin mengawasi/eskalasi**.
- Dasar silang: PRD aktif `irbid-mvp-v2-2026-09-21` · `R-PUSH-01` (`f11`), `R-DELIV-01` (`f5`/`f13`), `R-DISPUTE-01`/`C-12` (`f8`) · state kanonik `f18-order-state` · SLA keputusan PO sementara OQ-13 (`src/data/courier.ts`) · `docs/design/flows/BUSINESS.md` §2b

## Requirement delta
| Requirement ID | Source page/section | Current rule | New rule | UI/state impact | BE contract | Decision/status |
|---|---|---|---|---|---|---|
| R-NOTIF-01 | §3 BR-1, BR-2, BR-3 | PRD aktif hanya menyebut push (`R-PUSH-01`) tanpa matriks per langkah; kode punya 8 `insertNotification` (customer 5, merchant 2, courier 1), tak lengkap, none ke `cs` | Tiap transisi order `f18` memicu notifikasi ke pihak berkepentingan sesuai matriks BR-1; kurir masuk mulai `courier_matched`; event kritis (tiba, SLA lewat) punya fallback `wa.me`/SMS | Bell + push di konsol merchant, layar order customer, konsol kurir; emit per transisi | `notifications` INSERT `audience ∈ {customer, merchant, courier, cs}` + `order_id` + `event` (nama event `f18`) + `created_at`; push fan-out per `user_id` | DECIDED (matriks bentuk) / UNRESOLVED (kanal final: push vs push+WA; event "kurir bersedia") |
| R-NOTIF-02 | §3 BR-4, BR-5 | Tidak ada aturan; **0** notifikasi yang masuk ke CS | CS hanya menerima masalah (sengketa, batal sesudah match, SLA lewat); SA hanya menerima eskalasi (dispute macet, protection fund, appeal) | Bell `/admin` menerima event masalah; queue CS master-detail (sudah ada) | `audience:'cs'` (sudah valid di BE) + event `escalated_to_sa` untuk SA | DECIDED (pembagian) / UNRESOLVED (SLA penanganan CS, pemilik alert SLA) |
| R-NOTIF-03 | §3 BR-6, BR-7 | Cabang `terima/tolak/batal` ada di kode tapi aturan notifikasi & dana per cabang tak tertulis | Approve = `merchant_ready`; reject/batal selalu menulis **satu** ledger entry baru (append-only); notifikasi per cabang sesuai BR-1 #2/#8/#9; batal sesudah match → CS | Tombol terima/tolak/batal menampilkan notifikasi yang dipancarkan | `PATCH orders.status`; event `merchant_rejected`, `cancel_order`, `order_canceled`; ledger reversal (belum ada tulis di BE) | DECIDED (aturan notif + append-only) / UNRESOLVED (fee cancel sesudah match, window cancel) |
| R-NOTIF-04 | §3 BR-8, BR-9 | SLA `15/30/10` + auto-settle `10m` hanya untuk tampilan hitung mundur (`DeliveryCheckpoints.tsx`); `adminEscalations` seed statis `minutesLate`; tak ada trigger nyata | SLA lewat **menghasilkan event → notifikasi CS**; auto-settle menutup order dari timeout dan mengirim alert bila terpicu | Alert SLA di panel CS berasal dari event, bukan seed; hitung mundur tetap | Timer turunan `placedAt` → event `sla_breached`; editor SLA (belum diputuskan) | DECIDED (arah: alert nyata) / UNRESOLVED (editor SLA, SLA penanganan CS) |
| R-NOTIF-05 | §3 BR-7, BR-10, BR-11 | OTP 4 digit & dispute `f8` sudah ada; tak ada aturan baru | OTP tidak berubah; dispute tetap `f8` (BRS hanya menambah notifikasi); BRS ini tidak mengubah uang | Tidak ada aksi finansial baru di layar notifikasi | — | DECIDED |

Perluasan requirement lama (bukan ID baru): **`R-PUSH-01`** ditambah audience CS/merchant/kurir per langkah; **`R-DELIV-01`** ditambah kaitan SLA→alert CS.

## Conflicts and open questions
- **Tidak ada konflik** dengan PRD aktif: revisi itu tidak punya matriks notifikasi per langkah maupun notifikasi order→CS.
- **Konflik internal repo:** `adminEscalations` (`src/data/admin.ts`) menyajikan alert SLA seolah turunan sistem padahal seed statis — setelah BRS ini aktif, komentar/label harus menyebut "belum dipicu otomatis" agar tidak menyesatkan.
- **Konsep tak ada di kode:** "durasi respons merchant" (SLA merchant accept/reject) tidak dimodelkan; toggle "kurir bersedia" (`courierSlice.ts:46`) tidak menghasilkan event.
- Open questions yang belum boleh ditebak: window cancel & fee cancel sesudah match, ambang "tolak berulang", kanal final, SLA penanganan CS & pemilik alert, editor SLA, event "kurir bersedia", bentuk alert SLA (notif saja vs flag order).

## Repo impact and evidence
Target: repo ini (`sa7tein-pwa`), front-end saja (AGENTS.md §1).

### Existing files — affected
| File | Requirement | Status | Notes |
|---|---|---|---|
| `src/api/notifications.ts` | R-NOTIF-01, R-NOTIF-02 | **partial** | `insertNotification` + audience map (`customer/merchant/courier/cs`); audience `cs` belum pernah dipakai |
| `src/pages/MerchantOrders.tsx` | R-NOTIF-01 | **partial** | 2 emit (order baru, dll) — belum lengkap per langkah |
| `src/pages/CourierTaskDetail.tsx` | R-NOTIF-01 | **partial** | 1 emit — belum ada "tugas baru"/"dibatalkan" |
| `src/pages/PaymentAmount.tsx` | R-NOTIF-01 | **partial** | emit customer saat bayar |
| `src/data/courier.ts` | R-NOTIF-04 | **partial** | `COURIER_SLA_MINUTES 15/30/10`, `AUTO_SETTLE_MINUTES 10`, `COURIER_GUARD_MINUTES`; hanya dipakai tampilan |
| `src/components/DeliveryCheckpoints.tsx` | R-NOTIF-04 | **partial** | `slaRemainingMs(...)` + copy auto-settle; belum memicu alert |
| `src/data/admin.ts` | R-NOTIF-04 | **partial** | `adminEscalations` seed statis `minutesLate` |
| `src/store/slices/adminSlice.ts` | R-NOTIF-02 | **partial** | dispute/sengketa sebagai mock Redux (tak ada tabel BE) |
| `src/store/slices/merchantSlice.ts`, `courierSlice.ts` | R-NOTIF-01, R-NOTIF-03 | **partial** | status order vs checkpoint kurir; toggle online tanpa event |

### New files needed (bila revisi diaktifkan)
| File | Requirement | Purpose |
|---|---|---|
| Modul data notifikasi per transisi (mis. `src/data/orderNotifications.ts`) | R-NOTIF-01, R-NOTIF-02 | Matriks event → audience + teks, satu sumber (bukan teks di JSX) |
| Fungsi turunan SLA→event (di `src/data/courier.ts` atau modul baru) | R-NOTIF-04 | Hitung SLA lewat dari `placedAt` → hasilkan event alert |
| Slice/queue masalah CS (perluas `adminSlice`) | R-NOTIF-02 | Masalah masuk dari event, bukan seed |

### Files NOT affected
- `src/data/merchant.ts` — tidak menyentuh fee/zona
- `src/components/OrderStageScreen.tsx` — alur tampilan order tidak berubah, hanya memancarkan notifikasi

### Acceptance criteria (front-end mock, dapat diuji)
1. Setiap transisi order pada matriks BR-1 memunculkan entri inbox dengan audience yang benar (termasuk kurir mulai `courier_matched`).
2. `dispute_filed`, batal sesudah match, dan SLA lewat menghasilkan entri `audience:'cs'`; happy path **tidak**.
3. Eskalasi menghasilkan entri untuk Super Admin.
4. Reject/batal menambah satu ledger entry baru, tidak mengubah entry lama.
5. SLA lewat dari `placedAt` menghasilkan alert CS dari perhitungan, bukan dari seed statis.
6. Tidak ada aksi finansial apa pun di layar/bell notifikasi (BR-11).

## Status aktivasi
- Revisi ini **proposed**. `activeRevision` tetap `irbid-mvp-v2-2026-09-21`.
- Untuk mengaktifkan: tulis keputusan produk, ubah status revisi di `manifest.json`, lalu perbarui AGENTS.md, `.rules.json`, `/documentation`, dan atlas agar tidak ada kebenaran ganda (PRD README langkah 5).
