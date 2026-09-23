import type {
  AdminEscalation,
  Courier,
  CustomerRiskFlag,
  Dispute,
  LedgerEntry,
  LedgerPartyKind,
  MerchantOrder,
  MerchantRecord,
} from '../types'

import { adminDisputes, adminLedger } from './admin'
import { courierTasks } from './courier'
import { merchants } from './merchant'
import { merchantOrders } from './merchantOrders'
import { customers } from './people'

/**
 * Turunan lintas modul untuk registri pengguna.
 *
 * Semua pertanyaan "berapa ... untuk orang ini" ada di sini, bukan di JSX —
 * satu tempat yang bisa diperiksa, dan halaman hanya menampilkan hasilnya
 * (AGENTS.md §11). Semuanya fungsi murni: menerima daftar, mengembalikan angka
 * atau nama, tanpa menyentuh store.
 *
 * Sebelum registri ini ada, pertanyaan-pertanyaan itu mustahil dijawab: order
 * hanya menyimpan `customerName`, sengketa hanya menyimpan nama pihak, dan
 * ledger tidak menyimpan pihak sama sekali.
 */

/** Jumlah order milik satu customer. */
export function orderCountFor(orders: MerchantOrder[], customerId: string): number {
  return orders.filter((order) => order.customerId === customerId).length
}

/** Jumlah sengketa yang menyangkut satu customer — termasuk yang diajukan merchant. */
export function disputeCountForCustomer(disputes: Dispute[], customerId: string): number {
  return disputes.filter((dispute) => dispute.customerId === customerId).length
}

/** Sengketa yang menimpa satu merchant — termasuk yang diajukan customer. */
export function disputesForMerchant(disputes: Dispute[], merchantId: string): Dispute[] {
  return disputes.filter((dispute) => dispute.merchantId === merchantId)
}

/** Jumlah sengketa yang menimpa satu merchant — termasuk yang diajukan customer. */
export function disputeCountAsMerchant(disputes: Dispute[], merchantId: string): number {
  return disputesForMerchant(disputes, merchantId).length
}

/** Entry ledger milik satu pihak — daftarnya, bukan cuma jumlahnya. */
export function ledgerForParty(
  ledger: LedgerEntry[],
  kind: LedgerPartyKind,
  id: string,
): LedgerEntry[] {
  return ledger.filter((entry) => entry.party.kind === kind && entry.party.id === id)
}

/** Jumlah entry ledger yang menyebut satu pihak. */
export function ledgerCountFor(
  ledger: LedgerEntry[],
  kind: LedgerPartyKind,
  id: string,
): number {
  return ledgerForParty(ledger, kind, id).length
}

/** Kurir yang dipekerjakan satu merchant. */
export function couriersForMerchant(all: Courier[], merchantId: string): Courier[] {
  return all.filter((courier) => courier.merchantId === merchantId)
}

/** Jumlah kurir milik satu merchant. */
export function courierCountFor(all: Courier[], merchantId: string): number {
  return couriersForMerchant(all, merchantId).length
}

/** Alert SLA yang naik ke SA untuk satu merchant. */
export function escalationsForMerchant(
  all: AdminEscalation[],
  merchantId: string,
): AdminEscalation[] {
  return all.filter((escalation) => escalation.merchantId === merchantId)
}

/** Nama merchant dari registri; `null` kalau id-nya menggantung. */
export function merchantNameFor(all: MerchantRecord[], id: string): string | null {
  return all.find((merchant) => merchant.id === id)?.name ?? null
}

/** Customer punya flag risiko aktif? Flag-nya hidup di store, bukan di registri. */
export function hasRiskFlag(flags: CustomerRiskFlag[], customerId: string): boolean {
  return flags.some((flag) => flag.customerId === customerId)
}

/**
 * Rujukan id yang menggantung: order/ledger/sengketa/kurir yang menunjuk
 * customer atau merchant yang tidak ada di registri.
 *
 * Ini satu-satunya pemeriksaan untuk model ini, dan memang perlu: begitu
 * rujukan antar-modul pindah dari nama ke id, salah ketik satu id tidak lagi
 * memunculkan nama yang salah — ia memunculkan sel kosong yang senyap.
 */
export function danglingReferences(): string[] {
  const customerIds = new Set(customers.map((customer) => customer.id))
  const merchantIds = new Set(merchants.map((merchant) => merchant.id))
  const problems: string[] = []

  for (const order of merchantOrders) {
    if (!customerIds.has(order.customerId)) {
      problems.push(`MerchantOrder ${order.code}: customerId ${order.customerId} tidak ada`)
    }
  }
  for (const task of courierTasks) {
    if (!customerIds.has(task.customerId)) {
      problems.push(`CourierTask ${task.code}: customerId ${task.customerId} tidak ada`)
    }
  }
  for (const dispute of adminDisputes) {
    if (!customerIds.has(dispute.customerId)) {
      problems.push(`Dispute ${dispute.id}: customerId ${dispute.customerId} tidak ada`)
    }
    if (!customerIds.has(dispute.partyId) && !merchantIds.has(dispute.partyId)) {
      problems.push(`Dispute ${dispute.id}: partyId ${dispute.partyId} tidak ada`)
    }
    if (!merchantIds.has(dispute.merchantId)) {
      problems.push(`Dispute ${dispute.id}: merchantId ${dispute.merchantId} tidak ada`)
    }
  }
  for (const entry of adminLedger) {
    const { kind, id } = entry.party
    if (kind === 'platform') continue
    if (kind === 'merchant' && id && !merchantIds.has(id)) {
      problems.push(`LedgerEntry ${entry.id}: merchant ${id} tidak ada`)
    }
    if (kind === 'customer' && id && !customerIds.has(id)) {
      problems.push(`LedgerEntry ${entry.id}: customer ${id} tidak ada`)
    }
  }

  return problems
}

// ponytail: pemeriksaan dev saja — di produksi daftarnya konstan dan sudah
// lewat build, jadi tidak ada gunanya dihitung ulang tiap kali modul dimuat.
if (import.meta.env.DEV) {
  const problems = danglingReferences()
  if (problems.length > 0) {
    console.error(`[registri] ${problems.length} rujukan id menggantung:\n${problems.join('\n')}`)
  }
}
