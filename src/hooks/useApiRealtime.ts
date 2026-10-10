// Realtime websocket (bukan polling): langganan perubahan tabel `orders` lewat
// Supabase Realtime. Tiap event → segarkan kotak masuk audience + data peran
// (antrean merchant / tugas kurir) tanpa reload. Polling `useApiNotifications`
// tetap jalan sebagai jaring pengaman bila socket putus.
import { useEffect } from 'react'

import { fetchCourierOrders, fetchMerchantOrders } from '../api/orders'
import { subscribeOrders } from '../api/realtime'
import { fetchNotifications } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { setTasks } from '../store/slices/courierSlice'
import { mergeOrders } from '../store/slices/merchantSlice'
import { setNotifications } from '../store/slices/notificationsSlice'
import type { NotifAudience } from '../types'
import { useAppDispatch } from './useAppStore'

const DEBOUNCE_MS = 250

export function useApiRealtime(audience: NotifAudience): void {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const refresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fetchNotifications(audience)
          .then((items) => {
            if (alive && items.length) dispatch(setNotifications(items))
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
      }, DEBOUNCE_MS)
    }

    refresh()
    const unsubscribe = subscribeOrders(refresh)
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [audience, dispatch])
}
