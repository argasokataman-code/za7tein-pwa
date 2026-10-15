import { Check, Circle, Lock, Play, Timer, Truck } from 'lucide-react'

import {
  BATCH_STATUS_LABEL,
  MAX_BATCH_ORDERS,
  batchAllPacked,
  batchOrders,
  canStartEarly,
  countdownLabel,
} from '../../data/batch'
import { COURIER_STATUS_LABEL } from '../../data/courier'
import type { Batch, Courier, MerchantOrder } from '../../types'

interface BatchPanelProps {
  batches: Batch[]
  orders: MerchantOrder[]
  couriers: Courier[]
  onAssign: (batchId: string, courierId: string) => void
  onCloseEarly: (batchId: string) => void
  onApproveStart: (batchId: string) => void
}

/**
 * Panel batch kurir inhouse (PRD §8) di konsol merchant. Satu batch diantar satu
 * kurir inhouse — karena itu kurir dipilih **per batch**, bukan per order seperti
 * alur lama (C-01/C-02). Status, sisa kapasitas, dan syarat mulai lebih awal
 * dibaca dari fungsi murni `src/data/batch.ts`, bukan dihitung di JSX.
 */
export function BatchPanel({
  batches,
  orders,
  couriers,
  onAssign,
  onCloseEarly,
  onApproveStart,
}: BatchPanelProps) {
  if (batches.length === 0) return null

  return (
    <section className="merchant-batch" aria-label="Batch kurir inhouse">
      <div className="merchant-batch-head">
        <h2 className="merchant-card-title">Batch kurir</h2>
        <span className="merchant-card-sub">Maks {MAX_BATCH_ORDERS} order per batch</span>
      </div>

      {batches.map((batch, index) => {
        const list = batchOrders(batch, orders)
        const packed = batchAllPacked(batch, orders)
        const startable = canStartEarly(batch, orders)
        const selectingCourier = batch.status === 'countdown' || batch.status === 'closed'
        return (
          <article key={batch.id} className="merchant-card merchant-batch-card">
            <div className="merchant-batch-top">
              <span className="merchant-batch-name">Batch #{index + 1}</span>
              <span className="merchant-batch-countdown">
                <Timer size={14} strokeWidth={1.75} aria-hidden="true" />
                {countdownLabel(batch.countdownSeconds)}
              </span>
            </div>

            <div className="merchant-batch-meta">
              <span className={`merchant-badge merchant-badge-${batch.status}`}>
                {BATCH_STATUS_LABEL[batch.status]}
              </span>
              <span className="merchant-card-sub">
                {list.length} / {MAX_BATCH_ORDERS} order
                {packed ? ' · semua packing' : ''}
              </span>
            </div>

            <ul className="merchant-batch-orders">
              {list.map((order) => (
                <li key={order.id}>
                  <span>{order.code}</span>
                  <span className={order.packed ? 'is-packed' : ''}>
                    {order.packed ? 'Packing selesai' : 'Belum packing'}
                  </span>
                </li>
              ))}
              {list.length === 0 ? <li>Belum ada order di batch ini.</li> : null}
            </ul>

            {selectingCourier ? (
              <div className="merchant-assign">
                <div className="merchant-assign-head">
                  <span className="merchant-assign-label">Kurir inhouse</span>
                  <span className="merchant-assign-req">Satu untuk seluruh batch</span>
                </div>
                <div className="courier-pick" aria-label={`Pilih kurir batch ${index + 1}`}>
                  {couriers.length === 0 ? (
                    <p className="courier-pick__empty">Belum ada kurir tersedia.</p>
                  ) : null}
                  {couriers.map((item) => {
                    const selected = batch.courierId === item.id
                    const initials = item.name
                      .split(' ')
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join('')
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        className={`courier-pick__item${selected ? ' is-selected' : ''}`}
                        onClick={() => onAssign(batch.id, item.id)}
                      >
                        <span
                          className={`courier-pick__avatar${selected ? ' is-selected' : ''}`}
                          aria-hidden="true"
                        >
                          {initials}
                        </span>
                        <span className="courier-pick__body">
                          <span className="courier-pick__name">{item.name}</span>
                          <span className="courier-pick__meta">
                            {COURIER_STATUS_LABEL[item.status] ?? item.status}
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
              </div>
            ) : (
              <p className="merchant-batch-courier">
                <Truck size={16} strokeWidth={1.75} aria-hidden="true" />
                {couriers.find((c) => c.id === batch.courierId)?.name ?? 'Kurir belum ditugaskan'}
              </p>
            )}

            <div className="merchant-batch-actions">
              {batch.status === 'countdown' ? (
                <button
                  type="button"
                  className="merchant-btn-ghost"
                  onClick={() => onCloseEarly(batch.id)}
                >
                  <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
                  Tutup lebih awal
                </button>
              ) : null}
              {batch.status === 'closed' ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!startable || !batch.courierId}
                  onClick={() => onApproveStart(batch.id)}
                >
                  <Play size={16} strokeWidth={1.75} aria-hidden="true" />
                  Setujui mulai lebih awal
                </button>
              ) : null}
            </div>
            {batch.status === 'closed' && !startable ? (
              <p className="merchant-card-sub">
                Kurir boleh mulai lebih awal setelah semua order di batch selesai packing.
              </p>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}
