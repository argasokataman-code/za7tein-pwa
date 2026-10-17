/**
 * Program marketing (§15) ↔ `marketing_programs` + `marketing_rewards` + `marketing_rules`.
 *
 * Kontrak live (diverifikasi 2026-10-17):
 *  - `marketing_programs`: `owner, merchant_id, name, program_type, scope,
 *    is_stackable, active, active_from, active_to, max_uses, used_count, created_at`.
 *  - `marketing_rewards`: `program_id, reward_type, value_jod, percent`.
 *  - `marketing_rules`: `program_id, min_qty, min_amount_jod, rule_type`.
 *
 * BE baru memodelkan satu `program_type` = `discount` (FE punya delapan varian
 * Odoo §15.1) dan tak punya kolom nominal hadiah tetap di FE `ProgramReward`.
 * Pemetaan di bawah **menjaga data apa adanya**: `value_jod` masuk ke
 * `discountPercent` sebagai nominal saat mode `per_order` (nama kolom FE tak
 * punya padanan nominal), dan tipe selain discount jatuh ke `promotion` — tidak
 * mengarang program yang tak ada di BE.
 */
import { DEMO_MERCHANT_ID, merchantToken, refToken } from './reference'
import { apiEnabled, createWithReturn, restWith } from './supabase'
import type { DiscountMode, MarketingProgram, ProgramReward, ProgramRule } from '../types'

interface ProgramRow {
  id: number
  owner: string
  merchant_id: number | null
  name: string
  program_type: string
  scope: string | null
  is_stackable: boolean | null
  active: boolean | null
  active_from: string | null
  active_to: string | null
  max_uses: number | null
  used_count: number | null
  created_at: string
}
interface RewardRow {
  id: number
  program_id: number
  reward_type: string
  value_jod: number | null
  percent: number | null
}
interface RuleRow {
  id: number
  program_id: number
  min_qty: number | null
  min_amount_jod: number | null
  rule_type: string | null
}

function toProgram(row: ProgramRow): MarketingProgram {
  return {
    id: `be-prog-${row.id}`,
    name: row.name,
    owner: row.owner === 'applicator' ? 'platform' : 'merchant',
    merchantId: row.merchant_id === null ? null : String(row.merchant_id),
    type: 'promotion',
    trigger: 'auto',
    appliesOn: 'current',
    dateFrom: (row.active_from ?? row.created_at).slice(0, 10),
    dateTo: row.active_to ? row.active_to.slice(0, 10) : null,
    limitUsage: row.max_uses,
    maxUsage: row.max_uses,
    isStackable: Boolean(row.is_stackable),
  }
}

function toReward(row: RewardRow): ProgramReward {
  const percent = row.percent ?? row.value_jod ?? 0
  return {
    id: `be-reward-${row.id}`,
    programId: `be-prog-${row.program_id}`,
    rewardType: 'discount',
    discountMode: row.percent !== null ? 'percent' : 'per_order',
    discountPercent: percent,
    discountApplicability: 'order',
  }
}

function toRule(row: RuleRow): ProgramRule {
  return {
    id: `be-rule-${row.id}`,
    programId: `be-prog-${row.program_id}`,
    minimumQty: row.min_qty ?? 0,
    minimumAmountJod: row.min_amount_jod ?? 0,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_order',
    rewardPointAmount: 0,
  }
}

export interface MarketingBundle {
  programs: MarketingProgram[]
  rewards: ProgramReward[]
  rules: ProgramRule[]
}

/**
 * Program milik satu merchant + reward/rule-nya. Program aplikator (owner
 * `applicator`) tidak diambil di sini — daftar program merchant hanya menampilkan
 * milik sendiri, sama seperti `ownedPrograms` di layar.
 */
export async function fetchMerchantPrograms(
  merchantId = String(DEMO_MERCHANT_ID),
): Promise<MarketingBundle> {
  if (!apiEnabled) return { programs: [], rewards: [], rules: [] }
  const token = await merchantToken()
  const programs = await restWith<ProgramRow>(
    token,
    'marketing_programs',
    `?select=*&merchant_id=eq.${merchantId}&order=id.desc`,
  )
  if (!programs.length) return { programs: [], rewards: [], rules: [] }
  const ids = programs.map((p) => p.id).join(',')
  const [rewards, rules] = await Promise.all([
    restWith<RewardRow>(token, 'marketing_rewards', `?select=*&program_id=in.(${ids})`),
    restWith<RuleRow>(token, 'marketing_rules', `?select=*&program_id=in.(${ids})`),
  ])
  return {
    programs: programs.map(toProgram),
    rewards: rewards.map(toReward),
    rules: rules.map(toRule),
  }
}

/**
 * Program milik **aplikator** (ops, §15) — `owner = applicator`, tanpa
 * `merchant_id`. Dipakai panel ops; dibaca lewat sesi CS (`refToken`).
 */
export async function fetchPlatformPrograms(): Promise<MarketingBundle> {
  if (!apiEnabled) return { programs: [], rewards: [], rules: [] }
  const token = await refToken()
  const programs = await restWith<ProgramRow>(
    token,
    'marketing_programs',
    '?select=*&owner=eq.applicator&order=id.desc',
  )
  if (!programs.length) return { programs: [], rewards: [], rules: [] }
  const ids = programs.map((p) => p.id).join(',')
  const [rewards, rules] = await Promise.all([
    restWith<RewardRow>(token, 'marketing_rewards', `?select=*&program_id=in.(${ids})`),
    restWith<RuleRow>(token, 'marketing_rules', `?select=*&program_id=in.(${ids})`),
  ])
  return {
    programs: programs.map(toProgram),
    rewards: rewards.map(toReward),
    rules: rules.map(toRule),
  }
}

/**
 * Buat program aplikator → satu baris `marketing_programs` ber-`owner:
 * applicator`. Child reward/rule ikut best-effort (RLS bisa menolaknya, sama
 * seperti jalur merchant).
 */
export async function createPlatformProgram(input: {
  name: string
  isStackable: boolean
  dateFrom: string
  dateTo: string | null
  mode: DiscountMode
  value: number
  minimumAmountJod: number
}): Promise<MarketingProgram | undefined> {
  if (!apiEnabled) return undefined
  const token = await refToken()
  const programs = await createWithReturn<ProgramRow>(
    token,
    'marketing_programs',
    {
      owner: 'applicator',
      merchant_id: null,
      name: input.name,
      program_type: 'discount',
      scope: 'order',
      is_stackable: input.isStackable,
      active: true,
      active_from: input.dateFrom || null,
      active_to: input.dateTo || null,
      max_uses: null,
    },
    'id,owner,merchant_id,name,program_type,scope,is_stackable,active,active_from,active_to,max_uses,used_count,created_at',
  )
  const program = programs[0]
  if (!program) return undefined
  await Promise.all([
    createWithReturn<RewardRow>(
      token,
      'marketing_rewards',
      {
        program_id: program.id,
        reward_type: 'discount',
        value_jod: input.mode === 'per_order' ? input.value : null,
        percent: input.mode === 'percent' ? input.value : null,
      },
      'id',
    ),
    createWithReturn<RuleRow>(
      token,
      'marketing_rules',
      { program_id: program.id, min_qty: 0, min_amount_jod: input.minimumAmountJod },
      'id',
    ),
  ]).catch(() => {})
  return toProgram(program)
}

/**
 * Buat program merchant → satu baris `marketing_programs` + satu reward + satu
 * rule. `nominalIdr` hanya dipakai saat mode `per_order` (dikonversi ke JOD);
 * `percent` dikirim apa adanya. Kembalikan program tersimpan.
 */
export async function createMerchantProgram(input: {
  merchantId: string
  name: string
  isStackable: boolean
  dateFrom: string
  dateTo: string | null
  mode: DiscountMode
  value: number
  minimumAmountJod: number
}): Promise<MarketingProgram | undefined> {
  if (!apiEnabled) return undefined
  const token = await merchantToken()
  const programs = await createWithReturn<ProgramRow>(
    token,
    'marketing_programs',
    {
      owner: 'merchant',
      merchant_id: Number(input.merchantId),
      name: input.name,
      program_type: 'discount',
      scope: 'order',
      is_stackable: input.isStackable,
      active: true,
      active_from: input.dateFrom || null,
      active_to: input.dateTo || null,
      max_uses: null,
    },
    'id,owner,merchant_id,name,program_type,scope,is_stackable,active,active_from,active_to,max_uses,used_count,created_at',
  )
  const program = programs[0]
  if (!program) return undefined
  // ponytail: INSERT child ditolak RLS `marketing_rewards`/`marketing_rules`
  // (hanya program induk yang dibuka untuk merchant), jadi reward/rule tak
  // tersimpan dari FE — program tampil dengan "Belum ada hadiah". Begitu grant
  // ops tersedia, blok ini yang menghidupkannya.
  await Promise.all([
    createWithReturn<RewardRow>(
      token,
      'marketing_rewards',
      {
        program_id: program.id,
        reward_type: 'discount',
        value_jod: input.mode === 'per_order' ? input.value : null,
        percent: input.mode === 'percent' ? input.value : null,
      },
      'id',
    ),
    createWithReturn<RuleRow>(
      token,
      'marketing_rules',
      { program_id: program.id, min_qty: 0, min_amount_jod: input.minimumAmountJod },
      'id',
    ),
  ]).catch(() => {})
  return toProgram(program)
}
