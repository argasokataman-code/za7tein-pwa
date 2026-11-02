import { CheckCircle2, ChevronRight, Coins, HandCoins, Hourglass, Landmark, Route, Truck, UserRound, Wallet } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

import { CourierHomeHero } from '../components/courier/CourierHomeHero'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { TrendBars } from '../components/ui/TrendBars'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { accountLabel } from '../data/payout'
import { courierSelf, isActiveTask, isDoneTask, totalTips } from '../data/courier'
import { TIPS_ENABLED } from '../data/features'
import { courierTipsAvailable, courierWeeklyTips } from '../data/courierWallet'
import { BATCH_STATUS_LABEL } from '../data/batch'
import { batchDisplayStatus, batchProgress, nextBatchTask } from '../data/courierBatch'
import { toggleOnline } from '../store/slices/courierSlice'

/**
 * Beranda kurir (R-WALLET-01 + flow f13). Ini dashboard, bukan daftar tugas:
 * identitas + status siap/jeda, ringkasan hari ini, pintu batch, dan tautan ke
 * tab Order. Daftar order (aktif + riwayat) tinggal di `/courier/orders` supaya
 * satu data satu tempat. Semua angka diturunkan dari `courierSlice` yang sama
 * dengan halaman itu, jadi tidak ada angka baru yang dikarang.
 * PRD aktif tidak punya requirement dashboard kurir, jadi ini murni tampilan
 * state yang ada.
 */
export default function CourierTasks() {
  const { money } = useMoney()
  const dispatch = useAppDispatch()
  const isOnline = useAppSelector((s) => s.courier.isOnline)
  const tasks = useAppSelector((s) => s.courier.tasks)
  const batch = useAppSelector((s) => s.courier.batch)
  const payouts = useAppSelector((s) => s.courier.payouts)
  const accounts = useAppSelector((s) => s.courier.payoutAccounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  const active = tasks.filter(isActiveTask)
  const waitingOtp = tasks.filter((task) => task.checkpoint === 'tiba').length
  const done = tasks.filter(isDoneTask)
  const balanceAvailable = courierTipsAvailable(tasks, payouts)
  const courierKind = useAppSelector((s) => s.auth.courierKind)
  const week = courierWeeklyTips()
  // Batch (M5): angka dihitung sekali, bukan diulang di JSX.
  const batchDone = batch ? batchProgress(batch, tasks) : null
  const batchStatus = batch ? batchDisplayStatus(batch, tasks) : null
  const nextStop = batch ? nextBatchTask(batch, tasks) : null

  // Partner bukan karyawan merchant: tidak ada batch, tips, atau dompet toko.
  // Permukaannya satu layar `/partner` (COU-15 satu order per waktu).
  if (courierKind === 'partner') return <Navigate to="/partner" replace />

  return (
    <div className="app-shell">
      <main className="courier-page">
        {/* Identitas, status siap/jeda, dan ringkasan hari ini satu bidang
            merek di puncak beranda (komponen `CourierHomeHero`), bukan lagi
            tiga blok terpisah: kartu identitas + ringkasan statline. */}
        <CourierHomeHero
          name={courierSelf.name}
          phone={courierSelf.phone}
          online={isOnline}
          onToggleOnline={() => dispatch(toggleOnline())}
        />

        {/* Batch kurir inhouse (M5): satu pintu ke urutan antar. Muncul hanya
            saat merchant sudah menugaskan batch, jadi beranda kurir lepas tetap
            bersih. */}
        {batch && batchDone && batchStatus && (
          <Link className="courier-batch-banner" to="/batch">
            <span className="courier-menu-icon" aria-hidden="true">
              <Route size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-batch-banner-copy">
              <span className="courier-batch-banner-title">
                Batch antar · {batchDone.done}/{batchDone.total} selesai
              </span>
              <span className="courier-task-sub">
                {BATCH_STATUS_LABEL[batchStatus]}
                {nextStop ? ` · berikutnya ${nextStop.code}` : ''}
              </span>
            </span>
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        )}

        {/* Ringkasan hari ini: empat angka dari `courierSlice` yang sama dengan
            daftar di bawah, sebagai tile 2x2 (chip ikon berwarna + label +
            angka). Warna chip satu bahasa dengan badge status tiket, jadi bisa
            dipindai sekali lirik, bukan dibaca berderet. */}
        <div className="courier-stats">
          <div className="courier-stat">
            <span className="courier-stat-icon" aria-hidden="true">
              <Truck size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-stat-copy">
              <span className="courier-stat-label">Aktif</span>
              <span className="courier-stat-value">{active.length}</span>
            </span>
          </div>
          <div className="courier-stat courier-stat--otp">
            <span className="courier-stat-icon" aria-hidden="true">
              <Hourglass size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-stat-copy">
              <span className="courier-stat-label">Menunggu OTP</span>
              <span className="courier-stat-value">{waitingOtp}</span>
            </span>
          </div>
          <div className="courier-stat courier-stat--selesai">
            <span className="courier-stat-icon" aria-hidden="true">
              <CheckCircle2 size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-stat-copy">
              <span className="courier-stat-label">Selesai</span>
              <span className="courier-stat-value">{done.length}</span>
            </span>
          </div>
          {TIPS_ENABLED ? (
            <div className="courier-stat courier-stat--tips">
              <span className="courier-stat-icon" aria-hidden="true">
                <Coins size={20} strokeWidth={1.75} />
              </span>
              <span className="courier-stat-copy">
                <span className="courier-stat-label">Tips</span>
                <span className="courier-stat-value">{money(totalTips(tasks))}</span>
              </span>
            </div>
          ) : null}
        </div>

        {/* Performa: satu angka fokus (tips tujuh hari) + bentuk harinya.
            Sumbernya mock mingguan yang ditandai di data; PRD tak menetapkan
            laporan performa kurir, jadi ini tampilan tren, bukan aturan. Ikut
            disembunyikan saat `TIPS_ENABLED` false. */}
        {TIPS_ENABLED ? (
          <section className="courier-card courier-card--navy">
            <div className="chart-card-head">
              <span className="chart-card-icon" aria-hidden="true">
                <HandCoins size={20} strokeWidth={1.75} />
              </span>
              <div className="chart-card-heading">
                <p className="chart-card-title" role="heading" aria-level={2}>Tips 7 hari terakhir</p>
                <p className="chart-card-desc">
                  {done.length} tugas selesai · {week.activeDays} hari ada tips (ribu rupiah) · puncak{' '}
                  {week.best.label}
                </p>
              </div>
            </div>
            <p className="courier-performa-value">{money(week.total)}</p>
            <TrendBars
              data={week.bars}
              formatValue={(value) => String(Math.round(value / 1000))}
              ariaLabel={`Tips tujuh hari terakhir: ${week.total} rupiah, ${week.activeDays} hari ada tips, puncak ${week.best.label}`}
            />
          </section>
        ) : null}

        {/* Menu: pintasan ke semua yang bisa dilakukan kurir dari sini,
            termasuk Tips dan Profil yang juga ada di bilah bawah. Pintasan
            bukan pengganti navigasi, jadi keduanya boleh ada. Saat fitur tips
            disembunyikan (`TIPS_ENABLED` false) isinya tinggal Profil, yang
            sudah ada di bilah bawah: satu pintasan duplikat tidak layak jadi
            kartu sendiri, jadi menunya ikut hilang. */}
        {TIPS_ENABLED ? (
        <nav className="courier-menu" aria-label="Menu kurir">
          {/* Dompet, rekening pencairan, dan riwayat tips isinya tips semua,
              jadi ikut disembunyikan saat `TIPS_ENABLED` false. */}
          {TIPS_ENABLED ? (
            <>
              <Link className="courier-menu-item" to="/wallet">
                <span className="courier-menu-icon" aria-hidden="true">
                  <Wallet size={20} strokeWidth={1.75} />
                </span>
                <span className="courier-menu-copy">
                  <span className="courier-menu-title">Dompet kurir</span>
                  <span className="courier-menu-sub">
                    {money(balanceAvailable)} tips bisa ditarik
                  </span>
                </span>
              </Link>
              <Link className="courier-menu-item" to="/payout-accounts">
                <span className="courier-menu-icon" aria-hidden="true">
                  <Landmark size={20} strokeWidth={1.75} />
                </span>
                <span className="courier-menu-copy">
                  <span className="courier-menu-title">Rekening pencairan</span>
                  <span className="courier-menu-sub">
                    {primary ? accountLabel(primary) : 'Belum ada rekening'}
                  </span>
                </span>
              </Link>
              <Link className="courier-menu-item" to="/tips">
                <span className="courier-menu-icon" aria-hidden="true">
                  <Coins size={20} strokeWidth={1.75} />
                </span>
                <span className="courier-menu-copy">
                  <span className="courier-menu-title">Riwayat tips</span>
                  <span className="courier-menu-sub">
                    {money(totalTips(tasks))} dari tugas selesai
                  </span>
                </span>
              </Link>
            </>
          ) : null}
          <Link className="courier-menu-item" to="/profile">
            <span className="courier-menu-icon" aria-hidden="true">
              <UserRound size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-menu-copy">
              <span className="courier-menu-title">Profil</span>
              <span className="courier-menu-sub">Akun & status siap</span>
            </span>
          </Link>
        </nav>
        ) : null}

        {/* Daftar order pindah ke tab Order (`/courier/orders`): beranda
            memuat identitas, ringkasan, dan pintu batch saja. Kalau daftar
            tetap di sini, dua tempat memuat data yang sama dan salah satunya
            selalu ketinggalan. */}
        <Link className="courier-orders-link" to="/orders">
          <span className="courier-orders-link-copy">
            <span className="courier-orders-link-title">Lihat semua order</span>
            <span className="courier-task-sub">
              {active.length > 0 ? `${active.length} tugas berjalan` : 'Belum ada tugas berjalan'}
            </span>
          </span>
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </main>
      <CourierBottomNav />
    </div>
  )
}
