import { WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Layar tanpa koneksi.
 *
 * Sama seperti layar kegagalan: versi hasil porting memakai latar hitam dengan
 * teks abu kebiruan lewat inline style, jadi satu-satunya layar yang keluar
 * dari sistem hangat. Tombol "Retry" pun sebenarnya membawa ke /home, bukan
 * mencoba ulang. Sekarang memakai kelas .setup-error yang sama, dan tombolnya
 * benar-benar memuat ulang.
 */
export default function Offline() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <div className="setup-error">
        <div className="setup-error-icon">
          <WifiOff size={80} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="setup-error-title">Tidak ada koneksi</h1>
        <p className="setup-error-text">
          Periksa jaringanmu lalu coba lagi. Pesanan yang sedang berjalan tetap aman.
        </p>
        <div className="setup-error-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
          <button
            className="setup-error-secondary"
            type="button"
            onClick={() => navigate('/home')}
          >
            Ke beranda
          </button>
        </div>
      </div>
    </div>
  )
}
