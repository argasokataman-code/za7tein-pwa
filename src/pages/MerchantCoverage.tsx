import { AlertTriangle, Check, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { fetchMerchantCoverage, saveMerchantCoverage } from '../api/coverage'
import { DEMO_MERCHANT_ID } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { SelectField } from '../components/ui/SelectField'
import {
  COVERAGE_UNIT_LABEL,
  COVERAGE_UNITS,
  type CoverageUnit,
  MAX_COVERAGE_RADIUS_METERS,
  MIN_COVERAGE_RADIUS_METERS,
  coverageAreaKm2,
  coverageContainsPoint,
  coverageFeeJod,
  coverageRadiusUnits,
  nextPolygonId,
  polygonAround,
  validateCoverage,
} from '../data/coverage'
import { jod } from '../data/currency'
import { M_PER_DEG_LAT, M_PER_DEG_LNG, MERCHANT_KITCHEN, projectPoint, unprojectPoint, zoneView } from '../data/zones'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import {
  addPolygon,
  removePolygon,
  replaceCoverage,
  resetCoverage,
  setFeePerUnitJod,
  setMode,
  setPolygonFee,
  setPolygonVertices,
  setRadiusMeters,
  setUnit,
} from '../store/slices/coverageSlice'
import type { GeoPoint } from '../types'

/** Satu contoh titik untuk memperlihatkan fee masuk/keluar area. */
const SAMPLE_OFFSET = { lat: -6.2608, lng: 106.7812 }

const cornersAround = (center: GeoPoint, meters: number): GeoPoint[] => {
  const dLat = meters / M_PER_DEG_LAT
  const dLng = meters / (M_PER_DEG_LNG * Math.cos((center.lat * Math.PI) / 180))
  return [
    { lat: center.lat + dLat, lng: center.lng + dLng },
    { lat: center.lat - dLat, lng: center.lng - dLng },
  ]
}

/**
 * Editor coverage merchant (§9.1, MER-04). Merchant memilih **mode area**
 * (beberapa polygon, tak boleh tumpang tindih, fee per polygon) atau **mode
 * radius** (radius maks ≤2 km + fee per satuan jarak, meter/km).
 *
 * Kanvas menggambar lat/lng hasil proyeksi, bukan tile peta (AGENTS.md §6).
 * Semua jarak memakai Haversine yang sama dengan gate checkout, jadi bentuk yang
 * terlihat di sini persis yang dipakai menentukan alamat bisa diantar.
 *
 * Coverage tersambung ke tabel `coverage_zones` (`src/api/coverage.ts`): dibaca
 * saat halaman dibuka dan ditulis saat "Simpan". Redux tetap sumber tampilan.
 */
export default function MerchantCoverage() {
  const dispatch = useAppDispatch()
  const coverage = useAppSelector((state) => state.coverage)
  const kitchen = MERCHANT_KITCHEN

  const [selectedId, setSelectedId] = useState<string | null>(coverage.polygons[0]?.id ?? null)
  const [dragging, setDragging] = useState<{ id: string; index: number } | null>(null)
  const [addingPoint, setAddingPoint] = useState(false)

  // Baca live; mock tetap kalau merchant belum punya zona (demo merchant punya).
  useEffect(() => {
    if (!apiEnabled) return
    fetchMerchantCoverage(String(DEMO_MERCHANT_ID))
      .then((live) => {
        if (live) dispatch(replaceCoverage(live))
      })
      .catch(() => {})
  }, [dispatch])

  const issues = validateCoverage(coverage)
  const areaKm2 = coverageAreaKm2(coverage)
  const radiusMeters = coverage.radiusMeters ?? 0
  const unit: CoverageUnit = coverage.unit ?? 'km'

  const viewPoints = coverage.mode === 'radius' ? cornersAround(kitchen, radiusMeters) : []
  const view = zoneView(coverage.polygons, [kitchen, SAMPLE_OFFSET, ...viewPoints], 1.45)

  const toCanvas = (point: GeoPoint) => projectPoint(point, view)

  const pointAt = (event: React.PointerEvent<SVGSVGElement>): GeoPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clamp = (value: number) => Math.min(100, Math.max(0, value))
    return unprojectPoint(
      {
        x: clamp(((event.clientX - rect.left) / rect.width) * 100),
        y: clamp(((event.clientY - rect.top) / rect.height) * 100),
      },
      view,
    )
  }

  const onCanvasDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragging || !addingPoint || !selectedId) return
    const polygon = coverage.polygons.find((item) => item.id === selectedId)
    if (!polygon) return
    dispatch(setPolygonVertices({ id: selectedId, vertices: [...polygon.vertices, pointAt(event)] }))
    setAddingPoint(false)
  }

  const onCanvasMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const polygon = coverage.polygons.find((item) => item.id === dragging.id)
    if (!polygon) return
    const vertices = polygon.vertices.map((vertex, index) =>
      index === dragging.index ? pointAt(event) : vertex,
    )
    dispatch(setPolygonVertices({ id: dragging.id, vertices }))
  }

  const addArea = () => {
    const id = nextPolygonId(coverage.polygons)
    dispatch(addPolygon(polygonAround(kitchen, 400)))
    setSelectedId(id)
    setAddingPoint(false)
  }

  const sampleInside = coverageContainsPoint(coverage, SAMPLE_OFFSET, kitchen)

  return (
    <div className="app-shell">
      <MerchantPageHeader eyebrow="Pengiriman" title="Area layanan" back="/" />

      <main className="merchant-page">
        <PlatformNotice message="Area layanan disimpan ke `coverage_zones` di server saat tombol Simpan ditekan. Bentuk juga ikut tersimpan di perangkat." />

        <div className="merchant-chip-row" role="group" aria-label="Mode area layanan">
          {(['area', 'radius'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`merchant-chip${coverage.mode === mode ? ' is-active' : ''}`}
              aria-pressed={coverage.mode === mode}
              onClick={() => dispatch(setMode(mode))}
            >
              {mode === 'area' ? 'Area (peta)' : 'Radius'}
            </button>
          ))}
        </div>

        <div className="merchant-card">
          <svg
            className="coverage-canvas"
            viewBox="0 0 100 100"
            role="img"
            aria-label="Kanvas area layanan merchant beserta dapur dan contoh titik alamat"
            onPointerDown={onCanvasDown}
            onPointerMove={onCanvasMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            <defs>
              <pattern id="coverage-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0H0V10" fill="none" stroke="var(--border)" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#coverage-grid)" />

            {coverage.mode === 'radius' ? (
              <circle
                className="coverage-canvas-ring"
                cx={toCanvas(kitchen).x}
                cy={toCanvas(kitchen).y}
                r={coverageRadiusUnits(coverage, view)}
              />
            ) : null}

            {coverage.polygons.map((polygon) => (
              <g key={polygon.id}>
                <polygon
                  className={`coverage-canvas-zone${polygon.id === selectedId ? ' is-active' : ''}${
                    issues.some((issue) => issue.polygonId === polygon.id) ? ' is-invalid' : ''
                  }`}
                  points={polygon.vertices
                    .map((vertex) => {
                      const point = toCanvas(vertex)
                      return `${point.x},${point.y}`
                    })
                    .join(' ')}
                  onPointerDown={() => setSelectedId(polygon.id)}
                />
                {polygon.vertices.map((vertex, index) => {
                  const point = toCanvas(vertex)
                  return (
                    <circle
                      key={`${polygon.id}-${index}`}
                      className={`coverage-canvas-vertex${
                        dragging?.id === polygon.id && dragging.index === index ? ' is-selected' : ''
                      }`}
                      cx={point.x}
                      cy={point.y}
                      r={2.6}
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        event.currentTarget.setPointerCapture(event.pointerId)
                        setSelectedId(polygon.id)
                        setDragging({ id: polygon.id, index })
                      }}
                    />
                  )
                })}
              </g>
            ))}

            <circle
              className="coverage-canvas-kitchen"
              cx={toCanvas(kitchen).x}
              cy={toCanvas(kitchen).y}
              r={1.6}
            />
            <circle
              className={`coverage-canvas-dot${sampleInside ? ' is-active' : ''}`}
              cx={toCanvas(SAMPLE_OFFSET).x}
              cy={toCanvas(SAMPLE_OFFSET).y}
              r={1.8}
            />
          </svg>

          <ul className="coverage-legend">
            <li>
              <span className="coverage-swatch coverage-swatch--zone" /> Area layanan
            </li>
            <li>
              <span className="coverage-swatch coverage-swatch--ring" /> Radius maksimum
            </li>
            <li>
              <span className="coverage-swatch coverage-swatch--dot" /> Contoh titik alamat
            </li>
          </ul>

          <ul className="coverage-kv">
            <li>
              <span>Luas jangkauan</span>
              <strong>{areaKm2.toFixed(2)} km²</strong>
            </li>
            <li>
              <span>Contoh titik alamat</span>
              <strong>{sampleInside ? `Bisa diantar · ${jod(coverageFeeJod(coverage, SAMPLE_OFFSET, kitchen))} JOD` : 'Di luar area'}</strong>
            </li>
          </ul>
        </div>

        {coverage.mode === 'area' ? (
          <div className="merchant-card">
            <h3 className="merchant-card-title">Area</h3>
            <p className="merchant-card-sub">
              Tiap area punya fee sendiri. Area tidak boleh tumpang tindih dengan area lain.
            </p>

            {coverage.polygons.map((polygon) => (
              <div
                key={polygon.id}
                className={`coverage-area-row${polygon.id === selectedId ? ' is-active' : ''}`}
              >
                <button
                  type="button"
                  className="coverage-area-select"
                  aria-pressed={polygon.id === selectedId}
                  onClick={() => setSelectedId(polygon.id)}
                >
                  <span>Area {polygon.id.replace('area-', '#')}</span>
                  <em>
                    {polygon.vertices.length} titik · {polygon.feeJod} JOD
                  </em>
                </button>
                <button
                  type="button"
                  className="coverage-area-delete"
                  aria-label="Hapus area"
                  onClick={() => {
                    dispatch(removePolygon(polygon.id))
                    if (selectedId === polygon.id) setSelectedId(null)
                  }}
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            ))}

            <div className="merchant-actions">
              <button type="button" className="btn" onClick={addArea}>
                <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
                Tambah area
              </button>
              <button
                type="button"
                className="btn"
                disabled={!selectedId}
                onClick={() => setAddingPoint(true)}
              >
                {addingPoint ? 'Ketuk peta untuk menaruh titik' : 'Tambah titik'}
              </button>
            </div>

            {selectedId ? (
              <div className="form-group">
                <label className="form-label" htmlFor="area-fee">
                  Fee area terpilih (JOD)
                </label>
                <input
                  id="area-fee"
                  type="number"
                  className="form-control"
                  min={0}
                  step={0.1}
                  value={coverage.polygons.find((polygon) => polygon.id === selectedId)?.feeJod ?? 0}
                  onChange={(event) =>
                    dispatch(setPolygonFee({ id: selectedId, feeJod: Number(event.target.value) }))
                  }
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="merchant-card">
            <h3 className="merchant-card-title">Radius</h3>
            <p className="merchant-card-sub">
              Satu lingkaran dari dapur. Batas maksimum {MAX_COVERAGE_RADIUS_METERS / 1000} km.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="coverage-radius">
                Radius maksimum — {(radiusMeters / 1000).toFixed(1)} km
              </label>
              <input
                id="coverage-radius"
                type="range"
                className="form-control"
                min={MIN_COVERAGE_RADIUS_METERS}
                max={MAX_COVERAGE_RADIUS_METERS}
                step={100}
                value={radiusMeters}
                onChange={(event) => dispatch(setRadiusMeters(Number(event.target.value)))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="coverage-fee">
                Fee per satuan (JOD)
              </label>
              <input
                id="coverage-fee"
                type="number"
                className="form-control"
                min={0}
                step={0.1}
                value={coverage.feePerUnitJod ?? 0}
                onChange={(event) => dispatch(setFeePerUnitJod(Number(event.target.value)))}
              />
            </div>

            <div className="form-group">
              <span className="form-label">Satuan jarak</span>
              <SelectField
                label="Satuan jarak"
                options={COVERAGE_UNITS.map((item) => COVERAGE_UNIT_LABEL[item])}
                value={COVERAGE_UNIT_LABEL[unit]}
                onChange={(label) => {
                  const next = COVERAGE_UNITS.find((item) => COVERAGE_UNIT_LABEL[item] === label)
                  if (next) dispatch(setUnit(next))
                }}
                placeholder="Pilih satuan"
              />
            </div>
          </div>
        )}

        <div className="merchant-card">
          {issues.length === 0 ? (
            <p className="coverage-ok">
              <Check size={16} strokeWidth={1.75} aria-hidden="true" /> Bentuk area layanan valid.
            </p>
          ) : (
            <ul className="coverage-issues">
              {issues.map((issue) => (
                <li key={`${issue.polygonId ?? 'all'}-${issue.message}`}>
                  <AlertTriangle size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="merchant-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                dispatch(resetCoverage())
                setSelectedId(null)
                setAddingPoint(false)
                toast.success('Area layanan kembali ke bentuk awal')
              }}
            >
              <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
              Bentuk awal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={issues.length > 0}
              onClick={() => {
                void saveMerchantCoverage(coverage)
                  .then(() => toast.success('Area layanan disimpan ke server'))
                  .catch(() => toast.error('Gagal menyimpan ke server — tersimpan di perangkat'))
              }}
            >
              <Check size={16} strokeWidth={1.75} aria-hidden="true" />
              Simpan area layanan
            </button>
          </div>
        </div>
      </main>

      <MerchantBottomNav />
    </div>
  )
}
