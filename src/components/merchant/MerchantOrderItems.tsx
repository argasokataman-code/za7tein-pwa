import type { MerchantOrder } from '../../types'

interface MerchantOrderItemsProps {
  order: MerchantOrder
  money: (value: number) => string
}

/**
 * Rincian harga order di detail merchant.
 *
 * Sumber utamanya `order_items` (baris menu). Order lama di BE bisa punya
 * `sub_total_jod`/`total_jod` tanpa satu pun baris `order_items`; daftar kosong
 * akan terbaca sebagai "pesanan tanpa menu", padahal uangnya ada. Untuk kasus
 * itu ditampilkan rincian tingkat order dari kolom BE apa adanya, ditambah
 * catatan bahwa baris menunya memang tidak tersimpan (tidak dikarang).
 */
export function MerchantOrderItems({ order, money }: MerchantOrderItemsProps) {
  if (order.items.length > 0) {
    return (
      <ul className="merchant-order-items">
        {order.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.quantity}× {item.name}
            </span>
            <span>{money(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
    )
  }

  const hasOrderTotals =
    order.subTotalIdr != null || order.deliveryFeeIdr != null || order.platformFeeIdr != null
  if (!hasOrderTotals) {
    return <p className="merchant-card-sub">Rincian pesanan ini tidak tersimpan di BE.</p>
  }

  return (
    <>
      <ul className="merchant-order-items">
        {order.subTotalIdr != null ? (
          <li>
            <span>Subtotal pesanan</span>
            <span>{money(order.subTotalIdr)}</span>
          </li>
        ) : null}
        {(order.deliveryFeeIdr ?? 0) > 0 ? (
          <li>
            <span>Ongkir</span>
            <span>{money(order.deliveryFeeIdr ?? 0)}</span>
          </li>
        ) : null}
        {(order.platformFeeIdr ?? 0) > 0 ? (
          <li>
            <span>Biaya layanan</span>
            <span>{money(order.platformFeeIdr ?? 0)}</span>
          </li>
        ) : null}
      </ul>
      <p className="merchant-card-sub">
        Baris menu pesanan ini tidak tersimpan di BE (dibuat sebelum item pesanan
        dicatat). Angka di atas berasal dari kolom order.
      </p>
    </>
  )
}
