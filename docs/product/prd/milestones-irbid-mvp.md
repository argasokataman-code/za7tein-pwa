# Milestone migrasi UI mock: Irbid MVP

Status awal: `planned`. Milestone adalah rencana, bukan klaim fitur sudah selesai. Sumber requirement: PRD aktif halaman 4–11, FR-BY/MC/CR/AD.

| ID | Milestone | Bergantung pada | Acceptance criteria front-end | Kontrak BE yang dicatat |
|---|---|---|---|---|
| M0 | Model domain dan kontrak | — | Tipe merchant, zona, mata uang, biaya, order, deposit, batch, dan status punya mock tunggal; UI lama yang berbeda terinventarisasi | Schema field, event, status, error, actor |
| M1 | Pembeli: discovery dan checkout | M0 | Katalog Hijazi/Syimali, kitchen-load, busy, keranjang per merchant, maksimal 2 order aktif, rincian JOD/IDR dan fee ditampilkan sebagai state mock | Coverage 422, rate snapshot, checkout cap, payment intent |
| M2 | Merchant: dapur dan keuangan | M0 | Tarif/toggle zona, saldo deposit dan ambang COD, pilihan masak 15/25/35, antrean, batch manual 5 order, timer SLA/auto-busy dapat didemokan | Deposit ledger, order accept/cancel, assignment, SLA timer |
| M3 | Kurir: route dan insiden | M0, M2 | Urutan drop terkunci, mulai antar, tiba + 10 menit, laporan foto, swipe selesai, status COD dapat didemokan | Location event, route lock, proof upload, completion transaction |
| M4 | Admin dan sengketa | M0, M3 | Approval merchant/deposit, audit sengketa, blacklist COD, protection fund punya state contoh | Audit log, deposit verification, claims, entitlements |
| M5 | Konsistensi dan handoff | M1–M4 | Journey Line lintas role konsisten; 390px/1440px terukur; dokumentasi dan kontrak BE lengkap; lint/build lulus | Daftar endpoint/event dan ownership validasi ditinjau BE |

Setiap milestone baru harus dipecah menjadi tugas dengan `sourceRef`, `affectedFiles`, `owner`, `dependency`, `acceptance`, `mockState`, dan `backendContract`. Jika requirement belum jelas, task berstatus `blocked-by-decision`, bukan dianggap selesai.

## Di luar PRD aktif — UNRESOLVED

Item di bawah dibangun sebagai UI mock atas permintaan pemilik produk, tetapi **tidak memiliki sumber di PRD aktif**. Ditandai `UNRESOLVED` + `blocked-by-decision`; jangan dianggap requirement aktif sampai ada keputusan tertulis.

| ID | Item | Status | Sumber tidak ada | affectedFiles | mockState | backendContract |
|---|---|---|---|---|---|---|
| X-MR-1 | Ulasan pembeli: merchant membaca & membalas komentar per hidangan (`/merchant/reviews`) | UNRESOLVED / blocked-by-decision | PRD aktif hal. 4–11, FR-MC tidak menyebut ulasan atau respons pembeli | `src/pages/MerchantReviews.tsx`, `src/data/merchantReviews.ts`, `src/store/slices/merchantSlice.ts`, `src/App.tsx`, `src/pages/MerchantDashboard.tsx` | `reviewReplies` di slice `merchant` (tidak dipersist) | — |

Pertanyaan yang belum diputuskan: apakah ulasan/respons masuk ruang lingkup merchant, apakah balasan wajib, dan apakah ulasan terikat order/hidangan. Sampai itu diputuskan, fitur tetap demo UI dan tidak boleh diklaim sesuai PRD.
