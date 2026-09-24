import { useEffect, useState } from 'react'

import { InstallAppCard } from './InstallAppCard'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/** Kunci penolakan: sekali ditutup, modal tidak muncul lagi di peramban itu. */
const DISMISS_KEY = 'sa7tein:install-prompt-dismissed'

/**
 * Modal "Pasang aplikasi" yang muncul sendiri saat URL pertama kali dibuka.
 * Tanpa ini kartunya cuma ada di dalam Profil, jadi pengguna yang baru datang
 * dari tautan tidak pernah tahu aplikasinya bisa dipasang.
 *
 * Isinya `InstallAppCard` yang sama — satu tempat logika prompt, satu tempat
 * salinan teks. Modal tidak bisa memaksa dialog native: Chrome/Brave baru
 * menampilkan prompt setelah ketukan, dan iOS Safari tidak punya prompt sama
 * sekali (isinya langkah manual).
 */
export function InstallPromptSheet() {
  const { hidden } = useInstallPrompt()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (hidden || localStorage.getItem(DISMISS_KEY)) return
    // Jeda singkat: modal yang menimpa layar pembuka terasa seperti kesalahan,
    // bukan sambutan.
    const timer = window.setTimeout(() => setOpen(true), 1200)
    return () => window.clearTimeout(timer)
  }, [hidden])

  if (hidden || !open) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setOpen(false)
  }

  return (
    <div
      className="install-prompt"
      role="dialog"
      aria-modal="true"
      aria-label="Pasang aplikasi"
    >
      <div className="install-prompt-box">
        <InstallAppCard />
        <button type="button" className="install-prompt-later" onClick={dismiss}>
          Nanti saja
        </button>
      </div>
    </div>
  )
}
