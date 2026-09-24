import { ChevronLeft, Check } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

import { mockOrder } from '../data/merchant'

export default function OrderArrived() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Kode order dibawa dari layar pelacakan supaya layar rating tahu order mana
  // yang dinilai (pola yang sama dengan /dispute, fallback ke order demo).
  const orderCode = params.get('order') ?? mockOrder.code
  useEffect(() => {
    document.body.className = "order-arrived-page"
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="order-arrived-screen">
          <header className="order-arrived-header">
            <button type="button" className="btn-back" aria-label="Kembali" onClick={() => navigate(-1)}>
              <ChevronLeft size={24} strokeWidth={1.75} />
            </button>
          </header>
          <div className="order-arrived-content">
            <div className="order-arrived-icon-wrapper">
              <div className="order-arrived-confetti">
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-dot" />
                <span className="confetti-x" />
                <span className="confetti-x" />
                <span className="confetti-x" />
                <span className="confetti-x" />
              </div>
              <div className="order-arrived-icon-circle">
                {/* Centang oranye di lingkaran krem. Sebelumnya putih — kontras
                    1,02:1, jadi lingkaran kosong yang tidak terbaca. */}
                <Check size={60} strokeWidth={1.75} color="var(--sa7tein-orange)" />
              </div>
            </div>
            <h1 className="order-arrived-title">
              Pesananmu sudah tiba!
            </h1>
            <p className="order-arrived-message">
              Selamat makan. Terima kasih sudah pesan lewat Sa7tein.
            </p>
            <Link className="order-arrived-rate-btn" to={`/rating-driver?order=${orderCode}`}>
              Beri rating kurir
            </Link>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
