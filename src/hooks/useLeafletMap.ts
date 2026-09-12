import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

import 'leaflet/dist/leaflet.css'

/** Restaurant and delivery address used by every order screen. */
const RESTAURANT: [number, number] = [23.8103, 90.4125]
const DESTINATION: [number, number] = [23.7808, 90.3996]
const ZOOM = 14

function pin(L: typeof import('leaflet'), color: string) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.45);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: '',
  })
}

/**
 * Fills an existing `<div class="order-map-container" id=...>` with the same
 * OpenStreetMap view the original screens render, and exposes `recenter()` for
 * the map's locate button. Leaflet is loaded lazily, like the original.
 */
export function useLeafletMap(mapId: string) {
  const mapRef = useRef<LeafletMap | null>(null)

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

      const map = L.map(element, { zoomControl: false, attributionControl: false })
      map.setView(RESTAURANT, ZOOM)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      L.marker(RESTAURANT, { icon: pin(L, '#FD6931') }).addTo(map).bindPopup('Restaurant')
      L.marker(DESTINATION, { icon: pin(L, '#3B82F6') })
        .addTo(map)
        .bindPopup('Delivery address')
      L.polyline([RESTAURANT, DESTINATION], {
        color: '#FD6931',
        weight: 3,
        dashArray: '8 6',
        opacity: 0.8,
      }).addTo(map)

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [mapId])

  return {
    recenter: () => mapRef.current?.setView(RESTAURANT, ZOOM),
  }
}
