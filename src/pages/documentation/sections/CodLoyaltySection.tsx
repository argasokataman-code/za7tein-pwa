import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

/**
 * COD tunai (uang disiapkan, kembalian) dan label loyalitas customer.
 * Dua-duanya permukaan baru: PRD aktif hanya menetapkan COD sebagai tunai
 * offline (§16.5), tanpa rincian kembalian maupun definisi pelanggan setia.
 */
export function CodLoyaltySection() {
  return (
    <DocSection id="cod-loyalty" num="41" title="COD Tunai & Pelanggan Setia">
      <p className="doc-p">
        COD bukan lagi hold saldo: customer membayar tunai saat serah terima. Karena uang tunai
        punya pecahan, dua angka harus selalu terlihat bersama, yaitu <strong>tagihan</strong> dan{' '}
        <strong>kembalian</strong>. Satu modul,{' '}
        <code className="doc-inline">data/codCash.ts</code>, menghitung keduanya supaya customer dan
        kurir tidak memakai pembulatan berbeda.
      </p>

      <h3 className="doc-h3">Alur uang tunai</h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Layar</th>
              <th>Yang terlihat</th>
              <th>Sumber angka</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ringkasan bayar (customer)</td>
              <td>Chip uang pas / nominal bulat, hint siapkan uang, kembalian</td>
              <td>
                <code className="doc-inline">codCashOptions(total)</code>
              </td>
            </tr>
            <tr>
              <td>Layar pesanan (customer)</td>
              <td>Tagihan tunai, uang disiapkan, kembalian</td>
              <td>
                <code className="doc-inline">cart.codCashIdr</code> + snapshot invoice
              </td>
            </tr>
            <tr>
              <td>Detail tugas (kurir)</td>
              <td>Chip nominal, input uang diterima, kembalian, tombol OTP terkunci bila kurang</td>
              <td>
                <code className="doc-inline">codChangeIdr(total, received)</code>
              </td>
            </tr>
            <tr>
              <td>Detail order (merchant)</td>
              <td>Label "COD tunai · ditagih kurir" + nominal</td>
              <td>
                <code className="doc-inline">order.total</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCode lang="typescript">
        {`codCashOptions(totalIdr)          // uang pas, bulat 1 JOD, bulat 5 JOD
codChangeIdr(totalIdr, receivedIdr) // max(0, selisih) — tidak pernah negatif
codCashHint(totalIdr, receivedIdr)  // "Siapkan uang pas" / "Kembalian ..."`}
      </DocCode>

      <p className="doc-p">
        Pembulatan memakai JOD karena itu mata uang tunai di tempat; nominal internal tetap IDR.
        Chip yang nominalnya sama dengan tagihan tidak diulang. Hold saldo lama masih ada di slice
        untuk sesi tersimpan, tetapi checkout COD tidak lagi membuat hold baru.
      </p>

      <p className="doc-p">
        Metode bayar hanya menentukan cara membayar <strong>nominal order</strong>. Biaya layanan
        dan ongkir tetap dihitung di checkout dan gate top-up akun tetap berlaku untuk semua metode
        — COD tidak menghapus kewajiban top-up minimum.
      </p>
      <p className="doc-p">
        Dua hal mengikuti §16.5/§17: opsi COD hanya terbuka bila merchant punya sisa kuota order
        COD (dijaga di <code className="doc-inline">PaymentSelection</code> dan sekali lagi di{' '}
        <code className="doc-inline">PaymentAmount</code>), dan invoice merchant untuk order COD
        tidak memotong <code className="doc-inline">Pm</code> — net = subtotal item.
      </p>

      <h3 className="doc-h3">Label Pelanggan Setia</h3>
      <p className="doc-p">
        Ambang loyalitas di <code className="doc-inline">LOYAL_ORDER_MIN</code> (
        <code className="doc-inline">data/people.ts</code>): customer dengan{' '}
        <code className="doc-inline">lifetimeOrders</code> di atas ambang mendapat label. Satu
        komponen <code className="doc-inline">LoyalBadge</code> dipakai di dua tempat: profil
        customer dan detail order merchant (supaya merchant tahu ini pelanggan langganan).
      </p>
      <p className="doc-p">
        Jumlah order aktif tidak dipakai sebagai dasar: isinya hanya pesanan berjalan. BE belum
        punya kolom agregat, jadi <code className="doc-inline">lifetimeOrders</code> masih mock dan
        dicatat sebagai <code className="doc-inline">UNRESOLVED</code> di{' '}
        <code className="doc-inline">decision-cod-cash-loyalty.md</code>.
      </p>
    </DocSection>
  )
}
