// Realtime websocket (bukan polling): langganan perubahan tabel `orders` lewat
// Supabase Realtime. Tiap event → segarkan kotak masuk audience + data peran
// (antrean merchant / tugas kurir) tanpa reload. Polling `useApiNotifications`
// tetap jalan sebagai jaring pengaman bila socket putus.
import { useEffect, useRef } from 'react'

import { fetchCourierOrders, fetchCustomerOrder, fetchMerchantOrders } from '../api/orders'
import { subscribeOrders } from '../api/realtime'
import { fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { markOrderCancelled, setOrderStage } from '../store/slices/cartSlice'
import { setTasks } from '../store/slices/courierSlice'
import { markOrdersFailed, markOrdersHydrated, mergeOrders } from '../store/slices/merchantSlice'
import { selectUnreadCount, setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch, useAppSelector } from './useAppStore'
import { useNotificationSound } from './useNotificationSound'

const DEBOUNCE_MS = 250

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
            .then((orders) => {
              if (!alive) return
              // Ganti penuh (bukan gabung seed): antrean = order BE, sumber
              // tunggal kebenaran, supaya realtime & persistensi konsisten.
              dispatch(mergeOrders(orders))
              dispatch(markOrdersHydrated())
            })
            .catch(() => {
              if (alive) dispatch(markOrdersFailed())
            })
        }
        if (audience === 'courier') {
          fetchCourierOrders()
            .then((tasks) => {
              if (alive && tasks.length) dispatch(setTasks(tasks))
            })
            .catch(() => {})
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
      }, DEBOUNCE_MS)
    }

    refresh()
    const unsubscribe = subscribeOrders(refresh)
    // Socket mati selama offline; saat online lagi tarik kondisi terbaru dan
    // pastikan langganan hidup kembali.
    window.addEventListener('online', refresh)
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
      window.removeEventListener('online', refresh)
      unsubscribe()
    }
  }, [audience, activeOrderId, dispatch, playChime])
}
