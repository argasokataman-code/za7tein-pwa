import { Clock, CreditCard, Globe, MapPin } from 'lucide-react'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { mockMerchant } from '../data/merchant'

const TIER_LABEL: Record<string, string> = { free: 'Gratis', pro: 'Pro' }

export default function MerchantSettings() {
  return (
    <div className="app-shell">
      <main className="merchant-page">
        <header className="merchant-header">
          <h1 className="merchant-title">Setelan toko</h1>
        </header>

        <section className="merchant-card">
          <div className="merchant-row">
            <MapPin size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">{mockMerchant.name}</p>
              <p className="merchant-card-sub">
                {mockMerchant.lat.toFixed(5)}, {mockMerchant.lng.toFixed(5)}
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Clock size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Jam operasional</p>
              <p className="merchant-card-sub">
                {mockMerchant.openTime} – {mockMerchant.closeTime}
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <Globe size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Paket {TIER_LABEL[mockMerchant.tier]}</p>
              <p className="merchant-card-sub">
                {mockMerchant.dailyLimit} order / hari
              </p>
            </div>
          </div>
        </section>

        <section className="merchant-card">
          <div className="merchant-row">
            <CreditCard size={20} strokeWidth={1.75} />
            <div>
              <p className="merchant-card-title">Rekening pencairan</p>
              <p className="merchant-card-sub">
                {mockMerchant.bank.name} · {mockMerchant.bank.account}
              </p>
              <p className="merchant-card-sub">a.n. {mockMerchant.bank.holder}</p>
            </div>
          </div>
        </section>

        <button type="button" className="merchant-btn-ghost merchant-signout">
          Keluar
        </button>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
