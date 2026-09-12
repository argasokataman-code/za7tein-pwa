import { Bike, Clock, Store, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, rupiah } from '../data/merchant'
import { countByTab } from '../data/merchantOrders'
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
          <Link className="merchant-stat" to="/merchant/orders">
            <span className="merchant-stat-value">{countByTab(orders, 'masuk')}</span>
            <span className="merchant-stat-label">Antrean</span>
          </Link>
          <Link className="merchant-stat" to="/merchant/orders">
            <span className="merchant-stat-value">{countByTab(orders, 'diproses')}</span>
            <span className="merchant-stat-label">Diproses</span>
          </Link>
          <div className="merchant-stat">
            <span className="merchant-stat-value">{countByTab(orders, 'selesai')}</span>
            <span className="merchant-stat-label">Selesai</span>
          </div>
          <div className="merchant-stat">
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
              <div>
                <p className="merchant-order-code">{order.code}</p>
                <p className="merchant-order-sub">
                  {order.customerName} · {order.items.length} item
                </p>
              </div>
              <span className={`merchant-badge merchant-badge-${order.status}`}>
                {order.status}
              </span>
            </Link>
          ))}
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
