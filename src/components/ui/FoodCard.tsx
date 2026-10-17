import { Fragment, type CSSProperties, type ReactNode } from 'react'
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

  // Waktu: estimasi antar toko kalau ada; kalau tidak, waktu masak item
  // (`cook_minutes`) yang menggantikannya. Dua-duanya tidak pernah tampil
  // sekaligus — keduanya "waktu" dan menampilkannya dobel bikin baris meta
  // sesak lalu terpotong.
  const timeNode: ReactNode = food.deliveryTime ? (
    food.deliveryTime
  ) : food.cookMinutes ? (
    <>
      <Clock size={13} aria-hidden="true" />
      {food.cookMinutes} mnt
    </>
  ) : null

  // Fakta pendamping rating, satu format satu pemisah — `isPopular`/`calories`
  // ikut kalau BE mengirimnya (dulu keduanya dibuang).
  const facts: Array<{ key: string; className?: string; content: ReactNode }> = []
  if (timeNode) facts.push({ key: 'time', className: 'food-time', content: timeNode })
  if (food.distance) facts.push({ key: 'distance', content: food.distance })
  if (food.calories) {
    facts.push({ key: 'kcal', className: 'food-kcal', content: `${food.calories} kkal` })
  }
  const hasMeta = hasRating || facts.length > 0

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
        {food.isPopular ? <span className="food-badge food-badge--popular">Populer</span> : null}
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
          {facts.map((fact) => (
            <Fragment key={fact.key}>
              <span className="separator" aria-hidden="true">
                •
              </span>
              <span className={fact.className}>{fact.content}</span>
            </Fragment>
          ))}
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
