import { Bike, ChevronRight, Clock, PlusCircle, Sparkles, Star, Store, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, money } from '../data/merchant'
import { jod, jodToIdr } from '../data/currency'
import {
  CREDIT_EVENT_LABEL,
  MERCHANT_CREDIT_JOD,
  MERCHANT_CREDIT_ORDERS,
  REBATE_TIERS,
  rebateProgress,
} from '../data/incentive'
import { countByTab, orderStatusLabel } from '../data/merchantOrders'
import { debitCredit, payRebate, recordSettledOrder, toggleActive } from '../store/slices/merchantSlice'

export default function MerchantDashboard() {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((s) => s.merchant.isActive)
  const orders = useAppSelector((s) => s.merchant.orders)
  const todayOrderCount = useAppSelector((s) => s.merchant.todayOrderCount)
  const dailyLimit = useAppSelector((s) => s.merchant.dailyLimit)
  const credit = useAppSelector((s) => s.merchant.credit)

  const progress = rebateProgress(credit.settledThisPeriod)
  const creditUsed = 1 - credit.merchantCreditBalance / MERCHANT_CREDIT_JOD

  const revenue = orders
    .filter((o) => o.status === 'selesai')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Dapur" title={mockMerchant.name} />

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
          <Link className="merchant-stat merchant-stat--queue" to="/orders">
            <span className="merchant-stat-value">{countByTab(orders, 'masuk')}</span>
            <span className="merchant-stat-label">Antrean</span>
          </Link>
          <Link className="merchant-stat merchant-stat--active" to="/orders">
            <span className="merchant-stat-value">{countByTab(orders, 'diproses')}</span>
            <span className="merchant-stat-label">Diproses</span>
          </Link>
          <div className="merchant-stat merchant-stat--done">
            <span className="merchant-stat-value">{countByTab(orders, 'selesai')}</span>
            <span className="merchant-stat-label">Selesai</span>
          </div>
          <div className="merchant-stat merchant-stat--revenue">
            <span className="merchant-stat-value">{money(revenue)}</span>
            <span className="merchant-stat-label">Pendapatan</span>
          </div>
        </section>

        {/* Insentif merchant (M10, F9): modal 5 JOD non-withdrawal + cashback
            tier bulanan yang dibayar ke dompet deposit. Angka JOD mengikuti
            kontrak, padanan IDR ditampilkan lewat money(). */}
        <section className="merchant-card">
          <div className="merchant-row">
            <Sparkles size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Modal &amp; insentif</p>
              <p className="merchant-card-sub">
                Sisa modal {money(jodToIdr(credit.merchantCreditBalance))} · non-withdrawal
              </p>
            </div>
          </div>
          <div className="merchant-quota" role="presentation">
            <span style={{ width: `${Math.round(creditUsed * 100)}%` }} />
          </div>
          <p className="merchant-card-sub">
            {MERCHANT_CREDIT_ORDERS} order pertama memakai modal ini — fee merchant 0,15 JOD per
            order dipotong dari sini, bukan dari dompet.
          </p>

          <p className="merchant-card-sub">
            Periode {credit.rebatePeriod} · {credit.settledThisPeriod} order settled ·{' '}
            {progress.next
              ? `${progress.next - credit.settledThisPeriod} lagi ke ambang ${progress.next}`
              : 'semua ambang terlewati'}
          </p>
          <div className="merchant-quota" role="presentation">
            <span style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
          </div>

          <ul className="admin-liability-rows">
            {REBATE_TIERS.map((tier) => (
              <li key={tier.id}>
                <span>
                  {tier.threshold} order
                  {tier.id === credit.rebateTier ? ' · tercapai' : ''}
                </span>
                <span>{jod(tier.amountJod)}</span>
              </li>
            ))}
          </ul>

          <p className="merchant-card-sub">
            {credit.rebateTier
              ? credit.rebatePaidAt
                ? `Cashback ${money(jodToIdr(credit.rebateAmountJod))} sudah dibayar ke dompet deposit (${money(jodToIdr(credit.depositBalanceJod))}).`
                : `Tier tercapai — cashback ${money(jodToIdr(credit.rebateAmountJod))} menunggu dibayar akhir bulan.`
              : 'Belum ada ambang tier yang terlewati periode ini.'}
          </p>

          <div className="merchant-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!credit.rebateTier || credit.rebatePaidAt !== null}
              onClick={() => {
                dispatch(payRebate())
                toast.success('Cashback dibayar ke dompet deposit')
              }}
            >
              {credit.rebatePaidAt
                ? 'Cashback sudah dibayar'
                : `Bayar cashback ${money(jodToIdr(credit.rebateAmountJod))}`}
            </button>
            <button
              type="button"
              className="merchant-toggle"
              onClick={() => {
                // Satu order settled = satu hitungan periode + satu potongan fee.
                dispatch(recordSettledOrder())
                dispatch(debitCredit())
                toast.success('Order settled dicatat')
              }}
            >
              +1 order settled (demo)
            </button>
          </div>

          <p className="merchant-card-sub">Riwayat modal &amp; cashback (append-only)</p>
          <ul className="admin-liability-rows">
            {credit.events.slice(0, 4).map((entry) => (
              <li key={entry.id}>
                <span>{CREDIT_EVENT_LABEL[entry.event]}</span>
                <span>{jod(entry.amountJod)}</span>
              </li>
            ))}
          </ul>

          <p className="merchant-card-sub">
            Modal tidak bisa ditarik, dan apakah cashback bisa ditarik belum final (I-3) — begitu
            juga periode &amp; naik tier di tengah bulan (I-4), kuota Founding (I-5), dan sisa modal
            saat merchant berhenti (I-6).
          </p>
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Order terbaru</h2>            <Link to="/orders">Lihat semua</Link>
          </div>
          {orders.slice(0, 3).map((order) => (
            <Link key={order.id} to="/orders" className="merchant-order">
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
          <Link className="merchant-quick-action" to="/menu">
            <span className="merchant-quick-icon">
              <PlusCircle size={20} strokeWidth={1.75} />
            </span>
            <div>
              <p className="merchant-quick-title">Menu &amp; Stok</p>
              <p className="merchant-quick-sub">Atur item dan ketersediaan</p>
            </div>
            <ChevronRight size={18} strokeWidth={1.75} className="merchant-quick-chevron" />
          </Link>
          <Link className="merchant-quick-action" to="/reviews">
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
