import { Bike, ChevronRight, Clock, PlusCircle, Star, Store, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, rupiah } from '../data/merchant'
import { countByTab, orderStatusLabel } from '../data/merchantOrders'
import { toggleActive } from '../store/slices/merchantSlice'

export default function MerchantDashboard() {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((s) => s.merchant.isActive)
  const orders = useAppSelector((s) => s.merchant.orders)
  const todayOrderCount = useAppSelector((s) => s.merchant.todayOrderCount)
  const dailyLimit = useAppSelector((s) => s.merchant.dailyLimit)

  const revenue = orders
    .filter((o) => o.status === 'selesai')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <header className="merchant-header">
          <p className="merchant-eyebrow">Dapur</p>
          <h1 className="merchant-title">{mockMerchant.name}</h1>
        </header>

        <section className="merchant-card">
          <div className="merchant-row">
            <Store size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">
                {isActive ? 'Buka — menerima order baru' : 'Tutup — order baru ditahan'}
              </p>
              <p className="merchant-card-sub">
                {isActive ? `Tutup otomatis pukul ${mockMerchant.closeTime}` : 'Buka untuk mulai menerima'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`merchant-toggle ${isActive ? 'is-open' : ''}`}
            onClick={() => dispatch(toggleActive())}
          >
            {isActive ? 'Tutup toko' : 'Buka toko'}
          </button>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Wallet size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Kuota harian</p>
              <p className="merchant-card-sub">
                {todayOrderCount} / {dailyLimit} order · reset 00:00
              </p>
            </div>
          </div>
          <div className="merchant-quota" role="presentation">
            <span style={{ width: `${(todayOrderCount / dailyLimit) * 100}%` }} />
          </div>
        </section>

        <section className="merchant-stats">
          <Link className="merchant-stat merchant-stat--queue" to="/merchant/orders">
            <span className="merchant-stat-value">{countByTab(orders, 'masuk')}</span>
            <span className="merchant-stat-label">Antrean</span>
          </Link>
          <Link className="merchant-stat merchant-stat--active" to="/merchant/orders">
            <span className="merchant-stat-value">{countByTab(orders, 'diproses')}</span>
            <span className="merchant-stat-label">Diproses</span>
          </Link>
          <div className="merchant-stat merchant-stat--done">
            <span className="merchant-stat-value">{countByTab(orders, 'selesai')}</span>
            <span className="merchant-stat-label">Selesai</span>
          </div>
          <div className="merchant-stat merchant-stat--revenue">
            <span className="merchant-stat-value">{rupiah(revenue)}</span>
            <span className="merchant-stat-label">Pendapatan</span>
          </div>
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Order terbaru</h2>
            <Link to="/merchant/orders">Lihat semua</Link>
          </div>
          {orders.slice(0, 3).map((order) => (
            <Link key={order.id} to="/merchant/orders" className="merchant-order">
              <div className="merchant-order-buyer">
                <img
                  className="merchant-buyer-avatar"
                  src={order.buyerAvatar}
                  alt={`Profil ${order.customerName}`}
                  width={40}
                  height={40}
                />
                <div>
                  <p className="merchant-order-code">{order.code}</p>
                  <p className="merchant-order-sub">
                    {order.customerName} · {order.items.length} item
                  </p>
                </div>
              </div>
              <div className="merchant-order-head-right">
                <div
                  className="merchant-order-rating"
                  aria-label={`Rating pembeli ${order.buyerRating} dari 5`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      strokeWidth={1.75}
                      color="var(--star)"
                      fill={i < order.buyerRating ? 'var(--star)' : 'none'}
                    />
                  ))}
                </div>
                <span className={`merchant-badge merchant-badge-${order.status}`}>
                  {orderStatusLabel(order.status)}
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Kelola</h2>
          </div>
          <Link className="merchant-quick-action" to="/merchant/menu">
            <span className="merchant-quick-icon">
              <PlusCircle size={20} strokeWidth={1.75} />
            </span>
            <div>
              <p className="merchant-quick-title">Menu &amp; Stok</p>
              <p className="merchant-quick-sub">Atur item dan ketersediaan</p>
            </div>
            <ChevronRight size={18} strokeWidth={1.75} className="merchant-quick-chevron" />
          </Link>
          <Link className="merchant-quick-action" to="/merchant/reviews">
            <span className="merchant-quick-icon">
              <Star size={20} strokeWidth={1.75} />
            </span>
            <div>
              <p className="merchant-quick-title">Ulasan Pembeli</p>
              <p className="merchant-quick-sub">Baca &amp; balas komentar soal menu</p>
            </div>
            <ChevronRight size={18} strokeWidth={1.75} className="merchant-quick-chevron" />
          </Link>
        </section>

        <section className="merchant-card merchant-hint">
          <Clock size={18} strokeWidth={1.75} />
          <p>Estimasi masak diatur per order di halaman Order.</p>
        </section>
        <section className="merchant-card merchant-hint">
          <Bike size={18} strokeWidth={1.75} />
          <p>Kurir khusus tokomu diatur di halaman Kurir.</p>
        </section>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
