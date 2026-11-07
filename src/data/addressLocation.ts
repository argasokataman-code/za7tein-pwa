import type { Address } from '../types'
import { haversineMeters } from './merchant'

/**
 * Jarak maksimum antara titik GPS dan alamat tersimpan supaya alamat itu
 * dianggap "sedang di sini". 200 m cukup lebar untuk akurasi GPS di dalam
 * gedung, tetapi masih memisahkan dua apartemen yang bertetangga.
 */
export const NEAREST_ADDRESS_METERS = 200

export interface NearestAddress {
  address: Address
  /** Jarak geodesik titik GPS ke titik alamat, meter. */
  meters: number
}

/**
 * Alamat tersimpan terdekat dari sebuah koordinat. Mengembalikan `null` bila
 * daftar kosong. Ambang kedekatan diperiksa pemanggil lewat
 * `NEAREST_ADDRESS_METERS`, supaya fungsi ini tetap bisa dipakai untuk
 * menampilkan jarak tanpa memutuskan alamat mana yang dipakai.
 *
 * Backend belum punya layanan reverse geocoding (koordinat → teks alamat),
 * jadi "deteksi alamat" di demo memakai alamat yang pernah disimpan customer.
 */
export function nearestSavedAddress(
  coords: { lat: number; lng: number },
  addresses: Address[],
): NearestAddress | null {
  let best: NearestAddress | null = null
  for (const address of addresses) {
    const meters = haversineMeters(coords, address)
    if (!best || meters < best.meters) best = { address, meters }
  }
  return best
}
