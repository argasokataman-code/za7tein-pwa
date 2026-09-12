import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/layout/BottomNav'
import { FoodCard } from '../components/ui/FoodCard'
import { categories, deals, popular } from '../data/foods'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { addItem } from '../store/slices/cartSlice'
import type { Food } from '../types'

const AD_IMAGE = '/assets/media/onboarding-bg.196fa385.jpg'

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const notificationCount = useAppSelector((s) => s.ui.notificationCount)
  const locationLabel = useAppSelector((s) => s.ui.locationLabel)
  const [category, setCategory] = useState('all')

  const visiblePopular =
    category === 'all' ? popular : popular.filter((f) => f.category === category)

  const handleAdd = (food: Food) => {
    dispatch(addItem({ food }))
    toast.success(`${food.name} added to cart`)
  }

  return (
    <div className="app-shell">
    <div className="home-screen-wrapper">
      <div className="home-screen">
        <div className="home-header">
          <div className="header-content">
            <div className="header-top">
              <Link className="profile-section" to="/account-setup">
                <img
                  alt={user?.name ?? 'Profile'}
                  width={48}
                  height={48}
                  src={user?.avatar ?? '/assets/img/profile.png'}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              </Link>

              <button
                type="button"
                className="location-section location-section-btn"
                aria-label="Change delivery location"
                aria-haspopup="dialog"
                aria-expanded="false"
               onClick={() => { toast.success("Change delivery location") }}>
                <div className="location-label">
                  <span>Delivery location</span>
                  <ChevronDown size={14} />
                </div>
                <div className="location-address">
                  <MapPin size={14} />
                  <span>{locationLabel}</span>
                </div>
              </button>

              <Link className="notification-section" to="/notifications" style={{ textDecoration: 'none' }}>
                <div className="notification-icon-wrapper">
                  <Bell size={24} aria-hidden="true" />
                  <span className="notification-badge">{notificationCount}</span>
                </div>
              </Link>
            </div>

            <h1 className="header-title">What would you prefer to eat today?</h1>

            <div className="search-section">
              <div
                className="search-bar"
                role="button"
                tabIndex={0}
                aria-label="Search food"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/search')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
              >
                <Search size={18} />
                <span style={{ flex: 1, color: '#697586', fontSize: 15 }}>
                  Search menu, restaurant
                </span>
                <Link to="/filter" style={{ display: 'flex', color: '#697586' }}>
                  <SlidersHorizontal size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="home-content">
          <div className="categories-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-scroll" role="list">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="listitem"
                  className={`category-btn ${category === c.id ? 'active' : ''}`}
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  {c.emoji ? <span aria-hidden="true">{c.emoji}</span> : null}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="deals-section">
            <div className="section-header">
              <h2 className="section-title">Super Deals 🔥</h2>
              <Link className="see-all-link" to="/search">
                See All
              </Link>
            </div>
            <div className="food-cards-scroll h-scroll-strip" role="list">
              {deals.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onOpen={(f) => navigate(`/menu-detail/${f.id}`)}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </div>

          <div className="ad-banner" style={{ marginBottom: 24 }}>
            <div className="ad-content">
              <div className="ad-text">
                <h3 className="ad-title">Up To 30% Off On First Order</h3>
                <button type="button" className="ad-cta" onClick={() => navigate('/search')}>
                  Order Now
                </button>
              </div>
              <div className="ad-image">
                <img alt="add banner img" loading="lazy" width={200} height={200} src={AD_IMAGE} />
              </div>
            </div>
          </div>

          <div className="hot-deals-section">
            <div className="section-header">
              <h2 className="section-title">Hot Deals 🔥</h2>
              <Link className="see-all-link" to="/search">
                See All
              </Link>
            </div>
            <div className="hot-deals-list" role="list">
              {visiblePopular.map((food) => (
                <div
                  key={food.id}
                  className="hot-deal-card"
                  role="article"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/menu-detail/${food.id}`)}
                >
                  <div className="hot-deal-image" style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      alt={food.name}
                      loading="lazy"
                      width={80}
                      height={80}
                      src={food.image}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </div>
                  <div className="hot-deal-info">
                    <span className="hot-deal-title">{food.name}</span>
                    <div className="hot-deal-meta">
                      {food.deliveryTime} • {food.distance}
                    </div>
                    <div className="hot-deal-rating">
                      <Star size={14} fill="currentColor" />
                      {food.rating} ({food.reviewCount} Reviews)
                    </div>
                    <div className="hot-deal-price">${food.price.toFixed(2)}</div>
                  </div>
                  <button
                    type="button"
                    className="hot-deal-add"
                    aria-label={`Add ${food.name} to cart`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAdd(food)
                    }}
                  >
                    add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
    </div>
  )
}
