# R-REALTIME — Event realtime via WebSocket

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §19, §21.1 (ARC-08), §21.2 (NFR-05, NFR-06) · flow `f1-order-lifecycle` + `f11-push-notification` + `f13`/`f14` · milestone **M7**.
Status: partial · terakhir ditinjau: 2026-10-16.

## 1. Untuk apa

Semua perubahan status yang terlihat di layar harus datang sendiri ke client yang berhak, tanpa refresh dan tanpa polling agresif. Setelah koneksi putus (HP masuk kantong, jaringan pindah), client harus menyusul state yang terlewat, dan kontrak pesannya harus ber-versi supaya PWA dan aplikasi native bisa berjalan berdampingan.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| A1 | Setiap perubahan state observable dipublikasikan sebagai **event realtime via WebSocket** ke semua client berhak, **tanpa diminta** | §19, ARC-08 |
| A2 | Audiens per event mengikuti matriks §19 (kolom: customer pemilik order, merchant, kurir terkait, ops, customer lain) | §19 |
| A3 | Saat WebSocket tersambung kembali, client **menyinkronkan ulang state yang terlewat** | NFR-05 |
| A4 | **Kontrak pesan WebSocket diberi versi**, agar PWA & native berdampingan | NFR-06 |
| A5 | Fan-out event publik (buka/tutup, ketersediaan menu, rating, ketersediaan Quick, kurs) bisa banyak penerima sekaligus | §19 |
| A6 | Event happening di luar matriks tidak boleh dikirim ke peran yang tidak berhak (mis. `sp_issued` hanya ke kurir partner terkait + ops) | §19 |

## 3. Acceptance (cara ukur)

| AC | Perilaku | Cara ukur | Status |
|---|---|---|---|
| AC1 | Katalog event + audiens satu sumber, bisa diuji | fungsi murni `eventAudience(event)` + self-check seluruh baris §19 | ❌ belum ada katalog di FE |
| AC2 | Kontrak ber-versi & topik terdaftar | konstanta versi + daftar topik di dokumen kontrak, diuji terhadap kode | ⚠️ `vsn=1.0.0` ada di `src/api/realtime.ts`; topik belum terdokumentasi ber-versi |
| AC3 | Reconnect → resync state terlewat | status "menyambung ulang/tersinkron" berubah saat `offline`/`online` | ⚠️ resync jalan (`online` listener + retry 3 dtk) tapi tak terlihat di UI |
| AC4 | Event yang tidak berhak tidak diterima peran itu | `eventAudience()` disaring per peran di layar | ❌ belum disaring di FE |
| AC5 | Perubahan state terlihat tanpa reload | feed event di layar (bukan polling saja) | ❌ hanya tabel `orders` yang dilanggan |

## 4. State & layar

- Langganan saat ini: `realtime:public:orders` (protokol Phoenix, `vsn=1.0.0`, heartbeat 25 dtk, reconnect 3 dtk) — hanya tabel `orders`.
- Konsumen: `useApiRealtime` → refresh inbox + merge order + set tahap order.
- Topic PRD/kontrak: `orders`, `wallet`, `chat`, `courier`, `disputes`, `tenant`, `zone`, `ratings`, `platform`.

## 5. Data & kontrak BE

- PRD §19 tidak menetapkan nama event; nama event ada di kolom kontrak `analysis.md` (mis. `courier_location`, `chat_message`, `sp_issued`, `quota_*`).
- Sumber kontrak terdekat: `docs/design/flows/INDEX.json` blok `contract.realtime` (transport + daftar topik, **tanpa field versi**) dan `docs/plan-notifikasi.md` N5.

## 6. Yang belum (blocked)

- Publication BE baru mencakup `orders` (rencana: `merchants, menus, wallet_ledgers, disputes, couriers, batches`).
- Fan-out & pola broadcast (PRD: "diputuskan di desain teknis").

## 7. UNRESOLVED

- Nama & bentuk pesan per event (PRD memakai label Indonesia, kontrak memakai snake_case) — jangan dikarang: pakai daftar di `analysis.md` + tandai yang belum ada.
- Strategi resync (snapshot penuh vs delta/replay) — tidak disebut PRD.
- Versi kedua (native) belum ada; angka versi ditahan di satu konstanta.

## 8. Bukti

- Kode saat ini: `src/api/realtime.ts`, `src/hooks/useApiRealtime.ts`, `src/api/notifications.ts`.
- Dokumen: `docs/design/flows/INDEX.json` (`contract.realtime`), `docs/plan-notifikasi.md` (N5; basis revisi lama), `milestones.md:16` (M7).
- Belum ada: katalog event + matriks audiens di FE, indikator sambungan, feed event di layar.
