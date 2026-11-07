import { useEffect, useState } from 'react'

import { fetchOrderCourierLocation, type OrderCourierLocation } from '../api/liveLocation'

/**
 * Posisi terakhir kurir untuk satu order, dipolling selama layar terbuka.
 *
 * `stale` datang dari server (ambang 120 detik), jadi layar tidak perlu
 * menghitung sendiri. `null` = order tanpa kurir, API mati, atau belum ada
 * posisi; pemanggil jatuh ke jalur mock supaya peta tidak kosong.
 */
export function useOrderCourierLocation(
  orderId: number | null,
  intervalMs = 10_000,
): OrderCourierLocation | null {
  const [location, setLocation] = useState<OrderCourierLocation | null>(null)

  useEffect(() => {
    if (orderId === null) {
      setLocation(null)
      return
    }

    let alive = true
    const load = () => {
      void fetchOrderCourierLocation(orderId).then((row) => {
        if (alive) setLocation(row)
      })
    }

    load()
    const id = setInterval(load, intervalMs)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [orderId, intervalMs])

  return location
}
