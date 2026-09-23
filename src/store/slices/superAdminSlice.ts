import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  SA_CURRENT_ACTOR,
  mockProfit,
  mockSwitches,
  profitBalance,
  saAuditLog,
  saOperators,
  saRoles,
  saZoneGeometry,
  switchMeta,
} from '../../data/superadmin'
import type {
  AuditEntry,
  AuditKind,
  PlatformSwitches,
  ProfitState,
  SaOperator,
  SaRole,
  ZoneGeometry,
} from '../../types'

interface SuperAdminState {
  zones: ZoneGeometry[]
  roles: SaRole[]
  operators: SaOperator[]
  audit: AuditEntry[]
  profit: ProfitState
  switches: PlatformSwitches
}

const initialState: SuperAdminState = {
  zones: saZoneGeometry,
  roles: saRoles,
  operators: saOperators,
  audit: saAuditLog,
  profit: mockProfit,
  switches: mockSwitches,
}

/**
 * Catat satu aksi ke audit trail. Semua aksi konsol lewat sini supaya tidak ada
 * jalur yang lolos dari pengawasan (keputusan PO 2026-09-23). Aksi CS masuk
 * lewat `logAudit` yang dikirim jembatan audit di `src/store/index.ts`.
 */
function push(
  state: SuperAdminState,
  actor: { name: string; role: 'sa' | 'cs' },
  kind: AuditKind,
  action: string,
  target: string,
) {
  state.audit.unshift({
    id: `au-${Date.now()}-${state.audit.length}`,
    at: 'Baru saja',
    actor: actor.name,
    actorRole: actor.role,
    kind,
    action,
    target,
  })
}

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {
    /** Simpan poligon zona hasil geser titik (master zona milik SA). */
    saveZone(state, action: PayloadAction<{ id: ZoneGeometry['id']; vertices: ZoneGeometry['vertices'] }>) {
      const zone = state.zones.find((z) => z.id === action.payload.id)
      if (!zone) return
      zone.vertices = action.payload.vertices
      push(state, SA_CURRENT_ACTOR, 'zone', 'Simpan poligon zona', `${zone.label} — ${zone.note}`)
    },
    resetZone(state, action: PayloadAction<{ id: ZoneGeometry['id'] }>) {
      const zone = state.zones.find((z) => z.id === action.payload.id)
      const seed = saZoneGeometry.find((z) => z.id === action.payload.id)
      if (!zone || !seed) return
      zone.vertices = seed.vertices
      push(state, SA_CURRENT_ACTOR, 'zone', 'Kembalikan poligon ke bentuk awal', zone.label)
    },
    /**
     * Cabut/beri satu izin pada sebuah role. Role pemilik platform (`locked`)
     * tidak bisa diubah dari UI — kalau bisa, satu klik salah akan mengunci
     * seluruh konsol.
     */
    togglePermission(state, action: PayloadAction<{ roleId: string; permissionId: string }>) {
      const role = state.roles.find((r) => r.id === action.payload.roleId)
      if (!role || role.locked) return
      const { permissionId } = action.payload
      const has = role.permissionIds.includes(permissionId)
      role.permissionIds = has
        ? role.permissionIds.filter((id) => id !== permissionId)
        : [...role.permissionIds, permissionId]
      push(
        state,
        SA_CURRENT_ACTOR,
        'role',
        has ? 'Cabut izin dari role' : 'Beri izin ke role',
        `${role.name} — ${permissionId}`,
      )
    },
    /** Akun operator (termasuk operator CS) dibuat SA, bukan self-service (OQ-30). */
    addOperator(state, action: PayloadAction<{ name: string; contact: string; roleId: string }>) {
      const role = state.roles.find((r) => r.id === action.payload.roleId)
      if (!role) return
      state.operators.push({
        id: `op-${Date.now()}`,
        name: action.payload.name,
        contact: action.payload.contact,
        roleId: role.id,
        createdAt: 'Baru saja',
        status: 'invited',
      })
      push(state, SA_CURRENT_ACTOR, 'operator', 'Buat akun operator', `${action.payload.name} — ${role.name}`)
    },
    setOperatorStatus(state, action: PayloadAction<{ id: string; status: SaOperator['status'] }>) {
      const operator = state.operators.find((o) => o.id === action.payload.id)
      if (!operator) return
      operator.status = action.payload.status
      push(
        state,
        SA_CURRENT_ACTOR,
        'operator',
        action.payload.status === 'active' ? 'Aktifkan operator' : 'Nonaktifkan operator',
        operator.name,
      )
    },
    /**
     * Tarik saldo keuntungan platform — satu-satunya dana yang boleh ditarik SA.
     * Saldo customer/merchant/tips tidak pernah masuk hitungan ini.
     */
    withdrawProfit(state, action: PayloadAction<{ amountJod: number; method: string }>) {
      const { amountJod, method } = action.payload
      const balance = profitBalance(state.profit)
      if (amountJod <= 0 || amountJod > balance) return
      state.profit.withdrawals.unshift({
        id: `pw-${Date.now()}`,
        at: 'Baru saja',
        amountJod,
        method,
        status: 'processing',
      })
      push(state, SA_CURRENT_ACTOR, 'profit', 'Tarik saldo keuntungan platform', `${amountJod} JOD`)
    },
    toggleSwitch(state, action: PayloadAction<{ key: keyof PlatformSwitches }>) {
      const { key } = action.payload
      state.switches[key] = !state.switches[key]
      const label = switchMeta.find((meta) => meta.key === key)?.label ?? key
      push(
        state,
        SA_CURRENT_ACTOR,
        'switch',
        state.switches[key] ? 'Nyalakan jalur' : 'Hentikan jalur',
        label,
      )
    },
    /**
     * Dipakai jembatan audit untuk aksi panel CS (`/admin/*`), supaya kerja CS
     * ikut terekam tanpa mengubah satu per satu halaman CS. `role` diisi `sa`
     * untuk aksi yang dijalankan SA lewat slice CS (mis. putusan banding).
     */
    logAudit(
      state,
      action: PayloadAction<{
        actor: string
        role?: 'sa' | 'cs'
        kind: AuditKind
        action: string
        target: string
      }>,
    ) {
      push(
        state,
        { name: action.payload.actor, role: action.payload.role ?? 'cs' },
        action.payload.kind,
        action.payload.action,
        action.payload.target,
      )
    },
  },
})

export const {
  saveZone,
  resetZone,
  togglePermission,
  addOperator,
  setOperatorStatus,
  withdrawProfit,
  toggleSwitch,
  logAudit,
} = superAdminSlice.actions
export default superAdminSlice.reducer

export type { SuperAdminState, SaRole }
