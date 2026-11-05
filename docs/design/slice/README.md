# Irisan HTML Sa7tein — login, daftar, panel ops, dan riwayat pesanan

Folder ini berisi desain halaman login dan daftar customer, plus **14 layar
menu panel ops + 1 kotak masuk notifikasi** atas permintaan pemilik
(2026-10-25): dashboard, 13 menu sidebar, dan notifikasi yang dibuka dari
lonceng topbar. Login desktop panel ops dan alur keluar ditambahkan
(2026-10-25) agar sesi punya layar masuk dan keluar yang jelas. Layar aplikasi
lain sempat dibuat keliru (65 berkas) dan sudah
**dihapus** atas permintaan pemilik 2026-10-17, jangan dibuat lagi tanpa
diminta.

Arsip review, **bukan** kode produksi. Dibuka langsung lewat peramban, tanpa build.

## Struktur folder

```
slice/
├─ index.html          galeri
├─ README.md
├─ auth/               login + daftar (satu login.css)
└─ ops/                15 layar panel ops + login desktop (ops.css + ops-login.css)
   └─ reference/       gambar acuan dashboard
```

| berkas | isi |
|---|---|
| `auth/login-1to1.html` | **ACUAN** bentuk login (customer) |
| `auth/signup-customer.html` | daftar customer — isi `SignUp.tsx` |
| `auth/signup-merchant.html` | daftar toko — isi `MerchantSignUp.tsx` |
| `auth/login-{merchant,courier}.html` | login merchant (tab ke daftar) & kurir (switch jenis akun) |
| `auth/login-{ops,superadmin}.html` | **USULAN** — bingkai ponsel; repo tidak punya auth untuk dua peran ini (dinyatakan di caption tiap berkas) |
| `ops/ops-login.html` | login desktop panel ops — email + kata sandi, state kosong/validasi/loading, pesan sesi berakhir |
| `ops/ops-dashboard.html` | irisan `ops/reference/Sa7tein Ops Dashboard Overview.png` — desktop fluid 1440–1920px (acuan 1536×1024), skala teks 11–13px agar terbaca |
| `ops/ops-liability.html` | Kewajiban & ledger — komposisi kewajiban, payout/pending refund, rekonsiliasi DANA, eksposur sengketa |
| `ops/ops-onboarding.html` | Verifikasi onboarding — merchant + kurir partner, akun DANA, area layanan |
| `ops/ops-disputes.html` | Sengketa — antrean + detail, bukti foto, rule-based decision |
| `ops/ops-merchants.html` | Merchant — registri, suspend, kuota COD, SP |
| `ops/ops-ledger.html` | Ledger — buku besar append-only, arah dana, filter |
| `ops/ops-rules.html` | Rule sengketa — form buat/edit, katalog mitigasi, kompensasi, punishment |
| `ops/ops-incidents.html` | Insiden — detail per order, rule berlaku, tinjauan reject kurir partner |
| `ops/ops-moderation.html` | Moderasi tag — antrean tag + riwayat keputusan |
| `ops/ops-penalties.html` | Surat peringatan — form SP + riwayat sanksi berbasis rule |
| `ops/ops-programs.html` | Program aplikator — form program platform + program berlaku |
| `ops/ops-quotas.html` | Paket kuota — kelola paket order/COD + pemakaian subscription |
| `ops/ops-settings.html` | Aturan platform — multiplier, ambang notif, flat fee, dispatch, kurs harian |
| `ops/ops-notifications.html` | Notifikasi — kotak masuk, filter, tandai baca, ringkasan, preferensi, aktivitas |
| `ops/ops-analytics.html` | Analytics & log — fee platform, aksi ops, audit trail |
| `auth/login.css` | satu-satunya stylesheet login |
| `ops/ops.css` | gaya panel ops (15 layar) |
| `ops/ops-login.css` | gaya login desktop ops (memakai token `ops.css`) |
| `ops/ops.js` | interaksi mock panel ops: dropdown Sa7tein, dialog validasi/konfirmasi, toast, popover lonceng, menu akun, login |
| `order-history.html` | Riwayat pesanan customer (`/customer/orders?tab=history`) — kartu per order, kelompok tanggal, saring Semua/Selesai/Dibatalkan/Refund, aksi `Pesan lagi`. **Sudah diporting** ke React 2026-10-31 (`src/pages/MyOrder.tsx`, `src/components/customer/OrderHistoryCard.tsx`, `OrderHistorySheet.tsx`) |
| `order-journey.html` | Journey pesanan aktif (`/order-placed?stage=diantar`) — status tahap, Journey Line 5 simpul, pembayaran COD, toko, kurir, tujuan, pop-up perubahan status. Bagian pop-up **sudah diporting** (`src/components/customer/OrderUpdateNotice.tsx`); layar journey-nya memakai `OrderStageScreen` yang sudah ada |
| `index.html` | galeri: tautan halaman login + panel ops + riwayat pesanan + journey |

## Panel ops — 15 layar, satu stylesheet

Semua `ops/ops-*.html` memakai `ops/ops.css` dan shell yang sama: sidebar `236px`,
topbar, judul halaman, dan area konten fluid `1440–1920px` (acuan
`1536×1024`). Dashboard memakai rel kanan `335px`; layar menu lain memakai
grid internal agar tabel dan form tidak terjepit.

- **Skala teks terbaca:** minimum `11px`, body/label `12–13px`, tabel `12.5px`,
  KPI `28px`. Merchant thumbnail `42px`, tinggi baris tabel `56px`.
- **Data dari repo:** angka, nama merchant, order, tag, SP, program, kuota, dan
  audit mengikuti `src/data/`. Tidak ada aturan bisnis baru.
- **Navigasi nyata:** semua tautan sidebar menuju berkas ops yang ada.
  Lonceng topbar membuka popover berisi 3 notifikasi terbaru, lalu tautan
  `Lihat semua notifikasi` menuju kotak masuk di semua layar.
- **Menu akun:** klik avatar/nama di topbar membuka menu akun. `Keluar`
  memakai dialog konfirmasi Sa7tein, lalu menuju `ops-login.html?keluar=1`
  yang menampilkan toast sesi berakhir. Login desktop ada di
  `ops/ops-login.html`.
- **Logo asli:** sidebar dan login memakai
  `public/icons/sa7tein-mark.svg` (aset repo), bukan teks `Sa7tein`.
  Label peran `Ops` tetap teks di samping logo.
- **Header beku:** topbar ops menempel saat halaman digulir. Di kotak masuk
  notifikasi, judul `Kotak masuk` + filter ikut menempel di bawah topbar,
  jadi filter tetap terjangkau saat membaca notifikasi panjang.
- **Dropdown Sa7tein:** tidak ada `<select>` peramban di 15 layar. Semua pilihan
  memakai tombol + listbox sendiri (`ops.js`), lengkap dengan keyboard.
- **Dialog Sa7tein:** setiap tombol aksi membuka dialog validasi atau
  konfirmasi. Field wajib yang kosong ditampilkan sebagai daftar di dialog,
  bukan pesan `alert()` peramban. Tidak ada `confirm()` / `alert()`.
- **Toast Sa7tein:** aksi yang berhasil ditutup dengan toast, bukan dialog
  sukses kedua. Empat nada (sukses, info, peringatan, gagal), maksimal tiga
  toast bertumpuk, progress, jeda saat disentuh, dan tombol tutup.
- **Notifikasi:** kotak masuk dengan filter nyata (semua, belum dibaca, butuh
  tindakan, sistem), tandai satu/semua dibaca, ringkasan, preferensi, dan
  aktivitas. Semua status hanya mock di DOM.
- **Sidebar seragam:** `sticky` setinggi viewport dan tidak ikut memanjang
  mengikuti panjang halaman; isinya bisa digulir sendiri di layar pendek.
- **Terukur:** `docW == vw` di 1440, 1536, dan 1920; tidak ada overflow
  horizontal atau konten terpotong.

### Selaras PRD aktif (`sa7tein-mvp-2026-10-11`)

14 layar menu ini menutup fungsi ops OPS-01…OPS-15 tanpa menambah aturan
bisnis baru; kotak masuk notifikasi adalah permukaan pendukung, bukan fungsi
PRD baru. Satu fungsi bisa tinggal di satu layar yang sudah ada; jumlah layar
tidak harus sama dengan jumlah fungsi.

| fungsi PRD | layar |
|---|---|
| OPS-01 onboarding merchant + kurir partner | `ops/ops-onboarding.html` |
| OPS-02 moderasi tag | `ops/ops-moderation.html` |
| OPS-03 multiplier Quick · OPS-04 ambang notif | `ops/ops-settings.html` |
| OPS-05 program marketing | `ops/ops-programs.html` |
| OPS-06 rule dispute/kompensasi/punishment | `ops/ops-rules.html`, `ops/ops-disputes.html` |
| OPS-07 insiden & sengketa | `ops/ops-incidents.html`, `ops/ops-disputes.html` |
| OPS-08 flat fee Pc/Pm | `ops/ops-settings.html` |
| OPS-09 paket kuota order/COD | `ops/ops-quotas.html` |
| OPS-10 SP kurir partner | `ops/ops-penalties.html` |
| OPS-11 analitik + log | `ops/ops-analytics.html` |
| OPS-12 payout, pending refund, rekonsiliasi DANA | `ops/ops-liability.html` |
| OPS-13 parameter dispatch | `ops/ops-settings.html` |
| OPS-14 kurs harian + kegagalan update | `ops/ops-settings.html`, `ops/ops-ledger.html` |
| OPS-15 tinjauan alasan reject partner | `ops/ops-incidents.html` |

Istilah legacy yang sudah dihapus dari irisan ini: deposit COD, COD hold,
blacklist COD, `riskFlag` customer, putusan level-1, dan urutan tetap SP-1/2/3.
Punishment tetap boleh menyasar merchant, kurir, **atau customer** karena §18
PRD memang menyebut ketiganya; bentuk dan levelnya mengikuti rule.

Tiap berkas login memuat **tiga bingkai** — itulah tiga keadaan yang dirancang:
`1 · kosong`, `2 · salah`, `3 · sedang mengirim → berhasil`.

## Bentuk = acuan pemilik, bukan tafsiran baru

Bentuknya mengikuti acuan yang sudah disetujui (commit `d0eaa47`):
kepala **foto utuh**, badge merek, tab garis-bawah, tiga tombol sosial berlogo,
field putih, tautan lupa sandi, tombol utama di dasar layar.

| bagian | sumber |
|---|---|
| kepala foto utuh | `auth/login-1to1.html` (commit `d0eaa47`), dipatok `240px` |
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

1. **Satu perubahan di `auth/login.css` mengubah semua login; satu perubahan di
   `ops/ops.css` mengubah semua layar panel ops.** Jangan menyalin gaya ops ke
   berkas lain.
2. **Pesan validasi hanya dari `src/lib/schemas.ts`.** Butuh pesan baru? Tambahkan
   dulu di schema repo.
3. **Foto & logo hanya dari aset repo** (`../../../../public/…`). Tanpa aset baru,
   tanpa gambar eksternal.
4. **Auth tanpa skrip.** Satu-satunya JS di halaman auth adalah
   `onsubmit="return false"` supaya halaman tidak berpindah saat tombol ditekan.
   Panel ops memakai satu `ops/ops.js` untuk dropdown dan dialog; tanpa
   penyimpanan, tanpa dependensi.
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

Nilai di `auth/login.css` adalah **salinan** token `src/styles/_tokens.scss` (EDISI 02):

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
| `auth/login-1to1.html` | aktif | → `auth/signup-customer.html` |
| `auth/signup-customer.html` | → `auth/login-1to1.html` | aktif |
| `auth/login-merchant.html` | aktif | → `auth/signup-merchant.html` |
| `auth/signup-merchant.html` | → `auth/login-merchant.html` | aktif |

Dua layar USULAN (`ops`, `superadmin`) **tidak** memasang tab: repo
tidak punya rute daftar untuk peran itu (`App.tsx` hanya punya `/signup` dan
`/merchant/signup`), jadi tab `Daftar` di sana akan jadi kontrol mati. Tab yang
aktif menunjuk halamannya sendiri, bukan `href="#"`.

`auth/login-courier.html` juga tanpa tab, tapi dengan alasan berbeda: kurir tidak
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
`12px`/`4px`, dan tombol `16px` dari dasar: sama dengan `auth/login-merchant.html`
dan `auth/signup-customer.html`. Tab di posisi yang sama di ketiga layar (`y 292`),
jadi pindah layar tidak menggeser navigasi.

| bagian | nilai | alasan |
|---|---|---|
| bingkai | **390 x 942** (login merchant 844) | empat field + fieldset zona; di app halaman ini menggulir dokumen |
| field | Nama toko, Email, Nomor HP (opsional), Zona, Kata sandi | `MerchantSignUp.tsx:53-139` |
| zona | dua kotak radio 1:1 (Hijazi, Syimali) + petunjuk, terpilih = border oranye + `--orange-soft` | `MerchantSignUp.tsx:110-127`; PRD hanya punya dua zona, jangan diganti teks bebas |
| tab | `Masuk` → `auth/login-merchant.html`, `Daftar` aktif | menggantikan tautan `Sudah punya akun toko? Masuk`; label peran `Merchant` dilepas karena tab sudah menandai posisi layar |
| tombol | `Kirim pendaftaran`, `16px` dari dasar ketiga bingkai | sama dengan login |
| foto pengisi | **tidak ada** (`slot-art` hanya dipakai login merchant saat ada ruang kosong) | layar daftar sudah penuh |
| toast | **tidak ada** | `MerchantSignUp.tsx:45` langsung `navigate('/onboarding')` |

Terukur di 390x942: tiap bingkai `gap 16`, `cut 0`, `overflow-x 0`, tab `y 292`
sama dengan login, tab → field pertama `12px`. Bingkai "2 · salah" yang paling
ketat (tiga pesan sekaligus).

## Riwayat pesanan customer — `order-history.html`

Irisan dari acuan pemilik `Sa7tein Order History App Screen.png` (diskrip ulang
2026-10-31). Satu berkas, gaya inline, tanpa skrip, aset repo
(`../../../public/assets/…`). Ukuran diambil dari acuan, bukan dari selera.

Angka acuan (`852x1846` @2 → **426x923** CSS) dan hasil ukur di emulasi moli:

| bagian | acuan (CSS) | terukur | catatan |
|---|---|---|---|
| kolom | 426 | 426 | kartu `16–410`, gutter `16` |
| bilah status | `0–48` | **dihapus** | permintaan pemilik 2026-10-31: bingkai ponsel tiruan tidak dipakai di konsep |
| tombol kembali | `56–96`, lebar `40` | `y 61`, `40x40` | putih, radius `12`, bayangan tipis |
| track tab `Aktif/Riwayat` | `y 120,5–159` (h `38,5`) | `y 116`, h `38` | satu track pil abu `#E6E6F0`, bagian aktif oranye |
| chip saring | `y 180,5–213,5` (h `33`) | `y 178`, h `33` | `Semua` oranye penuh, sisanya putih bergaris |
| strip tanggal | h `39` | h `39` | latar `#E6E6F0`, radius `10`, label `13/700` |
| kartu 1 | `274–457` (h `183`) | `y 277`, h `181` | kepala `90`, baris item `50`, kaki `41` |
| kartu 2 | `511–690` (h `179`) | `y 513`, h `181` | |
| kartu 3 | `738,5–867` (h `128,5`) | `y 749`, h `126` | tanpa kaki aksi, baris item satu baris (`--tight`) |
| thumbnail | `84x70`, x `29` | `84x70`, x `29` | radius `12`, bukan persegi |
| lencana status | h `16`, x `124,5` | h `17`, x `124,5` | hijau `Selesai`, abu `Dibatalkan` |
| catatan kaki | `y 880` | `y 891` | terpusat, ikon jam |
| indikator rumah | `y 912` | `y 925` | tanpa navigasi bawah (acuan tidak punya) |
| overflow-x | `0` | `0` | |

Isi kartu: thumbnail, nama toko `17/700`, `kode · tanggal jam` abu `12,5`,
lencana, garis rambut, baris item (ikon tas + `n item pesanan` + daftar menu,
nominal `16/800` rata kanan), garis rambut, lalu kaki: bintang oranye + `4.8`
+ `· Sudah dinilai` | pemisah vertikal | `Pesan lagi` atau `Lihat detail`.

**Penyimpangan yang disengaja, dan alasannya:**

1. **Target sentuh di bawah 44px** (tab `34`, chip `33`, kaki `40`). Acuan
   memakai tinggi itu; mengikuti DNA 44px membuat layar melar ~40px dan tidak
   lagi 1:1. Berlaku hanya untuk irisan ini, bukan untuk `auth/` dan `ops/`.
2. **Palet acuan**, bukan token `_tokens.scss` apa adanya: latar `#F0F0FA`
   (token `--bg-warm` `#F4F4F6`), kartu `#FAFAFA` (token `--surface` `#FFFFFF`),
   track `#E6E6F0`. Warna merek tetap `#E44220`.
3. **Kartu 3 tanpa kaki aksi** karena acuan juga berhenti setelah baris item.
4. **Baris item kartu 3 satu baris**; acuan memberinya tinggi `36` sementara dua
   kartu lain `50`.

**Penyimpangan porting React (2026-11-01).** Setelah dipakai pada data nyata
(109 kartu, `SA-MV…`), ritme irisan terasa rapat: strip tanggal menempel ke
kartu, baris item hanya `8px` atas-bawah, dan antar kartu `12px`. Porting
melonggarkannya, semua lewat token:

| bagian | irisan | React (`src/styles/system/_order-history.scss`) | terukur 390px |
|---|---|---|---|
| strip tanggal → kartu | `4px` | `--space-2` (8px) | `8px` |
| antar kartu | `12px` | `--space-4` (16px) | `16px` |
| antar kelompok tanggal | `12px` | `--space-5` (20px) | `20px` |
| padding baris item | `8px 12px` | `--space-3` (12px) | `12px`, tinggi `49`/`64,1` |
| label strip tanggal | `13px` | `--text-sm` (15px) | `15px` |

Kartu tanpa item (`0 item pesanan`, riwayat impor) membuat `itemsLine()`
mengembalikan string kosong; `.oh-row__name:empty { display: none }` mencegah
span kosong memakan satu baris. Diukur: baris kosong `49px`, baris berisi
`64,1px`.

**Lencana status berwarna per tahap (deviasi dari irisan).** Irisan memberi satu
warna biru (`--info-soft`) untuk semua tahap berjalan, sehingga `Pesanan
diterima` dan `Sedang diantar` tak bisa dibedakan sekilas. Porting memetakan
lima tahap ke lima warna peran, tiap lencana bertitik (DNA MD-07):

| tahap | label | latar | teks |
|---|---|---|---|
| `baru` | Pesanan diterima | `--warning-soft` | `--warning-ink` (4,54:1) |
| `disiapkan` | Sedang disiapkan | `--info-soft` | `--info-ink` |
| `siap` | Pesanan siap | `--orange-soft` | `--orange-soft-ink` (6,4:1) |
| `diantar` | Sedang diantar | `--navy` | `--on-navy` |
| `selesai` | Pesanan selesai / Selesai | `--green-soft` | `--success-ink` |
| `canceled` | Dibatalkan | `--border` | `--text-secondary-strong` |

Kepala kartu juga diberi `padding-right: var(--space-6)` (24px) supaya nama toko
dan meta berhenti `6px` sebelum chevron; dengan `12px` sebelumnya teks berakhir
di `x 346` sementara chevron mulai di `x 340`.

**Jebakan selektor bersaudara.** Tab Aktif membungkus tiap kartu dalam `<div>`
sendiri (tempat tombol batal satu order), jadi `.oh-card + .oh-card` tidak pernah
cocok di sana dan jarak kartu jatuh ke **0px** walau aturannya ada. Pembungkusnya
kini berkelas `oh-active-item` dengan `margin-top: var(--space-4)`. Terukur pada
data stub 390px: tiga kartu, dua celah, masing-masing `16px`.

### Fitur yang aktif di `order-history.html`

Bukan gambar mati: satu blok `<script>` di akhir berkas menggerakkan seluruh
layar, tanpa dependensi.

| kontrol | perilaku |
|---|---|
| tab `Aktif / Riwayat` | mengganti daftar; `Aktif` memuat 2 pesanan berjalan (status + perkiraan + `Lacak pesanan`) dan menyembunyikan baris saring; `Riwayat` memuat 3 pesanan |
| chip `Semua / Selesai / Dibatalkan / Refund` | menyaring daftar; jumlah per kategori disimpan di `aria-label`, bukan di teks, supaya empat chip muat satu baris (terukur `clip 0`, total `328px` dari `346px` yang tersedia) |
| tombol cari (kaca pembesar, ujung kanan baris saring) | mengganti baris chip dengan kolom cari. Kata kunci dicocokkan ke **nama toko, kode pesanan, dan nama menu** (tidak peka huruf besar). Catatan kaki berubah jadi `n hasil untuk "<kata>"`, keadaan kosong menyebut kata kuncinya. `Esc` atau tombol `X` menutup mode cari dan mengembalikan fokus ke tombol. Menggantikan tombol urut lama: ikon sliders di acuan memang terbaca sebagai cari/filter oleh pemilik |
| kartu / chevron / `Lihat detail` | membuka sheet nota: item `qty × harga`, subtotal, ongkir, biaya layanan, tip, total, metode + status bayar, stempel `LUNAS` bila lunas, **`Uang diterima` + `Kembalian`** untuk pembayaran tunai (kembalian = uang - total, dibulatkan ke sen, hijau `--success-ink`), blok pembatalan (`Dibatalkan oleh`, alasan, pengembalian dana) untuk order batal |
| `Pesan lagi` | menutup sheet lalu toast `n menu dari <toko> ditambahkan ke keranjang.` |
| `Beri rating` | toast pembuka form ulasan |
| `Lacak pesanan` (tab Aktif) | membuka **halaman journey** `order-journey.html?order=<id>`, bukan sheet lagi |
| klik kartu pesanan aktif | juga ke halaman journey |
| ikon bantuan | sheet `Pusat bantuan` + tombol `Chat dengan CS` |
| tutup sheet | tombol `X`, klik latar, atau `Esc`; fokus kembali ke elemen pemicu |
| tombol kembali | `history.back()` bila ada riwayat halaman, selain itu toast |

Angka `Aktif 2` / `Riwayat 3` mengikuti data di berkas, bukan angka acuan
`28 / 109` yang hanya gambar. Total nota dihitung dari item + biaya
(`subtotal 6,00 + ongkir 0,90 + layanan 0,35 + tip 0,34 = 7,59`); order batal
`4,00 + 0,35 + 0,15 = 4,50` dibayar tunai `5,00`, jadi `Kembalian 0,50`.
`Uang diterima` dan `Kembalian` hanya muncul kalau `payment.cash` punya nilai,
jadi order DANA/transfer tidak menampilkan baris kosong.

### Gerak (MOTION 2, senior-fe)

Gerak hanya dipakai untuk menjelaskan perubahan keadaan, bukan hiasan. Seluruh
durasi/easing memakai token yang **disalin** dari `src/styles/_tokens.scss` ke
`:root` berkas ini (`--motion-fast` 140, `--motion-enter` 250,
`--motion-emphasis` 380, `--ease-standard`/`--ease-decelerate`), jadi tidak ada
angka karangan dan tidak ada `var()` yang tak terdefinisi.

| kejadian | gerak | nilai |
|---|---|---|
| tekan tombol ikon / chip / tutup sheet | mengecil sebentar | `scale(0.94)`, 140ms |
| tekan kartu | latar kartu | `--bg-warm`, 140ms |
| buka cari | chip memudar keluar lalu kolom cari tumbuh dari sisi kanan (`transform-origin: right center`) | opacity 140ms (tunda 60ms), skala 380ms |
| tab / chip berganti | daftar masuk dari bawah | `list-in`, 250ms, `--ease-decelerate` |
| buka sheet nota | panel naik dari bawah + latar memudar | panel `translateY(100%→0)` 380ms, latar opacity 200ms |
| toast | masuk dari bawah, keluar memudar | 250ms masuk, 140ms keluar |
| `prefers-reduced-motion: reduce` | semua durasi jadi 1ms | diukur `0.001s` |

Terukur di Brave headless (Chromium, 426x923): transisi kolom cari `opacity
140ms` + `transform 380ms` dengan nilai berjalan `matrix(0.94 …)` →
`matrix(0.956 …)` → `none`; panel sheet `transform 380ms` dengan `top` bergerak
`923 → 775 → 383`; `#sheet` memakai kelas `is-open`, bukan atribut `hidden`,
supaya ada keadaan awal untuk dianimasikan.

Gambar menu **tidak terlihat** di tangkapan moli (mesin itu tidak menggambar
gambar apa pun, lihat `Memeriksa`); rupa foto dinilai dari peramban biasa.

## Journey pesanan aktif — `order-journey.html`

Dibuka dari kartu tab `Aktif` di riwayat (`?order=a1|a2`). Ini layar kedua;
tidak ada di acuan pemilik, jadi isinya **disalin dari komponen app yang sudah
ada**, bukan dikarang:

| bagian | sumber di repo |
|---|---|
| label tahap + ETA + catatan kurir | `src/data/order-stage-copy.ts:9-43` (Baru/Disiapkan/Siap/Diantar/Selesai) |
| Journey Line (rel 2px, simpul 26px, `journey-fill` 620ms, `journey-pulse` 2s) | `src/styles/system/_tracking.scss:89-216` |
| ikon simpul | `src/components/JourneyLine.tsx:18-24` (clipboard-list, utensils, package-check, bike, house) |
| label kartu tunai `Tagihan tunai` / `Uang disiapkan` / `Kembalian` | `src/components/customer/CodCashSection.tsx:34-47` |
| teks bantuan tunai "Siapkan X, kembalian Y." | `src/data/codCash.ts:94-101` |
| nama kurir, nomor, rating | `src/data/merchant.ts:315` (Budi Santoso, `+6281234567890`), `courierRating: 4.7` |

**Yang aktif:**

| kontrol | perilaku |
|---|---|
| kartu status | teks tahap, `Estimasi siap/tiba`, catatan kurir, chip `Diperbarui langsung dari toko` (titik berdenyut) |
| Journey Line | simpul `done` hijau, `active` oranye berdenyut, `todo` abu; ruas menuju simpul aktif tumbuh dari kiri |
| pembayaran | order COD: tagihan `3,60 JOD`, uang disiapkan `5,00 JOD`, kembalian `1,40 JOD`; order DANA: total + metode + status |
| tombol telepon / chat kurir | memunculkan pop-up, bukan aksi sungguhan |
| pop-up perubahan status | naik dari bawah, `role="status"` + `aria-live="polite"`, bilah hitung mundur 6 detik, tutup lewat `X` |
| `Putar ulang simulasi` | mengembalikan tahap awal lalu menjalankan ulang timer |
| tombol kembali | pop-up ditutup dulu, baru `history.back()` (MD-13) |

**Simulasi realtime** (bukan dari server): tahap naik satu langkah setelah 5
detik, lalu tiap 9 detik sampai `Selesai`, dan tiap kenaikan memunculkan pop-up.
Order `a2` naik `Disiapkan → Siap → Diantar → Selesai`; `a1` hanya satu langkah
(`Diantar → Selesai`) karena sudah di tahap akhir.

**Terukur** (Brave headless, 426x923): pop-up `386x77` di `y 818`, `28px` dari
bawah, di dalam kolom (`insideColumn true`), hit-test titik tengah mengenai
pop-up sendiri; baris terakhir halaman (`y 766`) tetap **di atas** pop-up
(`818`) setelah `body.is-updating` memberi `padding-bottom: 116px`; tombol tutup
`32x32`; navigasi riwayat → journey menghasilkan `order-journey.html?order=a1`
dengan `ref SA-MVZ4R2KQ`; `Esc`/`X` menutup pop-up; dua kali kembali: pertama
menutup pop-up, kedua kembali ke `order-history.html`.

**Deviasi yang disengaja:** tombol tutup pop-up `32px` dan tombol kembali `40px`
(di bawah DNA `44px`, sama seperti irisan lain di folder ini); peta tidak
digambar karena Leaflet tidak dipakai di irisan statis dan peta palsu akan
mengarang data.

## Irisan beta — `beta/` (PRD `sa7tein-beta-2026-11-05`)

Lima layar akun M1. **Bentuknya bukan tafsiran baru**: kerangka dari acuan pemilik
`auth/login-1to1.html` (commit `d0eaa47`), atom dari prototype
`docs/design/v2-source/` (rujukan 1:1, `docs/design/ui-v2.md:12`).

| bagian | sumber | nilai terukur |
|---|---|---|
| kepala foto 240px + korsel 5 slide | `auth/login.css` `.hero`, `.carousel` | `y 0..240`, 5 slide, slide ke-5 duplikat pertama |
| tile merek 80px, menimpa foto 40px | `auth/login.css` `.brandmark` | `y 200`, tumpang 40 |
| tab garis-bawah `Masuk \| Daftar` | `auth/login.css` `.tabs` | `y 292`, indikator `inset 0 -2px` |
| field 44px, radius 10, `--shadow-card` | `auth/login.css` `.input` | `y 476`, h 44 |
| tombol di dasar layar | `auth/login.css` `.submit` (`margin-top:auto`) | `y 784`, `16px` dari dasar bingkai |
| kartu (`.card`) | prototype `NearbyDishes.tsx:98`, `OrdersTab.tsx:116` | putih + `--border` + radius 16 + `--shadow-subtle` |
| baris peran (`.role`) | prototype `OrdersTab.tsx:116` | kartu terpisah, jarak 8px (bukan satu kotak bergaris rambut) |
| chip (`.chip`) | prototype `NearbyDishes.tsx:49` | pil bertepi |

Layar anak (`kirim-kode`, `menunggu`, `pilih-role`) memakai bar atas berisi tombol
kembali 44px + wordmark repo, bukan kepala foto: layar akar yang butuh identitas
besar, layar anak butuh jalan kembali (MD-13).

**Deviasi yang disengaja, dengan angkanya:**

| deviasi | angka | alasan |
|---|---|---|
| teks putih di `--sa7tein-orange` | 4,12:1 | pengecualian identitas merek yang sudah diputuskan (`ui-v2.md:98`), bukan kelalaian. Versi sebelumnya di irisan ini sempat diganti `--orange-deep` (5,22:1) dan itu salah: mengubah keputusan pemilik tanpa dasar |
| tab aktif `--sa7tein-orange` di `--bg-warm` | 3,75:1 | **ikut acuan** (`login.css` `.tab--active`). Di bawah AA untuk teks 15px dan **belum ada keputusan pemilik**; dicatat sebagai temuan, bukan diubah diam-diam |
| chip aktif memakai `--orange-ink` di `--orange-soft` | 5,40:1 | prototype `#E44222` di `#FFEAE2` hanya 3,6:1 dan gagal AA untuk teks 11px |
| label seksi tanpa `uppercase` | — | MD-08 + ratchet `npm run scan`; prototype memakai `uppercase tracking-wider` (`OrdersTab.tsx:31`) |
| bingkai `menunggu` tidak pakai kepala foto | — | layar keadaan, bukan layar masuk |

**Terukur** (emulasi 390x844 di `beta/_measure.html`, 15 bingkai): `docOverflow 0`,
elemen keluar bingkai `0`, isi terpotong `0`, target di bawah 44px `0`. Bingkai
`daftar` nomor 3 memakai `390x906` (`.phone--tall`) karena disclosure terbuka.

**Batas kejujuran:** mesin ukur (moli) tidak bisa menggambar gambar apa pun
(`naturalWidth` selalu 0), jadi kepala foto dan tile merek selalu tampak sebagai
blok oranye/kotak putih di tangkapan layar pengukuran. Itu keterbatasan alat, bukan
gagal muat: keenam aset mengembalikan `200` dari server statis. Rupa foto dinilai di
peramban biasa.

**Alat ukur** `beta/_measure.html?page=<nama>`: bingkai 390px di dalam iframe 1000px
supaya seluruh bingkai + keterangan muat di viewport (hit-test tidak mengembalikan
`null` hanya karena tombolnya di luar bidang pandang). Berkas berawalan `_` dilewati
`slice-check`.

## Memeriksa

```bash
node scripts/slice-check.mjs    # kelas, token, aset, emoji, <script>, validasi, badge (folder auth/), korsel 5 slide (folder beta/)
node scripts/slice-index.mjs    # tulis ulang galeri index.html
```

Catatan jujur: moli (peramban headless untuk mengukur) **tidak bisa menggambar
gambar apa pun** (webp maupun svg; `naturalWidth` selalu 0) dan jam animasinya
beku. Foto kepala karena itu tidak pernah terlihat di tangkapan layar pengukuran
— yang terbukti di sana hanya geometri (kepala `322px`, badge `76px`, tombol
`24px` dari dasar, nol isi terpotong). Logonya bisa diperiksa dengan menyuntik
SVG-nya inline. Penilaian rupa foto harus dari peramban biasa.
