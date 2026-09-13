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

## Revisi visual setelah review pengguna — 2026-09-13

Pengguna menilai implementasi awal terlalu mirip template AI meskipun mengikuti banyak butir brief. Revisi berikutnya memprioritaskan foto makanan dan cerita dapur-ke-pintu, mengurangi frame produk yang berulang, menghapus mockup ponsel generik, dan membuang dekorasi serta stylesheet landing lama yang tidak dipakai. Journey Line menjadi garis editorial; tiket dapur dan status kurir tetap ada sebagai data contoh. Ini adalah keputusan desain, bukan perubahan otoritas PRD: Irbid tetap aktif, brief landing tetap proposed.

## Koreksi berdasarkan sampel visual pengguna

Gambar yang diberikan pengguna adalah referensi desain buatan pengguna, bukan tangkapan layar lama. Implementasi editorial di atas menyimpang dari komposisi referensi. Landing sekarang mengikuti urutan dan hierarki sampel: navigasi putih, hero oranye dengan layar aplikasi/tiket/peta bertumpuk, tiga nilai, Journey Line empat langkah, tiga layar produk, ilustrasi jangkauan dan merchant, tiga kartu, serta CTA oranye. Aturan bisnis tetap mengikuti PRD Irbid aktif (Hijazi/Syimali), sehingga label Zona A/B/C di sampel tidak disalin.

## Penataan ulang layout setelah klarifikasi pengguna

Sampel visual adalah acuan bahasa desain, bukan cetak biru untuk memadatkan semua konten. Landing tetap satu halaman promosi dengan navigasi anchor, tetapi tiap topik kini menjadi section tersendiri: hero, cara kerja, pengalaman pelanggan, area layanan, merchant, kurir, rasa lokal, dan CTA. Pada desktop tiap section memiliki pesan dan visual utama dengan ruang vertikal yang lapang; pada ponsel urutan menjadi satu kolom. Konten dan animasi yang sudah ada dipertahankan.
