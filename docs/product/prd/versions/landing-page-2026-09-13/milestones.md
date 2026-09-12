# Milestones: landing-page-2026-09-13

Status: decisions done (D1–D7). Implementasi boleh jalan mengikuti urutan M0→M6.

Owner default: Front-end (agent). Item bertanda **[PO]** butuh keputusan pemilik produk.

| ID | Requirement IDs | Dependencies | Owner | Acceptance criteria | Mock state | BE contract | Status |
|---|---|---|---|---|---|---|---|
| M0 | C1–C11, D1–D7 | — | [PO] | Semua konflik punya keputusan tertulis; `decision-landing-page.md` dibuat; tidak ada UNRESOLVED tersisa | n/a | n/a | done |
| M1 | LND-03, LND-16, LND-17, LND-18 | M0 | FE | Penyesuaian token/DNA bila D4 setuju (radius); pengecualian SVG dekoratif tercatat di `legacy-debt.json` + hash; governance hijau | n/a | n/a | ready |
| M2 | LND-01, LND-02, LND-04 | M0, M1 | FE | Hero copy tanpa jargon; CTA "Mulai Pesan"/"Lihat Cara Kerja"; preview berlapis (customer+ticket+courier+route); strip 3 nilai non-kartu; overflow 0 di 360/390/430/768/1024/1440; kontras AA | static | — | ready |
| M3 | LND-05, LND-06 | M2 | FE | Journey Line node+garis (H desktop, V mobile); 1 frame utama + 2 pendukung; tanpa 4 kartu identik | static | — | ready |
| M4 | LND-07, LND-08, LND-09 | M0 (D1) | FE | Section hyperlocal (peta/zona sesuai keputusan D1); merchant Kitchen Ticket turun dari komponen order; courier sebagai mock statis berlabel | static | — | ready |
| M5 | LND-10, LND-11, LND-12, LND-13, LND-14 | M0 (D5,D6), M1 | FE | Monetization sederhana (bukan tabel 3 kolom) sesuai D1; galeri foto dari aset yang disetujui; trust messaging tanpa testimoni palsu; CTA final orange tebal; nav sesuai D6 | static | — | ready |
| M6 | LND-19, LND-20, LND-21, LND-22 | M2–M5 | FE | Motion Prepare→Move→Arrive + reduced-motion; tanpa lib berat; recompose per breakpoint; audit anti-slop lulus; pengukuran DOM dicatat; `governance:check`+`lint`+`build` hijau; `/documentation` + atlas diperbarui | static | — | ready |

## Catatan
- Standar tampilan mengacu PRD aktif `irbid-mvp-2026-09-12` kecuali D1 memutuskan sebaliknya.
- Runtime courier 0% → LND-09 hanya mock; jangan diklaim fitur aktif.
- Semua data mock; tanpa transaksi/tesimoni/angka fiktif.
