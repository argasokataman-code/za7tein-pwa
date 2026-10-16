import { mockMerchant } from '../data/merchant'
import { mockUser } from '../data/user'

/**
 * Titik toko dan alamat pengantaran diambil dari data, bukan angka lepas.
 */
export const RESTAURANT: [number, number] = [mockMerchant.lat, mockMerchant.lng]
export const DESTINATION: [number, number] = [
  mockUser.addresses[0].lat,
  mockUser.addresses[0].lng,
]

/**
 * Rute di antara keduanya. Belokan ringan membuatnya terbaca seperti jalan.
 */
export const ROUTE: [number, number][] = [
  RESTAURANT,
  [RESTAURANT[0] + 0.0009, RESTAURANT[1] + 0.0004],
  [(RESTAURANT[0] + DESTINATION[0]) / 2 + 0.0011, (RESTAURANT[1] + DESTINATION[1]) / 2],
  [DESTINATION[0] + 0.0006, DESTINATION[1] - 0.0005],
  DESTINATION,
]

/** Titik kurir, di awal rute sampai pengantaran dimulai. */
export const COURIER: [number, number] = ROUTE[1]

/** Warna pin mengikuti palet aplikasi. */
export const PIN_MERCHANT = '#F15A37'
export const PIN_DESTINATION = '#202020'
export const PIN_COURIER = '#5C7A5C'

export function pin(L: typeof import('leaflet'), color: string, pulse = false) {
  return L.divIcon({
    html: `<div class="sa7tein-pin${pulse ? ' sa7tein-pin--pulse' : ''}" style="--pin:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',
  })
}

/** Satu perhentian rute batch untuk peta (M5). */
export interface MapStop {
  lat: number
  lng: number
  label: string
  /** Sudah dituntaskan; ganti warna pin supaya sisa rute terbaca sekali lirik. */
  done?: boolean
}

/**
 * Pin bernomor untuk rute batch: urutan antar terbaca langsung di peta, bukan
 * lewat tooltip. `done` memudarkan pin (bukan warna baru) supaya sisa rute yang
 * masih terang.
 */
export function numberedPin(L: typeof import('leaflet'), order: number, done = false) {
  return L.divIcon({
    html: `<div class="sa7tein-pin sa7tein-pin--num${done ? ' sa7tein-pin--done' : ''}">${order}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    className: '',
  })
}

/**
 * Gambar rute batch di peta: titik toko + pin bernomor per henti + garis
 * penghubung, lalu zoom ke seluruh rute. Dipisah dari hook supaya hook tetap
 * di bawah batas baris dan geometri rute hidup di satu tempat.
 */
export function drawBatchRoute(
  L: typeof import('leaflet'),
  map: import('leaflet').Map,
  stops: MapStop[],
) {
  const points: [number, number][] = [RESTAURANT]
  stops.forEach((stop, index) => {
    points.push([stop.lat, stop.lng])
    L.marker([stop.lat, stop.lng], { icon: numberedPin(L, index + 1, stop.done) })
      .addTo(map)
      .bindPopup(`${index + 1}. ${stop.label}${stop.done ? ' — selesai' : ''}`)
  })
  L.polyline(points, {
    color: PIN_MERCHANT,
    weight: 4,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'sa7tein-route',
  }).addTo(map)
  map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
}

export type MapMode = 'preview' | 'delivery' | 'picker'

export interface PickerOptions {
  initial: [number, number]
  onMove: (lat: number, lng: number) => void
  /** Teks popup pin pemilih; default menyebut lokasi toko. */
  popup?: string
}
