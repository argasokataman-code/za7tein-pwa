import { DocSection } from '../DocSection'

/**
 * Aset gambar dan lisensi pihak ketiga yang ikut dikirim ke browser.
 * Ditulis 2026-10-25 setelah aset bawaan template diganti aset yang dibuat
 * sendiri, supaya tidak ada lagi biner tanpa asal-usul yang jelas di
 * `public/assets/`.
 */
export function AssetsLicensingSection() {
  return (
    <DocSection id="assets-licensing" num="38" title="Aset & Lisensi">
      <p className="doc-p">
        Semua gambar di <code className="doc-inline">public/assets/img/</code> dan{' '}
        <code className="doc-inline">public/assets/media/</code> sekarang dibuat di dalam repo, bukan
        diambil dari paket desain mana pun. Avatar reviewer, avatar profil, latar onboarding, dan
        thumbnail detail menu dihasilkan lokal: avatar berupa siluet duotone abstrak 52px, latar
        onboarding berupa gradien navy dengan motif piring, dan thumbnail menu dipotong dari foto
        menu milik repo sendiri (<code className="doc-inline">img/menu/nasi-goreng.webp</code>).
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Berkas</th>
              <th>Isi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code className="doc-inline">img/reviewer/user1..6.png</code>,{' '}
                <code className="doc-inline">img/profile.png</code>
              </td>
              <td>Siluet abstrak 52x52, enam varian warna peran, tanpa wajah dan tanpa data orang</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">media/onboarding-bg.196fa385.jpg</code>
              </td>
              <td>375x812, gradien navy + glow oranye, 16 KB (sebelumnya 427 KB)</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">img/menu-details/menu-details-thumb.png</code>
              </td>
              <td>375x407, potongan foto menu repo, dioptimalkan ke 128 KB</td>
            </tr>
            <tr>
              <td>
                <code className="doc-inline">fonts/OFL.txt</code>
              </td>
              <td>
                Teks SIL Open Font License 1.1 untuk Inter, Manrope, dan Plus Jakarta Sans. Wajib
                ikut saat font di-<em>self-host</em>, dan tidak boleh dihapus saat aset lain diganti
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Ikon fungsional tetap memakai <code className="doc-inline">lucide-react</code> dan tidak
        memakai berkas PNG. <code className="doc-inline">PaymentAccount</code> sekarang memakai{' '}
        <code className="doc-inline">Smartphone</code>, <code className="doc-inline">Wallet</code>,
        dan <code className="doc-inline">Globe</code> menggantikan tiga ikon PNG. Logo jaringan
        pembayaran (<code className="doc-inline">img/card/visa.png</code>,{' '}
        <code className="doc-inline">mastercard.png</code>) tetap dipakai sebagai penanda merek
        metode pembayaran, bukan sebagai ornamen desain.
      </p>
      <p className="doc-p">
        Saat mengganti aset, jaga nama berkas dan ukuran pikselnya supaya tidak perlu menyentuh
        komponen: avatar 52x52, thumbnail menu 375x407, latar onboarding 375x812. Setelah mengganti,
        jalankan <code className="doc-inline">npm run build</code> dan periksa jumlah entri precache
        service worker agar berkas lama tidak tertinggal di cache.
      </p>
    </DocSection>
  )
}
