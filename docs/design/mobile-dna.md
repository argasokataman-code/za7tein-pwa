# Mobile DNA — aturan yang ditegakkan, bukan diingat

Sa7tein adalah **PWA mobile-first di dalam kolom ponsel**, bukan website yang menyusut. Aturan di
bawah ini bukan selera: tiap butir punya **cara memeriksa** yang menghasilkan angka atau FAIL. Rujukan
skill: `senior-fe` tier mobile (`SM-*`, `HG-04…HG-15`). Ringkasan aturan ini wajib ada di `AGENTS.md`
supaya ikut di tiap sesi tanpa perlu dipanggil.

Urutan kerja yang benar: **`npm run scan` dulu** (statik, ratusan milidetik), baru `browser-gate` untuk
yang mustahil dibaca dari berkas. Setiap klaim UI menyebut angka atau selector.

| ID | Aturan | Cara memeriksa |
|---|---|---|
| **MD-01** | Kolom ponsel dikunci `--shell-max` (430px) di lebar apa pun; jarak tepi satu nilai `--space-5`. | `browser-gate` (shell 430 @1440) + `overflow 0`. |
| **MD-02** | Elemen `position: fixed` wajib dibatasi kolom: `max-width: var(--shell-max)` + `margin-inline: auto`. | `browser-gate` FAIL bila bilah keluar kolom. |
| **MD-03** | **Satu penggulung**: dokumen. Jangan `overflow-y: auto` di dalam halaman. Pengecualian tunggal: sheet (panel `max-height` + isi menggulir di dalam) dan daftar panjang di dalam sheet yang dibatasi. Pengecualian kedua: permukaan yang **memang dibuka di konten terbaru** (thread chat) menandai akarnya dengan `data-open-at="latest"` — gulirnya disengaja, bukan warisan halaman sebelumnya. | `browser-gate` cek scroller bersarang + posisi gulir awal (dilewati bila penanda `data-open-at` ada). |
| **MD-04** | Aksi utama di **zona jempol** (FAB kanan bawah / bilah bawah), bukan pojok kanan atas header. | Gate `--touch-min` + hit-test. |
| **MD-05** | Target sentuh ≥44px, jarak cukup antar target. | Gate hit-test, laporkan tinggi elemen. |
| **MD-06** | Sheet: **satu daftar pada satu waktu** (segmented kalau dua kategori), **baris list bergaris rambut** — bukan kartu putih berulang; tinggi dibatasi lalu menggulir di dalam. | `browser-gate` membuka panelnya sendiri (klik nyata bilah keranjang) lalu mengukur panel yang menempel tepi bawah: WARN (`--strict` → FAIL) bila >~60% viewport. |
| **MD-07** | Status = **chip bertitik warna peran**, bukan kata abu di dalam string `a · b · c`. Angka `font-variant-numeric: tabular-nums`; nominal **rata kanan sebaris judul**. | `browser-gate`: di dalam `.list-row`, nominal (kolom 2 baris 1) wajib `justify-self: end` dan berbeda ≤2.5px dari pusat judul. Chip bertitik: review + `npm run scan`. |
| **MD-08** | Tipografi **kalimat**, bukan eyebrow: tak ada `text-transform: uppercase` untuk label seksi. | Ratchet `uppercase` di `npm run scan` (hanya boleh turun). |
| **MD-09** | Bayangan/permukaan/tepi dari token (`--shadow-*`, `--surface`, `--border-strong`), bukan nilai karangan. | Ratchet `rawShadow` di `npm run scan`. |
| **MD-10** | Posisi elemen `fixed` **ditanya ke DOM** (`body:has(.bottom-nav) …`), jangan ditebak dari `pathname`. `/merchant/:id` juga ber-bottom-nav. | `browser-gate` hit-test titik tengah bilah bawah = elemen nav-nya (dilewati saat sheet terbuka, karena modal memang menutupinya). |
| **MD-11** | Baris daftar (nominal di kanan + status/aksi) memakai **satu rel kanan lebar tetap**, bukan `auto`: `.judul/.meta` di kolom 1, `.nominal/.chip/.cta` di kolom 2 (`justify-self: end`). Primitifnya `@include list-row` / kelas `.list-row` di `src/styles/system/_list-row.scss` — **jangan rakit flex/grid baris sendiri.** | `browser-gate`: lebar kolom 1 semua `.list-row` seinduk harus **satu nilai**; tinggi sel sejenis seragam (bukan 20/39). Kelas `.list-row` itu marker yang dibaca gerbang. |
| **MD-12** | **Konten tidak keluar dari kotak induknya, dan tidak terpotong diam-diam.** Anak yang melewati content-box induknya (dan kontrol yang dipangkas kotaknya) = FAIL. Jangan andalkan `flex-wrap` bawaan: beri `min-width: 0` pada flex item yang harus menyusut, `flex-wrap`/`min-width: 0` pada kelompok chip, dan penjaga `max-width: 100%` + ellipsis pada label nav. | `browser-gate`: dua arah — (a) kotak ber-overflow `hidden`/`clip` dengan `scrollWidth > clientWidth` yang memangkas **kontrol**; (b) anak melewati content-box induk ber-overflow `visible` >2,5px. Keduanya FAIL. Pengecualian sah: **rail geser/carousel** (≥2 anak selebar hampir-penuh), bleed sengaja (margin negatif header, dekorasi `absolute`), art yang sengaja dipangkas di tepi membulat, `text-overflow: ellipsis`, `.sr-only`. |
| **MD-13** | **Riwayat & tombol back mengikuti aturan platform, bukan selera.** Back = batalkan aksi terakhir: overlay dulu, lalu navigasi, baru keluar app di layar akar. Tab tidak menumpuk di riwayat, layar sukses memakai `replace`, langkah bertahap mundur satu langkah, dan `navigate(-1)` hanya sah bila memang ada entri sebelumnya. | Review kontrak **NB-01…NB-09** (§ Riwayat & tombol back) + `browser-gate --back` (menyusul) yang memanggil `history.back()` lalu meng-assert URL dan keadaan overlay. |
| **MD-14** | **Restorasi & bfcache: saat back, keadaan halaman ikut kembali dengan benar.** Posisi gulir entri dipulihkan (baru = mulai atas), halaman dari bfcache (`pageshow.persisted`) menyegarkan data dan tidak menampilkan DOM basi, overlay yang dipulihkan sesuai keadaan terakhir, dan efek sekali-jalan tidak terpicu dua kali. | Review kontrak **NR-01…NR-06** (§ Restorasi & bfcache) + `browser-gate --back` (menyusul): `scrollY` ±8px, `pageshow.persisted`, overlay konsisten. |

## Riwayat & tombol back (MD-13)

**Sumber aturannya platform, bukan selera.** Android (Material 3, *back navigation* + *predictive back*):
back membatalkan aksi terakhir; di destinasi awal ia keluar app; overlay ditutup lebih dulu; perpindahan
antar tab tidak menumpuk di riwayat; alur bertahap mundur satu langkah. iOS (HIG): tidak ada tombol back
sistem, back **wajib** disediakan app, selalu pop satu level, dan app tidak boleh menutup dirinya sendiri.

**Pemetaan ke PWA ini.** Android `standalone`: tombol back perangkat = back browser = `popstate`, jadi
`history` aplikasi **adalah** stack native. iOS `standalone`: tidak ada back sistem dan edge-swipe tidak
dijamin, jadi kontrol back di layar wajib ada dan `history` tetap harus konsisten.

### Kontrak

| ID | Aturan |
|---|---|
| **NB-01** | Back = batalkan aksi terakhir. Urutan: **overlay terbuka → tutup overlay**, lalu **langkah alur → mundur satu langkah**, lalu **navigasi → layar sebelumnya**, dan hanya di **layar akar peran** ia keluar app (Android). |
| **NB-02** | Setiap overlay modal (sheet, dialog, celebration, lightbox, popup) **wajib menutup** lewat back dan **tidak boleh** menavigasi layar di bawahnya. Pola sah satu-satunya: `BottomSheet` (satu entri riwayat + `popstate` + Escape). |
| **NB-03** | Layar akar per peran: customer `/home`, merchant `/`, kurir `/` dan `/partner`, ops `/`, superadmin `/`. Di iOS **tidak ada** back sistem: semua layar non-akar wajib punya kontrol back yang terlihat. |
| **NB-04** | Pindah tab = **`replace`**, bukan `push`. Back dari tab non-awal kembali ke **root peran** (Home tab), bukan ke tab yang tadi dibuka, dan tidak keluar app. |
| **NB-05** | Layar sukses/terminal memakai **`replace`** supaya tidak bisa diputar ulang lewat back (lihat daftar). |
| **NB-06** | Alur bertahap (slide onboarding, langkah wizard, konfirmasi dua tahap) mundur **satu langkah**, bukan keluar alur. Kalau langkahnya masih state, ia tetap harus memetakan back. |
| **NB-07** | `navigate(-1)` hanya sah bila ada entri sebelumnya. Entri pertama (`history.state.idx === 0`, deep link / ikon home screen) wajib jatuh ke `to` eksplisit. |
| **NB-08** | Gulir **bukan** aksi back. Back tidak menggulir ke atas dan tidak mengubah posisi gulir. |
| **NB-09** | *Predictive back* (Android 14+) menampilkan tujuan sebelum jari dilepas. Jangan menaruh entri riwayat dummy untuk hal yang bukan navigasi/overlay; entri itu akan terlihat di pratinjau. |

### Klasifikasi rute (default: **stack**)

Hanya pengecualian yang didaftarkan. Rute baru yang tidak masuk daftar ini = stack biasa.

| Kelas | Rute | Perilaku back |
|---|---|---|
| **Root** | customer `/home` · merchant `/` · kurir `/`, `/partner` · ops `/` · superadmin `/` | keluar app (Android). iOS: tidak ada back, user pakai Home. |
| **Terminal** | `/order-placed` (bayar/COD selesai) · `/pin-success` · rating kurir selesai · kirim sengketa selesai · pencairan merchant/kurir selesai · `/merchant/pending` setelah "Buka beranda" · `/verification` selesai · `AccountSetup` selesai | masuk dengan **`replace`**; back tidak kembali ke form/sukses. |
| **Langkah** | slide `/onboarding` (customer, kurir, merchant) · `/checkout` → `/payment-selection` → `/payment-amount` → `/order-placed` · form sengketa (`/dispute-submit`) · pendaftaran merchant | back mundur satu langkah. |
| **Tab** | customer `/home` `/orders` `/favorites` `/profile` · merchant `/` `/orders` `/menu` `/couriers` `/settings` · kurir `/` `/tips` `/profile` · ops & SA sidebar | `replace`; back → root peran. |

### Yang wajib diperbaiki (audit 2026-10-30, `BUG-1108`)

Bukti terukur, bukan kesan: **76 `push` vs 7 `replace`** dari 88 `navigate()` di `src/pages` +
`src/components`; semua `<Link>`/`<NavLink>` push; **nol** `useBlocker`/`beforeunload`.

| Temuan | Bukti |
|---|---|
| Login bisa dibuka lagi lewat back setelah masuk (customer, merchant, kurir) | `SignIn.tsx:36`, `MerchantSignIn.tsx:27`, `CourierSignIn.tsx:49` push; `/signin` + `/onboarding` ada di `publicPaths` (`App.tsx:337-353`), `Onboarding.tsx` tanpa redirect "sudah masuk". |
| Pindah tab menumpuk riwayat (`NavLink`) | `BottomNav.tsx:61`, `MerchantBottomNav.tsx:12-26`, `CourierBottomNav.tsx:20-45`, `OpsShell.tsx:79`, `SuperAdminShell.tsx:122`. |
| 7 dari 8 overlay tidak menangkap back | Splash bayar `PaymentDana.tsx:348-380`, splash tugas kurir `CourierTaskDetail.tsx:347-372`, refund `OrderRefundCelebration.tsx:30-59`, `OrderCelebration`, alarm dispatch, popup notifikasi, install prompt. Hanya `BottomSheet.tsx:32-66` yang benar. |
| 24 `BackButton` bergantung `navigate(-1)` tanpa jaring | `BackButton.tsx:16-33`; 20 lainnya memakai `to` tetap. |
| Layar sukses yang masih push | `CartSummarySheet.tsx:87`, `MyOrder.tsx:101`, `RatingDriver.tsx:50`, `CreatePin.tsx:51`, `AddProfilePhoto.tsx:61,77,97`, `MerchantPayout.tsx:37`, `CourierPayout.tsx:48`. |
| Langkah yang di-skip back | tab `MerchantOrders.tsx:126,135` + `MyOrder.tsx:63-66` (`replace`), slide `Onboarding.tsx:29,61`, `DisputeSubmit.tsx:138` (`navigate(-1)` setelah kirim). |
| Posisi gulir tidak dipulihkan saat back | `usePageTransition.ts:41` memaksa `scrollRestoration = 'manual'` tanpa penyimpanan posisi per entri — back mendarat di atas halaman. |
| Halaman dari bfcache menampilkan data basi | tidak ada listener `pageshow` (`persisted`) di `src/` — `popstate` hanya ada di `BottomSheet.tsx`. |

### Cara memeriksa

Sampai `browser-gate --back` ada, tiap perubahan navigasi diperiksa manual (dan hasilnya ditempel di laporan):

1. buka rute → lakukan aksi sukses → `history.back()` → URL **harus** tujuan yang benar, bukan form sukses;
2. buka overlay → `history.back()` → overlay tertutup dan URL **tidak berubah**;
3. masuk dari deep link (tanpa entri sebelumnya) → back **tidak** boleh memblejet keluar app pada alur yang belum selesai;
4. pindah tab A → B → back → kembali ke root peran, bukan tab A dan bukan keluar app.

## Restorasi & bfcache (MD-14) {#md-14}

MD-13 menjaga **ke mana** back pergi. MD-14 menjaga **keadaan apa** yang muncul saat kembali. Keduanya
terpisah karena penyebabnya berbeda: MD-13 soal entri riwayat, MD-14 soal browser memulihkan halaman
(bfcache) dan posisi gulir.

| ID | Aturan |
|---|---|
| **NR-01** | Halaman **baru** (push) mulai dari atas. Back/forward memulihkan posisi gulir entri itu. `scrollRestoration = 'manual'` (`src/hooks/usePageTransition.ts:41`) hanya sah bila posisi tiap entri disimpan dan dipulihkan sendiri; kalau tidak, `manual` = kehilangan posisi. |
| **NR-02** | `pageshow` dengan `persisted: true` (halaman dipulihkan dari bfcache) **wajib** menyegarkan data: refetch sumber yang bisa basi, sambung ulang realtime, buang state "sibuk". Menampilkan DOM lama tanpa re-sync = FAIL. |
| **NR-03** | Overlay yang dipulihkan dari bfcache mengikuti keadaan terakhir yang dilihat user: sheet yang terbuka tetap terbuka dan tetap bisa ditutup back (entri riwayatnya ikut pulih), sheet yang sudah ditutup **tidak** muncul sendiri. |
| **NR-04** | Form yang belum dikirim boleh dipulihkan oleh bfcache; repo **tidak** membuat penyimpanan draft sendiri. Kalau halaman ter-render ulang (bukan bfcache) dan isian hilang, itu harus diterima dan tab/URL tidak boleh mengarang nilai. |
| **NR-05** | Halaman yang sengaja dibuka di posisi terbaru (thread chat, `data-open-at="latest"`) hanya memakai perilaku itu saat **masuk**, bukan saat back. Back ke thread = posisi terakhir user, bukan lompat ke bawah. |
| **NR-06** | Back tidak boleh memicu efek sekali-jalan (order, notifikasi, reservasi kuota) untuk kedua kalinya. Semua efek tipe itu idempoten atau ditandai sudah jalan (`paidHandled`, `expiredHandled`). |

**Cara memeriksa:** di `browser-gate --back` (menyusul): (a) gulir halaman, buka rute lain, `history.back()`,
lalu bandingkan `scrollY` dengan toleransi ±8px; (b) `Page.setBFCacheEnabled` + `history.back()` → cek
`pageshow.persisted` dan jumlah request penyegaran; (c) overlay dibuka → back → maju lagi → keadaan overlay
harus konsisten. Sampai gate itu ada, diperiksa manual dan hasilnya ditempel di laporan.

## Gerbang mencetak checklist DNA, bukan cuma "PASS"

Tiap pengukuran `browser-gate` mengakhiri barisnya dengan daftar butir yang benar-benar diperiksa:

```
DNA MD-01✓ MD-02✓ MD-03✓ MD-05✓ MD-06✓ MD-07✓ MD-10✓ MD-11✓ MD-12✓ · MD-04/MD-08/MD-09 lewat npm run scan + review
```

- **✗** = temuan (pesannya menyebut ID aturannya di atasnya).
- **—** = butir itu tidak punya apa pun untuk diperiksa di halaman itu (tak ada baris daftar / tak ada sheet / tak ada bilah bawah) — bukan "lolos".
- **✓** = benar-benar diperiksa dan lolos.

Dua hal yang membuat cek ini mungkin: (1) **panel dibuka otomatis** — MD-06/07/11 hidup di dalam sheet, jadi gerbang menekan bilah pemicunya dengan klik nyata lalu mengukur ulang sebagai baris `(sheet terbuka)`; (2) **marker `.list-row`** — kelas itu yang memberi tahu gerbang baris mana yang harus punya satu rel, sehingga tidak perlu menebak dari nama kelas per fitur.

Pengecualian yang ditulis DNA juga dihormati gerbang: scroller **di dalam panel sheet** sah (MD-03), dan MD-10 dilewati saat sheet terbuka (modal memang menutupi bilah bawah). MD-12 juga mengenali pola sahnya sendiri: rail geser/carousel (banner `/customer/signin`), art dekoratif yang dipangkas di tepi membulat (`.card-visual`), dan bleed sengaja (header bermargin negatif) tidak dilaporkan.

**Rute non-app tidak dicetak DNA-nya.** `/` (landing) dan `/documentation` adalah website penuh, bukan permukaan app (`navigateFallbackDenylist`; AGENTS.md §1), jadi kolom 430px, target sentuh, dan kotak kartu tidak berlaku di sana — gerbang mencetak satu baris "DNA dilewati" dan tetap memeriksa **overflow-x**. Empat peran PWA + konsol SA tetap diperiksa penuh.

**Gerbang menunggu halaman diam sebelum mengukur.** Data daftar mendarat dari BE setelah render pertama; mengukur terlalu cepat = mengukur layar loading, dan gerbang melaporkan "lolos" untuk DOM yang belum ada. Gerbang menuntut 3 sampel identik berturut-turut (≥0,35 dtk) sebelum mengukur.

## Yang TIDAK bisa di-lint — dan cara menutupnya

Rasa tak bisa di-lint. Ratchet `npm run scan` menangkap **tell** (uppercase, bayangan karangan, nilai
mentah), bukan "jelek". Tiga langkah penutupnya:

1. **Ukur, jangan nilai dari gambar.** `node scripts/browser-gate.mjs --route <path> --strict --click` —
   lebar kolom, gutter, overflow-x, scroller bersarang, tinggi hasil render, hit-test klik.
2. **Visi hanya untuk yang tak terbaca angka**, dan lewat proxy: `gdescrib <png> "<fokus>"`. Deskripsi
   visi tetap **wajib diverifikasi** dengan angka (visi pernah menyebut kaki kartu asimetris, padahal
   terukur 17/17).
3. **Bandingkan dengan sumber, bukan selera.** Angka pembanding datang dari `_tokens.scss` dan
   `AGENTS.md`, bukan dari "kelihatannya bagus".

## Kesalahan nyata yang melahirkan aturan ini

| Kejadian | Akar | Aturan |
|---|---|---|
| Bilah keranjang menimpa bilah bawah di `/merchant/:id` (gap −56px) | posisi ditebak dari `pathname` | **MD-10** |
| Sheet ringkasan melar 799px (≈90vh) berisi kartu nyaris identik; pemilik menilai "gede banget, AI slop" | dua bagian bertumpuk + kartu berulang, bukan satu daftar | **MD-06** |
| Label `PESANAN BERJALAN` + dua heading tumpang tindih | eyebrow uppercase | **MD-08** |
| Kartu putih polos berjarak longgar jadi "generik" | bayangan/permukaan karangan, bukan token | **MD-09** |
| Nama toko sama tak bisa dibedakan; harga bertingkat tak sebaris | tak ada pembeda waktu; nominal tak sejajar judul | **MD-07** |
| Sheet ringkasan: 9 dari 13 baris meta membungkus (tinggi 39 vs 28), kode ikut terpotong, tepi kanan kiri bergerigi (268 vs 277) — pemilik: "gak simetris" | nominal + chip + kode + waktu dijejalkan ke satu kolom kiri; rel kanan lebarnya `auto` sehingga mengikuti isi | **MD-11** |
| Slip order merchant: baris badge (Regular/Baru/Menunggu bayar) meluber **89px** lalu dipangkas `overflow: clip` di level shell — chip-nya hilang, dan gerbang lama tak melihatnya (ia hanya memeriksa overflow tingkat **halaman**, yang 0 karena sudah dipangkas). Pemilik: "ada yang keluar dari card masih gak kedeteksi" | `.merchant-ticket-stub-end` `inline-flex` tanpa `flex-wrap`/`min-width: 0`, dipaksa satu baris bersama kode order | **MD-12** |
| Label nav admin ("Onboarding") melebar **5–9px** keluar kotak itemnya; badge kartu `.admin-history` **3px**; kolom cari `.sa-search` **24px**; kotak izin SA barisnya **32px** (target < 44px); halaman terbuka di tengah (**scrollY 517px**) saat dimuat ulang | lima item nav di 390px menyisakan 78px/item sedangkan padding 16px memangkas isi jadi 46px; flex item tanpa `min-width: 0` tak menyusut di bawah min-content; `.sa-search` di-`flex-shrink: 0`; `min-height` 32px; `history.scrollRestoration` bawaan peramban memulihkan gulir pada memuat ulang | **MD-12**, **MD-05**, **MD-03** |
| Customer bisa membayar berkali-kali: selesai bayar, back sistem memutar ulang layar bayar berisi item yang sama; tombol kembali dari beranda mendarat di halaman login walau sesi aktif | layar bayar tidak terminal (push, tanpa kunci kirim, keranjang tak dikosongkan), rute auth tetap publik setelah masuk | **MD-13** (`NB-01`, `NB-05`) |
