# Schema Draft v1 — Backend ERD (Draft BE + Analisis Frontend)

Status: **draft** — masukan dari BE (belum final) + tambahan dari sisi frontend/PRD.
Sumber: draft BE per pesan (2026-09-22), PRD aktif `irbid-mvp-v2-2026-09-21`, `docs/design/flows/INDEX.json` (event → entity).

Aturan main:

- **Snapshot > hitung ulang.** Harga, modifier, dan zone di-order di-freeze saat order dibuat. Menu naik harga tidak mengubah order lama.
- **`number/pk`** = auto-increment. Semua referensi = FK ke pk.
- **Yang ditandai `UNRESOLVED` jangan ditebak** — sumber dan pemilik keputusan dicatat.

---

## Keputusan yang sudah sepakat (update dari sesi ini)

| Topik | Keputusan | Sumber |
|---|---|---|
| Payment provider | **Xendit dipakai** (VA/QRIS). BE belum update implementasi, tapi keputusan sudah final. | user, 2026-09-22 — memperbarui catatan "ditunda" di DEC-1037 |
| Fee transfer manual | **Sesuai desain** — user bayar langsung ke merchant, platform tidak menahan. Flat 0,37 JOD tetap untuk metode lain. | user, 2026-09-22 + DEC-1037 |
| PO fee | Flat 0,37 JOD semua metode | DEC-1037 |
| I-1 fee customer | 0,22 JOD | DEC-1038 |
| I-2 modal merchant | 5 JOD kredit, terpisah dari deposit COD 3,50 | DEC-1038 |
| SLA timer | 15/30/10 **sementara**, belum final | DEC-1037 → UNRESOLVED |

---

## Entitas

### 1. user

```ts
id: number/pk
type: 'customer' | 'courier' | 'merchant'
email: string
verified: boolean
status: 'active' | 'suspended'
phone: string            // tambahan: E.164 (+962/+62), PRD M8 wajib WA
```

### 2. address

```ts
id: number/pk
user: number/user.id
label: string
address: string
latitude: number
longitude: number
isDefault: boolean
zone: 'A' | 'B' | 'C' | null   // tambahan: dihitung saat save pin (haversine ke merchant)
```

### 3. customer

```ts
id: number/pk
users: number/user.id
name: string
riskFlag: boolean        // tambahan: blacklist COD — ditandai Super Admin
```

### 4. merchant

```ts
id: number/pk
user: number/user.id
description: string
photo: string            // D1 url
available: boolean
deliveryConfig: {                    // fee by radius ATAU by area
  mode: 'radius' | 'area'
  radiusMeters?: number
  feeByDistance?: { base: number, perKm: number }[]   // tier jarak
  feeByArea?: { zone: 'A'|'B'|'C', fee: number }[]
}
tenantStatus: 'pending' | 'approved' | 'suspended' | 'blacklisted'  // tambahan: approval tenant + blacklist COD (Super Admin)
deposit: number          // tambahan: saldo deposit COD (3,50 — DEC-1038)
depositStatus: 'unpaid' | 'held' | 'released'                        // tambahan: approve deposit = Super Admin
```

### 5. courier

```ts
id: number/pk
user: number/user.id
merchant: number/merchant.id      // karyawan merchant, maks 3 (C-06)
availability: 'available' | 'unavailable' | 'busy'
```

### 6. favMerchant

```ts
id: number/pk
user: number/user.id
merchant: number/merchant.id
```

### 7. menu

```ts
id: number/pk
name: string
description: string
price: number
available: boolean
image: string            // R2 url
```

### 8. menuVariant — **diisi (draft BE kosong)**

```ts
id: number/pk
menu: number/menu.id
name: string             // "Ukuran", "Pedas"
required: boolean        // wajib pilih (size) / opsional (topping)
maxSelect: number        // 1 = radio, N = checkbox
options: {
  id: number
  name: string
  priceDelta: number     // bisa negatif
}[]
```

### 9. order

```ts
id: number/pk
status: 'cart' | 'quotation' | 'canceled' | 'prepare' | 'waitingCourier' | 'waitingDelivery' | 'delivery' | 'done'
customer: number/customer.id
merchant: number/merchant.id
deliveryAddress: number/address.id
batch: number/batch.id | null
subTotal: number
deliveryFee: number
platformFee: number
total: number
// tambahan (money path + timer):
paymentMethod: 'cod' | 'transfer' | 'xendit_va' | 'xendit_qris'
paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
paidAt: datetime | null
createdAt: datetime
placedAt: datetime | null     // masuk antrean merchant → mulai SLA prepare
cancelReason: string | null
cancelBy: 'customer' | 'merchant' | 'system' | null
tip: number                   // F1: tip masuk order
zone: 'A' | 'B' | 'C'         // snapshot tarif saat order
promoId: number/marketing.id | null
promoAmount: number
```

> `quotation` = istilah dari draft BE, belum ada di flow F1 (`cart → placed → prepare …`). **Perlu disamakan bahasa** sebelum ERD final.

### 10. orderItem — **diisi (draft BE kosong)**

```ts
id: number/pk
order: number/order.id
menu: number/menu.id
qty: number
unitPrice: number         // snapshot: menu.price saat order dibuat
modifiers: {
  variantId: number
  optionId: number
  name: string
  priceDelta: number
}[]                       // snapshot modifierSummary/modifierExtra
lineTotal: number         // (unitPrice + sum(priceDelta)) * qty
note: string | null       // "tanpa bawang"
```

### 11. batch

```ts
id: number/pk
merchant: number/merchant.id
courier: number/courier.id
status: 'prepare' | 'closed' | 'waitingCourier' | 'waitingDelivery' | 'delivery'
etaPrepare: number        // countdown mulai saat status prepare
etaDelivery: number       // countdown mulai saat status delivery
// tambahan:
createdAt: datetime
slaPrepareDeadline: datetime | null    // placedAt + SLA prepare (angka UNRESOLVED)
slaDeliveryDeadline: datetime | null
escalatedToAdmin: boolean              // SLA breach → alert Super Admin
```

### 12. wallet

```ts
id: number/pk
user: number/user.id
balance: number
reservedBalance: number   // COD hold (F2) + payout in-flight (F6)
```

### 13. ledger

```ts
id: number/pk
user: number/user.id
type: 'cr' | 'db'
reference: 'topUp' | 'order' | 'delivery' | 'withdrawal' | 'refund' | 'hold' | 'release'
amount: number
```

> `refund` / `hold` / `release` ditambahkan supaya F2 (COD hold) dan F8 (dispute → refund) ter-track.

### 14. chat — **diisi (draft BE kosong)**

```ts
// chat (thread)
id: number/pk
orderId: number/order.id
participants: number[]    // [userId] — customer/merchant/courier
lastMessage: string | null
lastAt: datetime

// chatMessage (tabel terpisah)
id: number/pk
chat: number/chat.id
sender: number/user.id
body: string
at: datetime
readAt: datetime | null
```

### 15. incidentResolution — **diisi (draft BE kosong)**

```ts
id: number/pk
order: number/order.id
openedBy: number/user.id
type: 'late' | 'missing' | 'wrong' | 'not_delivered' | 'payment_failed'
status: 'open' | 'investigating' | 'resolved' | 'rejected'
resolution: 'refund_customer' | 'refund_order' | 'resettle' | 'no_action' | null
refundAmount: number | null
resolvedBy: number/user.id | null    // Super Admin
resolvedAt: datetime | null
```

### 16. marketing — **diisi (draft BE kosong)**

```ts
id: number/pk
type: 'promo_delivery' | 'discount_pct' | 'discount_fixed'
value: number
code: string | null       // null = auto apply
activeFrom: datetime
activeTo: datetime
maxUses: number | null
usedCount: number
```

### 17. ratingReview

```ts
id: number/pk
order: number/order.id
merchant: number/merchant.id | null   // null jika menu != null
customer: number/customer.id
menu: number/menu.id | null           // null jika merchant != null
review: string | null                 // null jika menu != null (review menu tanpa teks)
rating: number                        // max 5
```

---

## Gap flow ↔ schema (belum ada entri schema-nya)

Dari audit `docs/design/flows/` — belum ada tabel/scope, ditandai di sini bukan ditebak:

- **Super Admin console** — approval tenant pakai `merchant.tenantStatus` + `depositStatus`; liability dashboard & SLA escalation butuh view agregat, bukan tabel baru. **Flow-nya sendiri belum ada (F14?), sengaja ditunda.**
- **Onboarding registrasi/auth** — mekanisme auth provider **belum pernah jadi requirement PRD**. UI kini: customer = HP + password, merchant = email + password, OTP screen = 6 digit email (konflik: schema PRD M8 = WA). → kandidat **UNRESOLVED baru**, perlu keputusan sebelum ERD final.
- **Push subscription** (F11) — butuh `pushSubscription(user, endpoint, keys)`. PRD M8, status `planned`.

## UNRESOLVED (jangan ditebak)

| ID | Topik | Sumber |
|---|---|---|
| SLA-1 | Angka SLA 15/30/10 = sementara | DEC-1037 |
| FEE-1 | Rincian fee per metode (0,37 PO / 0,22 I-1) final di semua cabang | DEC-1037, DEC-1038 |
| AUTH-1 | Auth provider + mekanisme OTP registrasi (email vs WA), belum jadi requirement | PRD tidak memuat; UI `src/lib/schemas.ts` vs M8 |
| MARK-1 | Scope marketing/promo masuk MVP atau tidak | — |
| OQ-2..30, I-1..6 | 27 UNRESOLVED lain dari PRD | `docs/product/prd/versions/irbid-mvp-v2-2026-09-21/source/analysis.md` |
