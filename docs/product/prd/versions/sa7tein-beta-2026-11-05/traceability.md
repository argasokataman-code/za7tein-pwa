# Traceability: sumber PRD → dokumentasi repo

Pemetaan butir per butir antara PRD aktif `sa7tein-beta-2026-11-05` (135 halaman) dan dokumentasi di folder ini. Dibuat 2026-11-05 setelah pemeriksaan cakupan otomatis.

Ambang yang dipakai: dokumen dianggap **1:1** bila (a) setiap ID requirement sumber muncul di tabel delta `analysis.md`, (b) setiap ID punya file `features/<R-ID>.md` berisi acceptance, (c) setiap `OPEN-xx` punya disposisi, dan (d) istilah/konvensi PRD tercatat di `glossary.md`.

## 1. Cakupan

| Ukuran | Hasil |
|---|---|
| ID requirement sumber | 161: ACC 8, CUS 41, MER 41, OPS 24, BR-B 22, ARC 18, NFR 7 |
| ID yang terpetakan ke `R-*` | 161/161 (sebelum perbaikan 2026-11-05: 155/161) |
| File fitur | 35 (`features/R-*.md`) |
| `OPEN-xx` dengan disposisi | 86/86: 6 `Terbuka`, 80 `Diputuskan` |
| Butir konteks (konvensi, latar belakang, tujuan, lingkup, glosarium, referensi) | `glossary.md` |

## 2. Matriks ID sumber → R-*

Satu ID sumber bisa diserap lebih dari satu `R-*` bila aturannya menyentuh dua domain (contoh `OPS-08` → `R-MONEY` + `R-OPS`). Status fitur dibaca dari baris `Status:` file fiturnya.

### ACC (akun) 8

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| ACC-01 | R-ACC | partial |
| ACC-02 | R-ACC | partial |
| ACC-03 | R-ACC | partial |
| ACC-04 | R-ACC | partial |
| ACC-05 | R-ACC, R-MER-PROFILE | partial |
| ACC-06 | R-ACC, R-ACC-AGREEMENT | partial |
| ACC-07 | R-ACC | partial |
| ACC-08 | R-ACC | partial |

### CUS (customer) 41

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| CUS-01 | R-ACC | partial |
| CUS-02 | R-CUS-ADDRESS | partial |
| CUS-03 | R-CUS-ADDRESS | partial |
| CUS-04 | R-CUS-DISCOVERY | partial |
| CUS-05 | R-CUS-DISCOVERY | partial |
| CUS-06 | R-CUS-DISCOVERY | partial |
| CUS-07 | R-CUS-DISCOVERY | partial |
| CUS-08 | R-CUS-DISCOVERY | partial |
| CUS-09 | R-CUS-DISCOVERY | partial |
| CUS-10 | R-CUS-DISCOVERY | partial |
| CUS-11 | R-CUS-DISCOVERY | partial |
| CUS-12 | R-CUS-DISCOVERY | partial |
| CUS-13 | R-CUS-DISCOVERY | partial |
| CUS-14 | R-CUS-CART | partial |
| CUS-15 | R-CUS-CART | partial |
| CUS-16 | R-CUS-CART | partial |
| CUS-17 | R-CUS-CART | partial |
| CUS-18 | R-CUS-CART | partial |
| CUS-19 | R-CUS-PAY | partial |
| CUS-20 | R-CUS-PAY | partial |
| CUS-21 | R-CUS-ORDER | partial |
| CUS-22 | R-CUS-ORDER | partial |
| CUS-23 | R-CUS-ORDER | partial |
| CUS-24 | R-CUS-ORDER | partial |
| CUS-25 | R-CUS-REFUND | partial |
| CUS-26 | R-CUS-CHAT | partial |
| CUS-27 | R-CUS-RATING | partial |
| CUS-28 | R-CUS-RATING | partial |
| CUS-29 | R-NOTIF | partial |
| CUS-30 | R-ACC-AGREEMENT, R-DISPUTE | partial |
| CUS-31 | R-CUS-CART | partial |
| CUS-32 | R-CUS-PAY | partial |
| CUS-33 | R-QUOTA | partial |
| CUS-34 | R-CUS-MEMBERSHIP | blocked |
| CUS-35 | R-CUS-MEMBERSHIP | blocked |
| CUS-36 | R-CUS-MEMBERSHIP | blocked |
| CUS-37 | R-CUS-POINTS | blocked |
| CUS-38 | R-INVOICE | partial |
| CUS-39 | R-CUS-MEMBERSHIP | blocked |
| CUS-40 | R-CUS-ORDER | partial |
| CUS-41 | R-CUS-CART | partial |

### MER (merchant) 41

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| MER-01 | R-MER-PROFILE | partial |
| MER-02 | R-MER-PROFILE | partial |
| MER-03 | R-MER-OPS | partial |
| MER-04 | R-MER-COVERAGE | partial |
| MER-05 | R-MER-CATALOG | partial |
| MER-06 | R-MER-CATALOG | partial |
| MER-07 | R-MER-CATALOG | partial |
| MER-08 | R-MER-CATALOG | partial |
| MER-09 | R-MER-PROMO | partial |
| MER-10 | R-MER-ORDER | partial |
| MER-11 | R-BATCH | partial |
| MER-12 | R-MER-ORDER | partial |
| MER-13 | R-MER-ORDER | partial |
| MER-14 | R-BATCH | partial |
| MER-15 | R-MER-ORDER | partial |
| MER-16 | R-COURIER | partial |
| MER-17 | R-QUOTA | partial |
| MER-18 | R-QUOTA | partial |
| MER-19 | R-QUOTA | partial |
| MER-20 | R-QUOTA | partial |
| MER-21 | R-CUS-CHAT | partial |
| MER-22 | R-ACC-AGREEMENT, R-DISPUTE | partial |
| MER-23 | R-NOTIF | partial |
| MER-24 | R-MER-MEMBERSHIP | blocked |
| MER-25 | R-MER-MEMBERSHIP | blocked |
| MER-26 | R-MER-MEMBERSHIP | blocked |
| MER-27 | R-MER-MEMBERSHIP | blocked |
| MER-28 | R-MER-OPS | partial |
| MER-29 | R-MER-OPS | partial |
| MER-30 | R-MER-OPS | partial |
| MER-31 | R-HISTORY | partial |
| MER-32 | R-INVOICE | partial |
| MER-33 | R-MER-MEMBERSHIP | blocked |
| MER-34 | R-MER-CREW | blocked |
| MER-35 | R-MER-CREW | blocked |
| MER-36 | R-MER-PROFILE | partial |
| MER-37 | R-COURIER | partial |
| MER-38 | R-COURIER | partial |
| MER-39 | R-MER-CREW | blocked |
| MER-40 | R-MER-ORDER | partial |
| MER-41 | R-MER-DASHBOARD | partial |

### OPS (ops) 24

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| OPS-01 | R-OPS | partial |
| OPS-02 | R-OPS | partial |
| OPS-03 | R-OPS | partial |
| OPS-04 | R-OPS | partial |
| OPS-05 | R-OPS | partial |
| OPS-06 | R-DISPUTE, R-OPS | partial |
| OPS-07 | R-DISPUTE, R-OPS | partial |
| OPS-08 | R-MONEY, R-OPS | partial |
| OPS-09 | R-OPS | partial |
| OPS-10 | R-OPS | partial |
| OPS-11 | R-OPS | partial |
| OPS-12 | R-MONEY, R-OPS | partial |
| OPS-13 | R-OPS | partial |
| OPS-14 | R-CURRENCY, R-OPS | partial |
| OPS-15 | R-OPS | partial |
| OPS-16 | R-OPS, R-HISTORY | partial |
| OPS-17 | R-OPS | partial |
| OPS-18 | R-OPS, R-CONFIG | partial |
| OPS-19 | R-OPS | partial |
| OPS-20 | R-OPS | partial |
| OPS-21 | R-INVOICE, R-OPS | partial |
| OPS-22 | R-OPS | partial |
| OPS-23 | R-MER-DASHBOARD, R-OPS | partial |
| OPS-24 | R-DISPUTE, R-OPS | partial |

### BR-B (aturan batch) 22

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| BR-B-01 | R-BATCH | partial |
| BR-B-02 | R-BATCH | partial |
| BR-B-03 | R-BATCH | partial |
| BR-B-04 | R-BATCH | partial |
| BR-B-05 | R-BATCH | partial |
| BR-B-06 | R-BATCH | partial |
| BR-B-07 | R-BATCH | partial |
| BR-B-08 | R-BATCH | partial |
| BR-B-09 | R-BATCH | partial |
| BR-B-10 | R-BATCH | partial |
| BR-B-11 | R-BATCH | partial |
| BR-B-12 | R-BATCH | partial |
| BR-B-13 | R-BATCH | partial |
| BR-B-14 | R-BATCH | partial |
| BR-B-15 | R-BATCH | partial |
| BR-B-16 | R-BATCH | partial |
| BR-B-17 | R-BATCH | partial |
| BR-B-18 | R-BATCH | partial |
| BR-B-19 | R-BATCH | partial |
| BR-B-20 | R-BATCH | partial |
| BR-B-21 | R-BATCH | partial |
| BR-B-22 | R-BATCH | partial |

### ARC (arsitektur) 18

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| ARC-01 | R-ARCH | blocked |
| ARC-02 | R-ARCH | blocked |
| ARC-03 | R-ARCH | blocked |
| ARC-04 | R-ARCH | blocked |
| ARC-05 | R-ARCH | blocked |
| ARC-06 | R-ARCH | blocked |
| ARC-07 | R-ARCH | blocked |
| ARC-08 | R-ARCH | blocked |
| ARC-09 | R-ARCH | blocked |
| ARC-10 | R-OPS, R-ARCH | partial, blocked |
| ARC-11 | R-ARCH | blocked |
| ARC-12 | R-ARCH | blocked |
| ARC-13 | R-ARCH | blocked |
| ARC-14 | R-ARCH | blocked |
| ARC-15 | R-ARCH | blocked |
| ARC-16 | R-ARCH | blocked |
| ARC-17 | R-ARCH | blocked |
| ARC-18 | R-ARCH | blocked |

### NFR (non-fungsional) 7

| ID sumber | R-* penyerap | Status fitur |
|---|---|---|
| NFR-01 | R-NFR | partial |
| NFR-02 | R-NFR | partial |
| NFR-03 | R-CURRENCY, R-NFR | partial |
| NFR-04 | R-CURRENCY, R-NFR | partial |
| NFR-05 | R-REALTIME, R-NFR | partial |
| NFR-06 | R-REALTIME, R-NFR | partial |
| NFR-07 | R-NFR | partial |

## 3. Disposisi `OPEN-01`..`OPEN-86`

Sumber: PRD §22 halaman 101–135. Kolom `R-* terkait` dipetakan dari kolom "Bagian" PRD, bukan tebakan: aturan finalnya ada di bagian yang disebut, dan tiap bagian sudah punya file fitur.

Enam isu masih **Terbuka** di PRD: `OPEN-01` (payment gateway), `OPEN-02` (provider kurs), `OPEN-25` (query lintas instance), `OPEN-27` (legal), `OPEN-28` (metrik), `OPEN-31` (fitur bonus paket). Jangan menutupnya dengan asumsi.

| ID | Isu (ringkas dari PRD) | Bagian | Status PRD | R-* terkait |
|---|---|---|---|---|
| OPEN-01 | Kapabilitas integrasi DANA (daftar di 15.7). Diganti kemudian: DANA diganti payment gateway Indonesia, yang dipilih berdasarkan daftar kapabilitas di | §15 | Terbuka | R-MONEY |
| OPEN-02 | Provider kurs, jam update harian, dan perilaku bila update gagal (jam update diatur ops lewat 12.2; fallback menunggu diskusi internal; jam default tidak dicantumkan di PRD, sama seperti… | §15, §20 | Terbuka | R-MONEY, R-ARCH, R-NFR |
| OPEN-03 | Konfirmasi: nominal IDR dikunci dengan kurs saat order dibuat, lalu dipakai untuk payout dan refund | §15.2 | Diputuskan | R-CURRENCY, R-MONEY |
| OPEN-04 | Aturan pembulatan IDR per komponen dan per bagian payout (diputuskan: tagihan ke atas ke ratusan, payout ke bawah ke rupiah penuh) | §15 | Diputuskan | R-MONEY |
| OPEN-05 | Formula platform fee customer dan platform fee merchant (flat atau persen, basis perhitungan) | §12, §16 | Diputuskan | R-OPS, R-QUOTA |
| OPEN-06 | Apakah order Quick boleh COD (diputuskan: boleh, dengan talangan tunai kurir partner ke merchant). Diganti kemudian: kurir partner dan order Quick dihapus (15.5) | §15.5 | Diputuskan | R-COURIER, R-CUS-PAY, R-MONEY |
| OPEN-07 | Refund ke customer berakun DANA, pembayaran gagal atau kedaluwarsa, transfer ke rekening bank (diputuskan: lihat 15.2 dan 15.6). Diganti kemudian: refund order online selalu lewat transfer… | §7.3, §15.6 | Diputuskan | R-CUS-REFUND |
| OPEN-08 | Penarikan kembali dana setelah payout untuk kompensasi atau denda (diputuskan: kompensasi dan punishment hanya berbentuk non-uang, sehingga tidak ada penarikan dana setelah payout) | §15.6, §17 | Diputuskan | R-CUS-REFUND, R-DISPUTE, R-ACC-AGREEMENT |
| OPEN-09 | Langganan: mekanisme pindah skema (diputuskan: setting "Terima order tanpa kuota order?") | §16 | Diputuskan | R-QUOTA |
| OPEN-10 | Gift card dan eWallet tetap di MVP atau ditunda, mengingat risiko stored value (diputuskan: dihapus dan digantikan membership merchant, 14.4) | §14 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP, R-MER-PROMO |
| OPEN-11 | Algoritma dispatch kurir partner, termasuk kebutuhan lokasi saat idle (gugur: kurir partner dihapus) | tidak disebut | Diputuskan | R-COURIER |
| OPEN-12 | Batas waktu reservasi kurir partner, karena merchant tidak punya batas waktu accept (diputuskan: tidak ada reservasi sejak order dibuat; kurir direserve sejak assignment sampai approve atau… | tidak disebut | Diputuskan | R-COURIER |
| OPEN-13 | Definisi kurir partner tidak merespons, jenjang SP, kapan menunggu atau mencari pengganti (diputuskan: approve/reject dengan alasan; tidak merespons sampai prepare selesai berarti SP,… | tidak disebut | Diputuskan | R-COURIER |
| OPEN-14 | Perilaku saat kurir partner terakhir sudah ter-reserve ketika customer membuat order Quick (diputuskan: kurir dipilih dan direserve saat merchant accept; bila tidak ada yang available,… | tidak disebut | Diputuskan | R-COURIER, R-CUS-PAY |
| OPEN-15 | Mode radius: jarak garis lurus atau rute; pembulatan satuan jarak (diputuskan: coverage garis lurus; fee proporsional dari rute jalan kaki) | §9.1 | Diputuskan | R-MER-COVERAGE, R-CUS-DISCOVERY |
| OPEN-16 | Auto-sort: titik awal dan akhir rute (diputuskan: mulai dari merchant, berakhir di order terakhir) | §9.3 | Diputuskan | R-COURIER, R-REALTIME |
| OPEN-17 | Dispute diputus otomatis berdasarkan rule atau manual oleh ops (diputuskan: dua mekanisme, yaitu auto dispute oleh sistem untuk aktivitas yang didefinisikan ops dan manual dispute oleh ops… | §17 | Diputuskan | R-DISPUTE, R-ACC-AGREEMENT |
| OPEN-18 | Rule dasar wajib bila merchant tidak memilih rule (gugur: merchant wajib mengikuti semua rule yang didefinisikan ops, yaitu User Agreement) | §17 | Diputuskan | R-DISPUTE, R-ACC-AGREEMENT |
| OPEN-19 | Batas waktu pengajuan dispute dan akses ops ke chat sebagai bukti (diputuskan: ops memeriksa seluruh riwayat percakapan; batas waktu pengajuan dispute digabung dengan retensi riwayat chat… | §17, §19 | Diputuskan | R-DISPUTE, R-ACC-AGREEMENT, R-NOTIF |
| OPEN-20 | Chat: durasi penutupan dan retensi riwayat (waktu chat dibuka dan kapan kurir bergabung sudah diputuskan) (sebagian diputuskan: durasi penutupan chat menjadi config ops tersendiri, dan… | §19.1 | Diputuskan | R-CUS-CHAT |
| OPEN-21 | Rating: skala, batas waktu memberi rating, moderasi review (diputuskan: bintang 1–5, tanpa batas waktu, tanpa moderasi) | §19.2 | Diputuskan | R-CUS-RATING |
| OPEN-22 | Definisi "tipe" dan "area" merchant untuk group dan filter (diputuskan: tidak dipakai; group hanya berdasarkan tag) | §10 | Diputuskan | R-CUS-DISCOVERY, R-CUS-ORDER |
| OPEN-23 | Semantik isStackable: syarat kombinasi, batas jumlah promo, dan urutan penerapan promo serta reward poin dalam satu order, termasuk boleh tidaknya order yang memakai next order memakai… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-24 | Protokol langkah Workflow ke DO (diputuskan: RPC); jalur aplikasi ops ke Worker (diputuskan: aplikasi ops memakai Worker terpisah) | §20 | Diputuskan | R-ARCH, R-NFR |
| OPEN-25 | Cara melayani query lintas instance (browse, search, filter, riwayat order) dan rencana skalanya (diputuskan: registry instance DO disimpan di Workers KV, root key DOInstanceRegistry) | §20, §21 | Terbuka | R-ARCH, R-NFR |
| OPEN-26 | Enum status final order dan batch (diputuskan: order draft, waitingPayment, pending, prepare, waitingDelivery, delivery, done, failed, canceled, dan rejected, dengan flag pendingRefund;… | §7.5 | Diputuskan | R-CUS-ORDER, R-BATCH |
| OPEN-27 | Daftar periksa legal bersama konsultan hukum | §21.3 | Terbuka | R-NFR |
| OPEN-28 | Metrik keberhasilan MVP | §3 | Terbuka | tidak ada R-* (§3 tidak mengatur fitur) |
| OPEN-29 | Langganan: pembelian paket tambahan berisi kuota order saat paket sebelumnya masih aktif, untuk merchant maupun customer, dan urutan pemakaian kuotanya (diputuskan: paket aktif tidak bisa… | §16.1, §16.2 | Diputuskan | R-QUOTA |
| OPEN-30 | Tarif "Bayar pakai DANA" (DANA Widget): bila dikenai tarif + PPN, metode saldo DANA dihapus dan pembayaran hanya lewat QRIS (gugur: DANA diganti payment gateway Indonesia tanpa fitur… | §15.2 | Diputuskan | R-MER-MEMBERSHIP, R-MER-PROMO, R-CURRENCY, R-MONEY |
| OPEN-31 | Daftar fitur yang bisa di-unlock lewat paket langganan merchant dan customer | §16.1 | Terbuka | R-QUOTA |
| OPEN-32 | Batas akhir masa aktif paket (diputuskan: dihitung sejak pembayaran, 1 × 24 jam harian, 7 × 24 jam mingguan, 28 × 24 jam bulanan) | §16.1 | Diputuskan | R-QUOTA |
| OPEN-33 | Paylater (fitur dihapus): aturan uang order paylater (diputuskan: Regular saja; wajib mengonsumsi kuota order customer dan merchant, tanpa platform fee; subsidi promo aplikator dibayar ke… | §14.4 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP |
| OPEN-34 | Paylater (fitur dihapus): cara hutang berkurang tanpa pembayaran tagihan di aplikasi, dan nasib hutang saat membership berakhir (diputuskan: pelunasan dicatat manual oleh merchant; hutang… | §14.4 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP |
| OPEN-35 | Membership: pencabutan oleh merchant, customer keluar, pengajuan ulang setelah ditolak, dan tampil tidaknya promo khusus member bagi non-member (diputuskan: merchant bisa mencabut; customer… | §14.4 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP |
| OPEN-36 | Pengajuan membership: pesan WhatsApp ke merchant dikirim otomatis lewat nomor WhatsApp sa7tein (WhatsApp Business Platform), atau tetap disiapkan untuk dikirim customer (diputuskan: tetap… | §14.4 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP |
| OPEN-37 | Kuota order tunggal di paket merchant dan customer: tujuan platform fee customer pada order online yang memakai kuota order merchant, dan apakah order COD mengonsumsi kuota order merchant… | §15, §16 | Diputuskan | R-MONEY, R-QUOTA |
| OPEN-38 | Masa berlaku kuota order alacarte: tidak hangus, atau punya masa berlaku sendiri (diputuskan: tidak pernah hangus) | §16.2 | Diputuskan | R-QUOTA |
| OPEN-39 | Kapan poin dari sebuah order bisa dipakai. Usulan: di order itu sendiri dan di order berikutnya (diputuskan: baru bisa dipakai di order berikutnya) | §14.5 | Diputuskan | R-CUS-POINTS |
| OPEN-40 | Waktu poin masuk dan dikembalikan. Usulan: poin yang ditukar di-reserve saat order dibuat dan kembali bila order batal, ditolak, atau gagal; poin yang didapat masuk saat order selesai,… | §14.5 | Diputuskan | R-CUS-POINTS |
| OPEN-41 | Jumlah poin yang dipakai saat menukar reward: customer memilih sendiri, atau otomatis (usulan): diskon per poin memakai poin sebanyak mungkin dalam kelipatan jumlah poin yang dibutuhkan… | §14.5 | Diputuskan | R-CUS-POINTS |
| OPEN-42 | Penagihan bagi hasil (Fa) pada Quick COD, karena kurir partner menerima F secara tunai. Opsi: dipotong dari payout kurir partner berikutnya (usulan), dibayar kurir lewat QRIS atau saldo… | §15.5 | Diputuskan | R-COURIER, R-CUS-PAY, R-MONEY |
| OPEN-43 | Harga maksimal 1 kuota order merchant: "total platform fee" berarti platform fee customer + platform fee merchant, atau tetap platform fee merchant saja. Logika platform fee customer dua… | §16 | Diputuskan | R-QUOTA |
| OPEN-44 | Customer punya kuota order, tetapi merchant tidak punya kuota order tersedia: apakah kuota customer tetap dipakai dan payout tetap dibayar. Usulan: kuota customer hanya dipakai bersamaan… | §16 | Diputuskan | R-QUOTA |
| OPEN-45 | Penerima payout platform fee customer pada order COD yang mengonsumsi kuota customer dan merchant. Bila tetap ke customer, merchant tidak menerima platform fee customer dan customer untung… | §15.5, §16 | Diputuskan | R-MONEY, R-CUS-PAY, R-QUOTA |
| OPEN-46 | Platform fee customer pada order COD di merchant setting "tidak". Order online di setting itu tidak dikenai platform fee customer karena ditanggung kuota order merchant, sedangkan order COD… | §16 | Diputuskan | R-QUOTA |
| OPEN-47 | Pemakaian kuota order customer pada order yang tidak mengenakan platform fee customer, yaitu order online di merchant setting "tidak". Karena payout kini masuk ke merchant, customer yang… | §16 | Diputuskan | R-QUOTA |
| OPEN-48 | Diskon kuota order merchant dihitung dari total platform fee, padahal platform fee customer pada setiap order yang mengonsumsi kuota merchant kembali ke merchant, sehingga biaya bersih… | §16.1, §16.2 | Diputuskan | R-QUOTA |
| OPEN-49 | Skema diskon kuota order yang berlaku saat pembelian alacarte, karena ops bisa membuat lebih dari 1 skema. Opsi: hanya 1 skema aktif untuk customer dan 1 skema aktif untuk merchant dalam… | §16.2 | Diputuskan | R-QUOTA |
| OPEN-50 | Data jam operasional recurring dan data tanggal yang berlaku di tanggal yang sama, misalnya recurring Senin 08:00–17:00 dan data tanggal Senin 19 Oktober 10:00–14:00. Opsi: data tanggal… | §11.1 | Diputuskan | R-MER-OPS |
| OPEN-51 | Isi field hari pada data recurring dan jumlah data aktif per hari atau tanggal. Opsi: 1 data recurring boleh berisi beberapa hari, misalnya Senin–Jumat, dan setiap hari atau tanggal hanya… | §11.1 | Diputuskan | R-MER-OPS |
| OPEN-52 | Rentang jam operasional yang melewati tengah malam, misalnya 20:00–02:00. Opsi: dibolehkan, dan rentang itu dihitung milik hari atau tanggal jam bukanya (usulan); atau tidak dibolehkan,… | §11.1 | Diputuskan | R-MER-OPS |
| OPEN-53 | Perubahan User Agreement oleh ops, misalnya rule baru atau rule yang diubah. Opsi: perubahan berlaku otomatis untuk semua merchant mulai tanggal berlaku yang diatur ops, dan merchant… | §5, §17 | Diputuskan | R-ACC, R-ACC-AGREEMENT, R-DISPUTE |
| OPEN-54 | Banding atas hasil auto dispute, karena kompensasi dan punishment diterapkan otomatis tanpa moderasi ops. Opsi: pelaku bisa mengajukan keberatan lewat tiket, lalu ops meninjaunya seperti… | §17 | Diputuskan | R-DISPUTE, R-ACC-AGREEMENT |
| OPEN-55 | Busy saat merchant buka kembali sementara kondisi pemicu auto busy masih berlaku (User Agreement baru belum diapprove, atau durasi punishment auto dispute belum habis). Bila busy tetap off,… | §11.2, §17 | Diputuskan | R-MER-OPS, R-DISPUTE, R-ACC-AGREEMENT |
| OPEN-56 | Fitur mulai lebih awal dan penanda selesai di-packing per order setelah ada packing timer strict. Saat ini kurir masih bisa mulai sebelum packing timer selesai dengan persetujuan merchant… | §7.2, §8, §11 | Diputuskan | R-MER-ORDER, R-BATCH, R-MER-PROFILE |
| OPEN-57 | Wording detail order customer setelah packing timer selesai tetapi delivery belum dimulai, misalnya batch belum di-assign ke kurir atau kurir belum menekan mulai delivery. Opsi: tetap… | §8 | Diputuskan | R-BATCH |
| OPEN-58 | Cakupan "tidak mendapat benefit apa pun" pada order yang memakai next order. Opsi: order itu tidak bisa memakai promo lain, tetapi reward sa7tein poin tetap bisa dipakai sesuai keputusan… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-59 | Urutan penerapan saat ada diskon nominal, batas maksimal diskon, atau reward sa7tein poin, karena di kasus ini urutan mempengaruhi hasil. Contoh harga 5 JOD dengan diskon 20% dan potongan 1… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-60 | Reward free product paket langganan untuk customer yang masih punya paket aktif, karena customer hanya boleh punya satu paket aktif dan paket tidak bisa diantre (16.1). Opsi: promo dengan… | §14, §16 | Diputuskan | R-MER-PROMO, R-QUOTA |
| OPEN-61 | Jumlah sa7tein poin yang bisa dipakai dalam satu transaksi (order, pembelian kuota order, atau paket langganan). Opsi: customer menentukan sendiri jumlah poin yang dipakai, paling banyak… | §14.5, §16 | Diputuskan | R-CUS-POINTS, R-QUOTA |
| OPEN-62 | Penggabungan next order dengan promo lain setelah isStackable dihapus, karena next order tidak memberi reward di order itu sehingga tidak punya reward type. Opsi: next order bisa digabung… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-63 | Jumlah reward dalam satu promo. Opsi: setiap promo hanya punya satu reward (usulan); satu promo bisa punya beberapa reward, customer memilih salah satunya, dan promo itu mengisi reward type… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-64 | Dasar perhitungan syarat rule promo, misalnya minimum belanja, saat beberapa promo digabung. Contoh: total harga menu 12 JOD, diskon subtotal merchant 30% membuatnya menjadi 8,4 JOD,… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-65 | Cakupan minimum belanja pada rule yang punya filter menu, kategori menu, atau tag. Opsi: minimum belanja rule yang punya filter hanya dihitung dari menu yang cocok dengan filternya,… | §14 | Diputuskan | R-MER-PROMO |
| OPEN-66 | Tampilan menu nonaktif di list menu merchant. Opsi: tetap tampil dengan label tidak tersedia tetapi tidak bisa dimasukkan ke cart, sama seperti menu di luar availability schedule (usulan);… | §13 | Diputuskan | R-MER-CATALOG |
| OPEN-67 | Harga opsi customisasi. Opsi: harga opsi sama dengan harga dasar menu opsinya, sehingga harga varian = harga dasar menu + harga semua opsi yang dipilih (usulan); harga opsi diatur per menu… | §13 | Diputuskan | R-MER-CATALOG |
| OPEN-68 | Bentuk time range availability schedule. Opsi: recurring per hari dengan jam mulai dan jam selesai, seperti data recurring jam operasional di 11.1 (usulan); per tanggal tertentu; atau… | §13 | Diputuskan | R-MER-CATALOG |
| OPEN-69 | Menu yang punya attribute mandatory tetapi dipilih sebagai opsi customisasi. Karena opsi tidak bisa dicustom lagi, menu itu disajikan tanpa pilihan wajibnya, misalnya kopi tanpa size. Opsi:… | §13 | Diputuskan | R-MER-CATALOG |
| OPEN-70 | Arti jumlah stok yang diisi merchant saat masih ada stok terreserve. Opsi: jumlah itu stok fisik yang sudah termasuk stok terreserve, sehingga stok tersedia = stok − stok ter-reserve, dan… | §13 | Diputuskan | R-MER-CATALOG |
| OPEN-71 | Pemakai data merchant open session. Opsi: sementara hanya data internal tanpa tampilan baru di aplikasi (usulan); merchant bisa melihat riwayat session beserta order di setiap session; atau… | §11.4 | Diputuskan | R-HISTORY |
| OPEN-72 | Session yang berjalan lebih dari satu hari, misalnya merchant dengan jadwal 24 jam setiap hari, atau merchant yang buka manual tanpa jam operasional lalu lupa tutup. Opsi: session tetap… | §11.4 | Diputuskan | R-HISTORY |
| OPEN-73 | Siapa yang bisa melihat dan mendownload invoice order. Opsi: customer pemilik order dan merchant (usulan); hanya customer; atau customer, merchant, dan ops lewat aplikasi internal… | §15.8 | Diputuskan | R-INVOICE |
| OPEN-74 | Ukuran halaman PDF invoice. Opsi: A4 (usulan); atau ukuran struk 80 mm yang bisa dicetak dengan printer thermal (diputuskan: A4) | §15.8 | Diputuskan | R-INVOICE |
| OPEN-75 | Batas durasi packing timer yang diinput merchant. Opsi: ops mensetup maksimal packing timer, seperti maksimal batch timer (usulan); atau merchant bebas menentukan durasinya (diputuskan:… | §8, §12.2 | Diputuskan | R-BATCH, R-CONFIG |
| OPEN-76 | Cara merchant menemukan customer saat mendaftarkan membership langsung. Opsi: lewat nomor HP atau email akun customer dengan pencocokan persis, agar merchant tidak bisa menelusuri daftar… | §14.4 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP |
| OPEN-77 | Pendaftaran langsung untuk customer yang pernah keluar sendiri dari membership merchant itu. Opsi: tidak bisa, customer hanya bisa bergabung lagi lewat pengajuan sendiri (usulan); atau… | §14.4 | Diputuskan | R-MER-MEMBERSHIP, R-CUS-MEMBERSHIP |
| OPEN-78 | Satu nomor WhatsApp untuk lebih dari satu role. Dengan email, pengguna mudah membuat email kedua; dengan nomor WhatsApp, merchant yang juga order sebagai customer atau mengantar sendiri… | §4, §5 | Diputuskan | R-ACC, R-ACC-AGREEMENT |
| OPEN-79 | Persetujuan User Agreement oleh karyawan merchant. Opsi: hanya owner yang wajib approve, dan persetujuannya berlaku untuk seluruh merchant, sementara karyawan cukup bisa melihat isinya… | §11.3, §17 | Diputuskan | R-MER-CREW, R-COURIER, R-DISPUTE, R-ACC-AGREEMENT |
| OPEN-80 | Pergantian owner merchant, misalnya bila nomor WhatsApp owner tidak bisa dipakai lagi atau kepemilikan merchant berpindah, karena hanya owner yang bisa mengelola karyawan dan approve User… | §11.3 | Diputuskan | R-MER-CREW, R-COURIER |
| OPEN-81 | Akun DANA merchant setelah pemindahan owner, karena payout tetap masuk ke akun DANA yang di-binding owner lama. Opsi: pemindahan baru berlaku setelah owner baru binding akun DANA miliknya… | §11.3 | Diputuskan | R-MER-CREW, R-COURIER |
| OPEN-82 | Status online/offline karyawan kurir, karena COU-02 kini hanya untuk kurir partner. Opsi: tetap ada untuk karyawan dengan hak akses antar order, agar yang meng-assign batch tahu siapa yang… | §11.3 | Diputuskan | R-COURIER, R-MER-CREW |
| OPEN-83 | Nilai awal rentang riwayat aktivitas yang bisa dilihat merchant (11.4). Opsi: 90 hari, cukup untuk rekap gaji bulanan dan pengecekan mundur (usulan); 30 hari; atau tanpa batas (diputuskan:… | §11.4, §12.2 | Diputuskan | R-HISTORY, R-CONFIG |
| OPEN-84 | Penanggung biaya transfer payout realtime ke rekening bank merchant dan kurir partner. Opsi: ditanggung aplikator dan ditutup lewat transaction fee (usulan); atau dipotong dari nominal… | §15.1, §15.4 | Diputuskan | R-COURIER, R-MONEY |
| OPEN-85 | Pembagian diskon antara merchant dan aplikator setelah order item diubah, karena diskon yang dinikmati customer bisa lebih kecil dari promo subtotal awal. Opsi: pengurangannya diambil dari… | §7.4, §15.4 | Diputuskan | R-MER-ORDER, R-CUS-REFUND, R-MONEY |
| OPEN-86 | Potongan sa7tein poin pada refund selisih order item, karena selisih bisa melebihi nominal yang dibayar dengan uang bila customer memakai poin. Opsi: selisih dikembalikan lebih dulu sebagai… | §7.4, §14.5 | Diputuskan | R-MER-ORDER, R-CUS-REFUND, R-CUS-POINTS |

## 4. Enam ID sumber yang tadinya tidak terpetakan

Pemeriksaan 2026-11-05 menemukan enam ID sumber tidak muncul di tabel delta. Perbaikannya:

| ID | Isi PRD | Perbaikan |
|---|---|---|
| CUS-01 | Registrasi/login nomor WhatsApp lewat reverse OTP (§5.1) | Ditambahkan ke sitiran `R-ACC` |
| CUS-02 | Menambah alamat lewat profil dan lewat cart | Fitur baru `R-CUS-ADDRESS` |
| CUS-03 | Memilih alamat default dari profil, mengganti alamat kirim & default dari cart | Fitur baru `R-CUS-ADDRESS` |
| CUS-30 | Wajib User Agreement + ikut dispute (§17) | Ditambahkan ke `R-ACC-AGREEMENT` dan `R-DISPUTE` |
| MER-22 | Wajib User Agreement + semua rule ops, lihat isi di aplikasi merchant | Ditambahkan ke `R-ACC-AGREEMENT` dan `R-DISPUTE` |
| MER-31 | Dihapus: merchant open session diganti riwayat aktivitas (MER-39, §11.4) | Dicatat di `R-HISTORY` sebagai requirement yang dihapus |

## 5. Yang belum 1:1 (jujur)

| Hal | Keadaan | Bukti |
|---|---|---|
| Implementasi UI | 0 dari 35 fitur `complete`; 30 `partial`, 5 `blocked` | baris `Status:` di `features/*.md` |
| Angka awal config | PRD sengaja tidak mencantumkan nilai awal `applicationConfiguration` (§12.2) | `R-CONFIG` §8 |
| Enum status | Mengikuti §7.5, bukan ERD (ERD belum ada) | `R-CUS-ORDER`, `R-BATCH` |
| Peta aplikasi | Diperbarui ke kondisi kode: 114 rute (customer 47, merchant 26, courier 14, ops 14, SA 11, web 2), 22 slice, persist 17 | `docs/design/app-map/app-map.architecture.json`, `docs/design/app-map/README.md` |
| Flow | 7 flow masih model lama, rebase per milestone | `docs/design/flows/INDEX.json` |

## 6. Cara memeriksa ulang

Cakupan ID dan disposisi OPEN bisa dihitung ulang dari sumber:

```bash
pdftotext -layout docs/product/prd/versions/sa7tein-beta-2026-11-05/source.pdf /tmp/prd.txt
# hitung ID sumber yang muncul di tabel delta
node -e 'const t=require("fs").readFileSync("docs/product/prd/versions/sa7tein-beta-2026-11-05/analysis.md","utf8");for(const p of ["ACC-","CUS-","MER-","OPS-","BR-B","ARC-","NFR-"]){const s=new Set();let m;const r=new RegExp(p+"0*(\\d+)(?:\\s*(?:\\.\\.|–)\\s*(?:[A-Z-]*?)0*(\\d+))?","g");while((m=r.exec(t))){const a=+m[1],b=m[2]?+m[2]:a;for(let i=a;i<=b;i++)s.add(p+i)}console.log(p,s.size)}'
```

Hasil yang diharapkan: 8, 41, 41, 24, 22, 18, 7. Jumlah `OPEN` dengan status: 6 `Terbuka` + 80 `Diputuskan` = 86.
