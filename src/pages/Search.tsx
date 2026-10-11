// Search finds a dish (menu-level). The default (no query, no filter) used to
// show a "Hot Deals" strip and a "Recommended" strip copied from the old
// beranda; the promo/deals now live on the store page, so the strip is gone and
// the default is a single recommended grid that uses the same FoodCard as the
// results. Classes match the stylesheet in src/styles/_app.scss + system/.
import { SearchIcon, SlidersHorizontal } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { FoodCard } from '../components/ui/FoodCard'
import { useCatalog } from '../hooks/useCatalog'
import type { SearchFilters } from '../types'
import { BackButton } from '../components/ui/BackButton'
import { CurrencyToggle } from '../components/ui/CurrencyToggle'

const RECENT_SEARCHES = ['Pizza', 'Burger', 'Pastry', 'Cookies', 'Meat Church']

export default function Search() {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(RECENT_SEARCHES)
  const navigate = useNavigate()
  const location = useLocation()
  const { items, popular } = useCatalog()

  // Filter dari layar Filter (location.state). `null` = tidak sedang memfilter,
  // jadi grid "Rekomendasi" yang tampil.
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

  const openMenu = (id: string) => navigate(`/menu-detail/${id}`)

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="search-screen">
          <div className="search-header">
            <BackButton className="btn-back" />
            <h1>
              Search
            </h1>
            <CurrencyToggle />
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
                        onOpen={(item) => openMenu(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="search-empty">Tidak ada menu yang cocok.</p>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        setQuery('')
                        navigate(location.pathname, { replace: true, state: null })
                      }}
                    >
                      Hapus filter
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="section-header">
                  <h2 className="section-title s7-parallax--title">
                    Rekomendasi
                  </h2>
                </div>
                <div className="favorites-grid" role="list">
                  {popular.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onOpen={(item) => openMenu(item.id)}
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
