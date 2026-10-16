# R-DISPUTE-RULE — Rule dispute berbasis katalog (§18)

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §18 (+ flow `f8-dispute`) · milestone **M9**.
Status: partial · terakhir ditinjau: 2026-10-17.

## 1. Untuk apa

PRD memisahkan **model** rule dari **isinya**: "Rule (mitigasi, kompensasi, punishment) dibuat dan dikelola ops; PRD ini mendefinisikan modelnya, bukan isinya." Artinya yang bisa dikerjakan di repo ini adalah **mesinnya** — katalog, pilihan toko, dan penentu rule mana yang berlaku pada satu order. Kalimat pembukanya juga mengikat tiga peran jadi satu: "Merchant memilih rule yang diikutinya, dan customer serta kurir pada order merchant itu mengikuti rule yang sama."

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| R1 | Isi rule di-setup aplikator (ops) lewat aplikasi internal; PRD mendefinisikan **model**, bukan isinya | §18 |
| R2 | Rule memuat: kode & nama, kategori insiden, kondisi pemicu, pihak bertanggung jawab, langkah mitigasi, status aktif, **versi** | §18 (tabel entitas) |
| R3 | **Kompensasi bagian dari rule**: penerima (customer/merchant/kurir), bentuk, formula nilai | §18 |
| R4 | **Punishment bagian dari rule**: subjek (merchant/kurir/customer), bentuk, tingkat atau formula | §18 |
| R5 | Merchant memilih rule yang diikuti lewat **multi-select**, dengan tanggal mulai berlaku | §18 |
| R6 | **Customer dan kurir mengikuti rule pilihan merchant** pada order terkait | §18 |
| R7 | Partisipasi merchant dalam penyelesaian dispute **opsional**; customer dan kurir berpartisipasi | §18 |
| R8 | Insiden/dispute memuat: order, pelapor, kategori, deskripsi, **bukti gambar di R2**, status, rule yang diterapkan, keputusan, pemutus | §18 |
| R9 | **SP kurir partner = salah satu bentuk punishment** (tercatat di modul yang sama) | §18 (Usulan) |
| R10 | **Usulan**: rule yang dipilih merchant di-snapshot ke order saat order dibuat, supaya perubahan pilihan tidak mengubah ketentuan order yang berjalan | §18 (Usulan) |
| R11 | Eksekusi = catatan kompensasi/punishment yang dijalankan + referensi ke ledger | §18 (tabel entitas) |

## 3. Acceptance (cara ukur)

| AC | Perilaku | Cara ukur | Status |
|---|---|---|---|
| AC1 | Model rule/kompensasi/punishment/pilihan merchant sesuai entitas §18 | tipe `DisputeRule`, `Compensation`, `Punishment`, `MerchantRuleSelection` di `src/types.ts`; katalog `src/data/rules.ts` | ✅ |
| AC2 | Merchant memilih rule lewat multi-select | seksi "Rule sengketa" di `/merchant/settings` (chip + `aria-pressed`, `data-rule-id`), slice `rules` (persist) | ✅ |
| AC3 | Rule yang berlaku pada satu order = pilihan merchant; customer & kurir ikut | `ruleForOrder(selection, categoryId)`; assert: kategori terpilih → `source: 'merchant'`, kategori tak terpilih → `unresolved` | ✅ mesin; permukaan insiden belum |
| AC4 | SP kurir partner tercatat sebagai bentuk punishment | `RULE_PUNISHMENTS` (`rule-noshow` → subjek `courier`, bentuk "Surat peringatan (SP)") | ✅ |
| AC5 | Snapshot rule ke order | `snapshotRule()` membekukan `ruleId`/`code`/`version`/`mitigasi` + penanda `usulan: true` | ⚠️ bentuk usulan; BE belum menyimpan |
| AC6 | Insiden punya bukti gambar (R2) | tipe `Incident.photoCount`/`photos`; belum ada layar insiden maupun unggahan R2 | ⚠️ ditahan BE (R2) |
| AC7 | Katalog tidak menunjuk id yang tidak ada | self-check menolak rule → kategori asing, kompensasi/punishment → rule asing, insiden → rule asing | ✅ |

## 4. State & layar

- Katalog: `src/data/rules.ts` — 5 kategori insiden, 7 rule, 5 kompensasi, 4 punishment, seed pilihan toko demo, satu insiden demo.
- Pilihan toko: `/merchant/settings` seksi "Rule sengketa" (multi-select + konsekuensi tiap rule terpilih). Slice `src/store/slices/rulesSlice.ts` (`toggleRule`, ikut persist) — bukan state layar, karena pilihan ini dipakai untuk menentukan rule pada order, termasuk bagi customer dan kurir.
- Mesin resolusi: `rulesForCategory` (katalog per kategori), `rulesForMerchant` (yang diikuti toko; id asing dibuang), `ruleForOrder` (rule berlaku untuk satu order), `compensationForRule`/`punishmentForRule`, `snapshotRule`, `unknownRuleIds`.
- Daftar insiden: `MOCK_INCIDENTS` (satu contoh) — layarnya belum ada, lihat §6.

## 5. Data & kontrak BE

- Kategori insiden, rule, kompensasi, punishment, pilihan merchant, insiden, dan eksekusi ada di `src/types.ts` sejak M0; yang baru di sini adalah **katalog + mesinnya**.
- Tanggal mulai berlaku dipakai: order sebelum `effectiveFrom` **tidak** memakai pilihan baru. Karena belum ada riwayat pilihan, kondisi itu mengembalikan `unresolved`, bukan versi lama yang dikarang.
- Snapshot: BE belum menyimpan rule ke order. `snapshotRule()` ada sebagai bentuk yang disepakati, ditandai `usulan: true`.
- SP: di FE masih counter di `CourierPartner.warningLetters`; §18 meminta SP dimodelkan sebagai punishment (sudah ada di katalog). Menyatukan keduanya butuh jalur BE.

## 6. Yang belum (blocked)

- **Panel ops pembuat rule (AC1/AC2 sisi ops)** — ada di M10 (`R-OPS`); katalog di `src/data/rules.ts` adalah seed yang berdiri di tempatnya.
- **Layar insiden + bukti gambar (AC6)** — unggahan R2 belum ada di BE. `Incident` sudah punya `photoCount`/`photos`, jadi yang kurang jalurnya, bukan bentuk datanya.
- **Penerapan rule ke order yang berjalan (AC5)** — perlu kolom snapshot di BE; FE tak bisa memalsukannya tanpa menipu laporan.
- **Eksekusi kompensasi/punishment ke ledger** — `Eksekusi` (§18) belum punya tabel; ledger FE (`admin` slice) belum menerima entry dari rule.

## 7. UNRESOLVED

- **OPEN-17** — dispute diputus otomatis berdasarkan rule atau manual oleh ops: belum diputuskan, jadi mesin ini menghitung rule **berlaku**, bukan memutuskan siapa bersalah.
- **OPEN-18** — apakah ada **rule dasar wajib** bila merchant tidak memilih rule sama sekali. Karena itu `ruleForOrder()` mengembalikan `source: 'unresolved'` (dengan penanda `open: 'OPEN-18'`) dan **tidak** mengarang rule dasar.
- **OPEN-19** — batas waktu mengajukan dispute dan boleh-tidaknya ops membaca chat order sebagai bukti.
- **OPEN-08** — eksekusi kompensasi/denda setelah payout terjadi.

## 8. Bukti

- `src/data/rules.ts` + self-check `node --import ./scripts/lib/ts-resolve.mjs scripts/rule-check.mjs`: katalog utuh (tiap rule → kategori ada, tiap bagian → rule ada, insiden → rule ada), id asing dibuang dari pilihan toko, pilihan merchant menang pada kategori yang dipilih, `unresolved` + `open: 'OPEN-18'` pada kategori yang belum dipilih, order sebelum `effectiveFrom` tidak memakai pilihan baru, SP ada sebagai punishment `rule-noshow`, snapshot membawa versi.
- `src/store/slices/rulesSlice.ts` (`toggleRule`) + registri `src/store/index.ts` (combineReducers + whitelist persist); `src/data/marketplace.ts` tidak lagi menyimpan seed insiden/pilihan rule yang id-nya menggantung (`rule-late-1`, `cat-late`).
- `src/pages/MerchantSettings.tsx` seksi "Rule sengketa" (memakai kelas `.merchant-card`/`.merchant-chip-row` yang sudah ada — tanpa CSS baru).
- Diukur di Chromium (PWA merchant `:9361`): 7 chip, 3 terpilih awal; klik nyata pada chip "Kemasan rusak saat tiba" (44px) menambah `DAMAGE-COU-01 · Kemasan rusak atau tumpah` beserta mitigasi/kompensasi/punishment; setelah reload masih 4 terpilih (persist); shell 430px, overflow-x 0. Gate `/merchant/settings --pwa --strict --click` 2/2 PASS.
