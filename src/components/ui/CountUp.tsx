import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Angka yang berhitung naik saat mount — dipakai untuk nominal uang di Ringkasan
 * supaya angka besar "datang" alih-alih muncul mendadak.
 *
 * `format` memakai formatter uang yang sudah ada (`moneyFromJod`), jadi tidak ada
 * pembulatan baru di sini. Kalau pengguna meminta gerak dikurangi, nilai final
 * langsung dipakai dan tidak ada rAF yang dijadwalkan.
 */
interface CountUpProps {
  value: number
  format: (value: number) => string
  durationMs?: number
}

export function CountUp({ value, format, durationMs = 480 }: CountUpProps) {
  const { reducedMotion } = usePrefersReducedMotion()
  const [shown, setShown] = useState(() => (reducedMotion ? value : 0))
  const frame = useRef(0)

  useEffect(() => {
    if (reducedMotion) return

    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setShown(value * eased)
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, durationMs, reducedMotion])

  return <>{format(reducedMotion ? value : shown)}</>
}
