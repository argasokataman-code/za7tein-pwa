import { ChevronLeft, Star } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { useChipSet } from '../hooks/useToggleSet'
import { money } from '../data/merchant'
import type { SearchFilters } from '../types'

/** Batas slider harga; `PRICE_MAX` = tanpa filter harga. */
const PRICE_MIN = 5000
const PRICE_MAX = 35000

export default function Filter() {
  const chips = useChipSet(["Sizzling"])
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const navigate = useNavigate()

  // Filter diteruskan ke Search lewat location.state — sebelumnya tombolnya
  // hanya bernavigasi dan pilihan pengguna hilang.
  const apply = () => {
    const filters: SearchFilters = {
      maxPrice: maxPrice < PRICE_MAX ? maxPrice : undefined,
      categories: chips.values.filter((value) => !/^\d$/.test(value)),
    }
    navigate('/search', { state: filters })
  }

  const clearAll = () => {
    chips.clear()
    setMaxPrice(PRICE_MAX)
  }

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="filter-screen">
          <div className="filter-sheet">
            <div className="filter-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <ChevronLeft size={24} strokeWidth={1.75} />
              </button>
              <h1>
                Filter
              </h1>
            </div>
            <div className="filter-block">
              <div className="filter-title">
                Price Range
              </div>
              <div className="price-range">
                <span>
                  {money(PRICE_MIN)}
                </span>
                <span aria-live="polite" aria-atomic="true" style={{ color: "#F15A37", fontWeight: "600" }}>
                  {money(maxPrice)}
                </span>
                <span>
                  {money(PRICE_MAX)}+
                </span>
              </div>
              <input min={PRICE_MIN} max={PRICE_MAX} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="range-input" aria-label={`Harga sampai ${money(maxPrice)}`} aria-valuemin={PRICE_MIN} aria-valuemax={PRICE_MAX} aria-valuenow={maxPrice} aria-valuetext={money(maxPrice)} type="range" />
            </div>
            <div className="filter-block">
              <div className="filter-title">
                Popular Filters
              </div>
              <div className="chip-row" role="group" aria-label="Popular filter chips">
                <button type="button" className={`chip${chips.isActive("Sizzling") ? " active" : ""}`} onClick={() => chips.toggle("Sizzling")} aria-pressed="true">
                  Sizzling
                </button>
                <button type="button" className={`chip${chips.isActive("Pizza") ? " active" : ""}`} onClick={() => chips.toggle("Pizza")} aria-pressed="false">
                  Pizza
                </button>
                <button type="button" className={`chip${chips.isActive("Cookies") ? " active" : ""}`} onClick={() => chips.toggle("Cookies")} aria-pressed="false">
                  Cookies
                </button>
                <button type="button" className={`chip${chips.isActive("Pastry") ? " active" : ""}`} onClick={() => chips.toggle("Pastry")} aria-pressed="false">
                  Pastry
                </button>
                <button type="button" className={`chip${chips.isActive("Meat Church") ? " active" : ""}`} onClick={() => chips.toggle("Meat Church")} aria-pressed="false">
                  Meat Church
                </button>
              </div>
            </div>
            <div className="filter-block">
              <div className="filter-title">
                Payment Type
              </div>
              <label className="radio-item">
                <input aria-label="Pay now" type="radio" defaultChecked name="payment" />
                <span className="radio-dot" />
                <span>
                  Pay now
                </span>
              </label>
              <label className="radio-item">
                <input aria-label="Pay on delivery" type="radio" name="payment" />
                <span className="radio-dot" />
                <span>
                  Pay on delivery
                </span>
              </label>
            </div>
            <div className="filter-block">
              <div className="filter-title">
                Star Rating
              </div>
              <div className="rating-row" role="group" aria-label="Star rating filter">
                <button type="button" className={`rating-chip${chips.isActive("1") ? " active" : ""}`} onClick={() => chips.toggle("1")} aria-pressed="false" aria-label="1 star">
                  1 <Star size={14} strokeWidth={2} aria-hidden="true" />
                </button>
                <button type="button" className={`rating-chip${chips.isActive("2") ? " active" : ""}`} onClick={() => chips.toggle("2")} aria-pressed="false" aria-label="2 star">
                  2 <Star size={14} strokeWidth={2} aria-hidden="true" />
                </button>
                <button type="button" className={`rating-chip${chips.isActive("3") ? " active" : ""}`} onClick={() => chips.toggle("3")} aria-pressed="false" aria-label="3 star">
                  3 <Star size={14} strokeWidth={2} aria-hidden="true" />
                </button>
                <button type="button" className={`rating-chip${chips.isActive("4") ? " active" : ""}`} onClick={() => chips.toggle("4")} aria-pressed="false" aria-label="4 star">
                  4 <Star size={14} strokeWidth={2} aria-hidden="true" />
                </button>
                <button type="button" className={`rating-chip${chips.isActive("5") ? " active" : ""}`} onClick={() => chips.toggle("5")} aria-pressed="false" aria-label="5 star">
                  5 <Star size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="filter-actions">
              <button type="button" className="apply-btn" aria-label="Apply selected filters" onClick={apply}>
                Apply Filter
              </button>
              <button type="button" className="clear-btn" aria-label="Clear all filters" onClick={clearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
