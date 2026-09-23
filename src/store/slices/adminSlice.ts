import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  adminDisputes as seedDisputes,
  adminEscalations as seedEscalations,
  adminLedger as seedLedger,
  adminMerchants as seedMerchants,
  adminTenants as seedTenants,
  ledgerEntryFor,
  mockLiability,
} from '../../data/admin'
import type {
  AdminEscalation,
  AppealVerdict,
  AdminMerchant,
  AdminTenant,
  Dispute,
  DisputeResolution,
  LedgerEntry,
  LiabilitySummary,
} from '../../types'

interface AdminState {
  tenants: AdminTenant[]
  merchants: AdminMerchant[]
  disputes: Dispute[]
  ledger: LedgerEntry[]
  liability: LiabilitySummary
  escalations: AdminEscalation[]
  /** `customer.riskFlag` — sisi kedua blacklist COD, wajib bareng merchant (F15). */
  customerRiskFlags: { id: string; name: string }[]
}

const initialState: AdminState = {
  tenants: seedTenants,
  merchants: seedMerchants,
  disputes: seedDisputes,
  ledger: seedLedger,
  liability: mockLiability,
  escalations: seedEscalations,
  customerRiskFlags: [],
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    /**
     * Approve deposit = verifikasi transfer masuk dulu: `unpaid → held`, baru
     * `tenantStatus: approved`. Merchant aktif lalu masuk daftar pantau.
     */
    approveDeposit(state, action: PayloadAction<{ id: string }>) {
      const tenant = state.tenants.find((t) => t.id === action.payload.id)
      if (!tenant || tenant.depositStatus !== 'unpaid') return
      tenant.depositStatus = 'held'
      tenant.tenantStatus = 'approved'
      state.merchants.push({
        id: `am-${tenant.id}`,
        name: tenant.name,
        tenantStatus: 'approved',
        deposit: tenant.deposit,
        depositStatus: 'held',
        codIssues: 0,
      })
    },
    /** Onboarding ditolak → `tenantStatus: suspended`, merchant tidak aktif. */
    rejectOnboarding(state, action: PayloadAction<{ id: string }>) {
      const tenant = state.tenants.find((t) => t.id === action.payload.id)
      if (tenant) tenant.tenantStatus = 'suspended'
    },
    suspendMerchant(state, action: PayloadAction<{ id: string }>) {
      const merchant = state.merchants.find((m) => m.id === action.payload.id)
      if (merchant) merchant.tenantStatus = 'suspended'
    },
    /**
     * Blacklist COD menandai DUA sisi sekaligus: merchant `blacklisted` dan
     * `customer.riskFlag: true`. Keduanya dibutuhkan untuk memblokir checkout COD.
     */
    blacklistCod(state, action: PayloadAction<{ id: string; customerName: string }>) {
      const merchant = state.merchants.find((m) => m.id === action.payload.id)
      if (merchant) merchant.tenantStatus = 'blacklisted'
      state.customerRiskFlags.push({
        id: `rf-${action.payload.id}`,
        name: action.payload.customerName,
      })
    },
    startInvestigation(state, action: PayloadAction<{ id: string }>) {
      const dispute = state.disputes.find((d) => d.id === action.payload.id)
      if (dispute) dispute.status = 'investigating'
    },
    /**
     * Putusan panel CS. Refund/release menambah satu entry ledger append-only (F8);
     * `no_action` tidak menambah entry karena tidak mengubah saldo.
     */
    resolveDispute(
      state,
      action: PayloadAction<{ id: string; resolution: DisputeResolution; percent?: number }>,
    ) {
      const dispute = state.disputes.find((d) => d.id === action.payload.id)
      if (!dispute) return
      const { resolution, percent } = action.payload
      dispute.resolution = resolution
      dispute.partialPercent = resolution === 'refund_partial' ? (percent ?? 50) : undefined
      dispute.status = resolution === 'no_action' ? 'rejected' : 'resolved'
      const entry = ledgerEntryFor(dispute, resolution, percent)
      if (entry) state.ledger.unshift(entry)
    },
    /** Form "Ajukan Sengketa" dari sisi customer/merchant masuk ke queue panel CS. */
    fileDispute(state, action: PayloadAction<Omit<Dispute, 'id' | 'status' | 'filedAt'>>) {
      state.disputes.unshift({
        ...action.payload,
        id: `dp-${Date.now()}`,
        status: 'open',
        filedAt: 'Baru saja',
      })
    },
    /** Alert SLA ditindak (chase merchant / cancel / refund) — keluar dari antrean. */
    clearEscalation(state, action: PayloadAction<{ id: string }>) {
      state.escalations = state.escalations.filter((e) => e.id !== action.payload.id)
    },
    /**
     * Putusan banding SA atas putusan level-1 CS. `upheld` menguatkan putusan CS
     * tanpa mengubah saldo; `overturned` mengganti resolusi dan menambah satu
     * entry ledger baru (append-only — putusan lama tidak dihapus).
     */
    decideAppeal(
      state,
      action: PayloadAction<{ id: string; verdict: AppealVerdict; resolution?: DisputeResolution }>,
    ) {
      const dispute = state.disputes.find((d) => d.id === action.payload.id)
      if (!dispute || !dispute.appeal || dispute.appeal.verdict) return
      dispute.appeal.verdict = action.payload.verdict
      dispute.appeal.decidedAt = 'Baru saja'
      if (action.payload.verdict === 'overturned' && action.payload.resolution) {
        dispute.resolution = action.payload.resolution
        dispute.status = action.payload.resolution === 'no_action' ? 'rejected' : 'resolved'
        const entry = ledgerEntryFor(dispute, action.payload.resolution)
        if (entry) state.ledger.unshift({ ...entry, id: `${entry.id}-appeal` })
      }
    },
  },
})

export const {
  approveDeposit,
  rejectOnboarding,
  suspendMerchant,
  blacklistCod,
  startInvestigation,
  resolveDispute,
  fileDispute,
  clearEscalation,
  decideAppeal,
} = adminSlice.actions
export default adminSlice.reducer
