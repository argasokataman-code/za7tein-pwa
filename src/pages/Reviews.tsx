import { ChevronLeft, MessageSquare } from 'lucide-react'
// Halaman ulasan customer. Sumber ulasan sungguhan belum ada di API (tabel
// `reviews` tidak pernah di-fetch, lihat `src/api/catalog.ts` yang hanya pakai
// agregat `rating_avg`/`rating_count` di `merchants`). Aturan: pakai data real,
// kalau tidak ada tampilkan kosong — bukan kartu contoh yang di-hardcode.
import { useNavigate } from 'react-router-dom'

export default function Reviews() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <main>
        <div className="reviews-screen">
          <div className="reviews-header">
            <button type="button" className="btn-back" aria-label="Kembali" onClick={() => navigate(-1)}>
              <ChevronLeft size={24} strokeWidth={1.75} />
            </button>
            <h1 className="reviews-page-title">Ulasan</h1>
            <div className="header-spacer" />
          </div>
          <div className="reviews-content">
            <div className="reviews-empty-state">
              <MessageSquare size={40} strokeWidth={1.5} aria-hidden="true" />
              <p>Belum ada ulasan.</p>
              <span>Ulasan akan muncul setelah pelanggan menyelesaikan pesanan.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
