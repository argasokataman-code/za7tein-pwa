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

/** Detail alamat yang bisa diisi dari alamat tersimpan terdekat. */
export interface ApartmentDetail {
  building: string
  floor: string
  unit: string
  notes?: string | null
}

export type ApartmentPatch = Partial<Pick<ApartmentDetail, 'building' | 'floor' | 'unit' | 'notes'>>

/**
 * Isi field form yang masih kosong dari alamat tersimpan terdekat.
 *
 * Hanya field kosong yang diisi, jadi membuka form lewat "Pakai lokasi saat
 * ini" tidak pernah menimpa ketikan customer. Unit ikut diisi karena GPS di
 * dalam 200 m hampir selalu berarti gedung yang sama, tetapi pemanggil wajib
 * memberi tahu bahwa lantai/unit perlu diperiksa — data tetangga bisa saja
 * yang terambil.
 *
 * Backend belum punya reverse geocoding, jadi ini satu-satunya "isi otomatis"
 * yang jujur: detail milik customer sendiri, bukan alamat jalan baru.
 */
export function prefillApartment(near: ApartmentDetail, current: ApartmentDetail): ApartmentPatch {
  const patch: ApartmentPatch = {}
  if (!current.building.trim() && near.building.trim()) patch.building = near.building
  if (!current.floor.trim() && near.floor.trim()) patch.floor = near.floor
  if (!current.unit.trim() && near.unit.trim()) patch.unit = near.unit
  if (!(current.notes ?? '').trim() && (near.notes ?? '').trim()) patch.notes = near.notes ?? undefined
  return patch
}
