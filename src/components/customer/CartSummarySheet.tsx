import { Store, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomSheet } from '../ui/BottomSheet'
import { getStorefront } from '../../data/storefronts'
import { updateOrderStatus, type CustomerActiveOrder } from '../../api/orders'
import { useMoney } from '../../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import {
  clearCart,
  removeCart,
  selectSubtotal,
  setActiveOrder,
  setOrderStage,
  switchCart,
} from '../../store/slices/cartSlice'
import { dropActiveOrder } from '../../store/slices/customerOrdersSlice'
import type { OrderStage } from '../../types'
import { ActiveOrderRow } from './ActiveOrderRow'
import { itemsLine } from './orderStatus'

interface CartSummarySheetProps {
  open: boolean
  onClose: () => void
}

/**
 * Ringkasan keranjang + pesanan berjalan customer.
 *
 * Customer boleh menaruh menu di beberapa toko sekaligus (§6) dan punya
 * beberapa order berjalan, jadi isinya bisa panjang. Karena itu hanya **satu**
 * daftar tampil pada satu waktu lewat segmented control, dan daftar pesanan
 * dibatasi tinggi lalu menggulir di dalam. Baris dibuat ringkas satu-baris agar
 * sheet tetap sependek mungkin alih-alih melar setinggi layar.
 *
 * Tiap baris membawa aksinya sendiri: keranjang bisa dibuang, pesanan yang
 * belum diterima toko bisa dibatalkan. Konfirmasi tampil **inline di baris itu**
 * (bukan sheet kedua bertumpuk) supaya konteksnya tidak hilang.
 */
export function CartSummarySheet({ open, onClose }: CartSummarySheetProps) {
  const { money } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [tab, setTab] = useState<'orders' | 'cart'>('cart')
  /** Baris yang sedang minta konfirmasi: satu saja, biar daftar tak berisik. */
  const [pending, setPending] = useState<{ kind: 'cart' | 'order'; id: string } | null>(null)

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

  const closeSheet = () => {
    setPending(null)
    onClose()
  }

  const openCheckout = (merchantId: string, isActive: boolean) => {
    if (!isActive) dispatch(switchCart(merchantId))
    closeSheet()
    navigate('/checkout')
  }

  const trackOrder = (id: string, code: string, stage: OrderStage) => {
    dispatch(setActiveOrder({ id, code }))
    dispatch(setOrderStage(stage))
    closeSheet()
    navigate('/order-placed')
  }

  /** Buang satu keranjang toko; keranjang aktif dibersihkan dari `items`. */
  const discardCart = (merchantId: string, isActive: boolean) => {
    dispatch(isActive ? clearCart() : removeCart(merchantId))
    setPending(null)
  }

  /**
   * Batalkan order. Baris langsung dibuang supaya terasa responsif; kalau BE
   * menolak, gelembung realtime akan memunculkannya lagi — jadi kegagalan
   * memulihkan dirinya sendiri, tak perlu layar error.
   */
  const cancelOrder = (order: CustomerActiveOrder) => {
    dispatch(dropActiveOrder(order.id))
    setPending(null)
    void updateOrderStatus(order.id, 'batal', 'customer').catch(() => {})
  }

  const title = hasOrders && hasCart ? 'Keranjang & pesanan' : hasCart ? 'Keranjang' : 'Pesanan berjalan'

  return (
    <BottomSheet open={open} onClose={closeSheet} title={title}>
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
                onClick={() => {
                  setPending(null)
                  setTab(id)
                }}
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
              <ActiveOrderRow
                key={order.id}
                order={order}
                confirming={pending?.kind === 'order' && pending.id === order.id}
                onTrack={(o) => trackOrder(o.id, o.code, o.stage)}
                onToggleConfirm={(o) =>
                  setPending((cur) =>
                    cur?.kind === 'order' && cur.id === o.id ? null : { kind: 'order', id: o.id },
                  )
                }
                onCancel={cancelOrder}
              />
            ))}
          </ul>
        ) : (
          <ul className="ck-list">
            {cartStores.map((store) => {
              const count = store.items.reduce((sum, i) => sum + i.quantity, 0)
              const name = storeName(store.merchantId)
              const confirming = pending?.kind === 'cart' && pending.id === store.merchantId
              return (
                <li key={store.merchantId} className="ck-row">
                  <span className="ck-row__line list-row">
                    <span className="ck-row__title">
                      <Store size={15} strokeWidth={1.75} aria-hidden="true" />
                      {name}
                    </span>
                    <span className="ck-row__sum">{money(selectSubtotal(store.items))}</span>
                    <span className="ck-row__meta">{count} menu</span>
                    <button
                      type="button"
                      className="ck-go ck-go--end"
                      onClick={() => openCheckout(store.merchantId, store.isActive)}
                    >
                      Checkout
                    </button>
                    <span className="ck-row__sub">{itemsLine(store.items)}</span>
                  </span>
                  <span className="ck-row__act">
                    {confirming ? null : (
                      <button
                        type="button"
                        className="ck-icon"
                        aria-label={`Buang keranjang ${name}`}
                        onClick={() => setPending({ kind: 'cart', id: store.merchantId })}
                      >
                        <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                  </span>
                  {confirming ? (
                    <span className="ck-confirm">
                      <span className="ck-confirm__q">Buang keranjang {name}?</span>
                      <button
                        type="button"
                        className="ck-confirm__btn"
                        onClick={() => setPending(null)}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        className="ck-confirm__btn ck-confirm__btn--danger"
                        onClick={() => discardCart(store.merchantId, store.isActive)}
                      >
                        Buang
                      </button>
                    </span>
                  ) : null}
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
