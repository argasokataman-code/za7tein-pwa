# Audit keseragaman role — 2026-09-24

Ruang lingkup: seluruh rute peran di `src/App.tsx`, diukur lewat
`node scripts/browser-gate.mjs --role all --json` (390px dan 1440px, tinggi
844px) dan pembacaan sumber untuk hal yang tidak bisa dilihat gerbang.

Tujuan dokumen: menetapkan **apa yang benar** sebelum menyamakan role lain.
Urutannya dokumen ini dulu, baru `DNA.md` diperbarui, baru role lain dikerjakan.
Kalau role disamakan lebih dulu, acuannya dokumen yang belum tentu benar.

---

## 1. Angka gerbang per role

| role | rute | FAIL | WARN |
|---|---:|---:|---:|
| customer | 41 | 0 | 96 |
| merchant | 11 | 0 | 0 |
| courier | 4 | 0 | 0 |
| admin | 5 | 0 | 2 |
| superadmin | 10 | 22 | 251 |
| non-app (`/`, `/documentation`) | 2 | 4 | 165 |

**Yang perlu dibaca dari tabel ini:** dugaan "semua role kagak ngikutin DNA
customer" **tidak terbukti untuk merchant, courier, dan admin**. Ketiganya 0
FAIL, dan merchant/courier 0 WARN sama sekali. Yang benar-benar gagal di gerbang:

- **superadmin** — 22 FAIL, semuanya `lebar kolom != min(viewport, shell)`.
  Ini bukan bug: keputusan PO 2026-09-23 menetapkan Super Admin sebagai website
  penuh non-PWA, jadi ia memang tidak memakai kolom 430px. Gerbang mengukurnya
  dengan aturan app; itu yang perlu dijelaskan, bukan diperbaiki.
- **non-app** — 4 FAIL, 2 di antaranya `scroller bersarang` di `/documentation`,
  yang memakai tata letak dokumen dengan penggulungnya sendiri.
- **customer** — 0 FAIL tetapi **96 WARN**, seluruhnya target sentuh legacy di
  bawah 44px (chip filter, `AddToCart`, saran pencarian, bintang rating, tombol
  teks kecil). Utang terbesar di repo justru milik role yang dianggap selesai.

Kesimpulan: **gerbang tidak melihat masalah yang dimaksud.** Ia memeriksa
struktur (lebar kolom, overflow, scroller, token runtime), bukan keputusan
visual — warna, hierarki huruf, bentuk header. Audit ini melanjutkan ke bagian
yang tidak dijangkau gerbang, dengan membaca sumber.

---

## 2. Yang benar-benar berbeda — terukur dari sumber

### 2.1 Header halaman: empat pola untuk satu pekerjaan

| role | kelas | pemakai | komponen bersama |
|---|---|---:|---|
| customer | `profile-flow-header` | 17 halaman | tidak ada (markup inline) |
| merchant | `merchant-header` | 11 halaman | `MerchantPageHeader.tsx` |
| courier | `courier-header` | 4 halaman | `CourierPageHeader.tsx` |
| admin | `admin-header` | 5 halaman | `AdminPageHeader.tsx` |

Tiga komponen `*PageHeader` itu **identik secara struktur**: prop sama
(`title`, `eyebrow`, `action`), markup sama (`{prefix}-header`, `-header-copy`,
`-eyebrow`, `-title`, `-header-action`), hanya awalan kelasnya berbeda. Itu tiga
salinan untuk satu pola.

Aturan yang dilanggar ada di `DNA.md` sendiri, bagian "Pola pengalaman wajib"
butir 2: *"Jika pola sama muncul dua kali, ekstrak komponen bersama."* Kalau
mengekstrak 17 halaman customer dirasa terlalu jauh, minimal tiga salinan
merchant/courier/admin itu sudah melanggar syaratnya sekarang.

Halaman customer yang memakai `profile-flow-header` juga tidak lewat komponen
sama sekali — ini kebalikannya: customer punya pola terbanyak (17 halaman) tapi
tanpa komponen, sementara tiga role lain punya komponen kembar.

### 2.2 Judul halaman: tiga ukuran untuk peran setara

`src/styles/system/_type.scss` memetakan 16 kelas judul lama ke dua aturan.
Yang **ikut** dipetakan:

- `admin-title` → judul hero (`--text-2xl`, bobot 800)
- `profile-flow-title`, `auth-title`, `favorites-title`, dan tiga lain → judul
  header (`--text-lg`, bobot 700)

Yang **tidak** ikut, dan karena itu masih menentukan ukurannya sendiri:

| kelas | ukuran sekarang | seharusnya |
|---|---|---|
| `merchant-title` (`system/_merchant.scss:44`) | `--text-xl`, bobot 800 | ? |
| `courier-title` (`system/_courier.scss:45`) | `--text-xl`, bobot 800 | ? |

Jadi tiga role yang sama-sama memakai header berpola `{role}-title` menghasilkan
tiga ukuran berbeda: admin `--text-2xl`, merchant `--text-xl`, courier
`--text-xl`, sementara customer `--text-lg`. Empat peran, tiga ukuran, dan hanya
satu yang ikut sistem.

`merchant-title` dan `courier-title` juga menulis `color: var(--text-primary)`
sendiri, padahal itu sudah peran token yang ditetapkan `_tokens.scss` — nilai
yang sama diulang di dua tempat.

### 2.3 Cacat nyata yang lolos dari gerbang

Tiga contoh yang diperiksa dan terbukti, semuanya di luar jangkauan gerbang:

1. **Header profil customer tidak terbaca** (diperbaiki `b2fd0cc`): nama
   `color: var(--on-brand)` putih di atas halaman krem, surel tanpa aturan
   `color` sehingga mewarisi biru tautan bawaan peramban. Terukur sebelum:
   nama `rgb(255,255,255)`, surel `rgb(0,0,238)`.
2. **Modal keluar tertutup bilah nav** (diperbaiki `232ac79`): modal dan
   `.bottom-nav` sama-sama `z-index 1000`, nav menang karena urutan DOM. Tombol
   terukur `t760-804` sementara nav mulai `t768` — 36px tertutup.
3. **Label kartu saldo dengan opacity menurunkan kontras** (diperbaiki
   `1c595bc`): `opacity: 0.85` di atas oranye menjatuhkan kontras dari 3,36:1
   ke sekitar 2,9:1, menambah masalah pada pasangan yang sudah di bawah AA.

Ketiganya ditemukan dengan membaca DOM, bukan dengan menjalankan gerbang.
Pola yang sama kemungkinan ada di role lain dan hanya akan ketahuan dengan cara
yang sama.

---

## 3. Usulan perubahan `DNA.md`

Bagian ini **diterapkan pada 2026-09-24**, di commit yang sama dengan dokumen
ini: §3.1 kontrak header halaman, §3.2 aturan judul dua jenis, §3.3 pengecualian
Super Admin, §3.4 peran gerbang, dan §3.5 batas pengecualian kontras.

### 3.1 Tambahkan kontrak header halaman

DNA sekarang tidak menyebut bentuk header halaman sama sekali — hanya menyebut
`BackButton` di daftar komponen. Tambahkan satu baris kontrak:

> **Header halaman** — satu komponen bersama untuk semua role. Judul berdampingan
> tombol kembali memakai `--text-lg`/700; judul tanpa tombol kembali di
> barisnya boleh memakai langkah lebih besar. `eyebrow` opsional dengan
> `--text-xs`/700/uppercase. Tinggi minimum mengikuti `--nav-height`, latar
> `--bg-warm`, jarak tepi `--space-5`.

### 3.2 Perjelas aturan judul halaman

Tambahkan ke tabel "Aturan visual wajib" pada baris Tipografi, supaya dua jenis
judul itu jadi kontrak dan bukan sekadar isi komentar `_type.scss`:

> Dua jenis judul menurut markup: judul **header** (ada tombol kembali di
> barisnya) `--text-lg`/700; judul **hero** (tidak ada) `--text-2xl`/800. Tidak
> ada ukuran ketiga untuk peran yang setara.

### 3.3 Catat pengecualian Super Admin secara eksplisit

DNA sekarang menulis shell 430px "pada lebar berapa pun" tanpa menyebut
Super Admin. Itu membuat 22 FAIL gerbang tampak seperti bug. Tambahkan:

> Pengecualian: `/superadmin/*` adalah website penuh non-PWA untuk owner/team,
> bukan app terinstal, dan **tidak** memakai kolom 430px. Ia diukur dengan
> aturan dokumen, bukan aturan app.

### 3.4 Perjelas peran gerbang

Audit ini menunjukkan gerbang melewatkan tiga cacat nyata (bagian 2.3) dan
menghasilkan 22 FAIL pada role yang memang dikecualikan. Tambahkan satu
peringatan di "Definition of done":

> Gerbang browser memeriksa struktur, bukan keputusan visual. Warna, hierarki
> huruf, bentuk header, kontras komposit, dan tumpang tindih lapisan **tidak**
> tertangkap olehnya dan wajib diperiksa dari DOM. Sebaliknya, FAIL pada role
> yang dikecualikan (Super Admin) bukan cacat.

### 3.5 Kontras: perluas pengecualian atau kurangi pemakaian

Pengecualian sadar 2026-09-24 mencatat putih di atas `--sa7tein-orange` = 3,36:1
dan mempertahankannya demi identitas merek. Setelah kartu saldo ditambahkan,
pasangan itu sekarang dipakai di **lebih banyak tempat**, termasuk label
sekunder berukuran kecil.

Dua jalan, perlu keputusan:

- **Pertahankan dan perjelas:** tambahkan bahwa pengecualian berlaku untuk
  **teks aksi dan nominal**, bukan untuk teks kecil beropasitas rendah; dan
  larang menambahkan penurunan di atasnya (`opacity`, warna lebih muda).
- **Kurangi pemakaian:** pindahkan label sekunder di atas oranye ke
  `--orange-soft-ink` atau setaranya supaya lolos AA, sisakan putih hanya untuk
  nominal dan tombol.

---

## 4. Urutan kerja setelah DNA diperbarui

Dokumen ini tidak menetapkan urutan role. Tapi tiga hal berikut bisa dikerjakan
berurutan tanpa saling menunggu, dari yang paling murah:

1. `merchant-title` dan `courier-title` masuk remap `_type.scss`; hapus
   `color` yang mengulang token.
2. Ekstrak tiga `*PageHeader` kembar jadi satu komponen.
3. Samakan header customer (17 halaman) ke komponen bersama itu, atau catat
   sebagai pengecualian sadar kalau memindahkannya dinilai tidak sepadan.

Belum dibuktikan oleh audit ini: kontras komposit seluruh rute, fokus keyboard,
seluruh state interaksi, dan apakah cacat seperti bagian 2.3 muncul juga di
merchant/courier/admin/superadmin. Yang terakhir itu hanya bisa dijawab dengan
membaca DOM tiap role, bukan dari gerbang.
