import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { mockMerchant } from '../data/merchant'
import { mockUser } from '../data/user'

/**
 * Titik toko dan alamat pengantaran diambil dari data, bukan angka lepas.
 * Versi hasil porting memakai koordinat Dhaka (23.81, 90.41) — petanya
 * menampilkan aksara Bengali sementara alamat pesanannya "Jakarta Selatan",
 * jadi peta dan data saling bertentangan. Menurunkannya dari merchant dan
 * alamat terpilih membuat keduanya tidak bisa melenceng lagi.
 */
const RESTAURANT: [number, number] = [mockMerchant.lat, mockMerchant.lng]
const DESTINATION: [number, number] = [
  mockUser.addresses[0].lat,
  mockUser.addresses[0].lng,
]
const ZOOM = 15

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

      L.marker(RESTAURANT, { icon: pin(L, '#F15A37') }).addTo(map).bindPopup('Restaurant')
      L.marker(DESTINATION, { icon: pin(L, '#3B82F6') })
        .addTo(map)
        .bindPopup('Delivery address')
      L.polyline([RESTAURANT, DESTINATION], {
        color: '#F15A37',
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
