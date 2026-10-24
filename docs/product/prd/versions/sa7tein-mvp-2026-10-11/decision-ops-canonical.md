# Keputusan — `/ops` adalah backoffice kanonik

Tanggal: 2026-10-24
Status: active (migrasi dijalankan 2026-10-24)
Sumber keputusan: PO (percakapan 2026-10-24).

## Keputusan

1. **Backoffice kanonik = `/ops/*`.** Panel inilah yang dipakai. Tidak ada pekerjaan
   baru di `/superadmin/*`.
2. **`/admin` (panel CS) sudah dihapus.** Layar sengketa, merchant, ledger, dan
   dashboard kewajiban sudah dipindah ke `/ops`; URL `/admin/*` diarahkan ke layar ops
   yang setara. Komponen shell CS (`AdminShell`, `AdminBottomNav`, `adminNav`,
   `AdminPageHeader`, `_admin-console.scss`) dan manifest admin ikut dihapus.
3. **`/superadmin` berstatus legacy.** PRD aktif `sa7tein-mvp-2026-10-11` tidak
   menyebut Super Admin; §13 hanya menyebut aplikasi ops di balik Cloudflare Access.
   Konsol SA dipertahankan sebagai alat audit, bukan acuan peran baru.
4. **Di merge, PRD aktif menang.** Bila detail implementasi bertentangan dengan PRD
   (mis. ops PWA vs ops desktop), yang diikuti adalah PRD; deviasi yang disengaja
   wajib dicatat sebagai keputusan, bukan dibiarkan sebagai kontradiksi.

## Peta layar — hasil migrasi

| Sebelum | Sekarang | Catatan |
|---|---|---|
| `/admin` dashboard | `/ops/liability` | Komposisi kewajiban, saldo DANA, eksposur sengketa, arus ledger |
| `/admin/onboarding` | `/ops/onboarding` | Ops sudah memakai slice `admin` yang sama |
| `/admin/disputes` | `/ops/disputes` | Putusan level-1 + entry ledger |
| `/admin/merchants` | `/ops/merchants` | Registri tenant, suspend, blacklist COD |
| `/admin/ledger` | `/ops/ledger` | Entry append-only, tanpa edit/hapus |
| `/admin/notifications` | `/ops` | Ops tidak punya lonceng; URL lama mendarat di ringkasan |
| `/superadmin/*` | tetap (legacy) | PRD tidak menyebut SA |

## Yang belum diputuskan

- **Bentuk shell ops.** PRD §13 menyebut aplikasi ops PWA di balik Cloudflare Access;
  implementasi memilih website desktop penuh. Deviasi ini terbuka dan tercatat.
- **Auth ops.** Cloudflare Access belum diimplementasikan; PRD belum menurunkan
  requirement login ops ke level layar.
- **Nasib Super Admin.** Tidak ada requirement aktif; jangan mengarang `R-SA-*`.

## Konsekuensi

- Jangan membuat rute atau komponen `/admin` baru.
- Jangan menambah fitur ke `/superadmin`; tambahkan ke `/ops`.
- Perubahan berikutnya yang menyentuh ops wajib memperbarui flow, PRD impact,
  dokumentasi, dan atlas dalam commit yang sama.
