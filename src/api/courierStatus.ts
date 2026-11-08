import { ensureCourierToken } from './orders'
import { patch, restWith } from './supabase'

/** `sub` JWT = `users.id`; `couriers.user_id` menunjuk kolom yang sama. */
function subject(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Number(payload?.sub)
  } catch {
    return NaN
  }
}

export interface CourierSelf {
  id: number
  name: string
  phone: string
  merchantId: number | null
  vehicle: string | null
  photo: string | null
  courierType: string | null
}

/**
 * Identitas kurir yang sedang masuk, dari baris BE `couriers` milik JWT ini.
 *
 * Sebelumnya beranda dan profil kurir membaca `courierSelf` (`data/courier.ts`),
 * yaitu baris seed kurir demo: nama "Budi Santoso" + nomor `+62812…` yang tidak
 * ada hubungannya dengan akun yang benar-benar masuk. `null` = tak terbaca
 * (BE mati / sesi belum siap); pemanggil memakai nama dari onboarding atau
 * sebutan netral, bukan angka seed.
 */
export async function fetchCourierSelf(): Promise<CourierSelf | null> {
  try {
    const token = await ensureCourierToken()
    const uid = subject(token)
    if (!Number.isFinite(uid)) return null
    const rows = await restWith<{
      id: number
      name: string | null
      phone: string | null
      merchant_id: number | null
      vehicle: string | null
      photo: string | null
      courier_type: string | null
    }>(
      token,
      'couriers',
      `?select=id,name,phone,merchant_id,vehicle,photo,courier_type&user_id=eq.${uid}&limit=1`,
    )
    const row = rows[0]
    if (!row) return null
    return {
      id: row.id,
      name: row.name ?? '',
      phone: row.phone ?? '',
      merchantId: row.merchant_id,
      vehicle: row.vehicle,
      photo: row.photo,
      courierType: row.courier_type,
    }
  } catch {
    return null
  }
}

/**
 * Status siap-terima-tugas kurir di BE (`couriers.availability`).
 *
 * Sumbernya tabel BE, bukan Redux lokal: merchant membaca baris yang sama, jadi
 * dua layar tidak boleh punya jawaban berbeda. `null` = tidak bisa dibaca
 * (BE mati / sesi belum siap), dan pemanggil **tidak** boleh menimpanya dengan
 * tebakan.
 */
export async function fetchCourierOnline(): Promise<boolean | null> {
  try {
    const token = await ensureCourierToken()
    const uid = subject(token)
    if (!Number.isFinite(uid)) return null
    const rows = await restWith<{ availability: string | null }>(
      token,
      'couriers',
      `?select=availability&user_id=eq.${uid}&limit=1`,
    )
    if (!rows.length) return null
    return rows[0].availability === 'available'
  } catch {
    return null
  }
}

/**
 * Tulis status siap/jeda kurir ke BE.
 *
 * Sebelumnya tombol di profil/beranda kurir hanya membalik `courierSlice`
 * (lokal per jendela), sehingga merchant tetap membaca `unavailable` dari BE
 * dan menampilkan "offline" padahal kurir melihat dirinya online.
 */
export async function setCourierOnline(online: boolean): Promise<void> {
  const token = await ensureCourierToken()
  const uid = subject(token)
  if (!Number.isFinite(uid)) throw new Error('[api] sesi kurir tanpa sub')
  await patch(token, 'couriers', `?user_id=eq.${uid}`, {
    availability: online ? 'available' : 'unavailable',
  })
}
