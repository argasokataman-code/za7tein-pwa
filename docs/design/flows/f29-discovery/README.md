# F29 — Discovery, Katalog & Cart per Merchant

M2 beta: customer harus bisa menemukan merchant yang **benar-benar bisa melayani alamatnya sekarang**,
lalu menyusun **satu cart per merchant**. PRD aktif `sa7tein-beta-2026-11-05` §10 `CUS-04..CUS-18`,
§7.1, §13.1/13.3/13.6; `features/R-CUS-DISCOVERY.md` A1–A14, `features/R-CUS-CART.md` A1–A13.
Milestone M2 (`milestones.md`), bergantung pada M1 (auth) yang sudah selesai desainnya.

| Berkas | Isi |
|---|---|
| `f29-discovery.json` | Spec archify (workflow v2) — sumber yang diedit |
| `f29-discovery.html` | Artefak jadi (generated, di-gitignore) |
| `f29-discovery.visual-check.*` | Bukti visual-check (generated, di-gitignore) |

## Bisnis (kenapa flow ini ada)

- **Masalah:** kartu merchant yang tampak sama bisa berbeda total: buka, tutup, busy, di luar jangkauan,
  atau diblok kuota. Customer menebak, lalu kecewa saat checkout. Status itu harus terbaca **sebelum**
  memilih, bukan setelah membayar.
- **Kenapa cart per merchant:** satu order = satu merchant (`R-CUS-CART` A1). Customer memesan dari
  beberapa merchant sekaligus, jadi cart adalah **order draft** yang tampil di daftar order yang sama
  dengan order aktif dan riwayat (A3), bukan keranjang tunggal yang menelan semua.
- **Kenapa item tak-layak dipisah, bukan dihapus:** item yang tidak bisa diproses (stok habis, varian
  usang, di luar jadwal, catatan per menu dimatikan) tetap di cart di section sendiri; order tetap bisa
  dibuat dari item yang bisa diproses (A6–A8). Menghapusnya diam-diam = customer kehilangan pesanannya.

## Alur layar (6 kolom, 3 lane)

**Lane Customer:** `Alamat default` → `Beranda` (group **hanya per tag**, A4) → `Cari & filter`
(5 filter: tag, favorit, jarak maksimum, rating minimum, jumlah order; sort jarak/order/rating) →
`Kartu merchant` (status terbaca di kartu) → `Detail merchant` (program, review, rating menu) →
`Cart per merchant` (order draft, rincian S − diskon − … hanya item yang bisa diproses) →
`Keranjang lain` (cart warung lain yang tidak sedang dibuka: pindah atau buang, masing-masing punya
checkout sendiri — `R-CUS-CART` A1/AC1: dua cart merchant berbeda aktif bersamaan).

**Lane Katalog & status:** `Status turunan` (buka/tutup, busy, coverage, blok kuota dihitung server) →
`Menu & varian` (stok dua scope, jadwal, menu hide) → `Daftar order` (cart tampil sebagai card,
sort status mendahulukan aksi customer: draft → waitingPayment → pending → pendingRefund).

**Lane guard (dashed):** `Blok kuota` (merchant **disembunyikan**, A8) · `Tutup / luar area`
(**tampil** tapi CTA nonaktif, A6) · `Luar jam tersedia` (menu tampil, tidak bisa masuk cart, A12) ·
`Busy` (cart jalan, order ditahan sampai busy off, A7).

## Yang tidak dijanjikan flow ini

- Harga, QRIS/COD, dan invoice = **M3** (`R-MONEY`, `R-CUS-PAY`); flow ini berhenti di "order terbentuk".
- Membership, kuota berbayar, poin = **M6**; kartu hanya menandai badge, aturannya belum digambar.
- Chat, rating, dispute = **M7**.
- Query lintas instance Durabile Object untuk browse/search **belum diputuskan** (OPEN-25). Di mock
  cukup filter lokal; kalau nanti server memutuskan lain, sort/filter bisa berubah bentuk.

## UNRESOLVED

- Label section "tidak dapat diproses" ditentukan desain UI (`R-CUS-CART` §8) — belum final.
- "Kriteria lain" pada sort (CUS-06) tidak dirinci PRD.
- Reservasi stok global yang gagal bersamaan = perilaku BE, tidak bisa dibuktikan di repo mock.

## Gerbang

`ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" ./scripts/flows-gate.sh f29-discovery`
→ PASS 9/9, visual pass, empat viewport tanpa overflow (1440:900, 1600:1000, 1920:1080, 2048:1320).
Tanpa `ARCHIFY_CHROME`, visual-check keluar `status: skipped` (Chrome tidak terpasang di mesin ini;
Brave yang dipakai) sehingga gate dilaporkan FAIL walau render 9/9 — itu batasan alat, bukan flow.

## Bingkai FigCraft (F29 · Discovery, 12 bingkai)

Halaman `F29 · Discovery` di `design/beta-v1.figcraft` menerjemahkan flow ini menjadi bingkai
terukur 390x844: `Beranda / 1-4` (warung buka, cart jalan, filter tanpa hasil, sesudah tambah),
`Cari / 1-2` (hasil, tanpa hasil), `Detail / 1-4` (buka, tutup, busy, di luar jangkauan),
`Keranjang / 1-3` (satu warung, ganti warung, item tak diproses), `Menu / 1 · varian`,
`Filter / 1 · lima jenis`, `Kurs / 1 · acuan harian`, `Checkout / 1-2` (tinjau, keranjang lain),
dan `Pesanan / 1-2` (cart sebagai card, dua cart aktif).

`Checkout / 1-2` adalah **bingkai serah-terima**, bukan bagian alur inti: flow berhenti di
"order terbentuk", sedangkan aturan bayar/invoice milik M3 (`R-MONEY`, `R-CUS-PAY`). Pengecualian
satu bagian: seksi `Keranjang lain` di `Checkout / 2` **milik flow ini**, karena ia yang membuktikan
`R-CUS-CART` A1/AC1 (dua cart aktif, pindah/buang tanpa menghapus). Sisanya (alamat, ringkasan
biaya, metode bayar) hanya meninjau yang sudah ditetapkan mock; kalau M3 menetapkan bentuk lain,
bagian itu diganti, bukan dipertahankan. Tercatat sebagai deviasi di
`docs/design/slice/README.md` bagian "F29 Discovery".

