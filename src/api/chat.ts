/**
 * Chat order di PostgREST — dipakai untuk **customer ↔ kurir**.
 *
 * Tabel BE (terverifikasi):
 *   chats{id, order_id, last_message, last_at, created_at}
 *   chat_messages{id, chat_id, sender_id(bigint → users.id), body, read_at, channel, at}
 *
 * RLS `chat_messages` (select & insert) baru terbuka untuk sesi CS; sesi
 * per-peran (customer/merchant/kurir) belum diberi izin — insert sebagai customer
 * dapat 403. Repo mengikuti jalur yang sudah terbukti untuk `notifications`:
 * baca/tulis lewat token CS (`refToken`), sedangkan `sender_id` menandai peran
 * pengirim. Jalur `resolveUserId(auth.uid → users.id)` sudah ada di `profile.ts`
 * bila kelak RLS peserta dibuka.
 *
 * Baris `chats` tidak dibuat otomatis oleh BE — `ensureChat` yang membuatnya
 * (sekali per order, satu chat per order).
 */
import { refToken } from './reference'
import { apiEnabled, createWith, createWithReturn, restWith } from './supabase'

/** Peran pengirim yang dikenal jalur chat ini. */
export type ChatSender = 'customer' | 'merchant' | 'courier'

/** `users.id` pengirim per peran (demo) — sejajar `notifications.AUDIENCE_USER`. */
const SENDER_USER: Record<ChatSender, number> = { customer: 1, merchant: 2, courier: 3 }

/** Kanal percakapan (PRD `CHAT_CHANNELS`); layar ini selalu customer ↔ kurir. */
const CHANNEL: Record<ChatSender, string> = {
  customer: 'courier-customer',
  merchant: 'merchant-courier',
  courier: 'merchant-courier',
}

interface ChatMessageRow {
  id: number
  sender_id: number
  body: string
  at: string
}

/** Satu baris chat siap pakai di UI. `at` = ISO waktu kirim. */
export interface ChatLine {
  id: string
  senderId: number
  body: string
  at: string
}

/** Cari id `chats` untuk order; buat bila belum ada. `null` bila gagal. */
async function ensureChat(token: string, orderId: number): Promise<number | null> {
  const found = await restWith<{ id: number }>(
    token,
    'chats',
    `?select=id&order_id=eq.${orderId}&limit=1`,
  )
  if (found[0]?.id) return found[0].id
  const created = await createWithReturn<{ id: number }>(token, 'chats', { order_id: orderId })
  return created[0]?.id ?? null
}

/** Pesan satu order, terlama dulu. Kosong bila API mati / belum ada chat. */
export async function fetchChatMessages(orderId: number): Promise<ChatLine[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const chatId = await ensureChat(token, orderId)
  if (!chatId) return []
  const rows = await restWith<ChatMessageRow>(
    token,
    'chat_messages',
    `?select=id,sender_id,body,at&chat_id=eq.${chatId}&order=id.asc&limit=100`,
  )
  return rows.map((row) => ({
    id: `cm-${row.id}`,
    senderId: row.sender_id,
    body: row.body,
    at: row.at,
  }))
}

/**
 * Kirim satu pesan. Best-effort seperti tulis notifikasi: lempar, pemanggil yang
 * memutuskan (UI menampilkan pesan optimistis lalu menyegarkan).
 */
export async function sendChatMessage(input: {
  orderId: number
  from: ChatSender
  body: string
}): Promise<void> {
  if (!apiEnabled) return
  const token = await refToken()
  const chatId = await ensureChat(token, input.orderId)
  if (!chatId) return
  await createWith(token, 'chat_messages', {
    chat_id: chatId,
    sender_id: SENDER_USER[input.from],
    body: input.body,
    channel: CHANNEL[input.from],
  })
}
