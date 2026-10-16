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
| AC1 | Katalog event + audiens satu sumber, bisa diuji | `eventAudience()`/`eventsFor()` + `scripts/realtime-check.mjs` (22 baris §19, jumlah per kolom) | ✅ katalog `src/data/realtime.ts` |
| AC2 | Kontrak ber-versi & topik terdaftar | `WS_MESSAGE_VERSION` + `contract.realtime.message_version`; self-check membandingkan kode ⇄ dokumen | ✅ versi `1.0.0` di kode & INDEX.json, topik `orders` terdaftar |
| AC3 | Reconnect → resync state terlewat | status "menyusulkan" berubah saat `online`/refresh; offline punya layar sendiri | ✅ indikator di kotak masuk (diukur di Chromium), offline = `/offline` |
| AC4 | Event yang tidak berhak tidak diterima peran itu | `eventAudience()` disaring per peran; assert A6 di self-check | ✅ katalog + asersi (`SP diterbitkan` = kurir partner + ops saja) |
| AC5 | Perubahan state terlihat tanpa reload | feed event di layar (bukan polling saja) | ❌ hanya tabel `orders` yang dilanggan BE; feed layar butuh publication lebih luas |

## 4. State & layar

- Langganan saat ini: `realtime:public:orders` (protokol Phoenix, `vsn` = `WS_MESSAGE_VERSION`, heartbeat 25 dtk, reconnect 3 dtk) — hanya tabel `orders`.
- Konsumen: `useApiRealtime` → refresh inbox + merge order + set tahap order; indikator resync di kotak masuk (`useRealtimeResync`).
- Topic PRD/kontrak: `orders`, `wallet`, `chat`, `courier`, `disputes`, `tenant`, `zone`, `ratings`, `platform` (terdaftar di `contract.realtime.topics`; kode menguji topik yang dilanggan ada di daftar itu).

## 5. Data & kontrak BE

- PRD §19 tidak menetapkan nama event; nama event ada di kolom kontrak `analysis.md` (mis. `courier_location`, `chat_message`, `sp_issued`, `quota_*`). Katalog FE memakai **label §19** sebagai kunci dan hanya mengisi `kontrak` kalau namanya terdokumentasi.
- Sumber kontrak terdekat: `docs/design/flows/INDEX.json` blok `contract.realtime` (transport + `message_version` + daftar topik, diuji terhadap kode) dan `docs/plan-notifikasi.md` N5.

## 6. Yang belum (blocked)

- Publication BE baru mencakup `orders` (rencana: `merchants, menus, wallet_ledgers, disputes, couriers, batches`).
- Fan-out & pola broadcast (PRD: "diputuskan di desain teknis").

## 7. UNRESOLVED

- Nama & bentuk pesan per event (PRD memakai label Indonesia, kontrak memakai snake_case) — jangan dikarang: pakai daftar di `analysis.md` + tandai yang belum ada.
- Strategi resync (snapshot penuh vs delta/replay) — tidak disebut PRD.
- Versi kedua (native) belum ada; angka versi ditahan di satu konstanta.

## 8. Bukti

- Katalog + matriks: `src/data/realtime.ts` (`REALTIME_ROWS` 22 baris §19 apa adanya, `eventAudience`, `eventsFor`, `WS_MESSAGE_VERSION`, `WS_SUBSCRIBED_TOPICS`, `WS_TOPIC_PREFIX`); self-check `node --import ./scripts/lib/ts-resolve.mjs scripts/realtime-check.mjs`.
- Kontrak: `docs/design/flows/INDEX.json` blok `contract.realtime` (kini ber-`message_version` + `subscribed_now`, NFR-06); versi & topik dibandingkan otomatis dengan kode.
- Socket: `src/api/realtime.ts` (topik & `vsn` dari katalog, bukan ditulis ulang; sinyal `onResync`/`notifyResync`), `src/hooks/useApiRealtime.ts` (kabarkan resync sebelum menyusul), `src/hooks/useRealtimeStatus.ts` (`useRealtimeResync`), indikator di `src/pages/Notifications.tsx` (kelas `inbox-foot` yang sudah ada, tanpa CSS baru).
- Diukur di Chromium (PWA customer, 390px): dispatch `online` → kotak masuk menampilkan "Menyusulkan perubahan yang terlewat."; offline sudah punya layar `/offline` sendiri.
- Flow: `docs/design/flows/f11-push-notification/` (bagian "Status UI (R-REALTIME, M7)"), `f1-order-lifecycle` (basis), `milestones.md` (M7).
