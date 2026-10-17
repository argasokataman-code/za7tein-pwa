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
| **MD-03** | **Satu penggulung**: dokumen. Jangan `overflow-y: auto` di dalam halaman. Pengecualian tunggal: sheet (panel `max-height` + isi menggulir di dalam) dan daftar panjang di dalam sheet yang dibatasi. | `browser-gate` cek scroller bersarang. |
| **MD-04** | Aksi utama di **zona jempol** (FAB kanan bawah / bilah bawah), bukan pojok kanan atas header. | Gate `--touch-min` + hit-test. |
| **MD-05** | Target sentuh ≥44px, jarak cukup antar target. | Gate hit-test, laporkan tinggi elemen. |
| **MD-06** | Sheet: **satu daftar pada satu waktu** (segmented kalau dua kategori), **baris list bergaris rambut** — bukan kartu putih berulang; tinggi dibatasi lalu menggulir di dalam. | `browser-gate` membuka panelnya sendiri (klik nyata bilah keranjang) lalu mengukur panel yang menempel tepi bawah: WARN (`--strict` → FAIL) bila >~60% viewport. |
| **MD-07** | Status = **chip bertitik warna peran**, bukan kata abu di dalam string `a · b · c`. Angka `font-variant-numeric: tabular-nums`; nominal **rata kanan sebaris judul**. | `browser-gate`: di dalam `.list-row`, nominal (kolom 2 baris 1) wajib `justify-self: end` dan berbeda ≤2.5px dari pusat judul. Chip bertitik: review + `npm run scan`. |
| **MD-08** | Tipografi **kalimat**, bukan eyebrow: tak ada `text-transform: uppercase` untuk label seksi. | Ratchet `uppercase` di `npm run scan` (hanya boleh turun). |
| **MD-09** | Bayangan/permukaan/tepi dari token (`--shadow-*`, `--surface`, `--border-strong`), bukan nilai karangan. | Ratchet `rawShadow` di `npm run scan`. |
| **MD-10** | Posisi elemen `fixed` **ditanya ke DOM** (`body:has(.bottom-nav) …`), jangan ditebak dari `pathname`. `/merchant/:id` juga ber-bottom-nav. | `browser-gate` hit-test titik tengah bilah bawah = elemen nav-nya (dilewati saat sheet terbuka, karena modal memang menutupinya). |
| **MD-11** | Baris daftar (nominal di kanan + status/aksi) memakai **satu rel kanan lebar tetap**, bukan `auto`: `.judul/.meta` di kolom 1, `.nominal/.chip/.cta` di kolom 2 (`justify-self: end`). Primitifnya `@include list-row` / kelas `.list-row` di `src/styles/system/_list-row.scss` — **jangan rakit flex/grid baris sendiri.** | `browser-gate`: lebar kolom 1 semua `.list-row` seinduk harus **satu nilai**; tinggi sel sejenis seragam (bukan 20/39). Kelas `.list-row` itu marker yang dibaca gerbang. |

## Gerbang mencetak checklist DNA, bukan cuma "PASS"

Tiap pengukuran `browser-gate` mengakhiri barisnya dengan daftar butir yang benar-benar diperiksa:

```
DNA MD-01✓ MD-02✓ MD-03✓ MD-05✓ MD-06✓ MD-07✓ MD-10✓ MD-11✓ · MD-04/MD-08/MD-09 lewat npm run scan + review
```

- **✗** = temuan (pesannya menyebut ID aturannya di atasnya).
- **—** = butir itu tidak punya apa pun untuk diperiksa di halaman itu (tak ada baris daftar / tak ada sheet / tak ada bilah bawah) — bukan "lolos".
- **✓** = benar-benar diperiksa dan lolos.

Dua hal yang membuat cek ini mungkin: (1) **panel dibuka otomatis** — MD-06/07/11 hidup di dalam sheet, jadi gerbang menekan bilah pemicunya dengan klik nyata lalu mengukur ulang sebagai baris `(sheet terbuka)`; (2) **marker `.list-row`** — kelas itu yang memberi tahu gerbang baris mana yang harus punya satu rel, sehingga tidak perlu menebak dari nama kelas per fitur.

Pengecualian yang ditulis DNA juga dihormati gerbang: scroller **di dalam panel sheet** sah (MD-03), dan MD-10 dilewati saat sheet terbuka (modal memang menutupi bilah bawah).

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
