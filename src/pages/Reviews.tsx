import { MessageSquare, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { fetchReviewableOrders, submitOrderReview, type ReviewableOrder } from '../api/reviews'
import { apiEnabled } from '../api/supabase'
import { BackButton } from '../components/ui/BackButton'
import { BottomSheet } from '../components/ui/BottomSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'

// Halaman ulasan customer. Sumbernya `rating_reviews` (RLS customer): daftar di
// sini = pesanan yang sudah `done` tapi belum diulas, dan form di sheet menulis
// penilaian toko untuk pesanan itu. Ulasan hidangan menunggu `order_items` yang
// masih kosong di BE, jadi untuk sekarang satu ulasan = satu bintang toko.

const STARS = [1, 2, 3, 4, 5]

export default function Reviews() {
  const [orders, setOrders] = useState<ReviewableOrder[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)
  const [target, setTarget] = useState<ReviewableOrder | null>(null)
  const [rating, setRating] = useState(5)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    if (!apiEnabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    fetchReviewableOrders()
      .then(setOrders)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function open(order: ReviewableOrder) {
    setTarget(order)
    setRating(5)
    setNote('')
  }

  function close() {
    setTarget(null)
    setNote('')
  }

  async function submit() {
    if (!target) return
    const order = target
    setBusy(true)
    try {
      await submitOrderReview({
        orderId: order.id,
        merchantId: order.merchantId,
        rating,
        text: note,
      })
      toast.success('Ulasan terkirim. Terima kasih!')
      setOrders((list) => list.filter((o) => o.id !== order.id))
      close()
    } catch {
      toast.error('Gagal mengirim ulasan — coba lagi')
    } finally {
      setBusy(false)
    }
  }

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
            {!apiEnabled ? (
              <PlatformNotice message="Backend belum tersambung — ulasan tidak bisa dikirim." />
            ) : null}
            {error ? (
              <PlatformNotice message="Gagal memuat pesanan. Muat ulang halaman untuk mencoba lagi." />
            ) : null}

            {loading ? (
              <p className="reviews-empty-state">Memuat pesanan…</p>
            ) : orders.length === 0 ? (
              <div className="reviews-empty-state">
                <MessageSquare size={40} strokeWidth={1.5} aria-hidden="true" />
                <p>Belum ada pesanan menunggu ulasan.</p>
                <span>Ulasan bisa dikirim setelah pesanan selesai.</span>
              </div>
            ) : (
              <ul className="reviews-order-list">
                {orders.map((order) => (
                  <li key={order.id}>
                    <button type="button" className="reviews-order" onClick={() => open(order)}>
                      <span className="reviews-order__info">
                        <span className="reviews-order__code">{order.code}</span>
                        <span className="reviews-order__shop">{order.merchantName}</span>
                        <span className="reviews-order__date">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                      <span className="reviews-order__cta">Beri ulasan</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <BottomSheet open={target !== null} title="Beri ulasan" onClose={close}>
        <p className="reviews-field-note">
          {target ? `${target.merchantName} · ${target.code}` : ''}
        </p>

        <span className="reviews-field-label">Seberapa puas kamu dengan toko ini?</span>
        <div className="reviews-stars" role="radiogroup" aria-label="Beri bintang untuk toko">
          {STARS.map((value) => {
            const active = rating >= value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} bintang`}
                className="reviews-star-btn"
                onClick={() => setRating(value)}
              >
                <Star
                  size={36}
                  strokeWidth={1.75}
                  color={active ? 'var(--star)' : 'var(--text-secondary)'}
                  fill={active ? 'var(--star)' : 'none'}
                />
              </button>
            )
          })}
        </div>

        <label className="reviews-field-label" htmlFor="review-note">
          Catatan (opsional)
        </label>
        <textarea
          id="review-note"
          className="form-control"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ceritakan pengalamanmu..."
        />

        <div className="sheet-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || rating < 1}
            onClick={() => void submit()}
          >
            {busy ? 'Mengirim…' : 'Kirim ulasan'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
