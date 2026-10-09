import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import CustomerHomeHero from '../components/customer/CustomerHomeHero'
import { BottomNav } from '../components/layout/BottomNav'
import { MerchantCard } from '../components/ui/MerchantCard'
import { useAppSelector } from '../hooks/useAppStore'
import { useCatalog } from '../hooks/useCatalog'
import { selectUnreadCount } from '../store/slices/notificationsSlice'
import { merchantCategoryIds } from '../data/catalog'
import { storefronts } from '../data/storefronts'

/**
 * Beranda customer — langkah pertama alur belanja adalah memilih TOKO, bukan
 * langsung memilih menu. Menu ditampilkan di halaman toko (`/merchant/:id`).
 * Section item-langsung (Super Deals, Hot Deals, carousel promo) pindah ke
 * halaman toko; beranda tinggal hero, pencarian, chip kategori, dan daftar toko.
 */
export default function Home() {
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const unreadNotifications = useAppSelector((s) => selectUnreadCount(s.notifications.items))
  const locationLabel = useAppSelector((s) => s.ui.locationLabel)
  const [category, setCategory] = useState('all')
  const { items, categories } = useCatalog()

  // Chip "Semua" memimpin daftar dan aktif secara default.
  const chips = [{ id: 'all', label: 'Semua', icon: LayoutGrid }, ...categories]

  // Chip menyaring TOKO, bukan item: sebuah toko tampil kalau ia melayani
  // kategori terpilih (dihitung dari menunya yang benar-benar bisa dipesan).
  const visibleStores =
    category === 'all'
      ? storefronts
      : storefronts.filter((store) => merchantCategoryIds(items, store.id).includes(category))

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
              <div className="categories-scroll" role="list">
                {chips.map((c) => {
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

            <div>
              <div className="section-header">
                <h2 className="section-title s7-parallax--title">Restoran &amp; Warung</h2>
                <span className="section-count">{visibleStores.length} toko</span>
              </div>

              {visibleStores.length ? (
                <div className="merchants-list" role="list">
                  {visibleStores.map((store, i) => (
                    <MerchantCard
                      key={store.id}
                      store={store}
                      className="stagger-in"
                      style={{ '--stagger-index': i }}
                      onOpen={(s) => navigate(`/merchant/${s.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="merchants-empty">Belum ada toko untuk kategori ini.</p>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
