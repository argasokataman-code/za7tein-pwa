import { ArrowRight, Search as SearchIcon } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import { CurrencyToggle } from '../components/ui/CurrencyToggle'

export default function HelpCenter() {
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <BackButton className="back-btn-profile" to="/profile" />
              <h1 className="profile-flow-title">
                Help Center
              </h1>
              <CurrencyToggle />
            </header>
            <main className="wallet-main">
              <div className="help-search-wrap">
                <SearchIcon size={20} strokeWidth={1.75} />
                <input className="help-search-input" placeholder="Search here..." type="search" />
              </div>
              <div className="help-list">
                <Link className="help-item" to="/faq">
                  <span className="help-item-text">
                    How do I make a payment?
                  </span>
                  <ArrowRight size={20} strokeWidth={1.75} />
                </Link>
                <Link className="help-item" to="/faq">
                  <span className="help-item-text">
                    How do I add my bank?
                  </span>
                  <ArrowRight size={20} strokeWidth={1.75} />
                </Link>
                <Link className="help-item" to="/faq">
                  <span className="help-item-text">
                    How do I contact support?
                  </span>
                  <ArrowRight size={20} strokeWidth={1.75} />
                </Link>
              </div>
            </main>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
