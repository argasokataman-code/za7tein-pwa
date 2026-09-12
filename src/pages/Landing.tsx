import { ArrowRight, Bike, ChefHat, Clock, MapPin, ShieldCheck, ShoppingBag, Store, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATS = [
  { Icon: MapPin, label: '2 zona', sub: 'Hijazi & Syimali' },
  { Icon: Clock, label: '15–35 mnt', sub: 'Estimasi masak' },
  { Icon: Bike, label: 'Batch 5', sub: 'Order per kurir' },
  { Icon: ShieldCheck, label: 'COD aman', sub: 'Deposit merchant' },
] as const

const FEATURES = [
  { Icon: MapPin, title: 'Zona yang jelas', text: 'Tarif per zona Hijazi dan Syimali. Biaya antar terlihat sebelum checkout, bukan setelah.' },
  { Icon: Wallet, title: 'Bayar caramu', text: 'Online lewat Midtrans atau COD, dijaga deposit merchant supaya pesanan tetap aman.' },
  { Icon: ChefHat, title: 'Antrean dapur', text: 'Dapur memilih estimasi 15, 25, atau 35 menit dan pembeli melihat antreannya.' },
] as const

const STEPS = [
  { Icon: ShoppingBag, title: 'Pesan', text: 'Pilih menu dan alamat lengkap: gedung, lantai, flat.' },
  { Icon: ChefHat, title: 'Dimasak', text: 'Dapur mengunci estimasi masak, pembeli memantau statusnya.' },
  { Icon: Bike, title: 'Diantar', text: 'Kurir menjemput dalam satu batch, urutan drop terkunci.' },
] as const

const ROLES = [
  { Icon: ShoppingBag, title: 'Pembeli', text: 'Cari menu sekitar, pesan, lalu ikuti status sampai tiba.', to: '/onboarding', cta: 'Coba sebagai pembeli' },
  { Icon: Store, title: 'Merchant', text: 'Kelola menu, stok, antrean order, dan setelan pengantaran.', to: '/merchant/menu', cta: 'Buka konsol merchant' },
  { Icon: Bike, title: 'Kurir', text: 'Susun rute, lapor insiden di jalan, dan selesaikan antar.', to: '/documentation', cta: 'Lihat rencana kurir' },
] as const

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-brand">Sa7tein</Link>
          <nav className="landing-nav-links" aria-label="Navigasi utama">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#peran">Peran</a>
            <Link to="/documentation">Dokumentasi</Link>
          </nav>
          <Link to="/onboarding" className="landing-btn landing-btn-primary landing-nav-cta">Lihat demo</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">Hyperlocal · Irbid MVP</span>
              <h1 className="landing-h1">Makanan di sekitarmu, sampai selagi hangat.</h1>
              <p className="landing-lead">
                Sa7tein menyatukan pembeli, dapur, dan kurir toko dalam satu alur.
                Zona Hijazi dan Syimali, tarif transparan, bayar online lewat Midtrans
                atau COD yang dijaga deposit merchant.
              </p>
              <div className="landing-hero-actions">
                <Link to="/onboarding" className="landing-btn landing-btn-primary">
                  Lihat demo <ArrowRight size={18} strokeWidth={1.75} />
                </Link>
                <Link to="/documentation" className="landing-btn landing-btn-ghost">Dokumentasi</Link>
              </div>
              <dl className="landing-stats">
                {STATS.map(({ Icon, label, sub }) => (
                  <div className="landing-stat" key={label}>
                    <Icon size={18} strokeWidth={1.75} />
                    <dt>{label}</dt>
                    <dd>{sub}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="landing-hero-visual">
              <div className="landing-device">
                <span className="landing-device-notch" aria-hidden="true" />
                <div className="landing-device-screen">
                  <iframe src="/onboarding" title="Pratinjau aplikasi Sa7tein" loading="lazy" />
                </div>
              </div>
              <span className="landing-chip landing-chip-a" aria-hidden="true">
                <ChefHat size={14} strokeWidth={1.75} /> Estimasi 25 menit
              </span>
              <span className="landing-chip landing-chip-b" aria-hidden="true">
                <Bike size={14} strokeWidth={1.75} /> Batch 5 order
              </span>
            </div>
          </div>
        </section>

        <section id="fitur" className="landing-section">
          <div className="landing-container">
            <div className="landing-section-head">
              <h2>Dibangun untuk pesanan sekitar</h2>
              <p>Tiga hal yang membuat pesanan hyperlocal terasa jelas, dari biaya sampai antrean dapur.</p>
            </div>
            <div className="landing-grid landing-grid-3">
              {FEATURES.map(({ Icon, title, text }) => (
                <article className="landing-card" key={title}>
                  <span className="landing-card-icon"><Icon size={22} strokeWidth={1.75} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="landing-section landing-section-alt">
          <div className="landing-container">
            <div className="landing-section-head">
              <h2>Cara kerjanya</h2>
              <p>Satu alur, tiga langkah, terlihat sama dari sisi pembeli maupun merchant.</p>
            </div>
            <div className="landing-steps">
              {STEPS.map(({ Icon, title, text }, index) => (
                <article className="landing-step" key={title}>
                  <span className="landing-step-num">{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <Icon className="landing-step-icon" size={20} strokeWidth={1.75} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="peran" className="landing-section">
          <div className="landing-container">
            <div className="landing-section-head">
              <h2>Tiga peran, satu pesanan</h2>
              <p>Pesanan yang sama dipandang dari sisi berbeda tanpa menggambar ulang statusnya.</p>
            </div>
            <div className="landing-grid landing-grid-3">
              {ROLES.map(({ Icon, title, text, to, cta }) => (
                <article className="landing-card landing-role" key={title}>
                  <span className="landing-card-icon"><Icon size={22} strokeWidth={1.75} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link to={to} className="landing-role-link">
                    {cta} <ArrowRight size={16} strokeWidth={1.75} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-container">
            <div className="landing-cta-inner">
              <div>
                <h2>Coba alur lengkapnya.</h2>
                <p>Dari memilih menu sampai pesanan tiba — semua layar bisa dijelajahi.</p>
              </div>
              <div className="landing-cta-actions">
                <Link to="/onboarding" className="landing-btn landing-btn-primary">Lihat demo</Link>
                <Link to="/documentation" className="landing-btn landing-btn-ghost">Dokumentasi</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <span className="landing-footer-brand">Sa7tein</span>
          <p>Showcase UI/UX — semua data mock, tanpa transaksi sungguhan.</p>
          <nav className="landing-footer-nav" aria-label="Tautan footer">
            <Link to="/onboarding">Demo</Link>
            <Link to="/merchant/menu">Merchant</Link>
            <Link to="/documentation">Dokumentasi</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
