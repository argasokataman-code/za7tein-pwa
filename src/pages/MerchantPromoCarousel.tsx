import { ArrowDown, ArrowUp, Images, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { ConfirmSheet } from '../components/ui/ConfirmSheet'
import { PlatformNotice } from '../components/ui/PlatformNotice'
import { DEMO_MERCHANT_ID } from '../api/orders'
import { isOrderable } from '../data/catalog'
import { mockMerchant } from '../data/merchant'
import { DEFAULT_PROMO_BANNER, MAX_PROMO_SLIDES } from '../data/promoSlides'
import { useMerchantMenu } from '../hooks/useMerchantMenu'
import { useMoney } from '../hooks/useMoney'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { movePromoSlide, removePromoSlide, setPromoSlideActive } from '../store/slices/marketingSlice'
import type { PromoSlide } from '../types'

/**
 * Daftar slide carousel promo beranda toko. Penyuntingan slide ada di halaman
 * sendiri (`/promos/carousel/new` dan `/promos/carousel/:id`) supaya form
 * banner + menu tidak dipaksa masuk ke sheet 60% yang membuat field terpotong.
 */
export default function MerchantPromoCarousel() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useMerchantMenu(String(DEMO_MERCHANT_ID))
  const { money } = useMoney()
  const allSlides = useAppSelector((s) => s.marketing.slides)
  const slides = allSlides.filter((slide) => slide.merchantId === mockMerchant.id)
  const [deleteTarget, setDeleteTarget] = useState<PromoSlide | null>(null)

  const openAdd = () => {
    if (slides.length >= MAX_PROMO_SLIDES) {
      toast.error(`Maksimal ${MAX_PROMO_SLIDES} slide`)
      return
    }
    navigate('/promos/carousel/new')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    dispatch(removePromoSlide(deleteTarget.id))
    setDeleteTarget(null)
    toast.success('Slide dihapus')
  }

  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader eyebrow="Promosi beranda" title="Carousel beranda" back="/promos" />

        <section className="merchant-card">
          <div className="merchant-row">
            <Images size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="merchant-card-title">Promosi di halaman toko</p>
              <p className="merchant-card-sub">
                Slide di sini tampil ke customer di halaman toko, berurutan dari atas. Maksimal{' '}
                {MAX_PROMO_SLIDES} slide. Kalau tidak ada slide aktif, carousel memakai menu
                berdiskon otomatis.
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-section">
          <div className="merchant-section-head">
            <h2>Slide carousel</h2>
            <span className="promo-slide-count">
              {slides.length}/{MAX_PROMO_SLIDES}
            </span>
          </div>

          {slides.length === 0 ? (
            <div className="merchant-card promo-slide-empty">
              <Images size={28} strokeWidth={1.75} aria-hidden="true" />
              <p className="merchant-card-title">Belum ada slide</p>
              <p className="merchant-card-sub">
                Tambahkan slide pertama untuk memilih menu dan banner yang tampil di halaman toko.
              </p>
              <button type="button" className="merchant-btn-ghost" onClick={openAdd}>
                Tambah slide
              </button>
            </div>
          ) : (
            <ul className="promo-slide-list">
              {slides.map((slide, index) => {
                const food = items.find(
                  (item) => item.id === slide.menuItemId && item.merchantId === String(DEMO_MERCHANT_ID),
                )
                return (
                  <li className="promo-slide-item" key={slide.id}>
                    <div className="promo-slide-main">
                      <img
                        className="promo-slide-thumb"
                        src={slide.image ?? DEFAULT_PROMO_BANNER}
                        alt=""
                        width={72}
                        height={54}
                      />
                      <div className="promo-slide-copy">
                        <p className="promo-slide-title">
                          {slide.title || food?.name || 'Menu tidak ditemukan'}
                        </p>
                        <p className="promo-slide-meta">
                          Slide {index + 1}
                          {food ? ` · ${food.name} · ${money(food.price)}` : ' · menu tidak ditemukan'}
                          {food && !isOrderable(food) ? ' · stok habis' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="promo-slide-actions">
                      <button
                        type="button"
                        className="promo-slide-action"
                        aria-label={`Naikkan ${slide.title}`}
                        disabled={index === 0}
                        onClick={() => dispatch(movePromoSlide({ id: slide.id, direction: -1 }))}
                      >
                        <ArrowUp size={18} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="promo-slide-action"
                        aria-label={`Turunkan ${slide.title}`}
                        disabled={index === slides.length - 1}
                        onClick={() => dispatch(movePromoSlide({ id: slide.id, direction: 1 }))}
                      >
                        <ArrowDown size={18} strokeWidth={1.75} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        className={`promo-slide-live${slide.active ? ' is-active' : ''}`}
                        aria-pressed={slide.active}
                        aria-label={`${slide.active ? 'Sembunyikan' : 'Tampilkan'} ${slide.title} di carousel`}
                        onClick={() =>
                          dispatch(
                            setPromoSlideActive({ id: slide.id, active: !slide.active }),
                          )
                        }
                      >
                        <span className="promo-slide-live-dot" aria-hidden="true" />
                        {slide.active ? 'Tampil' : 'Nonaktif'}
                      </button>

                      <span className="promo-slide-actions__spacer" aria-hidden="true" />

                      <button
                        type="button"
                        className="promo-slide-action"
                        aria-label={`Ubah ${slide.title}`}
                        onClick={() => navigate(`/promos/carousel/${slide.id}`)}
                      >
                        <Pencil size={18} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="promo-slide-action is-danger"
                        aria-label={`Hapus ${slide.title}`}
                        onClick={() => setDeleteTarget(slide)}
                      >
                        <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <PlatformNotice message="Slide disimpan di perangkat ini sampai backend punya tabel slide promo." />

        <div className="page-fab-spacer" aria-hidden="true" />
      </main>

      <button
        type="button"
        className="page-fab"
        aria-label="Tambah slide carousel"
        onClick={openAdd}
      >
        <Plus size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <MerchantBottomNav />

      <ConfirmSheet
        open={deleteTarget !== null}
        title="Hapus slide?"
        body={`${deleteTarget?.title ?? ''} tidak akan tampil di carousel setelah dihapus.`}
        confirmLabel="Hapus slide"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
