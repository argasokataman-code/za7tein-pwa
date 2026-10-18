import { batchNumber } from '../../data/batch'
import type { Batch } from '../../types'

interface BatchFilterProps {
  batches: Batch[]
  /** `null` = semua batch. */
  value: string | null
  onChange: (batchId: string | null) => void
}

/**
 * Penyaring daftar order per batch (PRD §8). Order Regular bisa berada di beberapa
 * batch sekaligus; chip ini membuat "batch mana yang mana" terlihat dan bisa
 * disaring tanpa membuka panel Batch di atas daftar.
 *
 * Memakai chip design system yang sudah ada (`.merchant-menu-chips` +
 * `.merchant-chip`), bukan kontrol baru.
 */
export function BatchFilter({ batches, value, onChange }: BatchFilterProps) {
  if (batches.length === 0) return null

  return (
    <div className="merchant-menu-chips" role="group" aria-label="Saring order per batch">
      <button
        type="button"
        className={`merchant-chip${value === null ? ' is-active' : ''}`}
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        Semua
      </button>
      {batches.map((batch) => {
        const number = batchNumber(batch.id)
        const active = value === batch.id
        return (
          <button
            key={batch.id}
            type="button"
            className={`merchant-chip${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(batch.id)}
          >
            {number === null ? 'Batch' : `#${number}`}
          </button>
        )
      })}
    </div>
  )
}
