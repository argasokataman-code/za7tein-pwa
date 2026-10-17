# Redesign kepala layar masuk (login)

Status: **sliced** untuk `/customer/signin`. Layar auth lain belum disentuh dan
masih memakai pita foto lama (`brandLayout="pill"`).

Acuan: mockup pemilik (frame "Login page" + "Login page - 1"). Yang diambil
bentuknya; merek, bahasa, dan klaimnya milik repo ini.

Berkas: `src/components/ui/AuthLayout.tsx` (prop `brandLayout`),
`src/styles/system/_auth-2.scss` (blok "hero"), `src/pages/SignIn.tsx`.

---

## Susunan

```
.auth-hero          blok oranye, sudut bawah --radius-2xl, 208-272px
├── .auth-hero-art   foto makanan, object-fit: cover, opacity 12%
├── .auth-hero-back  tombol kembali 44px, cakram putih kiri-atas
├── .auth-hero-disc  cakram putih 72px + tanda merek 40px
├── .auth-hero-name  "Sa7tein", --text-2xl / 800
└── .auth-hero-role  chip putih "Pembeli", teks --orange-ink

.auth-panel         --bg-warm (bukan --surface)
├── .auth-head       h1 "Masuk" + lede
├── .auth-tabs       Masuk | Daftar (pil aktif = --surface)
├── .auth-socials    Google | Facebook | X (toast mode demo)
├── .auth-or         "atau" + garis --border-strong kiri-kanan
└── .auth-form       nomor WA, kata sandi, "Lupa kata sandi?", tombol Masuk
```

Angka yang dipatok: kepala `clamp(208px, 30dvh, 272px)`, panel padding
`16 20 24`, tab dan tombol penyedia `min-height: var(--touch-min)`, jarak antar
kelompok `--space-4`. Diukur pada 390x844: dokumen 0px gulir, tombol "Masuk"
berakhir ~59px di atas dasar layar.

---

## Cara memeriksa

```bash
npm run lint && npm run build && npm run scan
GATE_BASE=http://localhost:4173 node scripts/browser-gate.mjs --route /customer/signin --strict --click
```

Hasil terakhir: scan `0 FAIL · 0 WARN`; gate 2/2 lolos (390px dan 1440px),
9/9 kontrol bisa diklik, overflow 0px, MD-12 bersih.

---

## Simpangan sadar dari mockup

| mockup | di repo | alasan |
|---|---|---|
| tiga tombol lingkaran berlogotype merek | tiga tombol berlabel teks | lucide 1.45 tak punya ikon merek; AGENTS §6 satu bahasa ikon, tanpa paket ikon lain |
| field putih tanpa garis, hanya bayangan | `field-shape` (permukaan + garis) | batas field hilang saat latar sama; token yang sudah jadi |
| placeholder saja, tanpa label | label di atas input | begitu terisi, tujuan field hilang |
| tombol "Continue" putih berteks oranye | tombol oranye merek, teks "Masuk" | di panel terang tombol putih hilang; label spesifik |
| nama merek hitam di atas oranye | `--text-primary` (28px/800, 3,8:1) | lolos AA untuk teks besar tanpa warna mentah baru |
| foto sandwich tumpah ke tepi kanan-bawah | foto jadi tekstur 12% di dalam kepala | foto yang menabrak CTA = tabrakan + kontras tak terjamin |
| banner janji produk (fitur repo lama) | dilepas di layar ini | menambah ~176px dan mendorong aksi utama ke bawah lipatan |

Kalau pemilik mau foto tumpah atau tombol berlogo merek, itu keputusan yang
harus diambil eksplisit (keduanya bertabrakan dengan aturan di tabel).
