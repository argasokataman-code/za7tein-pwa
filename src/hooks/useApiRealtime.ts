// Realtime websocket (bukan polling): langganan perubahan tabel `orders` lewat
// Supabase Realtime. Tiap event → segarkan kotak masuk audience + data peran
// (antrean merchant / tugas kurir) tanpa reload. Polling `useApiNotifications`
// tetap jalan sebagai jaring pengaman bila socket putus.
import { useEffect } from 'react'

import { fetchCourierOrders, fetchCustomerOrder, fetchMerchantOrders } from '../api/orders'
import { subscribeOrders } from '../api/realtime'
import { fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { setOrderStage } from '../store/slices/cartSlice'
import { setTasks } from '../store/slices/courierSlice'
import { mergeOrders } from '../store/slices/merchantSlice'
import { setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch, useAppSelector } from './useAppStore'

const DEBOUNCE_MS = 250

export function useApiRealtime(audience: NotifAudience): void {
  const dispatch = useAppDispatch()
  const activeOrderId = useAppSelector((s) => s.cart.activeOrder?.id ?? null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const refresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fetchNotifications(audience)
          .then((items) => {
            if (alive) dispatch(setNotifications(items))
          })
          .catch(() => {})
        if (audience === 'merchant') {
          fetchMerchantOrders()
            .then((orders) => {
              if (alive && orders.length) dispatch(mergeOrders(orders))
            })
            .catch(() => {})
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
              if (alive && order) dispatch(setOrderStage(order.stage))
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
  }, [audience, activeOrderId, dispatch])
}
