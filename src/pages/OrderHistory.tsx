import { MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchOrderHistory, type OrderHistoryItem } from '../api/reviews'
import { apiEnabled } from '../api/supabase'
import { BackButton } from '../components/ui/BackButton'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { RATING_WINDOW_DAYS } from '../data/rating'

// Riwayat pesanan customer. PRD §20.2: rating dan review "diisi di layar detail
// order, yang dibuka lewat menu riwayat order" — sebelumnya tak ada menu itu,
// satu-satunya pintu ke form rating adalah tautan "Lihat semua" di detail menu,
// yang justru milik daftar ulasan hidangan.
//
// Isinya order `done` saja (yang bisa dinilai), dengan penanda sudah dinilai atau
// belum. Tanpa penyaring tanggal: §20.2 menulis "tidak ada batas waktu pengisian".
//
// ponytail: tanpa paginasi — data demo berisi ~120 order selesai dan itu masih
// sekali render. Tambah limit/cursor begitu jumlahnya tumbuh nyata.

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    if (!apiEnabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    fetchOrderHistory()
      .then(setOrders)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pending = orders.filter((order) => !order.reviewed).length

  return (
    <div className="app-shell">
      <main>
        <div className="reviews-screen">
          <div className="reviews-header">
            <BackButton className="btn-back" />
            <h1 className="reviews-page-title">Riwayat pesanan</h1>
            <div className="header-spacer" />
          </div>
          <div className="reviews-content">
            {!apiEnabled ? (
              <PlatformNotice message="Backend belum tersambung — riwayat pesanan tidak bisa dimuat." />
            ) : null}
            {error ? (
              <PlatformNotice message="Gagal memuat riwayat. Muat ulang halaman untuk mencoba lagi." />
            ) : null}

            <p className="reviews-field-note">
              {RATING_WINDOW_DAYS === null
                ? 'Penilaian bisa diisi kapan saja, tanpa batas waktu.'
                : ''}
              {pending > 0 ? ` ${pending} pesanan belum dinilai.` : ''}
            </p>

            {loading ? (
              <p className="reviews-empty-state">Memuat riwayat…</p>
            ) : orders.length === 0 ? (
              <div className="reviews-empty-state">
                <MessageSquare size={40} strokeWidth={1.5} aria-hidden="true" />
                <p>Belum ada pesanan selesai.</p>
                <span>Pesanan yang sudah tiba akan muncul di sini beserta penilaiannya.</span>
              </div>
            ) : (
              <ul className="reviews-order-list">
                {orders.map((order) => (
                  <li key={order.id}>
                    {order.reviewed ? (
                      <span className="reviews-order">
                        <span className="reviews-order__info">
                          <span className="reviews-order__code">{order.code}</span>
                          <span className="reviews-order__shop">{order.merchantName}</span>
                          <span className="reviews-order__date">
                            {new Date(order.createdAt).toLocaleDateString('id-ID', DATE_FORMAT)}
                          </span>
                        </span>
                        <span className="reviews-order__date">Sudah dinilai</span>
                      </span>
                    ) : (
                      <Link className="reviews-order" to={`/reviews?order=${order.code}`}>
                        <span className="reviews-order__info">
                          <span className="reviews-order__code">{order.code}</span>
                          <span className="reviews-order__shop">{order.merchantName}</span>
                          <span className="reviews-order__date">
                            {new Date(order.createdAt).toLocaleDateString('id-ID', DATE_FORMAT)}
                          </span>
                        </span>
                        <span className="reviews-order__cta">Beri rating</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
