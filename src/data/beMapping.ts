/**
 * Mapper baris D1 → tipe domain untuk tabel yang dibaca panel ops/CS.
 *
 * Fungsi murni (tanpa network/`import.meta`) supaya bisa diperiksa
 * `scripts/be-mappers-check.mjs`; modul API tinggal memanggilnya.
 */
import type {
  DisputeRule,
  LedgerEntry,
  LedgerEntryType,
  LedgerPartyKind,
  Punishment,
  RebateTier,
  RebateTierDef,
} from '../types'

export interface CashbackTierRow {
  tier: string
  threshold_orders: number
  amount_jod: number
}

export interface DisputeRuleRow {
  code: string
  name: string
  category: string
  trigger_condition: string
  responsible_party: string
  mitigation: string
  /** JSON teks (mis. `{"kind":"sp","level":1}`); `null` = tanpa punishment. */
  punishment: string | null
  version: number
  active: number
}

export interface LedgerRow {
  id: number
  order_id: number | null
  entry_type: string
  party: string | null
  amount_jod: number
  idempotency_key: string | null
  note: string | null
  created_at: string
}

/** Nilai `tier` yang dikenal tipe FE (yang lain dilewati). */
export const REBATE_TIER_IDS: RebateTier[] = ['tier_1', 'tier_2', 'tier_3']

type RuleSubject = DisputeRule['responsibleParty']

export const PUNISHMENT_FORM: Record<string, string> = {
  sp: 'Surat peringatan (SP)',
  fine: 'Denda',
  suspend: 'Suspend sementara',
}

/** `enterprise_ledger.entry_type` → tipe ledger yang dikenal UI. */
const LEDGER_TYPE: Record<string, LedgerEntryType> = {
  payout: 'settlement',
  fee: 'fee',
  refund: 'refund',
  cod_hold: 'cod_hold',
  deposit_hold: 'deposit_hold',
  protection_fund: 'protection_fund',
}

/** `enterprise_ledger.party` → pihak ledger FE (`applicator` = platform). */
const LEDGER_PARTY: Record<string, LedgerPartyKind> = {
  merchant: 'merchant',
  courier: 'courier',
  customer: 'customer',
  applicator: 'platform',
  platform: 'platform',
}

const PARTY_LABEL: Record<LedgerPartyKind, string> = {
  merchant: 'Merchant',
  courier: 'Kurir',
  customer: 'Customer',
  platform: 'Platform',
}

export function asRuleSubject(value: string): RuleSubject {
  return value === 'merchant' || value === 'courier' ? value : 'customer'
}

/** `{"kind":"sp","level":1}` → objek; JSON rusak/`null` → `undefined`. */
export function parsePunishment(
  raw: string | null,
): { kind: string; level?: number } | undefined {
  if (!raw) return undefined
  try {
    const value = JSON.parse(raw) as { kind?: unknown; level?: unknown }
    if (typeof value.kind !== 'string') return undefined
    return {
      kind: value.kind,
      level: typeof value.level === 'number' ? value.level : undefined,
    }
  } catch {
    return undefined
  }
}

/** Opsi satu varian menu. `options` di D1 tersimpan sebagai teks JSON. */
export interface VariantOptionRow {
  id: number
  name: string
  priceDeltaJod: number
}

/**
 * `menu_variants.options` datang sebagai **string JSON** dari Worker/D1 (bukan
 * array seperti PostgREST Supabase). Memanggil `.map` langsung di situ pernah
 * mengosongkan seluruh halaman menu ("Gagal memuat menu dari server") karena satu
 * varian melempar TypeError. Terima array (PostgREST), string JSON, null, dan
 * bentuk rusak — yang rusak jadi daftar kosong, bukan kegagalan halaman.
 */
export function parseVariantOptions(raw: unknown): VariantOptionRow[] {
  const value =
    typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw) as unknown
          } catch {
            return []
          }
        })()
      : raw
  if (!Array.isArray(value)) return []
  return value.flatMap((option) => {
    if (!option || typeof option !== 'object') return []
    const row = option as Partial<VariantOptionRow>
    if (typeof row.id !== 'number' || typeof row.name !== 'string') return []
    return [{ id: row.id, name: row.name, priceDeltaJod: Number(row.priceDeltaJod) || 0 }]
  })
}

/** Tier cashback (urut ambang naik); `tier` asing dilewati, bukan diteruskan. */
export function toRebateTiers(rows: CashbackTierRow[]): RebateTierDef[] {
  return rows.flatMap((row) => {
    if (!REBATE_TIER_IDS.includes(row.tier as RebateTier)) return []
    return [{ id: row.tier as RebateTier, threshold: row.threshold_orders, amountJod: row.amount_jod }]
  })
}

/**
 * `dispute_rules` → katalog rule + template punishment. `id` FE diturunkan dari
 * `code` (stabil dan sama dengan kunci mock); kategori memakai kolom BE apa
 * adanya karena FE belum punya peta untuk `delivery/quality/order`.
 */
export function toDisputeCatalog(rows: DisputeRuleRow[]): {
  rules: DisputeRule[]
  punishments: Punishment[]
} {
  const punishments: Punishment[] = []
  const rules = rows.map((row) => {
    const id = `rule-${row.code.toLowerCase()}`
    const subject = asRuleSubject(row.responsible_party)
    const parsed = parsePunishment(row.punishment)
    if (parsed) {
      punishments.push({
        id: `pun-${row.code.toLowerCase()}`,
        ruleId: id,
        subject,
        form: PUNISHMENT_FORM[parsed.kind] ?? parsed.kind,
        level: parsed.level ? `tingkat ${parsed.level}` : '—',
      })
    }
    return {
      id,
      code: row.code,
      name: row.name,
      categoryId: row.category,
      trigger: row.trigger_condition,
      responsibleParty: subject,
      mitigation: row.mitigation,
      active: Boolean(row.active),
      version: row.version,
    }
  })
  return { rules, punishments }
}

/**
 * Label bentuk punishment FE → `punishments.kind` (kebalikannya
 * `PUNISHMENT_FORM`). Form bebas ketik, jadi cocokkan kata kuncinya.
 */
export function penaltyKind(form: string): string {
  const value = form.toLowerCase()
  if (value.includes('denda')) return 'fine'
  if (value.includes('suspend')) return 'suspend'
  return 'sp'
}

/** `SP-1` / `tingkat 2` → angka level; tanpa angka → `null`. */
export function penaltyLevel(level: string): number | null {
  const match = /\d+/.exec(level)
  return match ? Number(match[0]) : null
}

/**
 * Pecah daftar id untuk query `in.(...)`. D1 menolak query dengan terlalu banyak
 * variabel SQL (`too many SQL variables`), dan itu mematikan seluruh join —
 * mis. 66 order merchant membuat `order_items` 400 dan dashboard jatuh ke cache.
 */
export function chunkIds(ids: number[], size = 40): number[][] {
  const out: number[][] = []
  for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size))
  return out
}

/**
 * `enterprise_ledger` → `LedgerEntry`. Nominal BE JOD bisa negatif (`fee`), jadi
 * `direction` diturunkan dari tandanya dan `amount` disimpan absolut.
 */
export function toLedgerEntry(row: LedgerRow): LedgerEntry {
  const kind = LEDGER_PARTY[row.party ?? ''] ?? 'platform'
  return {
    id: `led-be-${row.id}`,
    at: row.created_at,
    type: LEDGER_TYPE[row.entry_type] ?? 'settlement',
    direction: row.amount_jod < 0 ? 'debit' : 'credit',
    amount: Math.abs(row.amount_jod),
    party: { kind, id: null, name: PARTY_LABEL[kind] },
    ref: row.idempotency_key ?? `order-${row.order_id ?? '-'}`,
    memo: row.note ?? row.entry_type,
  }
}
