# F13 — Tugas kurir inhouse (sisi pengantaran)

Workflow sisi kurir **inhouse** pada PRD aktif `sa7tein-mvp-2026-10-11`: tugas datang **per batch**, order dikerjakan **satu per satu** (checkpoint), lokasi dipantau **live**, fee Regular online masuk **DANA**. Milestone **M4/M5**; rencana & keputusan implementasi ada di `docs/plan-courier.md` (K0–K5) — spec ini sumber gambaran alurnya. Pasangan sisi merchant: `f25-batch-lifecycle`.

| Berkas | Isi |
|---|---|
| `f13-courier-view.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f13-courier-view.html` | Artefak jadi |
| `f13-courier-view.visual-check.*` | Bukti visual-check (gitignored) |

## Alur

**Lane Tugas & ambil:** tugas **batch** masuk (satu kurir per batch, BR-B07) → kurir tap **"Ambil"** per order (checkpoint, COU-13) → tap **"Berangkat"**: lokasi live mulai dipublikasikan (R-TRACK).

**Lane Perjalanan:** lokasi kurir realtime (`courier_location`) → tap **"Tiba"** memicu notifikasi **"kurir hampir sampai"** (`courier_almost_arrived`). Cabang gagal: customer tidak menerima → masalah order ke **CS**, bukan aksi kurir.

**Lane Serah terima:** verifikasi serah terima → **order selesai** (`order_completed`) → **fee Regular online masuk DANA kurir**. Order berikutnya dalam batch lanjut dari "Ambil".

## Aturan keras

- **Per batch, bukan per order.** Satu kurir inhouse ditunjuk untuk satu batch dan menerima **tanpa tolak** (BR-B07, COU-12); order diselesaikan **satu per satu** (COU-13).
- **Urutan antar dari auto-sort batch** (BR-B12); ETA per order memperhitungkan urutan itu.
- **Fee pindah penerima.** Fee Regular online → **DANA kurir** saat order selesai; Regular **COD dibayar merchant di luar aplikasi** (`deliveryFeeIdr = 0`) — bukan lagi `ongkirIdr` 100% merchant (C-07, R-DELIV-FEE).
- **Lokasi live, bukan snapshot.** R-TRACK menggantikan model checkpoint+snapshot lama; **batasan PWA**: hanya andal saat app kurir terbuka dan layar menyala. Kurir mengirim posisi lewat RPC `update_courier_location` selama checkpoint Berangkat/Tiba; notifikasi "hampir sampai" berbasis waktu dengan ambang `platform_params.almost_arrived_minutes` (5 menit).
- Notif customer = mock tapi tersambung (AGENTS.md §1, R-PUSH-01) — bukan klaim kirim Web Push sungguhan. Emit "hampir sampai" dipisah ke `useAlmostArrivedNotice` supaya konsol merchant (yang memakai pelacakan sama) tidak ikut mengirim notif milik customer.

## Status UI (R-TRACK, M7)

- **Pin kurir bergerak.** Sisi customer (`OrderStageScreen`, `#order-map` mode `delivery`) memakai opsi `courier` di `useLeafletMap`: satu marker, digeser `setLatLng` tiap posisi baru, jadi peta tidak dibangun ulang. Sumber posisi = RPC `courier_location` (order live); rute waktu-tempuh (`useCourierTracking`) hanya fallback saat BE belum punya posisi. `stale` dari server (120 dtk) tampil sebagai "menunggu sinyal lokasi kurir".
- **Hampir sampai.** Ambang berbasis **waktu** (`ALMOST_ARRIVED_MINUTES` = 5) bertanda konfigurasi ops; sudah terlewati → label berganti "Kurir hampir sampai" + `role="status"`. Panel ops untuk mengubahnya (M10) belum ada, dan itu ditulis di baris ETA.
- **Siaran berhenti di luar delivery.** `tracksLocation()` hanya benar untuk `diantar`/`tiba` (§9.7 "selama delivery aktif").
- **Sisi merchant ikut melihat kurir (AC2).** Sheet detail order di `/merchant/orders` memasang `MerchantCourierMap` untuk order `diantar`/`tiba` — peta + baris ETA memakai **aturan yang sama** (`useCourierTracking`, ambang ops yang sama), jadi merchant dan customer tak bisa melihat kurir di tempat berbeda. Notifikasi "hampir sampai" sengaja **tidak** dipancarkan dari konsol merchant (`useAlmostArrivedNotice` hanya dipakai sisi customer).
- **Belum:** ETA per urutan batch (AC4 — id batch `ct-*` belum bergabung dengan id order `api-*`), GPS perangkat nyata.

## Tab Order & riwayat (`/courier/orders`, 2026-11-02)

Daftar tugas pindah dari beranda ke tab sendiri. Bilah bawah kurir: **Beranda**, **Order** (badge jumlah tugas berjalan), **Profil**. `/courier/orders` memilih satu kategori pada satu waktu lewat segmented **Aktif | Riwayat** (MD-06); kategori disimpan di `?tab=riwayat` dan perpindahannya memakai `replace`, jadi back kembali ke beranda.

- **Aktif** = `courier.tasks` yang lolos `isActiveTask`, slip tugas yang sama dengan sebelumnya, tautan ke `/task/:id` (journey + stepper + OTP).
- **Riwayat** = tabel `orders` BE, `status in (done, canceled)` dan `courier_id` milik kurir, dibaca `fetchCourierHistory` (`src/api/orders.ts`). Nama customer dari `customers`, ongkir dari `delivery_fee_jod`. Seed `ct-5`/`ct-6` hanya cadangan saat `apiEnabled` mati.
- **Bukan tautan.** Detail tugas hanya mengenal tugas berjalan (checkpoint, OTP, item); menautkan riwayat berarti menawarkan pintu ke "Tugas tidak ditemukan".
- **Tanggal = `created_at`.** D1 tidak menyimpan waktu selesai. Baris tanpa tanggal menulis "Tanggal tidak tercatat", tidak menebak dari checkpoint.
- `taskHistory` (`src/data/courier.ts`) mengurutkan berakhir terbaru dulu dan menaruh baris tanpa `finishedAt` di bawah.

**UNRESOLVED-by-absence:** riwayat kurir tidak disebut di PRD aktif (`R-COU-INHOUSE` §8). Bentuknya diturunkan dari data yang ada, bukan requirement baru.


## Detail tugas (`/courier/task/:id`, 2026-11-08)

Satu perjalanan dibaca berurutan dari atas: **Rute** (titik **Ambil di** = toko: nama, alamat, tombol
Telepon; titik **Antar ke** = customer: alamat hasil `taskAddress()`, tombol Telepon baru terbuka saat
checkpoint `tiba`), **Catatan customer** (`orders.order_note`, hanya bila ada), **Isi pesanan**
(qty + modifier, baris `list-row`), **Uang tunai/Pembayaran**, **Status pesanan** + **Checkpoint**,
lalu kartu aksi. Tombol **Buka peta** muncul untuk tiap titik yang punya koordinat
(`merchants.latitude/longitude`, `addresses.latitude/longitude`).

- **Sumber data.** `courier_orders()` hanya mengirim order + customer + item. Toko, catatan,
  tenggat, dan koordinat dilengkapi `fetchCourierTaskExtras()` (`src/api/orders.ts`) lewat tiga
  query bertoken kurir (`orders`, `merchants`, `addresses`); semuanya best-effort, gagal baca
  hanya menghilangkan blok tambahan.
- **Jarak tak terukur bukan nol.** `distance_m` null → `distanceLabel()` menulis "jarak belum
  tersedia"; sebelumnya `0 m` membuat kurir mengira sudah di depan pintu.
- **Alamat tidak dobel.** `taskAddress()` menyusun `address + floor + unit` dengan membandingkan
  bagian utuh, karena `full_address` BE bisa sudah memuat keduanya.
- **Deep link saat daftar belum mendarat** menampilkan "Memuat tugas" (`courier.tasksLoaded`),
  bukan "Tugas tidak ditemukan" yang sempat berkedip untuk id `api-…`.
- **Penghasilan tugas** di kartu selesai = ongkir hak kurir (`delivery_fee_jod`) + tips.

**UNRESOLVED:** koordinat toko dan titik antar hanya terisi bila baris BE punya lat/lng;
`courier_orders()` sendiri belum mengirim jarak, jadi jarak tetap kosong sampai BE menghitungnya.

## Terhubung (lihat `../INDEX.json`)

`f25-batch-lifecycle:assign → f13-courier-view:masuk` (`batch_assigned`); `f13:selesai → f25:fee_dana` (`order_completed`); `f13:selesai → f14-chat-order:courierjoin` (chat order).

## Sumber (jangan dikarang)

- PRD `sa7tein-mvp-2026-10-11` §7.2, §9.2, §9.7, §12 (COU-06, COU-11..13) — `analysis.md` baris 34–40 · Milestone **M4/M5** — `versions/sa7tein-mvp-2026-10-11/milestones.md`
- Implementasi: `src/pages/CourierTaskDetail.tsx`, `src/data/courier.ts` (`COURIER_STEPS`), `src/api/orders.ts` (`recordCheckpoint`, `verifyOrderOtp`), `src/data/courierWallet.ts`
- **UNRESOLVED (jangan ditebak):** OTP tidak disebut di alur baru PRD aktif (`analysis.md` C-11) padahal implementasi masih memakainya; nasib timer SLA lama (`COURIER_SLA_MINUTES`) belum diputuskan; ambang notifikasi "hampir sampai" = config ops.
- **UNRESOLVED-by-absence:** layar kurir untuk melaporkan masalah order (BR-B10, keluhan/tidak menerima) belum ada di PRD aktif.

## Catatan revisi

Spec ini sebelumnya menggambarkan revisi **superseded** `irbid-mvp-v2-2026-09-21` (4 checkpoint + SLA timer + `hold_settled`, kurir "tips only" C-06). Basisnya kini diikat ke `sa7tein-mvp-2026-10-11`; istilah `hold_settled`/"hold cut" sudah keluar dari alur aktif.

## Update

```bash
ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  ./scripts/flows-gate.sh f13-courier-view   # deliver + visual-check + buang PNG, satu baris output
```

Wajib: validate 0 error; deliver exit 0; visual-check pass 4 viewport (light + dark).
