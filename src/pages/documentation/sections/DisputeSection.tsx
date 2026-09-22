import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function DisputeSection() {
  return (
    <DocSection id="dispute" num="27" title="Sengketa & Pembekuan Hold">
      <p className="doc-p">
        Sengketa (milestone M6, flow <code className="doc-inline">F8</code>) punya dua sisi:{' '}
        <strong>pengajuan</strong> dari detail order (customer dan merchant memakai form yang
        sama, <code className="doc-inline">/dispute</code>) dan{' '}
        <strong>putusan</strong> di panel CS (<code className="doc-inline">/admin/disputes</code>
        ). Aktornya panel CS — konsol <code className="doc-inline">/admin</code> adalah panel admin
        platform (keputusan PO 2026-09-23), bukan konsol Super Admin terpisah.
      </p>
      <h3 className="doc-h3">Satu sumber, bukan dua salinan</h3>
      <p className="doc-p">
        Sengketa hidup di <code className="doc-inline">admin.disputes</code> dan dibaca oleh kedua
        sisi. Detail order menampilkan statusnya dengan mencari <code className="doc-inline">orderCode</code>{' '}
        yang sama, jadi tidak ada salinan status di cart yang bisa berbeda dari yang diputuskan CS.
        Aturan <strong>1× per order</strong> pun dicek dari queue yang sama — form kedua untuk order
        yang sudah disengketakan langsung mengunci tombolnya.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Resolusi</th>
              <th>Efek</th>
              <th>Status order</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Refund penuh</td>
              <td>100% ke customer, fee customer ikut kembali</td>
              <td>
                <code className="doc-inline">resolved_refund_full</code>
              </td>
            </tr>
            <tr>
              <td>Refund sebagian</td>
              <td>X% ke customer (slider, belum final), sisanya ke merchant</td>
              <td>
                <code className="doc-inline">resolved_refund_partial</code>
              </td>
            </tr>
            <tr>
              <td>Release ke merchant</td>
              <td>Fee merchant tetap dipotong</td>
              <td>
                <code className="doc-inline">resolved_released</code>
              </td>
            </tr>
            <tr>
              <td>Tolak</td>
              <td>Tanpa ubah saldo</td>
              <td>
                <code className="doc-inline">resolved_rejected</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="doc-p">
        Tiap putusan yang mengubah saldo menambah <strong>satu entry ledger append-only</strong>;
        penolakan tidak menambah, karena tidak ada uang yang berpindah. Token{' '}
        <code className="doc-inline">resolved_*</code>-nya dibentuk fungsi{' '}
        <code className="doc-inline">resolvedOrderToken</code> supaya sisi order dan sisi CS tidak
        menulis status dengan ejaan berbeda.
      </p>
      <h3 className="doc-h3">Hold dibekukan, auto-settle dijeda</h3>
      <p className="doc-p">
        Selama order <code className="doc-inline">disputed</code>, hold COD tidak bisa dilanjutkan
        ke <code className="doc-inline">cut</code> atau dibatalkan dari detail order, dan
        auto-settle yang tadinya aktif diganti catatan{' '}
        <em>&ldquo;Auto-settle dijeda — order sedang disputed&rdquo;</em>. Ini melengkapi janji F5:
        order tidak menggantung <strong>tanpa</strong> keputusan, bukan berarti menggantung tanpa
        batas.
      </p>
      <DocCode lang="typescript">
        {`fileDispute({ orderCode, filedBy, category, reason, photoCount, amount })
  // → dispute status "open"; guard 1× per order dicek di form

resolveDispute({ id, resolution, percent })
  // → status resolved/rejected + 1 entry ledger (kecuali no_action)`}
      </DocCode>
      <p className="doc-p">
        Window pengajuan 24 jam dihitung dari <code className="doc-inline">orderCompletedAt</code>{' '}
        (diset saat checkpoint pengiriman selesai). Di luar window, tombolnya berubah jadi{' '}
        <em>&ldquo;Window lewat&rdquo;</em> dan mati. Kategori dan angka window masih sementara —
        <code className="doc-inline">OQ-29</code> belum menutup daftar finalnya.
      </p>
    </DocSection>
  )
}
