# Kontrak FE ↔ BE — pembayaran & disbursement DANA

Dokumen ini adalah **delta DANA** di atas `docs/design/flows/API-SPEC.md`. Sumber kebenaran
kontrak tetap `openapi.yaml`; yang di sini hanya bagian yang berubah/bertambah karena provider
berganti ke DANA (keputusan PO 2026-10-13, `docs/product/prd/decision-irbid-mvp.md`).

Nama field DANA di bawah **diambil dari fixture UAT resmi** (`dana-uat/resource/request/components/
{PaymentGateway,IPG,Disbursement}.json`), bukan karangan. Yang belum pasti ditandai **UNRESOLVED**.

| | |
|---|---|
| Produk DANA | Payment Gateway (SNAP) · IPG Cashier Pay/Widget · Disbursement · Merchant Management |
| Status uji | `api-inventory.md` (Payment Gateway 49/49; Disbursement kasus positif lolos) |
| Tanda tangan & env | `credentials-and-signing.md` |
| Pengganti | `API-SPEC.md` §16.6 (kini DANA) · G11 (`POST /webhooks/dana`) |

---

## 1. Pembagian tanggung jawab

| Siapa | Punya |
|---|---|
| **DANA** | halaman cashier untuk saldo DANA & jalur redirect; settlement; pengiriman dana ke bank/DANA tujuan |
| **BE** | private key + tanda tangan SNAP, token B2B, `createOrder`, simpan `partnerReferenceNo`, terima & verifikasi webhook, state machine order, refund/cancel, Disbursement, payout merchant/kurir |
| **FE (repo ini)** | pilih metode, render VA/QR (atau redirect/WebView), poll status, tampilkan state. **Tidak** menyimpan kredensial, **tidak** menandatangani apa pun |

Batas repo: DANA **tidak** menambah lapisan API di sini (AGENTS §1). FE hanya memanggil gateway BE.

---

## 2. Endpoint BE yang harus ada

Gaya target gateway (`api.sa7tein.app`, lihat `API-SPEC.md` §0). Auth = JWT per peran; `CS`/`SA`
untuk refund & payout.

| # | Endpoint BE | Dipanggil oleh | Memanggil DANA | Balik ke FE |
|---|---|---|---|---|
| B1 | `POST /orders/{id}/payments` | customer checkout | `POST /payment-gateway/v1.0/debit/payment-host-to-host.htm` (createOrder) | `{method, paymentCode?, redirectUrl?, expiresAt, referenceNo}` |
| B2 | `GET /orders/{id}` | FE poll / Realtime | `POST /payment-gateway/v1.0/debit/status.htm` (status) | `{paymentStatus, paidAt, method}` |
| B3 | `POST /orders/{id}/cancel` | customer/CS | `POST /payment-gateway/v1.0/debit/cancel.htm` | `{paymentStatus:'cancelled'}` |
| B4 | `POST /orders/{id}/refund` | CS/SA | `POST /payment-gateway/v1.0/debit/refund.htm` | `{refundStatus}` |
| B5 | `POST /wallet/topups` | customer top-up | `POST .../payment-host-to-host.htm` (QRIS/VA) | sama seperti B1 |
| B6 | `POST /wallet/cashouts` | merchant/kurir cash-out | `POST /v1.0/emoney/transfer-bank.htm` (Disbursement) | `{payoutStatus}` |
| B7 | `POST /webhooks/dana` | **DANA → BE** (internal) | — | 200 saja |

B7 (`POST /webhooks/dana`) adalah titik konfirmasi pembayaran. B2/B3/B4 menggantikan polling
`GET status` (`API-SPEC.md` §612).

---

## 3. Bentuk data (field nyata DANA)

**createOrder — permintaan (BE → DANA).** `partnerReferenceNo` = idempotency key, dibuat BE
(1 per percobaan, bukan per retry). `subMerchantId` hanya terisi untuk **model B** (§6).

```jsonc
{
  "partnerReferenceNo": "<uuid BE>",
  "merchantId": "<MERCHANT_ID>",
  "subMerchantId": "",            // model B; lihat §6
  "amount": { "value": "28000.00", "currency": "IDR" },
  "urlParams": [                  // jalur redirect; jenis di bawah
    { "url": "https://app.sa7tein.app/order/paid", "type": "PAY_RETURN", "isDeeplink": "Y" }
  ],
  "validUpTo": "2026-10-13T01:00:00+07:00",
  "additionalInfo": { "order": { "orderTitle": "Pesanan Sa7tein" }, "envInfo": { "orderTerminalType": "WEB" } }
}
```

**createOrder — balasan (DANA → BE → FE).** Nama field terverifikasi di fixture:

| Field | Isi | Untuk FE |
|---|---|---|
| `referenceNo` | referensi DANA | simpan; dipakai saat refund/status |
| `partnerReferenceNo` | referensi BE | kunci idempotensi, dipakai di webhook |
| `paymentCode` | VA number / payload QRIS | → layar VA / render QR |
| `url` | URL halaman DANA (jalur redirect/cashier) | → `window.location` / WebView |
| `validUpTo` | batas bayar | → countdown |
| `latestTransactionStatus` / `transactionStatusDesc` | status mentah | → dipetakan ke state FE (§5) |

**Disbursement (B6).** Permintaan: `partnerReferenceNo`, `beneficiaryBankCode`, `amount.value`,
`amount.currency`, `serviceCode`. Status: `POST /v1.0/emoney/topup-status.htm` /
`transfer-bank-status.htm` dengan `originalPartnerReferenceNo`; balasan `latestTransactionStatus`
(`00` = sukses) + `transactionStatusDesc`.

---

## 4. Webhook DANA (B7) — yang paling gampang salah

- DANA mengirim `finish-notify` (`/v1.0/debit/notify`) ke satu URL BE. **BE wajib verifikasi tanda
  tangan** pakai DANA public key (langkah di `credentials-and-signing.md`), bukan percaya body.
- **Idempotensi:** kunci = `originalPartnerReferenceNo` + `originalReferenceNo`. Webhook boleh datang
  berkali-kali; proses ke-2 dan seterusnya harus **no-op** (bukan menandai bayar dua kali).
- **Balas 200 cepat**, proses di belakang (job). DANA akan retry kalau BE lambat/gagal.
- Setelah webhook valid: `orders.payment_status = paid`, `paid_at`, tulis `wallet_ledgers`
  (double-entry), lalu picu Disbursement sesuai model settlement (§6).
- **Fallback:** kalau webhook tak pernah datang → B2 (status inquiry) dipakai cron/reconciliation.
  Interval **UNRESOLVED**.

---

## 5. State yang ditampilkan FE

FE tidak pernah menampilkan status mentah DANA. Pemetaan:

| State FE | Dari DANA / BE | Layar |
|---|---|---|
| `menunggu` | `payment_status = pending` + `validUpTo` | VA / QR + countdown |
| `dibayar` | `paid` (dari webhook B7) | OrderStageScreen |
| `kedaluwarsa` | `expired` (lewat `validUpTo`) | VA/QR + tombol "coba lagi" |
| `gagal` | `failed` | pesan + metode lain |
| `dikembalikan` | `refunded` (B4) | riwayat |

`orders.payment_method` saat ini `cod | transfer | xendit_va | xendit_qris` (`API-SPEC.md` §703).
Nilai baru (`dana_va` / `dana_qris` / `dana_balance`?) → **UNRESOLVED** (§7).

---

## 6. Model settlement — memblokir B6

Dua model, lihat `docs/integration/dana/README.md` §3:

- **Model A** — satu merchant + Disbursement; dana transit di rekening DANA Sa7tein; Sa7tein kustodian.
  `subMerchantId` kosong; payout dijalankan B6 ke tiap merchant/kurir.
- **Model B** — sub-merchant/split settlement; dana langsung ke rekening merchant; Sa7tein bukan
  kustodian. `subMerchantId` **wajib** di setiap createOrder + kesepakatan split dengan DANA.

**BE jangan pilih sendiri** — ini keputusan bisnis/regulasi PO yang masih `UNRESOLVED`.
Ambil Model A (yang sekarang) sampai PO memutuskan; jangan tulis `subMerchantId` kosong sebagai final.

---

## 7. UNRESOLVED (jangan dikarang)

| # | Hal | Sumber |
|---|---|---|
| D1 | Model settlement A/B (§6) | `decision-irbid-mvp.md` |
| D3 | Interval reconciliation fallback + retry webhook | G11 / `WEB-1` |
| D4 | Akun DANA sandbox test untuk wallet/OAuth (widget binding) | `testing.md` §4c |
| D5 | QRIS: panduan testing + produksi (manual) | `testing.md` §4a |
| D6 | Jalur UI untuk metode redirect/cashier: redirect, WebView, atau halaman sendiri | belum diputuskan |

**D2 — ditutup 2026-10-13 (diputuskan saat membangun FE).** App memakai
`dana_va`/`dana_qris` dan keduanya menggantikan `xendit_va`/`xendit_qris`
**1:1**. Penamaan Xendit sudah dihapus dari tipe, data, layar, flow, dan
`/documentation`; satu-satunya sisa literal `xendit_*` adalah **nilai string
yang dikirim ke kolom backend** (`OUT_PAYMENT` di `src/api/orders.ts`) plus
mapping cart lama di `src/store/index.ts`, sampai check constraint
`orders_payment_method_check` diperbarui BE — pola MISMATCH yang sama dengan
`wallet`. Nilai enum di DB karenanya tetap `xendit_*` untuk saat ini; kontrak §3
tidak berubah.

---

## 8. Layar FE (status per 2026-10-13)

Dibangun **sebagai mock sandbox** di repo FE; BE belum ada, jadi kode & QR berasal
dari nilai contoh, bukan dari DANA.

1. **VA** — selesai: `/customer/payment-dana` (`src/pages/PaymentDana.tsx`),
   nomor contoh + tombol salin + hitung mundur 15 menit.
2. **QRIS** — selesai: rute yang sama, pola QR digambar CSS grid (bukan `<svg>`,
   bukan lib QR baru) + caption yang menyebut itu contoh.
3. **Redirect/cashier** — belum: butuh BE untuk menerbitkan `url`/`urlParams`
   (`B1`) dan arah `PAY_RETURN`; lihat D6.
4. **Status** — sebagian: state `menunggu`/`dibayar`/`kedaluwarsa` sudah ada dan
   dipetakan ke §5, tapi perpindahannya masih tombol simulasi, bukan webhook/poll.
   Ganti dengan `B7` (webhook) atau poll `B2`.

Alur: `/payment-selection` → `/payment-amount` (order dibuat di sini, sama seperti
metode lain) → `/payment-dana` (VA/QR + tunggu bayar) → `/order-placed`. Ini
satu-satunya UI gateway yang memang milik kita; sisanya halaman DANA.
