# R-HISTORY — Entri riwayat, jejak perubahan & pengikut riwayat

Status: partial (audit tersebar di `adminSlice`/`SaAudit`; model entri + jejak + pengikut belum) · sumber §12.1 OPS-16, §11.4, §20.1 ARC-15, §20.2 NFR-01/NFR-07.

## 1. Untuk apa

Riwayat aktivitas adalah satu-satunya sumber bukti yang tidak bisa diubah: dipakai untuk riwayat merchant, penelusuran pelaku saat dispute, dan audit ops. Karena itu cakupannya harus menyeluruh (semua create/update/delete), tidak boleh menghapus data (kecuali pesan chat), dan tidak boleh mencatat aktivitas membaca agar tidak meledak.

## 2. Aturan

### Model

| # | Aturan | Sumber |
|---|---|---|
| A1 | Setiap aktivitas create, update, delete pada data tercatat otomatis; cakupan semua field di setiap instance DO dan `applicationConfiguration`, tanpa terkecuali | §12.1 |
| A2 | Riwayat aktivitas tidak mencatat data di luar itu | §12.1 |
| A3 | Entri riwayat: satu entri per aktivitas per data; 1 entri = 1 instance DO | §12.1, ARC-15 |
| A4 | Jejak perubahan: satu jejak per field yang berubah, berisi entri, field, nilai lama, nilai baru; 1 jejak = 1 instance DO | §12.1, ARC-15 |
| A5 | Pengikut riwayat: akun ops, model, dan data yang diikuti (ditentukan ops) | §12.1, OPS-16 |

### Field entri

| # | Aturan | Sumber |
|---|---|---|
| A6 | Actor: akun pelaku termasuk akun ops, atau "Sistem" | §12.1 |
| A7 | DO id: instance data yang berubah, disertai model data; untuk `applicationConfiguration` memakai key konfigurasi | §12.1 |
| A8 | Recipients: akun penerima notifikasi entri | §12.1 |
| A9 | Trackings: jejak perubahan milik entri | §12.1 |
| A10 | Jenis aktivitas: create, update, delete | §12.1 |
| A11 | Waktu disimpan UTC dan ditampilkan zona Yordania | §12.1, NFR-04 |

### Aturan pencatatan

| # | Aturan | Sumber |
|---|---|---|
| A12 | Membaca data tidak dicatat, baik di entri maupun jejak | §12.1 |
| A13 | Saat create, setiap field terisi membuat satu jejak dengan nilai lama kosong, termasuk field yang terisi otomatis | §12.1 |
| A14 | Saat update, setiap field berubah membuat satu jejak berisi nilai lama dan baru | §12.1 |
| A15 | Delete tidak menghapus permanen: data menjadi arsip sistem (tidak tampil bagi pengguna, tetap tersimpan beserta riwayat); entri delete berisi jejak status arsip | §12.1 |
| A16 | Pengecualian: pesan chat beserta riwayat aktivitasnya dan gambar R2 dihapus permanen setelah retensi chat berakhir | §12.1, §19.1 |
| A17 | Data di luar instance DO/`applicationConfiguration` tidak dicatat (mis. lokasi kurir realtime, registry DO) | §12.1 |
| A18 | Entri riwayat dan jejak tidak dicatat sebagai aktivitas, agar pencatatan tidak berulang | §12.1 |
| A19 | Actor "Sistem" dipakai untuk proses otomatis, jadwal, dan layanan luar (payment gateway, WhatsApp) | §12.1 |
| A20 | Entri merujuk akun actor, sehingga nama yang tampil selalu nama terbaru; nilai field yang merujuk data lain disimpan sebagai rujukan | §12.1 |
| A21 | Pencatatan asynchronous setelah data berubah sebagai Workflow lintas DO, dan setiap aktivitas tercatat tepat satu kali walau langkah Workflow diulang | §12.1, ARC-06, NFR-01 |
| A22 | Entri dan jejak tidak bisa diubah atau dihapus siapa pun, kecuali penghapusan riwayat chat | §12.1 |
| A23 | Validasi keunikan dan tumpang tindih mengabaikan data yang sudah diarsipkan (hari jam operasional, kode program, minimum kuota skema diskon, polygon coverage) | §12.1 |

### Pengikut

| # | Aturan | Sumber |
|---|---|---|
| A24 | Ops menentukan pengikut: akun, model, dan data; hanya akun ops yang bisa dijadikan pengikut | §12.1, OPS-16 |
| A25 | Bila data dikosongkan, pengikut mengikuti semua data di model itu termasuk data baru | §12.1 |
| A26 | Tidak ada pengikut otomatis; pembuat data tidak otomatis menjadi pengikut | §12.1 |
| A27 | Saat entri dibuat, akun pengikut yang cocok menjadi recipients dan menerima event realtime + notifikasi | §12.1, §18, R-NOTIF |
| A28 | Pengikut milik akun ops yang kehilangan akses ke aplikasi internal ikut berakhir | §12.1 |

### Akses

| # | Aturan | Sumber |
|---|---|---|
| A29 | Ops melihat semua riwayat aktivitas | §12.1 |
| A30 | Riwayat terkait merchant ditampilkan ke owner sebagai riwayat aktivitas merchant (per tanggal, ringkasan karyawan + daftar aksi) | §12.1, §11.4 |
| A31 | Setiap aksi ops tercatat di riwayat aktivitas | NFR-07 |

## 3. Aktor & permukaan

- Ops — daftar riwayat semua data, detail entri + jejak, pengaturan pengikut.
- Owner merchant — riwayat aktivitas merchant per tanggal.
- Sistem — pencatatan otomatis async.

## 4. Masukan → keluaran

- Masuk: aktivitas create/update/delete pada DO dan KV, definisi pengikut.
- Keluar: entri riwayat, jejak per field, recipients, event + notifikasi, data arsip.

## 5. State UI

| State | Tampilan |
|---|---|
| entri baru | daftar riwayat bertambah realtime |
| detail entri | tabel field, nilai lama, nilai baru |
| data dihapus | hilang dari daftar pengguna, tetap ada di riwayat (arsip) |
| pesan chat lewat retensi | hilang permanen termasuk riwayatnya |
| pengikut tanpa akses | pengikut berakhir, notifikasi berhenti |

## 6. Kontrak BE (handoff, repo ini mock)

1 entri = 1 DO, 1 jejak = 1 DO; prefix key KV untuk config; query lintas instance (OPEN-25); pencatatan async Workflow dengan idempotensi.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Create 3 field menghasilkan 3 jejak pada 1 entri | buat data 3 field → 1 entri, 3 jejak | ⛔ |
| AC2 | Update hanya mencatat field yang berubah | ubah 1 dari 3 field → 1 jejak | ⛔ |
| AC3 | Membaca data tidak menghasilkan entri | buka detail order → jumlah entri tidak bertambah | ⛔ |
| AC4 | Delete menjadi arsip, bukan hapus permanen | hapus menu → menu hilang dari UI, entri + data tetap ada | ⛔ |
| AC5 | Pesan chat dihapus permanen setelah retensi | lewati batas retensi → pesan + entri hilang | ⛔ |
| AC6 | Entri tidak bisa diubah/dihapus | coba edit entri → ditolak | ⛔ |
| AC7 | Workflow diulang tidak menggandakan entri | jalankan ulang langkah → tetap 1 entri | ⛔ |
| AC8 | Pengikut menerima event + notifikasi hanya untuk data yang diikuti | set pengikut 1 data → ubah data lain → tidak ada notifikasi | ⛔ |
| AC9 | Kode program lama bisa dipakai ulang setelah program diarsipkan | hapus program → kode sama bisa dibuat lagi | ⛔ |

## 8. UNRESOLVED

- OPEN-25 (query lintas instance) terbuka; memblokir cara menampilkan riwayat per merchant.
- R14 (ledakan instance DO karena riwayat per field) diterima dengan mitigasi di §21.2.

## 9. Bukti

- Kode: `src/pages/SaAudit.tsx`, `src/store/slices/adminSlice.ts`, `src/store/slices/opsSlice.ts:49`, `src/pages/OpsDashboard.tsx`.
- Belum ada: model entri + jejak + pengikut, arsip sistem, penghapusan permanen chat, recipients.
