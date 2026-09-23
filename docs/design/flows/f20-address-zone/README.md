# F20 — Address & Zone

Alamat customer dan gate coverage saat checkout: pin peta → zona (haversine ke dapur merchant, **Hijazi / Syimali ≤2 km**) → pilih alamat → gate coverage melawan `merchant.deliveryConfig` → kalau lolos ongkir tampil lalu zona ikut sebagai snapshot order. Dasar bisnis: `C-13` (2 zona Hijazi/Syimali, ≤2 km, per-merchant `is_active_hijazi` / `is_active_syimali`) + `C-05` + `C-07` (ongkir 100% merchant) — lihat `../BUSINESS.md`. Pita radius **A/B/C 600 m / 1,5 km / 2 km + tarif 5.000 / 9.000 / 13.000** adalah model **LEGACY PRD lama** dan **sudah tidak ada di kode** (migrasi selesai 2026-09-23). Repo ini front-end saja — form alamat adalah layar mock (AGENTS.md §1).

| Berkas | Isi |
|---|---|
| `f20-address-zone.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f20-address-zone.html` | Artefak jadi |
| `f20-address-zone.visual-check.*` | Bukti visual-check |

## Bisnis (kenapa flow ini ada)

- **Masalah:** ongkir & area antar harus jelas **sebelum** order dibuat. Merchant hanya melayani **Hijazi** (pemukiman barat) & **Syimali** (utara kampus), **≤2 km haversine dari dapur**, dan hanya jika merchant mengaktifkannya (`C-13`). Ongkir 100% ke merchant (`C-07`) — platform tidak menanggung ongkir.
- **Aktor & nilai:** customer tahu bisa/tidak diantar + ongkir sebelum bayar · merchant atur jangkauan & ongkir sendiri · platform tidak menanggung order gagal antar.
- **Skenario:** alamat di luar 2 km atau zona tidak diaktifkan → checkout diblokir "di luar area antar" → pilih alamat lain / ganti merchant. Lolos → ongkir tampil → order jalan, zona ikut sebagai snapshot.

Kartu bisnis ini juga tampil sebagai **kartu pertama** di dalam diagram (`f20-address-zone.html`) supaya pembaca tidak perlu buka README dulu.

## Alur

**Lane Layar form alamat & peta:** Customer tambah alamat — pasang pin di peta (pin awal `DEFAULT_NEW_ADDRESS_PIN`, peta Leaflet) + label + teks alamat → zona tampil hasil haversine ke dapur merchant (**Hijazi / Syimali, ≤2 km**; di luar jangkauan = tidak ada zona aktif) → simpan `address` (+ `isDefault` bila dipilih) → pilih alamat untuk order, alamat default dipilih otomatis.

**Lane Layar checkout: gate & ongkir:** Checkout menjalankan gate coverage — jarak merchant ↔ alamat dibandingkan `merchant.deliveryConfig` (mode `radius`: `radiusMeters`; mode `area`: zona harus aktif untuk merchant itu) → PASS: ongkir tampil (`feeByDistance` per tier jarak ATAU `feeByArea` per zona) → lanjut ke order, zona ikut sebagai snapshot.

**Lane Guard tampilan, zona & fallback:** FAIL coverage → pesan "di luar area antar" → customer ditawari pilih alamat lain atau ganti merchant; apakah alamat non-deliverable boleh disimpan — UNRESOLVED. Kalau alamat default ganti, zona dihitung ulang, tetapi order lama TIDAK ikut berubah (snapshot). Kalau pin belum ditemukan atau peta gagal load → retry muat ulang, form tidak di-submit tanpa pin.

## Aturan keras (jangan dilupakan)

- Zona aktif = **Hijazi / Syimali, ≤2 km** (`C-13`), per-merchant `is_active_hijazi` / `is_active_syimali`; di luar itu tidak ada zona aktif.
- Gate coverage memakai `merchant.deliveryConfig` per merchant (radius ATAU area) — di repo ini hanya tampilan mock, bukan perhitungan yang dijalankan (AGENTS.md §1).
- Ongkir dan zona dihitung di luar repo (server-side); layar hanya menampilkan angka mock — jangan hitung sendiri di JSX. `Address.zone` adalah snapshot hasil server (`null` = di luar coverage).
- Zona ikut sebagai snapshot saat order dibuat: mengganti alamat default tidak mengubah order lama.
- FAIL coverage → pesan "di luar area antar" dengan pilihan alamat lain / ganti merchant.
- **Migrasi selesai 2026-09-23:** `DELIVERY_ZONES` di `src/data/merchant.ts` kini berisi Hijazi/Syimali (bukan A/B/C). Pita radius + tarif 5.000/9.000/13.000 = **LEGACY PRD lama** dan tidak boleh dikembalikan. Nominal ongkir final tetap `UNRESOLVED` — angka di kode hanya placeholder.
- Submit form alamat butuh pin valid — pin kosong / peta gagal = retry, jangan lanjut.
- Frontend saja di repo ini: gate dan fee adalah tampilan mock (AGENTS.md §1).

## Terhubung (lihat ../INDEX.json)

`f1-order-lifecycle` → node `checkout` (gate coverage di sini; `fee_computed` → `f4-fee-tax`); `f4-fee-tax` → komposisi tagihan checkout, `deliveryFee` jadi salah satu basis; `f15-super-admin` → master zona (PRD AGENTS.md §9, belum ada di repo — akan datang, zona aktif menggantung ke sini); `f16-merchant-onboarding` → `merchant.deliveryConfig` (radius/fee ATAU area/fee) diset saat onboarding merchant; `f20-address-zone` → feeds snapshot `order.zone` untuk order lifecycle dan verifikasi fee.

## Sumber (jangan dikarang)

- **Bisnis (dasar utama):** `C-13` — 2 zona **Hijazi / Syimali**, ≤2 km haversine dari dapur merchant, per-merchant `is_active_hijazi` / `is_active_syimali`; `C-05` (zona konsisten dengan baseline); `C-07` (ongkir 100% merchant). Lihat `../BUSINESS.md` dan `../versions`-PRD `docs/product/prd/versions/irbid-mvp-v2-2026-09-21/analysis.md`
- `docs/product/schema-draft-v1.md` — entri 2 (`address`: `label`, `address`, `latitude`, `longitude`, `isDefault`, `zone`) + entri 4 (`merchant.deliveryConfig`: `mode: 'radius'|'area'`, `radiusMeters?`, `feeByDistance?`, `feeByArea?`) — **rancangan data**, bukan aturan bisnis
- Kode `src/data/merchant.ts` — `DELIVERY_ZONES` (Hijazi/Syimali), `merchantDeliveryConfig` (`mode`, `maxKm`, `isActiveHijazi/Syimali`, `ongkirIdr`), `MAX_DELIVERY_METERS`, `DEFAULT_NEW_ADDRESS_PIN`, `zoneFor()`, `zoneLabel()`, `haversineMeters()`, `deliveryFeeFor()`, `isDeliverable()`
- `R-ADDR-01` — diturunkan dari `C-13`/`C-05`/`C-07` (sebelumnya ditulis "synthetic dari schema draft"; dikoreksi 2026-09-22)
- **UNRESOLVED (jangan ditebak):** angka final `radiusMeters` & tier `feeByDistance` · apakah master zona jadi tugas Super Admin di `f15` · apakah alamat di luar coverage boleh tetap disimpan · fallback kalau haversine = 0 (pin sama persis dengan lokasi merchant)

## Update

```bash
./scripts/flows-gate.sh f20-address-zone   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark), overflow 0.

Terakhir diperbarui: 2026-09-23 — **migrasi kode selesai**: `DELIVERY_ZONES` kini Hijazi/Syimali, `Address.zone` snapshot server, ongkir lewat `merchantDeliveryConfig` (angka placeholder, `UNRESOLVED`). Sebelumnya 2026-09-22: kartu bisnis di dalam diagram; zona Hijazi/Syimali ≤2 km (`C-13`), A/B/C disebut legacy.
