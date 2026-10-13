/**
 * Hook baca katalog live. Prinsipnya: **mock dulu, API menimpa**. Nilai awal =
 * data mock repo (tampilan tak berkedip), lalu hasil API menggantinya kalau
 * berhasil. Kalau API mati/kosong/error, mock tetap tampil — demo tak pernah
 * pecah karena jaringan.
 *
 * Hasil disimpan bersama `id` permintaannya supaya berpindah rute tak
 * menampilkan data lama; selama id belum cocok, mock dipakai.
 */
import { useEffect, useState } from 'react'

import { fetchAllMenuItems, fetchFood, fetchMenuItems, fetchStorefront, fetchStorefronts } from '../api/catalog'
import { apiEnabled } from '../api/supabase'
import type { MenuItem, Storefront } from '../types'
import { useAppSelector } from './useAppStore'

/** Titik asal customer dari store (alamat default live; `null` sebelum sync). */
function useOrigin() {
  return useAppSelector((s) => s.ui.origin)
}

export function useStorefronts(fallback: Storefront[]): Storefront[] {
  const [remote, setRemote] = useState<Storefront[] | null>(null)
  const origin = useOrigin()
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    const load = () =>
      fetchStorefronts(origin ?? undefined)
        .then((next) => {
          if (alive) setRemote(next)
        })
        .catch(() => {})
    load()
    // ponytail: polling 15 dtk menutup status buka/tutup toko tanpa kanal WS;
    // ganti ke Supabase Realtime (`postgres_changes` di `merchants`) kalau
    // publication-nya sudah siap.
    const timer = setInterval(load, 15_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [origin])
  return remote ?? fallback
}

/**
 * Seluruh menu (semua toko) sekali baca — dipakai beranda untuk menghitung
 * promo per toko dan kategori. Varian diabaikan (ringkasan saja). Mock dipakai
 * sampai API menjawab; API kosong tidak mengosongkan beranda.
 */
export function useAllMenuItems(fallback: MenuItem[]): MenuItem[] {
  const [remote, setRemote] = useState<MenuItem[] | null>(null)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    fetchAllMenuItems()
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

export function useStorefront(id: string, fallback: Storefront | undefined): Storefront | undefined {
  const [remote, setRemote] = useState<{ id: string; value: Storefront | undefined } | null>(null)
  const origin = useOrigin()
  useEffect(() => {
    if (!apiEnabled || !id) return
    let alive = true
    fetchStorefront(id, origin ?? undefined)
      .then((next) => {
        if (alive) setRemote({ id, value: next })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id, origin])
  return remote && remote.id === id ? remote.value : fallback
}

export function useMenuItems(merchantId: string, fallback: MenuItem[]): MenuItem[] {
  const [remote, setRemote] = useState<{ id: string; items: MenuItem[] } | null>(null)
  useEffect(() => {
    if (!apiEnabled || !merchantId) return
    let alive = true
    fetchMenuItems(merchantId)
      .then((next) => {
        if (alive) setRemote({ id: merchantId, items: next })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [merchantId])
  return remote && remote.id === merchantId ? remote.items : fallback
}

export function useFood(
  id: string,
  fallback?: MenuItem,
): { food: MenuItem | undefined; loading: boolean } {
  const [remote, setRemote] = useState<{ id: string; value: MenuItem | undefined } | null>(null)
  const [loading, setLoading] = useState(apiEnabled && Boolean(id))
  useEffect(() => {
    if (!apiEnabled || !id) {
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    fetchFood(id)
      .then((next) => {
        if (!alive) return
        setRemote({ id, value: next })
        setLoading(false)
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id])
  // Tanpa API = mode mock repo (fallback dipakai). Dengan API, mock TIDAK
  // dipakai: belum termuat tampilkan loading, tak ada hasil tampilkan kosong —
  // dulu jatuh ke `items[0]` sehingga refresh menampilkan menu contoh yang
  // berbeda dari yang dibuka (mis. "Sate Ayam").
  if (!apiEnabled) return { food: fallback, loading: false }
  if (remote && remote.id === id) return { food: remote.value, loading: false }
  return { food: undefined, loading }
}
