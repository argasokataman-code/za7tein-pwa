# F17 — Payment DANA

Alur pembayaran DANA (VA/QRIS) + cabang COD. **Keputusan PO 2026-10-13: DANA menggantikan Xendit sebagai satu-satunya payment gateway + disbursement** — backend belum implement, desain sudah final. **DEC-1037:** fee transfer manual = user bayar langsung ke merchant, platform tidak menahan (transfer manual kini keluar dari rencana). Sumber: `docs/product/schema-draft-v1.md` + DEC-1037 + keputusan PO 2026-10-13; PRD aktif `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f17-payment-dana.json` | Spec archify (sequence v1) — sumber yang diedit |
| `f17-payment-dana.html` | Artefak jadi |
| `f17-payment-dana.visual-check.*` | Bukti visual-check |

## Alur

`checkout` pilih `paymentMethod: dana_va | dana_qris | cod` → backend create order `paymentStatus: unpaid` → `createOrder` ke DANA (instruksi VA/QRIS) → DANA balik `paymentCode` + `referenceNo` → `paymentStatus: pending` → tampil ke customer. Customer bayar (transfer VA / scan QR) → DANA kirim **webhook** → backend **verify signature** → **idempotency check** (dup event → ignore) → `paymentStatus: paid` + `paidAt` → ledger **`cr`** (reference `topUp|order`) → order lanjut (`placedAt` mulai SLA).

**Gagal:** VA/QRIS **expired** → webhook expired → `paymentStatus: failed` → customer retry (invoice baru) atau batal. Webhook **gagal/tidak masuk** → **polling fallback** (backend poll status DANA, `B2`) → samakan state.

**Refund (feeds F22):** dispute resolved → backend request refund ke DANA → `paymentStatus: refunded` → ledger `db` `refund`.

**COD (short):** `cod` → skip DANA, bayar saat serah terima (F2 cod hold). `transfer` manual sudah keluar dari rencana.

**Sisi FE (layar bayar terminal):** sukses membuat order = layar bayar diganti `replace` ke `/order-placed` (bukan `push`), keranjang dikosongkan (COD/transfer saat order dibuat, VA/QRIS saat pembayaran diterima), dan tombol kirim dikunci sejak validasi lolos. Tujuannya: tombol kembali sistem tidak bisa memutar ulang layar bayar berisi item yang sama (pembayaran ganda); guard idempotensi webhook di atas tetap wajib.

## Aturan keras (jangan dilupakan)

- DANA menggarap VA/QRIS (keputusan PO 2026-10-13). COD **skip DANA**.
- Webhook wajib **verify signature** sebelum mutasi status; event duplikat wajib **idempotency check** dan diabaikan (jangan double `cr`).
- `paid` wajib menulis ledger `cr` (reference `topUp|order`) sebelum order lanjut; refund wajib tulis ledger `db` `refund` — uang tidak pernah berpindah tanpa entri ledger.
- Webhook tidak selalu sampai: wajib ada **polling fallback** yang menyamakan state.
- `paymentStatus` state machine: `unpaid → pending → paid | failed | refunded`.
- Endpoint, nama field, dan pemetaan state DANA: `docs/integration/dana/be-contract.md` (jangan dikarang di sini).

## Terhubung (lihat `../INDEX.json`)

- `f1-order-lifecycle:checkout` — checkout memilih `paymentMethod`, `paid` me-release order ke lifecycle.
- `f2-cod-hold` — cabang `cod`: bayar saat serah terima, hold & release terpisah dari DANA.
- `f3-wallet-topup` — ledger `cr`/`db` pakai reference `topUp`.
- `f8-dispute` → `f22-refund` (akan datang) — resolusi dispute memicu refund ke DANA.
- `f4-fee-tax` — fee platform berdampingan dengan fee DANA.

## Sumber (jangan dikarang)

- `docs/integration/dana/be-contract.md` — kontrak DANA: endpoint BE (B1–B7), field `createOrder`, webhook, pemetaan state
- `docs/product/prd/decision-irbid-mvp.md` — keputusan PO 2026-10-13: DANA menggantikan Xendit (gateway + disbursement)
- DEC-1037 — fee transfer manual ditanggung user ke merchant, platform tidak menahan
- **Dasar: keputusan PO 2026-10-13** (DANA provider) + `DEC-1039` (payout/disbursement) + `OQ-25` (fee & PPN atas fee). Tidak ada `R-*` khusus payment — **jangan dikarang**
- **UNRESOLVED (jangan ditebak):** model settlement A/B (`be-contract.md` §6) · idempotency/retry webhook · batas waktu VA/QRIS expiry · fee DANA ke platform

## Update

```bash
./scripts/flows-gate.sh f17-payment-dana   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-10-13 — provider berganti dari Xendit ke **DANA** (keputusan PO 2026-10-13); dasar `C-01` (Xendit) diganti keputusan PO DANA.
