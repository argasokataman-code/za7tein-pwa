import { Clock, Star } from 'lucide-react'
import { rupiah } from '../data/merchant'
import { Link, useNavigate } from 'react-router-dom'

import { AddToCartButton } from '../components/ui/AddToCartButton'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { foods } from '../data/foods'
import { useAppSelector } from '../hooks/useAppStore'
import type { Food } from '../types'

export default function Favorites() {
  const navigate = useNavigate()
  const ids = useAppSelector((s) => s.favorites.ids)
  const favorites = ids
    .map((id) => foods.find((f) => f.id === id))
    .filter((f): f is Food => Boolean(f))

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
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
                  <svg width={80} height={80} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
      <div
        data-rht-toaster=""
        style={{
          position: 'fixed',
          zIndex: 9999,
          inset: 16,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
