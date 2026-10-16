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

export interface CourierTracking {
  /** Tahap ini memang menyiarkan lokasi kurir? (§9.7: hanya saat delivery aktif) */
  showsLocation: boolean
  /** Sisa menit; `null` saat lokasi tidak disiarkan. */
  etaMinutes: number | null
  /** Posisi kurir sepanjang rute mock; `undefined` saat tidak disiarkan. */
  courierPosition?: [number, number]
  /** Sudah masuk ambang "kurir hampir sampai". */
  almost: boolean
}

/**
 * Pelacakan kurir di demo diturunkan dari **waktu tempuh**, bukan dikirim BE:
 * event `courier_location` (§19) belum dibangun. Satu tick = satu menit mock, jadi
 * pin benar-benar bergerak selama pengantaran aktif dan berhenti di luar itu.
 * Rule-nya ada di `src/data/tracking.ts` supaya bisa diuji tanpa browser.
 */
export function useCourierTracking(stage: string): CourierTracking {
  const totalMinutes = walkMinutes(
    haversineMeters(
      { lat: RESTAURANT[0], lng: RESTAURANT[1] },
      { lat: DESTINATION[0], lng: DESTINATION[1] },
    ),
  )
  const showsLocation = tracksLocation(stage)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  useEffect(() => {
    if (!showsLocation) return
    const id = setInterval(() => setElapsedMinutes((m) => m + 1), 4000)
    return () => clearInterval(id)
  }, [showsLocation])

  if (!showsLocation) {
    return { showsLocation, etaMinutes: null, almost: false }
  }

  const progress = travelProgress(elapsedMinutes, totalMinutes)
  const etaMinutes = etaMinutesRemaining(totalMinutes, progress)
  return {
    showsLocation,
    etaMinutes,
    courierPosition: positionAlong(ROUTE, progress) ?? undefined,
    almost: almostArrived(etaMinutes),
  }
}
