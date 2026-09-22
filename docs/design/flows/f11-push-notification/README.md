# F11 — Push Notification & WhatsApp Fallback

Sequence push server-driven + fallback WA. Milestone **M8** (deps M0); PRD aktif `irbid-mvp-v2-2026-09-21`.

| Berkas | Isi |
|---|---|
| `f11-push-notification.json` | Spec archify (sequence v1) — sumber yang diedit |
| `f11-push-notification.html` | Artefak jadi |
| `f11-push-notification.visual-check.*` | Bukti visual-check |

## Alur

`push_subscribe` (endpoint+keys) → status order berubah → **`push_sent`** server → **Web Push** (payload ≤4 KB, TTL, silent dilarang) → deliver ke app → tap → fetch detail. iOS gagal (force-quit / ITP 7 hari) → **fallback `wa.me`** untuk event kritis → user buka deep link.

## Aturan (R-PUSH-01)

- Payload max 4 KB, TTL wajib, `userVisibleOnly` wajib, silent push dilarang.
- iOS: install gate 16.4+, force-quit = bisu, ITP 7 hari.
- Event kritis wajib fallback WhatsApp/SMS. Nomor WA wajib registrasi E.164 (`+962`/`+62`).
- Event: `push_subscribed`, `push_sent`, `push_delivery_confirmed`.

## Event per alur

- Customer: "Kurir sudah sampai", "Kurir sedang otw" + estimasi, notif + call saat Tiba 5m.
- Super admin: auto-alert SLA Ambil→Berangkat 15m & Berangkat→Tiba 30m.

## Terhubung (lihat `../INDEX.json`)

Dipicu semua event `f1-order-lifecycle` + `f8-dispute`; registrasi WA dari milestone M8.

## Sumber (jangan dikarang)

- `R-PUSH-01` — `analysis.md` · Milestone M8 — `versions/irbid-mvp-v2-2026-09-21/milestones.md`
- **OQ-24 RESOLVED (PO 2026-09-22):** nomor WA wajib diisi + validasi format E.164 (**Level 1**, tanpa OTP). OTP / WhatsApp Business API = Level 2 yang PRD tunda (`source.md:728-731`)
- **Keputusan PO 2026-09-23:** WhatsApp Business API (Level 2) **tidak dipakai di MVP** — fallback tetap `wa.me` manual (gratis). Tidak perlu nomor WA Business, tidak perlu approval template Meta.
- **UNRESOLVED (jangan ditebak):** uji push nyata di device (iOS + Android)
- Status R-PUSH-01: push testing di device belum dilakukan; WhatsApp Business API level 2 belum dipakai

## Catatan desain

- `viewBox [1080, 540]` — sequence min 480; timeline y maks = H − 83 (457).
- 5 message (audit koneksi 2026-09-22): rantai utama app→server→**push**→app (bus Web Push tersentuh, komponen satu) + push→ios (gagal) + server→wa. Sebelumnya server→app langsung = lifeline `push`/`ios` terpisah dari diagram (komponen terbelah).

## Update

```bash
./scripts/flows-gate.sh f11-push-notification   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
