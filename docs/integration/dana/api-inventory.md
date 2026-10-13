# Inventaris API DANA — status uji

Semua baris diuji lawan **DANA Sandbox** (`https://api.sandbox.dana.id`) memakai
kredensial merchant Sa7tein, lewat `dana-id/uat-script` (Node) + `dana-node` SDK
resmi tanpa modifikasi. Kolom **Status** = hasil nyata, bukan asumsi.

Legenda: ✅ lolos · ⚠️ sebagian · ⛔ mentok (sebab di `testing.md`)

## Payment Gateway (SNAP)

| Endpoint | Metode | Fungsi | Status |
|---|---|---|---|
| `/payment-gateway/v1.0/debit/payment-host-to-host.htm` | POST | createOrder (VA / QRIS / debit) | ✅ |
| `/v1.0/payment-gateway/consult-pay.htm` | POST | consult pay (daftar opsi bayar) | ✅ |
| `/payment-gateway/v1.0/debit/status.htm` | POST | debit status / query payment | ✅ |
| `/payment-gateway/v1.0/debit/refund.htm` | POST | refund order | ✅ |
| `/payment-gateway/v1.0/debit/cancel.htm` | POST | cancel order | ✅ |
| `/v1.0/debit/notify` (finish notify) | POST | webhook notifikasi transaksi | ✅ |

Hasil: **49/49 test lolos** (`payment_gateway`). Skenario *success* butuh
pembayaran nyata → dijalankan otomatis via `automate-payment.js` (Playwright).

## IPG Cashier Pay / Widget (SNAP)

| Endpoint | Metode | Fungsi | Status |
|---|---|---|---|
| `/rest/redirection/v1.0/debit/payment-host-to-host` | POST | createOrder (widget) | ✅ |
| `/v1.0/debit/notify` | POST | finish notify | ✅ |
| `/rest/v1.1/debit/status` | POST | query order | ⚠️ |
| `/v1.0/debit/refund.htm` | POST | refund | ⚠️ |
| `/v1.0/debit/cancel.htm` | POST | cancel | ⚠️ |
| `/v1.0/access-token/b2b2c.htm` | POST | apply token (OAuth) | ⛔ |
| `/rest/v1.1/qr/apply-ott` | POST | apply OTT | ⛔ |
| `/v1.0/balance-inquiry.htm` | POST | balance inquiry | ⛔ |
| `/v1.0/registration-account-unbinding.htm` | POST | unbind akun | ⛔ |
| `/dana/member/query/queryUserProfile.htm` | POST | profil user | ⛔ |
| *transaction list* | POST | daftar transaksi | ⛔ |
| `/v1.0/get-auth-code` | GET | OAuth authorization code | ⛔ |

Jalur **pembayaran + notifikasi lolos** (itu inti "IPG Cashier Pay"). Blok
`apply-token → apply-ott → balance/transaction` butuh login user sandbox
(OAuth), otomatisnya timeout — lihat `testing.md`.

## Disbursement (SNAP)

| Endpoint | Metode | Fungsi | Status |
|---|---|---|---|
| `/v1.0/emoney/transfer-bank.htm` | POST | kirim ke rekening bank | ⚠️ |
| `/v1.0/emoney/bank-account-inquiry.htm` | POST | inquiry rekening bank | ⚠️ |
| `/rest/v1.0/emoney/topup` | POST | transfer ke DANA (top-up) | ✅ |
| `/rest/v1.0/emoney/account-inquiry` | POST | inquiry akun DANA | ✅ |
| `/rest/v1.0/emoney/topup-status` | POST | status top-up | ✅ |
| `/v1.0/emoney/transfer-bank-status.htm` | POST | status transfer bank | ✅ |
| `/v1.0/debit/notify` | POST | finish notify disbursement | ✅ |

Hasil: **39/47 test lolos**. Kasus positif semua lolos; yang mentok hanya
*error-simulation* bawaan UAT.

## Merchant Management (Open API)

| Endpoint | Metode | Fungsi | Status |
|---|---|---|---|
| `/dana/merchant/shop/queryShop.htm` | POST | data toko | ✅ |
| `/dana/merchant/shop/createShop.htm` | POST | buat toko | belum diuji |
| `/dana/merchant/shop/updateShop.htm` | POST | ubah toko | belum diuji |
| `/dana/merchant/division/queryDivision.htm` | POST | data divisi | ✅ |
| `/dana/merchant/division/createDivision.htm` | POST | buat divisi | belum diuji |
| `/dana/merchant/division/updateDivision.htm` | POST | ubah divisi | belum diuji |
| `/dana/merchant/queryMerchantResource.htm` | POST | resource merchant | belum diuji |
| `/dana/member/merchant/queryMerchantInfo.htm` | POST | info merchant | belum diuji |
| `/dana/member/asset/queryAssetCardList.htm` | POST | daftar kartu | belum diuji |
| `/dana/member/query/queryUserProfile.htm` | POST | profil user | belum diuji |

`queryShop` + `queryDivision` terverifikasi nyata: `resultStatus: S`,
`resultCode: SUCCESS`, dengan `shopIdType`/`parentIdType = EXTERNAL_ID`.

## SNAP Access Token

| Endpoint | Status |
|---|---|
| `/v1.0/access-token/b2b2c.htm` (widget) | ⛔ (butuh OAuth code) |
| token B2B (SNAP murni) | ✅ |

Awalnya semua endpoint SNAP balas `500` (provisioning DANA). Setelah aktif,
endpoint transaksional hidup dan uji otomatis lolos.
