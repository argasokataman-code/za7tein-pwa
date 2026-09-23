import type {
  AdminEscalation,
  AdminTenant,
  DepositStatus,
  Dispute,
  DisputeResolution,
  DisputeStatus,
  LedgerEntry,
  LedgerEntryType,
  LedgerParty,
  LedgerPartyKind,
  LiabilitySummary,
  MerchantRecord,
  TenantStatus,
} from '../types'

import { idrToJod } from './currency'
import { DEPOSIT_JOD, merchants } from './merchant'
import { findCustomer } from './people'
import { mockWallet } from './wallet'

/**
 * Panel admin (CS) — data mock.
 *
 * Dasar perilaku: flow F15 (`docs/design/flows/f15-super-admin/`) + F8
 * (`docs/design/flows/f8-dispute/`) dan milestone M6/M9 PRD aktif
 * `irbid-mvp-v2-2026-09-21`. Repo ini front-end saja: approval, resolusi, dan
 * angka liability di sini adalah state yang ditampilkan, bukan logika uang.
 */

/**
 * Nominal konsol admin (CS): angka mock ditulis dalam JOD, tapi ditampilkan
 * sebagai pasangan IDR + JOD (`moneyFromJod`) supaya IDR tetap source of truth
 * dan disclaimernya ikut (R-CURR-01). Lihat `/documentation` bagian 22.
 */
export { idrToJod, jod, money, moneyFromJod } from './currency'

/**
 * Nilai order yang dipakai form sengketa saat cart kosong (mis. halaman dibuka
 * langsung). Bukan angka bisnis — hanya supaya nominal JOD tidak nol di demo.
 */
export const DEMO_DISPUTE_ORDER_IDR = 44000

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

/** Jenis pemilik dana di satu entry ledger, untuk kolom "Pihak". */
export const ledgerPartyLabel: Record<LedgerPartyKind, string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  courier: 'Kurir',
  platform: 'Platform',
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

/**
 * Window pengajuan sengketa (jam) dihitung dari order selesai. Angka 24 jam ada
 * di PRD M6; finalisasi kategori + window menunggu volume (OQ-29), jadi jangan
 * dianggap terkunci.
 */
export const DISPUTE_WINDOW_HOURS = 24

/** Token status order setelah putusan — sama dengan kontrak BE `order.resolved_*`. */
export function resolvedOrderToken(resolution: DisputeResolution): string {
  return `resolved_${resolution === 'no_action' ? 'rejected' : resolution}`
}

/** Empat resolusi F8 beserta efeknya — ditampilkan sebagai catatan tombol. */export const RESOLUTIONS: { id: DisputeResolution; label: string; effect: string }[] = [
  { id: 'refund_full', label: 'Refund penuh', effect: '100% ke customer, fee customer ikut kembali' },
  { id: 'refund_partial', label: 'Refund sebagian', effect: 'X% ke customer, sisanya cair ke merchant' },
  { id: 'released', label: 'Release ke merchant', effect: 'Fee merchant tetap dipotong' },
  { id: 'no_action', label: 'Tolak', effect: 'Tanpa ubah saldo' },
]

/** Label singkat resolusi untuk audit trail SA (huruf kecil, siap tampil). */
export const DISPUTE_RESOLUTION_LABEL: Record<DisputeResolution, string> = {
  refund_full: 'refund penuh',
  refund_partial: 'refund sebagian',
  released: 'release ke merchant',
  no_action: 'tolak',
}

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

/** Saldo wallet demo saat awal — dasar penyelarasan agregat (M9/M11). */
export const DEMO_WALLET_BASE_JOD = idrToJod(mockWallet.balance)

/**
 * Agregat liability diselaraskan dengan wallet demo yang hidup: top-up, hold,
 * settlement, dan payout menggeser porsi customer dengan selisih yang sama.
 * Tanpa ini, layar Ringkasan menampilkan angka statis yang tidak bergerak walau
 * saldo demo naik-turun — dan M11 meminta saldo lintas role sinkron.
 */
export function aggregateLiability(
  base: LiabilitySummary,
  liveWalletIdr: number,
): LiabilitySummary {
  const delta = idrToJod(liveWalletIdr) - DEMO_WALLET_BASE_JOD
  return {
    ...base,
    customerWallets: Math.round((base.customerWallets + delta) * 100) / 100,
  }
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
    deliveryConfig: {
      mode: 'area',
      maxKm: 2,
      isActiveHijazi: true,
      isActiveSyimali: true,
      ongkirIdr: 5000,
    },
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
    deliveryConfig: {
      mode: 'area',
      maxKm: 1.5,
      isActiveHijazi: true,
      isActiveSyimali: false,
      ongkirIdr: 5000,
    },
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
    deliveryConfig: {
      mode: 'area',
      maxKm: 2,
      isActiveHijazi: true,
      isActiveSyimali: true,
      ongkirIdr: 5000,
    },
    deposit: DEPOSIT_JOD,
    depositStatus: 'unpaid',
    tenantStatus: 'pending',
  },
]

/**
 * Merchant aktif di konsol CS — sekarang **registri yang sama** dengan
 * `merchant.ts`, bukan daftar kedua. Dulu di sini ada tiga record `am-*` yang
 * menduplikasi `mockMerchant` tanpa id penghubung.
 */
export const adminMerchants: MerchantRecord[] = merchants

export const adminDisputes: Dispute[] = [
  {
    id: 'dp-1',
    orderCode: 'SA-1032',
    filedBy: 'customer',
    partyId: 'cus-1',
    party: 'Rani',
    customerId: 'cus-1',
    merchantId: 'am-1',
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
    partyId: 'am-2',
    party: 'Bakso Pak Kumis',
    customerId: 'cus-8',
    merchantId: 'am-2',
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
    partyId: 'cus-3',
    party: 'Sinta',
    customerId: 'cus-3',
    merchantId: 'am-3',
    merchant: 'Kopi Kenangan Kecil',
    category: 'Jumlah atau item kurang',
    reason: 'Dua gelas hilang dari pesanan.',
    photoCount: 1,
    filedAt: '1 hari lalu',
    amount: 2.8,
    status: 'resolved',
    resolution: 'refund_full',
    appeal: {
      requestedAt: 'Kemarin 22:10',
      requestedBy: 'merchant',
      note: 'Merchant menilai foto bukti tidak dinilai; minta putusan ditinjau ulang.',
    },
  },
  {
    id: 'dp-4',
    orderCode: 'SA-1004',
    filedBy: 'customer',
    partyId: 'cus-7',
    party: 'Tia',
    customerId: 'cus-7',
    merchantId: 'am-1',
    merchant: 'Warung Sate Pak Ali',
    category: 'Pesanan belum diterima',
    reason: 'Mengaku belum menerima, tetapi log OTP menunjukkan sudah diverifikasi.',
    photoCount: 0,
    filedAt: '2 hari lalu',
    amount: 1.1,
    status: 'rejected',
    resolution: 'no_action',
    appeal: {
      requestedAt: '1 hari lalu',
      requestedBy: 'customer',
      note: 'Customer mengklaim OTP diberikan orang lain di alamat yang sama.',
      verdict: 'upheld',
      decidedAt: 'Kemarin 09:30',
    },
  },
]

export const adminLedger: LedgerEntry[] = [
  {
    id: 'led-8',
    at: 'Hari ini 09:12',
    type: 'deposit_hold',
    direction: 'credit',
    amount: DEPOSIT_JOD,
    party: { kind: 'merchant', id: 'am-1', name: 'Warung Sate Pak Ali' },
    ref: 'SA-1032',
    memo: 'Deposit COD masuk, menunggu di-hold',
  },
  {
    id: 'led-7',
    at: 'Hari ini 08:55',
    type: 'cod_hold',
    direction: 'debit',
    amount: 2.87,
    party: { kind: 'customer', id: 'cus-1', name: 'Rani' },
    ref: 'SA-1041',
    memo: 'Hold COD order yang sedang berjalan (2,87 JOD)',
  },
  {
    id: 'led-6',
    at: 'Kemarin 21:40',
    type: 'fee',
    direction: 'debit',
    amount: 0.15,
    party: { kind: 'merchant', id: 'am-1', name: 'Warung Sate Pak Ali' },
    ref: 'SA-1035',
    memo: 'Fee merchant per order settled',
  },
  {
    id: 'led-5',
    at: 'Kemarin 21:40',
    type: 'settlement',
    direction: 'credit',
    amount: 3.05,
    party: { kind: 'merchant', id: 'am-1', name: 'Warung Sate Pak Ali' },
    ref: 'SA-1035',
    memo: 'Settlement order ke wallet merchant',
  },
  {
    id: 'led-4',
    at: 'Kemarin 18:02',
    type: 'refund',
    direction: 'debit',
    amount: 2.8,
    party: { kind: 'customer', id: 'cus-3', name: 'Sinta' },
    ref: 'SA-1019',
    memo: 'Refund penuh hasil resolusi sengketa',
  },
  {
    id: 'led-3',
    at: 'Kemarin 18:02',
    type: 'protection_fund',
    direction: 'credit',
    amount: 2.8,
    party: { kind: 'platform', id: null, name: 'Protection fund platform' },
    ref: 'SA-1019',
    memo: 'Kasus tanpa pihak bersalah — ditanggung protection fund',
  },
  {
    id: 'led-2',
    at: '2 hari lalu 11:20',
    type: 'cod_hold',
    direction: 'credit',
    amount: 1.1,
    party: { kind: 'customer', id: 'cus-7', name: 'Tia' },
    ref: 'SA-1004',
    memo: 'Hold COD order selesai',
  },
  {
    id: 'led-1',
    at: '3 hari lalu 19:45',
    type: 'fee',
    direction: 'debit',
    amount: 0.22,
    party: { kind: 'customer', id: 'cus-2', name: 'Budi' },
    ref: 'SA-1021',
    memo: 'Fee customer dipungut saat checkout',
  },
]

export const adminEscalations: AdminEscalation[] = [
  {
    id: 'esc-1',
    orderCode: 'SA-1040',
    merchantId: 'am-1',
    merchant: 'Warung Sate Pak Ali',
    detail: 'Kurir lewat SLA Berangkat → Tiba tanpa update checkpoint.',
    minutesLate: 12,
  },
  {
    id: 'esc-2',
    orderCode: 'SA-1039',
    merchantId: 'am-3',
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
 * Pihak customer di satu sengketa. Namanya dibaca dari registri, bukan dari
 * `dispute.party` — `party` adalah nama **pengaju**, dan saat yang mengajukan
 * merchant, nama itu bukan nama customer.
 */
function customerPartyOf(dispute: Dispute): LedgerParty {
  return {
    kind: 'customer',
    id: dispute.customerId,
    name: findCustomer(dispute.customerId)?.name ?? dispute.customerId,
  }
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
    party: { kind: 'merchant', id: dispute.merchantId, name: dispute.merchant },
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
        party: customerPartyOf(dispute),
      }
    case 'refund_partial':
      return {
        ...base,
        id: `led-${dispute.id}-partial`,
        type: 'refund',
        direction: 'debit',
        amount: Number(((dispute.amount * percent) / 100).toFixed(2)),
        memo: `Refund sebagian ${percent}% hasil resolusi sengketa`,
        party: customerPartyOf(dispute),
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
