/**
 * Menu live satu merchant dari BE (`menus`) — **tanpa fallback mock**. Konsol
 * merchant membaca apa yang benar-benar ada di D1; `reload` dipakai setelah tulis
 * (tambah/ubah/stok/hapus) supaya daftar mencerminkan baris yang baru.
 */
import { useCallback, useEffect, useState } from 'react'

import { fetchMenuItems } from '../api/catalog'
import { apiEnabled } from '../api/supabase'
import type { MenuItem } from '../types'

export function useMerchantMenu(merchantId: string) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)

  const reload = useCallback(() => {
    if (!apiEnabled || !merchantId) {
      setLoading(false)
      return Promise.resolve()
    }
    setLoading(true)
    return fetchMenuItems(merchantId)
      .then((next) => {
        setItems(next)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [merchantId])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, loading, error, reload }
}
