import { ChevronRight, Store } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomSheet } from '../ui/BottomSheet'
import { getStorefront } from '../../data/storefronts'
import { orderStatusLabel } from '../../data/merchantOrders'
import { useMoney } from '../../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { selectSubtotal, setActiveOrder, setOrderStage, switchCart } from '../../store/slices/cartSlice'
import type { OrderStage } from '../../types'

/** Item yang diringkas ke satu baris sebelum ditulis "+N". */
const ITEMS_SHOWN = 3

/** Warna titik status: selesai/hampir tiba, dibatalkan, baru, atau sedang jalan. */
type StatusTone = 'new' | 'run' | 'done' | 'bad'

function statusTone(status: string): StatusTone {
  if (status === 'tiba' || status === 'selesai') return 'done'
  if (status === 'ditolak' || status === 'batal') return 'bad'
  if (status === 'baru') return 'new'
  return 'run'
}

interface CartSummarySheetProps {
  open: boolean
  onClose: () => void
}

/**
 * Ringkasan keranjang + pesanan berjalan customer.
 *
 * Customer boleh menaruh menu di beberapa toko sekaligus (§6) dan punya
 * beberapa order berjalan, jadi isinya bisa panjang. Karena itu hanya **satu**
 * daftar tampil pada satu waktu lewat segmented control: daftar pesanan dibatasi
 * tiga baris, sisanya lewat "Lihat semua". Baris dibuat ringkas satu-baris agar
 * sheet tetap sependek mungkin alih-alih melar setinggi layar.
 */
export function CartSummarySheet({ open, onClose }: CartSummarySheetProps) {
  const { money } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [tab, setTab] = useState<'orders' | 'cart'>('cart')

  const cartItems = useAppSelector((s) => s.cart.items)
  const otherCarts = useAppSelector((s) => s.cart.carts)
  const activeMerchantId = useAppSelector((s) => s.cart.activeMerchantId)
  const activeOrders = useAppSelector((s) => s.customerOrders.active)

  const storeName = (id: string) => getStorefront(id)?.name ?? (id === 'default' ? 'Toko' : 'Toko lain')

  // Keranjang aktif dulu, lalu keranjang toko lain. Satu entri = satu toko.
  const cartStores = [
    ...(cartItems.length
      ? [{ merchantId: activeMerchantId ?? 'default', items: cartItems, isActive: true }]
      : []),
    ...Object.entries(otherCarts)
      .filter(([, items]) => items.length > 0)
      .map(([merchantId, items]) => ({ merchantId, items, isActive: false })),
  ]

  const hasOrders = activeOrders.length > 0
  const hasCart = cartStores.length > 0
  // Tab yang isinya kosong tak boleh tersisa aktif (mis. pesanan baru selesai).
  const shown = tab === 'orders' && !hasOrders ? 'cart' : tab === 'cart' && !hasCart ? 'orders' : tab

  const openCheckout = (merchantId: string, isActive: boolean) => {
    if (!isActive) dispatch(switchCart(merchantId))
    onClose()
    navigate('/checkout')
  }

  const trackOrder = (id: string, code: string, stage: OrderStage) => {
    dispatch(setActiveOrder({ id, code }))
    dispatch(setOrderStage(stage))
    onClose()
    navigate('/order-placed')
  }

  const itemsLine = (items: { name: string; qty?: number; quantity?: number }[]) => {
    const shownItems = items.slice(0, ITEMS_SHOWN)
    const rest = items.length - shownItems.length
    return (
      shownItems
        .map((it) => {
          const qty = it.qty ?? it.quantity ?? 1
          return `${qty}× ${it.name}`
        })
        .join(' · ') + (rest > 0 ? ` · +${rest}` : '')
    )
  }

  const title = hasOrders && hasCart ? 'Keranjang & pesanan' : hasCart ? 'Keranjang' : 'Pesanan berjalan'

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="ck-sheet">
        {hasOrders && hasCart ? (
          <div className="ck-seg" role="tablist" aria-label="Pilih daftar">
            {(['orders', 'cart'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={shown === id}
                className={`ck-seg__item${shown === id ? ' ck-seg__item--on' : ''}`}
                onClick={() => setTab(id)}
              >
                {id === 'orders' ? 'Pesanan' : 'Keranjang'}
                <span className="ck-seg__count">
                  {id === 'orders' ? activeOrders.length : cartStores.length}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {shown === 'orders' ? (
          <ul className="ck-list ck-list--scroll">
            {activeOrders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  className="ck-row"
                  onClick={() => trackOrder(order.id, order.code, order.stage)}
                >
                  <span className="ck-row__main">
                    <span className="ck-row__title">{order.merchantName}</span>
                    <span className="ck-row__meta">
                      <span className="ck-chip">
                        <span
                          className={`ck-chip__dot ck-chip__dot--${statusTone(order.status)}`}
                          aria-hidden="true"
                        />
                        {orderStatusLabel(order.status)}
                      </span>
                      <span className="ck-row__code">{order.code}</span>
                      <span className="ck-row__ago">{order.placedAt}</span>
                    </span>
                    {order.items.length ? (
                      <span className="ck-row__sub">{itemsLine(order.items)}</span>
                    ) : null}
                  </span>
                  <span className="ck-row__side">
                    <span className="ck-row__sum">{money(order.totalIdr)}</span>
                    <ChevronRight size={16} strokeWidth={2.25} aria-hidden="true" className="ck-row__go" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="ck-list">
            {cartStores.map((store) => {
              const count = store.items.reduce((sum, i) => sum + i.quantity, 0)
              return (
                <li key={store.merchantId} className="ck-row ck-row--cart">
                  <span className="ck-row__main">
                    <span className="ck-row__title">
                      <Store size={15} strokeWidth={1.75} aria-hidden="true" />
                      {storeName(store.merchantId)}
                    </span>
                    <span className="ck-row__meta">{count} menu</span>
                    <span className="ck-row__sub">{itemsLine(store.items)}</span>
                  </span>
                  <span className="ck-row__side">
                    <span className="ck-row__sum">{money(selectSubtotal(store.items))}</span>
                    <button
                      type="button"
                      className="ck-go"
                      onClick={() => openCheckout(store.merchantId, store.isActive)}
                    >
                      Checkout
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {!hasOrders && !hasCart ? (
          <p className="ck-empty">Belum ada menu di keranjang dan tak ada pesanan berjalan.</p>
        ) : null}
      </div>
    </BottomSheet>
  )
}
