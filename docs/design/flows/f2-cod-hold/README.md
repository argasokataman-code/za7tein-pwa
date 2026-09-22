# F2 — COD via Wallet Hold Lifecycle

State machine status hold untuk order COD via wallet.
Milestone **M4** (PRD aktif `irbid-mvp-v2-2026-09-21`).

| Berkas | Isi |
|---|---|
| `f2-cod-hold.json` | Spec archify (lifecycle v1) — sumber yang diedit |
| `f2-cod-hold.html` | Artefak jadi |
| `f2-cod-hold.visual-check.*` | Bukti visual-check |

## State & Transisi

**Jalur utama:**
Tanpa hold → **Held** (order dibuat) → **Cut** (kurir match) → **Settled** (OTP sukses → bayar merchant/kurir).

**Jalur pembatalan (exception):**
- **Held → Released** — batal sebelum match = hold dibatalkan (hold released).
- **Cut → Reversed** — batal sesudah match = potongan dikembalikan via reversal append-only.

Tiap transisi = 1 entry ledger double-entry append-only (R-COD-01).

## Catatan desain

- Lifecycle diagram memakai schema v1 (`meta.viewBox [1000, 640]`) supaya muat di 1440×900 tanpa scroll.
- Tiga lane: Lifecycle utama + Pembatalan & Reversal + `terminal` (Hasil akhir — id lane **wajib `terminal`**, kolom 0..2, menaruh `settled` di band 03; tanpa lane ini renderer menampilkan band "03 / Outcomes" **kosong** = diagram terlihat putus). Cancel lane tidak memakai `variant` (lifecycle schema tidak mendukung).
- Route cut → settled lintas band: `route drop` + `channelY` (koridor y=200), cancel horizontal dipindah y=110 & y=420 biar tak nabrak — geometri kolom outcome band bebas dari `reversed` (col 0).
- State `settled` memakai sublabel ringkas supaya teks tetap ≥ 6px di viewport 1440px.

## Terhubung (lihat `../INDEX.json`)

Drill-down dari F1: `f1:order → f2:none→held` (`hold_created`), `f1:dapur → f2:held→cut` (`hold_cut`), `f1:otp → f2:cut→settled` (`hold_settled`), `f1:batal → f2:released|reversed`. Feed ke `f7-ledger-liability`; diinterupsi `f8-dispute`.

## Sumber (jangan dikarang)

- `R-COD-01` — `analysis.md`
- Milestone M4 — `versions/irbid-mvp-v2-2026-09-21/milestones.md`
- Fee 0,37 JOD berlaku semua metode, termasuk legacy (OQ-25, PO 2026-09-22)
- Batal sesudah match = reversal (append-only), bukan refund tunai

## Update

```bash
./scripts/flows-gate.sh f2-cod-hold   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
