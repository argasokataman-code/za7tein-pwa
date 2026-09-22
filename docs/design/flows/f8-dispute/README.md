# F8 — Dispute (Queue Panel Admin / CS)

Workflow dispute = antrian kerja panel admin (CS), bukan portal sengketa. Milestone **M6** (deps M0, M4, M5); PRD aktif `irbid-mvp-v2-2026-09-21`. **Sudah di-develop (basis UI)**: form "Ajukan Sengketa" di sisi customer (`/customer/dispute`) dan merchant (`/merchant/dispute`) + queue resolusi di `/admin/disputes` — lihat `docs/plan-admin.md`.

| Berkas | Isi |
|---|---|
| `f8-dispute.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f8-dispute.html` | Artefak jadi |
| `f8-dispute.visual-check.*` | Bukti visual-check |

## Alur

**Lane Pengaju:** Ajukan Sengketa (alasan + kategori + foto ≤3, opsional) → `dispute_filed`.

**Lane Panel Admin (CS):** Queue Disputed (1× per order) → Buka bukti (log OTP, geolocation Tiba, foto kurir, timestamp checkpoint) → Pilih resolusi (4 aksi).

**Lane Sistem:** Queue masuk → **Bekukan hold** + pause auto-settle (order → `disputed`, tak boleh `settled` final) → putusan → **Terapkan** (hold di-release sesuai putusan) → `resolved_*` + **1 ledger entry baru** (append-only). Protection fund = sumber untuk kasus tanpa pihak bersalah.

## 4 resolusi

| Aksi | Efek |
|---|---|
| Refund penuh | 100% ke customer, fee 0,22 ikut kembali |
| Refund sebagian | X% ke customer, sisanya cair merchant |
| Release ke merchant | Fee 0,15 tetap dipotong |
| Tolak | Tanpa ubah saldo |

Window 24 jam setelah `settled`; 1× per order, tanpa appeal (MVP). Refund = internal ledger instan, tanpa fee.

## Terhubung (lihat `../INDEX.json`)

Memicu/menerima dari `f2-cod-hold` (hold dibekukan, `dispute_opened`), feed `f7-ledger-liability` (1 entry per resolusi), notifikasi via `f11-push-notification`.

## Sumber (jangan dikarang)

- `R-DISPUTE-01` — `analysis.md` · Milestone M6 — `versions/irbid-mvp-v2-2026-09-21/milestones.md`
- Protection fund 2% fee platform — `source.md` §Proteksi (OQ-12 closed)
- **UNRESOLVED (jangan ditebak):** OQ-29 — finalisasi window/kategori/SLA (ditunda sampai >5/bulan); OQ-30 — siapa super admin operasional & merchant sebagai pihak bersengketa

## Update

```bash
./scripts/flows-gate.sh f8-dispute   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
