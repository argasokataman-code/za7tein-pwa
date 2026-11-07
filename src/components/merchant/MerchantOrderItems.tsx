import type { MerchantOrder } from '../../types'

interface MerchantOrderItemsProps {
  order: MerchantOrder
  money: (value: number) => string
}

/**
 * Rincian menu pada detail order merchant. Order lama di BE bisa punya total
 * order tanpa satu pun baris `order_items`; daftar kosong akan terbaca sebagai
 * "pesanan tanpa menu", jadi keadaan itu disebut apa adanya.
 */
export function MerchantOrderItems({ order, money }: MerchantOrderItemsProps) {
  if (order.items.length === 0) {
    return <p className="merchant-card-sub">Rincian menu pesanan ini tidak tersedia.</p>
  }

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
