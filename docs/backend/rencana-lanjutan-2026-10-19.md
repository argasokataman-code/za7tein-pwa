# Rencana lanjutan — 2026-10-19 (catatan buat besok)

Status: kerja integrasi BE/FE Sa7tein PWA. Sesi 2026-10-18 berhenti karena
**kuota baca D1 habis** (lihat §1). Catatan ini yang pertama dibaca besok.

## 1. Blocker yang hilang sendiri

```
D1_ERROR (code 7500): daily row read limit exceeded
```
Semua `GET` (Worker `sa7tein-api-cf.sa7tein-pwa.workers.dev` **dan** API CF
`/accounts/.../d1/database/.../query`) → 400 sampai **midnight UTC**.

- Bahkan `sqlite_master` ditolak; `SELECT 1` (0 baris) masih lolos.
- Kredensial: `.env.local` (CF token, `CLOUDFLARE_ACCOUNT_ID=2f0537...`,
  `CLOUDFLARE_D1_DATABASE_ID=323b5ff6-...`, `VITE_API_BASE_URL`).
- Runner ad-hoc: `scripts/d1-check.sh`.

**Langkah 0 besok:** konfirmasi kuota pulih —
`bash scripts/d1-check.sh "SELECT 1"` → kalau bukan 7500, lanjut.

## 2. Sudah masuk semalam (jangan diulang)

| Commit | Isi |
|---|---|
| `bcacaee` | Kategori menu konsol merchant dari `menu_categories` BE |
| `15155bf` | Item konsol merchant live dari `menus` + tulis balik POST/PATCH/DELETE |
| `f44d27d` | Perbaikan hitungan tabel di audit doc |
| `0247ded` | Search + carousel + form slide promo baca BE |
| `af1b322` | Favorites resolusi item dari BE |
| `f704a27` | `exchange_rates` D1 jadi sumber kurs prioritas |

Verifikasi live-nya **belum** karena kuota (kecuali tulis `menus` 201/204/204,
dan baca `menus`/`menu_categories` 200 — dibuktikan sebelum kuota habis).

## 3. Tugas tersisa — urut

### 3a. Inject alamat customer Jordan (Syimali/Hijazi)
Alasan: tester ada di Jakarta → `check_coverage` gagal. FE tak perlu diubah
(coverage lewat RPC `check_coverage`, `src/api/profile.ts:249`).

1. Baca `SELECT sql FROM sqlite_master WHERE name='addresses'` + `coverage_zones`
   (`select=*`) → ambil polygon zona + id customer demo.
2. Hitung 1 titik di dalam polygon Hijazi/Syimali → `INSERT` (atau PATCH baris
   yang ada) ke `addresses` untuk customer demo, `is_default=1`.
3. Bukti: `POST /rest/v1/rpc/check_coverage` untuk titik itu → harus lolos.

### 3b. 7 tabel BE belum dibaca FE
Aturan: **`select=*` dulu, jangan sebut kolom** (satu kolom asing = 400 yang
mematikan seluruh query). Baca kolom → tulis mapper + hook **pola mock-first**
(`useApiCatalog`/`useMerchantMenu`: API menimpa mock, gagal → mock tetap).

**Status 2026-10-19 (selesai sebagian):**

| Tabel | Status | Isi |
|---|---|---|
| `cashback_tiers` | ✅ | `fetchRebateTiers` (`api/reference.ts`) + `useRebateTiers` → `MerchantRebate` |
| `dispute_rules` | ✅ | `fetchDisputeRules` (`api/ops.ts`) → `opsSlice.hydrateDisputeCatalog` + template punishment |
| `punishments` | ✅ | `fetchPenalties` (join nama kurir/merchant/customer manual) → `opsSlice.hydratePenalties` |
| `enterprise_ledger` | ✅ | `fetchEnterpriseLedger` (`api/admin.ts`) → `adminSlice.setLedger` |
| `product_attributes` + `product_attribute_values` | ⏸️ **ditunda** | BE tak punya ikatan atribut→menu yang bisa dipetakan: `menu_attribute_lines` **kosong**, dan `menu_variants.options` (JSON) beda model dari atribut Odoo FE. Memetakan akan memutus `curated` slice. |
| `wallet_ledgers` | ⏸️ **ditunda** | 1 baris, kolom `ref_type/ref_id/direction` semuanya NULL; dompet FE = saldo (`wallets`), bukan daftar ledger. Bentuk tak nyambung. |
| `courier_types` | ⏸️ **ditunda** | FE belum punya rumah (cuma `Courier`/`CourierPartner`). Perlu keputusan tampilannya dulu. |

Mapper murni dipindah ke `src/data/beMapping.ts`; self-check `npm run
check:be-mappers` (baris contoh dari D1 nyata). Wiring: `useApiOps` dipanggil
dari `ApiSync` (`App.tsx`). Tulis (POST/PATCH) belum — panel ops masih mock.

| Tabel | Rumah di FE | Catatan mapping |
|---|---|---|
| `product_attributes` + `product_attribute_values` | `catalogAttributesSlice` (`mockCatalogAttributes` `data/catalogOdoo.ts:19`), dipakai `MenuAttributeEditor` + `MenuDetail` | `display_type`→`displayType`, `price_extra`→`defaultExtraPrice`; join via `attribute_id` |
| `cashback_tiers` | `REBATE_TIERS` `data/incentive.ts:34` → `MerchantRebate.tsx` | perlu baca bentuk tier FE dulu |
| `dispute_rules` | `DISPUTE_RULES` `data/rules.ts:33` → `ops/OpsRules.tsx` | BE punya `compensation`/`punishment`, tipe FE tak ada → putuskan |
| `punishments` | `RULE_PUNISHMENTS` `data/rules.ts:153`, riwayat `data/ops.ts:67` → `ops/OpsPenalties.tsx` | `subject_type`→`subject`, `kind`→`form`, `dispute_id`→`ruleId` |
| `enterprise_ledger` | `adminLedger` `data/admin.ts:322` → `SaLedger.tsx`/`AdminLedger.tsx` | `party` BE string? vs `LedgerParty` objek |
| `wallet_ledgers` | `mockWallet`/`PayoutEntry` `data/wallet.ts:15` | `ref_type`/`direction` vs `kind` FE |
| `courier_types` | **belum ada rumah** — FE cuma punya `Courier`/`CourierPartner` | putuskan dulu: tampilkan di mana (Setelan kurir? konsol CS?) |

### 3c. Verifikasi (wajib, angka bukan kesan)
- `./scripts/verify.sh` (lint+build) · `npm run scan` (0 FAIL)
- Gate: `GATE_BASE=http://localhost:4174 node scripts/browser-gate.mjs --route <rute> --strict --click`
  — server yang sudah hidup: `:4173` preview PWA, `:4174` preview. **Jangan start baru.**
- Per tabel: `curl` endpoint Worker + cek 200 + jumlah baris.
- Bukti tulis: `POST`→201, `PATCH`→204, `DELETE`→204 (pola `menus`).

### 3d. Sisa mock non-katalog (opsional, beda ranah)
`mockMerchant`/`mockUser` (identitas, jam, alamat) di MerchantSettings,
CourierProfile, OrderChat, OrderStageScreen, PaymentAmount. `foods.find` di
`MyOrder.tsx:118` (harga). Belum diputuskan mau di-live-kan atau tidak.

## 4. Jebakan yang sudah digigit (jangan ulang)
- **`src/api/ops.ts` sudah ada** (ops tag + platform params). Cek dulu sebelum
  `write`; menimpanya bikin `OpsModeration`/`OpsSettings` error TS2305.
- Worker tak meng-coerce: `is_active` integer → `eq.1` (bukan `eq.true`); kena di
  `menu_categories`.
- Kolom asing di `select` → 400 mematikan seluruh daftar.
- `rtk` lint/tsc rusak di repo ini → selalu `./scripts/verify.sh`.
