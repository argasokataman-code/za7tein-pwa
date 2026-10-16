# Kontrak BE — API kurir partner & dispatch (M6)

Repo ini front-end (AGENTS.md §1). Dokumen ini mencatat jalur data yang **belum
ada** di BE untuk jalur Quick (kurir partner + dispatch), plus yang perlu
ditambahkan supaya UI yang sudah dibangun (`/courier/partner`, layar dispatch
merchant) berhenti memakai mock.

Rujukan: PRD aktif `sa7tein-mvp-2026-10-11` §7.3, §9.3, §9.4 (usulan), §9.5,
§13 (OPS-10/OPS-13), §16.3, §18; flow `docs/design/flows/f26-quick-dispatch/`;
gap per layar `ui-impact.md` §8.

## 0. Ringkas kondisi sekarang

| Hal | Keadaan |
|---|---|
| Sumber state | 100% klien: `partnerSlice` (`src/store/slices/partnerSlice.ts`), mock `mockCourierPartners`/`mockAssignments` (`src/data/marketplace.ts`), dipersist (whitelist `partner`) |
| Tabel BE | **tidak ada**: tak ada `courier_partners`, tak ada `courier_assignments` |
| `orders` | **tak punya** kolom jenis pengantaran (Regular/Quick) maupun tautan assignment |
| Endpoint dispatch | **tidak ada** (OPEN-11 masih usulan algoritma) |
| Flag | `QUICK_DISPATCH_AVAILABLE = false` (`src/data/marketplace.ts`) menahan tombol dispatch merchant; layar kurir partner tetap dibangun terhadap mock |
| SP | **tidak ada**; **UNRESOLVED: siapa penerbit SP belum diputuskan PO** (`analysis.md:43/46`) |

Tabel `couriers` yang sudah ada (`docs/integration/courier/be-contract.md`) adalah
**kurir karyawan merchant** (inhouse). PRD memodelkan **dua jenis kurir**; apakah
partner masuk ke `couriers` dengan penanda jenis, atau tabel sendiri, **belum
diputuskan** (lihat §5).

## 1. Skema yang diusulkan

### 1.1 `courier_partners`

Kurir partner yang dikelola aplikator (bukan karyawan merchant).

| kolom | tipe | catatan |
|---|---|---|
| `id` | bigint pk | |
| `user_id` | uuid → `auth.users` | auth nomor WA E.164 (f21), sama pola `couriers.user_id` |
| `status` | text check | `offline \| available \| reserved \| busy` (§9.3) |
| `completed_today` | int | tie-break dispatch (§9.4) |
| `warning_letters` | int | SP aktif; kelayakan antrian (OPEN-11) |
| `last_location_at` | timestamptz null | kesegaran lokasi kandidat (§9.4) |
| `joined_at` | timestamptz | |

### 1.2 `courier_assignments`

| kolom | tipe | catatan |
|---|---|---|
| `id` | bigint pk | |
| `order_id` | bigint → `orders` | |
| `partner_id` | bigint → `courier_partners` | |
| `status` | text check | `pending \| approved \| rejected \| expired` |
| `reject_reason` | text null | wajib saat `rejected` (COU-18) |
| `sent_at` | timestamptz | |
| `responded_at` | timestamptz null | |
| `responded_by` | uuid null | `app_uid()` saat approve/reject (audit) |

Constraint: `check (status <> 'rejected' or coalesce(btrim(reject_reason),'') <> '')`
supaya alasan tak bisa kosong walau RPC dilewati.

### 1.3 `orders` (tambahan)

| kolom | tipe | catatan |
|---|---|---|
| `delivery_kind` | text check | `regular \| quick`; sekarang jenis pengantaran hidup di klien |
| `courier_partner_id` | bigint null → `courier_partners` | tautan assignment aktif |

Kolom jenis pengantaran ini **sudah tercatat sebagai gap** di `ui-impact.md` §8
(bersama `packed`/`batch_id`).

### 1.4 SP / punishment

Tabel diusulkan: `courier_partner_sp` (`id`, `partner_id`, `kind`, `reason`,
`issued_by`, `issued_at`). **`issued_by` sengaja tidak dikunci** karena PO belum
memutuskan penerbitnya (ops §18 manual vs trigger otomatis). Jangan diisi tebakan.

### 1.5 Config ops (parameter, bukan nilai tetap)

`platform_config` (atau setara): `dispatch_max_kms` (batas jarak kandidat),
`location_freshness_seconds` (kesegaran lokasi), `quick_fee_multiplier`
(OPS-13). Nilainya **config ops**, bukan konstanta FE.

## 2. Endpoint yang perlu ada

Semua lewat PostgREST + RPC `SECURITY DEFINER` dengan penjaga `public.app_uid()`,
mengikuti pola `courier_orders()` yang sudah dipakai (partner tak boleh membaca
`customers`/`addresses` langsung karena RLS-nya milik pemilik baris).

| endpoint | bentuk | aturan |
|---|---|---|
| `my_partner_assignments()` | RPC, tanpa arg | semua assignment milik partner `app_uid()`, diperkaya ringkasan order (nama customer, alamat, jenis, estimasi prepare) |
| `dispatch_courier(p_order_id)` | RPC | pilih kandidat (**idle terlama + batas jarak**, tie-break `completed_today` lalu jarak), set `reserved`, insert assignment `pending`, balikan assignment. **Algoritma OPEN-11 masih usulan** |
| `approve_assignment(p_id)` | RPC | hanya partner pemilik; `status pending` → `approved`, partner → `busy` |
| `reject_assignment(p_id, p_reason)` | RPC | hanya partner pemilik; alasan wajib; `pending` → `rejected`, partner → `available`, reservasi lepas (§9.5) |
| `expire_assignments()` | `pg_cron` | `pending` lewat tenggat prepare → `expired`; partner → `offline`; cari pengganti; **SP** (penerbit UNRESOLVED) |
| `issue_sp(p_partner_id, p_reason, p_issued_by)` | RPC | **bentuk menunggu keputusan siapa penerbit** (§18) |

### Event (realtime / notifikasi)

`courier_assignment_sent`, `courier_assignment_approved`,
`courier_assignment_rejected`, `courier_sp_issued`. Nama ini sudah dipakai di
`f26-quick-dispatch.milestones.md` (Q03, Q04, Q06) dan `INDEX.json`
(`R-COU-PARTNER + R-COU-DISPATCH`).

## 3. Pemetaan FE ↔ BE

| FE sekarang | BE nanti |
|---|---|
| `partnerSlice.partners[]` | `courier_partners` |
| `partnerSlice.assignments[]` | `courier_assignments` |
| `PARTNER_SELF_ID` (`marketplace.ts`) | sesi partner (`app_uid()`), bukan id tetap |
| `CourierPartner.status` | `courier_partners.status` |
| `CourierAssignment.status/rejectReason` | `courier_assignments.status/reject_reason` |
| `sendAssignment` (reducer) | `dispatch_courier()` |
| `approveAssignment` / `rejectAssignment` | `approve_assignment()` / `reject_assignment()` |
| `issueWarningLetter` (reducer) | `issue_sp()` (bentuk menunggu keputusan) |
| `QUICK_DISPATCH_AVAILABLE = false` (merchant) | ubah `true` setelah `dispatch_courier()` ada |

Layar `/courier/partner` (`src/pages/CourierPartner.tsx`) sudah menghormati
batas: `PlatformNotice` menyatakan assignment adalah data demo selama jalur ini
belum ada.

## 4. Urutan pengerjaan yang disarankan

1. `courier_partners` + `courier_assignments` + `orders.delivery_kind/courier_partner_id`.
2. `my_partner_assignments()` + `approve_assignment()` + `reject_assignment()` (partner bisa bekerja end-to-end).
3. `dispatch_courier()` (butuh keputusan OPEN-11) + event realtime; baru ubah `QUICK_DISPATCH_AVAILABLE`.
4. `expire_assignments()` + `issue_sp()` setelah PO memutuskan penerbit SP.

## 5. UNRESOLVED (jangan diisi tebakan)

- **Penerbit SP** (§18, OPS-10): ops manual vs trigger otomatis. `issued_by` dan `issue_sp()` sengaja dibiarkan terbuka.
- **Algoritma dispatch** (OPEN-11): dokumen ini menuliskan **usulan** PRD apa adanya (idle terlama + batas jarak + tie-break).
- **Tabel partner**: `courier_partners` terpisah vs `couriers` + penanda jenis (PRD "model kurir ganda").
- **Parameter ops** (`dispatch_max_kms`, `location_freshness_seconds`, `quick_fee_multiplier`): config ops, belum ada angkanya.
- **Pemulihan "Quick tak tersedia"** (`f26` Q10): batal / refund / ubah ke Regular belum diputuskan.
