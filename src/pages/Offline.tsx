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
          <svg width={80} height={80} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
              stroke="var(--sa7tein-orange)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
