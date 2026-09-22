# F15 — Super Admin

Console Super Admin — role ke-4. **Sudah di-develop (basis UI)**: konsol PWA `/admin/*` dengan shell 430px sama seperti role lain. Rencana & keputusan implementasi ada di `docs/plan-admin.md`; spec ini tetap sumber gambaran alur. PRD meminta approval tenant, konfigurasi kuota tier, dan master zona (AGENTS.md §9); skema draft menambah deposit approval, blacklist COD, liability dashboard, SLA escalation, dan dispute queue. Sumber gambaran: `docs/product/schema-draft-v1.md` + PRD `irbid-mvp-v2-2026-09-21`. Repo ini front-end saja — konsol dan aksinya adalah layar mock (AGENTS.md §1).

| Berkas | Isi |
|---|---|
| `f15-super-admin.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f15-super-admin.html` | Artefak jadi |
| `f15-super-admin.visual-check.*` | Bukti visual-check |

## Alur

**Lane Konsol Super Admin (dashboard):** Queue onboarding (`merchant.tenantStatus: pending`, feeder F16 — akan datang) → review data merchant (foto, `deliveryConfig`) → SLA escalation (`batch.escalatedToAdmin: true` dari F21 — akan datang) berupa alert masuk untuk ditindak.

**Lane Layar pantau & aksi:** Approve deposit (`3,50 JOD`: `unpaid → held` setelah verifikasi transfer → `tenantStatus: approved`) → dashboard liability (kewajiban platform = saldo wallet **customer + merchant + tips kurir** yang belum di-payout; **bukan gaji kurir** — kurir digaji merchant, `C-06`) → antrian sengketa (`incidentResolution.status: open → investigating → resolved/rejected` → `resolution`).

**Lane Guard tampilan & role:** tolak onboarding (`tenantStatus: suspended`), suspend merchant existing (`tenantStatus: suspended`), blacklist COD (`tenantStatus: blacklisted` + `customer.riskFlag: true` → blokir checkout COD), dan dispute ditolak (`resolution: no_action`).

## Aturan keras (jangan dilupakan)

- Deposit approve = verifikasi transfer masuk dulu, baru `depositStatus: held` → `tenantStatus: approved`. Jangan aktifkan merchant selama `unpaid`.
- Blacklist COD wajib menandai dua sisi: `merchant.tenantStatus: blacklisted` dan `customer.riskFlag: true` — keduanya dibutuhkan untuk memblokir checkout COD.
- Liability dashboard dan SLA escalation adalah **view agregat**, bukan tabel baru (catatan gap `schema-draft-v1.md`); angkanya mock di repo ini.
- Isi liability = kewajiban platform: saldo wallet **customer + merchant + tips kurir** yang belum di-payout. **Gaji kurir tidak masuk** — kurir digaji merchant dan platform tidak menahan dana kurir (`C-06`); yang lewat platform hanya tips.
- Semua aksi SA (approve, reject, suspend, blacklist, resolusi dispute) = satu-satunya jalur `resolvedBy` di `incidentResolution` — keputusan ada di tangan SA, bukan user.
- Shell: PWA Super Admin sementara memakai 430px seperti role lain; arah ke depan **website penuh non-PWA** (konsol desktop) sudah dicatat di `/documentation` dan **belum dikerjakan**. Saat dibangun, pengecualian lebar wajib didokumentasikan di `/documentation` (AGENTS.md §9) — bukan bocor diam-diam.
- Repo ini front-end saja: konsol, approval, dan aksi SA adalah layar mock (AGENTS.md §1).

## Terhubung (lihat `../INDEX.json`)

`f16-merchant-onboarding` → queue `tenantStatus: pending`; `f2-cod-hold` → blacklist COD memblokir checkout COD; `f7-ledger-liability` → agregat `reservedBalance` + ledger; `f21-sla-escalation` (akan datang) → `batch.escalatedToAdmin: true`; `f8-dispute` → dispute queue SA.

## Sumber (jangan dikarang)

- `docs/product/schema-draft-v1.md` — entri 3 (`customer.riskFlag`), 4 (`merchant.tenantStatus`, `depositStatus`), 11 (`order.escalatedToAdmin`), 12 (`wallet.reservedBalance`), 13 (`ledger`), 15 (`incidentResolution`) + catatan gap "Super Admin console"
- PRD `irbid-mvp-v2-2026-09-21` — `versions/`: `analysis.md` (R-DISPUTE-01, C-12, M6/M9), `source.md` (Dispute — Modul Super Admin, timer SLA), `milestones.md` (shell Super Admin)
- **Dasar: `C-12`** — portal CS merangkap Super Admin (approval tenant, blacklist COD, queue dispute) + PRD aktif §5C (deposit COD **3,50 JOD**) + `R-DISPUTE-01`. Tidak ada `R-SA-*` — **jangan dikarang**; skema draft entri 3/4/11/12/13/15 hanya dipakai untuk nama field
- **UNRESOLVED (jangan ditebak):** angka SLA (DEC-1037 sementara) · konfigurasi kuota tier (approval tier belum ada field di schema) · siapa admin — multi-admin? audit trail? (OQ-30) · jadwal settlement liability

## Update

```bash
./scripts/flows-gate.sh f15-super-admin   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).

Terakhir diperbarui: 2026-09-22 — dasar `C-12` + PRD §5C (deposit **3,50 JOD**); isi dashboard liability dikoreksi (customer + merchant + tips kurir, **bukan gaji kurir** — `C-06`). Validate 9/9 pass, deliver exit 0 (spec `dad72198`, artifact `b7f33c9b`), visual-check pass (1440x900, 2048x1320 light + dark, overflow 0).
