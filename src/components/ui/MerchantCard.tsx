import type { CSSProperties } from 'react'
import { ChevronRight, Clock, Star } from 'lucide-react'

import { formatRating } from '../../data/foods'
import { swapBrokenImage } from '../../data/storefronts'
import type { Storefront } from '../../types'

interface MerchantCardProps {
  store: Storefront
  onOpen: (store: Storefront) => void
  /** Baris promo singkat, mis. "Promo hemat 30%", dihitung dari menu berdiskon. */
  promoText?: string
  className?: string
  /** Variabel CSS tambahan, mis. `--stagger-index`. */
  style?: CSSProperties & Record<'--stagger-index', number>
}

/**
 * Kartu toko di beranda customer — mengikuti daftar "Tetangga favorit" v2:
 * foto 64px, nama + badge buka/tutup, satu baris tagline • jarak, lalu baris
 * promo (bila menunya berdiskon) atau baris rating, dan tanda panah di kanan.
 * Seluruh kartu adalah satu tombol, jadi bisa diaktifkan keyboard.
 */
export function MerchantCard({
  store,
  onOpen,
  promoText,
  className = '',
  style,
}: MerchantCardProps) {
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

        <span className="merchant-card__sub">
          {store.tagline}
          {store.distance ? ` • ${store.distance}` : ''}
        </span>

        {promoText ? (
          <span className="merchant-card__promo">{promoText}</span>
        ) : (
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
          </span>
        )}
      </span>

      <span className="merchant-card__chevron" aria-hidden="true">
        <ChevronRight size={20} strokeWidth={2} />
      </span>
    </button>
  )
}
