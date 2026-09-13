import { ArrowRight, Bike, Check, ChefHat, Clock3, MapPin, Menu, Search, ShoppingBag, Store, Wallet } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const steps = [
  { Icon: Search, title: 'Pilih makanan', detail: 'Temukan menu dari toko terdekat.' },
  { Icon: ChefHat, title: 'Toko menyiapkan', detail: 'Estimasi masak langsung dari toko.' },
  { Icon: Bike, title: 'Kurir mengambil', detail: 'Kurir toko membawa pesananmu.' },
  { Icon: Check, title: 'Pesanan tiba', detail: 'Makanan sampai, siap dinikmati.' },
]
const icon = { size: 20, strokeWidth: 1.75 }

function DeliveryMap({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'sa-delivery-map sa-delivery-map-compact' : 'sa-delivery-map'}>
    <img src="/assets/illustrations/delivery-route.svg" alt="Ilustrasi peta: kurir bergerak dari toko menuju rumah melalui jalan" loading={compact ? 'lazy' : 'eager'} />
  </div>
}

function Phone({ view = 'home' }: { view?: 'home' | 'order' | 'menu' }) {
  return <div className={`sa-phone sa-phone-${view}`} aria-label={`Pratinjau aplikasi ${view}`}>
    <div className="sa-phone-island" /><div className="sa-phone-status">9:41 <span>● ▰</span></div>
    {view === 'home' ? <>
      <div className="sa-phone-brand"><img src="/icons/sa7tein-cloche.svg" alt="" /> Sa7tein</div>
      <small><MapPin size={11} strokeWidth={1.75} /> Irbid · Hijazi</small>
      <div className="sa-phone-search"><Search size={13} strokeWidth={1.75} /> Cari menu atau toko</div>
      <div className="sa-phone-cats"><span>Semua</span><span>Makanan</span><span>Minuman</span><span>Favorit</span></div>
      <strong>Di dekatmu</strong>
      <div className="sa-phone-food"><img src="/assets/img/menu/sate-ayam.webp" alt="" /><b>Sate ayam hangat</b><small>Dapur sekitar · contoh menu</small></div>
      <div className="sa-phone-food"><img src="/assets/img/menu/nasi-goreng.webp" alt="" /><b>Nasi goreng</b><small>Masakan rumahan</small></div>
    </> : view === 'order' ? <>
      <div className="sa-phone-topline">‹ <b>Pesanan No. 772292</b></div>
      <h3>Sedang diantar</h3><strong>Kurir menuju alamatmu</strong>
      <DeliveryMap compact />
      <div className="sa-order-person"><Bike size={16} strokeWidth={1.75} /><span><b>Kurir toko bergerak</b><small>Perjalanan pesanan terlihat jelas</small></span></div>
      <div className="sa-phone-buttons"><span>Hubungi</span><span>Chat</span></div>
    </> : <>
      <div className="sa-phone-topline">‹ <b>Detail menu</b></div>
      <img className="sa-phone-menu-photo" src="/assets/img/menu/sate-ayam.webp" alt="" />
      <h3>Sate ayam hangat</h3><small>Dibuat oleh dapur di sekitarmu</small>
      <div className="sa-phone-option">Pilih rasa <span>Original</span></div>
      <div className="sa-phone-option">Catatan <span>Sesuai selera</span></div>
      <div className="sa-phone-add">Tambahkan ke keranjang</div>
    </>}
  </div>
}

export default function Landing() {
  const landingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = landingRef.current
    if (!root) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return
    const targets = root.querySelectorAll<HTMLElement>('.sa-sample-journey, .sa-sample-experience, .sa-sample-area, .sa-merchant-feature, .sa-courier-feature, .sa-food-feature, .sa-sample-final')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sa-is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    targets.forEach((target) => observer.observe(target))
    root.classList.add('sa-motion-ready')
    let frame = 0
    const updateParallax = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        const hero = root.querySelector('.sa-sample-hero')
        const area = root.querySelector('.sa-sample-area')
        if (hero) root.style.setProperty('--sa-hero-shift', `${Math.min(28, Math.max(0, -hero.getBoundingClientRect().top * 0.055))}px`)
        if (area) root.style.setProperty('--sa-area-shift', `${Math.max(-16, Math.min(16, (window.innerHeight * 0.5 - area.getBoundingClientRect().top) * 0.035))}px`)
        frame = 0
      })
    }
    window.addEventListener('scroll', updateParallax, { passive: true })
    updateParallax()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateParallax)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <div className="sa-landing" ref={landingRef}>
    <header className="sa-nav"><div className="sa-wrap sa-nav-inner">
      <Link to="/" className="sa-logo" aria-label="Sa7tein, beranda"><img src="/icons/sa7tein-cloche.svg" alt="" width={36} height={36} /><span>Sa7tein</span></Link>
      <nav className="sa-nav-links" aria-label="Navigasi utama"><a href="#cara-kerja">Cara Kerja</a><a href="#untuk-toko">Untuk Merchant</a><a href="#area">Area</a><a href="#tentang">Tentang</a></nav>
      <div className="sa-nav-actions"><a href="/app/signin" className="sa-nav-login">Masuk</a><a href="/app/onboarding" className="sa-button sa-button-dark">Mulai Pesan</a></div>
      <details className="sa-mobile-nav"><summary aria-label="Buka navigasi"><Menu size={22} strokeWidth={1.75} /></summary><nav aria-label="Navigasi ponsel"><a href="#cara-kerja">Cara Kerja</a><a href="#untuk-toko">Untuk Merchant</a><a href="#area">Area</a><a href="#tentang">Tentang</a><a href="/app/signin">Masuk</a><a href="/app/onboarding">Mulai Pesan</a></nav></details>
    </div></header>
    <main>
      <section className="sa-sample-hero" aria-labelledby="sa-hero-title"><div className="sa-wrap sa-sample-hero-inner">
        <div className="sa-sample-hero-copy"><p>Marketplace makanan hyperlocal</p><h1 id="sa-hero-title">Makanan enak,<br />lebih dekat.</h1><p>Temukan makanan dari dapur terdekat, pesan dengan mudah, dan nikmati pengantaran langsung dari kurir toko.</p><div className="sa-sample-actions"><a href="/app/onboarding" className="sa-button sa-button-cream">Mulai Pesan <ArrowRight size={17} strokeWidth={1.75} /></a><a href="#cara-kerja" className="sa-button sa-button-outline">Lihat Cara Kerja</a></div></div>
        <div className="sa-sample-hero-art"><div className="sa-dots" /><Phone /><div className="sa-floating-ticket"><b>Pesanan baru <span>1</span></b><small>No. 772292 <span>2 menit lalu</span></small><strong>Sate ayam hangat</strong><div><span>Terima</span><span>Tolak</span></div></div><div className="sa-floating-map"><DeliveryMap /><div className="sa-map-caption"><MapPin size={18} strokeWidth={1.75} /><b>Menuju lokasi</b><small>Kurir toko bergerak</small></div></div></div>
        <div className="sa-hero-values"><p><span><MapPin {...icon} /></span><b>Dekat</b><small>Dapur di area sekitarmu</small></p><p><span><Clock3 {...icon} /></span><b>Jelas</b><small>Progres pesanan terbaca</small></p><p><span><Store {...icon} /></span><b>Langsung</b><small>Kurir dari toko</small></p></div>
      </div></section>
      <section className="sa-sample-journey" id="cara-kerja"><div className="sa-wrap">
        <p className="sa-section-kicker">01 / CARA KERJA</p><h2>Dari dapur ke pintumu.</h2><p>Perjalanan makanan enak sampai ke tanganmu, dalam beberapa langkah.</p>
        <ol>{steps.map(({ Icon, title, detail }) => <li key={title}><span><Icon size={23} strokeWidth={1.75} /></span><h3>{title}</h3><p>{detail}</p></li>)}</ol>
      </div></section>
      <section className="sa-sample-experience"><div className="sa-wrap sa-experience-grid">
        <div className="sa-phone-trio"><Phone view="menu" /><Phone view="order" /><Phone view="home" /></div>
        <div className="sa-experience-copy"><p className="sa-section-kicker">02 / PENGALAMAN PELANGGAN</p><h2>Pesan tanpa ribet.</h2><p>Lokasi, menu, pembayaran, dan status pesanan dalam satu alur yang sederhana.</p><ul><li><MapPin {...icon} /> Temukan toko di sekitarmu</li><li><ShoppingBag {...icon} /> Pilih menu favorit</li><li><Wallet {...icon} /> Lihat pilihan pembayaran</li><li><Bike {...icon} /> Pantau perjalanan pesanan</li></ul><a href="/app/home" className="sa-feature-link">Lihat aplikasi pelanggan <ArrowRight size={18} strokeWidth={1.75} /></a></div>
      </div></section>
      <section className="sa-sample-area" id="area"><div className="sa-wrap sa-area-grid">
        <div className="sa-area-copy"><p className="sa-section-kicker">03 / HYPERLOCAL</p><h2>Dekat itu lebih baik.</h2><p>Sa7tein fokus pada dapur di area Irbid. Toko menentukan wilayah layanannya, dan kamu melihat ongkir sebelum memesan.</p><div><span>Hijazi</span><small>Area layanan di sekitar tempat tinggal</small></div><div><span>Syimali</span><small>Area layanan kampus dan utara</small></div></div>
        <div className="sa-zone-map" aria-label="Ilustrasi area layanan toko di Irbid"><img className="sa-zone-streets" src="/assets/illustrations/service-area.svg" alt="" loading="lazy" /><div className="sa-zone-ring sa-zone-ring-outer" /><div className="sa-zone-ring sa-zone-ring-inner" /><span className="sa-zone-center"><Store size={22} strokeWidth={1.75} /></span><span className="sa-zone-pin pin-one"><MapPin size={16} strokeWidth={1.75} /></span><span className="sa-zone-pin pin-two"><MapPin size={16} strokeWidth={1.75} /></span><span className="sa-zone-pin pin-three"><MapPin size={16} strokeWidth={1.75} /></span></div>
      </div></section>
      <section className="sa-merchant-feature" id="untuk-toko"><div className="sa-wrap sa-merchant-feature-grid">
        <div className="sa-merchant-scene"><img src="/assets/img/menu/sate-ayam.webp" alt="Sate ayam dari menu contoh" loading="lazy" /><div className="sa-merchant-scene-ticket"><span><ChefHat size={19} strokeWidth={1.75} /> TIKET DAPUR</span><strong>Pesanan baru diterima</strong><small>Sate ayam hangat · 1 porsi</small><div>Estimasi masak <b>Dipilih toko</b></div><div>Kurir toko <b>Siap mengambil</b></div></div></div>
        <div className="sa-merchant-feature-copy"><p className="sa-section-kicker">04 / UNTUK MERCHANT</p><h2>Dapur tetap fokus. Pesanan tetap tertata.</h2><p>Tiket masuk, waktu masak, menu, dan stok dibaca dalam satu alur ketika dapur sedang ramai.</p><a href="/app/merchant" className="sa-button sa-button-dark">Lihat untuk Merchant <ArrowRight size={17} strokeWidth={1.75} /></a></div>
      </div></section>
      <section className="sa-courier-feature" id="tentang"><div className="sa-wrap sa-courier-feature-grid">
        <div className="sa-courier-feature-copy"><p className="sa-section-kicker">05 / UNTUK KURIR TOKO</p><h2>Satu perjalanan. Tujuan jelas.</h2><p>Alamat dan progres pengantaran disajikan sederhana agar kurir toko bisa fokus membawa pesanan sampai ke pelanggan.</p><a href="/app/courier" className="sa-feature-link">Lihat alur kurir <ArrowRight size={18} strokeWidth={1.75} /></a></div>
        <div className="sa-courier-scene"><DeliveryMap /><div className="sa-courier-scene-note"><Bike size={20} strokeWidth={1.75} /><span><b>Dalam perjalanan</b><small>Dari toko menuju pelanggan</small></span></div></div>
      </div></section>
      <section className="sa-food-feature"><div className="sa-wrap sa-food-feature-grid"><div><p className="sa-section-kicker">06 / RASA SEKITAR</p><h2>Banyak rasa lokal di sekitarmu.</h2><p>Dari menu harian sampai favorit yang selalu dicari, temukan pilihan dari dapur yang melayani areamu.</p><a href="/app/home" className="sa-feature-link">Jelajahi menu <ArrowRight size={18} strokeWidth={1.75} /></a></div><div className="sa-food-feature-photo"><img src="/assets/img/menu/nasi-goreng.webp" alt="Nasi goreng dari menu contoh" loading="lazy" /></div></div></section>
      <section className="sa-sample-final" aria-labelledby="sa-final-title">
        <div className="sa-wrap sa-final-content">
          <div className="sa-final-copy">
            <p className="sa-final-eyebrow">DARI DAPUR SEKITARMU</p>
            <h2 id="sa-final-title">Lapar?<br />Cari yang dekat.</h2>
            <p className="sa-final-lead">Lihat dapur yang melayani areamu, pilih menu yang kamu suka, lalu pesan dengan jelas.</p>
            <a href="/app/onboarding" className="sa-button sa-button-cream sa-final-primary">Cari makanan <ArrowRight size={18} strokeWidth={1.75} /></a>
            <div className="sa-final-merchant"><span>Punya dapur atau toko makanan?</span><a href="/app/merchant/signup">Bergabung sebagai merchant <ArrowRight size={16} strokeWidth={1.75} /></a></div>
          </div>
        </div>
        <div className="sa-final-visual"><img src="/assets/img/menu/lontong.webp" alt="Hidangan lokal dari dapur contoh Sa7tein" loading="lazy" /><span>Rasa lokal, dari dapur sekitar.</span></div>
      </section>
    </main>
    <footer className="sa-footer"><div className="sa-wrap sa-footer-inner"><span className="sa-logo"><img src="/icons/sa7tein-cloche.svg" alt="" width={29} height={29} /> Sa7tein</span><p>Pratinjau UI/UX dengan data contoh. Belum melayani transaksi sungguhan.</p><Link to="/documentation">Dokumentasi</Link></div></footer>
  </div>
}
