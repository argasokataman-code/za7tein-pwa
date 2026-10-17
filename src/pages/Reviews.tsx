import { Camera, ImagePlus, MessageSquare, Star, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

import { fetchReviewableOrders, submitDishReview, submitOrderReview, type ReviewableOrder } from '../api/reviews'
import { apiEnabled } from '../api/supabase'
import { BackButton } from '../components/ui/BackButton'
import { BottomSheet } from '../components/ui/BottomSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { MENU_RATING_AVAILABLE } from '../data/rating'
import { imageFileError } from '../lib/image'

// Halaman ulasan customer. Sumbernya `rating_reviews` (RLS customer): daftar di
// sini = pesanan yang sudah `done` tapi belum diulas, dan form di sheet menulis
// penilaian toko untuk pesanan itu. Ulasan hidangan menunggu `order_items` yang
// masih kosong di BE, jadi untuk sekarang satu ulasan = satu bintang toko.

const STARS = [1, 2, 3, 4, 5]

/**
 * Foto ulasan: maksimal tiga, sama dengan bukti sengketa. PRD aktif §20.2 tidak
 * menyebut foto pada review (lihat R-CUS-RATING §7), jadi ini tambahan tampilan:
 * berkas hanya dipratinjau lokal dan tidak ikut dikirim, karena
 * `rating_reviews` belum punya kolom foto. Kamera & pemilih berkas dipisah
 * supaya di ponsel keduanya terlihat sebagai pilihan, bukan tersembunyi di dalam
 * satu dialog peramban.
 */
const MAX_REVIEW_PHOTOS = 3

export default function Reviews() {
  const [orders, setOrders] = useState<ReviewableOrder[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(false)
  const [target, setTarget] = useState<ReviewableOrder | null>(null)
  const [rating, setRating] = useState(5)
  const [note, setNote] = useState('')
  /** Bintang per hidangan (id baris `order_items` → nilai). */
  const [dishRatings, setDishRatings] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const photoUrls = useRef<string[]>([])
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [params] = useSearchParams()
  const wantedCode = params.get('order')

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

  // Deep link dari riwayat pesanan (§20.2: penilaian diisi di layar detail order
  // yang dibuka lewat menu riwayat). Kode order dipakai, bukan id, supaya URL-nya
  // sama dengan yang dibawa layar perayaan (`/order-arrived?order=...`).
  useEffect(() => {
    if (!wantedCode) return
    const order = orders.find((item) => item.code === wantedCode)
    if (order) open(order)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantedCode, orders])

  function open(order: ReviewableOrder) {
    setTarget(order)
    setRating(5)
    setNote('')
    setDishRatings(Object.fromEntries(order.items.map((dish) => [dish.id, 5])))
    clearPhotos()
  }

  function close() {
    setTarget(null)
    setNote('')
    setDishRatings({})
    clearPhotos()
  }

  function clearPhotos() {
    photoUrls.current.forEach((url) => URL.revokeObjectURL(url))
    photoUrls.current = []
    setPhotos([])
    setPhotoError(null)
  }

  /** Object URL dibuang saat komponen dilepas supaya blob tidak menumpuk. */
  useEffect(() => () => photoUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  function addPhotos(files: FileList | null) {
    const picked = Array.from(files ?? [])
    if (picked.length === 0) return

    const valid: File[] = []
    let error: string | null = null
    for (const file of picked) {
      const message = imageFileError(file)
      if (message) error ??= message
      else valid.push(file)
    }

    const room = MAX_REVIEW_PHOTOS - photos.length
    if (valid.length > room) error ??= `Maksimal ${MAX_REVIEW_PHOTOS} foto`
    const added = valid.slice(0, Math.max(0, room)).map((file) => URL.createObjectURL(file))
    photoUrls.current = [...photoUrls.current, ...added]
    if (added.length > 0) setPhotos((prev) => [...prev, ...added])
    setPhotoError(error)

    // Isian dikosongkan supaya berkas yang sama bisa dipilih lagi.
    if (cameraRef.current) cameraRef.current.value = ''
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(url: string) {
    URL.revokeObjectURL(url)
    photoUrls.current = photoUrls.current.filter((item) => item !== url)
    setPhotos((prev) => prev.filter((item) => item !== url))
    setPhotoError(null)
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
      // Rating menu item (§20.2): bintang saja, tanpa review. Best-effort per
      // hidangan — satu gagal tidak membatalkan ulasan toko yang sudah terkirim.
      await Promise.allSettled(
        order.items
          .filter((dish) => dish.menuId !== null)
          .map((dish) =>
            submitDishReview({
              orderId: order.id,
              menuId: dish.menuId as number,
              rating: dishRatings[dish.id] ?? 5,
            }),
          ),
      )
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
                <span>Ulasan bisa dikirim setelah pesanan selesai, tanpa batas waktu.</span>
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

        <span className="reviews-field-label">Foto (opsional)</span>
        {photos.length > 0 ? (
          <div className="reviews-photos">
            {photos.map((url, index) => (
              <div key={url} className="reviews-photo">
                <img
                  src={url}
                  alt={`Foto ulasan ${index + 1}`}
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                />
                <button
                  type="button"
                  className="reviews-photo-remove"
                  aria-label={`Hapus foto ${index + 1}`}
                  onClick={() => removePhoto(url)}
                >
                  <X size={16} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {photos.length < MAX_REVIEW_PHOTOS ? (
          <div className="reviews-photo-actions">
            <button
              type="button"
              className="reviews-photo-btn"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera size={18} strokeWidth={1.75} aria-hidden="true" />
              Kamera
            </button>
            <button
              type="button"
              className="reviews-photo-btn"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus size={18} strokeWidth={1.75} aria-hidden="true" />
              Pilih file
            </button>
          </div>
        ) : null}
        <input
          ref={cameraRef}
          className="d-none"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => addPhotos(event.target.files)}
        />
        <input
          ref={fileRef}
          className="d-none"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => addPhotos(event.target.files)}
        />
        {photoError ? (
          <p className="reviews-photo-error" role="alert">
            {photoError}
          </p>
        ) : null}
        <p className="reviews-field-note">
          {photos.length > 0 ? `${photos.length} dari ${MAX_REVIEW_PHOTOS} foto. ` : ''}
          Pratinjau lokal, foto belum disimpan server.
        </p>

        {/* §20.2: rating menu item = bintang saja, tanpa review, dan tanpa rating
            per variant. Sasarannya hidangan yang benar-benar dipesan
            (`order.items`); bila BE belum mengirim daftar hidangan, blok ini tidak
            muncul sama sekali alih-alih mengarang nama hidangan. */}
        {MENU_RATING_AVAILABLE && target && target.items.length > 0 ? (
          <>
            <span className="reviews-field-label">Nilai hidangan (bintang saja)</span>
            {target.items.map((dish) => (
              <div key={dish.id}>
                <p className="reviews-field-note">{dish.name}</p>
                <div
                  className="reviews-stars"
                  role="radiogroup"
                  aria-label={`Beri bintang untuk ${dish.name}`}
                >
                  {STARS.map((value) => {
                    const current = dishRatings[dish.id] ?? 5
                    const active = current >= value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={current === value}
                        aria-label={`${dish.name}: ${value} bintang`}
                        className="reviews-star-btn"
                        onClick={() => setDishRatings((prev) => ({ ...prev, [dish.id]: value }))}
                      >
                        <Star
                          size={26}
                          strokeWidth={1.75}
                          color={active ? 'var(--star)' : 'var(--text-secondary)'}
                          fill={active ? 'var(--star)' : 'none'}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        ) : !MENU_RATING_AVAILABLE ? (
          <p className="reviews-field-note">
            Rating per menu (bintang saja, tanpa review) belum bisa diisi di sini.
          </p>
        ) : null}

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
