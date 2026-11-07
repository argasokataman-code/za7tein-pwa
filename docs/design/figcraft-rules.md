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

Gerbang memeriksa **pita tepi**, bukan satu ukuran: anak `Body` yang mengalir tidak boleh mulai
sebelum 20 px atau melewati `lebar - 20` (370 pada bingkai 390). Dua kartu berdampingan
(`20+168`, `202+168`) dan chip kecil memang sah, jadi aturan lama yang menuntut setiap anak
`x=20 w=350` diganti pemeriksaan batas ini (2026-11-07). Anak selebar bingkai (Action bar, Hero,
Overlay, Home indicator) dikecualikan.

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

Dua bentuk data yang dulu salah dibaca, sekarang diterima: gradien disimpan app sebagai
`type: "gradient"` (bukan `linearGradient`), dengan stop `{color:{r,g,b,a}, position}` — bukan
daftar string; gerbang menerima keduanya dan memakai stop **terburuk** untuk kontras (FR-22).
Isian gambar menyimpan `#D9D9D9` sebagai alas di bawah fotonya; alas itu tak pernah terlihat, jadi
tidak lagi dihitung sebagai warna UI.

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
pada semua bingkai (selubung perangkat) bukan UI dan tidak diperiksa. Enam nilai di luar skala
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

Gerbang mengenali nonaktif itu dari **warna**, bukan dari nama: kontrol yang dicat dengan token
`--text-disabled` (`#94A3B8`) dianggap memang tidak beraksi. Tombol *toggle* yang sah tanpa
navigasi (mis. `Button favorit`, `Button kurs`) masuk daftar pengecualian bernama — varian
berindeks (`Button favorit 1`) ikut pengecualian namanya.

Pengecualian itu **hanya membebaskan aksi, bukan ukuran**. Gerbang 2026-11-07 mengukur FR-24 dua
kali: node ber-aksi, dan node `Button*`/`Tombol*` tanpa aksi (kecuali yang memang nonaktif).
`Tombol*` ikut diukur karena stepper qty memakai dua `Tombol kurang`/`Tombol tambah` 32x32 yang
lolos hanya karena namanya bukan `Button`; lapisan hias di dalam kontrol ber-aksi (lingkaran
`Tombol` 36x36 di dalam `Back` 44x44) dilewati, sebab kliknya milik induknya. Sebelumnya
tombol yang masuk `DEAD_BUTTON_EXEMPT` tak pernah diukur, jadi `Button lacak` 90x36 lolos hanya
karena namanya dikecualikan. Fixture self-check (`scripts/figcraft-audit-check.mjs`) memuat
`Button Kecil Tanpa Aksi` 90x36 untuk memastikan lubang ini tidak kembali.

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

**FR-31.** Jangan mengoperasi seluruh dokumen (60 bingkai, 5 halaman) tanpa probe: ukur 1 bingkai, lihat angka,
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

**FR-38 (halaman, bukan file).** Satu file `design/*.figcraft` memuat beberapa **halaman**
(menu Pages), satu halaman per alur: `F21 · Auth & consent`, `F29 · Discovery`,
`F12 · Akun & inbox`, `F13 · Kurir`, `F16 · Onboarding merchant`. Jangan memecah alur menjadi
file terpisah: satu file = satu sumber kebenaran, dan halaman memisahkan alur tanpa
kehilangan tautan antar layar. Grid FR-37 dihitung **per halaman** (baris pertama tiap
halaman = baris bingkai teratasnya). Gerbang **wajib membaca semua halaman**, bukan hanya
halaman aktif: gerbang lama memakai `doc.current_page`, jadi memindahkan bingkai bermasalah
ke halaman lain membuatnya lolos tanpa jejak. Self-check menaruh hotspot 20×20 di halaman
non-aktif untuk membuktikan ini.

**FR-39 (ikon di kotak kecil wajib center).** Vektor yang induknya kotak ≤56×56 (tombol,
tile, checkbox) harus duduk di tengah: selisih `|dx|`/`|dy|` ke titik tengah ≤1 px. Kotak
besar (baris daftar, header, bar) tidak diperiksa karena di situ ikon memang menempel
kiri/kanan mengikuti teks. Kejadian nyata 2026-11-07: `Ikon pin` 20×20 di tile 40 diletakkan
di `(15,13)`, `Ikon kurs` 22×22 di tombol 40 di `(13,14)`, `Hati 1` di `(17.48,18.11)`, dan
`Plus 1` di `(19,19)` di tombol 44 — semua meleset 3,5–5 px dan tidak terlihat "salah" oleh
FR-15 (masih di dalam kotak) maupun FR-19 (ukurannya wajar, cuma posisinya). Pin putih di
atas tile putih bahkan tidak terlihat sama sekali: FR-22 mengukur teks, bukan isian ikon.

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

## 11a. Preflight desain (PRE-01..PRE-06)

Gerbang FR-xx mengukur **invarian**, bukan kepadatan, hierarki, atau kesesuaian dengan sumber.
Itu sebabnya bingkai bisa PASS sambil tetap "tidak detail": kejadian 2026-11-07,
`Pesanan / 1 · cart sebagai card` (4942) lolos audit dengan rel kemajuan dan `Pesan lagi`
selebar kartu, padahal `OrderHistoryCard.tsx:103-130` membagi kaki dua kolom dan
`OrderHistoryCard.tsx:28-40` memasang thumbnail 84x70. Bingkai itu harus dibangun ulang.

Urutan kerja wajib (PRE-01..PRE-06), **sebelum layer pertama dibuat**:

- **PRE-01 — muat skill.** `skill({name:"senior-fe"})`, lalu baca `docs/design/mobile-dna.md`.
  Tanpa skill, review rasa tidak punya takaran.
- **PRE-02 — anatomi bersumber.** Daftar elemen bingkai + `path:line` asalnya. Sumber ringkas
  dari percakapan, nama file, atau bingkai lama **tidak sah**. Untuk daftar/kartu:
  kepala (thumb, judul, meta, chip), baris isi (label, rincian, nominal), kaki (kiri/kanan), aksi.
- **PRE-03 — brief 8-12 baris.** Tujuan bingkai, state yang ditampilkan (tab mana, keadaan
  mana), elemen yang **sengaja tidak ada** (dan kenapa), angka geometri (padding, tinggi kartu,
  jarak antar blok, posisi nav).
- **PRE-04 — butir DNA yang diawasi.** Sebut nomornya: `MD-06` sheet satu daftar, `MD-07` chip
  bertitik + nominal sebaris, `MD-11` rel kanan seragam, `MD-12` tidak terpotong diam-diam,
  `MD-13` back/overlay. Bukan "mobile" generik.
- **PRE-05 — gerak diputuskan di awal.** Bagian 6 checklist: peta interaksi bingkai + transisinya
  (maju `push` 320 ms, kembali `dissolve` 220 ms, overlay/sheet `dissolve` 200 ms, tab `instant`),
  daftar yang **sengaja tidak dianimasikan** (tab replace MD-13, angka stepper, chip status),
  larangan animasi dekoratif (loop/parallax/auto-play, transisi layar > 400 ms), dan
  `prefers-reduced-motion`. Alasan: F29 sempat 91 interaksi `instant` semua, lalu motion ditempel
  serentak setelah bingkai jadi. `--approve` **menolak** checklist tanpa bagian 6 yang menyebut
  minimal 2 jenis transisi, durasi `ms`, dan `prefers-reduced-motion`; plugin
  `design-preflight` memeriksa hal yang sama sebelum mengizinkan mutasi FigCraft.
- **PRE-06 — postflight sebelum kata "selesai".** `get_node` untuk angka, `senior-fe` Delivery Gate
  (`HG`/`PG`/`QL`/`MD`), baru `npm run figcraft:audit`. Laporan menyebut ID temuan atau
  eksplisit "tidak ada temuan HG/PG/MD". Wajib juga: **screenshot + deskripsi** bingkai (jangan
  menilai dari JSON saja) dan **cek tumpang tindih kotak anak** dalam satu bingkai
  (irisan `x/y/w/h` > 0). Gerbang FigCraft tidak memeriksa tumpang tindih halus: 2026-11-07
  `Button lacak 2` duduk tepat di `y160`, menutup garis kaki, dan kotak `Label item` menimpa
  `Total pesanan` 26px tanpa satu pun temuan.

Konsekuensi praktis: satu bingkai bisa butuh 20-40 menit preflight (baca 2-3 berkas + tulis
brief) dan itu **lebih murah** daripada membangun ulang. Preflight yang dilewati bukan
"hemat token", ia memindahkan biaya ke revisi.

**Ditegakkan mesin, bukan ingatan.** `npm run design:preflight -- --frame "<nama>"` menulis
template `docs/design/preflight/<slug>.md`; `--approve` menolak checklist yang masih punya
`- [ ]`, kurang 2 rujukan `path:line`, kurang 4 butir `MD-xx`, atau brief tanpa angka, lalu
menulis `.design-preflight.json` (gitignored, berlaku 12 jam). Plugin
`scripts/opencode/design-preflight/index.ts` (symlink ke `~/.config/opencode/plugins2/`)
menolak tool FigCraft yang **mengubah** dokumen selama persetujuan belum ada/kedaluwarsa;
`get_node`/`inspect_*`/`list_*`/`screenshot` tetap boleh, supaya preflight sendiri bisa
membaca sumber dan mengukur. Log `/tmp/design-preflight.log`; self-check
`scripts/design-preflight-check.mjs` (ikut `npm run check:self`).

---

## 12. Enforcement (sudah ada)

1. **`scripts/figcraft-audit.mjs`** — gerbang mekanis FR-34/35. Membaca file `.figcraft`
   langsung (zip `document.json`), jadi tidak butuh aplikasi FigCraft hidup.

   ```bash
   npm run figcraft:audit                              # audit + ratchet, exit 1 kalau ada regresi
   npm run figcraft:audit -- --json                    # keluaran mesin
   npm run figcraft:audit -- --file design/lain.figcraft
   npm run figcraft:audit:baseline                     # perbarui baseline (menolak naik)
   npm run figcraft:audit:test                         # self-check: 12 pemeriksaan menangkap polanya
   FIGCRAFT_AUDIT_NO_UNZIP=1 npm run figcraft:audit    # pengurai zip internal
   ```

   Yang diperiksa: luberan keluar kotak induk, hotspot < 44 px, `dest` menggantung,
   tombol tanpa aksi, warna isian **dan garis** di luar token, radius di luar skala, jumlah
   kombinasi huruf, jarak tepi, bingkai tanpa jalan masuk, ikon melar (vektor senama), kontras
   teks (latar + opasitas dikompositkan), grid kanvas (FR-37: bingkai/caption/judul seksi di
   kolom 454 dan baris 1120 **per halaman**), `sizingH: "fill"` pada vektor (FR-20b, ikon
   melar), ikon di kotak ≤56×56 yang tidak center (FR-39), dan **semua halaman** file (FR-38,
   bukan hanya `doc.current_page`).

   Ratchet: `docs/design/figcraft-debt.json`. Angka hanya boleh turun; pelanggaran baru
   atau kenaikan = commit gagal. Baseline diisi sekali dengan `--force` dan sesudahnya
   `--update-baseline` menolak nilai yang lebih tinggi. Kunci baseline menyertakan nama
   halaman (`halaman|bingkai|lapisan|detail`), jadi bingkai bernama sama di halaman berbeda
   tidak saling menutupi.

   Jalan di pre-commit (blok "FigCraft audit") hanya kalau ada `design/*.figcraft`.

2. **Self-check** `scripts/figcraft-audit-check.mjs` — membuat file `.figcraft` sintetis berisi
   pelanggaran yang disengaja, lalu memastikan 12 pemeriksaan benar-benar menangkapnya (luberan,
   tombol mati, `dest` menggantung, hotspot 20×20, warna luar token, radius luar skala, kontras,
   ikon melar 158x14, bingkai di luar kolom 454, vektor `sizingH: fill`, ikon yang meleset dari
   tengah tile 40×40, chip tanpa padding), ditambah satu
   pemeriksaan bahwa **halaman non-aktif** ikut diaudit (hotspot 20×20 di `Page 2` sementara
   `current_page` = 1).
   Ikut otomatis di `npm run check:self`, jadi pre-commit menjalankannya.

**FR-40.** Teks di dalam **chip/pil** wajib punya padding: kotak teks tidak boleh selebar
bingkai chip-nya dengan x 0. Chip 24 px dengan teks 16 px berarti padding 4 px atas-bawah;
horizontal minimal 8 px per sisi.

Alasan: tanpa padding, huruf pertama dan terakhir menempel tepi melengkung dan chip terbaca
seperti teks yang diberi kotak, bukan label. Kejadian 2026-11-07: `Pil kategori` (60x24,
teks 60), `Pil jumlah menu` (70x24, teks 70), `Chip jumlah menu` (66x24, teks 66),
`Chip status aktif` (150x24, teks 150), dan `Chip zona`/`Chip stok habis`/`Chip nonaktif`.
Gerbang `chipFlush` hanya memeriksa bingkai beriisian bernama `Chip ...`/`Pil ...`, karena
bingkai lain yang teksnya selebar dirinya (blok teks `Layer`, tab) memang sah.

3. **Belum dibuat:** variabel lokal untuk 12 warna peran + 8 gaya teks. Setelah ada,
   `variable.bind` membuat perubahan token tidak perlu menyunting 60 bingkai.

### Status gerbang 2026-11-07

```
bingkai 60 · lapisan 2798 · interaksi 196 (navigate 167, back 29) · hotspot 189 · huruf 8
halaman 5: F21 · Auth & consent (18) · F29 · Discovery (22) · F12 · Akun & inbox (7) ·
           F13 · Kurir (3) · F16 · Onboarding merchant (10)
PASS — tidak ada temuan.
```

`docs/design/figcraft-debt.json` sekarang `checks: {}` (semua nol). Kalau angkanya naik lagi,
`npm run figcraft:audit` gagal dan pre-commit menolak commit. Rincian pemetaan 9 warna, 6 radius,
15 kontras, dan 6 bingkai varian: `docs/design/slice/README.md` bagian "Normalisasi token FigCraft".

