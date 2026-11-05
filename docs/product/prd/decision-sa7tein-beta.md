# Keputusan sumber produk: sa7tein Beta v1 (marketplace + delivery)

- ID: `sa7tein-beta-2026-11-05`
- Sumber: `versions/sa7tein-beta-2026-11-05/source.pdf` (PRD *sa7tein — Online Food Marketplace & Delivery (MVP)*, versi cetak 0.1 draft, 135 halaman, berkas `… (1).pdf`).
- Analisis: `versions/sa7tein-beta-2026-11-05/analysis.md` (REVIEWED, 34 baris Requirement delta, konflik `B-01..B-17`). Milestone: `versions/sa7tein-beta-2026-11-05/milestones.md` (M0–M9, semua `planned`). Dampak UI/flow: `versions/sa7tein-beta-2026-11-05/ui-impact.md`.
- Menggantikan: `sa7tein-mvp-2026-10-11` (kini `superseded`), yang sebelumnya menggantikan `irbid-mvp-v2-2026-09-21`, `irbid-mvp-2026-09-12`, dan `radius-mvp-legacy`.
- Tanggal aktivasi: **2026-11-05** (keputusan pemilik, sesi branch `beta-v1`).

## Alasan

Dokumen ini memakai judul yang sama dengan revisi aktif sebelumnya, tetapi **model bisnisnya berubah di sembilan domain** dan menambah tiga domain yang sama sekali belum ada di kode. Karena itu ia diperlakukan sebagai revisi baru, bukan tambalan pada `sa7tein-mvp-2026-10-11`:

- **Auth reverse OTP WhatsApp** (§5): satu nomor satu akun, satu akun banyak peran + **role aktif**; menggantikan magic link dan "satu email satu peran".
- **User Agreement** (§5, §17, §19.3): consent saat daftar, sah untuk seluruh merchant milik owner, perubahan rule berlaku otomatis tanpa persetujuan ulang, pemberitahuan lewat **Inbox** (domain baru).
- **Kurir = karyawan merchant ber-hak "Antar order"** (§9, §11): kurir **partner**, **Quick**, dan **dispatch** dihapus. `partnerSlice`, `CourierPartner.tsx`, `CourierPayout*`, dan layar dispatch ops menjadi arsip, bukan fitur yang dipertahankan.
- **Batch 3 status** (§8, §7.2): `open → delivery → done`, maks 24 order, tanpa hitung mundur, extend, atau packing; batch lahir saat merchant menerima order dan tetap menerima order baru meski sudah di-assign.
- **Uang berubah arah** (§15): `S − Dm − Da + F + Pc + Ft`, **F ke merchant** (bukan kurir), **Pk** biaya proses payout, **Ft dinamis** hanya QRIS, total IDR dibulatkan ke atas ratusan, payout dibulatkan ke bawah, settlement 3 kolom wajib sama dengan total dibayar.
- **Pembayaran QRIS + COD** (§7.1, §16): DANA VA, saldo, dan transfer manual keluar dari alur aktif; COD hanya untuk merchant yang punya kuota order tersedia.
- **Kuota dua sisi** (§16): kuota **customer** dan kuota **merchant**, siklus reserve → consume → return, paket berjatah periode + alacarte dengan skema diskon, `Pk` dipotong dari payout.
- **Katalog varian otomatis + combo** (§13): attribute + opsi membentuk varian otomatis, satu kategori per menu, jadwal mingguan/bulanan per tanggal, stok dua scope (menu dan varian), combo.
- **Marketing 4 tipe + budget** (§14.1–§14.3): program merchant dan program aplikator, reward, rule, budget, waktu aktif, target.
- **Membership** (§14.4, domain baru): merchant mengajukan, ops menyetujui, badge di explore, promo terkunci, penanda di order, potongan `Pm`.
- **sa7tein poin** (§14.5, domain baru): toggle merchant, minimal satu rule, tiga mode, potongan paling akhir, riwayat poin.
- **Invoice PDF A4** (§15.8, domain baru): pratinjau untuk semua status, PDF hanya untuk status akhir, tanpa akses kurir.
- **Dispute non-uang tanpa banding** (§17): kompensasi dan punishment bukan uang, rule otomatis diputus final, tiket manual urut masuk, snapshot rule ke order.
- **Arsitektur & NFR** (§20): `ARC-01..ARC-18` (Worker, DO, Queue, Workflow, RPC, WS, R2, KV), `NFR-01..NFR-07` (idempotensi, ledger append-only, pembulatan, latensi, resync, audit).

## Batas implementasi

Repo ini tetap **showcase front-end mock** (AGENTS.md §1). WhatsApp Cloud API, payment gateway, disbursement, kurs, Google Routes, WebSocket, dan Cloudflare menjadi **state demo dan kontrak handoff**, bukan integrasi nyata. Tidak ada backend, pembayaran, auth, atau push sungguhan.

## Status kode

**Belum dimigrasikan.** Tidak ada satu pun requirement beta yang `complete`: 29 fitur `partial` (sebagian bentuknya sudah ada di kode lama) dan 5 `blocked` (`R-MER-MEMBERSHIP`, `R-CUS-MEMBERSHIP`, `R-CUS-POINTS`, `R-MER-CREW`, `R-ARCH`). Semua milestone `planned` karena aturan ratchet melarang milestone `done` selama fitur rujukannya belum `complete`. Jalur pengerjaan ada di `versions/sa7tein-beta-2026-11-05/milestones.md` (M0–M9).

## Ketidakpastian (jangan diisi dengan tebakan)

Aktivasi **tidak** menyelesaikan blocker sumber. `analysis.md` menandai `OPEN-01` (payment gateway), `OPEN-02` (provider kurs + fallback), `OPEN-25` (query lintas Durable Object + skala), `OPEN-27` (legal), `OPEN-28` (metrik keberhasilan), dan `OPEN-31` (fitur bonus paket kuota) sebagai `OPEN` sampai pemilik produk memutuskan. Requirement yang tidak bisa dibuktikan di FE mock tetap `UNRESOLVED` di file fiturnya.

Konflik antar-bagian dokumen dicatat sebagai `B-01..B-17` di `analysis.md`; yang sudah dapat dibaca dari teks PRD diberi status `DECIDED`, yang tidak tetap `OPEN`. Jangan menutup `OPEN` dengan asumsi.

## Riwayat keputusan

### Aktivasi PRD sa7tein Beta v1 — 2026-11-05 (keputusan pemilik)

- `manifest.json`: `activeRevision` → `sa7tein-beta-2026-11-05`; status revisi ini `active`, `supersedes` → `sa7tein-mvp-2026-10-11`; revisi lama → `superseded` dengan `supersededBy`.
- Sinkron dalam commit yang sama: `AGENTS.md` (§1, §9), `.rules.json` (`productAuthority.activeRevision`, contoh kanonik fitur), `docs/product/prd/README.md`, `src/pages/Documentation.tsx`, `src/pages/documentation/sections/IntroductionSection.tsx`, `docs/design/flows/INDEX.json` + `PLAN.md` (ditandai perlu rebase), atlas (node `DEC`).
- Flow yang berubah bentuk dan **wajib rebase** sebelum disentuh: `f13-courier-view` (partner/Quick keluar), `f25-batch-lifecycle` (tanpa timer/extend/packing), `f26-quick-dispatch` (**dihapus** bersama fitur dispatch), `f21-account-auth` (reverse OTP + multi-role), `f14-chat-order` (peserta dinamis), `f28-coverage-editor` (mode area/radius tetap, fee WALK), `f17-payment-dana` (DANA → QRIS).
- `versions/sa7tein-mvp-2026-10-11/*` tetap disimpan sebagai arsip `superseded`; jangan menghapus catatan keputusan lama.
