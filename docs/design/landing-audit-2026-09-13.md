# Audit landing dan login — 2026-09-13

Masukan pengguna: logo Apple tidak terlihat pada `/app/signin`; halaman `/` tampak seperti template AI. Gambar yang diberikan adalah rancangan visual pengguna, bukan tangkapan layar usang. Secara terpisah, PWA sebelumnya mendaftarkan service worker dengan scope seluruh origin `/`, termasuk website promosi.

Perbaikan cache: worker baru hanya memiliki scope `/app/`; registrasi root lama dilepas sekali saat build terbaru terbuka. Setelah itu website promosi tidak dikendalikan worker. Jika tab lama masih menampilkan snapshot usang, muat ulang tab sekali.

Perbaikan login: logo Apple memakai `currentColor` sehingga berwarna gelap di atas tombol putih. Ketiga tombol sosial diberi nama aksesibel dan jelas berstatus demo. Revisi akhir landing dijelaskan di bagian koreksi sampel di bawah. Foto hanya dari aset lokal. Aturan bisnis mengikuti PRD Irbid aktif; brief landing berstatus proposed hanya panduan desain.

Audit production preview setelah perubahan, viewport tinggi 844px:

| Lebar | Lebar root | Overflow horizontal | Foto gagal |
|---:|---:|---:|---:|
| 360px | 360px | 0px | 0 |
| 390px | 390px | 0px | 0 |
| 430px | 430px | 0px | 0 |
| 768px | 768px | 0px | 0 |
| 1024px | 1024px | 0px | 0 |
| 1440px | 1440px | 0px | 0 |

Navigasi ponsel membuka daftar tautan. Logo Apple terukur `rgb(32, 32, 32)` pada permukaan putih. Warna teks kecil di atas oranye memakai `--text-primary` dengan rasio kontras sekitar 4,86:1; teks putih hanya untuk judul besar. Browser baru mendaftarkan worker dengan scope `/app/`. Ini audit browser Chromium lokal; penilaian visual akhir pada perangkat iOS/Android masih perlu pemeriksaan fisik.

## Koreksi setelah pengguna mengklarifikasi sampel

Gambar yang dilampirkan adalah rancangan pengguna. Interpretasi sebelumnya sebagai tampilan usang keliru. Landing direvisi mengikuti komposisi tersebut: hero oranye dengan mockup aplikasi/tiket/peta, Journey Line empat ikon, tiga layar ponsel, visual area, kartu merchant/kurir/masakan, dan CTA akhir. Semua pratinjau adalah UI contoh, memakai aset lokal dan tetap responsif. Label layanan tetap Hijazi/Syimali sesuai PRD aktif.

Klarifikasi berikutnya: gambar adalah referensi gaya, bukan instruksi menumpuk semua konten dalam satu komposisi rapat. Layout akhir memberi section sendiri untuk pengalaman pelanggan, jangkauan, merchant, kurir, dan makanan. Kartu-kartu kecil diganti dengan blok editorial yang lebih besar dan hierarki teks/visual yang tunggal per section.

## Rute dan gerak

Garis acak pada mockup pesanan dan kartu “Menuju lokasi” diganti oleh satu ilustrasi peta vektor yang konsisten. Rute oranye mengikuti jalan dari titik toko, melewati penanda kurir, hingga rumah. Ilustrasi peta area juga menampilkan blok jalan dan taman agar radius layanan punya konteks. Radius dan pin bergerak lembut; section muncul saat masuk viewport; mockup hero dan peta area bergeser sedikit mengikuti scroll. Semua animasi dekoratif mengikuti `prefers-reduced-motion`, dan konten tetap terlihat tanpa JavaScript. Peta tidak merepresentasikan jalan atau wilayah layanan sebenarnya.

## Banner penutup

Versi sebelumnya mengulang foto nasi goreng dari section tepat di atasnya, memotongnya sebagai setengah lingkaran tanpa konteks, dan memberi pelanggan serta merchant dua tombol setara. Banner baru memakai panel oranye berisi satu ajakan pelanggan dan tombol `Cari makanan`, dengan foto lontong lokal memenuhi panel kanan. Jalur merchant diberi pertanyaan pemilah serta tautan sekunder setelah garis pemisah. Pada ponsel, foto berada di bawah copy; teks dan tombol tidak bertabrakan dengan gambar.

## Frame preview aplikasi

Setiap rute `/app/*` sekarang dibungkus simulator perangkat saat dibuka pada layar lebih dari 700px. Simulator memberi bezel, speaker, tombol samping, layar aplikasi 430px, dan elevasi sederhana agar preview terbaca sebagai aplikasi ponsel. Tinggi simulator mengikuti viewport dan layar di dalamnya menggulir sendiri sehingga bilah fixed tidak keluar dari bezel. Ini pengecualian scroll khusus preview desktop. Di perangkat ponsel simulator menghilang sepenuhnya dan dokumen kembali menjadi satu-satunya penggulung vertikal.
