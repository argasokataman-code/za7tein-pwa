import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { useAppSelector } from '../hooks/useAppStore'
import { apiEnabled } from '../api/supabase'
import { fetchCourierHistory } from '../api/orders'
import { useMoney } from '../hooks/useMoney'
import { zoneLabel } from '../data/merchant'
import { distanceLabel } from '../data/courier'
import {
  COURIER_CHECKPOINT_BADGE,
  isActiveTask,
  taskHistory,
} from '../data/courier'
import type { CourierHistoryItem } from '../api/orders'
import type { CourierCheckpoint, CourierTask } from '../types'

type OrderTab = 'active' | 'history'

/**
 * Tanggal ringkas untuk riwayat. Sumbernya `finishedAt` (mock) atau
 * `orders.created_at` (BE, karena D1 tak menyimpan waktu selesai).
 */
function dateLabel(at: string | null): string {
  if (!at) return 'Tanggal tidak tercatat'
  const date = new Date(at)
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tercatat'
  const day = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  const time = `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`
  return `${day}, ${time}`
}

/** Slip tugas aktif: nomor di kepala, isi di badan, biaya di kaki. Seluruh
 *  slip adalah tautan ke detail (journey + stepper + OTP). */
function ActiveTaskCard({ task }: { task: CourierTask }) {
  const { money } = useMoney()
  const initials = task.customerName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <Link className="courier-ticket" to={`/task/${task.id}`}>
      <span className="courier-ticket-stub">
        <span className="courier-task-code">{task.code}</span>
        <span className="courier-ticket-stub-end">
          <span className={`courier-badge courier-badge--${task.checkpoint}`}>
            {COURIER_CHECKPOINT_BADGE[task.checkpoint]}
          </span>
        </span>
      </span>

      <span className="courier-ticket-body">
        <span className="courier-ticket-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="courier-ticket-copy">
          <span className="courier-ticket-name">{task.customerName}</span>
          <span className="courier-task-sub">
            {distanceLabel(task.distanceMeters)} · Zona {zoneLabel(task.zone)}
          </span>
        </span>
        <span className="courier-task-total">{money(task.total)}</span>
        <ChevronRight
          size={18}
          strokeWidth={1.75}
          className="courier-ticket-chevron"
          aria-hidden="true"
        />
      </span>

      <span className="courier-task-addr">
        {task.address} · {task.floor} · {task.unit}
      </span>

      <span className="courier-task-foot">
        <span className="courier-task-meta">
          {task.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
        </span>
        <span className="courier-task-cta">
          {task.paymentMethod === 'cod' ? 'COD, tagih tunai' : 'Transfer, cek bukti'}
        </span>
      </span>
    </Link>
  )
}

/**
 * Baris riwayat: kode + customer di kiri, status + tanggal di rel kanan.
 * Memakai primitif `list-row` (MD-11) supaya rel kanan satu garis.
 *
 * Sengaja **bukan** tautan. Detail tugas (`/task/:id`) membaca `courier.tasks`
 * yang hanya berisi tugas berjalan; order yang sudah berakhir tidak punya
 * checkpoint, OTP, atau item di sana. Menjadikannya tautan berarti menawarkan
 * pintu yang pasti berakhir di "Tugas tidak ditemukan".
 */
function HistoryRow({ item }: { item: CourierHistoryItem }) {
  const { money } = useMoney()
  const checkpoint: CourierCheckpoint = item.status

  return (
    <div className="courier-order-row list-row">
      <span className="courier-order-main">
        <span className="courier-task-code">{item.code}</span>
        <span className="courier-order-name">
          {item.customerName}
          {item.feeIdr > 0 ? ` · ongkir ${money(item.feeIdr)}` : ''}
        </span>
      </span>
      <span className="courier-order-side">
        <span className={`courier-badge courier-badge--${checkpoint}`}>
          {COURIER_CHECKPOINT_BADGE[checkpoint]}
        </span>
        <span className="courier-order-date">{dateLabel(item.at)}</span>
      </span>
    </div>
  )
}

/** Riwayat dari seed lokal, dipakai saat BE tidak tersedia (`apiEnabled` false). */
function historyFromTasks(tasks: CourierTask[]): CourierHistoryItem[] {
  return taskHistory(tasks).map((task) => ({
    id: task.id,
    code: task.code,
    customerName: task.customerName,
    status: task.checkpoint === 'batal' ? 'batal' : 'selesai',
    at: task.finishedAt ?? null,
    feeIdr: task.deliveryFeeIdr ?? 0,
  }))
}

/**
 * Order kurir (`/courier/orders`): satu tempat untuk semua order yang pernah
 * dan sedang dipegang kurir. Dua kategori karena itu dua pertanyaan berbeda —
 * "apa yang harus saya antar sekarang" dan "apa yang sudah saya antar".
 *
 * Tugas aktif = `courier.tasks` (sumber yang sama dengan beranda). Riwayat =
 * `orders` BE berstatus `done`/`canceled` milik kurir ini, dengan seed lokal
 * sebagai cadangan saat BE mati. Riwayat kurir tidak ada di PRD aktif
 * (`UNRESOLVED-by-absence`, lihat `docs/product/prd/.../features/R-COU-INHOUSE.md`
 * §8), jadi bentuknya diturunkan dari data yang sudah ada, bukan aturan baru.
 */
export default function CourierOrders() {
  const tasks = useAppSelector((s) => s.courier.tasks)
  const courierKind = useAppSelector((s) => s.auth.courierKind)

  // Riwayat dibaca dari BE sekali saat halaman dibuka; `null` = masih memuat,
  // `[]` = BE menjawab kosong (keadaan sah, bukan alasan memakai seed).
  const [liveHistory, setLiveHistory] = useState<CourierHistoryItem[] | null>(null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchCourierHistory()
      .then((items) => {
        if (alive) setLiveHistory(items)
      })
      .catch(() => {
        if (alive) setLiveHistory([])
      })
    return () => {
      alive = false
    }
  }, [])

  // Kategori disimpan di URL (`?tab=riwayat`) supaya bisa diukur langsung oleh
  // gerbang dan bertahan saat muat ulang; back tetap kembali ke beranda karena
  // perubahan tab memakai `replace`.
  const [params, setParams] = useSearchParams()
  const tab: OrderTab = params.get('tab') === 'riwayat' ? 'history' : 'active'
  const setTab = (next: OrderTab) => {
    setParams(next === 'history' ? { tab: 'riwayat' } : {}, { replace: true })
  }

  // Partner tidak memakai batch/riwayat toko: permukaannya `/partner`.
  if (courierKind === 'partner') return <Navigate to="/partner" replace />

  const active = tasks.filter(isActiveTask)
  const history = apiEnabled ? (liveHistory ?? []) : historyFromTasks(tasks)
  const loadingHistory = apiEnabled && liveHistory === null

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader eyebrow="Pengantaran" title="Order" />

        <div className="courier-order-tabs" role="tablist" aria-label="Pilih daftar order">
          {(['active', 'history'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`courier-order-tab${tab === id ? ' courier-order-tab--on' : ''}`}
              onClick={() => setTab(id)}
            >
              {id === 'active' ? 'Aktif' : 'Riwayat'}
              <span className="courier-order-tab-count">
                {id === 'active' ? active.length : history.length}
              </span>
            </button>
          ))}
        </div>

        {tab === 'active' ? (
          active.length === 0 ? (
            <p className="courier-empty">Belum ada tugas berjalan.</p>
          ) : (
            active.map((task) => <ActiveTaskCard key={task.id} task={task} />)
          )
        ) : loadingHistory ? (
          <p className="courier-empty">Memuat riwayat…</p>
        ) : history.length === 0 ? (
          <p className="courier-empty">Belum ada tugas selesai.</p>
        ) : (
          <div className="courier-order-list">
            {history.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
      <CourierBottomNav />
    </div>
  )
}
