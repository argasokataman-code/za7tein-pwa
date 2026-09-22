# Analysis: landing-page-2026-09-13

Status: REVIEWED. Spec pelengkap disetujui — lihat `docs/product/prd/decision-landing-page.md`. Baseline aktif: `irbid-mvp-v2-2026-09-21`.

## Source inventory
- Version printed in document: tidak ada nomor versi (brief desain, bukan PRD produk).
- Sections read: 01–22 + Final brand test (seluruh 637 baris `source.md`).
- SHA-256: b3d538883e33a6bcfe8f88d88de980fc9d280923853bfc68c9583149a60cb5be
- Catatan sifat dokumen: ini **brief desain landing page**, bukan aturan domain produk. Requirement di bawah adalah UI/UX, bukan rule bisnis.

## Requirement delta

| ID | Source section | Current rule | New rule | UI/state impact | BE contract | Decision/status |
|---|---|---|---|---|---|---|
| LND-01 | 01 Core message | Landing copy memakai istilah teknis (PWA, Midtrans) — `src/pages/Landing.tsx` | Fokus nilai: "Makanan enak lebih dekat"; DEKAT/CEPAT/LOKAL/SEDERHANA; tanpa jargon | Rewrite seluruh copy hero+lead | — | ACCEPTED (dalam arah Irbid) |
| LND-02 | 02 Hero | Hero full-width grid 2 kolom + device iframe — `Landing.tsx` | Eyebrow "Marketplace makanan hyperlocal"; headline pendek; subtext; CTA "Mulai Pesan"/"Lihat Cara Kerja"; preview berlapis (customer+merchant ticket+courier status+route line) | Ganti hero visual; hapus iframe generik | — | PARTIAL; butuh keputusan D2 (preview berlapis) |
| LND-03 | 03 Hero background | Hero latar `--bg-warm` | Oranye Sa7tein sebagai tone utama + SVG inline dekoratif (bentuk makanan, dot matrix, route line, cloche), kontras sangat rendah | Butuh SVG inline baru | — | BLOCKED: butuh pengecualian dekoratif (D3) |
| LND-04 | 04 Value strip | Belum ada strip nilai; ada grid kartu fitur | 3 poin non-kartu: Dekat/Cepat/Langsung, ikon SVG sederhana | Section baru | — | CONFLICT C1/C2 (lihat bawah) |
| LND-05 | 05 How it works | Belum ada; ada section "Cara kerjanya" 3 langkah kartu | Journey Line: Pilih→Siapkan→Ambil→Tiba; horizontal desktop / vertikal mobile; node+garis | Section baru pakai Journey Line | — | ACCEPTED |
| LND-06 | 06 Customer experience | Ada iframe `/onboarding` | 1 frame utama + 2 frame pendukung (nearby, menu detail, checkout, tracking) | Butuh komposisi screenshot | — | PARTIAL: aset/screen belum dipilih |
| LND-07 | 07 Hyperlocal | Tidak ada section radius di landing | Peta + zona konsentris **Zona A <600 m / B 600 m–1.5 km / C 1.5–2 km**; "fokus merchant sekitar 2 km" | Section + ilustrasi peta | — | CONFLICT C1 (legacy vs Irbid) |
| LND-08 | 08 Merchant | Belum ada; merchant UI ada di `/merchant/*` | Kitchen Ticket / Live Order Board; copy operasional | Section baru, turunkan dari komponen order | — | ACCEPTED (mock) |
| LND-09 | 09 Courier | Belum ada; **courier UI 0%** di runtime | Layar kurir mobile (task, tujuan, rute, konfirmasi) + Route Draw | Section baru, mock | — | BLOCKED: courier belum dibangun (C10) |
| LND-10 | 10 Monetization | Tidak ada; landing saat ini tidak menyebut paket | "Mulai gratis", Free 10 order/hari, Paid kuota lebih tinggi, CTA "Pelajari paket merchant" | Section baru | — | CONFLICT C3 (free tier legacy) |
| LND-11 | 11 Food showcase | Belum ada section foto editorial | Galeri foto makanan lokal natural | Section baru | — | PARTIAL: aset terbatas (C7) |
| LND-12 | 12 Social proof | Belum ada | Tanpa testimoni palsu; trust messaging "Untuk merchant sekitar. Untuk pelanggan sekitar." | Section baru | — | ACCEPTED |
| LND-13 | 13 Final CTA | CTA band orange-soft, "Coba alur lengkapnya." | Blok oranye tebal; "Lapar? Cari yang dekat."; CTA "Mulai Pesan"/"Daftar Merchant"; pola SVG route/food | Ganti CTA | — | ACCEPTED |
| LND-14 | 14 Navigation | Nav: Fitur/Cara kerja/Peran/Dokumentasi + "Lihat demo" | Nav: Cara Kerja, Untuk Merchant, Area, Tentang + kanan Masuk / Mulai Pesan | Ganti item nav + target | — | PARTIAL: "Tentang"/"Area"/target (C8/C9) |
| LND-15 | 15 Typography | `--font-sans` = Manrope | Manrope/Inter/DM Sans; headline bold editorial | Sudah Manrope | — | ACCEPTED (no change) |
| LND-16 | 16 Color | Semua warna brief == token | Orange dominan; tanpa purple/cyan/blue/neon | Token-only | — | ACCEPTED (0 warna baru) |
| LND-17 | 17 Spacing/shape | DNA radius cap 12px (`_tokens.scss`) | Radius 6–12; **maks 16px pada kasus luar biasa**; hindari pill berlebihan | Potensi naik cap | — | CONFLICT C6 |
| LND-18 | 18 Iconography | Ikon fungsi wajib lucide (DNA/DEC-004) | "Custom inline SVG; jangan pakai icon library secara visual" | — | — | CONFLICT C5 (reconcile) |
| LND-19 | 19 Motion | Token motion + reduced-motion global | Prepare→Move→Arrive; staged entrance, route draw; tanpa parallax/bounce/loop | Animasi state | — | ACCEPTED |
| LND-20 | 20 Performance | Aset lokal, lazy | Responsive/lazy/optimized, tanpa lib animasi berat | — | — | ACCEPTED |
| LND-21 | 21 Responsive | Diukur 360–1440 | Recompose; hero stack; journey H→V; 1 besar + 2 pendukung | Pengukuran ulang | — | ACCEPTED |
| LND-22 | 22 Anti AI-slop | — | Tolak 3 kartu identik/blob/pill everywhere/mockup generik | Audit visual | — | ACCEPTED |

## Conflicts and open questions

- **C1 — Model zona (kritis).** Brief §04 dan §07 memakai **radius sekitar 2 km** dan **Zona A/B/C** (<600 m, 600 m–1.5 km, 1.5–2 km). Ini persis model `radius-mvp-legacy` yang berstatus **superseded** (`manifest.json` scope: "Indonesia, IDR, radius A/B/C ... free tier"). PRD aktif saat itu `irbid-mvp-2026-09-12` (kini superseded) scope: "Irbid, JOD/IDR, **Hijazi/Syimali**, Midtrans, deposit COD, batch pedestrian". **UNRESOLVED** — pilih: (a) landing mengikuti zona Irbid, atau (b) brief sengaja memakai model radius (berarti Irbid tidak berlaku untuk landing / perlu revisi keputusan Irbid). Tidak boleh ditebak.
- **C2 — Pembayaran.** Brief §04 "Pembayaran masuk ke merchant". Irbid = Midtrans + **deposit COD** merchant. **UNRESOLVED** — arti "langsung" perlu dinyatakan ulang sesuai Irbid atau ditandai legacy.
- **C3 — Free tier.** Brief §10 "Free: 10 order/hari; Paid: kuota lebih tinggi". Ini model free tier `radius-mvp-legacy`. Irbid memakai **deposit/komisi** (FR-MC-03). **UNRESOLVED**.
- **C4 — Pasar/mata uang.** Brief tidak menyebut JOD/IDR/Irbid. Mengikuti C1. **UNRESOLVED**.
- **C5 — SVG inline vs kebijakan ikon.** Brief §03/§18 mewajibkan ikon **custom inline SVG**. Governance (`check-governance.mjs`, `legacy-debt.json`) mengunci tepat 5 SVG inline dan menolak SVG baru tanpa pengecualian tercatat; DNA mewajibkan ikon **fungsional** pakai lucide, SVG inline hanya ornamen. **Keputusan dibutuhkan:** (a) motif dekoratif (route line, dot matrix, cloche, pola CTA) → catat pengecualian dekoratif baru di `legacy-debt.json` + decision; (b) ikon strip nilai/journey yang fungsional → tetap lucide. Jangan mencampur tanpa catatan.
- **C6 — Radius.** DNA cap 12px (`_tokens.scss`, `DNA.md:17`); brief §17 mengizinkan **16px** pada kasus luar biasa. **UNRESOLVED** — naikkan cap (ubah token + DNA) atau tahan 12px (ubah brief).
- **C7 — Aset fotografi.** Brief §11 minta foto makanan close-up + suasana merchant + natural lighting. Aset yang ada: `public/assets/img/menu/{nasi-goreng,sate-ayam,sate-kambing,lontong,es-teh-manis}.webp` + `public/assets/media/onboarding-bg.196fa385.jpg` (burgers). Tidak ada foto suasana merchant. **UNRESOLVED** — pakai menu webp + burger, atau sediakan aset baru. Tanpa URL eksternal (DNA).
- **C8 — Rute nav belum ada.** Nav §14 minta "Cara Kerja, Untuk Merchant, Area, Tentang". "Area" → section LND-07; "Tentang" belum ada halaman/section; "Untuk Merchant" → `/merchant/menu` atau section LND-08; "Pelajari paket merchant" (§10) belum ada tujuan. **UNRESOLVED** — tentukan anchor/route.
- **C9 — Target CTA.** "Mulai Pesan" (§02/§13) arahnya belum ditentukan (`/onboarding`? `/home`?); "Daftar Merchant" arah merchant. **UNRESOLVED**.
- **C10 — Courier (§09).** Runtime courier 0% (lihat audit conformance). Section menampilkan layar kurir yang belum ada; hanya bisa mock statis. **Catat sebagai mock showcase**, bukan fitur aktif.
- **C11 — Model aktivasi.** Brief ini bukan sumber aturan produk. Mengaktifkannya sebagai `activeRevision` akan men-supersede Irbid dan meregresi aturan produk. **Rekomendasi:** tetap `proposed`, adopsi sebagai **spec desain pelengkap** di bawah Irbid lewat `decision-landing-page.md`; `activeRevision` tetap `irbid-mvp-v2-2026-09-21`. Perlu keputusan pemilik produk.

## Repo impact and evidence

- **Sudah ada (dipakai ulang):** journey/status order (`src/components/OrderStageScreen.tsx`), merchant (`src/pages/merchant/*`), token & motion (`src/styles/_tokens.scss`), shell/full-width exception (dokumentasi `/documentation` → Layout Exceptions), aset menu webp.
- **Sebagian:** landing sekarang (`src/pages/Landing.tsx`) baru punya hero+fitur+peran+CTA; brief minta 13+ section baru (journey, hyperlocal, merchant, courier, monetization, food showcase, social proof, final CTA, nav baru).
- **Belum ada:** courier UI (0%), halaman/section "Tentang", paket merchant, aset foto suasana.
- **Governance yang akan tersentuh:** `docs/design/legacy-debt.json` (SVG inline, raw color ceiling), `docs/design/DNA.md` (radius bila C6 disetujui), `_tokens.scss` (bila cap diubah), `src/pages/Documentation.tsx` + section styling (sync wajib), `AGENTS.md` bila aturan berubah.
- **Gate:** `npm run governance:check`, `npm run lint`, `npm run build`; plus pengukuran 360/390/430/768/1024/1440.

## Keputusan pemilik produk (SELESAI)

- D1 (C1–C4): **ikut PRD aktif Irbid** — zona Hijazi/Syimali, Midtrans + deposit COD, model deposit/komisi; radius 2 km, Zona A/B/C, dan free tier legacy tidak dipakai.
- D2 (LND-02/06): preview berlapis dibangun sebagai mock komposisi (bukan iframe generik); screen acuan: katalog/kustomer, ticket merchant, status kurir.
- D3 (C5): **disetujui** — motif dekoratif inline SVG, dicatat di `legacy-debt.json`; ikon fungsional tetap lucide.
- D4 (C6): **tahan cap radius 12px**; token/DNA tidak diubah.
- D5 (C7): **pakai aset lokal yang ada** (`public/assets/img/menu/*.webp`, burger onboarding).
- D6 (C8/C9): **target default** (lihat `decision-landing-page.md`).
- D7 (C11): **spec pelengkap**; `activeRevision` tetap `irbid-mvp-v2-2026-09-21`.
