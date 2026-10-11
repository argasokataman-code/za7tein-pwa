import { useEffect, useState } from 'react'

/**
 * Apakah viewport cocok dengan sebuah media query.
 *
 * Dipakai untuk cabang **render** yang tak bisa dikerjakan CSS: dua susunan DOM
 * yang berbeda (mis. master-detail Sengketa di desktop vs kartu bertumpuk di
 * ponsel), bukan sekadar gaya. Ikut berubah saat viewport diubah, jadi
 * keputusannya tidak terkunci saat mount.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}
