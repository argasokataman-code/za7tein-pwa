# F25 — Siklus Batch Kurir Inhouse (Regular) vs Quick (Partner)

Cabang pengantaran order di konsol merchant (PRD aktif `sa7tein-mvp-2026-10-11`). Sumber gambarannya: PRD §7.2/§7.3 (jenis pengantaran), §8 (batch, BR-B01..B13), §11 (konsol merchant) + milestone **M4**.

| Berkas | Isi |
|---|---|
| `f25-batch-lifecycle.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f25-batch-lifecycle.html` | Artefak jadi (deliver) |
| `f25-batch-lifecycle.visual-check.*` | Bukti visual-check |

## Alur

**Regular (batch).** Merchant menerima order → memilih **batch baru** (input estimasi masak 15/25/35) atau **gabung batch berjalan** yang hitung mundurnya masih jalan (BR-B02) → menandai **packing** setiap order → menutup batch **lebih awal** (BR-B08) → meng-**assign satu kurir inhouse** (BR-B07) → **menyetujui mulai lebih awal** — hanya bila batch sudah ditutup **dan** semua order packing (BR-B09) → kurir mengantar batch (auto-sort rute, BR-B12) → semua order selesai.

**Quick (partner).** Merchant menerima order → mengisi **estimasi prepare** (MER-12), tanpa batch → serah terima ke kurir partner aplikator. **Dispatch partner (§9.4) belum ada**: tombolnya mati + alasan "belum tersedia" sampai M6.

## Aturan keras (jangan dilupakan)

- Batch lahir **hanya** dari order Regular yang di-accept (BR-B01) — tidak ada batch kosong yang di-seed.
- Maks **24 order** per batch (`MAX_BATCH_ORDERS`, BR-B04); hanya batch `countdown` & belum penuh yang menerima order baru.
- Kurir **per batch**, bukan per order — alur lama (assign kurir ke tiap order) sudah keluar.
- COD bukan hold: tidak ada lagi "hold cut" di alur merchant (PRD aktif menggantikan alur COD-hold revisi lama).
- Batas mulai lebih awal: `canStartEarly()` = batch `closed` + `batchAllPacked()` (`src/data/batch.ts`).

## Terhubung (lihat `../INDEX.json`)

`f12-merchant-console:terima → f25` (cabang Regular/Quick); `f25:antar → f13-courier-view` (tugas kurir inhouse); `f25:quick_estimasi → f6`/dispatch partner (M6, belum ada).

## Sumber (jangan dikarang)

- PRD `sa7tein-mvp-2026-10-11` §7.2/§7.3/§8/§11 — `docs/product/prd/versions/sa7tein-mvp-2026-10-11/`
- Milestone **M4** — `versions/sa7tein-mvp-2026-10-11/milestones.md` · dampak per layar — `ui-impact.md` (§11, C-01/C-02/C-03)
- Implementasi: `src/data/batch.ts` (+ self-check `scripts/batch-check.mjs`), `batchSlice`, `src/components/merchant/{BatchPanel,AcceptOrderSheet}.tsx`
- **UNRESOLVED (jangan ditebak):** `orders` BE belum punya kolom jenis pengantaran → demo memakai overlay per kode order (`MOCK_ORDER_DELIVERY_TYPE`), dicatat di `ui-impact.md` §8; batch belum punya tabel di BE.

## Update

```bash
./scripts/flows-gate.sh f25-batch-lifecycle   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **0 error**, deliver exit 0; visual-check pass di tiap viewport (light + dark).
