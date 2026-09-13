import { useState } from 'react'
import { MessageSquare, Pencil, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import { BottomSheet } from '../components/ui/BottomSheet'
import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import {
  averageRating,
  merchantReviews,
  ratingDistribution,
  reviewFilters,
  reviewsForFilter,
} from '../data/merchantReviews'
import { setReviewReply } from '../store/slices/merchantSlice'
import type { MerchantReview } from '../types'

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

export default function MerchantReviews() {
  const dispatch = useAppDispatch()
  const replies = useAppSelector((s) => s.merchant.reviewReplies)

  const [filter, setFilter] = useState('all')
  const [replyTarget, setReplyTarget] = useState<MerchantReview | null>(null)
  const [draft, setDraft] = useState('')

  const filters = reviewFilters(merchantReviews)
  const visible = reviewsForFilter(merchantReviews, filter)
  const average = averageRating(merchantReviews)
  const distribution = ratingDistribution(merchantReviews)

  function openReply(review: MerchantReview) {
    setReplyTarget(review)
    setDraft(replies[review.id] ?? '')
  }

  function closeReply() {
    setReplyTarget(null)
    setDraft('')
  }

  function saveReply() {
    if (!replyTarget || draft.trim() === '') return
    dispatch(setReviewReply({ id: replyTarget.id, text: draft.trim() }))
    toast.success('Balasan tersimpan')
    closeReply()
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Kualitas menu" title="Ulasan" />

        <section className="merchant-card merchant-review-summary">
          <div className="merchant-review-score">
            <p className="merchant-review-average">{average.toFixed(1).replace('.', ',')}</p>
            <div>
              <div
                className="merchant-review-stars"
                aria-label={`Rata-rata rating ${average} dari 5`}
              >
                <Stars value={average} size={16} />
              </div>
              <p className="merchant-review-count">
                Berdasarkan {merchantReviews.length} ulasan pembeli
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
          {filters.map((f) => (
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
                {reviewsForFilter(merchantReviews, f.id).length}
              </span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="merchant-empty">Belum ada ulasan untuk hidangan ini.</p>
        ) : (
          visible.map((review) => {
            const reply = replies[review.id]
            return (
              <article key={review.id} className="merchant-review-card">
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
                      <p className="merchant-review-date">{review.createdAt}</p>
                    </div>
                  </div>
                  <div
                    className="merchant-review-stars"
                    aria-label={`Rating ${review.rating} dari 5`}
                  >
                    <Stars value={review.rating} />
                  </div>
                </div>

                <span className="merchant-review-dish">{review.foodName}</span>
                <p className="merchant-review-text">{review.text}</p>

                {reply ? (
                  <div className="merchant-review-reply">
                    <p className="merchant-review-reply-label">Balasan tokomu</p>
                    <p className="merchant-review-reply-text">{reply}</p>
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
          Balasan untuk {replyTarget?.foodName}
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
            disabled={draft.trim() === ''}
            onClick={saveReply}
          >
            Simpan balasan
          </button>
        </div>
      </BottomSheet>

      <MerchantBottomNav />
    </div>
  )
}
