import { Bike, Phone } from 'lucide-react'

import { MerchantBottomNav } from '../components/layout/MerchantBottomNav'
import { MerchantPageHeader } from '../components/merchant/MerchantPageHeader'
import { MAX_COURIERS_PER_MERCHANT, mockCouriers } from '../data/merchant'

const STATUS_LABEL: Record<string, string> = {
  at_store: 'Di toko',
  delivering: 'Mengantar',
  offline: 'Offline',
}

export default function MerchantCouriers() {
  return (
    <div className="app-shell">
      <main className="merchant-page">
        <MerchantPageHeader
          eyebrow={`${mockCouriers.length} / ${MAX_COURIERS_PER_MERCHANT} kurir terdaftar`}
          title="Kurir"
        />

        {mockCouriers.map((courier) => (
          <section key={courier.id} className="merchant-courier">
            <span className="merchant-courier-icon">
              <Bike size={22} strokeWidth={1.75} />
            </span>
            <div className="merchant-courier-body">
              <p className="merchant-card-title">{courier.name}</p>
              <p className="merchant-card-sub">
                {STATUS_LABEL[courier.status] ?? courier.status} · {courier.activeOrderCount} order aktif
              </p>
              <a className="merchant-courier-phone" href={`tel:${courier.phone}`}>
                <Phone size={14} strokeWidth={1.75} /> {courier.phone}
              </a>
            </div>
            <span className={`merchant-badge merchant-badge-${courier.status}`}>
              {STATUS_LABEL[courier.status] ?? courier.status}
            </span>
          </section>
        ))}

        <p className="merchant-hint-inline">
          Setiap toko hanya boleh mendaftarkan {MAX_COURIERS_PER_MERCHANT} kurir khusus.
        </p>
      </main>
      <MerchantBottomNav />
    </div>
  )
}
