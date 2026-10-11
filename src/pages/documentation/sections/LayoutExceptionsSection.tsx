import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function LayoutExceptionsSection() {
  return (
    <DocSection id="layout-exceptions" num="14" title="Layout Exceptions">
      <p className="doc-p">
        Layar tiap peran (<code>/customer/*</code>, <code>/merchant/*</code>,{' '}
        <code>/courier/*</code>) tetap memakai shell maksimal 430px.
        Saat dibuka pada lebar layar desktop, shell ini berada dalam simulator
        perangkat 462px agar seluruh preview aplikasi terbaca sebagai pengalaman
        ponsel. Simulator memiliki satu penggulung internal untuk meniru layar
        perangkat dan membuat elemen fixed—termasuk bottom navigation—tetap
        berada di tepi bawah bezel, bukan di tengah halaman preview. Simulator
        sendiri dipasang tetap pada viewport desktop; halaman browser di luar
        perangkat tidak ikut bergulir.
        Pada lebar 700px ke bawah simulator otomatis hilang dan aplikasi memakai
        layar perangkat secara penuh.
        Website promosi di <code>/</code> sengaja full-width; pengecualian ini
        hanya berlaku ketika root <code>.sa-landing</code> terpasang.
      </p>
      <DocCode lang="scss">
        {`#root:has(.sa-landing),
div.sa-landing {
  width: 100%;
  max-width: none;
  margin: 0;
}`}
      </DocCode>
      <p className="doc-p">
        Aturan porting lama memberi <code>body &gt; div</code> lebar maksimal
        430px. Selektor di atas mengangkat batas untuk website saja. Konten
        tetap berada dalam wadah maksimal 1180px dengan gutter 20px. Pada
        360–430px, seluruh bagian disusun ulang secara vertikal.
      </p>
      <p className="doc-p">
        Panel admin (CS) di <code>/admin</code> <strong>memakai dua shell</strong>. Di
        ponsel ia tetap 430px seperti role lain — CS memakainya saat berkeliling. Dari lebar{' '}
        <strong>901px</strong> ke atas (keputusan PO 2026-10-11) ia beralih ke layout
        desktop: rail sidebar 248px + area konten selebar jendela, mengikuti pola konsol
        Super Admin. Ini pengecualian lebar kedua yang didokumentasikan di sini setelah
        landing <code>/</code>, dan alasannya setara: pekerjaan CS yang berat tabel
        (antrean sengketa, ledger, master tenant) lebih terbaca di layar lebar, sementara
        perangkatnya sendiri sering laptop. Satu pohon komponen melayani keduanya —
        sidebar disembunyikan di bawah 901px, bottom nav disembunyikan di 901px ke atas.
        Yang masih <strong>belum</strong> dibangun adalah <strong>Super Admin</strong>{' '}
        sendiri: role terpisah, website penuh non-PWA (<code>/superadmin</code>) untuk
        owner/team (keputusan PO 2026-09-23) yang mengontrol penuh platform termasuk pajak
        dan dashboard. Prefix disiapkan, cakupan detailnya masih UNRESOLVED.
      </p>
    </DocSection>
  )
}
