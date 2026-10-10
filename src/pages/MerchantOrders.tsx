import { useState } from 'react'
import { Check, ChevronRight, Circle, Inbox, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'

import { insertNotification } from '../api/notifications'
import { assignOrderCourier, updateOrderStatus } from '../api/orders'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { JourneyLine } from '../components/JourneyLine'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { NotificationBell } from '../components/ui/NotificationBell'
import { useMerchantOrdersSync } from '../hooks/useApiOrders'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { moneyPlain } from '../data/currency'
import { COURIER_STATUS_LABEL } from '../data/courier'
import { HOLD_STATUS_COPY, formatDistance, money, zoneLabel } from '../data/merchant'
import {
  QUEUE_TABS,
  orderAgeLabel,
  orderAgeMinutes,
  orderStatusLabel,
  orderUrgency,
  ordersForStatuses,
  type QueueTabId,
} from '../data/merchantOrders'
import { assignCourier, setCookMinutes, setOrderStatus } from '../store/slices/merchantSlice'
import type { MerchantOrderStatus, OrderStage } from '../types'

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

/* Estimasi masak sebagai pilihan tetap, bukan slider. Slider adalah kontrol
   desktop (tarik presisi) dan di ponsel terasa seperti form web; segmented
   control adalah pola native untuk rentang kecil yang diskret. */
const COOK_OPTIONS = [15, 25, 35] as const
const DEFAULT_COOK_MINUTES = 25

/* Empty state per tab memberi konteks, bukan sekadar "kosong": merchant tahu
   kenapa tab ini belum berisi dan apa yang akan muncul. */
const EMPTY_HINT: Record<QueueTabId, string> = {
  masuk: 'Order baru muncul di sini begitu pelanggan memesan.',
  diproses: 'Order yang sudah kamu terima sedang berjalan di sini.',
  selesai: 'Order yang tuntas akan tersimpan di sini.',
  batal: 'Order yang ditolak atau dibatalkan tampil di sini.',
}

export default function MerchantOrders() {
  const dispatch = useAppDispatch()
  useMerchantOrdersSync()
  const orders = useAppSelector((s) => s.merchant.orders)
  const couriers = useAppSelector((s) => s.merchant.couriers)
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
  /* Konfirmasi 2-langkah: aksi yang keluar rel / menahan uang tidak boleh
     terjadi karena satu sentuhan salah (ConfirmSheet, pola yang sama dengan
     panel CS). Id disimpan, bukan objek, supaya tetap valid setelah re-render. */
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [dispatchId, setDispatchId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const activeTab = QUEUE_TABS.find((t) => t.id === tab) ?? QUEUE_TABS[0]
  const visible = ordersForStatuses(orders, activeTab.statuses)
  const detailOrder = orders.find((o) => o.id === detailId) ?? null
  const detailCourier = detailOrder ? couriers.find((c) => c.id === detailOrder.courierId) : undefined
  const codeOf = (id: string | null) => orders.find((o) => o.id === id)?.code ?? ''

  /** Emit notifikasi ke customer (best-effort — UI tidak menunggu jaringan). */
  const notifyCustomer = (title: string, body: string) => {
    void insertNotification({ audience: 'customer', kind: 'order', title, body }).catch(() => {})
  }

  /** Persist transisi status ke `orders.status` BE (best-effort). */
  const persistStatus = (id: string, status: MerchantOrderStatus) => {
    void updateOrderStatus(id, status).catch(() => {})
  }

  const receiveOrder = (id: string, code: string) => {
    dispatch(setOrderStatus({ id, status: 'diterima' }))
    persistStatus(id, 'diterima')
    toast.success(`Order ${code} diterima`)
    notifyCustomer('Pesanan diterima', 'Toko menerima pesananmu dan mulai menyiapkannya.')
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

  const confirmDispatch = () => {
    if (!dispatchId) return
    const order = orders.find((o) => o.id === dispatchId)
    if (!order?.courierId) {
      toast.error('Assign kurir dulu sebelum serahkan pesanan')
      setDispatchId(null)
      return
    }
    dispatch(setOrderStatus({ id: dispatchId, status: 'diantar' }))
    persistStatus(dispatchId, 'diantar')
    toast.success(`Order ${order?.code ?? ''} siap dan diserahkan ke kurir`)
    notifyCustomer('Kurir menuju lokasimu', 'Pesananmu sedang diantar oleh kurir.')
    setDispatchId(null)
  }

  const confirmCancel = () => {
    if (!cancelId) return
    const order = orders.find((o) => o.id === cancelId)
    dispatch(setOrderStatus({ id: cancelId, status: 'batal' }))
    persistStatus(cancelId, 'batal')
    toast.success(`Order ${order?.code ?? ''} dibatalkan — dana hold dikembalikan`)
    notifyCustomer('Pesanan dibatalkan', 'Pesanan dibatalkan dan dana hold dikembalikan.')
    setCancelId(null)
  }

  /* Ringkasan item untuk baris antrean: satu baris, dipotong dengan elipsis.
     Daftar lengkap dengan harga ada di sheet detail. */
  const itemSummary = (order: (typeof orders)[number]) =>
    order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader
          eyebrow="Antrean dapur"
          title="Order"
          action={<NotificationBell />}
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

        {visible.length === 0 ? (
          <div className="merchant-ticket-empty">
            <Inbox size={28} strokeWidth={1.75} aria-hidden="true" />
            <p className="merchant-ticket-empty-title">Tidak ada order di tab ini</p>
            <p className="merchant-ticket-empty-sub">{EMPTY_HINT[activeTab.id]}</p>
          </div>
        ) : (
          visible.map((order) => {
            const ageMinutes = orderAgeMinutes(order)
            const urgency = orderUrgency(order, ageMinutes)
            return (
              <article key={order.id} className="merchant-ticket">
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
                      <span className={`merchant-badge merchant-badge-${order.status}`}>
                        {orderStatusLabel(order.status)}
                      </span>
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
                  <div className="merchant-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => receiveOrder(order.id, order.code)}
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      className="merchant-btn-ghost"
                      onClick={() => setRejectId(order.id)}
                    >
                      Tolak
                    </button>
                  </div>
                ) : null}
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
                    {detailOrder.customerName} · {detailOrder.placedAt}
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
              {detailOrder.address} · {formatDistance(detailOrder.distanceMeters)} · Zona{' '}
              {zoneLabel(detailOrder.zone)} · {detailOrder.paymentMethod === 'cod' ? 'COD' : 'Transfer'}
            </p>
            <p className="merchant-order-total">Total {money(detailOrder.total)}</p>

            {detailOrder.status === 'baru' ? (
              <div className="merchant-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => receiveOrder(detailOrder.id, detailOrder.code)}
                >
                  Terima
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
            ) : null}

            {detailOrder.status === 'diterima' ||
            detailOrder.status === 'disiapkan' ||
            detailOrder.status === 'siap' ? (
              <div className="merchant-cook">
                <div className="merchant-cook-head">
                  <span>Estimasi masak</span>
                  <strong>{detailOrder.cookMinutes ?? DEFAULT_COOK_MINUTES} menit</strong>
                </div>
                <div
                  className="merchant-cook-segments"
                  role="group"
                  aria-label={`Estimasi masak ${detailOrder.code}`}
                >
                  {COOK_OPTIONS.map((minutes) => {
                    const active = (detailOrder.cookMinutes ?? DEFAULT_COOK_MINUTES) === minutes
                    return (
                      <button
                        key={minutes}
                        type="button"
                        className={active ? 'is-active' : ''}
                        aria-pressed={active}
                        onClick={() => {
                          dispatch(setCookMinutes({ id: detailOrder.id, minutes }))
                          notifyCustomer('Pesanan sedang dimasak', 'Toko mulai memasak pesananmu.')
                        }}
                      >
                        {minutes}
                      </button>
                    )
                  })}
                </div>

                <div className="merchant-assign">
                  <div className="merchant-assign-head">
                    <span className="merchant-assign-label">Kurir</span>
                    <span className="merchant-assign-req">Wajib pilih satu</span>
                  </div>
                  <div className="courier-pick" aria-label="Pilih kurir">
                    {couriers.length === 0 ? (
                      <p className="courier-pick__empty">Belum ada kurir tersedia.</p>
                    ) : null}
                    {couriers.map((item) => {
                      const selected = detailOrder.courierId === item.id
                      const initials = item.name
                        .split(' ')
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join('')
                      const tone =
                        item.status === 'at_store'
                          ? 'success'
                          : item.status === 'delivering'
                            ? 'info'
                            : 'muted'
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={selected}
                          className={`courier-pick__item${selected ? ' is-selected' : ''}`}
                          onClick={() => {
                            dispatch(assignCourier({ orderId: detailOrder.id, courierId: item.id }))
                            void assignOrderCourier(detailOrder.id, item.id).catch(() => {})
                            void insertNotification({
                              audience: 'courier',
                              kind: 'courier',
                              title: 'Tugas baru',
                              body: `Kamu ditugaskan mengantar ${detailOrder.code}.`,
                            }).catch(() => {})
                          }}
                        >
                          <span className="courier-pick__avatar" aria-hidden="true">
                            {initials}
                            <span className={`courier-pick__dot courier-pick__dot--${tone}`} />
                          </span>
                          <span className="courier-pick__body">
                            <span className="courier-pick__name">{item.name}</span>
                            <span className={`courier-pick__meta courier-pick__meta--${tone}`}>
                              {COURIER_STATUS_LABEL[item.status] ?? item.status}
                              {item.activeOrderCount ? ` · ${item.activeOrderCount} tugas aktif` : ''}
                            </span>
                          </span>
                          <span className="courier-pick__check" aria-hidden="true">
                            {selected ? (
                              <Check size={18} strokeWidth={1.75} />
                            ) : (
                              <Circle size={18} strokeWidth={1.75} />
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {!detailOrder.courierId ? (
                    <p className="courier-pick__hint">
                      Pilih satu kurir sebelum pesanan diserahkan.
                    </p>
                  ) : null}
                </div>

                <p className="merchant-card-sub">
                  {detailCourier
                    ? `Hold ${HOLD_STATUS_COPY.cut.label}: potongan dikunci sampai OTP`
                    : HOLD_STATUS_COPY.held.note}
                </p>

                {detailOrder.status === 'siap' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!detailOrder.courierId}
                    onClick={() => {
                      setDetailId(null)
                      setDispatchId(detailOrder.id)
                    }}
                  >
                    Siap diantar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      dispatch(setOrderStatus({ id: detailOrder.id, status: 'siap' }))
                      persistStatus(detailOrder.id, 'siap')
                      notifyCustomer('Pesanan siap diantar', 'Pesananmu siap dan menunggu kurir.')
                    }}
                  >
                    Tandai siap
                  </button>
                )}

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
              </div>
            ) : null}

            {/* Lane guard (f12): order yang sudah di jalan bisa macet. Merchant
                hanya punya dua jalan keluar — ganti kurir (di blok cook) atau
                batalkan dan kembalikan dana hold. */}
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
        open={dispatchId !== null}
        title="Serahkan ke kurir?"
        body={`Pesanan ${codeOf(dispatchId)} ditandai siap diantar. Kurir menerima tugas dan pelanggan melihat statusnya berjalan.`}
        confirmLabel="Siap diantar"
        onConfirm={confirmDispatch}
        onClose={() => setDispatchId(null)}
      />

      <ConfirmSheet
        open={cancelId !== null}
        title="Batalkan pesanan?"
        body={`Pesanan ${codeOf(cancelId)} dibatalkan dan dana hold dikembalikan ke pelanggan. Kamu tidak menerima pembayaran untuk order ini.`}
        confirmLabel="Batalkan & refund"
        onConfirm={confirmCancel}
        onClose={() => setCancelId(null)}
      />

      <MerchantBottomNav />
    </div>
  )
}
