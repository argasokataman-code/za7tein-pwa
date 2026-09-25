# F16 — Merchant Onboarding

Onboarding merchant: registrasi toko → approval Super Admin → deposit 3,50 JOD → kredit Founding 5 JOD → aktif → onboarding kurir. Layar ada di repo: `/merchant/signup`, `/merchant/onboarding` (form profil toko, langkah `profil`), `/merchant/pending`. Dasar bisnis: PRD aktif §5C (deposit COD) + §Insentif Founding Merchant (`docs/product/prd/versions/irbid-mvp-v2-2026-09-21/source.md:145-193`) + `I-1`/`I-2` + `C-12`; lihat `../BUSINESS.md`. Repo ini front-end saja (AGENTS.md §1).

| Berkas | Isi |
|---|---|
| `f16-merchant-onboarding.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f16-merchant-onboarding.html` | Artefak jadi |
| `f16-merchant-onboarding.visual-check.*` | Bukti visual-check |

## Alur

**Lane Layar merchant (signup · form toko · kurir):** Signup merchant (email + password lewat `merchantSignInSchema`/`merchantSignUpSchema` di `src/lib/schemas.ts`, nomor HP opsional) → user dibuat `type: merchant` → **form profil toko** (`/merchant/onboarding`, terpasang: identitas toko + foto D1 + `deliveryConfig`: mode radius/area, `maxKm`, zona aktif, ongkir) → submit → `/merchant/pending`. Setelah aktif: layar toko aktif (buka/tutup) dan onboarding kurir.

**Lane Status & aksi onboarding (submit · review · deposit):** Submit onboarding → status tampil `merchant.tenantStatus: pending` → antrean SA (event `tenant_submitted`, masuk `f15-super-admin:queue`) → layar review SA approve/reject → deposit 3,50 JOD (§5C): instruksi bayar → transfer merchant → verifikasi SA → `depositStatus: held` → `tenantStatus: approved` → **kredit Founding 5 JOD** masuk (non-withdrawal, ≈33 order pertama, akun `merchant_credit`) → toko aktif.

**Lane Guard tampilan:** reject onboarding (`tenantStatus: suspended` + alasan), deposit gagal/telat (reminder → suspend), blacklist menyusul (SA bisa set `tenantStatus: blacklisted` kapan pun → feeds `f15-super-admin:deposit|blacklist`).

## Aturan keras (jangan dilupakan)

- Jangan aktifkan toko sebelum `tenantStatus: approved`, dan `approved` hanya boleh terjadi setelah `depositStatus: held` — urutan submit → review → deposit verifikasi wajib berurutan.
- **Deposit 3,50 JOD dan kredit Founding 5 JOD adalah dua hal terpisah** (I-2 RESOLVED, PO 2026-09-22): deposit = jaminan COD yang disetor merchant; kredit = insentif promo non-withdrawal yang **diberikan** platform, hanya bisa memotong fee merchant 0,15 JOD. Kredit bukan pengganti maupun tambahan deposit.
- Kredit Founding habis setelah ≈33 order pertama (5 ÷ 0,15 = 33,3); setelah itu fee merchant normal kembali. Fee **customer tetap 0,22 JOD** selama promo (I-1 RESOLVED — angka 0,20 JOD tidak berlaku).
- Cashback tiered (Tier 1: 500 order → 15 JOD · Tier 2: 1.000 → 40 JOD · Tier 3: 1.250+ → 62,5 JOD per bulan) dibayar akhir bulan ke dompet deposit merchant — **belum ditampilkan di layar onboarding**, lihat `f9-incentive`.
- Onboarding kurir: kurir adalah karyawan merchant setelah toko aktif — direkrut lewat merchant (`MAX_COURIERS_PER_MERCHANT` = 3, `src/data/merchant.ts`; form "Tambah kurir" di `/merchant/couriers`), SA/merchant assign `courier.merchant = merchant.id`. **Keputusan PO 2026-09-25:** kurir juga punya layar onboarding sendiri (`/courier/onboarding`, profil + kendaraan) sebelum masuk lewat `/courier/signin` — menyimpang dari kalimat lama "rekrut off-app, tanpa layar onboarding"; rekrutmen tetap milik merchant.
- `tenantStatus: blacklisted` bukan bagian alur registrasi — dipakai SA kapan pun setelah aktif, dan hanya SA yang boleh mengubahnya.
- Signup merchant rate-limited dan deposit wajib lolos verifikasi anti-fake (mekanisme verifikasi masih UNRESOLVED di bawah).
- Frontend saja di repo ini: state `pending/suspended/held` adalah state yang ditampilkan, bukan alur backend yang sudah jalan (AGENTS.md §1); rate limit signup & anti-fake deposit tidak diimplementasi di sini.

## Terhubung (lihat `../INDEX.json`)

`f15-super-admin` → feeds `f15-super-admin:queue` (event `tenant_submitted` dari submit) dan `f15-super-admin:deposit` (event `deposit_held` setelah verifikasi); `f13-courier-view` → feeds courier assigned (`courier.merchant = merchant.id`); `f12-merchant-console` → layar toko setelah aktif (buka/tutup, daftar kurir); `f2-cod-hold` → menerima `tenantStatus: blacklisted` dari guard blacklist.

## Sumber (jangan dikarang)

- **Bisnis (dasar utama):** PRD aktif `docs/product/prd/versions/irbid-mvp-v2-2026-09-21/source.md` — §5C deposit COD merchant **3,50 JOD**; §"Insentif Founding Merchant" (baris 145–193) kredit **5 JOD non-withdrawal** (≈33 order pertama, akun `merchant_credit`) + cashback tiered 15/40/62,5 JOD; `I-1` fee customer tetap **0,22 JOD**; `I-2` kredit **terpisah** dari deposit; `C-12` (portal CS merangkap Super Admin)
- `docs/product/schema-draft-v1.md` — entri 4 (`merchant.tenantStatus`, `depositStatus`, profil merchant, `deliveryConfig`) — **rancangan data**, hanya untuk nama field
- `src/lib/schemas.ts` (`merchantSignInSchema`, `merchantSignUpSchema`); `src/data/merchant.ts` (`MAX_COURIERS_PER_MERCHANT`); `src/App.tsx` route `/merchant/signup`
- `f15-super-admin` — sisi approval: queue `tenantStatus: pending`, deposit `unpaid → held`, blacklist `tenantStatus: blacklisted`; `f9-incentive` — kredit + cashback detail
- **UNRESOLVED (jangan ditebak):** AUTH-1 — diputuskan (PO 2026-09-22): Google + nomor WA Level 1, tanpa OTP · mekanisme verifikasi deposit (cek mutasi bank manual? upload bukti transfer?) · dokumen legal merchant (NPWP/ID — ada di PRD?) · jadwal review SLA onboarding · I-3 cashback withdrawable? · I-4 periode tier · I-5 kuota Founding · I-6 sisa modal saat merchant berhenti

## Update

```bash
./scripts/flows-gate.sh f16-merchant-onboarding   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-25 — PO 2026-09-25: onboarding tiap peran. Form profil toko merchant kini terpasang di `/merchant/onboarding` (signup → profil → `/pending`), dan kurir punya layar onboarding sendiri (`/courier/onboarding`) — menyimpang dari "rekrut off-app" (lihat `decision-irbid-mvp.md`). Sebelumnya (2026-09-22): AUTH-1 dikoreksi: verifikasi nomor = Level 1 (validasi format + E.164, tanpa OTP WA) sesuai `source.md:728-731`; label `synthetic` diganti dasar PRD §5C + §Insentif Founding + I-1/I-2 + `C-12` (kredit Founding 5 JOD + cashback tiered). Validate 9/9 pass, deliver exit 0 (spec `35608cf5`, artifact `2b179484`), visual-check pass (1440x900, 2048x1320 light + dark, overflow 0).
