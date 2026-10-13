# UI v2 — design system EDISI 02 ("Masakan Tetangga")

Dokumen ini menjelaskan **apa itu UI v2**, **aturan v2**, dan **cara menghapus/mengembalikannya**. Ditulis supaya siapa pun (termasuk agent berikutnya) tidak bingung kalau v2 nanti dibatalkan.

Status: **fondasi + beranda customer terpasang di branch `ui-v2`; layar customer lain belum diport.**
v1 utuh di `main` dan tag `ui-v1-stable`.

---

## 1. Kenapa ada

Client meminta desain baru. Keputusan pemilik 2026-10-12: **aturan repo tetap sama; yang berubah hanya bahasa visual** (pewarnaan, layout, animasi), harus **1:1** dengan prototype baru. Data dan logika (Irbid/JOD, Supabase, Redux) tetap milik repo.

Repo ini showcase UI/UX, jadi perubahan tema menyentuh semua role sekaligus lewat token global.

---

## 2. Sumber desain (1:1)

| | |
|---|---|
| Nama | `sa7tein - Masakan Tetangga` |
| Bentuk | Prototype AI Studio, React 19 + Tailwind v4, customer-only, satu halaman + 13 sheet |
| Path asli | `/Users/vanviakingali/Downloads/sa7tein---masakan-tetangga` |
| AI Studio | https://ai.studio/apps/fc9dff3a-b0be-44d4-a496-c710720b8e08 |
| Snapshot repo | `docs/design/v2-source/` (35 berkas, 300K) |

**Snapshot itu referensi saja, BUKAN kode yang di-build.** `npm run scan` hanya menyisir `src/`, jadi `docs/` tidak memengaruhi build, lint, atau gate. Jangan impor apa pun dari sana.

Prototype = **arah visual**, bukan spec fungsional. Ia tidak punya router, Redux, atau API; kontennya fiksi (Dago/Bandung, IDR). Yang diadopsi 1:1 adalah warna, layout, dan animasi, bukan datanya.

---

## 3. Rule v2

### Warna
| Peran | Nilai |
|---|---|
| Aksi merek | `--sa7tein-orange` `#E44220` |
| Hover aksi | `--orange-deep` `#C9361A` |
| Oranye-soft (chip/badge nonaktif) | `--orange-soft` `#FFF0EB` |
| Teks utama / nav | `--text-primary` / `--navy` `#172434` |
| Latar halaman | `--bg-warm` `#F4F4F6` |
| Permukaan kartu | `--surface` `#FFFFFF` |
| Tepi | `--border` `#E2E8F0`, `--border-strong` `#CBD5E1` |
| Teks oranye di latar terang (AA) | `--orange-ink` `#B83213` |

Status mengikuti hue prototipe: `--success` emerald `#059669`, `--warning` amber `#D97706`, `--danger` rose `#E11D48`, `--info` blue `#0284C7`, plus varian `-ink` dan `-soft`.

Varian oranye prototype ada dua (`#E44220`, `#E44222`) dan 4 nilai hover berbeda (`#d43717`, `#d03a1c`, `#c9361a`, `#DE3B1A`). Dinormalisasi jadi satu aksi + satu hover; hasil visual praktis identik.

### Radius
`--radius-xs` 8, `sm` 10, `md` 12, `lg` 16, `xl` 24, `2xl` 32, `pill` 9999.
Kartu/list 16, tombol besar 16, sheet/modal 32, badge/chip pill.

### Tipografi
`--font-sans` = **Plus Jakarta Sans** (selft-host `public/assets/fonts/plus-jakarta-sans.woff2`, variabel 400-800, subset latin). Inter dan Manrope tinggal fallback. Skala `--text-xs..2xl` tetap dipatok px (bukan `vw`), sesuai AGENTS §5.

### Layout (dari prototype)
- Gutter konten 20px (`--space-5`), konsisten.
- Header beranda: blok oranye `#E44220` dengan sudut bawah tumpul, diikuti kanvas putih.
- Kartu: border 1px + radius 16, tanpa shadow; shadow hanya lapisan terangkat.
- Bilah `position: fixed` tetap dibatasi kolom (AGENTS §5).
- Satu penggulung, dokumen saja.

### Motion
Pakai `--motion-*` dan `--ease-*` yang ada. Durasi masuk/keluar mengikuti token (`--motion-enter` 250ms, `--motion-exit` 200ms). Hormati `prefers-reduced-motion`.

### Batasan yang TETAP berlaku (aturan repo, tidak berubah)
- Tanpa emoji di UI; ikon `lucide-react`, `strokeWidth={1.75}`.
- Tanpa URL gambar eksternal; aset dari `public/assets/`.
- Tanpa gradient dekoratif atau warna di luar peran token — **kecuali** gradient banner promo yang tercatat (§5.5).
- Komponen/token existing dipakai sebelum menggambar ulang.
- `npm run scan` 0 FAIL, `npm run lint`, `npm run build`, `governance:check` lulus.

---

## 4. Delta EDISI 01 → 02

| Token | v1 | v2 |
|---|---|---|
| `--sa7tein-orange` | `#E8421A` | `#E44220` |
| `--orange-deep` | `#A83818` | `#C9361A` |
| `--orange-soft` | `#FDEDE8` | `#FFF0EB` |
| `--navy` / `--text-primary` | `#1A3A5C` | `#172434` |
| `--text-secondary` | `#59665F` | `#64748B` |
| `--bg-warm` | `#F8F9F7` | `#F4F4F6` |
| `--border` / `--border-strong` | `#E7ECE7` / `#D6DDD6` | `#E2E8F0` / `#CBD5E1` |
| `--font-sans` | Inter | Plus Jakarta Sans |
| radius xs..xl | 6/8/10/12/12 | 8/10/12/16/24 (+`2xl` 32) |
| shadow | navy `rgba(26,58,92,*)` | navy `rgba(23,36,52,*)` + brand `rgba(228,66,32,.28)` |

---

## 5. Keputusan + pengecualian yang disengaja

1. **Radius cap 12px → 32px** (keputusan pemilik 2026-10-12). Rule lama AGENTS §4/`DNA.md` menahan 12px; v2 butuh sampai 32 supaya 1:1. Sudah diperbarui di kedua dokumen. Alasan tercatat, bukan penyimpangan diam-diam.
2. **Kontras teks putih di atas oranye = 4.12:1** (di bawah AA 4.5:1). Pengecualian identitas merek, dipertahankan sejak 2026-09-24; angkanya diperbarui di `DNA.md`. Pasangan AA tetap dipakai untuk teks oranye di latar terang (`--orange-ink`, 5.99:1).
3. **Font swap Inter → Plus Jakarta Sans.** OFL, self-host, PWA tetap offline.
4. **Token dipakai semua role.** Ganti token = merchant/kurir/admin ikut berganti tema. 1:1 hanya bisa diverifikasi di layar customer (prototype customer-only).
5. **Gradient banner promo** (keputusan 2026-10-12). Alur repo tetap **pilih-toko dulu**; isi banner adalah **toko yang menunya sedang berdiskon** (`dealsFrom`), bukan kupon statis seperti contoh. Warna `--promo-from`/`--promo-to` (`#175273`/`#1D648B`) diambil apa adanya dari prototype; ini satu-satunya gradient di repo dan hanya dipakai `.home-promo`.
6. **Alur tetap, komposisi menyusul.** Karena beranda memilih toko (bukan menu langsung), section menu-prototype (grid "Pilihan di dekatmu", "Tetangga favorit" sebagai section beranda) tidak dipindah ke beranda; bahasa visualnya dipakai di halaman toko saat masuk. Banner promo, chip, kartu toko, dan bilah keranjang tetap ada di beranda.
7. **Kartu toko disamakan dengan daftar tetangga prototype** (foto 64px, satu baris tagline • jarak, baris promo, panah kanan). Badge buka/tutup dipertahankan karena repo menampilkan status toko nyata.
8. **Parallax penuh lintas layar customer** (keputusan pemilik 2026-10-13). Prototype tidak punya parallax, jadi ini tambahan di luar 1:1 — dicatat sebagai pengecualian CL-01, bukan penyimpangan diam-diam. Batasnya: satu properti `translate`, amplitudo 12-26px, `animation-timeline: view()` (compositor, bukan listener `scroll`), hanya `@supports` saat fitur ada, dan **mati total** saat `prefers-reduced-motion`. Lapisan di luar kelas `s7-parallax--*` dipasang lewat selector di `_parallax.scss` supaya tidak menyentuh 15+ halaman.

---

## 6. Status migrasi

- [x] Token EDISI 02 + font + `DNA.md` + AGENTS §4
- [~] Primitif + motion v2: umpan balik tekan, chip (skala kotak ikon + glow), kartu toko (angkat + zoom foto), kursor cari, sheet (`sheet-rise`)
- [~] Layar customer: **beranda** sudah diport — baris atas (alamat + kelompok kontrol kaca), banner promo toko berdiskon, chip selalu tampil, kartu toko gaya "tetangga favorit" (foto 64px + panah), bilah keranjang mengambang, bilah bawah
- [ ] Layar customer lain (pencarian, favorit, profil, keranjang, sheet detail)
- [ ] Role lain (merchant/kurir/admin) mewarisi token, verifikasi tidak pecah
- [ ] Aset gambar lokal (prototype pakai Unsplash; ganti `public/assets/`)
- [ ] Emoji toast di prototype diganti ikon lucide
- [x] **Parallax penuh lintas layar customer** (CL-01, keputusan pemilik 2026-10-13): kelas `s7-parallax--*` + lapisan otomatis (hero toko, foto banner, header halaman) di `_parallax.scss`; `translate` saja; mati saat `prefers-reduced-motion`
- [x] **Audit anti-slop 001** (`docs/design/anti-slop/audit-001-2026-10-13.md`) dikerjakan: lantai huruf mikro 12px, glow hanya untuk aksi primer, umpan hover dibungkus `@media (hover:hover)`, `backdrop-filter` bilah bawah dihapus

### Bahasa gerak v2 (diextrak dari prototype)

Prototype AI Studio memakai Tailwind v4 tanpa `@theme`, tanpa `@keyframes` custom, dan **tanpa plugin animasi** (`animate-in`/`slide-in-from-bottom` yang tertulis di kelasnya inert — tidak menghasilkan CSS). Jadi bahasa geraknya sangat ringkas; yang harus disalin:

| Perilaku prototype | Nilai | Padanan repo |
|---|---|---|
| Umpan balik tekan | `active:scale-95`–`98` | `--motion-fast` + `scale(0.97)` di `_interaction.scss` |
| Kotak ikon chip aktif | `scale-105` + glow oranye | `scale(1.05)` + `--shadow-brand` |
| Kotak ikon chip ditekan | `scale-90` | `scale(0.9)` |
| Kartu hover | `shadow-md` 200ms | `--shadow-md` + `--motion-standard` |
| Foto kartu hover | `scale-105` 300ms | `scale(1.05)` + `--motion-standard` |
| Varian tombol hero | `group-hover:scale-105`, chevron `translate-y-0.5` | transform di hero |
| Sheet masuk | backdrop fade 200ms + sheet slide 300ms | `backdrop-in` + `sheet-rise` (token) |
| Badge notifikasi/pesanan | `animate-pulse`/`bounce` (loop) | repo pakai `badge-pop` sekali (lebih tenang) |
| Kursor pencarian | `animate-pulse` 2px oranye | `s7-caret` `steps(1)` 1.1s |
| Parallax lapisan | tidak ada di prototype | `s7-parallax--hero/media/title/card/decor` + lapisan otomatis (CL-01, 12-26px, `translate` saja) |

Easing prototype = default Tailwind `cubic-bezier(.4,0,.2,1)`; repo memakai `--ease-*` yang setara. Tidak ada spring/overshoot eksotis. Loop dekoratif prototype (pulse/bounce terus-menerus) sengaja diganti gerak sekali-jalan supaya tidak mengganggu; semua hormat `prefers-reduced-motion` lewat `_motion.scss`.

---

## 7. Peta berkas yang menyentuh v2

| Berkas | Isi |
|---|---|
| `src/styles/_tokens.scss` | palet, radius, font, shadow EDISI 02 |
| `src/styles/_fonts.scss` | `@font-face` Plus Jakarta Sans + fallback |
| `public/assets/fonts/plus-jakarta-sans.woff2` | font selft-host |
| `docs/design/DNA.md` | kontrak visual (EDISI 02) |
| `AGENTS.md` §4 | skala radius v2 |
| `.rules.json` → `uiVersions` | status + aturan versi |
| `src/styles/system/_home-v2.scss` | banner promo beranda + bilah keranjang mengambang |
| `src/components/customer/HomePromoBanner.tsx` | banner promo (toko berdiskon) |
| `src/components/customer/CartQuickBar.tsx` | bilah keranjang mengambang |
| `src/api/catalog.ts` + `src/hooks/useApiCatalog.ts` | map `discount_percent`/`is_popular` + `useAllMenuItems` (banner akurat dari data live) |
| `docs/design/v2-source/` | snapshot prototype (referensi) |
| `docs/design/ui-v2.md` | dokumen ini |

---

## 8. Cara hapus / revert v2

v1 ada di `main` (commit `9661f5f`) dan tag **`ui-v1-stable`**.

### Skenario A: v2 belum di-merge ke main
```bash
git switch main
git branch -D ui-v2                 # lokal
git push origin --delete ui-v2      # remote (sekaligus mematikan preview Vercel)
```
Selesai. `main` tidak pernah tersentuh.

### Skenario B: v2 sudah di-merge ke main
Jangan `reset --hard` + force-push pada `main` bersama. Lebih aman kembalikan berkas dari tag:
```bash
git checkout ui-v1-stable -- \
  src/styles/_tokens.scss src/styles/_fonts.scss \
  docs/design/DNA.md AGENTS.md .rules.json
git rm -r --cached docs/design/v2-source docs/design/ui-v2.md  # opsional, dokumentasi
git commit -m "revert: kembali ke UI v1 (EDISI 01)"
```
Atau revert commit merge v2: `git revert -m 1 <merge-sha>`.

### Bersih-bersih sisa v2 (kalau mau total)
- Font: `git rm public/assets/fonts/plus-jakarta-sans.woff2`.
- Snapshot: hapus folder `docs/design/v2-source/`.
- Atlas: ubah status node keputusan v2 (lihat §9) jadi `archived`.
- Vercel: pakai Skenario A untuk mematikan preview `ui-v2`; kalau sudah merge dan ingin preview hilang, hapus branch di remote.

### Cara tahu versi mana yang aktif
- `git branch --show-current`: `main` = v1, `ui-v2` = v2.
- Nilai `--sa7tein-orange` di `src/styles/_tokens.scss`: `#E8421A` = v1, `#E44220` = v2.
- `--font-sans` awal `'Inter'` = v1, `'Plus Jakarta Sans'` = v2.

---

## 9. Rujukan

- `AGENTS.md` §4 (token + radius), §0b (skill `senior-fe` wajib untuk tugas UI).
- `docs/design/DNA.md` (kontrak visual).
- `.rules.json` → `uiVersions`.
- Atlas: node keputusan UI v2 (tag `ui-v2`).
