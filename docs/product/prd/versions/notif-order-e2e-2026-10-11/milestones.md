# Milestones: notif-order-e2e-2026-10-11

Status: REVIEWED. Dijadwalkan setelah revisi diaktifkan (sekarang `proposed`). Dependensi berurutan; tiap milestone punya acceptance yang teruji di front-end mock.

| ID | Requirement IDs | Dependencies | Owner | Acceptance criteria | Mock state | BE contract | Status |
|---|---|---|---|---|---|---|---|
| M0 | R-NOTIF-01…05 | — | product, fe | Matriks notifikasi BR-1, pemicu CS BR-4/BR-5, dan cabang BR-6 disetujui PO (open question §5 dijawab atau ditandai) | tidak ada | — | blocked-by-decision |
| M1 | R-NOTIF-01 | M0 | fe | Tiap transisi `f18` memunculkan notifikasi ke audience yang benar (kurir mulai `courier_matched`); teks dari satu modul data, bukan JSX | tambah modul `src/data/orderNotifications.ts`, perluas emit di 3 call-site | `notifications` INSERT + `order_id`/`event` | planned |
| M2 | R-NOTIF-02 | M1 | fe | `dispute_filed` / batal sesudah match / SLA lewat menghasilkan entri `audience:'cs'`; eskalasi menghasilkan entri SA; happy path tidak | perluas `adminSlice` queue masalah dari event (bukan seed) | `audience:'cs'`, event `escalated_to_sa` | planned |
| M3 | R-NOTIF-04 | M1 | fe | SLA lewat dihitung dari `placedAt` → alert CS nyata; auto-settle menutup order dari timeout | fungsi turunan SLA→event + reducer auto-settle | timer → `sla_breached` | planned |
| M4 | R-NOTIF-03 | M2 | fe | Tiap cabang menampilkan notifikasi benar; reject/batal menambah 1 ledger entry baru (append-only) | aksi terima/tolak/batal di konsol merchant | `PATCH orders.status` + reversal (BE baru) | planned |
| M5 | R-NOTIF-01…04 | M1–M4 | qa | Lintas role: customer/merchant/kurir menerima event yang sama sesuai matriks; CS hanya masalah; gate `/admin` web (`:4180`) lolos | — | — | planned |
| M6 | R-NOTIF-03, R-NOTIF-05 | M4 | be, fe | Bila diaktifkan: tabel `disputes` (+`resolve`/`appeal`), ledger tulis, editor SLA — di luar repo front-end | — | `disputes`, ledger tulis | out-of-scope-repo |
