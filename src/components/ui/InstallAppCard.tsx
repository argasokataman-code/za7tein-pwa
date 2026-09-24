import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/**
 * Kartu "Pasang aplikasi" untuk keempat peran. Satu komponen supaya tidak ada
 * empat salinan logika `beforeinstallprompt` — logikanya di `useInstallPrompt`.
 *
 * Kalau browser belum menawarkan prompt (iOS Safari, Firefox, atau prompt belum
 * siap), tombolnya menjadi instruksi manual, bukan tombol yang diam saja.
 * Kartu ini menyembunyikan dirinya sendiri saat aplikasi sudah terpasang.
 */
export function InstallAppCard() {
  const { hidden, canPrompt, install } = useInstallPrompt()

  if (hidden) return null

  const handleInstall = async () => {
    const prompted = await install()
    if (!prompted) {
      toast('Buka menu Bagikan di browser, lalu pilih Tambahkan ke Layar Utama.')
    }
  }

  return (
    <section className="install-app" aria-label="Pasang aplikasi">
      <div className="install-app-row">
        <Download size={20} strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="install-app-title">Pasang aplikasi</p>
          <p className="install-app-sub">Buka tanpa browser, langsung dari layar utama.</p>
        </div>
      </div>
      <button type="button" className="install-app-btn" onClick={handleInstall}>
        {canPrompt ? 'Pasang' : 'Cara pasang'}
      </button>
    </section>
  )
}
