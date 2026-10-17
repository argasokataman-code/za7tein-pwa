import { useMemo, useRef, useState } from 'react'
import { Check, Clock, MapPin, Star } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { BottomNav } from '../components/layout/BottomNav'
import { HomePromoCarousel } from '../components/customer/HomePromoCarousel'
import { FoodCard } from '../components/ui/FoodCard'
import { useCatalog } from '../hooks/useCatalog'
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore'
import { listedPrograms, programSummary } from '../data/marketing'
import { dealsFrom, itemsByMerchant } from '../data/catalog'
import { getStorefront, swapBrokenImage } from '../data/storefronts'
import { useMenuItems, useStorefront } from '../hooks/useApiCatalog'
import { formatRating } from '../data/foods'
import { BackButton } from '../components/ui/BackButton'
import { claimProgram, releaseProgram } from '../store/slices/marketingSlice'
import type { ProgramReward } from '../types'

/**
 * Angka besar untuk stub tiket kupon: nilai + satuannya, diambil apa adanya dari
 * hadiah program. Dipakai di sini (bukan `data/marketing.ts`) karena ini murni
 * keputusan tampilan tiket, dan berkas data itu sudah di batas 500 baris.
 */
function rewardHeadline(reward: ProgramReward | null): { value: string; unit: string } {
  if (!reward) return { value: '—', unit: 'KUPON' }
  if (reward.rewardType === 'product') return { value: `×${reward.rewardQty ?? 1}`, unit: 'GRATIS' }
  if (reward.rewardType === 'shipping') return { value: '0', unit: 'ONGKIR' }
  const percent = reward.discountPercent ?? 0
  if (reward.discountMode === 'per_order') {
    return {
      value: percent.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
      unit: 'JOD',
    }
  }
  if (reward.discountMode === 'per_point') return { value: `${percent}%`, unit: 'POIN' }
  return { value: `${percent}%`, unit: 'OFF' }
}

/**
 * Halaman toko (sisi customer) — langkah kedua alur: setelah memilih toko di
 * beranda, di sini customer melihat promonya lalu menunya, baru masuk ke detail
 * menu per item (`/menu-detail/:id`).
 */
export default function MerchantPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useCatalog()
  // Store + menu: mock dulu, ditimpa katalog live bila API hidup.
  const store = useStorefront(id ?? '', getStorefront(id ?? ''))
  const fallbackMenu = useMemo(() => (id ? itemsByMerchant(items, id) : []), [items, id])
  const menu = useMenuItems(id ?? '', fallbackMenu)
  const deals = useMemo(() => dealsFrom(menu), [menu])
  // Program marketing yang ditawarkan toko ini (§15) — daftar + syaratnya.
  // Angka diskonnya baru muncul di keranjang, saat syaratnya terpenuhi.
  const marketing = useAppSelector((s) => s.marketing)
  const programs = useMemo(
    () =>
      listedPrograms(marketing.programs, marketing.rules, marketing.rewards, id ?? null).map(
        (entry) => ({ ...entry, summary: programSummary(entry.program, entry.rule, entry.reward) }),
      ),
    [marketing, id],
  )
  // Klaim kupon (§15, tampilan): ditandai di sini, dihitung ulang di keranjang.
  const claimedIds = useAppSelector((s) => s.marketing.claimedProgramIds)
  const claimedCount = programs.filter((p) => claimedIds.includes(p.program.id)).length
  const onClaim = (programId: string, name: string, claimed: boolean) => {
    if (claimed) {
      dispatch(releaseProgram(programId))
      toast.success(`Klaim "${name}" dibatalkan`)
      return
    }
    dispatch(claimProgram(programId))
    toast.success('Kupon diklaim — otomatis dipakai saat checkout')
  }
  // Carousel kupon: menggeser manual (scroll-snap), titiknya mengikuti posisi
  // kartu terdekat — bukan timer, karena kupon dibaca sambil dibandingkan.
  const railRef = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)
  const onRailScroll = () => {
    const el = railRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDistance = Infinity
    ;[...el.children].forEach((child, index) => {
      const box = child as HTMLElement
      const distance = Math.abs(box.offsetLeft + box.offsetWidth / 2 - center)
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
    setSlide(best)
  }
  const goToSlide = (index: number) => {
    const el = railRef.current
    const child = el?.children[index] as HTMLElement | undefined
    if (!el || !child) return
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  }

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
          <img className="store-hero__cover" alt="" src={store.cover} onError={swapBrokenImage} />
          <div className="store-hero__scrim" aria-hidden="true" />
          <div className="store-hero__topbar">
            <BackButton className="btn-back" />
            <span className={`store-badge${store.isOpen ? ' store-badge--open' : ''}`}>
              {store.isOpen ? 'Buka' : 'Tutup'}
            </span>
          </div>
          <div className="store-hero__id">
            <span className="store-hero__logo">
              <img alt="" width={56} height={56} src={store.logo} onError={swapBrokenImage} />
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

          {programs.length ? (
            <section>
              <div className="section-header">
                <h2 className="section-title s7-parallax--title">Program &amp; promo</h2>
                <span className="section-count">
                  {programs.length} aktif
                  {claimedCount ? ` · ${claimedCount} diklaim` : ''}
                </span>
              </div>

              {/* Carousel kupon: satu tiket per layar, kartu berikutnya mengintip
                  di tepi kanan. Klaim cuma menandai "punyaku" — diskonnya tetap
                  dihitung otomatis (§15.3). */}
              <div
                className="coupon-rail"
                ref={railRef}
                onScroll={onRailScroll}
                aria-label="Kupon program"
              >
                {programs.map(({ program, reward, summary }) => {
                  const claimed = claimedIds.includes(program.id)
                  const head = rewardHeadline(reward)
                  return (
                    <article
                      className={`coupon${claimed ? ' is-claimed' : ''}`}
                      key={program.id}
                    >
                      <div className="coupon__stub">
                        <span className="coupon__owner">{summary.owner}</span>
                        <span className="coupon__value">{head.value}</span>
                        <span className="coupon__unit">{head.unit}</span>
                      </div>
                      <div className="coupon__body">
                        <h3 className="coupon__name">{program.name}</h3>
                        <p className="coupon__reward">{summary.reward}</p>
                        <p className="coupon__meta">
                          {summary.type}
                          {summary.requirement ? ` · ${summary.requirement}` : ''}
                        </p>
                        <button
                          type="button"
                          className="coupon__claim"
                          aria-pressed={claimed}
                          aria-label={
                            claimed
                              ? `Batalkan klaim ${program.name}`
                              : `Klaim ${program.name}`
                          }
                          onClick={() => onClaim(program.id, program.name, claimed)}
                        >
                          <span className="coupon__claim-pill">
                            {claimed ? (
                              <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                            ) : (
                              'Klaim'
                            )}
                          </span>
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              {programs.length > 1 ? (
                <div className="coupon-dots" role="tablist" aria-label="Kupon">
                  {programs.map(({ program }, index) => (
                    <button
                      key={program.id}
                      type="button"
                      role="tab"
                      aria-selected={index === slide}
                      aria-label={`Kupon ${index + 1} dari ${programs.length}`}
                      className={`coupon-dot${index === slide ? ' coupon-dot--active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              ) : null}

              {/* Kupon di atas sudah menampilkan tiap program; tak ada daftar
                  kartu ulang (informasi sama, tampil dua kali = sampah visual). */}
              <p className="summary-info-note">
                Program yang berdiri sendiri hanya berlaku kalau tak digabung; kalau ada beberapa,
                yang paling menguntungkan yang dipakai (§15.3).
              </p>
            </section>
          ) : null}

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
