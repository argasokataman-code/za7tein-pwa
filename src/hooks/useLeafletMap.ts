import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { mockMerchant } from '../data/merchant'
import {
  RESTAURANT, DESTINATION, ROUTE, COURIER,
  PIN_MERCHANT, PIN_DESTINATION, PIN_COURIER, pin,
} from './leafletHelpers'
import type { MapMode, PickerOptions } from './leafletHelpers'

/**
 * Mengisi `<div class="order-map-container" id=...>` dengan peta OpenStreetMap
 * dan menyediakan `recenter()`.
 *
 * `mode` menentukan bobotnya: `preview` untuk status awal, di mana peta hanya
 * pelengkap dan tidak boleh menguasai layar; `delivery` saat kurir berjalan,
 * di mana peta memang menjadi bagian utama dan rutenya digambar.
 *
 * `single` hanya menampilkan pin toko — dipakai pratinjau lokasi di Setelan.
 */
export function useLeafletMap(
  mapId: string,
  mode: MapMode = 'preview',
  options: { single?: boolean; picker?: PickerOptions } = {},
) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const onMoveRef = useRef(options.picker?.onMove)
  const pickerInitialRef = useRef<[number, number]>(options.picker?.initial ?? RESTAURANT)

  useEffect(() => {
    onMoveRef.current = options.picker?.onMove
    pickerInitialRef.current = options.picker?.initial ?? RESTAURANT
  })

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
          .bindPopup('Lokasi toko — geser untuk menyesuaikan')
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          onMoveRef.current?.(p.lat, p.lng)
        })
        markerRef.current = marker
        map.setView(initial, 16)
      } else {
        L.marker(RESTAURANT, { icon: pin(L, PIN_MERCHANT) }).addTo(map).bindPopup(mockMerchant.name)

        if (options.single) {
          map.setView(RESTAURANT, 16)
        } else {
          L.marker(DESTINATION, { icon: pin(L, PIN_DESTINATION) }).addTo(map).bindPopup('Alamat pengantaran')

          if (mode === 'delivery') {
            L.marker(COURIER, { icon: pin(L, PIN_COURIER, true) }).addTo(map).bindPopup('Budi Santoso')
          }

          L.polyline(ROUTE, {
            color: PIN_MERCHANT,
            weight: mode === 'delivery' ? 4 : 3,
            opacity: mode === 'delivery' ? 0.95 : 0.6,
            lineCap: 'round',
            lineJoin: 'round',
            className: mode === 'delivery' ? 'sa7tein-route sa7tein-route--draw' : 'sa7tein-route',
          }).addTo(map)

          if (mode === 'delivery') {
            map.fitBounds(L.latLngBounds(ROUTE), { padding: [48, 48] })
          } else {
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
  }, [mapId, mode, options.single])

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
