/**
 * Tier cashback bulanan live (`cashback_tiers`) — mock dulu, API menimpa.
 * Gagal/kosong = tier mock repo tetap tampil.
 */
import { useEffect, useState } from 'react'

import { fetchRebateTiers } from '../api/reference'
import { apiEnabled } from '../api/supabase'
import { REBATE_TIERS } from '../data/incentive'
import type { RebateTierDef } from '../types'

export function useRebateTiers(): RebateTierDef[] {
  const [remote, setRemote] = useState<RebateTierDef[] | null>(null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchRebateTiers()
      .then((next) => {
        if (alive && next.length) setRemote(next)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return remote ?? REBATE_TIERS
}
