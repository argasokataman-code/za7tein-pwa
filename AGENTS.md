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

PRD produknya ada di luar repo ini (`PRD_Sa7tein.pdf`). Repo ini mengerjakan **tampilannya**.

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
| `_app.scss` | **stylesheet hasil porting, 10.000 baris** | jangan disunting borongan |
| `_system.scss` | **design system, lapisan yang menang** | di sini tempat menulis gaya baru |
| `_docs.scss` | halaman `/documentation` | berdiri sendiri |

**Gaya baru selalu ke `_system.scss`.** `_app.scss` adalah stylesheet lama yang dipulihkan dari build sebelumnya — ia punya nilai ad-hoc (radius 33 macam, 40 ukuran huruf) dan itulah yang sedang dirapikan. Pola yang dipakai: memetakan kelas lamanya ke primitif lewat daftar selector di `_system.scss`, bukan menyunting `_app.scss`.

Kalau memang harus menimpa aturan di `_app.scss`, tulis override-nya di `_system.scss` — berkas itu diimpor terakhir, jadi menang pada kekhususan yang sama.

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

## 9. Status & arah berikutnya

**Role customer selesai** — 46 rute, dari onboarding sampai pesanan selesai. Zona A/B/C (600 m / 1,5 km / 2 km dengan tarif 5.000 / 9.000 / 13.000), geofence 2 km, form apartemen wajib, COD dan transfer manual — semuanya sesuai PRD.

**Berikutnya, tiga role sisanya** (masing-masing punya developer sendiri):

1. **Merchant console** — toggle buka/tutup, antrean order masuk, slider estimasi masak 15–30 menit, indikator kuota harian, daftar kurir. Mulai dari sini: pesanan customer sekarang tidak mendarat di mana pun.
2. **Tampilan kurir** — "minimalis satu tangan" menurut PRD. Daftar rute dengan detail lantai/unit, tombol "Mulai Antar" dan "Tiba", serta layar verifikasi bukti transfer.
3. **Super Admin** — approval tenant, konfigurasi kuota tier, master zona.

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
