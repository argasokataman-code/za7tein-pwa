import { useEffect, useState } from 'react'

import type { AuthBannerSlide } from '../../types'

/**
 * Banner carousel di layar auth. Isinya gambar banner (satu janji produk per
 * slide), bukan paragraf teks, supaya blok teks tidak menumpuk di bawah judul.
 *
 * Geraknya meniru `HomePromoCarousel`: satu timer, dijeda saat disentuh,
 * dimatikan saat `prefers-reduced-motion`, dan titik navigasi tetap memakai
 * `role="tab"` dengan sasaran sentuh penuh (`--touch-min`). Tiap gambar punya
 * `alt` berisi janjinya, jadi pembaca layar tetap menerima pesannya.
 */
const SLIDE_MS = 5200

export interface AuthBannerProps {
  slides: readonly AuthBannerSlide[]
}

export function AuthBanner({ slides }: AuthBannerProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, SLIDE_MS)

    return () => window.clearInterval(id)
  }, [paused, slides.length])

  if (slides.length === 0) return null

  return (
    <div
      className="auth-banner"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="auth-banner-track" style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>
        {slides.map((slide, slideIndex) => (
          <div className="auth-banner-slide" key={slide.src}>
            <img
              src={slide.src}
              alt={slide.alt}
              width={1000}
              height={410}
              decoding="async"
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className="auth-banner-dots" role="tablist" aria-label="Sorotan Sa7tein">
          {slides.map((_slide, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Sorotan ${dotIndex + 1} dari ${slides.length}`}
              className={`auth-banner-dot${dotIndex === index ? ' auth-banner-dot--active' : ''}`}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
