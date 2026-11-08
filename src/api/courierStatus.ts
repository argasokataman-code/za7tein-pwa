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
