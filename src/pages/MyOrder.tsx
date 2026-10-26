import { Package, ReceiptText, RotateCcw, ShoppingBag, Star, Store } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { fetchOrderHistory, type OrderHistoryItem } from '../api/reviews'
import type { CustomerActiveOrder } from '../api/orders'
import { apiEnabled } from '../api/supabase'
import { ActiveOrderRow } from '../components/customer/ActiveOrderRow'
import { itemsLine } from '../components/customer/orderStatus'
import { OrderRefundCelebration } from '../components/customer/OrderRefundCelebration'
import { BottomNav } from '../components/layout/BottomNav'
import { BackButton } from '../components/ui/BackButton'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { menuSeed } from '../data/catalog'
import { getStorefront, storefronts } from '../data/storefronts'
import { useAllMenuItems, useStorefronts } from '../hooks/useApiCatalog'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { useMoney } from '../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { addItem, selectSubtotal, setActiveOrder, setOrderStage, switchCart } from '../store/slices/cartSlice'

/**
 * Pesanan Saya — satu menu untuk dua keadaan pesanan (PRD §6/§20.2):
 *
 * - **Aktif**: keranjang yang belum dibayar + pesanan yang masih berjalan.
 *   Riwayat dipindah ke sini dari halaman terpisah: satu pintu untuk "pesananku"
 *   lebih mudah ditebak daripada dua menu yang mirip.
 * - **Riwayat**: pesanan selesai, dengan tombol **Pesan lagi** yang mengisi
 *   ulang keranjang dari menu yang sama (bukan menyuruh customer menelusuri
 *   toko lagi — itu kerjaan aplikasi, bukan pengguna).
 *
 * Barispesanan memakai primitif `.ck-*` (dok keranjang) supaya baris yang sama
 * tampil identik di sheet dan di sini (MD-07/MD-11).
 */

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}

type Tab = 'active' | 'history'

export default function MyOrder() {
  const { money, moneyPlain } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()

  const cartItems = useAppSelector((s) => s.cart.items)
  const otherCarts = useAppSelector((s) => s.cart.carts)
  const activeMerchantId = useAppSelector((s) => s.cart.activeMerchantId)
  const activeOrders = useAppSelector((s) => s.customerOrders.active)
  const hydrated = useAppSelector((s) => s.customerOrders.hydrated)

  const [history, setHistory] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)
  /** Satu baris minta konfirmasi batal; dibagi ke semua baris daftar. */
  const [pendingId, setPendingId] = useState<string | null>(null)

  const tab: Tab = params.get('tab') === 'history' ? 'history' : 'active'
  const setTab = (next: Tab) => {
    setPendingId(null)
    setParams(next === 'history' ? { tab: 'history' } : {}, { replace: true })
  }

  const loadHistory = useCallback(() => {
    if (!apiEnabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    fetchOrderHistory()
      .then(setHistory)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const cartStores = Object.values(otherCarts).filter((items) => items.length > 0).length
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  // Katalog + toko live (mock sebagai fallback) — dipakai tombol "Pesan lagi"
  // supaya menu yang sudah berubah di BE ikut terbaca, bukan daftar mock statis.
  const liveStores = useStorefronts(storefronts)
  const liveItems = useAllMenuItems(menuSeed)
  const activeStore =
    liveStores.find((s) => s.id === activeMerchantId) ??
    (activeMerchantId ? getStorefront(activeMerchantId) : undefined)
  const activeCount = activeOrders.length + (cartItems.length ? 1 : 0)
  const unreviewed = history.filter((order) => !order.reviewed).length

  const trackOrder = (order: CustomerActiveOrder) => {
    dispatch(setActiveOrder({ id: order.id, code: order.code }))
    dispatch(setOrderStage(order.stage))
    navigate('/order-placed')
  }

  const {
    cancel,
    done,
    dismissDone,
    pendingId: cancelPendingId,
    error: cancelError,
  } = useCancelOrder()

  /**
   * Batalkan order lewat jalur bersama (`useCancelOrder`) — sama dengan sheet
   * dok keranjang, termasuk splash yang menyesuaikan ada/tidaknya dana ditahan.
   * Panel konfirmasi sengaja tetap terbuka selama permintaan berjalan; baru
   * ditutup saat barisnya hilang (berhasil) atau user memilih simpan.
   */
  const cancelOrder = (order: CustomerActiveOrder, reason?: string) => {
    void cancel(order, reason)
  }

  /**
   * Pesan lagi: pasang ulang hidangan lama ke keranjang. Nama menu dari BE
   * dicocokkan ke **katalog live** (BE, mock sebagai fallback) — harga yang
   * dipakai harga **sekarang**, bukan harga arsip. Toko dicocokkan lewat nama
   * supaya keranjangnya jatuh di toko yang benar; hidangan yang tak lagi ada di
   * katalog dilewati, dan kalau tak ada satu pun yang cocok kita bilang terus
   * terang.
   */
  const reorder = (order: OrderHistoryItem) => {
    const store = liveStores.find((s) => s.name === order.merchantName)
    // Utamakan menu milik toko itu; kalau `merchantId` tak nyambung (mock vs BE),
    // jatuh ke seluruh katalog supaya "Pesan lagi" tak mati karena id.
    const inStore = liveItems.filter((item) => item.merchantId === store?.id)
    const pool = inStore.length ? inStore : liveItems
    let added = 0
    for (const dish of order.items) {
      const food = pool.find((f) => dish.name.includes(f.name) || f.name.includes(dish.name))
      if (!food) continue
      dispatch(addItem({ food, quantity: dish.qty ?? 1, merchantId: store?.id }))
      added += 1
    }
    if (added === 0) {
      toast.error('Menu pesanan ini tidak ada lagi di katalog.')
      return
    }
    if (store) dispatch(switchCart(store.id))
    toast.success(`${added} menu ditambahkan ke keranjang.`)
    navigate('/checkout')
  }

  return (
    <div className="app-shell">
      <main>
        <div className="my-order-screen">
          {done ? (
            <OrderRefundCelebration
              code={done.code}
              refunded={done.refunded}
              onClose={dismissDone}
            />
          ) : null}
          <header className="my-order-header">
            <BackButton className="btn-back" />
            <h1 className="my-order-title">Pesanan Saya</h1>
            <div className="header-spacer" />
          </header>

          <div className="my-order-tabs">
            <div className="ck-seg" role="tablist" aria-label="Pilih daftar pesanan">
              {(['active', 'history'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={`ck-seg__item${tab === id ? ' ck-seg__item--on' : ''}`}
                  onClick={() => setTab(id)}
                >
                  {id === 'active' ? 'Aktif' : 'Riwayat'}
                  <span className="ck-seg__count">
                    {id === 'active' ? activeCount : history.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {tab === 'active' ? (
            <div>
              {cartItems.length ? (
                <section className="my-order-cart">
                  <div className="my-order-cart__head">
                    <Store size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className="my-order-cart__store">
                      {activeStore?.name ?? (activeMerchantId ? 'Toko lain' : 'Keranjang')}
                    </span>
                    <span className="ck-chip">
                      <span className="ck-chip__dot ck-chip__dot--new" aria-hidden="true" />
                      {cartCount} menu
                    </span>
                  </div>
                  <p className="my-order-cart__items">{itemsLine(cartItems)}</p>
                  <div className="my-order-cart__foot">
                    <span>Subtotal</span>
                    <span className="my-order-cart__sum">{money(selectSubtotal(cartItems))}</span>
                  </div>
                  <button
                    type="button"
                    className="my-order-cta"
                    onClick={() => navigate('/checkout')}
                  >
                    Lanjut ke pembayaran
                  </button>
                  {cartStores > 0 ? (
                    <Link className="my-order-cart__other" to="/checkout">
                      {cartStores} keranjang di toko lain
                    </Link>
                  ) : null}
                </section>
              ) : null}

              <section className="my-order-section">
                <div className="my-order-section__head">
                  <h2 className="my-order-section__title">Sedang berjalan</h2>
                  {activeOrders.length > 0 ? (
                    <span className="my-order-section__count">{activeOrders.length} pesanan</span>
                  ) : null}
                </div>

                {!hydrated && apiEnabled ? (
                  <div className="my-order-skel">
                    <span className="my-order-skel__row" />
                    <span className="my-order-skel__row" />
                  </div>
                ) : activeOrders.length === 0 ? (
                  <p className="ck-empty">
                    Tidak ada pesanan yang sedang berjalan. Pesanan aktif muncul di sini sampai
                    selesai atau dibatalkan.
                  </p>
                ) : (
                  <ul className="ck-list">
                    {activeOrders.map((order) => (
                      <ActiveOrderRow
                        key={order.id}
                        order={order}
                        confirming={pendingId === order.id}
                        pending={cancelPendingId === order.id}
                        error={cancelError?.id === order.id ? cancelError.message : null}
                        onTrack={trackOrder}
                        onToggleConfirm={(o) =>
                          setPendingId((cur) => (cur === o.id ? null : o.id))
                        }
                        onCancel={cancelOrder}
                      />
                    ))}
                  </ul>
                )}
              </section>

              {!cartItems.length && activeOrders.length === 0 && hydrated ? (
                <div className="my-order-empty">
                  <Package size={40} strokeWidth={1.5} aria-hidden="true" />
                  <strong>Belum ada pesanan</strong>
                  <span>
                    Pesanan yang kamu buat akan muncul di sini beserta riwayatnya.
                  </span>
                  <button type="button" className="my-order-cta" onClick={() => navigate('/home')}>
                    Lihat menu
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              {!apiEnabled ? (
                <PlatformNotice message="Backend belum tersambung — riwayat pesanan tidak bisa dimuat." />
              ) : null}
              {error ? (
                <PlatformNotice message="Gagal memuat riwayat. Muat ulang halaman untuk mencoba lagi." />
              ) : null}

              {loading ? (
                <div className="my-order-skel">
                  <span className="my-order-skel__row" />
                  <span className="my-order-skel__row" />
                  <span className="my-order-skel__row" />
                </div>
              ) : history.length === 0 ? (
                <div className="my-order-empty">
                  <ReceiptText size={40} strokeWidth={1.5} aria-hidden="true" />
                  <strong>Belum ada pesanan selesai</strong>
                  <span>Pesanan yang sudah tiba akan muncul di sini beserta penilaiannya.</span>
                </div>
              ) : (
                <>
                  <p className="my-order-note">
                    {unreviewed > 0
                      ? `${unreviewed} pesanan belum dinilai.`
                      : 'Penilaian bisa diisi kapan saja, tanpa batas waktu.'}
                  </p>
                  <ul className="ck-list">
                    {history.map((order) => (
                      <li className="ck-row" key={order.id}>
                        <span className="ck-row__line list-row">
                          <span className="ck-row__title">{order.merchantName}</span>
                          <span className="ck-row__sum">{moneyPlain(order.totalIdr)}</span>
                          <span className="ck-row__meta">
                            <span className="ck-row__code">{order.code}</span>
                            <span className="ck-row__ago">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', DATE_FORMAT)}
                            </span>
                          </span>
                          {order.items.length ? (
                            <span className="ck-row__sub">{itemsLine(order.items)}</span>
                          ) : null}
                        </span>
                        {/* Aksi: kiri = penilaian (tautan bila belum dinilai, chip
                            kalau sudah), kanan = "Pesan lagi" yang dominan. Rel
                            kanan tetap, jadi tombolnya jatuh di x yang sama tiap
                            baris (MD-11). */}
                        <span className="my-order-actions">
                          {order.reviewed ? (
                            <span className="my-order-rated">
                              <Star size={15} strokeWidth={1.75} aria-hidden="true" />
                              Dinilai
                            </span>
                          ) : (
                            <Link className="my-order-rate" to={`/reviews?order=${order.code}`}>
                              Beri rating
                            </Link>
                          )}
                          <button
                            type="button"
                            className="ck-go my-order-reorder"
                            onClick={() => reorder(order)}
                          >
                            <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
                            Pesan lagi
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {!cartItems.length && history.length > 0 ? (
                <button
                  type="button"
                  className="my-order-cta my-order-cta--ghost"
                  onClick={() => navigate('/home')}
                >
                  <ShoppingBag size={16} strokeWidth={1.75} aria-hidden="true" />
                  Belanja lagi
                </button>
              ) : null}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
