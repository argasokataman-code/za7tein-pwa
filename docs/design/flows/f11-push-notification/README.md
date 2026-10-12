# F11 — Push Notification, Routing Audience & Fallback WA

Sequence transport push + **routing audience** tiap langkah order, plus fallback WA untuk event kritis. Rincian journey & matriks notifikasi: `f1-order-lifecycle` + `docs/design/flows/BUSINESS.md` §2b. Basis: **BRS `notif-order-e2e-2026-10-11` (`proposed`)** + `R-PUSH-01`. Milestone **M8** (deps M0); PRD aktif `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f11-push-notification.json` | Spec archify (sequence v1) — sumber yang diedit |
| `f11-push-notification.html` | Artefak jadi |
| `f11-push-notification.visual-check.*` | Bukti visual-check |

## Alur

`push_subscribe` (endpoint+keys) → status order berubah → **`push_sent`** server (order_id + event + teks) → **Web Push** (payload ≤4 KB, TTL wajib, silent dilarang) → deliver ke app → tap → fetch detail. Event kritis → **fallback `wa.me`**.

## Routing audience (R-NOTIF-01/02)

| Penerima | Kapan |
|---|---|
| Customer | tiap langkah (dibayar, siap, kurir otw, tiba+OTP, selesai, batal) |
| Merchant | tiap langkah order |
| Kurir | mulai `courier_matched` (tugas baru, berangkat, selesai, dibatalkan) |
| **CS** | **hanya masalah**: sengketa, batal sesudah match, alert SLA lewat |
| **Super Admin** | **hanya eskalasi**: dispute macet, protection fund, appeal |

Bell CS di `/admin` membaca `s.notifications.items`, tapi **0 emit `audience:'cs'`** di kode — audience-nya sudah valid, pemanggilnya belum ada.

## Aturan (R-PUSH-01)

- Payload max 4 KB, TTL wajib, `userVisibleOnly` wajib, silent push dilarang.
- iOS: install gate 16.4+, force-quit = bisu, ITP 7 hari.
- Event kritis wajib fallback WhatsApp/SMS. Nomor WA wajib registrasi E.164 (`+962`/`+62`).
- Event ikut f18: `payment_confirmed`, `merchant_ready`, `courier_matched`, `courier_picked_up`, `arrived`, `otp_verified`, `order_canceled`, + `sla_breached`, `escalated_to_sa`.

## Terhubung (lihat `../INDEX.json`)

Dipicu semua event `f1-order-lifecycle` + `f8-dispute`; penanganan masalah di `f24-cs-problem`; registrasi WA dari milestone M8.

## Sumber (jangan dikarang)

- **BRS `notif-order-e2e-2026-10-11`** (proposed) — `R-NOTIF-01/02`; `BUSINESS.md` §2b
- `R-PUSH-01` — `analysis.md` · Milestone M8 — `versions/irbid-mvp-v2-2026-09-21/milestones.md`
- **OQ-24 RESOLVED (PO 2026-09-22):** nomor WA wajib + validasi E.164 (Level 1, tanpa OTP). OTP/WA Business API = Level 2 ditunda.
- **PO 2026-09-23:** WA Business API (Level 2) **tidak dipakai** — fallback `wa.me` manual.
- **UNRESOLVED (jangan ditebak):** uji push nyata di device · kanal final (push vs push+WA) · SLA penanganan CS

## Update

```bash
./scripts/flows-gate.sh f11-push-notification   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
