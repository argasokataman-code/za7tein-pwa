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
| AC1 | Thread ada untuk **setiap order yang sudah dibuat**, peserta awal customer + merchant | fungsi murni `chatParticipants()` + `chat-check` | ✅ `chatParticipants()` (`src/data/chat.ts:44-53`); chip peserta menampilkan Pembeli + Toko sejak awal, self-check `scripts/chat-check.mjs` |
| AC2 | Kurir muncul sebagai peserta **hanya** setelah batch di-assign (inhouse) / assignment di-approve (partner) | `chatParticipants()` atas state batch & assignment; assert untuk 4 kombinasi | ✅ `courierJoinedInhouse`/`courierJoinedPartner` (`chat.ts:74-92`) + layar membaca `courier.batch` & `partner.assignments` (`OrderChat.tsx:125-127`); kurir belum gabung = chip putus-putus "belum bergabung" |
| AC3 | Kirim/terima **teks** pada thread order yang sama | kirim di UI + baris baru muncul dengan waktu | ✅ terukur di Chromium asli: klik nyata tombol kirim 44×44 → gelembung `--aku` bertambah, lalu balasan + indikator "sedang menulis" |
| AC4 | Lampiran **gambar** (R2) | — | ❌ `CHAT_MEDIA_AVAILABLE=false` + `PlatformNotice` di layar (`OrderChat.tsx:334-340`); BE demo belum punya bucket/kolom lampiran |
| AC5 | Thread **ditutup** saat order batal/ditolak, dan beberapa jam setelah selesai | status thread turunan `chatStatusFor()` | ✅ `chatStatusFor()` (`chat.ts:60-66`); terukur: `orderStage=selesai` → "Chat ditutup setelah order selesai" (`OrderChat.tsx:304-309`) dan composer hilang, riwayat tetap terbaca |
| AC6 | Ragam peserta tampil (siapa di dalam thread), tidak ada thread kedua per order | header thread menampilkan daftar peserta; `threadsForOrder(orderId)` panjang = 1 | ✅ daftar peserta (`OrderChat.tsx:240-254`, 3 chip) + nama pengirim per gelembung (`:259-263`) supaya toko dan kurir bisa dibedakan; satu thread tetap satu daftar peserta |

## 4. State & layar

- Layar: `/order-chat` (`src/pages/OrderChat.tsx`), pintu masuk tombol Chat di `OrderStageScreen`.
- Peserta: `customer` / `merchant` / `kurir`; kurir punya dua jalur masuk (`inhouse` = batch di-assign, `partner` = assignment `approved`). Layar menampilkan daftar peserta (yang belum masuk ditandai "belum bergabung") dan nama pengirim di atas tiap gelembung pihak lain, karena nada warna saja tidak cukup membedakan toko dari kurir.
- Status thread: `open` / `closed` (alasan: `completed` / `cancelled`). Saat `closed`, composer dan saran cepat diganti notice, riwayat tetap terbaca.
- Mode demo (tanpa order aktif): percakapan contoh tetap tiga pihak, pesan kurir hanya ikut tampil kalau kurir sudah bergabung.

## 5. Data & kontrak BE

- BE demo: tabel `chats` + `chat_messages` (`src/api/chat.ts`), `body: string`, `sender_id`; satu chat per order (`ensureChat`).
- Kontrak PRD: event `chat_message`, `chat_opened`, `chat_closed`; storage gambar **R2**.
- Kanal realtime: topik `chat` (lihat `R-REALTIME`).

## 6. Yang belum (blocked)

- **Gambar (AC4)**: BE demo tak punya bucket R2 maupun kolom lampiran di `chat_messages`; layar menandai jalurnya belum tersedia (`CHAT_MEDIA_AVAILABLE`), bukan memalsukan unggahan.
- **Kurir gabung otomatis (AC2)**: assignment/dispatch nyata belum ada (OPEN-11, `R-COU-DISPATCH`), jadi keanggotaan diturunkan dari **state demo** (batch ter-assign / assignment `approved`), bukan dari event BE `courier_joined_chat`. Jalur event-nya tetap tercatat sebagai kontrak.

## 7. UNRESOLVED

- **OPEN-20**: durasi pasti penutupan chat + retensi riwayat (§20.1). Jangan diisi tebakan — UI memakai penanda "beberapa jam" tanpa angka.
- **Batas jumlah peserta**: PRD hanya menyebut daftar peserta, **tidak** menetapkan angka; flow `f14` menulis "maks 3" sebagai keputusan flow, bukan kutipan PRD.
- **Akses chat sebagai bukti dispute**: OPEN-19 (`analysis.md:72`).
- Push untuk pesan chat masuk — belum diputuskan.

## 8. Bukti

- Kode: `src/data/chat.ts` (`chatParticipants:44-53`, `chatStatusFor:60-66`, `courierJoinedInhouse:74-79`, `courierJoinedPartner:85-88`, `CHAT_MEDIA_AVAILABLE:98`), `src/pages/OrderChat.tsx` (derivasi peserta `:118-142`, daftar peserta `:240-254`, nama pengirim `:259-263`, penutupan thread `:304-309`, penanda lampiran `:334-340`), `src/styles/system/_order-chat.scss`, `src/styles/_system.scss` (facade).
- Self-check: `scripts/chat-check.mjs` (peserta awal, kurir gabung per jalur, `courierId` null, order di luar batch, partner pending/rejected/approved, jalur masuk regular/quick, lifecycle buka/tutup, thread hanya bila order ada).
- Terukur di Chromium asli (jendela PWA customer, `:4173`): 3 chip peserta, gelembung `--merchant`/`--aku`/`--kurir` dengan nama pengirim (toko ≠ kurir), kirim lewat klik nyata tombol 44×44 → gelembung bertambah + balasan, `orderStage=selesai` → notice tutup dan composer hilang, overflow-x 0, kolom 430.
- Flow: `docs/design/flows/f14-chat-order/` (status `done` di `INDEX.json`, basis C-18 + C-12).
- Catatan jujur: keanggotaan kurir diturunkan dari "ada batch ter-assign / assignment approved di sesi ini", karena id tugas demo (`ct-*`) belum menyatu dengan order BE (`api-*`) — gap identitas lintas peran yang sudah tercatat di M5.
