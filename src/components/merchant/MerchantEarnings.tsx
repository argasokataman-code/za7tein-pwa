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
  // Order lama di BE bisa punya `total_jod` tanpa satu baris `order_items`.
  // `merchantInvoice([])` lalu menghasilkan subtotal 0,00 dan "Bersih 0,00",
  // padahal total pesanannya bukan nol: angka itu salah, bukan kosong. Lebih
  // jujur menyebut rinciannya tidak tersedia daripada menampilkan nol.
  if (!cancelled && order.items.length === 0) {
    return (
      <p className="merchant-card-sub">
        Rincian pendapatan tidak tersedia untuk pesanan ini.
      </p>
    )
  }
  const invoice = merchantInvoice(order.items, { paymentMethod: order.paymentMethod })
  const rows = cancelled ? [] : invoice.rows
  const total = {
    label: cancelled ? 'Tidak ada pendapatan' : 'Bersih untuk toko',
    amountIdr: cancelled ? 0 : invoice.netIdr,
  }
  // Catatan developer (§16.5, §17): order COD tunai tidak kena potongan platform
  // merchant; biaya layanan customer jadi hak toko dan ongkir tunai diteruskan ke
  // kurir. Untuk order non-COD, BE belum menyimpan potongan per order. Dipindah dari
  // UI 2026-10-31.
  const footnote = isCod
    ? 'Order COD tunai: tidak ada potongan platform merchant. Biaya layanan customer menjadi hak toko; ongkir tunai diteruskan ke kurir.'
    : 'Ongkir disalurkan ke kurir dan biaya layanan ke aplikator, memakai tarif platform yang berlaku.'

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
