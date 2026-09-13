import { DocSection } from '../DocSection'

export function PwaSection() {
  return (
    <DocSection id="pwa" num="08" title="PWA Setup">
      <p className="doc-p">
        Halaman promosi berada di <code>/</code>; pengalaman aplikasi terpasang berada di
        <code> /app/*</code>. Manifest membuka <code>/app/home</code> dalam mode
        <code> standalone</code>. Tautan lama seperti <code>/home</code> dan
        <code> /merchant/menu</code> dialihkan ke alamat aplikasi agar tidak jatuh
        ke halaman promosi.
      </p>
      <p className="doc-p">
        Layar pembuka ringan di <code>index.html</code> muncul hanya untuk jalur aplikasi
        sampai React siap, lalu dihapus oleh <code>AppRouter</code>. Ikon instalasi,
        favicon, dan layar pembuka memakai tanda Sa7tein yang sama dari
        <code> public/icons/sa7tein-mark.svg</code>. Jangan menambahkan jeda buatan
        atau spinner untuk navigasi antarhalaman yang langsung tersedia.
      </p>
      <p className="doc-p">
        Scroll vertikal dimiliki dokumen, memakai momentum dan perilaku tepi
        bawaan perangkat. Bottom navigation tetap berada dalam shell 430px;
        konten memiliki ruang di bawahnya. Uji scroll dengan gestur pada
        <code> /app/home</code> dan <code>/app/merchant/menu</code>, bukan hanya
        melihat tinggi halaman.
      </p>
      <p className="doc-p">
        Tombol Pasang di onboarding memakai prompt browser saat tersedia; bila
        browser tidak menyediakannya, pengguna mendapat petunjuk memasang dari
        menu Bagikan. Service worker dibuat oleh <code>vite-plugin-pwa</code> saat
        build dan tidak aktif pada dev server. Uji instalasi dan offline pada
        hasil <code>npm run build</code> lalu <code>npm run preview</code>.
      </p>
      <p className="doc-p">
        Worker lama pernah menguasai seluruh origin dan dapat menampilkan
        landing usang dari cache. Worker baru hanya ber-scope <code>/app/</code>;
        saat build baru dibuka, registrasi worker root lama dilepas lalu halaman
        dimuat ulang sekali. Website promosi tidak lagi dikendalikan worker PWA.
      </p>
    </DocSection>
  )
}
