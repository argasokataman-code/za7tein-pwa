# Audit pengalaman PWA — 2026-09-13

Temuan: `/` adalah website promosi, sedangkan aplikasi yang tercakup manifest berada di `/app/*`. Tautan lama `/merchant/menu` sebelumnya jatuh kembali ke website. Tidak ada indikator cold start, ikon launcher masih bertuliskan DELIVO PWA, dan aturan global `overscroll-behavior: none` mematikan perilaku tepi scroll bawaan perangkat. Halaman aplikasi sendiri sudah lebih tinggi dari viewport dan memakai scroll dokumen.

Perbaikan: tautan lama seperti `/home` dan `/merchant/menu` menuju jalur `/app/*`; boot screen Sa7tein tampil sebelum JavaScript siap hanya pada `/app/*`, lalu dihapus ketika React terpasang; ikon launcher dan favicon memakai tanda mangkuk Sa7tein; overscroll kembali `auto`; tombol instalasi onboarding memakai prompt browser bila ada dan petunjuk manual bila tidak. Tidak ada jeda loading buatan. PRD dan state bisnis tidak diubah.

Verifikasi pada **production preview**, viewport tinggi 844px:

| Periksa | 390px | 1440px |
|---|---:|---:|
| Shell `/app/home` | 390px | 430px |
| Tinggi dokumen Home | 1439px | 1516px |
| Scroll setelah gestur roda 500px | 500px | 500px |
| Overflow horizontal Home | 0px | 0px |
| Scroll bersarang merchant menu | 0 | 0 |

Pada kedua lebar, splash terlihat sebelum JavaScript di `/app/home`, tidak terlihat di website `/`, dan hilang setelah aplikasi siap. `/merchant/menu` berakhir di `/app/merchant/menu`. Manifest membuka `/app/home`. Instalasi OS dan gesture sentuh fisik perlu validasi pada perangkat nyata; pengukuran browser ini tidak membuktikan keduanya.
