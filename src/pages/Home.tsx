import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CartQuickBar from '../components/customer/CartQuickBar'
import CustomerHomeHero from '../components/customer/CustomerHomeHero'
import HomePromoBanner from '../components/customer/HomePromoBanner'
import { BottomNav } from '../components/layout/BottomNav'
import { MerchantCard } from '../components/ui/MerchantCard'
import { useAppSelector } from '../hooks/useAppStore'
import { selectUnreadCount } from '../store/slices/notificationsSlice'
import { selectCartCount, selectSubtotal } from '../store/slices/cartSlice'
import { CATEGORIES, dealsFrom, menuSeed, merchantCategoryIds } from '../data/catalog'
import { storefronts } from '../data/storefronts'
import { useAllMenuItems, useStorefronts } from '../hooks/useApiCatalog'

/**
 * Beranda customer — langkah pertama alur belanja adalah memilih TOKO, bukan
 * langsung memilih menu. Menu ditampilkan di halaman toko (`/merchant/:id`).
 *
 * EDISI 02 menambahkan banner promo dan bilah keranjang, tapi isi banner tetap
 * berangkat dari alur repo: yang dipromosikan adalah **toko** yang menunya
 * sedang berdiskon (`dealsFrom`), bukan satu kupon statis seperti di contoh.
 */
export default function Home() {
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const unreadNotifications = useAppSelector((s) => selectUnreadCount(s.notifications.items))
  const locationLabel = useAppSelector((s) => s.ui.locationLabel)
  const cartItems = useAppSelector((s) => s.cart.items)
  const [category, setCategory] = useState('all')
  // Menu diambil lintas toko (bukan seed `catalog`), supaya promo dan kategori
  // dihitung dari toko yang benar-benar tampil — sebelumnya daftar memakai toko
  // live sementara item dari mock, sehingga `merchantId` tak pernah ketemu dan
  // banner promo selalu kosong.
  const items = useAllMenuItems(menuSeed)
  // Daftar toko: mock dulu, ditimpa katalog live bila API hidup.
  const stores = useStorefronts(storefronts)

  // Diskon terbesar per toko — dasar banner promo DAN baris promo di kartu toko.
  // Dihitung dari menu yang benar-benar berdiskon, jadi banner tak bisa
  // menjanjikan promo yang tidak ada.
  const promoByStore = new Map<string, number>()
  for (const deal of dealsFrom(items)) {
    if (!deal.merchantId) continue
    const best = Math.max(promoByStore.get(deal.merchantId) ?? 0, deal.discountPercent ?? 0)
    promoByStore.set(deal.merchantId, best)
  }
  const promoStore = stores.find((store) => promoByStore.has(store.id))

  // Chip kategori tetap (Semua + 4) — selalu tampil, seperti prototype v2.
  // Menyaring TOKO, bukan item: sebuah toko tampil kalau ia melayani kategori
  // terpilih (dihitung dari menunya yang benar-benar bisa dipesan).
  const chips = [{ id: 'all', label: 'Semua', icon: LayoutGrid }, ...CATEGORIES]

  // Chip menyaring TOKO, bukan item: sebuah toko tampil kalau ia melayani
  // kategori terpilih (dihitung dari menunya yang benar-benar bisa dipesan).
  const visibleStores =
    category === 'all'
      ? stores
      : stores.filter((store) => merchantCategoryIds(items, store.id).includes(category))

  const cartCount = selectCartCount(cartItems)
  const cartSubtotal = selectSubtotal(cartItems)

  return (
    <div className="app-shell">
      <div className="home-screen-wrapper">
        <div className="home-screen">
          <CustomerHomeHero
            userName={user?.name}
            location={locationLabel}
            notificationCount={unreadNotifications}
            onChangeLocation={() => navigate('/address-selection')}
            onOpenNotifications={() => navigate('/notifications')}
            onOpenFilters={() => navigate('/filter')}
            onSubmitSearch={() => navigate('/search')}
          />

          <div className={`home-content${cartCount > 0 ? ' home-content--cart' : ''}`}>
            {promoStore ? (
              <HomePromoBanner
                store={promoStore}
                maxDiscount={promoByStore.get(promoStore.id) ?? 0}
                onOpen={() => navigate(`/merchant/${promoStore.id}`)}
              />
            ) : null}

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
                      promoText={
                        promoByStore.has(store.id)
                          ? `Promo hemat ${promoByStore.get(store.id)}%`
                          : undefined
                      }
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

        {cartCount > 0 ? (
          <CartQuickBar
            count={cartCount}
            subtotal={cartSubtotal}
            onOpen={() => navigate('/checkout')}
          />
        ) : null}

        <BottomNav />
      </div>
    </div>
  )
}
