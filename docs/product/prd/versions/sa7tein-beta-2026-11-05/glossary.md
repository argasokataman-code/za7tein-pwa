# Glosarium & konteks: sa7tein-beta-2026-11-05

Bagian non-fungsional PRD yang tidak masuk tabel Requirement delta, disalin agar istilah dan batas produk tidak ditafsirkan ulang. Semua isi bersumber dari `source.pdf` halaman yang disebut.

## 1. Konvensi dokumen (§1 p.3)

| Item | Nilai |
|---|---|
| Produk | sa7tein, online food marketplace & delivery system |
| Versi | 0.1 (draft) |
| Pemilik produk | Yusuf |
| Fase | MVP berbasis PWA |
| Dokumen pendamping | ERD, sumber kebenaran nama tabel; enum status order & batch mengikuti §7.5 |

Label yang dipakai di seluruh dokumen:

| Label | Arti |
|---|---|
| Keputusan | Sudah ditetapkan pemilik produk. Pernyataan tanpa label di §4–§20 adalah Keputusan |
| Turunan | Konsekuensi logis sebuah keputusan |
| Usulan | Rekomendasi penyusun dokumen, belum disetujui |
| OPEN-xx | Belum diputuskan, rincian di §22 |

Prefiks ID: ACC (akun), CUS (customer), MER (merchant), OPS (ops), BR-B (aturan batch), ARC (arsitektur), NFR (non-fungsional), L (batasan), R (risiko).

## 2. Latar belakang & masalah (§2 p.4)

Mahasiswa dan expat Indonesia di Yordania berjualan dan memesan makanan manual lewat WhatsApp, menimbulkan lima masalah:

| ID | Masalah | Dampak |
|---|---|---|
| P1 | Order dan delivery tanpa sistem | Waktu tunggu tidak terukur |
| P2 | Uang di rekening bank Indonesia (IDR), makanan dibayar tunai JOD | Kesulitan membayar harian |
| P3 | Tidak ada standar kompensasi & punishment | Tidak ada acuan saat sengketa |
| P4 | Tidak ada live status order | Customer tidak tahu order dimasak atau diantar |
| P5 | Tidak ada live tracking kurir | Customer tidak bisa memperkirakan kedatangan |

## 3. Tujuan, solusi & metrik (§3 p.4–5)

| Masalah | Solusi | Bagian |
|---|---|---|
| P1 | Order masuk antrian dan dikelompokkan ke batch, status tiap tahap realtime | §7, §8 |
| P2 | Pembayaran online IDR lewat QRIS, harga tetap JOD dengan kurs harian | §15 |
| P3 | Rule kompensasi & punishment standar dikelola ops, wajib diikuti (User Agreement) | §17 |
| P4 | Setiap perubahan status dipublikasikan realtime | §18 |
| P5 | Lokasi kurir dibagikan realtime selama delivery | §9 |

Prinsip produk: sistem sepenuhnya asynchronous, reactive, realtime, event-driven. Setiap perubahan state bisnis yang observable dipublikasikan sebagai event ke semua client yang berhak tanpa diminta.

Metrik keberhasilan masih **Usulan** (`OPEN-28`): waktu accept sampai delivery mulai (median dan p90), waktu order dibuat sampai selesai (median dan p90), porsi order online vs COD, porsi order berujung dispute + lama penyelesaian, porsi payout otomatis berhasil tanpa ops, jumlah customer aktif mingguan di area peluncuran. **Jangan mengarang angka target di UI.**

## 4. Lingkup MVP (§4 p.5–6)

Peluncuran di Syimali, Hijazi, dan Yarmouk University (Irbid, Yordania), PWA untuk customer dan merchant.

| Platform | Isi |
|---|---|
| MVP | client React PWA dua role utama (customer, merchant), arsitektur zero-route SPA dengan kode berarsitektur SSR |
| Ops | PWA + Worker terpisah di balik Cloudflare Access/Zero Trust |
| Pasca-MVP | dua role utama pindah ke React Native, kontrak Worker tetap sama |

Dalam lingkup: discovery merchant, katalog (kategori, schedule, stok opsional, combo, attribute/opsi/varian), beberapa cart dan beberapa order aktif, satu tipe pengiriman (karyawan kurir merchant lewat batch), batch tanpa batas waktu + auto-sort, QRIS + COD berkuota, payout ke rekening merchant dan refund ke rekening customer, invoice preview + PDF, dashboard line/pie/pivot, program promo/code/exclusive/next order (maks 6 promo per order) + membership, sa7tein poin, rating & review, group chat, live status/tracking, notifikasi, dispute auto + manual, monetisasi platform fee + kuota, aplikasi ops.

Di luar lingkup: self-pickup, kurir partner dan order Quick, native app, login selain reverse OTP WhatsApp, tracking saat app kurir di background, cara merchant memperoleh JOD tunai, penanganan karyawan kurir tidak merespons, koreksi ETA dan pemantauan selisih ETA.

## 5. Glosarium (§6 p.9–15)

| Istilah | Arti |
|---|---|
| Aplikator | sa7tein sebagai operator platform |
| Ops | Internal user aplikator yang mengelola verifikasi, moderasi, konfigurasi, dan dispute |
| Batch | Wadah beberapa order dari satu merchant yang di-prepare dan diantar bersamaan oleh satu karyawan kurir |
| Cart | Order customer yang masih berupa draft, satu per merchant; tampil di daftar order bersama order aktif dan riwayat order. Promo dan sa7tein poin yang dipilih otomatis terlepas saat customer keluar dari layar detail cart (7.1) |
| Coverage | Wilayah layanan merchant: satu atau lebih polygon, atau radius maksimum |
| Delivery fee merchant | Ongkos kirim yang dikonfigurasi merchant, per polygon atau per satuan jarak; pada mode radius dihitung proporsional dari jarak rute jalan kaki |
| Platform fee customer | Biaya platform flat yang dibayar customer per order; masuk ke aplikator, kecuali pada order yang mengonsumsi kuota order merchant, yang sepenuhnya hak merchant; tidak dibebankan pada order yang mengonsumsi kuota order customer |
| Platform fee merchant | Potongan flat per order dari payout merchant untuk order online tanpa kuota |
| Saldo aplikator | Saldo milik aplikator di payment gateway yang menampung dana order online sampai payout atau refund |
| Payout | Transfer otomatis dari saldo aplikator ke rekening bank merchant setelah order selesai dan dana order itu dicairkan payment gateway (Turunan) |
| Pending refund | Flag pendingRefund pada order online berstatus canceled atau rejected yang sudah dibayar, sampai refund selesai, termasuk saat transfer refund gagal; dana refund terikat ke order sampai customer mengisi rekening bank. Flag ini juga dipakai untuk order yang punya refund selisih karena order item diubah merchant (7.4) |
| Invoice order | Dokumen rincian order yang terbentuk saat order dibuat; bisa di-preview di aplikasi pada semua status dan di-download sebagai PDF A4 dengan template tersendiri saat order selesai atau batal (15.8) |
| Kurs harian | Kurs acuan JOD→IDR yang diperbarui sekali sehari dari provider kurs; disimpan di applicationConfiguration |
| DOInstanceRegistry | Root key di Workers KV yang berisi registry semua instance DO, berupa pasangan {ENTITY_TYPE:ENTITY_ID} → {DURABLE_OBJECT_ID}; cara query lintas instance masih terbuka (OPEN-25) |
| applicationConfiguration | Root key di Workers KV yang berisi konfigurasi aplikasi single row, misalnya platform fee dan kurs harian (daftar di 12.2) |
| Kuota order | Platform fee yang dibayar di muka: 1 kuota order customer menggantikan 1 platform fee customer, sedangkan 1 kuota order merchant berisi 1 platform fee customer dan 1 platform fee merchant yang dibayar merchant di muka. Dibeli lewat paket langganan atau alacarte. Kuota customer dipakai lebih dulu untuk setiap order, apa pun metode bayarnya. Pada order yang mengonsumsi kuota merchant, platform fee customer menjadi hak merchant: dibayar customer tanpa kuota, atau di-payout aplikator ke merchant bila customer memakai kuota. Kuota merchant dipakai untuk order COD, atau semua order bila setting "Terima order tanpa kuota order?" bernilai tidak |
| Terima order tanpa kuota order? | Setting boolean merchant; bila ya, order online tidak mengonsumsi kuota order merchant dan dikenai platform fee merchant per order; bila tidak, semua order mengonsumsi kuota order merchant; hanya bisa diubah saat merchant tutup |
| Jam operasional | Jadwal merchant untuk auto buka dan auto tutup, berupa data recurring per hari atau data per tanggal (11.1) |
| Dismiss open | Penonaktifan auto buka dan auto tutup merchant pada tanggal yang akan datang dan punya jadwal buka; bisa untuk beberapa tanggal dan bisa dibatalkan paling lambat H-1 (11.1) |
| Busy (merchant) | Config merchant yang terpisah dari status buka/tutup; saat on, merchant tidak bisa menerima order baru. Hanya bisa diaktifkan manual oleh merchant (11.2) |
| Transaction fee | Biaya sebesar final transaction fee × total (subtotal + platform fee + delivery fee − diskon) untuk pembayaran QRIS; final transaction fee (%) = persen kenaikan kurs JOD→IDR hari itu dari hari kemarin + transaction fee (%) yang diatur ops (15.2); ditampilkan dalam JOD dan menjadi milik aplikator |
| Paket langganan | Produk langganan yang di-setup ops untuk merchant atau customer, berisi nama, deskripsi, harga (JOD), satuan masa aktif, kuota order (jatah per hari, minggu, atau bulan), dan fitur bonus; harga berupa persentase (maks 100%) dari jumlah kuota × harga maksimal per kuota; pada paket merchant, persentase hanya berlaku untuk bagian platform fee merchant (16) |
| Membership merchant | Keanggotaan customer di satu merchant yang diajukan customer lalu disetujui merchant, atau didaftarkan langsung oleh merchant; membuka promo khusus member, notifikasi promo merchant, penanda membership pada order, dan badge membership di explore merchant |
| Kuota order alacarte | Kuota order yang dibeli satuan di luar paket langganan; harga = jumlah kuota × harga maksimal per kuota (16), dikurangi diskon pembelian yang diatur ops, yang pada kuota merchant hanya berlaku untuk bagian platform fee merchant; tidak pernah hangus |
| Skema diskon kuota order | Satu tingkatan diskon pembelian kuota order alacarte yang di-setup ops untuk customer atau merchant, berisi minimum jumlah kuota dan persentase diskon; 1 skema disimpan sebagai 1 instance DO. Saat pembelian, skema dipilih otomatis berdasarkan jumlah kuota yang dibeli (16.2) |
| Sa7tein poin | Poin loyalty customer milik aplikator yang berlaku di semua merchant; aktif lewat toggle sa7tein poin di applicationConfiguration dengan minimal 1 rule dari ops; dipakai untuk mengurangi total order atau harga pembelian kuota order dan paket langganan, dan tidak pernah hangus |
| Rule (poin) | Cara mendapatkan poin: syarat order dan besaran poin yang diberikan; sa7tein poin boleh punya lebih dari 1 rule |
| User Agreement | Kumpulan semua rule kompensasi & punishment yang didefinisikan ops; wajib disetujui merchant dan customer saat mendaftar dan wajib diikuti, termasuk setiap perubahannya yang berlaku otomatis tanpa persetujuan ulang (17) |
| Inbox | Daftar pesan di aplikasi customer dan merchant yang untuk saat ini khusus berisi detail perubahan User Agreement (19.3) |
| Dispute | Mekanisme pemberian punishment kepada pelaku dan kompensasi kepada korban, keduanya non-uang, lewat auto dispute oleh sistem atau manual dispute oleh ops (17) |
| Menu | Product merchant yang bisa langsung dipilih customer ke dalam cart; punya status aktif, hide, stok opsional, tepat satu kategori, dan bisa diikat ke availability schedule (13.1) |
| Kategori | Pengelompokan menu yang dibuat merchant; satu menu wajib berada di tepat satu kategori (13.2) |
| Availability schedule | Waktu tertentu saat menu tersedia, berupa schedule mingguan atau bulanan dengan satu atau lebih pasangan jam per hari atau tanggal; bisa mengikat beberapa menu, tetapi satu menu hanya boleh punya satu schedule, dan menu tanpa schedule tersedia 24 jam (13.3) |
| Attribute | Group customisasi menu dengan single atau multiple selection, bisa mandatory, dan bisa diikat ke beberapa menu (13.4) |
| Opsi customisasi | Pilihan di dalam attribute yang berupa varian menu, dengan harga berupa persentase dari harga varian itu; tidak bisa dicustom lagi saat dipilih sebagai opsi (13.4) |
| Varian | Instansiasi menu untuk satu kombinasi opsi customisasi, termasuk attribute multiple selection; dipakai order item, opsi customisasi, combo item, dan free product merchant. Varian yang tidak berlaku lagi diarsipkan atau dihapus (13.5) |
| Stok menu | Jumlah menu yang bisa dipesan, opsional lewat toggle stok; di-reserve di cart dan saat order dibuat, lalu berkurang saat order selesai (13.6) |
| Combo | Menu dengan flag combo yang berisi beberapa varian tetap beserta qty-nya (combo item), termasuk varian combo lain; dipakai untuk promo buy x get y, bisa punya attribute, dan harga akhirnya memakai price menu (13.7) |
| Reverse OTP | Cara verifikasi registrasi dan login: pengguna mengirim kode unik dari WhatsApp-nya ke nomor WhatsApp sa7tein, dan nomor pengirim wajib sama dengan nomor yang diisi di aplikasi (5.1) |
| Karyawan merchant | Akun yang nomor WhatsApp-nya didaftarkan owner merchant sebagai karyawan; punya role merchant untuk merchant itu dengan nama peran dan hak akses yang ditentukan owner, dan tetap bisa menjadi karyawan atau owner di merchant lain (11.3) |
| Owner merchant | Akun yang mendaftarkan merchant atau menerima pemindahan status owner; selalu punya semua hak akses, dan satu-satunya yang bisa mengelola karyawan serta menyetujui User Agreement saat mendaftarkan merchant itu (11.3) |
| Karyawan kurir | Karyawan merchant dengan hak akses antar order yang mengantar batch; owner juga bisa mengantar karena punya semua hak akses. Di PRD, sebutan kurir berarti karyawan kurir. Sebutan ini hanya istilah PRD; nama peran yang tampil di aplikasi ditentukan owner (11.3) |
| Riwayat aktivitas | Catatan otomatis setiap create, update, dan delete pada semua data di instance DO dan applicationConfiguration, terdiri dari entri riwayat, jejak perubahan, dan pengikut riwayat (12.1) |
| Entri riwayat | Satu catatan aktivitas create, update, atau delete pada satu data, berisi actor, DO id, recipients, dan trackings (12.1) |
| Jejak perubahan | Nilai lama dan nilai baru satu field dalam satu entri riwayat; saat create, setiap field yang terisi menjadi satu jejak perubahan (12.1) |
| Pengikut riwayat | Akun ops yang ditentukan untuk menerima notifikasi entri riwayat dari model dan data tertentu (12.1) |
| Arsip sistem | Status data yang dihapus: tidak tampil lagi bagi pengguna, tetapi tetap tersimpan di database beserta riwayatnya; tidak berlaku untuk pesan chat (12.1) |

## 6. Referensi (§23 p.135)

Fakta teknis diambil dari halaman yang dibuka 11 Oktober 2026: Google Routes API (intermediate waypoints, optimasi urutan stop, route matrix), Cloudflare (Durable Objects limits), Google Maps Platform (deprecation Drawing Library, Service Specific Terms untuk caching Routes API), Google Route Optimization API (ShipmentModel).
