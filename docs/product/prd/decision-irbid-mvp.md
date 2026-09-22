# Keputusan sumber produk: Irbid MVP

- ID: `irbid-mvp-v2-2026-09-21`
- Sumber: `versions/irbid-mvp-v2-2026-09-21/source.md` (draft PO 2026-09-21, status dokumen: menunggu validasi user & konsultan pajak).
- Analisis: `versions/irbid-mvp-v2-2026-09-21/analysis.md` (REVIEWED). Milestone: `versions/irbid-mvp-v2-2026-09-21/milestones.md` (M0–M11).
- Menggantikan: `irbid-mvp-2026-09-12` (kini `superseded`), yang sebelumnya menggantikan `radius-mvp-legacy`.
- Alasan: v2 memuat keputusan PO terbaru yang mengubah model inti — payment gateway Xendit (bukan Midtrans), fee flat 0,37 JOD (merchant 0,15 + customer 0,22), tiga wallet tertutup, COD via hold e-wallet + settle OTP, ledger double-entry append-only, pajak dua lapis (GST Jordan + fee platform), dispute super admin, verifikasi kirim 4 checkpoint + OTP + SLA, Web Push + fallback WhatsApp, dan insentif Founding Merchant. IDR jadi settlement penuh, JOD display-only; Wise dibatalkan.
- Batas implementasi: UI/UX mock saja menurut AGENTS.md. Xendit, GPS polling, push, cron, ledger server, OTP, dan enforcement backend menjadi state demo dan kontrak handoff. Tidak ada backend, pembayaran, atau auth sungguhan.
- Status kode: **belum dimigrasikan** ke v2. IDR-only, radius A/B/C, kuota free tier, dan transfer manual tetap ada sebagai legacy implementation, bukan keputusan produk aktif.
- Ketidakpastian: 27 item `UNRESOLVED` di `analysis.md` (OQ-2–30 + insentif I-1–I-6), termasuk blocker milestone: fee cash-out (M3, OQ-22), sign-off pajak (M7, R-TAX-01), interpretasi insentif I-1/I-2 (M10), dan validasi push di device (M8). Tidak diselesaikan dengan tebakan.

Jika pemilik produk menyatakan dokumen lain lebih otoritatif, ubah manifest dan catat keputusan pengganti. Jangan menimpa dokumen keputusan ini tanpa jejak.

## Riwayat keputusan

### Klarifikasi peran konsol: Panel Admin (CS) vs Super Admin — 2026-09-23 (keputusan PO)

- **Menggantikan sebagian `C-12`** (`analysis.md`): kalimat *"Portal keeps the name 'CS' and doubles as super admin"* **tidak lagi berlaku**. Konsol `/admin/*` adalah **panel admin platform yang dikelola CS** (approval tenant, deposit gate, dispute queue, liability, ledger, blacklist COD), dan **Super Admin adalah role terpisah**.
- **Super Admin** akan berupa **website penuh (non-PWA)** — bukan kolom ponsel 430px — dipakai owner & team untuk **kontrol penuh platform** (termasuk pajak dan dashboard). Cakupan detail dan prefix belum diputuskan → `UNRESOLVED`, jangan dikarang. Catatan prefix yang disiapkan: `/superadmin`.
- **Yang sudah dibangun**: panel admin (CS) di `/admin/*` = isi `F15` + `F8` + `M6/M9`, shell 430px seperti role lain. Label "Super Admin" pada konsol ini **salah** dan sudah dikoreksi.
- **Yang belum**: konsol Super Admin (full website). Tidak ada route/manifest untuknya sampai cakupannya diputuskan.
- Efek lanjutan: teks yang menyebut "Super Admin" sebagai **pihak operasional** (review onboarding, alert SLA) kini merujuk **tim CS**, sesuai pembagian ini. `OQ-30` (siapa super admin operasional) menyempit jadi: siapa operator CS, dan siapa pemilik konsol Super Admin.

### `irbid-mvp-2026-09-12` (superseded oleh v2, 2026-09-22)

- Sumber: `versions/irbid-mvp-2026-09-12/source.pdf`, halaman 1–12.
- Menggantikan: `versions/radius-mvp-legacy/source.pdf`, halaman 1–8.
- Alasan: dokumen Irbid memuat target pasar, alur end-to-end, FR, SLA, dan KPI yang lebih baru/rinci. Kedua berlabel v1.1; karena itu versi dokumen saja tidak dapat dipakai untuk mengurutkan.
- Batas implementasi: Integrasi Midtrans, GPS polling, chat server, push, cron, disbursement, dan enforcement backend menjadi state demo dan kontrak handoff.
- Status kode saat itu: **belum dimigrasikan**; IDR-only, radius A/B/C, kuota free tier, dan transfer manual tetap ada sebagai legacy implementation.

### `radius-mvp-legacy` (superseded oleh 2026-09-12)

- Sumber: `versions/radius-mvp-legacy/source.pdf`, halaman 1–8.
- Scope: Indonesia, IDR, radius A/B/C, COD dan transfer manual, free tier.
