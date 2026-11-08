// Realtime websocket (bukan polling): langganan perubahan tabel `orders` lewat
// Supabase Realtime. Tiap event → segarkan kotak masuk audience + data peran
// (antrean merchant / tugas kurir) tanpa reload. Polling `useApiNotifications`
// tetap jalan sebagai jaring pengaman bila socket putus.
import { useEffect, useRef } from 'react'
import { fetchMerchantBatches } from '../api/batches'
import { refreshCourierData } from '../api/courierSync'
import { fetchCustomerActiveOrders, fetchCustomerOrder, fetchMerchantOrders } from '../api/orders'
import { notifyResync, subscribeOrders } from '../api/realtime'
import { fetchCouriers, fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { markOrderCancelled, setOrderStage } from '../store/slices/cartSlice'
import { hydrateActiveOrders } from '../store/slices/customerOrdersSlice'
import { markOrdersFailed, markOrdersHydrated, mergeOrders, setCouriers } from '../store/slices/merchantSlice'
import { mergeBatches } from '../store/slices/batchSlice'
import { selectUnreadCount, setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch, useAppSelector } from './useAppStore'
import { useNotificationSound } from './useNotificationSound'

const DEBOUNCE_MS = 250
/**
 * Interval penyegaran saat socket tidak hidup. Worker backend tidak punya
 * endpoint Phoenix (`src/api/realtime.ts`), jadi `subscribeOrders` tak pernah
 * memanggil balik: tanpa interval, perubahan dari perangkat lain (order masuk
 * batch, kurir ditugaskan, batch ditutup) baru terlihat setelah muat ulang.
 */
const POLL_MS = 20_000
const COURIER_POLL_MS = 15_000

export function useApiRealtime(audience: NotifAudience): void {
  const dispatch = useAppDispatch()
  const activeOrderId = useAppSelector((s) => s.cart.activeOrder?.id ?? null)
  const playChime = useNotificationSound()
  // Jumlah belum-dibaca sebelumnya; null = muatan pertama (jadi baseline, tak
  // bunyi untuk notifikasi lama). Bunyi hanya saat angkanya NAIK.
  const prevUnreadRef = useRef<number | null>(null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const refresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        // Beri tahu indikator: muatan sedang disusulkan (NFR-05).
        notifyResync()
        fetchNotifications(audience)
          .then((items) => {
            if (!alive) return
            dispatch(setNotifications(items))
            // Bunyikan nada hanya saat jumlah belum-dibaca bertambah; baseline
            // muatan pertama tak dibunyikan supaya notifikasi lama tak berisik.
            const unread = selectUnreadCount(items)
            if (prevUnreadRef.current !== null && unread > prevUnreadRef.current) playChime()
            prevUnreadRef.current = unread
          })
          .catch(() => {})
        if (audience === 'merchant') {
          fetchMerchantOrders()
            .then(async (orders) => {
              if (!alive) return
              // Ganti penuh (bukan gabung seed): antrean = order BE, sumber
              // tunggal kebenaran, supaya realtime & persistensi konsisten.
              dispatch(mergeOrders(orders))
              dispatch(markOrdersHydrated())
              // Anggota batch (`batches.route` + `orders.batch_id`) ikut
              // disegarkan, kalau tidak panel batch tertinggal sampai reload.
              const batches = await fetchMerchantBatches(undefined, orders)
              if (alive) dispatch(mergeBatches(batches))
              // Status siap/jeda kurir (`couriers.availability`) dibaca
              // merchant dari BE. Tanpa penyegaran ini, kurir yang baru
              // menekan "Siap sekarang" tetap tertulis offline sampai reload.
              const couriers = await fetchCouriers()
              if (alive && couriers.length) dispatch(setCouriers(couriers))
            })
            .catch(() => {
              if (alive) dispatch(markOrdersFailed())
            })
        }
        if (audience === 'courier') {
          refreshCourierData(() => alive, dispatch)
        }
        if (audience === 'customer' && activeOrderId) {
          fetchCustomerOrder(activeOrderId)
            .then((order) => {
              if (!alive || !order) return
              // Terminal batal: status BE `canceled` tidak punya tahap (`stage`
              // jatuh ke `baru`), jadi tandai batal alih-alih menyetel tahap.
              if (order.status === 'batal') dispatch(markOrderCancelled())
              else dispatch(setOrderStage(order.stage))
            })
            .catch(() => {})
        }
        if (audience === 'customer') {
          // Daftar semua order berjalan (boleh beberapa, lintas toko) untuk
          // ringkasan keranjang/pesanan. Satu event realtime `orders` sudah
          // memicu `refresh` ini, jadi tak perlu langganan kedua.
          fetchCustomerActiveOrders()
            .then((orders) => {
              if (alive) dispatch(hydrateActiveOrders(orders))
            })
            .catch(() => {})
        }
      }, DEBOUNCE_MS)
    }

    refresh()
    const unsubscribe = subscribeOrders(refresh)
    // Jaring pengaman: socket Worker tak tersedia, jadi tarik berkala + saat
    // tab kembali terlihat. Tanpa ini, perpindahan order ke batch dari
    // perangkat lain hanya muncul setelah muat ulang halaman.
    const poll = setInterval(refresh, audience === 'courier' ? COURIER_POLL_MS : POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    // Socket mati selama offline; saat online lagi tarik kondisi terbaru dan
    // pastikan langganan hidup kembali.
    window.addEventListener('online', refresh)
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
      clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', refresh)
      unsubscribe()
    }
  }, [audience, activeOrderId, dispatch, playChime])
}
