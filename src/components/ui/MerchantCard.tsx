import type { CSSProperties } from 'react'
import { Clock, Star } from 'lucide-react'

import { formatRating } from '../../data/foods'
import { swapBrokenImage } from '../../data/storefronts'
import type { Storefront } from '../../types'

interface MerchantCardProps {
  store: Storefront
  onOpen: (store: Storefront) => void
  className?: string
  /** Variabel CSS tambahan, mis. `--stagger-index`. */
  style?: CSSProperties & Record<'--stagger-index', number>
}

/**
 * Kartu toko di beranda customer: logo, nama, badge buka/tutup, rating, waktu
 * antar, dan jarak. Seluruh kartu adalah satu tombol, jadi bisa diaktifkan
 * keyboard (Enter/Space) tanpa handler palsu di `div`.
 */
export function MerchantCard({ store, onOpen, className = '', style }: MerchantCardProps) {
  return (
    <button
      type="button"
      className={`merchant-card ${className}`.trim()}
      style={style}
      aria-label={`Buka ${store.name}, ${store.isOpen ? 'buka' : 'tutup'}`}
      onClick={() => onOpen(store)}
    >
      <span className="merchant-card__logo">
        <img
          alt=""
          loading="lazy"
          decoding="async"
          width={64}
          height={64}
          src={store.logo}
          onError={swapBrokenImage}
        />
      </span>

      <span className="merchant-card__body">
        <span className="merchant-card__top">
          <span className="merchant-card__name">{store.name}</span>
          <span
            className={`merchant-card__status${store.isOpen ? ' merchant-card__status--open' : ''}`}
          >
            {store.isOpen ? 'Buka' : 'Tutup'}
          </span>
        </span>

        <span className="merchant-card__tagline">{store.tagline}</span>

        <span className="merchant-card__meta">
          <span className="merchant-card__rating">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {formatRating(store.rating)}
          </span>
          {store.deliveryTime ? (
            <>
              <span className="merchant-card__sep" aria-hidden="true">
                •
              </span>
              <Clock size={13} aria-hidden="true" />
              {store.deliveryTime}
            </>
          ) : null}
          {store.distance ? (
            <>
              <span className="merchant-card__sep" aria-hidden="true">
                •
              </span>
              {store.distance}
            </>
          ) : null}
        </span>
      </span>
    </button>
  )
}
