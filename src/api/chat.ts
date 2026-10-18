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
export const SENDER_USER: Record<ChatSender, number> = { customer: 1, merchant: 2, courier: 3 }

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
async function findChat(token: string, orderId: number): Promise<number | null> {
  const found = await restWith<{ id: number }>(
    token,
    'chats',
    `?select=id&order_id=eq.${orderId}&limit=1`,
  )
  return found[0]?.id ?? null
}

/** Id chat order, dibuat kalau belum ada (jalur tulis). */
async function ensureChat(token: string, orderId: number): Promise<number | null> {
  const existing = await findChat(token, orderId)
  if (existing) return existing
  const created = await createWithReturn<{ id: number }>(token, 'chats', { order_id: orderId }, 'id')
  return created[0]?.id ?? null
}

/** `chat_participants.role` → peran chat FE. `kurir` diterima sebagai alias. */
const PARTICIPANT_ROLE: Record<string, ChatSender> = {
  customer: 'customer',
  merchant: 'merchant',
  courier: 'courier',
  kurir: 'courier',
}

/** Satu peserta thread dari BE, lengkap dengan waktu bergabungnya. */
export interface ChatParticipantLive {
  role: ChatSender
  userId: number
  joinedAt: string
}

/**
 * Peserta satu chat dari `chat_participants` D1. BE mencatat customer + merchant
 * sejak order dibuat (kurir belum pernah ditulis saat ini), dengan `joined_at`
 * sungguhan — jadi UI tak perlu lagi menebak siapa yang sudah bergabung.
 */
export async function fetchChatParticipants(orderId: number): Promise<ChatParticipantLive[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const chatId = await findChat(token, orderId)
  if (!chatId) return []
  const rows = await restWith<{ user_id: number; role: string; joined_at: string }>(
    token,
    'chat_participants',
    `?select=user_id,role,joined_at&chat_id=eq.${chatId}&order=joined_at.asc`,
  )
  const out: ChatParticipantLive[] = []
  for (const row of rows) {
    const role = PARTICIPANT_ROLE[row.role]
    if (role) out.push({ role, userId: row.user_id, joinedAt: row.joined_at })
  }
  return out
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
