import {
  DISPUTE_RULES,
  MOCK_INCIDENTS,
  RULE_COMPENSATIONS,
  RULE_PUNISHMENTS,
} from './rules'
import { ALMOST_ARRIVED_MINUTES } from './tracking'
import { PLATFORM_FEE_JOD } from './merchant'
import { QUICK_MULTIPLIER_DEFAULT } from './marketplace'
import type {
  DisputeRule,
  Incident,
  OpsPenalty,
  OpsPlatformConfig,
  OpsTag,
  OpsTagStatus,
  OpsPenaltyStatus,
} from '../types'

/**
 * Data panel ops (M10, R-OPS).
 *
 * PRD memisahkan **model** dari **isi**: rule, ambang, dan tarif dibuat ops
 * lewat aplikasi internal. Repo ini front-end mock, jadi nilai di sini adalah
 * **seed yang berdiri di tempat panel ops** — mengubahnya belum mengubah
 * konstanta sumber yang dipakai alur nyata (`data/marketplace.ts`,
 * `data/tracking.ts`, `data/merchant.ts`). Batas itu ditulis di layar Setelan,
 * bukan disembunyikan.
 *
 * Katalog rule/kompensasi/punishment **tidak diduplikasi**: ia dibaca dari
 * `data/rules.ts`, satu sumber dengan yang dipakai mesin `ruleForOrder()`.
 */

export const OPS_TAG_STATUS_LABEL: Record<OpsTagStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export const OPS_PENALTY_STATUS_LABEL: Record<OpsPenaltyStatus, string> = {
  issued: 'Berlaku',
  revoked: 'Dicabut',
}

export const OPS_SUBJECT_LABEL: Record<OpsPenalty['subject'], string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  courier: 'Kurir',
}

/** Nilai awal tiga knob ops, menyalin konstanta yang sudah dipakai kode. */
export const MOCK_PLATFORM_CONFIG: OpsPlatformConfig = {
  quickMultiplier: QUICK_MULTIPLIER_DEFAULT,
  almostArrivedMinutes: ALMOST_ARRIVED_MINUTES,
  platformFeeCustomerJod: PLATFORM_FEE_JOD,
  platformFeeMerchantJod: PLATFORM_FEE_JOD,
}

/** Antrean tag menunggu moderasi (moderasi tag, R-OPS). */
export const MOCK_OPS_TAGS: OpsTag[] = [
  { id: 'tag-1', label: 'halal', merchantName: 'Nasi Goreng Pak Kumis', status: 'pending', submittedAt: 'Hari ini 08:12' },
  { id: 'tag-2', label: 'buka 24 jam', merchantName: 'Kopi Kenangan Kecil', status: 'pending', submittedAt: 'Kemarin 21:30' },
  { id: 'tag-3', label: 'vegan', merchantName: 'Salad Bar Amman', status: 'approved', submittedAt: '2 hari lalu 10:05' },
  { id: 'tag-4', label: 'termurah', merchantName: 'Warung Bu Tini', status: 'pending', submittedAt: '3 hari lalu 14:40' },
]

/** Riwayat SP yang diterbitkan ops (bentuk punishment §18). */
export const MOCK_OPS_PENALTIES: OpsPenalty[] = [
  {
    id: 'sp-1',
    subject: 'courier',
    subjectName: 'Budi Santoso',
    form: 'Surat peringatan',
    level: 'SP-1',
    reason: 'Tidak merespons assignment Quick sampai kedaluwarsa',
    status: 'issued',
    issuedAt: 'Kemarin 16:20',
  },
  {
    id: 'sp-2',
    subject: 'merchant',
    subjectName: 'Warung Bu Tini',
    form: 'Penurunan peringkat',
    level: 'ringan',
    reason: 'Tolak order berulang di jam sibuk',
    status: 'issued',
    issuedAt: '4 hari lalu 12:00',
  },
]

/** Katalog rule/kompensasi/punishment untuk editor ops — satu sumber `rules.ts`. */
export const OPS_RULES: DisputeRule[] = DISPUTE_RULES
export const OPS_COMPENSATIONS = RULE_COMPENSATIONS
export const OPS_PUNISHMENTS = RULE_PUNISHMENTS
export const OPS_INCIDENTS: Incident[] = MOCK_INCIDENTS

/** Tag yang masih menunggu moderasi. */
export function pendingTagCount(tags: OpsTag[]): number {
  return tags.filter((tag) => tag.status === 'pending').length
}

/** Insiden yang belum selesai. */
export function openIncidentCount(incidents: Incident[]): number {
  return incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length
}

/** SP yang masih berlaku. */
export function activePenaltyCount(penalties: OpsPenalty[]): number {
  return penalties.filter((p) => p.status === 'issued').length
}

/** Kompensasi milik satu rule (editor ops menampilkannya). */
export function compensationsForRule(ruleId: string) {
  return OPS_COMPENSATIONS.filter((c) => c.ruleId === ruleId)
}

/** Punishment milik satu rule. */
export function punishmentsForRule(ruleId: string) {
  return OPS_PUNISHMENTS.filter((p) => p.ruleId === ruleId)
}
