# F26 — Milestone plan (sumber kebenaran render)

Jalur **Quick**: order diterima merchant → estimasi prepare → aplikator **dispatch**
kurir partner → approve/reject ber-alasan → pickup → antar satu order → 100% fee ke
partner. Sumber: PRD aktif `sa7tein-mvp-2026-10-11` §7.3, §9.3, §9.4 (usulan), §9.5,
§12 (COU-15..18), §13 (OPS-13), §18 (SP), §16.3, §11 (MER-12).

Bukan karangan: tiap milestone menunjuk `path:line` PRD atau baris `analysis.md`.
Flow saudara: `f25-batch-lifecycle` (jalur inhouse Regular + gambaran dua jalur);
f26 adalah pendalaman jalur partner/Quick.

- **Main path:** Q01 → Q02 → Q03 → Q04 → Q07 → Q08 → Q09
- **Cabang tolak:** Q04/Q05 →(`rejected{reason}`)→ Q02
- **Cabang tanpa respons:** Q03 →(`tanpa respons`)→ Q06 →(`pengganti`)→ Q02
- **Cabang tanpa kandidat:** Q02 →(`tak ada kandidat`)→ Q10

Catatan render: Q04 (approve) dan Q05 (reject) digambar sebagai **satu node**
`Approve / reject` (pola `f25` M14) supaya layout archify tetap bersih; cabang tolak
tetap terlihat sebagai edge `rejected{reason}` yang kembali ke Q02.

---

### Q01 — Merchant menerima order Quick + estimasi prepare
- actor / lane: Merchant
- trigger: customer checkout order **Quick**
- action: merchant mengisi estimasi waktu prepare (15/25/35 mnt), tanpa batch
- inputs: estimasi prepare
- outputs: estimasi siap, memicu dispatch
- integration: —
- direction / transport: —
- edge label: `prepare siap`
- state transition: order `accepted`, tanpa batch
- impact: estimasi inilah yang dipakai dispatch; Quick **tak pernah** masuk batch (BR-B01)
- branch / failure: —
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35` (R-COU-PARTNER), §11 MER-12
- placement hint: workflow col 0 / lane `merchant`

### Q02 — Dispatch memilih kandidat
- actor / lane: Dispatch (aplikator)
- trigger: prepare siap
- action: pilih kandidat dari antrean **idle terlama dulu**, dibatasi **jarak**; tie-break jumlah order selesai hari itu lalu jarak terdekat
- inputs: status kurir partner, lokasi segar, ambang jarak (config ops)
- outputs: satu kandidat terpilih
- integration: Google Routes/Distance + config ops (PWA ops terpisah, Cloudflare Access)
- direction / transport: request, HTTPS
- edge label: `assignment_sent`
- state transition: kandidat `available` → `reserved`
- impact: kandidat wajib **online, tidak busy, tidak suspend, lokasi segar**
- branch / failure: tak ada kandidat dalam batas → **Q10 Quick tak tersedia**
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:36` (R-COU-DISPATCH, **usulan**), `:72` (OPEN-11 terbuka)
- placement hint: workflow col 1 / lane `dispatch`

### Q03 — Assignment dikirim ke kandidat
- actor / lane: Dispatch (aplikator)
- trigger: kandidat terpilih
- action: kirim assignment; kandidat ter-reserve dan diberi jendela respons sepanjang prepare
- inputs: order + estimasi prepare
- outputs: notifikasi assignment; event `assignment_sent`
- integration: R-REALTIME (event `assignment_sent`)
- direction / transport: push/WS, HTTPS
- edge label: `approved`
- state transition: `available` → `reserved`
- impact: tanpa respons sampai prepare habis → Q06
- branch / failure: kandidat menolak → Q05
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35`, `:44` (R-REALTIME event partner approve/reject)
- placement hint: workflow col 2 / lane `dispatch`

### Q04 — Kurir partner approve
- actor / lane: Kurir partner
- trigger: assignment diterima
- action: kurir menekan **Terima**
- inputs: assignment
- outputs: order terpegang kurir; event `approved`
- integration: —
- direction / transport: —
- edge label: `approved`
- state transition: `reserved` → `busy`
- impact: mulai dari sini kurir menuju merchant (Q07)
- branch / failure: —
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35` (COU-16)
- placement hint: workflow col 3 / lane `partner`

### Q05 — Kurir partner reject ber-alasan
- actor / lane: Kurir partner
- trigger: assignment diterima tapi kandidat menolak
- action: pilih **Tolak**, alasan **wajib** diisi sebelum submit aktif
- inputs: alasan penolakan (teks)
- outputs: event `rejected{reason}`; order kembali ke dispatch
- integration: —
- direction / transport: —
- edge label: `rejected{reason}`
- state transition: `reserved` → `available`
- impact: alasan penolakan tercatat untuk evaluasi ops
- branch / failure: —
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35` (COU-18, "submit aktif setelah alasan diisi")
- placement hint: workflow col 3 / lane `partner`

### Q06 — Tanpa respons → pengganti + SP
- actor / lane: Ops
- trigger: prepare habis tanpa respons kandidat
- action: sistem otomatis mencari **pengganti**, lalu menjatuhkan **SP + punishment + status off** ke kandidat yang mangkir
- inputs: tenggat prepare, riwayat assignment
- outputs: event `sp_issued`; kandidat jadi `offline`
- integration: rule ops (§18) — **halaman ops M6 belum dibangun**
- direction / transport: —
- edge label: `tanpa respons`
- state transition: `reserved` → `offline` (+ SP tercatat)
- impact: **UNRESOLVED: siapa penerbit SP belum diputuskan PO** (ops §18 vs otomatis rule; halaman ops belum ada) — jangan ditebak
- branch / failure: —
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35` (pengganti + SP + off), `:43` (SP = punishment rule ops), `:46` (halaman ops)
- placement hint: workflow col 3 / lane `ops`

### Q07 — Pickup di merchant (COD Quick: talangi tunai)
- actor / lane: Kurir partner
- trigger: order dipegang kurir
- action: ambil paket di merchant; bila **COD Quick**, kurir **menalangi tunai** ke merchant
- inputs: paket, nilai COD (JOD tunai)
- outputs: paket di tangan kurir; talangan tercatat
- integration: uang tunai JOD di luar aplikasi
- direction / transport: —
- edge label: `pickup`
- state transition: `busy` (jalan)
- impact: COD Quick bukan hold; kurir menerima seluruh tunai COD dari customer saat serah
- branch / failure: —
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35` (COD Quick talangi tunai), `:41` (COD = offline tunai JOD)
- placement hint: workflow col 4 / lane `partner`

### Q08 — Antar satu order
- actor / lane: Kurir partner
- trigger: paket diambil
- action: antar **satu order per waktu** (partner bukan batch) sampai serah ke customer
- inputs: alamat, lokasi live
- outputs: order sampai; event `courier_location`
- integration: R-TRACK (lokasi live, andal hanya saat app terbuka)
- direction / transport: WS, HTTPS
- edge label: `delivering`
- state transition: `busy`
- impact: Quick tak pernah di-batch; ETA tak memperhitungkan urutan batch
- branch / failure: gagal/tak bertemu → ke CS (bukan jalur kurir, R-NOTIF-02)
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:35` (COU-15), `:40` (R-TRACK)
- placement hint: workflow col 5 / lane `partner`

### Q09 — Order selesai: 100% fee Quick ke partner
- actor / lane: Kurir partner
- trigger: order diserahkan
- action: **100% delivery fee Quick** dibayarkan ke kurir partner saat selesai
- inputs: fee Quick = **multiplier × fee merchant** (multiplier = config ops)
- outputs: entri ledger kurir; event `order_completed`
- integration: DANA disbursement (BE); multiplier Quick = config ops (OPS-13)
- direction / transport: async, HTTPS
- edge label: `order_completed`
- state transition: `busy` → `available`
- impact: berbeda dari Regular (fee → kurir **inhouse** lewat `f25: fee_dana`)
- branch / failure: COD Quick → kurir sudah memegang tunai COD; fee tetap dari platform
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:38` (R-DELIV-FEE, multiplier × fee merchant, 100% partner), `:46` (OPS-13 multiplier Quick)
- placement hint: workflow col 6 / lane `partner`

### Q10 — Quick tak tersedia (tanpa kandidat)
- actor / lane: Dispatch (aplikator)
- trigger: tak ada kandidat dalam batas jarak
- action: tandai order **Quick tak tersedia** bagi customer
- inputs: hasil pencarian kandidat
- outputs: status tak tersedia (ke customer/merchant)
- integration: —
- direction / transport: —
- edge label: `tak ada kandidat`
- state transition: order tetap menunggu (tidak ada kurir)
- impact: cabang gagal; jalur pemulihannya (batal/refund/ubah jenis) **belum diputuskan** — jangan ditebak
- branch / failure: —
- evidence: `docs/product/prd/versions/sa7tein-mvp-2026-10-11/analysis.md:36` (tanpa kandidat → Quick tak tersedia)
- placement hint: workflow col 2 / lane `dispatch`

---

**UNRESOLVED (jangan diisi tebakan):**

- **Penerbit SP** (Q06): PO belum memutuskan siapa yang menjatuhkan SP (ops §18 manual vs otomatis rule), dan halaman ops M6 belum dibangun. Dicatat, bukan diputuskan.
- **Algoritma dispatch** (Q02): OPEN-11 masih terbuka — flow menggambarkan **usulan** PRD apa adanya (idle terlama + batas jarak + tie-break).
- **Pemulihan "Quick tak tersedia"** (Q10): jalur lanjut (batal / refund / ubah ke Regular) belum diputuskan.
- **Parameter ops** (ambang jarak, kesegaran lokasi, multiplier Quick): config ops, bukan nilai tetap.
