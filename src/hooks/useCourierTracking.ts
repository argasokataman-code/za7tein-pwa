import { useEffect, useRef, useState } from 'react'

import { insertNotification } from '../api/notifications'
import { haversineMeters } from '../data/merchant'
import { NOTIF_EMIT } from '../data/notif'
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

  const progress = travelProgress(elapsedMinutes, totalMinutes)
  const etaMinutes = showsLocation ? etaMinutesRemaining(totalMinutes, progress) : null
  const almost = almostArrived(etaMinutes)

  // Notifikasi "kurir hampir sampai" (R-NOTIF AC4) memakai **ambang yang sama**
  // dengan label di layar — satu sumber, jadi keduanya tak bisa beda. Sekali saja
  // per pengantaran; best-effort, gagal jaringan tak menghalangi UI.
  const notifiedRef = useRef(false)
  useEffect(() => {
    if (!almost || notifiedRef.current) return
    notifiedRef.current = true
    void insertNotification(NOTIF_EMIT.courier_almost_arrived).catch(() => {})
  }, [almost])

  if (!showsLocation) {
    return { showsLocation, etaMinutes: null, almost: false }
  }

  return {
    showsLocation,
    etaMinutes,
    courierPosition: positionAlong(ROUTE, progress) ?? undefined,
    almost,
  }
}
