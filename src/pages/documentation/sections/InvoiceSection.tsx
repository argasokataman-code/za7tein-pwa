import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

/**
 * Invoice dua sisi: tagihan customer setelah bayar dan rincian pendapatan
 * merchant. Bagian ini menjelaskan asal angkanya (snapshot checkout vs tarif
 * platform) supaya tidak ada layar yang menghitung ulang sendiri.
 */
export function InvoiceSection() {
  return (
    <DocSection id="invoice" num="40" title="Invoice & Rincian Pendapatan">
      <p className="doc-p">
        Satu komponen, <code className="doc-inline">OrderPriceBreakdown</code>, dipakai dua sisi
        transaksi: layar pesanan customer (setelah bayar) dan detail order merchant. Baris
        memakai rel kanan lebar tetap dengan angka{' '}
        <code className="doc-inline">tabular-nums</code> (MD-07/MD-11). Aksi bawah kartu adalah{' '}
        <em>Bagikan rincian</em>: di ponsel bukti transaksi dikirim ke chat atau disimpan, bukan
        dicetak, jadi <code className="doc-inline">navigator.share</code> dipakai lebih dulu dan
        clipboard jadi cadangan saat peramban tidak punya share sheet.
      </p>

      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Sisi</th>
              <th>Sumber angka</th>
              <th>Isi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Customer (setelah bayar)</td>
              <td>
                Snapshot checkout <code className="doc-inline">cart.lastReceipt</code>
              </td>
              <td>Subtotal, ongkir, biaya layanan, Ft QRIS (bila ada), diskon, total dibayar</td>
            </tr>
            <tr>
              <td>Merchant</td>
              <td>
                Subtotal item + <code className="doc-inline">PLATFORM_FEE_MERCHANT_DEFAULT_JOD</code>
              </td>
              <td>Subtotal menu, potongan fee platform, <strong>bersih untuk toko</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCode lang="typescript">
        {`customerInvoiceRows(charged)   // → baris tagihan customer (snapshot saat checkout)
merchantInvoice(order.items)   // → { subtotalIdr, rows, netIdr }
invoiceShareText(title, rows, total)  // → teks untuk share sheet / clipboard
// netIdr = subtotal − jodToIdr(Pm); ongkir & Pc bukan pendapatan toko (§16.4)`}
      </DocCode>

      <h3 className="doc-h3">Kenapa snapshot, bukan hitung ulang</h3>
      <p className="doc-p">
        Tabel <code className="doc-inline">orders</code> di BE hanya menyimpan total. Kalau invoice
        setelah bayar dihitung ulang dari total, pecahan ongkir/fee-nya hasil karangan. Karena itu
        rincian diambil sekali saat checkout, disimpan di slice{' '}
        <code className="doc-inline">cart</code> (ikut persist), lalu hanya ditampilkan untuk order
        yang kodenya cocok. Order lama tidak menampilkan invoice sama sekali — ketiadaan yang jujur
        lebih baik daripada angka palsu.
      </p>

      <h3 className="doc-h3">Batas yang diketahui</h3>
      <ul className="doc-list">
        <li>
          <strong>BE belum punya kolom pecahan biaya.</strong> Saat BE menambah{' '}
          <code className="doc-inline">subtotal</code>, <code className="doc-inline">delivery_fee</code>,{' '}
          <code className="doc-inline">platform_fee</code>, dan{' '}
          <code className="doc-inline">discount</code> di <code className="doc-inline">orders</code>,
          snapshot bisa diganti pembacaan server dan invoice berlaku untuk semua riwayat.
        </li>
        <li>
          <strong>Fee merchant memakai tarif default.</strong> Potongan per order belum difinalkan
          BE, dan kuota order/COD (yang menihilkan <code className="doc-inline">Pm</code>) tidak
          tersimpan di order — jadi angkanya adalah tarif platform yang berlaku, bukan potongan
          final.
        </li>
        <li>
          <strong>Invoice hanya di dua permukaan.</strong> Riwayat pesanan lama dan ledger wallet
          tetap agregat; tidak ada invoice per baris di sana.
        </li>
      </ul>

      <p className="doc-p">
        Catatan keputusan: <code className="doc-inline">decision-invoice-surfaces.md</code>. Invoice
        bukan requirement PRD aktif (yang ada hanya struktur fee C-05), jadi ini tambahan permukaan
        UI yang dicatat, bukan perilaku bisnis baru.
      </p>
    </DocSection>
  )
}
