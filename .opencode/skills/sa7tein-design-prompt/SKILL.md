---
name: sa7tein-design-prompt
description: >
  Prompt engineering untuk mockup UI/UX Sa7tein (dashboard, layar peran,
  komponen baru). Menyusun prompt bergaya "art-direction brief": kunci brand DNA
  + data asli repo, tapi BEBASKAN komposisi supaya generator menghasilkan desain
  designer-quality — bukan wireframe kaku. Pakai saat: bikin prompt desain
  Sa7tein, prompt Gemini/generator untuk layar atau dashboard, redesign panel CS,
  mockup UI, "minta desain dari Gemini". Bukan untuk foto/produk — itu skill
  prompting-generate-image-gpt.
metadata:
  audience: design, frontend
  workflow: image-generation
  opencode/slash: "true"
---

# Sa7tein Design Prompting — art-direction, bukan wireframe

Sumber nilai brand: `docs/design/DNA.md` + `src/styles/_tokens.scss`.
Sumber data: `src/data/*` (nilai asli). Sumber peran/layar: `docs/plan-*.md`, `docs/design/flows/`.
Backend gambar: skill **`generate-image-gemini`** (`gemini-rs`).

## Ruang lingkup — REPO INI SAJA

Skill ini **milik repo Sa7tein saja**. Ia tinggal di `.opencode/skills/` (project-local)
dan hanya berlaku saat bekerja di repo ini.

- **Jangan** menyalinnya ke global (`~/.config/opencode/skills/`), ke `~/.claude/skills/`,
  atau ke repo lain.
- **Jangan** memakai palet/token/data Sa7tein untuk project lain.
- Tiap project punya DNA sendiri; prompt desain untuk repo lain dibangun dari
  `docs/design/DNA.md` repo itu, bukan dari sini. Kalau repo target tak punya DNA,
  tanya user — jangan pinjam milik Sa7tein.

## Prinsip inti (pelajaran nyata 2026-10-11)

Prompt yang **menuliskan layout** — posisi tiap kartu, urutan tile, grid — membuat
generator jadi tukang ikut perintah. Hasilnya kaku, kering, "wireframe berwarna".
Prompt yang **memberi data + batas brand, lalu membebaskan komposisi** menghasilkan
desain yang jauh lebih baik: generator berperan sebagai desainer, bukan pelaksana.

> Aturan: **art-direction brief, bukan wireframe.** Kunci yang HARUS, bebaskan yang
> sebaiknya. Kalau kamu menulis "kartu A di atas, lalu B di kanan C" — itu bug
> prompt.

## Pembagian: HARD vs FREE

| HARD (kunci, tak bisa ditawar) | FREE (biarkan generator memutuskan) |
|---|---|
| Palet & peran warna dari DNA | Komposisi & susunan section |
| Tipografi (Inter), flat, no gradient | Bentuk/gaya kartu, densitas, whitespace |
| Nama brand Sa7tein | Hierarki visual, mana yang di-highlight |
| **Data asli repo** yang wajib tampil | Cara memvisualkan data (tabel/chart/feed) |
| Bahasa label (Indonesia) | Urutan, grouping, ikon pendukung |
| Viewport render (1440×900 atau 430px) | Aksen, card style, mikro-detail |

Bila user secara eksplisit minta "strict/persis layout X" → baru persempit. Default: longgar.

## Anti-slop — muat `senior-fe`

Repo ini showcase UI/UX (§0b AGENTS). Setiap prompt mockup **juga** memuat skill
`senior-fe` dan menuliskan filter-nya ke dalam prompt, karena generator default ke
pola slop kalau dibiarkan.

- **QL-02 palette cap**: netral dominan + maksimal **satu** aksen (+ warna status
  yang benar-benar bermakna). Menulis "tiap kartu warnanya beda" tanpa alasan =
  **rainbow slop**. (Pelajaran nyata 2026-10-11: instruksi "tiap kartu berwarna"
  → hasil loud & generic; fix = netral dominan + satu aksen + status warna saja.)
- **PG-01**: larang gradient/rainbow/neon/glow. **PG-06** badge restrain.
  **PG-08** shadow hanya penanda elevasi. **PG-10** kartu jangan seragam.
- **Dial + Design Read** wajib ditulis di prompt, mis.
  `dial ENERGY 1 / RHYTHM 1 / MOTION 1` untuk konsol admin yang tenang.
- Warna hanya masuk kartu sebagai **isyarat bermakna** (chip ikon bertint, aksen
  hairline, tint sangat rendah) dan harus bisa dijelaskan satu baris. Tulis aturan
  ini eksplisit di prompt.

## Fase 1 — Kumpulkan konteks (dari repo, jangan karang)

1. **Brand** — baca `docs/design/DNA.md`. Palet EDISI 01: brand `#E8421A`, ink aksi
   `#B83213`, teks navy `#1A3A5C`, latar `#F8F9F7`, batas `#E7ECE7`, status
   green/blue/red. Tipografi **Inter**. Radius kontainer ≤12px. Kartu = border 1px,
   **tanpa shadow**, **tanpa gradient**, tanpa emoji.
2. **Data asli** — ambil dari `src/data/*` (label, nominal, badge, nama). Contoh
   panel CS: nav `Ringkasan · Onboarding(3) · Sengketa(2) · Merchant · Ledger`;
   liability `227.45 JOD` (customer 128.40 + merchant 86.75 + tips kurir 12.30),
   saldo Xendit `210.00` → kurang `17.45 JOD`; ledger deposit hold/COD hold/fee/
   settlement/refund. **Pakai nilai nyata**, jangan angka karangan.
3. **Tujuan layar + peran** — dari `docs/plan-*.md` / flow. Sebut siapa pengguna & apa
   aksi utamanya.

## Fase 2 — Susun prompt (struktur terbukti)

```
Generate a redesigned <nama layar Sa7tein> — you have FULL creative freedom on
layout, composition, card style, spacing and visual hierarchy. Do NOT copy a
generic template; treat this as an art-direction brief, not a wireframe.

(1) Brand — hard: bg #F8F9F7, cards white with hairline 1px #E7ECE7 border,
    single accent brand orange #E8421A, navy #1A3A5C headings/numbers, Inter,
    flat, no gradients, no heavy shadows.
(2) Real data that MUST appear, placed wherever looks best:
    - <nav label + badge dari src/data>
    - <angka/agregat nyata>
    - <feed/tabel nyata>
(3) Render as a desktop 1440x900 screenshot (atau mobile 430px).

Make it genuinely beautiful — surprise me.
```

Akhiri dengan ajakan berkarya ("Make it genuinely beautiful" / "Surprise me") — itu
yang membedakan hasil desainer dari hasil pelaksana.

## Fase 3 — Generate

Ikut skill `generate-image-gemini`: `check` + `quota` dulu, sertakan kata **generate**
di prompt, jeda ≥5 dtk antar-generate, output ke `out/`. Jangan burst.

## Fase 4 — Review (WAJIB)

Model utama **tanpa vision**. Cara verifikasi:
- **User** membuka hasil (`open <file>`) dan menilai visual — minta konfirmasi.
- Cek otomatis: `gdescrib <file> "fokus: ..."` (vision proxy). Jangan nebak isi gambar.

Gagal brand (bukan oranye/Inter/flat), data hilang, atau ada teks AI rusak → revisi.

## Fase 5 — Iterasi

- Revisi pakai `--continue` (pertahankan arah + brand).
- Kalau hasil kaku → **jangan persempit lagi**; hapus instruksi layout dan perbesar
  kebebasan.
- Kalau user minta lebih liar → buang rincian posisi, sisakan brand + data.

## Larangan

- Menuliskan posisi/grid/urutan kartu secara eksplisit (mematikan kualitas desain).
- Mengarang nilai brand atau data — selalu ambil dari DNA/tokens/`src/data`.
- Menyisakan foto/`photorealistic` — ini **UI mockup**, beda dari skill foto.
- Interpretasi gambar sendiri tanpa vision tool / konfirmasi user.

## Checklist

- [ ] Brand & data diambil dari repo (bukan karangan)
- [ ] Brand + data = HARD, komposisi = FREE
- [ ] Ada ajakan berkarya di akhir prompt
- [ ] Viewport render sesuai target
- [ ] Hasil dibuka untuk user / dicek `gdescrib` — bukan ditebak
