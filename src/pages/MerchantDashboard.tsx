import { Bike, ChevronRight, Clock, PlusCircle, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { DonutChart } from '../components/ui/DonutChart'
import { Sparkline } from '../components/ui/Sparkline'
import { MerchantHomeHero } from '../components/merchant/MerchantHomeHero'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { mockMerchant, money } from '../data/merchant'
import { jodToIdr, moneyPlain } from '../data/currency'
import { rebateProgress } from '../data/incentive'
import { orderStatusLabel } from '../data/merchantOrders'
import {
  menuSalesRanking,
  orderMixSegments,
  paymentMixSegments,
  revenueTrendBars,
  topMenuShare,
  trendTotals,
} from '../data/merchantTrend'
import { switchBlockCopy } from '../data/superadmin'
import { toggleActive } from '../store/slices/merchantSlice'

export default function MerchantDashboard() {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((s) => s.merchant.isActive)
  const logo = useAppSelector((s) => s.merchant.logo)
  const storeName = useAppSelector((s) => s.merchant.storeName)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
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
  const menuSales = menuSalesRanking(orders)
  const topMenu = topMenuShare(menuSales)
  const topSold = menuSales[0]?.sold ?? 1
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
        <MerchantHomeHero
          name={storeName}
          logo={logo}
          isActive={isActive}
          closeTime={mockMerchant.closeTime}
          todayOrderCount={todayOrderCount}
          dailyLimit={dailyLimit}
          // Buka cukup satu tap. Tutup menahan order baru, jadi minta konfirmasi
          // dulu — salah sentuh di sini langsung menghentikan pemasukan.
          onToggle={() => (isActive ? setCloseConfirmOpen(true) : dispatch(toggleActive()))}
        />

        {maintenanceCopy ? <PlatformNotice message={maintenanceCopy} /> : null}

        {/* Kartu "Buka toko" dan "Kuota harian" dilebur ke hero di atas: ketiganya
            menjawab satu hal yang sama — apakah toko menerima order dan berapa
            jatahnya hari ini. Menampilkannya sekali, bukan dua kali. */}

        {/* Kartu pendapatan: satu kartu lebar penuh dengan angka 2xl + sparkline
            tujuh hari. Sebelumnya ini kotak keempat dari grid 2×2 yang keempat
            kartunya seragam — terukur 73/73/99/99px dan SEMUA nilai 17,01px,
            jadi "Rp256.000" dan "2 order" dicetak sama besar (audit-002 #2/#3).
            Sekarang uangnya jadi satu-satunya titik fokus, dan tiga angka
            sisanya turun pangkat jadi satu baris teks. */}
        <section className="merchant-revenue">
          <p className="merchant-revenue-label">Pendapatan</p>
          <p className="merchant-revenue-value">{money(revenue)}</p>
          <p className="merchant-revenue-sub">
            7 hari · {trend.orders} order jalan · puncak {trend.best?.label ?? '-'}
          </p>
          <Sparkline
            data={revenueTrendBars()}
            ariaLabel={`Pendapatan tujuh hari terakhir dalam ribuan rupiah: ${trend.revenueIdr} total`}
          />
        </section>

        {/* Baris "Antrean / Diproses / Selesai" dibuang: ketiga angkanya sudah
            ada di legenda donut "Komposisi order" di bawah, dan dua di antaranya
            identik ("Antrean" = "Baru", "Selesai" = "Selesai") sementara
            "Diproses" = "Diproses" + "Diantar". Satu angka berarti, satu tempat.

            Yang hilang bersama barisnya adalah tautannya ke tab Order, dan itu
            dipindahkan ke legenda donut: tiap potongan yang punya tab persis
            sekarang bisa ditekan. Jadi navigasinya tidak berkurang, cuma
            berpindah ke tempat angkanya memang dibaca. */}

        {/* Konsekuensi kartu pendapatan: bar chart "Tren 7 hari" 371px dihapus.
            Bentuk harinya sudah ada di sparkline, dan dua kali menunjukkan hal
            yang sama bukan kelengkapan. Angka yang menjaganya tetap konsisten:
            `merchantTrend` adalah sumber yang sama untuk kartu, sparkline, dan
            baris di atasnya. */}
        {/* Peringkat menu: `decision data`, bukan laporan. Ember statistik cuma
            memberi tahu apa yang sedang terjadi; ini memberi tahu menu mana yang
            layak diperhatikan. Diturunkan dari `CartItem` di order yang sudah
            ada — nol mock baru. Rentangnya WAJIB disebut, karena delapan order
            ini sekitar setengah jam terakhir, bukan sepanjang masa. */}
        <section className="merchant-card">
          <div className="merchant-card-head">
            <div>
              <p className="merchant-card-title">Menu terjual</p>
              <p className="merchant-card-sub">{orders.length} order terakhir</p>
            </div>
          </div>
          {topMenu ? (
            <p className="merchant-card-sub">
              {topMenu.name} menyumbang {Math.round(topMenu.share * 100)}% porsi terjual dari{' '}
              {topMenu.orders} order.
            </p>
          ) : null}
          <ul className="merchant-rank">
            {menuSales.map((row, index) => (
              <li key={row.id}>
                <span className="merchant-rank-name">{row.name}</span>
                <span className="merchant-rank-bar" aria-hidden="true">
                  <span
                    className={index === 0 ? 'chart-tone-bg--brand' : 'chart-tone-bg--muted'}
                    style={{ width: `${(row.sold / topSold) * 100}%` }}
                  />
                </span>
                <span className="merchant-rank-figures">
                  <strong>{row.sold}</strong> porsi · {moneyPlain(row.revenueIdr)}
                </span>
              </li>
            ))}
          </ul>
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
              {orderMix.map((segment) => {
                // Hanya potongan yang punya tab persis yang bisa ditekan.
                // "Diantar" subset dari tab `diproses` (diterima/dimasak/diantar/
                // tiba), jadi tautan ke sana akan mendarat di daftar yang lebih
                // luas dari labelnya — lebih menyesatkan daripada tidak ada
                // tautan sama sekali.
                const isi = (
                  <>
                    <span className={`chart-legend-dot chart-tone-bg--${segment.tone}`} />
                    <span className="chart-legend-label">{segment.label}</span>
                    <span className="chart-legend-value">{segment.value} order</span>
                  </>
                )
                return (
                  <li key={segment.label}>
                    {segment.tab ? (
                      <Link className="chart-legend-link" to={`/orders?tab=${segment.tab}`}>
                        {isi}
                      </Link>
                    ) : (
                      <span className="chart-legend-link is-static">{isi}</span>
                    )}
                  </li>
                )
              })}
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

        {/* Dua kartu 52px untuk dua kalimat yang masing-masing satu baris:
            bentuk kartu mengesankan tiap kalimat berdiri sendiri, padahal
            keduanya satu jenis pesan — "ada yang diatur di halaman lain".
            Digabung jadi satu kartu; tingginya tetap ~52px karena barisnya
            bersebelahan, bukan bertumpuk. */}
        <section className="merchant-card merchant-hint-list" aria-label="Diatur di halaman lain">
          <p className="merchant-hint-list-item">
            <Clock size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>Estimasi masak diatur di halaman Order.</span>
          </p>
          <p className="merchant-hint-list-item">
            <Bike size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>Kurir khusus diatur di halaman Kurir.</span>
          </p>
        </section>

        <ConfirmSheet
          open={closeConfirmOpen}
          title="Tutup toko?"
          body="Order baru berhenti masuk sampai kamu buka lagi. Order yang sedang berjalan tetap lanjut."
          confirmLabel="Tutup toko"
          onConfirm={() => {
            dispatch(toggleActive())
            setCloseConfirmOpen(false)
          }}
          onClose={() => setCloseConfirmOpen(false)}
        />
      </main>
      <MerchantBottomNav />
    </div>
  )
}
