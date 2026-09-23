import { RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { SuperAdminShell } from '../components/layout/SuperAdminShell'
import { saZoneGeometry } from '../data/superadmin'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { resetZone, saveZone } from '../store/slices/superAdminSlice'
import type { ZoneGeometry, ZoneId } from '../types'

type Vertex = { x: number; y: number }

/** Luas poligon (shoelace) dalam satuan kanvas — angka relatif, bukan km². */
function polygonArea(vertices: Vertex[]): number {
  let sum = 0
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i]
    const b = vertices[(i + 1) % vertices.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value * 10) / 10))

/**
 * Master zona. Poligon digambar di kanvas skematik 0..100, bukan peta ber-tile:
 * tile peta selalu URL eksternal dan repo ini melarang aset gambar eksternal
 * (AGENTS.md §6). Geometri sebenarnya milik backend — layar ini menggeser titik
 * lalu menyimpan.
 *
 * Dua jalur input, bukan satu: geser pakai pointer (cepat) dan kolom X/Y yang
 * bisa diketik (satu-satunya jalur yang bisa dipakai keyboard, HG-05).
 */
export default function SaZones() {
  const dispatch = useAppDispatch()
  const zones = useAppSelector((s) => s.superAdmin.zones)
  const tenants = useAppSelector((s) => s.admin.tenants)
  const [draft, setDraft] = useState<Partial<Record<ZoneId, Vertex[]>>>({})
  const [selected, setSelected] = useState<{ zoneId: ZoneId; index: number } | null>(null)
  const [dragging, setDragging] = useState<{ zoneId: ZoneId; index: number } | null>(null)

  const verticesOf = (zone: ZoneGeometry) => draft[zone.id] ?? zone.vertices

  const moveVertex = (zoneId: ZoneId, index: number, x: number, y: number) => {
    const zone = zones.find((z) => z.id === zoneId)
    if (!zone) return
    const next = [...(draft[zoneId] ?? zone.vertices)]
    next[index] = { x: clamp(x), y: clamp(y) }
    setDraft((prev) => ({ ...prev, [zoneId]: next }))
  }

  const activeCount = (key: 'isActiveHijazi' | 'isActiveSyimali') =>
    tenants.filter((t) => t.deliveryConfig[key]).length

  const handlePointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const rect = event.currentTarget.getBoundingClientRect()
    moveVertex(
      dragging.zoneId,
      dragging.index,
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    )
  }

  return (
    <SuperAdminShell>
      <section className="sa-grid-2">
        <article className="sa-card">
          <p className="sa-card-label">Kanvas zona (skematik)</p>
          <svg
            className="sa-canvas"
            viewBox="0 0 100 100"
            role="img"
            aria-label="Kanvas skematik poligon zona Hijazi dan Syimali"
            onPointerMove={handlePointer}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            <defs>
              <pattern id="sa-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0H0V10" fill="none" stroke="var(--border)" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#sa-grid)" />
            {zones.map((zone, zoneIndex) => {
              const vertices = verticesOf(zone)
              return (
                <g key={zone.id}>
                  <polygon
                    className={`sa-canvas-zone sa-canvas-zone--${zoneIndex === 0 ? 'a' : 'b'}`}
                    points={vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                  />
                  {vertices.map((vertex, index) => (
                    <circle
                      key={`${zone.id}-${index}`}
                      className={`sa-canvas-vertex${
                        selected?.zoneId === zone.id && selected.index === index ? ' is-selected' : ''
                      }`}
                      cx={vertex.x}
                      cy={vertex.y}
                      r={2.6}
                      onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId)
                        setDragging({ zoneId: zone.id, index })
                        setSelected({ zoneId: zone.id, index })
                      }}
                    />
                  ))}
                </g>
              )
            })}
          </svg>
          <p className="sa-card-sub">
            Geser titik untuk mengubah bentuk, atau pilih titik lalu pakai kolom X/Y di sebelah
            kanan. Kanvas ini skematik (0..100), bukan peta geografis.
          </p>
        </article>

        <div className="sa-stack">
          {zones.map((zone, zoneIndex) => {
            const vertices = verticesOf(zone)
            const dirty = Boolean(draft[zone.id])
            const isSelectedZone = selected?.zoneId === zone.id
            const key = zone.id === 'hijazi' ? 'isActiveHijazi' : 'isActiveSyimali'
            return (
              <article key={zone.id} className="sa-card">
                <div className="sa-card-head">
                  <div>
                    <p className="sa-card-label">Zona {zoneIndex + 1}</p>
                    <p className="sa-card-title">{zone.label}</p>
                    <p className="sa-card-sub">{zone.note}</p>
                  </div>
                  {dirty ? <span className="sa-chip is-off">Belum disimpan</span> : null}
                </div>

                <ul className="sa-kv">
                  <li>
                    <span>Luas (kanvas relatif)</span>
                    <span>{polygonArea(vertices).toFixed(0)} satuan</span>
                  </li>
                  <li>
                    <span>Titik sudut</span>
                    <span>{vertices.length}</span>
                  </li>
                  <li>
                    <span>Tenant mengaktifkan</span>
                    <span>
                      {activeCount(key)} dari {tenants.length}
                    </span>
                  </li>
                </ul>

                {isSelectedZone && selected ? (
                  <div className="sa-vertex-fields">
                    <label className="sa-field">
                      <span>X titik {selected.index + 1}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={vertices[selected.index].x}
                        onChange={(e) =>
                          moveVertex(zone.id, selected.index, Number(e.target.value), vertices[selected.index].y)
                        }
                      />
                    </label>
                    <label className="sa-field">
                      <span>Y titik {selected.index + 1}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={vertices[selected.index].y}
                        onChange={(e) =>
                          moveVertex(zone.id, selected.index, vertices[selected.index].x, Number(e.target.value))
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <p className="sa-card-sub">Pilih satu titik di kanvas untuk mengedit X/Y lewat keyboard.</p>
                )}

                <div className="sa-actions">
                  <button
                    type="button"
                    className="sa-btn sa-btn--primary"
                    disabled={!dirty}
                    onClick={() => {
                      dispatch(saveZone({ id: zone.id, vertices }))
                      setDraft((prev) => {
                        const next = { ...prev }
                        delete next[zone.id]
                        return next
                      })
                      toast.success(`Poligon ${zone.label} disimpan`)
                    }}
                  >
                    <Save size={16} strokeWidth={1.75} aria-hidden="true" />
                    Simpan poligon
                  </button>
                  <button
                    type="button"
                    className="sa-btn"
                    onClick={() => {
                      dispatch(resetZone({ id: zone.id }))
                      setDraft((prev) => {
                        const next = { ...prev }
                        delete next[zone.id]
                        return next
                      })
                      toast.success(`Poligon ${zone.label} kembali ke bentuk awal`)
                    }}
                  >
                    <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
                    Bentuk awal
                  </button>
                </div>
              </article>
            )
          })}
          <p className="sa-note">
            Bentuk awal disimpan di {`saZoneGeometry`} ({saZoneGeometry.length} zona). Merchant
            tidak bisa mengubah poligon ini — mereka hanya mengaktifkan zona di onboarding.
          </p>
        </div>
      </section>
    </SuperAdminShell>
  )
}
