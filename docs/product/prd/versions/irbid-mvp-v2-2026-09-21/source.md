# Decision Record — Operasional v2: E-Wallet, Fee JOD, Verifikasi Delivery, Dispute

## Meta

| Field | Isi |
|---|---|
| ID | `irbid-mvp-v2-2026-09-21` |
| Jenis | PRD / Decision Record |
| Sumber | Analisis riset: Xendit Batch Payouts, Xendit Payout API v3, infra pembayaran Jordan (CliQ, JoMoPay, IGA) |
| Status | Draft — menunggu validasi user & konsultan pajak |
| **Sudah final (angka kerja)** | **Flat fee JOD** — merchant 0,15 / customer 0,22 (update PO 2026-09-21), minimum top-up akun baru **3,5 JOD**, **Insentif Founding Merchant** (modal 5 JOD non-withdrawal + cashback tiered 15/40/62,5 JOD), protection fund 2%, timer SLA, settlement **IDR** + **JOD display-only** (rate sync 1×24 jam) |
| **Belum final** | Lihat Open Questions + I-1..I-6 (insentif merchant): regulasi e-money/PJP, VAT Jordan, PPN Indonesia, cash-out fee, provider rate API |
| Berlaku untuk | `sa7tein-pwa` (Irbid MVP), fase setelah M0 |
| Update terakhir | **2026-09-21** — PO: komisi 8% diganti flat fee JOD; top-up awal wajib; JOD display-only; Wise dibatalkan; **insentif Founding Merchant ditambahkan** |

## Latar Belakang

PRD aktif `irbid-mvp-2026-09-12` menetapkan: **tanpa payment gateway**, hanya `cod` dan `transfer manual`. Ini keputusan yang pas untuk showcase frontend. Namun target bisnisnya nyata: food delivery + e-wallet untuk diaspora Indonesia di Jordan (Irbid), transaksi IDR penuh, pakai infrastruktur Indonesia (Xendit) karena semua pengguna memakai bank Indonesia.

Keputusan ini **meng-upgrade** keputusan lama: menambah layer e-wallet dan payment gateway, bukan menggantikan COD/transfer manual sepenuhnya.

## Perubahan dari PRD Aktif

Doc ini mengubah beberapa hal dari PRD aktif `irbid-mvp-2026-09-12`:

| Aspek | PRD aktif | Keputusan v2 (doc ini) |
|---|---|---|
| Payment gateway | Midtrans (QRIS/VA, disbursement H+1) | **Xendit** (top-up + payout) — satu akun untuk top-up + payout + account name check, webhook real-time, idempotency (section 2) |
| Model fee platform | Flat 0,35 JOD/order (buyer 0,20 + merchant 0,15) | **Flat fee JOD** — merchant 0,15 + customer 0,22 = **0,37 JOD/order** (update PO 2026-09-21) |
| Mata uang | JOD, dikonversi IDR via Midtrans | **IDR penuh** (Xendit Indonesia-only) untuk settlement; **JOD display-only**, rate di-sync sistem 1×24 jam |
| Fee pembeli | 0,20 JOD terpisah di checkout | **0,22 JOD** terpisah di checkout (update PO 2026-09-21) |

**Tetap ikut PRD aktif:** ongkir **100% merchant** (0% komisi platform), protection fund, zona **Hijazi/Syimali**, deposit merchant, kurir diurus merchant.

> Model flat JOD dan Midtrans di PRD digantikan oleh **flat fee JOD baru (0,15 + 0,22)** + Xendit di doc ini. Referensi "komisi 8%" **sudah tidak berlaku** (lihat Update PO). Catat di `manifest.json` saat implementasi biar tidak ada dua versi aturan.

## Update PO — 2026-09-21 (menggantikan komisi 8%)

PO memutuskan tujuh hal. Semua bagian doc yang menyebut **komisi 8% / model persen** sudah **tidak berlaku** dan digantikan aturan di bawah.

| # | Keputusan | Dampak |
|---|---|---|
| 1 | **Fee merchant flat 0,15 JOD/order** — berlaku untuk **COD & bayar langsung** | Komisi 8% dihapus total. |
| 2 | **Fee customer flat 0,22 JOD/order** | Ditambahkan terpisah di checkout. |
| 3 | **Akun baru wajib top-up 3,5 JOD** | Gate saldo awal sebelum bisa order. |
| 4 | **Rate mata uang di-sync sistem 1×24 jam** dari API kurs eksternal | JOD display-only; settlement tetap IDR. |
| 5 | **COD: saldo dipotong saat kurir match**, bukan saat order dibuat | Merchant otomatis kena fee 0,15 JOD pada titik itu. |
| 6 | **Wise dibatalkan** — transaksi murni rupiah | Seluruh section konversi IDR→JOD keluar dari scope. |
| 7 | **Insentif Founding Merchant** — modal saldo 5 JOD (non-withdrawal, ~33 transaksi pertama) + cashback tiered 15/40/62,5 JOD per bulan | Section "Insentif Founding Merchant". Dampak: fee efektif merchant turun sampai 0,10 JOD/porsi di Tier 3. |

### Alur COD baru (update PO)

```
Order dibuat          → HOLD saldo customer (belum dipotong, belum jadi uang platform)
Kurir match/ketemu    → POTONG saldo customer + merchant kena fee 0,15 JOD
OTP customer sukses   → SETTLE: saldo bersih masuk ke merchant
```

- Beda dari desain lama (potong + settle bersamaan saat OTP). Sekarang **potong di titik match**, settle di titik OTP.
- Batal sebelum match → release hold, tidak ada potongan sama sekali.
- Batal setelah match → reversal potongan (append-only, bukan edit).

## Keputusan

### 1. Tiga Wallet (closed-loop)

| Wallet | Cara saldo masuk | Cara saldo keluar |
|---|---|---|
| Customer | Top-up (Xendit VA/QRIS/transfer) | Bayar order |
| Merchant | Order selesai → kredit otomatis | Withdraw (Xendit payout) |
| Courier | Tips customer (internal ledger) | Withdraw (Xendit payout) |

- Transaksi antar-wallet (bayar order, komisi) = **internal ledger**, instan, tanpa fee gateway.
- Xendit hanya dipakai di **2 titik**: top-up (masuk) dan payout (keluar).
- Saldo punya status: `available` dan `pending` (hold saat order berjalan, release saat selesai).
- Kurir **diurus merchant sepenuhnya** (PRD bab 04) — digaji merchant dari ongkir. Wallet kurir **khusus tips** (lihat subsection Tips).

### Tips customer → kurir (Gojek-style)

- Kurir **tetap diurus merchant** (digaji merchant), tapi punya **wallet khusus tips** — customer bisa kasih tip via app (Gojek-style).
- Alur: customer pilih tip saat checkout/setelah terima → potong dari wallet customer → **internal ledger** kredit ke wallet kurir → kurir withdraw via Xendit payout.
- Wallet kurir **hanya untuk tips**, bukan komisi/gaji — gaji tetap dari merchant.
- **Fee note:** payout kurir Rp2.500/penarikan bisa makan tip kecil → kurir tarik di **ambang minimum / diakumulasi** (misal terkumpul ≥Rp50.000 baru bisa withdraw), atau digabung dengan pola cash-out.
- Tip **tidak kena komisi platform** — 100% ke kurir. **Fee payout ditanggung kurir sendiri** (keputusan PO 2026-09-22): dipotong dari nilai withdraw, **bukan** beban platform. Karena itu ambang akumulasi minimum tetap berlaku — penarikan kecil tidak ekonomis bagi kurir.

### 2. Payment Gateway: Xendit

- Menggantikan referensi "Midtrans" pada kontrak BE Irbid PRD.
- Alasan: satu akun mencakup top-up (VA, QRIS, e-wallet) + payout (bank Indonesia) + account name check, webhook real-time, idempotency key anti double-spend.
- Xendit tidak beroperasi di Jordan → karena semua user memakai bank Indonesia dan transaksi full IDR, jalur Indonesia berlaku. Uang tidak pernah menyentuh sistem Jordan.
- Dua endpoint inti:
  - Top-up: **bukan** payout — gunakan payment channel Xendit (VA/QRIS) via webhook callback.
  - Withdraw: `POST /v3/payouts` (create payout) + track via webhook.
  - Cek status: `GET /v2/payouts/{id}` — v2 untuk cek status, v3 untuk create (sesuai dokumentasi resmi Xendit).
- Setiap transaksi gateway wajib `idempotency-key` + `reference_id` = ID transaksi internal (anti duplikat).

### 3. VAT (Pajak)

- Layanan dikonsumsi di **Jordan** (makanan diantar di Irbid) → kewajiban pajak mengikuti tempat layanan, **bukan** tempat pemroses pembayaran.
- Jordan pajak konsumsi = **GST (General Sales Tax) 16%** — resminya BUKAN "VAT", tapi mekanismenya mirip VAT. Nama resmi: **General Sales Tax Law No. 6 of 1994** (amended), otoritas IGA/ISTD (`istd.gov.jo`). [Verifikasi: PWC Tax Summaries, ISTD archive — 16%]
- Dokumen ini memakai istilah "VAT" sebagai istilah umum; untuk laporan/legal gunakan "GST".
- Tarif GST makanan & ongkir perlu diverifikasi ke konsultan (kategori tertentu bisa beda/dikecualikan).
- Alur: invoice menambahkan VAT ke harga → customer membayar total → sistem memisahkan jatah VAT ke akun `tax_payable` → platform/setiap merchant menyetor ke IGA sesuai skenario legal.
- **Catatan legal (belum final):** entitas platform = PT Indonesia, transaksi IDR. Zona abu-abu "ekspor jasa" (PPN Indonesia) vs kewajiban VAT Jordan. **Wajib konsultasi akuntan/konsultan pajak sebelum produksi.**
- Sistem dibangun dengan struktur pajak yang benar sejak awal (`vat_amount`, `vat_country`, akun `tax_payable`) meski MVP awal berjalan dengan VAT 0% / "not applicable" sampai registrasi IGA.

## Model Transaksi: Prepaid vs COD (satu engine, dua trigger release)

- **COD di sini = COD via e-wallet** (customer bayar di pintu lewat wallet app, bukan tunai). Bukan COD cash — tidak ada uang fisik dipegang kurir.
- Kedua model pakai **1 mekanisme wallet**: `hold → settle`. Bedanya cuma kapan release.

| Aspek | Bayar Langsung (prepaid) | COD via wallet |
|---|---|---|
| HOLD saldo customer | Pas order dibuat | Pas order dibuat |
| Potong final | Pas order dibuat (instan) | **Pas kurir match/ketemu customer** (update PO 2026-09-21) |
| Settle merchant/kurir | Pas order dibuat | **Pas OTP customer sukses** |
| Kalau batal | Refund otomatis | Batal sebelum match → release hold; sesudah match → reversal potongan |

- Implementasi: `type TransactionType = 'prepaid' | 'cod'` — satu flow wallet, beda `release_trigger`.
- **Keunggulan COD via wallet** (vs COD tunai):
  - Tidak ada tunai dipegang kurir → tidak bisa diselewengkan
  - Semua transaksi tercatat otomatis → audit rapi, platform bisa verifikasi order beneran terkirim
  - Xendit tetap hanya di 2 titik (top-up + payout)
- **Wajib ada untuk COD:**
  - **Auto-settle timer** — jika customer tidak konfirmasi dalam X menit setelah status "diantar", auto-settle (saldo tidak mengendap sebagai pending selamanya)
  - **Bukti delivery** — kurir unggah foto/lokasi saat sampai, untuk verifikasi

### Fee Platform (menggantikan komisi aplikator %)

> **Update PO 2026-09-21:** model komisi persen **dihapus**. Diganti **fee flat JOD per order** — biaya tetap yang tidak bergantung nilai order.

| Pihak | Fee | Kapan dipotong |
|---|---|---|
| **Merchant** | **0,15 JOD** per order (COD & langsung) | Saat order settle (COD → saat OTP) |
| **Customer** | **0,22 JOD** per order, ditampilkan di checkout | Saat order dibayar/dipotong |
| **Platform** | Total **0,37 JOD/order** = pendapatan kotor | — |

- Fee **flat**, bukan persen → order besar tidak menaikkan pendapatan, tapi order kecil tidak merugi.
- Fee customer **ditampilkan terpisah** di breakdown checkout.
- Order batal sebelum match → fee customer dibalik, fee merchant belum terpotong.
- Berlaku untuk **semua metode**, termasuk legacy (`transfer manual`, COD cash) — fee flat 0,37 JOD tetap dipungut (PO 2026-09-22, Open Questions #25).
- Ongkir tetap **100% merchant, 0% fee platform** (tidak berubah).
- **Catatan patokan pasar (riset lama, tetap relevan sebagai konteks):** GoFood 20% + Rp1.000, GrabFood ±30%, ShopeeFood 20–25% — tapi model fee di sini **flat**, jadi tidak sebanding langsung dengan platform besar.

### Insentif Founding Merchant (Modal Saldo + Performance Rebate)

> **Sumber:** ketentuan PO (2026-09-21). Skema ini **baru** — tidak ada di PRD aktif `irbid-mvp-2026-09-12`. Konsep terkait yang sudah ada di PRD aktif: deposit COD merchant 3,50 JOD (§5C) dan "Sa7tein Credit" non-withdrawable untuk refund (§5J).

Tujuan: merchant baru bisa mulai tanpa uang muka, dan merchant ber-volume dapat fee efektif lebih murah.

#### 1. Modal Saldo Awal Gratis — 5 JOD

- Sa7tein memberi **modal deposit awal 5 JOD** per merchant baru, sebagai **kredit sistem non-tunai** (`in-app service credit`).
- Bersifat **non-withdrawal** — tidak bisa ditarik, hanya bisa memotong fee merchant.
- Saldo ini otomatis menutup **potongan merchant fee 0,15 JOD/order** untuk **~33 transaksi pertama** (5 ÷ 0,15 = 33,3). Dapur tidak perlu uang muka sepeser pun.
- **Fee customer tetap berjalan normal = 0,22 JOD** — ikut keputusan PO 2026-09-22 (I-1); ketentuan insentif lama 0,20 JOD tidak berlaku.
- Dicatat di ledger sebagai akun `merchant_credit` (bukan saldo withdrawable).

#### 2. Cashback Bulanan (Tiered Rebate)

Sistem tetap memotong fee normal **0,15 JOD/porsi**. Di akhir bulan, sebagian dikembalikan sebagai **saldo tunai ke dompet deposit dapur**, berdasarkan akumulasi volume penjualan.

| Tier | Ambang volume | Cashback | Beban bersih | Hemat |
|---|---|---|---|---|
| Tier 1 | 500 pesanan/bulan (~20 porsi/hari) | 15 JOD | 0,12 JOD/porsi | 20% |
| Tier 2 | 1.000 pesanan/bulan (~40 porsi/hari) | 40 JOD | 0,11 JOD/porsi | 26,7% |
| Tier 3 | 1.250+ pesanan/bulan (50–60 porsi/hari) | 62,5 JOD | 0,10 JOD/porsi | 33,3% |

**Verifikasi hitung (basis merchant fee 0,15 JOD):**
```
Tier 1: 500 × 0,15 = 75,00 JOD fee; cashback 15,00 → net 60,00 → 0,12/porsi; 15/75 = 20,0%
Tier 2: 1.000 × 0,15 = 150,00 JOD fee; cashback 40,00 → net 110,00 → 0,11/porsi; 40/150 = 26,7%
Tier 3: 1.250 × 0,15 = 187,50 JOD fee; cashback 62,50 → net 125,00 → 0,10/porsi; 62,5/187,5 = 33,3%
Konversi hari (asumsi 25 hari/bulan): 500/25 = 20, 1.000/25 = 40, 1.250/25 = 50
```
Semua angka konsisten.

#### Dampak ke unit economics

- Tier 3 menurunkan pendapatan platform dari merchant jadi **0,10 JOD/order** (dari 0,15). Dengan fee customer 0,22, pendapatan total Tier 3 = **0,32 JOD/order** (dari 0,37).
- Modal 5 JOD per merchant baru = **biaya akuisisi (CAC)**, bukan diskon permanen. Untuk 33 order pertama, platform menerima Rp0 dari fee merchant.
- Cashback dibayar dari kas platform di akhir bulan → **arus kas keluar**, masuk ke dompet deposit merchant.

#### Belum final (UNRESOLVED)

| # | Pertanyaan | Status |
|---|---|---|
| I-1 | Fee customer di ketentuan insentif tertulis **0,20 JOD**, sedangkan keputusan PO 2026-09-21 = **0,22 JOD**. Angka mana yang berlaku? | **RESOLVED (PO 2026-09-22): 0,22 JOD** — ketentuan insentif 0,20 JOD tidak berlaku. |
| I-2 | Hubungan modal 5 JOD dengan **deposit COD merchant 3,50 JOD** (PRD aktif §5C): menggantikan atau tambahan? | **RESOLVED (PO 2026-09-22): terpisah.** Modal 5 JOD = insentif masa promo berbentuk kredit sistem non-tunai (non-withdrawal); bukan pengganti atau tambahan deposit COD 3,50 JOD. |
| I-3 | Cashback masuk dompet deposit merchant — ikut **non-withdrawal** atau saldo yang bisa ditarik? | **RESOLVED (PO 2026-09-23): non-withdrawal.** Masuk dompet deposit, tapi tidak bisa di-WD — hanya untuk pemakaian di dalam aplikasi. |
| I-4 | Periode tier: bulan kalender (reset tanggal 1)? Kalau merchant naik tier di tengah bulan — dihitung proporsional atau tier akhir bulan? | UNRESOLVED |
| I-5 | Kuota "Founding": dibatasi jumlah merchant (mis. 20 pertama) atau semua merchant baru? Berlaku berapa lama? | UNRESOLVED |
| I-6 | Kalau merchant berhenti sebelum modal 5 JOD habis — sisa saldo hangus atau dianggap utang? | **RESOLVED (PO 2026-09-23): hangus.** Kredit digital yang tidak bisa dicairkan; diberhentikan seperti kredit gratis lain, bukan utang. |

## Guard Zona (Luar Area)

- Pesanan hanya jalan kalau alamat pembeli **di dalam zona merchant** — validasi **sebelum** payment.
- **2 zona** (PRD aktif): **Hijazi** (pemukiman barat) & **Syimali** (utara kampus).
- **Syarat lolos:** alamat di poligon Hijazi/Syimali **DAN** jarak ≤ 2 km Haversine dari dapur merchant **DAN** merchant mengaktifkan zona itu (`is_active_hijazi` / `is_active_syimali`).
- **Di luar zona → order diblokir**, tidak sampai ke payment:
  - Label visual "Di luar jangkauan warung ini"
  - Checkout diblokir (HTTP 422: "Alamat pengantaran berada di luar zona jangkauan warung ini")
  - Di luar poligon / >2 km = Out of Coverage (ditolak sistem)
- **Implikasi wallet:** top-up zone-independent (isi saldo kapan saja), tapi saldo tidak bisa dipakai order di luar zona → **wajib ada cash-out** (Open Questions #16/#22) supaya dana tidak nyangkut (loss ~Rp3.200/kejadian).
- Ongkir 100% merchant (0% komisi platform).

## Verifikasi Pengiriman (tanpa GPS realtime)

PWA tidak bisa memantau kurir secara realtime (seperti Gojek/Grab). Solusi: **checkpoint + OTP + timer**, bukan peta hidup. Customer tidak butuh melihat titik di peta — cukup tahu "kapan kurir sampai".

### Checkpoint wajib (kurir tidak bisa skip step)

| Titik | Aksi kurir | Bukti | Mitigasi |
|---|---|---|---|
| Ambil di merchant | Tap "Ambil" | Merchant konfirmasi di app (2-way) | Merchant tahu makanan beneran diambil |
| Perjalanan | Tap "Berangkat" | Timer SLA (15–30 menit) | Lewat timer → auto-alert super admin |
| Sampai lokasi | Tap "Tiba" | Geolocation sekali + foto | Customer dapat notif "Kurir sudah sampai" |
| Serah terima | Tap "Selesai" | **OTP 4-digit dari customer** | Customer kasih OTP pas terima → bukti beneran dikirim |

### OTP serah terima (kunci anti-fraud)

```
Kurir sampai → minta OTP ke customer → customer cek makanan → kasih OTP
→ kurir masukkan OTP di app → order settle → release saldo
```

- Tanpa OTP → kurir tidak bisa selesaikan → tidak bisa settle → tidak dapat komisi.
- Menghilangkan skenario "katanya sudah dikirim" padahal tidak.

### Timer / SLA (pengganti realtime tracking)

| Checkpoint | Timer | Habis → |
|---|---|---|
| Ambil → Berangkat | 15 menit | Auto-alert super admin |
| Berangkat → Tiba | 30 menit | Auto-alert super admin, kurir ditandai telat |
| Tiba → OTP selesai | 10 menit | **Auto-complete** → settle otomatis |

- **Auto-complete wajib** — jangan biarkan order menggantung sebagai pending selamanya kalau customer lupa konfirmasi.
- Setelah kurir tap "Tiba", tidak menunggu konfirmasi customer selamanya. Habis timer → sistem anggap delivered.
- Risiko auto-complete (customer mengaku tidak terima) → masuk dispute (lihat section Proteksi).
- Timer dikonfigurasi per zona/penalti sesuai data rute Irbid (max 2 km).

## Proteksi, Dispute & Protection Fund

### Negative scenario + mitigasi

| # | Scenario | Risiko | Mitigasi |
|---|---|---|---|
| 1 | Kurir tidak ambil makanan | Merchant menunggu | Merchant konfirmasi "diambil" + timer |
| 2 | Kurir pura-pura antar, tidak jalan | Customer tidak dapat | Timer SLA + checkpoint + escalation admin |
| 3 | Kurir bilang "sudah sampai" padahal tidak | Trust rusak | Geolocation sekali saat "Tiba" + OTP |
| 4 | Customer tidak kasih OTP (nolak bayar) | Order macet | Auto-settle timer + dispute |
| 5 | Customer mengaku "tidak terima" padahal sudah | Fraud customer | Bukti foto kurir + riwayat + blacklist |
| 6 | Merchant tidak siapkan makanan | Kurir menunggu | Timer masak merchant (15/25/35 menit) + status "ditolak" |
| 7 | Order COD pending selamanya | Saldo beku | **Auto-settle timer** (10 menit setelah Tiba) |
| 8 | Kurir telat / tersesat | Customer kesal | Notif "Kurir sedang otw" + estimasi + cancel policy |
| 9 | Dispute komisi/saldo | Sengketa | **Ledger audit trail** lengkap + super admin review |
| 10 | Merchant/kurir withdraw dobel | Double-spend | Idempotency key Xendit + hold/release state |

### Kasus kurir bawa kabur makanan

Alur uang: customer bayar → uang **di-hold platform** (belum pernah sampai ke merchant sebelum delivery confirmed). Karena tidak ada OTP, order dianggap gagal:

```
1. Customer bayar → uang HOLD platform (belum ke merchant)
2. Kurir bawa kabur makanan
3. Order tidak pernah "confirmed delivered" (tidak ada OTP)
4. Sistem deteksi gagal → auto-REFUND customer dari uang yang dipegang platform
   └─ Customer aman, uang kembali ✅
5. Merchant tidak dapat uang + makanan hilang → kerugian ditanggung MERCHANT (recourse internal ke kurirnya sendiri)
```

- Keuntungan model wallet: **uang selalu menunggu di platform sebelum delivery confirmed** → refund otomatis, kurir tidak pernah pegang uang customer (maksimal bawa kabur makanan, bukan uang).
- Kerugian maksimum = harga makanan, ditanggung merchant (recourse ke kurirnya, kurir diurus merchant).

### Kategori kurir: sengaja vs musibah (urusan merchant)

**Kurir = milik & diurus merchant (PRD bab 04),** jadi sengaja/musibah kurir ditangani merchant secara internal. Platform hanya: refund customer + verifikasi delivery.

| Kasus | Siapa tanggung | Tindakan |
|---|---|---|
| Kurir **sengaja** (bawa kabur) | Merchant | Merchant pecat/potong gaji kurir; platform refund customer dari dana hold |
| Kurir **musibah** (kecelakaan, sakit, motor rusak) | Merchant | Tidak dihukum, dibantu (asuransi/bantuan bila ada) |

- Merchant yang memutuskan kategori kurirnya, berdasarkan bukti: lokasi, riwayat, laporan.
- Alur musibah: kurir lapor / order macet (timer habis tanpa checkpoint) → merchant intervensi → reassign kurir sendiri / batalkan → refund customer otomatis dari platform.

### Protection fund

- Dana proteksi, diisi dari **porsi kecil fee platform (2% dari 0,37 JOD/order)** atau deposit merchant.
- Menutup insiden: sengketa tak terduga, makanan hilang bukan salah siapa pun, kasus edge.
- Insiden frekuensinya rendah → 2% biasanya cukup.

### Deposit & holding (urusan merchant)

- Kurir diurus merchant sepenuhnya → **deposit, holding earnings, blacklist kurir = tanggung jawab merchant**, bukan platform. Platform tidak memegang jaminan kurir.
- Yang wajib ada di platform:
  - **Auto-refund customer** saat order gagal (kurir tidak selesaikan / telat / OTP tidak keluar).
  - **Bukti delivery** (OTP/foto/lokasi) sebagai syarat release hold → platform tahu pesanan beneran terkirim.

### Politik waktu tunggu kurir (customer lalai)

**Prinsip: kurir wajib punya batas nunggu, habis itu boleh pergi.** Jangan biarkan kurir jadi korban customer lalai.

| Tahap | Durasi | Habis → |
|---|---|---|
| Tiba di lokasi | 5 menit | Notif + call customer otomatis via app |
| Call + nunggu | 5 menit lagi (total 10) | Kurir boleh tap "Batal" → leave |
| **Total maks** | **10 menit** | Order dibatalkan, kurir bebas |

Alur saat customer lalai:
```
1. Kurir tiba → tap "Tiba" → notif customer "Kurir sudah sampai"
2. Timer 5 menit → call customer otomatis
3. Timer 5 menit lagi → tidak ada respon
4. Kurir tap "Batal / Customer not found" → boleh pergi
5. Order cancel → penalty (lihat di bawah)
```

### Penalti customer lalai (Opsi B — rekomendasi)

**Refund tidak penuh, dipotong sebagian untuk menutup kerugian kurir & merchant.**

Contoh order Rp100.000 (ongkir Rp10.000), customer lalai:
```
Customer sudah bayar Rp110.000 → kurir nunggu 10 menit → tidak muncul → order batal

Refund ke customer   : Rp 50.000 (50% makanan)
Potongan             : Rp 60.000
  ├─ kurir           : Rp 10.000 (ongkir)    ← kurir tetap dibayar untuk waktunya
  ├─ merchant        : Rp 50.000 (50% makanan) ← merchant tidak rugi full
  └─ platform        : tidak ambil, sisa ke customer
```

- **Kenapa dipotong:** customer lalai ikut menanggung; refund full membuat customer bebas telat/ngilang tanpa konsekuensi.
- **Potongan untuk kurir + merchant**, bukan pemasukan platform.
- **Konsekuensi tambahan:** riwayat lalai tercatat; 2–3x lalai → limit/blacklist.
- **Kenapa 50% bukan 100%:** tetap "hukuman" tapi tidak kejam — customer lalai karena hal penting (motor mati, anak nangis) tidak kena potong full.
- Angka dapat disesuaikan (30% / 50% / full ongkir saja).
- **Kurir tetap dibayar** walau order batal karena customer — jangan hukum kurir atas kesalahan customer.

### Ringkasan siapa menanggung apa

| Pihak | Sengaja | Musibah | Order batal |
|---|---|---|---|
| Customer | Refund otomatis ✅ | Refund otomatis ✅ | Refund otomatis ✅ |
| Merchant | Urusan internal dgn kurirnya | Urusan internal dgn kurirnya | Tidak ada transaksi |
| Kurir | Diproses merchant (pecat/potong gaji) | Dibantu merchant, tidak dihukum | — |
| Platform | Refund customer; kerugian merchant tanggung sendiri | Refund customer | Tanpa kerugian |

## Dispute — Modul Super Admin (MVP)

> **Prinsip:** dispute bukan fitur produk, tapi **antrian kerja super admin**. User cuma bisa *mengajukan*; keputusan di tangan super admin. Tidak ada portal/chat sengketa di MVP. Semua tetap lewat ledger.

### Alur

```
User (customer/merchant)        Super Admin                    Sistem
────────────────────────        ───────────                    ──────
Tap "Ajukan Sengketa"
  + alasan + bukti          →   Masuk queue "Disputed"     →   Order → `disputed`
                                                               Hold dibekukan, auto-settle pause
                                Buka order + ledger +
                                bukti delivery (OTP/foto/lokasi)
                                Pilih resolusi             →   Ledger entry (append-only)
                                                               Order → `resolved_*`
                                                               Hold di-release sesuai putusan
```

### Yang bisa mengajukan

| Pihak | Alasan sah | Window |
|---|---|---|
| Customer | Tidak terima / salah / kurang / rusak | 24 jam setelah order `settled` |
| Merchant | Customer mengaku tidak terima padahal ada bukti delivery | 24 jam setelah `settled` |
| Kurir | **Tidak ada** — kurir urusan merchant, bukan platform | — |

- **1× pengajuan per order**, tanpa appeal (MVP).
- Wajib pilih kategori + isi teks; upload foto opsional (maks 3).
- Order yang sudah `resolved_*` tidak bisa diajukan lagi.

### Resolusi (4 pilihan super admin)

| Resolusi | Efek saldo | Kapan |
|---|---|---|
| **Refund penuh** | Kredit balik 100% ke customer (termasuk fee customer 0,22 JOD) | Barang tidak sampai / salah total |
| **Refund sebagian** | Kredit X% ke customer, sisanya cair ke merchant | Sebagian tidak sesuai |
| **Release ke merchant** | Saldo cair ke merchant (fee merchant 0,15 JOD tetap dipotong) | Klaim customer tidak terbukti |
| **Tolak** | Tidak ada perubahan saldo | Pengajuan tidak sah / di luar window |

- **Biaya dispute tidak dibebankan otomatis** ke siapa pun. Refund penuh → fee Xendit QRIS (~Rp805) yang sudah terlanjur terbayar ditanggung platform.
- Kasus **"tidak ada yang salah"** (makanan hilang bukan salah siapa pun) → ambil dari **protection fund**, bukan dari merchant.

### Integrasi wajib (kenapa nyambung ke sistem lain)

| Sistem | Titik integrasi |
|---|---|
| **Ledger** | Setiap resolusi = 1 transaksi double-entry baru (append-only). **Tidak pernah edit/hapus** entry lama. |
| **Wallet hold** | Order `disputed` → hold **dibekukan**, auto-settle timer **di-pause** (jangan settle di tengah sengketa). |
| **Delivery proof** | Super admin lihat: log OTP, snapshot geolocation "Tiba", foto kurir, timestamp tiap checkpoint. |
| **Protection fund** | Sumber dana untuk kasus tanpa pihak bersalah. Saldo fund = turunan ledger. |
| **Order state** | `disputed` = sub-state; order tidak boleh masuk `settled` final selama disputed. |
| **Xendit** | Refund ke customer = **internal ledger** (instan, tanpa fee). Xendit cuma kepakai kalau customer lalu cash-out. |
| **Reporting** | Semua dispute + resolusi masuk laporan bulanan (indikator trust + biaya protection fund). |

### Batas tegas MVP

- **Tidak ada** chat sengketa, appeal, SLA timer, auto-klasifikasi, atau dispute multi-pihak.
- Dispute **kurir vs merchant** (soal gaji) = **off-platform**, tidak dilayani app.
- Kalau volume dispute > ~5/bulan → baru pertimbangkan SLA + kategori terstruktur (Open Questions #29).

## Reporting, Ledger & Liability (Platform sebagai Custodian)

Platform **penampung dana** (custodian) — semua saldo wallet user ada di tangan platform. Karena itu reporting wajib berstandar audit.

### Ledger (sistem pencatatan pusat)

- **Ledger = database pencatatan semua pergerakan uang**, kronologis dan permanen.
- **Append-only** — transaksi tidak bisa diedit/dihapus, hanya bisa dibalik dengan transaksi reversal baru.
- **Double-entry** — tiap transaksi selalu 2 sisi (debit/kredit); uang keluar dari A masuk ke B, tidak pernah muncul/hilang tanpa lawan.
- Semua laporan (rekonsiliasi, pajak, saldo, settlement) adalah turunan dari ledger.

### Laporan wajib

| Report | Frekuensi | Fungsi |
|---|---|---|
| Ledger transaksi | Real-time | Sumber semua laporan |
| Rekonsiliasi Xendit | Harian | Cocokkan transaksi Xendit vs ledger (selisih → flag) |
| Ringkasan saldo wallet | Harian | Pantau liability |
| Settlement merchant/kurir | Harian/periodik | Payout & komisi |
| Laporan pajak (VAT/GST) | Bulanan | Setor ke IGA (saat aktif) |
| Laporan keuangan | Bulanan | Pajak + investor |

- **Rekonsiliasi Xendit = paling kritis**: cek top-up masuk == ledger catat top-up? payout == ledger catat payout? Sisa saldo Xendit == saldo ledger platform? Selisih sekecil apa pun di-flag.

### Liability & Float

- **Saldo wallet user = UTANG (liability) platform, bukan aset.**
  - Saldo customer Rp500jt = platform "berutang" Rp500jt ke customer.
  - Saldo merchant Rp200jt = platform "berutang" Rp200jt ke merchant.
  - Saldo di Xendit = aset platform.
- **Metric #1 yang wajib dipantau: saldo Xendit ≥ total utang wallet.** Jika saldo Xendit < total utang wallet → insolvent → bahaya.
- **Float risk:** settlement Xendit H+2 + payout Rp2.500 → platform perlu saldo awal untuk menutup payout sebelum top-up settle. Kelola likuiditas sejak awal.

### Pajak: platform pegang uang ≠ kena pajak

- **Saldo wallet user = utang, bukan penghasilan → bukan objek pajak.** Tidak ada pajak atas uang yang numpang lewat (top-up → payout).

**Yang kena pajak:**

| Pihak | Item | Pajak |
|---|---|---|
| Indonesia (PT) | Fee platform (pendapatan, 0,37 JOD/order) | PPh badan (~22%) |
| Indonesia (PT) | Fee Xendit yang dibayar | PPN 11–12% (Xendit pricing ID bilang "sudah termasuk", T&C bilang "exclusive of taxes" — konfirmasi pas kontrak) |
| Jordan | Jasa/fee platform | GST 16% (tanggung jawab konsumen/merchant, platform hanya pengepul; sistem siap, belum dipungut) |

- **Peringatan:** jangan lapor saldo user sebagai penghasilan — bayar pajak atas uang yang bukan milik platform → bangkrut. Ledger double-entry yang benar (saldo user = liability) menjaga akurasi pajak.

### VAT — dua lapis yang berbeda (sering tertukar)

**Jangan tercampur — dua kewajiban VAT beda subjek dan beda alur:**

| Lapis | Subjek | Objek | Siapa pungut/setor | Peran platform |
|---|---|---|---|---|
| **1. GST atas makanan** | Merchant | Penjualan makanan ke customer (Jordan, GST 16%) | **Merchant** setor ke IGA | **Cuma memantau** — catat `gst_amount` per order, sediakan laporan per merchant untuk mereka setor |
| **2. GST/PPh atas fee platform** | Platform (aplikator) | Jasa platform yang dijual ke merchant (fee 0,15 JOD) + fee customer (0,22 JOD) | **Platform** setor | **Kewajiban sendiri** — total fee 0,37 JOD/order kena pajak jasa |

- Lapis 1: kamu **bukan** penanggung pajak — hanya wajib menyediakan data. Jangan bayar atas nama merchant.
- Lapis 2: fee kamu = penjualan jasa → kena pajak jasa. Statusnya **belum final**: bisa GST Jordan 16% (jasa dikonsumsi di Jordan), PPN Indonesia 11-12% (ekspor jasa), atau bebas — **keputusan konsultan pajak**.
- Database butuh **dua kolom berbeda**: `gst_amount` (atas makanan, untuk laporan merchant) dan `platform_gst` (atas fee platform, untuk kewajiban platform).

### Catatan keuangan untuk pemula (ringkasan istilah)

| Istilah | Arti sederhana |
|---|---|
| HPP | Harga Pokok Penjualan = biaya langsung bikin produk. Untuk merchant = bahan baku; untuk platform = fee Xendit + protection fund. Ongkir = titipan (customer bayar → diteruskan ke merchant), bukan HPP. |
| Komisi | (Digantikan) — model lama: potongan % platform. Sekarang pakai **fee flat JOD** (merchant 0,15 + customer 0,22). |
| PPh | Pajak Penghasilan — atas **fee platform** kamu. Final 0,5% (UMKM) atau ~22% (badan). |
| PPN | Pajak Pertambahan Nilai — atas **jasa** (fee platform). |
| VAT | Pajak atas **makanan** (Jordan) — disetor merchant. Nama resmi Jordan = **GST**, bukan VAT. |
| Liability | Utang — saldo wallet user = utang platform, bukan penghasilan. |
| Dana float | Saldo user yang kamu pegang — wajib dicatat sebagai utang, dipisah dari uang operasional. |

**Prinsip perhitungan:**
```
Invoice ke customer : harga + ongkir + fee customer 0,22 JOD (tanpa pajak di MVP)
Pendapatan platform : fee merchant 0,15 + fee customer 0,22 = 0,37 JOD
HPP platform        : fee Xendit + protection fund
Profit              : fee platform − HPP
PPh                 : 0,5% × fee platform (UMKM) — dihitung di laporan, bukan di app
```

### Kewajiban pajak sejak rilis (WAJIB — bukan opsional)

- **PPh final 0,5% atas fee platform = aktif sejak order pertama.** Tidak ada ambang penundaan — dari transaksi pertama wajib lapor & bayar tiap bulan.
- **Pajak dihitung dari FEE PLATFORM (omzet platform), bukan dari total perputaran uang.** Perputaran saldo user (top-up + payout) = bukan dasar pajak; yang kena cuma total fee 0,37 JOD × jumlah order. Contoh (rate ilustrasi 1 JOD = Rp23.000): 1.000 order × 0,37 JOD ≈ Rp8.510 = omzet platform Rp8,51jt → PPh 0,5% ≈ **Rp42.550/bulan**.
- **Kapan wajib lapor:** setiap masa pajak (bulanan), setor + lapor SPT sesuai jadwal DJP. Buat entitas yang baru mulai: daftar NPWP dulu.
- **Skema 0,5% = PPh final UMKM,** tarif 0,5% + ambang omset ≤ Rp4,8 miliar/thn masih berlaku, tapi landasan sudah diganti: PP 55/2022 diamandemen **PP 20/2026** (efektif 22 Apr 2026) — subjek dipersempit hanya OP, perseroan perorangan, koperasi (CV/PT non-perorangan sudah gak bisa). Bisa pindah ke PPh badan ~22% (laba) jika pilih ketentuan umum.

### Risiko tidak lapor pajak (JANGAN DIABAIKAN)

- **Tidak aman & pasti terdeteksi:**
  - Xendit = lembaga keuangan terdaftar & diaudit BI; seluruh transaksi tercatat, data direkonsiliasi ke DJP (wajib lapor).
  - DJP memiliki data lintas-institusi (bank, payment gateway, e-wallet); nama/rekening terhubung ke transaksi — tidak ada anonim.
  - Saat lewat ambang (Rp600jt / 12.000 traffic/pengakses) → ditunjuk sebagai pemungut PPh 22 → DJP pasti tahu platform beroperasi.
- **Sanksi (UU KUP):** denda 50–200% dari pajak kurang bayar, bunga 2%/bulan keterlambatan, pidana penjara untuk penggelapan, blokir rekening / penangguhan izin untuk badan usaha.
- **Konteks kamu lebih rawan:** transaksi lintas negara (Indonesia → Jordan) = sorotan lebih tinggi (pertukaran data pajak antar-negara via AEOI/CRS); platform custodian (pegang dana user) diawasi ketat BI/DJP/OJK.
- **Kesimpulan:** 0,5% itu murah dibanding risiko. Ledger & laporan komisi sudah dirancang — gunakan untuk lapor beneran. Jangan anggap Xendit sebagai tempat bersembunyi — justru merekalah yang membuat platform terlihat.

### Ringkasan kapan pajak/izin berlaku

| Item | Dasar pengenaan | Kapan aktif |
|---|---|---|
| PPh final 0,5% (fee platform) | Fee platform (0,37 JOD/order) | **Sejak order pertama** ⚠️ |
| PPh badan ~22% | Laba | Bila pilih ketentuan umum |
| PPh 22 pemungut merchant | Omzet merchant | Platform PMSE yang ditunjuk DJP: transaksi >Rp600jt/12bln ATAU >Rp50jt/bln, DAN/ATAU traffic >12.000/12bln ATAU >1.000/bln (PMK 37/2025, efektif 1 Nov 2026) |
| Izin BI e-money (PJP) | Dana float | Float ≥ Rp1 miliar (closed-loop) |
| PPN jasa platform | Fee platform | Tergantung status PKP & klasifikasi ekspor jasa (konsultan) |
| VAT Jordan (makanan) | Penjualan makanan | Merchant setor (GST Jordan 16%); platform monitor data |

## Mata Uang: Transaksi IDR, Display JOD (rate sync 1×24 jam)

> **Update PO 2026-09-21:** seluruh opsi konversi IDR→JOD (Wise, partner FX, netting, wallet multi-currency) **dibatalkan**. Transaksi **murni rupiah**. JOD **hanya tampilan**.

- **Semua settlement = IDR** lewat Xendit (top-up QRIS, payout ke bank Indonesia). Tidak ada uang yang menyentuh JOD.
- **JOD = display-only.** Harga, ongkir, fee, dan saldo **disimpan dalam IDR** (source of truth); UI menampilkan JOD memakai rate terakhir.
- **Rate di-sync sistem 1×24 jam** dari API kurs eksternal. Simpan hasil ke tabel `exchange_rates` (`base`, `quote`, `rate`, `fetched_at`, `source`) dan pakai rate terakhir kalau fetch gagal (jangan blokir transaksi karena API kurs mati).
- **Semua perhitungan uang di server pakai IDR.** Konversi ke JOD hanya saat render. **Jangan simpan nominal JOD sebagai nilai transaksi** — itu sumber drift dan bug pembulatan.
- **Pembulatan:** bulatkan JOD ke 2 desimal hanya di layer tampilan; ledger tetap IDR utuh.
- **Disclaimer UI** wajib: "kurs estimasi, mengikuti kurs harian" — supaya user paham JOD yang dilihat bukan angka terkunci.

### Kandidat provider rate (WAJIB verifikasi dukungan JOD)

| Provider | Catatan |
|---|---|
| `open.er-api.com` | Free, tanpa key, ~160 mata uang — cek apakah JOD termasuk |
| `exchangerate.host` | Free tier, key opsional — verifikasi JOD |
| `frankfurter.dev` | Free tanpa key, **tapi sumbernya ECB** — JOD kemungkinan **tidak tersedia** |
| `exchangerate-api.com` | Free tier terbatas, cakupan luas |

- ⚠️ **Jangan asumsikan JOD ada.** JOD bukan mata uang mayor; provider berbasis ECB tidak menyediakannya. **Test endpoint sebelum dipilih** (Open Questions #26).

### Yang dihapus dari scope

| Item | Alasan |
|---|---|
| Wise API adapter (`quotes`/`transfers`) | Transaksi murni rupiah, tidak ada payout JOD |
| Partner FX (dLocal / Nium / KeyBS) | Tidak dipakai |
| Netting / matchbook internal | Tidak dipakai |
| Wallet multi-currency | Tidak dipakai |

> Riset FX lama (Wise, koridor IDR→JOD, fee remitansi, dLocal/Nium/KeyBS) **tetap tersimpan di section Referensi** sebagai jejak audit — tapi **bukan bagian dari produk**. Jalur payout ke merchant sekarang: **IDR ke bank Indonesia** (Xendit, Rp2.500/payout).

## Biaya Xendit (Indonesia, diverifikasi Mei 2026; audit ulang Sep 2026)

Sumber: `xendit.co/id/biaya`, `help.xendit.co`, `docs.xendit.co/v1/docs/transaction-fees`, `xendit.co/pricing-calculator-id`.

### Top-up (money in) — pilihan channel

| Channel | Fee | Keterangan |
|---|---|---|
| **QRIS** ✅ pilihan utama | **0,70%** (sudah termasuk PPN, diatur BI) | Termurah, 1 integrasi terima semua e-wallet & m-banking Indonesia (GoPay, OVO, DANA, BCA, BRI, dll). Limit ±Rp10jt/transaksi. |
| Virtual Account / Bank transfer | **Rp 4.000** flat (Aggregator) | 11 bank (BCA, BNI, BRI, Mandiri, Permata, CIMB, BSI, dll). Lebih mahal utk transaksi kecil. |
| OVO / DANA / LinkAja / AstraPay | **1,50%** | Lebih mahal dr QRIS. Kategori merchant (digital content/foreign) bisa naik ke 2,7–3,18%. |
| ShopeePay | **2,00%** (sudah termasuk PPN) | Kategori gaming/digital bisa 4%. |
| JeniusPay | **2,00%** | — |
| Kartu kredit/debit | **2,90% + Rp 2.000** | Termahal. AMEX 3,90%. Ada chargeback fee USD 25/case. |

### Withdraw (money out) — payout/disbursement

| Jenis | Fee |
|---|---|
| Payout ke bank Indonesia / VA / e-wallet | **Rp 2.500 per transfer** (flat) |
| Proses | **7 hari seminggu termasuk hari libur** ✅ |
| Fee dikenakan | Hanya saat payout **berhasil** selesai |

### Biaya tetap & tersembunyi (PENTING)

| Item | Fee | Kapan |
|---|---|---|
| **Monthly minimum fee (dorman)** | **USD 50/bulan** | Akun **dorman = di bawah activity threshold** (definisi resmi T&C tidak menyebut angka 180 hari — konfirmasi sales). Bukan "volume rendah bulanan". Fee = selisih jika accrued fee bulan < USD 50. Berlaku juga ke subaccount XenPlatform. |
| Maintenance fee | USD 250/bulan | Hanya utk pengguna **legacy API** — hindari, pakai API v3. |
| Settlement standar | **H+2** (2 hari kerja) | Dana top-up masuk ke rekening kamu H+2. Opsi early settlement (sama hari/H+1) bisa dinegosiasi, ada fee tambahan. |
| PPN 11% | Ditambahkan ke sebagian besar fee | Kecuali QRIS & ShopeePay yg sudah inclusive. |
| Setup / monthly / termination fee | **Rp 0** | Utk merchant standar. |

**⚠️ Klarifikasi fee dorman (diverifikasi dari docs + T&C Xendit):**
- Definisi dormant resmi: **"di bawah activity threshold"** — sumber pihak ketiga menyebut 180 hari tanpa transaksi, tapi T&C resmi tidak menyebut angka itu (audit 2026). MVP dengan transaksi rutin **tidak kena**.
- Fee = selisih jika total fee bulan < USD 50 (bukan biaya tambahan di atas transaksi).
- Risiko nyata hanya saat **idle penuh 6 bulan** (mis. development panjang) → konfirmasi "activity threshold" aktual ke sales Xendit saat onboarding.
- Sumber: `https://docs.xendit.co/v1/docs/transaction-fees`, `https://www.xendit.co/en/blog/dormant-account-fees-explained-what-they-are-and-why-payment-providers-charge-them/`, `https://www.xendit.co/en/xendit-service-agreement/` (Dormant Account = no Transactions within 180 days).

### Dampak ke model bisnis

- **Biaya per order tipikal** (asumsi QRIS top-up + payout Rp2.500):
  - Top-up Rp115.060 (harga + ongkir + fee customer) via QRIS = **Rp 805** (0,70%)
  - Payout merchant/kurir = **Rp 2.500** per pencairan
  - Total biaya gateway ≈ 0,7% + Rp2.500 tiap kali uang keluar-masuk sistem.
- **Strategi biaya:** saldo internal muter gratis; Xendit cuma dibebani di 2 titik. Fee platform (0,37 JOD/order) sudah menutup fee Xendit di MVP; pass-through ke customer/merchant kalau volume gede.
- **⚠️ Float risk:** settlement H+2 + payout Rp2.500 → platform perlu saldo awal utk menutup payout sebelum top-up settle. Kelola likuiditas (float) sejak awal.

### Unit economics (per order, flat fee JOD)

**Rate ilustrasi: 1 JOD = Rp23.000.** Rate riil mengikuti sync harian (section Mata Uang) — angka IDR di bawah hanya ilustrasi, perhitungan asli selalu IDR.

**Model per order (subtotal Rp100.000, ongkir Rp10.000):**
```
Customer bayar      : Rp110.000 + fee customer 0,22 JOD (Rp5.060) ≈ Rp115.060 → hold
Merchant terima     : Rp110.000 − fee merchant 0,15 JOD (Rp3.450) = Rp106.550
  └─ kurir digaji merchant, di luar platform
Pendapatan platform : 0,37 JOD ≈ Rp8.510 (0,15 merchant + 0,22 customer)
```

**Biaya platform per order:**

| Komponen | Biaya |
|---|---|
| QRIS top-up (0,7% × ~Rp115.000) | Rp 805 |
| PPh 0,5% × fee platform | Rp 43 |
| Protection fund (2% × fee platform) | Rp 170 |
| Payout amortized (Rp2.500 ÷ ±20 order/withdraw) | ~Rp 125 |
| **Total** | **~Rp 1.143** |

```
Pendapatan : Rp 8.510
Biaya      : Rp 1.143
PROFIT     : Rp 7.367 per order
```

- **Fee flat, bukan persen → profit/order TIDAK naik saat nilai order naik.** Order Rp20.000 dan order Rp500.000 sama-sama menghasilkan Rp8.510. Ini konsekuensi utama ganti model.
- **Break-even nilai order (sisi atas):** profit = 0 saat total top-up > **~Rp1,17jt** (QRIS 0,7% menelan seluruh fee). Order di atas itu tipis/rugi per transaksi.
- **Beban order kecil ada di customer, bukan platform:** fee 0,22 JOD = **25% dari order Rp20.000** (Rp5.060). Mahal untuk customer. Pantau churn/keluhan di order kecil — kalau jadi masalah, pertimbangkan fee customer bertingkat (Open Questions #27).
- **Break-even biaya tetap:** biaya tetap (dorman USD50 ≈ Rp815rb/bulan + dev/marketing) ÷ Rp7.367 ≈ **±111 order/bulan** hanya untuk menutup dorman. Di bawah itu platform jalan dari kantong sendiri.
- **Insentif merchant menurunkan angka ini:** di Tier 3, fee merchant efektif jadi 0,10 JOD → pendapatan total 0,32 JOD/order ≈ Rp7.360 → profit/order turun jadi **~Rp6.217**. Modal 5 JOD per merchant baru = biaya akuisisi untuk 33 order pertama (lihat section Insentif Founding Merchant).
- **Resiko MVP:** fee dorman USD 50 hanya berlaku saat akun idle penuh (di bawah "activity threshold"; sumber pihak ketiga menyebut 180 hari) — bukan per-bulan transaksi normal. Dengan transaksi rutin, risiko ini hilang.
- **3 titik yang bikin boncos (wajib diatur):**
  1. **Cash-out saldo customer** (top-up → tarik balik tanpa order): kamu bayar QRIS 0,7% + payout Rp2.500, dapat fee Rp0 → loss ~Rp3.200/kejadian. → Wajib fee penarikan / minimum / batas.
  2. **Order batal refund full**: QRIS 0,7% sudah terbayar → loss ~Rp805/kejadian. Kecil, tapi bisa numpuk kalau fraud.
  3. **Volume < ±111 order/bulan**: profit Rp7.367/order belum nutup biaya tetap (dorman + operasional). Bukan boncos Xendit, tapi operasional.
- **Float AMAN:** customer bayar dulu → uang ada di saldo Xendit sebelum payout → tidak perlu modal ngutang untuk settlement.
- **Minimum top-up akun baru 3,5 JOD ≈ Rp80.500** — cukup untuk ~2–4 order kecil, sekaligus mengurangi akun sampah dan menutup sebagian fee payout tetap.

## Scope Sistem (yang berubah dari PRD lama)

| Area | Perubahan |
|---|---|
| `src/types.ts` | `PaymentMethodId` +5 (`cod`, `transfer`, `wallet`, `xendit_va`, `xendit_qris`), interface `Wallet`, `TopUp`, `Payout`, `VAT`, `ExchangeRate` |
| `src/data/merchant.ts` | `PAYMENT_METHODS[]` expand 2 → 5+; konstanta `PLATFORM_FEE_MERCHANT_JOD = 0.15`, `PLATFORM_FEE_CUSTOMER_JOD = 0.22`, `MIN_TOPUP_NEW_ACCOUNT_JOD = 3.5` |
| `src/store/slices/cartSlice.ts` | State `walletBalance`, `topUpHistory`, `payoutHistory`, branch wallet di checkout |
| Screens baru | 3 halaman wallet (balance, top-up, payout history) per role |
| Checkout flow | Wallet selector, top-up prompt, Xendit redirect mock, breakdown fee customer 0,22 JOD, VAT |
| Kurs | Service fetch rate IDR↔JOD 1×24 jam + cache (`exchange_rates`); semua nominal disimpan IDR, JOD hanya render |
| Gate akun baru | Wajib top-up ≥ 3,5 JOD sebelum bisa order |
| Dispute (super admin) | 1 halaman queue + 4 aksi resolusi; user cuma tombol "Ajukan Sengketa" di detail order + status `disputed`/`resolved_*` |
| Order mock | `merchantOrders.ts` tambah payment method baru + kolom fee merchant/customer |

## Status Legacy

- COD & transfer manual **tetap ada** sebagai metode pembayaran (bukan diganti).
- IDR-only, radius A/B/C, kuota free tier = tetap legacy, bukan keputusan aktif (sesuai `decision-irbid-mvp.md`).

## Realtime & Notifikasi (Push)

Ringkas: PWA bisa kirim **event realtime walau app ketutup** lewat **Web Push** — tapi strict dan beda tegas Chrome vs Safari. Bukan pengganti push native.

### Aturan keras Web Push (2026)

| Aturan | Chrome (Android/Desktop) | Safari macOS | Safari iOS (Home Screen) |
|---|---|---|---|
| **Payload max** | 4 KB (413 reject, gak dipotong) | 4 KB | 4 KB |
| **TTL** | Wajib; maks 28 hari | Apple simpan ≤30 hari | Sama |
| **Silent push** | Dilarang — budget ~6/hari, lewat → notif paksa generik | Dilarang | Dilarang — kalau gagal tampil, subscription dicabut |
| **userVisibleOnly** | Wajib `true` | Wajib `true` | Wajib `true` |
| **Install gate** | Tidak perlu | Tidak perlu (Safari 16.1+) | **WAJIB** Home Screen, iOS 16.4+ |
| **Izin notif** | gesture + quiet-UI | gesture | gesture **setelah install**; deny = harus hapus + install ulang |
| **Force-quit** | Push biasanya tetap jalan | Jalan | **MATI** sampai PWA dibuka lagi |
| **SW wake budget** | ~5 menit | singkat | ~30 detik |
| **ITP / eviction** | — | — | SW di-evict setelah 7 hari tanpa kunjungan → imperative push mati |

### Batas kritis iOS

1. **Install gate** — user iOS yang gak Add to Home Screen = **gak bisa dikirimi push sama sekali**. Gak ada auto-prompt.
2. **Force-quit = bisu** — swipe-away = nol notif sampai dibuka lagi.
3. **Izin sekali seumur hidup** — deny = harus hapus + install ulang.
4. **ITP 7 hari** — subscription mati kalau app jarang dibuka. Fix: **Declarative Web Push** (Safari 18.4+).
5. **Silent push dilarang** — gak bisa bangunin app buat sinkron diam-diam.
6. **Payload 4 KB** — jangan kirim detail order; kirim `order_id` + teks pendek, app fetch sisanya.
7. **Chrome 2025 auto-revoke** — izin dicabut otomatis kalau engagement rendah + volume notif tinggi (installed PWA dikecualikan).
8. **Android Doze** — push bisa telat jam-an.
9. **Reliability** iOS ~70–85% vs Android 90–95%.

### Pola yang dipakai: push-milestone

Server ubah status → kirim push ringkas (`order_id` + teks) → user lihat notif → tap → app kebuka, fetch detail dari server. Kesan "realtime" dapet tanpa proses jalan terus di client.

`Server (event order) → Web Push → notif device → tap → app fetch detail`

### Yang tetap tidak bisa (server / native)

- **Peta live posisi kurir / update kontinu saat app ketutup** → ❌ (butuh WebSocket; cuma jalan saat app kebuka)
- **GPS kurir kontinu** → ❌ (web gak punya background geolocation)
- **Event kritis yang gak boleh gagal di iOS** → **wajib fallback WhatsApp/SMS** (push iOS terlalu rapuh buat jadi satu-satunya jalur)

### Tingkat keyakinan informasi

- **Tinggi** (sumber primer: RFC 8030/8291/8292, Apple docs, WebKit blog, source Chromium): payload 4 KB, TTL wajib, userVisibleOnly wajib, silent push dilarang, install gate iOS 16.4+, macOS Safari 16.1+, SW wake ~5 menit (Chrome), budget silent ~6/hari.
- **Medium** (laporan developer, bukan dokumentasi Apple): force-quit iOS matiin web push, reliability iOS 70–85%, `notificationclick` flaky / tanpa suara, efek ITP 7 hari ke web push.
- **Belum terverifikasi:** `declareManifest`, budget SW iOS (Apple gak publish angkanya), efek DMA Uni Eropa (sumber masih konflik).

> Dokumentasi riset 2026-09-19; aturan di atas **belum diuji langsung di device** — validasi dengan test push nyata di iOS + Android sebelum implementasi.

## Status Online & Fallback WhatsApp

**Deteksi presence (server-side, heartbeat):**
- App kebuka → kirim heartbeat / WebSocket ke server tiap X detik.
- App ketutup → koneksi putus → server tandai **offline** setelah **grace period** (15–30 detik).
- "Offline" = inferensi (gak ada heartbeat), bukan kepastian → wajib grace period biar gak false-positive saat network blip. Server cuma tahu "gak konek", bukan kenapa.

**Fallback (Level 1 — manual, dipilih):**
- Lawan bicara offline → app tampil **"X sedang offline"** + tombol **"Chat via WhatsApp"**.
- Tombol = deep link `https://wa.me/<nomor>?text=<pesan>` → langsung buka chat WA.
- Gratis, tanpa API, tanpa approval. Cukup 1 baris di client.

**Syarat: nomor WhatsApp WAJIB saat registrasi.**
- Field nomor WA **wajib** untuk customer & kurir/merchant — karena fallback butuh nomor tujuan.
- Validasi format (kode negara: +962 Jordan / +62 Indonesia, dsb).
- Simpan ternormalisasi ke **E.164** biar `wa.me` langsung jalan tanpa sanitasi ulang.

**Level 2 (otomatis via WhatsApp Business API) — belum dipakai:**
- Butuh nomor WA Business + template pesan approve Meta + biaya per pesan.
- Masuk pertimbangan saat volume sudah tinggi; Level 1 dulu.
- **Keputusan PO 2026-09-23: Level 2 TIDAK dipakai di MVP.** Fallback tetap `wa.me` manual (Level 1, gratis). WA Business API hanya dibuka kalau ada kebutuhan kirim pesan otomatis yang terbukti — bukan sekarang.

## Open Questions (belum final)

> Disclosed (dijawab di body): #1 (merchant setor GST/VAT makanan, platform setor GST fee — section "VAT dua lapis"), #9 (flat fee JOD ganti komisi 8% — update PO 2026-09-21), #12 (protection fund 2% dipakai di unit economics), #20/#21 (Wise & konversi IDR→JOD dibatalkan). Sisa yang perlu keputusan:

1. ~~Siapa yang menyetor GST/VAT — platform atau tiap merchant?~~ — **Closed**: merchant setor GST makanan, platform setor GST fee (Section VAT dua lapis).
2. Ambang registrasi IGA & kapan mulai memungut GST (Jordan).
3. Tarif GST spesifik makanan siap saji vs ongkir di Jordan.
4. PPN Indonesia atas "ekspor jasa" — apakah berlaku untuk entitas PT Indonesia.
5. Xendit: onboarding + approval skenario penggunaan (user di luar negeri, transaksi IDR). — **Ditunda ke backend (PO 2026-09-22)**: repo ini mock, tidak memblokir UI.
6. Urutan implementasi: apakah wallet dikerjakan sebagai milestone terpisah setelah M5, atau disisipkan di M0-M5. — **Ditunda ke backend (PO 2026-09-22)**; milestone mock repo ini menempatkan wallet di M3.
7. Onboarding Xendit: persetujuan kategori bisnis (marketplace + disbursement). — *(soal fee dorman USD 50 sudah dijawab: akun dormant kena minimum USD50/bulan; definisi "activity threshold" belum resmi — konfirmasi sales)* — **Ditunda ke backend (PO 2026-09-22)**.
8. Apakah perlu xenPlatform (sub-account per merchant, Rp25.000/akun/bulan) atau cukup 1 akun utama + internal ledger. — **Rekomendasi saat ini: 1 akun utama + ledger internal, tanpa xenPlatform (murah & simpel).** — **Ditunda ke backend (PO 2026-09-22)**; rekomendasi dicatat untuk handoff.
9. ~~Komisi aplikator final: 5% atau 10% untuk MVP?~~ — **Closed**: diganti **flat fee JOD** (merchant 0,15 + customer 0,22) per update PO 2026-09-21. Referensi komisi 8% sudah tidak berlaku.
10. ~~Deposit kurir~~ — **Closed**: kurir diurus merchant (PRD bab 04), deposit kurir bukan urusan platform.
11. ~~Holding earnings kurir~~ — **Closed**: kurir diurus merchant, holding earnings bukan urusan platform.
12. ~~Protection fund: 1% atau 2% dari komisi platform?~~ — **Closed**: 2% dipakai di unit economics (basis = fee platform, bukan komisi %).
13. Timer SLA per zona: konfigurasi final (15/30/10 menit) berdasarkan data rute Irbid. — **Diputuskan sementara (PO 2026-09-22): 15/30/10 dipakai** sampai ada data rute Irbid.
14. Penalti customer lalai: % potongan final — body pakai 50% makanan + ongkir; perlu finalize (30/50/full ongkir).
15. Regulasi e-money/PJP & segregated account: struktur legal platform sebagai penampung dana (WAJIB konsultasi sebelum produksi — bisa beda jalur izin BI untuk closed-loop).
16. Cash-out saldo customer: flow tarik saldo kembali ke rekening mereka (wajib ada supaya customer mau top-up).
17. Struktur PPh & PPN Indonesia: angka final fee vs beban (validasi konsultan pajak).
18. Regulasi Indonesia: kewajiban pajak & ambang batas sudah diriset (PPh final 0,5% sejak awal; PPh 22 merchant Rp600jt/12bln; izin BI float ≥Rp1 miliar; PPN PMSE PMK-48/81/2024) — finalisasi dengan konsultan sebelum produksi.
19. Segregated account: desain pemisahan dana float user dari dana operasional (wajib sesuai PBI).
20. ~~Konversi IDR→JOD~~ — **Closed**: dibatalkan (update PO 2026-09-21). Transaksi murni IDR; JOD display-only.
21. ~~Wise API quote real-time~~ — **Closed**: Wise tidak dipakai.
22. Fee cash-out customer: nominal/fee penarikan saldo (wajib ada supaya cash-out tidak boncos ~Rp3.200/kejadian).
23. Konfirmasi "activity threshold" fee dorman ke sales Xendit (interpretasi blog vs T&C: 180 hari). — **Ditunda ke backend (PO 2026-09-22)**.
24. Registrasi: nomor WhatsApp wajib (customer & kurir/merchant) — tentukan apakah perlu verifikasi OTP (WA/SMS) saat daftar, atau cukup input + validasi format E.164. — **RESOLVED (PO 2026-09-22): Level 1 saja — login Google untuk customer (menggantikan email + sandi), nomor WA wajib diisi, divalidasi format, disimpan E.164; fallback tetap `wa.me` manual. Tidak ada OTP WA / WhatsApp Business API di MVP** (itu Level 2 yang PRD sendiri tunda, `:728-731`). **Sisa terbuka:** apakah merchant/kurir juga boleh masuk lewat Google.
25. Fee 0,37 JOD untuk metode **legacy** (transfer manual, COD cash): apakah customer fee 0,22 tetap dipungut? Bagaimana kalau bayar cash di luar wallet? — **Diputuskan (PO 2026-09-22): fee flat 0,37 JOD (customer 0,22 + merchant 0,15) berlaku untuk semua metode, termasuk legacy (transfer manual / COD cash).**
26. Provider rate IDR↔JOD: **pilih provider yang benar-benar menyediakan JOD** (bukan ECB-only seperti Frankfurter). Test endpoint sebelum fix.
27. **Sanity check fee flat:** apakah fee customer 0,22 JOD (25% dari order Rp20.000) bisa diterima pasar? Pertimbangkan fee bertingkat / minimum order kalau churn tinggi di order kecil.
28. Perilaku saat rate API mati: fallback pakai rate terakhir berapa lama sebelum dianggap basi? Batas maksimal umur cache?
29. Dispute: finalisasi **window 24 jam**, kategori sengketa, dan SLA resolusi — ditunda sampai volume dispute > ~5/bulan (section "Dispute — Modul Super Admin").
30. Dispute: siapa "super admin" secara operasional (platform pusat vs per-merchant) dan bagaimana kalau merchant jadi pihak bersengketa?

## Referensi

### Klaim terverifikasi (dengan kutipan sumber — untuk audit tim bisnis)

> Status: ✅ = angka cocok sumber, ⚠️ = beda/sebagian (perlu konfirmasi), ❌ = tidak bisa diverifikasi statis.

| Klaim | Sumber | Lokasi di sumber | Kutipan | Status |
|---|---|---|---|---|
| QRIS 0,70% | `https://www.xendit.co/id/biaya/` | Kategori QRIS | "QRIS — 0,70%" | ✅ |
| Payout Rp2.500 | `https://help.xendit.co/hc/en-us/articles/360027727432` | Disbursement fee | "Rp 2.500 per transfer" | ⚠️ Rp2.500 tidak tampil di halaman publik — konfirmasi ke sales |
| Fee dorman USD 50 | `https://www.xendit.co/en/blog/dormant-account-fees-explained-what-they-are-and-why-payment-providers-charge-them/` | Paragraf pembuka | "the monthly minimum fee of USD 50 applies to dormant and inactive accounts, covering both master accounts and subaccounts" | ✅ USD 50; ⚠️ angka "180 hari" tidak ada di sumber resmi — konfirmasi sales |
| Dorman = 180 hari | `https://www.xendit.co/en/xendit-service-agreement/` | Definisi | "no Transactions within a continuous period of 180 days" (dari T&C) | ⚠️ Audit 2026: angka 180 hari tidak ditemukan di sumber resmi Xendit — T&C & blog tidak konsisten, konfirmasi sales |
| VA Rp4.000 | `https://www.xendit.co/id/biaya/` | Kategori Virtual Account | "Rp4.000" | ⚠️ Investor audit menemukan angka lain (VA Aggregator total ~Rp13rb di beberapa sumber) — konfirmasi |
| OVO/DANA 1,5% | `https://www.xendit.co/id/biaya/` | Kategori e-wallet | "1,50%" | ⚠️ Audit menemukan 2% di sumber lain — konfirmasi |
| Settlement H+2 | `https://help.xendit.co/` | Settlement article | "settlement ... H+2" | ⚠️ Variatif per channel, bukan universal |
| Create payout v3 | `https://docs.xendit.co/apidocs/create-payout-v3` | Request/header | `idempotency-key`, `api-version` | ✅ |
| Payout status enum | `https://docs.xendit.co/docs/integration-payouts` | Status payout | ACCEPTED, REJECTED, dsb (12 status) | ✅ |
| Account name check | Xendit Data Services | Produk terpisah | Validasi nama vs nomor rekening (ID) | ✅ |
| Webhook payout | `https://docs.xendit.co/docs/webhooks` | Event | `v3_payout.*` events | ✅ |
| PPh 22 marketplace 0,5% + Rp600jt + 12k traffic | `https://pajak.go.id/id/pemungutan-pph-oleh-marketplace` | FAQ PMK 37/2025 | "nilai transaksi > Rp600jt/12bln; traffic > 12.000/12bln; tarif 0,5%" (level platform, bukan per-merchant; efektif 1 Nov 2026) | ✅ |
| Closed-loop < Rp1 miliar bebas izin | `https://www.bi.go.id/id/publikasi/peraturan/Pages/PBI-200618.aspx` | Pasal 4 | "UE closed loop dengan jumlah Dana Float paling kurang Rp1.000.000.000,00 wajib memperoleh izin" | ✅ |
| Saldo registered ≤Rp10jt, transaksi ≤Rp20jt/bln | PBI 20/6/PBI/2018 | Pasal 13 | Saldo maks registered Rp10jt (unregistered ≤Rp2jt); batas transaksi Rp20jt/**bulan** (bukan per-transaksi) | ✅ |
| Dana float 30% giro / 70% SBN | PBI 20/6/PBI/2018 | Pasal 14 | "paling sedikit 30% pada giro BUKU 4; paling banyak 70% surat berharga Pemerintah/BI" | ✅ |
| Segregated account | `https://www.bi.go.id/id/publikasi/peraturan/Pages/PBI_230621.aspx` | PBI PJP | Dana float dicatat terpisah, rekening terpisah dari operasional | ⚠️ Teks spesifik terpotong di fetch — baca pasal langsung |
| PPN PMSE 11% efektif | `https://pajak.go.id/sites/default/files/2020-05/PMK-48%20PPN%20PMSE_%2BPER-07.pdf` | PDF PMK 48/2020 | 12% × 11/12 (efektif 11%) | ⚠️ PDF tidak extractable; tarif PPN Indonesia 12% sejak 1 Jan 2025 |
| Jordan GST 16% | PWC Tax Summaries `taxsummaries.pwc.com/jordan/corporate/other-taxes` | Other taxes | "A general sales tax similar in operation to a value-added tax (VAT) is imposed at the rate of 16%" | ✅ (nama resmi GST, bukan VAT) |
| Jordan GST legal basis | `https://istd.gov.jo` (via archive) | — | **General Sales Tax Law No. 6 of 1994** (amended); Income Tax = Law No. 38 of 2018, peraturan terpisah | ⚠️ istd.gov.jo block non-JO traffic (ECONNREFUSED); verifikasi via PwC/archive |
| Wise fee mulai 0,27% | `https://wise.com/id/pricing/` | Fees at a glance | "Sending money — Fee varies by currency — From 0.27%" | ⚠️ Angka "dari 0,27%" global, bukan per koridor IDR→JOD; tarif riil IDR outbound 0,43–0,65% — drop/verifikasi |
| Wise volume discount $25k | `https://wise.com/id/pricing/` | Large transfers | "discount when you send over 25,000 USD" | ✅ |
| Wise quote expired 30 menit | `https://docs.wise.com/guides/product/send-money/use-cases/correspondent/correspondent-create-auth-quote` | Quote expiration | "Quotes expire in approximately 30 minutes" | ✅ |
| Wise rate lock 24-48 jam | Wise docs | Rate expiration | "exchange rate is held for 24–48 hours" | ✅ |
| Wise quote endpoint | `https://docs.wise.com/api-reference` | Quote | `POST /profiles/{profileId}/quotes` | ✅ |
| IDR→JOD Rp2jt → 80,90 JOD | `https://fromto.money/transfer/from-indonesia/to-jordan` | — | Contoh ilustratif | ❌ rate fluktuatif + klaim jalur Wise bertentangan dengan halaman resmi Wise — treat sebagai ilustrasi, bukan fakta jalur |
| JOD→IDR fee "0" kurs dipukul | `https://www.monito.com/send-money/jordan/indonesia/jod/idr` | Comparison | fee tampilan 0,00 JOD; rate ~4,15% lebih jelek dari mid-market (angka berubah real-time) | ⚠️ dokumen tulis 4,49% — update ke rate terkini |
| dLocal Jordan IBAN 30 digit | `https://docs.dlocal.com/docs/jordan-payouts-v3` | Bank transfers | "All Jordan IBANs begin with 'JO' and are exactly 30 characters long" | ✅ |
| dLocal wallet transfer | `https://docs.dlocal.com/docs/jordan-payouts-v3` | Wallet transfers | "`beneficiary.instant_payment.type` — MOBILE or ALIAS" | ✅ |
| Nium Jordan JOD | `https://atlas.nium.com/country/jordan` | Routes | Supported currency JOD, modes B2B/B2P/P2P | ✅ |
| KeyBS Jordan RTGS/JoMoPay | `https://keybs.io/services/global-payouts/countries/jordan` | Jordan | "settle in JOD on RTGS and other local rails; real-time on eligible local rails" | ✅ |

### Klaim yang perlu konfirmasi lanjutan (⚠️ — jangan dipakai sebagai angka pasti tanpa verifikasi)

1. **Fee Xendit VA (Rp4.000) & OVO/DANA (1,5%)** — audit menemukan sumber lain menyebut angka beda (VA total ~Rp13rb, OVO 2%). Tarif Xendit bisa berubah & beda kategori merchant. **Konfirmasi ke sales Xendit saat onboarding.**
2. **Fee payout Rp2.500** — tidak tampil di halaman publik. **Konfirmasi kontrak.**
3. **Settlement H+2** — variatif per channel, bukan universal. **Konfirmasi per channel yang dipakai.**
4. **Fee dorman "activity threshold"** — blog bilang "below activity threshold", T&C bilang 180 hari tanpa transaksi. Dua interpretasi. **Tanya sales.**
5. **PPN fee Xendit 11 vs 12%** — pricing ID bilang "sudah termasuk PPN", T&C bilang "exclusive of taxes". **Baca kontrak.**
6. **istd.gov.jo (IGA Jordan)** — tidak bisa diakses dari luar Jordan. Gunakan PWC Tax Summaries / websearch sebagai sumber alternatif GST Jordan.
7. **Contoh kurs (FromTo, Monito)** — rate fluktuatif, treat sebagai ilustrasi bukan angka tetap.

### Daftar lengkap URL referensi

- Xendit Payout API v3: `https://docs.xendit.co/apidocs/create-payout-v3`
- Xendit integration payouts: `https://docs.xendit.co/docs/integration-payouts`
- Xendit Batch Payouts dashboard: `https://docs.xendit.co/docs/batch-payouts`
- IGA Jordan (ISTD): `https://istd.gov.jo` — landasan hukum GST: **General Sales Tax Law No. 6 of 1994** (amended), tarif umum 16%. PPh Jordan = Income Tax Law No. 38 of 2018 (terpisah)
- JoPACC (CliQ/JoMoPay): `https://www.jopacc.com`
- PRD aktif repo: `/Users/vanviakingali/Downloads/sa7tein-pwa/docs/product/prd/decision-irbid-mvp.md`, `milestones-irbid-mvp.md`
- Xendit pricing: `https://www.xendit.co/id/biaya/`
- Xendit pricing calculator: `https://www.xendit.co/en-id/pricing-calculator-id/`
- Xendit transaction fees (timing deduction): `https://docs.xendit.co/v1/docs/transaction-fees`
- Xendit disbursement fee: `https://help.xendit.co/hc/en-us/articles/360027727432`
- Xendit T&C (definisi Dormant Account = 180 hari): `https://www.xendit.co/en/xendit-service-agreement/`
- Xendit blog dormant fee: `https://www.xendit.co/en/blog/dormant-account-fees-explained-what-they-are-and-why-payment-providers-charge-them/`
- MDR QRIS (Bank Indonesia): `https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/Pages/mdr-qris.aspx`
- PBI Uang Elektronik (closed-loop, dana float, ambang Rp1 miliar): `https://www.bi.go.id/id/publikasi/peraturan/Pages/PBI-200618.aspx`
- PBI PJP (segregated account, kategori izin): `https://www.bi.go.id/id/publikasi/peraturan/Pages/PBI_230621.aspx`
- PBI PISP (regulasi industri SP 2025): `https://www.bi.go.id/id/publikasi/peraturan/Pages/PBI_102025.aspx`
- PMK 37/2025 (PPh 22 marketplace): `https://pajak.go.id/id/pemungutan-pph-oleh-marketplace`
- PMK 48/2020 + PMK 81/2024 (PPN PMSE): `https://pajak.go.id/sites/default/files/2020-05/PMK-48%20PPN%20PMSE_%2BPER-07.pdf`
- Wise API docs: `https://docs.wise.com/api-reference`
- Wise API guide (enterprise payout): `https://docs.wise.com/guides/product/send-money/use-cases/enterprise/send-money`
- Wise IDR→JOD rate: `https://wise.com/gb/currency-converter/idr-to-jod-rate`
- FromTo.money (pembanding transfer IDR→JOD): `https://fromto.money/transfer/from-indonesia/to-jordan`
- dLocal Jordan payouts: `https://docs.dlocal.com/docs/jordan-payouts-v3`
- Nium Jordan: `https://atlas.nium.com/country/jordan`
- KeyBS Pay Jordan: `https://keybs.io/services/global-payouts/countries/jordan`