import type {
  AdminEscalation,
  AdminMerchant,
  AdminTenant,
  DepositStatus,
  Dispute,
  DisputeResolution,
  DisputeStatus,
  LedgerEntry,
  LedgerEntryType,
  LiabilitySummary,
  TenantStatus,
} from '../types'

/**
 * Panel admin (CS) — data mock.
 *
 * Dasar perilaku: flow F15 (`docs/design/flows/f15-super-admin/`) + F8
 * (`docs/design/flows/f8-dispute/`) dan milestone M6/M9 PRD aktif
 * `irbid-mvp-v2-2026-09-21`. Repo ini front-end saja: approval, resolusi, dan
 * angka liability di sini adalah state yang ditampilkan, bukan logika uang.
 */

/** Semua nominal konsol SA dalam JOD (PRD aktif), bukan IDR. */
export function jod(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} JOD`
}

/**
 * Rate mock 1 JOD = Rp23.000 — contoh yang disebut PRD M1 untuk widget kurs.
 * M1 belum diimplementasikan di repo ini; angka ini dipakai HANYA untuk
 * menampilkan padanan JOD pada sengketa yang diajukan customer (order disimpan
 * dalam IDR). Jangan dipakai sebagai sumber kurs.
 */
export const MOCK_JOD_RATE = 23000

/** Padanan JOD dari nominal IDR, 2 desimal. */
export function idrToJod(idr: number): number {
  return Number((idr / MOCK_JOD_RATE).toFixed(2))
}

/**
 * Nilai order yang dipakai form sengketa saat cart kosong (mis. halaman dibuka
 * langsung). Bukan angka bisnis — hanya supaya nominal JOD tidak nol di demo.
 */
export const DEMO_DISPUTE_ORDER_IDR = 44000

const DEPOSIT_JOD = 3.5

export const tenantStatusLabel: Record<TenantStatus, string> = {
  pending: 'Menunggu review',
  approved: 'Aktif',
  suspended: 'Suspended',
  blacklisted: 'Blacklist COD',
}

export const depositStatusLabel: Record<DepositStatus, string> = {
  unpaid: 'Belum dibayar',
  held: 'Held',
  released: 'Released',
}

export const disputeStatusLabel: Record<DisputeStatus, string> = {
  open: 'Baru',
  investigating: 'Investigasi',
  resolved: 'Diputuskan',
  rejected: 'Ditolak',
}

export const ledgerTypeLabel: Record<LedgerEntryType, string> = {
  deposit_hold: 'Deposit hold',
  cod_hold: 'COD hold',
  settlement: 'Settlement',
  fee: 'Fee platform',
  refund: 'Refund',
  protection_fund: 'Protection fund',
}

/**
 * Kategori sengketa. Daftar final belum ada di PRD (OQ-29 — finalisasi
 * kategori ditunda sampai volume >5/bulan), jadi ini placeholder yang wajar
 * untuk showcase. Jangan diklaim final; ganti kalau OQ-29 ditutup.
 */
export const DISPUTE_CATEGORIES = [
  'Pesanan tidak sesuai',
  'Pesanan belum diterima',
  'Bukti pengantaran tidak cocok',
  'Jumlah atau item kurang',
  'Lainnya',
]

/** Empat resolusi F8 beserta efeknya — ditampilkan sebagai catatan tombol. */
export const RESOLUTIONS: { id: DisputeResolution; label: string; effect: string }[] = [
  { id: 'refund_full', label: 'Refund penuh', effect: '100% ke customer, fee customer ikut kembali' },
  { id: 'refund_partial', label: 'Refund sebagian', effect: 'X% ke customer, sisanya cair ke merchant' },
  { id: 'released', label: 'Release ke merchant', effect: 'Fee merchant tetap dipotong' },
  { id: 'no_action', label: 'Tolak', effect: 'Tanpa ubah saldo' },
]

export const mockLiability: LiabilitySummary = {
  customerWallets: 128.4,
  merchantWallets: 86.75,
  courierTips: 12.3,
  xenditBalance: 210,
}

/** Kewajiban platform: saldo customer + merchant + tips kurir yang belum di-payout. */
export function totalLiability(liability: LiabilitySummary): number {
  return liability.customerWallets + liability.merchantWallets + liability.courierTips
}

/** Selisih saldo Xendit terhadap kewajiban; negatif = kurang (flag di dashboard). */
export function liabilityGap(liability: LiabilitySummary): number {
  return liability.xenditBalance - totalLiability(liability)
}

export const adminTenants: AdminTenant[] = [
  {
    id: 'tn-1',
    name: 'Nasi Goreng Pak Kumis',
    owner: 'Kumis Wijaya',
    city: 'Irbid — Al-Hashmi',
    submittedAt: '14 menit lalu',
    photoCount: 3,
    deliveryConfig: { maxKm: 2, zones: 'A, B, C' },
    deposit: DEPOSIT_JOD,
    depositStatus: 'unpaid',
    tenantStatus: 'pending',
  },
  {
    id: 'tn-2',
    name: 'Kebab Syiria Irbid',
    owner: 'Yusuf Al-Rashid',
    city: 'Irbid — University St.',
    submittedAt: '1 jam lalu',
    photoCount: 2,
    deliveryConfig: { maxKm: 1.5, zones: 'A, B' },
    deposit: DEPOSIT_JOD,
    depositStatus: 'unpaid',
    tenantStatus: 'pending',
  },
  {
    id: 'tn-3',
    name: 'Hummus Ibu Salma',
    owner: 'Salma Haddad',
    city: 'Irbid — City Center',
    submittedAt: '3 jam lalu',
    photoCount: 3,
    deliveryConfig: { maxKm: 2, zones: 'A, B, C' },
    deposit: DEPOSIT_JOD,
    depositStatus: 'unpaid',
    tenantStatus: 'pending',
  },
]

export const adminMerchants: AdminMerchant[] = [
  {
    id: 'am-1',
    name: 'Warung Sate Pak Ali',
    tenantStatus: 'approved',
    deposit: DEPOSIT_JOD,
    depositStatus: 'held',
    codIssues: 0,
  },
  {
    id: 'am-2',
    name: 'Bakso Pak Kumis',
    tenantStatus: 'suspended',
    deposit: DEPOSIT_JOD,
    depositStatus: 'held',
    codIssues: 1,
  },
  {
    id: 'am-3',
    name: 'Kopi Kenangan Kecil',
    tenantStatus: 'approved',
    deposit: DEPOSIT_JOD,
    depositStatus: 'held',
    codIssues: 3,
  },
]

export const adminDisputes: Dispute[] = [
  {
    id: 'dp-1',
    orderCode: 'SA-1032',
    filedBy: 'customer',
    party: 'Rani',
    merchant: 'Warung Sate Pak Ali',
    category: 'Pesanan tidak sesuai',
    reason: 'Sate yang datang tidak sesuai pesanan, bumbu kacang diganti kecap.',
    photoCount: 2,
    filedAt: '22 menit lalu',
    amount: 3.2,
    status: 'open',
  },
  {
    id: 'dp-2',
    orderCode: 'SA-1028',
    filedBy: 'merchant',
    party: 'Bakso Pak Kumis',
    merchant: 'Bakso Pak Kumis',
    category: 'Bukti pengantaran tidak cocok',
    reason: 'Customer klaim pesanan tidak tiba, padahal foto kurir menunjukkan serah terima.',
    photoCount: 3,
    filedAt: '2 jam lalu',
    amount: 5.5,
    status: 'investigating',
  },
  {
    id: 'dp-3',
    orderCode: 'SA-1019',
    filedBy: 'customer',
    party: 'Sinta',
    merchant: 'Kopi Kenangan Kecil',
    category: 'Jumlah atau item kurang',
    reason: 'Dua gelas hilang dari pesanan.',
    photoCount: 1,
    filedAt: '1 hari lalu',
    amount: 2.8,
    status: 'resolved',
    resolution: 'refund_full',
  },
  {
    id: 'dp-4',
    orderCode: 'SA-1004',
    filedBy: 'customer',
    party: 'Tia',
    merchant: 'Warung Sate Pak Ali',
    category: 'Pesanan belum diterima',
    reason: 'Mengaku belum menerima, tetapi log OTP menunjukkan sudah diverifikasi.',
    photoCount: 0,
    filedAt: '2 hari lalu',
    amount: 1.1,
    status: 'rejected',
    resolution: 'no_action',
  },
]

export const adminLedger: LedgerEntry[] = [
  {
    id: 'led-8',
    at: 'Hari ini 09:12',
    type: 'deposit_hold',
    direction: 'credit',
    amount: DEPOSIT_JOD,
    ref: 'SA-1032',
    memo: 'Deposit COD masuk, menunggu di-hold',
  },
  {
    id: 'led-7',
    at: 'Hari ini 08:55',
    type: 'cod_hold',
    direction: 'debit',
    amount: 2.8,
    ref: 'SA-1039',
    memo: 'Hold COD dibekukan karena order disputed',
  },
  {
    id: 'led-6',
    at: 'Kemarin 21:40',
    type: 'fee',
    direction: 'debit',
    amount: 0.15,
    ref: 'SA-1035',
    memo: 'Fee merchant per order settled',
  },
  {
    id: 'led-5',
    at: 'Kemarin 21:40',
    type: 'settlement',
    direction: 'credit',
    amount: 3.05,
    ref: 'SA-1035',
    memo: 'Settlement order ke wallet merchant',
  },
  {
    id: 'led-4',
    at: 'Kemarin 18:02',
    type: 'refund',
    direction: 'debit',
    amount: 2.8,
    ref: 'SA-1019',
    memo: 'Refund penuh hasil resolusi sengketa',
  },
  {
    id: 'led-3',
    at: 'Kemarin 18:02',
    type: 'protection_fund',
    direction: 'credit',
    amount: 2.8,
    ref: 'SA-1019',
    memo: 'Kasus tanpa pihak bersalah — ditanggung protection fund',
  },
  {
    id: 'led-2',
    at: '2 hari lalu 11:20',
    type: 'cod_hold',
    direction: 'credit',
    amount: 1.1,
    ref: 'SA-1004',
    memo: 'Hold COD order selesai',
  },
  {
    id: 'led-1',
    at: '3 hari lalu 19:45',
    type: 'fee',
    direction: 'debit',
    amount: 0.22,
    ref: 'SA-1021',
    memo: 'Fee customer dipungut saat checkout',
  },
]

export const adminEscalations: AdminEscalation[] = [
  {
    id: 'esc-1',
    orderCode: 'SA-1040',
    merchant: 'Warung Sate Pak Ali',
    detail: 'Kurir lewat SLA Berangkat → Tiba tanpa update checkpoint.',
    minutesLate: 12,
  },
  {
    id: 'esc-2',
    orderCode: 'SA-1039',
    merchant: 'Kopi Kenangan Kecil',
    detail: 'Customer belum menyerahkan OTP, hold belum bisa settle.',
    minutesLate: 6,
  },
]

export function openDisputeCount(disputes: Dispute[]): number {
  return disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length
}

export function pendingTenantCount(tenants: AdminTenant[]): number {
  return tenants.filter((t) => t.tenantStatus === 'pending').length
}

/**
 * Entry ledger yang lahir dari satu putusan sengketa (F8: tiap resolusi = 1
 * entry append-only). `no_action` tidak menghasilkan entry — putusan itu tidak
 * mengubah saldo, jadi tak ada yang bisa dicatat.
 */
export function ledgerEntryFor(
  dispute: Dispute,
  resolution: DisputeResolution,
  percent = 50,
): LedgerEntry | null {
  const base: Omit<LedgerEntry, 'id' | 'type' | 'amount' | 'memo' | 'direction'> = {
    at: 'Baru saja',
    ref: dispute.orderCode,
  }

  switch (resolution) {
    case 'refund_full':
      return {
        ...base,
        id: `led-${dispute.id}-full`,
        type: 'refund',
        direction: 'debit',
        amount: dispute.amount,
        memo: 'Refund penuh hasil resolusi sengketa',
      }
    case 'refund_partial':
      return {
        ...base,
        id: `led-${dispute.id}-partial`,
        type: 'refund',
        direction: 'debit',
        amount: Number(((dispute.amount * percent) / 100).toFixed(2)),
        memo: `Refund sebagian ${percent}% hasil resolusi sengketa`,
      }
    case 'released':
      return {
        ...base,
        id: `led-${dispute.id}-released`,
        type: 'settlement',
        direction: 'credit',
        amount: dispute.amount,
        memo: 'Hold dilepas ke merchant, fee tetap dipotong',
      }
    default:
      return null
  }
}
