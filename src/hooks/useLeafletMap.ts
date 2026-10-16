import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { mockMerchant } from '../data/merchant'
import {
  RESTAURANT, DESTINATION, ROUTE, COURIER,
  PIN_MERCHANT, PIN_DESTINATION, PIN_COURIER, pin, drawBatchRoute,
} from './leafletHelpers'
import type { MapMode, MapStop, PickerOptions } from './leafletHelpers'

/**
 * Mengisi `<div class="order-map-container" id=...>` dengan peta OpenStreetMap
 * dan menyediakan `recenter()`.
 *
 * `mode` menentukan bobotnya: `preview` untuk status awal, di mana peta hanya
 * pelengkap dan tidak boleh menguasai layar; `delivery` saat kurir berjalan,
 * di mana peta memang menjadi bagian utama dan rutenya digambar.
 *
 * `single` hanya menampilkan pin toko — dipakai pratinjau lokasi di Setelan.
 * `stops` mengganti rute toko→alamat tunggal dengan rute bernomor berhenti
 * (batch kurir, M5): titik toko tetap jadi asal, sisanya pin bernomor urut.
 */
export function useLeafletMap(
  mapId: string,
  mode: MapMode = 'preview',
  options: { single?: boolean; picker?: PickerOptions; stops?: MapStop[] } = {},
) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const onMoveRef = useRef(options.picker?.onMove)
  const pickerInitialRef = useRef<[number, number]>(options.picker?.initial ?? RESTAURANT)
  const pickerPopupRef = useRef(options.picker?.popup ?? 'Lokasi toko — geser untuk menyesuaikan')
  const stopsRef = useRef(options.stops)

  useEffect(() => {
    onMoveRef.current = options.picker?.onMove
    pickerInitialRef.current = options.picker?.initial ?? RESTAURANT
    pickerPopupRef.current = options.picker?.popup ?? 'Lokasi toko — geser untuk menyesuaikan'
    stopsRef.current = options.stops
  })

  const stopsKey = options.stops?.map((stop) => `${stop.lat},${stop.lng}`).join('|')

  useEffect(() => {
    let cancelled = false

    const element = document.getElementById(mapId)
    if (!element || mapRef.current) return

    // React 18/19 StrictMode remounts can leave Leaflet's stamp behind.
    const stamped = element as HTMLElement & { _leaflet_id?: number }
    if (stamped._leaflet_id) delete stamped._leaflet_id

    import('leaflet').then((module) => {
      if (cancelled) return
      const L = module.default

      const isPicker = mode === 'picker'
      const initial = pickerInitialRef.current

      const map = L.map(element, {
        zoomControl: false,
        attributionControl: false,
        // Peta preview tidak perlu menangkap gestur; halaman tetap bisa digulir.
        dragging: mode === 'delivery' || isPicker,
        scrollWheelZoom: isPicker,
        touchZoom: mode === 'delivery' || isPicker,
        doubleClickZoom: mode === 'delivery' || isPicker,
        keyboard: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      if (isPicker) {
        const marker = L.marker(initial, {
          icon: pin(L, PIN_MERCHANT),
          draggable: true,
        })
          .addTo(map)
          .bindPopup(pickerPopupRef.current)
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          onMoveRef.current?.(p.lat, p.lng)
        })
        markerRef.current = marker
        map.setView(initial, 16)
      } else {
        L.marker(RESTAURANT, { icon: pin(L, PIN_MERCHANT) }).addTo(map).bindPopup(mockMerchant.name)

        if (stopsRef.current?.length) {
          drawBatchRoute(L, map, stopsRef.current)
        } else if (options.single) {
          map.setView(RESTAURANT, 16)
        } else {
          L.marker(DESTINATION, { icon: pin(L, PIN_DESTINATION) }).addTo(map).bindPopup('Alamat pengantaran')

          if (mode === 'delivery') {
            // PRD §9.6: peta customer hanya posisi kurir + ETA — **tanpa** garis
            // rute jalan kaki. Garis rute hanya untuk peta kurir (mode `stops`).
            L.marker(COURIER, { icon: pin(L, PIN_COURIER, true) }).addTo(map).bindPopup('Budi Santoso')
            map.fitBounds([RESTAURANT, DESTINATION], { padding: [48, 48] })
          } else {
            L.polyline(ROUTE, {
              color: PIN_MERCHANT,
              weight: 3,
              opacity: 0.6,
              lineCap: 'round',
              lineJoin: 'round',
              className: 'sa7tein-route',
            }).addTo(map)
            map.setView([(RESTAURANT[0] + DESTINATION[0]) / 2, (RESTAURANT[1] + DESTINATION[1]) / 2], 15)
          }
        }
      }

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [mapId, mode, options.single, stopsKey])

  return {
    recenter: () =>
      mapRef.current?.fitBounds([RESTAURANT, DESTINATION], { padding: [48, 48] }),
    /** Pindahkan pin pemilih ke koordinat baru (dipakai geolokasi). */
    setPosition: (lat: number, lng: number) => {
      markerRef.current?.setLatLng([lat, lng])
      mapRef.current?.panTo([lat, lng])
      onMoveRef.current?.(lat, lng)
    },
  }
}
