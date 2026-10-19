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

**Tulis balik (A, 2026-10-19):** izin Worker dibuktikan dulu — `PATCH
dispute_rules` 204, `POST punishments` 201, `DELETE` 204 (baris probe dihapus).

| Aksi FE | Tulis BE |
|---|---|
| Nonaktifkan/aktifkan rule (`/ops/rules`) | `PATCH dispute_rules?code=eq.<code>` `{active}` |
| Terbitkan SP (`/ops/penalties`) | `POST punishments` — nama diketik bebas, diresolusi ke `subject_id` (couriers/merchants/customers); tak ketemu → entri lokal + toast |
| Cabut SP | `PATCH punishments?id=eq.<n>` `{status:'revoked'}` — baris tidak dihapus (riwayat tetap) |

**Skema D1 disamakan (2026-10-19).** Migrasi Supabase
(`supabase/migrations/2026-10-17-ops-sa-columns.sql`) sudah punya `status`,
`subject_name`, `form`, `level_label`, tapi D1 belum. Ditambahkan additive
(`ALTER TABLE punishments ADD COLUMN …`, default `status = 'issued'`), lalu
dibuktikan: `POST` 201 menyimpan keempat kolom, `PATCH` 204 mengubah
`status → revoked`, baris probe `DELETE` 204 (sisa satu baris asli).
`fetchPenalties` membaca kolom itu (join nama tetap cadangan baris lama),
`POST` menyimpan bentuk/tingkat bebas-ketik, tombol Cabut menulis balik.

**Verifikasi live commit lama (B, 2026-10-19)** — sesi `cs@`, semua HTTP 200:

| Tabel | Baris | Commit |
|---|---|---|
| `menus` | 30 | `15155bf` |
| `menu_categories` | 3 | `bcacaee` |
| `checkpoints` | 20 | `c358a99` |
| `chat_participants` | 28 | `c358a99` |
| `deposits` | 18 | `c358a99` |
| `exchange_rates` | 1 (rate 23000) | `f704a27` |

Bukti UI (`/ops/rules`, `/ops/penalties`): baris `DR-LATE`… dan `Budi Santoso`
(join nama) ter-render dari BE, bukan mock.

Mapper murni dipindah ke `src/data/beMapping.ts`; self-check `npm run
check:be-mappers` (baris contoh dari D1 nyata). Wiring: `useApiOps` dipanggil
dari `ApiSync` (`App.tsx`).

### 3c. Verifikasi (wajib, angka bukan kesan)
- `./scripts/verify.sh` (lint+build) · `npm run scan` (0 FAIL)
- Gate: `node scripts/browser-gate.mjs --route <rute> --strict --click` di dev
  server repo ini (`:5173`). Preview `:4173`/`:4174` milik salinan lain (404) —
  **jangan dipakai, jangan start server baru.**
- Per tabel: `curl` endpoint Worker + cek 200 + jumlah baris.
- Bukti tulis: `POST`→201, `PATCH`→204, `DELETE`→204.

### 3d. Keputusan sisa tabel + mock non-katalog (C, 2026-10-19)
- **`product_attributes`/`product_attribute_values`** — tetap ditunda:
  `menu_attribute_lines` kosong dan `menu_variants.options` beda model. Dibuka
  saat BE punya ikatan atribut→menu yang bisa dipetakan.
- **`wallet_ledgers`** — tetap ditunda: 1 baris, `direction`/`ref_type`/`ref_id`
  NULL. Dibuka saat `direction` terisi → tampilkan sebagai riwayat saldo
  (`PayoutEntry`) di dompet merchant.
- **`courier_types`** — tetap ditunda: FE memodelkan jenis kurir sebagai tipe
  terpisah (`Courier` = inhouse, `CourierPartner` = partner), bukan field;
  `courier_types` cuma label. Kontrak `couriers.courier_type` sudah dipakai di
  `api/dispatch.ts`. Label keras ("Kurir inhouse") tidak diganti lookup — tak
  menambah nilai.
- **Mock identitas** (`mockMerchant`/`mockUser` di MerchantSettings,
  CourierProfile, OrderChat, OrderStageScreen, PaymentAmount) — **dibiarkan**:
  itu pola *mock-first* repo ini (fallback saat BE belum menghidrasi), bukan
  kebocoran.
- **`foods.find` di MyOrder** — **diperbaiki**: "Pesan lagi" mencocokkan ke
  katalog live (`useAllMenuItems`/`useStorefronts`, fallback `menuSeed`), bukan
  mock statis; harga tetap harga sekarang.

## 4. Jebakan yang sudah digigit (jangan ulang)
- **`src/api/ops.ts` sudah ada** (ops tag + platform params). Cek dulu sebelum
  `write`; menimpanya bikin `OpsModeration`/`OpsSettings` error TS2305.
- Worker tak meng-coerce: `is_active` integer → `eq.1` (bukan `eq.true`); kena di
  `menu_categories`.
- Kolom asing di `select` → 400 mematikan seluruh daftar.
- **`zones.polygon` (D1) = TEXT berisi JSON, bukan array.** `fetchZones` dulu
  `.map()` langsung ke string → reject → zona tetap mock Jakarta → semua alamat
  BE (Irbid) tampak "di luar area antar". Di-parse dulu (`polygonVertices`).
  Pelajaran: kolom JSON di D1 selalu datang sebagai string.
- `rtk` lint/tsc rusak di repo ini → selalu `./scripts/verify.sh`.
