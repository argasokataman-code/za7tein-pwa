import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomerHomeHero from '../components/customer/CustomerHomeHero'
import HomePromoBanner from '../components/customer/HomePromoBanner'
import { BottomNav } from '../components/layout/BottomNav'
import { MerchantCard } from '../components/ui/MerchantCard'
import { StoreBlockedSheet } from '../components/customer/StoreBlockedSheet'
import { useAppSelector } from '../hooks/useAppStore'
import { selectUnreadCount } from '../store/slices/notificationsSlice'
import { selectCartCount } from '../store/slices/cartSlice'
import { merchantQuotaBlocked } from '../store/slices/quotaSlice'
import { CATEGORIES, dealsFrom, menuSeed, merchantCategoryIds } from '../data/catalog'
import { storefronts, groupStorefrontsByTag, isSelectable, visibleStorefronts, sortStorefronts, filterStorefronts, type MerchantSortKey } from '../data/storefronts'
import { useAllMenuItems, useStorefronts } from '../hooks/useApiCatalog'
import type { Storefront } from '../types'

/** Pilihan urutan daftar toko di beranda (PRD §6). */
const SORTS: { id: MerchantSortKey; label: string }[] = [
  { id: 'distance', label: 'Terdekat' },
  { id: 'rating', label: 'Rating' },
  { id: 'orders', label: 'Terlaris' },
]

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
  // Kuota order (§17): toko yang kuotanya habis dan tidak mengizinkan order
  // tanpa kuota disembunyikan dari daftar — bukan sekadar di-disable.
  const quotaSubs = useAppSelector((s) => s.quota.subscriptions)
  const acceptWithoutQuota = useAppSelector((s) => s.quota.acceptWithoutQuota)
  const [category, setCategory] = useState('all')
  // Urut/filter daftar toko (PRD §6). `distance` default: toko terdekat dulu.
  const [sort, setSort] = useState<MerchantSortKey>('distance')
  const [minRating, setMinRating] = useState(0)
  // Toko yang diketuk padahal tutup / di luar jangkauan. Kartunya tetap bisa
  // diketuk (bukan ketukan mati) dan sebabnya dijawab sheet.
  const [blockedStore, setBlockedStore] = useState<Storefront | null>(null)
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
  // Toko yang memblokir kuota order (PRD §17) disembunyikan lebih dulu.
  const categoryStores =
    category === 'all'
      ? stores
      : stores.filter((store) => merchantCategoryIds(items, store.id).includes(category))
  // Toko yang memblokir kuota order (PRD §17) disembunyikan lebih dulu, lalu
  // difilter (rating) dan diurutkan (jarak/rating/terlaris) — PRD §6.
  const visibleStores = sortStorefronts(
    filterStorefronts(
      visibleStorefronts(categoryStores).filter(
        (store) => !merchantQuotaBlocked(quotaSubs, store.id, acceptWithoutQuota),
      ),
      minRating ? { minRating } : {},
    ),
    sort,
  )
  // Grup hanya per tag (PRD §6). Kalau tak ada toko bertag, tampilkan daftar
  // datar seperti sebelumnya supaya perilaku legacy tidak berubah.
  const storeGroups = visibleStores.some((store) => store.tags?.length)
    ? groupStorefrontsByTag(visibleStores)
    : [{ tag: null as string | null, stores: visibleStores }]

  const cartCount = selectCartCount(cartItems)

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
            onSubmitSearch={(query) =>
              // Kueri hero dulu dibuang (`() => navigate('/search')`), jadi
              // halaman Cari selalu mulai kosong; sekarang ikut di URL supaya
              // bisa dibagikan dan tahan refresh.
              navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
            }
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

              <div className="merchants-toolbar">
                <div className="merchants-toolbar__group" role="group" aria-label="Urutkan toko">
                  {SORTS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`sort-pill${sort === option.id ? ' is-active' : ''}`}
                      aria-pressed={sort === option.id}
                      onClick={() => setSort(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="merchants-toolbar__group" role="group" aria-label="Filter toko">
                  <button
                    type="button"
                    className={`sort-pill${minRating >= 4.5 ? ' is-on' : ''}`}
                    aria-pressed={minRating >= 4.5}
                    onClick={() => setMinRating((current) => (current ? 0 : 4.5))}
                  >
                    Rating 4,5+
                  </button>
                </div>
              </div>

              {visibleStores.length ? (
                storeGroups.map((group) => (
                  <div key={group.tag ?? '__untagged'} className="merchants-group">
                    {group.tag ? (
                      <h3 className="merchants-group__title">{group.tag}</h3>
                    ) : null}
                    <div className="merchants-list" role="list">
                      {group.stores.map((store, i) => (
                        <MerchantCard
                          key={store.id}
                          store={store}
                          disabled={!isSelectable(store)}
                          onBlocked={setBlockedStore}
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
                  </div>
                ))
              ) : (
                <p className="merchants-empty">Belum ada toko untuk kategori ini.</p>
              )}
            </div>
          </div>
        </div>

        <StoreBlockedSheet store={blockedStore} onClose={() => setBlockedStore(null)} />

        <BottomNav />
      </div>
    </div>
  )
}
