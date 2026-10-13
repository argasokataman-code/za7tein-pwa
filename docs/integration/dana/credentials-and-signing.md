# Kredensial & tanda tangan DANA

## 1. Di mana kredensial disimpan

**Tidak di repo.** Kredensial DANA hidup di dua tempat:

- `.env.local` (gitignored) di root repo Sa7tein — untuk server/script.
- `~/.config/dana-sandbox/credentials.env` (chmod 600) — salinan kerja.

Daftar variabel (nama saja):

| Variabel | Isi |
|---|---|
| `DANA_API_BASE_URL` | `https://api.sandbox.dana.id` |
| `DANA_MERCHANT_ID` | merchant |
| `DANA_CLIENT_ID` | `X-PARTNER-ID` |
| `DANA_CLIENT_SECRET` | rahasia — jangan pernah ke frontend |
| `DANA_PRIVATE_KEY` | RSA-2048 PEM (pewaris tanda tangan) |
| `DANA_PUBLIC_KEY` | pasangan publik (dibagikan ke DANA) |
| `DANA_EXTERNAL_SHOP_ID` / `DANA_EXTERNAL_DIVISION_ID` | id toko/divisi di sisi partner |

**Aturan:** Vite hanya mengekspos `VITE_*`. Jangan beri prefix `VITE_` pada
kredensial DANA — itu akan membocorkannya ke bundle frontend. Tanda tangan dan
panggilan DANA harus dari sisi server/BE, bukan dari PWA.

## 2. Identifier (bukan rahasia) merchant Sa7tein

| Item | Nilai |
|---|---|
| Merchant ID | `216620000012052985144` |
| Client ID / X-PARTNER-ID | `2026101223024288071171` |
| External Shop ID | `45de1fb5` |
| Shop ID | `216660000003629187960` |
| External Division ID | `64656ac4` |
| Division ID | `216650000003629186968` |

## 3. Dua skema tanda tangan

DANA punya dua skema, **jangan dicampur**.

### a. Open API (Merchant Management, `/dana/...htm`)

Body dibungkus, lalu ditandatangani utuh:

```jsonc
{
  "request": { "head": {...}, "body": {...} },
  "signature": "<base64 RSA-SHA256 dari minified(request)>"
}
```

`head` memuat `clientId`/`clientSecret` dan tidak mewajibkan `X-SIGNATURE`
header. Dipakai untuk `/dana/merchant/*` dan `/dana/member/*`.

### b. SNAP (Payment Gateway, Widget, Disbursement)

Tanda tangan per-request, 4 bagian, **lowercase hex**:

```
stringToSign = METHOD + ":" + relativePath + ":" + lowercase(hex(sha256(minifiedBody))) + ":" + X-TIMESTAMP
X-SIGNATURE  = base64( RSA-SHA256( stringToSign, privateKey ) )   // padding PKCS#1
```

Header wajib:

| Header | Isi |
|---|---|
| `X-PARTNER-ID` | `clientId` (**bukan** merchantId) |
| `X-CLIENT-KEY` | `clientId` |
| `X-TIMESTAMP` | `YYYY-MM-DDTHH:mm:ss+07:00` (Jakarta) |
| `X-EXTERNAL-ID` | UUID unik per request |
| `CHANNEL-ID` | id channel |
| `X-SIGNATURE` | hasil di atas |

Apply-token (B2B2C/B2B) memakai string berbeda: `<X-CLIENT-KEY>|<X-TIMESTAMP>`.

Implementasi ini **identik** dengan SDK resmi `dana-node`
(`DanaSignatureUtil.generateSnapB2BScenarioSignature`) — sudah dicocokkan
byte-per-byte.

## 4. Key pair

- `~/.config/dana-sandbox/private_key.pem` — RSA-2048, rahasia.
- Bagian publiknya **byte-identik** dengan public key yang ditampilkan portal
  DANA → pairing key benar.
- `~/.config/dana-sandbox/dana_sandbox_public.pem` — public key **milik DANA**,
  dipakai untuk **verifikasi** webhook/notifikasi yang DANA kirim ke Sa7tein.

**Verifikasi arah:** saat Sa7tein menerima `finish notify` dari DANA, verifikasi
memakai public key **DANA**, bukan public key Sa7tein.

## 5. Jejak kesalahan yang pernah ditemui (agar tidak diulang)

| Gejala | Sebab | Bukan |
|---|---|---|
| `401 4013700 Invalid Client` | `X-PARTNER-ID` diisi `merchantId` | bukan key salah |
| `500` di semua endpoint transaksional | provisioning SNAP di sisi DANA belum aktif | bukan signature/env |
| `PARAM_ILLEGAL` di `queryShop` | `shopIdType` diisi `SHOP_ID` | harus `EXTERNAL_ID` |
| `4034302 amount less than minimum limit` | amount fixture UAT di bawah minimum sandbox | pesan DANA menyebut "exceed", menyesatkan |
