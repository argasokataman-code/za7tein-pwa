# Sa7tein PWA — showcase UI/UX

Repo ini adalah prototipe **front-end** Sa7tein: alur pelanggan dan merchant menggunakan data mock. Repo ini belum menyediakan backend, autentikasi, pembayaran, atau push notification sungguhan. Integrasi backend nantinya mengikuti keputusan PRD aktif dan kontrak tipe di `src/types.ts`.

## Mulai

```bash
npm install --include=dev
npm run dev
```

Website promosi tersedia di `http://localhost:5173/`; pengalaman aplikasi PWA ada di `http://localhost:5173/customer/home`. Tiap peran punya URL dan instalasi PWA sendiri: `/customer/*` (pelanggan), `/merchant/*` (merchant console), `/courier/*` dan `/admin/*` (placeholder). Tautan lama `/app/*` dan jalur polos seperti `/merchant/*` dialihkan ke prefix peran yang benar. Untuk memeriksa hasil kerja:

```bash
npm run governance:check
npm run lint
npm run build
```

PWA/service worker aktif pada hasil build (`npm run preview`), bukan dev server. Boot screen dan scroll native didokumentasikan di [audit pengalaman PWA](docs/design/pwa-experience-2026-09-13.md).

## PRD atau BRS baru

1. Taruh file baru di `docs/product/prd/inbox/`.
2. Jalankan `npm run prd:intake` agar dokumen mendapat ID versi, hash, draf analisis keputusan, dan draf milestone.
3. Tinjau draf di `docs/product/prd/`, tetapkan versi aktif, lalu jalankan `npm run governance:check`.

Petunjuk lengkap dan sumber kebenaran versi ada di [registri PRD](docs/product/prd/README.md). Menaruh file saja membuatnya **terdeteksi sebagai pending**; dokumen belum otomatis menjadi versi aktif dan keputusan produk tidak boleh ditebak oleh agen.

## DNA antarmuka

[Aturan UI/UX wajib](docs/design/DNA.md) mengikat perbaikan, pengembangan, dan layar baru. Token desain ada di `src/styles/_tokens.scss`; gaya baru ditulis di partial `src/styles/system/`; komponen bersama ada di `src/components/`. Layar dan rute terdaftar di `src/App.tsx`, data mock di `src/data/`, tipe domain di `src/types.ts`.

`AGENTS.md` adalah pintu masuk agen. Pemeriksaan otomatis menolak token yang tidak dikenal, ikon fungsional SVG inline baru, warna mentah baru di lapisan UI yang diawasi, dan PRD/BRS yang belum diproses. Audit browser tetap diperlukan untuk pengalaman visual dan aksesibilitas.

## Stack

Vite, React 19, TypeScript, React Router, SCSS, Redux Toolkit, react-hook-form, Zod, Lucide, Leaflet, dan vite-plugin-pwa.
