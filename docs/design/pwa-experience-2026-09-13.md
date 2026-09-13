# Audit pengalaman PWA — 2026-09-13

Temuan: `/` adalah website promosi, sedangkan aplikasi yang tercakup manifest berada di `/app/*`. Tautan lama `/merchant/menu` sebelumnya jatuh kembali ke website. Tidak ada indikator cold start, ikon launcher masih bertuliskan DELIVO PWA, dan aturan global `overscroll-behavior: none` mematikan perilaku tepi scroll bawaan perangkat. Halaman aplikasi sendiri sudah lebih tinggi dari viewport dan memakai scroll dokumen.

Perbaikan: tautan lama seperti `/home` dan `/merchant/menu` menuju jalur `/app/*`; boot screen Sa7tein tampil sebelum JavaScript siap hanya pada `/app/*`, lalu dihapus ketika React terpasang; ikon launcher dan favicon memakai tanda mangkuk Sa7tein; overscroll kembali `auto`; tombol instalasi onboarding memakai prompt browser bila ada dan petunjuk manual bila tidak. Tidak ada jeda loading buatan. PRD dan state bisnis tidak diubah.

Migrasi identitas: manifest harus mempertahankan `id: '/'` dan `scope: '/'`, yaitu identitas milik instalasi Delivo lama. Bila identitas diganti menjadi `/app/`, Chromium memperlakukannya sebagai aplikasi baru dan dua launcher dapat hidup bersamaan. `start_url` tetap `/app/home`; hanya service worker yang dibatasi ke `/app/`, sehingga landing tidak dikendalikan cache aplikasi. Instalasi Delivo yang sudah ada akan menerima nama dan ikon Sa7tein saat metadata baru dimuat. Penghapusan launcher lama yang sudah telanjur dibuat oleh build beridentitas `/app/` adalah tindakan OS/browser dan tidak dapat dilakukan situs secara programatis.

Penyempurnaan layar merchant: `/app/merchant/menu` kini menampilkan konteks toko buka/tutup dan jumlah menu yang benar-benar siap tampil, sebelum filter kesehatan stok. Kartu item menaikkan skala foto ke 72px dan memisahkan detail menu dari aksi stok/ketersediaan agar daftar panjang tetap dapat dipindai satu tangan.

Verifikasi pada **production preview**, viewport tinggi 844px:

| Periksa | 390px | 1440px |
|---|---:|---:|
| Shell `/app/home` | 390px | 430px |
| Tinggi dokumen Home | 1439px | 1516px |
| Scroll setelah gestur roda 500px | 500px | 500px |
| Overflow horizontal Home | 0px | 0px |
| Scroll bersarang merchant menu | 0 | 0 |

Pada kedua lebar, splash terlihat sebelum JavaScript di `/app/home`, tidak terlihat di website `/`, dan hilang setelah aplikasi siap. `/merchant/menu` berakhir di `/app/merchant/menu`. Manifest membuka `/app/home`. Instalasi OS dan gesture sentuh fisik perlu validasi pada perangkat nyata; pengukuran browser ini tidak membuktikan keduanya.
