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

import { fetchFood, fetchMenuItems, fetchStorefront, fetchStorefronts } from '../api/catalog'
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

export function useFood(id: string, fallback: MenuItem): MenuItem {
  const [remote, setRemote] = useState<{ id: string; value: MenuItem | undefined } | null>(null)
  useEffect(() => {
    if (!apiEnabled || !id) return
    let alive = true
    fetchFood(id)
      .then((next) => {
        if (alive) setRemote({ id, value: next })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id])
  return remote && remote.id === id ? (remote.value ?? fallback) : fallback
}
