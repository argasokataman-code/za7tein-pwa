import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function TaxSection() {
  return (
    <DocSection id="tax" num="28" title="Pajak Dua Lapis (Info-only)">
      <p className="doc-p">
        Checkout menampilkan dua baris pajak (milestone M7, flow{' '}
        <code className="doc-inline">F4</code>) di bawah Biaya Layanan. Keduanya{' '}
        <strong>info-only</strong>: tidak menambah <em>Total Bayar</em>, karena siapa yang menyetor
        dan berapa tarifnya belum final.
      </p>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Baris</th>
              <th>Objek</th>
              <th>Penanggung</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                GST makanan (<code className="doc-inline">GST_FOOD_PERCENT</code>)
              </td>
              <td>Penjualan makanan</td>
              <td>Merchant menyetor</td>
            </tr>
            <tr>
              <td>
                GST fee platform (<code className="doc-inline">PLATFORM_GST_PERCENT</code>)
              </td>
              <td>Fee platform 0,37 JOD per order</td>
              <td>Kewajiban platform</td>
            </tr>
          </tbody>
        </table>
      </div>
      <DocCode lang="typescript">
        {`gstFoodIdr(subtotal)   // 16% × subtotal   → baris "merchant setor"
platformGstIdr()       // 16% × 0,37 JOD    → baris "kewajiban platform"
// keduanya tanpa efek ke Total Bayar`}
      </DocCode>
      <h3 className="doc-h3">Kenapa ditampilkan kalau belum final</h3>
      <p className="doc-p">
        Struktur dua lapisnya sudah pasti (satu lapis di penjualan merchant, satu lapis di fee
        platform), jadi bentuknya perlu terlihat sejak MVP. Yang belum pasti adalah angkanya:
        tarif GST makanan, PPN ekspor jasa, dan status PKP masih terbuka di{' '}
        <code className="doc-inline">OQ-2/3/4</code>, sedangkan kewajiban pajak platform menunggu{' '}
        <code className="doc-inline">OQ-17/18</code> dan sign-off konsultan pajak.
      </p>
      <p className="doc-p">
        Karena itu tarif 16% hanya dipakai untuk menampilkan bentuk barisnya, ditandai{' '}
        <em>&ldquo;belum final&rdquo;</em> di bawah ringkasan, dan tidak dipakai menghitung setoran.
        Kalau tarifnya berubah, ubah di <code className="doc-inline">data/merchant.ts</code> saja —
        tidak ada angka pajak yang disalin ke komponen.
      </p>
    </DocSection>
  )
}
