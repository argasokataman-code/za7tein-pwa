# R-DISPUTE — User Agreement, auto dispute & manual dispute non-uang

Status: partial (rulesSlice + ops dispute ada; UA wajib, auto dispute final, kompensasi non-uang belum) · sumber §17, §12 OPS-06/OPS-07/OPS-24, OPEN-17/18/19/53/54.

## 1. Untuk apa

Dispute adalah mekanisme menegakkan aturan tanpa menarik uang: pelaku diberi punishment non-uang, korban diberi kompensasi non-uang, dan biayanya ditanggung aplikator. Rule dibuat ops dan menjadi User Agreement yang wajib diikuti semua merchant dan customer, sehingga tidak ada merchant yang memilih rule yang menguntungkannya.

## 2. Aturan

### Keputusan dasar

| # | Aturan | Sumber |
|---|---|---|
| A1 | Rule (mitigasi, kompensasi, punishment) dibuat dan dikelola ops; PRD mendefinisikan model, bukan isinya | §17 |
| A2 | Merchant dan customer wajib mengikuti semua rule sebagai User Agreement dan tidak bisa memilih atau mengecualikan rule | §17, MER-22, ACC-06 |
| A3 | Dua mekanisme: auto dispute oleh sistem dan manual dispute oleh ops | §17 |
| A4 | Kompensasi dan punishment hanya non-uang; tidak ada penarikan dana setelah payout | §17, OPEN-08 |
| A5 | Contoh kompensasi: kuota order customer, sa7tein poin, voucher. Contoh punishment: penghentian paksa langganan, pengurangan benefit paket | §17 |
| A6 | Biaya kompensasi non-uang ditanggung aplikator | §17 |
| A7 | Merchant dan customer wajib berpartisipasi dalam setiap penyelesaian dispute | MER-22, §17 |
| A8 | Rule yang berlaku di-snapshot ke order saat order dibuat | §17 |

### Perubahan User Agreement

| # | Aturan | Sumber |
|---|---|---|
| A9 | Setiap rule baru atau perubahan wajib diberi tanggal berlaku, paling cepat H+1 setelah didefinisikan/diubah | OPS-06, §17 |
| A10 | Setelah tanggal berlaku ditentukan, merchant dan customer mendapat notifikasi + pesan inbox berisi detail perubahan | §17, R-ACC-AGREEMENT, R-NOTIF |
| A11 | Tidak ada persetujuan ulang; perubahan berlaku otomatis mulai tanggal berlaku, tanpa screen pengunci | §17, OPEN-53 |
| A12 | Notifikasi dan inbox dikirim ke semua customer serta owner dan semua karyawan merchant | §17 |
| A13 | Isi pesan inbox dibuat otomatis dari perubahan rule: rule ditambah, diubah, atau dihapus beserta tanggal berlakunya | §17 |

### Auto dispute

| # | Aturan | Sumber |
|---|---|---|
| A14 | Ops mendefinisikan aktivitas pemicu beserta kompensasi dan punishment-nya dalam bentuk rule | OPS-06, §17 |
| A15 | Sistem mendeteksi aktivitas merchant dan customer lewat riwayat aktivitas | §17, R-HISTORY |
| A16 | Saat aktivitas pemicu terdeteksi, sistem menjalankan auto dispute dan menerapkan kompensasi + punishment otomatis tanpa moderasi ops | §17 |
| A17 | Hasil auto dispute final, tanpa banding | §17, OPEN-17 |
| A18 | Pelaku dan korban mendapat notifikasi hasil auto dispute | §17 |

### Manual dispute

| # | Aturan | Sumber |
|---|---|---|
| A19 | Korban melaporkan lewat sistem tiket | OPS-07, §17 |
| A20 | Ops menangani tiket sesuai urutan masuk | OPS-07 |
| A21 | Ops memeriksa seluruh riwayat percakapan (group chat order) terkait | OPS-07, §19.1 |
| A22 | Ops berhak meminta bukti tambahan dari korban; bukti gambar disimpan di R2 | OPS-07, §17, ARC-09 |
| A23 | Ops memoderasi insiden; bila bukti kurang kuat ops membantu solusi, bila sangat kuat langsung memberi punishment + kompensasi | §17 |
| A24 | Kompensasi dan punishment manual ditentukan ops per insiden | §17 |
| A25 | Merchant dan customer sama-sama bisa menjadi pelapor maupun terlapor | §17 |
| A26 | Batas waktu pengajuan tiket dan retensi riwayat chat memakai satu config yang sama, dihitung sejak order berstatus akhir, sehingga chat selalu tersedia selama tiket bisa diajukan | §17, §12.2 |

### Model & akses

| # | Aturan | Sumber |
|---|---|---|
| A27 | Entitas: Rule, Kompensasi, Punishment, Persetujuan User Agreement, Insiden, Tiket, Eksekusi | §17 |
| A28 | Rule berisi kode, nama, kategori insiden, aktivitas pemicu, pihak bertanggung jawab, langkah mitigasi, status aktif, versi, tanggal berlaku | §17 |
| A29 | Insiden berisi jenis (auto/manual), order, pelaku, korban, kategori, deskripsi, bukti (gambar di R2), status, rule yang diterapkan, keputusan, pemutus (sistem/ops) | §17 |
| A30 | Tiket berisi pelapor, terlapor, order, deskripsi, bukti awal dan tambahan, urutan masuk, status, ops penangan | §17 |
| A31 | Eksekusi mencatat kompensasi/punishment yang dijalankan beserta referensi ke ledger | §17 |
| A32 | Ops bisa me-refund sisa saldo program aplikator hanya dari akun ops yang membayar program itu | OPS-24 |
| A33 | Perubahan rule dan keputusan dispute tercatat di riwayat aktivitas | NFR-07 |

## 3. Aktor & permukaan

- Customer — lapor insiden lewat tiket, kirim bukti, lihat hasil.
- Merchant (owner/karyawan ber-hak "Dispute") — lapor lewat tiket, lihat UA di aplikasi, terima inbox.
- Ops — kelola rule + tanggal berlaku, tiket, keputusan, eksekusi kompensasi/punishment.
- Sistem — deteksi pemicu auto dispute, snapshot rule ke order.

## 4. Masukan → keluaran

- Masuk: definisi rule + tanggal berlaku, aktivitas pemicu, tiket + bukti, keputusan ops.
- Keluar: penerapan kompensasi/punishment, entri insiden, status tiket, pesan inbox UA, event `dispute_opened`, `dispute_decided`, `user_agreement_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| UA berubah | inbox + notifikasi, tanpa screen pengunci |
| auto dispute terpicu | pelaku & korban menerima notifikasi hasil, tanpa tombol banding |
| tiket baru | status "menunggu ditangani" + urutan masuk |
| ops minta bukti | status menunggu bukti + unggah gambar |
| keputusan dijalankan | kompensasi/punishment tampil di penerima, eksekusi tercatat |
| tiket di luar batas waktu | form tiket nonaktif + alasan |

## 6. Kontrak BE (handoff, repo ini mock)

Entity Rule, Kompensasi, Punishment, Persetujuan UA, Insiden, Tiket, Eksekusi; snapshot rule ke order saat order dibuat; bukti di R2; event `dispute_*`; satu config untuk batas tiket + retensi chat.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Tanggal berlaku rule H+1 minimal | simpan rule berlaku hari ini → ditolak | ⛔ |
| AC2 | Perubahan UA tidak memunculkan screen pengunci | ubah rule → login berikutnya langsung masuk | ⛔ |
| AC3 | Inbox memuat rule yang ditambah/diubah/dihapus + tanggal berlaku | ubah 1 rule → 1 pesan sesuai | ⛔ |
| AC4 | Auto dispute tidak punya tombol banding | picu pemicu → notifikasi hasil tanpa aksi banding | ⛔ |
| AC5 | Kompensasi/punishment hanya bentuk non-uang | daftar opsi di ops tidak memuat penarikan dana | ⛔ |
| AC6 | Rule di-snapshot ke order | ubah rule setelah order dibuat → order tetap memakai rule lama | ⛔ |
| AC7 | Tiket setelah batas waktu ditolak; chat masih tersedia selama batas itu | lewati batas → form nonaktif, chat terhapus | ⛔ |
| AC8 | Merchant tidak memilih rule | layar merchant tidak punya multi-select rule | ⛔ |
| AC9 | Refund sisa saldo program hanya dari akun ops yang membayar | login ops lain → tombol Refund tidak tampil | ⛔ |

## 8. UNRESOLVED

- Isi rule (kategori insiden, mitigasi, besaran) adalah keputusan ops, tidak ada di PRD.
- OPEN-17/18/19/53/54 diputuskan di §17; rujukan final = §17.

## 9. Bukti

- Kode: `src/store/slices/rulesSlice.ts:22`, `src/pages/OpsRules.tsx`, `src/pages/OpsDisputes.tsx`, `src/pages/OpsIncidents.tsx`, `src/pages/OpsPenalties.tsx`, `src/pages/DisputeSubmit.tsx`, `src/pages/SaAppeals.tsx`, `src/pages/MerchantRules.tsx`.
- Belum ada: User Agreement + persetujuan, auto dispute final, kompensasi/punishment non-uang, snapshot rule ke order, batas tiket = retensi chat.
