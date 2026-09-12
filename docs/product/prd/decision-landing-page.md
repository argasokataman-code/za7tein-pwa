# Keputusan: Landing page Sa7tein

- ID: `landing-page-2026-09-13`
- Sumber: `versions/landing-page-2026-09-13/source.md` (brief desain, 637 baris)
- Status: **proposed** — diadopsi sebagai **spec desain pelengkap** di bawah PRD aktif. `activeRevision` tetap `irbid-mvp-2026-09-12`.
- Alasan tidak diaktifkan: dokumen ini brief desain landing, bukan aturan domain produk. Mengaktifkannya akan men-supersede Irbid dan meregresi aturan produk.

## Resolusi konflik (diputuskan pemilik produk)

| Ref | Konflik | Keputusan |
|---|---|---|
| C1 | Brief §04/§07 pakai radius 2 km + Zona A/B/C | **Ikut Irbid** (zona Hijazi/Syimali). Radius A/B/C legacy tidak dipakai. |
| C2 | §04 "Pembayaran masuk ke merchant" | **Ikut Irbid**: Midtrans + deposit COD; copy ditulis ulang. |
| C3 | §10 Free 10 order/hari, Paid kuota lebih tinggi | **Ikut Irbid**: model deposit/komisi; free-tier legacy tidak dipakai. |
| C4 | Pasar/mata uang | **Irbid** (JOD; IDR hanya bila relevan). |
| C5 | §03/§18 wajib custom inline SVG | **Disetujui** untuk motif dekoratif; dicatat di `docs/design/legacy-debt.json`. Ikon fungsional tetap lucide-react. |
| C6 | §17 radius maks 16px vs DNA cap 12px | **Tahan cap 12px**; DNA/token tidak diubah. |
| C7 | §11 foto editorial | **Pakai aset lokal yang ada** (`public/assets/img/menu/*.webp`, burger onboarding). Tanpa URL eksternal. |
| C8/C9 | Nav/CTA tanpa tujuan | **Default** (di bawah). |
| C10 | §09 layar kurir | Runtime kurir 0%; ditampilkan sebagai **mock statis berlabel**, bukan fitur aktif. |
| C11 | Model aktivasi | **Spec pelengkap**, `activeRevision` tetap Irbid. |

## Target nav/CTA (default)

| Elemen | Target |
|---|---|
| Logo | `/` |
| Cara Kerja | `#cara-kerja` |
| Untuk Merchant | `#merchant` |
| Area | `#area` |
| Tentang | `#tentang` |
| Masuk | `/signin` |
| Mulai Pesan | `/onboarding` |
| Lihat Cara Kerja | `#cara-kerja` |
| Daftar Merchant | `#merchant` |
| Pelajari paket merchant | `#paket` |

## Pengecualian dekoratif SVG (C5)

Motif brand dekoratif yang disetujui sebagai inline SVG (kontras sangat rendah, tanpa makna fungsional):
garis rute, dot matrix, bentuk cloche/sajian, pola makanan. Ikon fungsional (nilai, journey, nav) tetap `lucide-react`. Daftar hash lengkap dicatat di `legacy-debt.json.inlineSvg` untuk file komponen dekorasi landing pada perubahan yang sama.

## Batas

- Tanpa transaksi, testimoni, atau angka fiktif.
- Semua data mock. Courier = mock.
- Gate: `governance:check`, `lint`, `build`, ukur 360/390/430/768/1024/1440.
