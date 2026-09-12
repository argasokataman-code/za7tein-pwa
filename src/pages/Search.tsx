// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link, useNavigate } from 'react-router-dom'

import { FavoriteButton } from '../components/ui/FavoriteButton'
import { useFoodActions } from '../hooks/useFoodActions'

import { useChipSet } from '../hooks/useToggleSet'

import toast from 'react-hot-toast'

import { useState } from 'react'

export default function Search() {
  const [query, setQuery] = useState('')
  const chips = useChipSet([])
  const { addToCart } = useFoodActions()
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="search-screen">
          <div className="search-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1>
              Search
            </h1>
          </div>
          <div className="search-page-bar">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B6865" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search search-icon">
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
              <input placeholder="Search for Food.." className="search-input" aria-label="Search for food" type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Link className="filter-link" aria-label="Open filters" to="/filter">
                <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6B6865" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal">
                  <path d="M10 5H3" />
                  <path d="M12 19H3" />
                  <path d="M14 3v4" />
                  <path d="M16 17v4" />
                  <path d="M21 12h-9" />
                  <path d="M21 19h-5" />
                  <path d="M21 5h-7" />
                  <path d="M8 10v4" />
                  <path d="M8 12H3" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="search-content">
            <div className="search-section-header">
              <h2>
                Recent Search
              </h2>
              <button type="button" className="link-btn" aria-label="Clear all recent searches" onClick={() => { toast.success("See all results") }}>
                Clear All
              </button>
            </div>
            <div className="chip-row" role="list" aria-label="Recent searches">
              <button role="listitem" className={`chip${chips.isActive("Pizza ×") ? " active" : ""}`} onClick={() => chips.toggle("Pizza ×")} aria-label="Search for Pizza">
                Pizza
                <span role="button" aria-label="Remove Pizza">
                  ×
                </span>
              </button>
              <button role="listitem" className={`chip${chips.isActive("Burger ×") ? " active" : ""}`} onClick={() => chips.toggle("Burger ×")} aria-label="Search for Burger">
                Burger
                <span role="button" aria-label="Remove Burger">
                  ×
                </span>
              </button>
              <button role="listitem" className={`chip${chips.isActive("Pastry ×") ? " active" : ""}`} onClick={() => chips.toggle("Pastry ×")} aria-label="Search for Pastry">
                Pastry
                <span role="button" aria-label="Remove Pastry">
                  ×
                </span>
              </button>
              <button role="listitem" className={`chip${chips.isActive("Cookies ×") ? " active" : ""}`} onClick={() => chips.toggle("Cookies ×")} aria-label="Search for Cookies">
                Cookies
                <span role="button" aria-label="Remove Cookies">
                  ×
                </span>
              </button>
              <button role="listitem" className={`chip${chips.isActive("Meat Church ×") ? " active" : ""}`} onClick={() => chips.toggle("Meat Church ×")} aria-label="Search for Meat Church">
                Meat Church
                <span role="button" aria-label="Remove Meat Church">
                  ×
                </span>
              </button>
            </div>
            <div className="section-header">
              <h2 className="section-title">
                Hot Deals 🔥
              </h2>
              <Link className="see-all-link" to="/home">
                See All
              </Link>
            </div>
            <div className="hot-deals-list h-scroll-strip" role="list">
              <Link className="hot-deal-card" role="listitem" aria-label="Tandoori Pizza" to="/menu-detail/1" style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", flexShrink: "0" }}>
                  <img alt="Tandoori Pizza" width={80} height={80} className="hot-deal-image" src="/assets/img/menu-details/menu-details-thumb.png" style={{ color: "transparent", width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <div className="hot-deal-info">
                  <span className="hot-deal-title">
                    Tandoori Pizza
                  </span>
                  <div className="hot-deal-meta">
                    15-30 min • 1.3 km
                  </div>
                  <div className="hot-deal-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star" style={{ display: "inline", marginRight: "2px" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    4.3 (27 Reviews)
                  </div>
                  <div className="hot-deal-price">
                    $15.00
                  </div>
                </div>
                <button type="button" className="hot-deal-add" aria-label="Add Tandoori Pizza to cart" onClick={(e) => { e.stopPropagation(); addToCart('1') }}>
                  add
                </button>
              </Link>
              <Link className="hot-deal-card" role="listitem" aria-label="Chinese Fried Rice" to="/menu-detail/2" style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", flexShrink: "0" }}>
                  <img alt="Chinese Fried Rice" width={80} height={80} className="hot-deal-image" src="/assets/img/onboarding-bg.jpg" style={{ color: "transparent", width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <div className="hot-deal-info">
                  <span className="hot-deal-title">
                    Chinese Fried Rice
                  </span>
                  <div className="hot-deal-meta">
                    20-35 min • 2.1 km
                  </div>
                  <div className="hot-deal-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star" style={{ display: "inline", marginRight: "2px" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    4.1 (45 Reviews)
                  </div>
                  <div className="hot-deal-price">
                    $12.00
                  </div>
                </div>
                <button type="button" className="hot-deal-add" aria-label="Add Chinese Fried Rice to cart" onClick={(e) => { e.stopPropagation(); addToCart('2') }}>
                  add
                </button>
              </Link>
              <Link className="hot-deal-card" role="listitem" aria-label="Burger Deluxe" to="/menu-detail/3" style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", flexShrink: "0" }}>
                  <img alt="Burger Deluxe" width={80} height={80} className="hot-deal-image" src="/assets/img/onboarding-bg.jpg" style={{ color: "transparent", width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <div className="hot-deal-info">
                  <span className="hot-deal-title">
                    Burger Deluxe
                  </span>
                  <div className="hot-deal-meta">
                    20-35 min • 2.5 km
                  </div>
                  <div className="hot-deal-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star" style={{ display: "inline", marginRight: "2px" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    4.7 (35 Reviews)
                  </div>
                  <div className="hot-deal-price">
                    $18.00
                  </div>
                </div>
                <button type="button" className="hot-deal-add" aria-label="Add Burger Deluxe to cart" onClick={(e) => { e.stopPropagation(); addToCart('3') }}>
                  add
                </button>
              </Link>
              <Link className="hot-deal-card" role="listitem" aria-label="Cheese Sizzling" to="/menu-detail/4" style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", flexShrink: "0" }}>
                  <img alt="Cheese Sizzling" width={80} height={80} className="hot-deal-image" src="/assets/img/onboarding-bg.jpg" style={{ color: "transparent", width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <div className="hot-deal-info">
                  <span className="hot-deal-title">
                    Cheese Sizzling
                  </span>
                  <div className="hot-deal-meta">
                    15-30 min • 1.3 km
                  </div>
                  <div className="hot-deal-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star" style={{ display: "inline", marginRight: "2px" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    4.2 (92 Reviews)
                  </div>
                  <div className="hot-deal-price">
                    $15.00
                  </div>
                </div>
                <button type="button" className="hot-deal-add" aria-label="Add Cheese Sizzling to cart" onClick={(e) => { e.stopPropagation(); addToCart('4') }}>
                  add
                </button>
              </Link>
              <Link className="hot-deal-card" role="listitem" aria-label="Classic Burger" to="/menu-detail/5" style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", flexShrink: "0" }}>
                  <img alt="Classic Burger" width={80} height={80} className="hot-deal-image" src="/assets/img/onboarding-bg.jpg" style={{ color: "transparent", width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <div className="hot-deal-info">
                  <span className="hot-deal-title">
                    Classic Burger
                  </span>
                  <div className="hot-deal-meta">
                    15-30 min • 1.3 km
                  </div>
                  <div className="hot-deal-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star" style={{ display: "inline", marginRight: "2px" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    4.2 (92 Reviews)
                  </div>
                  <div className="hot-deal-price">
                    $15.00
                  </div>
                </div>
                <button type="button" className="hot-deal-add" aria-label="Add Classic Burger to cart" onClick={(e) => { e.stopPropagation(); addToCart('5') }}>
                  add
                </button>
              </Link>
              <Link className="hot-deal-card" role="listitem" aria-label="Pasta Carbonara" to="/menu-detail/6" style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", flexShrink: "0" }}>
                  <img alt="Pasta Carbonara" width={80} height={80} className="hot-deal-image" src="/assets/img/onboarding-bg.jpg" style={{ color: "transparent", width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <div className="hot-deal-info">
                  <span className="hot-deal-title">
                    Pasta Carbonara
                  </span>
                  <div className="hot-deal-meta">
                    25-40 min • 1.8 km
                  </div>
                  <div className="hot-deal-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star" style={{ display: "inline", marginRight: "2px" }}>
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    4.6 (58 Reviews)
                  </div>
                  <div className="hot-deal-price">
                    $13.50
                  </div>
                </div>
                <button type="button" className="hot-deal-add" aria-label="Add Pasta Carbonara to cart" onClick={(e) => { e.stopPropagation(); addToCart('6') }}>
                  add
                </button>
              </Link>
            </div>
            <div className="section-header">
              <h2 className="section-title">
                Recommended 🔥
              </h2>
              <Link className="see-all-link" to="/home">
                See All
              </Link>
            </div>
            <div className="food-cards-scroll" role="list">
              <Link className="food-card" role="listitem" aria-label="Tandoori Pizza, 10% off" to="/menu-detail/1" style={{ textDecoration: "none", display: "block" }}>
                <div className="food-card-image">
                  <img alt="Tandoori Pizza" src="/assets/img/menu-details/menu-details-thumb.png" style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", objectFit: "cover", color: "transparent" }} />
                  <span className="discount-badge">
                    10% Off
                  </span>
                  <FavoriteButton id="1" name="Tandoori Pizza" />
                </div>
                <div className="food-card-content">
                  <div className="food-name-price">
                    <h3 className="food-name">
                      Tandoori Pizza
                    </h3>
                    <span className="food-price">
                      $15.00
                    </span>
                  </div>
                  <div className="food-delivery-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>
                      15-30 min
                    </span>
                    <span className="separator">
                      •
                    </span>
                    <span>
                      1.3 km
                    </span>
                  </div>
                  <div className="food-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="rating-value">
                      4.3
                    </span>
                    <span className="rating-count">
                      (27 Reviews)
                    </span>
                  </div>
                  <button type="button" className="buy-now-btn" aria-label="Add Tandoori Pizza to cart" onClick={(e) => { e.stopPropagation(); addToCart('1') }}>
                    Buy Now
                  </button>
                </div>
              </Link>
              <Link className="food-card" role="listitem" aria-label="Chinese Fried Rice, 10% off" to="/menu-detail/2" style={{ textDecoration: "none", display: "block" }}>
                <div className="food-card-image">
                  <img alt="Chinese Fried Rice" src="/assets/img/onboarding-bg.jpg" style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", objectFit: "cover", color: "transparent" }} />
                  <span className="discount-badge">
                    10% Off
                  </span>
                  <FavoriteButton id="2" name="Chinese Fried Rice" />
                </div>
                <div className="food-card-content">
                  <div className="food-name-price">
                    <h3 className="food-name">
                      Chinese Fried Rice
                    </h3>
                    <span className="food-price">
                      $12.00
                    </span>
                  </div>
                  <div className="food-delivery-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>
                      20-35 min
                    </span>
                    <span className="separator">
                      •
                    </span>
                    <span>
                      2.1 km
                    </span>
                  </div>
                  <div className="food-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="rating-value">
                      4.1
                    </span>
                    <span className="rating-count">
                      (45 Reviews)
                    </span>
                  </div>
                  <button type="button" className="buy-now-btn" aria-label="Add Chinese Fried Rice to cart" onClick={(e) => { e.stopPropagation(); addToCart('2') }}>
                    Buy Now
                  </button>
                </div>
              </Link>
              <Link className="food-card" role="listitem" aria-label="Burger Deluxe, 15% off" to="/menu-detail/3" style={{ textDecoration: "none", display: "block" }}>
                <div className="food-card-image">
                  <img alt="Burger Deluxe" src="/assets/img/onboarding-bg.jpg" style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", objectFit: "cover", color: "transparent" }} />
                  <span className="discount-badge">
                    15% Off
                  </span>
                  <FavoriteButton id="3" name="Burger Deluxe" />
                </div>
                <div className="food-card-content">
                  <div className="food-name-price">
                    <h3 className="food-name">
                      Burger Deluxe
                    </h3>
                    <span className="food-price">
                      $18.00
                    </span>
                  </div>
                  <div className="food-delivery-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>
                      20-35 min
                    </span>
                    <span className="separator">
                      •
                    </span>
                    <span>
                      2.5 km
                    </span>
                  </div>
                  <div className="food-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="rating-value">
                      4.7
                    </span>
                    <span className="rating-count">
                      (35 Reviews)
                    </span>
                  </div>
                  <button type="button" className="buy-now-btn" aria-label="Add Burger Deluxe to cart" onClick={(e) => { e.stopPropagation(); addToCart('3') }}>
                    Buy Now
                  </button>
                </div>
              </Link>
              <Link className="food-card" role="listitem" aria-label="Cheese Sizzling" to="/menu-detail/4" style={{ textDecoration: "none", display: "block" }}>
                <div className="food-card-image">
                  <img alt="Cheese Sizzling" src="/assets/img/onboarding-bg.jpg" style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", objectFit: "cover", color: "transparent" }} />
                  <FavoriteButton id="4" name="Cheese Sizzling" />
                </div>
                <div className="food-card-content">
                  <div className="food-name-price">
                    <h3 className="food-name">
                      Cheese Sizzling
                    </h3>
                    <span className="food-price">
                      $15.00
                    </span>
                  </div>
                  <div className="food-delivery-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>
                      15-30 min
                    </span>
                    <span className="separator">
                      •
                    </span>
                    <span>
                      1.3 km
                    </span>
                  </div>
                  <div className="food-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="rating-value">
                      4.2
                    </span>
                    <span className="rating-count">
                      (92 Reviews)
                    </span>
                  </div>
                  <button type="button" className="buy-now-btn" aria-label="Add Cheese Sizzling to cart" onClick={(e) => { e.stopPropagation(); addToCart('4') }}>
                    Buy Now
                  </button>
                </div>
              </Link>
              <Link className="food-card" role="listitem" aria-label="Classic Burger" to="/menu-detail/5" style={{ textDecoration: "none", display: "block" }}>
                <div className="food-card-image">
                  <img alt="Classic Burger" src="/assets/img/onboarding-bg.jpg" style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", objectFit: "cover", color: "transparent" }} />
                  <FavoriteButton id="5" name="Classic Burger" />
                </div>
                <div className="food-card-content">
                  <div className="food-name-price">
                    <h3 className="food-name">
                      Classic Burger
                    </h3>
                    <span className="food-price">
                      $15.00
                    </span>
                  </div>
                  <div className="food-delivery-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>
                      15-30 min
                    </span>
                    <span className="separator">
                      •
                    </span>
                    <span>
                      1.3 km
                    </span>
                  </div>
                  <div className="food-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="rating-value">
                      4.2
                    </span>
                    <span className="rating-count">
                      (92 Reviews)
                    </span>
                  </div>
                  <button type="button" className="buy-now-btn" aria-label="Add Classic Burger to cart" onClick={(e) => { e.stopPropagation(); addToCart('5') }}>
                    Buy Now
                  </button>
                </div>
              </Link>
              <Link className="food-card" role="listitem" aria-label="Pasta Carbonara" to="/menu-detail/6" style={{ textDecoration: "none", display: "block" }}>
                <div className="food-card-image">
                  <img alt="Pasta Carbonara" src="/assets/img/onboarding-bg.jpg" style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", objectFit: "cover", color: "transparent" }} />
                  <FavoriteButton id="6" name="Pasta Carbonara" />
                </div>
                <div className="food-card-content">
                  <div className="food-name-price">
                    <h3 className="food-name">
                      Pasta Carbonara
                    </h3>
                    <span className="food-price">
                      $13.50
                    </span>
                  </div>
                  <div className="food-delivery-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>
                      25-40 min
                    </span>
                    <span className="separator">
                      •
                    </span>
                    <span>
                      1.8 km
                    </span>
                  </div>
                  <div className="food-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="#F15A37" stroke="#F15A37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    <span className="rating-value">
                      4.6
                    </span>
                    <span className="rating-count">
                      (58 Reviews)
                    </span>
                  </div>
                  <button type="button" className="buy-now-btn" aria-label="Add Pasta Carbonara to cart" onClick={(e) => { e.stopPropagation(); addToCart('6') }}>
                    Buy Now
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
