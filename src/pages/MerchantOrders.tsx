import { useState } from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { JourneyLine } from '../components/JourneyLine'
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

export default function MerchantOrders() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((s) => s.merchant.orders)
  const couriers = useAppSelector((s) => s.merchant.couriers)
  const [tab, setTab] = useState<QueueTabId>('masuk')

  const activeTab = QUEUE_TABS.find((t) => t.id === tab) ?? QUEUE_TABS[0]
  const visible = ordersForStatuses(orders, activeTab.statuses)

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
            const courier = couriers.find((c) => c.id === order.courierId)
            return (
            <section key={order.id} className="merchant-order-card">
              <div className="merchant-order-head">
                <div className="merchant-order-buyer">
                  <img
                    className="merchant-buyer-avatar"
                    src={order.buyerAvatar}
                    alt={`Profil ${order.customerName}`}
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="merchant-order-code">{order.code}</p>
                    <p className="merchant-order-sub">
                      {order.customerName} · {order.placedAt}
                    </p>
                  </div>
                </div>
                <div className="merchant-order-head-right">
                  <div
                    className="merchant-order-rating"
                    aria-label={`Rating pembeli ${order.buyerRating} dari 5`}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        strokeWidth={1.75}
                        color="var(--star)"
                        fill={i < order.buyerRating ? 'var(--star)' : 'none'}
                      />
                    ))}
                  </div>
                  <span className={`merchant-badge merchant-badge-${order.status}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              {/* Journey Line: merchant melihat posisi tiap pesanan tanpa
                  membuka apa pun. Komponen yang sama dengan layar customer dan
                  tugas kurir — status pesanan tetap satu model lintas peran
                  (AGENTS.md §9: turunkan, jangan gambar ulang). Order `masuk`
                  belum punya tahap dan order ditolak/batal tidak lagi di rel,
                  jadi keduanya tidak menampilkan journey. */}
              {JOURNEY_STAGE[order.status] ? (
                <JourneyLine stage={JOURNEY_STAGE[order.status] as OrderStage} />
              ) : null}

              <ul className="merchant-order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>{money(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <p className="merchant-order-meta">
                {order.address} · {formatDistance(order.distanceMeters)} · Zona {zoneLabel(order.zone)} ·{' '}
                {order.paymentMethod === 'cod' ? 'COD' : 'Transfer'}
              </p>
              <p className="merchant-order-total">Total {money(order.total)}</p>

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

              {order.status === 'diterima' || order.status === 'dimasak' ? (
                <div className="merchant-cook">
                  <label htmlFor={`cook-${order.id}`}>
                    Estimasi masak: {order.cookMinutes ?? 20} menit
                  </label>
                  <input
                    id={`cook-${order.id}`}
                    type="range"
                    min={15}
                    max={30}
                    value={order.cookMinutes ?? 20}
                    onChange={(e) =>
                      dispatch(
                        setCookMinutes({ id: order.id, minutes: Number(e.target.value) }),
                      )
                    }
                  />

                  <div className="merchant-assign">
                    <label htmlFor={`courier-${order.id}`} className="form-label">
                      Kurir
                    </label>
                    <select
                      id={`courier-${order.id}`}
                      className="form-control"
                      value={order.courierId ?? ''}
                      onChange={(e) => {
                        const courierId = e.target.value
                        if (!courierId) return
                        dispatch(assignCourier({ orderId: order.id, courierId }))
                      }}
                    >
                      <option value="">Pilih kurir…</option>
                      {couriers.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} · {COURIER_STATUS_LABEL[item.status] ?? item.status}
                        </option>
                      ))}
                    </select>
                    <p className="merchant-card-sub">
                      {courier
                        ? `${courier.name} ditugaskan · hold ${HOLD_STATUS_COPY.cut.label}`
                        : HOLD_STATUS_COPY.held.note}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => dispatch(setOrderStatus({ id: order.id, status: 'diantar' }))}
                  >
                    Siap diantar
                  </button>
                </div>
              ) : null}
              {order.status === 'selesai' ? (
                <div className="merchant-actions">
                  <Link
                    className="merchant-btn-ghost"
                    to={`/dispute?order=${order.code}&by=merchant`}
                  >
                    Ajukan Sengketa
                  </Link>
                </div>
              ) : null}
            </section>
            )
          })
        )}
      </main>
      <MerchantBottomNav />
    </div>
  )
}
