// Nada notifikasi disintesis lewat Web Audio — tanpa berkas audio apa pun di
// `public/`. Peramban memblok audio sebelum ada interaksi user (autoplay
// policy), jadi AudioContext baru berjalan setelah gesture pertama; sebelum itu
// `play()` diam (bukan error). Satu instance per pemakaian hook.
import { useCallback, useEffect, useRef } from 'react'

type AudioCtor = typeof AudioContext

const resolveCtor = (): AudioCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as typeof window & { webkitAudioContext?: AudioCtor }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

/**
 * Mengembalikan fungsi `play()` yang membunyikan "ding" singkat dua nada.
 * Panggil hanya saat notifikasi baru benar-benar datang; aman dipanggil
 * sebelum gesture (diam sampai AudioContext lolos kebijakan autoplay).
 */
export function useNotificationSound(): () => void {
  const ctxRef = useRef<AudioContext | null>(null)

  const context = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      const Ctor = resolveCtor()
      if (!Ctor) return null
      ctxRef.current = new Ctor()
    }
    return ctxRef.current
  }, [])

  // Buka kunci sekali pada gesture pertama: resume AudioContext yang ditahan
  // kebijakan autoplay, lalu lepas listener-nya.
  useEffect(() => {
    const unlock = () => {
      const ctx = context()
      if (ctx && ctx.state === 'suspended') void ctx.resume()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [context])

  return useCallback(() => {
    const ctx = context()
    if (!ctx || ctx.state !== 'running') return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    // Dua nada naik (880 → 1320 Hz) — terdengar mantap, bukan "klik".
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.setValueAtTime(1320, t + 0.09)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.24)
  }, [context])
}
