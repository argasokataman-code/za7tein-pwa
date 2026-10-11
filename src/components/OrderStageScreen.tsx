import { Crosshair, MapPin, MessageCircle, Phone, Scale, Star, Store, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { DeliveryActionCard, DeliveryStepper } from './DeliveryCheckpoints'
import { JourneyLine } from './JourneyLine'

import { insertNotification } from '../api/notifications'
import { otpOf, updateOrderStatus } from '../api/orders'
import { DELIVERY_OTP_DEMO } from '../data/courier'
import { DISPUTE_WINDOW_HOURS, RESOLUTIONS, disputeStatusLabel, resolvedOrderToken } from '../data/admin'
import { BottomSheet } from './ui/BottomSheet'
import {
  HOLD_EVENT_LABEL,
  HOLD_STATUS_COPY,
  ORDER_STAGES,
  formatDistance,
  merchantDeliveryConfig,
  mockCouriers,
  mockMerchant,
  mockOrder,
  zoneFor,
} from '../data/merchant'
import { ORDER_STAGE_STATUS } from '../data/order-stage-copy'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useLeafletMap } from '../hooks/useLeafletMap'
import { useMoney } from '../hooks/useMoney'
import { useTick } from '../hooks/useTick'
import {
  cancelOrder,
  markOrderCancelled,
  markOrderCompleted,
  matchCourier,
  settleOrderHold,
} from '../store/slices/cartSlice'
import { requestAppeal } from '../store/slices/adminSlice'
import { applyHoldEvent } from '../store/slices/walletSlice'
import type { CourierCheckpoint, OrderStage } from '../types'
import { BackButton } from './ui/BackButton'

/**
 * Layar tahap pesanan.
 *
 * Versi hasil porting menaruh peta setinggi hampir seluruh layar di belakang
 * panel melengkung, jadi bagian yang paling menonjol justru yang paling
 * sedikit informasinya — sementara status pesanan, satu-satunya hal yang
 * dicari orang, terdorong ke bawah lipatan. Di sini urutannya dibalik:
 * status lebih dulu, peta menyesuaikan tahap.
 *
 * Kelima rute order memakai komponen ini. Sebelumnya `/order-tracking`,
 * `/order-delivery`, `/order-delivered`, dan `/order-success` adalah empat
 * salinan markup portingan yang sama — hanya beda prefix kelas dan nomor
 * pesanan — sehingga perbaikan desain harus diulang empat kali dan salah
 * satunya pasti tertinggal. Sekarang tahapnya yang berbeda, tampilannya satu.
 */

const IconStore = () => <Store size={20} strokeWidth={1.75} aria-hidden="true" />

const IconCourier = () => <UserRound size={20} strokeWidth={1.75} aria-hidden="true" />

const IconPin = () => <MapPin size={20} strokeWidth={1.75} aria-hidden="true" />

const IconPhone = () => <Phone size={16} strokeWidth={1.75} aria-hidden="true" />

const IconChat = () => <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />


const IconRecenter = () => <Crosshair size={20} strokeWidth={1.75} aria-hidden="true" />

const IconScale = () => <Scale size={16} strokeWidth={1.75} aria-hidden="true" />

type Props = {
  /**
   * Tahap yang ditampilkan rute ini. Kalau dikosongkan, tahapnya dibaca dari
   * store — itu yang dipakai `/order-placed`, karena halaman itu muncul tepat
   * setelah memesan dan tahapnya masih bergerak.
   */
  stage?: OrderStage
}

export default function OrderStageScreen({ stage: fixedStage }: Props) {
  const { money } = useMoney()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [params] = useSearchParams()
  const rawStage = useAppSelector((s) => s.cart.orderStage)
  const addresses = useAppSelector((s) => s.cart.addresses)
  const selectedAddressId = useAppSelector((s) => s.cart.selectedAddressId)
  // Hold COD (F2/M4) hanya berlaku untuk pesanan COD; metodenya dibaca dari store
  // supaya detail order menampilkan lifecycle yang benar, bukan selalu.
  const paymentId = useAppSelector((s) => s.cart.selectedPaymentId)
  const holdStatus = useAppSelector((s) => s.cart.holdStatus)
  const holdAmount = useAppSelector((s) => s.cart.holdAmountIdr)
  const holdLedger = useAppSelector((s) => s.cart.holdLedger)
  const orderCompletedAt = useAppSelector((s) => s.cart.orderCompletedAt)
  const orderCancelled = useAppSelector((s) => s.cart.orderCancelled)
  const activeOrder = useAppSelector((s) => s.cart.activeOrder)
  const orderCode = activeOrder?.code ?? mockOrder.code
  // Sengketa hidup di `admin.disputes` — satu sumber untuk order yang sama,
  // dibaca juga oleh antrean panel CS. Jadi order detail tidak menyimpan
  // salinan status yang bisa berbeda dengan yang diputuskan CS.
  const disputes = useAppSelector((s) => s.admin.disputes)
  const dispute = disputes.find((d) => d.orderCode === orderCode)
  const isDisputed = dispute?.status === 'open' || dispute?.status === 'investigating'
  const resolutionToken = dispute?.resolution ? resolvedOrderToken(dispute.resolution) : null
  const { now } = useTick()
  // Banding (F8 → F22): pihak yang mengajukan sengketa bisa meminta SA meninjau
  // putusan level-1 CS. Satu banding per sengketa.
  const appeal = dispute?.appeal
  const appealDecided = Boolean(appeal?.verdict)
  const canAppeal = Boolean(dispute && resolutionToken && !appeal)
  const [appealOpen, setAppealOpen] = useState(false)
  const [appealNote, setAppealNote] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)

  // State tersimpan bisa berasal dari bentuk sebelum tahap pesanan ada, jadi
  // nilainya divalidasi di sini. Tanpa ini STATUS[undefined] melempar dan
  // seluruh halaman gagal dirender. `?stage=` menang atas semuanya supaya
  // tiap tahap bisa diperiksa tanpa mengubah kode.
  const sah = (v: string | null | undefined): v is OrderStage =>
    !!v && ORDER_STAGES.some((s) => s.id === v)

  const override = params.get('stage')
  const stage: OrderStage = sah(override)
    ? override
    : fixedStage ?? (sah(rawStage) ? rawStage : 'disiapkan')

  // Checkpoint kurir diturunkan dari tahap order yang LIVE (realtime
  // `orders.status`), bukan state lokal. Customer tidak menggerakkan checkpoint
  // — itu kerja kurir (F13); di sini progres sekadar ditampilkan. Backend belum
  // membedakan "tiba" dari "diantar" untuk customer (OST-1), jadi `diantar`
  // dipetakan ke `berangkat`; kartu OTP muncul selama pengantaran.
  const customerCheckpoint: CourierCheckpoint =
    stage === 'selesai'
      ? 'selesai'
      : stage === 'diantar'
        ? 'berangkat'
        : stage === 'siap'
          ? 'ambil'
          : 'masuk'

  // Perayaan "pesanan selesai" dulu hanya terbuka lewat tombol demo di layar ini.
  // Sekarang dipicu transisi tahap order → `selesai` (kurir merampungkan OTP →
  // realtime menyetel tahap), jadi customer benar-benar dapat animasinya saat
  // pesanan tuntas. Ref melacak tahap sebelumnya supaya kunjungan ulang ke order
  // yang sudah selesai tidak memantul ke perayaan lagi.
  const prevStageRef = useRef(stage)
  useEffect(() => {
    const justFinished = prevStageRef.current !== 'selesai' && stage === 'selesai'
    prevStageRef.current = stage
    if (orderCancelled || stage !== 'selesai') return
    // Window sengketa 24 jam (M6) butuh titik selesai — catat sekali saat tahap
    // pertama kali jadi `selesai`.
    if (!orderCompletedAt) dispatch(markOrderCompleted(new Date().toISOString()))
    if (justFinished) navigate(`/order-arrived?order=${orderCode}`)
  }, [stage, orderCompletedAt, orderCancelled, dispatch, navigate, orderCode])

  // Pengantaran satu-satunya tahap di mana peta memang layak dominan.
  const isDelivery = stage === 'diantar'
  const { recenter } = useLeafletMap('order-map', isDelivery ? 'delivery' : 'preview')

  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0] ?? null
  const courier = mockCouriers[0]
  const copy = ORDER_STAGE_STATUS[stage]
  const zone = address ? zoneFor(address) : null
  // building menyimpan "Kompleks — Tower" dalam satu string; dipisah supaya
  // baris pertama menyebut kompleksnya dan baris kedua unitnya, seperti PRD.
  const [alamatKompleks, alamatTower] = address
    ? address.building.split(' — ')
    : ['', '']

  // Lifecycle hold COD digerakkan status order live (bukan tombol operator).
  // Satu transisi PRD = satu event status + satu entry ledger, jadi kurir match
  // (`cut`) dan order selesai (`settled`) berlaku juga di dompet & panel CS.
  const isCod = paymentId === 'cod'
  const holdCopy = HOLD_STATUS_COPY[holdStatus]

  // Kurir ditugaskan (order masuk `siap`/`diantar`) → potongan dikunci.
  useEffect(() => {
    if (!isCod || holdStatus !== 'held') return
    if (stage !== 'siap' && stage !== 'diantar' && stage !== 'selesai') return
    dispatch(matchCourier())
    dispatch(applyHoldEvent({ event: 'hold_cut', amountIdr: holdAmount }))
  }, [isCod, stage, holdStatus, holdAmount, dispatch])

  // Order selesai → dana diteruskan ke merchant (event `hold_settled`).
  useEffect(() => {
    if (!isCod || stage !== 'selesai' || holdStatus !== 'cut') return
    dispatch(settleOrderHold())
    dispatch(applyHoldEvent({ event: 'hold_settled', amountIdr: holdAmount }))
  }, [isCod, stage, holdStatus, holdAmount, dispatch])

  // Batal order (F1/F2): aksi customer, bukan operator. Boleh selama order belum
  // selesai — sebelum match (`held`) → `released`, sesudah match (`cut`) →
  // `reversed`, semuanya lewat `cancelOrder()`.
  const isCancelled = orderCancelled
  const canCancel =
    isCod &&
    !isCancelled &&
    !isDisputed &&
    stage !== 'selesai' &&
    (holdStatus === 'held' || holdStatus === 'cut')

  const confirmCancel = () => {
    if (!canCancel) return
    dispatch(cancelOrder())
    dispatch(
      applyHoldEvent({
        event: holdStatus === 'cut' ? 'hold_reversed' : 'hold_released',
        amountIdr: holdAmount,
      }),
    )
    dispatch(markOrderCancelled())
    // Best-effort: backend menyimpan `orders.status = canceled` lewat jalur tulis
    // yang sama dengan merchant/kurir; gagal koneksi tak menghalangi UI.
    void updateOrderStatus(activeOrder?.id ?? '', 'batal').catch(() => {})
    void insertNotification({
      audience: 'merchant',
      kind: 'order',
      title: 'Pesanan dibatalkan',
      body: 'Customer membatalkan pesanan. Hold dikembalikan.',
    }).catch(() => {})
    toast.success('Pesanan dibatalkan')
    setCancelOpen(false)
  }

  // Window sengketa 24 jam (M6) dihitung dari order selesai. Order yang belum
  // lewat alur checkpoint dianggap masih di dalam window — mock, bukan aturan
  // final (kategori + window masih OQ-29).
  const disputeWindowOpen =
    !orderCompletedAt ||
    now - new Date(orderCompletedAt).getTime() < DISPUTE_WINDOW_HOURS * 3_600_000

  const mapBlock = (
    <div className={`track-map track-map--${isDelivery ? 'delivery' : 'preview'}`}>
      <div id="order-map" className="order-map-container" />
      {isDelivery ? (
        <button
          className="track-recenter"
          aria-label="Pusatkan peta"
          type="button"
          onClick={recenter}
        >
          <IconRecenter />
        </button>
      ) : null}
    </div>
  )

  useEffect(() => {
    document.body.className = 'sa7tein-track-page'
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <div className="app-shell">
      <main>
        <div className="track-screen">
          <header className="track-header">
            <BackButton className="track-back" />
            <div className="track-header-text">
              <h1 className="track-title">Pesanan</h1>
              <span className="track-ref">#{orderCode}</span>
            </div>
          </header>

          {isDelivery ? mapBlock : null}

          <section className="track-status" aria-live="polite">
            <p className="track-status-label">
              {isCancelled ? 'Pesanan dibatalkan' : copy.label}
            </p>
            {isCancelled ? (
              <p className="track-status-time">Pengiriman tidak dilanjutkan.</p>
            ) : (
              <>
                <p className="track-status-eta">{copy.etaLabel}</p>
                <p className="track-status-time">{copy.eta}</p>
              </>
            )}
          </section>

          <JourneyLine stage={stage} />

          {/* Hold COD via wallet (R-COD-01, F2). Muncul di detail order supaya
              transisinya terlihat di tempat orang mencari status pesanan. */}
          {isCod ? (
            <section className="track-section">
              <h2 className="track-section-title">Hold COD</h2>
              <div className="hold-card" data-hold-status={holdStatus}>
                <div className="hold-card__head">
                  <span className={`hold-status hold-status--${holdStatus}`}>
                    {holdCopy.label}
                  </span>
                  <span className="hold-card__amount">{money(holdAmount)}</span>
                </div>
                <p className="hold-card__note">{holdCopy.note}</p>
                {isDisputed && (holdStatus === 'held' || holdStatus === 'cut') ? (
                  <p className="hold-card__note">
                    Hold dibekukan sampai panel CS memutuskan sengketa (F8).
                  </p>
                ) : null}
                {canCancel ? (
                  <div className="hold-card__actions">
                    <button
                      className="track-action"
                      type="button"
                      onClick={() => setCancelOpen(true)}
                    >
                      Batalkan pesanan
                    </button>
                  </div>
                ) : null}
                {holdLedger.length > 0 ? (
                  <ol className="hold-ledger" aria-label="Ledger hold">
                    {holdLedger.map((entry) => (
                      <li key={entry.id} className="hold-ledger__row">
                        <span>{HOLD_EVENT_LABEL[entry.event]}</span>
                        <span>
                          {new Date(entry.at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            </section>
          ) : null}

          {isDelivery ? null : mapBlock}

          <section className="track-section">
            <h2 className="track-section-title">Toko</h2>
            <div className="track-row">
              <span className="track-icon">
                <IconStore />
              </span>
              <div className="track-row-text">
                <p className="track-row-name">{mockMerchant.name}</p>
                <p className="track-row-note">
                  Buka {mockMerchant.openTime}–{mockMerchant.closeTime}
                </p>
              </div>
            </div>
          </section>

          <section className="track-section">
            <h2 className="track-section-title">Kurir</h2>
            <div className="track-row">
              <span className="track-icon">
                <IconCourier />
              </span>
              <div className="track-row-text">
                <p className="track-row-name">
                  {courier.name}
                  <span className="track-rating">
                    <Star size={12} strokeWidth={1.75} fill="currentColor" aria-hidden="true" />
                    {mockOrder.courierRating}
                  </span>
                </p>
                <p className="track-row-note">{copy.courier}</p>
              </div>
              <div className="track-actions">
                <a className="track-action" href={`tel:${courier.phone}`}>
                  <IconPhone />
                  Hubungi
                </a>
                <button
                  className="track-action"
                  type="button"
                  onClick={() => navigate('/order-chat')}
                >
                  <IconChat />
                  Chat
                </button>
              </div>
            </div>
          </section>

          {address ? (
            <section className="track-section">
              <h2 className="track-section-title">Tujuan</h2>
              <div className="track-row">
                <span className="track-icon">
                  <IconPin />
                </span>
                <div className="track-row-text">
                  <p className="track-row-name">{alamatKompleks}</p>
                  <p className="track-row-note">
                    {[alamatTower, address.floor, address.unit].filter(Boolean).join(' · ')}
                  </p>
                  <p className="track-row-meta">
                    {address.address} · {formatDistance(address.distanceMeters)}
                    {zone
                      ? ` · Zona ${zone.label} · ongkir ${money(merchantDeliveryConfig.ongkirIdr)}`
                      : ' · di luar jangkauan'}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* Checkpoint pengiriman (F5/M5): customer hanya menampilkan progres +
              kode OTP serah terima (C-09). Aksi Ambil/Berangkat/Tiba milik kurir
              (F13), bukan customer — jadi di sini tak ada tombol aksi. */}
          <section className="track-section">
            <h2 className="track-section-title">Checkpoint pengiriman</h2>
            {isCancelled ? (
              <p className="track-row-note">
                Pesanan dibatalkan, pengiriman tidak dilanjutkan.
              </p>
            ) : (
              <>
                <DeliveryStepper checkpoint={customerCheckpoint} />
                {stage === 'selesai' ? (
                  <p className="track-row-note">
                    Pengiriman selesai — OTP terverifikasi, order tidak menggantung.
                  </p>
                ) : stage === 'diantar' ? (
                  <DeliveryActionCard
                    checkpoint={customerCheckpoint}
                    startedAt={null}
                    now={now}
                    otpDisplayCode={activeOrder ? otpOf(activeOrder.code) : DELIVERY_OTP_DEMO}
                    otpStep
                    autoSettlePaused={isDisputed}
                  />
                ) : (
                  <p className="track-row-note">
                    Kurir belum berangkat. Progres muncul di sini otomatis.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Sengketa (F8/M6): 1× per order, window 24 jam dari order selesai.
              Antrean putusannya ada di panel CS (`/admin`), bukan konsol Super
              Admin terpisah. */}
          {stage === 'selesai' || dispute ? (
            <section className="track-section">
              <h2 className="track-section-title">Sengketa</h2>
              <div className="track-row">
                <span className="track-icon">
                  <Scale size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="track-row-text">
                  {dispute ? (
                    <>
                      <p className="track-row-name">
                        {dispute.category}
                        <span className={`admin-badge admin-badge--${dispute.status}`}>
                          {disputeStatusLabel[dispute.status]}
                        </span>
                      </p>
                      <p className="track-row-note">
                        Diajukan {dispute.filedAt} oleh{' '}
                        {dispute.filedBy === 'customer' ? 'customer' : 'merchant'} · 1× per order.
                      </p>
                      {resolutionToken ? (
                        <p className="track-row-meta">
                          Order {resolutionToken} ·{' '}
                          {RESOLUTIONS.find((r) => r.id === dispute.resolution)?.label}
                          {dispute.partialPercent ? ` (${dispute.partialPercent}%)` : ''}
                        </p>
                      ) : (
                        <p className="track-row-meta">
                          Hold dibekukan sampai panel CS memutuskan.
                        </p>
                      )}
                      {appeal ? (
                        <p className="track-row-meta">
                          {appealDecided
                            ? `Banding ditinjau SA: ${
                                appeal.verdict === 'upheld'
                                  ? 'putusan CS diperkuat'
                                  : 'putusan diubah'
                              }`
                            : 'Banding menunggu tinjauan SA.'}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <p className="track-row-name">Pesanan tidak sesuai?</p>
                      <p className="track-row-note">
                        1× per order, window {DISPUTE_WINDOW_HOURS} jam setelah pesanan selesai.
                      </p>
                    </>
                  )}
                </div>
                {!dispute ? (
                  <div className="track-actions">
                    <button
                      className="track-action"
                      type="button"
                      disabled={!disputeWindowOpen}
                      onClick={() => navigate(`/dispute?order=${orderCode}&by=customer`)}
                    >
                      <IconScale />
                      {disputeWindowOpen ? 'Ajukan' : 'Window lewat'}
                    </button>
                  </div>
                ) : null}
                {canAppeal ? (
                  <div className="track-actions">
                    <button
                      className="track-action"
                      type="button"
                      onClick={() => setAppealOpen(true)}
                    >
                      <IconScale />
                      Banding
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <BottomSheet
        open={appealOpen}
        title="Ajukan banding ke Super Admin"
        onClose={() => setAppealOpen(false)}
      >
        <p className="sheet-field-label">
          Putusan level-1 CS tetap berlaku sampai SA memutuskan.
        </p>
        <textarea
          className="sheet-textarea"
          value={appealNote}
          onChange={(event) => setAppealNote(event.target.value)}
          placeholder="Kenapa putusan ini perlu ditinjau ulang?"
          rows={3}
          aria-label="Alasan banding"
        />
        <div className="sheet-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!dispute) return
              dispatch(requestAppeal({ id: dispute.id, note: appealNote }))
              toast.success('Banding dikirim ke Super Admin')
              setAppealNote('')
              setAppealOpen(false)
            }}
          >
            Kirim banding
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={cancelOpen} title="Batalkan pesanan" onClose={() => setCancelOpen(false)}>
        <p className="sheet-field-label">
          Pesanan dibatalkan dan hold COD dikembalikan. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="sheet-actions">
          <button type="button" className="btn btn-primary" onClick={confirmCancel}>
            Ya, batalkan pesanan
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
