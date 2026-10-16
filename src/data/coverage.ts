import type { CoveragePolygon, GeoPoint, MerchantCoverage } from '../types'

import { MAX_DELIVERY_METERS, haversineMeters } from './merchant'
import { M_PER_DEG_LAT, M_PER_DEG_LNG, metersPerUnit, pointInPolygon, zoneAreaKm2 } from './zones'
import type { ZoneView } from './zones'

/**
 * Coverage merchant (§9.1, MER-04) — logika murni, tanpa React/Redux.
 *
 * Dua mode, satu kontrak: **area** = beberapa polygon yang **tidak boleh tumpang
 * tindih**, fee melekat per polygon; **radius** = satu radius maksimum + fee per
 * satuan jarak (meter/km). Semua jarak memakai Haversine yang sama dengan gate
 * checkout (`src/data/merchant.ts`), jadi editor dan gate tidak bisa berbeda
 * tafsir.
 *
 * Di produksi, radius menagih fee proporsional dari **rute jalan kaki (WALK)**;
 * repo ini mock (AGENTS.md §1) jadi fee dihitung dari jarak garis lurus. Batas
 * radius tidak dikarang: `C-13` menetapkan jangkauan ≤2 km, dan `MAX_DELIVERY_METERS`
 * sudah memuat angka itu.
 */

export type CoverageUnit = 'meter' | 'km'

export const COVERAGE_UNITS: CoverageUnit[] = ['meter', 'km']

export const COVERAGE_UNIT_LABEL: Record<CoverageUnit, string> = {
  meter: 'Per meter',
  km: 'Per kilometer',
}

/** Radius maksimum mode radius (`C-13`: jangkauan ≤2 km). */
export const MAX_COVERAGE_RADIUS_METERS = MAX_DELIVERY_METERS
/** Radius minimum yang masuk akal; di bawah ini praktis tak mengantar apa pun. */
export const MIN_COVERAGE_RADIUS_METERS = 100

/** Minimal titik sudut satu polygon. */
export const MIN_POLYGON_VERTICES = 3

/** Fee bawaan (JOD), bisa diubah merchant. */
export const DEFAULT_POLYGON_FEE_JOD = 1.5
export const DEFAULT_UNIT_FEE_JOD = 0.5

/** Panjang satu satuan jarak dalam meter. */
export const unitMeters = (unit: CoverageUnit): number => (unit === 'km' ? 1000 : 1)

/* ── Geometri ────────────────────────────────────────────────────────────────
 * Koordinat lat/lng dipakai langsung sebagai bidang datar: area yang diurus
 * hanya beberapa kilometer, jadi kelengkungan bumi tidak berarti di sini.
 */

const cross = (o: GeoPoint, a: GeoPoint, b: GeoPoint): number =>
  (a.lat - o.lat) * (b.lng - o.lng) - (a.lng - o.lng) * (b.lat - o.lat)

const withinBox = (value: number, a: number, b: number): boolean =>
  value >= Math.min(a, b) - 1e-12 && value <= Math.max(a, b) + 1e-12

/** Dua ruas garis berpotongan (termasuk bersinggungan di ujung). */
export function segmentsIntersect(a: GeoPoint, b: GeoPoint, c: GeoPoint, d: GeoPoint): boolean {
  const d1 = cross(c, d, a)
  const d2 = cross(c, d, b)
  const d3 = cross(a, b, c)
  const d4 = cross(a, b, d)
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }
  // Ruas yang segaris dan bertindihan.
  const collinear = (p: GeoPoint, q: GeoPoint, r: GeoPoint) =>
    Math.abs(cross(p, q, r)) < 1e-12 && withinBox(r.lat, p.lat, q.lat) && withinBox(r.lng, p.lng, q.lng)
  return (
    (Math.abs(d1) < 1e-12 && collinear(c, d, a)) ||
    (Math.abs(d2) < 1e-12 && collinear(c, d, b)) ||
    (Math.abs(d3) < 1e-12 && collinear(a, b, c)) ||
    (Math.abs(d4) < 1e-12 && collinear(a, b, d))
  )
}

/** Polygon yang sisinya bersilangan sendiri (bukan bentuk sederhana). */
export function polygonSelfIntersects(vertices: GeoPoint[]): boolean {
  const n = vertices.length
  if (n < 4) return false
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      // Sisi yang bersebelahan memang berbagi ujung; itu wajar.
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue
      if (segmentsIntersect(vertices[i], vertices[(i + 1) % n], vertices[j], vertices[(j + 1) % n])) {
        return true
      }
    }
  }
  return false
}

/** Dua polygon bertumpuk (sisi berpotongan, atau satu titik di dalam yang lain). */
export function polygonsOverlap(a: GeoPoint[], b: GeoPoint[]): boolean {
  const n = a.length
  const m = b.length
  if (n < 3 || m < 3) return false
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < m; j += 1) {
      if (segmentsIntersect(a[i], a[(i + 1) % n], b[j], b[(j + 1) % m])) return true
    }
  }
  return pointInPolygon(a[0], b) || pointInPolygon(b[0], a)
}

/* ── Query coverage ───────────────────────────────────────────────────────── */

/** Polygon (mode area) yang memuat titik ini. */
export function polygonForPoint(
  coverage: MerchantCoverage,
  point: GeoPoint,
): CoveragePolygon | null {
  return coverage.polygons.find((polygon) => pointInPolygon(point, polygon.vertices)) ?? null
}

/**
 * Apakah titik ini masuk coverage merchant. Mode radius = jarak garis lurus ke
 * dapur ≤ radius; mode area = di dalam salah satu polygon.
 */
export function coverageContainsPoint(
  coverage: MerchantCoverage,
  point: GeoPoint,
  kitchen: GeoPoint,
): boolean {
  if (coverage.mode === 'radius') {
    return haversineMeters(point, kitchen) <= (coverage.radiusMeters ?? 0)
  }
  return polygonForPoint(coverage, point) !== null
}

/** Fee (JOD) untuk satu titik: fee polygon yang memuatnya, atau proporsional jarak. */
export function coverageFeeJod(
  coverage: MerchantCoverage,
  point: GeoPoint,
  kitchen: GeoPoint,
): number {
  if (coverage.mode === 'radius') {
    const unit = coverage.unit ?? 'km'
    const units = haversineMeters(point, kitchen) / unitMeters(unit)
    return (coverage.feePerUnitJod ?? 0) * units
  }
  return polygonForPoint(coverage, point)?.feeJod ?? 0
}

/** Luas seluruh area (km²) — mode radius dihitung sebagai lingkaran. */
export function coverageAreaKm2(coverage: MerchantCoverage): number {
  if (coverage.mode === 'radius') {
    const meters = coverage.radiusMeters ?? 0
    return (Math.PI * meters * meters) / 1_000_000
  }
  return coverage.polygons.reduce((sum, polygon) => sum + zoneAreaKm2(polygon.vertices), 0)
}

/** Radius (mode radius) dalam satuan kanvas, untuk menggambar lingkarannya. */
export function coverageRadiusUnits(coverage: MerchantCoverage, view: ZoneView): number {
  return (coverage.radiusMeters ?? 0) / metersPerUnit(view)
}

/* ── Validasi ─────────────────────────────────────────────────────────────── */

export interface CoverageIssue {
  /** Ada kalau masalahnya milik satu polygon tertentu. */
  polygonId?: string
  message: string
}

/**
 * Daftar masalah coverage. Kosong = bentuk sah. Aturan yang dijaga di sini:
 * polygon ≥3 titik, tidak bersilangan sendiri, **tidak tumpang tindih** dengan
 * polygon lain (§9.1), fee tidak negatif, radius dalam batas `C-13`.
 */
export function validateCoverage(coverage: MerchantCoverage): CoverageIssue[] {
  const issues: CoverageIssue[] = []

  if (coverage.mode === 'radius') {
    const radius = coverage.radiusMeters ?? 0
    if (radius < MIN_COVERAGE_RADIUS_METERS) {
      issues.push({ message: `Radius minimal ${MIN_COVERAGE_RADIUS_METERS} m` })
    } else if (radius > MAX_COVERAGE_RADIUS_METERS) {
      issues.push({ message: `Radius melebihi batas ${MAX_COVERAGE_RADIUS_METERS} m` })
    }
    if ((coverage.feePerUnitJod ?? 0) < 0) {
      issues.push({ message: 'Fee per satuan tidak boleh negatif' })
    }
    return issues
  }

  if (coverage.polygons.length === 0) {
    issues.push({ message: 'Tambahkan minimal satu area' })
  }

  coverage.polygons.forEach((polygon) => {
    if (polygon.vertices.length < MIN_POLYGON_VERTICES) {
      issues.push({ polygonId: polygon.id, message: `Area butuh minimal ${MIN_POLYGON_VERTICES} titik` })
    } else if (polygonSelfIntersects(polygon.vertices)) {
      issues.push({ polygonId: polygon.id, message: 'Garis area bersilangan sendiri' })
    }
    if (polygon.feeJod < 0) {
      issues.push({ polygonId: polygon.id, message: 'Fee area tidak boleh negatif' })
    }
  })

  for (let i = 0; i < coverage.polygons.length; i += 1) {
    for (let j = i + 1; j < coverage.polygons.length; j += 1) {
      const a = coverage.polygons[i]
      const b = coverage.polygons[j]
      if (polygonsOverlap(a.vertices, b.vertices)) {
        issues.push({ polygonId: a.id, message: 'Area tumpang tindih dengan area lain' })
      }
    }
  }

  return issues
}

/* ── Bantu editor ─────────────────────────────────────────────────────────── */

/** Id polygon baru yang belum dipakai. */
export function nextPolygonId(polygons: CoveragePolygon[]): string {
  let index = polygons.length + 1
  while (polygons.some((polygon) => polygon.id === `area-${index}`)) index += 1
  return `area-${index}`
}

/**
 * Polygon bawaan saat merchant menambah area: persegi kecil di sekitar dapur,
 * supaya bentuknya langsung terlihat dan bisa digeser (bukan titik kosong yang
 * tak bisa dipahami).
 */
export function polygonAround(center: GeoPoint, sideMeters = 400): GeoPoint[] {
  const dLat = sideMeters / M_PER_DEG_LAT
  const dLng = sideMeters / (M_PER_DEG_LNG * Math.cos((center.lat * Math.PI) / 180))
  return [
    { lat: center.lat + dLat, lng: center.lng - dLng },
    { lat: center.lat + dLat, lng: center.lng + dLng },
    { lat: center.lat - dLat, lng: center.lng + dLng },
    { lat: center.lat - dLat, lng: center.lng - dLng },
  ]
}
