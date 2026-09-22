import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function LayoutExceptionsSection() {
  return (
    <DocSection id="layout-exceptions" num="14" title="Layout Exceptions">
      <p className="doc-p">
        Layar tiap peran (<code>/customer/*</code>, <code>/merchant/*</code>,{' '}
        <code>/courier/*</code>, <code>/admin/*</code>) tetap memakai shell maksimal 430px.
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
        Dashboard Super Admin sengaja tetap memakai shell 430px seperti role lain
        pada tahap PWA ini. Arah ke depan sudah dicatat: Super Admin akan menjadi
        <strong> website penuh non-PWA</strong> (lebar desktop, bukan kolom ponsel)
        — belum dikerjakan. Saat itu dibangun, pengecualian lebarnya wajib
        didokumentasikan di sini seperti pengecualian landing di atas, bukan
        bocor diam-diam.
      </p>
    </DocSection>
  )
}
