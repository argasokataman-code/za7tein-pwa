# AGENTS.md — Sa7tein PWA

Panduan untuk siapa pun yang menyentuh repo ini, manusia atau agen.

---

## 1. Repo ini apa, dan apa batasnya

**Showcase UI/UX dan design system.** Semua yang ada di sini adalah **front-end**.

Yang **tidak** dikerjakan di repo ini, dan jangan dimulai di sini:

- Backend, API, database, atau skema tabel
- Autentikasi sungguhan — login tidak memverifikasi apa pun
- Pembayaran sungguhan — COD dan transfer manual hanya alur layar
- Service worker untuk Web Push — PWA-nya jalan, tapi push tidak

**Semua data adalah mock.** Isinya di `src/data/`, state-nya di Redux. Kalau sebuah aturan bisnis dari PRD tampak butuh logika, di sini ia jadi **state yang ditampilkan**: kuota `7 / 10` bukan counter yang harus benar, "Ditugaskan otomatis" bukan algoritma.

PRD produk diregistrasi di `docs/product/prd/manifest.json`. Sumber PRD aktif ada di `docs/product/prd/versions/`; revisi aktif `irbid-mvp-v2-2026-09-21`, menggantikan `irbid-mvp-2026-09-12` yang kini `superseded` (dan `radius-mvp-legacy` sebelumnya). Repo ini mengerjakan **tampilannya**. Aturan lama di bawah yang menyebut A/B/C, kuota free tier, dan transfer manual menjelaskan **kondisi kode saat ini**, bukan requirement aktif.

**Sebelum setiap tugas produk:** baca manifest, sumber PRD aktif, `docs/product/prd/decision-irbid-mvp.md`, dan `docs/design/DNA.md`. Jangan mengambil aturan bisnis dari nama file, komentar lama, atau atlas tanpa mengecek PRD aktif. Jika PRD/BRS baru masuk `docs/product/prd/inbox/`, jalankan alur intake di `docs/product/prd/README.md`; dokumen baru berstatus proposed sampai keputusan aktivasi tertulis. Requirement yang tidak jelas wajib ditandai `UNRESOLVED` dengan sumber, bukan diisi dengan tebakan. Milestone dibuat dari requirement bersumber dan dependensi, bukan sekadar daftar layar.

**Wajib ikut PRD dan flow.** Sebelum mengubah perilaku, baca PRD aktif **dan** peta flow yang sudah ada: `docs/design/flows/INDEX.json` (indeks + basis requirement per flow) dan flow yang relevan di `docs/design/flows/<slug>/` (spec `*.json` + `README.md`). Flow menggambarkan layar dan state yang dijanjikan PRD — jangan merancang ulang alur yang sudah ada. Kalau perubahan memang menyimpang dari flow, itu bukan alasan mengabaikannya: tandai `UNRESOLVED` dengan sumber, lalu **update flow dan PRD di commit yang sama**. Perubahan yang menyentuh sebuah flow wajib lolos `./scripts/flows-gate.sh <slug>` (atau `--all`); script itu menangani `deliver` + `visual-check` dan membuang artefak berat. `npm run governance:check` (jalan di pre-commit) menolak commit kalau folder flow tidak cocok dengan `INDEX.json`, spec/README hilang, atau flow tidak lagi terikat ke revisi PRD aktif.

**Setiap perubahan UI:** baca `docs/design/DNA.md` dan audit terbaru di `docs/design/`. `legacy-debt.json` adalah batas maksimum SVG inline per file; ikon fungsional baru harus Lucide. Kinerja layout terbaru tercatat di `docs/design/audit-2026-09-12.md`, tetapi pengukuran ulang tetap wajib untuk layar yang disentuh.

---

## 2. Stack & perintah

| Area | Pilihan |
|---|---|
| Build | Vite + TypeScript |
| UI | React 19 + `react-router-dom` |
| Gaya | SCSS, satu bundel di `src/styles/` |
| State | Redux Toolkit + `redux-persist` (`cart`, `favorites`, `accountSetup`) |
| Form | `react-hook-form` + `zod` |
| Ikon | `lucide-react` |
| Peta | `leaflet` + `react-leaflet` |
| PWA | `vite-plugin-pwa` |

```bash
npm install --include=dev   # tanpa flag ini devDependencies bisa terlewat
npm run dev                 # http://localhost:5173
npm run build               # tsc -b && vite build
npm run lint                # oxlint
```

**⚠️ Jangan pernah pakai `rtk lint` / `rtk tsc` / wrapper `rtk *`.** `rtk` adalah CLI proxy global (Homebrew, `/opt/homebrew/bin/rtk`) yang membungkus ESLint/tsc — bukan alat repo ini dan rusak di sini (output JSON parse error). Verifikasi Wajib pakai script npm: `npm run lint` (= oxlint) dan `npm run build`. Subagent/agent: kalau instruksi bilang lint/build, jalankan persis `npm run lint` / `npm run build`, jangan ganti ke `rtk`.

**Satu perintah verifikasi: `./scripts/verify.sh`.** Script ini menjalankan `npm run lint` + `npm run build`. Saat menugaskan verifikasi ke subagent, minta jalankan **persis** `./scripts/verify.sh` — perintah tunggal, tanpa substitusi, tanpa wrapper. Inilah cara mencegah subagent nyangkut di `rtk`.

Service worker hanya aktif pada hasil build, bukan di `npm run dev`.

---

## 3. Di mana menulis CSS

`src/styles/index.scss` menentukan urutan, dan **urutan itu menentukan siapa yang menang**:

```
tokens → fonts → reboot → app → modules → docs → rebrand → system
```

| berkas | isinya | aturan |
|---|---|---|
| `_tokens.scss` | token desain | satu-satunya sumber nilai |
| `app/` | **stylesheet hasil porting**, partial berurutan `part-NN.scss` (≤600 baris) | urutan `@use` load-bearing — tambah, jangan susun ulang |
| `_app.scss` | facade: hanya daftar `@use "./app/part-NN"` | jangan taruh gaya baru di sini |
| `system/` | **design system**, partial per domain + `_mixins.scss` (≤600 baris) | di sini tempat menulis gaya baru |
| `_system.scss` | facade: hanya daftar `@use "./system/…"` | urutan load-bearing |
| `_docs.scss` | halaman `/documentation` | berdiri sendiri |

**Gaya baru selalu ke partial di `src/styles/system/`** (diimpor terakhir lewat facade `_system.scss`). `app/` adalah stylesheet lama yang dipulihkan dari build sebelumnya — ia punya nilai ad-hoc (radius 33 macam, 40 ukuran huruf) dan itulah yang sedang dirapikan. Pola yang dipakai: memetakan kelas lamanya ke primitif lewat daftar selector di partial `system/`, bukan menyunting `app/`.

**Batas 600 baris per berkas `.scss`**, dienforce pre-commit. Untuk geometri bersama pakai `@mixin` di `src/styles/system/_mixins.scss` + `@include` — bukan `@extend`, karena placeholder tidak bisa lintas modul `@use`.

Kalau memang harus menimpa aturan di `app/`, tulis override-nya di partial `system/` — facade `_system.scss` diimpor terakhir, jadi menang pada kekhususan yang sama.

---

## 4. Token

Semuanya di `_tokens.scss`. **Jangan menulis nilai mentah** kalau tokennya ada.

**Warna punya peran, bukan sekadar nilai.** Satu warna satu tugas. Palet ini sudah tiga kali kacau karena krem kelima ditambahkan tanpa peran:

| peran | token |
|---|---|
| aksi merek | `--sa7tein-orange`, teks di atasnya `--on-brand` |
| teks oranye di latar terang | `--orange-ink`, `--orange-soft-ink` (WCAG AA) |
| latar halaman | `--bg-warm` |
| permukaan kartu | `--surface` |
| tepi kartu | `--border-strong` |
| garis di dalam kartu | `--border` |
| teks | `--text-primary`, `--text-secondary` |
| status | `--success`, `--warning`, `--danger` + varian `-ink` dan `-soft` |

**Skala radius berhenti di 12px.** `--radius-xs` 6, `sm` 8, `md` 10, `lg` 12, `xl` 12 (langit-langit ditahan brief), `pill` 9999. Kalau butuh lebih bulat dari 12px untuk sebuah kontainer, itu tanda desainnya salah, bukan tokennya kurang.

Skala lain: `--space-1..8` (4→32px), `--text-xs..2xl`, `--touch-min` (44px), `--nav-height` (64px), `--motion-*` dan `--ease-*`.

**Periksa dulu sebelum memakai.** Pernah ada bug seluruh halaman yang penyebabnya cuma `var(--space-8)` yang belum ada — dan karena satu `var()` tak terdefinisi membatalkan **seluruh** deklarasi shorthand, padding kiri-kanannya ikut hilang.

---

## 5. Invarian tata letak

Semua angka ini hasil pengukuran, bukan selera. Melanggarnya akan mengulang bug yang sudah diperbaiki.

**Kolom aplikasi dikunci `--shell-max` (430px), di lebar berapa pun.** Aplikasi ini mobile-first; di jendela lebar ia tampil sebagai kolom ponsel yang ditengahkan. Aturan globalnya di `_app.scss` menyasar `div[class*="-screen"]`, `div[class*="-page"]`, dan `body > div`.

**Jarak tepi halaman satu nilai: `--space-5` (20px).** Tanpa pengecualian. Sempat ada empat nilai berbeda (12/16/22/24) dan itulah yang membuat tiap halaman terasa beda lebar.

**Satu penggulung, yaitu dokumen.** Jangan membuat wadah dengan `overflow-y: auto` di dalam halaman — gulir bersarang terasa tidak mulus dan pernah membuat `100vh` mengunci isi yang tak terjangkau. Halaman yang memakai pola lama (`height: 100vh` + anak `overflow-y: auto`) di-override di `_system.scss` jadi `height: auto; overflow: visible` dengan header `position: sticky`.

**Bilah `position: fixed` wajib dibatasi kolom:**

```scss
max-width: var(--shell-max);
margin-inline: auto;
```

Elemen `fixed` diposisikan terhadap **viewport**, bukan induknya. Tanpa dua baris ini, bilahnya menyeberang seluruh jendela sementara kontennya terkunci di kolom 430px — pernah terjadi di ~24 bilah sekaligus.

**Waspada spesifisitas.** Selector pembungkus di `_app.scss` bisa lebih kuat dari `.bottom-nav` (0-1-0). Kejadian nyata: `.home-screen-wrapper .bottom-nav` (0-2-0, di dalam `@media (min-width:768px)`) menang, bilah jadi `max-width: 1024px` dan menyeberang 297px di tiap sisi. Kalau `.bottom-nav`/bilah tetap melebar di layar lebar, **curigai aturan pembungkus di `_app.scss`, bukan tokennya**. Obatnya: tulis override dengan spesifisitas **setara atau lebih tinggi** di `_system.scss` (diimpor terakhir → menang pada kekhususan sama), dan set eksplisit `left: 0; right: 0; transform: none` supaya `left: 50% / translateX(-50%)` lama tidak ikut. Catatan lengkap: atlas `PF-147`.

**Header menempel melebar sampai tepi kolom** supaya latarnya menutupi konten yang lewat di belakangnya:

```scss
margin-inline: calc(-1 * var(--space-5));
padding-inline: var(--space-5);
```

**Media query merespons lebar JENDELA, bukan lebar KOLOM.** Ini pernah membuat halaman dokumentasi menyusut jadi 58px: layout desktopnya tetap berlaku di dalam kolom 430px. Kalau tata letak harus berubah karena kolomnya sempit, **jangan pakai media query** — pakai container query, atau terapkan layout ringkasnya tanpa syarat.

---

## 6. Ikon & gambar

- **Ikon: `lucide-react`**, `strokeWidth={1.75}` seragam. Satu bahasa ikon untuk seluruh aplikasi.
- **Tanpa emoji.** Tidak di UI, tidak di cuplikan kode.
- **Tanpa paket ikon lain.** SVG inline hanya untuk ornamen dan ilustrasi; ikon fungsional memakai lucide.
- **Tanpa ilustrasi stok dan tanpa URL gambar eksternal** — aset dari `public/assets/`.
- Dekorasi SVG: pakai `preserveAspectRatio="xMidYMid slice"`, **jangan `none`**. `none` meregang tidak seragam dan mengubah lingkaran jadi lonjong serta garis jadi tidak rata.
- Opasitas dekorasi di atas oranye: **4–14%**. Di atas itu warnanya bergeser ke pink atau salmon dan oranye mereknya rusak.

---

## 7. Konvensi

**Rute** didaftarkan sebagai array di `src/App.tsx` — tambahkan entri di situ, bukan `<Route>` terpisah.

**Halaman** satu berkas per layar di `src/pages/`. Yang berbagi perilaku sebaiknya berbagi komponen, bukan saling menyalin: empat halaman order pernah jadi salinan kembar dan tiap perbaikan desain harus diulang empat kali, dengan tiga di antaranya selalu terlewat. Sekarang semuanya memakai `OrderStageScreen`.

**Komponen** di `src/components/` — `layout/`, `ui/`, dan subfolder per domain.

**Data mock** di `src/data/`. Kalau sebuah angka dipakai di lebih dari satu tempat, ia tidak boleh hidup di JSX — pernah ada nomor telepon hardcoded di markup padahal tipenya memang belum punya field untuk itu.

**Warna latar jangan ditulis ulang.** Kalau sebuah kartu butuh latar, pakai `--surface` + `--border-strong`, bukan nilai baru.

---

## 8. Memverifikasi pekerjaanmu

**Ukur, jangan menebak dari tangkapan layar.** Alat visi di sesi ini berkali-kali salah — melaporkan peta menyentuh tepi padahal 20px di dalamnya, dan judul tiga baris padahal tepat dua. Yang selalu benar adalah DOM.

Cara ukur yang terbukti:

| yang diperiksa | cara |
|---|---|
| lebar kolom | `document.querySelector('.app-shell').getBoundingClientRect()` |
| jarak tepi halaman | elemen selebar shell yang punya `padding-left > 0` |
| gulir bersarang | cari `overflowY: auto/scroll` dengan `scrollHeight > clientHeight` |
| peregangan SVG | `element.getScreenCTM()` — `a` dan `d` harus sama |
| jumlah baris teks | `el.innerText.split('\n').length` |
| warna hasil komposit | komposit alpha ke latar dulu, jangan baca angkanya mentah |
| tabrakan elemen | bandingkan `getBoundingClientRect()` dua elemen |

Dan yang paling penting: **sebutkan angka, bukan kesan.** "Terukur 20px di kedua sisi" bisa diperiksa; "sudah rapi" tidak.

---

## 9. Status implementasi legacy & arah migrasi

**Role customer versi legacy selesai** — 46 rute, dari onboarding sampai pesanan selesai. Zona A/B/C (600 m / 1,5 km / 2 km dengan tarif 5.000 / 9.000 / 13.000), geofence 2 km, form apartemen wajib, COD dan transfer manual masih sesuai PRD lama, **belum** sesuai PRD aktif Irbid. Rencana migrasi ada di `docs/product/prd/versions/irbid-mvp-v2-2026-09-21/milestones.md`.

**Status per role** (masing-masing punya developer sendiri):

1. **Merchant console** — selesai. Lihat `docs/plan-merchant.md` (M0–M7).
2. **Tampilan kurir** — selesai. Lihat `docs/plan-courier.md` (K0–K4), dibangun dari flow `f13-courier-view`. Detail tugas menampilkan dua sumbu berdampingan (Journey Line untuk order, stepper checkpoint untuk kurir) dan **tanpa layar login** — PRD aktif tidak punya requirement auth kurir, ditandai `UNRESOLVED-by-absence`. Label aksi resmi "Ambil"/"Berangkat"/"Tiba"; "Mulai Antar" tidak ada di PRD v2.
3. **Panel admin (CS)** — selesai. Lihat `docs/plan-admin.md` (S0–S4), dibangun dari flow `f15-super-admin` + `f8-dispute` dan milestone M6/M9. Shell 430px sama seperti role lain. Tanpa auth dan tanpa audit trail — PRD aktif tak punya requirementnya (`UNRESOLVED-by-absence`).
4. **Super Admin** — **role terpisah, belum dibangun.** Keputusan PO 2026-09-23: konsol `/admin` adalah panel CS (bukan Super Admin), dan Super Admin kelak berupa **website penuh non-PWA** untuk owner/team (kontrol penuh platform, termasuk pajak dan dashboard). Prefix disiapkan `/superadmin`; cakupan detail `UNRESOLVED`. Rujukan: `docs/product/prd/decision-irbid-mvp.md`.

**Dua hal yang harus dijaga saat menambah role:**

- **Journey Line dan status pesanan sudah jadi komponen.** Merchant dan kurir memandang pesanan yang sama dari sisi berbeda — turunkan dari komponen yang ada, jangan menggambar ulang.
- **Shell 430px kemungkinan salah untuk Super Admin.** Ia dashboard dengan tabel. Kalau memang perlu lebar penuh, jadikan pengecualian yang **didokumentasikan di `/documentation`** sebagai keputusan sadar — bukan kebocoran seperti yang dulu terjadi.

---

## 10. Sebelum mengirim

1. `npm run build` — 0 error
2. Ukur di **390px dan 1440px**: lebar kolom, jarak tepi, overflow horizontal 0
3. Tidak ada `position: fixed` tanpa batas kolom
4. Tidak ada emoji, tidak ada paket ikon baru, tidak ada warna di luar peran token
5. Tidak ada `var(--…)` yang tokennya belum ada
6. **Halaman dokumentasi global (`src/pages/Documentation.tsx`) diperbarui di commit yang sama** — dienforce di pre-commit cek #6
7. Perubahan yang menyentuh flow: `./scripts/flows-gate.sh <slug>` lolos, dan flow + PRD diperbarui di commit yang sama
8. Record node atlas untuk pekerjaan signifikan

---

## 11. Skema data

**`src/types.ts` adalah satu-satunya sumber tipe domain.** Tipe yang dipakai lebih dari satu modul tinggal di sini. Impor selalu bentuk `import type { X } from '../types'`.

- Data mock hidup di `src/data/`, diekspor sebagai **named const bertipe** (`export const foods: Food[] = [...]`), bukan default export.
- Nilai yang dipakai di lebih dari satu tempat wajib jadi `export const` di `src/data/` — contoh `MAX_DELIVERY_METERS` dan `MAX_COURIERS_PER_MERCHANT` di `merchant.ts` — bukan literal yang disalin ke JSX. Pernah ada nomor telepon hardcoded di markup padahal tipenya belum punya field untuk itu.
- Logika turunan tinggal di modul data sebagai fungsi murni, jangan disalin ke komponen: `rupiah()`, `formatDistance()`, `zoneFor()`, `haversineMeters()`, `deliveryFeeFor()`, `isDeliverable()` (`merchant.ts`); `getFood()`, `modifierSummary()`, `modifierExtra()` (`foods.ts`).
- Objek literal kecil yang harus tetap presisi pakai `as const` (`DEFAULT_NEW_ADDRESS_PIN`, `mockOrder`).
- Tipe state yang hanya dipakai satu slice tetap di file slice-nya sebagai interface lokal, tidak di `types.ts`.

## 12. Komponen & kode reusable

**Pakai komponen yang sudah ada sebelum menggambar ulang.** Ini yang paling sering dilanggar dan paling mahal.

Registry yang harus dipakai ulang:

- `OrderStageScreen` — semua layar tahap order (diterima / dimasak / diantar / tiba). Empat halaman order dulu salinan kembar dan tiap perbaikan desain harus diulang empat kali.
- **Journey Line / status pesanan** — merchant dan kurir memandang order yang sama dari sisi berbeda; turunkan dari komponen ini (`src/components/OrderStageScreen.tsx`).
- `src/components/ui/`: `FoodCard`, `AddToCartButton`, `FavoriteButton`, `BackButton`.
- `src/components/customer/`: `CustomerHomeHero`; `src/components/layout/`: `BottomNav`, `HomeIndicator`.

Konvensi kode:

- **Nama file PascalCase**, nama fungsi = nama file. `src/components/ui/` memakai **named export**; halaman `src/pages/` memakai **default export**.
- **Props**: `interface XxxProps` tepat di atas komponen (atau inline type pada parameter), bukan tipe yang diimpor dari `types.ts`.
- **Ikon**: `lucide-react`, `strokeWidth` eksplisit. Tanpa paket ikon lain, tanpa emoji, tanpa URL gambar eksternal.
- **CSS**: gaya komponen default ke `src/styles/_system.scss` (lapisan yang menang). Co-located `.css` hanya untuk komponen besar yang berdiri sendiri — saat ini cuma `CustomerHomeHero.css`. Jangan menambah `.css` komponen baru tanpa alasan kuat.
- **State**: satu slice per domain di `src/store/slices/`, `name` camelCase sama dengan key `combineReducers`, **default export** reducer + named destructured actions. Persist hanya yang ada di whitelist `src/store/index.ts` (`cart`, `favorites`, `accountSetup`). Hook: `useAppDispatch` + `useAppSelector` — **tidak ada** hook `useAppStore` (file `src/hooks/useAppStore.ts` tetap ada sebagai tempat kedua hook itu; jangan bikin hook baru bernama `useAppStore`).
- **Hooks** di `src/hooks/`, nama `useXxx`, named export, return objek polos (bukan array).
- **Route**: tambahkan tuple `[path, Page]` ke array `routes` di `src/App.tsx`, bukan `<Route>` terpisah. Tanpa lazy import.
- **Tanpa dependency baru** untuk hal yang bisa diselesaikan beberapa baris atau sudah ada di stack.
