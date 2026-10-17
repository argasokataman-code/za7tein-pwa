import { ArrowRight, ClipboardList, ShoppingBag } from 'lucide-react'

import { useMoney } from '../../hooks/useMoney'

interface CartQuickBarProps {
  /** `cart` = ada isi keranjang; `orders` = tak ada keranjang tapi ada order berjalan. */
  mode: 'cart' | 'orders'
  /** Jumlah menu (mode `cart`). */
  count: number
  /** Jumlah toko berbeda di keranjang (mode `cart`). */
  storeCount: number
  subtotal: number
  /** Jumlah order berjalan (mode `orders`). */
  orderCount: number
  onOpen: () => void
}

/**
 * Bilah mengambang di dasar kolom — pintu ke ringkasan keranjang/pesanan.
 * Muncul di layar belanja customer (keranjang berisi) atau saat ada order
 * berjalan (tanpa keranjang). Tap membuka sheet ringkasan, bukan langsung
 * checkout: satu tap = lihat dulu, baru putuskan.
 */
export default function CartQuickBar({
  mode,
  count,
  storeCount,
  subtotal,
  orderCount,
  onOpen,
}: CartQuickBarProps) {
  const { money } = useMoney()
  const isCart = mode === 'cart'

  const label = isCart
    ? `${count} menu${storeCount > 1 ? ` · ${storeCount} toko` : ''}`
    : `${orderCount} pesanan berjalan`
  const value = isCart ? money(subtotal) : 'Lacak status'
  const cta = isCart ? 'Lihat keranjang' : 'Lacak pesanan'
  const aria = isCart
    ? `Lihat keranjang, ${count} menu, ${money(subtotal)}`
    : `Lihat ${orderCount} pesanan berjalan`

  return (
    <div className="cart-quick-bar">
      <button type="button" className="cart-quick-bar__button" aria-label={aria} onClick={onOpen}>
        <span className="cart-quick-bar__left">
          <span className="cart-quick-bar__icon" aria-hidden="true">
            {isCart ? (
              <>
                <ShoppingBag size={16} strokeWidth={1.75} />
                <span className="cart-quick-bar__count">{count}</span>
              </>
            ) : (
              <>
                <ClipboardList size={16} strokeWidth={1.75} />
                <span className="cart-quick-bar__count">{orderCount}</span>
              </>
            )}
          </span>

          <span className="cart-quick-bar__text">
            <span className="cart-quick-bar__label">{label}</span>
            <span className="cart-quick-bar__total">{value}</span>
          </span>
        </span>

        <span className="cart-quick-bar__cta">
          <span>{cta}</span>
          <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}
