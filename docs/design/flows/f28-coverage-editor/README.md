# F28 — Editor Coverage Merchant (Area vs Radius)

Cara merchant menentukan wilayah antar di konsol merchant (PRD aktif `sa7tein-mvp-2026-10-11`). Sumber gambarannya: PRD §9.1 (MER-04), §11 (konsol merchant) + C-13 ("≤2 km") + milestone **M4**.

| Berkas | Isi |
|---|---|
| `f28-coverage-editor.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f28-coverage-editor.html` | Artefak jadi (deliver) |
| `f28-coverage-editor.visual-check.*` | Bukti visual-check |

## Alur

**Masuk.** Merchant membuka **Area layanan** dari Setelan toko (`/merchant/coverage`), lalu memilih satu dari dua mode.

**Mode area.** Menggambar beberapa polygon di kanvas (lat/lng diproyeksikan seperti kanvas zona SA, bukan tile peta) → menaruh/menggeser vertex → memberi **fee per polygon** → editor memvalidasi: tiap polygon ≥3 titik, tidak bersilangan sendiri, dan **tidak boleh tumpang tindih** dengan polygon lain (§9.1). Bentuk yang sah disimpan.

**Mode radius.** Memilih satu radius lingkaran dari dapur (maksimum 2 km) → fee **per satuan jarak** (meter/km), proporsional jarak.

**Dipakai.** Coverage hasil editor yang menentukan alamat mana yang bisa diantar di gate checkout: titik di luar coverage → merchant tetap tampil tapi tak bisa dipilih.

## Yang belum tersedia (jangan ditebak)

- **Tulis `delivery_config` ke BE belum ada.** BE membaca `merchants.delivery_config` (mode + `radiusMeters`), tapi `src/api/` tak punya endpoint tulisnya. Di repo ini perubahan hidup di Redux (ikut persist) dan ditandai lewat `PlatformNotice` — bukan diam-diam dianggap tersimpan. Lihat `ui-impact.md` §8.
- **Fee dari rute WALK** (jalan kaki) adalah pekerjaan BE (Google Routes, tak boleh di-cache). Di repo ini fee dihitung dari jarak garis lurus dengan Haversine yang sama seperti gate checkout, jadi angkanya konsisten walau bukan angka produksi.
- **Polygon di BE** belum ada kolomnya; `delivery_config` baru menyimpan `mode`/`activeZones`/`radiusMeters`.

## Kode & pemeriksaan

- Model: `src/types.ts` (`MerchantCoverage`, `CoveragePolygon`, `CoverageMode`).
- Logika murni: `src/data/coverage.ts` (validasi non-overlap, query titik, fee) — self-check `node --import ./scripts/lib/ts-resolve.mjs scripts/coverage-check.mjs`.
- State: `src/store/slices/coverageSlice.ts` (seed `mockCoverage`, ikut persist).
- Layar: `src/pages/MerchantCoverage.tsx`.
- Gerbang: `./scripts/flows-gate.sh f28-coverage-editor` + `node scripts/browser-gate.mjs --route /merchant/coverage --strict --click`.

## Update

Ubah spec di `f28-coverage-editor.json`, jalankan `./scripts/flows-gate.sh f28-coverage-editor`, lalu selaraskan `../INDEX.json` (key `f28-coverage-editor` + link ke `f20-address-zone`). `npm run governance:check` menolak commit kalau folder flow tidak cocok dengan INDEX atau README/spec hilang.
