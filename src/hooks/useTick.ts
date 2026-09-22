import { useEffect, useState } from 'react'

/**
 * `Date.now()` yang diperbarui tiap `intervalMs`, untuk hitung mundur SLA.
 * Dikembalikan sebagai objek polos supaya konsisten dengan hook lain di repo.
 */
export function useTick(intervalMs = 1000): { now: number } {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return { now }
}
