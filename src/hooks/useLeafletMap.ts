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

/**
 * Rute di antara keduanya. Versi lama menarik garis lurus diagonal, yang
 * terbaca sebagai "dua titik dihubungkan", bukan sebagai perjalanan. Belokan
 * ringan ini membuatnya terbaca seperti jalan.
 */
const ROUTE: [number, number][] = [
  RESTAURANT,
  [RESTAURANT[0] + 0.0009, RESTAURANT[1] + 0.0004],
  [(RESTAURANT[0] + DESTINATION[0]) / 2 + 0.0011, (RESTAURANT[1] + DESTINATION[1]) / 2],
  [DESTINATION[0] + 0.0006, DESTINATION[1] - 0.0005],
  DESTINATION,
]

/** Titik kurir, di awal rute sampai pengantaran dimulai. */
const COURIER: [number, number] = ROUTE[1]

/**
 * Warna pin mengikuti palet aplikasi. Versi porting memakai #3B82F6 untuk
 * titik tujuan — biru generik yang tidak ada di palet Sa7tein, sehingga peta
 * terasa dari aplikasi lain.
 */
const PIN_MERCHANT = '#F15A37'
const PIN_DESTINATION = '#202020'
const PIN_COURIER = '#5C7A5C'

function pin(L: typeof import('leaflet'), color: string, pulse = false) {
  return L.divIcon({
    html: `<div class="sa7tein-pin${pulse ? ' sa7tein-pin--pulse' : ''}" style="--pin:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',
  })
}

export type MapMode = 'preview' | 'delivery'

/**
 * Mengisi `<div class="order-map-container" id=...>` dengan peta OpenStreetMap
 * dan menyediakan `recenter()`.
 *
 * `mode` menentukan bobotnya: `preview` untuk status awal, di mana peta hanya
 * pelengkap dan tidak boleh menguasai layar; `delivery` saat kurir berjalan,
 * di mana peta memang menjadi bagian utama dan rutenya digambar.
 */
export function useLeafletMap(mapId: string, mode: MapMode = 'preview') {
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

      const map = L.map(element, {
        zoomControl: false,
        attributionControl: false,
        // Peta preview tidak perlu menangkap gestur; halaman tetap bisa digulir.
        dragging: mode === 'delivery',
        scrollWheelZoom: false,
        touchZoom: mode === 'delivery',
        doubleClickZoom: mode === 'delivery',
        keyboard: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      L.marker(RESTAURANT, { icon: pin(L, PIN_MERCHANT) })
        .addTo(map)
        .bindPopup(mockMerchant.name)
      L.marker(DESTINATION, { icon: pin(L, PIN_DESTINATION) })
        .addTo(map)
        .bindPopup('Alamat pengantaran')

      if (mode === 'delivery') {
        L.marker(COURIER, { icon: pin(L, PIN_COURIER, true) })
          .addTo(map)
          .bindPopup('Budi Santoso')
      }

      L.polyline(ROUTE, {
        color: PIN_MERCHANT,
        weight: mode === 'delivery' ? 4 : 3,
        opacity: mode === 'delivery' ? 0.95 : 0.6,
        lineCap: 'round',
        lineJoin: 'round',
        className:
          mode === 'delivery' ? 'sa7tein-route sa7tein-route--draw' : 'sa7tein-route',
      }).addTo(map)

      if (mode === 'delivery') {
        map.fitBounds(L.latLngBounds(ROUTE), { padding: [48, 48] })
      } else {
        map.setView(
          [(RESTAURANT[0] + DESTINATION[0]) / 2, (RESTAURANT[1] + DESTINATION[1]) / 2],
          15,
        )
      }

      mapRef.current = map
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [mapId, mode])

  return {
    recenter: () =>
      mapRef.current?.fitBounds(
        [
          [RESTAURANT[0], RESTAURANT[1]],
          [DESTINATION[0], DESTINATION[1]],
        ],
        { padding: [48, 48] },
      ),
  }
}
