import {
  ArrowRight,
  Bike,
  ChefHat,
  Clock,
  MapPin,
  Menu,
  ShieldCheck,
  Store,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { JourneyLine } from '../components/JourneyLine'
import { ClocheDecor, DotMatrixDecor, RouteDecor } from '../components/landing/LandingDecor'
import { FoodCard } from '../components/ui/FoodCard'
import { foods } from '../data/foods'
import { mockCouriers } from '../data/merchant'
import { merchantOrders, orderStatusLabel } from '../data/merchantOrders'

const NAV = [
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Untuk Merchant', href: '#merchant' },
  { label: 'Area', href: '#area' },
  { label: 'Tentang', href: '#tentang' },
]

const VALUES = [
  { Icon: MapPin, title: 'Dekat', text: 'Merchant di zona Hijazi dan Syimali, bukan seberang kota.' },
  { Icon: Bike, title: 'Cepat', text: 'Kurir langsung dari toko, tanpa perantara.' },
  { Icon: Wallet, title: 'Langsung', text: 'Bayar online lewat Midtrans atau COD dengan deposit merchant.' },
]

const JOURNEY = [
  { Icon: UtensilsCrossed, title: 'Pilih makanan', text: 'Telusuri menu dari dapur sekitar.' },
  { Icon: ChefHat, title: 'Merchant menyiapkan', text: 'Estimasi masak dipilih dapur.' },
  { Icon: Bike, title: 'Kurir mengambil', text: 'Rute kurir toko dikunci.' },
  { Icon: MapPin, title: 'Pesanan tiba', text: 'Sampai ke gedung, lantai, flat.' },
]

const ZONES = [
  { name: 'Zona Hijazi', text: 'Pengantaran seputar area Hijazi.' },
  { name: 'Zona Syimali', text: 'Pengantaran seputar area Syimali.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const openFood = (id: string) => navigate(`/menu-detail/${id}`)

  return (
    <div className="landing-page lp">
      <header className="lp-nav">
        <div className="landing-container lp-nav-inner">
          <Link to="/" className="lp-brand">Sa7tein</Link>
          <nav className="lp-nav-links" aria-label="Navigasi utama">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>
          <details className="lp-nav-menu">
            <summary aria-label="Buka menu navigasi">
              <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
            </summary>
            <nav aria-label="Navigasi utama">
              {NAV.map((item) => (
                <a key={item.href} href={item.href}>{item.label}</a>
              ))}
            </nav>
          </details>
          <div className="lp-nav-actions">
            <Link to="/signin" className="lp-btn lp-btn-quiet">Masuk</Link>
            <Link to="/onboarding" className="lp-btn lp-btn-primary">Mulai Pesan</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <RouteDecor className="lp-hero-route" />
          <DotMatrixDecor className="lp-hero-dots" />
          <div className="landing-container lp-hero-grid">
            <div>
              <span className="lp-eyebrow">Marketplace makanan hyperlocal</span>
              <h1 className="lp-h1">Makanan enak, lebih dekat.</h1>
              <p className="lp-lead">
                Temukan makanan dari merchant terdekat, pesan dengan mudah, dan nikmati
                pengantaran langsung dari kurir toko.
              </p>
              <div className="lp-hero-actions">
                <Link to="/onboarding" className="lp-btn lp-btn-solid">
                  Mulai Pesan <ArrowRight size={18} strokeWidth={1.75} />
                </Link>
                <a href="#cara-kerja" className="lp-btn lp-btn-outline">Lihat Cara Kerja</a>
              </div>
            </div>

            <div className="lp-hero-stack">
              <div className="lp-hero-app">
                <span className="lp-hero-app-head">
                  <MapPin size={14} strokeWidth={1.75} /> Dapur sekitar · Hijazi
                </span>
                <FoodCard food={foods[0]} onOpen={() => openFood(foods[0].id)} />
              </div>
              <div className="lp-hero-side">
                <div className="lp-ticket">
                  <span className="lp-ticket-head">
                    <Clock size={14} strokeWidth={1.75} /> Tiket dapur
                  </span>
                  {merchantOrders.slice(0, 3).map((order) => (
                    <span className="lp-ticket-row" key={order.id}>
                      <span>{order.items[0].quantity}x {order.items[0].name}</span>
                      <em>{orderStatusLabel(order.status)}</em>
                    </span>
                  ))}
                </div>
                <div className="lp-courier-chip">
                  <Bike size={15} strokeWidth={1.75} />
                  <span>{mockCouriers[0].name} menuju Hijazi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-values" aria-label="Nilai Sa7tein">
          <div className="landing-container lp-values-grid">
            {VALUES.map(({ Icon, title, text }) => (
              <div className="lp-value" key={title}>
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="cara-kerja" className="lp-section lp-journey">
          <div className="landing-container">
            <header className="lp-head">
              <h2 className="lp-section-title">Dari dapur ke pintumu.</h2>
              <p className="lp-section-lead">
                Empat langkah yang sama, dari pilih menu sampai tiba di pintu.
              </p>
            </header>
            <ol className="lp-steps">
              {JOURNEY.map(({ Icon, title, text }, index) => (
                <li className="lp-step" key={title}>
                  <span className="lp-step-node">
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="lp-step-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="experience" className="lp-section">
          <div className="landing-container lp-experience-grid">
            <div className="lp-experience-copy">
              <h2 className="lp-section-title">Pesan tanpa ribet.</h2>
              <p className="lp-section-lead">
                Lokasi, menu, pembayaran, dan status pesanan dalam satu alur yang sederhana.
                Komponen yang sama dipakai di seluruh aplikasi.
              </p>
            </div>
            <div className="lp-experience-frames">
              <div className="lp-frame lp-frame-main">
                <span className="lp-frame-bar">Menu sekitar</span>
                <FoodCard food={foods[1]} onOpen={() => openFood(foods[1].id)} />
              </div>
              <div className="lp-frame lp-frame-support">
                <span className="lp-frame-bar">Status pesanan</span>
                <JourneyLine stage="diantar" />
                <span className="lp-frame-line">Kurir menuju Hijazi · 1,2 km</span>
              </div>
            </div>
          </div>
        </section>

        <section id="area" className="lp-section lp-area">
          <div className="landing-container lp-area-grid">
            <div className="lp-area-map" aria-hidden="true">
              <span className="lp-zone lp-zone-outer">{ZONES[1].name}</span>
              <span className="lp-zone lp-zone-inner">{ZONES[0].name}</span>
              <span className="lp-zone-center"><MapPin size={18} strokeWidth={1.75} /></span>
            </div>
            <div>
              <h2 className="lp-section-title">Dekat itu lebih baik.</h2>
              <p className="lp-section-lead">
                Sa7tein fokus pada merchant di zona Hijazi dan Syimali agar pengantaran tetap
                cepat dan makanan tetap optimal.
              </p>
              <ul className="lp-area-list">
                {ZONES.map((zone) => (
                  <li key={zone.name}>
                    <strong>{zone.name}</strong>
                    <span>{zone.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="merchant" className="lp-section">
          <div className="landing-container lp-merchant-grid">
            <div>
              <h2 className="lp-section-title">Dibuat juga untuk toko.</h2>
              <p className="lp-section-lead">
                Terima pesanan, atur waktu masak, kelola stok, dan pantau kurir dalam satu
                tampilan operasional.
              </p>
              <Link to="/merchant/orders" className="lp-btn lp-btn-primary">
                Buka konsol merchant <ArrowRight size={18} strokeWidth={1.75} />
              </Link>
            </div>
            <div className="lp-ticket lp-ticket-lg">
              <span className="lp-ticket-head">
                <Store size={16} strokeWidth={1.75} /> Live order board
              </span>
              {merchantOrders.slice(0, 4).map((order) => (
                <span className="lp-ticket-row" key={order.id}>
                  <span>{order.items[0].quantity}x {order.items[0].name}</span>
                  <em>{orderStatusLabel(order.status)}</em>
                </span>
              ))}
            </div>
          </div>

          <div className="landing-container lp-courier">
            <div className="lp-frame">
              <span className="lp-frame-bar">
                <Bike size={15} strokeWidth={1.75} /> {mockCouriers[0].name}
              </span>
              <JourneyLine stage="diantar" />
              <span className="lp-frame-line">Satu tugas, satu rute, konfirmasi saat tiba.</span>
            </div>
            <div>
              <h2 className="lp-section-title">Kurir toko, alur lebih sederhana.</h2>
              <p className="lp-section-lead">
                Pratinjau tampilan kurir. Tanpa analitik yang tidak perlu.
              </p>
            </div>
          </div>

          <div className="landing-container lp-plan" id="paket">
            <div>
              <h3>Mulai gratis, naik saat siap.</h3>
              <p>
                Merchant mulai tanpa biaya tetap. Transaksi memakai deposit dan komisi yang
                jelas, tanpa kejutan.
              </p>
            </div>
            <a href="#merchant" className="lp-btn lp-btn-quiet">Pelajari paket merchant</a>
          </div>
        </section>

        <section id="tentang" className="lp-section lp-editorial">
          <div className="landing-container lp-editorial-grid">
            <figure className="lp-editorial-main">
              <img
                src={foods[0].image}
                alt={foods[0].name}
                width={720}
                height={540}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{foods[0].name}</figcaption>
            </figure>
            <div className="lp-editorial-side">
              <figure>
                <img
                  src={foods[2].image}
                  alt={foods[2].name}
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{foods[2].name}</figcaption>
              </figure>
              <p className="lp-editorial-note">
                <ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" />
                Untuk merchant sekitar. Untuk pelanggan sekitar.
              </p>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <ClocheDecor className="lp-cta-cloche" />
          <DotMatrixDecor className="lp-cta-dots" />
          <div className="landing-container lp-cta-inner">
            <div>
              <h2>Lapar? Cari yang dekat.</h2>
              <p>Temukan merchant di sekitarmu dan pesan langsung dari Sa7tein.</p>
            </div>
            <div className="lp-cta-actions">
              <Link to="/onboarding" className="lp-btn lp-btn-solid">Mulai Pesan</Link>
              <a href="#merchant" className="lp-btn lp-btn-outline">Daftar Merchant</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="landing-container lp-footer-inner">
          <span className="lp-brand">Sa7tein</span>
          <p>Showcase UI/UX — semua data mock, tanpa transaksi sungguhan.</p>
          <nav className="lp-footer-nav" aria-label="Tautan footer">
            <a href="#cara-kerja">Cara Kerja</a>
            <Link to="/merchant/orders">Merchant</Link>
            <Link to="/documentation">Dokumentasi</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
