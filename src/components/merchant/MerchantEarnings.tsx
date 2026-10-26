import { invoiceShareText, merchantInvoice } from '../../data/invoice'
import type { MerchantOrder } from '../../types'
import { OrderPriceBreakdown } from '../ui/OrderPriceBreakdown'

interface MerchantEarningsProps {
  order: MerchantOrder
}

/**
 * Invoice bersih milik merchant: yang benar-benar masuk ke toko. Ongkir dan
 * biaya layanan customer bukan pendapatan toko (§16.4), jadi dasarnya subtotal
 * item.
 *
 * Dipisah dari halaman supaya detail order merchant tidak menumpuk baris JSX
 * dan batas 700 baris halaman tetap terjaga.
 */
export function MerchantEarnings({ order }: MerchantEarningsProps) {
  const cancelled = order.status === 'batal'
  const isCod = order.paymentMethod === 'cod'
  const invoice = merchantInvoice(order.items, { paymentMethod: order.paymentMethod })
  const rows = cancelled ? [] : invoice.rows
  const total = {
    label: cancelled ? 'Tidak ada pendapatan' : 'Bersih untuk toko',
    amountIdr: cancelled ? 0 : invoice.netIdr,
  }
  const footnote = isCod
    ? 'Order COD tunai: tidak ada potongan platform merchant (§16.5). Biaya layanan customer menjadi hak toko (§17); ongkir tunai diteruskan ke kurir.'
    : 'Ongkir disalurkan ke kurir dan biaya layanan ke aplikator. Fee memakai tarif platform berlaku; BE belum menyimpan potongan per order.'

  return (
    <OrderPriceBreakdown
      title={`Rincian pendapatan #${order.code}`}
      rows={rows}
      total={total}
      footnote={footnote}
      share={{
        title: `Rincian pendapatan #${order.code}`,
        text: invoiceShareText(`Rincian pendapatan #${order.code}`, rows, total),
      }}
    />
  )
}
