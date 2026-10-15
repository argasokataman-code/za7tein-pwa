// Program marketing ala Odoo (PRD §15) — **fungsi murni**, JOD. Layar tinggal
// menampilkan hasilnya; tidak menghitung ulang di JSX (AGENTS §11).
//
// Kata "stackable" (§15.3) semantiknya masih **OPEN-23**: yang dipakai di sini
// adalah aturan paling sederhana yang bisa dibuktikan — kandidat dipisah jadi
// grup `isStackable` dan yang tidak. Grup stackable digabung; kandidat
// non-stackable hanya boleh sendiri. Yang dipakai = yang diskonnya lebih besar
// (seri → grup stackable). Aturan ini ditulis di tempat, bukan disembunyikan.
//
// Yang **belum didukung** (ditandai `unsupported`, bukan dihitung diam-diam):
// hadiah `product`/`shipping`, sasaran diskon `cheapest`/`specific`, dan mode
// `per_point`. Reward reward-nya tetap tampil di daftar, hanya angkanya nol.
import type {
  LoyaltyCard,
  MarketingProgram,
  MarketingProgramType,
  ProgramReward,
  ProgramRule,
} from '../types'

/** Konteks satu keranjang/order saat program dievaluasi. */
export interface ProgramContext {
  /** Toko yang sedang dilihat/dipesan; program merchant hanya berlaku di sini. */
  merchantId: string | null
  subtotalJod: number
  qty: number
  /** Menu di keranjang — untuk mencocokkan batas menu/kategori/tag `rule`. */
  menuIds?: string[]
  categoryIds?: string[]
  tagIds?: string[]
  /** Tanggal acuan `YYYY-MM-DD`; default hari ini. */
  on?: string
  /** Poin kartu loyalty customer untuk merchant ini. */
  points?: number
}

/** Satu program yang cocok dengan konteks, beserta diskonnya. */
export interface ProgramMatch {
  program: MarketingProgram
  rule: ProgramRule | null
  reward: ProgramReward | null
  /** Diskon JOD (0 kalau hadiahnya belum didukung). */
  discountJod: number
  /** Butuh kode — kode dikelola jalur promo BE, jadi tidak dihitung di sini. */
  requiresCode: boolean
  /** Sebab hadiah ini belum dihitung (kalau ada). */
  unsupported?: string
}

export const PROGRAM_TYPE_LABEL: Record<MarketingProgramType, string> = {
  promotion: 'Promosi toko',
  promo_code: 'Kode promo',
  coupons: 'Kupon',
  buy_x_get_y: 'Beli X gratis Y',
  next_order_coupons: 'Kupon order berikutnya',
  loyalty: 'Poin loyalty',
  gift_card: 'Gift card',
  ewallet: 'E-wallet',
}

const OWNER_LABEL = { platform: 'Aplikator', merchant: 'Toko' } as const

/** `YYYY-MM-DD` hari ini (jendela program dibandingkan sebagai string). */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** Program sedang di dalam jendela tanggalnya? */
export function programInWindow(program: MarketingProgram, on: string): boolean {
  if (program.dateFrom > on) return false
  if (program.dateTo && program.dateTo < on) return false
  return true
}

/** Daftar kosong = tanpa batas; kalau tidak kosong, harus ada irisan. */
function hasOverlap(limited: string[], actual: string[] | undefined): boolean {
  if (!limited.length) return true
  const set = new Set(actual ?? [])
  return limited.some((id) => set.has(id))
}

/**
 * Diskon satu hadiah, JOD. Hanya `discount` + sasaran `order` yang dihitung;
 * mode `percent` (persen subtotal, dibatasi `discountMaxAmountJod`) dan
 * `per_order` (nilai tetap JOD). `per_point` + hadiah produk/ongkir → 0.
 */
export function rewardDiscountJod(
  reward: ProgramReward | null,
  subtotalJod: number,
  points = 0,
): { discountJod: number; unsupported?: string } {
  if (!reward) return { discountJod: 0, unsupported: 'Program belum punya hadiah' }
  if (reward.rewardType !== 'discount') {
    return {
      discountJod: 0,
      unsupported:
        reward.rewardType === 'product'
          ? 'Hadiah produk belum dihitung di keranjang'
          : 'Hadiah gratis ongkir belum dihitung di keranjang',
    }
  }
  const applicability = reward.discountApplicability ?? 'order'
  if (applicability !== 'order') {
    return {
      discountJod: 0,
      unsupported:
        applicability === 'cheapest'
          ? 'Diskon item termurah belum dihitung di keranjang'
          : 'Diskon item tertentu belum dihitung di keranjang',
    }
  }
  const mode = reward.discountMode ?? 'percent'
  if (mode === 'per_point') {
    return { discountJod: 0, unsupported: 'Tukar poin belum dihitung di keranjang' }
  }
  if (reward.requiredPoints && points < reward.requiredPoints) {
    return {
      discountJod: 0,
      unsupported: `Butuh ${reward.requiredPoints} poin (kamu ${points})`,
    }
  }
  const raw =
    mode === 'per_order'
      ? (reward.discountPercent ?? 0)
      : (subtotalJod * (reward.discountPercent ?? 0)) / 100
  const capped =
    reward.discountMaxAmountJod != null ? Math.min(raw, reward.discountMaxAmountJod) : raw
  return { discountJod: Math.max(0, Math.min(capped, subtotalJod)) }
}

/**
 * Semua program yang bisa **berjalan otomatis** pada konteks ini (program
 * `with_code` tetap masuk daftar dengan `requiresCode: true`, tapi diskonnya
 * tidak dihitung — kode divalidasi jalur promo BE). Urut dari diskon terbesar.
 */
export function programMatches(
  programs: MarketingProgram[],
  rules: ProgramRule[],
  rewards: ProgramReward[],
  ctx: ProgramContext,
): ProgramMatch[] {
  const on = ctx.on ?? todayIso()
  const matches: ProgramMatch[] = []
  for (const program of programs) {
    if (!programInWindow(program, on)) continue
    if (program.appliesOn === 'future') continue // berlaku order berikutnya, bukan ini
    if (program.owner === 'merchant' && program.merchantId !== ctx.merchantId) continue
    const rule = rules.find((r) => r.programId === program.id) ?? null
    if (rule) {
      if (ctx.qty < rule.minimumQty) continue
      if (ctx.subtotalJod < rule.minimumAmountJod) continue
      if (!hasOverlap(rule.menuIds, ctx.menuIds)) continue
      if (!hasOverlap(rule.categoryIds, ctx.categoryIds)) continue
      if (!hasOverlap(rule.tagIds, ctx.tagIds)) continue
    }
    const reward = rewards.find((r) => r.programId === program.id) ?? null
    const requiresCode = program.trigger === 'with_code'
    const { discountJod, unsupported } = requiresCode
      ? { discountJod: 0, unsupported: 'Pakai kodenya di kolom promo' }
      : rewardDiscountJod(reward, ctx.subtotalJod, ctx.points ?? 0)
    matches.push({ program, rule, reward, discountJod, requiresCode, unsupported })
  }
  return matches.sort((a, b) => b.discountJod - a.discountJod || a.program.id.localeCompare(b.program.id))
}

export interface ProgramCombination {
  /** Program yang benar-benar dipakai (setelah aturan stacking). */
  chosen: ProgramMatch[]
  discountJod: number
  merchantJod: number
  platformJod: number
  /** Kandidat yang gugur karena aturan stacking (untuk dinaikkan ke UI). */
  rejected: ProgramMatch[]
}

/**
 * Gabungkan kandidat otomatis jadi satu potongan. Stackable digabung;
 * non-stackable hanya sendiri; yang lebih besar menang (seri → stackable).
 * Kode promo (`requiresCode`) tidak ikut — itu jalur promo BE.
 */
export function bestProgramCombination(
  programs: MarketingProgram[],
  rules: ProgramRule[],
  rewards: ProgramReward[],
  ctx: ProgramContext,
): ProgramCombination {
  const candidates = programMatches(programs, rules, rewards, ctx).filter(
    (m) => !m.requiresCode && m.discountJod > 0,
  )
  const stackable = candidates.filter((m) => m.program.isStackable)
  const alone = candidates.filter((m) => !m.program.isStackable)
  const stackSum = stackable.reduce((sum, m) => sum + m.discountJod, 0)
  const best = alone.reduce<ProgramMatch | null>(
    (top, m) => (!top || m.discountJod > top.discountJod ? m : top),
    null,
  )
  const bestAloneJod = best?.discountJod ?? 0
  const useStack = stackSum > 0 && stackSum >= bestAloneJod
  const chosen = useStack ? stackable : best ? [best] : []
  const rejected = useStack ? alone : stackable
  const merchantJod = chosen
    .filter((m) => m.program.owner === 'merchant')
    .reduce((sum, m) => sum + m.discountJod, 0)
  const platformJod = chosen
    .filter((m) => m.program.owner === 'platform')
    .reduce((sum, m) => sum + m.discountJod, 0)
  return { chosen, discountJod: merchantJod + platformJod, merchantJod, platformJod, rejected }
}

/**
 * Program yang **ditawarkan** di satu toko (window + kepemilikan + `appliesOn`),
 * tanpa melihat isi keranjang — untuk daftar di halaman toko. Syarat minimum
 * tetap dikembalikan sebagai teks, bukan dijadikan filter.
 */
export function listedPrograms(
  programs: MarketingProgram[],
  rules: ProgramRule[],
  rewards: ProgramReward[],
  merchantId: string | null,
  on: string = todayIso(),
): { program: MarketingProgram; rule: ProgramRule | null; reward: ProgramReward | null }[] {
  return programs
    .filter(
      (p) =>
        programInWindow(p, on) &&
        p.appliesOn !== 'future' &&
        (p.owner === 'platform' || p.merchantId === merchantId),
    )
    .map((program) => ({
      program,
      rule: rules.find((r) => r.programId === program.id) ?? null,
      reward: rewards.find((r) => r.programId === program.id) ?? null,
    }))
}

/** Ringkasan satu hadiah untuk daftar (tanpa angka diskon pesanan). */export function rewardSummary(reward: ProgramReward | null): string {
  if (!reward) return 'Belum ada hadiah'
  if (reward.rewardType === 'product') return `Produk gratis × ${reward.rewardQty ?? 1}`
  if (reward.rewardType === 'shipping') return 'Gratis ongkir'
  const applicability =
    reward.discountApplicability === 'cheapest'
      ? ' item termurah'
      : reward.discountApplicability === 'specific'
        ? ' item tertentu'
        : ''
  const head =
    reward.discountMode === 'per_order'
      ? `Potongan ${reward.discountPercent ?? 0} JOD${applicability}`
      : `Diskon ${reward.discountPercent ?? 0}%${applicability}`
  const cap = reward.discountMaxAmountJod != null ? ` (maks ${reward.discountMaxAmountJod} JOD)` : ''
  const points = reward.requiredPoints ? ` · tukar ${reward.requiredPoints} poin` : ''
  return `${head}${cap}${points}`
}

/** Ringkasan syarat program untuk daftar. */
export function ruleSummary(rule: ProgramRule | null): string | null {
  if (!rule) return null
  const parts: string[] = []
  if (rule.minimumAmountJod > 0) parts.push(`min. belanja ${rule.minimumAmountJod} JOD`)
  if (rule.minimumQty > 0) parts.push(`min. ${rule.minimumQty} item`)
  if (rule.menuIds.length) parts.push('menu tertentu')
  if (rule.categoryIds.length) parts.push('kategori tertentu')
  return parts.length ? parts.join(' · ') : null
}

/** Label satu baris untuk daftar program (dipakai sisi customer & merchant). */
export function programSummary(
  program: MarketingProgram,
  rule: ProgramRule | null,
  reward: ProgramReward | null,
): { type: string; owner: string; reward: string; requirement: string | null } {
  return {
    type: PROGRAM_TYPE_LABEL[program.type],
    owner: OWNER_LABEL[program.owner],
    reward: rewardSummary(reward),
    requirement: ruleSummary(rule),
  }
}

// — Program marketing —
export const mockMarketingPrograms: MarketingProgram[] = [
  {
    id: 'prog-1',
    name: 'Promo Menu Pilihan',
    owner: 'merchant',
    // Toko demo console merchant (`DEMO_MERCHANT_ID` = 1).
    merchantId: '1',
    type: 'promotion',
    trigger: 'auto',
    appliesOn: 'current',
    dateFrom: '2026-10-01',
    dateTo: '2026-12-31',
    limitUsage: null,
    maxUsage: null,
    isStackable: true,
  },
  {
    id: 'prog-3',
    name: 'Beli 3 Gratis 1',
    owner: 'merchant',
    merchantId: '1',
    type: 'buy_x_get_y',
    trigger: 'auto',
    appliesOn: 'current',
    dateFrom: '2026-10-01',
    dateTo: null,
    limitUsage: null,
    maxUsage: null,
    isStackable: true,
  },
  {
    id: 'prog-4',
    name: 'Kartu Poin Toko',
    owner: 'merchant',
    merchantId: '1',
    type: 'loyalty',
    trigger: 'auto',
    appliesOn: 'current',
    dateFrom: '2026-10-01',
    dateTo: null,
    limitUsage: null,
    maxUsage: null,
    isStackable: false,
  },
  {
    id: 'prog-2',
    name: 'Kode HEMAT10',
    owner: 'platform',
    merchantId: null,
    type: 'promo_code',
    trigger: 'with_code',
    appliesOn: 'current',
    dateFrom: '2026-10-01',
    dateTo: null,
    limitUsage: 1000,
    maxUsage: null,
    isStackable: false,
  },
  {
    // Berlaku order **berikutnya** — sengaja ada supaya medan `appliesOn`
    // benar-benar terpakai: program ini tak boleh muncul di keranjang sekarang.
    id: 'prog-5',
    name: 'Kupon Order Berikutnya',
    owner: 'platform',
    merchantId: null,
    type: 'next_order_coupons',
    trigger: 'with_code',
    appliesOn: 'future',
    dateFrom: '2026-10-01',
    dateTo: null,
    limitUsage: null,
    maxUsage: null,
    isStackable: true,
  },
]
export const mockProgramRules: ProgramRule[] = [
  {
    id: 'rule-1',
    programId: 'prog-1',
    minimumQty: 0,
    minimumAmountJod: 5,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_order',
    rewardPointAmount: 1,
  },
  {
    id: 'rule-3',
    programId: 'prog-3',
    minimumQty: 3,
    minimumAmountJod: 0,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_unit',
    rewardPointAmount: 1,
  },
  {
    id: 'rule-4',
    programId: 'prog-4',
    minimumQty: 0,
    minimumAmountJod: 0,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_currency',
    rewardPointAmount: 1,
  },
  {
    id: 'rule-2',
    programId: 'prog-2',
    minimumQty: 0,
    minimumAmountJod: 10,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_order',
    rewardPointAmount: 0,
  },
  {
    id: 'rule-5',
    programId: 'prog-5',
    minimumQty: 0,
    minimumAmountJod: 0,
    menuIds: [],
    categoryIds: [],
    tagIds: [],
    rewardPointMode: 'per_order',
    rewardPointAmount: 0,
  },
]
export const mockProgramRewards: ProgramReward[] = [
  {
    id: 'reward-1',
    programId: 'prog-1',
    rewardType: 'discount',
    discountMode: 'percent',
    discountPercent: 10,
    discountApplicability: 'order',
    discountMaxAmountJod: 1.5,
  },
  {
    id: 'reward-3',
    programId: 'prog-3',
    rewardType: 'product',
    rewardQty: 1,
  },
  {
    id: 'reward-4',
    programId: 'prog-4',
    rewardType: 'discount',
    discountMode: 'percent',
    discountPercent: 15,
    discountApplicability: 'order',
    discountMaxAmountJod: 2,
    requiredPoints: 10,
  },
  {
    id: 'reward-2',
    programId: 'prog-2',
    rewardType: 'discount',
    discountMode: 'percent',
    discountPercent: 10,
    discountApplicability: 'order',
    discountMaxAmountJod: 3,
  },
  {
    id: 'reward-5',
    programId: 'prog-5',
    rewardType: 'discount',
    discountMode: 'percent',
    discountPercent: 10,
    discountApplicability: 'order',
  },
]
/**
 * Kartu loyalty customer (padanan `loyalty.card`). BE belum punya tabelnya →
 * poinnya mock, cukup untuk membuat program loyalty benar-benar berjalan di
 * keranjang alih-alih selalu "kurang poin".
 */
export const mockLoyaltyCards: LoyaltyCard[] = [
  { id: 'card-1', programId: 'prog-4', customerId: 'me', points: 12, code: null, expiresAt: null },
]
