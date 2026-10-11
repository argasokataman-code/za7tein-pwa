import type { CSSProperties } from 'react'
import { Clock, Star } from 'lucide-react'

import { formatRating } from '../../data/foods'
import { useMoney } from '../../hooks/useMoney'
import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'
import type { Food } from '../../types'

interface FoodCardProps {
  food: Food
  onOpen: (food: Food) => void
  /**
   * Kelas tambahan dari pemanggil. Dipakai daftar yang ingin masuk berurutan
   * (`stagger-in`) — kartu tidak menentukan itu sendiri, karena halaman yang
   * menampilkan satu kartu saja tidak butuh animasi masuk berurutan.
   */
  className?: string
  /** Variabel CSS tambahan, mis. `--stagger-index`. */
  style?: CSSProperties & Record<'--stagger-index', number>
}

export function FoodCard({ food, onOpen, className = '', style }: FoodCardProps) {
  const { money } = useMoney()
  return (
    <div
      className={`food-card ${className}`.trim()}
      role="article"
      style={{ cursor: 'pointer', ...style }}
      onClick={() => onOpen(food)}
    >
      <div className="food-card-image">
        <img
          alt={food.name}
          loading="lazy"
          decoding="async"
          src={food.image}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            inset: 0,
            objectFit: 'cover',
          }}
        />
        {food.discountPercent ? (
          <span className="discount-badge" aria-label={`Diskon ${food.discountPercent} persen`}>
            <span className="discount-badge__pct" aria-hidden="true">
              {food.discountPercent}%
            </span>
            <span className="discount-badge__off" aria-hidden="true">
              Off
            </span>
          </span>
        ) : null}
        <FavoriteButton id={food.id} name={food.name} />
      </div>

      <div className="food-card-content">
        <div className="food-name-price">
          <h3 className="food-name">{food.name}</h3>
          <span className="food-price">{money(food.price)}</span>
        </div>

        <div className="food-meta">
          {food.deliveryTime || food.distance ? (
            <div className="food-delivery-info">
              {food.deliveryTime ? (
                <>
                  <Clock size={14} />
                  <span>{food.deliveryTime}</span>
                </>
              ) : null}
              {food.distance ? (
                <>
                  <span className="separator">•</span>
                  <span>{food.distance}</span>
                </>
              ) : null}
            </div>
          ) : null}

          {food.rating > 0 || food.reviewCount > 0 ? (
            <div className="food-rating">
              <Star size={14} fill="currentColor" />
              <span className="rating-value">{formatRating(food.rating)}</span>
              <span className="rating-count">({food.reviewCount} ulasan)</span>
            </div>
          ) : null}
        </div>

        <AddToCartButton food={food} />
      </div>
    </div>
  )
}
