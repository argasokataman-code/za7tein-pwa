import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react'
import { rupiah } from '../data/merchant'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/layout/BottomNav'
import { FoodCard } from '../components/ui/FoodCard'
import { categories, deals, popular } from '../data/foods'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { addItem } from '../store/slices/cartSlice'
import type { Food } from '../types'

const AD_IMAGE = '/assets/media/onboarding-bg.196fa385.jpg'

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const notificationCount = useAppSelector((s) => s.ui.notificationCount)
  const locationLabel = useAppSelector((s) => s.ui.locationLabel)
  const [category, setCategory] = useState('all')

  const visiblePopular =
    category === 'all' ? popular : popular.filter((f) => f.category === category)

  const handleAdd = (food: Food) => {
    dispatch(addItem({ food }))
    toast.success(`${food.name} added to cart`)
  }

  return (
    <div className="app-shell">
    <div className="home-screen-wrapper">
      <div className="home-screen">
        <div className="home-header">
          {/*
            Dekorasi latar header — bahasa visual yang sama dengan banner promo,
            tapi dikomposisikan untuk geometri header: isinya padat (baris atas,
            judul selebar header, search bar), jadi dekorasi hanya hidup di
            pita-pita kosong dan di balik foto profil.
          */}
          <div className="hdr-decor-wrap" aria-hidden="true">
            <svg
              className="hdr-decor"
              viewBox="0 0 390 211"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
            >
              {/* bentuk organik besar masuk dari tepi kanan, memberi kedalaman
                  di balik tombol notifikasi */}
              <path d="M410 -20C344 10 336 176 410 231Z" fill="#FFF6F0" fillOpacity="0.2" />
              <path d="M410 44C368 62 366 150 410 168Z" fill="#8A2B10" fillOpacity="0.24" />

              {/* dua busur bertumpuk menyapu pita atas */}
              <g fill="none" stroke="#FFF6F0" strokeWidth="3.5" strokeLinecap="round">
                <path d="M-20 34C60 8 180 2 302 26" strokeOpacity="0.42" />
                <path d="M-20 48C64 24 184 18 300 40" strokeOpacity="0.32" strokeWidth="2.5" />
              </g>

              {/* perbukitan berlapis naik dari tepi bawah */}
              <g fill="#FFF6F0">
                <path d="M-20 211C40 178 104 162 160 174C216 186 268 202 306 211Z" fillOpacity="0.1" />
                <path d="M14 211C66 186 126 176 178 188C228 199 272 207 306 211Z" fillOpacity="0.12" />
                <path d="M74 211C112 197 164 192 208 200C248 206 280 209 306 211Z" fillOpacity="0.14" />
              </g>

              {/* matriks titik di pita antara baris atas dan judul */}
              <g fill="#FFF6F0" fillOpacity="0.38">
              <circle cx="296" cy="76" r="2.4" />
              <circle cx="308" cy="76" r="2.4" />
              <circle cx="320" cy="76" r="2.4" />
              <circle cx="332" cy="76" r="2.4" />
              <circle cx="344" cy="76" r="2.4" />
              <circle cx="296" cy="82" r="2.4" />
              <circle cx="308" cy="82" r="2.4" />
              <circle cx="320" cy="82" r="2.4" />
              <circle cx="332" cy="82" r="2.4" />
              <circle cx="344" cy="82" r="2.4" />
              <circle cx="296" cy="88" r="2.4" />
              <circle cx="308" cy="88" r="2.4" />
              <circle cx="320" cy="88" r="2.4" />
              <circle cx="332" cy="88" r="2.4" />
              <circle cx="344" cy="88" r="2.4" />
              </g>
            </svg>
          </div>
          <div className="header-content">
            <div className="header-top">
              <Link className="profile-section" to="/account-setup">
                <img
                  alt={user?.name ?? 'Profile'}
                  width={48}
                  height={48}
                  src={user?.avatar ?? '/assets/img/profile.png'}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              </Link>

              <button
                type="button"
                className="location-section location-section-btn"
                aria-label="Change delivery location"
                aria-haspopup="dialog"
                aria-expanded="false"
               onClick={() => { toast.success("Change delivery location") }}>
                <div className="location-label">
                  <span>Delivery location</span>
                  <ChevronDown size={14} />
                </div>
                <div className="location-address">
                  <MapPin size={14} />
                  <span>{locationLabel}</span>
                </div>
              </button>

              <Link className="notification-section" to="/notifications" style={{ textDecoration: 'none' }}>
                <div className="notification-icon-wrapper">
                  <Bell size={24} aria-hidden="true" />
                  <span className="notification-badge">{notificationCount}</span>
                </div>
              </Link>
            </div>

            <h1 className="header-title">What would you prefer to eat today?</h1>

            <div className="search-section">
              <div
                className="search-bar"
                role="button"
                tabIndex={0}
                aria-label="Search food"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/search')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
              >
                <Search size={18} />
                <span style={{ flex: 1, color: '#6B6865', fontSize: 15 }}>
                  Search menu, restaurant
                </span>
                <Link to="/filter" style={{ display: 'flex', color: '#6B6865' }}>
                  <SlidersHorizontal size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="home-content">
          <div className="categories-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-scroll" role="list">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="listitem"
                  className={`category-btn ${category === c.id ? 'active' : ''}`}
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  {c.emoji ? <span aria-hidden="true">{c.emoji}</span> : null}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="deals-section">
            <div className="section-header">
              <h2 className="section-title">Super Deals 🔥</h2>
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
                  onAdd={handleAdd}
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
              <g fill="#8A2B10">
                <path d="M352 -10C292 14 284 114 352 146Z" fillOpacity="0.28" />
                <path d="M352 26C316 42 314 96 352 112Z" fillOpacity="0.32" />
              </g>

              {/* 3 — ilustrasi cloche: kubah, alas, tiga ujung uap.
                  Diletakkan di area kosong antara tombol dan foto supaya
                  bentuknya benar-benar terbaca; alasnya memanjang ke kiri
                  dan kanan sehingga menyatukan paruh kiri dan kanan banner. */}
              <g
                fill="none"
                stroke="#FFF6F0"
                strokeOpacity="0.42"
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                <path d="M161 120A54 54 0 0 1 269 120" />
                <path d="M146 120H284" strokeWidth="2.5" />
                <path d="M199 64C194 58 202 54 197 48" />
                <path d="M215 62C210 56 218 52 213 46" />
                <path d="M231 64C226 58 234 54 229 48" />
              </g>

              {/* 1 — tiga bukit berlapis yang naik dari tepi bawah */}
              <g fill="#FFF6F0">
                <path d="M-10 133C6 100 40 82 74 88C108 94 138 116 158 133Z" fillOpacity="0.1" />
                <path d="M18 133C34 106 68 96 98 106C124 115 146 126 158 133Z" fillOpacity="0.12" />
                <path d="M52 133C68 118 100 114 126 122C142 127 152 131 158 133Z" fillOpacity="0.14" />
              </g>

              {/* 2 — matriks titik, di atas judul bukan di belakangnya */}
              <g fill="#FFF6F0" fillOpacity="0.38">
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
              <h2 className="section-title">Hot Deals 🔥</h2>
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
                    <div className="hot-deal-price">{rupiah(food.price)}</div>
                  </div>
                  <button
                    type="button"
                    className="hot-deal-add"
                    aria-label={`Add ${food.name} to cart`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAdd(food)
                    }}
                  >
                    add
                  </button>
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
