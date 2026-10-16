# R-CUS-CHAT — Group chat per order

Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §20.1, §10 (CUS-26), §12 (COU-07), §19 · flow `f14-chat-order` · milestone **M7**.
Status: partial · terakhir ditinjau: 2026-10-16.

## 1. Untuk apa

Koordinasi saat permintaan customer tidak bisa dipenuhi apa adanya (mis. catatan minta paha atas, yang tersedia dada). Chat dibuka **per order** sejak order dibuat, peserta awal customer + merchant, dan kurir masuk saat ia benar-benar memegang order itu — supaya tidak ada pihak yang mengobrol di order yang bukan miliknya.

## 2. Aturan (dan alasannya)

| # | Aturan | Sumber |
|---|---|---|
| C1 | Chat dibuka saat customer **membuat order**; peserta awal **customer + merchant** | §20.1 |
| C2 | Kurir **inhouse** gabung setelah merchant meng-assign batch; kurir **partner** gabung setelah menekan **approve** assignment | §20.1, COU-07 |
| C3 | Mendukung **teks dan gambar**; gambar disimpan di **R2** | §20.1 |
| C4 | Ditutup beberapa jam setelah order selesai, atau **langsung** saat order batal/ditolak; riwayat disimpan beberapa hari | §20.1 |
| C5 | Priority flag saat `dispute_opened` — **bukan** thread baru | flow `f14-chat-order:dispute` |
| C6 | Satu thread per order; peserta tidak boleh menambah thread kedua di order yang sama | §20.1 + `f14:thread` |

## 3. Acceptance (cara ukur)

| AC | Perilaku | Cara ukur | Status |
|---|---|---|---|
| AC1 | Thread ada untuk **setiap order yang sudah dibuat**, peserta awal customer + merchant | fungsi murni `chatParticipants()` + `chat-thread-check` | ❌ hari ini tanpa order: layar memakai mock kurir saja |
| AC2 | Kurir muncul sebagai peserta **hanya** setelah batch di-assign (inhouse) / assignment di-approve (partner) | `chatParticipants()` atas state batch & assignment; assert untuk 4 kombinasi | ❌ peserta di-hardcode customer ↔ kurir |
| AC3 | Kirim/terima **teks** pada thread order yang sama | kirim di UI + baris baru muncul dengan waktu | ⚠️ teks jalan, tapi 1:1 dan tanpa merchant |
| AC4 | Lampiran **gambar** (R2) | — | ❌ `chat_messages` hanya `body: string`, R2 belum ada (lihat §6) |
| AC5 | Thread **ditutup** saat order batal/ditolak, dan beberapa jam setelah selesai | status thread turunan `chatStatusFor()` | ❌ belum ada state tutup |
| AC6 | Ragam peserta tampil (siapa di dalam thread), tidak ada thread kedua per order | header thread menampilkan daftar peserta; `threadsForOrder(orderId)` panjang = 1 | ❌ header hardcode satu nama |

## 4. State & layar

- Layar: `/order-chat` (`src/pages/OrderChat.tsx`), pintu masuk tombol Chat di `OrderStageScreen`.
- Peserta: `customer` / `merchant` / `kurir`; kurir punya dua jalur masuk (`inhouse` = batch di-assign, `partner` = assignment `approved`).
- Status thread: `open` / `closed` (alasan: `completed` / `cancelled` / `rejected`).

## 5. Data & kontrak BE

- BE demo: tabel `chats` + `chat_messages` (`src/api/chat.ts`), `body: string`, `sender_id`; satu chat per order (`ensureChat`).
- Kontrak PRD: event `chat_message`, `chat_opened`, `chat_closed`; storage gambar **R2**.
- Kanal realtime: topik `chat` (lihat `R-REALTIME`).

## 6. Yang belum (blocked)

- **Gambar (AC4)**: BE demo tak punya bucket R2 maupun kolom lampiran di `chat_messages`; jalurnya ditandai belum tersedia di UI, bukan dipalsukan.
- **Kurir gabung otomatis (AC2)**: assignment/dispatch nyata belum ada (OPEN-11, `R-COU-DISPATCH`), jadi keanggotaan diturunkan dari **state demo** (batch & assignment slice), bukan event BE.

## 7. UNRESOLVED

- **OPEN-20**: durasi pasti penutupan chat + retensi riwayat (§20.1). Jangan diisi tebakan — UI memakai penanda "beberapa jam" tanpa angka.
- **Batas jumlah peserta**: PRD hanya menyebut daftar peserta, **tidak** menetapkan angka; flow `f14` menulis "maks 3" sebagai keputusan flow, bukan kutipan PRD.
- **Akses chat sebagai bukti dispute**: OPEN-19 (`analysis.md:72`).
- Push untuk pesan chat masuk — belum diputuskan.

## 8. Bukti

- Kode saat ini: `src/pages/OrderChat.tsx` (1:1 customer ↔ kurir, percakapan mock inline), `src/api/chat.ts`, `src/hooks/useApiChat.ts` (polling 5 dtk).
- Flow: `docs/design/flows/f14-chat-order/` (status `done` di `INDEX.json`, basis C-18 + C-12).
- Belum ada: definisi peserta/lifecycle di `src/data/`, lampiran, status tutup.
