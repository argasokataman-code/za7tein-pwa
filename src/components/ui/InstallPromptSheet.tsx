import { useEffect, useState } from 'react'

import { InstallAppCard } from './InstallAppCard'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/** Kunci penolakan: sekali ditutup, kartu tidak muncul lagi di peramban itu. */
const DISMISS_KEY = 'sa7tein:install-prompt-dismissed'

/**
 * Kartu "Pasang aplikasi" yang muncul sendiri saat URL pertama kali dibuka.
 * Tanpa ini kartunya cuma ada di dalam Profil, jadi pengguna yang baru datang
 * dari tautan tidak pernah tahu aplikasinya bisa dipasang.
 *
 * Sengaja **bukan modal**. Dulu wadahnya `inset: 0` dengan latar gelap dan
 * menangkap seluruh layar, sehingga di `/merchant/orders` ia menutupi tombol
 * "Terima" sampai "Nanti saja" ditekan. Sekarang bilah kartu di bawah, dibatasi
 * kolom, dan sisa halaman tetap terbaca serta bisa diklik.
 *
 * Isinya `InstallAppCard` yang sama — satu tempat logika prompt, satu tempat
 * salinan teks. Prompt native tetap tidak bisa dipaksa: Chrome/Brave baru
 * menampilkannya setelah ketukan, dan iOS Safari tidak punya (isinya langkah
 * manual).
 */
export function InstallPromptSheet() {
  const { hidden } = useInstallPrompt()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (hidden || localStorage.getItem(DISMISS_KEY)) return
    // Jeda singkat: kartu yang menimpa layar pembuka terasa seperti kesalahan,
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
    <aside className="install-prompt" aria-label="Pasang aplikasi">
      <div className="install-prompt-box">
        <InstallAppCard forceVisible />
        <button type="button" className="install-prompt-later" onClick={dismiss}>
          Nanti saja
        </button>
      </div>
    </aside>
  )
}
