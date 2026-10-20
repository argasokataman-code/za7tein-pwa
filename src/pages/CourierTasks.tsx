import { CheckCircle2, ChevronRight, Coins, HandCoins, Hourglass, Landmark, Route, Truck, UserRound, Wallet } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

import { CourierHomeHero } from '../components/courier/CourierHomeHero'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { Sparkline } from '../components/ui/Sparkline'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { formatDistance, zoneLabel } from '../data/merchant'
import { accountLabel } from '../data/payout'
import {
  COURIER_CHECKPOINT_BADGE,
  courierSelf,
  isActiveTask,
  isDoneTask,
  totalTips,
} from '../data/courier'
import { courierTipsAvailable, courierWeeklyTips } from '../data/courierWallet'
import { BATCH_STATUS_LABEL } from '../data/batch'
import { batchDisplayStatus, batchProgress, nextBatchTask } from '../data/courierBatch'
import { toggleOnline } from '../store/slices/courierSlice'
import type { CourierTask } from '../types'

/** Ringkasan satu tugas aktif sebagai slip: nomor di kepala, isi di badan,
 *  biaya dan pembayaran di kaki. Seluruh slip adalah tautan ke detail. */
function TaskCard({ task }: { task: CourierTask }) {
  const { money } = useMoney()
  // Avatar slip = monogram inisial pelanggan (tugas kurir tak punya foto).
  const initials = task.customerName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <Link className="courier-ticket" to={`/task/${task.id}`}>
      <span className="courier-ticket-stub">
        <span className="courier-task-code">{task.code}</span>
        <span className="courier-ticket-stub-end">
          <span className={`courier-badge courier-badge--${task.checkpoint}`}>
            {COURIER_CHECKPOINT_BADGE[task.checkpoint]}
          </span>
        </span>
      </span>

      <span className="courier-ticket-body">
        <span className="courier-ticket-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="courier-ticket-copy">
          <span className="courier-ticket-name">{task.customerName}</span>
          <span className="courier-task-sub">
            {formatDistance(task.distanceMeters)} · Zona {zoneLabel(task.zone)}
          </span>
        </span>
        <span className="courier-task-total">{money(task.total)}</span>
        <ChevronRight
          size={18}
          strokeWidth={1.75}
          className="courier-ticket-chevron"
          aria-hidden="true"
        />
      </span>

      <span className="courier-task-addr">
        {task.address} · {task.floor} · {task.unit}
      </span>

      <span className="courier-task-foot">
        <span className="courier-task-meta">
          {task.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
        </span>
        <span className="courier-task-cta">
          {task.paymentMethod === 'cod' ? 'COD, tagih tunai' : 'Transfer, cek bukti'}
        </span>
      </span>
    </Link>
  )
}

/**
 * Beranda kurir (R-WALLET-01 + flow f13). Ini dashboard, bukan daftar tugas
 * saja: identitas + status siap/jeda di atas, ringkasan hari ini, pintasan ke
 * dompet dan rekening, baru tugas. Semua angka diturunkan dari `courierSlice`
 * yang sama dengan daftar di bawah, jadi tidak ada angka baru yang dikarang.
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
  const history = tasks.filter((task) => !isActiveTask(task))
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
          <div className="courier-stat courier-stat--tips">
            <span className="courier-stat-icon" aria-hidden="true">
              <Coins size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-stat-copy">
              <span className="courier-stat-label">Tips</span>
              <span className="courier-stat-value">{money(totalTips(tasks))}</span>
            </span>
          </div>
        </div>

        {/* Performa: satu angka fokus (tips tujuh hari) + bentuk harinya.
            Sumbernya mock mingguan yang ditandai di data; PRD tak menetapkan
            laporan performa kurir, jadi ini tampilan tren, bukan aturan. */}
        <section className="courier-card courier-card--navy">
          <div className="chart-card-head">
            <span className="chart-card-icon" aria-hidden="true">
              <HandCoins size={20} strokeWidth={1.75} />
            </span>
            <div className="chart-card-heading">
              <p className="chart-card-title" role="heading" aria-level={2}>Tips 7 hari terakhir</p>
              <p className="chart-card-desc">
                {done.length} tugas selesai · {week.activeDays} hari ada tips · puncak {week.best.label}
              </p>
            </div>
          </div>
          <p className="courier-performa-value">{money(week.total)}</p>
          <Sparkline
            data={week.bars}
            height={48}
            ariaLabel={`Tips tujuh hari terakhir: ${week.total} rupiah, ${week.activeDays} hari ada tips, puncak ${week.best.label}`}
          />
        </section>

        {/* Menu: pintasan ke semua yang bisa dilakukan kurir dari sini,
            termasuk Tips dan Profil yang juga ada di bilah bawah. Pintasan
            bukan pengganti navigasi, jadi keduanya boleh ada. */}
        <nav className="courier-menu" aria-label="Menu kurir">
          <Link className="courier-menu-item" to="/wallet">
            <span className="courier-menu-icon" aria-hidden="true">
              <Wallet size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-menu-copy">
              <span className="courier-menu-title">Dompet kurir</span>
              <span className="courier-menu-sub">{money(balanceAvailable)} tips bisa ditarik</span>
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
              <span className="courier-menu-sub">{money(totalTips(tasks))} dari tugas selesai</span>
            </span>
          </Link>
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

        <section className="courier-section">
          <h2 className="courier-section-title">
            Berjalan {active.length > 0 ? `(${active.length})` : ''}
          </h2>
          {active.length === 0 ? (
            <p className="courier-empty">Belum ada tugas berjalan.</p>
          ) : (
            active.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Riwayat</h2>
          {history.length === 0 ? (
            <p className="courier-empty">Belum ada tugas selesai.</p>
          ) : (
            history.map((task) => (
              <Link key={task.id} className="courier-history" to={`/task/${task.id}`}>
                <span className="courier-ticket-copy">
                  <span className="courier-task-code">{task.code}</span>
                  <span className="courier-task-sub">{task.customerName}</span>
                </span>
                <span className="courier-ticket-stub-end">
                  <span className={`courier-badge courier-badge--${task.checkpoint}`}>
                    {COURIER_CHECKPOINT_BADGE[task.checkpoint]}
                  </span>
                  <span className="courier-history-tip">
                    {isDoneTask(task) ? `Tips ${money(task.tip)}` : 'Belum'}
                  </span>
                </span>
              </Link>
            ))
          )}
        </section>
      </main>
      <CourierBottomNav />
    </div>
  )
}
