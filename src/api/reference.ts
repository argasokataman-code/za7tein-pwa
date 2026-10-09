/**
 * Baca tabel referensi PostgREST → tipe domain repo ini — pola sama dengan
 * `catalog.ts`/`orders.ts` (mock dulu, API menimpa).
 *
 * Tabel milik pengguna dijaga RLS: anon mengembalikan **nol baris**, jadi baca
 * memakai sesi akun demo `cs@` yang punya akses lintas entitas. Token dikirim
 * eksplisit lewat `restWith`/`patch` supaya tidak menimpa token global milik
 * `orders.ts` (dua login paralel tidak boleh saling menghapus).
 *
 * Nilai backend dalam JOD (`*_jod`); repo ini menyimpan IDR (R-CURR-01), jadi
 * konversi lewat `jodToIdr` sekali di sini.
 */
import { jodToIdr } from '../data/currency'
import type {
  Courier,
  MerchantCreditEvent,
  MerchantCreditEventName,
  MerchantCreditState,
  PlatformSwitches,
  RebateTier,
  SaOperator,
  SaRole,
  Wallet,
  ZoneGeometry,
} from '../types'
import { patch, restWith, signInToken } from './supabase'

const DEMO_MERCHANT_ID = 1
const DEMO_MERCHANT_USER_ID = 2

const REF_EMAIL = (import.meta.env.VITE_DEMO_CS_EMAIL as string | undefined) || 'cs@sa7tein.app'
const REF_PASSWORD = (import.meta.env.VITE_DEMO_CS_PASSWORD as string | undefined) || 'demo1234'
const MERCHANT_EMAIL =
  (import.meta.env.VITE_DEMO_MERCHANT_EMAIL as string | undefined) || 'merchant@sa7tein.app'
const MERCHANT_PASSWORD =
  (import.meta.env.VITE_DEMO_MERCHANT_PASSWORD as string | undefined) || 'demo1234'

let refSession: Promise<string> | null = null
function refToken(): Promise<string> {
  if (!refSession) refSession = signInToken(REF_EMAIL, REF_PASSWORD)
  return refSession
}
let merchantSession: Promise<string> | null = null
function merchantToken(): Promise<string> {
  if (!merchantSession) merchantSession = signInToken(MERCHANT_EMAIL, MERCHANT_PASSWORD)
  return merchantSession
}

interface CourierRow {
  id: number
  user_id: number
  merchant_id: number
  name: string
  availability: string | null
  created_at: string
}
interface UserRow {
  id: number
  email: string | null
  phone: string | null
  verified: boolean | null
}
interface WalletRow {
  user_id: number
  balance_jod: number
  reserved_balance_jod: number
}
interface CreditRow {
  merchant_id: number
  balance_jod: number
  rebate_tier: string | null
  rebate_period: string | null
  rebate_amount_jod: number | null
  rebate_paid_at: string | null
}
interface ZoneRow {
  id: number
  code: string
  name: string
  polygon: Array<[number, number]> | null
}
interface RoleRow {
  id: number
  key: string
  name: string
  permissions: string[] | null
}
interface OperatorRow {
  id: number
  user_id: number
  role_id: number
  active: boolean
  created_at: string
}
interface SwitchRow {
  key: string
  enabled: boolean
}
interface MerchantRow {
  id: number
  store_status: string | null
  deposit_jod: number | null
}
interface CreditEventRow {
  id: number
  event: string
  amount_jod: number
  at: string
}

/** Nama event kredit: backend memakai `credit_fee_deducted`, repo `merchant_credit_debited`. */
const CREDIT_EVENT_NAME: Record<string, MerchantCreditEventName> = {
  merchant_credit_granted: 'merchant_credit_granted',
  credit_fee_deducted: 'merchant_credit_debited',
  merchant_credit_debited: 'merchant_credit_debited',
  rebate_tier_reached: 'rebate_tier_reached',
  rebate_paid: 'rebate_paid',
}

const AVAILABILITY: Record<string, Courier['status']> = {
  available: 'at_store',
  busy: 'delivering',
  on_delivery: 'delivering',
  offline: 'offline',
}

function dayLabel(iso: string): string {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000))
  if (days <= 0) return 'hari ini'
  if (days === 1) return 'kemarin'
  return `${days} hari lalu`
}

function toCourier(row: CourierRow, user?: UserRow): Courier {
  return {
    id: String(row.id),
    merchantId: String(row.merchant_id),
    name: row.name,
    phone: user?.phone ?? '',
    phoneVerified: user?.verified ?? false,
    status: AVAILABILITY[row.availability ?? ''] ?? 'offline',
    activeOrderCount: 0,
    joinedAt: dayLabel(row.created_at),
  }
}

function toWallet(row: WalletRow): Wallet {
  const total = jodToIdr(row.balance_jod)
  const pending = jodToIdr(row.reserved_balance_jod)
  return { balance: total, available: Math.max(0, total - pending), pending }
}

function toCreditEvent(row: CreditEventRow): MerchantCreditEvent {
  return {
    id: `mce-${row.id}`,
    event: CREDIT_EVENT_NAME[row.event] ?? 'merchant_credit_debited',
    amountJod: row.amount_jod,
    at: dayLabel(row.at),
  }
}

function toRole(row: RoleRow): SaRole {
  return {
    id: row.key,
    name: row.name,
    scope: row.key.startsWith('cs') ? 'cs' : 'sa',
    permissionIds: row.permissions ?? [],
    locked: row.key === 'sa_owner',
  }
}

/** Kurir milik satu merchant. Nomor/verifikasi diambil dari tabel `users`. */
export async function fetchCouriers(merchantId = DEMO_MERCHANT_ID): Promise<Courier[]> {
  const token = await refToken()
  const rows = await restWith<CourierRow>(
    token,
    'couriers',
    `?select=*&merchant_id=eq.${merchantId}&order=id.asc`,
  )
  if (!rows.length) return []
  const ids = rows.map((r) => r.user_id).join(',')
  const users = await restWith<UserRow>(token, 'users', `?select=id,email,phone,verified&id=in.(${ids})`)
  const byId = new Map(users.map((u) => [u.id, u]))
  return rows.map((row) => toCourier(row, byId.get(row.user_id)))
}

/** Saldo satu user (`wallets.user_id`) — customer 1, merchant 2. */
export async function fetchWallet(userId: number): Promise<Wallet | undefined> {
  const token = await refToken()
  const rows = await restWith<WalletRow>(
    token,
    'wallets',
    `?select=user_id,balance_jod,reserved_balance_jod&user_id=eq.${userId}&limit=1`,
  )
  return rows[0] ? toWallet(rows[0]) : undefined
}

/** Modal + rebate merchant (M10); dompet deposit diambil dari `merchants.deposit_jod`. */
export async function fetchMerchantCredit(
  merchantId = DEMO_MERCHANT_ID,
): Promise<Partial<MerchantCreditState> | undefined> {
  const token = await refToken()
  const credits = await restWith<CreditRow>(
    token,
    'merchant_credits',
    `?select=*&merchant_id=eq.${merchantId}&limit=1`,
  )
  const credit = credits[0]
  if (!credit) return undefined
  const [merchants, events] = await Promise.all([
    restWith<MerchantRow>(token, 'merchants', `?select=id,deposit_jod&id=eq.${merchantId}&limit=1`),
    restWith<CreditEventRow>(
      token,
      'merchant_credit_events',
      `?select=id,event,amount_jod,at&merchant_id=eq.${merchantId}&order=id.desc`,
    ),
  ])
  return {
    merchantCreditBalance: credit.balance_jod,
    rebatePeriod: credit.rebate_period ?? '',
    rebateTier: (credit.rebate_tier as RebateTier | null) ?? null,
    rebateAmountJod: credit.rebate_amount_jod ?? 0,
    rebatePaidAt: credit.rebate_paid_at,
    depositBalanceJod: merchants[0]?.deposit_jod ?? 0,
    events: events.map(toCreditEvent),
  }
}

/** `merchants.store_status` → buka/tutup. */
export async function fetchStoreStatus(merchantId = DEMO_MERCHANT_ID): Promise<boolean | undefined> {
  const token = await refToken()
  const rows = await restWith<MerchantRow>(
    token,
    'merchants',
    `?select=id,store_status&id=eq.${merchantId}&limit=1`,
  )
  return rows[0] ? rows[0].store_status === 'open' : undefined
}

/** Tulis status toko. Merchant menulis barisnya sendiri (RLS) → token merchant. */
export async function setStoreStatus(open: boolean, merchantId = DEMO_MERCHANT_ID): Promise<void> {
  const token = await merchantToken()
  await patch(token, 'merchants', `?id=eq.${merchantId}`, {
    store_status: open ? 'open' : 'closed',
  })
}

/** Poligon zona master SA (`zones.polygon` = array [lat,lng]). */
export async function fetchZones(): Promise<ZoneGeometry[]> {
  const token = await refToken()
  const rows = await restWith<ZoneRow>(token, 'zones', '?select=*&order=id.asc')
  return rows.map((row) => ({
    id: row.code.toLowerCase() as ZoneGeometry['id'],
    label: row.name,
    note: row.code,
    vertices: (row.polygon ?? []).map(([lat, lng]) => ({ lat, lng })),
  }))
}

export async function fetchRoles(): Promise<SaRole[]> {
  const token = await refToken()
  const rows = await restWith<RoleRow>(token, 'roles', '?select=*&order=id.asc')
  return rows.map(toRole)
}

/** Operator SA/CS. Nama diambil dari email (tabel `users` tak punya kolom nama). */
export async function fetchOperators(): Promise<SaOperator[]> {
  const token = await refToken()
  const [rows, roles, users] = await Promise.all([
    restWith<OperatorRow>(token, 'operators', '?select=*&order=id.asc'),
    restWith<RoleRow>(token, 'roles', '?select=id,key,name&order=id.asc'),
    restWith<UserRow>(token, 'users', '?select=id,email,phone,verified&order=id.asc'),
  ])
  const roleKey = new Map(roles.map((r) => [r.id, r.key]))
  const byUser = new Map(users.map((u) => [u.id, u]))
  return rows.map((row) => {
    const user = byUser.get(row.user_id)
    const email = user?.email ?? ''
    return {
      id: String(row.id),
      name: email.split('@')[0] || `Operator ${row.id}`,
      contact: user?.phone || email,
      roleId: roleKey.get(row.role_id) ?? '',
      createdAt: dayLabel(row.created_at),
      status: row.active ? 'active' : 'suspended',
    }
  })
}

const SWITCH_KEYS: Record<string, keyof PlatformSwitches> = {
  cod_enabled: 'cod',
  payout_enabled: 'payout',
  maintenance_mode: 'maintenance',
}

export async function fetchSwitches(): Promise<PlatformSwitches> {
  const token = await refToken()
  const rows = await restWith<SwitchRow>(token, 'platform_switches', '?select=key,enabled')
  const switches: PlatformSwitches = { cod: true, payout: true, maintenance: false }
  for (const row of rows) {
    const key = SWITCH_KEYS[row.key]
    if (key) switches[key] = row.enabled
  }
  return switches
}

export { DEMO_MERCHANT_USER_ID }
