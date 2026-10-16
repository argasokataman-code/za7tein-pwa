import { ArrowDownUp, Check, ChevronRight, Clock, Coins, PackageCheck, Play, Route } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourierBottomNav } from '../components/layout/CourierBottomNav'
import { CourierPageHeader } from '../components/courier/CourierPageHeader'
import { useLeafletMap } from '../hooks/useLeafletMap'
import { useMoney } from '../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { BATCH_STATUS_LABEL, batchCapacityLeft, countdownLabel } from '../data/batch'
import { COURIER_CHECKPOINT_BADGE, isDoneTask } from '../data/courier'
import {
  WALK_ROUTE_BETA_NOTE,
  batchDisplayStatus,
  batchProgress,
  canStartBatch,
  courierBatchTasks,
  nextBatchTask,
  routeDistanceMeters,
} from '../data/courierBatch'
import { formatDistance } from '../data/merchant'
import { setBatchAutoSort, startBatchDelivery } from '../store/slices/courierSlice'

/**
 * Batch kurir inhouse (M5, PRD §8/§9.6). Kurir melihat batch yang ditugaskan
 * merchant, mengatur urutan antar (auto-sort / manual), menekan "Mulai antar",
 * lalu menyelesaikan order **satu per satu** di halaman tugas (checkpoint + OTP).
 *
 * Satu fokus per layar: kepala batch. Aksen merek hanya di tombol mulai;
 * sisanya permukaan kartu + badge status, satu bahasa dengan tiket tugas.
 */
export default function CourierBatch() {
  const { money } = useMoney()
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((s) => s.courier.tasks)
  const batch = useAppSelector((s) => s.courier.batch)

  // Hook peta harus dipanggil tanpa syarat (aturan hook React), jadi titik
  // hentinya dihitung sebelum cabang "belum ada batch". `courierBatchTasks`
  // adalah **satu sumber urutan**: daftar, peta, dan "berikutnya" membacanya.
  const stops = batch ? courierBatchTasks(batch, tasks) : []
  const mapStops = stops
    .filter((task) => task.latitude != null && task.longitude != null)
    .map((task) => ({
      lat: task.latitude!,
      lng: task.longitude!,
      label: task.code,
      done: isDoneTask(task),
    }))
  useLeafletMap('courier-batch-map', 'delivery', { stops: mapStops })

  if (!batch) {
    return (
      <div className="app-shell">
        <main className="courier-page">
          <CourierPageHeader title="Batch antar" back="/" />
          <p className="courier-empty">Belum ada batch yang ditugaskan merchant.</p>
        </main>
        <CourierBottomNav />
      </div>
    )
  }

  const progress = batchProgress(batch, tasks)
  const next = nextBatchTask(batch, tasks)
  const status = batchDisplayStatus(batch, tasks)
  const routeMeters = routeDistanceMeters(stops)
  const notStarted = status !== 'delivering' && status !== 'done'
  const startable = notStarted && canStartBatch(batch)
  const delivering = status === 'delivering'

  return (
    <div className="app-shell">
      <main className="courier-page">
        <CourierPageHeader title="Batch antar" back="/" eyebrow={`Batch ${batch.id}`} />

        {/* Kepala batch: status, kemajuan, dan dua angka rute. Ini fokus layar. */}
        <section className="courier-card courier-batch-head">
          <div className="courier-batch-top">
            <span className={`courier-badge courier-badge--${status === 'done' ? 'selesai' : 'berangkat'}`}>
              {BATCH_STATUS_LABEL[status]}
            </span>
            <span className="courier-batch-count">
              {progress.done}/{progress.total} order
            </span>
          </div>

          <div className="courier-batch-metrics">
            <span className="courier-batch-metric">
              <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
              {countdownLabel(batch.countdownSeconds)}
            </span>
            <span className="courier-batch-metric">
              <Route size={16} strokeWidth={1.75} aria-hidden="true" />
              {routeMeters === null ? 'rute tak terukur' : formatDistance(routeMeters)}
            </span>
            <span className="courier-batch-metric">
              <PackageCheck size={16} strokeWidth={1.75} aria-hidden="true" />
              sisa {batchCapacityLeft(batch)} slot
            </span>
          </div>

          <p className="courier-card-sub">
            Estimasi masak {batch.estimateMinutes} menit. Order diambil di toko, lalu diantar
            berurutan sampai order terakhir.
          </p>
        </section>

        {/* Auto-sort: ON mengurutkan rute otomatis, OFF kurir menyusun sendiri. */}
        <button
          type="button"
          className={`courier-toggle ${batch.autoSort ? 'is-on' : ''}`}
          aria-pressed={batch.autoSort}
          onClick={() => dispatch(setBatchAutoSort({ autoSort: !batch.autoSort }))}
        >
          <ArrowDownUp size={18} strokeWidth={1.75} aria-hidden="true" />
          Auto-sort rute: {batch.autoSort ? 'ON' : 'OFF'}
        </button>
        <p className="courier-sla-note">{WALK_ROUTE_BETA_NOTE}</p>

        {/* Peta rute (M5): garis dari toko + pin bernomor sesuai urutan antar.
            Muncul hanya saat semua order punya koordinat; kalau tidak, daftar
            bernomor di bawah tetap jadi acuan. */}
        {mapStops.length > 0 && (
          <div className="courier-batch-mapwrap">
            <div id="courier-batch-map" className="courier-batch-map" />
          </div>
        )}

        {/* Aksi utama: mulai antar. Nonaktif sampai hitung mundur habis atau
            merchant menutup batch lebih awal (BR-B09). */}
        {startable && (
          <button
            type="button"
            className="btn btn-primary courier-primary"
            onClick={() => dispatch(startBatchDelivery())}
          >
            <Play size={18} strokeWidth={1.75} aria-hidden="true" />
            Mulai antar
          </button>
        )}
        {notStarted && !startable && (
          <p className="courier-sla-note">
            Menunggu hitung mundur {countdownLabel(batch.countdownSeconds)} atau izin merchant
            untuk mulai lebih awal.
          </p>
        )}

        {/* Urutan antar: tiap baris menuju halaman tugas (checkpoint + OTP). */}
        <section className="courier-section">
          <h2 className="courier-section-title">
            Urutan antar {batch.autoSort ? '(otomatis)' : '(manual)'}
          </h2>
          {stops.length === 0 ? (
            <p className="courier-empty">Batch ini belum berisi order.</p>
          ) : (
            <ol className="courier-batch-route">
              {stops.map((task, index) => (
                <li key={task.id}>
                  <Link
                    className={`courier-batch-stop${!isDoneTask(task) && next?.id === task.id ? ' is-next' : ''}`}
                    to={`/task/${task.id}`}
                  >
                    <span className="courier-batch-step" aria-hidden="true">
                      {isDoneTask(task) ? (
                        <Check size={16} strokeWidth={2.5} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="courier-batch-stop-copy">
                      <span className="courier-batch-stop-top">
                        <span className="courier-task-code">{task.code}</span>
                        <span className={`courier-badge courier-badge--${task.checkpoint}`}>
                          {COURIER_CHECKPOINT_BADGE[task.checkpoint]}
                        </span>
                      </span>
                      <span className="courier-task-sub">
                        {task.customerName} · {task.address}
                      </span>
                      <span className="courier-batch-stop-foot">
                        <span>{formatDistance(task.distanceMeters)} dari toko</span>
                        {task.deliveryFeeIdr ? (
                          <span className="courier-batch-fee">
                            <Coins size={14} strokeWidth={1.75} aria-hidden="true" />
                            Fee ke DANA {money(task.deliveryFeeIdr)}
                          </span>
                        ) : (
                          <span className="courier-batch-cod">COD, dibayar merchant</span>
                        )}
                      </span>
                    </span>
                    <ChevronRight
                      size={18}
                      strokeWidth={1.75}
                      className="courier-ticket-chevron"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {delivering && (
          <p className="courier-sla-note">
            Antar order paling atas lebih dulu. Container kurir: layar tugas memandu tiap
            checkpoint sampai OTP customer diverifikasi.
          </p>
        )}
      </main>
      <CourierBottomNav />
    </div>
  )
}
