import { Star } from 'lucide-react'
import { money } from '../data/merchant'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import CustomerHomeHero from '../components/customer/CustomerHomeHero'
import { BottomNav } from '../components/layout/BottomNav'
import { AddToCartButton } from '../components/ui/AddToCartButton'
import { FoodCard } from '../components/ui/FoodCard'
import { useAppSelector } from '../hooks/useAppStore'
import { useCatalog } from '../hooks/useCatalog'
import { selectUnreadCount } from '../store/slices/notificationsSlice'

const AD_IMAGE = '/assets/media/onboarding-bg.196fa385.jpg'

export default function Home() {
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const unreadNotifications = useAppSelector((s) => selectUnreadCount(s.notifications.items))
  const locationLabel = useAppSelector((s) => s.ui.locationLabel)
  const [category, setCategory] = useState('all')
  const { categories, deals, popular } = useCatalog()

  const visiblePopular =
    category === 'all' ? popular : popular.filter((f) => f.category === category)

  return (
    <div className="app-shell">
    <div className="home-screen-wrapper">
      <div className="home-screen">
        <CustomerHomeHero
          avatarUrl={user?.avatar}
          avatarAlt={user?.name ?? ''}
          location={locationLabel}
          notificationCount={unreadNotifications}
          onOpenProfile={() => navigate('/profile')}
          onChangeLocation={() => toast.success('Change delivery location')}
          onOpenNotifications={() => navigate('/notifications')}
          onOpenFilters={() => navigate('/filter')}
          onSubmitSearch={() => navigate('/search')}
        />

        <div className="home-content">
          <div className="categories-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-scroll" role="list">
              {categories.map((c) => {
                const Icon = c.icon
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="listitem"
                    className={`category-btn ${category === c.id ? 'active' : ''}`}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {Icon ? <Icon size={16} strokeWidth={2} aria-hidden="true" /> : null}
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="deals-section">
            <div className="section-header">
              <h2 className="section-title">Super Deals</h2>
              <Link className="see-all-link" to="/search">
                See All
              </Link>
            </div>
            <div className="food-cards-scroll h-scroll-strip" role="list">
              {deals.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onOpen={(f) => navigate(`/menu-detail/${f.id}`)}
                />
              ))}
            </div>
          </div>

          <div className="ad-banner" style={{ marginBottom: 24 }}>
            {/*
              Dekorasi latar banner — bahasa visual "Prepare -> Move -> Arrive".
              Tiga bentuk besar saja, semuanya variasi orange yang sama:
              dua busur bertumpuk (rim piring, kiri atas), satu jalur tipis
              dengan tiga simpul (toko -> kurir -> pelanggan) yang menghilang
              di balik foto lalu muncul lagi di atasnya, dan satu set cincin
              sepusat di balik foto sebagai titik tujuan. Semua opacity di
              bawah 15% supaya tidak bersaing dengan teks.
            */}
            <svg
              className="ad-decor"
              viewBox="0 0 350 133"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              focusable="false"
            >
              {/* 4 — bentuk organik terpotong yang masuk dari tepi kanan, memberi
                  kedalaman di belakang foto. Isi, bukan garis. */}
              <g className="ad-decor__depth">
                <path d="M352 -10C292 14 284 114 352 146Z" className="ad-decor__depth-1" />
                <path d="M352 26C316 42 314 96 352 112Z" className="ad-decor__depth-2" />
              </g>

              {/* 3 — ilustrasi cloche: kubah, alas, tiga ujung uap.
                  Diletakkan di area kosong antara tombol dan foto supaya
                  bentuknya benar-benar terbaca; alasnya memanjang ke kiri
                  dan kanan sehingga menyatukan paruh kiri dan kanan banner. */}
              <g className="ad-decor__cloche">
                <path d="M181 120A54 54 0 0 1 289 120" />
                <path d="M166 120H304" className="ad-decor__cloche-tray" />
                <path d="M219 64C214 58 222 54 217 48" />
                <path d="M235 62C230 56 238 52 233 46" />
                <path d="M251 64C246 58 254 54 249 48" />
              </g>

              {/* 1 — tiga bukit berlapis yang naik dari tepi bawah */}
              <g className="ad-decor__hills">
                <path className="ad-decor__hill-1" d="M-10 133C6 100 40 82 74 88C108 94 138 116 158 133Z" />
                <path className="ad-decor__hill-2" d="M18 133C34 106 68 96 98 106C124 115 146 126 158 133Z" />
                <path className="ad-decor__hill-3" d="M52 133C68 118 100 114 126 122C142 127 152 131 158 133Z" />
              </g>

              {/* 2 — matriks titik, di atas judul bukan di belakangnya */}
              <g className="ad-decor__dots">
                <circle cx="124" cy="3" r="2.4" />
                <circle cx="136" cy="3" r="2.4" />
                <circle cx="148" cy="3" r="2.4" />
                <circle cx="160" cy="3" r="2.4" />
                <circle cx="172" cy="3" r="2.4" />
                <circle cx="124" cy="9" r="2.4" />
                <circle cx="136" cy="9" r="2.4" />
                <circle cx="148" cy="9" r="2.4" />
                <circle cx="160" cy="9" r="2.4" />
                <circle cx="172" cy="9" r="2.4" />
                <circle cx="124" cy="15" r="2.4" />
                <circle cx="136" cy="15" r="2.4" />
                <circle cx="148" cy="15" r="2.4" />
                <circle cx="160" cy="15" r="2.4" />
                <circle cx="172" cy="15" r="2.4" />
              </g>
            </svg>
            <div className="ad-content">
              <div className="ad-text">
                <h3 className="ad-title">
                  Diskon <span className="ad-title-value">30%</span> untuk pesanan pertamamu
                </h3>
                <button type="button" className="ad-cta" onClick={() => navigate('/search')}>
                  Pesan Sekarang
                </button>
              </div>
              <div className="ad-image">
                <img alt="add banner img" loading="lazy" width={200} height={200} src={AD_IMAGE} />
              </div>
            </div>
          </div>

          <div className="hot-deals-section">
            <div className="section-header">
              <h2 className="section-title">Hot Deals</h2>
              <Link className="see-all-link" to="/search">
                See All
              </Link>
            </div>
            <div className="hot-deals-list" role="list">
              {visiblePopular.map((food) => (
                <div
                  key={food.id}
                  className="hot-deal-card"
                  role="article"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/menu-detail/${food.id}`)}
                >
                  <div className="hot-deal-image" style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      alt={food.name}
                      loading="lazy"
                      width={80}
                      height={80}
                      src={food.image}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </div>
                  <div className="hot-deal-info">
                    <span className="hot-deal-title">{food.name}</span>
                    <div className="hot-deal-meta">
                      {food.deliveryTime} • {food.distance}
                    </div>
                    <div className="hot-deal-rating">
                      <Star size={14} fill="currentColor" />
                      {food.rating} ({food.reviewCount} Reviews)
                    </div>
                    <div className="hot-deal-price">{money(food.price)}</div>
                  </div>
                  <AddToCartButton food={food} className="hot-deal-add" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
    </div>
  )
}
