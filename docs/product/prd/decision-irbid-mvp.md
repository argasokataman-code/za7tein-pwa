# Keputusan sumber produk: Irbid MVP

- ID: `irbid-mvp-v2-2026-09-21`
- Sumber: `versions/irbid-mvp-v2-2026-09-21/source.md` (draft PO 2026-09-21, status dokumen: menunggu validasi user & konsultan pajak).
- Analisis: `versions/irbid-mvp-v2-2026-09-21/analysis.md` (REVIEWED). Milestone: `versions/irbid-mvp-v2-2026-09-21/milestones.md` (M0–M11).
- Menggantikan: `irbid-mvp-2026-09-12` (kini `superseded`), yang sebelumnya menggantikan `radius-mvp-legacy`.
- Alasan: v2 memuat keputusan PO terbaru yang mengubah model inti — payment gateway Xendit (bukan Midtrans), fee flat 0,37 JOD (merchant 0,15 + customer 0,22), tiga wallet tertutup, COD via hold e-wallet + settle OTP, ledger double-entry append-only, pajak dua lapis (GST Jordan + fee platform), dispute super admin, verifikasi kirim 4 checkpoint + OTP + SLA, Web Push + fallback WhatsApp, dan insentif Founding Merchant. IDR jadi settlement penuh, JOD display-only; Wise dibatalkan.
- Batas implementasi: UI/UX mock saja menurut AGENTS.md. Xendit, GPS polling, push, cron, ledger server, OTP, dan enforcement backend menjadi state demo dan kontrak handoff. Tidak ada backend, pembayaran, atau auth sungguhan.
- Status kode: **belum dimigrasikan** ke v2. IDR-only, radius A/B/C, kuota free tier, dan transfer manual tetap ada sebagai legacy implementation, bukan keputusan produk aktif.
- Ketidakpastian: 27 item `UNRESOLVED` di `analysis.md` (OQ-2–30 + insentif I-1–I-6), termasuk blocker milestone: fee cash-out (M3, OQ-22), sign-off pajak (M7, R-TAX-01), interpretasi insentif I-1/I-2 (M10), dan validasi push di device (M8). Tidak diselesaikan dengan tebakan.

Jika pemilik produk menyatakan dokumen lain lebih otoritatif, ubah manifest dan catat keputusan pengganti. Jangan menimpa dokumen keputusan ini tanpa jejak.

## Riwayat keputusan

### Provider pembayaran & disbursement: DANA — 2026-10-13 (keputusan PO)

- **DANA Enterprise menggantikan Xendit sebagai satu-satunya payment gateway + disbursement.** Midtrans
  (revisi v1) dan Xendit (revisi v2) keluar dari rencana, begitu juga **transfer manual** (legacy
  `radius-mvp-legacy`).
- **Alasan:** onboarding sandbox sudah tuntas dan terverifikasi nyata, bukan asumsi — SNAP hidup,
  Payment Gateway 49/49, Widget/IPG Cashier Pay (inti) lolos, Disbursement kasus positif lolos,
  Merchant Management `queryShop`/`queryDivision` terverifikasi. Bukti mentah: `docs/integration/dana/`.
- **Pemetaan produk DANA:** bayar pesanan → Payment Gateway (`createOrder`) + IPG Cashier Pay/Widget;
  saldo & top-up → QRIS/VA/DANA balance; bayar merchant & kurir → Disbursement; data toko/divisi →
  Merchant Management. Empat jalur ini menggantikan peran `PaymentMethodId`/`TopUpChannel`/`Payout`
  yang sebelumnya menunjuk Xendit.
- **Batas:** ini keputusan **rencana/kontrak**, bukan penambahan lapisan API di repo. Repo tetap UI mock;
  DANA tidak menambah lapisan API di repo ini (AGENTS §1: ketiadaan integrasi itu keputusan sadar).
- **UNRESOLVED:** **model settlement** — A satu merchant + Disbursement (Sa7tein kustodian) atau
  B sub-merchant/split settlement (bukan kustodian); ini keputusan bisnis/regulasi, jangan dikarang
  (analisis di `docs/integration/dana/README.md` §3).
- **Nama Xendit dihapus (2026-10-13, lanjutan keputusan ini — menutup pertanyaan terbuka sebelumnya).**
  Flow `f17-payment-xendit` → `f17-payment-dana`, dan penamaan di tipe/data/layar
  (`PaymentMethodId`, `TopUpChannel` → `dana_va`/`dana_qris`, `xenditBalance` → `danaBalance`),
  dokumentasi, dan `/documentation` berganti ke DANA. Satu-satunya sisa literal `xendit_*` adalah
  **nilai string yang dikirim ke kolom backend** (`OUT_PAYMENT` di `src/api/orders.ts`) dan mapping
  cart lama di `src/store/index.ts`, sampai BE memperbarui `orders_payment_method_check`
  (`docs/integration/dana/be-contract.md` D2). Dokumen versi PRD
  (`versions/irbid-mvp-v2-2026-09-21/*`, `source.md` ber-sha256) sengaja tidak disentuh — keputusan ini
  yang berlaku untuk penamaan.
- **Debt terkait (selesai di commit ini):** `docs/design/flows/f17-payment-dana/*` +
  `flows/INDEX.json` + `flows/index.html` + `API-SPEC.md`, `src/types.ts`, `src/data/*`,
  `src/api/orders.ts`, `src/pages/*` + `/documentation`, `docs/design/app-map/*`. Flow lolos
  `./scripts/flows-gate.sh <slug>`.

### Periode tier insentif (I-4) — 2026-10-10 (keputusan PO)

- **Periode tier = bulan kalender** (`rebate_period` `YYYY-MM`, `currentPeriod()`), dan **tier dinilai/dibuka tiap akhir bulan**.
- **Naik tier di tengah bulan tidak proporsional**: yang berlaku adalah tier pada akhir bulan; ambang yang terlewati di tengah bulan tidak memberi cashback prorata.
- Menutup **I-4** (di `source.md` §Belum final dan `analysis.md`). I-5 (kuota Founding) tetap UNRESOLVED.

### Model status pesanan 5 tahap (EDISI 01) — 2026-10-09 (keputusan PO)

- **Journey pesanan memakai 5 tahap kanonik** dari Figma Patterns EDISI 01: `Baru → Disiapkan → Siap → Diantar → Selesai` (`OrderStage`). Ini **lapisan tampilan** di atas state machine backend `f18-order-state` (enum 8 state tetap): Baru=`quotation`, Disiapkan=`prepare`, Siap=`waitingCourier`, Diantar=`waitingDelivery`/`delivery`, Selesai=`done`.
- **`MerchantOrderStatus` tetap lebih kaya**: `diterima` (merchant terima, sebelum dapur mulai) dan `tiba` (kurir sampai, menunggu OTP) jadi sub-state operasional tanpa simpul Journey Line; `ditolak`/`batal` = terminal batal.
- **Dasar**: Figma “sa7tein / Patterns”, bagian “Aturan konsistensi” — *"New → Preparing → Ready → Diantar (Info) → Delivered. Cancelled terminal, tampilkan alasan. Jangan tampilkan 'Terkirim' sebelum konfirmasi. Ready bukan 'Sudah dibayar'."* Label tampilan memakai bahasa Indonesia.
- Aturan format ikut EDISI 01: Rupiah `Rp28.000` (tanpa spasi/desimal), pecahan/rating pakai koma (`4,9`), ETA rentang menit, waktu lokal `13.42`.

### Onboarding tiap peran — 2026-09-25 (keputusan PO)

- **Setiap peran punya layar onboarding sendiri.** Customer `/customer/onboarding` (sudah ada), merchant `/merchant/onboarding` (form profil toko = langkah `profil` flow `f16`), kurir `/courier/onboarding` (profil + kendaraan), panel admin punya antrean `/admin/onboarding` (approval tenant). Layar onboarding bukan fitur opsional.
- **Merchant:** `signup` → **form profil toko** → submit → `/merchant/pending`. Sebelum keputusan ini submit signup hanya no-op dan form profil toko tidak ada. Form menyimpan identitas toko (`storeName`/`storePhone`/`storeAddress`) + `deliveryConfig` (mode area/radius, `maxKm`, zona aktif, ongkir).
- **Kurir:** profil dilengkapi sebelum masuk lalu `/courier/signin`. Ini **menyimpang** dari `f16` yang menyebut kurir hanya "direkrut off-app" setelah toko aktif. Rekrutmen tetap milik merchant (C-06); layar onboarding kurir tidak mengubah siapa yang memperkerjakan.
- **State mock, ditaruh di slice yang benar:** `deliveryConfig` → `merchantSlice.deliveryConfig`; profil kurir → `courierSlice.onboarding` (tipe lokal slice). Keduanya tidak dipersist.
- **Masih `UNRESOLVED`:** tarif per-jarak (`feeByDistance`) vs per-area (`feeByArea`) — form hanya menyimpan `ongkirIdr` yang sudah ada; mekanisme verifikasi deposit tetap seperti catatan `f16`.

### Lokasi state insentif merchant — 2026-09-23 (keputusan implementasi)

- **Menyimpang dari kolom Mock state M10** `milestones.md` yang menulis `walletSlice`: modal 5 JOD dan cashback tier hidup di **`merchantSlice.credit`**.
- Alasan: `walletSlice` adalah wallet **customer** (M3). Satu slice untuk dua pemilik uang yang berbeda membuat batas aktor kabur — layar customer bisa membaca uang merchant, dan guard role di repo ini bersandar pada nama slice.
- Nama field tetap mengikuti kontrak BE (`merchant_credit_balance`, `rebate_tier`, `rebate_period`, `rebate_amount_jod`, `rebate_paid_at`), jadi perpindahan ke backend tidak mengubah nama.
- Kolom Mock state M10 di `milestones.md` sudah dikoreksi di commit yang sama; detailnya di `/documentation` bagian 31.

### Panel CS dapat layout desktop — 2026-10-11 (keputusan PO)

- Konsol `/admin/*` (panel CS) **tidak lagi phone-only**. PO memutuskan: "admin cs perlu dekstop juga seperti super admin" — CS memakai laptop untuk pekerjaan berat meja (antrean sengketa, ledger, master tenant).
- **Bentuk:** dari lebar **901px** ke atas konsol beralih ke layout desktop — rail sidebar 248px + area konten selebar jendela — mengikuti pola konsol Super Admin. Di bawah 901px tak berubah: kolom 430px + bottom nav, murni PWA. Satu pohon komponen melayani keduanya (sidebar dan bottom nav saling menggantikan lewat media query), jadi tidak ada jalur layout kedua yang harus dijaga.
- **Pengecualian lebar terdokumentasi.** Ini menyusul keputusan 2026-09-23 yang menahan shell lebar untuk panel ini: kini pengecualian itu **disetujui** dan dicatat di `docs/design/DNA.md` + `/documentation` §14, sesuai AGENTS §9. `docs/plan-admin.md` (prinsip "shell 430px") dan flow `f15-super-admin` diperbarui di commit yang sama.
- **Bukan Super Admin.** Batas peran tidak berubah: layout desktop adalah kemasan, bukan penambahan kewenangan. CS tetap menjalankan approval tenant, putusan sengketa level-1, dan blacklist COD; master zona, role/permission, pajak, saldo keuntungan, dan kill switch tetap milik Super Admin (keputusan 2026-09-23).

### Klarifikasi peran konsol: Panel Admin (CS) vs Super Admin — 2026-09-23 (keputusan PO)

- **Menggantikan sebagian `C-12`** (`analysis.md`): kalimat *"Portal keeps the name 'CS' and doubles as super admin"* **tidak lagi berlaku**. Konsol `/admin/*` adalah **panel admin platform yang dikelola CS** (approval tenant, deposit gate, dispute queue, liability, ledger, blacklist COD), dan **Super Admin adalah role terpisah**.
- **Super Admin** akan berupa **website penuh (non-PWA)** — bukan kolom ponsel 430px — dipakai owner & team untuk **kontrol penuh platform** (termasuk pajak dan dashboard). Cakupan detail dan prefix belum diputuskan → `UNRESOLVED`, jangan dikarang. Catatan prefix yang disiapkan: `/superadmin`.
- **Yang sudah dibangun**: panel admin (CS) di `/admin/*` = isi `F15` + `F8` + `M6/M9`, shell 430px seperti role lain. Label "Super Admin" pada konsol ini **salah** dan sudah dikoreksi.
- **Yang belum**: konsol Super Admin (full website). Tidak ada route/manifest untuknya sampai cakupannya diputuskan.
- Efek lanjutan: teks yang menyebut "Super Admin" sebagai **pihak operasional** (review onboarding, alert SLA) kini merujuk **tim CS**, sesuai pembagian ini. `OQ-30` (siapa super admin operasional) menyempit jadi: siapa operator CS, dan siapa pemilik konsol Super Admin.

### Resolusi UNRESOLVED — 2026-09-23 (info PO)

Empat pertanyaan yang sebelumnya `UNRESOLVED` ditutup. PO menandai ini info sementara, jadi kalau berubah, catat penggantinya di sini.

- **I-6 — sisa modal 5 JOD kalau merchant berhenti: HANGUS.** Modal adalah kredit digital yang memang tidak bisa dicairkan; diberhentikan sama seperti aktivasi/kredit gratis lain. Tidak jadi utang, tidak di-refund.
- **I-3 — cashback tier: non-withdrawal.** Cashback masuk dompet deposit merchant tapi **tidak bisa di-WD** — hanya untuk pemakaian di dalam aplikasi (memotong fee order berikutnya). Sama seperti modal, bedanya hanya sumbernya (volume penjualan, bukan grant awal).
- **OQ-30 — operator CS: dibuat oleh SA.** SA yang membuat akun operator CS, dan **role/permission-nya ditentukan SA** sesuai kebutuhan. Tidak ada self-registration operator. (Jumlah admin & pembagian izin konkret = keputusan operasional SA, bukan blocker produk.)
- **OQ-29 — window dispute 24 jam + kategori + SLA resolusi: dipakai sementara.** Diterima apa adanya sampai volume sengketa >5/bulan, sama seperti `OQ-13`. Kategori tetap placeholder yang wajar, bukan daftar final.

Konsekuensi kode: label "non-withdrawal" di dashboard merchant kini berlaku untuk modal **dan** cashback (sebelumnya cashback masih ditandai terbuka di I-3).

### Cakupan Super Admin — 2026-09-23 (keputusan PO)

Melengkapi klarifikasi peran di atas. Super Admin = **website penuh non-PWA** (prefix `/superadmin`), lapisan di atas panel CS. Cakupan yang disetujui PO:

- **Master zona** — SA mendefinisikan area/poligon Hijazi & Syimali secara global; merchant hanya mengaktifkan (`is_active_hijazi` / `is_active_syimali`). Flow `f20` sudah merujuk master zona ke `f15`.
- **Manajemen role & permission penuh** — operator CS vs SA, multi-admin.
- **Audit trail** semua aksi (SA maupun CS).
- **Laporan pajak aplikasi** — GST makanan + PPh final 0,5% atas fee platform.
- **Saldo keuntungan platform** — SA menerima **saldo bersih keuntungan aplikasi** (fee 0,37 JOD/order dikurangi biaya), dan itulah satu-satunya dana yang bisa di-withdraw SA sebagai pemegang platform. Ini **bukan** dana user: saldo customer/merchant/tips tetap liability.
- **Kill switch / mode maintenance** — mis. hentikan COD, hentikan payout, mode maintenance.
- **Monitoring ledger detail** merchant & customer (read-only).
- **Audit trail + jalur banding sengketa** — putusan sengketa level-1 tetap di CS; SA mengawasi lewat audit trail dan menangani banding.

**Bukan tugas SA:** top-up dan payout customer/merchant berjalan **self-service oleh sistem** — bukan approval SA. SA hanya memantau ledger mereka.

**Batas panel CS (diputuskan PO 2026-09-23):** CS **menjalankan** approval tenant, putusan sengketa level-1, dan blacklist COD — semuanya sudah dibangun di `/admin/*`. CS **tidak** mengonfigurasi platform: master zona, role & permission, pajak aplikasi, saldo keuntungan, dan kill switch milik SA. SA mengawasi kerja CS lewat audit trail dan menangani banding.

**Yang tidak dibangun di konsol SA (dicatat 2026-09-23, bukan keputusan):**

- **Auth Super Admin tidak ada.** Konsol `/superadmin` tidak punya login. Siapa pun yang membuka URL-nya bisa mengubah kill switch dan menarik saldo keuntungan. Ini mengikuti pola repo (AGENTS.md §1: autentikasi sungguhan di luar lingkup; panel CS juga tanpa auth), tetapi konsekuensinya lebih berat karena konsol ini memegang kontrol platform. Di produksi wajib ada auth + audit login. Status: `UNRESOLVED-by-absence` — PRD aktif tidak memuat requirement auth SA.
- **Export laporan pajak tidak ada.** Cakupan menyebut "laporan pajak aplikasi" tanpa menyebut format ekspor (CSV/PDF), periode fiskal, atau penerima laporan. Layar SA menampilkan laporan per periode; ekspor ditandai `UNRESOLVED` supaya tidak dikarang.
- **Aturan banding belum lengkap.** Siapa yang boleh mengajukan banding (pengaju sengketa saja atau kedua pihak) dan apakah ada window/SLA banding belum diputuskan. Kode saat ini: hanya pihak pengaju sengketa, tanpa window. Status: `UNRESOLVED`.

**UNRESOLVED lanjutan:** OQ-30 (siapa operator, jumlah admin), jadwal settlement, provider kurs (OQ-26/28), tarif pajak final.

### Registri pengguna — 2026-09-23 (keputusan PO)

Audit konsol SA menemukan sebab kenapa SA bisa melihat **uang** (ledger, pajak, keuntungan) tetapi tidak bisa melihat **orang**: bukan UI-nya yang kurang, tetapi **tidak ada pendataan pengguna sama sekali**. Customer dan merchant hanya ada sebagai satu objek contoh milik sesi yang sedang login, nama customer hidup sebagai string di 20 field order, sengketa hanya menyimpan nama pihak, dan `LedgerEntry` tidak punya field pihak — padahal cakupan di atas menjanjikan "monitoring ledger **detail merchant & customer**", yang berarti janji itu tidak bisa dipenuhi dari data yang ada.

Keputusan PO:

- **Platform menyimpan registri pengguna.** Customer menjadi entitas bertipe (`Customer`, `src/data/people.ts`); merchant menjadi registri (`MerchantRecord`, `src/data/merchant.ts`) yang menggantikan `AdminMerchant` dan berbagi id dengan `mockMerchant`; kurir tetap daftar (`Courier`) dengan `merchantId`. Semuanya punya id.
- **Rujukan antar-modul pindah dari nama ke id.** Order, tugas kurir, ulasan, sengketa, ledger, dan audit menunjuk id, bukan nama tampilan. Tanpa ini tidak ada satu pun pertanyaan per-pengguna yang bisa dijawab.
- **Audit dapat `actorId`.** Sebelumnya hanya nama pelaku (`actor`), sehingga baris audit tidak bisa ditautkan ke akun operator. `target` **masih** string tampilan — taksonomi target belum ada di PRD, ditandai `UNRESOLVED`.
- **Konsol SA mendapat satu layar registri** (`/superadmin/users`, izin `user.read`): customer, merchant, dan kurir, **read-only**. Mengubah status pengguna tetap kerja panel CS; SA mengawasi lewat audit trail. Satu pengecualian ditambahkan pada revisi di bawah: status tenant merchant bisa diubah dari dossier, lewat izin terpisah.
- **Daftar kurir lintas merchant diizinkan untuk pengawasan.** Ini **menyimpang** dari `source.md:296` ("deposit, holding earnings, blacklist kurir = tanggung jawab merchant, bukan platform"). Yang berubah hanya **visibilitas** bagi SA; deposit, earnings, dan blacklist kurir tetap milik merchant, dan mengelola kurir **bukan** kewenangan SA.
- **Status live kurir bukan milik SA.** Kolom status realtime (`Di toko` / `Mengantar` / `Offline`) dan beban order berjalan **dihapus** dari registri SA: itu papan pantau merchant atas kurirnya sendiri (`/merchant/couriers`). Registri SA menyimpan identitas kurir, siapa yang mempekerjakan, dan sejak kapan; pengawasan lintas merchant dibaca dari agregat per merchant (jumlah kurir), bukan dari keadaan sesaat.
- **Registri punya dossier per merchant.** Tiap baris merchant di `/superadmin/users` membuka `/superadmin/users/merchant/:id`: identitas usaha, keadaan tenant (status, deposit, zona aktif, COD bermasalah), kurir yang dipekerjakan, sengketa, uang di ledger, dan alert SLA. Alasannya: pengawasan berhenti di angka agregat — "berapa sengketa" tanpa "sengketa apa, uangnya masuk entry mana" tidak bisa ditindaklanjuti.
- **SA berwenang mengubah status tenant** (keputusan PO 2026-09-23, **merevisi** butir "dossier read-only" di atas). Suspend dan aktifkan kembali dijalankan dari dossier lewat izin baru `tenant.status` (grup `platform`, jadi pemilik platform memilikinya dan `sa_ops` tidak), dan tercatat di audit trail **atas nama operator SA yang aktif** — bukan atas nama CS, karena tombolnya sama dengan tombol CS tetapi pelakunya berbeda. Alasan revisi: SA adalah pemegang platform, dan menahan tenant yang bermasalah adalah keputusan pemilik, bukan hanya kerja operasi. **Yang tetap milik CS:** approval onboarding dan blacklist COD. Blacklist menandai dua sisi sekaligus (merchant + `riskFlag` customer), jadi mencabutnya harus menyentuh keduanya. Batas itu dijaga di kode, bukan hanya di dokumen: `reinstateMerchant` hanya menerima status `suspended` (menolak `blacklisted`), dan konsol SA tidak punya tombol blacklist.

**UNRESOLVED dari keputusan ini:** taksonomi target audit (`AuditEntry.target` masih string), dan apakah customer/merchant boleh masuk lewat Google (sisa OQ-24).

### `irbid-mvp-2026-09-12` (superseded oleh v2, 2026-09-22)

- Sumber: `versions/irbid-mvp-2026-09-12/source.pdf`, halaman 1–12.
- Menggantikan: `versions/radius-mvp-legacy/source.pdf`, halaman 1–8.
- Alasan: dokumen Irbid memuat target pasar, alur end-to-end, FR, SLA, dan KPI yang lebih baru/rinci. Kedua berlabel v1.1; karena itu versi dokumen saja tidak dapat dipakai untuk mengurutkan.
- Batas implementasi: Integrasi Midtrans, GPS polling, chat server, push, cron, disbursement, dan enforcement backend menjadi state demo dan kontrak handoff.
- Status kode saat itu: **belum dimigrasikan**; IDR-only, radius A/B/C, kuota free tier, dan transfer manual tetap ada sebagai legacy implementation.

### `radius-mvp-legacy` (superseded oleh 2026-09-12)

- Sumber: `versions/radius-mvp-legacy/source.pdf`, halaman 1–8.
- Scope: Indonesia, IDR, radius A/B/C, COD dan transfer manual, free tier.
