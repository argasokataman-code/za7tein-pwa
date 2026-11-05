# R-ACC-AGREEMENT — Persetujuan & perubahan User Agreement

Status: partial (definisi lengkap; implementasi belum dimulai) · sumber §5 (ACC-06), §17, §19.3.

## 1. Untuk apa

Dispute hanya adil kalau aturannya diketahui sejak awal. User Agreement adalah kumpulan rule kompensasi & punishment milik ops; merchant dan customer menyetujuinya saat mendaftar, dan setiap perubahan berlaku otomatis tanpa persetujuan ulang.

## 2. Aturan

| # | Aturan | Sumber |
|---|---|---|
| A1 | Merchant & customer wajib setuju User Agreement saat mendaftar | §5 ACC-06 |
| A2 | Untuk merchant, persetujuan dilakukan **owner** dan berlaku seluruh karyawan | §5 ACC-06, §17 |
| A3 | Karyawan tidak menyetujui, tetapi bisa melihat isinya + menerima notifikasi/inbox perubahan | §11.3, §17 |
| A4 | Setiap rule baru/perubahan wajib diberi tanggal berlaku, **paling cepat H+1** | §17, OPS-06 |
| A5 | Perubahan berlaku **otomatis** mulai tanggal berlaku; **tanpa** persetujuan ulang dan **tanpa** screen pengunci | §17, OPEN-53 (diubah) |
| A6 | Notifikasi + **pesan inbox** berisi rule yang ditambah/diubah/dihapus beserta tanggal berlaku | §17, §19.3 |
| A7 | Penerima notifikasi: semua customer + owner + semua karyawan merchant | §17 |
| A8 | Inbox untuk saat ini **khusus** perubahan User Agreement | §19.3 |

## 3. Aktor & permukaan

- Customer — consent saat daftar, inbox.
- Owner merchant — consent saat mendaftar merchant, inbox, melihat isi rule.
- Karyawan — melihat isi + inbox, tanpa consent.
- Ops — membuat/mengubah rule + tanggal berlaku.

## 4. Masukan → keluaran

- Masuk: versi rule, tanggal berlaku, aksi setuju.
- Keluar: `persetujuan{akun, versi, waktu}`, pesan inbox, event `user_agreement_changed`.

## 5. State UI

| State | Tampilan |
|---|---|
| onboarding | layar consent dengan ringkasan + tautan baca penuh |
| belum setuju | tidak bisa lanjut daftar |
| perubahan dijadwalkan | banner/catatan "berlaku <tanggal>" |
| tanggal berlaku tiba | inbox bertambah, tanpa layar pengunci |
| inbox kosong | empty state "Belum ada perubahan aturan." |

## 6. Kontrak BE (handoff, repo ini mock)

Entity `Persetujuan User Agreement` (pengguna, versi rule, waktu) — §17 model konseptual. Versi rule + tanggal berlaku disimpan pada rule. Event `user_agreement_changed` + pesan inbox ke seluruh penerima.

## 7. Acceptance

| # | Kriteria | Cara ukur | Status |
|---|---|---|---|
| AC1 | Pendaftaran merchant/customer terhenti bila consent belum dicentang | submit tanpa centang → tetap di layar | ⛔ belum ada |
| AC2 | Tidak ada screen pengunci setelah perubahan rule | buka app dengan UA versi baru → aplikasi tetap bisa dipakai | ⛔ belum ada |
| AC3 | Pesan inbox memuat daftar rule yang berubah + tanggal berlaku | isi pesan vs perubahan rule | ⛔ belum ada |
| AC4 | Karyawan menerima inbox tetapi tidak diminta consent | daftar penerima + tidak ada CTA setuju | ⛔ belum ada |
| AC5 | Tanggal berlaku paling cepat H+1 (tanggal hari ini ditolak) | validasi input ops | ⛔ belum ada |

## 8. UNRESOLVED

- Isi rule tidak didefinisikan PRD (hanya model) — teks contoh harus diberi label mock.
- Retensi pesan inbox tidak diatur.

## 9. Bukti

- Kode: tidak ada (0 hit `User Agreement`/`userAgreement` di `src/`).
- Terkait: `src/pages/ops/OpsRules.tsx`, `src/pages/DisputeSubmit.tsx`.
