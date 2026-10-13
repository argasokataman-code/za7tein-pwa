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
  const hasRating = food.rating > 0 || food.reviewCount > 0
  const hasMeta =
    hasRating ||
    Boolean(food.cookMinutes) ||
    Boolean(food.deliveryTime) ||
    Boolean(food.distance)
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
            Hemat {food.discountPercent}%
          </span>
        ) : null}
        <FavoriteButton id={food.id} name={food.name} />
      </div>

      <div className="food-card-content">
        <h3 className="food-name">{food.name}</h3>

        {food.description ? <p className="food-desc">{food.description}</p> : null}

        <div className="food-meta">
          {hasRating ? (
            <span className="food-rating">
              <Star size={14} fill="currentColor" aria-hidden="true" />
              <span className="rating-value">{formatRating(food.rating)}</span>
              <span className="rating-count">({food.reviewCount} ulasan)</span>
            </span>
          ) : null}
          {food.cookMinutes ? (
            <span className="food-cook">
              <Clock size={13} aria-hidden="true" />
              {food.cookMinutes} mnt
            </span>
          ) : null}
          {food.deliveryTime ? (
            <>
              <span className="separator" aria-hidden="true">
                •
              </span>
              <span>{food.deliveryTime}</span>
            </>
          ) : null}
          {food.distance ? (
            <>
              <span className="separator" aria-hidden="true">
                •
              </span>
              <span>{food.distance}</span>
            </>
          ) : null}
          {/* Data menu dari BE belum punya rating/waktu untuk semua toko. Baris
              yang kosong diberi tanda `-` supaya tidak terlihat seperti kartu
              gagal render, bukan dibiarkan bolong. */}
          {hasMeta ? null : (
            <span className="food-meta__empty" aria-label="Tanpa rating dan waktu">
              -
            </span>
          )}
        </div>

        <div className="food-price-row">
          <span className="food-price">{money(food.price)}</span>
          <AddToCartButton food={food} iconOnly className="food-card-add" />
        </div>
      </div>
    </div>
  )
}
