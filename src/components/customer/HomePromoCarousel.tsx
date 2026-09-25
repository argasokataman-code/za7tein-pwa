import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { MenuItem } from '../../types'
import { money } from '../../data/merchant'

/**
 * Kartu promo beranda: tiga kartu yang bergeser sendiri, dengan latar gelombang.
 *
 * Dua keputusan yang perlu dijelaskan:
 *
 * 1. **Gelombang, bukan lingkaran.** Dekorasi lama adalah tiga lingkaran
 *    sepusat yang keluar dari tepi kanan atas. Diganti karena bentuknya tidak
 *    terhubung ke apa pun di aplikasi ini, sementara gelombang sudah jadi
 *    bahasa visual hero beranda (`CustomerHomeHero`). Sekarang banner memakai
 *    motif yang sama, jadi seluruh beranda terbaca satu keluarga bentuk.
 *
 * 2. **Isinya dari data, bukan karangan.** PRD aktif tidak punya fitur promo
 *    atau voucher sama sekali, jadi tidak ada requirement yang bisa dikutip.
 *    Klaim promo yang boleh tampil karena itu hanya yang sudah ada di mock:
 *    satu dari notifikasi `n3` (diskon 30%, minimum Rp50.000), sisanya item
 *    katalog yang `discountPercent`-nya memang terisi. Tidak ada angka baru.
 *
 * Geraknya berhenti sendiri: `prefers-reduced-motion` mematikan pergeseran
 * otomatis, dan sentuhan pengguna menjeda. Carousel yang jalan terus sejak
 * halaman dibuka akan berkompetisi dengan isi halaman — sama seperti alasan
 * denyut kartu promo dibatasi.
 */

/** Satu kartu yang bisa tampil. `kind` menentukan gaya gelombangnya. */
type PromoCard =
  | {
      id: string
      kind: 'claim'
      title: string
      value: string
      body: string
      cta: string
      to: string
    }
  | {
      id: string
      kind: 'deal'
      title: string
      value: string
      body: string
      cta: string
      to: string
      image?: string
    }

/** Jeda antar-kartu. Cukup lama untuk dibaca, cukup pendek untuk terasa hidup. */
const SLIDE_MS = 4200

/** Klaim promo yang sudah ada di mock notifikasi (`n3`). */
const CLAIM_CARD: PromoCard = {
  id: 'promo-pertama',
  kind: 'claim',
  title: 'Diskon',
  value: '30%',
  body: 'untuk pesanan pertamamu',
  cta: 'Pesan Sekarang',
  to: '/search',
}

/**
 * Ubah item berdiskon dari katalog jadi kartu promo. Persentase diambil apa
 * adanya dari `discountPercent`; tidak ada yang dibulatkan atau dikarang.
 */
function dealCards(deals: MenuItem[]): PromoCard[] {
  return deals.slice(0, 2).map((food) => ({
    id: `deal-${food.id}`,
    kind: 'deal',
    title: food.name,
    value: `${food.discountPercent}%`,
    body: `Hemat dari ${money(food.price)}`,
    cta: 'Lihat Menu',
    to: `/menu-detail/${food.id}`,
    image: food.image,
  }))
}

/**
 * Latar kartu. Tiga gelombang dari bawah (paling gelap di depan supaya terbaca
 * berlapis) plus tekstur titik di sudut kanan atas.
 *
 * Dua batas yang dipegang:
 *
 * 1. **Opasitas 4-14%.** Di atas oranye merek, lapisan di atas rentang itu
 *    menggeser warnanya ke pink atau salmon dan oranye mereknya rusak. Tiap
 *    pita dan titiknya di bawah 14%.
 * 2. **Tanpa gradient pada bentuk latar.** Kedalaman datang dari jumlah
 *    lapisan, bukan dari perpindahan warna — sama seperti dekorasi sebelumnya.
 *
 * `preserveAspectRatio="xMidYMid slice"`, bukan `none`: `none` meregang tidak
 * seragam, jadi lingkarannya jadi lonjong dan tebal garisnya tidak rata.
 */
function PromoBackdrop() {
  return (
    <svg
      className="promo-waves"
      viewBox="0 0 1000 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Paling jauh: pita tipis tinggi di belakang. */}
      <path
        className="promo-waves__band promo-waves__band--far"
        d="M0,220 C240,160 380,280 620,210 C800,158 900,240 1000,196 L1000,420 L0,420 Z"
      />
      {/* Tengah. */}
      <path
        className="promo-waves__band promo-waves__band--mid"
        d="M0,300 C180,220 340,360 560,280 C760,208 880,320 1000,260 L1000,420 L0,420 Z"
      />
      {/* Terdepan, paling tegas. */}
      <path
        className="promo-waves__band promo-waves__band--front"
        d="M0,360 C220,300 300,410 540,330 C760,258 900,370 1000,320 L1000,420 L0,420 Z"
      />
      <g className="promo-waves__dots">
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((column) => (
            <circle
              key={`${row}-${column}`}
              cx={856 + column * 18}
              cy={64 + row * 18}
              r="3"
            />
          )),
        )}
      </g>
    </svg>
  )
}

interface HomePromoCarouselProps {
  deals: MenuItem[]
}

export function HomePromoCarousel({ deals }: HomePromoCarouselProps) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const cards: PromoCard[] = [CLAIM_CARD, ...dealCards(deals)]

  // Satu timer untuk seluruh carousel, bukan satu per kartu. Dijeda saat
  // `paused` supaya sentuhan pengguna tidak dilawan.
  useEffect(() => {
    if (paused || cards.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % cards.length)
    }, SLIDE_MS)

    return () => window.clearInterval(id)
  }, [paused, cards.length])

  return (
    <div
      className="promo-carousel s7-parallax--card"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="promo-track"
        ref={trackRef}
        style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
      >
        {cards.map((card, slideIndex) => (
          <div
            className={`promo-slide${slideIndex === index ? ' promo-slide--active' : ''}`}
            key={card.id}
          >
            <PromoBackdrop />
            <div className="promo-slide__content">
              <div className="promo-slide__text">
                <h3 className="promo-slide__title">
                  {card.title} <span className="promo-slide__value">{card.value}</span>
                  {card.kind === 'claim' ? '' : ' off'}
                </h3>
                <p className="promo-slide__body">{card.body}</p>
              </div>
              {'image' in card && card.image ? (
                <div className="promo-slide__image">
                  <img src={card.image} alt="" loading="lazy" width={200} height={200} />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="promo-slide__cta"
              onClick={() => navigate(card.to)}
            >
              {card.cta}
            </button>
          </div>
        ))}
      </div>

      {cards.length > 1 ? (
        <div className="promo-dots" role="tablist" aria-label="Kartu promo">
          {cards.map((card, dotIndex) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Kartu ${dotIndex + 1} dari ${cards.length}`}
              className={`promo-dot${dotIndex === index ? ' promo-dot--active' : ''}`}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
