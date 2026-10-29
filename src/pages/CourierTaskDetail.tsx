import { MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { JourneyLine } from '../components/JourneyLine'
import { DeliveryActionCard, DeliveryStepper } from '../components/DeliveryCheckpoints'
import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { OrderCelebration } from '../components/ui/OrderCelebration'
import { CodCashDue } from '../components/ui/CodCashDue'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { useTick } from '../hooks/useTick'
import { formatDistance, zoneLabel } from '../data/merchant'
import { codCashOptions, codChangeIdr } from '../data/codCash'
import { jodToIdr } from '../data/currency'
import {
  COURIER_ACTION_LABEL,
  COURIER_GUARD_MINUTES,
  courierSelf,
  elapsedMinutes,
  isDoneTask,
  nextCheckpoint,
} from '../data/courier'
import { advanceCheckpoint, cancelTask, completeTask } from '../store/slices/courierSlice'
import { finishBatchOnBe } from '../api/batches'
import { insertNotification } from '../api/notifications'
import { recordCheckpoint, updateOrderStatus, verifyOrderOtp } from '../api/orders'
import type { MerchantOrderStatus } from '../types'

/** Checkpoint kurir yang baru dimasuki → status order BE. */
const NEXT_STATUS: Record<string, MerchantOrderStatus> = {
  ambil: 'siap',
  berangkat: 'diantar',
  tiba: 'tiba',
}

export default function CourierTaskDetail() {
  const { money } = useMoney()
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const batch = useAppSelector((s) => s.courier.batch)
  const { now } = useTick()
  const [otp, setOtp] = useState('')
  const [cashInput, setCashInput] = useState('')
  const [cashChosenIdr, setCashChosenIdr] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Kunci gulir latar selama overlay perayaan terbuka.
  useEffect(() => {
    if (!showCelebration) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showCelebration])

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

  const actionLabel = COURIER_ACTION_LABEL[task.checkpoint]
  const elapsed = elapsedMinutes(task, now)
  const isGuard = task.checkpoint === 'tiba'
  const canCall = isGuard && elapsed >= COURIER_GUARD_MINUTES.call
  const canCancel = isGuard && elapsed >= COURIER_GUARD_MINUTES.batal
  const isFinished = task.checkpoint === 'selesai'
  const isCancelled = task.checkpoint === 'batal'
  // COD: uang tunai yang benar-benar diterima kurir. Chip memakai pembulatan
  // yang sama dengan customer, input bebas menampung nominal lain (JOD).
  const cashOptions = task.paymentMethod === 'cod' ? codCashOptions(task.total) : []
  const customCashIdr = cashInput.trim() ? jodToIdr(Number(cashInput.replace(',', '.'))) : 0
  const cashReceivedIdr = cashChosenIdr ?? (customCashIdr || task.total)
  const cashChangeIdr = codChangeIdr(task.total, cashReceivedIdr)
  const showCash = task.paymentMethod === 'cod' && task.checkpoint === 'tiba'

  // Tanpa OTP yang benar kurir tidak bisa settle (C-09). Order live diverifikasi
  // di BE lewat RPC `verify_order_otp` (set `otp_verified` + checkpoint); tugas
  // mock dicocokkan lokal. Kurir tak pernah melihat kode — customer yang
  // menunjukkan (lihat `DeliveryActionCard` sisi customer).
  async function submitOtp() {
    if (!task) return
    // COD tunai: serah terima tidak boleh selesai sebelum uang cukup diterima.
    if (task.paymentMethod === 'cod' && cashReceivedIdr < task.total) {
      toast.error('Uang diterima kurang dari tagihan')
      return
    }
    const isApi = /^api-\d+$/.test(task.id)
    const ok = isApi
      ? await verifyOrderOtp(task.id, otp).catch(() => false)
      : otp === task.otp
    if (!ok) {
      toast.error('Kode OTP tidak cocok')
      return
    }
    dispatch(completeTask({ id: task.id }))
    // Order terakhir di batch menutup batch-nya juga di BE, supaya merchant dan
    // perangkat lain melihat batch tuntas — bukan menggantung "dalam pengantaran".
    // Order yang sudah tuntas tidak lagi dikirim RPC kurir, jadi yang dihitung
    // hanya sisa tugas batch yang masih ada di daftar; yang tak ada = sudah
    // selesai. Tanpa ini batch tak pernah ditutup.
    const remaining = tasks.filter((t) => batch?.orderIds.includes(t.id))
    if (batch && remaining.every((t) => t.id === task.id || isDoneTask(t))) {
      void finishBatchOnBe(batch.id).catch(() => {})
    }
    toast.success('Pesanan selesai')
    setShowCelebration(true)
    // `verify_order_otp` sudah menandai `otp_verified` dan mencatat checkpoint,
    // jadi di sini hanya status order yang disinkronkan.
    void updateOrderStatus(task.id, 'selesai', 'courier').catch(() => {})
    void insertNotification({
      audience: 'customer',
      kind: 'order',
      title: 'Pesanan selesai',
      body: 'Pesananmu sudah diterima. Terima kasih!',
    }).catch(() => {})
  }

  // Maju satu checkpoint. Tiap langkah memberi notifikasi ke customer
  // (best-effort, R-PUSH-01). Web Push asli tetap di luar scope.
  function advance() {
    if (!task) return
    const next = nextCheckpoint(task.checkpoint)
    dispatch(advanceCheckpoint({ id: task.id }))
    if (next) {
      void recordCheckpoint(task.id, next).catch(() => {})
      const status = NEXT_STATUS[next]
      if (status) void updateOrderStatus(task.id, status, 'courier').catch(() => {})
    }
    const STAGE_NOTIF: Record<string, { title: string; body: string }> = {
      ambil: { title: 'Kurir sedang mengambil pesanan', body: 'Kurir akan segera berangkat.' },
      berangkat: { title: 'Kurir menuju lokasimu', body: 'Kurir sedang dalam perjalanan.' },
      tiba: {
        title: 'Kurir sudah sampai',
        body: `${courierSelf.name} menunggu di depan. Siapkan kode OTP untuk serah terima.`,
      },
    }
    const msg = STAGE_NOTIF[next ?? '']
    if (msg) {
      void insertNotification({ audience: 'customer', kind: 'order', ...msg }).catch(() => {})
    }
  }

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader
          eyebrow="Detail tugas"
          title={`#${task.code}`}
          back
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
            {formatDistance(task.distanceMeters)} · Zona {zoneLabel(task.zone)} ·{' '}
            {task.paymentMethod === 'cod'
              ? `COD ${money(task.total)}`
              : task.paymentMethod === 'transfer'
                ? `Transfer ${money(task.total)}`
                : `Sudah dibayar ${money(task.total)}`}
          </p>
          <p className="courier-task-meta">
            {task.paymentMethod === 'cod'
              ? 'Tagih tunai ke customer saat serah terima.'
              : task.paymentMethod === 'transfer'
                ? 'Cek bukti transfer customer sebelum serah terima.'
                : 'Sudah dibayar — tidak ada tagihan saat serah terima.'}
          </p>
        </section>

        {/* COD tunai: pecahan tagihan + kembalian terlihat sejak tugas masuk,
            supaya kurir bisa menyiapkan uang kembalian sebelum berangkat.
            Input uang diterima tetap hanya di checkpoint `tiba`. */}
        {task.paymentMethod === 'cod' ? (
          <section className="courier-section">
            <h2 className="courier-section-title">Uang tunai</h2>
            <CodCashDue items={task.items} totalIdr={task.total} />
            {showCash ? (
              <div className="cod-cash-card">
                <div className="cod-cash-options" role="radiogroup" aria-label="Nominal uang diterima">
                  {cashOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={cashChosenIdr === option.receivedIdr}
                      className={
                        cashChosenIdr === option.receivedIdr
                          ? 'cod-cash-chip is-active'
                          : 'cod-cash-chip'
                      }
                      onClick={() => {
                        setCashChosenIdr(option.receivedIdr)
                        setCashInput('')
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <label className="cod-cash-field">
                  <span>Uang diterima (JOD)</span>
                  <input
                    inputMode="decimal"
                    value={cashInput}
                    placeholder="0,00"
                    onChange={(event) => {
                      setCashInput(event.target.value)
                      setCashChosenIdr(null)
                    }}
                  />
                </label>
                <div className="cod-cash-row cod-cash-row--total">
                  <span>Kembalian</span>
                  <span className="cod-cash-amount">{money(cashChangeIdr)}</span>
                </div>
              </div>
            ) : (
              <p className="cod-cash-hint">
                Uang diterima dicatat saat serah terima (checkpoint Tiba).
              </p>
            )}
          </section>
        ) : null}

        <section className="courier-section">
          <h2 className="courier-section-title">Status pesanan</h2>
          <JourneyLine stage={task.orderStage} />
        </section>

        <section className="courier-section">
          <h2 className="courier-section-title">Checkpoint</h2>
          <DeliveryStepper checkpoint={task.checkpoint} />
        </section>

        {/* Notif customer (flow F13: "Tiba → notif customer"). Web Push tidak
            diimplementasi di repo ini (AGENTS.md §1, R-PUSH-01), jadi ini bukti
            mock bahwa notifikasi terkirim saat kurir tiba dan saat selesai —
            bukan klaim pengiriman sungguhan (HG-12). Hanya tampil di mode dev;
            bukti internal, bukan bagian dari layar kurir. */}
        {import.meta.env.DEV && (task.checkpoint === 'tiba' || task.checkpoint === 'selesai') ? (
          <p className="courier-notif">
            {task.checkpoint === 'tiba'
              ? `Notif "Kurir sudah sampai" terkirim ke ${task.customerName} (mock).`
              : `Notif "Pesanan selesai" terkirim ke ${task.customerName} (mock).`}
          </p>
        ) : null}

        {isFinished ? (
          <section className="courier-card courier-settled">
            <p className="courier-card-title">Pesanan selesai</p>
            <p className="courier-card-sub">
              OTP terverifikasi. Tips kamu {money(task.tip)} masuk dompet.
            </p>
          </section>
        ) : isCancelled ? (
          <section className="courier-card courier-settled">
            <p className="courier-card-title">Tugas dibatalkan</p>
            <p className="courier-card-sub">Customer tidak menyerahkan OTP.</p>
          </section>
        ) : (
          <DeliveryActionCard
            checkpoint={task.checkpoint}
            startedAt={task.checkpointStartedAt ?? null}
            now={now}
            otp={otp}
            onOtpChange={setOtp}
            onOtpSubmit={submitOtp}
            otpHint={/^api-\d+$/.test(task.id) ? undefined : `Kode demo: ${task.otp}`}
            actions={
              <>
                {actionLabel ? (
                  <button
                    type="button"
                    className="btn btn-primary courier-primary"
                    onClick={advance}
                  >
                    {actionLabel}
                  </button>
                ) : null}

                {isGuard ? (
                  <div className="courier-guard">
                    <p className="courier-card-sub">
                      {canCall
                        ? 'Sudah lewat 5 menit, hubungi customer sekarang.'
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
                      onClick={() => {
                        dispatch(cancelTask({ id: task.id }))
                        void updateOrderStatus(task.id, 'batal', 'courier').catch(() => {})
                        void insertNotification({
                          audience: "customer",
                          kind: "order",
                          title: "Pesanan dibatalkan",
                          body: "Pesanan dibatalkan karena customer tidak merespons.",
                        }).catch(() => {})
                      }}
                    >
                      {canCancel
                        ? 'Batal: customer lalai'
                        : `Batal aktif setelah ${COURIER_GUARD_MINUTES.batal} menit`}
                    </button>
                  </div>
                ) : null}
              </>
            }
          />
        )}
      </main>

      {/* Perayaan selesai (paritas customer): overlay penuh di atas layar
          detail, bukan halaman baru, supaya kurir tetap pada konteks tugas.
          Di-portal ke body supaya `position: fixed` tak terjebak containing
          block dari transform transisi halaman (alasan sama dengan BottomNav). */}
      {showCelebration
        ? createPortal(
            <div
              className="order-celebration-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Pesanan selesai"
            >
              <OrderCelebration
                title="Pesanan selesai!"
                message={`OTP terverifikasi. Tips kamu ${money(task.tip)} masuk dompet.`}
              >
                <button
                  type="button"
                  className="order-arrived-rate-btn"
                  onClick={() => {
                    setShowCelebration(false)
                    navigate('/')
                  }}
                >
                  Kembali ke daftar tugas
                </button>
              </OrderCelebration>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
