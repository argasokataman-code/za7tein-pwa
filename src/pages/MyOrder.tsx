import {
  Calendar,
  ChevronLeft,
  Clock,
  Headset,
  Package,
  ReceiptText,
  Search,
  Store,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import type { CustomerActiveOrder } from '../api/orders'
import { fetchOrderHistory, type OrderHistoryItem } from '../api/reviews'
import { apiEnabled } from '../api/supabase'
import { ActiveOrderCard, HistoryOrderCard } from '../components/customer/OrderHistoryCard'
import { OrderHistorySheet } from '../components/customer/OrderHistorySheet'
import { OrderRefundCelebration } from '../components/customer/OrderRefundCelebration'
import { canCancelOrder, itemsLine, orderDayKey, orderDayLabel } from '../components/customer/orderStatus'
import { BottomNav } from '../components/layout/BottomNav'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { cartGroups } from '../data/cartGroups'
import { menuSeed } from '../data/catalog'
import { storeNameFor, storefronts } from '../data/storefronts'
import { useAllMenuItems, useStorefronts } from '../hooks/useApiCatalog'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { useMoney } from '../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { addItem, setActiveOrder, setOrderStage, switchCart } from '../store/slices/cartSlice'

/**
 * Pesanan Saya — satu menu untuk dua keadaan pesanan (PRD §6/§20.2):
 *
 * - **Aktif**: keranjang yang belum dibayar + pesanan yang masih berjalan.
 * - **Riwayat**: pesanan selesai dan dibatalkan, dikelompokkan per tanggal,
 *   dengan pencarian dan saring status.
 *
 * Tata letak mengikuti irisan `docs/design/slice/order-history.html`: kepala
 * dua baris, tab pil, baris saring + pencarian yang berbagi satu baris, strip
 * tanggal, kartu bergambar, dan nota di sheet. Gaya tidak lagi memakai primitif
 * `.ck-*` karena bentuk kartunya berbeda (thumbnail + kaki aksi).
 */

type Tab = 'active' | 'history'
type Kind = 'all' | 'done' | 'canceled' | 'refund'

const KINDS: { id: Kind; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'done', label: 'Selesai' },
  { id: 'canceled', label: 'Dibatalkan' },
  { id: 'refund', label: 'Refund' },
]

const isRefund = (order: OrderHistoryItem) =>
  order.status === 'canceled' && Boolean(order.refundStatus) && order.refundStatus !== 'none'

/** Nama menu dicocokkan ke katalog live untuk gambar kartu; tanpa cocokan = ikon. */
function matchImage(
  name: string | undefined,
  items: { name: string }[],
  catalog: { name: string; image: string }[],
): string | undefined {
  const names = [name, ...items.map((item) => item.name)].filter(Boolean) as string[]
  for (const needle of names) {
    const lower = needle.toLowerCase()
    const hit = catalog.find(
      (food) => lower.includes(food.name.toLowerCase()) || food.name.toLowerCase().includes(lower),
    )
    if (hit) return hit.image
  }
  return undefined
}

export default function MyOrder() {
  const { money } = useMoney()
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
  const [openOrder, setOpenOrder] = useState<OrderHistoryItem | null>(null)
  const [kind, setKind] = useState<Kind>('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  /** Satu baris minta konfirmasi batal; dibagi ke semua baris daftar. */
  const [pendingId, setPendingId] = useState<string | null>(null)
  /** Kolom cari selalu ter-mount (animasi buka-tutup), jadi `autoFocus` hanya
      kena sekali saat masih tersembunyi. Fokus dipasang saat panelnya dibuka. */
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const tab: Tab = params.get('tab') === 'history' ? 'history' : 'active'
  const setTab = (next: Tab) => {
    setPendingId(null)
    setKind('all')
    setSearchOpen(false)
    setQuery('')
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

  // Katalog + toko live (mock sebagai fallback) — dipakai tombol "Pesan lagi"
  // dan gambar kartu, supaya menu yang sudah berubah di BE ikut terbaca.
  const liveStores = useStorefronts(storefronts)
  const liveItems = useAllMenuItems(menuSeed)
  const groups = useMemo(
    () => cartGroups(cartItems, activeMerchantId, otherCarts),
    [cartItems, activeMerchantId, otherCarts],
  )
  const activeCount = activeOrders.length + groups.length

  const counts = useMemo(
    () => ({
      all: history.length,
      done: history.filter((order) => order.status === 'done').length,
      canceled: history.filter((order) => order.status === 'canceled').length,
      refund: history.filter(isRefund).length,
    }),
    [history],
  )

  const shownHistory = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return history.filter((order) => {
      if (needle) {
        const haystack = [order.merchantName, order.code, ...order.items.map((i) => i.name)]
          .join(' ')
          .toLowerCase()
        return haystack.includes(needle)
      }
      if (kind === 'all') return true
      if (kind === 'refund') return isRefund(order)
      return order.status === kind
    })
  }, [history, kind, query])

  /** Kelompok per tanggal, urut seperti daftar dari BE (terbaru dulu). */
  const dayGroups = useMemo(() => {
    const groups: { key: string; label: string; orders: OrderHistoryItem[] }[] = []
    for (const order of shownHistory) {
      const key = orderDayKey(order.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.orders.push(order)
      else groups.push({ key, label: orderDayLabel(order.createdAt), orders: [order] })
    }
    return groups
  }, [shownHistory])

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
   * Konfirmasi dua langkah di baris yang sama, bukan dialog baru.
   */
  const cancelOrder = (order: CustomerActiveOrder) => {
    if (pendingId !== order.id) {
      setPendingId(order.id)
      return
    }
    setPendingId(null)
    void cancel(order)
  }

  /**
   * Pesan lagi: pasang ulang hidangan lama ke keranjang. Nama menu dari BE
   * dicocokkan ke **katalog live** (BE, mock sebagai fallback) — harga yang
   * dipakai harga **sekarang**, bukan harga arsip.
   */
  const reorder = (order: OrderHistoryItem) => {
    const store = liveStores.find((s) => s.name === order.merchantName)
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

  const noteText = query.trim()
    ? `${shownHistory.length} hasil untuk "${query.trim()}"`
    : 'Semua pesanan yang sudah selesai atau dibatalkan'

  return (
    <div className="app-shell">
      <main>
        <div className="oh-screen">
          {done ? (
            <OrderRefundCelebration
              code={done.code}
              refunded={done.refunded}
              onClose={dismissDone}
            />
          ) : null}

          <header className="oh-head">
            <button
              type="button"
              className="oh-icon-btn"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="oh-head__text">
              <h1 className="oh-head__title">Pesanan Saya</h1>
              <p className="oh-head__sub">Riwayat pesananmu di Sa7tein</p>
            </div>
            <button
              type="button"
              className="oh-icon-btn"
              aria-label={searchOpen ? 'Tutup pencarian' : 'Cari pesanan'}
              aria-expanded={searchOpen}
              onClick={() => {
                if (searchOpen) {
                  setSearchOpen(false)
                  setQuery('')
                  return
                }
                setTab('history')
                setKind('all')
                setQuery('')
                setSearchOpen(true)
              }}
            >
              <Search size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <Link className="oh-support" to="/help-center" aria-label="Pusat bantuan">
              <Headset size={22} strokeWidth={1.75} aria-hidden="true" />
              <span className="oh-support__dot" aria-hidden="true" />
            </Link>
          </header>

          <div className="oh-tabs" role="tablist" aria-label="Pilih daftar pesanan">
            {(['active', 'history'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`oh-tab${tab === id ? ' oh-tab--on' : ''}`}
                onClick={() => setTab(id)}
              >
                {id === 'active' ? 'Aktif' : 'Riwayat'}
                <span className="oh-tab__count">
                  {id === 'active' ? activeCount : history.length}
                </span>
              </button>
            ))}
          </div>

          {tab === 'history' ? (
            <>
              <div
                className={`oh-filters${searchOpen ? ' is-search' : ''}`}
                role="group"
                aria-label="Saring riwayat pesanan"
              >
                <div className="oh-chips">
                  {KINDS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`oh-chip${kind === item.id ? ' oh-chip--on' : ''}`}
                      aria-pressed={kind === item.id}
                      aria-label={`${item.label}, ${counts[item.id]} pesanan`}
                      onClick={() => setKind(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="oh-search">
                  <Search
                    className="oh-search__icon"
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <input
                    className="oh-search__input"
                    type="search"
                    inputMode="search"
                    autoComplete="off"
                    placeholder="Cari toko, kode, atau menu"
                    aria-label="Cari pesanan"
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <button
                    type="button"
                    className="oh-search__clear"
                    aria-label="Tutup pencarian"
                    onClick={() => {
                      setSearchOpen(false)
                      setQuery('')
                    }}
                  >
                    <X size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {!apiEnabled ? (
                <PlatformNotice message="Riwayat pesanan belum bisa dimuat. Muat ulang halaman untuk mencoba lagi." />
              ) : null}
              {error ? (
                <PlatformNotice message="Gagal memuat riwayat. Muat ulang halaman untuk mencoba lagi." />
              ) : null}

              {loading ? (
                <p className="oh-note">
                  <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
                  Memuat riwayat pesanan…
                </p>
              ) : shownHistory.length === 0 ? (
                <div className="oh-empty">
                  <ReceiptText size={40} strokeWidth={1.5} aria-hidden="true" />
                  <strong>
                    {query.trim()
                      ? `Tidak ada pesanan yang cocok dengan "${query.trim()}"`
                      : kind === 'canceled'
                        ? 'Tidak ada pesanan dibatalkan'
                        : kind === 'refund'
                          ? 'Tidak ada pesanan yang sedang direfund'
                          : kind === 'done'
                            ? 'Belum ada pesanan selesai'
                            : 'Belum ada pesanan'}
                  </strong>
                  <span>Pesanan yang sudah selesai dikelompokkan per tanggal di sini.</span>
                </div>
              ) : (
                <div className="oh-list" key={`${kind}-${query}`}>
                  {dayGroups.map((group) => (
                    <section className="oh-day" key={group.key}>
                      <header className="oh-day__head">
                        <span className="oh-day__label">
                          <Calendar size={16} strokeWidth={1.75} aria-hidden="true" />
                          {group.label}
                        </span>
                        <span className="oh-day__count">{group.orders.length} pesanan</span>
                      </header>
                      {group.orders.map((order) => (
                        <HistoryOrderCard
                          key={order.id}
                          order={order}
                          image={matchImage(undefined, order.items, liveItems)}
                          onOpen={() => setOpenOrder(order)}
                          onReorder={() => reorder(order)}
                        />
                      ))}
                    </section>
                  ))}
                </div>
              )}

              <p className="oh-note">
                <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
                {noteText}
              </p>
            </>
          ) : (
            <div className="oh-list" key="active">
              {groups.length ? (
                groups.map((group) => {
                  const name = group.merchantId
                    ? storeNameFor(group.merchantId, liveStores, group.items[0]?.merchantName)
                    : 'Keranjang'
                  const open = () => {
                    if (!group.active && group.merchantId) dispatch(switchCart(group.merchantId))
                    navigate('/checkout')
                  }
                  return (
                    <section className="oh-cart" key={group.merchantId ?? 'default'}>
                      <div className="oh-cart__head">
                        <Store size={16} strokeWidth={1.75} aria-hidden="true" />
                        <span className="oh-cart__store">{name}</span>
                        <span className="oh-badge">{group.count} menu</span>
                      </div>
                      <p className="oh-cart__items">{itemsLine(group.items)}</p>
                      <div className="oh-cart__foot">
                        <span>Subtotal</span>
                        <span className="oh-cart__sum">{money(group.subtotal)}</span>
                      </div>
                      <button type="button" className="oh-cta" onClick={open}>
                        {group.active ? 'Lanjut ke pembayaran' : 'Buka keranjang'}
                      </button>
                    </section>
                  )
                })
              ) : null}

              {!hydrated && apiEnabled ? (
                <p className="oh-note">
                  <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
                  Memuat pesanan berjalan…
                </p>
              ) : activeOrders.length === 0 ? (
                <div className="oh-empty">
                  <Package size={40} strokeWidth={1.5} aria-hidden="true" />
                  <strong>Belum ada pesanan</strong>
                  <span>
                    Pesanan yang berjalan muncul di sini sampai selesai atau dibatalkan.
                  </span>
                  <button
                    type="button"
                    className="oh-cta oh-cta--ghost"
                    onClick={() => navigate('/home')}
                  >
                    Lihat menu
                  </button>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <div className="oh-active-item" key={order.id}>
                    <ActiveOrderCard
                      order={order}
                      image={matchImage(order.merchantName, order.items, liveItems)}
                      onTrack={() => trackOrder(order)}
                    />
                    {/* Batalkan hanya selama jendela 1 menit (PRD: merchant belum
                        menerima order). Konfirmasi = tekan dua kali di tombol yang
                        sama, bukan dialog tambahan yang menutupi kartu. */}
                    {canCancelOrder(order) ? (
                      <button
                        type="button"
                        className="oh-cancel"
                        disabled={cancelPendingId === order.id}
                        onClick={() => cancelOrder(order)}
                      >
                        {pendingId === order.id
                          ? 'Tekan lagi untuk membatalkan'
                          : 'Batalkan pesanan'}
                      </button>
                    ) : null}
                    {cancelError?.id === order.id ? (
                      <PlatformNotice message={cancelError.message} />
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <OrderHistorySheet
        order={openOrder}
        onClose={() => setOpenOrder(null)}
        onReorder={reorder}
      />
      <BottomNav />
    </div>
  )
}
