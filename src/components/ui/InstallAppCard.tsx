import { Download } from 'lucide-react'

import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/**
 * Kartu "Pasang aplikasi" untuk keempat peran. Satu komponen supaya tidak ada
 * empat salinan logika `beforeinstallprompt` — logikanya di `useInstallPrompt`.
 *
 * Kalau browser punya prompt native (Chrome, Brave, Edge) tombolnya "Pasang" dan
 * memanggil prompt itu. Kalau tidak (iOS, Firefox), kartu menampilkan langkah
 * manualnya langsung — bukan tombol yang diam. Kartu ini menyembunyikan dirinya
 * sendiri saat aplikasi sudah terpasang.
 */
export function InstallAppCard() {
  const { hidden, canPrompt, isIOS, install } = useInstallPrompt()

  if (hidden) return null

  const steps = isIOS
    ? 'Ketuk Bagikan di Safari, lalu pilih Tambah ke Layar Utama.'
    : 'Buka menu browser, lalu pilih Pasang aplikasi atau Instal.'

  return (
    <section className="install-app" aria-label="Pasang aplikasi">
      <div className="install-app-row">
        <Download size={20} strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="install-app-title">Pasang aplikasi</p>
          <p className="install-app-sub">Buka tanpa browser, langsung dari layar utama.</p>
        </div>
      </div>
      {canPrompt ? (
        <button type="button" className="install-app-btn" onClick={() => void install()}>
          Pasang
        </button>
      ) : (
        <p className="install-app-steps">{steps}</p>
      )}
    </section>
  )
}
