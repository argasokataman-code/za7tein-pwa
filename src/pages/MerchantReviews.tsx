import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { MessageSquare, Pencil, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import { fetchMerchantReviews, replyToReview, type ReviewItem } from '../api/reviews'
import { apiEnabled } from '../api/supabase'
import { BottomSheet } from '../components/ui/BottomSheet'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { PlatformNotice } from '../components/ui/PlatformNotice'

/**
 * Ulasan toko + hidangan, dari `rating_reviews` (satu tabel, dua jenis baris:
 * ulasan toko & ulasan hidangan — lihat `src/api/reviews.ts`). Balasan toko
 * ditulis ke `review_replies` lewat sesi merchant.
 *
 * Agregat (rata-rata + sebaran bintang) dihitung dari daftar yang benar-benar
 * dimuat, bukan dari kolom `merchants.rating_avg` — kalau tidak, angka ringkasan
 * bisa berbeda dengan ulasan yang tampil di bawahnya.
 */

interface StarsProps {
  value: number
  size?: number
}

function Stars({ value, size = 14 }: StarsProps) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.75}
          color="var(--star)"
          fill={i < Math.round(value) ? 'var(--star)' : 'none'}
        />
      ))}
    </>
  )
}

type FilterId = 'all' | 'store' | 'dish'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'store', label: 'Toko' },
  { id: 'dish', label: 'Hidangan' },
]

function inFilter(review: ReviewItem, filter: FilterId): boolean {
  if (filter === 'all') return true
  return filter === 'store' ? review.kind === 'store' : review.kind === 'dish'
}

function averageOf(reviews: ReviewItem[]): number {
  if (!reviews.length) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function distributionOf(
  reviews: ReviewItem[],
): { stars: number; count: number; percent: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    return { stars, count, percent: reviews.length ? Math.round((count / reviews.length) * 100) : 0 }
  })
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function MerchantReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<FilterId>('all')
  const [replyTarget, setReplyTarget] = useState<ReviewItem | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    if (!apiEnabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    fetchMerchantReviews()
      .then(setReviews)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const average = averageOf(reviews)
  const distribution = distributionOf(reviews)
  const visible = reviews.filter((r) => inFilter(r, filter))

  function openReply(review: ReviewItem) {
    setReplyTarget(review)
    setDraft(review.reply?.body ?? '')
  }

  function closeReply() {
    setReplyTarget(null)
    setDraft('')
  }

  async function saveReply() {
    if (!replyTarget || draft.trim() === '') return
    const target = replyTarget
    setBusy(true)
    try {
      await replyToReview(target.id, draft)
      setReviews((list) =>
        list.map((r) =>
          r.id === target.id
            ? {
                ...r,
                reply: {
                  id: r.reply?.id ?? `local-${r.id}`,
                  body: draft.trim(),
                  createdAt: new Date().toISOString(),
                },
              }
            : r,
        ),
      )
      toast.success('Balasan tersimpan')
      closeReply()
    } catch {
      toast.error('Gagal menyimpan balasan')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Kualitas menu" title="Ulasan" back="/" />

        <section className="merchant-card merchant-review-summary">
          <div className="merchant-review-score">
            <p className="merchant-review-average">{average.toFixed(1).replace('.', ',')}</p>
            <div>
              <div
                className="merchant-review-stars"
                aria-label={`Rata-rata rating ${average.toFixed(1)} dari 5`}
              >
                <Stars value={average} size={16} />
              </div>
              <p className="merchant-review-count">
                Berdasarkan {reviews.length} ulasan pembeli
              </p>
            </div>
          </div>
          <div className="merchant-review-distribution">
            {distribution.map((bucket) => (
              <div key={bucket.stars} className="merchant-review-dist-row">
                <span className="merchant-review-dist-stars">{bucket.stars}</span>
                <div className="merchant-review-dist-bar">
                  <span
                    className="merchant-review-dist-fill"
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
                <span className="merchant-review-dist-count">{bucket.count}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="merchant-tabs" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={f.id === filter}
              className={`merchant-tab ${f.id === filter ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="merchant-tab-count">
                {reviews.filter((r) => inFilter(r, f.id)).length}
              </span>
            </button>
          ))}
        </div>

        {!apiEnabled ? (
          <PlatformNotice message="Backend belum tersambung — ulasan tidak bisa dimuat." />
        ) : null}
        {error ? (
          <PlatformNotice message="Gagal memuat ulasan. Muat ulang halaman untuk mencoba lagi." />
        ) : null}

        {loading ? (
          <p className="merchant-empty">Memuat ulasan…</p>
        ) : visible.length === 0 ? (
          <p className="merchant-empty">
            {reviews.length === 0
              ? 'Belum ada ulasan. Ulasan muncul setelah pembeli menyelesaikan pesanan.'
              : 'Tidak ada ulasan di kategori ini.'}
          </p>
        ) : (
          visible.map((review, index) => {
            const reply = review.reply
            const dishLabel =
              review.kind === 'dish'
                ? review.dishName ?? 'Hidangan'
                : review.orderId != null
                  ? `Order #${review.orderId}`
                  : 'Ulasan toko'
            return (
              <article
                key={review.id}
                className="merchant-review-card stagger-in"
                style={{ '--stagger-index': index } as CSSProperties}
              >
                <div className="merchant-review-head">
                  <div className="merchant-review-author">
                    <img
                      className="merchant-buyer-avatar"
                      src={review.avatar}
                      alt={`Profil ${review.customerName}`}
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="merchant-review-name">{review.customerName}</p>
                      <p className="merchant-review-date">{dateLabel(review.createdAt)}</p>
                    </div>
                  </div>
                  <div
                    className="merchant-review-stars"
                    aria-label={`Rating ${review.rating} dari 5`}
                  >
                    <Stars value={review.rating} />
                  </div>
                </div>

                <span className="merchant-review-dish">{dishLabel}</span>
                {review.text ? <p className="merchant-review-text">{review.text}</p> : null}

                {reply ? (
                  <div className="merchant-review-reply">
                    <p className="merchant-review-reply-label">Balasan tokomu</p>
                    <p className="merchant-review-reply-text">{reply.body}</p>
                    <button
                      type="button"
                      className="merchant-review-reply-edit"
                      onClick={() => openReply(review)}
                    >
                      <Pencil size={14} strokeWidth={1.75} />
                      Ubah balasan
                    </button>
                  </div>
                ) : (
                  <div className="merchant-review-actions">
                    <button
                      type="button"
                      className="merchant-btn-ghost"
                      onClick={() => openReply(review)}
                    >
                      <MessageSquare size={16} strokeWidth={1.75} />
                      Balas
                    </button>
                  </div>
                )}
              </article>
            )
          })
        )}
      </main>

      <BottomSheet
        open={replyTarget !== null}
        title={replyTarget ? `Balas ulasan ${replyTarget.customerName}` : undefined}
        onClose={closeReply}
      >
        <p className="sheet-field-label">Balasan tampil publik di halaman tokomu.</p>
        <label className="merchant-review-field-label" htmlFor="review-reply">
          Balasan untuk {replyTarget?.dishName ?? 'ulasan toko ini'}
        </label>
        <textarea
          id="review-reply"
          className="merchant-review-textarea"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis balasan yang ramah dan spesifik..."
        />
        <div className="sheet-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={draft.trim() === '' || busy}
            onClick={() => void saveReply()}
          >
            {busy ? 'Menyimpan…' : 'Simpan balasan'}
          </button>
        </div>
      </BottomSheet>

      <MerchantBottomNav />
    </div>
  )
}
