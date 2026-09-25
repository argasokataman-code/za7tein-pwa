// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { ChevronLeft, Star, SearchIcon, SlidersHorizontal } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { FoodCard } from '../components/ui/FoodCard'
import { useCatalog } from '../hooks/useCatalog'
import { money } from '../data/merchant'
import { useFoodActions } from '../hooks/useFoodActions'
import type { SearchFilters } from '../types'

const RECENT_SEARCHES = ['Pizza', 'Burger', 'Pastry', 'Cookies', 'Meat Church']

export default function Search() {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(RECENT_SEARCHES)
  const { addToCart } = useFoodActions()
  const navigate = useNavigate()
  const location = useLocation()
  const { items, deals, popular } = useCatalog()

  // Filter dari layar Filter (location.state). `null` = tidak sedang memfilter,
  // jadi Hot Deals + Recommended yang tampil.
  const filters = location.state as SearchFilters | null

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q && !filters) return null
    return items.filter((food) => {
      if (
        q &&
        !food.name.toLowerCase().includes(q) &&
        !food.category.toLowerCase().includes(q)
      ) {
        return false
      }
      if (filters?.maxPrice && food.price > filters.maxPrice) return false
      if (filters?.categories?.length && !filters.categories.includes(food.category)) {
        return false
      }
      return true
    })
  }, [items, query, filters])

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
            {recent.length > 0 ? (
              <>
                <div className="search-section-header">
                  <h2>
                    Recent Search
                  </h2>
                  <button type="button" className="link-btn" aria-label="Clear all recent searches" onClick={() => setRecent([])}>
                    Clear All
                  </button>
                </div>
                <div className="chip-row" role="list" aria-label="Recent searches">
                  {recent.map((term) => (
                    <div key={term} role="listitem" className="chip recent-chip">
                      <button
                        type="button"
                        className="recent-chip__term"
                        onClick={() => setQuery(term)}
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        className="recent-chip__remove"
                        aria-label={`Remove ${term}`}
                        onClick={() => setRecent((list) => list.filter((item) => item !== term))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {results !== null ? (
              <>
                <div className="section-header">
                  <h2 className="section-title s7-parallax--title">
                    Hasil ({results.length})
                  </h2>
                </div>
                {results.length > 0 ? (
                  <div className="favorites-grid" role="list">
                    {results.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onOpen={(item) => navigate(`/menu-detail/${item.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="search-empty">Tidak ada menu yang cocok.</p>
                )}
              </>
            ) : (
              <>
                <div className="section-header">
                  <h2 className="section-title s7-parallax--title">
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
                        <div className="hot-deal-price">{money(f.price)}</div>
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
                  <h2 className="section-title s7-parallax--title">
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
