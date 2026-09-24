# Saran UI/UX Beranda Merchant — NeedMCP · 2026-09-24

Diminta pemilik: **saran detail proporsional sebagai merchant, bukan saran aplikasi generik.**
Panduan: NeedMCP craft floor + playbook `operate`, `layout`, `distill`, `adapt`.

> Reading as: **operate-mode dashboard** untuk **pemilik warung di HP, satu jempol, sambil masak**,
> dalam **sistem editorial hangat Sa7tein (oranye, krem, shell 430px)**, dial
> `ENERGY 2 / RHYTHM 1 / MOTION 1`.

---

## 1. Kenapa ide "menu paling disukai sepanjang masa" itu benar

Bukan cuma "fitur tambahan". Ada alasan struktural: **beranda sekarang memberi tahu apa yang
sedang terjadi, bukan apa yang harus dilakukan.** Pemilik warung tidak butuh tahu "2 order
diproses" untuk memutuskan apa pun. Ia butuh tahu **menu mana yang layak diperhatikan** — naikkan,
pertahankan, atau buang dari daftar.

Jenis data ini punya nama di playbook `operate`: **decision data**, bukan status data. Yang pertama
mengubah tindakan; yang kedua cuma laporan.

Dan data itu **sudah ada di repo, gratis**, tanpa mock baru:

| Menu | Terjual (8 order) | Omzet | Muncul di order |
|---|---|---|---|
| Ayam Geprek + Nasi | 6 porsi | Rp132.000 | 3 |
| Nasi Uduk Komplit | 6 porsi | Rp120.000 | 2 |
| Mie Goreng Spesial | 2 porsi | Rp36.000 | 2 |
| Es Teh Manis | 2 porsi | Rp12.000 | 1 |
| **Total** | **16 porsi** | **Rp300.000** | 8 |

Diturunkan dari `merchantOrders[].items` yang **sudah ada** (`CartItem.quantity × price`). Totalnya
cocok: Rp300.000 = jumlah `total` semua order mock. Nol angka karangan (HG-04).

**Satu jebakan yang harus dihindari:** menyebutnya "sepanjang masa" atau "terlaris". Delapan order =
30 menit terakhir, bisa satu kantor yang pesan bareng. Playbook `operate`: label harus jujur soal
rentangnya. Tulis **"Terjual (8 order terakhir)"** — atau tambah mock rentang lebih panjang
eksplisit kalau memang mau klaim "sepanjang masa".

---

## 2. Soal kartu pendapatan — pemilik benar, dan lebih tajam dari yang ia kira

Ember sekarang empat kartu seragam di grid 2×2 (audit-002 #2/#3): **Antrean 2 · Diproses 2 ·
Selesai 1 · Pendapatan Rp256.000**, dengan tinggi terukur **73 / 73 / 99 / 99px** dan **semua nilai
font 17,01px**. Artinya:

- **"Rp256.000" dan "2" dicetak sama besar.** Satu rupiah, satu unit porsi. Tidak ada hijarki.
- **Dua angka di baris atas itu nol informasi**: "Antrean 2" sudah tampil sebagai pil merah di
  tab Order bawah, dan "Diproses 2" adalah isi tab berikutnya. Beranda mengulang navigasi.
- Ember memakan **182px** dan setelah dibaca sekali **tidak mengubah tindakan apa pun**.

Playbook `distill` menuntut satu pertanyaan: *"apa satu hal yang harus dicapai layar ini?"* Untuk
pemilik warung, jawabannya **uang masuk + apa yang harus diperhatikan**. Bukan hitungan antrean.

**Jadi bentuk yang benar bukan "4 kartu grid", tapi berhenti jadi grid sama sekali:**

```
┌─────────────────────────────┐
│  Pendapatan                 │  label --text-sm, text-secondary
│  Rp256.000                  │  angka --text-2xl/3xl, tabular-nums  <-- 1 titik fokus
│  ▲ 7 hari · 8 order jalan   │  konteks, --text-xs
│  ▁▂▂▂▂▅▅                    │  sparkline 7 hari, tinggi 28-32px
└─────────────────────────────┘
   Antrean 2 · Diproses 2       baris teks tunggal 44px, bukan kartu
```

Tiga keputusan yang membuatnya bukan "aplikasi banget":

1. **Satu kartu pendapatan, lebar penuh.** Bukan 1 dari 4 kotak. Angkanya boleh 2–3× tinggi teks
   sekitarnya; itu satu-satunya focal point di layar ini (craft floor: *one focal point per screen*).
2. **Tiga angka sisa turun pangkat jadi satu baris teks.** Ukuran hurufnya lebih kecil, tanpa
   kotak, tanpa latar. Grid 2×2 hilang, jadi tinggi ember 182px → sekitar **44–56px**.
3. **Sparkline di dalam kartu pendapatan**, bukan bar chart terpisah. Konsekuensinya bagus:
   **kartu "Tren 7 hari" 371px bisa dihapus seluruhnya** — bentuk harinya sudah tampil di kartu
   pendapatan, dan bar chart penuh tidak lagi perlu. Ini menghemat ~400px sekaligus menghapus
   duplikasi (playbook `distill`: *"if it is said elsewhere, do not repeat it here"*).

Yang **tidak** boleh dikorbankan: angka rupiah tetap `tabular-nums` supaya tidak goyang saat
berubah, dan sparkline tetap punya `aria-label` berisi angkanya (craft floor: *browser surfaces* —
angka itu bagian dari desain, bukan sisa render).

---

## 3. Susunan yang disarankan (urutan = prioritas keputusan)

| # | Blok | Tinggi perkiraan | Kenapa di sini |
|---|---|---|---|
| 1 | Status buka + kuota | ~127px | Dua sakelar yang mengubah hari ini. Sudah benar, jangan utak-atik |
| 2 | **Pendapatan (kartu besar + sparkline)** | ~150–170px | Focal point. Yang pertama dilihat setelah status |
| 3 | **Terjual (peringkat menu)** | ~200–260px | Decision data: apa yang layak diperhatikan |
| 4 | Komposisi order (donut + bar COD/transfer) | ~395px | Konteks, bukan tindakan. Boleh turun |
| 5 | Modal & insentif (ringkasan) | ~185px | Uang platform, bukan uang hari ini |
| 6 | Order terbaru | ~250px | Aksi "Kelola" naik ke atas kartu ini (audit-002 #8) |

Sekarang 4 kartu putih sejenis bertumpuk berturut-turut (127/89/371/395) lalu 185. Playbook
`layout`: **tight groups, generous separation** — tapi yang sekarang terjadi adalah semua jarak
sama besar, jadi semua blok punya bobot yang sama (rhythm monoton). Perbaikannya bukan menambah
jarak, tapi **memisahkan dua kelas konten**: "hari ini" (blok 1-3) dan "catatan" (blok 4-6).

---

## 4. Bentuk blok "Terjual" — detail proporsional

Peringkat itu **daftar**, bukan grafik. Bar chart bertumpuk per menu salah karena satu-satunya hal
yang perlu dibandingkan adalah **urutan**, bukan proporsi presisi.

```
Terjual                        8 order terakhir
──────────────────────────────────────────────
Ayam Geprek + Nasi    ████████  6    Rp132.000
Nasi Uduk Komplit     ███████   6    Rp120.000
Mie Goreng Spesial    ███       2     Rp36.000
Es Teh Manis          ███       2     Rp12.000
```

- **Bar panjang relatif**, bukan donut: 4 baris yang dibandingkan lebih mudah dibaca sebagai daftar
  berperingkat.
- **Omzet di kanan**, karena pemilik menimbang menu dari uangnya, bukan dari jumlah porsi saja.
- **Bar maksimum 8px**, radius `--radius-xs`, nada `brand` untuk peringkat 1 dan `muted` untuk
  sisanya. Satu aksen (craft floor: *one deliberate accent*) — peringkat 1 yang disorot, bukan
  empat warna berbeda.
- **Baris `--touch-min` 44px** walau belum ada aksi: kalau nanti baris bisa diklik ke detail menu,
  tinggal dipasang tanpa mengubah geometri.
- Kalau ruangnya mepet: buang kolom omzet, sisakan bar + jumlah. Jangan perkecil font di bawah
  `--text-xs`.

**Yang wajib ada di blok ini:** kalimat interpretasinya. Angka peringkat tanpa bacaannya bukan
insight. Satu baris, contoh: *"Ayam Geprek menyumbang 44% omzet dari 3 order."* Itu yang mengubah
data jadi keputusan menu.

---

## 5. Yang disarankan **jangan** dilakukan

Playbook `operate` menyebut kegagalan khas product UI: **"strangeness without purpose"**.

- **Jangan** bikin kartu pendapatan berwarna oranye penuh. Oranye = aksi merek. Kartu besar cukup
  menang lewat ukuran angka, bukan latar. `--surface` + `--border-strong` seperti kartu lain.
- **Jangan** tambah grafik baru. Sparkline + bar peringkat = **dua bentuk visual**, dan keduanya
  menggantikan yang sudah ada, bukan menambah.
- **Jangan** simpan dua kebenaran: sparkline, kartu pendapatan, dan peringkat harus turun dari
  sumber yang sama (`merchantTrend` + `merchantOrders`), seperti yang sudah dijaga sekarang.
- **Jangan** pakai donut untuk peringkat. Donut cocok untuk komposisi bagian-dari-keseluruhan
  (status order), bukan perbandingan antar-item.
- **Jangan** menegakkan 430px di layar lebar untuk beranda ini kalau nanti data makin padat: dua
  kolom di ≥768px (kartu pendapatan kiri, peringkat kanan) adalah jalur yang wajar. Catat sebagai
  keputusan sadar kalau diambil.

---

## 6. Yang perlu diputuskan pemilik sebelum dikerjakan

1. **Rentang klaim "Terjual".** 8 order terakhir (data sekarang, label jujur), atau tambah mock
   rentang 30 hari supaya bisa klaim lebih panjang?
2. **Kartu "Tren 7 hari" dihapus** (sparkline masuk kartu pendapatan), atau tetap dipertahankan
   sebagai bar chart penuh? Menghapus menghemat ~400px tapi detail harinya lebih kecil.
3. **"Antrean/Diproses/Selesai"** benar-benar turun jadi satu baris teks, atau tetap kartu karena
   dua di antaranya tautan ke tab Order?

---

## Lampiran: bukti terukur (kondisi sekarang)

- Kartu statistik: tinggi **73 / 73 / 99 / 99px**, semua nilai **17,01px** (satu ukuran untuk
  rupiah dan porsi).
- Ember 4 kartu: **182px**; kartu "Tren 7 hari" **371px**; kartu komposisi **395px**; halaman
  **2215px**.
- Peringkat menu dari 8 order: 6/6/2/2 porsi, omzet Rp132.000/Rp120.000/Rp36.000/Rp12.000,
  total **Rp300.000** (cocok dengan jumlah `total` semua order mock).
- Data peringkat **sudah ada** di `CartItem.quantity`/`price` (`merchantOrders.ts`), nol mock baru.
