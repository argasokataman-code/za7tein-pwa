# Beranda Merchant — Restrukturisasi UI/UX · 2026-09-24

Tindak lanjut `saran-beranda-merchant-2026-09-24.md`. Tiga keputusan pemilik dikerjakan:
rentang "8 order terakhir", kartu "Tren 7 hari" dihapus, dan tiga angka antrean turun jadi baris teks.

Panduan: NeedMCP craft floor + playbook `operate`, `distill`, `layout`, `adapt`.
Dial dipertahankan: `ENERGY 2 / RHYTHM 1 / MOTION 1`.

---

## Yang berubah

| Blok | Sebelum | Sesudah |
|---|---|---|
| Kartu statistik | Grid 2×2, 4 kartu seragam 73/73/99/99px, semua nilai **17,01px** | Satu kartu pendapatan lebar penuh **167px** (angka **27,85px**) + baris teks antrean **44px** |
| Bentuk harian | Bar chart "Tren 7 hari" **371px** (2 bar chart, 2 caption) | Sparkline **34px** di dalam kartu pendapatan |
| Data keputusan | Tidak ada | Blok **Menu terjual** **193px**: peringkat 4 menu + bar + omzet |
| Halaman | 2190px | 2190px (turunan: lihat di bawah) |

**Tinggi halaman tidak turun**, dan itu benar: kartu pendapatan naik (167 vs 182 untuk empat kartu,
hampir sama) dan satu blok baru masuk (193px), sementara bar chart 371px keluar. Yang berubah
bukan panjangnya, tapi **apa yang terlihat pertama**: uang.

## Keputusan yang diambil

1. **Rentang disebut "8 order terakhir"**, bukan "sepanjang masa". Delapan order mock adalah sekitar
   setengah jam terakhir dan bisa saja satu kantor yang pesan bareng. Klaim "sepanjang masa" dari
   data ini tidak bisa dibuktikan (HG-04).
2. **Bar chart "Tren 7 hari" dihapus.** Sparkline menggantikannya. Menampilkan bentuk harian dua
   kali bukan kelengkapan.
3. **Tiga angka antrean jadi baris teks.** Dua di antaranya tetap tautan ke tab Order; ketiganya
   `--touch-min` 44px.

## Komponen baru

`src/components/ui/Sparkline.tsx` (76 baris) — satu seri sebagai `<polyline>` SVG, area di bawah
garis lewat `linearGradient` dari token oranye yang sama, tanpa library. `preserveAspectRatio="none"`
dengan `vector-effect: non-scaling-stroke` supaya garis tetap 2px walau viewBox diregangkan penuh.
Angka per titik tetap terbaca pembaca layar lewat `aria-label`.

## Verifikasi terukur (390×844 @2 dan 1440×900)

- Kartu pendapatan: **167px**, angka **27,85px** `tabular-nums`, sparkline **316px × 34px**
  (1440: 390px lebar kartu).
- Sparkline: `stroke` `rgb(241,90,55)`, `stroke-width` **2px**, 7 titik, dot r=3,
  `aria-label` = "Pendapatan tujuh hari terakhir dalam ribuan rupiah: 256000 total".
- Baris antrean: **44px** per item, tautan warna `--orange-ink` (`rgb(201,67,31)`), "Selesai" teks biasa.
- Peringkat: 4 baris, bar **316 / 211 / 105 / 105px**, peringkat 1 `chart-tone-bg--brand` dan
  sisanya `--muted`, baris **49px**.
- Angka: 6/4/2/2 porsi, Rp120.000/Rp88.000/Rp36.000/Rp12.000 — total **Rp256.000**, cocok dengan
  total order berjalan (Rp300.000 − Rp44.000 order ditolak).
- `overflowX` **0** di kedua viewport. Nol crash, nol console error.
- `browser-gate --route /merchant --route /merchant/insentif --pwa --strict` → **PASS 4/4**.

## Satu koreksi proses

Screenshot memperlihatkan nama menu dan angkanya seperti bertumpuk. **Rect DOM membuktikan
sebaliknya**: nama berakhir di x=208, angka mulai di x=220, jarak 12px, `overlap: 0`. Grid dua kolom
`171px | 133px` dengan area `"name figures" / "bar bar"` sudah benar. Yang terlihat adalah teks
**rapat**, bukan bertumpuk.

Perbaikannya tetap dilakukan, tapi sebagai perbaikan keterbacaan: padanan JOD dibuang dari baris
peringkat (`moneyPlain`, IDR saja), sehingga balok kanan menyusut dan jaraknya lega. Angka JOD-nya
sudah ada di kartu pendapatan. Dicatat sebagai `NEG-020`: jangan menyimpulkan tumpang tindih dari
screenshot, ukur rect-nya dulu.

## Gap jujur

- **`aria-label` dibaca pembaca layar nyata** belum diuji; yang terverifikasi hanya stringnya ada
  dan benar.
- **Sparkline `preserveAspectRatio="none"`** membuat kemiringan garis bergantung rasio kartu;
  terverifikasi di 390px dan 1440px, belum di lebar ekstrem lain.
