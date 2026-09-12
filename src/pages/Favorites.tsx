import { Clock, Star, ChevronLeft, Heart } from 'lucide-react'
import { rupiah } from '../data/merchant'
import { Link, useNavigate } from 'react-router-dom'

import { AddToCartButton } from '../components/ui/AddToCartButton'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { useAppSelector } from '../hooks/useAppStore'
import { useCatalog } from '../hooks/useCatalog'
import type { MenuItem } from '../types'

export default function Favorites() {
  const navigate = useNavigate()
  const ids = useAppSelector((s) => s.favorites.ids)
  const { items } = useCatalog()
  const favorites = ids
    .map((id) => items.find((f) => f.id === id))
    .filter((f): f is MenuItem => Boolean(f))

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="favorites-screen">
            <header className="favorites-header">
              <button
                type="button"
                className="btn-back"
                aria-label="Go back"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1 className="favorites-title">
                Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
              </h1>
            </header>
            <div
              className="favorites-content"
              style={
                favorites.length > 0
                  ? { alignItems: 'flex-start', justifyContent: 'flex-start' }
                  : undefined
              }
            >
              {favorites.length === 0 ? (
                <div className="empty-state">
                  <Heart size={80} strokeWidth={1.75} color="var(--orange-ink)" />
                  <h2>No Favorites Yet</h2>
                  <p>Start adding your favourite items to see them here!</p>
                  <Link className="btn btn-primary" to="/home">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favorites.map((food) => (
                    <Link
                      key={food.id}
                      className="food-card"
                      to={`/menu-detail/${food.id}`}
                      style={{ textDecoration: 'none', display: 'block' }}
                      aria-label={food.name}
                    >
                      <div className="food-card-image">
                        <img
                          alt={food.name}
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
                          <span className="discount-badge">
                            {food.discountPercent}% Off
                          </span>
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
                          <span className="rating-count">
                            ({food.reviewCount} Reviews)
                          </span>
                        </div>
                        <AddToCartButton food={food} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="home-indicator " />
          </div>
        </main>
      </div>
    </>
  )
}
