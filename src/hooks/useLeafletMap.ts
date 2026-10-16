import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { DESTINATION, RESTAURANT, drawOrderMap, drawPickerMarker } from '../lib/leaflet-draw'
import type { MapMode, MapStop, PickerOptions } from '../lib/leaflet-draw'

/**
 * Mengisi `<div class="order-map-container" id=...>` dengan peta OpenStreetMap
 * dan menyediakan `recenter()`.
 *
 * `mode` menentukan bobotnya: `preview` untuk status awal, di mana peta hanya
 * pelengkap dan tidak boleh menguasai layar; `delivery` saat kurir berjalan, di
 * mana peta memang menjadi bagian utama dan posisi kurir ditampilkan (tanpa garis
 * rute, §9.6). Opsi `courier` memindahkan pin kurir tanpa membangun ulang peta.
 *
 * `single` hanya menampilkan pin toko — dipakai pratinjau lokasi di Setelan.
 * `stops` mengganti rute toko→alamat tunggal dengan rute bernomor berhenti
 * (batch kurir, M5): titik toko tetap jadi asal, sisanya pin bernomor urut.
 */
export function useLeafletMap(
  mapId: string,
  mode: MapMode = 'preview',
  options: {
    single?: boolean
    picker?: PickerOptions
    stops?: MapStop[]
    /**
     * Posisi kurir yang boleh berubah (mode `delivery`). Marker-nya dibuat sekali
     * lalu digeser lewat `setLatLng`, jadi peta tidak dibangun ulang tiap detik.
     */
    courier?: [number, number]
  } = {},
) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const courierRef = useRef<LeafletMarker | null>(null)
  const onMoveRef = useRef(options.picker?.onMove)
  const pickerInitialRef = useRef<[number, number]>(options.picker?.initial ?? RESTAURANT)
  const pickerPopupRef = useRef(options.picker?.popup ?? 'Lokasi toko, geser untuk menyesuaikan')
  const stopsRef = useRef(options.stops)
  const courierStartRef = useRef(options.courier)

  useEffect(() => {
    onMoveRef.current = options.picker?.onMove
    pickerInitialRef.current = options.picker?.initial ?? RESTAURANT
    pickerPopupRef.current = options.picker?.popup ?? 'Lokasi toko, geser untuk menyesuaikan'
    stopsRef.current = options.stops
    courierStartRef.current = options.courier
  })

  // Posisi kurir berubah tanpa membangun ulang peta: satu marker, digeser.
  const courierLat = options.courier?.[0]
  const courierLng = options.courier?.[1]

  useEffect(() => {
    if (courierRef.current == null) return
    if (courierLat === undefined || courierLng === undefined) return
    courierRef.current.setLatLng([courierLat, courierLng])
  }, [courierLat, courierLng])

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
        markerRef.current = drawPickerMarker(
          L,
          map,
          pickerInitialRef.current,
          pickerPopupRef.current,
          (lat, lng) => onMoveRef.current?.(lat, lng),
        )
      } else {
        // Semua pin non-pemilih digambar di helper supaya hook tetap di bawah
        // batas baris; helper mengembalikan marker kurir kalau memang digambar.
        courierRef.current = drawOrderMap(L, map, {
          mode,
          single: options.single,
          stops: stopsRef.current,
          courier: courierStartRef.current,
        })
      }

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
      courierRef.current = null
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
