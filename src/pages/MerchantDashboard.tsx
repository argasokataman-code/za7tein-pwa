import { Bike, ChevronRight, Clock, PlusCircle, Sparkles, Star, Store, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { BarChart } from '../components/ui/BarChart'
import { DonutChart } from '../components/ui/DonutChart'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, money } from '../data/merchant'
import { jodToIdr } from '../data/currency'
import { rebateProgress } from '../data/incentive'
import { countByTab, orderStatusLabel } from '../data/merchantOrders'
import {
  orderMixSegments,
  orderTrendBars,
  paymentMixSegments,
  revenueTrendBars,
  trendTotals,
} from '../data/merchantTrend'
import { switchBlockCopy } from '../data/superadmin'
import { toggleActive } from '../store/slices/merchantSlice'

export default function MerchantDashboard() {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((s) => s.merchant.isActive)
  const orders = useAppSelector((s) => s.merchant.orders)
  const todayOrderCount = useAppSelector((s) => s.merchant.todayOrderCount)
  const dailyLimit = useAppSelector((s) => s.merchant.dailyLimit)
  const credit = useAppSelector((s) => s.merchant.credit)
  // Maintenance menolak order baru di semua role; merchant perlu tahu kenapa
  // ordernya berhenti masuk, bukan cuma merasakan dapur jadi sepi.
  const switches = useAppSelector((s) => s.superAdmin.switches)
  const maintenanceCopy = switchBlockCopy('maintenance', switches)

  const progress = rebateProgress(credit.settledThisPeriod)

  // Pendapatan = order yang benar-benar berjalan. Order `ditolak`/`batal` tidak
  // pernah jadi uang, dan sebelumnya kartu ini hanya menghitung `selesai`
  // sehingga angkanya jauh lebih kecil dari total yang tampil di grafik tren.
  const revenue = orders
    .filter((o) => o.status !== 'ditolak' && o.status !== 'batal')
    .reduce((sum, o) => sum + o.total, 0)

  const trend = trendTotals()
  const orderMix = orderMixSegments(orders)
  const paymentMix = paymentMixSegments(orders)
  const paymentByLabel = (prefix: string) =>
    paymentMix.find((s) => s.label.startsWith(prefix))?.value ?? 0
  const paymentCod = paymentByLabel('COD')
  const paymentTransfer = paymentByLabel('Transfer')
  const paymentTotal = paymentCod + paymentTransfer || 1

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Dapur" title={mockMerchant.name} />

        {maintenanceCopy ? <PlatformNotice message={maintenanceCopy} /> : null}

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

        {/* Tren 7 hari + komposisi. Primitif chart sudah ada (`BarChart`,
            `DonutChart`, `_charts.scss`) dan dipakai konsol SA — tidak ada
            library chart baru. Angka datang dari `merchantTrend`, yang menjaga
            jumlah order dan pendapatannya sama dengan kartu di atas.

            Dua chart tren ditumpuk PENUH LEBAR, bukan dua kolom sempit.
            Varian dua kolom pernah dipakai dan diukur gagal: kolom 150px −
            gap 12px×6 menyisakan 11,1px per batang sementara teks "44rb"
            selebar 24,4px, jadi nilai tumpang tindih 1,3px di 5 pasang dan
            label hari menyatu (audit-003 #1/#2/#3). Di lebar penuh (~35px
            per kolom) keduanya muat. */}
        <section className="merchant-card">
          <div className="merchant-card-head">
            <div>
              <p className="merchant-card-title">Tren 7 hari</p>
              <p className="merchant-card-sub">
                {trend.orders} order · {money(trend.revenueIdr)}
                {trend.best ? ` · terbaik ${trend.best.label}` : ''}
              </p>
            </div>
          </div>
          <BarChart
            data={orderTrendBars()}
            ariaLabel="Jumlah order per hari, tujuh hari terakhir"
            tone="brand"
            compact
          />
          <p className="merchant-chart-caption">Order per hari</p>
          <BarChart
            data={revenueTrendBars()}
            ariaLabel="Pendapatan per hari dalam ribuan rupiah, tujuh hari terakhir"
            tone="success"
            compact
            format={(value) => `${value}rb`}
          />
          {/* "rb" sudah menjelaskan satuan; "(ribuan rupiah)" mengulanginya
              (audit-003 #8). */}
          <p className="merchant-chart-caption">Pendapatan per hari</p>
        </section>

        {/* Judulnya "Komposisi order", bukan "hari ini": mock tidak punya
            tanggal pesanan (`placedAt` teks relatif), jadi klaim "hari ini"
            tidak bisa dibuktikan (audit-003 #4). */}
        <section className="merchant-card">
          <div className="merchant-card-head">
            <div>
              <p className="merchant-card-title">Komposisi order</p>
              <p className="merchant-card-sub">{orders.length} order sedang dipantau</p>
            </div>
          </div>
          <div className="chart-split">
            <DonutChart
              segments={orderMix}
              ariaLabel="Komposisi status order"
              centerValue={String(orders.length)}
              centerLabel="order"
            />            <ul className="chart-legend">
              {orderMix.map((segment) => (
                <li key={segment.label}>
                  <span className={`chart-legend-dot chart-tone-bg--${segment.tone}`} />
                  <span className="chart-legend-label">{segment.label}</span>
                  <span className="chart-legend-value">{segment.value} order</span>
                </li>
              ))}
            </ul>
          </div>
          {/* COD vs transfer diganti bar perbandingan: split 4/4 = 50/50 tidak
              butuh donut, dan donut kedua membuat kartu ini 468px
              (audit-003 #5/#6). Angka tetap dari `paymentMix`. */}
          <div
            className="merchant-duo"
            role="img"
            aria-label={`Metode bayar: ${paymentCod} order COD, ${paymentTransfer} order transfer`}
          >
            <div className="merchant-duo-track">
              <span
                className="chart-tone-bg--brand"
                style={{ width: `${(paymentCod / paymentTotal) * 100}%` }}
              />
              <span
                className="chart-tone-bg--success"
                style={{ width: `${(paymentTransfer / paymentTotal) * 100}%` }}
              />
            </div>
            <ul className="merchant-duo-legend">
              <li>
                <span className="chart-legend-dot chart-tone-bg--brand" />
                COD (tunai) <strong>{paymentCod} order</strong>
              </li>
              <li>
                <span className="chart-legend-dot chart-tone-bg--success" />
                Transfer <strong>{paymentTransfer} order</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* Ringkasan insentif (M10, F9). Rincian, riwayat, dan aksi simulasi
            tinggal di /merchant/insentif — beranda dapur tidak boleh jadi
            tempat membaca 500px insentif. */}
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
          <p className="merchant-card-sub">
            Periode {credit.rebatePeriod} · {credit.settledThisPeriod} order settled ·{' '}
            {progress.next
              ? `${progress.next - credit.settledThisPeriod} lagi ke ambang ${progress.next}`
              : 'semua ambang terlewati'}
          </p>
          <div className="merchant-quota" role="presentation">
            <span style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
          </div>
          <p className="merchant-card-sub">
            {credit.rebateTier
              ? credit.rebatePaidAt
                ? `Cashback ${money(jodToIdr(credit.rebateAmountJod))} sudah masuk dompet deposit.`
                : `Tier ${credit.rebateTier.replace('tier_', '')} tercapai — cashback ${money(jodToIdr(credit.rebateAmountJod))} menunggu dibayar platform akhir bulan.`
              : 'Belum ada ambang tier yang terlewati periode ini.'}
          </p>
          <Link className="merchant-btn-ghost" to="/insentif">
            Lihat rincian &amp; riwayat
          </Link>
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
