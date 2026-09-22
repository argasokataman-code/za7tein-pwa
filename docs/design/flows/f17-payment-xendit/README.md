# F17 — Payment Xendit

Alur pembayaran Xendit (VA/QRIS) + cabang COD/transfer manual. **DEC-1039 (final): Xendit DIPAKAI untuk VA/QRIS** — backend belum implement, desain sudah final. **DEC-1037:** fee transfer manual = user bayar langsung ke merchant, platform tidak menahan. Sumber: `docs/product/schema-draft-v1.md` (keputusan sepakat) + DEC-1037 + DEC-1039; PRD aktif `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f17-payment-xendit.json` | Spec archify (sequence v1) — sumber yang diedit |
| `f17-payment-xendit.html` | Artefak jadi |
| `f17-payment-xendit.visual-check.*` | Bukti visual-check |

## Alur

`checkout` pilih `paymentMethod: xendit_va | xendit_qris | cod | transfer` → backend create order `paymentStatus: unpaid` → request invoice ke Xendit (instruksi VA/QRIS) → Xendit balik invoice + VA number / QR string → `paymentStatus: pending` → tampil ke customer. Customer bayar (transfer VA / scan QR) → Xendit kirim **webhook** → backend **verify signature** → **idempotency check** (dup event → ignore) → `paymentStatus: paid` + `paidAt` → ledger **`cr`** (reference `topUp|order`) → order lanjut (`placedAt` mulai SLA).

**Gagal:** VA/QRIS **expired** → webhook expired → `paymentStatus: failed` → customer retry (invoice baru) atau batal. Webhook **gagal/tidak masuk** → **polling fallback** (backend poll status Xendit) → samakan state.

**Refund (feeds F22):** dispute resolved → backend request refund ke Xendit → `paymentStatus: refunded` → ledger `db` `refund`.

**COD/transfer manual (short):** `cod` → skip Xendit, bayar saat serah terima (F2 cod hold); `transfer` → manual, user upload bukti → merchant/SA verifikasi (mekanisme UNRESOLVED).

## Aturan keras (jangan dilupakan)

- Xendit hanya untuk VA/QRIS (DEC-1039). COD dan transfer manual **skip Xendit** — transfer manual fee = user bayar langsung ke merchant, platform tidak menahan (DEC-1037).
- Webhook wajib **verify signature** sebelum mutasi status; event duplikat wajib **idempotency check** dan diabaikan (jangan double `cr`).
- `paid` wajib menulis ledger `cr` (reference `topUp|order`) sebelum order lanjut; refund wajib tulis ledger `db` `refund` — uang tidak pernah berpindah tanpa entri ledger.
- Webhook tidak selalu sampai: wajib ada **polling fallback** yang menyamakan state.
- `paymentStatus` state machine: `unpaid → pending → paid | failed | refunded`.
- Mekanisme verifikasi bukti transfer manual belum final (UNRESOLVED) — jangan ditebak.

## Terhubung (lihat `../INDEX.json`)

- `f1-order-lifecycle:checkout` — checkout memilih `paymentMethod`, `paid` me-release order ke lifecycle.
- `f2-cod-hold` — cabang `cod`: bayar saat serah terima, hold & release terpisah dari Xendit.
- `f3-wallet-topup` — ledger `cr`/`db` pakai reference `topUp`.
- `f8-dispute` → `f22-refund` (akan datang) — resolusi dispute memicu refund ke Xendit.
- `f4-fee-tax` — fee platform berdampingan dengan fee Xendit.

## Sumber (jangan dikarang)

- `docs/product/schema-draft-v1.md` — keputusan sepakat payment (Xendit VA/QRIS, cod, transfer manual)
- DEC-1037 — fee transfer manual ditanggung user ke merchant, platform tidak menahan; PO fee flat 0,37
- DEC-1039 — Xendit DIPAKAI untuk VA/QRIS, desain final, BE belum implement
- **Dasar: `C-01`** (Xendit dipilih sebagai gateway) + `DEC-1039` (payout/disbursement) + `OQ-25` (fee & PPN atas fee). Tidak ada `R-*` khusus payment — **jangan dikarang**; schema draft hanya dipakai untuk nama field
- **UNRESOLVED (jangan ditebak):** idempotency key strategy (schema belum punya field `xenditInvoiceId`) · webhook retry/backoff policy · batas waktu VA/QRIS expiry (Xendit default?) · fee Xendit ke platform — apakah PO fee flat 0,37 sudah cover? · konfirmasi manual transfer: bukti upload? siapa verif (merchant/SA)?

## Update

```bash
./scripts/flows-gate.sh f17-payment-xendit   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-22 — label `R-PAY-01 synthetic` diganti dasar **`C-01`** (Xendit) + `DEC-1039` (payout) + `OQ-25` (fee & PPN atas fee). Validate 9/9 pass, deliver exit 0 (spec `c1e99887`, artifact `464e163b`), visual-check pass (1440x900, 2048x1320 light + dark, overflow 0).
