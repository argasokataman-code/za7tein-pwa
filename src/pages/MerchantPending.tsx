import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MerchantPending() {
  return (
    <div className="app-shell">
      <div className="auth-page">
        <div className="screen active" id="merchant-pending">
          <div className="container">
            <div className="auth-content merchant-pending">
              <span className="merchant-pending-icon">
                <Clock size={40} strokeWidth={1.5} />
              </span>
              <h1 className="auth-title">Menunggu persetujuan</h1>
              <p className="auth-subtitle">
                Pendaftaran tokomu sedang ditinjau tim CS. Setelah disetujui, toko bisa
                menerima order.
              </p>
              <Link className="btn btn-primary btn-auth" to="/">
                Lihat dashboard contoh
              </Link>
              <p className="merchant-auth-switch">
                Salah memasukkan data? <Link to="/signup">Daftar ulang</Link>
              </p>
            </div>
          </div>
          <div className="home-indicator" />
        </div>
      </div>
    </div>
  )
}
