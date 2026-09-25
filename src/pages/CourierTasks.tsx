import { ChevronRight, Landmark, Power, UserRound, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { formatDistance, money, zoneLabel } from '../data/merchant'
import { accountLabel } from '../data/payout'
import {
  COURIER_CHECKPOINT_LABEL,
  courierSelf,
  isActiveTask,
  isDoneTask,
  totalTips,
} from '../data/courier'
import { courierTipsAvailable } from '../data/courierWallet'
import { toggleOnline } from '../store/slices/courierSlice'
import type { CourierTask } from '../types'

/** Ringkasan satu tugas aktif; seluruh kartu adalah tautan ke detail checkpoint. */
function TaskCard({ task }: { task: CourierTask }) {
  return (
    <Link className="courier-task" to={`/task/${task.id}`}>
      <div className="courier-task-head">
        <div className="courier-task-copy">
          <p className="courier-task-code">{task.code}</p>
          <p className="courier-task-sub">
            {task.customerName} · {formatDistance(task.distanceMeters)} · Zona {zoneLabel(task.zone)}
          </p>
        </div>
        <span className="courier-badge">{COURIER_CHECKPOINT_LABEL[task.checkpoint]}</span>
      </div>

      <p className="courier-task-addr">
        {task.address} · {task.floor} · {task.unit}
      </p>

      <div className="courier-task-foot">
        <span className="courier-task-meta">
          {task.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
        </span>
        <span className="courier-task-total">{money(task.total)}</span>
      </div>

      <span className="courier-task-cta">
        {task.paymentMethod === 'cod' ? 'COD — tagih tunai' : 'Transfer — cek bukti'}
        <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
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
  const dispatch = useAppDispatch()
  const isOnline = useAppSelector((s) => s.courier.isOnline)
  const tasks = useAppSelector((s) => s.courier.tasks)
  const payouts = useAppSelector((s) => s.courier.payouts)
  const accounts = useAppSelector((s) => s.courier.payoutAccounts)
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0]

  const active = tasks.filter(isActiveTask)
  const history = tasks.filter((task) => !isActiveTask(task))
  const waitingOtp = tasks.filter((task) => task.checkpoint === 'tiba').length
  const done = tasks.filter(isDoneTask)
  const tipsAvailable = courierTipsAvailable(tasks, payouts)

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Antar hari ini" title="Beranda" />

        {/* Identitas + satu kontrol utama: siap atau jeda. Status dan tombolnya
            satu kartu supaya keputusan "bisa dihubungi atau tidak" ada di
            tempat yang sama, bukan terpisah. */}
        <section className="courier-card">
          <div className="courier-identity">
            <span className="courier-avatar" aria-hidden="true">
              <UserRound size={28} strokeWidth={1.75} />
            </span>
            <div className="courier-hero-copy">
              <p className="courier-card-title">{courierSelf.name}</p>
              <p className="courier-card-sub">{courierSelf.phone}</p>
            </div>
            <span className={`courier-status${isOnline ? ' is-on' : ''}`}>
              <span className="courier-status-dot" aria-hidden="true" />
              {isOnline ? 'Siap' : 'Jeda'}
            </span>
          </div>
          <p className="courier-card-sub courier-hero-hint">
            {isOnline
              ? 'Tugas dari merchant masuk otomatis.'
              : 'Tugas baru ditahan sampai kamu siap lagi.'}
          </p>
          <button
            type="button"
            className={`courier-toggle ${isOnline ? 'is-on' : ''}`}
            onClick={() => dispatch(toggleOnline())}
          >
            <Power size={18} strokeWidth={1.75} aria-hidden="true" />
            {isOnline ? 'Jeda dulu' : 'Siap sekarang'}
          </button>
        </section>

        {/* Ringkasan hari ini: empat angka dari `courierSlice` yang sama dengan
            daftar di bawah, bukan angka baru. */}
        <nav className="courier-statline" aria-label="Ringkasan hari ini">
          <span>
            <strong>{active.length}</strong> Aktif
          </span>
          <span>
            <strong>{waitingOtp}</strong> Menunggu OTP
          </span>
          <span>
            <strong>{done.length}</strong> Selesai
          </span>
          <span>
            <strong>{money(totalTips(tasks))}</strong> Tips
          </span>
        </nav>

        {/* Pintasan ke hal yang tidak ada di bilah bawah: dompet dan rekening. */}
        <nav className="courier-quick" aria-label="Pintasan">
          <Link className="courier-quick-action" to="/wallet">
            <span className="courier-quick-icon" aria-hidden="true">
              <Wallet size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-quick-copy">
              <span className="courier-quick-title">Dompet tips</span>
              <span className="courier-quick-sub">{money(tipsAvailable)} bisa ditarik</span>
            </span>
            <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link className="courier-quick-action" to="/payout-accounts">
            <span className="courier-quick-icon" aria-hidden="true">
              <Landmark size={20} strokeWidth={1.75} />
            </span>
            <span className="courier-quick-copy">
              <span className="courier-quick-title">Rekening pencairan</span>
              <span className="courier-quick-sub">
                {primary ? accountLabel(primary) : 'Belum ada rekening tujuan'}
              </span>
            </span>
            <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
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
                <div>
                  <p className="courier-task-code">{task.code}</p>
                  <p className="courier-task-sub">
                    {task.customerName} · {COURIER_CHECKPOINT_LABEL[task.checkpoint]}
                  </p>
                </div>
                <span className="courier-history-tip">
                  {isDoneTask(task) ? `Tips ${money(task.tip)}` : '—'}
                </span>
              </Link>
            ))
          )}
        </section>

        <p className="courier-note">
          Tips selesai hari ini {money(totalTips(tasks))}. Kurir adalah karyawan merchant —
          platform tidak menahan dana kurir (C-06).
        </p>
      </main>
      <CourierBottomNav />
    </div>
  )
}
