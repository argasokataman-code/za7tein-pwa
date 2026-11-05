# R-MER-DASHBOARD — Line/pie/pivot, 8 measurement, 5 dimensi

Status: partial (laporan sederhana + chart ada; pivot, measurement, customer type belum) · sumber §11.5 MER-41, §12 OPS-23, §12.2, OPEN-25.

## 1. Untuk apa

Dashboard performa menjawab pertanyaan dagang merchant (menu apa yang laku, customer tipe apa yang belanja, berapa nilai yang diharapkan) dari data order, tanpa model data laporan terpisah. Karena dihitung dari order, definisi setiap measurement harus eksplisit agar angka dua merchant atau dua rentang bisa dibandingkan.

## 2. Aturan

### Measurement

| # | Aturan | Sumber |
|---|---|---|
| A1 | Delapan measurement: number of order, total qty, number of varian, expected revenue, total delivery fee, total discount amount, total platform fee, unique customer | §11.5 |
| A2 | Report hanya menghitung order berstatus akhir done, canceled, rejected | §11.5 |
| A3 | Canceled hanya mencakup order yang dibatalkan customer setelah diteruskan ke merchant (dari pending) | §11.5 |
| A4 | Number of varian = jumlah varian unik per order, dijumlahkan; varian sama di satu order dihitung 1 | §11.5 |
| A5 | Expected revenue = harga asli varian × qty dalam JOD, termasuk dari order canceled dan rejected | §11.5 |
| A6 | Total delivery fee = F sebelum diskon; total discount amount = Dm termasuk diskon delivery fee; total platform fee = Pm yang dipotong dari payout; ketiganya juga dihitung dari order canceled/rejected | §11.5, §15.3 |
| A7 | Total unique customer dihitung ulang dari customer unik, bukan dijumlahkan dari baris/interval | §11.5 |
| A8 | Combo dan opsi dihitung sebagai varian yang dipesan, tidak dipecah ke isinya | §11.5, §13.7 |
| A9 | Waktu acuan = waktu order dibuat, dikelompokkan di zona Asia/Amman | §11.5, NFR-04 |

### Dimensi & filter

| # | Aturan | Sumber |
|---|---|---|
| A10 | Dimensi: status, varian, kategori menu, customer, customer type; interval juga menjadi dimensi di pivot | §11.5 |
| A11 | Order dengan beberapa varian/kategori dihitung di setiap varian/kategori itu, sehingga jumlah irisan bisa lebih besar dari total range | §11.5 |
| A12 | Total delivery fee, discount amount, platform fee dihitung penuh di setiap varian/kategori karena nilainya milik order | §11.5 |
| A13 | Dimensi status berisi done, canceled, rejected; filter status bisa dipasang/dilepas manual termasuk done | §11.5 |
| A14 | Saat dashboard dibuka, filter status done otomatis terpasang | §11.5 |
| A15 | Saat status dipilih sebagai dimensi, filter otomatis itu dilepas | §11.5 |
| A16 | Semua report bisa difilter per status, varian, kategori, customer, customer type | §11.5 |

### Customer type

| # | Aturan | Sumber |
|---|---|---|
| A17 | New: belum pernah menyelesaikan order di merchant itu sejak merchant mendaftar sampai sebelum range, tetapi menyelesaikan order di range | §11.5 |
| A18 | Regular: menyelesaikan order di range dan pernah menyelesaikan order sebelum range | §11.5 |
| A19 | Occasional: pernah menyelesaikan minimal 1 order sebelum range, tetapi tidak menyelesaikan order di range | §11.5 |
| A20 | Pada report berinterval, customer type dihitung per titik interval; tiap titik dianggap range | §11.5 |
| A21 | Occasional: unique customer menghitung jumlah customer occasional, measurement lain 0 | §11.5 |
| A22 | Customer yang belum pernah menyelesaikan order sampai akhir range masuk "belum pernah selesai"; hanya terisi order canceled dan rejected | §11.5 |

### Range, interval & jenis report

| # | Aturan | Sumber |
|---|---|---|
| A23 | Range dipilih bebas lewat kalender | §11.5 |
| A24 | Interval: jam, hari, minggu, bulan, tahun; interval tidak boleh lebih besar dari range | §11.5 |
| A25 | Minggu = 7 hari dari tanggal awal range, sama seperti bulan dan tahun; titik terakhir boleh lebih pendek | §11.5 |
| A26 | Jumlah titik maksimal per grafik diatur ops lewat config | §11.5, §12.2 |
| A27 | Line chart: sumbu x range + interval, sumbu y 1 measurement; bisa memakai 1 dimensi sehingga tiap nilai menjadi garis; tanpa dimensi 1 garis | §11.5 |
| A28 | Jumlah garis bisa dibatasi seperti irisan pie, urut nilai total di range | §11.5 |
| A29 | Cumulative: setiap titik = total berjalan dari awal range; unique customer dihitung ulang sebagai customer unik dari awal range | §11.5 |
| A30 | Stacked: garis dengan dimensi ditumpuk dengan area terisi | §11.5 |
| A31 | Pie chart: 1 range tanpa interval, dipecah per 1 dimensi, 1 measurement; jumlah irisan bisa diatur, default semua; bila dibatasi, sisanya menjadi "lainnya" | §11.5 |
| A32 | Pivot: baris dan kolom masing-masing bisa berisi beberapa dimensi bertingkat termasuk interval, dan bisa memilih lebih dari 1 measurement | §11.5 |
| A33 | Multi-dimensi hanya di pivot; line dan pie hanya 1 dimensi | §11.5 |
| A34 | Dimensi yang ditambahkan ke baris/kolom langsung terbuka di bawah semua nilai sebelumnya | §11.5 |
| A35 | Baris dan kolom pivot punya batasan dimensi seperti pie; berlaku di setiap grup bertingkat, urut measurement pertama, tidak berlaku untuk interval | §11.5 |
| A36 | Flip axis menukar baris dan kolom | §11.5 |

### Akses & pembaruan

| # | Aturan | Sumber |
|---|---|---|
| A37 | Bisa dibuka owner dan karyawan ber-hak "Laporan" | §11.5, §11.3 |
| A38 | Ops bisa melihat dashboard setiap merchant di aplikasi internal | OPS-23 |
| A39 | Dashboard diperbarui realtime setiap ada order merchant itu masuk status akhir | §11.5, §18 |

## 3. Aktor & permukaan

- Owner/karyawan ber-hak "Laporan" — dashboard merchant (line, pie, pivot, filter).
- Ops — dashboard per merchant di aplikasi internal.

## 4. Masukan → keluaran

- Masuk: range, interval, dimensi (maks 1 untuk line/pie, banyak untuk pivot), filter, measurement, opsi cumulative/stacked/limit.
- Keluar: seri data per titik/irisan/baris-kolom, total, status filter otomatis.

## 5. State UI

| State | Tampilan |
|---|---|
| dashboard baru dibuka | filter status done terpasang otomatis |
| status dipilih sebagai dimensi | filter otomatis dilepas |
| range tanpa order | grafik kosong dengan keterangan, bukan nilai 0 menyesatkan |
| interval > range | pilihan interval dibatasi |
| titik melebihi config | grafik membatasi titik sesuai config |
| order masuk status akhir | data bertambah tanpa reload |

## 6. Kontrak BE (handoff, repo ini mock)

Agregasi dari order + order item (tempat hitung = OPEN-25); batas titik grafik dari config; event `dashboard_changed`; definisi customer type per titik interval.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Filter status done terpasang saat dashboard dibuka | buka dashboard → hanya order done terhitung | ⛔ |
| AC2 | Memilih status sebagai dimensi melepas filter otomatis | pilih status sebagai dimensi → done/canceled/rejected tampil | ⛔ |
| AC3 | Expected revenue memuat order canceled dan rejected | range dengan 1 canceled → nilai > 0 | ⛔ |
| AC4 | Number of varian menghitung varian sama di satu order sebagai 1 | order 2 baris varian sama (catatan beda) → 1 | ⛔ |
| AC5 | Unique customer tidak dijumlahkan dari titik interval | 1 customer belanja di 3 titik → total unique = 1 | ⛔ |
| AC6 | Interval lebih besar dari range tidak bisa dipilih | range 1 hari → pilihan bulan/tahun nonaktif | ⛔ |
| AC7 | Cumulative unique customer dihitung ulang, bukan dijumlahkan | aktifkan cumulative → nilai unik per titik | ⛔ |
| AC8 | Pie dengan batas irisan menggabungkan sisanya jadi "lainnya" | batas 3 dari 10 → 3 + "lainnya" | ⛔ |
| AC9 | Pivot menerima 2 dimensi bertingkat dan flip axis | tambah dimensi → baris bertingkat; flip → tukar | ⛔ |
| AC10 | Karyawan tanpa hak "Laporan" tidak bisa membuka | login karyawan → menu tidak ada | ⛔ |

## 8. UNRESOLVED

- OPEN-25 (tempat menghitung: frontend/backend, query lintas instance) masih terbuka.
- Nilai awal batas titik grafik tidak dicantumkan PRD.

## 9. Bukti

- Kode: `src/pages/MerchantDashboard.tsx`, `src/pages/MerchantEarnings.tsx`, `src/components/charts/*` (`DonutChart`, `BarChart`, `TrendBars`), `src/pages/OpsAnalytics.tsx`.
- Belum ada: pivot table, 8 measurement, customer type, cumulative/stacked, batas irisan.
