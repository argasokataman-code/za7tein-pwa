import { useMemo } from 'react'
import { ChevronLeft, Clock, MapPin, Star } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { BottomNav } from '../components/layout/BottomNav'
import { HomePromoCarousel } from '../components/customer/HomePromoCarousel'
import { FoodCard } from '../components/ui/FoodCard'
import { useCatalog } from '../hooks/useCatalog'
import { dealsFrom, itemsByMerchant } from '../data/catalog'
import { getStorefront } from '../data/storefronts'
import { useMenuItems, useStorefront } from '../hooks/useApiCatalog'
import { formatRating } from '../data/foods'

/**
 * Halaman toko (sisi customer) — langkah kedua alur: setelah memilih toko di
 * beranda, di sini customer melihat promonya lalu menunya, baru masuk ke detail
 * menu per item (`/menu-detail/:id`).
 */
export default function MerchantPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items } = useCatalog()
  // Store + menu: mock dulu, ditimpa katalog live bila API hidup.
  const store = useStorefront(id ?? '', getStorefront(id ?? ''))
  const fallbackMenu = useMemo(() => (id ? itemsByMerchant(items, id) : []), [items, id])
  const menu = useMenuItems(id ?? '', fallbackMenu)
  const deals = useMemo(() => dealsFrom(menu), [menu])

  if (!store) {
    return (
      <div className="app-shell">
        <div className="store-screen">
          <div className="store-missing">
            <p>Toko tidak ditemukan.</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/home')}>
              Kembali ke beranda
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="store-screen">
        <div className="store-hero">
          <img className="store-hero__cover" alt="" src={store.cover} />
          <div className="store-hero__scrim" aria-hidden="true" />
          <div className="store-hero__topbar">
            <button
              type="button"
              className="btn-back"
              aria-label="Kembali"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={24} strokeWidth={1.75} />
            </button>
            <span className={`store-badge${store.isOpen ? ' store-badge--open' : ''}`}>
              {store.isOpen ? 'Buka' : 'Tutup'}
            </span>
          </div>
          <div className="store-hero__id">
            <span className="store-hero__logo">
              <img alt="" width={56} height={56} src={store.logo} />
            </span>
            <div className="store-hero__text">
              <h1 className="store-hero__name">{store.name}</h1>
              <p className="store-hero__tagline">{store.tagline}</p>
            </div>
          </div>
        </div>

        <div className="store-content">
          <div className="store-meta">
            <span className="store-meta__rating">
              <Star size={14} fill="currentColor" aria-hidden="true" />
              {formatRating(store.rating)}
              <span className="store-meta__count">({store.reviewCount} ulasan)</span>
            </span>
            <span className="store-meta__facts">
              <span className="store-meta__item">
                <Clock size={14} aria-hidden="true" />
                {store.deliveryTime}
              </span>
              <span className="store-meta__item">
                <MapPin size={14} aria-hidden="true" />
                {store.distance}
              </span>
              <span className="store-meta__item">
                {store.openTime} - {store.closeTime}
              </span>
            </span>
          </div>

          {deals.length ? <HomePromoCarousel deals={deals} /> : null}

          <div className="section-header">
            <h2 className="section-title s7-parallax--title">Menu</h2>
            <span className="section-count">{menu.length} item</span>
          </div>

          {menu.length ? (
            <div className="favorites-grid" role="list">
              {menu.map((food, i) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  className="stagger-in"
                  style={{ '--stagger-index': i }}
                  onOpen={(f) => navigate(`/menu-detail/${f.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="merchants-empty">Toko ini belum punya menu.</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
