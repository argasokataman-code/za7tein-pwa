import type {
  AuditEntry,
  PlatformSwitches,
  ProfitState,
  SaOperator,
  SaPermission,
  SaRole,
  TaxReportRow,
} from '../types'

import { GST_FOOD_PERCENT, PLATFORM_FEE_JOD, PLATFORM_GST_PERCENT } from './merchant'

/**
 * Konsol Super Admin (role terpisah, website penuh non-PWA, prefix
 * `/superadmin`), data mock.
 *
 * Dasar: keputusan PO 2026-09-23 (`docs/product/prd/decision-irbid-mvp.md`)
 * yang menetapkan cakupan SA: master zona, role & permission, audit trail,
 * laporan pajak, saldo keuntungan platform, kill switch, monitoring ledger,
 * dan banding sengketa. Repo ini front-end saja, semua angka di sini adalah
 * state yang ditampilkan, bukan logika uang atau pajak (AGENTS.md §1).
 */

/** Pembulatan dua desimal untuk nominal JOD di data mock. */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * PPh final atas fee platform, 0,5% (keputusan PO 2026-09-23). Angka tarif
 * final menunggu konsultan pajak (OQ-17/18), jadi ini dipakai sebagai
 * placeholder yang berlabel, bukan tarif aktif.
 */
export const PPH_FINAL_PERCENT = 0.5

/**
 * Operator yang sedang membuka konsol. Di produksi ini datang dari sesi auth;
 * repo ini tidak punya auth sungguhan (AGENTS.md §1), jadi satu nama tetap.
 */
export const SA_CURRENT_ACTOR = { name: 'Nadia Haddad', role: 'sa' as const }

/**
 * Operator CS yang menjalankan panel `/admin/*`. Dipakai jembatan audit:
 * aksi CS ikut tercatat di audit trail SA tanpa mengubah halaman CS satu per
 * satu. Sama seperti SA, ini mock, repo ini tanpa auth (AGENTS.md §1).
 */
export const CS_CURRENT_ACTOR = { name: 'Dina Khoury', role: 'cs' as const }

// ── Role & permission ───────────────────────────────────────────────────────

export const saPermissions: SaPermission[] = [
  { id: 'zone.edit', label: 'Ubah poligon master zona', group: 'platform' },
  { id: 'role.manage', label: 'Kelola role & permission', group: 'platform' },
  { id: 'operator.manage', label: 'Buat & nonaktifkan operator', group: 'platform' },
  { id: 'audit.read', label: 'Baca audit trail', group: 'platform' },
  { id: 'tax.read', label: 'Baca laporan pajak', group: 'platform' },
  { id: 'profit.read', label: 'Lihat saldo keuntungan', group: 'platform' },
  { id: 'profit.withdraw', label: 'Tarik saldo keuntungan', group: 'platform' },
  { id: 'switch.toggle', label: 'Ubah kill switch', group: 'platform' },
  { id: 'ledger.read', label: 'Pantau ledger (read-only)', group: 'platform' },
  { id: 'user.read', label: 'Lihat registri pengguna', group: 'platform' },
  { id: 'tenant.status', label: 'Suspend & aktifkan kembali tenant', group: 'platform' },
  { id: 'appeal.decide', label: 'Putuskan banding sengketa', group: 'platform' },
  { id: 'tenant.approve', label: 'Setujui tenant & deposit', group: 'operasi' },
  { id: 'tenant.reject', label: 'Tolak / suspend tenant', group: 'operasi' },
  { id: 'dispute.level1', label: 'Putusan sengketa level-1', group: 'operasi' },
  { id: 'cod.blacklist', label: 'Blacklist COD', group: 'operasi' },
  { id: 'liability.read', label: 'Lihat dashboard liability', group: 'operasi' },
  { id: 'escalate.handle', label: 'Tindak alert SLA', group: 'operasi' },
]

const ALL_SA = saPermissions.filter((p) => p.group === 'platform').map((p) => p.id)
const ALL_CS = saPermissions.filter((p) => p.group === 'operasi').map((p) => p.id)

export const saRoles: SaRole[] = [
  {
    id: 'owner',
    name: 'Pemilik platform',
    scope: 'sa',
    permissionIds: ALL_SA,
    locked: true,
  },
  {
    id: 'sa_ops',
    name: 'Staf SA',
    scope: 'sa',
    permissionIds: ['zone.edit', 'audit.read', 'tax.read', 'profit.read', 'ledger.read', 'user.read'],
    locked: false,
  },
  {
    id: 'cs_lead',
    name: 'Koordinator CS',
    scope: 'cs',
    permissionIds: [...ALL_CS],
    locked: false,
  },
  {
    id: 'cs_agent',
    name: 'Agen CS',
    scope: 'cs',
    permissionIds: ['liability.read', 'escalate.handle'],
    locked: false,
  },
]

export const saOperators: SaOperator[] = [
  {
    id: 'op-1',
    name: 'Nadia Haddad',
    contact: 'nadia@sa7tein.app',
    roleId: 'owner',
    createdAt: '12 hari lalu',
    status: 'active',
  },
  {
    id: 'op-2',
    name: 'Rami Odeh',
    contact: 'rami@sa7tein.app',
    roleId: 'sa_ops',
    createdAt: '6 hari lalu',
    status: 'active',
  },
  {
    id: 'op-3',
    name: 'Dina Khoury',
    contact: 'dina@sa7tein.app',
    roleId: 'cs_lead',
    createdAt: '9 hari lalu',
    status: 'active',
  },
  {
    id: 'op-4',
    name: 'Faisal Aziz',
    contact: 'faisal@sa7tein.app',
    roleId: 'cs_agent',
    createdAt: '2 hari lalu',
    status: 'invited',
  },
]

export const operatorStatusLabel: Record<SaOperator['status'], string> = {
  active: 'Aktif',
  invited: 'Diundang',
  suspended: 'Nonaktif',
}

/**
 * Izin yang dibutuhkan tiap rute konsol. Dipakai dua tempat: nav menyembunyikan
 * (menonaktifkan) menu yang tidak boleh dibuka, dan shell menolak merender
 * halaman kalau URL-nya diketik langsung. Satu peta, supaya nav dan gate tidak
 * pernah berbeda pendapat.
 *
 * Ringkasan tidak butuh izin: semua operator SA boleh melihat keadaan platform.
 */
export const SA_ROUTE_PERMISSIONS: Record<string, string> = {
  '/': '',
  '/zones': 'zone.edit',
  '/roles': 'role.manage',
  '/audit': 'audit.read',
  '/tax': 'tax.read',
  '/profit': 'profit.read',
  '/ledger': 'ledger.read',
  '/users': 'user.read',
  '/appeals': 'appeal.decide',
  '/switches': 'switch.toggle',
}

/** Izin yang dimiliki sebuah role. */
export function roleHasPermission(role: SaRole | null, permissionId: string): boolean {
  if (!permissionId) return true
  return role?.permissionIds.includes(permissionId) ?? false
}

/** Label izin siap tampil, untuk menjelaskan kenapa sebuah menu dikunci. */
export function permissionLabel(permissionId: string): string {
  return saPermissions.find((permission) => permission.id === permissionId)?.label ?? permissionId
}

/** Operator yang boleh dipakai sebagai aktor konsol SA (scope `sa` saja). */
export function saActors(operators: SaOperator[], roles: SaRole[]): SaOperator[] {
  return operators.filter(
    (operator) => operator.status === 'active' && roleForOperator(roles, operator)?.scope === 'sa',
  )
}

/** Role yang menentukan izin sebuah operator; `null` kalau role tak dikenal. */
export function roleForOperator(roles: SaRole[], operator: SaOperator): SaRole | null {
  return roles.find((r) => r.id === operator.roleId) ?? null
}

// ── Audit trail ─────────────────────────────────────────────────────────────

export const auditKindLabel: Record<AuditEntry['kind'], string> = {
  onboarding: 'Onboarding',
  dispute: 'Sengketa',
  merchant: 'Merchant',
  zone: 'Zona',
  role: 'Role',
  operator: 'Operator',
  tax: 'Pajak',
  profit: 'Keuntungan',
  switch: 'Kill switch',
  escalate: 'Eskalasi SLA',
}

/**
 * Seed audit trail. Aksi CS ikut tercatat, SA mengawasi kerja CS lewat jalur
 * ini (keputusan PO 2026-09-23). Aksi baru ditambahkan oleh reducer saat
 * operator memakai konsol, lewat jembatan audit di `src/store/index.ts`.
 */
export const saAuditLog: AuditEntry[] = [
  {
    id: 'au-1',
    at: 'Hari ini 09:41',
    actor: "Nadia Haddad",
    actorId: 'op-1',
    actorRole: 'sa',
    kind: 'switch',
    action: 'Kembalikan jalur payout ke normal',
    target: 'Payout merchant & customer',
  },
  {
    id: 'au-2',
    at: 'Hari ini 09:12',
    actor: "Dina Khoury",
    actorId: 'op-3',
    actorRole: 'cs',
    kind: 'onboarding',
    action: 'Setujui deposit tenant, status jadi Aktif',
    target: 'Nasi Goreng Pak Kumis',
  },
  {
    id: 'au-3',
    at: 'Kemarin 21:40',
    actor: "Dina Khoury",
    actorId: 'op-3',
    actorRole: 'cs',
    kind: 'dispute',
    action: 'Putusan level-1: refund penuh',
    target: 'SA-1019',
  },
  {
    id: 'au-4',
    at: 'Kemarin 18:02',
    actor: "Rami Odeh",
    actorId: 'op-2',
    actorRole: 'sa',
    kind: 'zone',
    action: 'Simpan poligon zona',
    target: 'Syimali, utara kampus',
  },
  {
    id: 'au-5',
    at: '2 hari lalu 11:20',
    actor: "Nadia Haddad",
    actorId: 'op-1',
    actorRole: 'sa',
    kind: 'profit',
    action: 'Tarik saldo keuntungan platform',
    target: '40,00 JOD → rekening platform',
  },
  {
    id: 'au-6',
    at: '2 hari lalu 10:05',
    actor: "Nadia Haddad",
    actorId: 'op-1',
    actorRole: 'sa',
    kind: 'operator',
    action: 'Buat akun operator CS',
    target: 'Faisal Aziz, Agen CS',
  },
  {
    id: 'au-7',
    at: '3 hari lalu 16:30',
    actor: "Rami Odeh",
    actorId: 'op-2',
    actorRole: 'sa',
    kind: 'role',
    action: 'Cabut izin tarik saldo dari Staf SA',
    target: 'Staf SA',
  },
  {
    id: 'au-8',
    at: '4 hari lalu 19:45',
    actor: "Dina Khoury",
    actorId: 'op-3',
    actorRole: 'cs',
    kind: 'merchant',
    action: 'Blacklist COD merchant',
    target: 'Kopi Kenangan Kecil',
  },
]

// ── Laporan pajak ───────────────────────────────────────────────────────────

/** Fee platform terkumpul dari sejumlah order (0,37 JOD/order). */
export function feeGrossFor(orders: number): number {
  return round2(orders * PLATFORM_FEE_JOD)
}

/** GST atas objek fee platform (16%), info, belum dipungut (OQ-17). */
export function gstOnFeeFor(feeGrossJod: number): number {
  return round2((feeGrossJod * PLATFORM_GST_PERCENT) / 100)
}

/** PPh final 0,5% atas fee platform. */
export function pphFinalFor(feeGrossJod: number): number {
  return round2((feeGrossJod * PPH_FINAL_PERCENT) / 100)
}

/** GST makanan yang ditanggung merchant atas penjualan (info-only, M7). */
export function gstFoodFor(salesIdr: number): number {
  return Math.round((salesIdr * GST_FOOD_PERCENT) / 100)
}

const TAX_PERIODS: { period: string; orders: number; salesIdr: number }[] = [
  { period: '2026-06', orders: 412, salesIdr: 27_192_000 },
  { period: '2026-07', orders: 538, salesIdr: 35_508_000 },
  { period: '2026-08', orders: 611, salesIdr: 40_326_000 },
  { period: '2026-09 (berjalan)', orders: 187, salesIdr: 12_342_000 },
]

export const taxReports: TaxReportRow[] = TAX_PERIODS.map((row) => {
  const feeGrossJod = feeGrossFor(row.orders)
  return {
    ...row,
    feeGrossJod,
    gstOnFeeJod: gstOnFeeFor(feeGrossJod),
    pphFinalJod: pphFinalFor(feeGrossJod),
  }
})

/** Total fee platform yang sudah terkumpul dari semua periode laporan. */
export function totalFeeGross(rows: TaxReportRow[]): number {
  return round2(rows.reduce((sum, row) => sum + row.feeGrossJod, 0))
}

// ── Saldo keuntungan platform ───────────────────────────────────────────────

/**
 * Saldo keuntungan platform: fee terkumpul dikurangi biaya operasional, PPh
 * final, dan penarikan sebelumnya. Ini **satu-satunya** dana yang boleh ditarik
 * SA, saldo customer/merchant/tips tetap liability (keputusan PO 2026-09-23).
 */
export const mockProfit: ProfitState = {
  feeGrossJod: totalFeeGross(taxReports),
  costJod: 82.4,
  pphFinalJod: pphFinalFor(totalFeeGross(taxReports)),
  withdrawals: [
    {
      id: 'pw-2',
      at: '2 hari lalu',
      amountJod: 40,
      method: 'Rekening platform · IDR',
      status: 'processing',
    },
    {
      id: 'pw-1',
      at: '12 hari lalu',
      amountJod: 25,
      method: 'Rekening platform · IDR',
      status: 'settled',
    },
  ],
}

export function withdrawnTotal(profit: ProfitState): number {
  return round2(profit.withdrawals.reduce((sum, w) => sum + w.amountJod, 0))
}

/** Saldo keuntungan yang bisa ditarik sekarang. */
export function profitBalance(profit: ProfitState): number {
  return round2(
    profit.feeGrossJod - profit.costJod - profit.pphFinalJod - withdrawnTotal(profit),
  )
}

// ── Kill switch ─────────────────────────────────────────────────────────────

/** `true` = jalur normal hidup. Maintenance memblokir semua order baru. */
export const mockSwitches: PlatformSwitches = {
  cod: true,
  payout: true,
  maintenance: false,
}

/**
 * Apakah jalur ini sedang **dihentikan**. Untuk COD dan payout, `true` berarti
 * jalur normal hidup sehingga "berhenti" = `false`. Maintenance dibalik: `true`
 * justru berarti maintenance aktif. Helper ini yang menyatukan keduanya supaya
 * layar tidak menghitung sendiri-sendiri dan salah (pernah terbalik).
 */
export function switchIsDown(key: keyof PlatformSwitches, switches: PlatformSwitches): boolean {
  return key === 'maintenance' ? switches[key] : !switches[key]
}

/**
 * Alasan sebuah jalur ditutup, siap ditampilkan di layar role lain. `null` kalau
 * jalur hidup. Teksnya menyebut apa yang harus dilakukan pengguna, bukan sekadar
 * "tidak tersedia", supaya layar yang terblokir tetap memberi jalan keluar.
 */
export const SWITCH_BLOCK_COPY: Record<keyof PlatformSwitches, string> = {
  cod: 'COD sedang dihentikan sementara. Pilih Saldo Sa7tein atau transfer manual.',
  payout: 'Pencairan saldo sedang ditahan platform. Coba lagi nanti.',
  maintenance: 'Platform sedang maintenance. Order baru belum bisa dibuat.',
}

/** Alasan blokir untuk sebuah jalur, atau `null` kalau jalurnya hidup. */
export function switchBlockCopy(
  key: keyof PlatformSwitches,
  switches: PlatformSwitches,
): string | null {
  return switchIsDown(key, switches) ? SWITCH_BLOCK_COPY[key] : null
}

/** Label status siap tampil untuk sebuah jalur. */
export function switchStatusLabel(key: keyof PlatformSwitches, switches: PlatformSwitches): string {
  const meta = switchMeta.find((item) => item.key === key)
  if (!meta) return ''
  return switches[key] ? meta.onLabel : meta.offLabel
}

export const switchMeta: {
  key: keyof PlatformSwitches
  label: string
  onLabel: string
  offLabel: string
  detail: string
  destructive: boolean
}[] = [
  {
    key: 'cod',
    label: 'Pesanan COD',
    onLabel: 'COD hidup',
    offLabel: 'COD dihentikan',
    detail: 'Kalau dimatikan, checkout COD diblokir dan customer diarahkan ke wallet atau transfer.',
    destructive: true,
  },
  {
    key: 'payout',
    label: 'Pencairan saldo',
    onLabel: 'Payout hidup',
    offLabel: 'Payout dihentikan',
    detail: 'Kalau dimatikan, penarikan saldo customer & merchant ditahan sampai dinyalakan lagi.',
    destructive: true,
  },
  {
    key: 'maintenance',
    label: 'Mode maintenance',
    onLabel: 'Mode maintenance aktif',
    offLabel: 'Mode maintenance mati',
    detail: 'Kalau dinyalakan, order baru ditolak semua role; order berjalan tetap bisa diselesaikan.',
    destructive: true,
  },
]
