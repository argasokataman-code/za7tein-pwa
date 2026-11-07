import { useEffect, useState } from 'react'

import { haversineMeters } from '../data/merchant'
import {
  almostArrived,
  etaMinutesRemaining,
  positionAlong,
  tracksLocation,
  travelProgress,
  walkMinutes,
} from '../data/tracking'
import { DESTINATION, RESTAURANT, ROUTE } from '../lib/leaflet-draw'
import { useOrderCourierLocation } from './useOrderCourierLocation'

export interface CourierTracking {
  /** Tahap ini memang menyiarkan lokasi kurir? (§9.7: hanya saat delivery aktif) */
  showsLocation: boolean
  /** Sisa menit; `null` saat lokasi tidak disiarkan. */
  etaMinutes: number | null
  /** Posisi kurir: data BE bila ada, jatuh ke rute mock bila belum. */
  courierPosition?: [number, number]
  /** Sudah masuk ambang "kurir hampir sampai". */
  almost: boolean
  /** `true` saat posisi berasal dari BE (`courier_location`), bukan rute mock. */
  live?: boolean
  /** Posisi BE lebih tua dari ambang server (120 detik). */
  stale?: boolean
}

/**
 * Pelacakan kurir memakai posisi BE bila ada (`courier_location`, order live),
 * dan jatuh ke rute mock berbasis waktu tempuh hanya saat BE belum punya
 * posisi. Satu tick mock = satu menit, jadi pin tetap bergerak selama
 * pengantaran aktif walau perangkat kurir belum mengirim apa pun.
 * Rule mock ada di `src/data/tracking.ts` supaya bisa diuji tanpa browser.
 */
export function useCourierTracking(stage: string, orderId?: number | null): CourierTracking {
  const showsLocation = tracksLocation(stage)
  const live = useOrderCourierLocation(showsLocation ? (orderId ?? null) : null)
  const totalMinutes = walkMinutes(
    haversineMeters(
      { lat: RESTAURANT[0], lng: RESTAURANT[1] },
      { lat: DESTINATION[0], lng: DESTINATION[1] },
    ),
  )
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  useEffect(() => {
    if (!showsLocation) return
    const id = setInterval(() => setElapsedMinutes((m) => m + 1), 4000)
    return () => clearInterval(id)
  }, [showsLocation])

  const progress = travelProgress(elapsedMinutes, totalMinutes)
  const etaMinutes = showsLocation ? etaMinutesRemaining(totalMinutes, progress) : null
  const almost = almostArrived(etaMinutes)

  if (!showsLocation) {
    return { showsLocation, etaMinutes: null, almost: false }
  }

  const livePosition: [number, number] | undefined =
    live && Number.isFinite(live.latitude) && Number.isFinite(live.longitude)
      ? [live.latitude, live.longitude]
      : undefined

  return {
    showsLocation,
    etaMinutes,
    courierPosition: livePosition ?? positionAlong(ROUTE, progress) ?? undefined,
    almost,
    live: Boolean(livePosition),
    stale: livePosition ? Boolean(live?.stale) : undefined,
  }
}
