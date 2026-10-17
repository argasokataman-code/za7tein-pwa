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
import type { OpsPlatformConfig, OpsTag, OpsTagStatus } from '../types'
import { refToken } from './reference'
import { apiEnabled, patch, restWith, rpc } from './supabase'

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
