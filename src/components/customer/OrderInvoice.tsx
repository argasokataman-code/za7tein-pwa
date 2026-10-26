import { useAppSelector } from '../../hooks/useAppStore'
import { useMoney } from '../../hooks/useMoney'
import { invoiceShareText } from '../../data/invoice'
import { OrderPriceBreakdown } from '../ui/OrderPriceBreakdown'

interface OrderInvoiceProps {
  orderCode: string
}

/**
 * Invoice order customer setelah bayar.
 *
 * Sumbernya snapshot checkout (`cart.lastReceipt`): `orders` BE hanya menyimpan
 * total, jadi pecahan biaya tidak bisa direkonstruksi setelah reload.
 * Order lama (tak punya snapshot) tidak menampilkan invoice sama sekali —
 * lebih jujur daripada mengarang baris.
 */
export function OrderInvoice({ orderCode }: OrderInvoiceProps) {
  const { moneyPlain } = useMoney()
  const receipt = useAppSelector((s) => s.cart.lastReceipt)
  if (!receipt || receipt.code !== orderCode) return null
  const cashNote =
    receipt.cashIdr && receipt.cashIdr > receipt.totalIdr
      ? ` Tunai: siapkan ${moneyPlain(receipt.cashIdr)}, kembalian ${moneyPlain(receipt.cashIdr - receipt.totalIdr)}.`
      : ''

  return (
    <section className="track-section">
      <h2 className="track-section-title">Invoice</h2>
      <OrderPriceBreakdown
        title={`Tagihan #${receipt.code}`}
        rows={receipt.rows}
        total={{ label: `Total dibayar (${receipt.methodLabel})`, amountIdr: receipt.totalIdr }}
        footnote={`Rincian dari checkout. Pajak tidak menambah total (GST disetor terpisah).${cashNote}`}
        share={{
          title: `Invoice #${receipt.code}`,
          text:
            invoiceShareText(`Invoice #${receipt.code}`, receipt.rows, {
              label: `Total dibayar (${receipt.methodLabel})`,
              amountIdr: receipt.totalIdr,
            }) + cashNote,
        }}
      />
    </section>
  )
}
