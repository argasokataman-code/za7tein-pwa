import { Star } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import { useChipSet } from '../hooks/useToggleSet'


import toast from 'react-hot-toast'

export default function Filter() {
  const chips = useChipSet(["Sizzling"])
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="filter-screen">
          <div className="filter-sheet">
            <div className="filter-header">
              <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                  Rp5.000
                </span>
                <span aria-live="polite" aria-atomic="true" style={{ color: "#F15A37", fontWeight: "600" }}>
                  Rp20.000
                </span>
                <span>
                  Rp35.000+
                </span>
              </div>
              <input min={5000} max={35000} className="range-input" aria-label="Harga sampai Rp20.000" aria-valuemin={5000} aria-valuemax={35000} aria-valuenow={20000} aria-valuetext="Rp20.000" type="range" defaultValue={20000} />
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
                <input aria-label="Pay now" type="radio" checked name="payment" />
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
              <button type="button" className="apply-btn" aria-label="Apply selected filters" onClick={() => { navigate('/search') }}>
                Apply Filter
              </button>
              <button type="button" className="clear-btn" aria-label="Clear all filters" onClick={() => { toast.success('Filters cleared') }}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
