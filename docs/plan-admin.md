# Plan — Super Admin Console (E2E UI/UX)

Front-end showcase only. Mock data, Redux state, tanpa backend/API/auth/DB/payment.
Sumber: flow `docs/design/flows/f15-super-admin/` + `docs/design/flows/f8-dispute/`
dan milestone **M6/M9** PRD aktif `irbid-mvp-v2-2026-09-21`.

**Status: S0–S4 selesai.** Verifikasi: build 0 error, lint bersih, overflow
horizontal 0 di 390px & 1440px, shell 430px terkunci.

## Prinsip

- **Shell 430px, sama seperti role lain.** Arah ke depan — SA jadi **website penuh
  non-PWA** (konsol desktop) — dicatat di `/documentation`, **belum dikerjakan**.
  Kalau nanti dibangun, pengecualian lebar wajib didokumentasikan dulu, bukan
  bocor diam-diam (AGENTS §9).
- Semua nominal konsol SA dalam **JOD** (PRD aktif). IDR→JOD di form sengketa
  memakai rate contoh M1 (Rp23.000) dan dilabeli sementara karena M1 belum ada.
- Aksi SA = state yang ditampilkan: approve, suspend, blacklist, resolusi tidak
  menyentuh uang sungguhan (AGENTS §1).
- Reuse: `BottomNav` (turunan `AdminBottomNav`), `JourneyLine` tidak dipakai di
  sini karena konsol ini tidak menampilkan perjalanan order.
- Gaya baru ke `src/styles/system/_admin.scss` (namespace `.admin-*`), didaftarkan
  di facade `_system.scss`.
- Tanpa dependency baru. Token dari `_tokens.scss`, tanpa nilai mentah.
- Prefix URL `/admin/*` dengan basename sendiri; PWA-nya bisa diinstall sendiri
  (`public/manifest-admin.json`).
- Ikuti batas baris `.rules.json`: page ≤700, component ≤600, hook ≤150, data ≤500,
  style ≤600.

## Route & Peta Layar

| Route | Layar |
|---|---|
| `/admin` | Ringkasan — liability agregat, flag saldo Xendit, alert SLA |
| `/admin/onboarding` | Queue tenant — review, verifikasi deposit → held, tolak |
| `/admin/disputes` | Queue sengketa — investigasi + 4 tombol resolusi |
| `/admin/merchants` | Master tenant — suspend + blacklist COD (dua sisi) |
| `/admin/ledger` | Entry ledger append-only |

Form sengketa (F8) satu komponen, dipasang di dua peran:

| Route | Layar |
|---|---|
| `/customer/dispute` | Ajukan Sengketa — dari layar pesanan tiba |
| `/merchant/dispute` | Ajukan Sengketa — dari order selesai |

**Tanpa auth admin.** PRD aktif tidak punya requirement auth/audit SA → ditandai
`UNRESOLVED-by-absence`, bukan ditebak.

---

## S0 — Fondasi

- `src/types.ts` — `TenantStatus`, `DepositStatus`, `AdminTenant`, `DisputeStatus`,
  `DisputeResolution`, `Dispute`, `LedgerEntryType`, `LedgerEntry`, `LiabilitySummary`,
  `AdminMerchant`, `AdminEscalation`.
- `src/data/admin.ts` — label status, `jod()`, `idrToJod()`, `MOCK_JOD_RATE`,
  `DISPUTE_CATEGORIES`, `RESOLUTIONS`, mock (`adminTenants`, `adminMerchants`,
  `adminDisputes`, `adminLedger`, `adminEscalations`, `mockLiability`), plus fungsi
  murni `totalLiability()`, `liabilityGap()`, `openDisputeCount()`,
  `pendingTenantCount()`, `ledgerEntryFor()`.
- `src/store/slices/adminSlice.ts` — `tenants`, `merchants`, `disputes`, `ledger`,
  `liability`, `escalations`, `customerRiskFlags`; aksi `approveDeposit`,
  `rejectOnboarding`, `suspendMerchant`, `blacklistCod`, `startInvestigation`,
  `resolveDispute`, `fileDispute`, `clearEscalation`. Terdaftar di
  `src/store/index.ts`, **tidak dipersist**.
- `src/components/layout/AdminBottomNav.tsx` (5 tab) + `src/components/admin/AdminPageHeader.tsx`.
- Route `adminRoutes`; `RolePlaceholder` **dihapus** (semua prefix peran terisi).

## S1 — Ringkasan (`/admin`)

- Liability: total + rincian customer/merchant/tips kurir + saldo Xendit mock.
- Flag kalau saldo Xendit < total liability (M9).
- Catatan: gaji kurir tidak masuk hitungan (C-06).
- Alert SLA masuk + aksi tindak/batalkan.

## S2 — Onboarding (`/admin/onboarding`)

- Queue `tenantStatus: pending`: data merchant, foto, `deliveryConfig`, deposit.
- **Deposit gate**: tombol verifikasi transfer hanya saat `unpaid` → `held` +
  `approved`; tolak → `suspended`.
- Riwayat keputusan.

## S3 — Sengketa & Merchant

- `/admin/disputes`: buka investigasi (`open → investigating`), lalu 4 resolusi
  (refund penuh / sebagian / release / tolak) — tiap putusan uang menambah **1 entry
  ledger**; `no_action` tidak.
- `/admin/merchants`: suspend + blacklist COD yang menandai **dua sisi**
  (`merchant.tenantStatus: blacklisted` + `customer.riskFlag`).
- `/admin/ledger`: append-only, tanpa edit/hapus; koreksi lewat entry baru.

## S4 — Form sengketa (F8) & polish

- `src/pages/DisputeSubmit.tsx` satu komponen untuk customer + merchant; masuk ke
  queue SA via `fileDispute`.
- Titik masuk: layar pesanan tiba (customer) dan order selesai (merchant).
- Responsif 390px & 1440px, overflow horizontal 0, shell 430px.
- `npm run lint`, `npm run build`.
- **Integrasi `/documentation`**: section "Super Admin Console", baris route, dan
  catatan arah website penuh non-PWA di Layout Exceptions.
- Update `docs/design/flows/f15-super-admin/README.md` + `f8-dispute/README.md`,
  `AGENTS.md` §9, `README.md`.
- Record atlas node.

---

## UNRESOLVED (jangan ditebak)

- **Konfigurasi kuota tier** — belum ada field di schema; tidak dibangun.
- **Kategori & window dispute** — placeholder sampai OQ-29 ditutup; dilabeli di layar.
- **Siapa admin / audit trail** (OQ-30) — tidak dibangun.
- **Jadwal settlement liability** — belum ada; angka liability murni tampilan.
- **Auth admin** — tidak ada requirement di PRD aktif (`UNRESOLVED-by-absence`).

## Keputusan

1. **Shell tetap 430px.** Opsi lebar desktop ditunda; keputusan sadar dicatat di
   `/documentation`, arah website penuh non-PWA dicatat untuk nanti. ✅
2. **Form sengketa satu komponen, dua peran.** Mencegah dua jalur submit menyimpang;
   keduanya mendarat di queue SA yang sama. ✅
3. **`no_action` tidak menulis ledger.** Putusan itu tidak mengubah saldo, jadi
   tak ada yang dicatat (beda dari refund/release yang menambah 1 entry). ✅
