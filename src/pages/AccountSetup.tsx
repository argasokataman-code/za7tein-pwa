import { useNavigate } from 'react-router-dom'

/**
 * Layar kegagalan.
 *
 * Versi hasil porting memakai latar hitam pekat dengan teks abu kebiruan, dan
 * tombol "Try Again" yang sebenarnya tidak mencoba ulang apa pun — ia langsung
 * membawa ke /home, jadi labelnya berbohong. Sekarang memakai palet hangat
 * yang sama dengan sisa aplikasi, dan tombolnya benar-benar mengulang.
 */
export default function AccountSetup() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <div className="setup-error">
        <div className="setup-error-icon">
          <svg width={72} height={72} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity={0.25} />
            <path
              d="M12 7l.01 5M12 16h.01"
              stroke="var(--sa7tein-orange)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="setup-error-title">Terjadi kesalahan</h1>
        <p className="setup-error-text">
          Ada gangguan saat memuat halaman ini. Coba muat ulang, atau kembali ke beranda.
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
