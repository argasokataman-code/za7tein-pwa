// Ported from the original screen markup. Classes match the app stylesheet
// in src/styles/_app.scss, so the styling is identical to the source site.
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import { useAppSelector } from '../hooks/useAppStore'
import { selectCartCount } from '../store/slices/cartSlice'

export default function Checkout() {
  const cartCount = useAppSelector((s) => selectCartCount(s.cart.items))
  const navigate = useNavigate()
  return (
    <>
    <div className="app-shell">
      <main>
        <div className="checkout-screen">
          <div className="checkout-header">
            <button type="button" className="btn-back" aria-label="Go back" onClick={() => navigate(-1)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="checkout-page-title">
              Checkout
            </h1>
            <div className="header-spacer" />
          </div>
          <div className="checkout-empty-state">
            <div className="empty-cart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width={52} height={52} viewBox="0 0 24 24" fill="none" stroke="#FD6931" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag">
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M3.103 6.034h17.794" />
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
              </svg>
            </div>
            <h2 className="empty-cart-title">
              Your cart is empty
            </h2>
            <p className="empty-cart-text">
              Add some delicious food from the menu, then come back here to checkout.
            </p>
            <button type="button" className="proceed-btn" style={{ maxWidth: "260px", width: "100%" }} onClick={() => { if (cartCount === 0) { toast.error("Your cart is empty"); return; } navigate('/payment-selection') }}>
              Browse Menu
            </button>
          </div>
          <div className="home-indicator " />
        </div>
      </main>
    </div>
    <div data-rht-toaster="" style={{ position: "fixed", zIndex: "9999", inset: "16px", pointerEvents: "none" }} />
    </>
  )
}
