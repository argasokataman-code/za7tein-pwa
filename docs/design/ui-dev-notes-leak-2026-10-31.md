# Catatan developer yang bocor ke UI. Sa7tein PWA

Tanggal: 2026-10-31
Scope: teks yang dirender ke layar tapi isinya pengingat internal (status backend, kode tiket, nama tabel/berkas, instruksi ke developer). Sumber: `docs/design/ui-notes-inventory-2026-10-31.md` bucket 1 (216 entri), diperiksa satu per satu.
Status: partial. Daftar temuan; belum ada yang diubah.
Bukti: tiap baris menyebut `path:line`. Verifikasi cepat: `sed -n '277p' src/pages/MyOrder.tsx`.

Aturan pemisahan yang dipakai:

- **Bocor** = kalimat hanya berguna bagi orang yang memegang kode atau PRD (menyebut `backend`, `mock`, `state`, nama tabel, `RPC`, `PRD`, `OQ-`, `OPEN-`, nama berkas, atau instruksi "ubah bila..."). Pengguna tidak bisa bertindak atas informasi itu.
- **Bukan bocor** = pengguna bisa bertindak atasnya (syarat, biaya, batas waktu, aturan main). Itu aturan produk, tetap di UI.

Total: 29 + 22 = 51 temuan.

---

## 1. Status teknis internal (backend, mock, demo)

| path:line | teks sekarang | pindah jadi komentar di |
|---|---|---|
| `src/pages/MyOrder.tsx:277` | "Backend belum tersambung. Riwayat pesanan tidak bisa dimuat." | blok fetch `MyOrder.tsx` |
| `src/pages/Reviews.tsx:177` | "Backend belum tersambung. Ulasan tidak bisa dikirim." | blok submit `Reviews.tsx` |
| `src/pages/MerchantPromos.tsx:270` | "Backend belum tersambung. Promo tidak bisa dimuat." | blok fetch `MerchantPromos.tsx` |
| `src/pages/MerchantPromos.tsx:412` | "Membuat atau mengubah program marketing belum tersedia. Backend belum punya tabel program (loyalty_programs), jadi daftar dan sakelar di atas hidup di state aplikasi dan belum tersimpan ke server." | `MerchantPromos.tsx:412` |
| `src/pages/MerchantSubscription.tsx:130` | "Pembelian kuota belum tersedia. Backend belum punya tabel langganan, jadi saldo kuota di bawah berasal dari data aplikasi dan setting di halaman ini belum tersimpan ke server." | `MerchantSubscription.tsx:130` |
| `src/pages/MerchantSettings.tsx:237` | "Perubahan nama, nomor, alamat, dan foto hanya berlaku sementara. Profil belum tersimpan permanen." | `MerchantSettings.tsx:237` |
| `src/pages/MerchantSettings.tsx:589` | "Jadwal per hari hanya di sesi ini. Server menyimpan jam hari ini untuk pelanggan." | `MerchantSettings.tsx:589` |
| `src/pages/MerchantPromoCarousel.tsx:176` | "Slide disimpan di perangkat ini sampai backend punya tabel slide promo." | `MerchantPromoCarousel.tsx:176` |
| `src/pages/MerchantCoverage.tsx:140` | "Area layanan disimpan ke `coverage_zones` di server saat tombol Simpan ditekan. Bentuk juga ikut tersimpan di perangkat." | `MerchantCoverage.tsx:140` |
| `src/pages/WalletTopUp.tsx:141` | "Mock: tidak ada DANA sungguhan. Tombol simulasi mewakili webhook top_up_completed yang menaikkan saldo." | `WalletTopUp.tsx:141` |
| `src/pages/PaymentDana.tsx:220` | "Mode sandbox: kode, QR, dan tombol di layar ini simulasi..." | `PaymentDana.tsx:220` |
| `src/pages/PaymentDana.tsx:241` | "Kode contoh ini tidak terhubung ke DANA." | `PaymentDana.tsx:241` |
| `src/pages/PaymentDana.tsx:262` | "Contoh pola, bukan kode yang bisa dipindai. QR asli dibuat DANA (paymentCode)." | `PaymentDana.tsx:262` |
| `src/pages/PaymentDana.tsx:282` | "Simulasi ini menggantikan webhook finish-notify DANA." | `PaymentDana.tsx:282` |
| `src/pages/CourierOnboarding.tsx:110` | "Mode demo: ketentuan lengkap belum tersedia." | `CourierOnboarding.tsx:110` |
| `src/data/authCopy.ts:24` | "Halaman ini hanya alur layar: repo ini front-end, jadi belum ada backend yang benar-benar menyetujui toko." | `authCopy.ts:24` |
| `src/pages/SignUp.tsx:163` | "Isinya belum tersedia karena semua alur di repo ini masih mode demo." | `SignUp.tsx:163` |
| `src/components/layout/OpsShell.tsx:107` | "Data demo, bukan transaksi sungguhan" | `OpsShell.tsx:107` |
| `src/components/layout/SuperAdminShell.tsx:172` | "Data demo, bukan transaksi sungguhan" | `SuperAdminShell.tsx:172` |
| `src/pages/ops/OpsDashboard.tsx:41` | "Panel ini mock: aksi ops = state yang ditampilkan, tidak menyentuh uang atau order sungguhan." | `OpsDashboard.tsx:41` |
| `src/pages/ops/OpsMerchants.tsx:167` | "Suspend dan blacklist di sini hanya mengubah tampilan, bukan data sungguhan." | `OpsMerchants.tsx:167` |
| `src/pages/ops/OpsQuotas.tsx:71` | "Menambah/mengubah paket di panel ini belum menulis ke BE (mock)." | `OpsQuotas.tsx:71` |
| `src/pages/ops/OpsPrograms.tsx:76` | "Bila BE kosong, daftar menampilkan seed mock." | `OpsPrograms.tsx:76` |
| `src/pages/ops/OpsLedger.tsx:192` | "Arah debit-credit hold belum diputuskan di demo ini, jadi hanya nominal dan waktunya yang ditampilkan." | `OpsLedger.tsx:192` |
| `src/pages/Reviews.tsx:325` | "Pratinjau lokal, foto belum disimpan server." | `Reviews.tsx:325` |
| `src/pages/Reviews.tsx:372` | "Rating per menu (bintang saja, tanpa review) belum bisa diisi di sini." | `Reviews.tsx:372` |
| `src/pages/CustomerRefund.tsx:178` | "Layanan refund belum aktif." | `CustomerRefund.tsx:178` |
| `src/pages/PersonalData.tsx:76` | "Tanggal lahir dan jenis kelamin belum punya kolom di backend, jadi belum ikut tersimpan." | `PersonalData.tsx:76` |
| `src/pages/WalletPayout.tsx:88` | "Fee penarikan belum final (OQ-22), belum ada potongan yang ditampilkan." | `WalletPayout.tsx:88` |

## 2. Kode tiket, rujukan berkas, nama tabel, instruksi ke developer

| path:line | yang tampil | kenapa bocor |
|---|---|---|
| `src/pages/ops/OpsPenalties.tsx:51` | "Bentuk & tingkatnya bebas seperti katalog rule; ubah bila bentuknya berbeda." | instruksi ke developer, bukan info operator |
| `src/pages/DisputeSubmit.tsx:306` | "Kategori dan window masih sementara (OQ-29): form ini state tampilan, bukan aturan yang dikunci." | id tiket + pengakuan state |
| `src/pages/ops/OpsDisputes.tsx:176` | "Persentase refund dan window 24 jam belum final (OQ-29)." | id tiket |
| `src/pages/MerchantPromos.tsx:406` | "Aturan gabungan masih terbuka (OPEN-23)..." | id tiket |
| `src/pages/MerchantPromos.tsx:426` | "Scope marketing/promo di PRD masih terbuka (MARK-1)..." | id tiket + PRD |
| `src/pages/WalletTopUp.tsx:74` | "(R-TOPUP-01)" | id requirement |
| `src/pages/Checkout.tsx:554` | "belum final (menunggu konsultan pajak, OQ-17/18)" | id tiket |
| `src/pages/SaDashboard.tsx:179` | "angka ini placeholder" | pengakuan ke pengguna |
| `src/pages/SaTax.tsx:119` | "Tarif di tabel ini placeholder... Jangan dipakai sebagai angka setor." | instruksi tulis |
| `src/pages/SaProfit.tsx:135` | "jadwal settlement final masih UNRESOLVED" | status dokumen |
| `src/pages/NotificationSettings.tsx:168` | "Pengiriman dari server lewat skrip scripts/send-push.mjs." | path berkas kode |
| `src/pages/SaUsers.tsx:302` | "(PRD source.md:296)" | path berkas + baris |
| `src/pages/MerchantRebate.tsx:143` | "Sumber: tabel deposits BE." | nama tabel |
| `src/pages/ops/OpsSettings.tsx:77` | "menulis ke BE (`platform_params`); kolom yang belum ada di RPC ditulis langsung." | nama tabel + RPC |
| `src/pages/CourierPartner.tsx:162` | "disimpan ke BE (couriers + dispatch_assignments). Dispatch otomatis (OPEN-11)" | tabel + tiket |
| `src/pages/CourierPartner.tsx:196` | "dipicu BE (expire_assignments())" | nama fungsi BE |
| `src/components/merchant/MerchantEarnings.tsx:27` | "BE belum menyimpan potongan per order." | status BE |
| `src/pages/ops/OpsDisputes.tsx:273` | "Form Ajukan Sengketa ada di sisi customer... kiriman masuk ke antrean ini." | peta navigasi internal |
| `src/pages/SaRoles.tsx:161` | "Di produksi ini datang dari sesi CS; repo ini tanpa auth, jadi ditetapkan dari sini." | pengakuan tanpa auth |
| `src/pages/SaLedger.tsx:125` | "sebelumnya ledger tidak menyimpan pihaknya sama sekali, jadi monitoring detail merchant & customer tidak bisa dijawab dari layar ini." | riwayat desain |
| `src/pages/MerchantSignUp.tsx:112` | "pilihannya radio bukan teks bebas: PRD aktif hanya punya dua zona..." | alasan teknis |
| `src/pages/MerchantOnboarding.tsx:171` | "Tarif per jarak / per area belum final di PRD." | status PRD |

## 3. Sudah benar, tetap di UI

Syarat, biaya, batas waktu, aturan main. Pengguna bisa bertindak atasnya, jadi jangan dipindah:

- `src/components/DeliveryCheckpoints.tsx:135` (jangan berikan OTP sebelum pesanan diperiksa)
- `src/pages/AddressSelection.tsx:276` (pin wajib, GPS saja tidak cukup)
- `src/pages/MerchantSubscription.tsx:223` (QRIS 1,5%, saldo DANA tidak)
- `src/pages/DisputeSubmit.tsx:302` (1x per order)
- `src/pages/Checkout.tsx:295` (Quick belum tersedia di area ini)
- `src/pages/CourierPayout.tsx:78` (minimal penarikan)

---

## Sisa kerja

1. Pindahkan 51 temuan ke komentar di berkas yang sama. Teks UI diganti kalimat yang berguna bagi pengguna ("Backend belum tersambung" jadi "Muat ulang halaman", atau hapus barisnya).
2. `src/pages/ops/OpsPenalties.tsx:51` prioritas pertama: itu instruksi ke developer yang tampil sebagai bantuan operator.
3. Setelah diubah: `npm run lint && npm run build && npm run scan`, lalu `node scripts/browser-gate.mjs --route <path> --strict` untuk tiap layar yang disentuh, dan perbarui `src/pages/Documentation.tsx` (dienforce pre-commit cek #6).
