import { ArrowRight, ShoppingBag } from 'lucide-react'

import { useMoney } from '../../hooks/useMoney'

interface CartQuickBarProps {
  count: number
  subtotal: number
  onOpen: () => void
}

/**
 * Bilah keranjang mengambang di atas bilah bawah — mengikuti desain v2
 * (`App.tsx`, quick bar). Muncul hanya saat keranjang berisi; tap membawa ke
 * halaman checkout. Nominal mengikuti mata uang tampilan lewat `useMoney`,
 * bukan `Rp` mentah, supaya tidak berbeda dari layar lain.
 */
export default function CartQuickBar({ count, subtotal, onOpen }: CartQuickBarProps) {
  const { money } = useMoney()

  return (
    <div className="cart-quick-bar">
      <button
        type="button"
        className="cart-quick-bar__button"
        aria-label={`Lihat keranjang, ${count} menu, ${money(subtotal)}`}
        onClick={onOpen}
      >
        <span className="cart-quick-bar__left">
          <span className="cart-quick-bar__icon" aria-hidden="true">
            <ShoppingBag size={16} strokeWidth={1.75} />
            <span className="cart-quick-bar__count">{count}</span>
          </span>

          <span className="cart-quick-bar__text">
            <span className="cart-quick-bar__label">{count} menu siap diantar</span>
            <span className="cart-quick-bar__total">{money(subtotal)}</span>
          </span>
        </span>

        <span className="cart-quick-bar__cta">
          <span>Lihat keranjang</span>
          <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}
