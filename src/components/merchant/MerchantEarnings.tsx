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
  // Order lama di BE bisa punya total order tanpa satu baris `order_items`.
  // `merchantInvoice([])` lalu menghasilkan subtotal 0,00 dan "Bersih 0,00",
  // padahal total pesanannya bukan nol: angka itu salah. Kalau kolom
  // `sub_total_jod` ada, pakai itu sebagai dasar; kalau tidak, jangan mengarang
  // angka sama sekali.
  if (!cancelled && order.items.length === 0 && order.subTotalIdr == null) {
    return (
      <p className="merchant-card-sub">
        Rincian pendapatan tidak tersedia untuk pesanan ini.
      </p>
    )
  }
  const feeMerchantIdr = order.platformFeeMerchantIdr ?? 0
  const orderLevelRows =
    order.items.length === 0
      ? [
          { label: 'Subtotal pesanan', amountIdr: order.subTotalIdr ?? 0 },
          ...(feeMerchantIdr > 0
            ? [
                {
                  label: 'Biaya platform merchant',
                  amountIdr: feeMerchantIdr,
                  kind: 'discount' as const,
                },
              ]
            : []),
        ]
      : null
  const invoice = merchantInvoice(order.items, { paymentMethod: order.paymentMethod })
  const rows = cancelled ? [] : (orderLevelRows ?? invoice.rows)
  const total = {
    label: cancelled ? 'Tidak ada pendapatan' : 'Bersih untuk toko',
    amountIdr: cancelled
      ? 0
      : orderLevelRows
        ? Math.max(0, (order.subTotalIdr ?? 0) - feeMerchantIdr)
        : invoice.netIdr,
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
