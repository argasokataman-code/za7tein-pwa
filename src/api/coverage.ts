/**
 * Coverage merchant (§9.1, MER-04) ↔ `coverage_zones`.
 *
 * Kontrak live (diverifikasi 2026-10-17): `id, merchant_id, mode,
 * center_lat, center_lng, radius_m, polygon, delivery_fee_jod, active,
 * created_at`. Mode `radius` memakai center + `radius_m`; mode `area` memakai
 * `polygon` (array `[lat,lng]`, sama seperti `zones.polygon`).
 *
 * FE menyimpan radius **dan** beberapa polygon dalam satu `MerchantCoverage`,
 * sedangkan BE menyimpan satu baris per zona. Pemetaan radius = satu baris;
 * area = satu baris per polygon. Tulis memakai sesi merchant (RLS pemilik).
 */
import { MERCHANT_KITCHEN } from '../data/zones'
import { merchantToken } from './reference'
import { apiEnabled, createWith, patch, restWith } from './supabase'
import type { GeoPoint, MerchantCoverage } from '../types'

interface ZoneRow {
  id: number
  merchant_id: number
  mode: string | null
  center_lat: number | null
  center_lng: number | null
  radius_m: number | null
  polygon: Array<[number, number]> | null
  delivery_fee_jod: number | null
  active: boolean | null
}

/** `MerchantCoverage` live satu merchant; `undefined` kalau belum punya baris. */
export async function fetchMerchantCoverage(
  merchantId: string,
): Promise<MerchantCoverage | undefined> {
  if (!apiEnabled) return undefined
  const token = await merchantToken()
  const rows = await restWith<ZoneRow>(
    token,
    'coverage_zones',
    `?select=*&merchant_id=eq.${merchantId}&active=is.true&order=id.asc`,
  )
  if (!rows.length) return undefined
  const area = rows.filter((r) => r.mode === 'area' && Array.isArray(r.polygon))
  const centerOf = (row: ZoneRow): GeoPoint => ({
    lat: row.center_lat ?? MERCHANT_KITCHEN.lat,
    lng: row.center_lng ?? MERCHANT_KITCHEN.lng,
  })
  if (area.length) {
    return {
      merchantId,
      mode: 'area',
      origin: centerOf(area[0]),
      polygons: area.map((r) => ({
        id: `be-cz-${r.id}`,
        vertices: (r.polygon ?? []).map(([lat, lng]) => ({ lat, lng })),
        feeJod: r.delivery_fee_jod ?? 0,
      })),
      unit: 'km',
    }
  }
  const radius = rows[0]
  return {
    merchantId,
    mode: 'radius',
    origin: centerOf(radius),
    polygons: [],
    radiusMeters: radius.radius_m ?? 0,
    feePerUnitJod: radius.delivery_fee_jod ?? 0,
    unit: 'km',
  }
}

/**
 * Simpan coverage live. Radius = satu baris; area = satu baris per polygon.
 * ponytail: baris lama yang berlebih tidak dihapus (tak ada halaman yang butuh
 * itu sekarang) — tambah DELETE begitu merchant bisa mengurangi jumlah polygon.
 */
export async function saveMerchantCoverage(coverage: MerchantCoverage): Promise<void> {
  if (!apiEnabled) return
  const token = await merchantToken()
  const merchantId = Number(coverage.merchantId)
  if (!Number.isFinite(merchantId)) return
  const existing = await restWith<{ id: number }>(
    token,
    'coverage_zones',
    `?select=id&merchant_id=eq.${merchantId}&order=id.asc`,
  )

  const rows: { body: Record<string, unknown>; id?: number }[] = []
  const center = coverage.origin ?? MERCHANT_KITCHEN
  if (coverage.mode === 'radius') {
    rows.push({
      id: existing[0]?.id,
      body: {
        merchant_id: merchantId,
        mode: 'radius',
        center_lat: center.lat,
        center_lng: center.lng,
        radius_m: coverage.radiusMeters ?? 0,
        polygon: null,
        delivery_fee_jod: coverage.feePerUnitJod ?? 0,
        active: true,
      },
    })
  } else {
    coverage.polygons.forEach((polygon, index) => {
      rows.push({
        id: existing[index]?.id,
        body: {
          merchant_id: merchantId,
          mode: 'area',
          center_lat: center.lat,
          center_lng: center.lng,
          radius_m: null,
          polygon: polygon.vertices.map((v: GeoPoint) => [v.lat, v.lng]),
          delivery_fee_jod: polygon.feeJod,
          active: true,
        },
      })
    })
  }

  for (const row of rows) {
    if (row.id !== undefined) {
      await patch(token, 'coverage_zones', `?id=eq.${row.id}`, row.body)
    } else {
      await createWith(token, 'coverage_zones', row.body)
    }
  }
}
