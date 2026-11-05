import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { swapBrokenImage } from '../../data/storefronts'
import type { Storefront } from '../../types'

/** Jeda antar slide otomatis. Sama dengan carousel halaman toko, bukan angka baru. */
const SLIDE_MS = 5000

interface PromoSlide {
  store: Storefront
  /** Diskon terbesar di toko itu, untuk angka di judul. */
  maxDiscount: number
}

interface HomePromoBannerProps {
  /** Toko yang sedang punya menu berdiskon, urut seperti daftar toko di beranda. */
  promos: PromoSlide[]
  /** Buka toko milik slide yang diketuk. */
  onOpen: (storeId: string) => void
}

/**
 * Banner promo beranda — mengikuti desain v2 (`PromoBanner`), kini berupa
 * carousel satu-lintasan.
 *
 * Isinya BUKAN satu kupon statis seperti di contoh, melainkan **toko yang
 * sedang promo**: angka diskon dan nama toko dihitung dari menu yang benar-benar
 * berdiskon di katalog (`dealsFrom`), bukan dikarang. Kalau tak ada satu pun
 * menu berdiskon, banner tidak dirender sama sekali — lebih baik absen daripada
 * menjanjikan promo yang tidak ada.
 *
 * Carousel menggeser manual (scroll-snap) **dan** berjalan sendiri tiap lima
 * detik; sentuhan, hover, atau fokus menghentikan sementara supaya banner tidak
 * melawan jempol yang sedang membaca. `prefers-reduced-motion` mematikan
 * gerak otomatis, bukan hanya meredam animasinya.
 */
export default function HomePromoBanner({ promos, onOpen }: HomePromoBannerProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  const onRailScroll = () => {
    const el = railRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDistance = Infinity
    ;[...el.children].forEach((child, index) => {
      const box = child as HTMLElement
      const distance = Math.abs(box.offsetLeft + box.offsetWidth / 2 - center)
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
    setSlide(best)
  }

  const goToSlide = (index: number) => {
    const el = railRef.current
    const child = el?.children[index] as HTMLElement | undefined
    if (!el || !child) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: reduce ? 'auto' : 'smooth' })
  }

  // Satu timer untuk seluruh carousel, dijeda saat pengguna menyentuh atau
  // menaruh kursor. Dependensi `slide` membuat jeda dihitung ulang setelah
  // geseran manual, jadi auto tidak melompat dua kartu sekaligus.
  useEffect(() => {
    if (paused || promos.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      goToSlide((slide + 1) % promos.length)
    }, SLIDE_MS)

    return () => window.clearInterval(id)
  }, [paused, slide, promos.length])

  return (
    <section
      className="home-promo"
      aria-label="Toko sedang promo"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="home-promo__track" ref={railRef} onScroll={onRailScroll}>
        {promos.map(({ store, maxDiscount }) => (
          <article className="home-promo__card" key={store.id}>
            <div className="home-promo__body">
              <div className="home-promo__intro">
                <span className="home-promo__eyebrow">Makan enak, lebih hemat</span>

                <h2 className="home-promo__title">Diskon {maxDiscount}%</h2>
                <p className="home-promo__store">di {store.name}</p>
              </div>

              <div className="home-promo__cta-row">
                <button type="button" className="home-promo__cta" onClick={() => onOpen(store.id)}>
                  <span>Lihat promo</span>
                  <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="home-promo__media" aria-hidden="true">
              <img src={store.cover} alt="" loading="lazy" decoding="async" onError={swapBrokenImage} />
              <span className="home-promo__vignette" />
              <span className="home-promo__tag">Spesial</span>
            </div>
          </article>
        ))}
      </div>

      {promos.length > 1 ? (
        <div className="home-promo__dots" role="group" aria-label="Pilih banner promo">
          {promos.map((promo, index) => (
            <button
              key={promo.store.id}
              type="button"
              className={`home-promo__dot${index === slide ? ' home-promo__dot--on' : ''}`}
              aria-label={`Promo ${index + 1} dari ${promos.length}: ${promo.store.name}`}
              aria-current={index === slide}
              onClick={() => goToSlide(index)}
            >
              <span className="home-promo__dot-mark" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
