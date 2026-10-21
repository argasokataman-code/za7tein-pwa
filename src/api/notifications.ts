/**
 * Tulis notifikasi ke PostgREST `notifications` + tandai terbaca.
 *
 * Insert dijaga RLS (anon 401, user login 201), jadi memakai sesi `cs@`
 * (`refToken`) yang boleh menulis baris audience mana pun. Semua panggilan tulis
 * best-effort: pemanggil `.catch(() => {})`, UI tidak menunggu jaringan.
 */
import type { AppNotification, NotifAudience } from '../types'
import { refToken } from './reference'
import { apiEnabled, createWith, patch } from './supabase'

/** user_id penerima per audience (demo). `audience` yang menentukan tampilnya. */
const AUDIENCE_USER: Record<NotifAudience, number> = {
  customer: 1,
  merchant: 2,
  courier: 3,
  cs: 4,
}

/** Emit satu notifikasi (best-effort — lempar, pemanggil yang memutuskan). */
export async function insertNotification(input: {
  audience: NotifAudience
  kind: AppNotification['kind']
  title: string
  body: string
  /** Nada notifikasi (kolom `notifications.sound`; kontrak `Notification.sound`). */
  sound?: string
  /** Order pemicu; dipakai alarm kurir untuk menampilkan nomor order. */
  orderId?: string
}): Promise<void> {
  if (!apiEnabled) return
  const token = await refToken()
  await createWith(token, 'notifications', {
    user_id: AUDIENCE_USER[input.audience],
    audience: input.audience,
    kind: input.kind,
    title: input.title,
    body: input.body,
    sound: input.sound ?? 'default',
    read: false,
    order_id: input.orderId ?? null,
  })
}

/** Baris numerik dari id lokal `ntf-<n>`; mock (`n1`…) → null (tak bisa ditulis). */
function rowId(id: string): number | null {
  const m = /^ntf-(\d+)$/.exec(id)
  return m ? Number(m[1]) : null
}

/** Tandai satu notifikasi terbaca di BE (best-effort). */
export async function markNotificationRead(id: string): Promise<void> {
  const n = rowId(id)
  if (!apiEnabled || n === null) return
  const token = await refToken()
  await patch(token, 'notifications', `?id=eq.${n}`, { read: true })
}

/** Tandai semua terbaca untuk satu audience di BE (best-effort). */
export async function markNotificationsRead(audience: NotifAudience): Promise<void> {
  if (!apiEnabled) return
  const token = await refToken()
  await patch(token, 'notifications', `?audience=eq.${audience}&read=eq.false`, { read: true })
}
