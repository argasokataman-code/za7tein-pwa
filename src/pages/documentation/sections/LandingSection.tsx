import { DocSection } from '../DocSection'

export function LandingSection() {
  return (
    <DocSection id="landing" num="15" title="Landing Page">
      <p className="doc-p">
        <code>/</code> adalah landing full-width yang mengikuti sampel visual
        pengguna: hero oranye dengan pratinjau aplikasi, tiket merchant, dan peta
        kurir yang bertumpuk. Halaman ini tetap
        menunjukkan data contoh; jangan menampilkan angka transaksi atau
        testimoni yang belum ada sumbernya.
      </p>
      <p className="doc-p">
        Struktur: hero dengan tiga nilai singkat, Journey Line empat langkah,
        pengalaman pelanggan, jangkauan Hijazi/Syimali, lalu section terpisah
        untuk merchant, kurir, dan rasa lokal sebelum CTA akhir. Setiap section
        punya satu pesan dan satu fokus visual, dengan ruang yang cukup untuk
        dibaca. Pada lebar 700px susunannya menjadi vertikal. Ikon
        fungsional memakai Lucide 1.75. Frame produk berisi contoh UI Sa7tein,
        bukan gambar latar statis agar tetap responsif.
      </p>
      <p className="doc-p">
        Peta kurir di hero dan layar pesanan memakai ilustrasi rute jalan yang
        sama: toko, kurir, tujuan, dan jalur yang mengikuti persimpangan.
        Area layanan memakai ilustrasi jalan tersendiri dengan radius dan
        penanda yang bergerak. Section muncul ringan saat digulir, mockup
        bergeser sedikit mengikuti scroll, dan seluruh gerak dekoratif
        berhenti saat preferensi reduced motion aktif. Ilustrasi peta adalah
        contoh visual, bukan data navigasi atau batas layanan sebenarnya.
      </p>
      <p className="doc-p">
        Banner penutup memakai dua panel: ajakan pelanggan di atas warna merek
        dan foto makanan lokal sebagai latar visual di sisi lain. Hanya satu
        tombol primer, <strong>Cari makanan</strong>; jalur merchant diletakkan
        setelah pemisah dengan pertanyaan yang menjelaskan untuk siapa tautan
        itu. Pada ponsel foto turun ke bawah copy.
      </p>
      <p className="doc-p">
        Implementasi ada di <code>src/pages/Landing.tsx</code> dan
        <code> src/styles/system/_landing-refresh.scss</code>. Brief pelengkap
        berada di <code>docs/product/prd/versions/landing-page-2026-09-13/</code>;
        konflik aturan bisnis tetap mengikuti PRD Irbid aktif. CSS lama dan
        dekorasi yang tidak dipakai telah dihapus agar pola lama tidak disalin.
      </p>
    </DocSection>
  )
}
