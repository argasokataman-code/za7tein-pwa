# R-COU-PARTNER — Kurir mitra aplikator (satu order per waktu)

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §7.3, §9.3, §9.5, §12 (COU-15..18) · flow `f26-quick-dispatch`, `f21-account-auth` · milestone **M6**.
Status: partial · terakhir ditinjau: 2026-10-20.

## 1. Untuk apa

Order **Quick** tidak lewat batch. Aplikator mengirim assignment ke **kurir mitra** yang sedang online; kurir menerima atau menolak **dengan alasan**. Kurir mitra hanya menangani **satu order per waktu**, dan fee-nya 100% milik kurir. Kalau kurir tidak merespons sampai prepare selesai, sistem mencari pengganti dan kurir kena **SP**.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| P1 | Kurir mitra **dikelola aplikator**, bukan karyawan merchant | §7.3 |
| P2 | **Satu order per waktu** | §9.3 |
| P3 | Status: `offline` / `available` / `reserved` / `busy` | §9.3 |
| P4 | Assignment → **approve** atau **reject ber-alasan**; tombol kirim aktif setelah alasan diisi | §12 COU-18 |
| P5 | Tidak merespons sampai prepare selesai → cari pengganti + **SP + punishment + status off** | §9.5 |
| P6 | **100%** delivery fee Quick ke kurir mitra saat selesai | R-DELIV-FEE |
| P7 | Quick **COD**: kurir menalangi tunai ke merchant saat pickup, lalu menerima seluruh tunai dari customer | §16.3 |
| P8 | Login mitra = nomor WA E.164 (bukan email) | `f21-account-auth` |

## 3. Aktor & permukaan

- **Kurir mitra** — `/courier/partner`: chip status, daftar assignment menunggu, riwayat, sheet tolak ber-alasan. Permukaan mitra terpisah: tanpa batch/tips/dompet kurir toko, nav hanya Tugas + Profil.
- **Ops** — penerbit SP (lihat UNRESOLVED), dispatch.
- **Merchant** — memicu dispatch Quick (tombol aktif lewat `QUICK_DISPATCH_AVAILABLE = true`; pemilihan kandidat masih manual, algoritma OPEN-11 belum ada).

## 4. Masukan → keluaran

- Masuk: assignment `reserved` (`dispatch_assignments`, ditulis saat merchant menugaskan mitra) + status mitra (`couriers.availability`).
- Keluar: `approved`/`rejected{reason}` + `responded_at` di `dispatch_assignments`, status mitra (`reserved` → `busy`/`available`), SP aktif dari `punishments`.

## 5. State UI

| State | Tampilan |
|---|---|
| offline | "Offline, belum menerima assignment" |
| available | "Available, masuk antrean dispatch" |
| reserved | "Reserved, menunggu keputusanmu" |
| busy | "Busy, sedang mengantar satu order" |
| tak ada assignment | "Belum ada assignment baru." |
| riwayat | label status + waktu respons + alasan tolak |
| tolak | sheet + textarea alasan; kirim **nonaktif** saat kosong |
| tanpa respons (Q06) | riwayat "Kedaluwarsa · waktu" + "SP dicatat ke mitra (COU-17)" + "Diganti oleh \<nama>"; mitra `offline` (chip paling penting, kontras AA) |

## 6. Kontrak BE (dipakai sekarang)

- Tabel live: `couriers` (`user_id`, `courier_type='partner'`, `availability`), `dispatch_assignments` (`status` default `reserved`, `reject_reason`, `reserved_at`, `responded_at`), `punishments` (`subject_type='courier'`, `status='issued'`).
- Sesi: akun demo mitra (`partner@sa7tein.app`) karena login WA E.164 belum ada; layar memakai `src/api/partner.ts`, mock hanya fallback.
- Belum ada: `expire_assignments()`, RPC `dispatch_courier()`, event realtime `assignment_sent`, dan `issue_sp()`. Model `courier_partners` terpisah tetap **UNRESOLVED** — implementasi sementara memakai `couriers` + penanda jenis.

## 7. Acceptance (terukur)

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Status mitra 4 nilai tampil sebagai chip | `CourierPartnerStatus` + `STATUS_LABEL` | ✅ `src/pages/CourierPartner.tsx:13-26` |
| AC2 | Approve mengubah assignment → `approved` dan mitra → `busy` | reducer + `respondPartnerAssignment` + `couriers.availability` | ✅ `partnerSlice.ts:43-50`, `src/api/partner.ts`; terukur di D1: `dispatch_assignments.status='approved'`, `responded_at` terisi, `couriers.availability='busy'` |
| AC3 | Reject butuh alasan; kirim nonaktif saat kosong | `confirmDisabled={!reason.trim()}` + guard reducer + `reject_reason` BE | ✅ `CourierPartner.tsx`, `partnerSlice.ts:52-61`; terukur: baris BE `status='rejected'`, `reject_reason='sedang di luar radius'` |
| AC4 | Satu order per waktu | mitra `busy` setelah approve; tak ada assignment kedua | ✅ (mock + status BE) |
| AC5 | Reject melepas reservasi → `available` | reducer + `couriers.availability` | ✅ `partnerSlice.ts:59-60`, `src/api/partner.ts`; terukur di D1 `availability='available'` |
| AC6 | Riwayat menampilkan alasan tolak | baris "Alasan: …" | ✅ `CourierPartner.tsx` |
| AC7 | SP tercatat pada mitra | `punishments` (`subject_type='courier'`, `status='issued'`) | ✅ dibaca nyata lewat `fetchPartnerBoard` (`warningLetters` = jumlah baris issued) dan tampil "N SP aktif"; penulisan SP tetap milik ops/UNRESOLVED |
| AC8 | Tidak merespons → expire + pengganti + SP + off | alur `expire_assignments()` | ⚠️ akibatnya dimainkan lokal (`expireAssignment` + `issueWarningLetter`); BE belum punya `expire_assignments()`, jadi baris assignment tidak berubah. Bukti Chromium asli (klik nyata 356×44): chip `Offline`, "1 SP aktif", riwayat "Kedaluwarsa · Diganti oleh Salim", overflow-x 0 |
| AC9 | 100% fee Quick ke mitra | entri fee Quick = fee penuh | ❌ belum ada (fee Quick belum dibedakan) |
| AC10 | Quick COD talangi tunai ke merchant | alur talangan saat pickup | ❌ tidak ada |
| AC11 | Assignment nyata dari dispatch, bukan demo | dispatch jalur BE | ⚠️ penugasan manual merchant menulis baris `dispatch_assignments` `reserved` + `couriers.availability='reserved'` (`assignOrderCourier`, sesi CS karena RLS merchant 403); evaluasi/pemilihan kandidat otomatis (`dispatch_courier()`, OPEN-11) belum ada |
| AC12 | Login mitra WA E.164 | halaman masuk mitra | ⚠️ mock (`f21`) |
| AC13 | Mitra tidak melihat batch/tips/dompet kurir toko | buka `/courier/` dengan `courierKind='partner'` | ✅ redirect ke `/partner` (`CourierTasks`); nav mitra hanya Tugas + Profil (`CourierBottomNav`); profil mitra memakai identitas `couriers` |

## 8. UNRESOLVED

- **Penerbit SP**: ops manual vs trigger otomatis (§18, OPS-10) — jangan diisi tebakan. FE memainkan keduanya sebagai simulasi; pemicu produksi = `expire_assignments()` + ops.
- Pemulihan "Quick tak tersedia" (batal/refund/ubah ke Regular) — `f26` Q10.
- Model kurir ganda: `courier_partners` terpisah vs `couriers` + penanda jenis.

## 9. Bukti

- Kode: `src/pages/CourierPartner.tsx` (identitas dari `partnerSlice.selfId`, tombol Istirahat/Masuk antrean, accept/reject memanggil API), `src/api/partner.ts` (`fetchPartnerBoard`, `toPartner`, `toAssignment`, `setPartnerAvailability`, `respondPartnerAssignment`), `src/api/orders.ts` (`assignOrderCourier` menulis `reserved` + reservasi mitra lewat sesi CS), `src/hooks/useApiPartner.ts`, `src/store/slices/partnerSlice.ts` (`hydratePartnerBoard`, `expireAssignment:74-94`, `issueWarningLetter`), `src/styles/system/_courier-partner.scss` (`.courier-partner-availability` 44px).
- Data: `couriers` id 7 (`user_id=28`, `courier_type='partner'`), `dispatch_assignments` (baris `reserved` → `approved`/`rejected` terverifikasi di D1), `punishments` dibaca sebagai SP aktif.
- Terukur di jendela app-mode kurir (390px): board live menampilkan "Rani Saputra / Available / 0 order aktif", tombol Istirahat 44px; assignment `reserved` tampil "Order 3 · Menunggu respons" dengan chip Reserved; klik nyata Terima → `approved` + `availability='busy'`; Tolak ber-alasan → `rejected` + alasan tersimpan + `available`; overflow-x 0.
- Self-check: `scripts/partner-check.mjs` (reject tanpa alasan, satu order per waktu, SP, expire + pengganti, tanpa kandidat, guard assignment final, pemetaan `reserved`→pending, `sqlIso`, `toPartner`, `toAssignment`, `hydratePartnerBoard`).
- Kontrak BE: `docs/integration/courier-partner/be-contract.md`.
- Flow: `docs/design/flows/f26-quick-dispatch/` (Q02–Q05).
