/**
 * Kategori ops/BE (`menu_categories`) — taksonomi kategori konsol merchant,
 * baca-saja. Mock (4 bucket customer) dipakai sampai API menjawab; API kosong
 * tidak mengosongkan dropdown.
 */
import { useEffect, useState } from 'react'

import { fetchMenuCategories } from '../api/catalog'
import { apiEnabled } from '../api/supabase'
import type { Category } from '../types'

export function useMenuCategories(fallback: Category[]): Category[] {
  const [remote, setRemote] = useState<Category[] | null>(null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchMenuCategories()
      .then((next) => {
        if (alive && next.length) setRemote(next)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return remote ?? fallback
}
