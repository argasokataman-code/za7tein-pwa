import { Bike, ChevronRight, Clock, PackageCheck, PlusCircle, Sparkles, Star, TicketPercent, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { DonutChart } from '../components/ui/DonutChart'
import { TrendBars } from '../components/ui/TrendBars'
import { MerchantHomeHero, type StoreStatus } from '../components/merchant/MerchantHomeHero'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { apiEnabled } from '../api/supabase'
import { jodToIdr } from '../data/currency'
import { rebateProgress } from '../data/incentive'
import { orderStatusLabel } from '../data/merchantOrders'
import {
  menuSalesRanking,
  orderMixSegments,
  paymentMixSegments,
  revenueTrendBars,
  topMenuShare,
  trendTotals,
  type MenuSalesRow,
} from '../data/merchantTrend'
import { switchBlockCopy } from '../data/superadmin'
import { setStoreActive, setStoreBusy } from '../store/slices/merchantSlice'

/** Baris peringkat yang tampil sebelum daftar dibuka. */
const TOP_MENU_ROWS = 5

/**
 * Satu batang grafik "Menu terjual". Satu aksen saja (`chart-tone-bg--brand`)
 * untuk semua batang — variasi warna per item hanya mengulang urutan yang sudah
 * terbaca dari panjang batang. Omzet & jumlah order ikut ditampilkan di sheet
 * detail, bukan di kartu beranda, supaya kartunya tetap satu ide.
 */
function MenuSalesBar({
  row,
  max,
  revenue,
  showMeta,
}: {
  row: MenuSalesRow
  max: number
  revenue: string
  showMeta: boolean
}) {
  return (
    <li className="menu-chart__item">
      <span className="menu-chart__head">
        <span className="menu-chart__name">{row.name}</span>
        <span className="menu-chart__value">
          <strong>{row.sold}</strong> porsi
        </span>
      </span>
      <span className="menu-chart__track" aria-hidden="true">
        <span
          className="menu-chart__fill chart-tone-bg--brand"
          style={{ width: `${Math.max(4, (row.sold / max) * 100)}%` }}
        />
      </span>
      {showMeta ? (
        <span className="menu-chart__meta">
          {revenue} · {row.orders} order
        </span>
      ) : null}
    </li>
  )
}

/** Copy konfirmasi per status — setiap perubahan status minta ketuk kedua. */
const STATUS_CONFIRM: Record<StoreStatus, { title: string; body: string; confirmLabel: string }> = {
  buka: {
    title: 'Buka toko?',
    body: 'Order baru mulai masuk lagi seperti biasa.',
    confirmLabel: 'Buka toko',
  },
  sibuk: {
    title: 'Tandai sibuk?',
    body: 'Toko tetap buka, tapi order baru ditahan sebentar sampai kamu ubah lagi.',
    confirmLabel: 'Tandai sibuk',
  },
  tutup: {
    title: 'Tutup toko?',
    body: 'Order baru berhenti masuk sampai kamu buka lagi. Order yang sedang berjalan tetap lanjut.',
    confirmLabel: 'Tutup toko',
  },
}

export default function MerchantDashboard() {
  const { money, moneyPlain } = useMoney()
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((s) => s.merchant.isActive)
  const isBusy = useAppSelector((s) => s.merchant.isBusy)
  const storeStatus: StoreStatus = isActive ? (isBusy ? 'sibuk' : 'buka') : 'tutup'
  const logo = useAppSelector((s) => s.merchant.logo)
  const storeName = useAppSelector((s) => s.merchant.storeName)
  const closeTime = useAppSelector((s) => s.merchant.closeTime)
  const [pendingStatus, setPendingStatus] = useState<StoreStatus | null>(null)
  const [menuDetailOpen, setMenuDetailOpen] = useState(false)
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
  const menuRows = menuSales.slice(0, TOP_MENU_ROWS)
  const orderMix = orderMixSegments(orders)
  const paymentMix = paymentMixSegments(orders)
  const paymentByLabel = (prefix: string) =>
    paymentMix.find((s) => s.label.startsWith(prefix))?.value ?? 0
  const paymentCod = paymentByLabel('COD')
  const paymentTransfer = paymentByLabel('Transfer')
  const paymentTotal = paymentCod + paymentTransfer || 1

  // Refresh menampilkan nilai seed dulu (~1,5 dtk) lalu melompat ke data API:
  // "Rp256.000" → "Rp16.146.930", foto mock → ikon. Tahan render sampai order
  // dan profil mendarat sekali. API mati / gagal → tetap jalan dengan seed.
  const ordersHydrated = useAppSelector((s) => s.merchant.ordersHydrated)
  const profileHydrated = useAppSelector((s) => s.merchant.profileHydrated)
  const ordersError = useAppSelector((s) => s.merchant.ordersError)
  const profileError = useAppSelector((s) => s.merchant.profileError)
  // ponytail: fail-safe 4 dtk — jaringan menggantung tak boleh menahan kerangka
  // selamanya; kalau lewat, tampilkan seed apa adanya (normalnya 1,5–2 dtk).
  const [hydrateExpired, setHydrateExpired] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setHydrateExpired(true), 4000)
    return () => window.clearTimeout(t)
  }, [])
  // API gagal → tampilkan seed + banner, jangan menunggu kerangka sampai
  // fail-safe 4 dtk (audit 012 #2).
  const loadError = apiEnabled && (ordersError || profileError)
  const ready =
    !apiEnabled || hydrateExpired || loadError || (ordersHydrated && profileHydrated)

  if (!ready) {
    return (
      <div className="app-shell">
        <main className="merchant-page">
          <div
            className="merchant-skeleton"
            role="status"
            aria-busy="true"
            aria-label="Memuat beranda merchant"
          >
            <span className="sr-only">Memuat beranda merchant</span>
            <div className="skeleton-pulse merchant-skel merchant-skel--hero" />
            <div className="skeleton-pulse merchant-skel merchant-skel--revenue" />
            <div className="skeleton-pulse merchant-skel merchant-skel--card" />
            <div className="skeleton-pulse merchant-skel merchant-skel--card" />
            <div className="skeleton-pulse merchant-skel merchant-skel--rows" />
          </div>
        </main>
        <MerchantBottomNav />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantHomeHero
          name={storeName}
          logo={logo}
          status={storeStatus}
          closeTime={closeTime}
          todayOrderCount={todayOrderCount}
          dailyLimit={dailyLimit}
          // Tiap perubahan status minta konfirmasi (ketuk kedua): salah sentuh
          // langsung mengubah aliran order, jadi tak boleh satu tap.
          onSelectStatus={(next) => {
            if (next === storeStatus) return
            setPendingStatus(next)
          }}
        />

        {maintenanceCopy ? <PlatformNotice message={maintenanceCopy} /> : null}
        {loadError ? (
          <PlatformNotice message="Gagal memuat data terbaru. Menampilkan data terakhir yang tersimpan." />
        ) : null}

        {/* Kartu "Buka toko" dan "Kuota harian" dilebur ke hero di atas: ketiganya
            menjawab satu hal yang sama — apakah toko menerima order dan berapa
            jatahnya hari ini. Menampilkannya sekali, bukan dua kali. */}

        {/* Kartu pendapatan: satu kartu lebar penuh dengan angka 2xl + batang
            tujuh hari. Sebelumnya ini kotak keempat dari grid 2×2 yang keempat
            kartunya seragam — terukur 73/73/99/99px dan SEMUA nilai 17,01px,
            jadi "Rp256.000" dan "2 order" dicetak sama besar (audit-002 #2/#3).
            Sekarang uangnya jadi satu-satunya titik fokus, dan tiga angka
            sisanya turun pangkat jadi satu baris teks. */}
        <section className="merchant-revenue">
          <div className="chart-card-head">
            <span className="chart-card-icon" aria-hidden="true">
              <TrendingUp size={20} strokeWidth={1.75} />
            </span>
            <div className="chart-card-heading">
              <p className="chart-card-title" role="heading" aria-level={2}>Pendapatan</p>
              <p className="chart-card-desc">
                7 hari (ribu rupiah) · {trend.orders} order jalan · puncak{' '}
                {trend.best?.label ?? '-'}
              </p>
            </div>
          </div>
          <p className="merchant-revenue-value">{money(revenue)}</p>
          <TrendBars
            data={revenueTrendBars()}
            formatValue={(value) => String(value)}
            ariaLabel={`Pendapatan tujuh hari terakhir dalam ribuan rupiah: ${trend.revenueIdr} total, puncak ${trend.best?.label ?? '-'}`}
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
            Bentuk harinya sudah ada di batang tujuh hari, dan dua kali
            menunjukkan hal yang sama bukan kelengkapan. Angka yang menjaganya
            tetap konsisten: `merchantTrend` adalah sumber yang sama untuk kartu,
            batang, dan baris di atasnya. */}
        {/* Peringkat menu: `decision data`, bukan laporan. Ember statistik cuma
            memberi tahu apa yang sedang terjadi; ini memberi tahu menu mana yang
            layak diperhatikan. Diturunkan dari `CartItem` di order yang sudah
            ada — nol mock baru. Rentangnya WAJIB disebut, karena delapan order
            ini sekitar setengah jam terakhir, bukan sepanjang masa. Kartu hanya
            memuat 5 batang teratas (grafik, bukan daftar); sisa menu dibuka di
            sheet "Lihat detail" supaya kartu lain tidak terdorong jauh ke bawah. */}
        <section className="merchant-card">
          <div className="merchant-card-head">
            <div>
              <p className="merchant-card-title" role="heading" aria-level={2}>Menu terjual</p>
              <p className="merchant-card-sub">
                {menuSales.length} menu dari {orders.length} order terakhir
              </p>
            </div>
          </div>
          {menuSales.length === 0 ? (
            <p className="merchant-empty">
              Belum ada order masuk. Penjualan menu muncul setelah order pertama.
            </p>
          ) : menuSales.length === 1 ? (
            /* Satu menu = tidak ada yang dibandingkan: batang 100% hanya dekorasi
               dan sheet satu baris tidak menambah informasi. Kartu jadi blok
               angka: nama menu sebagai label, porsi sebagai angka utama, omzet
               + jumlah order sebagai konteks. */
            <div className="menu-leader">
              <p className="menu-leader__name">{menuSales[0].name}</p>
              <div className="menu-leader__row">
                <p className="menu-leader__figure">
                  <strong>{menuSales[0].sold}</strong> <span>porsi</span>
                </p>
                <p className="menu-leader__meta">
                  <strong>{moneyPlain(menuSales[0].revenueIdr)}</strong>
                  <span> · {menuSales[0].orders} order</span>
                </p>
              </div>
            </div>
          ) : (
            <>
              <ul className="menu-chart">
                {menuRows.map((row) => (
                  <MenuSalesBar
                    key={row.id}
                    row={row}
                    max={topSold}
                    revenue={moneyPlain(row.revenueIdr)}
                    showMeta={false}
                  />
                ))}
              </ul>
              <button
                type="button"
                className="menu-chart-more"
                onClick={() => setMenuDetailOpen(true)}
              >
                Lihat detail {menuSales.length} menu
              </button>
            </>
          )}
        </section>

        {/* Judulnya "Komposisi order", bukan "hari ini": mock tidak punya
            tanggal pesanan (`placedAt` teks relatif), jadi klaim "hari ini"
            tidak bisa dibuktikan (audit-003 #4). */}
        <section className="merchant-card">
          <div className="merchant-card-head">
            <div>
              <p className="merchant-card-title" role="heading" aria-level={2}>Komposisi order</p>
              <p className="merchant-card-sub">{orders.length} order sedang dipantau</p>
            </div>
          </div>
          {orderMix.length === 0 ? (
            <p className="merchant-empty">
              Belum ada order untuk dipantau. Komposisi status muncul saat order masuk.
            </p>
          ) : (
            <>
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
            </>
          )}
        </section>

        {/* Ringkasan insentif (M10, F9). Rincian, riwayat, dan aksi simulasi
            tinggal di /merchant/insentif — beranda dapur tidak boleh jadi
            tempat membaca 500px insentif. */}
        <section className="merchant-card merchant-card--navy">
          <div className="merchant-row">
            <Sparkles size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title" role="heading" aria-level={2}>Modal &amp; insentif</p>
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
          <Link className="merchant-action-row" to="/insentif">
            <span>Lihat rincian &amp; riwayat</span>
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Order terbaru</h2>            <Link to="/orders">Lihat semua</Link>
          </div>
          {orders.length === 0 ? (
            <p className="merchant-empty">Belum ada order masuk.</p>
          ) : (
            orders.slice(0, 3).map((order) => (
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
            ))
          )}
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
          <Link className="merchant-quick-action" to="/promos">
            <span className="merchant-quick-icon">
              <TicketPercent size={20} strokeWidth={1.75} />
            </span>
            <div>
              <p className="merchant-quick-title">Promo &amp; Diskon</p>
              <p className="merchant-quick-sub">Atur kode promo dan carousel beranda</p>
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
          <Link className="merchant-quick-action" to="/subscription">
            <span className="merchant-quick-icon">
              <PackageCheck size={20} strokeWidth={1.75} />
            </span>
            <div>
              <p className="merchant-quick-title">Kuota &amp; Langganan</p>
              <p className="merchant-quick-sub">Sisa kuota order &amp; COD, beli paket</p>
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
          open={pendingStatus !== null}
          title={pendingStatus ? STATUS_CONFIRM[pendingStatus].title : ''}
          body={pendingStatus ? STATUS_CONFIRM[pendingStatus].body : ''}
          confirmLabel={pendingStatus ? STATUS_CONFIRM[pendingStatus].confirmLabel : ''}
          onConfirm={() => {
            if (!pendingStatus) return
            if (pendingStatus === 'tutup') {
              dispatch(setStoreActive(false))
            } else {
              dispatch(setStoreBusy(pendingStatus === 'sibuk'))
              dispatch(setStoreActive(true))
            }
            setPendingStatus(null)
          }}
          onClose={() => setPendingStatus(null)}
        />

        <BottomSheet
          open={menuDetailOpen}
          title="Menu terjual"
          onClose={() => setMenuDetailOpen(false)}
        >
          <p className="merchant-card-sub">
            {menuSales.length} menu dari {orders.length} order terakhir.
            {topMenu
              ? ` ${topMenu.name} menyumbang ${Math.round(topMenu.share * 100)}% porsi terjual dari ${topMenu.orders} order.`
              : ''}
          </p>
          <ul className="menu-chart menu-chart--detail">
            {menuSales.map((row) => (
              <MenuSalesBar
                key={row.id}
                row={row}
                max={topSold}
                revenue={moneyPlain(row.revenueIdr)}
                showMeta
              />
            ))}
          </ul>
        </BottomSheet>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
