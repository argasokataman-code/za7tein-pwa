# Testing DANA — cara jalan, hasil, blocker

## 1. Cara menjalankan

Suite resmi: `dana-id/uat-script` (Node) di `~/Downloads/dana-uat`.

```bash
cd ~/Downloads/dana-uat/test/node
npx playwright install chromium          # sekali; dipakai bayar otomatis

npx jest --config jest.config.js payment_gateway --runInBand
npx jest --config jest.config.js disbursement   --runInBand
npx jest --config jest.config.js widget         --runInBand
```

`.env` (bukan di repo Sa7tein) berisi: `MERCHANT_ID`, `X_PARTNER_ID`,
`PRIVATE_KEY`, `ORIGIN`, `CLIENT_SECRET`, `DANA_PUBLIC_KEY_PATH`,
`REDIRECT_URL_OAUTH`, `EXTERNAL_SHOP_ID`. Rincian di
`credentials-and-signing.md`.

> **Peringatan.** Skenario DANA ditambah otomatis setelah sebuah API "disentuh".
> Menjalankan satu file test untuk API *additional* ikut meng-opt-in seluruh
> skenario API itu. Jangan jalankan file test tambahan tanpa niat menuntaskannya.
> (Kejadian: menjalankan semua file `widget/*` menaikkan IPG Cashier Pay dari
> "All completed" → 36/50.)

## 2. Hasil uji terakhir

| Modul | Lolos | Total | Catatan |
|---|---|---|---|
| Payment Gateway | 49 | 49 | ✅ semua |
| Disbursement | 39 | 47 | 7 gagal + 1 skip — semua *error-simulation* |
| Widget — payment + finish notify | 13 | 15 | inti IPG Cashier Pay ✅ |
| Widget — binding (token/OTT/balance/transaction) | — | — | ⛔ butuh OAuth |

## 3. Integration Checklist (portal → Integration Checklist)

Snapshot: **106 / 125 skenario**.

| Produk | Status |
|---|---|
| Disburse to Balance | **All completed** |
| Payment Gateway | **All completed** |
| IPG Cashier Pay | 36 / 50 |
| Disburse to Bank | 13 / 18 |
| QRIS | 0 / 0 — **manual** |

## 4. Blocker & langkah berikut

### a. QRIS — manual
Portal: *"Testing for this product is currently being conducted manually.
Please contact our merchant services team."* Tidak ada jalur UAT otomatis.
→ **Hubungi DANA Merchant Services** untuk panduan testing QRIS.

### b. Disburse to Bank — 5 skenario error-simulation
Fixture bawaan UAT (`Disbursement.json`) memakai akun simulasi error yang
**tidak lagi memicu error** di sandbox sekarang; amount-nya juga di bawah minimum.

| Skenario | Akun | Diharapkan | Aktual |
|---|---|---|---|
| DisbursementBankUnknownError | 8551008794 | `5004301` | `2004300 Success` (50000) / `4034302 amount less than minimum limit` (100) |
| DisbursementBankGeneralError | 8121111111 | `5004300` | `2004300 Success` |
| DisbursementBankInactiveAccount | 81398055100 | `4034318` | `2004300 Success` |
| DisbursementBankSuspectedFraud | 82298055100 | `4034303` | `2004300 Success` |
| InquiryBankAccountInactive/InvalidMerchant/InvalidCard | 81298055132 / 855100800 / 815919191 | `4034218` / `4044208` / `4044211` | `4034204 Activity Count Limit Exceeded` |

→ Minta DANA konfirmasi akun/amount test yang berlaku, atau pastikan skenario
ini memang tidak bisa disimulasikan lagi.

### c. Widget binding — OAuth
`apply-token → apply-ott → balance-inquiry / transaction-list` butuh
*authorization code* dari `https://m.sandbox.dana.id/v1.0/get-auth-code`.
`automate-oauth.js` timeout: perlu login user DANA sandbox
(`083811223355`), yang belum ter-provision untuk otomasi.
→ Daftarkan akun test di portal Sandbox → **Sandbox Tools → Register DANA
Account**, atau minta OTT test dari DANA.

## 5. Ringkasan permintaan ke DANA Merchant Services

1. Panduan testing **QRIS** (manual).
2. Akun/amount yang benar untuk 5 skenario **Disburse to Bank** error-simulation.
3. Akun test + cara OAuth untuk **Widget binding** (IPG Cashier Pay), atau
   konfirmasi skenario itu opsional.
4. Setelah tuntas → **request production credentials**.
