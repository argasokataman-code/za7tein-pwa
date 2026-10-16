/**
 * Rule dispute (§18) — katalog + resolusi untuk satu order.
 *
 * Isi rule **di-setup ops** lewat aplikasi internal (§18: "PRD mendefinisikan
 * modelnya, bukan isinya"). Repo ini tidak punya panel ops itu, jadi katalog di
 * bawah adalah **seed demo** yang bentuknya mengikuti model §18 — bukan aturan
 * bisnis yang diputuskan aplikator. Begitu panel ops (M10) berdiri, katalog ini
 * yang pindah ke sana.
 *
 * Fungsi murni di sini menjawab pertanyaan yang gampang salah: kalau ada insiden
 * pada satu order, **rule siapa** yang berlaku, apa kompensasinya, dan apa
 * punishment-nya.
 */
import type {
  Compensation,
  DisputeRule,
  Incident,
  IncidentCategory,
  MerchantRuleSelection,
  Punishment,
} from '../types'

/** Kategori insiden yang dipetakan ops ke rule (§18). */
export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  { id: 'cat-late', label: 'Tiba terlambat' },
  { id: 'cat-missing', label: 'Item kurang atau salah' },
  { id: 'cat-damaged', label: 'Kemasan rusak atau tumpah' },
  { id: 'cat-noshow', label: 'Kurir tidak datang' },
  { id: 'cat-rude', label: 'Tidak sopan (bukti chat)' },
]

/** Rule aktif per kategori. `version` naik saat ops mengubah isinya (§18). */
export const DISPUTE_RULES: DisputeRule[] = [
  {
    id: 'rule-late-courier',
    code: 'LATE-COU-01',
    name: 'Kurir lambat antar',
    categoryId: 'cat-late',
    trigger: 'Tiba > 20 menit dari estimasi setelah kurir mulai antar',
    responsibleParty: 'courier',
    mitigation: 'Kurir diberi tahu batas waktunya dan order dipantau ops',
    active: true,
    version: 2,
  },
  {
    id: 'rule-late-merchant',
    code: 'LATE-MER-01',
    name: 'Masak melewati estimasi',
    categoryId: 'cat-late',
    trigger: 'Waktu masak terlampaui > 15 menit dari estimasi yang dipilih toko',
    responsibleParty: 'merchant',
    mitigation: 'Toko diberi tahu dan estimasi order berikutnya dinaikkan',
    active: true,
    version: 1,
  },
  {
    id: 'rule-late-customer',
    code: 'LATE-CUS-01',
    name: 'Pelanggan tidak menjawab',
    categoryId: 'cat-late',
    trigger: 'Kurir tiba di alamat dan pelanggan tidak menjawab > 10 menit',
    responsibleParty: 'customer',
    mitigation: 'Kurir menunggu maksimal 10 menit lalu melanjutkan tugas lain',
    active: true,
    version: 1,
  },
  {
    id: 'rule-missing-item',
    code: 'ITEM-MER-01',
    name: 'Item kurang dari pesanan',
    categoryId: 'cat-missing',
    trigger: 'Item tidak ada di paket, dibandingkan daftar pesanan',
    responsibleParty: 'merchant',
    mitigation: 'Item diganti pada order berikutnya atau nilainya dikembalikan',
    active: true,
    version: 1,
  },
  {
    id: 'rule-damaged',
    code: 'DAMAGE-COU-01',
    name: 'Kemasan rusak saat tiba',
    categoryId: 'cat-damaged',
    trigger: 'Laporan kerusakan dengan bukti foto saat diterima',
    responsibleParty: 'courier',
    mitigation: 'Kurir diingatkan cara membawa dan biaya pesanan dikembalikan',
    active: true,
    version: 1,
  },
  {
    id: 'rule-noshow',
    code: 'NOSHOW-COU-01',
    name: 'Kurir tidak datang',
    categoryId: 'cat-noshow',
    trigger: 'Kurir tidak tiba > 15 menit setelah jadwal ambil',
    responsibleParty: 'courier',
    mitigation: 'Order dilempar ke kurir pengganti dan SP dicatat ke mitra',
    active: true,
    version: 1,
  },
  {
    id: 'rule-rude',
    code: 'RUDE-GEN-01',
    name: 'Tidak sopan dengan bukti',
    categoryId: 'cat-rude',
    trigger: 'Laporan percakapan tidak sopan dengan bukti chat atau tangkapan layar',
    responsibleParty: 'merchant',
    mitigation: 'Peringatan tertulis ke pihak yang dilaporkan',
    active: true,
    version: 1,
  },
]

/** Bagian kompensasi tiap rule (§18: penerima, bentuk, formula). */
export const RULE_COMPENSATIONS: Compensation[] = [
  {
    id: 'cmp-late-courier',
    ruleId: 'rule-late-courier',
    recipient: 'customer',
    form: 'Potongan ongkir 50%',
    formula: '0,5 × F',
  },
  {
    id: 'cmp-late-merchant',
    ruleId: 'rule-late-merchant',
    recipient: 'customer',
    form: 'Potongan harga 20%',
    formula: '0,2 × S',
  },
  {
    id: 'cmp-missing-item',
    ruleId: 'rule-missing-item',
    recipient: 'customer',
    form: 'Nilai item dikembalikan',
    formula: 'harga item × jumlah',
  },
  {
    id: 'cmp-damaged',
    ruleId: 'rule-damaged',
    recipient: 'customer',
    form: 'Refund penuh termasuk ongkir',
    formula: 'S + F',
  },
  {
    id: 'cmp-noshow',
    ruleId: 'rule-noshow',
    recipient: 'customer',
    form: 'Refund penuh',
    formula: 'S',
  },
]

/** Bagian punishment; **SP kurir partner salah satu bentuknya** (§18). */
export const RULE_PUNISHMENTS: Punishment[] = [
  {
    id: 'pun-late-courier',
    ruleId: 'rule-late-courier',
    subject: 'courier',
    form: 'Prioritas assignment diturunkan',
    level: 'tingkat 1',
  },
  {
    id: 'pun-late-merchant',
    ruleId: 'rule-late-merchant',
    subject: 'merchant',
    form: 'Peringatan tertulis',
    level: 'tingkat 1',
  },
  {
    id: 'pun-noshow-courier',
    ruleId: 'rule-noshow',
    subject: 'courier',
    form: 'Surat peringatan (SP)',
    level: 'SP ke-1 sampai ke-3',
  },
  {
    id: 'pun-rude-merchant',
    ruleId: 'rule-rude',
    subject: 'merchant',
    form: 'Suspend sementara bila berulang',
    level: 'tingkat 2',
  },
]

/**
 * Pilihan rule toko demo. Merchant memilih lewat multi-select (§18); bentuknya
 * `MerchantRuleSelection` di store, seed ini hanya nilai awalnya.
 */
export const DEMO_MERCHANT_RULE_SELECTION: MerchantRuleSelection = {
  merchantId: 'merchant-1',
  ruleIds: ['rule-late-courier', 'rule-missing-item', 'rule-noshow'],
  effectiveFrom: '2026-10-01',
}

/** Satu insiden demo; id-nya menunjuk katalog di atas (bukan id menggantung). */
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'incident-1',
    orderId: 'api-9',
    reporter: 'customer',
    reporterId: 'cus-1',
    categoryId: 'cat-late',
    description: 'Pesanan tiba lebih dari 20 menit dari estimasi.',
    photoCount: 0,
    status: 'investigating',
    ruleId: 'rule-late-courier',
    filedAt: '2026-10-15T07:35:00.000Z',
  },
]

export function ruleById(ruleId: string): DisputeRule | undefined {
  return DISPUTE_RULES.find((rule) => rule.id === ruleId)
}

/** Rule aktif satu kategori — katalog yang dilihat merchant & ops. */
export function rulesForCategory(categoryId: string): DisputeRule[] {
  return DISPUTE_RULES.filter((rule) => rule.categoryId === categoryId && rule.active)
}

/** Id di pilihan merchant yang tidak ada di katalog — data menggantung. */
export function unknownRuleIds(selection: MerchantRuleSelection): string[] {
  return selection.ruleIds.filter((ruleId) => !ruleById(ruleId))
}

/** Rule yang benar-benar diikuti toko (id tak dikenal dibuang, bukan ditampilkan). */
export function rulesForMerchant(selection: MerchantRuleSelection): DisputeRule[] {
  return selection.ruleIds.flatMap((ruleId) => {
    const rule = ruleById(ruleId)
    return rule && rule.active ? [rule] : []
  })
}

/**
 * Hasil resolusi rule untuk satu order.
 *
 * `unresolved` bukan kegagalan: §18 menulis "customer dan kurir mengikuti rule
 * yang dipilih merchant", sedangkan **apakah ada rule dasar wajib bila merchant
 * tidak memilih sama sekali** masih terbuka (OPEN-18). Jadi bagian ini tidak
 * mengarang rule dasar diam-diam.
 */
export type RuleResolution =
  | { source: 'merchant'; rule: DisputeRule }
  | { source: 'unresolved'; rule: null; open: 'OPEN-18' }

/** Rule yang berlaku untuk insiden pada order toko ini. */
export function ruleForOrder(
  selection: MerchantRuleSelection,
  categoryId: string,
  options: { effectiveAt?: string } = {},
): RuleResolution {
  // Pilihan baru berlaku sejak `effectiveFrom`; order sebelum itu memakai
  // pilihan sebelumnya (§18). Tanpa riwayat pilihan, versi lama tidak dikarang.
  if (options.effectiveAt && options.effectiveAt < selection.effectiveFrom) {
    return { source: 'unresolved', rule: null, open: 'OPEN-18' }
  }
  const rule = rulesForMerchant(selection).find((item) => item.categoryId === categoryId)
  return rule ? { source: 'merchant', rule } : { source: 'unresolved', rule: null, open: 'OPEN-18' }
}

export function compensationForRule(ruleId: string): Compensation | undefined {
  return RULE_COMPENSATIONS.find((item) => item.ruleId === ruleId)
}

export function punishmentForRule(ruleId: string): Punishment | undefined {
  return RULE_PUNISHMENTS.find((item) => item.ruleId === ruleId)
}

/**
 * Snapshot rule ke order (§18, bagian **Usulan**): perubahan pilihan rule tidak
 * boleh mengubah ketentuan order yang sedang berjalan, jadi versinya dibekukan.
 * Repo ini belum menyimpan snapshot ke BE, jadi bentuknya baru usulan.
 */
export interface RuleSnapshot {
  ruleId: string
  code: string
  version: number
  mitigation: string
  /** Selalu `true` sampai BE menyimpan snapshot ke order. */
  usulan: true
}

export function snapshotRule(rule: DisputeRule): RuleSnapshot {
  return {
    ruleId: rule.id,
    code: rule.code,
    version: rule.version,
    mitigation: rule.mitigation,
    usulan: true,
  }
}
