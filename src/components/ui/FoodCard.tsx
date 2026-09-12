import { Clock, Star } from 'lucide-react'

import { rupiah } from '../../data/merchant'
import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'
import type { Food } from '../../types'

interface FoodCardProps {
  food: Food
  onOpen: (food: Food) => void
}

export function FoodCard({ food, onOpen }: FoodCardProps) {
  return (
    <div className="food-card" role="article" style={{ cursor: 'pointer' }} onClick={() => onOpen(food)}>
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
          <span className="discount-badge">{food.discountPercent}% Off</span>
        ) : null}
        <FavoriteButton id={food.id} name={food.name} />
      </div>

      <div className="food-card-content">
        <div className="food-name-price">
          <h3 className="food-name">{food.name}</h3>
          <span className="food-price">{rupiah(food.price)}</span>
        </div>

        <div className="food-delivery-info">
          <Clock size={14} />
          <span>{food.deliveryTime}</span>
          <span className="separator">•</span>
          <span>{food.distance}</span>
        </div>

        <div className="food-rating">
          <Star size={14} fill="currentColor" />
          <span className="rating-value">{food.rating}</span>
          <span className="rating-count">({food.reviewCount} Reviews)</span>
        </div>

        <AddToCartButton food={food} />
      </div>
    </div>
  )
}
