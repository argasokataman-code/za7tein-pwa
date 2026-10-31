# Inventaris catatan di dalam kode — Sa7tein PWA

Tanggal: 2026-10-31
Scope: `src/**`, `scripts/**`, `supabase/**` (`.ts .tsx .mjs .js .scss .css`) — komentar kode saja. Teks yang dirender ke UI TIDAK masuk file ini (lihat `docs/design/ui-notes-inventory-2026-10-31.md`).
Status: done
Bukti: `node /tmp/inv/blocks.mjs` → A = 89 blok, B = 631 blok; sumber per file di `/tmp/inv/blk-a.txt` dan `/tmp/inv/blk-b.txt`. Ekstraksi per BLOK komentar (bukan per baris), jadi entri multi-baris tidak terpotong di tengah kalimat.

## Bucket A — catatan pekerjaan yang belum selesai (89)

Yang perlu dikerjakan/diputuskan. Dikelompokkan menurut jenis utangnya.


### ponytail (penyederhanaan sengaja) (11)
- `scripts/browser-gate.mjs:354` — ponytail: tunggu render React; kalau flaky, ganti dengan wait-for-selector
- `src/api/audit.ts:81` — ponytail: baris lama tanpa `kind` (pra-migrasi) masuk ember `operator`.
- `src/api/coverage.ts:72` — Simpan coverage live. Radius = satu baris; area = satu baris per polygon. ponytail: baris lama yang berlebih tidak…
- `src/api/orders.ts:92` — ponytail: `transfer` legacy, tak lagi ditawarkan (PAYMENT_METHODS); BE tak punya enum-nya. Fallback `cod` bila state…
- `src/api/programs.ts:246` — ponytail: INSERT child ditolak RLS `marketing_rewards`/`marketing_rules` (hanya program induk yang dibuka untuk…
- `src/data/catalog.ts:72` — Aturan nama → salah satu dari empat kategori tetap. ponytail: heuristik nama, bukan kategori asli; kalau…
- `src/data/registry.ts:145` — ponytail: pemeriksaan dev saja — di produksi daftarnya konstan dan sudah lewat build, jadi tidak ada gunanya dihitung…
- `src/hooks/useApiCatalog.ts:35` — ponytail: polling 15 dtk menutup status buka/tutup toko tanpa kanal WS; ganti ke Supabase Realtime (`postgres_changes`…
- `src/pages/CustomerRefund.tsx:155` — ponytail: tanpa order nyata tidak ada yang bisa ditulis; maju lokal.
- `src/pages/MerchantDashboard.tsx:156` — ponytail: fail-safe 4 dtk — jaringan menggantung tak boleh menahan kerangka selamanya; kalau lewat, tampilkan seed apa…
- `src/store/slices/walletSlice.ts:63` — ponytail: nominal ditahan begitu diminta; fee payout menyusul saat OQ-22 final.

### UNRESOLVED / OQ / belum final (11)
- `src/api/orders.ts:211` — Status app → nilai `orders_status_check` backend. Backend tak punya `diterima`/`tiba` (OST-1 unresolved), jadi…
- `src/api/orders.ts:322` — Status kolom backend → `MerchantOrderStatus`. Backend belum punya `placed` (OST-1 unresolved) dan menandai order baru…
- `src/data/courierWallet.ts:22` — Ambang minimum penarikan **saldo tips**. Angka **belum final di PRD** — `source.md:83` menyebut contoh akumulasi…
- `src/data/merchantReviews.ts:3` — Ulasan pembeli tentang menu toko, dari sudut pandang merchant. Di luar PRD aktif — lihat…
- `src/data/rules.ts:232` — Hasil resolusi rule untuk satu order. `unresolved` bukan kegagalan: §18 menulis "customer dan kurir mengikuti rule yang…
- `src/data/wallet.ts:38` — Tanpa field fee — fee cash-out masih `UNRESOLVED` (OQ-22), jangan dikarang.
- `src/pages/Checkout.tsx:534` — Pajak 2 lapis (R-TAX-01, F4) — info-only di MVP: tidak menambah total, karena tarif & kewajiban setornya belum final…
- `src/pages/WalletPayout.tsx:15` — Tarik saldo (M3, flow F6). Fee penarikan belum final (OQ-22), jadi layar ini tidak memotong apa pun dan hanya menandai…
- `src/store/slices/merchantSlice.ts:447` — Periode baru: hitungan order per periode direset (I-4 belum final).
- `src/types.ts:777` — Persentase refund sebagian saat `refund_partial` (belum final, OQ-29).
- `src/types.ts:915` — Sisa modal awal 5 JOD — non-tunai & non-withdrawal (I-3 belum final).

### BE belum punya (kolom/endpoint/tabel) (18)
- `scripts/quota-check.mjs:98` — Paket kuota: dua jenis tersedia (order & COD), harga masuk akal, dan pembelian memang belum tersedia (flag) — supaya UI…
- `src/api/orders.ts:56` — Kolom masa depan untuk bukti transfer legacy (belum ada di BE).
- `src/api/orders.ts:430` — BE belum punya kolom bukti transfer; kalau nanti ada, UI merchant sudah membaca field ini tanpa perubahan lain.
- `src/api/profile.ts:60` — Identitas login customer (email + nomor HP). Nama/avatar belum ada di BE.
- `src/api/realtime.ts:43` — Worker belum punya endpoint Phoenix: `/realtime/v1/websocket` = 404, jadi mencoba menyambung hanya menghasilkan error…
- `src/api/reviews.ts:224` — Hidangan belum tersedia di BE; menu item tetap bisa dinilai begitu ada.
- `src/components/courier/CourierHomeHero.tsx:51` — Ikon, bukan foto: `courierSelf` belum punya medan foto. Nama kurir tepat di bawahnya, jadi alt dikosongkan. */}
- `src/data/marketing.ts:491` — Kartu loyalty customer (padanan `loyalty.card`). BE belum punya tabelnya → poinnya mock, cukup untuk membuat program…
- `src/data/merchantOrders.ts:16` — `orders` di BE belum punya kolom jenis pengantaran, jadi demo memakai overlay per kode order supaya kedua cabang…
- `src/data/merchantOrders.ts:33` — Pilihan mode yang dibuat customer saat checkout. `orders` BE belum punya kolom jenis pengantaran (ui-impact.md §8),…
- `src/pages/MerchantSettings.tsx:234` — Profil & foto di halaman ini belum punya jalur tulis ke BE: yang tersimpan cuma state sesi. Ditulis di muka supaya…
- `src/pages/PaymentAmount.tsx:160` — `orders` BE belum punya kolom jenis pengantaran; simpan pilihan customer per kode supaya konsol merchant membaca cabang…
- `src/pages/Profile.tsx:94` — Identitas live dari sesi (`auth.user`, diisi dari tabel `users`). Nama kosong (BE belum punya kolomnya) → tampilkan…
- `src/pages/Search.tsx:35` — Toko disaring di klien dari daftar yang sudah dibaca: BE belum punya endpoint cari (`ilike`), dan katalognya masih utuh…
- `src/pages/WalletBalance.tsx:93` — Refund penuh (§16.6) — bentuk alurnya ada, tapi ditandai belum tersedia selama BE belum punya endpoint refund. */}
- `src/styles/system/_merchant-3.scss:316` — `disabled` bawaan peramban memudarkan isi; chip "Belum tersedia" sudah jujur, jadi jangan dipudarkan lagi.
- `src/types.ts:76` — Snapshot invoice satu order yang dibuat di sesi ini. `orders` BE belum punya kolom pecahan biaya, jadi setelah dibayar…
- `src/types.ts:625` — URL bukti transfer (metode legacy `transfer`). BE belum punya kolomnya, jadi `undefined` berarti merchant tidak punya…

### lain-lain (utang tanpa marker khusus) (49)
- `scripts/bump-version.mjs:2` — Naikkan patch BASE_VERSION di src/data/appInfo.ts, cetak versi baru ke stdout. Dipakai CI (lihat…
- `scripts/check-self.mjs:1` — Jalankan semua self-check murni (`scripts/*-check.mjs`) satu perintah. Alasannya: tiap check butuh loader `ts-resolve`…
- `scripts/lib/ts-resolve.mjs:1` — Bootstrap loader untuk self-check Node: daftarkan hook resolve tanpa ekstensi. Dipakai via: node --import…
- `scripts/refund-check.mjs:1` — Self-check logika status refund tanpa browser. Kenapa ada: layar refund memakai `pending_refund` untuk "belum dikirim",…
- `src/App.tsx:290` — Panel ops (M10, R-OPS) — website penuh non-PWA, prefix `/ops/*`. Lebar penuh seperti konsol Super Admin (keputusan PO:…
- `src/api/batches.ts:53` — `courier_id` BE numerik → id kurir FE. Registri kurir repo ini memakai `cr-N` (`merchant.ts`), jadi angka mentah tak…
- `src/api/ops.ts:249` — Terbitkan SP ke `punishments`. BE menyimpan `subject_id`, sedangkan form ops mengetik nama bebas — jadi nama diresolusi…
- `src/api/refunds.ts:101` — Order online terbaru milik customer demo — sasaran refund kalau layar tak diberi `?order=`. `code` mempersempit ke satu…
- `src/api/reviews.ts:195` — Hidangan per order untuk rating menu item (§20.2). **Best-effort**: tabel `order_items` di BE demo masih kosong dan…
- `src/components/layout/OpsShell.tsx:20` — Kerangka panel ops (M10, R-OPS) — website penuh non-PWA, dibuka dari desktop. Keputusan (keputusan PO: ops = desktop…
- `src/data/courier.ts:109` — Guard customer lalai saat menunggu OTP (flow F13): +5 menit kurir menghubungi customer, +10 menit kurir boleh…
- `src/data/courierBatch.ts:86` — Auto-sort rute (BR-B12, §9.6): greedy **nearest-neighbour** mulai dari dapur merchant. PRD memakai Google Route…
- `src/data/dashboard.ts:74` — Umur sebuah entry audit dalam hari. AuditEntry hanya menyimpan waktu sebagai teks tampilan (`'Hari ini 09:41'`), jadi…
- `src/data/incentive.ts:1` — Insentif merchant (R-INCENTIVE-01, flow F9). Dua hal yang berbeda dan mudah tertukar: 1. **Modal** — kredit sistem 5…
- `src/data/marketing.ts:69` — Program marketing dibuat/diubah lewat BE: `marketing_programs` + `marketing_rewards` + `marketing_rules`…
- `src/data/marketplace.ts:48` — Refund aktif: `refunds` ada di BE dan jalur tulisnya di `src/api/refunds.ts` (`POST` + baca baris). Kalau BE mati,…
- `src/data/marketplace.ts:133` — `merchantId` memakai id merchant seperti yang dipakai sisi lain: toko demo console merchant = `1` (`DEMO_MERCHANT_ID`,…
- `src/data/marketplace.ts:189` — Paket kuota yang bisa dibeli merchant (§17). Dua jenis bisa aktif bersamaan: kuota **order** (order online) dan kuota…
- `src/data/marketplace.ts:205` — Pembelian kuota aktif: `quota_packages` + `quota_subscriptions` ada di BE dan jalur tulisnya di `src/api/quota.ts`…
- `src/data/merchant.ts:43` — Tag toko yang boleh dipilih merchant (MER-03, R-CUS-DISCOVERY). Beranda pelanggan menggrup toko **per tag**; tag baru…
- `src/data/merchant.ts:63` — ── Pajak (R-TAX-01, F4) ──────────────────────────────────────────────────── Dua lapis: GST makanan (merchant yang…
- `src/data/merchant.ts:104` — Konfigurasi pengantaran merchant contoh (F20/F16). Di produksi ini dihitung server; di sini tampilan mock. Ongkir…
- `src/data/payout.ts:72` — Fee payout DANA **Rp2.500 per transfer**, dikenakan hanya saat pencairan berhasil (`source.md:573`). Siapa yang…
- `src/data/realtime.ts:1` — Katalog event realtime + matriks audiens (PRD aktif `sa7tein-mvp-2026-10-11` §19, NFR-05/06, ARC-08). Fungsi murni:…
- `src/hooks/useCourierTracking.ts:25` — Pelacakan kurir di demo diturunkan dari **waktu tempuh**, bukan dikirim BE: event `courier_location` (§19) belum…
- `src/hooks/usePullToRefresh.ts:3` — Tarik-untuk-menyegarkan, seperti app native. Keputusan 2026-09-24 mematikan `overscroll-behavior-y` di dokumen karena…
- `src/pages/CourierPartner.tsx:53` — Layar kurir partner (PRD §9.3/§9.5, flow f26). Satu order per waktu: kurir menerima assignment dari aplikator, lalu…
- `src/pages/CourierPartner.tsx:117` — Q06: prepare habis tanpa respons. Dipicu **BE** (`expire_assignments()`), bukan aksi kurir, dan SP dijatuhkan **ops**…
- `src/pages/CourierSignIn.tsx:15` — Masuk kurir (mock). Dua jenis akun, satu layar: `Kurir toko` (karyawan merchant, C-06) dan `Kurir partner` (direkrut…
- `src/pages/CustomerRefund.tsx:1` — Refund penuh satu order online (§16.6). Tujuan pengembalian bergantung metode bayar order: saldo DANA kembali otomatis;…
- `src/pages/MerchantOnboarding.tsx:22` — Langkah 2 onboarding merchant (flow f16 `profil`): form profil toko setelah signup. Mengisi foto (D1), identitas toko,…
- `src/pages/MerchantPayout.tsx:13` — Pencairan merchant (R-WALLET-01, flow f6): pilih rekening tujuan + nominal, lalu `POST /wallet/cashouts` versi mock (BE…
- `src/pages/MerchantPromos.tsx:321` — Program marketing (§15, ala Odoo): promosi, kupon, beli X gratis Y, loyalty. Modelnya beda dari kode promo di atas —…
- `src/pages/OrderChat.tsx:313` — Lampirkan foto ke chat: unggah ke R2, lalu kirim URL-nya sebagai body pesan (persist sebagai teks; dirender jadi…
- `src/pages/RatingDriver.tsx:17` — Nominal tip yang ditawarkan. PRD §Tips hanya menetapkan "opsional, 100% ke kurir, tanpa komisi platform" — besarannya…
- `src/pages/Reviews.tsx:21` — Foto ulasan: maksimal tiga, sama dengan bukti sengketa. PRD aktif §20.2 tidak menyebut foto pada review (lihat…
- `src/pages/ops/OpsDisputes.tsx:16` — Panjang minimum catatan putusan. Ini **bentuk** validasi, bukan aturan bisnis: angka pastinya (dan window 24 jam) belum…
- `src/store/slices/adminSlice.ts:178` — Ajukan banding ke SA setelah putusan level-1 CS (keputusan PO 2026-09-23). Satu banding per sengketa, sama seperti satu…
- `src/store/slices/coverageSlice.ts:11` — Coverage merchant (§9.1, MER-04) — mode area (polygon non-overlap) atau radius. Seed-nya `mockCoverage` yang sudah ada…
- `src/store/slices/merchantSlice.ts:77` — Tag toko (MER-03). Beranda pelanggan menggrup per tag; tag baru perlu moderasi ops sebelum tampil (§13). Tidak…
- `src/store/slices/merchantSlice.ts:101` — Status "sibuk" cuma tampilan (backend hanya punya `store_status` buka/tutup), jadi ia tak punya tempat di server.…
- `src/store/slices/partnerSlice.ts:65` — Prepare habis tanpa respons (COU-17, §9.5): assignment `expired`, mitra **offline**, dan order dilempar ke…
- `src/store/slices/payoutSlice.ts:21` — Dompet + rekening pencairan merchant (R-WALLET-01, flow f6). Pencairan menahan nominal saat diminta; fee Rp2.500 belum…
- `src/store/slices/walletSlice.ts:21` — Satu wallet untuk user yang sedang aktif (mock). Top-up mengikuti alur F3: request → `pending` → webhook → `completed`…
- `src/styles/system/_menu.scss:400` — Tiga nilai ini dulu hex mentah di blok :root milik _system.scss, dan --success bahkan MENIMPA token dari _tokens.scss —…
- `src/types.ts:164` — Ulasan dari sudut pandang merchant — terikat ke satu hidangan katalog supaya pemilik toko tahu menu mana yang…
- `src/types.ts:312` — Jumlah order selesai seumur akun. Dipakai label "Pelanggan Setia"; daftar order yang sedang berjalan tidak cukup jadi…
- `src/types.ts:631` — Jenis pengantaran (PRD §7.2/§7.3). `regular` masuk **batch** kurir inhouse, `quick` ditangani satu kurir partner.…
- `src/types.ts:1024` — Objek yang kena aksi, mis. order code atau nama merchant. **Masih string tampilan, bukan id** — taksonomi target belum…

## Bucket B — komentar alasan teknis yang menyimpan fakta (631)

Bukan utang. Isinya 'kenapa kode begini': angka hasil ukur, id bug/atlas, peristiwa nyata, larangan spesifik. Dipakai saat mengubah kode di sekitarnya supaya jebakan lama tidak terulang.

```
scripts/batch-check.mjs:31 — "Batas keras 24 order (BR-B04)."
scripts/be-mappers-check.mjs:145 — "D1 menolak `in.(...)` dengan terlalu banyak variabel: 66 order merchant pernah membuat order_items 400. Pecahan wajib menutup semua id, tanpa duplikat."
scripts/browser-gate.mjs:2 — "browser-gate — verifikasi UI di browser nyata lewat CDP (brave-debug, port 9355). Kenapa ada: pre-commit tidak bisa mengukur tata letak atau membuktikan sebuah tombol benar-benar…" [17 baris]
scripts/browser-gate.mjs:80 — "Butir DNA yang punya cek mekanis di gerbang ini (MD-04 zona jempol & MD-08/09 tipografi/bayangan dipegang `npm run scan` + review; dicetak apa adanya supaya tidak ada butir yang…"
scripts/browser-gate.mjs:402 — "Konsol SA (.sa-root) adalah shell-nya sendiri: root flex selebar jendela dengan sidebar + konten, bukan kolom 430px, dan bukan elemen main di dalamnya. Memilih .sa-root di sini…" [5 baris]
scripts/browser-gate.mjs:414 — "Kolom visual = lebar terluar yang masih lebih sempit dari jendela. Di desktop ini frame perangkat (462px), bukan kolom dalam (430px), dan bilah fixed memang boleh selebar frame —…"
scripts/browser-gate.mjs:451 — "Panel sheet yang terlihat: menempel tepi bawah, punya permukaan sendiri (bukan scrim gelap), lebar >= separuh viewport. Dua butir DNA bergantung padanya, dan keduanya adalah…" [7 baris]
scripts/browser-gate.mjs:467 — "Harus TERIKAT ke tepi bawah lewat leluhur fixed/absolute — kalau tidak, wadah halaman yang kebetulan berakhir di dasar viewport (halaman pendek) ikut terhitung sebagai sheet, dan…"
scripts/browser-gate.mjs:477 — "Tiga pengecualian, semuanya elemen yang tidak pernah jadi sasaran jari — bukan pelonggaran aturan. Ditulis di luar blok yang dikirim ke halaman supaya tidak ada backtick/tanda…" [9 baris]
scripts/browser-gate.mjs:504 — "Kotak centang/radio kecil di dalam label: yang benar-benar disentuh adalah labelnya, bukan kotak 18px-nya. Ukur target efektif itu — kalau labelnya cukup besar, kontrolnya memang…"
scripts/browser-gate.mjs:521 — "MD-03: sheet adalah pengecualian tunggal yang ditulis di mobile-dna.md — daftarnya dibatasi tinggi lalu menggulir DI DALAM panel. Tanpa pengecualian ini, gerbang menghukum pola…"
scripts/browser-gate.mjs:535 — "Elemen yang disembunyikan tidak menetapkan apa pun di layar. Panel modal ber-visibility hidden tetap punya padding 24px di DOM dan dulu ikut terhitung sebagai gutter halaman,…" [4 baris]
scripts/browser-gate.mjs:580 — "Permukaan yang memang dibuka di konten terbaru (thread chat). Gulirnya disengaja, bukan warisan halaman sebelumnya — lihat MD-03."
scripts/browser-gate.mjs:595 — "── butir DNA yang hanya terbukti dari DOM (MD-06/07/10/11) ────────────── Sebelum ini gerbang cuma mengukur lebar kolom dan target sentuh, jadi ia meloloskan hal yang justru…" [5 baris]
scripts/browser-gate.mjs:601 — "MD-11 — elemen ber-kelas .list-row adalah MARKER baris daftar (primitif src/styles/system/_list-row.scss). Baris sejenis dikelompokkan per induk, lalu lebar kolom 1-nya harus SATU…" [4 baris]
scripts/browser-gate.mjs:629 — "MD-07 — nominal (kolom 2 baris 1) rata kanan dan sebaris judul."
scripts/browser-gate.mjs:652 — "MD-10 — titik tengah bilah bawah harus bilahnya sendiri: posisinya ditanya ke DOM, bukan ditebak dari pathname (pernah menimpa bilah di /merchant/:id). Dilewati saat sheet…" [4 baris]
scripts/browser-gate.mjs:669 — "MD-06 — panel yang menempel tepi bawah dan punya permukaan sendiri (bukan scrim gelap) tidak boleh melewati ~60% viewport; lebih dari itu ia berhenti menjadi sheet dan berubah…"
scripts/browser-gate.mjs:679 — "MD-12 — konten tak boleh keluar dari kotak induknya, dan tak boleh terpotong diam-diam. Gerbang lama cuma melihat overflow tingkat HALAMAN (documentElement), sehingga baris badge…" [4 baris]
scripts/browser-gate.mjs:692 — "Permukaan app = tiga peran PWA + konsol backoffice. Landing dan /documentation adalah website penuh yang didokumentasikan bukan app (navigateFallbackDenylist), jadi kontrak DNA…" [4 baris]
scripts/browser-gate.mjs:733 — "(b) KELUAR KOTAK — anak melewati content-box induk yang overflow-nya terlihat. Selalu FAIL: isinya benar-benar lari keluar dari kotaknya (nyata: .merchant-ticket-stub-end meluber…" [5 baris]
scripts/browser-gate.mjs:816 — "Bar halaman teratas: kelas, tinggi, tepi atas. Dipakai untuk membuktikan tinggi bar satu nilai (--nav-height) di semua halaman, dan bahwa bar fixed benar-benar mulai dari tepi…" [5 baris]
scripts/browser-gate.mjs:858 — "Permukaan app = empat peran PWA + konsol SA. Landing dan /documentation adalah website penuh yang didokumentasikan bukan app (navigateFallbackDenylist), jadi kontrak DNA mobile —…" [5 baris]
scripts/browser-gate.mjs:884 — "Pengecualian lebar yang DIDOKUMENTASIKAN: konsol desktop (ops + SA .sa-root) sengaja tidak memakai kolom 430px di layar lebar (decision-ops-canonical.md). Gerbang membacanya dari…" [4 baris]
scripts/browser-gate.mjs:900 — "Butir DNA yang diukur di DOM. warn = MD-06 (ambang rasa, bukan batas keras): panel 61% masih mungkin disengaja, dan --strict yang memutuskan."
scripts/browser-gate.mjs:1024 — "Kolom = lebar viewport kalau viewport lebih sempit dari --shell-max. Konsol desktop yang terdokumentasi (sa-root) melebar penuh di ≥901px, jadi harapannya = lebar viewport, bukan…"
scripts/browser-gate.mjs:1080 — "Tinggi bar halaman satu nilai (DNA baris 20: tinggi minimum --nav-height). Sebelum kontrak `_topbar.scss` terukur 60/64/76px menurut halaman. Di app-mode tingginya bar + inset,…"
scripts/browser-gate.mjs:1090 — "Buktikan emulasi benar-benar berlaku. Mengukur di jendela klon (500px) pernah menghasilkan angka yang tidak ada hubungannya dengan app."
scripts/browser-gate.mjs:1145 — "Butir DNA yang diukur langsung di DOM (MD-06/07/10/11/12)."
scripts/browser-gate.mjs:1257 — "Kerangka loading juga "diam", jadi kehadiran `aria-busy` harus jadi bagian dari sidik: tanpa ini tiga sampel stabil berturut-turut bisa berarti halaman masih memuat data (terukur:…"
scripts/browser-gate.mjs:1289 — "Buka panel mengambang lewat klik NYATA (bukan `el.click()`) kalau rute ini punya bilah pemicunya. Dipakai agar MD-06/07/11 diukur di panel terbuka — di halaman tertutup,…"
scripts/browser-gate.mjs:1338 — "Tunggu animasi geser-masuk SELESAI sebelum diukur: di tengah animasi panel masih tergeser turun sehingga tepi bawahnya belum jatuh di viewport, deteksi sheet gagal, dan…"
scripts/browser-gate.mjs:1395 — "DNA: ukur di 390px DAN 1440px. Dua-duanya, bukan salah satu."
scripts/browser-gate.mjs:1486 — "Mode biasa mengukur apa yang disajikan server, bukan apa yang tersimpan di cache service worker dari pengukuran sebelumnya. Profil klon gate menyimpan SW antar jalan, dan tanpa…" [5 baris]
scripts/browser-gate.mjs:1569 — "Butir DNA MD-06/07/11 hidup DI DALAM panel mengambang (sheet keranjang): mengukurnya di halaman tertutup = tidak mengukurnya. Panel dibuka dengan klik nyata, lalu diukur sebagai…"
scripts/browser-gate.mjs:1575 — "MD-03 mengukur "gulir saat halaman DIBUKA". Baris ini datang setelah sweep klik + membuka panel, yang keduanya menggulir halaman (tiap target di-scrollIntoView). Tanpa memulihkan…" [6 baris]
scripts/browser-gate.mjs:1632 — "Setelah `npm run build`, muat pertama masih menyajikan shell LAMA dari precache: service worker baru mengambil alih lalu memuat ulang. Mengukur terlalu cepat = mengukur build…" [5 baris]
scripts/chat-check.mjs:1 — "Self-check aturan group chat per order (M7, PRD §20.1, CUS-26, COU-07). Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/chat-check.mjs"
scripts/chat-check.mjs:45 — "Status thread: batal/tolak menutup langsung; selesai menutup (durasi OPEN-20)."
scripts/check-governance.mjs:104 — "Galeri index.html adalah daftar tulis-tangan (bukan turunan INDEX.json), jadi gampang ketinggalan saat flow baru ditambah. Jaga tiap flow wajib muncul di sana."
scripts/check-governance.mjs:120 — "── Feature definitions (versions/<rev>/features/R-*.md) ──────────────────── Milestone tidak boleh "selesai" kalau requirement rujukannya belum punya definisi fitur ber-acceptance…" [5 baris]
scripts/cod-cash-check.mjs:26 — "Kalau tagihan sudah pas 1 JOD, pilihan "1 JOD" tidak diulang."
scripts/courier-batch-check.mjs:20 — "Batch demo mengikat tugas kurir yang ber-batchId (3 order aktif; ct-4 selesai)."
scripts/coverage-check.mjs:135 — "Regresi produksi: dapur & alamat live sama-sama di Irbid (32.555, 35.85). Titik dapur WAJIB ikut `coverage.origin` dari BE; memakai konstanta mock Jakarta membuat semua alamat…"
scripts/e2e-browsers.mjs:2 — "e2e-browsers.mjs — kelola + pakai SATU **jendela PWA** per peran (customer, merchant, courier, ops, superadmin) untuk testing flow e2e. Tiap peran = INSTANCE browser sendiri,…" [37 baris]
scripts/e2e-browsers.mjs:236 — "Jendela PWA = ukuran ponsel; shell repo terkunci `--shell-max` 430px."
scripts/e2e-browsers.mjs:304 — "Kunci asli (brave-core `components/constants/pref_names.h` → kBraveGCMChannelStatus): default false membuat `PushManager.subscribe` gagal "Registration failed - push service…"
scripts/e2e-browsers.mjs:334 — "`--app=` = jendela PWA (tanpa chrome browser). Wajib PWA, bukan browser biasa."
scripts/e2e-browsers.mjs:424 — "Preflight WAJIB sebelum testing per-peran: server hidup + tiap jendela role ada di portnya (app-mode). TIDAK membuka apa pun — hanya memeriksa. Keluar non-nol kalau ada yang…"
scripts/e2e-browsers.mjs:493 — "Pengukuran mobile-friendliness halaman yang sedang terbuka di jendela role. Membaca DOM, bukan tangkapan layar: overflow, sasaran sentuh <44px, skala huruf, penggulung bersarang,…"
scripts/live-rate-check.mjs:2 — "Self-check kontrak provider kurs live (keputusan OQ-26). Yang bisa rusak di luar kode kita: URL provider berubah / skema JSON berubah. Skrip ini memvalidasi dua URL yang dipakai…" [6 baris]
scripts/marketing-check.mjs:1 — "Self-check program marketing (§15): jendela tanggal, kepemilikan program, syarat rule, hitung diskon (persen + nilai tetap + batas maks + poin loyalty), hadiah yang belum…" [4 baris]
scripts/merge-orders-check.mjs:1 — "Self-check `mergeOrders` (BUG-88046): kolom yang hanya hidup di klien harus selamat dari refetch BE. Jalankan: node --import ./scripts/lib/ts-resolve.mjs…"
scripts/mobile-audit.mjs:2 — "mobile-audit — kerapian UI per halaman lewat Moli (CDP, default :9222). Pembagian alat di repo ini: - browser-gate (brave :9359) → invarian tata letak: kolom, overflow, gutter,…" [14 baris]
scripts/money-check.mjs:22 — "Ft: hanya QRIS, dan = 1,5% x (S - Dm - Da + F + Pc)."
scripts/partner-check.mjs:1 — "Self-check aturan kurir partner (M6, PRD §9.3/§9.5, COU-15..18, §18). Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/partner-check.mjs Tanpa framework: assert…"
scripts/partner-check.mjs:31 — "Reject tanpa alasan = tidak dijalankan (COU-18): status & reservasi tak berubah."
scripts/partner-check.mjs:43 — "Approve: kurir jadi busy dan tak ada assignment kedua (COU-15 satu order per waktu)."
scripts/partner-check.mjs:49 — "SP (COU-17, §18) tercatat sebagai punishment."
scripts/realtime-check.mjs:15 — "Matriks §19 punya 22 baris; seluruhnya harus ada di katalog."
scripts/rule-check.mjs:22 — "Katalog utuh: setiap rule menunjuk kategori yang ada, dan setiap bagian kompensasi/punishment menunjuk rule yang ada. Id menggantung pernah terjadi (`rule-late-1`, `cat-late`) dan…"
scripts/rule-check.mjs:65 — "Kategori yang tidak dipilih merchant → belum ada rule, dan OPEN-18 tidak dijawab dengan mengarang rule dasar."
scripts/slice-check.mjs:2 — "Gerbang statik irisan HTML login/daftar: docs/design/slice/auth/*.html node scripts/slice-check.mjs Panel ops punya stylesheet sendiri (`ops.css`) dan tidak memakai aturan…" [13 baris]
scripts/slice-check.mjs:90 — "State salah wajib lengkap: role="alert" + aria-invalid + aria-describedby"
scripts/slice-check.mjs:113 — "Badge merek: cakram putih di kepala wajib berisi LOGO repo — mark `/icons/sa7tein-mark.svg` (persegi, muat di cakram) atau logo lengkap `/icons/sa7tein-wordmark.svg`. Nama merek…" [4 baris]
scripts/slice-check.mjs:127 — "Korsel: 5 slide per kepala — 4 foto + duplikat foto pertama di urutan terakhir. Duplikat itu yang menutup putaran, jadi kepala tidak pernah menunjukkan dasar oranye (pernah…"
scripts/surface-scan.mjs:47 — "── 1. Token: apakah setiap var(--x) punya definisi? ──────────────────────── Ini pernah bikin seluruh halaman rusak: satu var() tak terdefinisi membatalkan seluruh deklarasi…"
scripts/surface-scan.mjs:190 — "── 5. preserveAspectRatio="none" (aturan repo) ──────────────────────────── Termasuk di dalam komentar: pernah gagal commit karena komentarku sendiri."
scripts/surface-scan.mjs:274 — "── 9. Wizard wajib: berkas yang di commit harus sinkron dokumentasi ──────"
scripts/surface-scan.mjs:283 — "── 10. Gerbang display-mode: standalone wajib ikut fullscreen ──────────── App terinstal bisa melaporkan `fullscreen` (Fullscreen API), bukan cuma `standalone`. Aturan safe-area…" [5 baris]
scripts/surface-scan.mjs:351 — "── 11. Warna mentah di lapisan design system ───────────────────────────── Aturan repo (AGENTS §3/§4): gaya baru tinggal di `src/styles/system/` dan wajib memakai token…" [5 baris]
scripts/surface-scan.mjs:438 — "Slop tells: palet warna bergilir per item (varian **numerik** `tone-0/1/2`; nama semantik `tone-info/success` sengaja lewat — itu peran, bukan siklus), garis aksen berwarna di…" [6 baris]
scripts/tracking-check.mjs:1 — "Self-check aturan pelacakan kurir (M7, PRD §9.7, COU-06, L1). Jalankan: node --import ./scripts/lib/ts-resolve.mjs scripts/tracking-check.mjs"
src/App.tsx:144 — "Layar yang isinya form masuk. Modal pasang aplikasi tidak boleh muncul di sini: terukur, klik ke `.auth-submit` mendarat di `.install-prompt-box` sehingga tombol masuk tak bisa…"
src/App.tsx:258 — "Konsol Super Admin — role terpisah, dipasang di /superadmin/* (keputusan PO 2026-09-23: website penuh non-PWA, prefix disiapkan). Lebar penuh karena dashboard bertabel, bukan…"
src/App.tsx:356 — "Rute yang hanya masuk akal **sebelum** sesi aktif. Setelah masuk, back dari beranda tidak boleh membuka lagi layar masuk (MD-13 `NB-04`/`NB-05`)."
src/App.tsx:452 — "Cermin `AuthGate`: rute auth tidak boleh dibuka lagi saat sesi aktif. Back dari beranda mendarat di beranda (`replace`), bukan layar masuk (MD-13)."
src/App.tsx:597 — "Singkirkan splash lewat class, bukan `remove()` atau `hidden = true`. Keduanya tidak bisa ditimpa oleh POJO (`img.onerror`), jadi satu ikon yang gagal dimuat membuat splash…" [6 baris]
src/api/catalog.ts:41 — "Jangkauan merchant dari BE (jsonb `delivery_config`). Mode radius punya `radiusMeters`; mode area memakai `activeZones`/polygon. Dipakai menghitung `outOfCoverage` (PRD §6/§9.1) —…"
src/api/dispatch.ts:1 — "Dispatch kurir partner (§9.3–§9.5) ↔ `dispatch_assignments` + `couriers`. Kontrak live (diverifikasi 2026-10-17): - `dispatch_assignments`: `id, order_id, courier_id, status,…" [11 baris]
src/api/orders.ts:129 — "Tulis order baru; kembalikan `{id, code}` baris BE untuk pelacakan customer. `status` wajib ditulis eksplisit. Default kolom `orders.status` adalah `'cart'` — nilai itu **draft**…" [7 baris]
src/api/orders.ts:228 — "Tulis status order ke `orders.status` (best-effort; id seed dilewati). `extra` menampung kolom yang menyertai sebuah transisi. Untuk pembatalan customer, `f18-order-state`…" [4 baris]
src/api/partner.ts:1 — "Kurir partner: identitas mitra, assignment, dan SP. Kontrak live (diverifikasi 2026-10-20): - `couriers.user_id` menunjuk akun login mitra; `courier_type = 'partner'` untuk mitra…" [11 baris]
src/api/partner.ts:166 — "Respons mitra: `approved`/`rejected` + waktu (COU-18)."
src/api/payments.ts:1 — "Katalog metode bayar dari BE (tabel `payment_methods`, publik). Dua hal yang disengaja: 1. **DB masih memakai nama provider lama.** Kolom `key` di BE berisi…" [10 baris]
src/api/profile.ts:236 — "Coverage otoritatif dari server (RPC `check_coverage`): poligon zona + jarak ≤ radius + toggle zona aktif merchant. Worker v2 mengembalikan **boolean** saja; zona + jarak dihitung…" [4 baris]
src/api/reference.ts:407 — "Tulis poligon master zona (SA/ops) → `zones.polygon`, array `[lat,lng]`. FE memakai `{lat,lng}`, jadi konversinya di sini. `zones_ops` RLS mewajibkan peran `cs`/`superadmin`;…"
src/api/supabase.ts:281 — "DELETE baris PostgREST. `query` wajib berisi filter (mis. `?id=eq.7`) — tanpa filter PostgREST menolak agar tidak menghapus seluruh tabel. /export async function deleteWith("
src/api/supabase.ts:301 — "POST yang **mengembalikan baris** (`Prefer: return=representation`) — dipakai saat id/code baris baru diperlukan (mis. `orders` setelah checkout). `select` wajib menyebut kolom…" [6 baris]
src/components/OrderStageScreen.tsx:263 — "Window sengketa 24 jam (M6) dihitung dari order selesai. Order yang belum lewat alur checkpoint dianggap masih di dalam window — mock, bukan aturan final (kategori + window masih…"
src/components/courier/CourierDispatchAlarm.tsx:14 — "Alarm tugas baru untuk kurir inhouse. Kenapa takeover, bukan sekadar badge: dispatch datang saat makanan sudah matang, dan lonceng kecil di header kalah oleh layar tugas yang…" [10 baris]
src/components/courier/CourierDispatchAlarm.tsx:41 — "Alarm = overlay modal: back menutupnya, bukan memindah layar (MD-13 NB-02)."
src/components/courier/CourierDispatchAlarm.tsx:52 — "Satu pola tiap 3 detik, berhenti setelah 30 detik atau saat alarm ditutup. Saat tab disembunyikan bunyinya berhenti, bukan menumpuk."
src/components/courier/CourierHomeHero.tsx:18 — "Hero beranda kurir. Menggabungkan identitas kurir (nama + nomor WA) dan status siap/jeda jadi satu bidang merek di puncak beranda — pola yang sama dengan beranda merchant…" [12 baris]
src/components/customer/ActiveOrderRow.tsx:52 — "Detak 1 detik untuk jendela batal; baris yang statusnya di luar jendela tetap diam (remaining = 0)."
src/components/customer/ActiveOrderRow.tsx:79 — "Tenggat = chip bertitik, bukan kata abu di tengah string meta (MD-07). Angka berganti tiap detik: `aria-live` sengaja mati."
src/components/customer/ActiveOrderRow.tsx:96 — "Kolom aksi selebar tetap; CSS menyembunyikannya untuk seluruh daftar bila tak ada satu pun baris beraksi, supaya gutter kanan tidak menyisakan 44px kosong. Bila ada aksi, semua…"
src/components/customer/CustomerHomeHero.css:101 — "Kotak pin 40px, mengikuti desain v2 (kaca putih di atas oranye)."
src/components/customer/CustomerHomeHero.css:265 — "Kotak putih tinggi 48px mengikuti desain v2, terpisah dari tombol filter supaya keduanya sama-sama 48px dan sejajar."
src/components/customer/CustomerHomeHero.css:360 — "Naik-turun: kata masuk dari bawah, naik ke tempatnya. Arahnya satu. `from` sengaja tidak menyembunyikan kata, dan fill-mode-nya `none` (bukan `both`). Alasannya ditemukan saat…" [10 baris]
src/components/customer/HomePromoCarousel.tsx:8 — "Kartu promo beranda: tiga kartu yang bergeser sendiri. Dua keputusan yang perlu dijelaskan: 1. **Latar foto makanan, bukan gelombang saja.** Dekorasi lama cuma SVG gelombang di…" [16 baris]
src/components/customer/HomePromoCarousel.tsx:105 — "Tekstur gelombang di atas latar foto. Tiga pita dari bawah (paling gelap di depan supaya terbaca berlapis) plus titik di sudut kanan atas, dijaga di opasitas 4-14% supaya tidak…" [5 baris]
src/components/customer/OrderRefundCelebration.tsx:19 — "Selaras denyut perayaan `celebrate-*` (`_post-order.scss` ±2,4 dtk) + jeda baca."
src/components/customer/OrderRefundCelebration.tsx:32 — "Splash = overlay modal: back menutupnya (MD-13 NB-02)."
src/components/customer/orderStatus.ts:27 — "Alasan batal yang bisa dipilih customer. Opsional, tapi `f18-order-state` mewajibkan transisi cancel membawa `cancelReason` — tanpa ini merchant/ops tak punya bahan untuk sengketa…"
src/components/customer/orderStatus.ts:34 — "Sisa jendela batal dalam milidetik (0 = sudah lewat / memang tak bisa batal). Waktu dibaca dari `createdAtMs`, bukan teks `placedAt` yang dibulatkan ke menit — itu selalu tampak…"
src/components/layout/BottomNav.tsx:46 — "Portal ke `document.body`, bukan dirender di dalam halaman. Alasannya kontrak animasi halaman: wadah transisi di `App.tsx` memakai `transform` untuk menggeser halaman (M3 "forward…" [10 baris]
src/components/layout/SuperAdminShell.tsx:31 — "Kerangka konsol Super Admin. Keputusan desain (satu alasan per pilihan, QL-01): - Sidebar + konten penuh, bukan kolom 430px: SA memakai dashboard bertabel dari desktop (keputusan…" [12 baris]
src/components/merchant/AcceptOrderSheet.tsx:26 — "Gerbang accept merchant (PRD §7.2/§7.3, MER-11/MER-12) — satu komponen untuk kedua cabang supaya perbedaannya terbaca, bukan tersebar: - **Regular** masuk **batch** kurir inhouse;…" [6 baris]
src/components/merchant/MerchantCookPanel.tsx:23 — "Blok dapur di sheet detail: estimasi masak, packing, lalu langkah setelahnya. Dipisah dari halaman karena `MerchantOrders.tsx` sudah menyentuh batas 700 baris (AGENTS §3); isinya…"
src/components/merchant/MerchantEarnings.tsx:9 — "Invoice bersih milik merchant: yang benar-benar masuk ke toko. Ongkir dan biaya layanan customer bukan pendapatan toko (§16.4), jadi dasarnya subtotal item. Dipisah dari halaman…" [5 baris]
src/components/merchant/MerchantHomeHero.tsx:97 — "Nama toko di barisnya sendiri, bukan berbagi baris dengan dua kontrol (sakelar mata uang + lonceng). Berbagi baris membuat kolom nama cuma ~157px sementara "Warung Sate Pak Ali"…" [4 baris]
src/components/merchant/MerchantOrderCash.tsx:8 — "Uang tunai yang dibayar customer di tempat untuk order COD, tampil di detail order masuk supaya merchant menyiapkan kembalian sebelum menerima order. Order non-COD dan order batal…" [5 baris]
src/components/merchant/OrderChatLink.tsx:8 — "Tautan ke chat group order (pembeli + toko + kurir, PRD §20.1) dari konsol merchant. Param `?as=merchant` membuat `OrderChat` memakai sudut pandang merchant, bukan customer.…" [4 baris]
src/components/merchant/ProgramFormSheet.tsx:13 — "Form buat program marketing (§15, mock). Satu program = satu rule + satu reward; hidup di slice `marketing` sampai BE punya tabel program. Dipisah dari `MerchantPromos` supaya…"
src/components/ui/AuthCoverHero.tsx:3 — "Kepala layar masuk: satu foto penuh, berganti sendiri tanpa kedip. Kenapa bukan `AuthBanner`: banner itu menggeser track (translate), sedangkan di sini foto berganti dengan *fade…" [11 baris]
src/components/ui/AuthLayout.tsx:9 — "Satu kerangka untuk semua layar masuk/daftar. Dulu kelima layar ini menyalin markup Bootstrap hasil porting (`.screen`/`.container`/`.row`/`.col`) dan mewarisi tiga penyimpangan…" [11 baris]
src/components/ui/AuthLayout.tsx:27 — "Foto makanan dari `public/assets/`. Wajib diisi kecuali untuk layar status yang memang tidak butuh konteks visual."
src/components/ui/AuthLayout.tsx:52 — "Susunan kepala layar. `'pill'` (bawaan) = pita foto dengan pil merek kecil di kiri-atas, dipakai layar auth lain. `'hero'` = blok merek oranye bersudut membulat (tanda merek di…" [9 baris]
src/components/ui/BackButton.tsx:20 — "MD-13 `NB-07`: `navigate(-1)` hanya sah bila memang ada entri sebelumnya."
src/components/ui/BackButton.tsx:26 — "Satu-satunya tombol kembali design system (`_topbar.scss` → `$back-solid`): kotak 44px, `--radius-md`, permukaan `--surface` + `--border-strong`, chevron 24px stroke 1,75. Dengan…" [5 baris]
src/components/ui/BottomSheet.tsx:20 — "Back platform menutup sheet, bukan memindahkan halaman (MD-13 `NB-02`). Logika riwayat tinggal di satu hook yang dipakai semua overlay modal."
src/components/ui/BottomSheet.tsx:70 — "Portal ke `document.body`, sama seperti `BottomNav`. Wadah transisi halaman (`page-enter-*`) menjalankan `animation: page-fade` dengan `fill: both`, dan animasi yang masih…" [9 baris]
src/components/ui/InstallAppCard.tsx:5 — "Kartu "Pasang aplikasi" untuk keempat peran. Satu komponen supaya tidak ada empat salinan logika `beforeinstallprompt` — logikanya di `useInstallPrompt`. Kalau browser punya…" [13 baris]
src/components/ui/InstallPromptSheet.tsx:37 — "Kartu ini duduk di zona jempol yang sama dengan `.page-fab`. Tingginya bergantung lebar layar (teks membungkus), jadi tinggi aslinya diukur dan diteruskan sebagai…" [5 baris]
src/components/ui/MerchantCard.tsx:11 — "Baris promo singkat, mis. "Promo hemat 30%", dihitung dari menu berdiskon."
src/components/ui/MerchantCard.tsx:30 — "Ubin toko di beranda customer, dua kolom: foto 16:9 di kepala kartu (cukup besar untuk mengenali makanannya), lalu nama (maks 2 baris) dan satu baris fakta rating • jarak • waktu…" [6 baris]
src/components/ui/MoneyPair.tsx:8 — "Pasangan IDR + JOD **dua baris**, untuk sel tabel konsol SA. Satu baris (`money()`) tidak muat di tabel yang kolomnya banyak: tabel pajak butuh 1031px di ruang 934px, tabel…" [9 baris]
src/components/ui/NotificationBell.tsx:36 — "Lonceng notifikasi untuk header peran (merchant/kurir/CS). Angka dari slice yang sama dengan lonceng beranda customer, jadi badge dan halaman inbox tidak bisa berbeda. Navigasi…" [7 baris]
src/components/ui/NotificationBell.tsx:57 — "Popup notifikasi desktop = overlay: back menutupnya (MD-13 NB-02)."
src/components/ui/NotificationRow.tsx:20 — "Satu baris notifikasi. Satu sumber markup untuk kotak masuk penuh (`/notifications`) dan popup lonceng konsol desktop, jadi keduanya tak bisa melenceng. Klik menandai dibaca di…" [4 baris]
src/components/ui/PageHeader.tsx:17 — "Tombol kembali di tepi **kiri** bar. `true` kembali satu langkah (`navigate(-1)`); string = tujuan tetap. Ini kontrol 44px, jadi judulnya ikut turun ke langkah header. Tombol…" [4 baris]
src/components/ui/PageHeader.tsx:24 — "Lonceng notifikasi di kanan baris judul. **Mati secara default.** Lonceng hanya milik layar **akar** peran (beranda), tempat inbox memang jadi tujuan tingkat atas; halaman anak…" [7 baris]
src/components/ui/PageHeader.tsx:34 — "Di konsol web desktop (≥901px) lonceng membuka popup daftar notifikasi alih-alih pindah halaman; di lebar ponsel tetap pindah ke inbox. Hanya selubung konsol desktop yang…"
src/components/ui/PageHeader.tsx:42 — "Header halaman untuk merchant, kurir, dan panel CS. Menggantikan isi tiga komponen yang sama persis — `MerchantPageHeader`, `CourierPageHeader` — yang berbeda hanya pada awalan…" [22 baris]
src/components/ui/Sa7teinHeroPattern.tsx:1 — "Pola latar hero oranye — dipakai beranda pelanggan (`CustomerHomeHero`) dan beranda dapur merchant (`MerchantHomeHero`). Komposisinya dari versi terbaru: dua gelombang organik,…" [17 baris]
src/components/ui/TrendBars.tsx:20 — "24 jam butuh batang rapat; tanpa ini gap 16px memakan seluruh lebar kolom."
src/components/ui/TrendBars.tsx:103 — "Label dipisah dari kolom: 24 batang hanya 11px per kolom, sedangkan label "00" butuh 17px. Ditempel absolut di posisi batangnya, jadi tidak terpotong dan tidak menambah lebar…"
src/components/ui/WalletTopUpGate.tsx:8 — "Gate saldo awal (R-TOPUP-01) — ditampilkan di checkout/pembayaran kalau saldo `available` di bawah 3,5 JOD. Tombol di dalamnya menuju layar top-up (M3), karena gate tanpa jalan…"
src/data/admin.ts:81 — "Kategori sengketa. Daftar final belum ada di PRD (OQ-29 — finalisasi kategori ditunda sampai volume >5/bulan), jadi ini placeholder yang wajar untuk showcase. Jangan diklaim…"
src/data/admin.ts:94 — "Window pengajuan sengketa (jam) dihitung dari order selesai. Angka 24 jam ada di PRD M6; finalisasi kategori + window menunggu volume (OQ-29), jadi jangan dianggap terkunci."
src/data/admin.ts:128 — "Kewajiban platform: saldo customer + merchant + tips kurir yang belum di-payout."
src/data/admin.ts:153 — "Selisih saldo DANA terhadap kewajiban; negatif = kurang (flag di dashboard)."
src/data/auth.ts:3 — "Foto per layar auth. Semuanya sudah ada di `public/assets/img/menu/` dan dipakai halaman menu toko, jadi tidak ada aset baru yang ditambahkan untuk layar masuk. `alt` ditulis…" [9 baris]
src/data/auth.ts:43 — "Foto kepala layar masuk customer (varian `brandLayout="cover"`). Empat foto lama, bukan aset baru: kepala kini foto penuh, bukan tekstur 12%, jadi warnanya harus benar dan tidak…" [6 baris]
src/data/authCopy.ts:1 — "Isi layar masuk dan daftar. Teksnya sengaja hidup di sini, bukan di dalam JSX, karena dua alasan: 1. `AuthLayout` adalah satu-satunya kerangka untuk lima layar. Yang berbeda antar…" [13 baris]
src/data/batch.ts:137 — "Persentase kapasitas batch terisi, dibulatkan; cocok dengan label `n/24 order`."
src/data/beMapping.ts:202 — "Pecah daftar id untuk query `in.(...)`. D1 menolak query dengan terlalu banyak variabel SQL (`too many SQL variables`), dan itu mematikan seluruh join — mis. 66 order merchant…"
src/data/chat.ts:3 — "Peserta & lifecycle chat per order (PRD aktif `sa7tein-mvp-2026-10-11` §20.1, CUS-26, COU-07). Chat dibuka saat order dibuat dengan peserta awal customer + merchant; kurir baru…"
src/data/chat.ts:29 — "Assignment kurir partner sudah di-approve (COU-07, §20.1)."
src/data/chat.ts:50 — "Status thread (§20.1): ditutup **langsung** saat order batal/ditolak, dan beberapa jam setelah order selesai. Durasi "beberapa jam" = OPEN-20, jadi tak diangkakan di sini — layar…"
src/data/chat.ts:74 — "Kurir partner bergabung setelah approve (COU-07). Order partner di BE belum punya id yang bisa disandingkan dengan order customer di demo ini, jadi keanggotaan diturunkan dari…"
src/data/codCash.ts:17 — "Label chip, mis. "Uang pas" atau "1 JOD"."
src/data/codCash.ts:37 — "Pilihan nominal cepat: uang pas, dibulatkan ke 1 JOD berikutnya, lalu ke kelipatan 5 JOD berikutnya. Nominal yang sama dengan tagihan tidak diulang."
src/data/codCash.ts:56 — "Lewati nominal yang tidak menambah pilihan (mis. total sudah 1,00 JOD)."
src/data/courier.ts:88 — "SLA tiap jeda checkpoint (menit), kunci = checkpoint saat ini → batas waktu menuju langkah berikutnya. Angka 15/30/10 adalah keputusan SEMENTARA PO 2026-09-22; final menunggu data…" [4 baris]
src/data/courierWallet.ts:83 — "Baris ledger **fee pengantaran** dari tugas yang sudah selesai dan ber-fee > 0. Fee order Regular online dikirim **otomatis ke DANA kurir** saat order selesai (PRD §16.4), jadi…" [4 baris]
src/data/currency.ts:5 — "Fallback kurs IDR→JOD — dipakai sebelum sync live pertama berhasil, atau ketika provider tak terjangkau (OQ-28: fetch gagal → pakai rate terakhir, jangan blokir transaksi). Semua…" [6 baris]
src/data/currency.ts:22 — "Kalimat wajib di dekat nominal JOD (R-CURR-01)."
src/data/currency.ts:25 — "Provider kurs live (keputusan menutup OQ-26): `fawazahmed0/exchange-api`, JSON statis di CDN GitHub/jsDelivr — tanpa API key, tanpa backend. Mirror kedua dipakai kalau CDN utama…"
src/data/currency.ts:172 — "Nominal JOD, mis. `100.223,71 JOD` — pemisah ribuan sama dengan `moneyPlain`."
src/data/currency.ts:180 — "Nominal uang untuk UI: IDR + padanan JOD, mis. `Rp25.000 · ±1,09 JOD`. Nol dilewatkan tanpa padanan — `Rp0 · ±0,00 JOD` cuma menambah bising di baris diskon/biaya yang memang…"
src/data/currency.ts:191 — "Nominal uang dari angka yang tersimpan dalam JOD: IDR (source of truth) + padanan JOD, mis. `Rp80.500 · ±3,50 JOD`. Dipakai konsol CS, yang angka mock-nya ditulis dalam JOD —…" [4 baris]
src/data/dashboard.ts:55 — "Komposisi kewajiban platform: saldo wallet customer + merchant + tips kurir."
src/data/dashboard.ts:69 — "Fee platform terkumpul per periode laporan pajak (0,37 JOD/order)."
src/data/dashboard.ts:117 — "Alokasi nominal sengketa per status (JOD) — berapa uang yang sedang mengendap di antrean putusan. Segmen nol dibuang supaya legenda tidak penuh `0,00 JOD`."
src/data/incentive.ts:25 — "Modal awal merchant baru (I-1/I-2 resolved)."
src/data/incentive.ts:93 — "State awal demo. Tier 1 sengaja sudah terlewati (512 order settled) supaya UI penanda tier + cashback 15 JOD langsung terlihat; sisa modal 3,05 JOD berarti sekitar 20 order sudah…"
src/data/invoice.ts:60 — "Invoice sisi merchant. Ongkir dan biaya layanan customer tidak masuk pendapatan toko (keduanya milik kurir/aplikator, §16.4), jadi subtotal item yang jadi dasarnya. Order **COD…" [7 baris]
src/data/invoice.ts:81 — "§17 tabel: pada kuota COD, platform fee customer jadi 100% hak merchant."
src/data/marketing.ts:1 — "Program marketing ala Odoo (PRD §15) — **fungsi murni**, JOD. Layar tinggal menampilkan hasilnya; tidak menghitung ulang di JSX (AGENTS §11). Kata "stackable" (§15.3) semantiknya…" [10 baris]
src/data/marketplace.ts:29 — "Transaction fee pembayaran QRIS = 1,5% x (S - Dm - Da + F + Pc) (§16.2). Tidak berlaku untuk saldo DANA maupun COD."
src/data/marketplace.ts:55 — "Dispatch kurir partner (PRD §9.4/M6): kandidat mitra dibaca live dari `couriers` non-inhouse (`src/api/dispatch.ts`), dan penugasan kurir menulis `orders.courier_id`. Yang belum:…" [4 baris]
src/data/marketplace.ts:212 — "Program marketing (§15) pindah ke `./marketing` — berkas ini menyentuh batas 500 baris. Seed program, rule, reward, dan kartu loyalty ada di sana. — Refund —"
src/data/marketplace.ts:270 — "Rincian harga satu order (§16.3). `total = S − Dm − Da + F + Pc + Ft`. `Ft` = 1,5% × (S − Dm − Da + F + Pc) dan **hanya QRIS**; saldo DANA dan COD tidak kena transaction fee…" [4 baris]
src/data/merchant.ts:22 — "Fee platform flat (PRD v2 "Fee Platform", update PO 2026-09-21): merchant 0,15 + customer 0,22 = 0,37 JOD per order. Berlaku **semua** metode, termasuk COD cash & transfer manual…" [4 baris]
src/data/merchant.ts:32 — "Akun baru wajib top-up minimal 3,5 JOD (Rp80.500) sebelum bisa order (R-TOPUP-01)."
src/data/merchant.ts:80 — "GST atas objek fee platform 0,37 JOD (info-only, tak masuk total bayar)."
src/data/merchant.ts:85 — "Gate saldo awal (R-TOPUP-01, guard flow F3): akun wajib punya minimal 3,5 JOD sebelum bisa order — berlaku **semua metode**, bukan cuma bayar pakai saldo. Saldo tepat di ambang…"
src/data/merchant.ts:162 — "Deposit COD merchant & tenant (3,50 JOD, PRD §5C). Approve = verifikasi transfer dulu."
src/data/merchantTrend.ts:53 — "Label diturunkan dari tanggalnya, bukan ditulis "Sen…Min": deret ini bergerak mengikuti hari ini, jadi label mati akan berbohong begitu hari berganti (terukur: batang bertanggal…"
src/data/merchantTrend.ts:192 — "Pendapatan hari ini per jam (24 batang) dari order yang benar-benar ada. Order tanpa `placedAtMs` tidak bisa ditempatkan pada satu jam, jadi dilewati — lebih baik batang kosong…" [4 baris]
src/data/merchantTrend.ts:246 — "12 batang di kolom 430px hanya selebar ~15px: nama bulan tiga huruf tidak muat (terukur terpotong), jadi sumbu memakai nomor bulan 01-12. Nama bulan lengkap dipakai di keterangan…"
src/data/merchantTrend.ts:322 — "Peringkat menu dari isi order yang ada — bukan mock baru. `MerchantOrder.items` sudah membawa `CartItem.quantity` dan `price`, jadi "menu apa yang paling disukai" bisa diturunkan…" [10 baris]
src/data/order-stage-copy.ts:4 — "Copy layar pelacakan order per tahap. Dipindah dari komponen supaya berkas `OrderStageScreen` tetap di bawah batas 600 baris (AGENTS §3) dan teks tahap hidup bersama data mock…"
src/data/superadmin.ts:29 — "PPh final atas fee platform, 0,5% (keputusan PO 2026-09-23). Angka tarif final menunggu konsultan pajak (OQ-17/18), jadi ini dipakai sebagai placeholder yang berlabel, bukan tarif…"
src/data/superadmin.ts:296 — "Fee platform terkumpul dari sejumlah order (0,37 JOD/order)."
src/data/superadmin.ts:301 — "GST atas objek fee platform (16%), info, belum dipungut (OQ-17)."
src/data/superadmin.ts:306 — "PPh final 0,5% atas fee platform."
src/data/tracking.ts:1 — "Aturan pelacakan kurir (PRD aktif `sa7tein-mvp-2026-10-11` §9.7, COU-06, L1). Fungsi murni: layar hanya menyalurkan waktu dan geometri, keputusan aturannya di sini supaya bisa…"
src/data/wallet.ts:54 — "Nominal preset top-up. Ditulis dalam JOD karena itu yang dipikirkan user, lalu diturunkan ke IDR sekali supaya state tetap IDR (R-CURR-01). 3,5 JOD = ambang gate akun baru…"
src/hooks/useApiChat.ts:1 — "Chat order live (customer ↔ kurir). Tabel `chats`/`chat_messages` tidak masuk publication Realtime backend, jadi jalur ini polling ringkas (5 dtk) bukan websocket — sejajar…" [4 baris]
src/hooks/useApiNotifications.ts:15 — "Kurir memikul order yang sudah matang: 30 detik terlalu lama untuk tugas baru, jadi audiensnya dipoll lebih rapat. Peran lain tetap 30 detik agar tidak menambah beban tanpa…"
src/hooks/useBackClose.ts:3 — "Satu-satunya cara overlay modal memakai tombol back platform (MD-13 `NB-02`). Selama overlay terbuka ia menaruh satu entri riwayat bertanda, sehingga back Android / swipe iOS…" [6 baris]
src/hooks/useInstallPrompt.ts:22 — "Modalnya hanya layak muncul kalau peramban benar-benar menyediakan prompt. Sebelum ini `InstallPromptSheet` menyusun lapisan gelapnya lebih dulu, lalu `InstallAppCard`…" [14 baris]
src/hooks/useLiveRate.ts:10 — "Kurs live IDR↔JOD (keputusan OQ-26). - Reaktif: berlangganan `rate` di `data/currency` lewat `useSyncExternalStore`, sehingga formatter murni (`money`, `idrToJod`) otomatis ikut…" [6 baris]
src/hooks/useOrderHandoff.ts:15 — "Langkah setelah packing untuk satu order. Dipisah dari `MerchantOrders.tsx` supaya halaman tetap di bawah batas 700 baris (AGENTS §3) dan supaya kalimat "apa yang harus dilakukan…" [7 baris]
src/hooks/usePullToRefresh.ts:55 — "Cermin `pull` untuk dibaca di dalam listener. `onTouchEnd` butuh nilai tarikan terakhir, tapi tidak boleh membacanya lewat updater `setPull`: StrictMode memutar ulang updater…" [6 baris]
src/hooks/usePullToRefresh.ts:63 — "Cermin `refreshing` untuk alasan yang sama, plus satu lagi: kalau `refreshing` ikut jadi dependensi efek, `setRefreshing(true)` di `onTouchEnd` memasang ulang listener — dan…" [5 baris]
src/hooks/usePullToRefresh.ts:103 — "Hambatan 0.5: tarikan 128px menghasilkan 64px, jadi ambang tercapai tanpa jari harus menempuh jarak yang tidak nyaman."
src/lib/appUpdate.tsx:60 — "Paksa pemeriksaan service worker (`reg.update()`). `controllerchange` (versi baru sudah mengambil alih, `skipWaiting` aktif) atau worker `waiting`/`installing` → `'updated'`.…" [4 baris]
src/lib/image.ts:19 — "Perkecil gambar ke lebar maksimum lalu jadikan data URL JPEG. Dipakai banner carousel yang ikut tersimpan di localStorage lewat redux-persist: berkas 2 MB mentah bisa menghabiskan…" [4 baris]
src/lib/image.ts:63 — "Unggah gambar ke R2 lewat Worker: perkecil dulu (lebar 1200 px, JPEG 0.82) supaya kuota R2 dan waktu unggah wajar, lalu `PUT /media/{bucket}/{key}`. `prefix` menaruh objek dalam…" [6 baris]
src/lib/schemas.ts:5 — "Sa7tein memakai nomor HP sebagai identitas login (PRD bab 02), jadi email tidak lagi wajib. Pesan validasi memakai Bahasa Indonesia."
src/lib/schemas.ts:8 — "Nomor WA wajib E.164 (R-PUSH-01, M8): `+62…` atau `+962…`. Nomor lokal (`08xx`) dinormalisasi dulu, jadi input lama tetap lolos validasi."
src/lib/schemas.ts:124 — "Alamat apartemen. PRD mewajibkan gedung, lantai, dan unit — pin GPS saja tidak cukup bagi kurir untuk menemukan pintu."
src/pages/AddressSelection.tsx:2 — "Alamat pengantaran. PRD mewajibkan gedung, lantai, dan unit, plus pin yang masih dalam radius 2 km dari toko — di luar itu checkout diblokir."
src/pages/Checkout.tsx:361 — "moneyPlain: pasangan JOD cukup di Total Bayar + catatan kurs (audit 005 #6) — kolom kanan dulu 141px menyisakan nama item 107px. */}"
src/pages/Checkout.tsx:368 — "Tanpa tombol buang terpisah: menekan - sampai 0 sudah menghapus barisnya, dan empat tombol 44px menyisakan hanya 78px untuk nama item sehingga "Sate Kambing" terpotong jadi "Sate…" [4 baris]
src/pages/Checkout.tsx:527 — "Ft = 1,5% untuk QRIS saja (§16.2); saldo DANA & COD tidak. */}"
src/pages/Checkout.tsx:584 — "Bukan "0,00 JOD": angka nol di kolom nilai terbaca seperti potongan yang gagal. "Tidak berlaku" sudah jadi bahasa repo untuk baris yang tak menghitung apa pun. */}"
src/pages/Checkout.tsx:599 — "Gate di dalam .checkout-content (audit 005 #1): sebagai anak langsung .checkout-screen ia kehilangan padding 20px dan terukur full-bleed x=0 w=390 / w=430 — kartu satu-satunya…" [7 baris]
src/pages/CourierTaskDetail.tsx:52 — "Perayaan selesai = overlay modal: back menutupnya (MD-13 NB-02)."
src/pages/CourierTasks.tsx:112 — "Partner bukan karyawan merchant: tidak ada batch, tips, atau dompet toko. Permukaannya satu layar `/partner` (COU-15 satu order per waktu)."
src/pages/DisputeSubmit.tsx:18 — "Kategori "Lainnya" satu-satunya yang wajib disertai penjelasan tertulis: kategori lain sudah menjelaskan sendiri isi sengketanya."
src/pages/DisputeSubmit.tsx:102 — "Alasan hanya wajib saat kategori "Lainnya"; kategori lain sudah menjelaskan sendiri isi sengketanya."
src/pages/DisputeSubmit.tsx:328 — "Pindah dari "Lainnya" ke kategori lain membatalkan kewajiban alasan, jadi pesan wajibnya ikut dibuang."
src/pages/Documentation.tsx:48 — "Grafik tren harian (`TrendBars`: merchant + kurir) didokumentasikan di MerchantDesignSection dan CourierDesignSection; halaman ini hanya merangkai section, jadi jangan menambah…" [16 baris]
src/pages/Documentation.tsx:142 — "Sidebar di layar sempit tergeser keluar (`translateX(-100%)`) dan hanya kelas `.open` yang memunculkannya. Sebelum ini tidak ada yang pernah menambah `.open`, sementara tombol…" [4 baris]
src/pages/ForgotPassword.tsx:10 — "Lupa kata sandi — langkah pertama: masukkan nomor terdaftar. Kerangkanya memakai `AuthLayout` yang sama dengan masuk/daftar, bukan markup Bootstrap hasil porting…" [8 baris]
src/pages/ForgotPasswordOtp.tsx:10 — "Masukkan kode OTP lupa kata sandi. Numpad dipertahankan: mengisi enam kotak digit di ponsel dengan papan angka sendiri lebih cepat daripada keyboard sistem, dan padanya sudah ada…" [10 baris]
src/pages/MerchantDashboard.tsx:149 — "Refresh menampilkan nilai seed dulu (~1,5 dtk) lalu melompat ke data API: "Rp256.000" → "Rp16.146.930", foto mock → ikon. Tahan render sampai order dan profil mendarat sekali. API…"
src/pages/MerchantDashboard.tsx:163 — "API gagal → tampilkan seed + banner, jangan menunggu kerangka sampai fail-safe 4 dtk (audit 012 #2)."
src/pages/MerchantDashboard.tsx:219 — "Kartu pendapatan: satu kartu lebar penuh dengan angka 2xl + batang tujuh hari. Sebelumnya ini kotak keempat dari grid 2×2 yang keempat kartunya seragam — terukur 73/73/99/99px dan…" [6 baris]
src/pages/MerchantDashboard.tsx:303 — "Peringkat menu: `decision data`, bukan laporan. Ember statistik cuma memberi tahu apa yang sedang terjadi; ini memberi tahu menu mana yang layak diperhatikan. Diturunkan dari…" [7 baris]
src/pages/MerchantDashboard.tsx:324 — "Satu menu = tidak ada yang dibandingkan: batang 100% hanya dekorasi dan sheet satu baris tidak menambah informasi. Kartu jadi blok angka: nama menu sebagai label, porsi sebagai…" [4 baris]
src/pages/MerchantDashboard.tsx:414 — "COD vs transfer diganti bar perbandingan: split 4/4 = 50/50 tidak butuh donut, dan donut kedua membuat kartu ini 468px (audit-003 #5/#6). Angka tetap dari `paymentMix`. */}"
src/pages/MerchantDashboard.tsx:447 — "Ringkasan insentif (M10, F9). Rincian, riwayat, dan aksi simulasi tinggal di /merchant/insentif — beranda dapur tidak boleh jadi tempat membaca 500px insentif. */}"
src/pages/MerchantDashboard.tsx:576 — "Dua kartu 52px untuk dua kalimat yang masing-masing satu baris: bentuk kartu mengesankan tiap kalimat berdiri sendiri, padahal keduanya satu jenis pesan — "ada yang diatur di…" [5 baris]
src/pages/MerchantMenu.tsx:239 — "Tinggi bar filter diukur runtime → kepala grup sticky duduk tepat di bawahnya. Hardcode `top` pernah bikin tumpang-tindih; ukur, jangan tebak."
src/pages/MerchantOrders.tsx:107 — "Tab awal bisa datang dari tautan (?tab=batal), dipakai legenda donut di dashboard: potongan "Batal/tolak 1 order" harus mendarat di daftar yang benar-benar berisi order batal,…" [4 baris]
src/pages/MerchantOrders.tsx:161 — "Terima order (MER-11/MER-12). Regular wajib masuk batch: gabung batch berjalan yang hitung mundurnya masih jalan, atau bikin batch baru. Quick tidak punya batch — cukup estimasi…"
src/pages/MerchantOrders.tsx:257 — "Dispatch Quick (§9.4, M6): kirim assignment ke kurir partner terpilih. Antrean kandidat (idle terlama, batas jarak, tie-break) milik `dispatch_courier()` (OPEN-11) — di sini…" [4 baris]
src/pages/MerchantOrders.tsx:268 — "Persist penugasan ke `orders.courier_id` (best-effort; id seed dilewati). Baris `dispatch_assignments` ditulis BE saat mitra merespons (OPEN-11)."
src/pages/MerchantPage.tsx:20 — "Angka besar untuk stub tiket kupon: nilai + satuannya, diambil apa adanya dari hadiah program. Dipakai di sini (bukan `data/marketing.ts`) karena ini murni keputusan tampilan…"
src/pages/MerchantPromoCarousel.tsx:20 — "Daftar slide carousel promo beranda toko. Penyuntingan slide ada di halaman sendiri (`/promos/carousel/new` dan `/promos/carousel/:id`) supaya form banner + menu tidak dipaksa…"
src/pages/MerchantPromoSlideForm.tsx:21 — "Penyunting satu slide carousel. Halaman penuh, bukan sheet: banner 16:9 + tiga field tidak muat di panel 60% tanpa memotong input di balik bar aksi."
src/pages/MerchantRebate.tsx:13 — "Rincian insentif merchant (R-INCENTIVE-01, flow F9, milestone M10). Layar ini tempat riwayat modal & cashback tinggal — beranda hanya menampilkan ringkasan. Dua aksi di bawah…" [7 baris]
src/pages/MerchantSignUp.tsx:111 — "Zona wajib dipilih, dan pilihannya radio bukan teks bebas: PRD aktif hanya punya dua zona (Hijazi dan Syimali). Alamat yang diisi bebas akan ditolak guard zona, jadi lebih baik…" [5 baris]
src/pages/MyOrder.tsx:23 — "Pesanan Saya — satu menu untuk dua keadaan pesanan (PRD §6/§20.2): - **Aktif**: keranjang yang belum dibayar + pesanan yang masih berjalan. Riwayat dipindah ke sini dari halaman…" [9 baris]
src/pages/MyOrder.tsx:318 — "Aksi: kiri = penilaian (tautan bila belum dinilai, chip kalau sudah), kanan = "Pesan lagi" yang dominan. Rel kanan tetap, jadi tombolnya jatuh di x yang sama tiap baris (MD-11).…" [4 baris]
src/pages/Onboarding.tsx:73 — "Swipe: ambang 44px supaya tidak bentrok dengan gulir dokumen dan ketukan pendek pada tombol."
src/pages/OrderChat.tsx:284 — "Live: tulis ke BE; polling 5 dtk + fetch pasca-kirim yang menampilkannya."
src/pages/OrderChat.tsx:346 — "`data-open-at="latest"`: chat memang dibuka di pesan terbaru. Gerbang memakai penanda ini untuk membedakan gulir yang disengaja dari gulir warisan halaman sebelumnya (lihat MD-03…"
src/pages/PaymentDana.tsx:112 — "Splash perayaan = overlay modal: back menutupnya, bukan memindah halaman (MD-13 NB-02)."
src/pages/PaymentDana.tsx:164 — "Simpan QR sebagai PNG (CUS-32). QR-nya digambar dari matriks yang sama dengan yang tampil, jadi yang diunduh bukan tangkapan layar: skala 12px per sel + margin 4 sel supaya tetap…"
src/pages/SaAppeals.tsx:11 — "Banding sengketa. Putusan level-1 tetap milik CS; SA hanya meninjau ulang (keputusan PO 2026-09-23). Karena itu tiap kartu menampilkan putusan CS sebagai konteks sebelum SA…" [4 baris]
src/pages/SaDashboard.tsx:36 — "Ringkasan konsol SA. Dua bacaan untuk angka yang sama: nominalnya sebagai teks (kartu) dan bentuknya sebagai chart (donut/bar). Dua angka yang paling mudah tertukar — saldo…" [6 baris]
src/pages/SaRoles.tsx:20 — "Role, permission, dan operator. Dua aturan yang menentukan bentuk layar: (1) role pemilik platform tidak bisa diubah dari UI, kalau bisa, satu klik salah mengunci seluruh konsol;…" [5 baris]
src/pages/SaSwitches.tsx:12 — "Kill switch. Tiap perubahan jalur wajib konfirmasi dulu, dan konfirmasinya menyebut akibatnya (bukan "Yakin?") karena yang dimatikan bukan sekadar preferensi, COD mati berarti…" [5 baris]
src/pages/SaTax.tsx:9 — "Laporan pajak aplikasi. Dua objek pajak yang berbeda ditampilkan terpisah supaya tidak tertukar: GST makanan ditanggung **merchant** atas penjualan (info-only), sedangkan PPh…" [5 baris]
src/pages/SaUsers.tsx:26 — "Registri pengguna: customer, merchant, dan kurir. Halaman ini ada karena sebelumnya **tidak ada pendataan pengguna sama sekali**: customer dan merchant hanya hidup sebagai satu…" [14 baris]
src/pages/SaUsers.tsx:207 — "Nama merchant sekaligus aksinya. Kolom Aksi terpisah tidak muat: tabel ini sudah penuh di 1280px, jadi kolom ke-10 memecah nama jadi tiga baris (tinggi baris 57px → 126px). */}" [4 baris]
src/pages/Verification.tsx:8 — "Verifikasi email — enam digit yang dikirim ke email terdaftar. Kerangkanya `AuthLayout` varian polos, sama seperti layar auth lain. Yang berubah bersama itu: - Kotak digit memakai…" [12 baris]
src/pages/documentation/sections/AppPolishSection.tsx:3 — "Perbaikan bentuk layar yang sudah ada: antrean merchant, form sengketa, layar pasca-order, dan checkout customer. Dipisah dari ChangelogSection (audit rute & CRUD 2026-09-23)…" [5 baris]
src/pages/ops/OpsDisputes.tsx:228 — "Desktop (>=901px): master-detail, antrean di kiri + detail terpilih di kanan. Di ponsel tetap kartu bertumpuk. Cabang render, bukan CSS, karena dua susunan DOM memang berbeda. */}"
src/pages/ops/OpsLiability.tsx:19 — "Ringkasan kewajiban panel ops. Bacaan: konsol operasi CS untuk platform ops, native mode, utility style, dial ENERGY 1 / RHYTHM 2 / MOTION 1 / DENSITY 3 / FEEL 1. Di ponsel satu…" [9 baris]
src/pages/ops/OpsLiability.tsx:61 — "Baris KPI: empat angka yang paling sering dipantau ops, dari state yang sama dengan kartu/panel di bawahnya. Tiap angka membuka halaman kerjanya — kecuali total kewajiban, metrik…"
src/pages/ops/OpsLiability.tsx:90 — "1 — Komposisi kewajiban: kartu --surface (DNA baris 15); donut yang membawa warna, total IDR-nya sudah di KPI jadi donut memuat sisi JOD. Nilai segmen cukup JOD (kontrak…" [4 baris]
src/pages/ops/OpsOnboarding.tsx:9 — "Verifikasi onboarding tenant (M10). Ops meninjau pengajuan merchant dan memverifikasi deposit COD (3,50 JOD) sebelum toko aktif. Memakai **slice admin yang sama** dengan layar ops…" [5 baris]
src/store/index.ts:139 — "v7: `batch` dibuang supaya di-seed ulang. Batch berubah arti di M4: lahir **hanya** dari order Regular yang di-accept (BR-B01), jadi seed batch dulu (`ord-1`/`ord-2`, kurir tetap)…" [5 baris]
src/store/slices/adminSlice.ts:33 — "`customer.riskFlag` — sisi kedua blacklist COD, wajib bareng merchant (F15). Disimpan dengan `customerId`, bukan nama: dulu `{ id, name }` sehingga flag tidak bisa ditautkan ke…"
src/store/slices/batchSlice.ts:14 — "Batch kurir inhouse (PRD §8). Satu batch = wadah order Regular milik merchant, diantar oleh satu kurir inhouse. Maks 24 order (BR-B04) ditegakkan di pemanggil; slice hanya…" [4 baris]
src/store/slices/cartSlice.ts:23 — "Nama file bukti transfer; wajib ada sebelum pesanan transfer dikirim."
src/store/slices/marketingSlice.ts:37 — "Program marketing ala Odoo (PRD §15). Program aplikator dikelola ops, program merchant dikelola merchant; `isStackable` menandai promo yang boleh digabung (semantik kombinasi…" [4 baris]
src/store/slices/marketingSlice.ts:55 — "Boleh digabung promo lain atau tidak (§15.3, OPEN-23)."
src/store/slices/merchantSlice.ts:63 — "Modal 5 JOD + cashback tier bulanan (M10)."
src/store/slices/merchantSlice.ts:274 — "Gabung **per id**, bukan ganti seluruh array. Tiga kolom hidup hanya di klien (`packed` MER-13, `batchId`, `cookMinutes`) dan `orders` BE tidak punya kolomnya, jadi `state.orders…" [8 baris]
src/store/slices/merchantSlice.ts:397 — "Merchant baru dapat modal 5 JOD (event `merchant_credit_granted`)."
src/store/slices/merchantSlice.ts:404 — "Fee merchant 0,15 JOD dipotong dari modal, bukan dari dompet. Diklem di 0 supaya sisa modal tidak pernah negatif."
src/store/slices/partnerSlice.ts:19 — "Kurir partner + assignment (PRD §9.3, §9.5). Kurir partner dikelola aplikator, satu order per waktu; system me-reserve sejak assignment dikirim sampai approve/reject. Tidak…" [4 baris]
src/store/slices/partnerSlice.ts:54 — "Reject wajib ber-alasan (COU-18); reservasi dilepas (§9.5)."
src/store/slices/partnerSlice.ts:98 — "SP kurir partner (COU-17, OPS-10); tercatat sebagai punishment (§18)."
src/store/slices/superAdminSlice.ts:188 — "Akun operator (termasuk operator CS) dibuat SA, bukan self-service (OQ-30)."
src/store/slices/walletSlice.ts:67 — "Tip customer → kurir (R-WALLET-01, PRD §Tips): opsional, 100% ke kurir, tanpa komisi platform. Hanya sisi customer yang punya model di repo ini — wallet kurir masih angka mock di…" [4 baris]
src/styles/_docs.scss:81 — "Halaman dokumentasi adalah referensi desktop; ia tidak boleh dikunci ke kolom aplikasi 430px. `body > div` (yang cocok dengan #root) memasang max-width: var(--shell-max) untuk…" [4 baris]
src/styles/_docs.scss:87 — "Di bawah lebar ini (jendela sempit) tata letak ringkas dipakai: topbar dengan hamburger, sidebar tergeser keluar, konten selebar penuh. Di atasnya tata letak desktop dengan…"
src/styles/_reboot.scss:41 — "Border peramban dibuang. Tanpa ini, tombol yang tidak menulis `border` sendiri mewarisi `2px outset buttontext` bawaan peramban — diukur pada .courier-add-btn: border 2px solid…" [7 baris]
src/styles/_tokens.scss:13 — "Garis tepi kartu berlatar `--orange-soft` (mis. notifikasi belum dibaca). Satu peran: jangan pakai untuk teks atau isian."
src/styles/_tokens.scss:79 — "Batas lebar kolom aplikasi. 430px adalah lebar mobile terlebar yang dirancang; aplikasi ini mobile-first, jadi di jendela lebar ia tampil sebagai kolom ponsel yang ditengahkan,…" [5 baris]
src/styles/_tokens.scss:126 — "Pasangan masuk/keluar. M3: "Suggested easing and duration pairs" — elemen masuk 250ms, keluar 200ms. Selisih ini yang memberi hierarki arah; repo sebelumnya memakai 200ms untuk…" [4 baris]
src/styles/_tokens.scss:139 — "Easing. Nama diambil dari perannya, mengikuti M3. `--ease-out` yang lama sebenarnya "decelerate" (cocok untuk masuk) — namanya dipertahankan karena sudah dipakai 109 kali, dan…" [4 baris]
src/styles/_tokens.scss:146 — "Emphasized: kurva ber-overshoot milik M3, untuk gerak yang boleh "memantul" sedikit (badge, konfirmasi). Terekam sebagai bezier yang overshoot ~4% lalu kembali, padanan praktis…" [4 baris]
src/styles/_tokens.scss:167 — "Lantai huruf: isi/kalimat tidak di bawah 15px (G-08, body ≥15-16pt di mobile), caption/meta 13px. `--text-sm` dinaikkan 13→15 dan `--text-xs` 12→13 oleh audit 019 #4: keduanya…" [12 baris]
src/styles/_tokens.scss:190 — "Judul di dalam bar halaman (role merchant/kurir/admin). Dipatok px; nilainya kini sama dengan `--text-2xl` (28px). Token ini tetap ada sebagai nama semantik, bukan karena…"
src/styles/_tokens.scss:195 — "Teks isian form dipatok 16px, tidak ikut clamp `--text-base` yang jatuh ke 14,83px di kolom 390px. Di iOS, fokus ke input di bawah 16px memicu zoom otomatis dan menggeser seluruh…" [4 baris]
src/styles/app/part-01.scss:74 — "Tidak dibungkus media query: kolomnya dikunci ke lebar mobile di lebar berapa pun, supaya tata letak 390px tidak pernah melar."
src/styles/system/_actions.scss:1 — "── Aksi halaman di zona jempol ─────────────────────────────────────────────── Aksi utama halaman hidup di jangkauan jempol (kanan bawah, di atas bilah navigasi), bukan di pojok…" [9 baris]
src/styles/system/_actions.scss:58 — "Ruang cadangan di ujung daftar supaya baris terakhir tidak tertutup FAB; tingginya = FAB 56px + jaraknya ke bilah bawah + sedikit udara."
src/styles/system/_address-selection.scss:26 — "Judul header sudah dipusatkan lewat `position: absolute` (system/_menu.scss), jadi `padding-right: 40px` sisa tata letak lama hanya menggeser teksnya dari sumbu tengah. Tanpa…"
src/styles/system/_address-selection.scss:38 — "Baris aksi: `.btn-profile-primary` membawa `margin-top: 8px` dari tata letak satu kolom lama. Di baris flex, margin itu menggeser tombol utama 8px turun dan menggemukkan baris ke…"
src/styles/system/_admin-2.scss:3 — "── 15b. Panel admin (CS) — form sengketa ────────────────────────────────── Lanjutan `_admin.scss` (dipisah karena batas 600 baris per berkas). Dipakai layar /dispute (customer +…" [7 baris]
src/styles/system/_admin-2.scss:57 — "Sisa 12px di tepi atas supaya tombol hapus yang menyembul di sudut petak tidak menimpa label di atasnya."
src/styles/system/_admin-2.scss:77 — "Tombol hapus 44px: sasaran sentuh minimum (HG-05), tapi yang terlihat cuma cakram kecil di sudut. Menyembul 10px ke luar petak; jarak antar-petak 12px, jadi tidak menimpa petak…"
src/styles/system/_admin-2.scss:127 — "Migrasi /admin → /ops: layar CS hidup di dalam `.sa-main` (1180px), bukan `.admin-console` lagi. Aturan shell global `div[class*="-page"]` masih mengunci `.admin-page` ke 430px;…" [5 baris]
src/styles/system/_admin-2.scss:261 — "Field di dialog putusan (audit 017 F-03): catatan wajib dengan validasi. Slider memakai `.admin-range` (gaya di `_admin.scss`)."
src/styles/system/_admin.scss:3 — "── 15. Panel admin (CS) ─────────────────────────────────────────────────── Role keempat: panel admin platform yang dikelola CS. Shell 430px + bottom nav seperti role lain (CS…" [5 baris]
src/styles/system/_admin.scss:242 — "Tautan aksi di dalam kartu panel CS (pola sa-link, namespace admin). min-height 44: target sentuh minimum; tanpa ini tingginya 20px dan gate --strict menolak (audit dashboard…"
src/styles/system/_admin.scss:286 — "Baris peringkat horizontal untuk nominal per jenis entry: enam batang vertikal tidak muat di kolom 350px (terukur label 66px pada jarak antar batang 54px — label saling tumpang…" [5 baris]
src/styles/system/_admin.scss:406 — "Isi baris boleh menyusut sampai lebar yang tersedia. Tanpa `min-width: 0` sebuah flex item tak turun di bawah lebar min-content-nya, sehingga teks yang panjang mendorong badge di…"
src/styles/system/_app-shell.scss:1 — "Tinggi viewport aplikasi. `--app-vh` dipakai layar warisan di app/part-09 dan app/part-13 sebagai pengganti 100vh; di sini nilainya viewport dinamis asli."
src/styles/system/_app-shell.scss:24 — "Body BUKAN scroll container. Stylesheet porting memasang overflow yang bukan `visible` ke body (app/part-01 `overflow-x: hidden`, app/part-15 `overflow: hidden auto` pada…" [15 baris]
src/styles/system/_app-shell.scss:54 — "Lock legacy di app/part-01.scss memberi `margin: 0 auto` ke `div[class*=-page]` dan `div[class*=-screen]`. Begitu elemen itu jadi anak langsung `.app-shell` (yang flex column),…" [6 baris]
src/styles/system/_app-shell.scss:71 — "Halaman profil tidak punya header sama sekali: konten teratasnya blok identitas di dalam `.main-frame` (padding 20px), jadi namanya mendarat di area kamera. Terukur di jendela…"
src/styles/system/_app-shell.scss:78 — "Pil merek di layar masuk (AuthLayout memakai `.app-shell auth`) mengambang di tepi atas, sama seperti pil onboarding — lihat `_onboarding.scss`. Terukur 23px, safe-area 59px."
src/styles/system/_auth-2.scss:3 — "── Layar auth, lanjutan ─────────────────────────────────────────────────── Dipisah dari `_auth.scss` karena berkas itu menyentuh batas 600 baris dan tidak boleh ditumbuhkan.…" [4 baris]
src/styles/system/_auth-2.scss:86 — "Slide bersebelahan, digeser `translate3d` supaya pergeserannya ditangani compositor. Lebar jalur tetap 100% (tiap slide mengalir keluar), jadi `-100%` persis menggeser satu slide."
src/styles/system/_auth-2.scss:123 — "Sasaran sentuh penuh 44px, titik visualnya dari `::before` — sama seperti `.promo-dot`, supaya jari tidak perlu tepat mengenai bulatan kecilnya."
src/styles/system/_auth-2.scss:176 — "Batas 272px: kepala ini dekorasi, dan aksi utama harus tetap di lipatan pertama. Diukur pada 390x844, sisa ruang untuk tab + 2 field + tombol = 541px."
src/styles/system/_auth-2.scss:186 — "Foto makanan yang sudah ada di repo dipakai sebagai tekstur, bukan sebagai gambar yang dibaca. Opasitas 12% ada di rentang 4–14% yang menjaga oranye merek tidak bergeser ke salmon…"
src/styles/system/_auth-cover.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Layar masuk customer, varian `brandLayout="cover"` (AuthLayout). Bentuknya dari irisan HTML yang…" [8 baris]
src/styles/system/_auth-cover.scss:196 — "Segmented switch jenis akun kurir. Dua pilihan setara di dalam satu rel putih; yang aktif memakai `--orange-soft`, bukan oranye penuh, supaya CTA tetap satu-satunya bidang oranye…" [4 baris]
src/styles/system/_auth-cover.scss:241 — "Keterangan jenis akun menempel ke switch, lalu 12px ke field pertama."
src/styles/system/_auth-cover.scss:246 — "Foto pengisi di antara field dan tombol (layar masuk merchant). `margin-top: auto` menaruhnya di sisa ruang, dan tombol tetap menempel 16px dari dasar."
src/styles/system/_auth-cover.scss:259 — "CTA turun ke dasar layar: di acuan tombol "Masuk" duduk 16px dari tepi bawah, dan sisa ruang di atasnya dipakai napas, bukan dibiarkan menggantung di tengah. Form ikut mengisi…" [6 baris]
src/styles/system/_auth.scss:3 — "═══════════════════════════════════════════════════════════════════════════ Layar masuk & daftar (customer + merchant) Menggantikan gaya porting `app/part-02.scss` untuk lima…" [7 baris]
src/styles/system/_auth.scss:12 — "`.auth` cuma penanda bentuk; kerangkanya memakai `.app-shell` yang sama dengan seluruh aplikasi. Gerbang browser mengukur kolom dari `.app-shell`, dan tanpa kelas itu kolomnya…"
src/styles/system/_auth.scss:22 — "Tidak ada varian baris di desktop: shell dikunci `--shell-max` (430px) di lebar berapa pun (DNA.md; hanya `/superadmin/*` yang lebar). Varian `@media (min-width:900px)` yang dulu…" [5 baris]
src/styles/system/_auth.scss:28 — "── Panel foto ───────────────────────────────────────────────────────────── Tingginya `clamp`, bukan persentase: di layar 390x844 ia mengambil porsi kira-kira seperenam supaya…" [7 baris]
src/styles/system/_auth.scss:44 — "`> img`, bukan `img`: logo merek di dalam badge juga <img>, dan selector keturunan `.auth-photo img` (0-1-1) mengalahkan `.auth-brand-mark` (0-1-0), sehingga logo terukur 96x96 —…" [4 baris]
src/styles/system/_auth.scss:53 — "Asetnya portrait (800x1422) sedangkan panelnya strip lanskap, jadi tanpa ini `cover` memotong tepat di tengah dan yang terlihat cuma alas piring. 38% mengarahkan ke isi mangkuk."
src/styles/system/_auth.scss:128 — "Margin negatif menyelaraskan pusat tombol dengan tepi kiri teks, bukan kotak 44px-nya. Tanpa ini judul layar berikutnya menjorok 22px dari tombol."
src/styles/system/_auth.scss:233 — "Tombol 40px di dalam field 44px: kotak visualnya kecil supaya tidak terbaca sebagai tombol kedua di dalam input, tapi **area sentuhnya 44px** dan itu harus jadi milik kontrolnya…" [7 baris]
src/styles/system/_auth.scss:279 — "`--text-secondary` cuma 4,33:1 di `--bg-warm` (gagal AA untuk 13px); versi strong lolos. Hint dan teks persetujuan adalah informasi, bukan dekorasi, jadi keduanya memakai nada…"
src/styles/system/_auth.scss:321 — "Kontras 3.36:1 di bawah AA. Dipertahankan sebagai identitas merek; jejaknya di DNA.md "Pengecualian sadar, keputusan pemilik 2026-09-24" dan DEC-850."
src/styles/system/_auth.scss:371 — "Tautan inline di dalam kalimat tinggal 28px tinggi setelah padding, dan itu pengecualian yang sengaja**: yang menyentuh "Masuk"/"Daftar" adalah kalimat "Sudah punya akun?", bukan…" [7 baris]
src/styles/system/_auth.scss:396 — "Seluruh baris adalah target: menekan teksnya sudah mencentang, dan padding vertikal membuat barisnya sendiri setinggi target sentuh. `padding-left` = kotak (20px) + jarak…" [6 baris]
src/styles/system/_auth.scss:408 — "Area sentuh 44px, kotak terlihat 20px — dua hal berbeda. Checkbox aslinya tetap 44px (itu yang diukur gerbang dan menerima fokus), tapi transparan; bentuk 20px-nya digambar di…" [4 baris]
src/styles/system/_auth.scss:419 — "Digeser supaya titik tengah area 44px sejajar kotak 20px yang digambar."
src/styles/system/_auth.scss:464 — "Cincin fokus digambar di kotak kecilnya, bukan lingkaran 44px."
src/styles/system/_auth.scss:496 — "── Fieldset zona (daftar toko) ──────────────────────────────────────────── Dua zona PRD aktif, jadi radio — bukan teks bebas yang bisa diisi apa saja. Satu baris dua pilihan,…"
src/styles/system/_auth.scss:517 — "Seluruh kotak zona jadi target sentuh, jadi radio aslinya tidak ikut membesar. Radio tetap di dalam label supaya menekan di mana pun pada kotak tetap memilih zona ini; penandanya…"
src/styles/system/_auth.scss:537 — "`inset: -1px` (bukan 0): radio mengisi **border box** label, bukan padding box-nya. Dengan `inset: 0` ia terukur 169x42 — dua piksel kurang dari `--touch-min` karena tepi 1px…" [4 baris]
src/styles/system/_auth.scss:549 — "Penanda pilihan: lingkaran 18px, digambar pada label."
src/styles/system/_back.scss:3 — "── 6. Tombol kembali yang tak terlihat ─────────────────────────────────── Markup hasil porting menulis stroke="white" pada panahnya, sementara .btn-back punya cakram putih —…" [8 baris]
src/styles/system/_back.scss:22 — "Komponen `BackButton` memakai kelas `.back-button`. Warisan porting `app/part-02.scss` memberinya `margin-bottom: 20px` (dulu untuk tata letak lain), kini tombol kembali dipasang…"
src/styles/system/_back.scss:29 — "`.back-btn-profile` (17 halaman profil) ditulis 40x40 di stylesheet porting `app/part-15.scss`; sekarang ikut kontrak `_topbar.scss` (44px, --radius-md, permukaan + tepi) seperti…" [4 baris]
src/styles/system/_bell.scss:42 — "Popup lonceng konsol web desktop (≥901px): pola web standar — klik lonceng membuka panel di bawahnya, bukan pindah halaman penuh. Ponsel tidak pernah menjangkau ini (dijaga…"
src/styles/system/_bottom-nav.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Bilah bawah (bottom nav) — EDISI 02 (UI v2). Bilahnya sendiri didefinisikan di `app/part-06.scss`…" [10 baris]
src/styles/system/_bottom-nav.scss:16 — "Permukaan pekat TANPA `backdrop-filter` (audit 001 #6 / QL-05). Bilah ini `position: fixed` dan selalu terlihat, jadi blur men-sampel ulang latar tiap frame gulir. Dulu `rgba(…,…" [4 baris]
src/styles/system/_bottom-nav.scss:27 — "Padding horizontal dikecilkan dari --space-4 (16px) ke --space-2 (8px): lima item di 390px menyisakan 78px per item, dan 16px di kiri-kanan memangkas lebar isi jadi 46px sehingga…" [4 baris]
src/styles/system/_bottom-nav.scss:40 — "Label tidak boleh melewati lebar itemnya: flex item tak menyusut di bawah lebar isinya (`min-width: auto`), jadi tanpa penjaga ini teks yang panjang menembus tepi kotak dan…"
src/styles/system/_buttons.scss:114 — "── 2. Tombol ikon: tetap bulat, ukurannya diseragamkan ─────────────────── `.btn-back` sengaja tidak lagi di sini: tombol kembali punya kontraknya sendiri di `_topbar.scss` (44px,…" [5 baris]
src/styles/system/_cards.scss:64 — "Kartu pasang aplikasi yang muncul sendiri di kunjungan pertama. Kartunya (`.install-app`) sudah punya permukaannya sendiri; pembungkus ini hanya bilah bawah yang dibatasi kolom —…" [8 baris]
src/styles/system/_cart-2.scss:14 — "── Bilah fixed harus ikut kolom, bukan viewport ────────────────────────── .checkout-actions dan sekitar 20 bilah fixed lain memakai left:0/right:0 atau width:100%. Pada elemen…" [13 baris]
src/styles/system/_cart-2.scss:56 — "`.home-screen-wrapper .bottom-nav` dari stylesheet lama berspesifisitas 0-2-0, jadi ia menang atas `.bottom-nav` di atas dan bilahnya melebar 1024px — 297px keluar kolom di tiap…" [6 baris]
src/styles/system/_cart-2.scss:72 — "Fixed elements outside the mobile shell still use viewport coordinates. Constrain their visible surfaces to the same centered 430px column."
src/styles/system/_cart-2.scss:254 — "── Padding halaman alur profil ─────────────────────────────────────────── Padding 20px seharusnya datang dari .profile-flow-page-scroll, elemen antara yang tidak dipakai semua…" [10 baris]
src/styles/system/_cart-2.scss:271 — "Header melebar sampai tepi kolom supaya latarnya menutupi konten yang lewat di belakangnya saat digulir; isinya tetap sejajar 20px."
src/styles/system/_cart-2.scss:285 — "── Jarak tepi halaman diseragamkan ─────────────────────────────────────── Tiga komponen memakai angka berbeda, jadi lebar kolom isi tiap halaman tidak sama: .main-frame 12px,…" [8 baris]
src/styles/system/_cart-2.scss:301 — "Halaman auth memakai .container bawaan Bootstrap, yang padding horizontalnya 24px — jadi alur masuk punya tepi berbeda dari halaman lain. Markup-nya sudah punya kelas *-screen…" [9 baris]
src/styles/system/_cart-2.scss:418 — "── Kartu alamat (flow f20) ─────────────────────────────────────────────── Satu kontrol per kartu: radio asli + <label> menutupi kartu, lalu satu tombol opsi 44px di pojok. Dulu…" [5 baris]
src/styles/system/_cart-dock.scss:141 — "Satu baris punya persis dua kolom kanan: nominal (di dalam garis tap) dan kolom aksi selebar `--touch-min`. Kolom itu disediakan untuk SEMUA baris selama ada minimal satu baris…" [8 baris]
src/styles/system/_cart-dock.scss:157 — "Kotak sentuh 44px digeser naik selebar padding baris supaya pusat glyph-nya sebaris judul & nominal — bukan mengapung di tengah baris dua-baris."
src/styles/system/_cart-dock.scss:162 — "Tak ada satu pun aksi di daftar ini (`ck-icon` = tombol batal/buang) dan tak ada konfirmasi terbuka: kolom aksi tidak perlu makan 44px di kanan. Baris memakai gutter penuh, jadi…"
src/styles/system/_cart-dock.scss:169 — "Badan baris memakai primitif `.list-row` (rel kanan lebar tetap) — kelas itu juga MARKER gerbang browser (MD-11); jangan rakit grid sendiri."
src/styles/system/_cart-dock.scss:174 — "Rel kanan lebih lebar dari default 96px: label status terpanjang ("Menunggu toko") butuh ~116px termasuk titik & padding, dan chip yang lebih lebar dari relnya akan menyeberang ke…"
src/styles/system/_cart-dock.scss:236 — "Kode order selalu satu baris penuh: dengan kolom aksi 44px, kode + waktu + tenggat tak lagi muat sebaris dan dulu tumpah keluar kotak (MD-12)."
src/styles/system/_cart-dock.scss:283 — "Status duduk di rel kanan yang sama lebar di semua baris, bukan mengikuti panjang labelnya. Tanpa ini titik status bergerigi (210/230/252px) karena "Siap" lebih pendek dari…" [4 baris]
src/styles/system/_cart-dock.scss:289 — "Tanpa ini chip ikut meregang setinggi baris kedua, jadi tinggi rel kanan bergerigi 32/56px antar baris (MD-11)."
src/styles/system/_cart-dock.scss:293 — "Label status ("Menunggu toko") muat di satu baris pada rel 128px. Dengan ukuran teks warisan 16px ia membungkus jadi dua baris dan chip melar 56px."
src/styles/system/_cart-dock.scss:344 — "Sisa jendela batal (1 menit). Angka berganti tiap detik, jadi lebar dikunci `tabular-nums` supaya baris tidak bergoyang (MD-07); warna peran warning menandai tenggat tanpa teks…"
src/styles/system/_cart-dock.scss:408 — "Aksi sekunder per baris (buang keranjang / batalkan pesanan). Ikon saja, tapi kotaknya tetap 44px supaya bisa kena jempol."
src/styles/system/_cart-dock.scss:435 — "Konfirmasi dua langkah tumbuh di bawah baris yang bersangkutan, bukan sheet kedua yang menutupi daftar (BUG-102016: sheet bertumpuk). Tiga baris: pertanyaan, alasan opsional, lalu…"
src/styles/system/_cart-dock.scss:480 — "Alasan batal opsional: satu pilihan, bukan daftar panjang. 44px supaya jempol tidak perlu membidik."
src/styles/system/_cart-dock.scss:561 — "Tenggat batal sebagai chip, bukan kata abu di tengah string meta (MD-07)."
src/styles/system/_cart.scss:72 — "Bilah aksi `fixed` setinggi ~110px saat safe-area aktif. Ruangnya ditaruh di screen, bukan di .checkout-content: elemen terakhir yang mengalir bisa isi pesanan, gate saldo, atau…"
src/styles/system/_cart.scss:80 — "Notice maintenance di Checkout diletakkan di luar .checkout-content (yang ber-padding 20px), jadi gutter sampingnya tak dimiliki induk. Komponen `.platform-notice` sengaja hanya…" [4 baris]
src/styles/system/_cart.scss:95 — "100px warisan dikalibrasi untuk bilah 77px tanpa safe-area; di jendela app-mode bilahnya ~110px sehingga baris terakhir bisa tertutup. Jaraknya sekarang milik .checkout-screen,…"
src/styles/system/_cart.scss:101 — "Aslinya 80px jarak antar bagian. Dengan empat bagian itu jadi 320px ruang mati; 24px sudah cukup karena tiap bagian sudah punya judul sendiri."
src/styles/system/_cart.scss:179 — "Sasaran sentuh dari token, bukan angka lepas. Barisnya tetap muat karena gambar 52px lebih tinggi daripada stepper-nya."
src/styles/system/_cart.scss:209 — "Lebar CTA empty state diseragamkan dengan CTA terisi di system/_checkout.scss (dulu max-width 260px — tombol yang sama berbeda bentuk antar state)."
src/styles/system/_cart.scss:218 — "── Payment amount: header 44px ─────────────────────────────────────────── Header-nya position:fixed dengan top:44px, disisakan untuk status bar yang tidak pernah dirender.…" [12 baris]
src/styles/system/_cart.scss:240 — "Pola lama di app/part-12: screen setinggi viewport + konten `overflow-y: auto` = penggulung bersarang, dan DNA hanya mengizinkan dokumen sebagai penggulung. Sama seperti…" [4 baris]
src/styles/system/_cart.scss:255 — "Bilah bayar `.payment-amount-footer` itu `position: fixed` (tinggi terukur 77px + safe-area), jadi tingginya tidak ikut mengalir dan elemen terakhir halaman berakhir tepat di…" [6 baris]
src/styles/system/_cart.scss:406 — "Waktu tinggal di bawah gelembung, di luar permukaan berwarna: teks 13px di atas oranye hanya ~3,4:1, gagal AA. Di `--bg-warm` ia lolos."
src/styles/system/_catalog-odoo.scss:73 — "Satu baris nilai = tiga kolom tetap: nama (fleksibel), harga, sakelar. Dulu flex dengan input `width: 100%` membuat label "+ JOD" terlipat dua baris dan nama "Extra pedas" ikut…"
src/styles/system/_category-chips.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Chip kategori (baris horizontal di beranda customer)…" [9 baris]
src/styles/system/_category-chips.scss:38 — "Kotak ikon. `box-sizing` supaya 44px termasuk padding, jadi gambarnya tinggal 20px di tengah dan kotaknya tetap 44px di semua ikon."
src/styles/system/_category-chips.scss:60 — "Varian foto (keputusan pemilik 2026-10-18): potongan transparan 56px tanpa kotak latar — "varian B" di docs/design/preview-categories. Chip tetap transparan; status terpilih…"
src/styles/system/_category-chips.scss:121 — "Baris kategori: dengan sedikit kategori ia menggantung di kiri dan separuh kanan kosong; dengan `space-between` malah jomplang ke tepi. Jadi tiap chip meregang sama besar (satu…" [7 baris]
src/styles/system/_charts.scss:92 — "Grafik yang bisa dibaca: batang lain diredupkan supaya batang terpilih (hover/panah) jelas, dan seluruh bidang grafik jadi satu target ketuk — bukan 24 target 11px yang mustahil…"
src/styles/system/_charts.scss:126 — "Sumbu label terpisah dari kolom batang. Kolom 11px (24 jam) atau 15px (12 bulan) tidak muat "00", jadi label diposisikan absolut di tengah batangnya dan boleh memakai ruang…"
src/styles/system/_charts.scss:327 — "24 batang jam: gap 16px tidak mungkin, jadi rapatkan ke satu langkah skala. Tinggi track diturunkan supaya label jam tetap kebaca tanpa batang jadi garis."
src/styles/system/_charts.scss:338 — "Batang 10px dengan radius 8px jadi bubur. Histogram per jam dibiarkan siku; bentuknya membaca durasi, bukan chip."
src/styles/system/_charts.scss:400 — "`flex-wrap`, bukan media query. Lebar yang menentukan di sini adalah lebar KARTU, bukan lebar jendela: di jendela 960px kartu donut cuma 278px, dan media query 560px tidak pernah…" [5 baris]
src/styles/system/_checkout.scss:5 — "Hierarki (audit 005 #2): sebelumnya judul seksi, nama toko, nama item, label baris ringkasan, dan label total semuanya 14,34px/600 dengan warna yang sama — enam peran satu ukuran,…" [8 baris]
src/styles/system/_checkout.scss:19 — "Satu sistem kartu (audit 005 #4): kartu item dulu memakai --border/10px sementara kartu ringkasan --border-strong/12px — dua permukaan berbeda di satu layar. Ikut kontrak DNA:…"
src/styles/system/_checkout.scss:38 — "── Keranjang ganda per toko (PRD §6) ────────────────────────────────────── Satu permukaan bergaris rambut, bukan kartu putih berulang per baris. Tiap baris: logo toko, nama +…" [5 baris]
src/styles/system/_checkout.scss:154 — "Ikon dirapatkan ke atas di dalam kotak sentuh 44px supaya sebaris dengan nominal di kolom yang sama; kotaknya tetap 44px agar target sentuh utuh."
src/styles/system/_cod-cash.scss:1 — "Uang tunai COD: kartu ringkasan tagihan/kembalian dan chip nominal. Dipakai layar bayar customer, layar pesanan, dan detail tugas kurir. Angka memakai `tabular-nums` (MD-07); chip…" [4 baris]
src/styles/system/_courier-batch.scss:147 — "Meta henti satu item per baris: sisi kiri (jarak) dan kanan (fee/COD) tidak cukup muat berdampingan di kolom 260px, dan membiarkannya wrap membuat satu baris jadi 2×2 yang tak…"
src/styles/system/_courier-batch.scss:183 — "Urutan manual (auto-sort OFF, BR-B12): kolom geser naik/turun di kanan tiap henti. Vertikal, bukan mendatar — mendatar menyita ~96px lebar dan alamat customer yang panjang jadi…" [4 baris]
src/styles/system/_courier-dashboard.scss:114 — "`minmax(0, 1fr)`, bukan `1fr`: sub menu ber-`white-space: nowrap`, jadi `1fr` (= minmax(auto,1fr)) membiarkan kolom melebar mengikuti min-content teks — terukur 256px vs 158px,…" [4 baris]
src/styles/system/_courier-hero.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Hero beranda kurir. Menggabungkan dua blok yang sebelumnya terpisah — identitas kurir (nama + nomor WA)…" [10 baris]
src/styles/system/_courier-hero.scss:15 — "`width: auto` (bukan 100% dari basis bersama): dengan margin negatif di kiri-kanan, `width: 100%` mengunci lebarnya ke lebar konten induk lalu hanya menggeser ke kiri, sehingga…" [4 baris]
src/styles/system/_courier-hero.scss:166 — "Catatan status = caption dari kontrol di atasnya, jadi rapat (8px); ringkasan mulai grup baru (16px)."
src/styles/system/_courier-partner.scss:42 — "Tombol masuk/keluar antrean. 44px (HG-05) dan ghost, supaya tidak bersaing dengan Terima sebagai aksi utama di kartu assignment."
src/styles/system/_courier-tasks.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Daftar tugas kurir: slip tugas (tiket), badge status, riwayat, catatan kosong. Dipecah dari…" [5 baris]
src/styles/system/_courier.scss:12 — "+ safe-area: nav fixed ~113px di app-mode (safe-area 34); 88px kurang, tombol kembali/konten terakhir tertutup bilah."
src/styles/system/_courier.scss:25 — "Tinggi lantai (`--nav-height`) dan padding vertikal datang dari kontrak bar di `_topbar.scss` ($page-bars) — di sini hanya padding tepi kiri-kanan. `min-height: 76px` lama ditimpa…"
src/styles/system/_courier.scss:241 — "Lebar penuh hanya di zona guard detail tugas (aksi berdiri sendiri). Di dalam `.sheet-actions` tombol ikut aturan sheet — sebab itu `width`/`margin` tidak lagi dibawa kelas…" [6 baris]
src/styles/system/_currency-converter.scss:1 — "── Konverter kurs JOD ⇄ IDR (sheet, desain v2) ─────────────────────────── Menggantikan daftar detail kurs lama: contoh v2 berupa **konverter** dua arah dengan kurs live, pilihan…" [8 baris]
src/styles/system/_currency-converter.scss:15 — "Header menembus padding sheet supaya garis bawahnya menyentuh tepi panel, seperti contoh — bukan mengambang dengan margin 20px."
src/styles/system/_currency.scss:1 — "── Mata uang: IDR + padanan JOD (M1, flow F10) ──────────────────────────── Nominal disimpan IDR (source of truth); JOD hanya tampilan. Widget kurs memuat rate, waktu sync…"
src/styles/system/_currency.scss:45 — "Tombol kurs live (ikon koin). Pil kecil dengan material permukaan + tepi, area sentuh 44px (HG-05)."
src/styles/system/_evidence.scss:1 — "Bukti foto bersama: dipakai konsol CS (sengketa, audit 017 F-02) dan detail order merchant (bukti transfer). Petak thumbnail yang bisa dibuka menjadi pratinjau penuh lewat…" [5 baris]
src/styles/system/_filter.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Halaman "Filter". Sama seperti Search: chrome datang dari stylesheet porting dengan warna mentah…" [12 baris]
src/styles/system/_filter.scss:23 — "Inset atas = safe-area (bilah status / punch-hole), bukan angka 70px yang dulu dituang begitu saja. `--space-5` tetap gutter kiri-kanan."
src/styles/system/_food-card.scss:154 — "`line-height` dipaku di barisnya dan diwarisi tiap anak — tanpa ini kotak meta jadi ~35px untuk teks 20px (garis dasar flex + ikon bintang menaikkan tinggi), dan jarak ke baris…"
src/styles/system/_food-card.scss:162 — "Semua anak baris meta satu tinggi (`1.2em`) dan tanpa margin warisan: CSS lama (`app/`) memberi `.food-rating` `margin-bottom: 12px`, yang menaikkan garis dasarnya di atas pemisah…"
src/styles/system/_food-card.scss:185 — "Bintang amber — token --star, bukan mewarisi abu meta. Digeser 1px turun supaya optiknya duduk di tengah teks (ikon 14px rata-tengah kotak garis sedikit naik)."
src/styles/system/_food-card.scss:265 — "Grid menu dua kolom di dalam kolom 430px. Dulu dipaku SATU kolom karena stylesheet lama menyalakan tiga kolom dari lebar jendela (kartu jadi ~119px), tapi satu kolom membuat 15…" [9 baris]
src/styles/system/_forms.scss:86 — "── Form alamat (flow f20) ──────────────────────────────────────────────── Baris status coverage di bawah peta, dan checkbox "jadikan alamat utama" setinggi --touch-min supaya…"
src/styles/system/_forms.scss:111 — "── Slider ───────────────────────────────────────────────────────────────── Tiga slider di repo (Filter harga, estimasi masak MerchantOrders, refund sebagian AdminDisputes) hanya…" [7 baris]
src/styles/system/_forms.scss:124 — "── Textarea: tinggi sendiri, bukan tinggi isian satu baris ──────────────── Stylesheet lama `app/part-02.scss` memaku `.form-control { height: 56px }`, dan lapisan system cuma…" [6 baris]
src/styles/system/_hero.scss:46 — "Opasitas pola semua di sini, dalam rentang 4-14%. Di berkas aslinya pin mencapai 90% dan uap 45%: dikomposit ke atas oranye merek, keduanya berhenti terbaca sebagai oranye. Pada…" [4 baris]
src/styles/system/_home-v2.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Beranda customer EDISI 02 — bagian yang hanya hidup di layar ini: banner promo (toko yang sedang…" [6 baris]
src/styles/system/_home-v2.scss:44 — "Padding 20px mengikuti contoh; tinggi card dijaga 160px oleh `min-height` di induknya, bukan oleh isi — kalau tidak, judul yang panjang melejitkan card jadi potret (terukur 263px)."
src/styles/system/_home-v2.scss:75 — "Nama toko sebagai baris kedua yang kecil dan dipotong — bukan bagian judul yang membungkus. "Warung Sate Pak Ali" di 21px memakan 3 baris dan membuat card setinggi potret; di sini…"
src/styles/system/_home-v2.scss:152 — "`absolute` itu load-bearing: sebuah `<img>` di aliran normal mendikte tinggi kartu lewat rasio aslinya. Foto mock landscape → kartu 160px (benar), foto toko live yang potret →…" [5 baris]
src/styles/system/_home-v2.scss:192 — "Scrim 70%, bukan 40%: teks putih di atas foto apa pun harus tetap lolos kontras; 40% membuat hasil komposit bergantung isi foto (audit 001 #3)."
src/styles/system/_home-v2.scss:358 — "68px = tinggi bilah keranjang mengambang (padding + dua baris teks + aksi) plus jarak `--space-3`; konstanta tata letak, bukan langkah spacing."
src/styles/system/_home.scss:20 — "Jalur kartu: tiga slide bersebelahan, digeser lewat `translate3d` supaya seluruh pergeseran ditangani compositor. Lebarnya 300% dari wadah, tiap slide 1/3 dari jalur."
src/styles/system/_home.scss:77 — "Rentang 6-14%: batas dekorasi di atas oranye. Di atas 14% warnanya bergeser ke salmon dan oranye mereknya rusak."
src/styles/system/_home.scss:125 — "Angka promo: gradien putih-ke-putih-hangat lewat `background-clip: text`. Kenapa gradien di sini boleh padahal bentuk latar dilarang memakainya: kedalaman latar harus datang dari…" [11 baris]
src/styles/system/_home.scss:165 — "Thumbnail 84px dihapus: foto makanan sekarang jadi latar penuh kartu, jadi tidak ada lagi gambar kecil di samping teks."
src/styles/system/_home.scss:168 — "Bilah aksi: satu tombol selebar kartu, target 44px, putih di atas oranye supaya aksi utama terbaca pertama. Padding kanan menyisakan ruang untuk deretan titik (3 x 44px = 132px)…" [4 baris]
src/styles/system/_home.scss:196 — "Penunjuk posisi. Targetnya 44px penuh (`--touch-min`), bukan 24px: sempat ditulis 24px dengan alasan "cukup untuk jari", dan gate menolaknya dengan benar. Tempatnya di BARIS CTA,…" [8 baris]
src/styles/system/_interaction.scss:3 — "═══════════════════════════════════════════════════════════════════════════ Primitif interaksi: umpan balik tekan, transisi halaman, dan gerak masuk yang informatif. Aturannya…" [14 baris]
src/styles/system/_interaction.scss:86 — "Butir navigasi bawah: yang mengecil ikonnya, bukan seluruh butir. Butirnya selebar 62px — menskalakan seluruhnya menggeser label dan titik aktif, dan yang dilihat mata saat jari…"
src/styles/system/_interaction.scss:111 — "Tombol tambah-ke-keranjang: terukur 93x34 sebelum ini, di bawah `--touch-min` (44px). Padding 10px saja tidak pernah menghasilkan 44px, jadi tingginya dikunci ke token — dan…" [7 baris]
src/styles/system/_interaction.scss:128 — "Lencana aksi dompet (Hapus/Sambungkan): terukur 71x20 dan 72x20 — jauh di bawah `--touch-min`. Padding 6px 12px tidak akan pernah mencapai 44px, jadi tingginya dikunci dan isinya…" [5 baris]
src/styles/system/_interaction.scss:140 — "Chip pencarian terakhir. Sebelumnya satu `<button>` yang memuat `<span role="button">` untuk menghapus — kontrol bersarang di dalam kontrol, yang bukan cuma meleset 7x18px tapi…" [8 baris]
src/styles/system/_interaction.scss:179 — "44px penuh, bukan 7x18px seperti sebelumnya. Ikon `×` tetap kecil; yang membesar hanya area yang bisa disentuh."
src/styles/system/_interaction.scss:191 — "Chip filter (layar /filter) dan opsi modifier (detail menu). Terukur 36-43px — semuanya di bawah `--touch-min`. Tingginya dikunci, bukan paddingnya ditambah: padding tidak akan…" [7 baris]
src/styles/system/_interaction.scss:206 — "Tombol +/- kuantitas di detail menu: terukur 42x42px, meleset 2px. Dinaikkan ke token supaya tidak ada satu pun kontrol di bawah ambang."
src/styles/system/_interaction.scss:213 — ""Clear All" di kepala daftar dan "Clear All" di kaki layar filter: keduanya terukur 18-19px tingginya. Ini tautan aksi, jadi tingginya dikunci tanpa mengubah tampilan teksnya."
src/styles/system/_interaction.scss:224 — ""Ganti" di layar jumlah bayar: terukur 52x18px. Tautan aksi di dalam kartu metode bayar — tingginya dikunci, lebarnya tetap mengikuti teksnya."
src/styles/system/_interaction.scss:233 — "── 2. Transisi halaman: fade, dan mengapa bukan geseran ──────────────────── Material menyebut pola ini "forward and backward" dan menggeser halaman ke samping. Di repo ini…" [19 baris]
src/styles/system/_interaction.scss:348 — "Bilah `fixed` wajib dibatasi kolom (DNA §5, sebelumnya 24 bilah melebar menyeberang jendela)."
src/styles/system/_interaction.scss:424 — "── 8. Reduced motion: fade, bukan hilang ────────────────────────────────── M3: "Use subtle fades instead of intense sliding or scaling animations. Disable decorative effects like…" [8 baris]
src/styles/system/_interaction.scss:442 — "Parallax pindah ke `_parallax.scss` (berkas ini menembus batas 600 baris). Override reduced-motion untuk lapisan parallax tinggal di sana, tepat setelah definisinya, supaya…" [4 baris]
src/styles/system/_invoice.scss:1 — "Invoice bersama (customer setelah bayar + rincian pendapatan merchant). Baris label–nominal memakai rel kanan lebar tetap (MD-11) dan angka tabular (MD-07). Aksi utamanya…" [4 baris]
src/styles/system/_invoice.scss:88 — "Satu aksi sekunder selebar kartu: target 44px, ikon + label (bukan ikon saja), dan warna tepi yang sama dengan kontrol sekunder lain di app."
src/styles/system/_list-row.scss:1 — "Baris daftar rel tetap (MD-11) — sekaligus MARKER untuk gerbang browser. `browser-gate` mengelompokkan setiap `.list-row` menurut induknya lalu menuntut lebar kolom 1 SATU nilai…" [6 baris]
src/styles/system/_map.scss:113 — "Peta pelacakan harus mengisi PEMBUNGKUSNYA, bukan viewport. Aturan lama di _app.scss memasang position:fixed + inset:104px 0 0 untuk menjadikan peta sebagai latar penuh layar.…" [7 baris]
src/styles/system/_menu-states.scss:1 — "Keadaan kosong/muat halaman menu & ulasan customer. Dipisah dari `_menu.scss` supaya berkasnya tetap di bawah batas 600 baris. Semua kelas di sini menang atas aturan porting yang…"
src/styles/system/_menu.scss:3 — "── 10. Detail menu ─────────────────────────────────────────────────────── Halaman ini paling parah. Tiga cacat nyata, bukan soal selera: 1. `.info-badge span` berwarna…" [9 baris]
src/styles/system/_menu.scss:44 — "Gutter 20px, bukan 16px: AGENTS.md §5 mengunci jarak tepi halaman ke satu nilai (`--space-5`) tanpa pengecualian. Nilai 16px di sini bertentangan dengan aturan di `part-08.scss`…" [4 baris]
src/styles/system/_menu.scss:122 — "Bar aksi bawah dibagi dua rata: stepper kuantitas dan tombol tambah masing-masing satu bagian. Dulu stepper selebar isinya (124px) dan tombol mengambil sisa, sehingga label tombol…" [4 baris]
src/styles/system/_menu.scss:160 — "Gutter 20px seperti isi di atasnya, supaya tombol CTA sejajar dengan kolom konten — 16px di sini membuat bilahnya 4px lebih lebar dari teks yang berdiri tepat di atasnya, dan gate…"
src/styles/system/_menu.scss:175 — "Opsi modifier jadi CHIP pill (model menu detail): deretan tombol yang membungkus, bukan daftar baris full-width dengan kotak centang. Aktif = fill oranye + teks putih; non-aktif =…" [6 baris]
src/styles/system/_menu.scss:216 — "Kelas `.reviews-header` dipakai dua tempat: bar judul halaman /reviews, dan baris kecil "Reviews (n) / See All" di detail menu. Aturan bar judul ikut bocor ke yang kedua, memberi…" [6 baris]
src/styles/system/_menu.scss:231 — "═══════════════════════════════════════════════════════════════════════════ 11. Scroll ═══════════════════════════════════════════════════════════════════════════ html/body…" [11 baris]
src/styles/system/_menu.scss:303 — "`.home-content` di atas `flex: none` dan setinggi kontennya, jadi ia tak bisa menyusut; sementara `.home-screen` — flex item di `.home-screen-wrapper` yang row flex — di-stretch…" [6 baris]
src/styles/system/_menu.scss:352 — "═══════════════════════════════════════════════════════════════════════════ 12. Judul halaman ═══════════════════════════════════════════════════════════════════════════ Keenam…" [13 baris]
src/styles/system/_menu.scss:391 — "═══════════════════════════════════════════════════════════════════════════ 13. Pelacakan pesanan ═══════════════════════════════════════════════════════════════════════════…" [8 baris]
src/styles/system/_menu.scss:427 — "Target sentuh 44px tanpa menggeser tepi teks: kotaknya dibesarkan, lalu margin negatif menariknya kembali sejajar gutter. Terukur sebelumnya 29×14."
src/styles/system/_menu.scss:474 — "Bilah dan indikator berbagi `z-index` 1000 dengan `.sheet-overlay`, dan karena bilah muncul belakangan di bundel ia menang pada nilai yang sama — tombol bawah sheet jadi tidak…" [7 baris]
src/styles/system/_merchant-2.scss:156 — "Baris kontrol dirampingkan: 57px -> 44px. Sebelumnya ada garis pemisah penuh plus padding atas 12px, dan tombol stok berupa chip berbingkai 97x44 — tiap item membawa toolbar-nya…" [5 baris]
src/styles/system/_merchant-2.scss:232 — "Geometri tidak lagi ditimpa di sini. Pacuan `pill` + tepi 2px dulu membuat tombol Batal beda bentuk dari primer `s-btn-shape` di sebelahnya (terukur radius 9999 vs 10, tepi 2px vs…" [5 baris]
src/styles/system/_merchant-2.scss:457 — "Panel naik dari bawah dan latarnya memudar masuk. Sebelumnya sheet muncul mendadak tanpa gerak sama sekali — satu-satunya permukaan yang bergerak di repo adalah…" [6 baris]
src/styles/system/_merchant-2.scss:472 — "Aksi utama sheet menempel di dasar panel, bukan ikut tergulir. Dengan `max-height: 90vh`, isi yang panjang atau keyboard lunak yang terbuka bisa mendorong Simpan/Batal keluar…" [4 baris]
src/styles/system/_merchant-2.scss:506 — ".sheet-title, .sheet-field-label, dan .stock-stepper pindah ke _merchant-menu-polish.scss begitu stock sheet dibawa ke pola native. (Dulu di sini: judul 14.34px/500, label…"
src/styles/system/_merchant-2.scss:580 — "Kontrol native mengisi seluruh pil (`position:absolute; inset:0`) alih-alih tampil 13px di samping teks: target sentuh tetap 44px dan status terpilih dibaca lewat…" [4 baris]
src/styles/system/_merchant-3.scss:3 — "Kurir toko: kartu daftar kurir + salinan sekunder daftar kosong. Dipecah dari _merchant-2.scss saat file itu menyentuh batas 600 baris."
src/styles/system/_merchant-3.scss:6 — "Daftar kurir: satu permukaan berisi baris berambut, bukan kartu per kurir. Tiap baris adalah tombol penuh yang membuka sheet aksi. Sebelumnya tiap kurir punya kartu sendiri (ikon…" [4 baris]
src/styles/system/_merchant-3.scss:24 — "`list-row` = marker gerbang MD-11; rel kanan tetap 112px (chip + chevron)."
src/styles/system/_merchant-3.scss:61 — "MD-07: angka tabular, status bukan kata abu di dalam rangkaian `a · b · c`."
src/styles/system/_merchant-3.scss:170 — "Baris berikon: ikon memimpin baris pertama, bukan mengambang di tengah (ikon 20px di baris 116px terbaca kecil). Geser 2px agar sejajar huruf kapital judul `--text-base`…"
src/styles/system/_merchant-3.scss:296 — "Paket = kartu pilihan, bukan baris list. Dua kolom menahan tinggi halaman (lima baris list lama ~320px) dan terbaca sebagai pilihan, bukan daftar."
src/styles/system/_merchant-3.scss:365 — "Tautan di tengah kalimat ("di halaman Order") tetap harus bisa ditekan, tapi ia TIDAK boleh mengubah aliran baris teksnya. Percobaan pertama memakai `display: inline-block` +…" [13 baris]
src/styles/system/_merchant-3.scss:392 — "Catatan "diatur di halaman lain" — dulu dua kartu terpisah (2 × 52px), satu ikon dan satu kalimat masing-masing. Bentuk kartu membuat tiap kalimat terbaca sebagai pesan yang…" [7 baris]
src/styles/system/_merchant-3.scss:418 — "Tautan "Lihat semua" di kepala section. Terukur sebelumnya 64×18px — hanya setinggi hurufnya, padahal ia satu-satunya jalan ke daftar penuh dan ditekan dengan ibu jari.…" [10 baris]
src/styles/system/_merchant-4.scss:3 — "Layar Insentif (/merchant/insentif) — daftar ambang tier, riwayat event, dan blok simulasi. Dipecah dari _merchant-2.scss saat file itu menyentuh batas 600 baris."
src/styles/system/_merchant-4.scss:73 — "Perbandingan dua metode bayar (COD vs transfer). Menggantikan donut kedua: split 4/4 tidak menambah informasi di atas bar dua warna, dan donut kedua membuat kartu komposisi 468px…" [5 baris]
src/styles/system/_merchant-4.scss:170 — "Kartu "Komposisi order" di kolom 430px: donut di kiri, legenda jadi baris penuh satu-baris di kanannya — titik · label … angka (angka rata kanan). Tiap baris `.chart-legend-link`…" [7 baris]
src/styles/system/_merchant-4.scss:218 — "Kartu isi di halaman merchant harus MENUMPUK, bukan berbaris. Kelas `.merchant-card` bertabrakan dengan kartu storefront di `_storefront.scss` yang menyetel `display:flex` arah…" [7 baris]
src/styles/system/_merchant-4.scss:232 — "Kartu "Menu terjual" saat hanya ada satu menu: tidak ada pembanding, jadi tidak ada batang. Yang ditonjolkan angka porsinya (28px, tabular), nama menu jadi label di atasnya, omzet…"
src/styles/system/_merchant-4.scss:399 — "Lingkaran pakai `50%` (audit 012 #4) — pill disisakan untuk bentuk kapsul."
src/styles/system/_merchant-4.scss:469 — "Skeleton menggantikan hero yang menanggung inset safe-area (`.merchant-hero__content`); tanpa ini tepi atas terukur 39px < 59px."
src/styles/system/_merchant-batch.scss:428 — "Chip waktu: jam berjalan = tekanan waktu, jadi memakai bahasa peringatan (`--warning-*`), bukan warna merek yang dipesan untuk harga (DEC-88080)."
src/styles/system/_merchant-carousel.scss:111 — "Status dan sakelar jadi satu kontrol: teks "Tampil"/"Nonaktif" terbaca tanpa mengandalkan warna saja (MD-07)."
src/styles/system/_merchant-hero.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Hero beranda dapur (merchant). Menggabungkan tiga hal yang sebelumnya tiga kartu terpisah — identitas…" [9 baris]
src/styles/system/_merchant-hero.scss:14 — "`width: auto` (bukan 100% dari basis bersama): dengan margin negatif di kiri-kanan, `width: 100%` mengunci lebarnya ke lebar konten induk lalu hanya menggeser ke kiri, sehingga…" [4 baris]
src/styles/system/_merchant-hero.scss:150 — "Catatan status = caption dari kontrol di atasnya, jadi rapat (8px); kuota mulai grup baru (16px)."
src/styles/system/_merchant-hours.scss:9 — "MD-06: panel sheet tidak boleh memakan hampir seluruh layar. Daftar dibatasi lalu menggulir di dalam; tombol Simpan tetap di luar daftar."
src/styles/system/_merchant-hours.scss:79 — "Catatan batas penyimpanan: lebih rapat dari `.merchant-hint-inline` supaya panel tetap di bawah 60% viewport (MD-06)."
src/styles/system/_merchant-menu-polish.scss:26 — "Dot status, bukan kontrol: tanpa `min-height: 44px` (itu untuk tap target elemen interaktif, bukan teks)."
src/styles/system/_merchant-menu-polish.scss:51 — "── Filter menu: kategori (utama) + status stok ───────────────────────────── Daftar menu 15 item terukur ±2265px (87% tinggi halaman), jadi filter yang duduk di atasnya hilang…" [7 baris]
src/styles/system/_merchant-menu-polish.scss:224 — "── Menu ⋮ (Ubah / Hapus) ─────────────────────────────────────────────────── Pindah dari _merchant.scss, sekaligus diperbaiki: tombolnya tidak menulis `background` sama sekali…" [6 baris]
src/styles/system/_merchant-menu-polish.scss:250 — "Radius dalam = 10px panel dikurangi padding 4px, supaya sudutnya sejajar."
src/styles/system/_merchant-menu-polish.scss:270 — "── Stock sheet ───────────────────────────────────────────────────────────── Sebelumnya ini form desktop yang diperkecil: judul 14.34px/500 (lebih kecil dari nama hidangan di…" [6 baris]
src/styles/system/_merchant-menu-polish.scss:285 — "Label di bawah 12px tidak terbaca di ponsel (senior-fe mobile PG-06, batas bawah 15pt untuk teks isi; label boleh kecil tapi tetap >= 13px)."
src/styles/system/_merchant-menu-polish.scss:314 — "56px, bukan 44px: 44px adalah batas MINIMUM (senior-fe mobile HG-05), dan tombol ± ditekan berulang kali, jadi ia layak lebih lega dari minimum. Bulat (pill) karena ini kontrol…"
src/styles/system/_merchant-menu-polish.scss:363 — "Skala 0.86 -> 1 pada angka yang baru. Satu-satunya gerak selain :active, tugasnya sama: memberi tahu bahwa tap-nya terbaca. Di bawah prefers-reduced-motion, _motion.scss…"
src/styles/system/_merchant-orders.scss:34 — "Radius dalam = radius luar 10px dikurangi padding 4px, supaya sudutnya sejajar wadah (nested radius)."
src/styles/system/_merchant-orders.scss:56 — "Pemilih kurir (F12 :assign). Kartu radio, bukan baris menu polos: nama + status terbaca sekali lihat, pilihan terpilih ditandai border oranye + avatar kontras. Wajib pilih satu…"
src/styles/system/_merchant-orders.scss:238 — "Badge boleh turun baris, jangan keluar kotak (MD-12): sebelumnya baris code+badge dipaksa satu baris, dan 4 chip di layar 390 meluber 89px lalu dipangkas diam-diam oleh clip di…"
src/styles/system/_merchant-orders.scss:333 — "Nama pelanggan = identitas utama slip (dulu terkubur di 13px dan kalah dari kode order)."
src/styles/system/_merchant-orders.scss:392 — "Aksi tiket diseragamkan. `.btn` legacy (`app/part-02.scss`) memaku `height: 56px`, sementara ghost di `.merchant-actions` membawa `border-radius: pill` + tepi 2px — dua tombol…" [7 baris]
src/styles/system/_merchant-orders.scss:399 — "Aksi tiket: baris antrean padat, jadi tinggi `.btn` legacy 56px dipangkas ke 48px (tetap di atas `--touch-min`). Bentuk (radius/tepi) tidak lagi ditulis di sini — sudah satu nilai…"
src/styles/system/_merchant-payout.scss:29 — "CTA/link selebar kartu: `Tarik saldo`, `Buka dompet`, `Kelola rekening`. `width: 100%` menimpa `inline-flex` bawaan `.btn`, jadi satu aturan untuk tombol maupun tautan."
src/styles/system/_merchant-payout.scss:144 — "Aksen oranye = pilihan aktif, satu-satunya di layar. Cincin dalam dipakai, bukan border 2px, supaya tinggi kartu tidak bergeser saat dipilih."
src/styles/system/_merchant-payout.scss:285 — "Identitas rekening = baris utama kartu. Sebelumnya 13px/400, cuma sedikit di atas sub 12px, jadi tak ada baris yang jadi fokus. Di-scope ke kartu rekening supaya…"
src/styles/system/_merchant-payout.scss:293 — "Aksi mengikuti lebar isinya, bukan dibagi rata. Dengan `flex: 1` label terpanjang ("Jadikan utama") terukur pecah dua baris dan barisnya jadi tidak rata; tiga tombol justru muat…"
src/styles/system/_merchant-revenue.scss:3 — "Kartu pendapatan: satu titik fokus di beranda dapur. Sebelumnya kotak keempat dari grid 2×2 yang keempat kartunya seragam (73/73/99/99px, semua nilai 17,01px) sehingga uang dan…" [11 baris]
src/styles/system/_merchant-revenue.scss:31 — "Teks kecil di kartu merek jangan diredupkan: opacity 0,85 menurunkan kontras di bawah AA untuk 12px. Putih penuh = 4,70:1."
src/styles/system/_merchant-reviews.scss:3 — "Layar Ulasan (/merchant/reviews) dan bagian yang hanya dipakainya. Aturan dasarnya masih di `_merchant-2.scss` (kartu, ringkasan, distribusi); berkas ini memuat perilaku gulirnya…" [5 baris]
src/styles/system/_merchant-reviews.scss:9 — "── Filter menempel di bawah header ───────────────────────────────────────── Delapan kartu ulasan terukur 1704px, jadi baris filter (Semua + lima nama hidangan) yang duduk di…" [7 baris]
src/styles/system/_merchant.scss:15 — "+ safe-area: nav fixed ~113px di app-mode (safe-area 34); 88px kurang."
src/styles/system/_merchant.scss:55 — ".merchant-title: ukuran dan bobotnya ditentukan system/_type.scss (judul hero). Dulu kelas ini menulis --text-xl/800/--text-primary sendiri, sehingga terukur 20,68px sementara…" [4 baris]
src/styles/system/_merchant.scss:323 — "Tab aktif = segmented tinted, bukan oranye solid: satu aksen kuat saja (aksi utama), dan count di dalamnya lolos AA (`--orange-soft-ink` di `--orange-soft`, pasangan yang sama…"
src/styles/system/_merchant.scss:353 — "Lingkaran pakai `50%`; `--radius-pill` disisakan untuk bentuk kapsul."
src/styles/system/_merchant.scss:414 — "Dua tombol di dalam sheet berbagi lebar sama, seperti .profile-modal-actions di role customer. Sebelumnya `.merchant-delete-confirm` saja yang `flex: 1`, sementara Batal hanya…" [5 baris]
src/styles/system/_merchant.scss:421 — "Padding mendatar DISAMAKAN dengan `.btn` primer (s-btn-shape: `0 var(--space-5)`), bukan dinolkan. Dengan flex-basis 0% + flex-grow 1 padding dibagi di luar basis, jadi dua tombol…" [5 baris]
src/styles/system/_merchant.scss:566 — "Pratinjau gambar + tombol upload disejajarkan sebagai satu baris. Sebelumnya keduanya inline di dalam `.form-group` yang `display:block`, sehingga `vertical-align: baseline`…" [4 baris]
src/styles/system/_mixins.scss:38 — "Baris daftar dua kolom dengan **rel kanan lebar tetap** (MD-11). Isi di kolom 1; kolom 2 untuk nominal (baris 1) dan chip status / CTA (baris 2). Relnya `$rail` tetap, bukan…" [9 baris]
src/styles/system/_mixins.scss:56 — "Filter daftar yang menempel tepat di bawah header halaman. Dua halaman merchant punya daftar panjang (menu 15 item = 2265px, ulasan 8 kartu = 1704px) dengan kontrol filternya di…" [11 baris]
src/styles/system/_mixins.scss:89 — "`--text-field`, bukan `--text-base`: di bawah 16px iOS men-zoom input saat fokus (lihat catatan token di _tokens.scss)."
src/styles/system/_my-order.scss:1 — "Pesanan Saya (`/orders`) — dua tab: Aktif (keranjang + pesanan berjalan) dan Riwayat (pesanan selesai + "Pesan lagi"). Baris & chip memakai primitif `.ck-*` milik dok keranjang…" [4 baris]
src/styles/system/_notifications-v2.scss:25 — "Melebar sampai tepi kolom (induk punya padding 20px) lalu kembalikan isi ke gutter 20px, seperti `.profile-flow-header` sebelumnya."
src/styles/system/_notifications-v2.scss:141 — "Belum dibaca: kartu soft-orange bergaris, bukan garis kiri 3px gaya lama."
src/styles/system/_onboarding.scss:3 — "── Onboarding ──────────────────────────────────────────────────────────── Carousel: satu foto bulat sebagai titik fokus, judul + isi, satu aksi primer. Yang beranimasi hanya isi…" [7 baris]
src/styles/system/_onboarding.scss:30 — "Kedalaman lewat dua lingkaran radial, nilai alpha rendah (16% dan 10%) supaya oranye merek tidak bergeser ke salmon. Ini pengganti `bg-pattern` Tailwind, dan bukan gradient merek…" [4 baris]
src/styles/system/_onboarding.scss:71 — "Asetnya portrait (800x1200/1422); panel hanya setinggi bagian atas layar. 38% mengarahkan potongan ke isi makanan, bukan alas piring."
src/styles/system/_onboarding.scss:87 — "── Merek ───────────────────────────────────────────────────────────────── Badge putih di atas foto/ warna, sama pola dengan layar auth: logo 26px + nama. Bukan hiasan — dua peran…"
src/styles/system/_onboarding.scss:105 — "Di app terinstal pil merek ini mengambang di tepi atas, jadi ia harus turun melewati status bar OS / kamera punch-hole. Terukur di jendela app-mode 390px: tepinya 23px sementara…"
src/styles/system/_onboarding.scss:132 — "Di bawah badge merek (badge tinggi ~34px di y=16), supaya keduanya tidak saling menutup saat saran pasang muncul."
src/styles/system/_onboarding.scss:222 — "Target sentuh 44px, penanda terlihat 8px (24px saat aktif) — sama pola dengan checkbox di layar auth: yang diukur gerbang kotak besarnya, yang dilihat mata bulatan kecilnya."
src/styles/system/_onboarding.scss:277 — "Judul onboarding: langkah huruf terbesar yang tersedia (`--text-2xl` 26-32px), bukan `--text-xl`. Layar ini yang pertama dilihat, dan pada 20.68px judulnya terukur lebih kecil…" [6 baris]
src/styles/system/_onboarding.scss:292 — "Isi: 15-16px dengan tinggi baris longgar khusus untuk teks panjang di ponsel (1.6, bukan 1.5). Pada ukuran ini Manrope butuh ruang napas lebih, dan paragraf tiga baris terbaca…" [11 baris]
src/styles/system/_order-chat.scss:6 — "── Peserta: tiga orang, tiga kolom ──────────────────────────────────────── Sebelumnya tiga pil bergaris dengan nama + peran bertumpuk; di 390px pil ketiga membungkus ke baris…" [8 baris]
src/styles/system/_order-chat.scss:127 — "Pesan beruntun dari sisi yang sama dirapatkan (12 → 4px), supaya blok pembicara terbaca sebagai satu giliran."
src/styles/system/_order-chat.scss:149 — "Nama pengirim di atas teks, hanya untuk gelembung pihak lain. Tiga peserta di satu thread tidak bisa dibedakan dari nada warna saja; avatar kecil 20px memberi identitas yang sama…"
src/styles/system/_order-chat.scss:203 — "Thread ditutup: order batal/ditolak, atau beberapa jam setelah selesai (§20.1). Durasi "beberapa jam" = OPEN-20, jadi tidak diangkakan di UI."
src/styles/system/_order-chat.scss:215 — "── Latar thread: pola titik, bukan bidang kosong ────────────────────────── Kanvas `--bg-warm` polos membuat percakapan terasa seperti halaman kosong. Pola titik 2px berjarak 24px…" [7 baris]
src/styles/system/_order-chat.scss:231 — "── Dock bawah ───────────────────────────────────────────────────────────── Saran cepat, catatan lampiran, dan composer adalah satu bilah lengket. Sebelumnya hanya composer yang…" [5 baris]
src/styles/system/_parallax.scss:1 — "── Parallax saat menggulir ───────────────────────────────────────────────── Dipisah dari `_interaction.scss` (audit 001): berkas itu menembus batas 600 baris begitu bagian ini…" [32 baris]
src/styles/system/_parallax.scss:38 — "Header atas bergerak SETENGAH kecepatan gulir: saat isi melaju naik, header tertinggal sedikit di belakangnya. `translate` tidak menggeser kotak layout, dan header bergerak naik…" [12 baris]
src/styles/system/_parallax.scss:69 — "Judul bagian adalah "line" yang menahan dalam: naik lebih pendek dari isi, jadi saat menggulir ia terangkat dari isi yang melaju di bawahnya. `cover 100%` penting, dan sempat…" [8 baris]
src/styles/system/_parallax.scss:103 — "── Lapisan otomatis lintas layar customer (CL-01, audit 001) ────────────── Parallax penuh tanpa memberi kelas per elemen: elemen besar yang sudah ada (foto hero toko, foto banner…" [6 baris]
src/styles/system/_parallax.scss:136 — "Parallax = gerak dekoratif, arahnya tak membawa informasi. M3 menyarankannya dimatikan, bukan diperhalus — jadi lapisannya hanya di-fade seperti bagian lain yang masuk. Daftar…" [5 baris]
src/styles/system/_payment-amount.scss:1 — "── /payment-amount (customer) — blok metode bayar ───────────────────────── Audit 008 (anti-slop/audit-008-2026-10-10.md), direvisi 2026-10-29: kartu metode bukan lagi bidang…" [9 baris]
src/styles/system/_payment-amount.scss:43 — "Judul seksi mengikuti pola judul seksi halaman (ringkasan pesanan): satu ukuran untuk peran yang sama, bukan 17px/600 sendiri. Warna token."
src/styles/system/_payment-dana.scss:26 — "Kontrak bar bersama (`_topbar.scss`) hanya mengatur padding vertikal; jarak tepi 20px (DNA baris 20) dulu datang dari partial legacy `app/` per-halaman — yang tak dimiliki halaman…" [4 baris]
src/styles/system/_payment-selection.scss:1 — "── /payment-selection (customer) ───────────────────────────────────────── Audit 007 (anti-slop/audit-007-2026-10-10.md). Halaman ini masih memakai stylesheet porting…" [8 baris]
src/styles/system/_payment-selection.scss:31 — "104px adalah sisa header `fixed`; header kini ikut aliran + sticky, jadi konten mulai tepat di bawahnya. Bawah menyisakan ruang footer + safe area."
src/styles/system/_payment-selection.scss:76 — "Cip ikon: oranye lembut + ikon ink (5,3:1). Markup menulis color="var(--on-brand)" sebagai atribut SVG, dan atribut presentasi tidak menerima var() (ikon terukur hitam). Warna…"
src/styles/system/_platform-notice.scss:10 — "Gutter samping milik induk, bukan komponen: hampir semua pemakaian ada di dalam container ber-padding `--space-5` (main.courier-page, .merchant-page, .sheet-panel, .wallet-page).…" [6 baris]
src/styles/system/_post-order.scss:27 — "Tombol ajakan: di atas halaman oranye, tombol oranye berarti tidak terlihat (terukur latar tombol = latar halaman). Dibalik jadi permukaan terang dengan teks oranye, dan…"
src/styles/system/_post-order.scss:41 — "Aksi kedua di perayaan: jalan keluar ke beranda. Teks saja supaya tidak bersaing dengan aksi utama; tetap 44px dan kontras teks di atas oranye."
src/styles/system/_post-order.scss:61 — "── Gerakan perayaan ──────────────────────────────────────────────────────── Sebelumnya layar ini diam total: konfeti cuma ditempel di sekitar lingkaran, tidak ada satu pun…" [5 baris]
src/styles/system/_post-order.scss:163 — "── Jarak tepi halaman ────────────────────────────────────────────────────── Satu nilai untuk tepi halaman (--space-5). Ketiga wadah ini masih memakai 24px dari stylesheet hasil…" [4 baris]
src/styles/system/_post-order.scss:173 — "── Overlay perayaan (kurir) ──────────────────────────────────────────────── Blok `.order-arrived-*` yang sama dipakai kurir sebagai lapisan penuh di atas layar detail, bukan…" [5 baris]
src/styles/system/_post-order.scss:192 — "── Header layar rating ───────────────────────────────────────────────────── `max-width` + `margin-inline: auto` dari _cart-2.scss membuat item flex ini menyusut selebar isinya:…" [6 baris]
src/styles/system/_post-order.scss:202 — "── Bintang penilaian ─────────────────────────────────────────────────────── 40×46 (lebar ikon, tanpa padding) — di bawah target 44px. Kotaknya dibesarkan tanpa mengubah ukuran…"
src/styles/system/_profile-v2.scss:14 — "Ruang di bawah supaya kartu "Preferensi", kartu instal, dan tombol Keluar tidak tertutup bilah bawah yang `fixed` (halaman lama memakainya 80px inline; sekarang dari token)."
src/styles/system/_profile.scss:22 — "── Modal keluar ─────────────────────────────────────────────────────────── Modal ini dipaku ke dasar layar, dan dasar layar /profile ditempati .bottom-nav (fixed, 77px terukur,…" [15 baris]
src/styles/system/_profile.scss:50 — "Modal ini `position: fixed` dan duduk di kolom 430px; di jendela lebar ia harus tetap di tengah kolom, bukan menyeberang viewport. `inset: 0` sudah membentangkannya penuh, jadi…" [4 baris]
src/styles/system/_profile.scss:63 — "part-15.scss menulis max-width: 480px — angka mentah, dan tidak sama dengan kolom aplikasi (--shell-max 430px). Selama +50px itu tak pernah terpakai, tapi ia salah sebagai sumber…" [4 baris]
src/styles/system/_program-ticket.scss:3 — "═══════════════════════════════════════════════════════════════════════════ Kupon program toko (halaman toko customer, §15) — versi ringkas. Kupon = tiket slim 240×90 (permintaan…" [8 baris]
src/styles/system/_program-ticket.scss:47 — "Dua takik di tepi kiri & kanan: SETENGAH lingkaran yang rata di tepi (bukan lingkaran ber-offset negatif) — bentuknya sama, tapi tidak ada isi yang melampaui kotak, jadi tak ada…"
src/styles/system/_program-ticket.scss:147 — "Tombol di pojok kanan bawah (right/bottom 8px, seperti mockup). Lebarnya mengikuti isi tapi tak pernah di bawah 44px: pil terlihatnya kecil, sasaran sentuh jarinya tetap memenuhi…" [4 baris]
src/styles/system/_program-ticket.scss:189 — "Titik navigasi: target 44px penuh, penanda di dalamnya. Aktif memanjang jadi pil oranye."
src/styles/system/_reviews.scss:89 — "Foto ulasan. Petak 96px = ukuran yang sama dengan bukti sengketa supaya pratinjau gambar terasa satu bahasa di seluruh aplikasi."
src/styles/system/_reviews.scss:112 — "Tombol hapus: sasaran sentuh 44px, yang terlihat cakram kecil di sudut."
src/styles/system/_search.scss:47 — "Ikon filter adalah kontrol nyata (tautan ke /filter): sasaran jarinya diberi ukuran `--touch-min`, bukan 24px seperti sebelumnya. Ikonnya sendiri tetap kecil; yang membesar hanya…"
src/styles/system/_storefront.scss:18 — "── Daftar toko (beranda) ──────────────────────────────────────────────── Kisi dua kolom berisi ubin berfoto: fotonya yang membawa identitas toko, nama + fakta di bawahnya.…" [5 baris]
src/styles/system/_storefront.scss:35 — "Ubin toko dua kolom: foto 16:9 menempel di kepala kartu (cukup besar untuk mengenali makanan, tidak setinggi 4:3 sehingga daftar tak jadi galeri), lalu nama + satu baris fakta di…" [4 baris]
src/styles/system/_storefront.scss:101 — "Dua baris tetap: nama toko di kolom ~165px butuh dua baris, dan tinggi yang dipatok min-height menjaga baris kisi tetap rata."
src/styles/system/_storefront.scss:124 — "Waktu antar jadi chip di pojok foto (pola yang sudah dikenal di aplikasi antar makanan). Kalau ia ditaruh di baris fakta, baris itu membalut di kolom ~163px dan tinggi kartu…"
src/styles/system/_storefront.scss:144 — "Lencana status hanya muncul kalau tokonya TIDAK bisa dipesan. Menempelkan kata "Buka" di tiap ubin hanya menambah derau: ubin yang bisa diketuk memang sudah berarti buka. Titik…" [4 baris]
src/styles/system/_storefront.scss:218 — "Pill sendiri, bukan `.category-btn` (yang di-`_menu.scss` dibuat transparan untuk chip ikon). Target sentuh 44px (AGENTS §5)."
src/styles/system/_storefront.scss:294 — "Sudut bawah membulat, mengikuti bahasa hero beranda; memakai token radius (12px, langit-langit skala) bukan nilai mentah."
src/styles/system/_storefront.scss:400 — "Meta toko sengaja DUA baris, bukan satu baris yang membalut sendiri: peringkat+ulasan satu baris (faktor keputusan), waktu/jarak/jam baris kedua. Satu baris dipaksa membalut di…" [4 baris]
src/styles/system/_superadmin-2.scss:3 — "── Konsol Super Admin — lanjutan (zona, role, audit) ─────────────────────── Dipisah dari `_superadmin.scss` supaya tiap partial tetap di bawah batas 600 baris. Urutan @use…"
src/styles/system/_superadmin-2.scss:98 — "Sel tabel yang seluruhnya jadi tautan. Dipakai di registri pengguna: kolom aksi terpisah tidak muat (tabel merchant sudah penuh di 1440px, kolom ke-10 memecah nama jadi tiga baris…" [4 baris]
src/styles/system/_superadmin-2.scss:233 — "44px: seluruh baris izin adalah target sentuh (kotak centangnya sendiri 18px), bukan hanya kotaknya (MD-05)."
src/styles/system/_superadmin-2.scss:268 — "Header **boleh** membungkus. Sebelumnya `nowrap`, dan itu yang membuat tabel pajak menolak menyempit: tujuh header panjang memaksa lebar 1031px di ruang 934px, jadi tabelnya…" [4 baris]
src/styles/system/_superadmin-2.scss:345 — "Boleh menyusut: di kepala kartu yang sempit (judul + pencarian berdampingan) `flex-shrink: 0` + `input min-width: 180px` mendorong kolom pencarian 24px keluar tepi kartu (MD-12).…"
src/styles/system/_superadmin-2.scss:395 — "── Dialog di konsol desktop ───────────────────────────────────────────── `BottomSheet` bawaan aplikasi terkunci ke kolom 430px dan menempel di bawah (chrome ponsel). Di konsol SA…" [9 baris]
src/styles/system/_superadmin-3.scss:1 — "── Konsol SA — perlakuan kartu (cincin dekoratif & footer aksi) ─────────── Konsep dari contoh Uiverse: satu cincin lembut di sudut kartu yang bergeser saat hover, dan aksi kartu…" [6 baris]
src/styles/system/_superadmin-3.scss:12 — "Cincin memakai tint merek, bukan `currentColor`: di kartu putih, cincin gelap 10% terbaca seperti noda render, bukan dekorasi. Di kartu merek cincinnya putih (`currentColor` =…" [5 baris]
src/styles/system/_superadmin.scss:3 — "── Konsol Super Admin (role terpisah, website penuh non-PWA) ─────────────── Cakupan & keputusan PO 2026-09-23: `docs/product/prd/decision-irbid-mvp.md`. Pengecualian lebar:…" [5 baris]
src/styles/system/_superadmin.scss:9 — "`body > div` (cocok dengan #root) mengunci max-width 430px untuk SEMUA rute; batalkan hanya saat #root memuat konsol SA — pola yang sama dengan .doc-root."
src/styles/system/_superadmin.scss:16 — "Sidebar SA memakai `position: sticky`. Stylesheet porting menetapkan `overflow: hidden` pada `html, body` (app/part-01.scss), dan `overflow` yang bukan `visible` menjadikan body…" [7 baris]
src/styles/system/_superadmin.scss:85 — "Satu-satunya penggulung bersarang yang disengaja di repo ini (DNA §5): sidebar menempel, dan di jendela desktop yang pendek (terukur: 412px nav di viewport 600px) menu bawah tidak…" [4 baris]
src/styles/system/_topbar.scss:1 — "═══════════════════════════════════════════════════════════════════════════ Kontrak top bar — satu tinggi, satu bentuk, untuk semua halaman. DNA baris 20: header halaman satu pola…" [14 baris]
src/styles/system/_topbar.scss:44 — "`.wallet-flow .profile-flow-header` dari app/part-15 (0-2-0) menyetel padding-top 12px; didaftarkan apa adanya supaya tidak lolos dari kontrak. Padding vertikal 0 dan tinggi dari…" [7 baris]
src/styles/system/_topbar.scss:71 — "Judul hero di dalam bar role (merchant/kurir/admin) dipatok, tidak ikut clamp `vw` milik `--text-2xl`: kolom aplikasi dikunci 430px, tapi tokennya mengikuti lebar jendela, jadi…" [6 baris]
src/styles/system/_topbar.scss:83 — "`.reviews-header` dipakai dua tempat: bar judul /reviews dan baris kecil di detail menu. Yang kedua sudah direset oleh `.menu-detail-content .menu-reviews-section .reviews-header`…" [4 baris]
src/styles/system/_topbar.scss:88 — "── Tombol kembali: satu ukuran, satu bentuk, satu permukaan ─────────────── Terukur: 36px (app/part-07), 40px (part-14/15), 44px, 48px (part-08) dengan empat bentuk (radius-xs,…" [10 baris]
src/styles/system/_topbar.scss:118 — "`min-*` juga dipasang: inilah yang benar-benar bekerja pada tombol kembali `.btn-back` di `_back.scss`, dan `.back-btn-profile` (13 halaman profil) ternyata mengabaikan…" [4 baris]
src/styles/system/_topbar.scss:133 — "Ukuran ikon datang dari prop lucide, jadi berbeda per halaman (22px di layar order, 24px di sebagian besar layar lain). Dikunci di sini alih-alih menyunting dua puluh berkas…" [4 baris]
src/styles/system/_topbar.scss:153 — "Lantai dinaikkan sebesar inset dan insetnya masuk lewat padding atas: area isi tetap 64px, tapi mulai di bawah status bar, dan latar bar menutupi seluruh area status bar."
src/styles/system/_topbar.scss:160 — "Bar `fixed` mulai dari tepi atas: inset masuk lewat padding, bukan lewat `top`. `.favorites-header` dan `.order-arrived-header` masih memakai `top: 44px` — sisa status bar tiruan…" [4 baris]
src/styles/system/_topbar.scss:179 — "Judul halaman dipusatkan lewat `position: absolute` tanpa `top`, jadi ia mengambil posisi statis — yang berpusat pada KOTAK PENUH bar (border box), bukan area isi di bawah inset.…" [8 baris]
src/styles/system/_tracking.scss:11 — "Header menempel, jadi latarnya harus menutup selebar layar — kalau hanya selebar konten, isi halaman terlihat lewat di sela 20px kiri-kanannya saat digulir. Margin negatif…"
src/styles/system/_tracking.scss:24 — "`--touch-min`, bukan 40px: sama seperti .back-btn-profile dan .btn-back, tombol kembali harus selebar sasaran jari. Bentuknya tombol persegi kecil dengan ikon di tengah, jadi…" [4 baris]
src/styles/system/_tracking.scss:157 — "Simpul: lingkaran kecil berikon, bukan lingkaran ikon besar. Ukurannya 26px supaya nadanya tetap ketimbang judul, dan latarnya menutup garis rel yang lewat di belakangnya."
src/styles/system/_type.scss:3 — "═══════════════════════════════════════════════════════════════════════════ Skala huruf — judul layar 39 halaman punya <h1>, dan sebelum ini ada 16 kelas berbeda untuk judul yang…" [23 baris]
src/styles/system/_type.scss:71 — "Judul header: berdampingan tombol kembali 44px. Bobot disatukan ke 700 (dulu bercampur 600/700/tanpa bobot), ukuran tidak diubah."
src/styles/system/_type.scss:87 — "`menu-detail-title` sengaja TIDAK dipetakan. Judulnya `flex: 1` dan `text-align: center` di antara dua tombol 44px (kembali dan favorit), jadi ukurannya bagian dari perhitungan…" [5 baris]
src/styles/system/_type.scss:93 — "── Judul header yang barisnya dibagi kontrol ────────────────────────────── `merchant-title`, `courier-title`, dan `admin-title` dipetakan sebagai judul hero karena mayoritas…" [10 baris]
src/styles/system/_wallet.scss:34 — "Target sentuh 44px — terukur sebelumnya 103×20."
src/styles/system/_wallet.scss:120 — "Label di atas oranye memakai putih penuh, tanpa opacity: menurunkannya ke 85% menjatuhkan kontras dari 3,36:1 ke sekitar 2,9:1 — menambah masalah pada pasangan yang sudah di bawah…" [4 baris]
src/types.ts:122 — "Jarak terukur dalam meter, untuk sort/filter "jarak" (PRD §6). `distance` tetap string tampilan ("420 m"); angka ini yang dibandingkan."
src/types.ts:156 — "Foto potongan transparan untuk chip kategori customer (keputusan pemilik 2026-10-18). Berkas di `public/assets/img/categories/`, 224px (2x kotak 112px). `icon` tetap dipakai…"
src/types.ts:199 — "Konfigurasi pengantaran merchant (F20/F16) — di produksi dihitung server, di repo ini hanya tampilan mock (AGENTS.md §1). Ongkir **100% milik merchant, 0% fee platform** (`C-07`)."
src/types.ts:213 — "Alamat apartemen. PRD mewajibkan gedung, lantai, dan unit karena pin GPS saja tidak cukup untuk kurir menemukan pintu."
src/types.ts:561 — "Subscription Web Push (R-PUSH-01, M8). Registrasinya **disimpan** ke tabel `push_subscriptions` (endpoint + kunci + waktu daftar). Service worker push sudah ada di…" [8 baris]
src/types.ts:681 — "Lantai & unit wajib — pin GPS saja tidak cukup untuk kurir (PRD bab 04)."
src/types.ts:716 — "Status tenant merchant. `pending` menunggu approval tim CS; `blacklisted` lahir dari aksi blacklist COD dan wajib dibarengi `riskFlag` customer (F15)."
src/types.ts:722 — "Deposit COD merchant (3,50 JOD, PRD §5C). Approve = verifikasi transfer dulu."
src/types.ts:858 — "Kewajiban platform = saldo wallet yang belum di-payout (view agregat, M9)."
src/types.ts:974 — "Role operator. `scope: 'sa'` = konsol ini; `scope: 'cs'` = panel CS (`/ops/*`). Akun CS dibuat SA (OQ-30, PO 2026-09-23), bukan self-service."
src/types.ts:1032 — "Laporan pajak aplikasi per periode (PO 2026-09-23). Dua objek berbeda: GST makanan ditanggung merchant atas penjualan (info-only), sedangkan PPh final 0,5% atas fee platform…"
src/types.ts:1042 — "Fee platform terkumpul (0,37 JOD/order), JOD."
src/types.ts:1044 — "GST atas objek fee platform (16%), JOD — belum dipungut (OQ-17)."
src/types.ts:1046 — "PPh final 0,5% atas fee platform, JOD."
src/types.ts:1093 — "Id tab antrean yang mewakili potongan ini, kalau ada padanannya. Dipakai legenda yang bisa ditekan: potongan donut tanpa jalan menuju daftar ordernya hanya bisa dilihat, tidak…" [7 baris]
src/types.ts:1161 — "Batch antrian order Regular kurir inhouse (§8). Maks 24 order (BR-B04)."
src/types.ts:1193 — "SP aktif; kelayakan antrian dispatch (OPEN-11)."
src/types.ts:1206 — "Alasan reject (COU-18)."
src/types.ts:1210 — "Mitra pengganti saat assignment kedaluwarsa (COU-17). Id mitra, bukan nama (nama bisa berubah). Pemilihan penggantinya milik `dispatch_courier()` (§9.4, OPEN-11); FE hanya…"
src/types.ts:1330 — "Boleh digabung promo lain (OPEN-23 untuk semantiknya)."
src/types.ts:1520 — "Bentuk (mis. "refund 50%") + formula nilai."
src/types.ts:1565 — "Rincian harga satu order dalam JOD (§16.3). `total` = S - Dm - Da + F + Pc + Ft. `Ft` (transaction fee 1,5%) hanya untuk QRIS; 0 untuk saldo DANA dan COD."
src/types.ts:1582 — "Transaction fee 1,5% (QRIS saja)."
```
