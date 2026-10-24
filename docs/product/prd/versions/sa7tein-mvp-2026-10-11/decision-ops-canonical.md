# Keputusan — `/ops` adalah backoffice kanonik

Tanggal: 2026-10-24
Status: active
Sumber keputusan: PO (percakapan 2026-10-24), mengikat pekerjaan merge berikutnya.

## Keputusan

1. **Backoffice kanonik = `/ops/*`.** Panel inilah yang dipakai. Tidak ada pekerjaan
   baru di `/admin/*` atau `/superadmin/*` selama transisi.
2. **`/admin` (panel CS) berstatus legacy.** Kode dan rutenya dipertahankan sampai
   merge supaya layar yang belum punya padanan di ops (sengketa, daftar merchant,
   ledger/liability) tidak hilang. Setelah merge, tiap layar dipetakan ke `/ops/*`
   atau dipensiunkan mengikuti PRD aktif §13.
3. **`/superadmin` berstatus legacy.** PRD aktif `sa7tein-mvp-2026-10-11` tidak
   menyebut Super Admin; §13 hanya menyebut aplikasi ops di balik Cloudflare Access.
   Konsol SA tidak dihapus sebelum merge, tetapi tidak dijadikan acuan peran baru.
4. **Di merge, PRD aktif menang.** Bila detail implementasi bertentangan dengan PRD
   (mis. ops PWA vs ops desktop), yang diikuti adalah PRD; deviasi yang disengaja
   wajib dicatat sebagai keputusan, bukan dibiarkan sebagai kontradiksi.

## Peta layar saat merge

| Sekarang | Tujuan | Catatan |
|---|---|---|
| `/admin` dashboard | `/ops` ringkasan | Ops sudah punya ringkasan beban kerja |
| `/admin/onboarding` | `/ops/onboarding` | Ops sudah memakai slice `admin` yang sama |
| `/admin/disputes` | `/ops/disputes` (baru) atau `/ops/incidents` | PRD §13/§18: rule dispute & insiden milik ops |
| `/admin/merchants` | `/ops/onboarding` + daftar tenant | Perlu daftar tenant di ops |
| `/admin/ledger` | `/ops/ledger` (baru) atau konsol SA | PRD §16 ledger; belum ada di ops |
| `/admin/notifications` | `/ops/notifications` | Lonceng ops, bukan CS |
| `/superadmin/*` | dipensiunkan atau diserap ops | PRD tidak menyebut SA |

## Yang belum diputuskan

- **Bentuk shell ops.** PRD §13 menyebut aplikasi ops PWA di balik Cloudflare Access;
  implementasi M10 memilih website desktop penuh. Deviasi ini belum ditutup.
- **Auth ops.** Cloudflare Access belum diimplementasikan; PRD belum menurunkan
  requirement login ops ke level layar.
- **Nasib Super Admin.** Tidak ada requirement aktif; jangan mengarang `R-SA-*`.
- **Sengketa & ledger di ops.** Perlu keputusan produk apakah menjadi layar ops atau
  tetap konsol terpisah.

## Konsekuensi

- Jangan menambah fitur ke `/admin` atau `/superadmin`.
- Jangan menghapus keduanya sebelum merge; lakukan migrasi layar dalam satu commit
  yang sama dengan pembaruan route, flow, PRD impact, dokumentasi, dan atlas.
- Setelah migrasi, `ui-impact.md` untuk f15/f22/f24 harus berubah dari `LEGACY`
  menjadi status final.
