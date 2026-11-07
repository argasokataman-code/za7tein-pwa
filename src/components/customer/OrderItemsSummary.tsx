import type { CustomerOrderDetail } from '../../api/orders'
import { orderStampLabel } from './orderStatus'
import { useMoney } from '../../hooks/useMoney'

interface OrderItemsSummaryProps {
  detail: CustomerOrderDetail
}

/**
 * Rincian item + total order di layar journey.
 *
 * Sumbernya `order_items` + `orders` (bukan snapshot checkout), jadi angkanya
 * sama dengan yang dilihat merchant/kurir. Order lama tanpa baris item hanya
 * menampilkan total, bukan daftar kosong yang menyesatkan.
 */
export function OrderItemsSummary({ detail }: OrderItemsSummaryProps) {
  const { money } = useMoney()
  if (detail.items.length === 0 && detail.totalIdr === 0) return null

  return (
    <section className="track-section">
      <h2 className="track-section-title">Rincian pesanan</h2>
      <div className="track-items">
        {detail.items.map((item) => (
          <div className="track-item" key={item.id}>
            <span className="track-item-name">
              {item.qty}× {item.name}
            </span>
            <span className="track-item-price">{money(item.lineTotalIdr)}</span>
          </div>
        ))}
        <div className="track-item track-item--total">
          <span className="track-item-name">Total dibayar</span>
          <span className="track-item-price">{money(detail.totalIdr)}</span>
        </div>
      </div>
      <p className="track-row-meta">
        {detail.paymentMethod === 'cod'
          ? 'Bayar tunai saat pesanan diterima'
          : detail.paymentMethod
            ? 'Dibayar online'
            : 'Metode pembayaran belum tercatat'}
        {' · '}
        dibuat {orderStampLabel(detail.createdAt)}
      </p>
    </section>
  )
}
