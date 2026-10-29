import { useMemo, useState } from 'react'
import { ChevronRight, Inbox, Search, Timer, Truck } from 'lucide-react'

import {
  BATCH_STATUS_LABEL,
  BATCH_TABS,
  MAX_BATCH_ORDERS,
  batchIsDone,
  batchNumber,
  batchOrders,
  batchPackedCount,
  batchProgress,
  batchesForTab,
  countdownLabel,
  type BatchTabId,
} from '../../data/batch'
import type { Batch, Courier, MerchantOrder } from '../../types'

interface BatchPanelProps {
  batches: Batch[]
  orders: MerchantOrder[]
  couriers: Courier[]
  onOpen: (batchId: string) => void
}

/**
 * Daftar batch dapur, dipisah per tahap kerja. Dulu semua batch (termasuk
 * riwayat) dirender inline di atas antrean, sehingga daftar order tenggelam.
 * Sekarang satu daftar pada satu waktu; detail batch punya layar sendiri.
 */
export function BatchPanel({ batches, orders, couriers, onOpen }: BatchPanelProps) {
  const [tab, setTab] = useState<BatchTabId>('countdown')
  const [query, setQuery] = useState('')

  const counts = useMemo(
    () =>
      Object.fromEntries(
        BATCH_TABS.map((item) => [item.id, batchesForTab(batches, orders, item.id).length]),
      ) as Record<BatchTabId, number>,
    [batches, orders],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return batchesForTab(batches, orders, tab).filter((batch) => {
      if (!needle) return true
      const number = batchNumber(batch.id)
      const list = batchOrders(batch, orders)
      const courier = couriers.find((item) => item.id === batch.courierId)?.name ?? ''
      return [`batch ${number ?? ''}`, ...list.map((order) => order.code), courier]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [batches, couriers, orders, query, tab])

  if (batches.length === 0) {
    return (
      <div className="merchant-batch-empty">
        <Inbox size={28} strokeWidth={1.75} aria-hidden="true" />
        <p className="merchant-batch-empty-title">Belum ada batch</p>
        <p className="merchant-batch-empty-sub">
          Batch dibuat saat order Regular diterima. Order Quick tidak memakai batch.
        </p>
      </div>
    )
  }

  return (
    <section className="merchant-batch-workspace" aria-label="Batch dapur">
      <div className="merchant-tabs merchant-batch-tabs" role="tablist" aria-label="Tahap batch">
        {BATCH_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`merchant-tab${tab === item.id ? ' active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <span className="merchant-tab-count">{counts[item.id]}</span>
          </button>
        ))}
      </div>

      <label className="merchant-batch-search">
        <Search size={16} strokeWidth={1.75} aria-hidden="true" />
        <input
          type="search"
          value={query}
          aria-label="Cari batch, kode order, atau kurir"
          placeholder="Cari batch, kode order, atau kurir"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {visible.length === 0 ? (
        <div className="merchant-batch-empty">
          <Inbox size={28} strokeWidth={1.75} aria-hidden="true" />
          <p className="merchant-batch-empty-title">Tidak ada batch di tahap ini</p>
          <p className="merchant-batch-empty-sub">
            {query.trim() ? 'Coba kata kunci lain.' : 'Batch akan pindah ke sini setelah tahap sebelumnya selesai.'}
          </p>
        </div>
      ) : (
        <div className="merchant-batch-list">
          {visible.map((batch) => {
            const list = batchOrders(batch, orders)
            const packed = batchPackedCount(batch, orders)
            const progress = batchProgress(batch, orders)
            const done = batchIsDone(batch, orders)
            const number = batchNumber(batch.id)
            const courier = couriers.find((item) => item.id === batch.courierId)?.name
            const status = done ? 'done' : batch.status
            return (
              <button
                key={batch.id}
                type="button"
                className="merchant-batch-row"
                onClick={() => onOpen(batch.id)}
                aria-label={`Buka batch ${batch.id}`}
              >
                <span className="merchant-batch-row-top">
                  <span className="merchant-batch-row-title">
                    {number === null ? 'Batch' : `Batch #${number}`}
                  </span>
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
                </span>

                <span className="merchant-batch-row-meta">
                  {list.length}/{MAX_BATCH_ORDERS} order · {packed} selesai packing
                </span>

                <span className="merchant-batch-row-progress" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </span>

                <span className="merchant-batch-row-foot">
                  <span className="merchant-batch-row-courier">
                    <Truck size={15} strokeWidth={1.75} aria-hidden="true" />
                    {courier ?? 'Kurir belum ditugaskan'}
                  </span>
                  <ChevronRight size={17} strokeWidth={1.75} aria-hidden="true" />
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
