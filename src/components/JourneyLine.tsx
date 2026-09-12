import { Bike, Check, Home, Utensils, type LucideIcon } from 'lucide-react'

import { ORDER_STAGES } from '../data/merchant'
import type { OrderStage } from '../types'

/**
 * Sa7tein Journey Line.
 *
 * Satu rel bertitik untuk status pesanan: simpul selesai berupa centang hijau
 * redup, simpul aktif cincin oranye, sisanya lingkaran kosong abu hangat.
 * Dipakai layar tahap pesanan dan pratinjau landing supaya status pesanan
 * tetap satu model lintas peran.
 */

type NodeState = 'done' | 'active' | 'todo'

/** Ikon tiap tahap, memakai lucide yang sudah jadi bahasa ikon aplikasi. */
const STEP_ICON: Record<OrderStage, LucideIcon> = {
  diterima: Check,
  dimasak: Utensils,
  diantar: Bike,
  tiba: Home,
}

interface JourneyLineProps {
  stage: OrderStage
  className?: string
}

export function JourneyLine({ stage, className = '' }: JourneyLineProps) {
  const activeIndex = ORDER_STAGES.findIndex((s) => s.id === stage)
  const stateOf = (i: number): NodeState =>
    i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo'

  return (
    <div className={`journey ${className}`.trim()}>
      <div className="journey-rail">
        {ORDER_STAGES.map((s, i) => {
          const Icon = STEP_ICON[s.id]
          const st = stateOf(i)
          return (
            <span key={s.id} className={`journey-cell journey-cell--${st}`}>
              <span className={`journey-node journey-node--${st}`}>
                <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
              </span>
            </span>
          )
        })}
      </div>
      <div className="journey-labels">
        {ORDER_STAGES.map((s, i) => (
          <span key={s.id} className={`journey-label journey-label--${stateOf(i)}`}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
