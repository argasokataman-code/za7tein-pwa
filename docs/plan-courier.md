# Plan — Courier Console (E2E UI/UX)

Front-end showcase only. Mock data, Redux state, tanpa backend/API/auth/DB/payment.
Sumber: flow `docs/design/flows/f13-courier-view/` + milestone M4/M5 PRD aktif
`irbid-mvp-v2-2026-09-21`.

**Status: K0–K4 selesai.** Verifikasi: build 0 error, lint bersih, overflow
horizontal 0 di 390px & 1440px, shell 430px terkunci.

## Prinsip

- Brief kurir: **"minimalis satu tangan"** — satu kolom, satu tombol utama per
  layar, target 44px, tanpa tabel.
- **Dua sumbu ditampilkan berdampingan, jangan digambar ulang:** `JourneyLine`
  (sumbu order: diterima → dimasak → diantar → tiba) dan stepper checkpoint
  kurir (masuk → ambil → berangkat → tiba → OTP → selesai). Journey Line sudah
  komponen bersama; stepper baru tinggal di `_courier.scss`.
- Gaya baru ke `src/styles/system/_courier.scss` (namespace `.courier-*`),
  didaftarkan di facade `_system.scss`. `_merchant-2.scss` sudah 598 baris —
  jangan ditambah.
- Tanpa dependency baru. Token dari `_tokens.scss`, tanpa nilai mentah.
- Prefix URL `/courier/*` dengan basename router sendiri; PWA-nya bisa diinstall
  sendiri (`public/manifest-courier.json`).
- Bar `fixed` wajib `max-width: var(--shell-max); margin-inline: auto` (sudah
  diatur `BottomNav` global).
- Ikuti batas baris `.rules.json`: page ≤700, component ≤600, hook ≤150, data ≤500,
  style ≤600.

## Route & Peta Layar

| Route | Layar |
|---|---|
| `/courier` | Tugas — toggle siap/jeda, tugas berjalan, riwayat |
| `/courier/task/:id` | Detail tugas — JourneyLine + stepper + SLA timer + OTP + guard batal |
| `/courier/tips` | Tips — hanya tips yang jadi milik kurir (C-06) |
| `/courier/profile` | Profil kurir + status |

**Tanpa layar login.** PRD aktif tidak punya requirement auth kurir; kurir
adalah karyawan merchant (C-06) dan dikelola merchant. Ditandai
`UNRESOLVED-by-absence`, bukan ditebak.

---

## K0 — Fondasi

- `src/types.ts` — `CourierCheckpoint`, `CourierTask` (turunan pola `MerchantOrder`).
- `src/data/courier.ts` — `COURIER_STEPS`, `COURIER_CHECKPOINT_ORDER`,
  `COURIER_CHECKPOINT_LABEL`, `COURIER_ACTION_LABEL`, `COURIER_SLA_MINUTES`,
  `COURIER_GUARD_MINUTES`, `courierSelf`, `courierTasks`, plus fungsi murni
  `nextCheckpoint()`, `courierStepIndex()`, `slaRemainingMs()`, `elapsedMinutes()`,
  `formatCountdown()`, `totalTips()`.
- `src/store/slices/courierSlice.ts` — `isOnline`, `tasks`; aksi `toggleOnline`,
  `advanceCheckpoint`, `cancelTask`, `completeTask`. Terdaftar di
  `src/store/index.ts` combineReducers, **tidak dipersist** (mock).
- `src/hooks/useTick.ts` — `Date.now()` ber-tick untuk hitung mundur.
- `src/components/layout/CourierBottomNav.tsx` — 3 tab (Tugas, Tips, Profil),
  turunan `BottomNav`.
- `src/components/courier/CourierPageHeader.tsx` — header sticky per peran.
- Route `courierRoutes` + `RolePlaceholder` dipersempit ke `admin` saja.

## K1 — Tugas (`/courier`)

- Toggle siap/jeda dari `courierSlice.isOnline`.
- Kartu tugas berjalan: kode, customer, jarak/zona, alamat lantai+unit, item,
  total, badge checkpoint, CTA metode bayar (COD tagih tunai / transfer cek bukti).
- Riwayat + total tips hari ini.

## K2 — Detail tugas (`/courier/task/:id`)

- `JourneyLine stage={task.orderStage}` — sumbu order.
- Stepper checkpoint kurir dari `courierStepIndex()`.
- SLA countdown dari `slaRemainingMs()` + `useTick()`; lewat SLA → "super admin
  ditandai otomatis".
- Aksi utama per checkpoint dari `COURIER_ACTION_LABEL` (Ambil / Berangkat / Tiba).
- **Guard customer lalai** saat `tiba`: call di +5 menit, tombol Batal aktif di
  +10 menit.
- **OTP**: input 4 digit, divalidasi di layar sebelum `completeTask` — tanpa OTP
  benar tidak bisa settle (C-09).
- Penalti customer (OQ-14) dan SLA 15/30/10 (OQ-13) ditampilkan sebagai catatan
  `UNRESOLVED`/sementara, bukan angka yang dipilih diam-diam.

Done-when: menekan aksi memindahkan checkpoint, timer jalan, OTP salah ditolak,
OTP benar menyelesaikan tugas, `JourneyLine` dipakai (bukan SVG baru).

## K3 — Tips & Profil

- `/courier/tips`: total + riwayat tips; menyatakan ongkir bukan milik kurir dan
  platform tak menahan dana kurir (C-06).
- `/courier/profile`: identitas `courierSelf`, merchant pemilik, toggle status,
  catatan `UNRESOLVED-by-absence` soal login kurir.

## K4 — Polish & Verifikasi

- Responsif 390px & 1440px, overflow horizontal 0, shell 430px.
- Tanpa emoji, tanpa warna di luar token, tanpa `var()` tak terdefinisi.
- `npm run lint`, `npm run build`.
- **Integrasi `/documentation`**: section "Courier Console" + baris route.
- Update `docs/design/flows/f13-courier-view/README.md` (status develop) dan
  `AGENTS.md` §9.
- Record atlas node.

---

## Keputusan

1. **Checkpoint tersimpan berhenti di `tiba`.** Node `otp` flow F13 bukan state
   tersimpan — ia langkah di dalam `tiba` (sudah tiba, menunggu kode). Stepper
   tetap menampilkan lima langkah. ✅
2. **Tanpa auth kurir.** Tiada requirement di PRD aktif; ditandai
   `UNRESOLVED-by-absence`. ✅
3. **Dua sumbu di detail.** Journey Line (order) + stepper checkpoint (kurir) —
   reuse, bukan gambar ulang. ✅
