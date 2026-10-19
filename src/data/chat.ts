import type { OrderType } from '../types'

/**
 * Peserta & lifecycle chat per order (PRD aktif `sa7tein-mvp-2026-10-11` §20.1,
 * CUS-26, COU-07). Chat dibuka saat order dibuat dengan peserta awal customer +
 * merchant; kurir baru bergabung saat ia benar-benar memegang order itu.
 */
export type ChatRole = 'customer' | 'merchant' | 'kurir'

export interface ChatParticipant {
  role: ChatRole
  name: string
  /** false = belum bergabung (kurir masuk belakangan, bukan sejak order dibuat). */
  joined: boolean
  /** Waktu bergabung dari `chat_participants` BE (mock tak punya nilainya). */
  joinedAt?: string
}

export type ChatThreadStatus = 'open' | 'closed'
export type ChatCloseReason = 'completed' | 'cancelled'

export interface ChatContext {
  customerName: string
  merchantName: string
  /** Nama kurir; hanya tampil sebagai peserta setelah ia bergabung. */
  courierName: string
  /** Kurir inhouse sudah di-assign ke batch order ini (BR-B07, §20.1). */
  batchAssigned: boolean
  /** Assignment kurir partner sudah di-approve (COU-07, §20.1). */
  partnerApproved: boolean
  /** `cancelled` mencakup order ditolak merchant (keduanya menutup chat). */
  orderState: 'active' | 'done' | 'cancelled'
}

/**
 * Peserta thread sesuai §20.1: customer + merchant sejak order dibuat; kurir
 * **hanya** setelah batch di-assign (inhouse) atau assignment di-approve
 * (partner). PRD tidak menetapkan batas jumlah peserta, jadi tidak ada batas
 * yang dikarang di sini (batas "maks 3" cuma keputusan flow `f14`).
 */
export function chatParticipants(ctx: ChatContext): ChatParticipant[] {
  const courierJoined = ctx.batchAssigned || ctx.partnerApproved
  return [
    { role: 'customer', name: ctx.customerName, joined: true },
    { role: 'merchant', name: ctx.merchantName, joined: true },
    { role: 'kurir', name: ctx.courierName, joined: courierJoined },
  ]
}

/**
 * Status thread (§20.1): ditutup **langsung** saat order batal/ditolak, dan
 * beberapa jam setelah order selesai. Durasi "beberapa jam" = OPEN-20, jadi tak
 * diangkakan di sini — layar hanya menulis alasannya.
 */
export function chatStatusFor(orderState: ChatContext['orderState']): {
  status: ChatThreadStatus
  reason?: ChatCloseReason
} {
  if (orderState === 'cancelled') return { status: 'closed', reason: 'cancelled' }
  if (orderState === 'done') return { status: 'closed', reason: 'completed' }
  return { status: 'open' }
}

/**
 * Kurir inhouse bergabung setelah merchant meng-assign batch order ini.
 * `courierId` null = batch belum di-assign (BR-B07).
 */
export function courierJoinedInhouse(batch: { courierId: string | null; orderIds: string[] } | null, orderId?: string): boolean {
  if (!batch || !batch.courierId) return false
  if (!orderId) return true
  return batch.orderIds.includes(orderId)
}

/**
 * Kurir partner bergabung setelah approve (COU-07). Order partner di BE belum
 * punya id yang bisa disandingkan dengan order customer di demo ini, jadi
 * keanggotaan diturunkan dari "ada assignment yang sudah di-approve".
 */
export function courierJoinedPartner(assignments: { status: string }[]): boolean {
  return assignments.some((a) => a.status === 'approved')
}

/** Ada thread untuk order ini? Chat dibuka saat order dibuat (§20.1). */
export function hasChatThread(order: { id: string } | null, orderId: number | null): boolean {
  return Boolean(order || orderId)
}

/** Tipe pengantaran yang memengaruhi jalur masuk kurir (Regular = batch, Quick = assignment). */
export function courierJoinKind(deliveryType: OrderType | undefined): 'inhouse' | 'partner' | null {
  if (deliveryType === 'regular') return 'inhouse'
  if (deliveryType === 'quick') return 'partner'
  return null
}
