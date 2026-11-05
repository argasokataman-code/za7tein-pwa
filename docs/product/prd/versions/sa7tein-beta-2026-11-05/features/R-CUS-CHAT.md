# R-CUS-CHAT — Group chat per order

Status: partial (layar chat ada; peserta dinamis belum) · sumber §19.1, §10 CUS-26, §11.3 MER-21.

## 1. Untuk apa

Chat adalah kanal konfirmasi resmi saat permintaan customer tidak bisa dipenuhi (mis. minta paha atas, tersedia dada). Riwayatnya dipakai ops sebagai bukti dispute, jadi peserta dan label pengirim harus akurat.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Setiap order punya **satu** group chat, dibuka saat order dibuat | §19.1 |
| A2 | Peserta = **akun**: customer pemilik, owner, karyawan ber-hak "terima order" | §19.1 |
| A3 | Karyawan dengan hak lain (mis. kelola menu) **tidak bisa** melihat chat | §19.1 |
| A4 | Karyawan kurir bergabung **setelah batch di-assign**; boleh membaca seluruh riwayat sejak order dibuat | §19.1 |
| A5 | Pesan karyawan tampil "nama merchant + nama peran saat kirim"; owner hanya nama merchant; customer nama akun | §19.1 |
| A6 | Perubahan nama peran tidak mengubah pesan lama | §19.1, §11.3 |
| A7 | Setiap pesan menyimpan akun pengirim untuk penelusuran ops | §19.1 |
| A8 | Notifikasi pesan ke owner + karyawan ber-hak terima order; karyawan kurir hanya order di batch-nya | §19.1 |
| A9 | Akses berakhir saat chat ditutup, karyawan dihapus, atau hak dicabut | §19.1 |
| A10 | Mendukung teks + gambar (R2) | §19.1 |
| A11 | Tutup beberapa jam setelah order selesai; **langsung** saat batal/ditolak; durasi = config ops | §19.1, §12.2 |
| A12 | Retensi = batas waktu pengajuan dispute; setelah itu pesan + riwayat aktivitas + gambar **dihapus permanen** | §19.1, §12.1 |

## 3. Aktor & permukaan

- Customer — chat dari detail order.
- Merchant — owner + karyawan ber-hak; label peran.
- Karyawan kurir — read-only sampai gabung, lalu bisa kirim.
- Ops — membaca riwayat sebagai bukti.

## 4. Masukan → keluaran

- Masuk: pesan teks/gambar, perubahan hak akses, status batch.
- Keluar: daftar peserta aktif, pesan berlabel, state ditutup, event chat*.

## 5. State UI

| State | Tampilan |
|---|---|
| aktif | daftar peserta + composer |
| kurir belum gabung | kurir tidak melihat chat |
| ditutup | riwayat read-only + label "chat ditutup" |
| dihapus (retensi habis) | layar kosong + keterangan |
| lampiran gambar | thumbnail + status unggah |

## 6. Kontrak BE (handoff, repo ini mock)

Entity pesan (akun pengirim, teks, gambar R2, waktu); daftar peserta dihitung dari hak akses + batch; job penutupan & penghapusan memakai config; event `chat_message`, `chat_opened`, `chat_closed`.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Karyawan tanpa hak terima order tidak melihat chat | login karyawan → chat tidak muncul | ⛔ |
| AC2 | Kurir bisa membaca riwayat sejak order dibuat setelah batch di-assign | assign batch → scroll ke pesan pertama | ⛔ |
| AC3 | Label pengirim memakai nama peran saat pesan dikirim | ubah nama peran → pesan lama tetap | ⛔ |
| AC4 | Chat batal/tolak langsung tertutup; selesai tertutup setelah durasi config | ubah config → waktu tutup berubah | ⛔ |
| AC5 | Setelah retensi habis, pesan + gambar hilang permanen | simulasi lewat batas → 0 pesan | ⛔ |

## 8. UNRESOLVED

- Nilai awal durasi penutupan & retensi tidak dicantumkan (OPEN-20).
- Penghapusan permanen gambar di R2 = perilaku BE.

## 9. Bukti

- Kode: `src/pages/OrderChat.tsx`, route customer `App.tsx:183` + merchant `App.tsx:222`, `src/store/slices/notificationsSlice.ts`.
- Flow: `f13-courier-view` (gabung kurir), `f8-dispute` (bukti chat).
