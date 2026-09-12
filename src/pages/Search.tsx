// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { ChevronLeft, Star, SearchIcon, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { FoodCard } from '../components/ui/FoodCard'
import { useCatalog } from '../hooks/useCatalog'
import { rupiah } from '../data/merchant'
import { useFoodActions } from '../hooks/useFoodActions'

import { useChipSet } from '../hooks/useToggleSet'

import toast from 'react-hot-toast'

import { useState } from 'react'

export default function Search() {
  const [query, setQuery] = useState('')
  const chips = useChipSet([])
  const { addToCart } = useFoodActions()
  const navigate = useNavigate()
  const { deals, popular } = useCatalog()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="search-screen">
          <div className="search-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <ChevronLeft size={24} strokeWidth={1.75} />
            </button>
            <h1>
              Search
            </h1>
          </div>
          <div className="search-page-bar">
            <div className="search-bar">
              <SearchIcon size={20} strokeWidth={1.75} className="search-icon" />
              <input placeholder="Search for Food.." className="search-input" aria-label="Search for food" type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Link className="filter-link" aria-label="Open filters" to="/filter">
                <SlidersHorizontal size={22} strokeWidth={1.75} />
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
                Hot Deals
              </h2>
              <Link className="see-all-link" to="/home">
                See All
              </Link>
            </div>
            <div className="hot-deals-list h-scroll-strip" role="list">
              {deals.map((f) => (
                <Link
                  key={f.id}
                  className="hot-deal-card"
                  role="listitem"
                  aria-label={f.name}
                  to={`/menu-detail/${f.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ position: 'relative', flexShrink: '0' }}>
                    <img
                      alt={f.name}
                      width={80}
                      height={80}
                      className="hot-deal-image"
                      src={f.image}
                      loading="lazy"
                      decoding="async"
                      style={{ color: 'transparent', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                  <div className="hot-deal-info">
                    <span className="hot-deal-title">{f.name}</span>
                    <div className="hot-deal-meta">
                      {f.deliveryTime} • {f.distance}
                    </div>
                    <div className="hot-deal-rating">
                      <Star size={11} aria-hidden="true" />
                      {f.rating} ({f.reviewCount} Reviews)
                    </div>
                    <div className="hot-deal-price">{rupiah(f.price)}</div>
                  </div>
                  <button
                    type="button"
                    className="hot-deal-add"
                    aria-label={`Tambah ${f.name} ke keranjang`}
                    onClick={(e) => { e.stopPropagation(); addToCart(f.id) }}
                  >
                    tambah
                  </button>
                </Link>
              ))}
            </div>
            <div className="section-header">
              <h2 className="section-title">
                Recommended
              </h2>
              <Link className="see-all-link" to="/home">
                See All
              </Link>
            </div>
            <div className="food-cards-scroll" role="list">
              {popular.map((f) => (
                <FoodCard
                  key={f.id}
                  food={f}
                  onOpen={(food) => navigate(`/menu-detail/${food.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
