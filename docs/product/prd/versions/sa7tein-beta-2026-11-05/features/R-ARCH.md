# R-ARCH — Cloudflare penuh, DO+SQLite, Workflows, R2 & KV

Status: blocked (repo ini front-end mock; kontrak BE hanya dipetakan) · sumber §20.1 ARC-01..ARC-18, §4, §21.4, §9.3.

## 1. Untuk apa

Arsitektur menentukan apa yang mungkin: semua transaksi lintas data harus atomic, semua perubahan harus tercatat, dan semua client harus menerima event yang sama. PRD memilih Cloudflare penuh dengan Durable Object + SQLite sebagai database, sehingga model data disusun sebagai satu class per model dan satu instance per row.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Full stack Cloudflare | ARC-01 |
| A2 | Satu Worker menjadi middleware client customer+merchant; aplikasi ops memakai Worker terpisah yang terhubung ke DO, Workflows, dan Queue yang sama | ARC-02 |
| A3 | Durable Object + SQLite storage menjadi core engine dan database utama; semua data disimpan lewat KV async API storage DO, kecuali data di Workers KV | ARC-03 |
| A4 | Pola RDBMS klasik: 1 class DO = 1 domain model, 1 instance DO = 1 row data | ARC-04 |
| A5 | Registry semua instance DO disimpan di Workers KV root key `DOInstanceRegistry` dengan key `{ENTITY_TYPE:ENTITY_ID}` dan value `{DURABLE_OBJECT_ID}`; operasi hanya read, create, delete | ARC-05 |
| A6 | Delete registry hanya untuk pesan chat beserta riwayatnya, karena data lain tidak dihapus permanen | ARC-05, ARC-15 |
| A7 | Semua transaksi yang melibatkan lebih dari satu DO wajib berjalan lewat Workflows | ARC-06 |
| A8 | Semua Workflows dipicu lewat Queue | ARC-07 |
| A9 | RPC dipakai untuk mengubah data di storage DO; Workflow menjalankan operasi bisnis dan memanggil RPC ke setiap DO terkait; WebSocket untuk pesan realtime | ARC-08 |
| A10 | R2 untuk object storage: logo, cover, gambar menu, gambar chat, bukti dispute | ARC-09 |
| A11 | Cloudflare Access/Zero Trust untuk aplikasi ops; Workers Analytics Engine + Workers Logs untuk analitik dan log | ARC-10 |
| A12 | MVP memakai React PWA zero-route SPA dengan kode berarsitektur SSR; pasca-MVP React Native dengan kontrak Worker identik | ARC-11 |
| A13 | Layanan eksternal: provider kurs (belum dipilih), Google Maps API, payment gateway Indonesia (belum dipilih), WhatsApp Business Platform Cloud API untuk reverse OTP | ARC-12 |
| A14 | Seluruh sistem asynchronous, reactive, realtime, event-driven | ARC-13 |
| A15 | Workers KV punya dua root key: `applicationConfiguration` (single row) dan `DOInstanceRegistry`; konfigurasi multi row disimpan di instance DO | ARC-14 |
| A16 | Riwayat aktivitas: 1 entri = 1 DO, 1 jejak = 1 DO, untuk perubahan di DO maupun KV; setiap key config punya satu instance DO sebagai penulis tunggal | ARC-15 |
| A17 | Update kurs harian dijadwalkan lewat alarm instance DO key kurs, bukan Cron Trigger | ARC-15 |
| A18 | Root key diterapkan sebagai prefix key, bukan satu value JSON, karena batas 1 penulisan/detik per key | ARC-16 |
| A19 | Auto buka dan auto tutup jam operasional dijadwalkan lewat alarm DO, bukan Cron Trigger | ARC-17 |
| A20 | Domain model program marketing menyimpan config reward-nya sendiri; domain model rule terpisah dari program; model rule yang sama dipakai rule sa7tein poin dengan field `sa7tein_poin` | ARC-18 |
| A21 | Tabel/kolom final mengikuti ERD sebagai sumber kebenaran | §1, §17 |
| A22 | Query lintas instance (browse, search, riwayat per merchant) belum diputuskan | OPEN-25 |
| A23 | Registry DO eventually consistent sampai 60 detik | R3 |
| A24 | Biaya Routes API diperhitungkan karena auto-sort tanpa debounce dan fee radius | R4, §9.3 |
| A25 | Jumlah instance DO bisa meledak karena riwayat per field | R14 |

## 3. Aktor & permukaan

- Tidak ada aktor pengguna; ini kontrak backend.
- Repo ini hanya menampilkan konsekuensinya: `/documentation` bagian backend, `docs/design/app-map/app-map.architecture.json`, dan `docs/design/flows/` mis-match kontrak.

## 4. Masukan → keluaran

- Masuk: operasi bisnis dari Worker.
- Keluar: perubahan DO via RPC, Workflow lintas DO, event WS, entri riwayat, objek di R2.

## 5. State UI

| State | Tampilan |
|---|---|
| backend belum ada | repo menampilkan data mock; kontrak BE dipetakan sebagai rencana |
| registry telat konsisten (≤60 dtk) | data baru bisa belum terlihat; bukan bug FE |
| KV baru berubah | label "berlaku ±1 menit" di ops |

## 6. Kontrak BE (handoff, repo ini mock)

ARC-01..18; query lintas instance OPEN-25; registry eventually consistent (R3); idempotensi langkah uang (NFR-01).

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Kontrak BE di repo menyebut ARC-01..18 tanpa kontradiksi | baca `app-map.architecture.json` + `/documentation` backend | ⛔ masih ringkasan lama |
| AC2 | Tidak ada model data baru yang melanggar "1 class = 1 model, 1 instance = 1 row" | periksa daftar tabel di dokumentasi | ⛔ |
| AC3 | Config disimpan sebagai prefix key, bukan 1 JSON | periksa daftar key di dokumentasi | ⛔ |
| AC4 | Auto buka/tutup dan update kurs dijelaskan sebagai alarm DO | periksa dokumentasi | ⛔ |
| AC5 | Repo tidak mengklaim backend sudah ada | periksa `/documentation` bagian backend | ⛔ |
| AC6 | R2 disebut untuk 5 jenis objek | periksa dokumentasi | ⛔ |

## 8. UNRESOLVED

- OPEN-24/OPEN-25 (cara query lintas instance, skala) terbuka.
- Provider kurs, payment gateway, dan provider Maps belum dipilih.
- OPEN-27 (legal) dan OPEN-28 (metrik keberhasilan) terbuka.

## 9. Bukti

- Kode/dokumen: `docs/design/app-map/app-map.architecture.json` (node Kontrak BE), `src/pages/Documentation.tsx` bagian Backend, `docs/design/flows/INDEX.json` (6 `contract.mismatches`).
- Repo tidak mengimplementasikan backend; tidak ada Worker/DO/R2 di `src/`.
