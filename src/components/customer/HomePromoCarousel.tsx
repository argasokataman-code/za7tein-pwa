import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

import type { MenuItem, PromoSlide } from '../../types'
import { isOrderable } from '../../data/catalog'
import { useMoney } from '../../hooks/useMoney'

/**
 * Kartu promo beranda: tiga kartu yang bergeser sendiri.
 *
 * Dua keputusan yang perlu dijelaskan:
 *
 * 1. **Latar foto makanan, bukan gelombang saja.** Dekorasi lama cuma SVG
 *    gelombang di atas oranye rata — terbaca sepi, bukan "promo". Sekarang
 *    latarnya foto makanan yang cerah (aset lokal `promo/promo-spread.webp`),
 *    ditimpa gradien gelap dari kiri supaya teks putihnya tetap terbaca.
 *    Gelombangnya tetap ada sebagai tekstur halus di atasnya.
 *
 * 2. **Isinya dari data, bukan karangan.** Kalau merchant punya slide aktif,
 *    yang tampil hanya slide itu (diatur di `/merchant/promos/carousel`).
 *    Kalau belum, carousel jatuh ke data lama: klaim dari notifikasi `n3`
 *    (diskon 30%) plus item katalog yang `discountPercent`-nya memang terisi.
 *    Tidak ada angka baru di kedua jalur.
 *
 * Geraknya berhenti sendiri: `prefers-reduced-motion` mematikan pergeseran
 * otomatis, dan sentuhan pengguna menjeda. Carousel yang jalan terus sejak
 * halaman dibuka akan berkompetisi dengan isi halaman — sama seperti alasan
 * denyut kartu promo dibatasi.
 */

/** Satu kartu yang bisa tampil. `kind` menentukan gaya gelombangnya. */
type PromoCard = {
  id: string
  kind: 'claim' | 'deal'
  title: string
  value: string
  body: string
  cta: string
  to: string
  /** Latar banner unggahan merchant; kosong = latar promo bawaan. */
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
 *
 * `money` diterima sebagai argumen (bukan impor) karena helper ini di lingkup
 * modul, sementara mata uang aktif hidup di hook per-komponen.
 */
function dealCards(deals: MenuItem[], money: (idr: number) => string): PromoCard[] {
  return deals.slice(0, 2).map((food) => ({
    id: `deal-${food.id}`,
    kind: 'deal',
    title: food.name,
    value: `${food.discountPercent}%`,
    body: `Hemat dari ${money(food.price)}`,
    cta: 'Lihat Menu',
    to: `/menu-detail/${food.id}`,
  }))
}

/**
 * Slide kurasi merchant. Slide yang menunjuk menu tak tersedia dilewati, bukan
 * ditampilkan sebagai tautan mati. Judul kosong memakai nama menu.
 */
function slideCards(
  slides: PromoSlide[],
  items: MenuItem[],
  money: (idr: number) => string,
): PromoCard[] {
  return slides.flatMap((slide) => {
    const food = items.find((item) => item.id === slide.menuItemId && isOrderable(item))
    if (!food) return []
    const discount = food.discountPercent
    return [
      {
        id: `slide-${slide.id}`,
        kind: 'deal',
        title: slide.title.trim() || food.name,
        value: discount != null ? `${discount}%` : '',
        body: discount != null ? `Hemat dari ${money(food.price)}` : money(food.price),
        cta: 'Lihat Menu',
        to: `/menu-detail/${food.id}`,
        image: slide.image ?? undefined,
      },
    ]
  })
}

/**
 * Tekstur gelombang di atas latar foto. Tiga pita dari bawah (paling gelap di
 * depan supaya terbaca berlapis) plus titik di sudut kanan atas, dijaga di
 * opasitas 4-14% supaya tidak menutupi fotonya.
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
  /** Slide kurasi merchant; menang atas `deals` bila ada yang valid. */
  slides?: PromoSlide[]
  /** Katalog toko, untuk mengambil nama/harga menu yang ditautkan slide. */
  items?: MenuItem[]
}

export function HomePromoCarousel({ deals, slides = [], items = [] }: HomePromoCarouselProps) {
  const navigate = useNavigate()
  const { money } = useMoney()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Kartu dibangun tiap render dengan `money` mata uang aktif. Slide merchant
  // yang belum diisi tidak menghapus carousel lama: kalau tak ada slide valid,
  // jatuh ke menu berdiskon otomatis seperti sebelumnya.
  const curated = slideCards(slides, items, money)
  const cards: PromoCard[] = curated.length
    ? curated
    : [CLAIM_CARD, ...dealCards(deals, money)]

  // Jumlah kartu bisa berubah saat merchant menyunting slide. Indeks lama bisa
  // melewati ujung dan membuat jalur berhenti di ruang kosong.
  useEffect(() => {
    setIndex((current) => (current < cards.length ? current : 0))
  }, [cards.length])

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
            style={
              card.image
                ? ({ '--promo-photo': `url("${card.image}")` } as CSSProperties)
                : undefined
            }
          >
            <PromoBackdrop />
            <div className="promo-slide__content">
              <div className="promo-slide__text">
                <h3 className="promo-slide__title">
                  {card.title}
                  {card.value ? (
                    <>
                      {' '}
                      <span className="promo-slide__value">{card.value}</span>
                      {card.kind === 'claim' ? '' : ' off'}
                    </>
                  ) : null}
                </h3>
                <p className="promo-slide__body">{card.body}</p>
              </div>
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
