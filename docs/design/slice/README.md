# Irisan HTML Sa7tein — login & daftar semua peran

Folder ini **hanya** berisi desain halaman login dan daftar customer. Layar
aplikasi lain sempat dibuat keliru (65 berkas) dan sudah **dihapus** atas
permintaan pemilik 2026-10-17 — jangan dibuat lagi tanpa diminta.

Arsip review, **bukan** kode produksi. Dibuka langsung lewat peramban, tanpa build.

| berkas | isi |
|---|---|
| `login-1to1.html` | **ACUAN** bentuk login (customer) |
| `signup-customer.html` | daftar customer — isi `SignUp.tsx` |
| `signup-merchant.html` | daftar toko — isi `MerchantSignUp.tsx` |
| `login-{merchant,courier}.html` | login merchant (tab ke daftar) & kurir (switch jenis akun) |
| `login-{ops,superadmin}.html` | **USULAN** — repo tidak punya auth untuk dua peran ini (dinyatakan di caption tiap berkas) |
| `login.css` | satu-satunya stylesheet login |
| `index.html` | galeri: satu tautan per halaman login |

Tiap berkas memuat **tiga bingkai** — itulah tiga keadaan yang dirancang:
`1 · kosong`, `2 · salah`, `3 · sedang mengirim → berhasil`.

## Bentuk = acuan pemilik, bukan tafsiran baru

Bentuknya mengikuti acuan yang sudah disetujui (commit `d0eaa47`):
kepala **foto utuh**, badge merek, tab garis-bawah, tiga tombol sosial berlogo,
field putih, tautan lupa sandi, tombol utama di dasar layar.

| bagian | sumber |
|---|---|
| kepala foto utuh | `login-1to1.html` (commit `d0eaa47`), dipatok `240px` |
| badge = tile ikon 80px di sambungan foto/panel | acuan (posisi badge) + **logo repo** `/icons/sa7tein-mark.svg` |
| tab garis-bawah `Masuk | Daftar` | acuan (bentuk) + `SignIn.tsx:42-49` (teks) |
| `atau` | acuan (`or`) + repo (`atau`) |
| tiga tombol sosial berlogo 52px | acuan |
| label, field, pesan salah, lupa sandi, tombol | `src/styles/system/_auth.scss:187-362` + `_mixins.scss:4/82` |
| toast | `toastOptions` `src/App.tsx:590-603` |

**Yang ditambahkan di atas acuan, dan hanya ini:**

1. **Korsel parallax** — 4 foto bergantian tiap 5 detik (siklus 25 detik) sambil
   bergeser tipis, plus titik penanda yang ikut bergerak. Permintaan pemilik.
   Fotonya **utuh, tidak diblur, tidak dijadikan tekstur**.

   **Aturan anti-kedip:** slide baru fade in **di atas** slide lama, dan slide
   lama baru di-reset setelah tertutup penuh. Slide pertama selalu opak
   (lapisan dasar), dan foto pertama diulang sebagai anak ke-5 supaya putaran
   terakhir menutup ke foto yang sama. Jangan pernah membuat slide memudar ke
   transparan sendirian — dasar oranye kepala akan menembus dan kepala berkedip
   oranye. Dijaga `slice-check` (tiap kepala wajib 5 slide, yang ke-5 duplikat
   yang pertama).
2. **Badge memakai logo Sa7tein.** Tile ikon (pelat oranye logo
   `/icons/sa7tein-mark.svg`) duduk di sambungan foto/panel, separuh badannya
   menimpa tepi bawah foto, dengan cincin putih tipis. Nama merek **tidak**
   ditulis sebagai teks; logo yang bicara. Logo lengkap (`sa7tein-wordmark.svg`)
   tidak muat di tile persegi, jadi yang dipakai mark-nya.
3. **Tab memakai teks repo** (`Masuk`/`Daftar`) dan pemisah `atau`, bukan
   `Login`/`Signup`/`or` dari mockup.

Teks isi diambil verbatim dari kode repo: `SignIn.tsx:35-41`,
`MerchantSignIn.tsx:31-37`, `CourierSignIn.tsx:43-49`. Label peran ikut
`AUTH_ROLE_LABEL` (`src/data/auth.ts:49-53`): `Pembeli`, `Merchant`, `Kurir`.
Foto kepala memakai `AUTH_PHOTO` per peran: `sate-ayam.webp` (customer),
`lontong.webp` (merchant), `es-teh-manis.webp` (kurir) sebagai foto pertama.

## Validasi — dirancang sendiri, bukan pesan peramban

**Aturan mati: tidak ada pesan validasi bawaan peramban.** Ketiga layar masuk repo
memakai `<form noValidate>` (`SignIn.tsx:66`, `MerchantSignIn.tsx:38`,
`CourierSignIn.tsx:50`) dan tidak punya `required`, `pattern`, `minLength`.
`scripts/slice-check.mjs` **menolak** bentuk yang salah: `<form>` tanpa
`novalidate`, atribut `required`/`pattern`/`minlength`/`maxlength`, input tanpa
`<label for="…">`, pesan salah tanpa `role="alert"`, atau `aria-describedby` yang
menunjuk id tak ada → **FAIL**.

Pesan yang dipakai **apa adanya** dari repo (`src/lib/schemas.ts`):

| pesan | baris | dipakai di |
|---|---|---|
| `Nomor WhatsApp wajib diisi` | 14 | customer, kurir, daftar |
| `Format nomor WA tidak valid (+62… atau +962…)` | 15 | customer |
| `Kata sandi minimal 6 karakter` | 19 | semua peran |
| `Format email tidak valid` | 31 | merchant, CS, ops, super admin |

Daftar memakai pesan yang sama plus `Nama minimal 2 karakter` (baris 26) dan
`Format email tidak valid` (baris 31). Toast berhasil (verbatim):
`Mode demo: berhasil masuk` (customer), `Akun dibuat. Lanjut verifikasi email.`
(daftar, `SignUp.tsx:31`),
`Masuk sebagai merchant` (merchant), `Masuk sebagai kurir (demo)` (kurir).
Tiga layar USULAN sengaja **tanpa toast** — repo tidak punya kalimatnya.

### Keadaan per bingkai

| bingkai | yang terlihat |
|---|---|
| 1 · kosong | tombol `Masuk` aktif (44px, oranye merek + `--shadow-brand`) |
| 2 · salah | field `is-error` (border `--danger`) + pesan `role="alert"` di bawah field, `aria-invalid` |
| 3 · mengirim | tombol `disabled` (opacity .45) seperti `isSubmitting`; di tiga peran ber-kode, toast sukses mengapung di atas layar (`top: 8px`, tengah) |

## Aturan

1. **Satu perubahan di `login.css` mengubah semua login.**
2. **Pesan validasi hanya dari `src/lib/schemas.ts`.** Butuh pesan baru? Tambahkan
   dulu di schema repo.
3. **Foto & logo hanya dari aset repo** (`../../../public/…`). Tanpa aset baru,
   tanpa gambar eksternal.
4. **Tanpa skrip.** Satu-satunya JS adalah `onsubmit="return false"` supaya
   halaman tidak berpindah saat tombol ditekan.
5. **Toast mengapung, teks saja.** Anak `.phone`, gaya `toastOptions` repo.
   Jangan taruh di dalam `.body` (jatuh menimpa tab) dan jangan tambah
   titik/ikon karangan.
6. **Badge = logo, bukan teks.** `slice-check` menolak nama merek sebagai teks.
7. **Kepala berisi FOTO UTUH.** Jangan dijadikan tekstur, jangan diblur, jangan
   diganti blok oranye polos.
8. **Sentence case.** Tidak ada `text-transform: uppercase`.
9. **Target sentuh ≥44px**: input 44, tombol 44, tautan samping 44, tab 44.
10. **Teks nyata**, bukan lorem. Jangan mengarang fitur yang tidak ada di repo.

## Pewarnaan — token DNA repo

Nilai di `login.css` adalah **salinan** token `src/styles/_tokens.scss` (EDISI 02):

| bagian | token |
|---|---|
| kepala (dasar), tab aktif, tombol utama | `--sa7tein-orange` `#E44220` |
| chip peran & tautan | `--orange-ink` `#B83213` |
| panel | `--bg-warm` `#F4F4F6` |
| field, badge, chip, tombol sosial | `--surface` `#FFFFFF` |
| garis field/tab | `--border`, `--border-strong` |
| teks | `--text-primary` / `--text-secondary` / `--text-secondary-strong` |
| pesan salah | `--danger` / `--danger-ink` / `--red-soft` |
| bayangan | `--shadow-subtle` / `--shadow-sm` / `--shadow-md` / `--shadow-brand` |

**Tidak ada gradien di lembar ini.** Warna merek pihak ketiga (Google/Facebook/X)
hanya di dalam logotype tombol sosial — itu ikon merek, bukan warna tema.

## Angka acuan (terukur)

| bagian | nilai |
|---|---|
| bingkai | `390x844`, overflow-x `0` |
| kepala | `240px` (foto, tanpa lapisan teks di atasnya) |
| badge | tile `80x80`, menimpa foto `40px`, `8px` di atas label peran |
| label peran | teks `13px/700`, tanpa latar. Hanya dipakai dua layar USULAN (ops, superadmin). **Customer, merchant, kurir tanpa label**: tab/switch langsung `12px` di bawah tile logo |
| tab | tinggi baris `44px`, indikator `inset 0 -2px` oranye |
| titik korsel | **tidak ada** — acuan pun tidak punya; gerak tetap dari cross-fade |
| tombol `Masuk` | `44px`, dasar `828`, **`16px` dari dasar layar** di semua bingkai |
| sisa ruang terketat | **`57px`** (bingkai "salah" customer) — nol isi terpotong di 18 bingkai |
| foto pengisi (merchant) | `public/assets/img/menu/merchant-sate.webp` — dibuat 2026-10-17 (Gemini, prompt: satay + nasi + es teh, cahaya siang lembut, 3:2, tanpa teks), `1050px`, 69 KB. Kartu `350x210`, radius `--radius-lg`, `--shadow-card`, `object-position: 50% 60%` |
| objek transparan (CS) | `public/assets/img/menu/cs-order-desk.webp` — kantong kertas, printer struk, gelas; latar dibuang `rembg` (u2net), `900x710`, 50 KB, `opaque=False`. Dipasang `350x236` `object-fit: contain`, tanpa latar/radius (bukan kartu) |
| bayangan kartu di dalam layar | field + tombol sosial pakai `--shadow-card` `0 10px 24px .12` (geometri acuan `d0eaa47`); terukur selisih maks `18` (field) / `15` (sosial) terhadap keadaan tanpa bayangan |
| bayangan bingkai | tiga lapis: garis rambut `1px` (alpha `.10`) + `0 2px 6px` (`.12`) + `0 20px 44px` (`.30`) — terukur `195` di tepi turun ke `236` (latar) pada `80px` |

## Layar daftar customer — bedanya dari login

Bentuknya sama; yang berubah hanya karena isinya lebih banyak.

**Kepala, tile merek, tab, dan ritme form identik dengan login** — diukur di
posisi yang sama: kepala `0..240`, tile `y 200` (menimpa foto `40px`), tab
`y 292`, form `gap 12px`, field `gap 4px`, tombol `16px` dari dasar bingkai.

| bagian | nilai | alasan |
|---|---|---|
| kepala | **240px** sama dengan login | tinggi foto tidak boleh berubah saat pindah tab |
| tab → field pertama | `--space-3` (12px) | di login celah itu diisi `atau` + tombol sosial; di daftar tidak ada blok itu, jadi celahnya ditulis eksplisit |
| form / field | `12px` / `4px`, sama dengan login | ritme yang sama; jangan dirapatkan untuk memaksa muat |
| bingkai | **390 x 906** (login 844) | empat field + persetujuan butuh 62px lebih; di app halaman ini memang menggulir dokumen |
| tombol sosial | **tidak ada** | `SignUp.tsx` tidak punya sosial login; jangan mengarang kontrol. Menambahkannya butuh ~107px lagi |
| field | Nama, Nomor WhatsApp + petunjuk `WA_PHONE_HINT`, Email, Kata sandi (dengan tombol tampilkan) | `SignUp.tsx:53-139` |
| persetujuan | checkbox asli di dalam `<label>` | `SignUp.tsx:150-160`, bisa dijangkau keyboard |
| tombol | `Buat akun`, `16px` dari dasar di ketiga bingkai | aturan yang sama dengan login |

Terukur di 390x906: tiap bingkai `gap 16`, `cut 0`, `overflow-x 0`, 5 slide per
kepala dengan yang ke-5 duplikat pertama. Bingkai yang paling ketat adalah
"2 · salah" (empat pesan sekaligus).

### Tab `Masuk | Daftar` — di mana saja

Tab hanya dipasang di layar yang punya pasangan nyata, dan keduanya bisa
diklik ke berkas seberangnya:

| layar | `Masuk` | `Daftar` |
|---|---|---|
| `login-1to1.html` | aktif | → `signup-customer.html` |
| `signup-customer.html` | → `login-1to1.html` | aktif |
| `login-merchant.html` | aktif | → `signup-merchant.html` |
| `signup-merchant.html` | → `login-merchant.html` | aktif |

Dua layar USULAN (`ops`, `superadmin`) **tidak** memasang tab: repo
tidak punya rute daftar untuk peran itu (`App.tsx` hanya punya `/signup` dan
`/merchant/signup`), jadi tab `Daftar` di sana akan jadi kontrol mati. Tab yang
aktif menunjuk halamannya sendiri, bukan `href="#"`.

`login-courier.html` juga tanpa tab, tapi dengan alasan berbeda: kurir tidak
mendaftar sendiri (akun kurir toko dibuat merchant, akun partner dibuat tim
ops), jadi tidak ada halaman daftar kurir untuk dituju.

## Layar masuk kurir — dua jenis akun, satu layar

Keputusan pemilik 2026-10-18: **satu layar**, jenis akun dipilih lewat
segmented switch di bawah tile merek — bukan tab `Masuk | Daftar`, bukan dua
berkas kembar.

| bagian | nilai | alasan |
|---|---|---|
| switch | `.seg` dua pilihan setara (`Kurir toko`, `Kurir partner`), tinggi tiap pilihan `44px`, aktif `--orange-soft` + `--orange-ink` | dua jenis akun memakai form yang sama; rel putih `.seg` bukan bidang oranye supaya tombol utama tetap satu-satunya aksen penuh |
| keterangan | `.seg-hint` `12px` di bawah switch: "Kurir toko dibuat merchant; kurir partner dibuat tim ops." — satu kalimat untuk kedua pilihan | akun tidak dibuat sendiri (merchant C-06, ops M6); kalimatnya netral supaya tidak bertentangan saat switch diklik |
| field | **Email** saja, placeholder `nama@email.com` | PRD aktif R-ACC-01: login MVP hanya email magic link, satu email = satu peran |
| tombol | `Kirim tautan masuk`, `16px` dari dasar bingkai | aturan yang sama dengan login lain |
| pesan salah | `Format email tidak valid` | `src/lib/schemas.ts:31` verbatim |
| toast (bingkai 3) | `Tautan masuk dikirim ke emailmu.` | **USULAN** — belum ada di repo karena magic link belum diimplementasikan |

Ini **mendahului kode**: `CourierSignIn.tsx` sekarang masih nomor WA + kata
sandi, dan `docs/plan-courier.md` K5 mencatat mekanisme kredensial `UNRESOLVED`.
Saat magic link masuk ke aplikasi, desain ini yang jadi acuan.

Terukur di 390x844: tiap bingkai tile `y 200`, switch `y 292` (posisi yang sama
dengan tab di layar lain), `gap 16`, `cut 0`, `overflow-x 0`.

## Layar daftar merchant — bedanya dari login merchant

Kepala `240px`, tile merek, tab `Masuk | Daftar` (Daftar aktif), ritme form
`12px`/`4px`, dan tombol `16px` dari dasar: sama dengan `login-merchant.html`
dan `signup-customer.html`. Tab di posisi yang sama di ketiga layar (`y 292`),
jadi pindah layar tidak menggeser navigasi.

| bagian | nilai | alasan |
|---|---|---|
| bingkai | **390 x 942** (login merchant 844) | empat field + fieldset zona; di app halaman ini menggulir dokumen |
| field | Nama toko, Email, Nomor HP (opsional), Zona, Kata sandi | `MerchantSignUp.tsx:53-139` |
| zona | dua kotak radio 1:1 (Hijazi, Syimali) + petunjuk, terpilih = border oranye + `--orange-soft` | `MerchantSignUp.tsx:110-127`; PRD hanya punya dua zona, jangan diganti teks bebas |
| tab | `Masuk` → `login-merchant.html`, `Daftar` aktif | menggantikan tautan `Sudah punya akun toko? Masuk`; label peran `Merchant` dilepas karena tab sudah menandai posisi layar |
| tombol | `Kirim pendaftaran`, `16px` dari dasar ketiga bingkai | sama dengan login |
| foto pengisi | **tidak ada** (`slot-art` hanya dipakai login merchant saat ada ruang kosong) | layar daftar sudah penuh |
| toast | **tidak ada** | `MerchantSignUp.tsx:45` langsung `navigate('/onboarding')` |

Terukur di 390x942: tiap bingkai `gap 16`, `cut 0`, `overflow-x 0`, tab `y 292`
sama dengan login, tab → field pertama `12px`. Bingkai "2 · salah" yang paling
ketat (tiga pesan sekaligus).

## Memeriksa

```bash
node scripts/slice-check.mjs    # kelas, token, aset, emoji, <script>, validasi, badge
node scripts/slice-index.mjs    # tulis ulang galeri index.html
```

Catatan jujur: moli (peramban headless untuk mengukur) **tidak bisa menggambar
gambar apa pun** (webp maupun svg; `naturalWidth` selalu 0) dan jam animasinya
beku. Foto kepala karena itu tidak pernah terlihat di tangkapan layar pengukuran
— yang terbukti di sana hanya geometri (kepala `322px`, badge `76px`, tombol
`24px` dari dasar, nol isi terpotong). Logonya bisa diperiksa dengan menyuntik
SVG-nya inline. Penilaian rupa foto harus dari peramban biasa.
