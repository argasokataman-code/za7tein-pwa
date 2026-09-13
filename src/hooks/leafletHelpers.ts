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

export type MapMode = 'preview' | 'delivery' | 'picker'

export interface PickerOptions {
  initial: [number, number]
  onMove: (lat: number, lng: number) => void
}
