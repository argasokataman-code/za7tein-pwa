// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
export default function Filter() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="filter-screen">
          <div className="filter-sheet">
            <div className="filter-header">
              <button type="button" className="btn-back" aria-label="Go back">
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
                  $10
                </span>
                <span aria-live="polite" aria-atomic="true" style={{ color: "rgb(253, 105, 49)", fontWeight: "600" }}>
                  $200
                </span>
                <span>
                  $500+
                </span>
              </div>
              <input min={10} max={500} className="range-input" aria-label="Price up to $200" aria-valuemin={10} aria-valuemax={500} aria-valuenow={200} aria-valuetext="$200" type="range" value="200" />
            </div>
            <div className="filter-block">
              <div className="filter-title">
                Popular Filters
              </div>
              <div className="chip-row" role="group" aria-label="Popular filter chips">
                <button type="button" className="chip active" aria-pressed="true">
                  Sizzling
                </button>
                <button type="button" className="chip" aria-pressed="false">
                  Pizza
                </button>
                <button type="button" className="chip" aria-pressed="false">
                  Cookies
                </button>
                <button type="button" className="chip" aria-pressed="false">
                  Pastry
                </button>
                <button type="button" className="chip" aria-pressed="false">
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
                <button type="button" className="rating-chip" aria-pressed="false" aria-label="1 star">
                  1 ★
                </button>
                <button type="button" className="rating-chip" aria-pressed="false" aria-label="2 stars">
                  2 ★
                </button>
                <button type="button" className="rating-chip" aria-pressed="false" aria-label="3 stars">
                  3 ★
                </button>
                <button type="button" className="rating-chip" aria-pressed="false" aria-label="4 stars">
                  4 ★
                </button>
                <button type="button" className="rating-chip" aria-pressed="false" aria-label="5 stars">
                  5 ★
                </button>
              </div>
            </div>
            <div className="filter-actions">
              <button type="button" className="apply-btn" aria-label="Apply selected filters">
                Apply Filter
              </button>
              <button type="button" className="clear-btn" aria-label="Clear all filters">
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
