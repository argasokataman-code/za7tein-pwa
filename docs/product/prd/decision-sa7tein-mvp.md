# Keputusan sumber produk: sa7tein MVP (marketplace + delivery)

- ID: `sa7tein-mvp-2026-10-11`
- Sumber: `versions/sa7tein-mvp-2026-10-11/source.pdf` (PRD *sa7tein — Online Food Marketplace & Delivery (MVP)*, v0.1 draft, pemilik produk Yusuf, cetak 11 Okt 2026).
- Analisis: `versions/sa7tein-mvp-2026-10-11/analysis.md` (REVIEWED). Milestone: `versions/sa7tein-mvp-2026-10-11/milestones.md` (M0–M11). Dampak UI/flow: `versions/sa7tein-mvp-2026-10-11/ui-impact.md`.
- Menggantikan: `irbid-mvp-v2-2026-09-21` (kini `superseded`), yang sebelumnya menggantikan `irbid-mvp-2026-09-12` dan `radius-mvp-legacy`.
- Tanggal aktivasi: **2026-10-15** (keputusan pemilik).

## Alasan

PRD ini menetapkan **produk berbeda** dari revisi Irbid yang aktif sebelumnya — bukan tambal-sulam, melainkan model marketplace + delivery penuh:

- **Kurir ganda**: kurir **inhouse** (karyawan merchant, kerja per **batch**) + kurir **partner** (dikelola aplikator, satu order, approve/reject ber-alasan). Sebelumnya kurir = karyawan merchant saja.
- **Batch & antrian** (§8): wadah ≤24 order Regular, hitung mundur estimasi masak, auto-sort rute (Google Routes, mode WALK).
- **Coverage per merchant** (§9.1): mode area (polygon non-overlap) atau radius — menggantikan zona global Hijazi/Syimali.
- **Uang** (§16): harga JOD, transaksi IDR, kurs harian; **Pc** (customer) + **Pm** (merchant, hanya online tanpa kuota) + **Ft 1,5% QRIS**; delivery fee ke **kurir**; settlement 3 kolom; payout otomatis DANA Enterprise saat order selesai.
- **Langganan kuota** (§17): kuota order + kuota order COD (reserve/consume, prioritas, setting "terima tanpa kuota").
- **Katalog & marketing ala Odoo** (§14, §15): attribute/variant/exclusion + loyalty program penuh dengan `isStackable`.
- **COD tunai** (§16.5): transaksi offline JOD, hanya merchant ber-kuota COD — menggantikan COD via wallet hold.
- **Auth magic link** (§5): email magic link saja, satu email satu peran, **5 peran** (tambah kurir partner + ops).
- **Aplikasi ops** (§13): PWA terpisah di balik Cloudflare Access — verifikasi, moderasi, config, rule dispute, analytics.
- **Arsitektur** (§21): Cloudflare Worker + Durable Object + Queue + Workflows + RPC + WebSocket + R2 (`ARC-01..13`).
- **Dispute berbasis rule** (§18): merchant multi-select rule; kompensasi + punishment; SP kurir partner = salah satu punishment.

## Batas implementasi

Repo ini tetap **showcase front-end mock** (AGENTS.md §1). Cloudflare/DANA/Google Maps/GPS/push/OTP/Workflow menjadi **state demo dan kontrak handoff**, bukan integrasi nyata. Tidak ada backend, pembayaran, atau auth sungguhan.

## Status kode

**Belum dimigrasikan** ke model PRD ini selain M0. Kode saat ini masih banyak mengikuti `irbid-mvp-v2` (COD hold, zona Hijazi/Syimali, fee 0,15/0,22, kurir karyawan merchant) — itu **legacy implementation**, bukan ketentuan aktif. Jalur migrasi ada di `versions/sa7tein-mvp-2026-10-11/milestones.md` (M0–M11); status per milestone diperbarui di sana.

## Ketidakpastian (jangan diisi dengan tebakan)

`analysis.md` mencatat item `UNRESOLVED` — termasuk blocker: **OPEN-01** kapabilitas DANA (seluruh alur uang), **OPEN-26** enum status final order/batch (ERD), **OPEN-27** legal (konsultan), **OPEN-28** metrik. Teknis: OPEN-08/10/11/17/18/19/20/23/24/25/29/30. Beberapa keputusan lama (pajak/GST, insentif Founding) tidak disebut di PRD ini dan ditandai `UNRESOLVED` — jangan wariskan sebagai aturan aktif tanpa sumber.

Jika pemilik produk menyatakan dokumen lain lebih otoritatif, ubah manifest dan catat keputusan pengganti. Jangan menimpa dokumen keputusan ini tanpa jejak.

## Riwayat keputusan

### Aktivasi PRD sa7tein MVP — 2026-10-15 (keputusan PO)

- `manifest.json`: `activeRevision` → `sa7tein-mvp-2026-10-11`; status revisi ini `active`; `irbid-mvp-v2-2026-09-21` → `superseded` dengan `supersededBy`.
- Sinkron: `AGENTS.md`, `.rules.json`, `src/pages/documentation/sections/IntroductionSection.tsx`, `docs/design/flows/PLAN.md` + `INDEX.json` (flow masih menggambarkan model lama → ditandai legacy, migrasi mengikuti M0–M11).
- Mulai **M0** (tipe domain + konstanta uang + slice baru). Milestone M1–M11 menyusul.
