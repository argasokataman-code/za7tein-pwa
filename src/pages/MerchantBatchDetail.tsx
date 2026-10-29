import { useState } from 'react'
import { Check, ChevronRight, Circle, Inbox, Lock, Play, Timer, Truck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { BottomSheet } from '../components/ui/BottomSheet'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { COURIER_STATUS_LABEL } from '../data/courier'
import {
  BATCH_STATUS_LABEL,
  MAX_BATCH_ORDERS,
  batchIsDone,
  batchNumber,
  batchOrders,
  batchPackedCount,
  batchProgress,
  canStartEarly,
  countdownLabel,
  orderPacked,
} from '../data/batch'
import { useMerchantBatchActions } from '../hooks/useMerchantBatchActions'
import { useAppSelector } from '../hooks/useAppStore'
import type { MerchantOrder } from '../types'

type RowFilter = 'all' | 'packing' | 'done'

function rowStatus(order: MerchantOrder): 'packing' | 'done' {
  return orderPacked(order) ? 'done' : 'packing'
}

/** Layar detail satu batch: ringkasan, kurir, aksi batch, dan daftar order. */
export default function MerchantBatchDetail() {
  const { batchId = '' } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const batches = useAppSelector((state) => state.batch.batches)
  const orders = useAppSelector((state) => state.merchant.orders)
  const couriers = useAppSelector((state) => state.merchant.couriers)
  const { assignCourier, closeEarly, approveStart } = useMerchantBatchActions(batches)
  const [courierOpen, setCourierOpen] = useState(false)
  const [rowFilter, setRowFilter] = useState<RowFilter>('all')

  const batch = batches.find((item) => item.id === batchId)
  const list = batch ? batchOrders(batch, orders) : []
  const packed = batch ? batchPackedCount(batch, orders) : 0
  const progress = batch ? batchProgress(batch, orders) : 0
  const done = batch ? batchIsDone(batch, orders) : false
  const number = batchNumber(batch?.id)
  const courier = couriers.find((item) => item.id === batch?.courierId)
  const startable = batch ? canStartEarly(batch, orders) : false

  const rows = rowFilter === 'all' ? list : list.filter((order) => rowStatus(order) === rowFilter)

  if (!batch) {
    return (
      <div className="app-shell">
        <main className="merchant-page">
          <MerchantPageHeader eyebrow="Batch dapur" title="Batch" back="/orders?view=batch" />
          <div className="merchant-ticket-empty">
            <Inbox size={28} strokeWidth={1.75} aria-hidden="true" />
            <p className="merchant-ticket-empty-title">Batch tidak ditemukan</p>
            <p className="merchant-ticket-empty-sub">
              Batch ini mungkin sudah selesai atau tidak lagi tersedia di perangkat ini.
            </p>
          </div>
        </main>
        <MerchantBottomNav />
      </div>
    )
  }

  const status = done ? 'done' : batch.status
  const canAssign = ['countdown', 'closed', 'awaiting_courier'].includes(batch.status)
  const packingCount = list.length - packed
  const doneCount = packed

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader
          eyebrow="Batch dapur"
          title={number === null ? 'Batch' : `Batch #${number}`}
          back="/orders?view=batch"
        />

        <article className="merchant-batch-hero">
          <div className="merchant-batch-hero-top">
            <div>
              <p className="merchant-batch-hero-kicker">Ruang tunggu kurir</p>
              <h2>{number === null ? 'Batch' : `Batch #${number}`}</h2>
            </div>
            <span className={`merchant-badge merchant-badge-${status}`}>
              {batch.status === 'countdown' ? (
                <>
                  <Timer size={12} strokeWidth={1.75} aria-hidden="true" />
                  {countdownLabel(batch.countdownSeconds)}
                </>
              ) : (
                BATCH_STATUS_LABEL[status]
              )}
            </span>
          </div>

          <p className="merchant-batch-hero-meta">
            {list.length}/{MAX_BATCH_ORDERS} order · {packed} selesai packing
          </p>
          <div className="merchant-batch-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="merchant-batch-courier-row">
            <span>
              <Truck size={16} strokeWidth={1.75} aria-hidden="true" />
              {courier ? `Kurir: ${courier.name}` : 'Kurir belum ditugaskan'}
            </span>
            {canAssign ? (
              <button type="button" className="merchant-btn-ghost" onClick={() => setCourierOpen(true)}>
                {courier ? 'Ganti kurir' : 'Atur kurir'}
              </button>
            ) : null}
          </div>

          <div className="merchant-batch-actions">
            {batch.status === 'countdown' ? (
              <button
                type="button"
                className="merchant-btn-ghost"
                onClick={() => closeEarly(batch.id)}
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
                onClick={() => approveStart(batch.id)}
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

        <div className="merchant-batch-orders-head">
          <h2>Daftar order</h2>
          <span>{packed}/{list.length} selesai</span>
        </div>

        <div className="merchant-tabs" role="tablist" aria-label="Saring order batch">
          {([
            ['all', 'Semua', list.length],
            ['packing', 'Packing', packingCount],
            ['done', 'Selesai', doneCount],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={rowFilter === id}
              className={`merchant-tab${rowFilter === id ? ' active' : ''}`}
              onClick={() => setRowFilter(id)}
            >
              {label}
              <span className="merchant-tab-count">{count}</span>
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="merchant-ticket-empty">
            <Inbox size={28} strokeWidth={1.75} aria-hidden="true" />
            <p className="merchant-ticket-empty-title">Tidak ada order di filter ini</p>
            <p className="merchant-ticket-empty-sub">Pilih filter lain untuk melihat isi batch.</p>
          </div>
        ) : (
          <div className="merchant-batch-order-list">
            {rows.map((order) => {
              const packedOrder = orderPacked(order)
              return (
                <button
                  key={order.id}
                  type="button"
                  className="list-row merchant-batch-order"
                  onClick={() =>
                    navigate(`/orders?view=batch&order=${encodeURIComponent(order.id)}`)
                  }
                >
                  <span className="merchant-batch-order-main">
                    <span className="merchant-batch-order-code">{order.code}</span>
                    <span className="merchant-batch-order-name">{order.customerName}</span>
                  </span>
                  <span
                    className={`merchant-badge merchant-badge-${packedOrder ? 'selesai' : 'disiapkan'}`}
                  >
                    {packedOrder ? 'Selesai' : 'Packing'}
                  </span>
                  <span className="merchant-batch-order-meta">
                    {order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
                  </span>
                  <ChevronRight
                    size={16}
                    strokeWidth={1.75}
                    className="merchant-batch-order-chevron"
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>
        )}
      </main>

      <BottomSheet
        open={courierOpen}
        title={number === null ? 'Pilih kurir batch' : `Pilih kurir Batch #${number}`}
        onClose={() => setCourierOpen(false)}
      >
        <p className="merchant-card-sub">
          Satu kurir inhouse mengantar seluruh batch. Pilih kurir yang siap berangkat.
        </p>
        {couriers.length === 0 ? (
          <p className="merchant-empty">Belum ada kurir tersedia.</p>
        ) : (
          <div className="courier-pick" aria-label="Pilih kurir batch">
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
                  onClick={() => {
                    assignCourier(batch.id, item.id)
                    setCourierOpen(false)
                  }}
                >
                  <span className="courier-pick__avatar" aria-hidden="true">
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
        )}
      </BottomSheet>

      <MerchantBottomNav />
    </div>
  )
}
