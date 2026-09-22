# F3 — Wallet & Top-up

Alur top-up customer (mock Xendit VA/QRIS) + model tiga wallet closed-loop.
Milestone **M3** (M0 tipe/walletSlice, M2 gate checkout; PRD aktif `irbid-mvp-v2-2026-09-21`).

| Berkas | Isi |
|---|---|
| `f3-wallet-topup.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f3-wallet-topup.html` | Artefak jadi |
| `f3-wallet-topup.visual-check.*` | Bukti visual-check |

## Alur

**Lane Customer (top-up):** Pilih nominal → Pilih channel (VA/QRIS) → Redirect Xendit (`idempotency-key` + `reference_id`) → TopUp `pending` → webhook → `completed` → kredit **Saldo wallet** (`available` + `pending`).

**Lane Wallet & Internal Ledger:** Saldo → `bayar order` → internal ledger (antar-wallet instan, tanpa fee gateway) → `withdraw` → Xendit payout (detail di F6).

**Lane Guard:** nominal akun baru < 3,5 JOD → **gate** `MIN_TOPUP_NEW_ACCOUNT_JOD = 3.5` (berlaku semua metode, bukan cuma prepaid).

Tiga wallet: customer (top-up/bayar order), merchant (kredit otomatis saat settle — F2), kurir (**khusus tips**, gaji dari merchant — PRD bab 04).

## State TopUp

`pending / processing / completed / failed` (analysis R-WALLET-01). Saldo: `available` + `pending`.

## Terhubung (lihat `../INDEX.json`)

Drill-down dari `f1:topUpGate`; feed ke `f6-cashout-payout` (withdraw) dan `f7-ledger-liability` (setiap kredit = 1 entry ledger).

## Sumber (jangan dikarang)

- `R-WALLET-01`, `R-TOPUP-01` — `analysis.md`
- Milestone M0, M2, M3 — `versions/irbid-mvp-v2-2026-09-21/milestones.md`
- Konstanta `MIN_TOPUP_NEW_ACCOUNT_JOD = 3.5` — `source.md` §Scope Sistem
- **DEFERRED (BE, PO 2026-09-22):** OQ-5/7/8/23 — onboarding & fee Xendit
- **UNRESOLVED (jangan ditebak):** OQ-15, OQ-19 — regulasi e-money & segregated account; timeout top-up pending tidak disebut PRD

## Update

```bash
./scripts/flows-gate.sh f3-wallet-topup   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
