# R-QUOTA — Kuota customer, kuota merchant, paket & alacarte

Status: partial (quotaSlice + merchant subscription ada; dua jenis kuota, paket periode, alacarte diskon belum) · sumber §16, §15.4, MER-17..MER-20, CUS-33, OPS-09/OPS-17, OPEN-31.

## 1. Untuk apa

Kuota adalah platform fee yang dibayar di muka. Kuota customer menggantikan satu platform fee customer, kuota merchant berisi platform fee customer + merchant. Karena kuota menentukan metode bayar yang tersedia (COD hanya bila merchant punya kuota), harga yang dibayar customer, dan payout ke merchant, pemakaiannya harus di-reserve saat order dibuat dan baru dikonsumsi saat order selesai.

## 2. Aturan

### Jenis kuota & pemakaian

| # | Aturan | Sumber |
|---|---|---|
| A1 | Dua jenis kuota: customer dan merchant | §16, MER-17 |
| A2 | Kuota customer menggantikan 1 platform fee customer | §16 |
| A3 | Kuota merchant menggantikan 1 platform fee merchant; 1 platform fee customer ikut dibayar di muka dan menjadi hak merchant | §16, §15.3 |
| A4 | Kuota customer dipakai lebih dulu untuk setiap order, apa pun metode bayarnya, di merchant mana pun | §16, CUS-33 |
| A5 | Kuota merchant dipakai untuk order COD, atau untuk semua order bila setting "Terima order tanpa kuota?" = tidak | §16, MER-17 |
| A6 | Setting "Terima order tanpa kuota?" hanya bisa diubah saat merchant tutup | MER-17, §16 |
| A7 | Setting "ya": order online tidak mengonsumsi kuota merchant dan dikenai Pm; kuota merchant hanya untuk COD | §16 |
| A8 | Setting "tidak": kuota merchant selalu terpakai apa pun metode bayarnya | §16 |
| A9 | Merchant setting "tidak" tanpa kuota tersedia tidak bisa menerima order apa pun dan disembunyikan dari browse; customer juga tidak bisa order dari favorit/cart | §16, CUS-04..13 |
| A10 | Order COD hanya bisa dibuat bila merchant punya kuota tersedia; opsi COD nonaktif bila tidak | MER-19, §16 |
| A11 | Kuota di-reserve saat order dibuat, dikonsumsi saat order selesai, dikembalikan bila batal, ditolak, atau pembayaran gagal/kedaluwarsa | §16 |
| A12 | Kuota tersedia = belum terpakai − ter-reserve − hangus, dihitung terpisah per merchant dan customer | §16 |
| A13 | Kuota paket dipakai lebih dulu; kuota alacarte dipakai setelah paket habis atau bila tidak ada paket aktif | §16 |
| A14 | Sisa kuota paket hangus saat masa aktif berakhir; kuota alacarte tidak pernah hangus | §16, §16.2 |
| A15 | Kuota paket berjatah per periode (hari/minggu/bulan); sisa jatah periode hangus lalu jatah direset | §16.1 |
| A16 | Periode jatah tidak boleh lebih panjang dari masa aktif paket (50 kuota/minggu selama 1 hari tidak valid) | §16.1 |
| A17 | Periode dihitung sejak pembayaran: hari 24 jam, minggu 7×24 jam, bulan 28×24 jam | §16.1 |

### Payout & Pk

| # | Aturan | Sumber |
|---|---|---|
| A18 | Pk = payout platform fee customer ke rekening merchant, sebesar Pc yang dikonfigurasi ops, pada order yang mengonsumsi kuota customer **dan** kuota merchant bersamaan; 0 untuk order lain | §15.3, §15.4 |
| A19 | Payout Pk dilakukan satu kali per order setelah order selesai, dikonversi dengan kurs terkunci dan dibulatkan bawah | §16, §15.2 |
| A20 | Order yang hanya mengonsumsi kuota customer tidak menghasilkan payout | §16 |
| A21 | Order batal/ditolak/gagal tidak menghasilkan payout karena kuota dikembalikan | §16 |
| A22 | Pada order COD tanpa kuota customer, platform fee customer dibayar tunai dan menjadi hak merchant | §15.5, §16 |

### Paket langganan (§16.1)

| # | Aturan | Sumber |
|---|---|---|
| A23 | Ops membuat katalog paket untuk merchant dan untuk customer; boleh beberapa paket per jenis | OPS-09 |
| A24 | Setiap paket punya nama, deskripsi, harga, satuan masa aktif (harian/mingguan/bulanan), dan konfigurasi fitur | OPS-09, §16.1 |
| A25 | Harga paket = persentase (maks 100%) × harga maksimal; harga maksimal = total kuota × Pc (paket customer) atau × (Pc + Pm) (paket merchant) | OPS-09, §16.1 |
| A26 | Pada paket merchant, persentase hanya berlaku untuk bagian Pm: harga = total kuota × (Pc + persentase × Pm) | §16.1 |
| A27 | Hasil harga dibulatkan bawah 2 desimal JOD; aplikasi internal menampilkan hasil yang tidak bisa diubah | §16.1 |
| A28 | Setiap paket wajib berisi kuota order; daftar fitur bonus lain masih OPEN-31 | §16.1, OPEN-31 |
| A29 | Langganan mulai otomatis setelah pembayaran berhasil; masa aktif harian 24 jam, mingguan 7×24, bulanan 28×24 | §16.1 |
| A30 | Customer maupun merchant hanya boleh punya satu paket aktif; paket baru dibeli setelah paket berakhir/dihentikan, tanpa antrean | §16.1 |
| A31 | Pengecualian antrean: paket hadiah free product aplikator diantre dan aktif setelah paket berjalan selesai | §16.1, §14.3 |
| A32 | Perubahan harga/kuota/fitur hanya berlaku untuk pembelian baru; langganan aktif memakai ketentuan saat dibeli | §16.1 |
| A33 | Langganan tidak bisa dibatalkan setelah dibeli; ops bisa menghentikan paksa sebagai punishment (sisa kuota paket hangus tanpa refund) | §16.1, §17 |
| A34 | Ops bisa mengurangi/menghilangkan benefit paket aktif; pengurangan kuota hanya memotong kuota tersedia | §16.1, §17 |
| A35 | Pengurangan permanen memotong alacarte lebih dulu lalu paket; pengurangan berjangka memotong paket lebih dulu lalu alacarte | §16.1 |
| A36 | Ops bisa menonaktifkan paket di katalog; pemilik paket tetap aktif sampai masa aktif habis | §16.1 |
| A37 | Paket customer dibayar dengan metode bayar yang sama seperti order; poin bisa mengurangi harga paket customer | §16.1, §14.5 |

### Alacarte (§16.2)

| # | Aturan | Sumber |
|---|---|---|
| A38 | Customer dan merchant bisa membeli kuota satuan kapan saja, dengan atau tanpa paket aktif | §16.2 |
| A39 | Harga = jumlah kuota × harga maksimal per kuota − diskon; pada kuota merchant diskon hanya berlaku untuk bagian Pm | §16.2 |
| A40 | Skema diskon dibuat ops, bisa lebih dari 1, berlaku untuk customer atau merchant, berisi minimum jumlah kuota + persentase diskon | OPS-17, §16.2 |
| A41 | Minimum jumlah kuota tidak boleh sama antarskema; sistem memakai skema dengan minimum tertinggi yang tidak melebihi jumlah pembelian; di bawah minimum terkecil tanpa diskon | §16.2 |
| A42 | Persentase diskon yang dipakai disimpan di data pembelian, sehingga perubahan/penghapusan skema tidak mengubah pembelian lama | §16.2 |
| A43 | Skema tidak punya periode berlaku; dinonaktifkan dengan menghapusnya | OPS-17 |
| A44 | Diskon alacarte bukan program marketing; program marketing tidak berlaku untuk pembelian kuota/paket | §16.2 |
| A45 | Hasil harga alacarte dibulatkan bawah 2 desimal JOD | §16.2 |
| A46 | Kuota alacarte dibayar dengan metode yang sama seperti paket dan tidak bisa dibatalkan atau di-refund | §16.2 |

### Tampilan & event

| # | Aturan | Sumber |
|---|---|---|
| A47 | Merchant melihat sisa kuota dan ambang menipis; customer melihat kuota miliknya | §18, §12.2 |
| A48 | Ambang kuota menipis diatur ops, terpisah untuk merchant dan customer | §12.2 |
| A49 | Perubahan kuota (dibeli, reserve, terpakai, dikembalikan, hangus, reset, dikurangi, dipulihkan) dikirim realtime ke pemilik kuota dan merchant terkait | §18 |

## 3. Aktor & permukaan

- Merchant (hak "Langganan dan kuota") — katalog paket, beli paket/alacarte, sisa kuota, setting "Terima order tanpa kuota".
- Customer — katalog paket/kuota, pembelian, sisa kuota, pemakaian di checkout.
- Ops — katalog paket, Pc/Pm, skema diskon, pantau kuota, punishment.

## 4. Masukan → keluaran

- Masuk: pembelian paket/alacarte, pemakaian kuota saat order, setting merchant.
- Keluar: saldo kuota {customer, merchant}, rincian harga checkout (Pc/Pm/Pk), status paket, event `quota_purchased`, `quota_reserved`, `quota_consumed`, `quota_returned`, `quota_reset`, `quota_expired`.

## 5. State UI

| State | Tampilan |
|---|---|
| kuota tersedia | metode COD aktif (merchant), rincian tanpa Pc/Pm |
| kuota menipis | indikator ambang di beranda/langganan |
| kuota habis (setting "tidak") | merchant tersembunyi dari browse; order diblokir |
| paket aktif | sisa jatah periode + waktu reset |
| jatah periode habis | sisa 0 sampai reset, alacarte tetap bisa dipakai |
| pembelian alacarte | diskon otomatis dari skema tertinggi yang terpenuhi |

## 6. Kontrak BE (handoff, repo ini mock)

Model paket {tipe, harga %, masa aktif, jatah per periode, fitur bonus}, pembelian (potongan skema disimpan), saldo kuota, reserve/consume/return, payout Pk; event `quota_*`; config ambang.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Kuota customer dipakai lebih dulu pada order apa pun | order QRIS dengan kuota customer → Pc = 0 | ⛔ |
| AC2 | COD nonaktif saat merchant tanpa kuota | merchant kuota 0 → opsi COD nonaktif | ⛔ |
| AC3 | Merchant setting "tidak" tanpa kuota hilang dari browse | set "tidak" + kuota 0 → merchant tidak muncul | ⛔ |
| AC4 | Kuota di-reserve saat order dibuat, bukan saat selesai | buat order → kuota tersedia turun; batal → kembali | ⛔ |
| AC5 | Order dengan kuota customer + merchant memicu Pk satu kali | selesaikan order → 1 payout Pk | ⛔ |
| AC6 | Harga paket merchant = total kuota × (Pc + persentase × Pm) | 70 kuota, Pc 0,2, Pm 0,25, 80% → 28 JOD | ⛔ |
| AC7 | Paket dengan jatah per periode lebih panjang dari masa aktif ditolak | 100 kuota/bulan selama 1 minggu → error | ⛔ |
| AC8 | Sisa jatah periode hangus dan reset berikutnya | paket 10/hari, pakai 7 → besok 10 lagi | ⛔ |
| AC9 | Skema diskon tertinggi yang terpenuhi dipakai | 3 skema 10/50/100 kuota → beli 60 memakai skema 50 | ⛔ |
| AC10 | Kuota alacarte tidak hangus saat paket berakhir | paket habis → sisa alacarte tetap | ⛔ |
| AC11 | Setting hanya bisa diubah saat merchant tutup | merchant buka → setting nonaktif | ⛔ |

## 8. UNRESOLVED

- OPEN-31 (daftar fitur bonus paket) masih terbuka; paket tanpa fitur bonus tetap sah.
- Nilai awal Pc, Pm, ambang menipis tidak dicantumkan PRD (OPS-08/OPS-18).

## 9. Bukti

- Kode: `src/store/slices/quotaSlice.ts:110`, `src/types.ts:1406,1420` (`QuotaSubscription`), `src/pages/MerchantSubscription.tsx`, `src/pages/OpsQuotas.tsx`, `src/pages/Checkout.tsx`.
- Belum ada: kuota customer, paket berjatah periode, alacarte + skema diskon, Pk, punishment kuota.
