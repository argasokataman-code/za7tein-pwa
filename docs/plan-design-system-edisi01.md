# Plan — Design System EDISI 01 (Figma "sa7tein / Foundations" + "Patterns")

Front-end showcase only. Semua perubahan desain; tanpa backend/API/DB.

Sumber Figma:
- File `ibzZ0SIdsYom6vmtT1LyMr` (SA7TEIN)
- Foundations `27:4562` (01 Warna & token · 02 Tipografi/Inter · 03 Ritme/radius/elevasi · 04 Grid · 05 Aksesibilitas)
- Patterns `33:98` (01 penemuan persiapan · 02 pengantaran monitoring · 03 aturan lintas peran · 04 empty & error)

**Status: M0–M5 selesai.** Sisa M6. Verifikasi tiap milestone: `npm run scan` 0 FAIL, `npm run lint`, `npm run build`, `npm run governance:check`, dan `browser-gate --strict` untuk rute yang disentuh.

## Prinsip

- **Satu sumber nilai**: `src/styles/_tokens.scss`. Jangan tulis nilai mentah; kalau butuh warna/ukuran, tambah token dulu.
- Gaya baru ke `src/styles/system/`; jangan memperbesar `_app.scss` porting.
- **Reuse sebelum gambar ulang**. Komponen bersama dulu (`OrderStageScreen`, `FoodCard`, `AddToCartButton`, `BottomNav`, dsb).
- **Keputusan repo yang dipertahankan** (jangan dilanggar tanpa persetujuan owner):
  - Shell mobile-only `--shell-max` 430px, satu penggulung (dokumen). **Tanpa** sidebar/grid desktop 12 kolom.
  - Radius kontainer **maksimum 12px** sampai owner memutuskan lain.
- **Pengecualian kontras tersimpan**: putih di atas `--sa7tein-orange` (`4.02:1`, di bawah AA 4.5). Lihat `DNA.md`.
- Delegasi: eksplorasi multi-file ke subagent `explorer`.

## Peta milestone

| # | Milestone | Status | Fokus |
|---|---|---|---|
| M0 | Palet & elevasi EDISI 01 | **selesai** | token warna + shadow |
| M1 | Rumah token | **selesai** | isi gap skala, token reserved, bersih-bersih |
| M2 | Tipografi Inter | **selesai** | font + skala |
| M3 | Elevasi & kartu | **selesai** | samakan kartu default ke Figma |
| M4 | Dokumentasi design system | **selesai** | `/documentation` + `DNA.md` |
| M5 | Patterns audit | **selesai** | label status, format, empty/error |
| M6 | Aksesibilitas & verifikasi | belum | kontras, gate per role |

---

## M0 — Palet & elevasi EDISI 01 — SELESAI

- `_tokens.scss`: orange `#E8421A`, orange-ink `#B83213`, orange-soft `#FDEDE8`, bg `#F8F9F7`, text-primary navy `#1A3A5C`, text-secondary `#59665F`, success `#32765A`, warning `#9A631B`/`#FFF4DF`, danger `#B93838`/`#FCECEC`, border `#E7ECE7`/`#D6DDD6`, info `#487A9F`/`#356282`/`#ECF4FA`.
- Shadow navy: `--shadow-subtle`/`sm`/`md` `rgba(26,58,92,…)`, `--shadow-brand` `rgba(232,66,26,.28)`.
- `DesignTokensSection.tsx` + `DNA.md` disinkron (kontras oranye 3.36→4.02, orange-ink 4.88→5.99).
- Bukti: scan 0 FAIL, lint/build/governance OK, `browser-gate /documentation --strict` 2/2 PASS.

## M1 — Rumah token — SELESAI

- **Skala baru** di `_tokens.scss`: `--space-9: 48px`, `--space-10: 64px` (Figma space/48, space/64).
- **Navy latar gelap**: `--navy: #1A3A5C` + `--on-navy: #FFFFFF`.
- **Nilai mentah dihapus**: `_docs.scss:34` `border-radius: 20px` → `--radius-pill`.
- **Token reserved** (belum ada consumer; ditandai di `_tokens.scss`): `--text-disabled`, `--icon-decor` (dipakai M2/M5), `--info`/`--info-ink`/`--info-soft` (M5 status "Disiapkan"). Bukan dead: kosakata palet, di-wire saat komponennya dibangun.
- **Radius 4/16/20** belum ditambah (bentrok cap 12px; lihat "Ditahan").

Done-when: skala baru terdefinisi + terpakai/direservasi; 0 nilai mentah radius baru; scan 0 FAIL; governance OK (111 token).

## M2 — Tipografi Inter — SELESAI

- **Inter self-host**: `public/assets/fonts/inter.woff2` (variable latin 100-900, 47KB), ter-precache di `sw.js`.
- `_fonts.scss`: `@font-face` Inter; Manrope tetap sebagai fallback face.
- `_tokens.scss`: `--font-sans: 'Inter', 'Manrope', …`, `--font-plus-jakarta: 'Inter'`.
- `DesignTokensSection.tsx` + `DNA.md` disinkron ("Inter, Manrope, system-ui").
- Bukti: scan 0 FAIL, lint/build/governance OK, `browser-gate /home --strict` 2/2 PASS (overflow 0).

**Ditahan**: `--text-display: 48px` (repo stop di `--text-2xl` 32px) dan Figma Caption 11px (repo floor isi 12px, audit G-08). Keduanya perlu keputusan owner.

## M3 — Elevasi & kartu — SELESAI

- **Kartu default = border, tanpa shadow** (Figma): `@mixin card-surface` (`system/_mixins.scss:32`) tidak lagi memasang `--shadow-sm`. Menyentuh **16 selector** yang `@include`-nya (courier, admin, merchant, superadmin, install-app).
- Dua kartu merchant yang memakai `--shadow-subtle` → border-only: `.merchant-menu-item` (`_merchant-2.scss`), `.merchant-courier` (`_merchant-3.scss`).
- Shadow tetap untuk lapisan terangkat: `--shadow-sm` masih dipakai pin peta, pil onboarding, hero home, auth, dsb. `--shadow-md`/`--shadow-brand` tidak berubah.
- Bukti: scan 0 FAIL, lint/build/governance OK, `browser-gate /merchant/menu` + `/merchant/couriers` --strict **2/2 PASS** (overflow 0).

Catatan: `.merchant-menu-stockfilter button.is-active` (`_merchant-menu-polish.scss:166`) tetap pakai `--shadow-subtle` sebagai isyarat kontrol aktif; itu kontrol, bukan kartu.

## M4 — Dokumentasi design system — SELESAI

- `DesignTokensSection.tsx`: swatch `--navy`/`--on-navy` ditambah; spacing `--space-9`/`--space-10`; peran shadow diselaraskan (kartu tanpa shadow, shadow untuk lapisan terangkat); intro menyebut EDISI 01 + Inter.
- `DNA.md`: referensi EDISI 01 + daftar token tambahan (`--navy`/`--on-navy`, `--info*`, `--text-disabled`, `--icon-decor`, `--space-9`/`--space-10`) + aturan kartu border-tanpa-shadow.
- Bukti: scan 0 FAIL, lint/build/governance OK, `browser-gate /documentation --strict` 2/2 PASS.

**Catatan cakupan**: section token yang ada diperkaya (bukan section baru terpisah). Spesimen tipografi per-peran Figma (Display/Title large/Heading/…) belum ditambah karena skala token sudah tampil; dapat ditambah di iterasi lanjut bila diminta.

## M5 — Patterns audit — SELESAI

### Model status 5 tahap (keputusan PO 2026-10-09)
- `OrderStage` → `baru | disiapkan | siap | diantar | selesai` (Figma `New → Preparing → Ready → Diantar → Delivered`). `MerchantOrderStatus` = `OrderStage` + sub-state `diterima`/`tiba` + terminal `ditolak`/`batal`.
- `ORDER_STAGES` jadi 5 simpul; `STEP_ICON` (ClipboardList · Utensils · PackageCheck · Bike · Home). `OrderStageScreen.STATUS` 5 tahap; blok sengketa muncul di tahap `selesai`.
- Merchant: tombol "Tandai siap" (status `siap`) sebelum "Siap diantar"; badge CSS `-baru`/`-disiapkan`/`-siap`. Pemetaan eksplisit `JOURNEY_STAGE` (diterima/tiba → tahap terdekat); donut `merchantTrend` + data `orderStage` kurir diperbarui.
- **PRD/flow**: `decision-irbid-mvp.md` + `f18-order-state/README.md` — peta 5 tahap UI → 8 state backend; state machine **tidak** diubah.

### Format EDISI 01
- `formatRating()` di `data/foods.ts`; rating pakai koma di FoodCard/Favorites/MenuDetail/Search/Home + Reviews.
- Rupiah (`Rp28.000`) & waktu (`13.42`) sudah sesuai sebelumnya. Jarak mentah `1.2 km` → `1,2 km`; `MerchantMenu` `20-30 min` → `20-30 menit`.
- `Reviews` → `ulasan` pada meta kartu + judul MenuDetail.

### Empty & error
- Empty search dapat aksi **"Hapus filter"** (bersihkan query + filter).
- Empty Favorites dilokalkan ke Indonesia.

Bukti: scan 0 FAIL; lint/build/governance OK; gate `--strict` `/merchant/orders` (+klik 15/15), `/customer/order-placed`, `/courier/task/ct-1`, `/customer/search`, `/customer/favorites` → semua **2/2 PASS**. `flows-gate f18`: validate 9/9 err=0 (visual-check `skipped` — archify butuh Chrome yang tak ada di env; flow lain yang tak disentuh sama).

**Ditunda**: komponen empty/error bersama (25 varian inline berbeda; ekstrak saat kasus Figma ketiga muncul) dan lokalisasi chrome legacy (`Go back`/`See All`/halaman Search) — tugas terpisah, keputusan owner.

## M6 — Aksesibilitas & verifikasi

- Audit kontras AA semua pasangan teks baru (navy/putih 11.64:1, action.text/putih 5.99:1, text.secondary/putih 6.02:1, `#7A857F` 3.83:1 hanya ikon dekoratif).
- **Keputusan CTA**: tombol berlabel 14px memakai latar `--orange-ink` `#B83213` (AA), atau pertahankan pengecualian merek (catat).
- `browser-gate --role customer|merchant|courier|admin --strict --click`; `--pwa` untuk rute app.
- Target sentuh ≥44px, focus terlihat 2px, status tidak hanya warna.

Done-when: gate lolos tiap role yang disentuh; temuan a11y diperbaiki di akarnya; laporan menyebut angka + selector.

---

## Ditahan (butuh keputusan owner)
1. Radius 16/20/pill (repo cap 12).
2. Grid desktop 12 kolom + sidebar 224px.
3. Font Inter (unduh woff2 vs fallback).
4. Token navy latar gelap.
5. CTA 14px `#B83213`.
