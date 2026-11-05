# R-MER-PROMO — Program marketing 4 tipe, waktu aktif & budget

Status: partial (marketingSlice + layar promo ada; 4 tipe, waktu aktif, budget, target belum) · sumber §14.1–§14.3 MER-09, OPS-05, OPS-24, ARC-18.

## 1. Untuk apa

Program marketing adalah cara merchant dan aplikator memberi diskon, dan cara aplikator membelanjakan dana marketing. Karena diskon mengurangi uang yang berpindah, setiap program harus punya pemilik, batas pemakaian, dan budget yang bisa direkonsiliasi, sedangkan reward yang bisa digabung dibatasi agar total diskon tidak melebihi yang direncanakan.

## 2. Aturan

### Tipe program (§14.1)

| # | Aturan | Sumber |
|---|---|---|
| A1 | Empat tipe: promo (tampil di list promo cart), code (dimasukkan customer, tidak tampil di list), exclusive (penerima dipilih), next order (tanpa reward di order itu) | §14.1, MER-09 |
| A2 | Buy X Get Y bukan tipe program; dibuat merchant sebagai menu combo di katalog | §14.1, §13.7 |
| A3 | Gift card dan eWallet tidak dipakai | §14 |

### Pemilik & data (§14.2)

| # | Aturan | Sumber |
|---|---|---|
| A4 | Setiap program punya pemilik: aplikator (dikelola ops, berlaku di semua merchant) atau merchant (berlaku di merchant itu) | §14.2 |
| A5 | Biaya diskon dan free product ditanggung pemilik program | §14.2, §15.3 |
| A6 | Tipe program dipilih saat dibuat dan tidak bisa diubah setelahnya | §14.2 |
| A7 | Nominal diskon, batas maksimal diskon, dan minimum belanja diinput JOD | §14.2 |
| A8 | Penanda khusus member hanya ada pada program merchant, dan tidak dipakai pada program exclusive maupun promo exclusive hasil next order | §14.2, §14.4 |

### Masa berlaku & waktu aktif

| # | Aturan | Sumber |
|---|---|---|
| A9 | Tanggal mulai wajib, paling cepat H+2 dari tanggal program dibuat; juga berlaku saat tanggal mulai diubah | §14.2 |
| A10 | Tanggal selesai opsional; tanpa tanggal selesai program berlaku sampai dihentikan | §14.2 |
| A11 | Program belum mulai tidak tampil ke customer; notifikasi program baru dikirim saat mulai berlaku, bukan saat dibuat | §14.2, §14.3 |
| A12 | Masa berlaku >31 hari: waktu aktif boleh mode tanggal/hari dengan atau tanpa jam, atau hanya jam | §14.2 |
| A13 | Masa berlaku 8–31 hari: mode hari dengan atau tanpa jam, atau hanya jam | §14.2 |
| A14 | Masa berlaku <8 hari: hanya jam | §14.2 |
| A15 | Waktu aktif hanya berlaku di antara tanggal mulai dan selesai; di luar waktu aktif program tidak tampil, kodenya ditolak, dan program terlepas dari cart | §14.2 |
| A16 | Saat waktu aktif mulai, program tampil lagi realtime | §14.2, §18 |
| A17 | Promo dicek saat order dibuat, sehingga order di dalam waktu aktif tetap mendapat promo walau prosesnya selesai di luar waktu aktif | §14.2 |

### Batas pemakaian

| # | Aturan | Sumber |
|---|---|---|
| A18 | Batas pemakaian total opsional, minimal 1; satu pemakaian = satu order yang memakai program | §14.2 |
| A19 | Batas pemakaian per customer opsional dan berlaku untuk promo, code, dan next order | §14.2 |
| A20 | Pemakaian di-reserve saat order dibuat dan dikembalikan bila batal, ditolak, atau pembayaran gagal/kedaluwarsa | §14.2 |
| A21 | Batas total tercapai → program tidak tampil, kode ditolak, dan terlepas dari cart customer lain; batas per customer berlaku hanya untuk customer itu | §14.2 |
| A22 | Pemilik bisa melihat jumlah pemakaian programnya | §14.2 |

### Target customer

| # | Aturan | Sumber |
|---|---|---|
| A23 | Target: semua, baru, regular, occasional; satu program satu target | §14.2 |
| A24 | Baru = belum pernah order done (di semua merchant untuk program aplikator; di merchant itu untuk program merchant) | §14.2 |
| A25 | Regular = punya order done dalam range yang dipilih; range opsional | §14.2 |
| A26 | Occasional = tidak punya order done dalam range tetapi pernah sebelum range; range wajib | §14.2 |
| A27 | Range berupa jumlah hari terakhir dihitung mundur dari hari ini, hari ini ikut dihitung | §14.2 |
| A28 | Customer di luar target tidak melihat program; saat keluar dari target, program terlepas dari cart | §14.2 |
| A29 | Target tidak dipakai pada program exclusive dan code | §14.2 |

### Budget

| # | Aturan | Sumber |
|---|---|---|
| A30 | Budget maksimal tampil bila batas pemakaian total aktif = batas total × nilai reward maksimal per pemakaian | §14.2 |
| A31 | Bila informasi itu tidak tampil, pemilik melihat input budget maksimal; wajib untuk program aplikator, opsional untuk merchant | §14.2 |
| A32 | Budget terpakai = total nilai reward pemakaian tercatat; pemakaian yang dikembalikan mengurangi budget terpakai | §14.2 |
| A33 | Sisa budget kurang dari nilai diskon: promo tetap bisa dipakai dengan warning, diskon sebesar sisa budget | §14.2 |
| A34 | Bila sisa budget berubah tepat saat order dibuat sehingga diskon berubah, order tidak dibuat dan cart menampilkan diskon terbaru + warning | §14.2 |
| A35 | Free product tidak bisa diberikan sebagian; bila sisa budget tidak cukup, program diperlakukan seperti budget habis | §14.2 |
| A36 | Budget di-reserve saat order dibuat, dikembalikan bila batal/ditolak/gagal; program baru selesai setelah order terakhir done | §14.2 |
| A37 | Pembayaran program aplikator: setor budget maksimal + final transaction fee sebelum tanggal mulai, konversi IDR dengan pembulatan tagihan customer, dana masuk saldo disbursement promo | §14.2, §15.2, §15.4, OPS-05 |
| A38 | Pembayaran kedaluwarsa → ops bisa membuat pembayaran baru selama tanggal mulai belum tiba; bila belum dibayar sampai tanggal mulai, program tidak aktif dan tanggal mulai wajib diganti | §14.2 |
| A39 | Refund sisa saldo program aplikator setelah selesai: hanya akun ops yang membayar, rekening diisi manual, biaya payout dipotong dari sisa saldo, tombol tidak tampil bila sisa ≤ biaya | §14.2, OPS-24 |

### Kode, exclusive, next order

| # | Aturan | Sumber |
|---|---|---|
| A40 | Kode tidak membedakan huruf besar/kecil; keunikan dicek terhadap program yang belum berakhir (merchant: kode merchant itu + kode aplikator; aplikator: semua) | §14.2 |
| A41 | Kode tidak dikenal/berakhir/batas tercapai/syarat belum terpenuhi → cart menampilkan alasannya | §14.2 |
| A42 | Exclusive punya daftar penerima; merchant memilih dari customer dengan minimal 1 order selesai di merchant itu, ops bisa memilih siapa pun | §14.2 |
| A43 | Penerima bisa ditambah/dihapus sebelum masa berlaku; penerima dinotifikasi saat program mulai | §14.2 |
| A44 | Setiap penerima memakai promo exclusive 1 kali; disimpan sisa pemakaian + waktu kedaluwarsa, dipakai tanpa kode | §14.2 |
| A45 | Next order tidak memberi reward di order itu; saat order selesai dibuat satu program exclusive khusus customer, budget pindah dari program next order | §14.2 |
| A46 | Sisa budget program exclusive kembali ke program next order asalnya | §14.2 |
| A47 | Masa berlaku promo hasil next order dihitung sejak program exclusive dibuat dan tidak terikat tanggal program next order | §14.2 |

### Reward & rule

| # | Aturan | Sumber |
|---|---|---|
| A48 | Satu reward per program: diskon subtotal, diskon ongkir, atau free product | §14.2 |
| A49 | Diskon subtotal/ongkir memakai persen (1–100%) atau nominal; pada persen wajib batas maksimal diskon | §14.2 |
| A50 | Diskon subtotal maksimal sebesar total harga menu; diskon ongkir maksimal sebesar delivery fee; bila F = 0, promo ongkir tidak bisa dipilih | §14.2 |
| A51 | Hasil diskon persen dibulatkan bawah 2 desimal JOD | §14.2 |
| A52 | Free product merchant = varian menu + qty yang dipilih merchant; free product aplikator = paket langganan atau kuota order + jumlah | §14.2 |
| A53 | Rule berisi minimum quantity dan/atau minimum belanja; tanpa filter menu/kategori/tag | §14.2 |
| A54 | Minimum quantity dihitung per varian (opsi tidak dihitung, combo satu item); minimum belanja dihitung sebelum diskon promo apa pun, tanpa F dan platform fee | §14.2 |
| A55 | Menu hadiah tidak dihitung untuk syarat rule maupun diskon subtotal | §14.2 |
| A56 | Satu program bisa punya beberapa rule; semua syarat dalam satu rule harus terpenuhi, cukup satu rule terpenuhi; reward tetap sama | §14.2 |
| A57 | Program hanya bisa diubah sebelum masa berlaku mulai; program aplikator yang sudah dibayar tidak bisa diubah | §14.2, OPS-05 |
| A58 | Pemilik bisa menghentikan program kapan saja; program dihapus tidak tampil tetapi datanya tersimpan untuk riwayat order | §14.2 |

### Pemakaian promo (§14.3)

| # | Aturan | Sumber |
|---|---|---|
| A59 | Tidak ada promo otomatis; customer selalu memilih dari list atau memasukkan kode | §14.3 |
| A60 | Maksimal 6 promo per order: 1 diskon subtotal, 1 diskon ongkir, 1 free product merchant + 1 free product aplikator, 1 next order merchant + 1 next order aplikator | §14.3 |
| A61 | Potongan sa7tein poin selalu diterapkan paling akhir setelah semua diskon promo | §14.3, §14.5 |
| A62 | Membatalkan satu promo tidak membatalkan promo lain; promo terpilih terlepas saat keluar dari layar detail cart tanpa order | §14.3, §7.1 |
| A63 | Promo otomatis terlepas bila syarat tidak terpenuhi lagi, program berakhir, batas tercapai, atau customer tidak lagi member aktif | §14.3 |
| A64 | Promo yang syaratnya belum terpenuhi tetap tampil tetapi tidak bisa dipilih, beserta syarat yang kurang | §14.3 |
| A65 | Menu hadiah free product merchant muncul sebagai item tersendiri dengan harga asli dicoret jadi 0; customer tidak bisa mengubah opsi, menghapus, atau mengubah qty | §14.3 |
| A66 | Free product aplikator diberikan saat order selesai; paket hadiah antre dan aktif setelah paket berjalan selesai, berurutan sesuai urutan diterima | §14.3 |
| A67 | Program code tidak tampil di detail merchant dan tidak memicu notifikasi; exclusive hanya untuk penerimanya | §14.3 |

## 3. Aktor & permukaan

- Merchant (owner/karyawan ber-hak "Kelola marketing program") — daftar program, form program, detail budget/pemakaian.
- Ops — program aplikator, pembayaran program, refund sisa saldo, moderasi waktu aktif.
- Customer — list promo cart, input kode, detail merchant (program yang boleh dilihat), notifikasi program baru.

## 4. Masukan → keluaran

- Masuk: tipe, pemilik, masa berlaku, waktu aktif, batas pemakaian, target, reward, rule, budget.
- Keluar: daftar program, nilai diskon per order, warning sisa budget, status pembayaran program, event `program_*`.

## 5. State UI

| State | Tampilan |
|---|---|
| belum mulai (H+1) | tidak tampil ke customer; merchant melihat status akan datang |
| di luar waktu aktif | tidak tampil di list promo, kode ditolak |
| batas/budget hampir habis | warning sisa budget di cart |
| syarat rule belum terpenuhi | promo tampil nonaktif + "belanja X lagi" |
| program terkunci member | tampil terkunci untuk non-member |
| budget habis karena order berjalan | program tidak tampil sampai order terakhir status akhir |

## 6. Kontrak BE (handoff, repo ini mock)

Entitas program + rule + reward config + budget; kode unik per lingkup; reserve pemakaian/budget saat order; pembayaran program aplikator via gateway; event `program_started`, `program_ended`, `program_usage_changed`, `program_budget_changed`.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Tanggal mulai H+1 ditolak | buat program dengan mulai besok → error; H+2 diterima | ⛔ |
| AC2 | Masa berlaku 5 hari hanya menawarkan waktu aktif jam | set 5 hari → pilihan mode tanggal/hari hilang | ⛔ |
| AC3 | Maksimal 6 promo per order dengan komposisi 1+1+1+1+1+1 | pilih 7 promo → yang ke-7 ditolak | ⛔ |
| AC4 | Dua promo diskon subtotal tidak bisa dipakai bersamaan | pilih 2 → yang kedua menggantikan/menolak | ⛔ |
| AC5 | Diskon ongkir tidak bisa dipilih saat F = 0 | cart tanpa delivery fee → promo ongkir nonaktif | ⛔ |
| AC6 | Potongan poin dihitung setelah semua diskon promo | order dengan promo + poin → urutan baris rincian | ⛔ |
| AC7 | Menu hadiah tidak dihitung pada syarat rule maupun diskon subtotal | order 2 item + hadiah → minimum quantity dihitung 2 | ⛔ |
| AC8 | Sisa budget kurang → diskon sebesar sisa + warning | budget sisa 1 JOD, diskon 2 JOD → diskon 1 JOD + warning | ⛔ |
| AC9 | Kode unik lintas program aplikator | buat kode sama di dua program → error | ⛔ |
| AC10 | Next order tidak memberi reward di order itu dan menerbitkan exclusive saat order done | order dengan next order → total tidak berubah; setelah done muncul exclusive | ⛔ |

## 8. UNRESOLVED

- OPEN-31 (daftar fitur bonus paket) terbuka; tidak memblokir program marketing.
- Nilai awal config (mis. batas titik grafik) tidak dicantumkan PRD.

## 9. Bukti

- Kode: `src/store/slices/marketingSlice.ts:44`, `src/types.ts:1326` (`MarketingProgram`), `src/pages/MerchantPromos.tsx`, `src/pages/MerchantPromoSlideForm.tsx`, `src/pages/OpsPrograms.tsx`, `src/hooks/useProgramDiscount.ts`.
- Belum ada: tipe code/exclusive/next order, waktu aktif berlapis, budget + pembayaran/refund, target customer.
