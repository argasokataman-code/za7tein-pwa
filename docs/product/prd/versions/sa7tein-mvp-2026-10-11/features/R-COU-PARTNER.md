# R-COU-PARTNER — Kurir mitra aplikator (satu order per waktu)

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §7.3, §9.3, §9.5, §12 (COU-15..18) · flow `f26-quick-dispatch`, `f21-account-auth` · milestone **M6**.
Status: partial · terakhir ditinjau: 2026-10-16.

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

- **Kurir mitra** — `/courier/partner`: chip status, daftar assignment menunggu, riwayat, sheet tolak ber-alasan.
- **Ops** — penerbit SP (lihat UNRESOLVED), dispatch.
- **Merchant** — memicu dispatch Quick (ditahan `QUICK_DISPATCH_AVAILABLE = false`).

## 4. Masukan → keluaran

- Masuk: assignment (`sendAssignment`) + status mitra.
- Keluar: `approved`/`rejected{reason}`, status mitra (`reserved` → `busy`/`available`), SP (`warningLetters`).

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

## 6. Kontrak BE (handoff, repo ini mock)

- State `courier_partner.status: offline|available|reserved|busy`.
- Event: `assignment_sent`, `approved`, `rejected{reason}`, `sp_issued`.
- Tabel `courier_partners` + `courier_assignments` + `orders.delivery_kind/courier_partner_id`; RPC `my_partner_assignments()`, `approve_assignment()`, `reject_assignment()`, `expire_assignments()`. Detail: `docs/integration/courier-partner/be-contract.md`.

## 7. Acceptance (terukur)

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Status mitra 4 nilai tampil sebagai chip | `CourierPartnerStatus` + `STATUS_LABEL` | ✅ `src/pages/CourierPartner.tsx:13-26` |
| AC2 | Approve mengubah assignment → `approved` dan mitra → `busy` | `approveAssignment` | ✅ `src/store/slices/partnerSlice.ts:43-50` |
| AC3 | Reject butuh alasan; kirim nonaktif saat kosong | `confirmDisabled={!reason.trim()}` + guard reducer | ✅ `CourierPartner.tsx:172`, `partnerSlice.ts:52-61` |
| AC4 | Satu order per waktu | mitra `busy` setelah approve; tak ada assignment kedua | ✅ (mock) |
| AC5 | Reject melepas reservasi → `available` | reducer | ✅ `partnerSlice.ts:59-60` |
| AC6 | Riwayat menampilkan alasan tolak | baris "Alasan: …" | ✅ `CourierPartner.tsx:156-158` |
| AC7 | SP tercatat pada mitra | `issueWarningLetter` | ⚠️ reducer ada, **tanpa pemanggil UI**; penerbit UNRESOLVED |
| AC8 | Tidak merespons → expire + pengganti + SP + off | alur `expire_assignments()` | ❌ tidak ada di FE |
| AC9 | 100% fee Quick ke mitra | entri fee Quick = fee penuh | ❌ belum ada (fee Quick belum dibedakan) |
| AC10 | Quick COD talangi tunai ke merchant | alur talangan saat pickup | ❌ tidak ada |
| AC11 | Assignment nyata dari dispatch, bukan demo | dispatch jalur BE | ❌ `sendAssignment` mock; `QUICK_DISPATCH_AVAILABLE=false` |
| AC12 | Login mitra WA E.164 | halaman masuk mitra | ⚠️ mock (`f21`) |

## 8. UNRESOLVED

- **Penerbit SP**: ops manual vs trigger otomatis (§18, OPS-10) — jangan diisi tebakan.
- Pemulihan "Quick tak tersedia" (batal/refund/ubah ke Regular) — `f26` Q10.
- Model kurir ganda: `courier_partners` terpisah vs `couriers` + penanda jenis.

## 9. Bukti

- Kode: `src/pages/CourierPartner.tsx`, `src/store/slices/partnerSlice.ts`, `src/data/marketplace.ts` (`mockCourierPartners`, `mockAssignments`, `PARTNER_SELF_ID`, `QUICK_DISPATCH_AVAILABLE`), `src/types.ts` (`CourierPartner`, `CourierAssignment`).
- Kontrak BE: `docs/integration/courier-partner/be-contract.md`.
- Flow: `docs/design/flows/f26-quick-dispatch/`.
