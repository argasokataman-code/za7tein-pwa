# Kontrak BE — API kurir partner & dispatch (M6)

Repo ini front-end (AGENTS.md §1). Dokumen ini mencatat jalur data kurir partner /
Quick, mana yang **sudah dipakai** dan mana yang masih usulan. Rujukan: PRD aktif
`sa7tein-mvp-2026-10-11` §7.3, §9.3, §9.4 (usulan), §9.5, §13 (OPS-10/OPS-13),
§16.3, §18; flow `docs/design/flows/f26-quick-dispatch/`; gap per layar
`ui-impact.md` §8.

## 0. Ringkas kondisi sekarang (2026-10-20)

| Hal | Keadaan |
|---|---|
| Tabel BE | `couriers` (`courier_type='partner'`, `user_id`, `availability`), `dispatch_assignments` (`status` default `reserved`, `reject_reason`, `reserved_at`, `responded_at`), `punishments` |
| Baca/tulis FE | `src/api/partner.ts`: board mitra (identitas + assignment + SP), tulis `availability`, respons assignment. Mock tetap fallback |
| Penugasan | `assignOrderCourier` menulis `orders.courier_id` + baris `dispatch_assignments` `reserved` + `couriers.availability='reserved'`. Sesi **CS** (aplikator) karena RLS merchant menolak tulis tabel ini (403) |
| Sesi mitra | akun demo `partner@sa7tein.app`; login WA E.164 (f21) belum ada |
| Endpoint dispatch | **belum ada** RPC `dispatch_courier()` (OPEN-11); merchant memilih mitra manual |
| Expire | **belum ada** `expire_assignments()`; akibat Q06 hanya dimainkan di layar (tidak menulis BE) |
| SP | dibaca dari `punishments` `status='issued'`; **penulisan** milik ops — **UNRESOLVED: penerbit SP** (`analysis.md:43/46`) |
| Fee Quick / COD Quick | belum ada; fee belum dibedakan dari Regular |

Tabel `couriers` yang sudah ada (`docs/integration/courier/be-contract.md`) semula
**kurir karyawan merchant** (inhouse). PRD memodelkan **dua jenis kurir**; implementasi
sekarang memakai `couriers` + penanda `courier_type` sebagai pilihan sementara, bukan
keputusan final (lihat §5).

## 1. Skema yang dipakai vs diusulkan

### 1.1 Dipakai sekarang

- `couriers`: `user_id` (akun mitra), `courier_type='partner'`, `availability` (`available|reserved|busy|offline|unavailable`), `active_order_count`, `last_seen_at`.
- `dispatch_assignments`: `order_id`, `courier_id`, `status` (`reserved` = menunggu respons, `approved|rejected|expired`), `reject_reason`, `reserved_at`, `responded_at`.
- `punishments`: `subject_type='courier'`, `subject_id=couriers.id`, `status='issued'`.

### 1.2 Masih diusulkan

- `courier_partners` terpisah + `courier_assignments` (§5, model kurir ganda belum diputuskan).
- `orders.delivery_kind` (`regular|quick`) dan `orders.courier_partner_id`.
- Tabel/endpoint SP khusus partner — cukup `punishments` selama penerbitnya belum diputuskan.
- Config ops: `dispatch_max_kms`, `location_freshness_seconds`, `quick_fee_multiplier` (parameter, bukan konstanta FE).

## 2. Endpoint

| endpoint | bentuk | status |
|---|---|---|
| board mitra | `GET couriers?user_id=eq.<auth id>` + `GET dispatch_assignments?courier_id=eq.<id>` + `GET punishments?...` | ✅ dipakai (`fetchPartnerBoard`) |
| set availability | `PATCH couriers?id=eq.<id> {availability}` | ✅ dipakai |
| approve/reject | `PATCH dispatch_assignments?id=eq.<id> {status, responded_at, reject_reason}` | ✅ dipakai (REST langsung; RPC belum) |
| kirim assignment | `POST dispatch_assignments {order_id, courier_id}` (default `reserved`) | ✅ dipakai saat merchant menugaskan |
| `dispatch_courier(p_order_id)` | RPC pilih kandidat (**idle terlama + batas jarak**, tie-break, OPEN-11) | ❌ usulan |
| `expire_assignments()` | `pg_cron`: `reserved` lewat tenggat → `expired`, mitra `offline`, pengganti, SP | ❌ usulan |
| `issue_sp(...)` | RPC | ❌ menunggu keputusan penerbit |

### Event (realtime / notifikasi)

`courier_assignment_sent`, `courier_assignment_approved`,
`courier_assignment_rejected`, `courier_sp_issued` — belum ada; nama dipakai di
`f26-quick-dispatch.milestones.md`.

## 3. Pemetaan FE ↔ BE

| FE | BE |
|---|---|
| `partnerSlice.selfId` | `couriers.user_id` = id akun sesi mitra |
| `CourierPartner.status` | turunan: ada assignment `reserved` → `reserved`; selain itu `couriers.availability` |
| `CourierPartner.activeOrders` | `couriers.active_order_count` (order aktif, bukan selesai hari ini) |
| `CourierPartner.warningLetters` | jumlah `punishments` `issued` |
| `CourierAssignment.status` | `reserved` → `pending`; `approved|rejected|expired` apa adanya |
| `sendAssignment` (reducer) | `POST dispatch_assignments` (manual pick; `dispatch_courier()` belum) |
| `approveAssignment` / `rejectAssignment` | `PATCH dispatch_assignments` + `PATCH couriers.availability` |
| `expireAssignment` / `issueWarningLetter` | belum ada padanan BE (simulasi layar) |

## 4. Urutan pengerjaan

1. ✅ `couriers` partner + `dispatch_assignments` + baca/tulis board mitra.
2. ✅ Approve/reject + availability tersimpan.
3. ⏳ `dispatch_courier()` (butuh keputusan OPEN-11) + event realtime.
4. ⏳ `expire_assignments()` + `issue_sp()` setelah PO memutuskan penerbit SP.
5. ⏳ Fee Quick 100% + talangan COD Quick (ranah uang, terpisah).

## 5. UNRESOLVED (jangan diisi tebakan)

- **Penerbit SP** (§18, OPS-10): ops manual vs trigger otomatis. Implementasi membaca `punishments`, tidak menulis.
- **Algoritma dispatch** (OPEN-11): dokumen ini menuliskan **usulan** PRD apa adanya.
- **Tabel partner**: `courier_partners` terpisah vs `couriers` + penanda jenis. Kode memakai yang kedua sementara; keputusan PO masih terbuka.
- **Parameter ops** (`dispatch_max_kms`, `location_freshness_seconds`, `quick_fee_multiplier`): config ops, belum ada angkanya.
- **Pemulihan "Quick tak tersedia"** (`f26` Q10): batal / refund / ubah ke Regular belum diputuskan.
