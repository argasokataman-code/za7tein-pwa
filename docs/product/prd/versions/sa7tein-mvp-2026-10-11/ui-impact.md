# Dampak UI & Flow: sa7tein-mvp-2026-10-11

Status: PROPOSED — dokumen kerja, **belum aktif**. Ditulis bersama `analysis.md` + `milestones.md`.
Tujuan: daftar kerja front-end (layar + flow) saat revisi `sa7tein-mvp-2026-10-11` diaktifkan, supaya tidak ada yang dikerjakan mendadak tanpa peta.

Legenda aksi: **UBAH** (layar/flow ada, isinya berubah) · **TAMBAH** (baru) · **HAPUS/GANTI** (tak relevan lagi) · **TETAP** (dipakai ulang tanpa perubahan berarti) · **REVIEW** (dampak belum pasti → `UNRESOLVED`).

Referensi: `analysis.md` (C-01..C-14 = konflik vs baseline), `milestones.md` (M0–M11), `docs/design/flows/INDEX.json` (24 flow sekarang), kode (`src/App.tsx`, `src/pages/`, `src/store/slices/`).

---

## 1. Ringkasan skala

PRD baru = **produk berbeda**, bukan tambal. Dari 24 flow yang ada: **1 tetap**, **18 berubah**, **5 perlu dihapus/ganti atau ditinjau**, plus **≥8 flow baru**. Dari 92 rute: mayoritas layar merchant, kurir, checkout, dan address berubah; customer discovery & beberapa halaman pendukung bertahan.

Pendorong perubahan terbesar (dari `analysis.md`):
1. **Kurir ganda** (inhouse batch + partner Quick) — C-01, C-02.
2. **Batch & antrian** — R-BATCH (§8).
3. **Coverage per merchant** (polygon/radius) menggantikan zona global Hijazi/Syimali — C-03.
4. **Uang**: fee Pc/Pm/Ft + settlement 3 kolom + delivery fee ke kurir — C-04, C-05.
5. **Langganan kuota** — C-06.
6. **Katalog + marketing ala Odoo** — C-07, C-08.
7. **COD tunai** (bukan hold) + **auth magic link** + **aplikasi ops PWA** — C-09, C-10, C-12.

---

## 2. Flow (`docs/design/flows/`)

| Flow (slug) | Basis sekarang | Aksi | Kenapa (requirement) |
|---|---|---|---|
| f1-order-lifecycle | R-COD-01, R-DELIV-01, R-TOPUP-01, R-FEE-01 | **UBAH BESAR** | Alur §7 baru: checkout → **cabang Regular (batch) vs Quick (partner)**; COD bukan hold; fee baru |
| f2-cod-hold | R-COD-01 | **HAPUS/GANTI** | COD = transaksi **offline tunai JOD**, bukan hold e-wallet (C-09). Ganti → flow "COD + kuota order COD" |
| f3-wallet-topup | R-WALLET-01, R-TOPUP-01 | **UBAH** | sa7tein tak menyimpan saldo; customer boleh bayar **tanpa akun DANA**; top-up jadi opsional/DANA (C-13) |
| f4-fee-tax | R-FEE-01, R-TAX-01 | **UBAH** | Fee Pc + Pm + **Ft 1,5% QRIS** + settlement 3 kolom (§16). Pajak/GST **tidak disebut** PRD baru → tandai `UNRESOLVED` |
| f5-delivery-verification | R-DELIV-01, C-09, C-10 | **UBAH** | OTP/checkpoint hilang dari alur baru → ganti **live tracking + batch + auto-sort** (§9.6, §9.7) |
| f6-cashout-payout | R-CASHOUT-01, R-WALLET-01 | **UBAH** | Payout **otomatis** ke DANA merchant & kurir saat order selesai (§16.4); cash-out customer `UNRESOLVED` |
| f7-ledger-liability | R-LEDGER-01 | **TETAP (prinsip)** | Ledger append-only + rekonsiliasi (NFR-02) selaras; isi detail menyesuaikan uang baru |
| f8-dispute | R-DISPUTE-01, C-12 | **UBAH** | Dispute **berbasis rule** (§18): merchant multi-select rule, kompensasi + punishment, SP sebagai punishment |
| f9-incentive | R-INCENTIVE-01, PO#7 | **REVIEW** | "Founding Merchant" tak ada di PRD baru; monetisasi pindah ke **kuota** (§17) → `UNRESOLVED`: dipensiunkan atau dipertahankan |
| f10-exchange-rate | R-CURR-01 | **UBAH** | Arah sama, tapi aturan pembulatan baru (tagihan ke atas ratusan, payout ke bawah) (§16.2) |
| f11-push-notification | R-PUSH-01 | **UBAH** | Event in-app + **web push**; daftar notifikasi per peran berubah (§20.3); WS ber-versi (NFR-06) |
| f12-merchant-console | C-06, C-07 | **UBAH BESAR** | Batch, coverage polygon/radius, kuota, katalog Odoo, marketing Odoo, kelola kurir inhouse (§11) |
| f13-courier-view | C-06, R-DELIV-01 | **UBAH BESAR** | Batch + **auto-sort** + pisah **inhouse vs partner** + approve/reject ber-alasan (§12) |
| f14-chat-order | C-18, C-12 | **UBAH** | Peserta dinamis (kurir gabung: partner setelah approve / inhouse setelah batch assign), gambar di R2 (§20.1) |
| f15-super-admin | C-12, R-DISPUTE-01 | **REVIEW** | PRD menyebut **aplikasi ops PWA terpisah** di balik Cloudflare Access (§13); Super Admin tak disebut → rekonsiliasi peran CS/SA/ops |
| f16-merchant-onboarding | PRD 5C deposit + Insentif | **UBAH** | Verifikasi merchant & kurir partner oleh **ops**; moderasi tag; akun DANA wajib (§5, §11) |
| f17-payment-dana | PO 2026-10-13, DEC-1039 | **UBAH** | Tambah **QRIS**, COD, **timer 30 menit**, tombol **simpan QR** (CUS-32), refund BI-FAST (§16.2, §7.4) |
| f18-order-state | C-17, DEC-1037 | **UBAH** | Enum status §7.5 + status **batch** + **pending refund** + state Quick (reject/cari pengganti) (OPEN-26) |
| f19-rating-review | BRS rating-review | **UBAH** | Rating **menu item tanpa variant**, tanpa review; merchant + review; tanpa moderasi (§20.2) |
| f20-address-zone | C-13, C-05, C-07 | **UBAH BESAR** | Zona global Hijazi/Syimali → **coverage per merchant** (polygon non-overlap **atau** radius, fee per unit) (§9.1) |
| f21-account-auth | source.md E.164, PO | **UBAH** | **Magic link saja**, satu email satu peran, **5 peran** (tambah kurir partner) (§5) |
| f22-super-admin-sa | PO 2026-09-23 | **REVIEW** | Sama seperti f15 — peran admin/ops harus direkonsiliasi dengan §13 |
| f24-cs-problem | BRS notif-order-e2e (proposed) | **REVIEW** | Panel CS vs ops PWA baru; BRS-nya sendiri masih `proposed` |
| f23-customer-discovery | *(tidak ada folder)* | **TAMBAH** | Discovery merchant-first + group per tag/filter/sort + sembunyi kuota (CUS-04..11) |

### Flow baru yang diminta PRD
| Flow baru (usulan slug) | Requirement |
|---|---|
| f25-batch-lifecycle | BR-B01..13, §8 (hitung mundur, ≤24, assign, tutup, mulai lebih awal) |
| f26-quick-dispatch | §7.3, §9.3, §9.4, §9.5 (reserve, approve/reject, cari pengganti, SP) |
| f27-auto-sort-route | §9.6, BR-B12/B13 (toggle, matriks 25×24, peringatan WALK) |
| f28-coverage-editor | §9.1 (polygon non-overlap, radius, fee per unit) — **dibangun (M4b), lihat `docs/design/flows/f28-coverage-editor/`** |
| f29-quota-subscription | §17 (kuota order + kuota COD, reserve/consume/prioritas, setting tanpa kuota) |
| f30-marketing-programs | §15 (loyalty Odoo, isStackable, pemilik program) |
| f31-live-tracking | §9.7 (lokasi realtime, "hampir sampai", ETA per urutan) |
| f32-ops-app | §13, ARC-10 (verifikasi, moderasi, config, dispute rule, analytics) |

> Catatan: setiap flow di atas wajib lolos `./scripts/flows-gate.sh <slug>` dan `docs/design/flows/INDEX.json` + `index.html` + `PLAN.md` diperbarui **di commit yang sama** (AGENTS §1, `governance:check`).

---

## 3. Layar per role

### 3.1 Customer (45 halaman)
| Layar | Aksi | Requirement | Catatan |
|---|---|---|---|
| Home, Search, Filter, MerchantPage, MenuDetail, Favorites, Reviews | **UBAH** | CUS-04..13, 28 | Group per tag, sort/filter baru, sembunyi merchant blok kuota; katalog attribute/variant; rating menu |
| Checkout | **UBAH BESAR** | CUS-14..20 | **Multi-cart per merchant**, rincian JOD (S/Dm/Da/F/Pc/Pm/Ft), pilih Regular/Quick, catatan per order+menu |
| PaymentSelection, PaymentDana, PaymentAmount, OrderPlaced | **UBAH** | CUS-19,20,32 | QRIS/DANA/COD, **timer 30 mnt**, **simpan QR**, kuota COD |
| OrderArrived, OrderChat, `OrderStageScreen` | **UBAH** | CUS-23,26, R-BATCH | Live tracking, chat peserta dinamis, state batch/Quick |
| DisputeSubmit | **UBAH** | CUS-30, §18 | Dispute berbasis rule |
| RatingDriver | **UBAH** | CUS-27 | Tambah rating menu item tanpa variant |
| WalletBalance / WalletTopUp / WalletPayout | **UBAH/REVIEW** | CUS-25, §16 | Saldo di e-wallet pihak ketiga; refund ke DANA/rekening; arah UI berubah |
| Profile, PersonalData, Security, dll | **TETAP** | — | Pendukung |
| Onboarding, SignIn, SignUp, Verification, CreatePassword, ForgotPassword* | **UBAH** | ACC-01,02 | Magic link, satu email satu peran |
| AddressSelection | **UBAH** | CUS-02,03, §9.1 | Coverage per merchant (polygon/radius), `AddressMapPicker` disesuaikan |
| Home (discovery), **layar group-tag baru** | **TAMBAH** | CUS-07 | Group hanya per tag |

### 3.2 Merchant (17 halaman)
| Layar | Aksi | Requirement | Catatan |
|---|---|---|---|
| MerchantDashboard | **UBAH** | MER-10..15 | Tambah batch, estimasi, packing |
| MerchantOrders | **UBAH BESAR** | MER-10..14 | Accept Regular → **pilih/ ciptakan batch**; accept Quick → **estimasi prepare**; packing; assign batch |
| MerchantMenu | **UBAH BESAR** | MER-05..08 | **M4c selesai:** kategori menu (MER-06, taksonomi ops/BE baca-saja, dipilih lewat dropdown) + toggle catatan per menu (MER-05); model attribute/value/variant Odoo + `price_extra` + exclusion + toggle ketersediaan 3 level (menu/nilai/variant) (MER-07/MER-08) di slice `catalogAttributes`, editor `MenuAttributeEditor`, selector pelanggan di `MenuDetail`. Logika murni ditahan `scripts/catalog-check.mjs` |
| MerchantPromos | **UBAH BESAR** | MER-09, §15 | Semua tipe loyalty Odoo + isStackable |
| MerchantSettings | **UBAH** | MER-01..03, MER-17 | **M4d:** profil toko (nama/nomor/alamat/foto) + **tag toko** (multi-pilih, maks 4, tag baru perlu moderasi ops) — keduanya state sesi karena BE belum punya endpoint tulis; setting "terima order tanpa kuota" (hanya saat tutup); pintu ke coverage |
| **Coverage editor** (baru) | **SELESAI** (M4b) | MER-04 | `/merchant/coverage` — polygon non-overlap ber-fee **atau** radius ≤2 km + fee/satuan; tulis BE belum ada (state aplikasi + notice). Flow `f28-coverage-editor` |
| **Langganan kuota** (baru) | **TAMBAH** | MER-17,18,19 | Beli kuota order / kuota COD (QRIS+DANA) |
| MerchantCouriers | **UBAH** | MER-16 | **M4e:** kelola kurir inhouse — tambah/ubah (nama+WA)/hapus, jam tugas, kuota `MAX_COURIERS_PER_MERCHANT`; hint bahwa ini kurir inhouse & penugasan per batch di Order. Rekrut partner oleh ops (M6) belum ada |
| MerchantWallet, MerchantPayout* | **UBAH** | MER-20 | Payout ke DANA, saldo |
| MerchantRebate | **REVIEW** | f9 | Insentif Founding `UNRESOLVED` |
| MerchantOnboarding, MerchantPending | **UBAH** | OPS-01 | Verifikasi oleh ops + tag moderasi |
| MerchantReviews | **UBAH** | §20.2 | Rating menu item |

### 3.3 Kurir (9 halaman)
| Layar | Aksi | Requirement | Catatan |
|---|---|---|---|
| CourierTasks, CourierTaskDetail | **UBAH BESAR** | COU-11..18 | **Batch** (inhouse) vs **single order** (partner); approve/reject ber-alasan; auto-sort toggle; live tracking |
| **Batch view + auto-sort** (baru) | **TAMBAH** | BR-B12/B13, §9.6 | Peta rute + **peringatan WALK (beta)** |
| **Assignment approve/reject** (baru) | **TAMBAH** | COU-18, §9.5 | Text area alasan, submit aktif setelah diisi |
| CourierTips / CourierWallet / CourierPayout* | **UBAH** | COU-09,14,16 | Fee Quick 100%; COD talangan; payout DANA |
| CourierProfile, CourierOnboarding, CourierSignIn | **UBAH** | ACC-03,04 | Partner daftar→verifikasi ops; inhouse dibuat merchant |
| **Status kurir partner** (baru) | **TAMBAH** | COU-15, §9.3 | offline/available/reserved/busy |

### 3.4 Panel CS /admin (5) + Super Admin (11)
| Layar | Aksi | Requirement | Catatan |
|---|---|---|---|
| Admin* (Dashboard, Onboarding, Disputes, Merchants, Ledger) | **UBAH/REVIEW** | §13, §18 | Rekonsiliasi peran: ops PWA terpisah? |
| SuperAdmin* (11) | **REVIEW** | §13, ARC-10 | PRD tak sebut Super Admin; cakupan SA lama `UNRESOLVED` |
| **Aplikasi ops PWA** (baru) | **TAMBAH** | OPS-01..15 | Verifikasi, moderasi tag, multiplier Quick, ambang notif, program aplikator, **rule dispute**, flat fee, paket kuota, **SP**, analytics (Workers Analytics Engine) |

### 3.5 Web plain
| Layar | Aksi |
|---|---|
| Landing, Documentation | **TETAP** (Documentation diperbarui saat aktivasi per AGENTS §10.7) |

---

## 4. Perubahan lintas-layar (structural)

| Aspek | Sekarang | Sesudah | File kunci |
|---|---|---|---|
| Peran | customer/merchant/courier/admin/SA | + **kurir partner**, + **ops** | `src/App.tsx`, `App.tsx:107 ROLE_BASES`, slice baru |
| Shell | 430px per role | + shell ops | `_app-shell.scss`, `BottomNav*`, `AdminShell` |
| Auth | Google/WA mock | **magic link** | `authSlice`, halaman Sign* |
| State | 14 slice | + batch, partner, quota, marketing, (refund) | `src/store/index.ts` (combineReducers + persist) |
| Uang | fee 0,15/0,22, ongkir→merchant | Pc+Pm+Ft, delivery fee→kurir, settlement 3 kolom | `src/types.ts`, `src/data/merchant.ts`, `Checkout` |
| COD | wallet hold + OTP | tunai, butuh kuota COD | `cartSlice` (buang hold), `f2-cod-hold` |
| Coverage | zona Hijazi/Syimali | polygon/radius per merchant | `src/data/zones.ts`, `AddressSelection` |
| Katalog | modifier minimal | attribute/variant Odoo | `src/types.ts`, `MerchantMenu`, `MenuDetail` |
| Marketing | promo tunggal | loyalty Odoo + isStackable | `cartSlice`, `MerchantPromos` |
| Peta | leaflet statik | rute WALK + auto-sort (Google Routes) | `AddressMapPicker`, batch view |
| Dokumentasi | `/documentation` | diperbarui | `src/pages/Documentation.tsx`, app-map |

---

## 5. Urutan kerja (ikuti milestone)

Sesuai `milestones.md`: **M0** domain + kontrak → **M1** discovery + katalog + cart → **M2** uang + bayar + refund → **M3** kuota + marketing → **M4** merchant + batch → **M5** kurir inhouse + auto-sort → **M6** kurir partner + dispatch → **M7** realtime + tracking + notif + chat → **M8** rating → **M9** dispute rule → **M10** ops → **M11** verifikasi lintas role.

Urutan flagship per layar miring: jangan sentuh flow di §2 sebelum M0 (tipe domain) selesai, karena hampir semua flow bergantung ke model baru.

## 6. Yang TIDAK berubah (reuse wajib — jangan gambar ulang)

`OrderStageScreen` / `JourneyLine` (turunkan state batch/Quick), UI kit (`FoodCard`, `AddToCartButton`, `FavoriteButton`, `BackButton`, `BottomSheet`, `ConfirmSheet`, `MerchantCard`, `DonutChart`/`BarChart`/`Sparkline`), shell 430px, `Wallet`/`Ledger`/`Currency*`, `AppErrorBoundary`, halaman pendukung (Profile, FAQ, HelpCenter, PrivacyPolicy, Security, Language).

## 7. `UNRESOLVED` yang menahan pekerjaan (jangan diisi tebakan)

Pajak/GST (tak disebut PRD baru) · insentif Founding (f9) · peran admin/SA vs ops (f15/f22/f24) · cash-out customer · OPEN-01 DANA · OPEN-26 enum status/ERD · OPEN-11 dispatch · OPEN-23 isStackable · OPEN-25 Global Index DO · OPEN-27 legal.

## 8. Dependency BE (temuan uji M1 & M2, 2026-10-15)

Diuji pada klon browser terhadap backend demo Supabase (`dwzxtnfesmpobnepilhl`):

- `merchants.delivery_config` (jsonb) **ada**: `{mode:"radius"|"area", activeZones, radiusMeters}`. Sudah dipetakan di `src/api/catalog.ts` → `distanceMeters` (Haversine dari `ui.origin`) dan `outOfCoverage` (mode radius: meter > radiusMeters). 9 merchant demo semuanya < 2000 m → tak ada yang nonaktif. **Tak ada endpoint tulis `delivery_config`** dan `activeZones` baru menyimpan nama zona (bukan polygon/`feePerUnit`), jadi editor coverage `/merchant/coverage` (f28, MER-04) menyimpan di aplikasi saja — tombol simpan ke server menunggu kolom polygon + izin RLS.
- **`merchants` tak punya kolom `tags`** → grup-per-tag (PRD §6) jatuh ke daftar datar dengan data live. Butuh kolom tag atau tabel `merchant_tags` (OPEN-25).
- **Tak ada sinyal "blok kuota order"** → aturan sembunyikan (PRD §17) tak berjalan dengan data live. Butuh tabel langganan kuota.
- `orderCount` (jumlah order) belum ada di BE → sort/filter "jumlah order" menunggu.

### Temuan M2 (uang, pembayaran, refund)

- **Refund belum ada di BE**: tabel `refunds` / `order_refunds` → HTTP 404, dan `src/api/orders.ts` tak punya endpoint refund. Tabel `wallet_ledgers` + `disputes` ada. Karena itu layar refund customer (`/customer/refund`) menampilkan alur §16.6 (saldo DANA / BI-FAST / pilih) **ditandai "belum tersedia"** dan tidak menulis apa pun; flag `REFUND_AVAILABLE` di `src/data/marketplace.ts` menutup jalurnya sampai endpoint ada.
- **`payment_methods` memakai key polos `qris`** (baris aktif, sort 4), bukan `xendit_qris`. Alias di `src/api/payments.ts` sudah ditambah (`qris → dana_qris`); sebelumnya baris itu dibuang sehingga QRIS hilang dari semua layar walau aktif di database.
- **`payment_methods` belum punya kolom kuota COD** → gate kuota COD (`codQuotaStatus`) memakai langganan kuota mock; merchant tanpa catatan langganan diperlakukan `unknown` (tidak diblokir) supaya data yang memang tidak ada tidak memblokir order.

### Temuan M3 (kuota + marketing)

- **Tak ada tabel kuota/langganan di BE**: `merchant_subscriptions`, `quota_subscriptions`, `subscriptions` → HTTP 404; `merchants` juga tak punya kolom kuota (`quota_order_balance`/`quota_cod_balance`) maupun `accept_without_quota`. Akibatnya model kuota §17 (reserve/consume/return + blokir browse) hanya hidup dari seed mock `mockQuotaSubscriptions` yang memakai **id toko mock** (`am-1`, `am-4`), sementara id merchant live berupa angka (`1`..`9`) — jadi **aturan blokir tidak aktif dengan data live**. Terverifikasi hanya lewat seed manual (9→8 kartu). Pembelian kuota (layar M3b `/merchant/subscription`) sudah dibangun tetapi ditandai **belum tersedia** (`QUOTA_PURCHASE_AVAILABLE`) sampai tabelnya ada.
- **Program marketing ala Odoo (§15) tak punya endpoint**: `loyalty_programs`, `marketing_programs` → 404; yang ada hanya tabel `marketing` (promo/diskon, dipakai `MerchantPromos` + `validatePromo`). Tipe domain program/rule/reward/card sudah ada di `src/types.ts`, tapi tanpa tabelnya program loyalty/promo-code per-merchant tak bisa disimpan — M3c ditandai sesuai ketersediaan. **Model + tampilan customer jalan** (`src/data/marketing.ts`, `useProgramDiscount`, daftar di halaman toko); yang belum: layar merchant untuk **menyimpan/membuat** program (tanpa tabel) — saat dibangun, tombol simpannya ditandai belum tersedia.
- **`merchants.tier` ada** (`free`/`pro`-style) tetapi tak dipakai untuk kuota; kuota §17 bukan tier.
- **Tak ada endpoint tulis profil toko**: `reference.ts` hanya punya **baca** profil (`fetchMerchantProfile`) + patch `merchants` untuk **status buka/tutup**; tak ada penulisan `store_name`/`store_phone`/`store_address`/foto, dan `src/api/` tak punya unggah berkas. Layar Setelan toko (merchant) karena itu menandai bahwa perubahan hanya berlaku di sesi ini (sebelumnya menampilkan "Setelan toko disimpan" — pesan sukses palsu). Wiring tulis = pekerjaan lanjutan bila BE menyediakan kolom + izin RLS-nya.

### Temuan M4 (batch + jenis pengantaran)

- **`orders` belum punya kolom jenis pengantaran** (Regular vs Quick). Datanya diuji langsung: `?select=*` tak memuat kolom semacam `delivery_type`/`type`. Supaya kedua cabang benar-benar terlihat, `src/api/orders.ts` memetakan lewat **overlay demo per kode order** (`MOCK_ORDER_DELIVERY_TYPE` di `src/data/merchantOrders.ts`, default `regular`). Begitu kolomnya ada, ganti satu baris itu dengan `row.delivery_type`.
- **Tak ada tabel batch di BE** (`batches`, `order_batches` → 404). Siklus batch (status, hitung mundur, `courier_id`, `auto_sort`, `route_order`) karena itu hidup di Redux (`batchSlice`) + persist, **bukan** di BE — jadi batch hilang bila state persist dibersihkan, dan kurir inhouse lain tidak melihatnya. Butuh tabel batch + `orders.batch_id` untuk lintas peran (M5).
- **Semua tulis ke `orders` ditolak RLS/grants**: `PATCH`/`POST /rest/v1/orders` dengan token `authenticated` mengembalikan `42501 permission denied for table orders` (hint: `GRANT SELECT ON public.orders TO authenticated`). Artinya `updateOrderStatus()`/`markOrderPaid()`/`createOrder()` **tidak pernah menulis apa pun** dengan data live — semuanya best-effort (`.catch(() => {})`) dan perubahan status hanya terlihat di sesi ini. Butuh policy + grant tulis di BE.
- **Dispatch kurir partner (§9.4) belum ada endpoint** → order Quick yang sudah diterima merchant menampilkan tombol "Serahkan ke kurir partner" **mati** + alasan "belum tersedia (M6)"; flag `QUICK_DISPATCH_AVAILABLE` (`src/data/marketplace.ts`) menutup jalurnya sampai ada.

Konsekuensi: alur batch terverifikasi di browser (accept Regular → batch baru, packing, tutup lebih awal, assign kurir, mulai lebih awal; accept Quick → estimasi prepare) memakai respons `orders` yang disuntik di tab uji, karena BE menolak tulis dan tak punya kolom jenis pengantaran.

Konsekuensi: `Home` tetap rapi dengan data live (9 kartu, `overflowX` 0, shell 430px, gate `--strict --click` lolos 390/1440), tetapi efek discovery baru **tidak terlihat** sampai kolom di atas ada. Logika murni (`groupStorefrontsByTag` / `isSelectable` / `visibleStorefronts`) terverifikasi lewat `node scripts/discovery-check.mjs` + mock fallback.

### Temuan M4c (katalog + kategori) — bahan API spec

- **Kategori menu belum punya tabel/endpoint di BE.** Kategori = **taksonomi ops/BE** (keputusan PO 2026-10-16, atlas `DEC-88104`): merchant tak mengelolanya, hanya memilih. Di BE saat ini `menus` hanya punya kolom **teks bebas** `category`, yang dipetakan ke 4 id tetap lewat heuristik `foodBucket()` (`src/data/catalog.ts`) — tak ada tabel entitas kategori maupun endpoint daftar. Karena itu `catalog.categories` **baca-saja** dari seed modul (`data/catalog`), tanpa CRUD.
- **Yang perlu ditambah ke API spec:** `GET /menu-categories` (daftar taksonomi, dibaca merchant & customer untuk grouping) + jalur tulis **ops** (`POST`/`PATCH`/`DELETE`, mis. di konsol SA/CS) bila ops mengelola kategori. Merchant hanya **baca**. Sekaligus putuskan: `menus.category` pindah dari teks bebas ke **FK kategori** (`category_id`) supaya grouping tak lagi bergantung heuristik nama.
- **Di FE:** begitu endpoint ada, ganti sumber seed di slice `catalog` (`categories`) dengan respons BE — UI tak berubah (dropdown item form + chip filter + grouping sudah membaca `selectCategories`).
