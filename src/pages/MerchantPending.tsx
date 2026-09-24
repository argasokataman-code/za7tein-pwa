import { Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../components/ui/AuthLayout'
import { AUTH_ROLE_LABEL } from '../data/auth'
import { PENDING_COPY } from '../data/authCopy'

/**
 * Layar status setelah pendaftaran toko dikirim.
 *
 * Dulu layar ini menawarkan "Lihat dashboard contoh" ke `/` — tautan itu
 * mendarat di beranda merchant, bukan contoh, dan di app terinstal tidak ada
 * jalan keluar dari layar ini selain tombol itu. Sekarang ada tiga jalur yang
 * benar-benar berfungsi (senior-fe HG-06): kembali ke beranda merchant,
 * perbaiki pendaftaran, atau pindah ke aplikasi pembeli lewat halaman depan.
 *
 * Tanpa foto: layar ini tentang status, bukan tentang makanan. `photo` sengaja
 * dikosongkan, dan `AuthLayout` punya varian polos untuk itu.
 */
export default function MerchantPending() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      role={AUTH_ROLE_LABEL.merchant}
      title={PENDING_COPY.title}
      subtitle={PENDING_COPY.subtitle}
      showBack={false}
    >
      <span className="auth-status-icon" aria-hidden="true">
        <Clock size={36} strokeWidth={1.6} />
      </span>

      <div className="auth-actions">
        {/* Naik ke beranda merchant: di app terinstal kembali berarti
            menutup, jadi jalur eksplisitnya lewat riwayat, bukan `-1`. */}
        <button type="button" className="auth-submit" onClick={() => navigate('/', { replace: true })}>
          Buka beranda merchant
        </button>
        <Link className="auth-secondary" to="/signup">
          Perbaiki data pendaftaran
        </Link>
      </div>

      <p className="auth-switch">
        Mau pesan makanan? <Link to="/customer/home">Buka aplikasi pembeli</Link>
      </p>

      <p className="auth-note">{PENDING_COPY.note}</p>
    </AuthLayout>
  )
}
