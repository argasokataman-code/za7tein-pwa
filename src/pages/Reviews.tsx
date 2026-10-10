import { MessageSquare } from 'lucide-react'
import { BackButton } from '../components/ui/BackButton'
// Halaman ulasan customer. Sumber ulasan sungguhan belum ada di API (tabel
// `reviews` tidak pernah di-fetch, lihat `src/api/catalog.ts` yang hanya pakai
// agregat `rating_avg`/`rating_count` di `merchants`). Aturan: pakai data real,
// kalau tidak ada tampilkan kosong — bukan kartu contoh yang di-hardcode.


export default function Reviews() {
  return (
    <div className="app-shell">
      <main>
        <div className="reviews-screen">
          <div className="reviews-header">
            <BackButton className="btn-back" />
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
