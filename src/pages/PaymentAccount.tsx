import { ArrowRight, ChevronLeft, CreditCard } from 'lucide-react'
// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { Link } from 'react-router-dom'
import { useState } from 'react'

import toast from 'react-hot-toast'

interface LinkedMethod {
  id: string
  label: string
  icon: string
  connected: boolean
}

const INITIAL_METHODS: LinkedMethod[] = [
  { id: 'apple-pay', label: 'Apple Pay', icon: '/assets/img/icon/icon1.png', connected: true },
  { id: 'google-pay', label: 'Google Pay', icon: '/assets/img/icon/icon2.png', connected: true },
  { id: 'paypal', label: 'PayPal', icon: '/assets/img/icon/icon3.png', connected: false },
]

export default function PaymentAccount() {
  const [methods, setMethods] = useState(INITIAL_METHODS)

  const remove = (id: string) => {
    setMethods((list) => list.filter((method) => method.id !== id))
    toast.success('Metode dihapus')
  }

  const connect = (id: string) => {
    setMethods((list) =>
      list.map((method) => (method.id === id ? { ...method, connected: true } : method)),
    )
    toast.success('Metode terhubung')
  }

  return (
    <>
    <div className="app-shell">
      <main>
        <div className="wallet-page">
          <div className="wallet-flow">
            <header className="profile-flow-header ">
              <Link className="back-btn-profile" aria-label="Go back" to="/profile">
                <ChevronLeft size={24} strokeWidth={1.75} />
              </Link>
              <h1 className="profile-flow-title">
                Payment Account
              </h1>
            </header>
            <main className="wallet-main">
              <Link className="wallet-item wallet-item-link" to="/your-card">
                <div className="wallet-item-icon">
                  <CreditCard size={24} strokeWidth={1.75} />
                </div>
                <div className="wallet-item-left">
                  <span className="wallet-item-title">
                    Your Card
                  </span>
                  <span className="wallet-item-sub">
                    View and manage your cards
                  </span>
                </div>
                <ArrowRight size={20} strokeWidth={1.75} />
              </Link>
              {methods.map((method) => (
                <div className="wallet-item" key={method.id}>
                  <div className="wallet-item-icon">
                    <img alt={method.label} width={24} height={24} src={method.icon} style={{ color: "transparent" }} />
                  </div>
                  <div className="wallet-item-left">
                    <span className="wallet-item-title">
                      {method.label}
                    </span>
                    <span className="wallet-item-sub">
                      {method.connected ? 'Connected' : 'Unconnected'}
                    </span>
                  </div>
                  {method.connected ? (
                    <button type="button" className="wallet-badge remove" onClick={() => remove(method.id)}>
                      Remove
                    </button>
                  ) : (
                    <button type="button" className="wallet-badge connect" onClick={() => connect(method.id)}>
                      Connect
                    </button>
                  )}
                </div>
              ))}
              <Link className="btn-profile-primary wallet-footer-btn" to="/add-new-card" style={{ marginTop: "24px" }}>
                Add New Card
              </Link>
            </main>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
