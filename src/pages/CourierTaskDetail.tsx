import { ChevronLeft, MapPin, Phone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { JourneyLine } from '../components/JourneyLine'
import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useTick } from '../hooks/useTick'
import { formatDistance, money } from '../data/merchant'
import {
  COURIER_ACTION_LABEL,
  COURIER_CHECKPOINT_LABEL,
  COURIER_GUARD_MINUTES,
  COURIER_STEPS,
  courierStepIndex,
  elapsedMinutes,
  formatCountdown,
  slaRemainingMs,
} from '../data/courier'
import { advanceCheckpoint, cancelTask, completeTask } from '../store/slices/courierSlice'

export default function CourierTaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const { now } = useTick()
  const [otp, setOtp] = useState('')

  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return (
      <div className="app-shell">
        <main className="courier-page">
          <CourierPageHeader title="Tugas tidak ditemukan" eyebrow="Detail tugas" />
          <p className="courier-empty">Tugas ini tidak ada di daftar kurir.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Kembali ke daftar tugas
          </button>
        </main>
      </div>
    )
  }

  const stepIndex = courierStepIndex(task.checkpoint)
  const sla = slaRemainingMs(task, now)
  const overdue = sla != null && sla < 0
  const actionLabel = COURIER_ACTION_LABEL[task.checkpoint]
  const elapsed = elapsedMinutes(task, now)
  const isGuard = task.checkpoint === 'tiba'
  const canCall = isGuard && elapsed >= COURIER_GUARD_MINUTES.call
  const canCancel = isGuard && elapsed >= COURIER_GUARD_MINUTES.batal
  const isFinished = task.checkpoint === 'selesai'
  const isCancelled = task.checkpoint === 'batal'

  // Tanpa OTP yang benar kurir tidak bisa settle (C-09) — validator ada di layar,
  // reducer hanya menyelesaikan setelah kode cocok.
  function submitOtp(event: FormEvent) {
    event.preventDefault()
    if (!task) return
    if (otp !== task.otp) {
      toast.error('Kode OTP tidak cocok')
      return
    }
    dispatch(completeTask({ id: task.id }))
    toast.success('Pesanan selesai — hold settled')
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader
          eyebrow="Detail tugas"
          title={`#${task.code}`}
          action={
            <button
              className="courier-back"
              type="button"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
          }
        />

        <section className="courier-card">
          <div className="courier-row">
            <MapPin size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="courier-card-title">{task.customerName}</p>
              <p className="courier-card-sub">
                {task.address} · {task.floor} · {task.unit}
              </p>
            </div>
          </div>
          <p className="courier-task-meta">
            {formatDistance(task.distanceMeters)} · Zona {task.zone} ·{' '}
            {task.paymentMethod === 'cod' ? `COD ${money(task.total)}` : `Transfer ${money(task.total)}`}
          </p>
          <p className="courier-task-meta">
            {task.paymentMethod === 'cod'
              ? 'Tagih tunai ke customer saat serah terima.'
              : 'Cek bukti transfer customer sebelum serah terima.'}
          </p>
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Status pesanan</h2>
          <JourneyLine stage={task.orderStage} />
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Checkpoint</h2>
          <ol className="courier-steps">
            {COURIER_STEPS.map((step, index) => {
              const state = index < stepIndex ? 'done' : index === stepIndex ? 'active' : 'todo'
              return (
                <li key={step.id} className={`courier-step courier-step--${state}`}>
                  <span className="courier-step-dot" aria-hidden="true" />
                  <span className="courier-step-label">{step.label}</span>
                </li>
              )
            })}
          </ol>
          <p className="courier-step-state">{COURIER_CHECKPOINT_LABEL[task.checkpoint]}</p>
        </section>

        {isFinished ? (
          <section className="courier-card courier-settled">
            <p className="courier-card-title">Pesanan selesai</p>
            <p className="courier-card-sub">
              OTP terverifikasi → hold settled. Tips kamu {money(task.tip)} masuk dompet.
            </p>
          </section>
        ) : isCancelled ? (
          <section className="courier-card courier-settled">
            <p className="courier-card-title">Tugas dibatalkan</p>
            <p className="courier-card-sub">
              Customer tidak menyerahkan OTP. Penalti customer belum final (UNRESOLVED OQ-14).
            </p>
          </section>
        ) : (
          <section className="courier-action">
            {sla != null ? (
              <p className={`courier-timer ${overdue ? 'is-overdue' : ''}`}>
                {overdue
                  ? 'Lewat SLA — tim CS ditandai otomatis'
                  : `Sisa waktu ${formatCountdown(sla)}`}
              </p>
            ) : null}

            {actionLabel ? (
              <button
                type="button"
                className="btn btn-primary courier-primary"
                onClick={() => dispatch(advanceCheckpoint({ id: task.id }))}
              >
                {actionLabel}
              </button>
            ) : null}

            {isGuard ? (
              <>
                <div className="courier-guard">
                  <p className="courier-card-sub">
                    {canCall
                      ? 'Sudah lewat 5 menit — hubungi customer sekarang.'
                      : `Hubungi customer bila menunggu lebih dari ${COURIER_GUARD_MINUTES.call} menit.`}
                  </p>
                  <a className="courier-guard-call" href={`tel:${task.customerPhone}`}>
                    <Phone size={16} strokeWidth={1.75} aria-hidden="true" />
                    Hubungi customer
                  </a>
                  <button
                    type="button"
                    className="courier-btn-ghost"
                    disabled={!canCancel}
                    onClick={() => dispatch(cancelTask({ id: task.id }))}
                  >
                    {canCancel
                      ? 'Batal — customer lalai'
                      : `Batal aktif setelah ${COURIER_GUARD_MINUTES.batal} menit`}
                  </button>
                </div>

                <form className="courier-otp" onSubmit={submitOtp}>
                  <label htmlFor="courier-otp">Kode OTP dari customer (4 digit)</label>
                  <input
                    id="courier-otp"
                    className="form-control"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                  />
                  <p className="courier-otp-hint">Kode demo: {task.otp}</p>
                  <button className="btn btn-primary" type="submit" disabled={otp.length !== 4}>
                    Selesaikan
                  </button>
                </form>
              </>
            ) : null}

            <p className="courier-sla-note">
              SLA 15/30/10 menit masih sementara (PO 2026-09-22) — final menunggu data rute Irbid
              (OQ-13).
            </p>
          </section>
        )}
      </main>
    </div>
  )
}
