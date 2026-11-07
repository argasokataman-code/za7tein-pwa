# Aturan kerja FigCraft — Sa7tein beta v1

Tanggal: 2026-11-07
Scope: semua pekerjaan desain di `design/*.figcraft` (MCP `figcraft`, app `127.0.0.1:7979`)
Status: usulan aturan (belum di-enforce otomatis). Tiap aturan menyebut kejadian nyata yang jadi alasannya.

Dokumen ini menjawab satu masalah: pekerjaan FigCraft sering mlenceng, saling senggol, atau
merusak bingkai lain. Penyebabnya selalu salah satu dari 13 hal di bawah. Angka acuan diambil dari
`docs/design/slice/beta/beta.css` dan `src/styles/_tokens.scss`.

---

## 0. Acuan angka (jangan dikarang)

| Hal | Nilai | Sumber |
|---|---|---|
| Bingkai | 390 x 844 | acuan pemilik `slice/auth/login-1to1.html` |
| Jarak tepi | 20 (x=20, lebar isi 350) | `--space-5` |
| Kepala navy | tinggi 167, radius `[0,0,28,28]` | `_home` / slice |
| Kepala foto auth | tinggi 240, radius `[0,0,32,32]` | `beta.css:179` (acuan pemilik) |
| Body auth | y=240, tinggi 604, isi mulai 240 | `beta.css:235` |
| Bilah aksi | tinggi 84, `y = tinggiBingkai - 84`, tombol 20/52 | slice `.action-bar` |
| Target sentuh | 44 x 44 | `--touch-min` |
| Home indicator | 134 x 5, radius 3, x tengah, y = tinggi-12 | slice |
| Huruf | Plus Jakarta Sans, 8 kombinasi (13/15/16/17 Medium-SemiBold, 28 ExtraBold) | token + audit 022 |
| Radius | 8/10/12/16/24/32/pill | `_tokens.scss` |
| Kontras | 4,5:1 teks normal, 3:1 teks besar (>=24 px atau >=18,66 px bold) | WCAG AA |

---

## 1. Sumber kebenaran: HTML slice dulu, FigCraft kemudian

**FR-01.** Sebelum menggambar satu bingkai, baca irisan HTML-nya di `docs/design/slice/beta/<section>/`
dan CSS yang dipakai. Geometri di FigCraft harus berasal dari angka di sana, bukan perkiraan.

Alasan: HG-01 audit 022. Body auth dipindah ke `y=0, h=844` tanpa membaca `beta.css:235`
(`.body { flex: 1 }` setelah hero 240). Akibatnya kepala foto 240 px hilang di 7 bingkai selama
beberapa sesi, dan tidak ketahuan karena tidak ada yang membandingkan dengan sumber.

**FR-02.** Copy ditulis verbatim dari slice/PRD. Kalimat karangan ditandai `USULAN` di nama lapisan.

**FR-03.** Urutan kerja: PETA (baca slice + komponen yang ada) -> AUDIT (npm run scan tidak berlaku
untuk FigCraft, jadi pakai scan FigCraft di FR-24) -> UBAH -> VERIFIKASI.

---

## 2. Struktur bingkai: satu bingkai = satu layar, tiga pita

**FR-04.** Setiap bingkai punya paling banyak tiga pita: kepala (0..tinggi kepala), isi (flex),
bilah aksi (menempel bawah). Tidak ada bingkai dengan isi mengambang tanpa pita aksi.

**FR-05.** `Body` adalah satu-satunya anak flow bingkai; dekorasi (header navy, foto, scrim)
menjadi anak `absolute` di bingkai, bukan di dalam `Body`.

Alasan: susunan lama menumpuk `Hero foto` (absolute) dan `Body` (flow, isi penuh) sebagai dua
saudara seukuran bingkai. Saat `Body` diberi isi, ia menutupi hero. Aturan ini membuat urutan cat
tidak lagi jadi tebakan.

**FR-06.** Nama lapisan struktural tetap: `Header navy`, `Hero foto`, `Body`, `Appbar`,
`Title <judul>`, `Lead`, `Action bar`, `Button <aksi>`, `Home indicator`. Nama ini yang dipakai
skrip audit untuk mencari lapisan, jadi mengganti nama = memutus audit.

---

## 3. Auto layout vs absolute

**FR-07.** Isi yang mengalir (judul, lead, kartu, daftar) memakai auto layout: `layout`,
`gap`, `padding`, `mainAlign`, `crossAlign`, `sizingH`. Anak auto layout **mengabaikan `x`/`y`**,
jadi jangan menyetel posisi di dalamnya.

Alasan: percobaan menyetel `x` pada anak auto layout tidak berefek dan membuat perbaikan berikutnya
tampak "tidak jalan", lalu diulang berkali-kali.

**FR-08.** `absolute: true` hanya untuk: dekorasi (header/foto/scrim), bilah aksi, home indicator,
dan elemen yang memang menumpuk (badge di atas kartu). Setiap anak absolute wajib punya
`constraints`.

**FR-09.** Constraint ditentukan dari posisi, bukan selera:

| Posisi di induk | Constraint |
|---|---|
| menempel kiri dan kanan (lebar isi) | `leftRight` |
| menempel kanan saja | `right` |
| di tengah horizontal | `center` |
| menempel bawah | `bottom` |
| memenuhi tinggi | `topBottom` |

**FR-10.** Isi berlebar penuh memakai `sizingH: "fill"`, bukan lebar mati 350. Lebar mati adalah
penyebab isi terpotong saat bingkai menyempit (360: baris 350 harus jadi 320).

---

## 4. Urutan cat (z-order)

**FR-11.** Urutan anak = urutan cat: anak terakhir di atas. Susunan baku satu bingkai:
`Hero/Header -> Body -> overlay (dialog, sheet, scrim) -> Home indicator`.

**FR-12.** Kalau butuh urutan terbalik, pakai `reverseZ: true` di induk, jangan mengakali dengan
memindahkan anak ke induk lain.

**FR-13.** Lapisan berisi teks tidak boleh menjadi induk dari lapisan lain. `Body` yang menutupi
`Hero foto` lolos dari semua pemeriksaan ukuran karena keduanya "pas" di bingkai; yang salah cuma
urutan. Karena itu ada FR-24 butir cek piksel.

---

## 5. Reflow (responsif di dalam file)

**FR-14.** Sebelum menyentuh `sizing` atau `constraints`, uji satu bingkai perwakilan, bukan 34
bingkai sekaligus. Perubahan massal pada `Body` merusak semua keluarga layar yang punya susunan
berbeda (auth punya hero, app tidak).

**FR-15.** Bingkai harus lulus tiga ukuran: 390x844, 360x780, 320x568. Syarat lulus: 0 lapisan
keluar tepi **kanan**; luberan vertikal di 320 boleh (itu kasus gulir, bukan tata letak).

**FR-16.** Setelah mengubah ukuran bingkai, **tidak semua anak ikut menghitung ulang**. Paksa
reflow dengan menyentuh induknya: set lebar `w+1` lalu `w` lagi, atau `sizingH: "fill"` ulang.
Tanpa ini, hasil ukur 360 bisa menunjukkan sisa 1-2 lapisan yang sebenarnya sudah benar.

**FR-17.** `proto.settings responsive:true` hanya menyetel viewport pratinjau; ia **tidak**
me-reflow bingkai. Jangan mengklaim responsif berdasarkan pratinjau; reflow dibuktikan dengan
mengubah `width` bingkai lalu memindai.

---

## 6. Teks

**FR-18.** Satu paragraf = satu lapisan teks. Jangan memecah kalimat menjadi beberapa lapisan
untuk meniru tebal-di-tengah (FigCraft tidak punya rich text inline).

Alasan: HG-02 audit 022. Consent dipecah jadi dua lapisan teks, masing-masing membungkus sendiri,
total 82 px di dalam baris 44 px -> meluber 19 px. Di HTML itu satu paragraf `<strong>` inline
(`tambah-peran.html:116`).

**FR-19.** Teks yang membungkus (judul, lead, paragraf) memakai `textAutoResize: "height"` dan lebar
isi, bukan `fixed` tinggi. `truncate` hanya untuk satu baris yang memang harus dipotong (mis. nominal).

**FR-20.** Ukuran dan berat huruf hanya dari 8 kombinasi yang ada. Menambah kombinasi baru = sinyal
sistem huruf mulai kacau.

**FR-20b (ikon).** Vektor **tidak boleh** memakai `sizingH: "fill"` di dalam baris
`mainAlign: spaceBetween` — ia akan melar selebar sisa ruang dan mendorong teks di sebelahnya
terhimpit. Kejadian nyata: `Chevron` (2396) di `Verifikasi merchant / 3` jadi **158x14** (26x
ukuran sebenarnya 6x14) dan `Setiap hari, 09.00 - 21.00` pecah dua baris; gerbang lolos karena
bentuknya ikut melar sehingga tetap di dalam kotak dan tidak ada yang "keluar". Vektor senama
dibandingkan satu sama lain oleh gerbang (`stretchedIcon`, toleransi 2x); nama generik `Layer`
dikecualikan karena dipakai banyak ikon berbeda. Ikon di baris ber-`spaceBetween` memakai
`sizingH: "fixed"` dan lebar aslinya.

Kunci keduanya: **`sizingH: "fill"` pada vektor dilarang sama sekali** (gerbang `iconFill`).
Pemeriksaan pembanding di atas hanya melihat vektor yang **namanya sama**, jadi ikon yang
di-stretch seragam lolos: satu suntingan massal 2026-11-07 memberi `fill` ke 9 vektor dan
membuat lingkaran jadi elips tanpa satu pun temuan — gelembung chat `26x26 → 56x26`, ikon
`16x18 → 56x18`, centang `13x13 → 18x13`. Yang diperiksa sekarang mekanismenya, bukan
kemiripannya. Ikon di dalam `Mark`/`Checkbox` memakai `fixed` + ukuran asli, lalu dipusatkan
oleh `mainAlign`/`crossAlign` induknya.

---

## 7. Warna, kontras, radius, bayangan

**FR-21.** Warna hanya dari 12 peran token. Dilarang menulis heks baru "karena mirip".
Sisa oranye v1 `#E8441C` (27 isian) sudah disatukan ke `#E44220` pada 2026-11-07, jadi sekarang
gerbang menolak **setiap** heks yang tidak ada di `_tokens.scss` — 0 temuan.

**FR-22.** Kontras minimum: 4,5:1 (teks normal), 3:1 (teks >=24 px / bold >=18,66 px), 3:1 untuk
elemen non-teks. Garis tepi diperiksa dari **kedua** bentuk data (`stroke` dan `strokes[]`) — dulu
hanya `stroke`, jadi 43 garis `#E6E6EA`/`#EFF0F2` lolos; sekarang keduanya wajib token. Dua
pengecualian tercatat: putih di `#E44220` = 4,12:1 (keputusan merek,
`ui-v2.md:98`), dan teks putih di atas foto. **Opasitas ikut dihitung**: `#FFFFFF` @72% di navy
bukan putih penuh (hasil komposit `#BEC2C6`, 8,76:1) — gerbang mengompositkan opacity sebelum
mengukur, karena tanpa itu teks redup terlihat lolos padahal tidak.

**FR-23.** Radius hanya dari skala token `src/styles/_tokens.scss` (`--radius-xs` 8, `sm` 10, `md` 12,
`lg` 16, `xl` 24, `2xl` 32) atau pill (>=500, token 9999). Gerbang membaca skala itu langsung dari
file token, jadi menambah token radius otomatis melonggarkan gerbang dan sebaliknya. Radius `30`
pada 34 bingkai (selubung perangkat) bukan UI dan tidak diperiksa. Enam nilai di luar skala
(3/4/6/14/20/28, 260 lapisan) sudah dipetakan ke token pada 2026-11-07: 3 -> pill, 4/6 -> `xs`,
14 -> `md`, 20/28 -> `xl`. Utang radius sekarang 0.

---

## 8. Interaksi

**FR-24.** Satu lapisan = satu aksi. Aksi `back` menempel di kotak sentuh **44x44** (lingkaran
penuh), bukan di ikon 18x18 di dalamnya.

Alasan: HG-03. Tiga panah kembali hanya bisa diklik di vektor 18x18; klik di ring tidak melakukan
apa pun. Memindahkan aksi ke induk **dan** menghapusnya dari anak wajib dilakukan bersama, karena
dua aksi `back` di satu klik = mundur dua layar.

**FR-25.** `dest` pada `navigate` wajib id bingkai yang ada. Id bingkai dikumpulkan lebih dulu;
jangan mengarang atau memakai id lapisan.

**FR-26.** Setiap tombol harus punya tujuan, kecuali tombol nonaktif pada state yang memang
nonaktif (`Kirim ulang dalam 04:12`). Tombol nonaktif wajib terlihat nonaktif (tanpa isian/tepi
utama), supaya tidak terbaca sebagai tombol rusak.

**FR-27.** State error/kosong **varian** tidak perlu `navigate` masuk: ia dicapai dengan melakukan
halnya (mengetik nomor salah), bukan dengan klik. Syaratnya ada saudara seasal (teks sebelum ` / `,
mis. `Masuk / 1`) yang punya jalan masuk; gerbang memeriksa itu. Bingkai varian tetap **wajib**
punya tombol kembali kalau memang ada panah di gambarnya. Delapan bingkai yang dulu dilaporkan
(302, 358, 567, 588, 660, 979, 999, 1368) sekarang: 979/999 punya `back` yang benar, 1368 punya
`Back` yang diubah dari `navigate` ke `back`, sisanya varian sah. Tujuh panah `Back` di file ini
memakai aksi `back`, bukan `navigate` ke tujuan tetap, supaya riwayat prototipe tidak melompat.

---

## 9. Keselamatan operasi (biar tidak "crash")

**FR-28.** Simpan (`file.save` dengan path) sebelum dan sesudah setiap rangkaian edit besar.
Jangan menumpuk 20 perintah tanpa titik simpan.

**FR-29.** Kumpulkan edit sejenis dalam satu `batch` (satu langkah undo). Menyunting 10 lapisan satu
per satu = 10 langkah undo dan susah dibatalkan separuh.

**FR-30.** `parent` pada `node.create` harus **id angka**, bukan nama. Mengosongkan tinggi tidak
bisa `height: null`; pakai `minHeight: null` lalu `sizingV: "hug"`.

**FR-31.** Jangan mengoperasi seluruh dokumen (34 bingkai) tanpa probe: ukur 1 bingkai, lihat angka,
baru perluas. Perubahan massal yang salah butuh waktu paling lama untuk dibatalkan.

**FR-32.** Hapus lapisan lewat `edit.delete {ids}` (tidak ada `node.delete`). Sebelum menghapus,
pastikan id-nya dari hasil baca dokumen, bukan dari ingatan.

**FR-33.** Screenshot tidak bisa jadi bukti tunggal: skala render dibatasi (~1,9x) dan pratinjau
halaman mengecil (~0,13). Untuk memastikan warna/lapisan benar, ekspor `file.export {ids, format:"png", path}`
lalu periksa piksel, atau pakai `get_node`.

---

## 10. Verifikasi wajib sebelum bilang selesai

**FR-34.** Lima angka ini harus dicetak, bukan diklaim:

| Pemeriksaan | Ambang |
|---|---|
| lapisan keluar kotak induk (390) | 0 |
| lapisan keluar tepi kanan (360) | 0 |
| hotspot < 44 px | 0 |
| `dest` menggantung | 0 |
| tombol tanpa aksi | hanya yang nonaktif |

**FR-35.** Z-order dan gambar dibuktikan dengan piksel: ekspor satu bingkai, ambil titik yang
seharusnya berisi foto/header. Ukuran file ekspor juga penanda: hero yang hilang membuat PNG jauh
lebih kecil (37.687 B vs 182.323 B).

**FR-36.** Setelah perubahan struktural, ukur ulang bingkai lain yang berbagi keluarga
(auth 7 bingkai, app 27 bingkai), karena yang rusak biasanya bukan bingkai yang disunting.

**FR-37 (kanvas).** Bingkai, `Caption sub`, dan `Screen title` wajib duduk di satu grid:
kolom `x = n × 454`, baris `y = baris pertama + n × 1120`, caption 80 px di atas bingkai
kolomnya, judul seksi di `x0` dan 150 px di atas baris. Bingkai yang digeser 6 px dari
kolomnya ("mencong") tidak merusak isi bingkai mana pun, jadi gerbang FR-15/FR-24 lolos
diam-diam padahal kanvasnya berantakan. Kejadian nyata: `Verifikasi / 4` di `x1368`
sementara kolomnya `1362`.

---

## 11. Checklist ringkas (tempel di akhir kerja)

- [ ] FR-01 irisan HTML dibaca, angka dicocokkan
- [ ] FR-11 urutan anak: latar -> Body -> overlay -> home indicator
- [ ] FR-10 lebar isi `fill`, bukan 350 mati
- [ ] FR-15 lulus 390 dan 360 (kanan 0)
- [ ] FR-16 reflow dipaksa setelah ubah ukuran
- [ ] FR-18 tidak ada paragraf dipecah
- [ ] FR-21/22 warna token + kontras
- [ ] FR-24/25 hotspot 44, dest valid
- [ ] FR-28/29 simpan + batch
- [ ] FR-34/35 angka dan piksel dilampirkan

---

## 12. Enforcement (sudah ada)

1. **`scripts/figcraft-audit.mjs`** — gerbang mekanis FR-34/35. Membaca file `.figcraft`
   langsung (zip `document.json`), jadi tidak butuh aplikasi FigCraft hidup.

   ```bash
   npm run figcraft:audit                              # audit + ratchet, exit 1 kalau ada regresi
   npm run figcraft:audit -- --json                    # keluaran mesin
   npm run figcraft:audit -- --file design/lain.figcraft
   npm run figcraft:audit:baseline                     # perbarui baseline (menolak naik)
   npm run figcraft:audit:test                         # self-check: 10 pemeriksaan menangkap polanya
   FIGCRAFT_AUDIT_NO_UNZIP=1 npm run figcraft:audit    # pengurai zip internal
   ```

   Yang diperiksa: luberan keluar kotak induk, hotspot < 44 px, `dest` menggantung,
   tombol tanpa aksi, warna isian **dan garis** di luar token, radius di luar skala, jumlah
   kombinasi huruf, jarak tepi, bingkai tanpa jalan masuk, ikon melar (vektor senama), kontras
   teks (latar + opasitas dikompositkan), grid kanvas (FR-37: bingkai/caption/judul seksi di
   kolom 454 dan baris 1120), dan `sizingH: "fill"` pada vektor (FR-20b, ikon melar).

   Ratchet: `docs/design/figcraft-debt.json`. Angka hanya boleh turun; pelanggaran baru
   atau kenaikan = commit gagal. Baseline diisi sekali dengan `--force` dan sesudahnya
   `--update-baseline` menolak nilai yang lebih tinggi.

   Jalan di pre-commit (blok "FigCraft audit") hanya kalau ada `design/*.figcraft`.

2. **Self-check** `scripts/figcraft-audit-check.mjs` — membuat file `.figcraft` sintetis berisi
   pelanggaran yang disengaja, lalu memastikan 10 pemeriksaan benar-benar menangkapnya (luberan,
   tombol mati, `dest` menggantung, hotspot 20×20, warna luar token, radius luar skala, kontras,
   ikon melar 158x14, bingkai di luar kolom 454, vektor `sizingH: fill`).
   Ikut otomatis di `npm run check:self`, jadi pre-commit menjalankannya.

3. **Belum dibuat:** variabel lokal untuk 12 warna peran + 8 gaya teks. Setelah ada,
   `variable.bind` membuat perubahan token tidak perlu menyunting 34 bingkai.

### Status gerbang 2026-11-07

```
bingkai 34 · lapisan 1281 · interaksi 82 (navigate 66, back 16) · hotspot 80 · huruf 8
PASS — tidak ada temuan.
```

`docs/design/figcraft-debt.json` sekarang `checks: {}` (semua nol). Kalau angkanya naik lagi,
`npm run figcraft:audit` gagal dan pre-commit menolak commit. Rincian pemetaan 9 warna, 6 radius,
15 kontras, dan 6 bingkai varian: `docs/design/slice/README.md` bagian "Normalisasi token FigCraft".

