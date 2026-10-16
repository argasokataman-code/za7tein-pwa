# F8 — Dispute (Queue Panel Admin / CS)

Workflow dispute = antrian kerja panel admin (CS), bukan portal sengketa. Milestone **M6** (deps M0, M4, M5); PRD aktif `irbid-mvp-v2-2026-09-21`. **Sudah di-develop (basis UI)**: form "Ajukan Sengketa" di sisi customer (`/customer/dispute`) dan merchant (`/merchant/dispute`) + queue resolusi di `/admin/disputes` — lihat `docs/plan-admin.md`.

> Catatan 2026-10-17 (R-DISPUTE-RULE, M9a). Antrian di flow ini menyelesaikan sengketa **satu per satu** oleh CS; §18 meminta lapisan di bawahnya — rule yang dibuat ops, dipilih merchant lewat multi-select, dan diikuti customer serta kurir pada order yang sama. Mesinnya sudah ada di `src/data/rules.ts` (katalog + `ruleForOrder()`/`compensationForRule()`/`punishmentForRule()`/`snapshotRule()`, ditahan `scripts/rule-check.mjs`), dan pilihannya di `/merchant/settings` seksi "Rule sengketa". Yang **belum** tersambung ke flow ini: putusan CS belum menunjuk rule yang diterapkan (field `ruleId`/`decision`/`decidedBy` sudah ada di tipe `Incident`, tapi antrian f8 masih menulis putusan pada `Dispute`), bukti gambar masih di sisi layar saja (R2 belum ada), dan eksekusi kompensasi → ledger belum ada.

| Berkas | Isi |
|---|---|
| `f8-dispute.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f8-dispute.html` | Artefak jadi |
| `f8-dispute.visual-check.*` | Bukti visual-check |

## Alur

**Lane Pengaju:** Ajukan Sengketa (alasan + kategori + foto ≤3, opsional) → `dispute_filed`.

**Lane Panel Admin (CS):** Queue Disputed (1× per order) → Buka bukti (log OTP, geolocation Tiba, foto kurir, timestamp checkpoint) → Pilih resolusi (4 aksi).

**Lane Banding (PO 2026-09-23).** Setelah putusan level-1, pihak pengaju bisa meminta SA meninjau ulang (`Banding` di layar order). Satu banding per sengketa; putusan CS tetap berlaku sampai SA memutuskan. **Banding digambar di `f22-super-admin-sa:appeal`** (plus `e-banding` di `INDEX.json`), bukan sebagai lane di diagram ini; keputusan SA yang mengubah putusan = 1 entry ledger baru, bukan menimpa yang lama.

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
- **UNRESOLVED (jangan ditebak):** OQ-29 — finalisasi window/kategori/SLA (ditunda sampai >5/bulan); **banding** — siapa yang boleh mengajukan (pengaju sengketa saja atau kedua pihak) dan apakah ada window/SLA banding. Kode saat ini: hanya pihak pengaju, tanpa window.
- **OQ-30 sudah dijawab (PO 2026-09-23):** operator CS dibuat SA di konsol `f22`; banding diputus SA, bukan CS.

## Update

```bash
./scripts/flows-gate.sh f8-dispute   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate **9/9, 0 error, 0 warning**; deliver exit 0; visual-check pass 4 viewport (light + dark).
