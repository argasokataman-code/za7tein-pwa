# F25 — Milestone plan (sumber kebenaran render)

Dua jalur dari satu titik terima order: **Regular → batch → kurir inhouse** dan
**Quick → dispatch → kurir partner**. Sumber: PRD aktif `sa7tein-mvp-2026-10-11`
§7.2/§7.3, §8 (BR-B01..B13), §9.2–§9.7, §12 (COU-06..18), §13 (OPS-13), §11 (MER-12/13).
Bukan karangan: tiap milestone menunjuk `path:line` atau baris PRD.

- **Main path (Regular/inhouse):** M01 → M02 → M03 → M04 → M05 → M06 → M07 → M08 → M09 → M10 → M11
- **Cabang Quick/partner:** M02 → M12 → M13 → M14 → M15 → M16 → M17
- **Cabang gagal partner:** M14 →(tolak)→ M13 · M14 →(tanpa respons)→ M18 → M13 · M13 →(tak ada kandidat)→ M19

---

### M01 — Order baru masuk antrean merchant
- actor / lane: Merchant
- trigger: customer checkout membuat order
- action: order masuk daftar "baru" konsol merchant
- inputs: order code, jenis pengantaran (Regular/Quick), alamat
- outputs: baris antrean merchant
- integration: tidak ada (repo ini front-end; data mock)
- direction / transport: —
- edge label: `order masuk`
- state transition: (none) → `baru`
- impact: tanpa ini tak ada yang bisa di-accept
- branch / failure: —
- evidence: `src/data/merchant.ts` (`STATUS_MAP` cart→baru), `src/pages/MerchantOrders.tsx`
- placement hint: workflow col 0 / lane `merchant`

### M02 — Merchant menerima order, wajib pilih jenis
- actor / lane: Merchant
- trigger: merchant tekan "Terima" pada order `baru`
- action: buka `AcceptOrderSheet`; Regular wajib pilih batch, Quick hanya isi estimasi
- inputs: order id, `deliveryType`, daftar batch yang bisa digabung
- outputs: order `accepted` + batch id (Regular) atau estimasi prepare (Quick)
- integration: Supabase PostgREST (`POST /orders/{id}/accept`) — BE demo
- direction / transport: request, HTTPS
- edge label: Regular / Quick
- state transition: `baru` → `accepted`
- impact: menentukan seluruh cabang berikutnya; Quick tak pernah masuk batch
- branch / failure: Quick → M12; Regular → M03
- evidence: `src/components/merchant/AcceptOrderSheet.tsx:41`, `src/data/batch.ts:26` (`joinableBatches`)
- placement hint: workflow col 1 / lane `merchant`

### M03 — Order Regular masuk batch
- actor / lane: Batch
- trigger: accept order Regular
- action: buat batch baru atau gabung batch berjalan (countdown belum habis, belum penuh)
- inputs: estimasi masak (15/25/35 mnt), daftar batch `countdown`
- outputs: `Batch{merchant_id, countdown, order_ids[], status}`
- integration: tidak ada tabel `batches` di BE → state lokal (gap dicatat di `ui-impact.md`)
- direction / transport: —
- edge label: ke batch
- state transition: batch `countdown`
- impact: batch lahir **hanya** dari order Regular yang di-accept (BR-B01) — tak ada batch kosong
- branch / failure: batch penuh (≥24) tak bisa digabung (BR-B04) → buat batch baru
- evidence: `src/data/batch.ts:11` (`MAX_BATCH_ORDERS`), `:26`; PRD §8 BR-B01/B02/B04
- placement hint: workflow col 2 / lane `batch`

### M04 — Merchant menandai packing tiap order
- actor / lane: Merchant
- trigger: order dalam batch selesai dimasak
- action: toggle "packing" per order di panel batch
- inputs: order id dalam batch
- outputs: `order.packed = true`
- integration: state klien (kolom `packed` tak dikembalikan BE — tetap dipertahankan lewat `mergeOrders`)
- direction / transport: —
- edge label: `semua packing`
- state transition: batch `countdown` (packing bertambah)
- impact: syarat mulai lebih awal (BR-B09) = batch ditutup **dan** semua packing
- branch / failure: —
- evidence: `src/data/batch.ts:56` (`batchAllPacked`), `src/components/merchant/BatchPanel.tsx`, `src/store/slices/merchantSlice.ts` (`mergeOrders`)
- placement hint: workflow col 3 / lane `merchant`

### M05 — Batch ditutup (hitung mundur berhenti)
- actor / lane: Batch
- trigger: hitung mundur habis atau merchant tekan "Tutup lebih awal"
- action: kunci batch, berhenti menerima order baru
- inputs: batch id
- outputs: batch `closed`
- integration: —
- edge label: `hitung mundur stop`
- state transition: `countdown` → `closed`
- impact: setelah ditutup batch tak bisa ditambah, tak bisa diperpanjang, order tak bisa pindah batch
- branch / failure: —
- evidence: `src/data/batch.ts:14` (`BATCH_COUNTDOWN_SECONDS`), `src/components/merchant/BatchPanel.tsx:147`; BR-B08
- placement hint: workflow col 3 / lane `batch`

### M06 — Assign satu kurir inhouse ke batch
- actor / lane: Kurir inhouse (`inhouse`)
- trigger: batch `closed`
- action: merchant menunjuk satu kurir (`couriers` milik merchant, `type: inhouse`)
- inputs: batch id, merchant id, daftar kurir inhouse
- outputs: `batch.courier_id`; event `batch_assigned`
- integration: `POST /orders/{id}/courier/assign` (per order demo) — assign per batch belum ada endpoint
- direction / transport: request, HTTPS
- edge label: `batch_assigned`
- state transition: batch `closed` → kurir terpasang
- impact: kurir inhouse **wajib menerima tanpa tolak** (COU-12) — tak ada approve/reject di jalur ini
- branch / failure: bila tak ada kurir → batch "selesai tanpa kurir" (§7.5)
- evidence: `src/api/orders.ts:153` (`assignOrderCourier`); PRD §8 BR-B07, §12 COU-11..13
- placement hint: workflow col 4 / lane `inhouse`

### M07 — Mulai antar (lebih awal seizin merchant)
- actor / lane: Kurir inhouse (`inhouse`)
- trigger: hitung mundur selesai, atau merchant menyetujui mulai lebih awal
- action: kurir menekan "Mulai antar"; gerbang = batch `closed` + semua order packing
- inputs: batch id, `closed`, `batchAllPacked`
- outputs: pengantaran aktif; event `delivery_started`
- integration: —
- edge label: mulai lebih awal
- state transition: batch → `dalam pengantaran`
- impact: membuka urutan antar + auto-sort; setelah mulai, order baru tak bisa masuk batch
- branch / failure: belum semua packing → tombol mulai mati
- evidence: `src/data/batch.ts:66` (`canStartEarly`), `src/data/courierBatch.ts:79` (`canStartBatch`), `src/pages/CourierBatch.tsx:116`
- placement hint: workflow col 5 / lane `inhouse`

### M08 — Auto-sort rute (BR-B12/B13)
- actor / lane: Kurir inhouse (`inhouse`)
- trigger: batch sudah di-assign, hitung mundur jalan (dipicu ulang tiap order masuk)
- action: ON → urutkan waktu tempuh tercepat, mulai merchant, berakhir di order terakhir (tanpa balik merchant); OFF → urutan manual
- inputs: ≤25 titik (merchant + 24 order), matriks waktu tempuh
- outputs: `batch.autoSort`, urutan stop
- integration: Google Routes API (mode **WALK**) / Route Optimization — matriks tak boleh disimpan; heuristik NN + 2-opt
- direction / transport: request, HTTPS, sinkron
- edge label: auto-sort ON/OFF
- state transition: `batch.autoSort` true/false; `routeOrder`
- impact: menentukan urutan antar dan ETA per order; status batch "selesai kurir belum mulai" bisa berubah saat order masuk
- branch / failure: **wajib** tampilkan peringatan rute WALK (beta); tanpa debounce (cost watch R4)
- evidence: `src/data/courierBatch.ts:32` (`WALK_ROUTE_BETA_NOTE`), `:93` (`autoSortTasks`), `:122` (`autoSortRoute`), `src/pages/CourierBatch.tsx:98`
- placement hint: workflow col 6 / lane `inhouse`

### M09 — Antar order satu per satu, checkpoint + OTP
- actor / lane: Kurir inhouse (`inhouse`)
- trigger: pengantaran aktif
- action: kerjakan stop berurutan; tiap order lewat checkpoint "Ambil → Berangkat → Tiba", OTP customer ditutup
- inputs: order id, langkah checkpoint, kode OTP
- outputs: order `done`; event `order_completed`
- integration: `POST /orders/{id}/checkpoints`, `POST /orders/{id}/otp/verify`
- direction / transport: request, HTTPS
- edge label: OTP + fee
- state transition: order → `done` (satu per satu, bukan seluruh batch sekaligus)
- impact: kurir boleh selesaikan 1 order ⇒ progress batch `n/24` naik, order "berikutnya" pindah; hanya order online yang memicu payout
- branch / failure: OTP salah → order tetap di checkpoint terakhir (BR-B10 keluhan/tidak menerima = jalur CS, bukan kurir)
- evidence: `src/api/orders.ts:224` (`recordCheckpoint`), `:253` (`verifyOrderOtp`), `src/pages/CourierTaskDetail.tsx`; PRD §12 COU-13
- placement hint: workflow col 7 / lane `inhouse`

### M10 — Fee Regular online → DANA kurir
- actor / lane: Kurir inhouse (`inhouse`)
- trigger: order **online** selesai
- action: delivery fee `F` order Regular masuk ke akun DANA kurir saat selesai
- inputs: `deliveryFeeIdr` per order, metode bayar
- outputs: saldo kurir + entri ledger; settlement 3 kolom (merchant/kurir/aplikator)
- integration: DANA disbursement (BE; demo: `payouts` + tips saja)
- direction / transport: async, HTTPS
- edge label: fee → DANA
- state transition: — (uang, bukan status order)
- impact: **berubah dari legacy**: `ongkirIdr` dulu 100% merchant (C-07), di PRD aktif F milik **kurir**; COD Regular dibayar merchant **di luar aplikasi** (`deliveryFeeIdr = 0`)
- branch / failure: bayar COD → tak ada entri DANA
- evidence: `src/data/courier.ts:152,200` (`deliveryFeeIdr`), `src/data/courierWallet.ts:67` (`courierTipsAvailable` — masih tips-only, sisa M5); PRD §9.2, §16.3
- placement hint: workflow col 8 / lane `inhouse`

### M11 — Batch tuntas
- actor / lane: Batch
- trigger: semua order dalam batch `done`
- action: batch ditutup permanen
- inputs: batch id, progress
- outputs: batch `selesai`
- integration: —
- edge label: (tanpa edge sendiri; transisi ditutup edge fee → DANA → Batch tuntas)
- state transition: `dalam pengantaran` → `selesai`
- impact: — (terminal jalur Regular)
- branch / failure: —
- evidence: `src/data/courierBatch.ts:48` (`batchProgress`); PRD §7.5 status batch
- placement hint: workflow col 8 / lane `batch`

### M12 — Estimasi prepare (Quick, tanpa batch)
- actor / lane: Kurir partner
- trigger: accept order Quick
- action: merchant mengisi estimasi waktu prepare (15/25/35 mnt); tak ada batch
- inputs: estimasi prepare
- outputs: estimasi tampil ke customer
- integration: —
- edge label: `prepare siap`
- state transition: order `accepted`, tanpa batch
- impact: estimasi ini yang dipakai dispatch; order Quick tak pernah masuk batch (BR-B01)
- branch / failure: —
- evidence: `src/components/merchant/AcceptOrderSheet.tsx:52`; PRD §11 MER-12
- placement hint: workflow col 2 / lane `partner`

### M13 — Dispatch kurir partner
- actor / lane: Ops/aplikator
- trigger: prepare siap
- action: pilih kandidat dari antrean **idle terlama**, dibatasi jarak; tie-break jumlah order selesai hari itu lalu jarak terdekat
- inputs: status kurir partner, lokasi segar, ambang jarak (config ops)
- outputs: assignment dikirim; event `assignment_sent`
- integration: Google Routes/Distance + config ops (PWA ops terpisah, Cloudflare Access)
- direction / transport: request, HTTPS
- edge label: `assignment_sent`
- state transition: kandidat `available` → `reserved`
- impact: kandidat wajib **online, tidak busy, tidak suspend, lokasi segar**; dispatch masih **usulan** (OPEN-11)
- branch / failure: tak ada kandidat dalam batas → M19 (Quick tak tersedia)
- evidence: `src/data/marketplace.ts:66` (`QUICK_DISPATCH_AVAILABLE = false`); PRD §9.4, §13 OPS-13
- placement hint: workflow col 3 / lane `ops`

### M14 — Partner approve / reject ber-alasan
- actor / lane: Kurir partner
- trigger: assignment diterima kurir
- action: approve, atau reject dengan alasan (tombol submit aktif hanya setelah alasan diisi)
- inputs: assignment id, alasan (bila reject)
- outputs: event `approved` / `rejected{reason}`
- integration: —
- edge label: approved / reject ber-alasan
- state transition: `reserved` → `busy` (approve) · `reserved` → `available` (reject)
- impact: kurir partner bekerja **satu order per waktu** (COU-15) — tidak ada batch; reject mengembalikan order ke antrean dispatch
- branch / failure: reject → M13 (cari kandidat lagi); tak merespons sampai prepare selesai → M18
- evidence: PRD §9.3/§9.5 COU-15..18; `src/types.ts` (kurir partner **belum ada**)
- placement hint: workflow col 4 / lane `partner`

### M15 — Pickup + talangi COD Quick
- actor / lane: Kurir partner
- trigger: approve
- action: jemput order di merchant; bila COD, kurir **menalangi tunai** ke merchant saat pickup
- inputs: order id, nominal COD
- outputs: event `kurir_picked_up`; kas kurir berkurang
- integration: —
- edge label: `kurir_picked_up`
- state transition: order → `picked_up`
- impact: kurir menanggung uang muka; diganti saat menerima seluruh tunai dari customer
- branch / failure: —
- evidence: PRD §12 COU-17/18 (Quick COD)
- placement hint: workflow col 5 / lane `partner`

### M16 — Antar satu order
- actor / lane: Kurir partner
- trigger: order dijemput
- action: antar ke customer, terima seluruh tunai COD bila berlaku
- inputs: order id, metode bayar
- outputs: event `quick_order_completed`
- integration: —
- edge label: fee Quick 100%
- state transition: order → `done`
- impact: satu-satunya order yang dikerjakan kurir itu saat itu
- branch / failure: —
- evidence: PRD §7.3
- placement hint: workflow col 6 / lane `partner`

### M17 — 100% fee Quick → partner
- actor / lane: Kurir partner
- trigger: order Quick selesai
- action: cairkan **multiplier × fee merchant**, 100% ke kurir partner
- inputs: `F` order Quick, `multiplier_quick` (ops)
- outputs: saldo partner + entri ledger
- integration: DANA disbursement (BE)
- direction / transport: async, HTTPS
- edge label: (terminal; tak ada edge keluar)
- state transition: —
- impact: pembeda utama dengan Regular (fee Regular = 1× fee; Quick = multiplier penuh ke partner)
- branch / failure: —
- evidence: PRD §9.2, §16.3; `src/data/merchant.ts` (`deliveryFeeFor`)
- placement hint: workflow col 7 / lane `partner`

### M18 — Cari pengganti + SP + punishment + off
- actor / lane: Ops/aplikator
- trigger: kandidat tak merespons sampai prepare selesai
- action: cari pengganti otomatis, terbitkan **SP**, punishment per rule ops, status kurir jadi **off**
- inputs: assignment id, rule ops (§18), riwayat SP
- outputs: event `sp_issued`; kandidat baru
- integration: ops PWA + rule punishment (§18)
- direction / transport: request, HTTPS
- edge label: tanpa respons
- state transition: `reserved` → `off` (+ SP tercatat)
- impact: order tidak menggantung — pengganti diambil dari antrean yang sama
- branch / failure: kembali ke M13
- evidence: PRD §12 COU-16, §18, §13 OPS-06/07/15; `src/store/slices/adminSlice.ts` (SP belum ada)
- placement hint: workflow col 6 / lane `ops`

### M19 — Quick tak tersedia
- actor / lane: Ops/aplikator
- trigger: tak ada kandidat dalam batas jarak / semua tidak memenuhi syarat
- action: tandai Quick tak tersedia; merchant & customer diberi tahu
- inputs: antrean kandidat, ambang jarak
- outputs: status ketersediaan Quick
- integration: —
- edge label: tak ada kandidat
- state transition: ketersediaan Quick → off
- impact: §22.2 R5 — keputusan ops, bukan undian diam-diam
- branch / failure: —
- evidence: PRD §9.4, §22.2 R5 (usulan, OPEN-11)
- placement hint: workflow col 4 / lane `ops`
