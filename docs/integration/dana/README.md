# Integrasi DANA — Sa7tein

Dokumen ini memetakan integrasi **DANA Enterprise** sebagai *payment gateway* dan
*disbursement* untuk Sa7tein. Isinya fakta yang sudah diuji di **DANA Sandbox**
(bukan rencana), sumbernya DANA API Docs v2 + `dana-id/uat-script` resmi.

Status singkat: **SNAP hidup, Payment Gateway + Widget (IPG Cashier Pay) +
Disbursement lolos uji otomatis.** Sisa yang mentok ada di `testing.md`.

## Peta dokumen

| Berkas | Isi |
|---|---|
| `api-inventory.md` | Daftar endpoint + status uji (bisa dipakai / mentok) |
| `testing.md` | Cara menjalankan UAT DANA + hasil + blocker |
| `credentials-and-signing.md` | Env, dua skema tanda tangan, verifikasi webhook |

---

## 1. Peran DANA di Sa7tein

DANA menggantikan dua peran yang sebelumnya dipegang Xendit/skema manual di repo ini
(lihat `src/types.ts`: `PaymentMethodId`, `TopUpChannel`, `Payout`):

| Kebutuhan Sa7tein | Produk DANA | Arah dana |
|---|---|---|
| Customer bayar pesanan | **Payment Gateway** (`createOrder`) + **IPG Cashier Pay / Widget** | customer → **DANA** |
| Saldo/top-up | Payment Gateway (QRIS/VA/DANA balance) | customer → **DANA** |
| Bayar merchant | **Disbursement** (transfer to bank / to DANA) | **DANA** → merchant |
| Bayar kurir | **Disbursement** | **DANA** → kurir |
| Data toko/divisi | **Merchant Management** (Open API) | — |

Dua jalur autentikasi dipakai DANA, tidak bisa dicampur:

- **Open API** — path `/dana/...htm`, body dibungkus `{request:{head,body},signature}`.
  Dipakai Merchant Management.
- **SNAP** — header `X-SIGNATURE`, token via `/v1.0/access-token/b2b2c.htm`.
  Dipakai Payment Gateway, Widget, Disbursement.

Detail ada di `credentials-and-signing.md`.

---

## 2. Alur dana (fund flow)

```
customer
   │  bayar (DANA balance / VA / QRIS)
   ▼
DANA Payment Gateway ──settle──► [ saldo merchant DANA milik Sa7tein ]
                                        │
                       Disbursement ────┼──► rekening bank merchant
                       Disbursement ────┴──► DANA balance kurir
```

Titik kritis: dana **berhenti dulu** di saldo merchant DANA milik Sa7tein
sebelum diteruskan ke merchant/kurir.

---

## 3. Sa7tein masih kustodian? — tergantung model settlement

Jawaban singkat: **dengan integrasi saat ini (satu merchant + Disbursement),
YA — Sa7tein masih memegang dana pihak ketiga sesaat.** Supaya *tidak* jadi
kustodian, harus pakai **settlement langsung ke sub-merchant**.

| Model | Dana masuk ke | Sa7tein kustodian? | Catatan |
|---|---|---|---|
| **A. Satu merchant + Disbursement** (yang kita pakai sekarang) | rekening DANA Sa7tein | **Ya** — dana transit dipegang Sa7tein sampai payout | Repo sudah memodelkan ini: `Wallet`, `TopUp`, `Payout`, `DepositStatus='held'` |
| **B. Sub-merchant / split settlement** | rekening DANA tiap merchant | **Tidak** — Sa7tein hanya agregator/teknis | Perlu fitur DANA **Submerchants** (`/sandbox/submerchants`, `subMerchantId` per shop) + kesepakatan split |

Implikasi model A (kalau dibiarkan): Sa7tein butuh izin/agreement yang sesuai
karena memegang dana orang lain sesaat (risiko regulasi + settlement).

**Sumber DANA yang relevan:** portal Sandbox → *Change Product Selection*
menyediakan produk **QRIS** dan entitas **Submerchants** (division/subMerchant
per shop). Keberadaan `subMerchantId` di `createOrder` menunjukkan DANA
mendukung settlement per sub-merchant.

> **UNRESOLVED — keputusan PO dibutuhkan.** Pilih model A atau B. Ini keputusan
> bisnis/regulasi, bukan teknis. Model B menghapus peran kustodian Sa7tein dan
> menyederhanakan kepatuhan; model A lebih sederhana secara alur tapi
> mempertahankan posisi kustodian. Jangan diputuskan tanpa konfirmasi DANA soal
> mekanisme split/settlement sub-merchant.
