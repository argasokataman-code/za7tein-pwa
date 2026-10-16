import { COURIER_BATCH_DEMO_ID, courierSelf, courierTasks, isDoneTask } from './courier'
import { haversineMeters } from './merchant'
import { MERCHANT_KITCHEN } from './zones'
import type { Batch, CourierTask, GeoPoint } from '../types'

/**
 * Batch kurir inhouse (M5, PRD §8/§9.6, BR-B07/B12). BE belum punya tabel
 * `batches` (gap M4), jadi batch demo ini mock: tugas kurir yang ber-`batchId`
 * dikelompokkan di sini, dan kurir dianggap sudah di-assign (`courierId`).
 * Di BE nanti batch lahir dari order Regular yang di-accept merchant, kurir
 * dipilih merchant lewat `assignBatchCourier` — halaman kurir tinggal membaca
 * batch yang `courierId === courierSelf.id`.
 */
const demoTasks = courierTasks.filter((task) => task.batchId === COURIER_BATCH_DEMO_ID)

export const mockCourierBatch: Batch = {
  id: COURIER_BATCH_DEMO_ID,
  merchantId: courierSelf.merchantId,
  courierId: courierSelf.id,
  orderIds: demoTasks.map((task) => task.id),
  // Merchant menutup lebih awal: kurir boleh mulai tanpa menunggu hitung mundur
  // (BR-B09), dan sisa 12 menit tetap tampil sebagai info.
  status: 'closed',
  estimateMinutes: 25,
  countdownSeconds: 12 * 60,
  autoSort: true,
  routeOrder: [],
  createdAt: '2026-10-15T08:00:00.000Z',
}

/** Peringatan peta batch (PRD §9.6): rute WALK masih beta, bukan rute final. */
export const WALK_ROUTE_BETA_NOTE =
  'Rute berjalan kaki (WALK) masih beta — urutan bisa berubah saat rute jalan sungguhan (Google Routes) tersambung.'

/**
 * Tugas milik batch dalam **urutan efektif** — satu sumber untuk daftar, peta,
 * "berikutnya", dan panjang rute. Auto-sort ON → urutan diturunkan (nearest
 * neighbour dari dapur); OFF → urutan manual `routeOrder`, sisanya `orderIds`.
 * `routeOrder` **hanya** menyimpan urutan manual, jadi ON/OFF tak bisa berbeda
 * pendapat soal urutan (BR-B12). Order yang tak ada di `tasks` dilewati.
 */
export function courierBatchTasks(batch: Batch, tasks: CourierTask[]): CourierTask[] {
  const inBatch = tasks.filter((task) => batch.orderIds.includes(task.id))
  if (batch.autoSort) return autoSortTasks(inBatch)
  const order = batch.routeOrder.length ? batch.routeOrder : batch.orderIds
  const rank = new Map(order.map((id, index) => [id, index]))
  return [...inBatch].sort((a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9))
}

/** Kemajuan batch: order selesai / seluruh order (dipakai kepala batch). */
export function batchProgress(batch: Batch, tasks: CourierTask[]): { done: number; total: number } {
  const list = courierBatchTasks(batch, tasks)
  return { done: list.filter(isDoneTask).length, total: list.length }
}

/** Order berikutnya yang harus diantar (belum selesai & belum batal), atau null. */
export function nextBatchTask(batch: Batch, tasks: CourierTask[]): CourierTask | null {
  return (
    courierBatchTasks(batch, tasks).find(
      (task) => !isDoneTask(task) && task.checkpoint !== 'batal',
    ) ?? null
  )
}

/**
 * Status yang ditampilkan: `done` turunan saat semua order batch selesai (BR-B11),
 * selain itu status tersimpan. Batch tak bisa "done" sebelum kurir mulai, dan
 * tak perlu reducer yang menulisnya dari dua sisi (kurir + merchant).
 */
export function batchDisplayStatus(batch: Batch, tasks: CourierTask[]): Batch['status'] {
  const { done, total } = batchProgress(batch, tasks)
  if (total > 0 && done === total) return 'done'
  return batch.status
}

/**
 * Kurir boleh mulai antar: hitung mundur habis, **atau** merchant menutup batch
 * lebih awal setelah order packing (BR-B09, "mulai lebih awal seizin merchant").
 * Perizinan packing ditegakkan di sisi merchant; di sini batch yang sudah
 * ditutup dianggap izin.
 */
export function canStartBatch(batch: Batch): boolean {
  return batch.countdownSeconds <= 0 || batch.status === 'closed'
}

/**
 * Auto-sort rute (BR-B12, §9.6): greedy **nearest-neighbour** mulai dari dapur
 * merchant. PRD memakai Google Route Optimization (matriks 25×24, WALK tak
 * di-cache, biaya per panggilan = R4) — FE ini mock tanpa jaringan, jadi jarak
 * garis lurus (haversine).
 *
 * ponytail: NN saja; tambah 2-opt hanya kalau kualitas rute jadi keluhan nyata.
 * Kalau koordinat tak lengkap (jalur BE `courier_orders()` belum mengirimnya),
 * jatuh ke urutan `distanceMeters` supaya tetap ada urutan masuk akal.
 */
export function autoSortTasks(
  tasks: CourierTask[],
  origin: GeoPoint = MERCHANT_KITCHEN,
): CourierTask[] {
  const located = tasks.filter((task) => task.latitude != null && task.longitude != null)
  if (located.length !== tasks.length) {
    return [...tasks].sort((a, b) => a.distanceMeters - b.distanceMeters)
  }
  const rest = [...tasks]
  const ordered: CourierTask[] = []
  let cursor = origin
  while (rest.length) {
    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    rest.forEach((task, index) => {
      const distance = haversineMeters(cursor, { lat: task.latitude!, lng: task.longitude! })
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    })
    const [next] = rest.splice(bestIndex, 1)
    ordered.push(next)
    cursor = { lat: next.latitude!, lng: next.longitude! }
  }
  return ordered
}

/** Id order hasil auto-sort, siap disimpan ke `batch.routeOrder`. */
export function autoSortRoute(
  tasks: CourierTask[],
  origin: GeoPoint = MERCHANT_KITCHEN,
): string[] {
  return autoSortTasks(tasks, origin).map((task) => task.id)
}

/**
 * Panjang rute berurutan (meter, garis lurus) dari dapur sampai order terakhir.
 * `null` kalau ada order tanpa koordinat (tak bisa digambar/diukur).
 */
export function routeDistanceMeters(
  orderedTasks: CourierTask[],
  origin: GeoPoint = MERCHANT_KITCHEN,
): number | null {
  let total = 0
  let cursor = origin
  for (const task of orderedTasks) {
    if (task.latitude == null || task.longitude == null) return null
    total += haversineMeters(cursor, { lat: task.latitude, lng: task.longitude })
    cursor = { lat: task.latitude, lng: task.longitude }
  }
  return total
}
