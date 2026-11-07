import { Store, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomSheet } from '../ui/BottomSheet'
import { cartGroups } from '../../data/cartGroups'
import { menuSeed } from '../../data/catalog'
import { storeNameFor, storefronts } from '../../data/storefronts'
import type { CustomerActiveOrder } from '../../api/orders'
import { useCancelOrder } from '../../hooks/useCancelOrder'
import { useAllMenuItems, useStorefronts } from '../../hooks/useApiCatalog'
import { useMoney } from '../../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import {
  clearCart,
  removeCart,
  setActiveOrder,
  setOrderStage,
  switchCart,
} from '../../store/slices/cartSlice'
import type { OrderStage } from '../../types'
import { ActiveOrderRow } from './ActiveOrderRow'
import { itemsLine } from './orderStatus'
import { OrderRefundCelebration } from './OrderRefundCelebration'

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
  // Toko live (mock sebagai fallback): id keranjang dari BE numerik, bukan
  // `am-N` milik mock, jadi tanpa daftar live semua baris menjadi "Toko lain".
  const liveStores = useStorefronts(storefronts)
  const liveItems = useAllMenuItems(menuSeed)
  const catalogItems = useMemo(() => [...liveItems, ...menuSeed], [liveItems])

  const storeName = (id: string | null, fallbackName?: string | null) =>
    storeNameFor(id, liveStores, fallbackName)
  const storeOf = (id: string | null) => (id ? liveStores.find((s) => s.id === id) : undefined)

  // Keranjang aktif dulu, lalu keranjang toko lain; satu entri = satu toko.
  // Item lama yang masih menumpuk di keranjang aktif tetap dipisah per
  // `merchantId` supaya barisnya bisa disebut tokonya, bukan "Toko".
  const cartStores = useMemo(
    () => cartGroups(cartItems, activeMerchantId, otherCarts, catalogItems),
    [cartItems, activeMerchantId, otherCarts, catalogItems],
  )

  const hasOrders = activeOrders.length > 0
  const hasCart = cartStores.length > 0
  // Tab yang isinya kosong tak boleh tersisa aktif (mis. pesanan baru selesai).
  const shown = tab === 'orders' && !hasOrders ? 'cart' : tab === 'cart' && !hasCart ? 'orders' : tab

  const closeSheet = () => {
    setPending(null)
    onClose()
  }

  const openCheckout = (merchantId: string | null, isActive: boolean) => {
    if (!isActive && merchantId) dispatch(switchCart(merchantId))
    closeSheet()
    navigate('/checkout')
  }

  const trackOrder = (id: string, code: string, stage: OrderStage) => {
    dispatch(setActiveOrder({ id, code }))
    dispatch(setOrderStage(stage))
    closeSheet()
    // Pesanan sudah jadi: layar ini tidak boleh diputar ulang lewat back.
    navigate('/order-placed', { replace: true })
  }

  /** Buang satu keranjang toko; keranjang aktif dibersihkan dari `items`. */
  const discardCart = (merchantId: string | null, isActive: boolean) => {
    if (isActive) dispatch(clearCart())
    else if (merchantId) dispatch(removeCart(merchantId))
    setPending(null)
  }

  const { cancel, done, dismissDone, pendingId: cancelPendingId, error } = useCancelOrder()

  /**
   * Batalkan order lewat jalur bersama (`useCancelOrder`): status ditulis dulu,
   * lalu baris dibuang dan splash muncul (isinya menyesuaikan ada/tidaknya dana
   * yang ditahan). Panel konfirmasi tetap terbuka selama permintaan berjalan.
   */
  const cancelOrder = (order: CustomerActiveOrder, reason?: string) => {
    void cancel(order, reason)
  }

  const title = hasOrders && hasCart ? 'Keranjang & pesanan' : hasCart ? 'Keranjang' : 'Pesanan berjalan'

  return (
    <BottomSheet open={open} onClose={closeSheet} title={title} full>
      <div className="ck-sheet">
        {done ? (
          <OrderRefundCelebration code={done.code} refunded={done.refunded} onClose={dismissDone} />
        ) : null}
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
                pending={cancelPendingId === order.id}
                error={error?.id === order.id ? error.message : null}
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
              const count = store.count
              const name = storeName(store.merchantId, store.items[0]?.merchantName)
              const info = storeOf(store.merchantId)
              // Detail toko (jarak, estimasi, buka/tutup) supaya beberapa baris
              // tidak cuma terbedakan oleh nama yang mirip.
              const detail = [
                info?.distance,
                info?.deliveryTime,
                info && !info.isOpen ? 'Tutup' : null,
              ].filter(Boolean)
              const rowId = store.merchantId ?? 'default'
              const confirming = pending?.kind === 'cart' && pending.id === rowId
              return (
                <li key={rowId} className="ck-row">
                  <span className="ck-row__line list-row">
                    <span className="ck-row__title">
                      <Store size={15} strokeWidth={1.75} aria-hidden="true" />
                      {name}
                    </span>
                    <span className="ck-row__sum">{money(store.subtotal)}</span>
                    <span className="ck-row__meta">
                      {[...detail, `${count} menu`].join(' · ')}
                    </span>
                    <button
                      type="button"
                      className="ck-go ck-go--end"
                      onClick={() => openCheckout(store.merchantId, store.active)}
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
                        onClick={() => setPending({ kind: 'cart', id: rowId })}
                      >
                        <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                  </span>
                  {confirming ? (
                    <span className="ck-confirm">
                      <span className="ck-confirm__q">Buang keranjang {name}?</span>
                      <span className="ck-confirm__actions">
                        <button
                          type="button"
                          className="ck-confirm__btn"
                          onClick={() => setPending(null)}
                        >
                          Simpan keranjang
                        </button>
                        <button
                          type="button"
                          className="ck-confirm__btn ck-confirm__btn--danger"
                          onClick={() => discardCart(store.merchantId, store.active)}
                        >
                          Buang
                        </button>
                      </span>
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
