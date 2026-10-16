# F25 — Kurir Inhouse (Regular) vs Kurir Partner (Quick)

Satu titik terima order di konsol merchant, dua jalur pengantaran: **Regular → batch → kurir inhouse** dan **Quick → dispatch → kurir partner**. Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §7.2/§7.3 (jenis pengantaran), §8 (batch, BR-B01..B13), §9.2–§9.7 (fee, auto-sort, dispatch, tracking), §11 (konsol merchant), §12 (COU-06..18), §13 (OPS-13) + milestone **M4/M5/M6**.

| Berkas | Isi |
|---|---|
| `f25-batch-lifecycle.milestones.md` | Rencana milestone (sumber kebenaran render, 19 langkah M01–M19) |
| `f25-batch-lifecycle.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f25-batch-lifecycle.html` | Artefak jadi (deliver) |
| `f25-batch-lifecycle.visual-check.*` | Bukti visual-check (gitignored) |

## Alur

**Jalur A — kurir inhouse (`Regular`, sudah dibangun, M4 + M5).**
Merchant menerima order → memilih **batch baru** (estimasi masak 15/25/35) atau **gabung batch berjalan** yang hitung mundurnya masih jalan (BR-B02) → menandai **packing** tiap order (MER-13) → menutup batch **lebih awal** (BR-B08) → meng-**assign satu kurir inhouse** (BR-B07) → kurir **mulai antar** — hanya bila batch ditutup **dan** semua order packing (BR-B09) → kurir mengatur urutan lewat **auto-sort** (BR-B12/B13) dengan **peta rute + pin bernomor** (peringatan WALK beta) → menyelesaikan order **satu per satu** (checkpoint + OTP) → **fee Regular online masuk saldo dompet kurir** saat selesai → batch tuntas.

**Jalur B — kurir partner (`Quick`, M6 belum dibangun).**
Merchant menerima order → mengisi **estimasi prepare** (MER-12), tanpa batch → aplikator **dispatch** kurir partner (antrian idle terlama + batas jarak) → kurir **approve**, atau **reject ber-alasan** → **pickup** di merchant (COD Quick: kurir menalangi tunai) → **antar satu order** → **100% fee Quick** ke partner. Cabang gagal: tak merespons sampai prepare selesai → **pengganti otomatis + SP + punishment + status off**; tak ada kandidat dalam batas jarak → **Quick tak tersedia**.

## Aturan keras (jangan dilupakan)

- Batch lahir **hanya** dari order Regular yang di-accept (BR-B01) — tidak ada batch kosong yang di-seed.
- Maks **24 order** per batch (`MAX_BATCH_ORDERS`, BR-B04); hanya batch `countdown` & belum penuh yang menerima order baru.
- Kurir **per batch**, bukan per order — alur lama (assign kurir ke tiap order) sudah keluar. Kurir inhouse menerima assignment **tanpa tolak** (COU-12).
- Batas mulai lebih awal: `canStartEarly()` = batch `closed` + `batchAllPacked()` (`src/data/batch.ts`); di sisi kurir gerbang yang sama (`canStartBatch`, `src/data/courierBatch.ts`).
- Auto-sort **wajib** menampilkan peringatan rute **WALK (beta)** dan peta rutenya (garis + pin bernomor); dipicu ulang tiap order masuk; matriks waktu tempuh **tidak boleh disimpan** (cost watch R4).
- Kurir partner bekerja **satu order per waktu** (COU-15) — Quick tidak pernah masuk batch.
- COD bukan hold: tidak ada lagi "hold cut" di alur merchant (PRD aktif menggantikan alur COD-hold revisi lama).

## Terhubung (lihat `../INDEX.json`)

`f12-merchant-console:terima → f25:order_masuk` (cabang Regular/Quick); `f25:antar → f13-courier-view` (tugas kurir inhouse); `f25:dispatch|partner_respon|partner_fee` = jalur partner (M6).

## Sumber (jangan dikarang)

- PRD `sa7tein-mvp-2026-10-11` §7.2/§7.3, §8, §9.2–§9.7, §11, §12, §13 — `docs/product/prd/versions/sa7tein-mvp-2026-10-11/` (`analysis.md` baris 34–45)
- Milestone **M4** (batch merchant), **M5** (kurir inhouse), **M6** (kurir partner + dispatch) — `versions/sa7tein-mvp-2026-10-11/milestones.md` · dampak per layar — `ui-impact.md`
- Implementasi batch merchant: `src/data/batch.ts` (+ `scripts/batch-check.mjs`), `batchSlice`, `src/components/merchant/{BatchPanel,AcceptOrderSheet}.tsx`
- Implementasi sisi kurir (M5): `src/pages/CourierBatch.tsx`, `src/store/slices/courierSlice.ts` (`batch`), aturan murni `src/data/courierBatch.ts` (+ `scripts/courier-batch-check.mjs`); peta rute lewat `src/hooks/useLeafletMap.ts` (opsi `stops`) + `drawBatchRoute` (`src/hooks/leafletHelpers.ts`)
- Fee & dompet: `src/data/courier.ts` (`deliveryFeeIdr`), `src/data/courierWallet.ts` (`courierFeeEntries`, `courierWalletBreakdown` — fee + tips − pencairan, + `scripts/courier-wallet-check.mjs`), `src/data/merchant.ts` (`deliveryFeeFor`)

## UNRESOLVED (jangan ditebak)

- `orders` BE belum punya kolom jenis pengantaran → demo memakai overlay per kode order (`MOCK_ORDER_DELIVERY_TYPE`, `ui-impact.md` §8); **batch belum punya tabel di BE**, dan `orders.courier_id` tetap `null` → assign per batch masih lokal.
- **Fee vs tips belum diputuskan**: PRD §16.4 menyebut **payout otomatis** ke DANA merchant & kurir saat order selesai, sedangkan dompet kurir repo ini menaruh fee pengantaran di **saldo yang ditarik manual** (`f6`, `courierWalletBreakdown` = fee + tips − pencairan). Pemisahan fee vs tips menunggu PO.
- **OTP tidak disebut di alur baru PRD aktif** (`analysis.md` C-11); implementasi masih memakai checkpoint + OTP — jangan dianggap sudah diputuskan.
- Live tracking (R-TRACK) hanya andal saat app kurir terbuka dan layar menyala; ambang notifikasi "kurir hampir sampai" = config ops (belum ada).
- Handler **Quick tak tersedia** & **SP/punishment** butuh halaman ops (M6) yang belum dibangun; dispatch masih **usulan** (OPEN-11).

## Update

```bash
ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  ./scripts/flows-gate.sh f25-batch-lifecycle   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **0 error**, deliver exit 0; visual-check pass di tiap viewport (light + dark). `ARCHIFY_CHROME` perlu diisi karena visual-check mencari Chrome/Chromium; tanpa itu statusnya `skipped` dan gerbang dianggap gagal.
