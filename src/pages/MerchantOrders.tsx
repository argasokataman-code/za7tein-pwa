import { useEffect, useState } from 'react'
import { ChevronRight, Inbox, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'

import { fetchPartnerCouriers } from '../api/dispatch'
import { insertNotification } from '../api/notifications'
import { assignOrderCourier, markOrderPaid, updateOrderStatus } from '../api/orders'
import { createBatchOnBe, patchBatchOnBe } from '../api/batches'
import { apiEnabled } from '../api/supabase'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { AcceptOrderSheet, type AcceptChoice } from '../components/merchant/AcceptOrderSheet'
import { BatchFilter } from '../components/merchant/BatchFilter'
import { BatchPanel } from '../components/merchant/BatchPanel'
import { JourneyLine } from '../components/JourneyLine'
import { MerchantCourierMap } from '../components/merchant/MerchantCourierMap'
import { OrderChatLink } from '../components/merchant/OrderChatLink'
import { MerchantCookPanel } from '../components/merchant/MerchantCookPanel'
import { MerchantEarnings } from '../components/merchant/MerchantEarnings'
import { LoyalBadge } from '../components/ui/LoyalBadge'
import { OrderTimeline } from '../components/merchant/OrderTimeline'
import { OrderPaymentProof } from '../components/merchant/OrderPaymentProof'
import { OrderTicketActions } from '../components/merchant/OrderTicketActions'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { useMerchantOrdersSync } from '../hooks/useApiOrders'
import { useOrderHandoff } from '../hooks/useOrderHandoff'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { useMoney } from '../hooks/useMoney'
import { BATCH_COUNTDOWN_SECONDS, nextBatchId } from '../data/batch'
import { formatDistance } from '../data/merchant'
import {
  DELIVERY_TYPE_LABEL,
  QUEUE_TABS,
  deliveryBadge,
  orderAgeLabel,
  orderAgeMinutes,
  orderDeliveryType,
  orderStatusLabel,
  orderUrgency,
  ordersForStatuses,
  paymentGate,
  type QueueTabId,
} from '../data/merchantOrders'
import {
  addBatch,
  addOrderToBatch,
  approveEarlyStart,
  assignBatchCourier,
  closeBatchEarly,
} from '../store/slices/batchSlice'
import { replacePartners, sendAssignment } from '../store/slices/partnerSlice'
import {
  setCookMinutes,
  setOrderBatch,
  setOrderPacked,
  setOrderStatus,
} from '../store/slices/merchantSlice'
import type { MerchantOrder, MerchantOrderStatus, OrderStage } from '../types'

/** Tenant demo (satu toko). Saat auth nyata masuk, id ini berasal dari sesi. */
const MERCHANT_ID = 'merchant-1'

/**
 * Status order merchant → tahap Journey Line.
 *
 * `MerchantOrderStatus` lebih lebar dari `OrderStage`: `diterima` dan `tiba`
 * adalah sub-state operasional (merchant menerima; kurir sudah sampai) yang
 * tidak punya simpul sendiri di rel, sementara `ditolak`/`batal` sudah keluar
 * rel. Pemetaannya eksplisit (bukan cast) supaya menambah status baru memaksa
 * keputusan di sini, bukan diam-diam salah render.
 */
const JOURNEY_STAGE: Partial<Record<MerchantOrderStatus, OrderStage>> = {
  baru: 'baru',
  diterima: 'disiapkan',
  disiapkan: 'disiapkan',
  siap: 'siap',
  diantar: 'diantar',
  tiba: 'diantar',
  selesai: 'selesai',
}


/* Empty state per tab memberi konteks, bukan sekadar "kosong": merchant tahu
   kenapa tab ini belum berisi dan apa yang akan muncul. */
const EMPTY_HINT: Record<QueueTabId, string> = {
  masuk: 'Order baru muncul di sini begitu pelanggan memesan.',
  disiapkan: 'Order yang sudah kamu terima dan sedang dimasak ada di sini.',
  siap: 'Order yang selesai dimasak dan menunggu kurir ada di sini.',
  diantar: 'Order yang sedang dibawa kurir ke pelanggan ada di sini.',
  selesai: 'Order yang tuntas akan tersimpan di sini.',
  batal: 'Order yang ditolak atau dibatalkan tampil di sini.',
}

/** Gerbang konfirmasi merchant (f18) ada di `data/merchantOrders.ts`. */

export default function MerchantOrders() {
  const { money, moneyPlain } = useMoney()
  const dispatch = useAppDispatch()
  useMerchantOrdersSync()
  // Kandidat dispatch live (§9.3): kurir partner BE (bukan inhouse) menimpa mock.
  useEffect(() => {
    if (!apiEnabled) return
    fetchPartnerCouriers()
      .then((list) => {
        if (list.length) dispatch(replacePartners(list))
      })
      .catch(() => {})
  }, [dispatch])
  const orders = useAppSelector((s) => s.merchant.orders)
  const couriers = useAppSelector((s) => s.merchant.couriers)
  const batches = useAppSelector((s) => s.batch.batches)
  const partners = useAppSelector((s) => s.partner.partners)
  const [params] = useSearchParams()
  /* Tab awal bisa datang dari tautan (?tab=batal), dipakai legenda donut di
     dashboard: potongan "Batal/tolak 1 order" harus mendarat di daftar yang
     benar-benar berisi order batal, bukan di tab pertama. Nilai yang tidak
     dikenal jatuh ke tab pertama supaya tautan lama tidak membuat layar kosong. */
  const [tab, setTab] = useState<QueueTabId>(() => {
    const dariTautan = params.get('tab')
    return QUEUE_TABS.some((t) => t.id === dariTautan) ? (dariTautan as QueueTabId) : 'masuk'
  })
  const [detailId, setDetailId] = useState<string | null>(null)
  /* Saring daftar per batch (`null` = semua); order Regular bisa di beberapa batch. */
  const [batchFilter, setBatchFilter] = useState<string | null>(null)
  /* Konfirmasi 2-langkah: aksi yang keluar rel / menahan uang tidak boleh
     terjadi karena satu sentuhan salah (ConfirmSheet, pola yang sama dengan
     panel CS). Id disimpan, bukan objek, supaya tetap valid setelah re-render. */
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [acceptId, setAcceptId] = useState<string | null>(null)
  /* Dispatch Quick (§9.4): pilih kurir partner lalu kirim assignment. */
  const [dispatchId, setDispatchId] = useState<string | null>(null)
  const { ensureBatch, readyHint, openBatch } = useOrderHandoff(batches, couriers)

  const activeTab = QUEUE_TABS.find((t) => t.id === tab) ?? QUEUE_TABS[0]
  const visible = ordersForStatuses(orders, activeTab.statuses)
  const shown =
    batchFilter === null ? visible : visible.filter((order) => order.batchId === batchFilter)
  const detailOrder = orders.find((o) => o.id === detailId) ?? null
  const acceptOrder = orders.find((o) => o.id === acceptId) ?? null
  const codeOf = (id: string | null) => orders.find((o) => o.id === id)?.code ?? ''

  /** Emit notifikasi ke customer (best-effort — UI tidak menunggu jaringan). */
  const notifyCustomer = (title: string, body: string) => {
    void insertNotification({ audience: 'customer', kind: 'order', title, body }).catch(() => {})
  }

  /** Persist transisi status ke `orders.status` BE (best-effort). */
  const persistStatus = (id: string, status: MerchantOrderStatus) => {
    void updateOrderStatus(id, status).catch(() => {})
  }

  /**
   * Terima order (MER-11/MER-12). Regular wajib masuk batch: gabung batch
   * berjalan yang hitung mundurnya masih jalan, atau bikin batch baru. Quick
   * tidak punya batch — cukup estimasi prepare.
   */
  const confirmAccept = async (order: MerchantOrder, choice: AcceptChoice) => {
    if (orderDeliveryType(order) === 'regular') {
      const target = choice.batchId ? batches.find((b) => b.id === choice.batchId) : undefined
      if (target) {
        dispatch(addOrderToBatch({ batchId: target.id, orderId: order.id }))
        // Keanggotaan batch ikut ditulis ke BE (`route`), bukan hanya ke Redux.
        void patchBatchOnBe(target.id, { orderIds: [...target.orderIds, order.id] })
        dispatch(setOrderBatch({ id: order.id, batchId: target.id }))
      } else {
        // Batch baru dibuat di BE dulu supaya id-nya sama di semua perangkat.
        const beId = await createBatchOnBe({
          orderIds: [order.id],
          estimateMinutes: choice.estimateMinutes,
        })
        const batchId = beId !== null ? String(beId) : nextBatchId(batches)
        dispatch(
          addBatch({
            id: batchId,
            merchantId: MERCHANT_ID,
            courierId: null,
            orderIds: [order.id],
            status: 'countdown',
            estimateMinutes: choice.estimateMinutes,
            countdownSeconds: BATCH_COUNTDOWN_SECONDS,
            autoSort: true,
            routeOrder: [],
            createdAt: new Date().toISOString(),
          }),
        )
        dispatch(setOrderBatch({ id: order.id, batchId }))
      }
    }
    dispatch(setCookMinutes({ id: order.id, minutes: choice.estimateMinutes }))
    // Transfer: verifikasi bukti transfer = konfirmasi pembayaran (f18).
    if (paymentGate(order) === 'verify') {
      void markOrderPaid(order.id, 'merchant').catch(() => {})
    }
    dispatch(setOrderStatus({ id: order.id, status: 'diterima' }))
    persistStatus(order.id, 'diterima')
    toast.success(`Order ${order.code} diterima`)
    notifyCustomer('Pesanan diterima', 'Toko menerima pesananmu dan mulai menyiapkannya.')
    setAcceptId(null)
  }

  const confirmReject = () => {
    if (!rejectId) return
    const order = orders.find((o) => o.id === rejectId)
    dispatch(setOrderStatus({ id: rejectId, status: 'ditolak' }))
    persistStatus(rejectId, 'ditolak')
    toast.success(`Order ${order?.code ?? ''} ditolak`)
    notifyCustomer('Pesanan ditolak', 'Maaf, toko tidak bisa menerima pesanan ini.')
    setRejectId(null)
  }

  const confirmCancel = () => {
    if (!cancelId) return
    const order = orders.find((o) => o.id === cancelId)
    dispatch(setOrderStatus({ id: cancelId, status: 'batal' }))
    persistStatus(cancelId, 'batal')
    toast.success(`Order ${order?.code ?? ''} dibatalkan`)
    notifyCustomer('Pesanan dibatalkan', 'Pesanan dibatalkan dan dana dikembalikan ke pelanggan.')
    setCancelId(null)
  }

  /**
   * Packing selesai = order benar-benar siap diambil, jadi statusnya ikut
   * berpindah `disiapkan → siap` (BE `waitingCourier`, event `merchant_ready`
   * di flow f18). Dulu tombol ini hanya menyalakan flag lokal `packed`:
   * tiket tetap di tab Disiapkan dan merchant tidak tahu langkah berikutnya.
   */
  const togglePacked = (order: MerchantOrder) => {
    const next = !order.packed
    dispatch(setOrderPacked({ id: order.id, packed: next }))
    if (order.status === 'diterima' || order.status === 'disiapkan' || order.status === 'siap') {
      dispatch(setOrderStatus({ id: order.id, status: next ? 'siap' : 'disiapkan' }))
      persistStatus(order.id, next ? 'siap' : 'disiapkan')
    }
    // Order Regular dari BE bisa datang tanpa batch; tanpa batch panel kurir
    // tidak punya tempat memilih kurir. `ensureBatch` membuatnya sekali.
    if (next) void ensureBatch(order)
    toast.success(
      next ? `${order.code} siap — menunggu kurir` : `${order.code} kembali ke dapur`,
    )
    notifyCustomer(
      next ? 'Pesanan selesai dipacking' : 'Pesanan kembali ke dapur',
      next
        ? 'Pesananmu sudah dikemas dan menunggu kurir.'
        : 'Packing pesananmu dibuka kembali.',
    )
  }

  /** Kurir mulai mengantar lebih awal (BR-B09) — semua order batch ikut jalan. */
  const approveStart = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId)
    dispatch(approveEarlyStart({ batchId }))
    void patchBatchOnBe(batchId, { status: 'delivering' })
    batch?.orderIds.forEach((id) => {
      dispatch(setOrderStatus({ id, status: 'diantar' }))
      persistStatus(id, 'diantar')
      // Kurir inhouse dipilih per batch di layar (batch milik state FE), jadi
      // penugasannya ikut ditulis ke `orders.courier_id` supaya peran kurir dan
      // ops melihat kurir yang sama, bukan `null`. Id kurir seed FE (`cr-1`)
      // memuat angka yang sama dengan id di BE, jadi angkanya yang dikirim.
      const cid = batch.courierId?.replace(/\D/g, '')
      if (cid) void assignOrderCourier(id, cid).catch(() => {})
    })
    toast.success('Kurir mulai mengantar lebih awal')
  }

  /* Dispatch Quick (§9.4, M6): kirim assignment ke kurir partner terpilih.
     Antrean kandidat (idle terlama, batas jarak, tie-break) milik
     `dispatch_courier()` (OPEN-11) — di sini merchant memilih dari daftar yang
     tersedia, bukan mengarang algoritmanya. */
  const dispatchOrder = orders.find((o) => o.id === dispatchId) ?? null
  const dispatchCandidates = partners.filter((p) => p.status !== 'busy' && p.status !== 'reserved')

  const dispatchToPartner = (partnerId: string, partnerName: string) => {
    if (!dispatchId) return
    const code = dispatchOrder?.code ?? ''
    dispatch(sendAssignment({ orderId: dispatchId, partnerId }))
    // Persist penugasan ke `orders.courier_id` (best-effort; id seed dilewati).
    // Baris `dispatch_assignments` ditulis BE saat mitra merespons (OPEN-11).
    void assignOrderCourier(dispatchId, partnerId).catch(() => {})
    // Kurir sudah ditunjuk → rel lanjut ke Diantar (BE `waitingDelivery`),
    // supaya tiket tidak menggantung di tab Siap tanpa langkah berikutnya.
    dispatch(setOrderStatus({ id: dispatchId, status: 'diantar' }))
    persistStatus(dispatchId, 'diantar')
    toast.success(`Order ${code} dikirim ke ${partnerName}`)
    notifyCustomer('Kurir ditugaskan', 'Pesananmu sedang dicarikan kurir.')
    setDispatchId(null)
  }

  /* Ringkasan item untuk baris antrean: satu baris, dipotong dengan elipsis.
     Daftar lengkap dengan harga ada di sheet detail. */
  const itemSummary = (order: (typeof orders)[number]) =>
    order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Antrean dapur" title="Order" />

        <BatchPanel
          batches={batches}
          orders={orders}
          couriers={couriers}
          onAssign={(batchId, courierId) => {
            dispatch(assignBatchCourier({ batchId, courierId }))
            void patchBatchOnBe(batchId, { courierId })
          }}
          onCloseEarly={(batchId) => {
            dispatch(closeBatchEarly({ batchId }))
            void patchBatchOnBe(batchId, { status: 'closed' })
            toast.success('Batch ditutup — tidak menerima order baru')
          }}
          onApproveStart={approveStart}
        />

        <div className="merchant-tabs" role="tablist">
          {QUEUE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tab}
              className={`merchant-tab ${t.id === tab ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="merchant-tab-count">
                {ordersForStatuses(orders, t.statuses).length}
              </span>
            </button>
          ))}
        </div>

        <BatchFilter batches={batches} value={batchFilter} onChange={setBatchFilter} />

        {shown.length === 0 ? (
          <div className="merchant-ticket-empty">
            <Inbox size={28} strokeWidth={1.75} aria-hidden="true" />
            <p className="merchant-ticket-empty-title">Tidak ada order di tab ini</p>
            <p className="merchant-ticket-empty-sub">{EMPTY_HINT[activeTab.id]}</p>
          </div>
        ) : (
          shown.map((order) => {
            const ageMinutes = orderAgeMinutes(order)
            const urgency = orderUrgency(order, ageMinutes)
            const gate = paymentGate(order)
            return (
              <article key={order.id} className="merchant-ticket" data-order-status={order.status}>
                {/* Slip tiket dua baris: kepala (nomor + umur + status) lalu
                    badan (pelanggan, item, total). Seluruh slip bisa ditekan;
                    aksi di bawahnya. Detail lengkap tetap di sheet. */}
                <button
                  type="button"
                  className="merchant-ticket-main"
                  onClick={() => setDetailId(order.id)}
                >
                  <span className="merchant-ticket-stub">
                    <span className="merchant-ticket-code">{order.code}</span>
                    <span className="merchant-ticket-stub-end">
                      {ageMinutes !== null ? (
                        <span
                          className={
                            urgency === 'calm'
                              ? 'merchant-ticket-age'
                              : `merchant-ticket-age is-${urgency}`
                          }
                        >
                          {orderAgeLabel(ageMinutes)}
                        </span>
                      ) : null}
                      <span className="merchant-badge merchant-badge-soft">
                        {deliveryBadge(order)}
                      </span>
                      <span className={`merchant-badge merchant-badge-${order.status}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                      {order.status === 'baru' && gate === 'awaiting' ? (
                        <span className="merchant-badge">Menunggu bayar</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="merchant-ticket-body">
                    <img
                      className="merchant-ticket-avatar"
                      src={order.buyerAvatar}
                      alt=""
                      width={36}
                      height={36}
                    />
                    <span className="merchant-ticket-copy">
                      <span className="merchant-ticket-name">{order.customerName}</span>
                      <span className="merchant-ticket-items">
                        {itemSummary(order) || order.address}
                      </span>
                    </span>
                    <span className="merchant-ticket-total">{moneyPlain(order.total)}</span>
                    <ChevronRight
                      size={18}
                      strokeWidth={1.75}
                      className="merchant-ticket-chevron"
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {order.status === 'baru' ? (
                  <>
                    <div className="merchant-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={gate === 'awaiting'}
                        onClick={() => setAcceptId(order.id)}
                      >
                        {gate === 'verify' ? 'Verifikasi & Terima' : 'Terima'}
                      </button>
                      <button
                        type="button"
                        className="merchant-btn-ghost"
                        onClick={() => setRejectId(order.id)}
                      >
                        Tolak
                      </button>
                    </div>
                    {gate === 'awaiting' ? (
                      <p className="merchant-card-sub">
                        Menunggu pembayaran — Terima aktif setelah pembayaran berhasil.
                      </p>
                    ) : null}
                  </>
                ) : null}
                {/* Dapur & kurir: satu komponen untuk dua tab, supaya rel tidak
                    berhenti di "Packing selesai" (lihat OrderTicketActions). */}
                <OrderTicketActions
                  order={order}
                  hint={order.status === 'siap' ? readyHint(order) : ''}
                  onPacked={() => togglePacked(order)}
                  onDispatch={() => setDispatchId(order.id)}
                  onOpenBatch={() => openBatch(order)}
                />
              </article>
            )
          })
        )}
      </main>

      <BottomSheet
        open={detailOrder !== null}
        title={detailOrder ? `Pesanan ${detailOrder.code}` : ''}
        onClose={() => setDetailId(null)}
      >
        {detailOrder ? (
          <>
            <div className="merchant-order-head">
              <div className="merchant-order-buyer">
                <img
                  className="merchant-buyer-avatar"
                  src={detailOrder.buyerAvatar}
                  alt={`Profil ${detailOrder.customerName}`}
                  width={40}
                  height={40}
                />
                <div>
                  <p className="merchant-order-code">{detailOrder.code}</p>
                  <p className="merchant-order-sub">
                    {detailOrder.customerName} · {detailOrder.placedAt}{' '}
                    <LoyalBadge customerId={detailOrder.customerId} />
                  </p>
                </div>
              </div>
              <div className="merchant-order-head-right">
                <div
                  className="merchant-order-rating"
                  aria-label={`Rating pembeli ${detailOrder.buyerRating} dari 5`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      strokeWidth={1.75}
                      color="var(--star)"
                      fill={i < detailOrder.buyerRating ? 'var(--star)' : 'none'}
                    />
                  ))}
                </div>
                <span className={`merchant-badge merchant-badge-${detailOrder.status}`}>
                  {orderStatusLabel(detailOrder.status)}
                </span>
              </div>
            </div>

            {/* Journey Line: komponen yang sama dengan layar customer dan tugas
                kurir — status pesanan tetap satu model lintas peran
                (AGENTS.md §9: turunkan, jangan gambar ulang). Order `diterima`
                dan `tiba` memakai tahap rel terdekat, dan order ditolak/batal
                sudah keluar rel, jadi keduanya tidak menampilkan journey. */}
            {JOURNEY_STAGE[detailOrder.status] ? (
              <JourneyLine stage={JOURNEY_STAGE[detailOrder.status] as OrderStage} />
            ) : null}

            <OrderTimeline order={detailOrder} />

            {/* Posisi kurir untuk order yang sedang diantar (R-TRACK AC2). */}
            {detailOrder.status === 'diantar' || detailOrder.status === 'tiba' ? (
              <MerchantCourierMap orderId={detailOrder.id} stage={detailOrder.status} />
            ) : null}

            <ul className="merchant-order-items">
              {detailOrder.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>{money(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <p className="merchant-order-meta">
              {detailOrder.address} · {formatDistance(detailOrder.distanceMeters)} ·{' '}
              {DELIVERY_TYPE_LABEL[orderDeliveryType(detailOrder)]} ·{' '}
              {detailOrder.paymentMethod === 'cod' ? 'COD tunai · ditagih kurir' : 'Transfer'}
            </p>
            <p className="merchant-order-total">Total {money(detailOrder.total)}</p>
            <MerchantEarnings order={detailOrder} />
            <OrderPaymentProof order={detailOrder} />
            <OrderChatLink orderId={detailOrder.id} />

            {detailOrder.status === 'baru' ? (
              <>
                <div className="merchant-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={paymentGate(detailOrder) === 'awaiting'}
                    onClick={() => {
                      setDetailId(null)
                      setAcceptId(detailOrder.id)
                    }}
                  >
                    {paymentGate(detailOrder) === 'verify'
                      ? detailOrder.paymentProof
                        ? 'Verifikasi & Terima'
                        : 'Terima tanpa bukti'
                      : 'Terima'}
                  </button>
                  <button
                    type="button"
                    className="merchant-btn-ghost"
                    onClick={() => {
                      setDetailId(null)
                      setRejectId(detailOrder.id)
                    }}
                  >
                    Tolak
                  </button>
                </div>
                {paymentGate(detailOrder) === 'awaiting' ? (
                  <p className="merchant-card-sub">
                    Menunggu pembayaran — Terima aktif setelah pembayaran berhasil.
                  </p>
                ) : null}
              </>
            ) : null}

            {detailOrder.status === 'diterima' ||
            detailOrder.status === 'disiapkan' ||
            detailOrder.status === 'siap' ? (
              <MerchantCookPanel
                order={detailOrder}
                hint={readyHint(detailOrder)}
                onCookMinutes={(minutes) => {
                  dispatch(setCookMinutes({ id: detailOrder.id, minutes }))
                  notifyCustomer('Pesanan sedang dimasak', 'Toko mulai memasak pesananmu.')
                }}
                onTogglePacked={() => togglePacked(detailOrder)}
                onDispatch={() => {
                  setDetailId(null)
                  setDispatchId(detailOrder.id)
                }}
                onOpenBatch={() => {
                  setDetailId(null)
                  openBatch(detailOrder)
                }}
                onCancel={() => {
                  setDetailId(null)
                  setCancelId(detailOrder.id)
                }}
              />
            ) : null}

            {/* Lane guard (f12): order yang sudah di jalan bisa macet. Merchant
                hanya punya dua jalan keluar — ganti kurir (di blok batch) atau
                batalkan dan kembalikan dana. */}
            {detailOrder.status === 'diantar' ? (
              <button
                type="button"
                className="merchant-btn-ghost merchant-signout"
                onClick={() => {
                  setDetailId(null)
                  setCancelId(detailOrder.id)
                }}
              >
                Batalkan pesanan
              </button>
            ) : null}

            {detailOrder.status === 'selesai' ? (
              <div className="merchant-actions">
                <Link
                  className="merchant-btn-ghost"
                  to={`/dispute?order=${detailOrder.code}&by=merchant`}
                  onClick={() => setDetailId(null)}
                >
                  Ajukan Sengketa
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </BottomSheet>

      {acceptOrder ? (
        <AcceptOrderSheet
          order={acceptOrder}
          batches={batches}
          onConfirm={(choice) => confirmAccept(acceptOrder, choice)}
          onClose={() => setAcceptId(null)}
        />
      ) : null}

      {/* Dispatch Quick (§9.4): pilih kurir partner untuk satu order yang sudah
          dipacking. Daftar kandidat = mitra yang tidak busy/reserved. */}
      <BottomSheet
        open={dispatchId !== null}
        title="Pilih kurir partner"
        onClose={() => setDispatchId(null)}
      >
        {dispatchOrder ? (
          <>
            <p className="merchant-order-sub">
              {dispatchOrder.code} · {dispatchOrder.customerName}
            </p>
            {dispatchCandidates.length === 0 ? (
              <p className="merchant-empty">Tidak ada kurir partner tersedia saat ini.</p>
            ) : (
              <div className="payment-list" role="list" aria-label="Kurir partner tersedia">
                {dispatchCandidates.map((partner) => (
                  <button
                    key={partner.id}
                    type="button"
                    role="listitem"
                    className="payment-item"
                    onClick={() => dispatchToPartner(partner.id, partner.name)}
                  >
                    <div className="payment-info">
                      <h3 className="payment-name">{partner.name}</h3>
                      <p className="payment-number">
                        {partner.activeOrders} order aktif ·{' '}
                        {partner.status === 'available' ? 'siap menerima' : 'offline'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : null}
      </BottomSheet>

      {/* Konfirmasi 2-langkah untuk aksi yang keluar rel atau menahan uang. */}
      <ConfirmSheet
        open={rejectId !== null}
        title="Tolak pesanan?"
        body={`Pesanan ${codeOf(rejectId)} keluar dari antrean dan tidak bisa dikembalikan dari halaman ini.`}
        confirmLabel="Tolak pesanan"
        onConfirm={confirmReject}
        onClose={() => setRejectId(null)}
      />

      <ConfirmSheet
        open={cancelId !== null}
        title="Batalkan pesanan?"
        body={`Pesanan ${codeOf(cancelId)} dibatalkan dan dana dikembalikan ke pelanggan. Kamu tidak menerima pembayaran untuk order ini.`}
        confirmLabel="Batalkan pesanan"
        onConfirm={confirmCancel}
        onClose={() => setCancelId(null)}
      />

      <MerchantBottomNav />
    </div>
  )
}
