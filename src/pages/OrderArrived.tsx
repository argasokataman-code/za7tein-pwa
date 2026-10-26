// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { mockOrder } from '../data/merchant'
import { BackButton } from '../components/ui/BackButton'
import { OrderCelebration } from '../components/ui/OrderCelebration'

export default function OrderArrived() {
  const [params] = useSearchParams()
  // Kode order dibawa dari layar pelacakan supaya layar rating tahu order mana
  // yang dinilai (pola yang sama dengan /dispute, fallback ke order demo).
  const orderCode = params.get('order') ?? mockOrder.code
  useEffect(() => {
    document.body.className = 'order-arrived-page'
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <div className="app-shell">
      <main>
        <OrderCelebration
          title="Pesananmu sudah tiba!"
          message="Selamat makan. Terima kasih sudah pesan lewat Sa7tein."
          header={
            <header className="order-arrived-header">
              {/* Pesanan selesai = akhir alur. Kembali ke beranda, bukan ke
                  layar bayar/pelacakan yang sudah tidak relevan. */}
              <BackButton className="btn-back" to="/home" />
            </header>
          }
        >
          <Link className="order-arrived-rate-btn" to={`/rating-driver?order=${orderCode}`}>
            Beri rating kurir
          </Link>
        </OrderCelebration>
      </main>
    </div>
  )
}
