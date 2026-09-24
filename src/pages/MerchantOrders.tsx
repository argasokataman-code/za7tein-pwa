import { useState } from 'react'
import { Check, ChevronRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { JourneyLine } from '../components/JourneyLine'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { COURIER_STATUS_LABEL } from '../data/courier'
import { HOLD_STATUS_COPY, formatDistance, money, zoneLabel } from '../data/merchant'
import { QUEUE_TABS, ordersForStatuses, orderStatusLabel, type QueueTabId } from '../data/merchantOrders'
import { assignCourier, setCookMinutes, setOrderStatus } from '../store/slices/merchantSlice'
import type { MerchantOrderStatus, OrderStage } from '../types'

/**
 * Status order merchant → tahap Journey Line.
 *
 * `MerchantOrderStatus` lebih lebar dari `OrderStage`: `masuk` belum masuk rel,
 * dan `selesai`/`ditolak`/`batal` sudah keluar dari rel. Pemetaannya eksplisit
 * (bukan cast) supaya menambah status baru memaksa keputusan di sini, bukan
 * diam-diam salah render.
 */
const JOURNEY_STAGE: Partial<Record<MerchantOrderStatus, OrderStage>> = {
  diterima: 'diterima',
  dimasak: 'dimasak',
  diantar: 'diantar',
  tiba: 'tiba',
  selesai: 'tiba',
}

/* Estimasi masak sebagai pilihan tetap, bukan slider. Slider adalah kontrol
   desktop (tarik presisi) dan di ponsel terasa seperti form web; segmented
   control adalah pola native untuk rentang kecil yang diskret. */
const COOK_OPTIONS = [15, 20, 25, 30] as const

export default function MerchantOrders() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((s) => s.merchant.orders)
  const couriers = useAppSelector((s) => s.merchant.couriers)
  const [tab, setTab] = useState<QueueTabId>('masuk')
  const [detailId, setDetailId] = useState<string | null>(null)

  const activeTab = QUEUE_TABS.find((t) => t.id === tab) ?? QUEUE_TABS[0]
  const visible = ordersForStatuses(orders, activeTab.statuses)
  const detailOrder = orders.find((o) => o.id === detailId) ?? null
  const detailCourier = detailOrder ? couriers.find((c) => c.id === detailOrder.courierId) : undefined

  /* Ringkasan item untuk baris antrean: satu baris, dipotong dengan elipsis.
     Daftar lengkap dengan harga ada di sheet detail. */
  const itemSummary = (order: (typeof orders)[number]) =>
    order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Antrean dapur" title="Order" />

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
          <p className="merchant-empty">Belum ada order di tab ini.</p>
        ) : (
          visible.map((order) => {
            return (
              <article key={order.id} className="merchant-order-card">
                {/* Baris antrean: satu baris yang dipindai cepat, bukan satu
                    layar. Detail lengkap (journey, item, alamat) ada di sheet. */}
                <button
                  type="button"
                  className="merchant-order-row"
                  onClick={() => setDetailId(order.id)}
                >
                  <img
                    className="merchant-buyer-avatar"
                    src={order.buyerAvatar}
                    alt={`Profil ${order.customerName}`}
                    width={40}
                    height={40}
                  />
                  <span className="merchant-order-row-body">
                    <span className="merchant-order-code">{order.code}</span>
                    <span className="merchant-order-sub">
                      {order.customerName} · {order.placedAt}
                    </span>
                    <span className="merchant-order-row-items">{itemSummary(order)}</span>
                  </span>
                  <span className="merchant-order-row-end">
                    <span className={`merchant-badge merchant-badge-${order.status}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <span className="merchant-order-row-total">{money(order.total)}</span>
                  </span>
                  <ChevronRight
                    size={18}
                    strokeWidth={1.75}
                    className="merchant-order-row-chevron"
                    aria-hidden="true"
                  />
                </button>

                {order.status === 'masuk' ? (
                  <div className="merchant-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => dispatch(setOrderStatus({ id: order.id, status: 'diterima' }))}
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      className="merchant-btn-ghost"
                      onClick={() => dispatch(setOrderStatus({ id: order.id, status: 'ditolak' }))}
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
                (AGENTS.md §9: turunkan, jangan gambar ulang). Order `masuk`
                belum punya tahap, dan order ditolak/batal sudah keluar dari
                rel, jadi keduanya tidak menampilkan journey. */}
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

            {detailOrder.status === 'masuk' ? (
              <div className="merchant-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    dispatch(setOrderStatus({ id: detailOrder.id, status: 'diterima' }))
                  }
                >
                  Terima
                </button>
                <button
                  type="button"
                  className="merchant-btn-ghost"
                  onClick={() => dispatch(setOrderStatus({ id: detailOrder.id, status: 'ditolak' }))}
                >
                  Tolak
                </button>
              </div>
            ) : null}

            {detailOrder.status === 'diterima' || detailOrder.status === 'dimasak' ? (
              <div className="merchant-cook">
                <div className="merchant-cook-head">
                  <span>Estimasi masak</span>
                  <strong>{detailOrder.cookMinutes ?? 20} menit</strong>
                </div>
                <div
                  className="merchant-cook-segments"
                  role="group"
                  aria-label={`Estimasi masak ${detailOrder.code}`}
                >
                  {COOK_OPTIONS.map((minutes) => {
                    const active = (detailOrder.cookMinutes ?? 20) === minutes
                    return (
                      <button
                        key={minutes}
                        type="button"
                        className={active ? 'is-active' : ''}
                        aria-pressed={active}
                        onClick={() => dispatch(setCookMinutes({ id: detailOrder.id, minutes }))}
                      >
                        {minutes}
                      </button>
                    )
                  })}
                </div>

                <div className="merchant-assign">
                  <span className="merchant-assign-label">Kurir</span>
                  <div className="sheet-menu">
                    {couriers.map((item) => {
                      const selected = detailOrder.courierId === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`sheet-menu__item${selected ? ' is-selected' : ''}`}
                          aria-current={selected}
                          onClick={() =>
                            dispatch(assignCourier({ orderId: detailOrder.id, courierId: item.id }))
                          }
                        >
                          <span>{item.name}</span>
                          <span className="sheet-menu__note">
                            {COURIER_STATUS_LABEL[item.status] ?? item.status}
                          </span>
                          {selected ? <Check size={18} strokeWidth={1.75} aria-hidden="true" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <p className="merchant-card-sub">
                  {detailCourier
                    ? `Hold ${HOLD_STATUS_COPY.cut.label}: potongan dikunci sampai OTP`
                    : HOLD_STATUS_COPY.held.note}
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    dispatch(setOrderStatus({ id: detailOrder.id, status: 'diantar' }))
                    setDetailId(null)
                  }}
                >
                  Siap diantar
                </button>
              </div>
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

      <MerchantBottomNav />
    </div>
  )
}
