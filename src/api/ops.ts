/**
 * Panel ops (M10, R-OPS) ↔ `platform_params` + `merchant_tags`.
 *
 * Kontrak live (diverifikasi 2026-10-17):
 *  - `platform_params`: satu baris (`id = true`). Tiga dari empat knob ditulis
 *    lewat RPC `ops_set_platform_params` (SECURITY DEFINER + `app_is_ops()`);
 *    `almost_arrived_minutes` ditulis langsung (RLS ops), karena RPC-nya belum
 *    menerimanya.
 *  - `merchant_tags`: `proposed` = masih menunggu, `approved` = disetujui.
 *    Status FE diturunkan dari keduanya (`pending`/`approved`/`rejected`) — tidak
 *    ada kolom status terpisah.
 *
 * Dibaca/ditulis lewat sesi `cs@` (`refToken`) — akun cs/superadmin lolos
 * `app_is_ops()`. Baca mengembalikan `[]` kalau tabel kosong; pemanggil
 * mempertahankan mock (pola modul API lain).
 */
import type {
  DisputeRule,
  ExchangeRate,
  OpsPenalty,
  OpsPlatformConfig,
  OpsTag,
  OpsTagStatus,
  Punishment,
} from '../types'
import { PUNISHMENT_FORM, asRuleSubject, penaltyKind, penaltyLevel, toDisputeCatalog } from '../data/beMapping'
import type { DisputeRuleRow } from '../data/beMapping'
import { refToken } from './reference'
import { apiEnabled, createWith, patch, rest, restWith, rpc } from './supabase'

interface ParamsRow {
  quick_multiplier: number
  platform_fee_customer_jod: number
  platform_fee_merchant_jod: number
  almost_arrived_minutes: number
}
interface TagRow {
  id: number
  merchant_id: number
  tag: string
  proposed: boolean
  approved: boolean
  created_at: string
}
interface MerchantNameRow {
  id: number
  store_name: string | null
}

function dayLabel(iso: string): string {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000))
  if (days <= 0) return 'hari ini'
  if (days === 1) return 'kemarin'
  return `${days} hari lalu`
}

/** Nominal knob setelan platform. `{}` kalau baris belum ada → pakai mock. */
export async function fetchPlatformConfig(): Promise<Partial<OpsPlatformConfig>> {
  if (!apiEnabled) return {}
  const token = await refToken()
  const rows = await restWith<ParamsRow>(
    token,
    'platform_params',
    '?select=quick_multiplier,platform_fee_customer_jod,platform_fee_merchant_jod,almost_arrived_minutes&limit=1',
  )
  const row = rows[0]
  if (!row) return {}
  return {
    quickMultiplier: row.quick_multiplier,
    platformFeeCustomerJod: row.platform_fee_customer_jod,
    platformFeeMerchantJod: row.platform_fee_merchant_jod,
    almostArrivedMinutes: row.almost_arrived_minutes,
  }
}

/** Simpan knob setelan platform ke BE (best-effort; pemanggil `.catch`). */
export async function savePlatformConfig(config: OpsPlatformConfig): Promise<void> {
  if (!apiEnabled) return
  const token = await refToken()
  await rpc(token, 'ops_set_platform_params', {
    p_fee_customer: config.platformFeeCustomerJod,
    p_fee_merchant: config.platformFeeMerchantJod,
    p_quick_multiplier: config.quickMultiplier,
  })
  await patch(token, 'platform_params', '?id=eq.true', {
    almost_arrived_minutes: config.almostArrivedMinutes,
  })
}

/** Status FE dari pasangan kolom BE. */
function tagStatus(row: TagRow): OpsTagStatus {
  if (row.approved) return 'approved'
  return row.proposed ? 'pending' : 'rejected'
}

/** Antrean tag merchant, terbaru dulu. `[]` = tabel kosong (pakai mock). */
export async function fetchOpsTags(): Promise<OpsTag[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<TagRow>(
    token,
    'merchant_tags',
    '?select=id,merchant_id,tag,proposed,approved,created_at&order=id.desc',
  )
  if (!rows.length) return []
  const ids = [...new Set(rows.map((r) => r.merchant_id))].join(',')
  const merchants = await restWith<MerchantNameRow>(
    token,
    'merchants',
    `?select=id,store_name&id=in.(${ids})`,
  )
  const names = new Map(merchants.map((m) => [m.id, m.store_name ?? `Merchant ${m.id}`]))
  return rows.map((row) => ({
    id: `tag-${row.id}`,
    label: row.tag,
    merchantName: names.get(row.merchant_id) ?? `Merchant ${row.merchant_id}`,
    status: tagStatus(row),
    submittedAt: dayLabel(row.created_at),
  }))
}

/**
 * Putuskan satu tag BE. Id mock (`tag-N` bawaan `data/ops.ts`) punya bentuk yang
 * sama, jadi tulis hanya dijalankan bila barisnya benar-benar ada di BE —
 * kegagalan PATCH ditelan pemanggil (`.catch`).
 */
export async function decideOpsTag(id: string, status: OpsTagStatus): Promise<void> {
  if (!apiEnabled) return
  const m = /^tag-(\d+)$/.exec(id)
  if (!m) return
  const token = await refToken()
  await patch(token, 'merchant_tags', `?id=eq.${m[1]}`, {
    proposed: false,
    approved: status === 'approved',
  })
}

interface PenaltyRow {
  id: number
  subject_type: string
  subject_id: number
  kind: string
  level: number | null
  reason: string | null
  created_at: string
}

/**
 * Katalog rule dispute + punishment templatenya dari `dispute_rules`. Kosong =
 * mock dipertahankan. Pemetaan baris ada di `data/beMapping.ts` (murni, diuji).
 */
export async function fetchDisputeRules(): Promise<{
  rules: DisputeRule[]
  punishments: Punishment[]
}> {
  if (!apiEnabled) return { rules: [], punishments: [] }
  const token = await refToken()
  const rows = await restWith<DisputeRuleRow>(token, 'dispute_rules', '?select=*&order=id.asc')
  return toDisputeCatalog(rows)
}

/**
 * Riwayat SP yang benar-benar diterbitkan (`punishments`). Nama pihak di-join
 * manual karena Worker tak mendukung embed relasi. `[]` = tabel kosong.
 */
export async function fetchPenalties(): Promise<OpsPenalty[]> {
  if (!apiEnabled) return []
  const token = await refToken()
  const rows = await restWith<PenaltyRow>(
    token,
    'punishments',
    '?select=id,subject_type,subject_id,kind,level,reason,created_at&order=id.desc',
  )
  if (!rows.length) return []
  const ids = (subject: string) =>
    [...new Set(rows.filter((r) => r.subject_type === subject).map((r) => r.subject_id))]
  const [couriers, merchants, customers] = await Promise.all([
    ids('courier').length
      ? restWith<{ id: number; name: string | null }>(
          token,
          'couriers',
          `?select=id,name&id=in.(${ids('courier').join(',')})`,
        )
      : [],
    ids('merchant').length
      ? restWith<{ id: number; store_name: string | null }>(
          token,
          'merchants',
          `?select=id,store_name&id=in.(${ids('merchant').join(',')})`,
        )
      : [],
    ids('customer').length
      ? restWith<{ id: number; name: string | null }>(
          token,
          'customers',
          `?select=id,name&id=in.(${ids('customer').join(',')})`,
        )
      : [],
  ])
  const nameOf = new Map<string, string>()
  for (const c of couriers) nameOf.set(`courier-${c.id}`, c.name ?? `Kurir ${c.id}`)
  for (const m of merchants) nameOf.set(`merchant-${m.id}`, m.store_name ?? `Merchant ${m.id}`)
  for (const c of customers) nameOf.set(`customer-${c.id}`, c.name ?? `Customer ${c.id}`)

  return rows.map((row) => {
    const subject = asRuleSubject(row.subject_type)
    return {
      id: `sp-${row.id}`,
      subject,
      subjectName: nameOf.get(`${subject}-${row.subject_id}`) ?? `#${row.subject_id}`,
      form: PUNISHMENT_FORM[row.kind] ?? row.kind,
      level: row.level ? `SP-${row.level}` : '—',
      reason: row.reason ?? '—',
      status: 'issued',
      issuedAt: dayLabel(row.created_at),
    }
  })
}

/**
 * Aktif/nonaktif satu rule di `dispute_rules` (kunci `code`, bukan id numerik —
 * `code` satu-satunya kunci yang juga ada di mock). Best-effort: pemanggil
 * `.catch`, state lokal tetap berubah.
 */
export async function setDisputeRuleActive(code: string, active: boolean): Promise<void> {
  if (!apiEnabled) return
  const token = await refToken()
  await patch(token, 'dispute_rules', `?code=eq.${encodeURIComponent(code)}`, {
    active: active ? 1 : 0,
  })
}

/** Tabel + kolom nama pihak, per jenis subjek (untuk resolusi nama → id). */
const SUBJECT_NAME: Record<string, [string, string]> = {
  courier: ['couriers', 'name'],
  merchant: ['merchants', 'store_name'],
  customer: ['customers', 'name'],
}

/**
 * Terbitkan SP ke `punishments`. BE menyimpan `subject_id`, sedangkan form ops
 * mengetik nama bebas — jadi nama diresolusi dulu; tidak ketemu = **tidak
 * ditulis** (`false`), dan pemanggil memberi tahu bahwa entrinya lokal.
 * Pencabutan tetap lokal karena BE belum punya kolom status.
 */
export async function issuePenaltyRemote(input: {
  subject: OpsPenalty['subject']
  subjectName: string
  form: string
  level: string
  reason: string
}): Promise<boolean> {
  if (!apiEnabled) return false
  const entry = SUBJECT_NAME[input.subject]
  if (!entry) return false
  const [table, column] = entry
  const token = await refToken()
  const rows = await restWith<{ id: number }>(
    token,
    table,
    `?select=id&${column}=eq.${encodeURIComponent(input.subjectName)}&limit=1`,
  )
  const subjectId = rows[0]?.id
  if (!subjectId) return false
  await createWith(token, 'punishments', {
    subject_type: input.subject,
    subject_id: subjectId,
    kind: penaltyKind(input.form),
    level: penaltyLevel(input.level),
    reason: input.reason,
  })
  return true
}

interface ExchangeRateRow {
  base?: string | null
  quote?: string | null
  rate?: number | null
  /** Tanggal berlaku (kolom BE); nama lain dipakai sebagai fallback. */
  effective_on?: string | null
  fetched_at?: string | null
}

/**
 * Kurs terbaru dari tabel BE `exchange_rates` — sumber prioritas
 * (`refreshLiveRate` di `data/currency`); provider pihak ketiga tetap fallback.
 * `select=*`: menyebut satu kolom yang tak ada mematikan seluruh query (400).
 */
export async function fetchExchangeRate(): Promise<ExchangeRate> {
  const rows = await rest<ExchangeRateRow>('exchange_rates', '?select=*&order=id.desc&limit=1')
  const row = rows[0]
  const rate = Number(row?.rate)
  if (!row || !Number.isFinite(rate) || rate <= 0) {
    throw new Error('[api] exchange_rates kosong/tak valid')
  }
  return {
    base: row.base ?? 'JOD',
    quote: row.quote ?? 'IDR',
    rate,
    fetchedAt: row.effective_on ?? row.fetched_at ?? new Date().toISOString(),
    source: 'BE D1',
  }
}
