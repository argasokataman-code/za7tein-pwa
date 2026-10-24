# F24 — Penanganan Masalah Order oleh CS

> **Status 2026-10-24 — pindah ke ops.** Penanganan masalah order menjadi kerja
> `/ops`; alur CS di `/admin` sudah dihapus. Lihat
> `docs/product/prd/versions/sa7tein-mvp-2026-10-11/decision-ops-canonical.md`.
> BRS sumbernya (`notif-order-e2e-2026-10-11`) masih `proposed`.

Workflow jalur masalah order: dari pemicu → queue CS → triage → putusan → tutup (atau eskalasi ke SA). Pelengkap `f8-dispute` (fokus pada resolusi sengketa) dan `f11-push-notification` (routing audience). Basis: **BRS `notif-order-e2e-2026-10-11` (`proposed`)** + `R-DISPUTE-01`/`C-12`. PRD aktif `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f24-cs-problem.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f24-cs-problem.html` | Artefak jadi |
| `f24-cs-problem.visual-check.*` | Bukti visual-check |

## Masalah bisnis

CS (`/admin`) dirancang untuk **masalah**, bukan happy path. Hari ini bell CS tak pernah menerima event order (0 emit `audience:'cs'`), alert SLA hanya seed statis, dan tak ada alur tertulis apa yang CS lakukan saat order bermasalah. Flow ini menetapkan pemicu, langkah penanganan, dan batas peran CS vs Super Admin.

## Alur

**Lane Pemicu:** `dispute_filed` (customer/merchant, 1× per order) · batal sesudah match (reversal append-only) · SLA lewat (ambil>15m · berangkat>30m · tiba>10m · auto-settle>10m) → semua masuk **Queue masalah**.

**Lane CS:** Queue → **triage** (buka bukti: OTP · foto · geolocation · timestamp) → hubungi pihak bila perlu (call guard 5m/batal 10m) → **putusan**.

**Lane Sistem:** hold dibekukan + **auto-settle pause** selama masalah belum tutup → putusan diterapkan (hold di-release, **1 ledger entry baru**, append-only) → `resolved_*` dan order ditutup dengan alasan.

**Eskalasi SA:** hanya bila masalah tak beres di CS (dispute macet / protection fund / appeal) → keputusan SA diterapkan sebagai entry baru.

## Batas peran (R-NOTIF-02)

- **CS menangani** masalah: sengketa, batal sesudah match, SLA lewat.
- **SA mengawasi/eskalasi** saja: dispute macet, protection fund, appeal (`f22:appeal`).
- Happy path **tidak** mengirim apa pun ke CS.

## Terhubung (lihat `../INDEX.json`)

Dipicu event `f1-order-lifecycle` (batal post-match / SLA) dan `f8-dispute` (`dispute_filed`); notifikasi audience via `f11-push-notification`; eskalasi ke `f22-super-admin-sa`.

## Sumber (jangan dikarang)

- **BRS `notif-order-e2e-2026-10-11`** (proposed) — `analysis.md` `R-NOTIF-02`; `docs/design/flows/BUSINESS.md` §2b
- `R-DISPUTE-01`, `C-12`, `f8-dispute`, `f15-super-admin` (CS merangkap SA), `DEC-2003` (batas CS/SA)
- SLA 15/30/10 = keputusan PO sementara (OQ-13), `src/data/courier.ts`
- **UNRESOLVED (jangan ditebak):** SLA penanganan CS (kapan naik ke SA) · pemilik alert SLA (CS triage vs SA) · ambang "tolak berulang" · fee batal sesudah match · window cancel
- **BE belum ada:** tabel `disputes` (+`resolve`/`appeal`), escalation dari timer, ledger tulis — lihat `analysis.md` §Kontrak BE

## Update

```bash
./scripts/flows-gate.sh f24-cs-problem   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
