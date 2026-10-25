import { ArrowRight, CreditCard, Globe, Smartphone, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import toast from 'react-hot-toast'
import { BackButton } from '../components/ui/BackButton'

interface LinkedMethod {
  id: string
  label: string
  Icon: typeof CreditCard
  connected: boolean
}

const INITIAL_METHODS: LinkedMethod[] = [
  { id: 'apple-pay', label: 'Apple Pay', Icon: Smartphone, connected: true },
  { id: 'google-pay', label: 'Google Pay', Icon: Wallet, connected: true },
  { id: 'paypal', label: 'PayPal', Icon: Globe, connected: false },
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
              <BackButton className="back-btn-profile" to="/profile" />
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
                    <method.Icon size={24} strokeWidth={1.75} />
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
