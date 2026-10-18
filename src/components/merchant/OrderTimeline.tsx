import { useEffect, useState } from 'react'

import { Check, Circle } from 'lucide-react'

import { fetchOrderCheckpoints, fetchOrderHistory, statusLabelOf } from '../../api/orders'
import { apiEnabled } from '../../api/supabase'
import { batchNumber } from '../../data/batch'
import { orderDeliveryType } from '../../data/merchantOrders'
import type { MerchantOrder } from '../../types'

interface OrderTimelineProps {
  order: MerchantOrder
}

/** Satu langkah riwayat. `at` hanya terisi bila waktunya memang ada. */
interface HistoryStep {
  label: string
  at?: string
  reached: boolean
}

/** Langkah + waktu mentah untuk mengurutkan gabungan dua sumber. */
interface MergedStep extends HistoryStep {
  ms: number
}

/**
 * Tonggak kurir (`checkpoints.kind`) → label lini masa. Nilai tak dikenal
 * ditampilkan apa adanya, bukan disembunyikan.
 */
const CHECKPOINT_LABEL: Record<string, string> = {
  at_store: 'Kurir tiba di toko',
  picked_up: 'Pesanan diambil kurir',
  arrived: 'Kurir tiba di lokasi',
  otp_verified: 'OTP terverifikasi',
}

/** `HH:MM` lokal dari stempel ISO; kosong bila tak valid. */
function clock(iso: string): string {
  const t = new Date(iso)
  return Number.isNaN(t.getTime())
    ? ''
    : t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Riwayat perjalanan satu order.
 *
 * Dua sumber BE digabung dan diurutkan waktu — keduanya sudah diekspos Worker:
 * `order_status_history` (satu baris per transisi status) dan `checkpoints`
 * (tonggak fisik kurir: diambil, tiba, OTP terverifikasi). Kalau keduanya belum
 * ada barisnya (order mock/luring), jatuh ke riwayat yang disusun dari keadaan
 * order (status, packing, batch).
 */
function historySteps(order: MerchantOrder): HistoryStep[] {
  const number = batchNumber(order.batchId)
  const steps: HistoryStep[] = [
    { label: 'Pesanan dibuat', at: order.placedAt, reached: true },
    { label: 'Diterima toko', reached: order.status !== 'baru' },
  ]
  if (orderDeliveryType(order) === 'regular') {
    steps.push({
      label: number === null ? 'Menunggu masuk batch' : `Masuk batch #${number}`,
      reached: number !== null,
    })
  }
  if (order.packed) steps.push({ label: 'Selesai packing', reached: true })
  steps.push({
    label: 'Dalam pengantaran',
    reached: order.status === 'diantar' || order.status === 'tiba' || order.status === 'selesai',
  })
  steps.push({ label: 'Selesai', reached: order.status === 'selesai' })
  return steps
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const [events, setEvents] = useState<HistoryStep[] | null>(null)

  useEffect(() => {
    if (!apiEnabled || !order.id.startsWith('api-')) {
      setEvents(null)
      return
    }
    let alive = true
    // Dua sumber, satu lini masa: transisi status + tonggak kurir, urut waktu.
    Promise.all([
      fetchOrderHistory(order.id).catch(() => []),
      fetchOrderCheckpoints(order.id).catch(() => []),
    ])
      .then(([history, checkpoints]) => {
        if (!alive) return
        const merged: MergedStep[] = [
          ...history.map((row) => ({
            label: statusLabelOf(row.to_status),
            at: clock(row.at),
            reached: true,
            ms: new Date(row.at).getTime(),
          })),
          ...checkpoints.map((row) => ({
            label: CHECKPOINT_LABEL[row.kind] ?? `Checkpoint ${row.kind}`,
            at: clock(row.at),
            reached: true,
            ms: new Date(row.at).getTime(),
          })),
        ]
        // Kosong = biarkan `historySteps(order)` yang menggambar keadaan order.
        if (merged.length === 0) return
        merged.sort((a, b) => a.ms - b.ms)
        setEvents(merged.map(({ label, at, reached }) => ({ label, at, reached })))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [order.id])

  if (order.status === 'ditolak' || order.status === 'batal') {
    return (
      <div className="merchant-history" aria-label="Riwayat pesanan">
        <p className="merchant-history-row is-reached">
          <span className="merchant-history-mark" aria-hidden="true">
            <Circle size={14} strokeWidth={1.75} />
          </span>
          <span className="merchant-history-label">
            {order.status === 'ditolak' ? 'Pesanan ditolak' : 'Pesanan dibatalkan'}
          </span>
          <span className="merchant-history-time">{order.placedAt}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="merchant-history" aria-label="Riwayat pesanan">
      {(events ?? historySteps(order)).map((step) => (
        <p key={step.label + (step.at ?? '')} className={`merchant-history-row${step.reached ? ' is-reached' : ''}`}>
          <span className="merchant-history-mark" aria-hidden="true">
            {step.reached ? (
              <Check size={14} strokeWidth={2} />
            ) : (
              <Circle size={14} strokeWidth={1.75} />
            )}
          </span>
          <span className="merchant-history-label">{step.label}</span>
          <span className="merchant-history-time">{step.at ?? ''}</span>
        </p>
      ))}
    </div>
  )
}
