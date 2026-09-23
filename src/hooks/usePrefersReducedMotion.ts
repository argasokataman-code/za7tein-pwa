import { useEffect, useState } from 'react'

/**
 * Apakah pengguna meminta gerak dikurangi (`prefers-reduced-motion: reduce`).
 *
 * Dipakai komponen animasi (count-up, donut) untuk memilih jalur "tampil jadi"
 * alih-alih beranimasi. Ikut berubah kalau setelan OS diubah saat aplikasi
 * terbuka, jadi keputusannya tidak terkunci saat mount.
 */
export function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return { reducedMotion }
}
