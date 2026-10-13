import { ArrowRight } from 'lucide-react'

import { swapBrokenImage } from '../../data/storefronts'
import type { Storefront } from '../../types'

interface HomePromoBannerProps {
  /** Toko yang sedang punya menu berdiskon — dipilih pemanggil dari katalog. */
  store: Storefront
  /** Diskon terbesar di toko itu, untuk angka di judul. */
  maxDiscount: number
  onOpen: () => void
}

/**
 * Banner promo beranda — mengikuti desain v2 (`PromoBanner`).
 *
 * Isinya BUKAN satu kupon statis seperti di contoh, melainkan **toko yang
 * sedang promo**: angka diskon dan nama toko dihitung dari menu yang benar-benar
 * berdiskon di katalog (`dealsFrom`), bukan dikarang. Kalau tak ada satu pun
 * menu berdiskon, banner tidak dirender sama sekali — lebih baik absen daripada
 * menjanjikan promo yang tidak ada.
 */
export default function HomePromoBanner({ store, maxDiscount, onOpen }: HomePromoBannerProps) {
  return (
    <section className="home-promo" aria-label="Toko sedang promo">
      <div className="home-promo__card">
        <div className="home-promo__body">
          <div className="home-promo__intro">
            <span className="home-promo__eyebrow">Makan enak, lebih hemat</span>

            <h2 className="home-promo__title">Diskon {maxDiscount}%</h2>
            <p className="home-promo__store">di {store.name}</p>
          </div>

          <div className="home-promo__cta-row">
            <button type="button" className="home-promo__cta" onClick={onOpen}>
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
      </div>
    </section>
  )
}
