import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { foods, getFood } from '../data/foods'
import { menuDetailReviews } from '../data/reviews'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { addItem } from '../store/slices/cartSlice'
import { toggleFavorite } from '../store/slices/favoritesSlice'

const TRUNCATE_AT = 96

export default function MenuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [quantity, setQuantity] = useState(1)
  const [expanded, setExpanded] = useState(false)

  const food = getFood(id ?? '') ?? foods[0]
  const isFavorite = useAppSelector((s) => s.favorites.ids.includes(food.id))
  const longDescription = food.description.length > 100
  const shownDescription =
    longDescription && !expanded
      ? `${food.description.slice(0, TRUNCATE_AT)}…`
      : food.description

  const addToCart = () => {
    dispatch(addItem({ food, quantity }))
    toast.success(`${quantity} × ${food.name} added to cart`)
  }

  return (
    <>
      <div className="app-shell">
        <main>
          <div className="menu-detail-screen">
            <div className="menu-detail-hero">
              <img
                alt={food.name}
                className="menu-detail-hero-image"
                src={food.image}
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: 0,
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 50%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="menu-detail-header">
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
                <h1 className="menu-detail-title">Menu Detail</h1>
                <button
                  type="button"
                  className={`favorite-header-btn${isFavorite ? ' active' : ''}`}
                  aria-label={`${isFavorite ? 'Remove' : 'Add'} ${food.name} ${isFavorite ? 'from' : 'to'} favorites`}
                  aria-pressed={isFavorite}
                  onClick={() => dispatch(toggleFavorite(food.id))}
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={isFavorite ? 'white' : 'none'}
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="menu-detail-content">
              <div className="menu-detail-name-price">
                <h2 className="menu-detail-name">{food.name}</h2>
                <span className="menu-detail-price">${food.price.toFixed(2)}</span>
              </div>

              <div className="menu-info-badges" role="list" aria-label="Food details">
                <div className="info-badge" role="listitem">
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 3H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19C19.4693 16.009 19.9268 15.8526 20.2925 15.5583C20.6581 15.264 20.9086 14.8504 21 14.39L22.6 7H6"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Free Delivery</span>
                </div>
                <div className="info-badge" role="listitem">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth={2} />
                    <path
                      d="M12 6V12L16 14"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{food.deliveryTime}</span>
                </div>
                <div className="info-badge" role="listitem">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="white"
                    />
                  </svg>
                  <span>{food.rating}</span>
                </div>
              </div>

              <div className="menu-description-section">
                <h3 className="description-title">Description</h3>
                <div className="menu-description-wrapper">
                  <p className="menu-description">
                    <span className="description-bold">{food.name} </span>
                    <span className="description-text">{shownDescription}</span>
                  </p>
                  {longDescription ? (
                    <button
                      type="button"
                      className="read-more-btn"
                      aria-expanded={expanded}
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded ? 'Show Less' : 'Read More...'}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="menu-reviews-section">
                <div className="reviews-header">
                  <h3 className="reviews-title">Reviews ({food.reviewCount})</h3>
                  <Link className="see-all-link" to="/reviews">
                    See All
                  </Link>
                </div>
                <div className="reviews-list">
                  {menuDetailReviews.map((review) => (
                    <div className="review-card" key={review.id}>
                      <img
                        alt={review.name}
                        width={52}
                        height={52}
                        className="reviewer-avatar"
                        src={review.avatar}
                      />
                      <div className="review-content">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.name}</span>
                          <div className="review-rating">
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="#FF6B35"
                              />
                            </svg>
                            <span className="rating-value">{review.rating}</span>
                          </div>
                        </div>
                        <p className="review-text">{review.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="menu-detail-actions">
              <div className="quantity-selector" role="group" aria-label="Select quantity">
                <button
                  type="button"
                  className="quantity-btn quantity-minus"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19" stroke="white" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </button>
                <span className="quantity-value" aria-live="polite" aria-atomic="true">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="quantity-btn quantity-plus"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                className="add-to-cart-btn"
                aria-label={`Add ${quantity} ${food.name} to cart, total $${(food.price * quantity).toFixed(2)}`}
                onClick={addToCart}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
                    fill="white"
                  />
                  <path
                    d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
                    fill="white"
                  />
                  <path
                    d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19C19.4693 16.009 19.9268 15.8526 20.2925 15.5583C20.6581 15.264 20.9086 14.8504 21 14.39L22.6 7H6"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Add to Cart — ${(food.price * quantity).toFixed(2)}</span>
              </button>
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
