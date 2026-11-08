// Penyegaran data kurir dari BE, dipakai `useApiRealtime` tiap poll/tab terlihat.
// Dipisah dari hook supaya berkas hook tetap di bawah batas 150 baris dan
// urutan permintaan terbaca sebagai satu blok.
import type { AppDispatch } from '../store'
import { setBatch, setOnline, setSelf, setTasks } from '../store/slices/courierSlice'
import { fetchCourierBatch } from './batches'
import { fetchCourierOnline, fetchCourierSelf } from './courierStatus'
import { fetchCourierOrders } from './orders'

/**
 * Muat ulang tugas, batch, status siap, dan identitas kurir.
 *
 * `alive()` diperiksa sebelum menulis store: efek bisa dibongkar saat permintaan
 * masih di jalan (pindah halaman / ganti peran).
 */
export function refreshCourierData(alive: () => boolean, dispatch: AppDispatch): void {
  fetchCourierOrders()
    .then((tasks) => {
      // Muatan kosong tetap dikirim: kalau tidak, daftar lama (dulu seed demo)
      // bertahan selamanya dan kurir melihat tugas yang tak ada.
      if (alive()) dispatch(setTasks(tasks))
    })
    .catch(() => {})
  // Batch yang ditugaskan merchant (tabel `batches`).
  fetchCourierBatch()
    .then((batch) => {
      if (alive()) dispatch(setBatch(batch))
    })
    .catch(() => {})
  // Sakelar mengikuti baris BE, bukan default lokal, supaya kurir dan merchant
  // membaca status yang sama.
  fetchCourierOnline()
    .then((online) => {
      if (alive() && online !== null) dispatch(setOnline(online))
    })
    .catch(() => {})
  // Identitas dari `couriers` milik sesi ini: nama + nomor harus milik akun
  // yang masuk, bukan kurir demo di data seed.
  fetchCourierSelf()
    .then((self) => {
      // `null` = gagal baca; jangan hapus identitas yang sudah tampil.
      if (alive() && self) dispatch(setSelf(self))
    })
    .catch(() => {})
}
