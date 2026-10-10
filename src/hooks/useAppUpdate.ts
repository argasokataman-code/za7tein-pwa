import { useState } from 'react'
import toast from 'react-hot-toast'

import { checkForAppUpdate, promptAppUpdate } from '../lib/appUpdate'

/**
 * Cek pembaruan PWA manual dari halaman setelan/profile.
 *
 * Mengembalikan `checking` (state tombol) + `checkForUpdate` (aksi). Hasil
 * `'updated'` memakai toast yang sama dengan deteksi otomatis di `main.tsx`;
 * `'current'`/`'unsupported'` dijawab toast singkat supaya tombol selalu
 * memberi umpan balik.
 */
export function useAppUpdate() {
  const [checking, setChecking] = useState(false)

  const checkForUpdate = async () => {
    if (checking) return
    setChecking(true)
    try {
      const result = await checkForAppUpdate()
      if (result === 'updated') promptAppUpdate()
      else if (result === 'current') toast.success('Kamu memakai versi terbaru.')
      else toast('Cek pembaruan tersedia di aplikasi terpasang.')
    } finally {
      setChecking(false)
    }
  }

  return { checking, checkForUpdate }
}
