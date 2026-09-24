import { ChevronRight, Power } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { formatDistance, money, zoneLabel } from '../data/merchant'
import {
  COURIER_CHECKPOINT_LABEL,
  isActiveTask,
  isDoneTask,
  totalTips,
} from '../data/courier'
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

export default function CourierTasks() {
  const dispatch = useAppDispatch()
  const isOnline = useAppSelector((s) => s.courier.isOnline)
  const tasks = useAppSelector((s) => s.courier.tasks)

  const active = tasks.filter(isActiveTask)
  const history = tasks.filter((task) => !isActiveTask(task))
  const waitingOtp = tasks.filter((task) => task.checkpoint === 'tiba').length
  const done = tasks.filter(isDoneTask)

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Antar hari ini" title="Tugas" />

        {/* Ringkasan hari ini: empat angka dari `courierSlice` yang sama dengan
            daftar di bawah, bukan angka baru. Fokus tetap tugas berjalan; ini
            pembacaan sekilas sebelum menggulir. */}
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

        <section className="courier-card">
          <div className="courier-row">
            <Power size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">
                {isOnline ? 'Siap menerima tugas' : 'Sedang tidak siap'}
              </p>
              <p className="courier-card-sub">
                {isOnline
                  ? 'Tugas dari merchant masuk otomatis'
                  : 'Tugas baru ditahan sampai kamu siap lagi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`courier-toggle ${isOnline ? 'is-on' : ''}`}
            onClick={() => dispatch(toggleOnline())}
          >
            {isOnline ? 'Jeda dulu' : 'Siap sekarang'}
          </button>
        </section>

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
