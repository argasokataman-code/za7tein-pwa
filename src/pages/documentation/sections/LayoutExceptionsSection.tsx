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
        Panel ops di <code>/ops</code> memakai <strong>satu shell desktop</strong>: rail
        sidebar 248px + area konten maksimal 1180px, pola yang sama dengan konsol Super
        Admin. Ini pengecualian lebar kedua yang didokumentasikan di sini setelah landing{' '}
        <code>/</code>, dan alasannya setara: pekerjaan backoffice yang berat tabel
        (antrean sengketa, ledger, master tenant) lebih terbaca di layar lebar.
        Keputusan PO 2026-10-24 menjadikan ops backoffice kanonik; panel CS{' '}
        <code>/admin</code> yang dulu memakai kolom 430px sudah dipensiunkan dan URL-nya
        dialihkan. Ops <strong>bukan PWA</strong> — tidak ada manifest, tidak ada bottom
        nav. Super Admin (<code>/superadmin</code>) tetap role terpisah, website penuh
        non-PWA, dan memakai shell yang sama.
      </p>
    </DocSection>
  )
}
