import { useState } from 'react'

import { DOC_NAV } from './documentation/nav'
import { DocShellCtas } from './documentation/DocShellCtas'
import { APP_VERSION } from '../data/appInfo'
import { IntroductionSection } from './documentation/sections/IntroductionSection'
import { WhatsNewSection } from './documentation/sections/WhatsNewSection'
import { PagesRoutesSection } from './documentation/sections/PagesRoutesSection'
import { FileStructureSection } from './documentation/sections/FileStructureSection'
import { InstallationSection } from './documentation/sections/InstallationSection'
import { RouteProtectionSection } from './documentation/sections/RouteProtectionSection'
import { StateManagementSection } from './documentation/sections/StateManagementSection'
import { PwaSection } from './documentation/sections/PwaSection'
import { StylingSection } from './documentation/sections/StylingSection'
import { FormsSection } from './documentation/sections/FormsSection'
import { ComponentsSection } from './documentation/sections/ComponentsSection'
import { CourierDesignSection } from './documentation/sections/CourierDesignSection'
import { AdminDesignSection } from './documentation/sections/AdminDesignSection'
import { CurrencySection } from './documentation/sections/CurrencySection'
import { CheckoutFeeSection } from './documentation/sections/CheckoutFeeSection'
import { CodHoldSection } from './documentation/sections/CodHoldSection'
import { DeliveryCheckpointSection } from './documentation/sections/DeliveryCheckpointSection'
import { DisputeSection } from './documentation/sections/DisputeSection'
import { ConsistencySection } from './documentation/sections/ConsistencySection'
import { SuperAdminSection } from './documentation/sections/SuperAdminSection'
import { AddressZoneSection } from './documentation/sections/AddressZoneSection'
import { IncentiveSection } from './documentation/sections/IncentiveSection'
import { LedgerSection } from './documentation/sections/LedgerSection'
import { PushSection } from './documentation/sections/PushSection'
import { TaxSection } from './documentation/sections/TaxSection'
import { WalletSection } from './documentation/sections/WalletSection'
import { BackendSection } from './documentation/sections/BackendSection'
import { MerchantDesignSection } from './documentation/sections/MerchantDesignSection'
import { LayoutExceptionsSection } from './documentation/sections/LayoutExceptionsSection'
import { LandingSection } from './documentation/sections/LandingSection'
import { DesignTokensSection } from './documentation/sections/DesignTokensSection'
import { ButtonsSection } from './documentation/sections/ButtonsSection'
import { ElementsSection } from './documentation/sections/ElementsSection'
import { MotionIconsSection } from './documentation/sections/MotionIconsSection'
import { AuthSection } from './documentation/sections/AuthSection'
import { AppPolishSection } from './documentation/sections/AppPolishSection'
import { ChangelogSection } from './documentation/sections/ChangelogSection'

const SECTIONS = [
  IntroductionSection,
  WhatsNewSection,
  PagesRoutesSection,
  FileStructureSection,
  InstallationSection,
  RouteProtectionSection,
  StateManagementSection,
  PwaSection,
  StylingSection,
  FormsSection,
  ComponentsSection,
  BackendSection,
  MerchantDesignSection,
  LayoutExceptionsSection,
  LandingSection,
  DesignTokensSection,
  ButtonsSection,
  ElementsSection,
  MotionIconsSection,
  CourierDesignSection,
  AdminDesignSection,
  CurrencySection,
  CheckoutFeeSection,
  WalletSection,
  CodHoldSection,
  DeliveryCheckpointSection,
  DisputeSection,
  TaxSection,
  PushSection,
  LedgerSection,
  IncentiveSection,
  AddressZoneSection,
  ConsistencySection,
  SuperAdminSection,
  AuthSection,
  ChangelogSection,
  AppPolishSection,
]

// `SECTIONS` dan `DOC_NAV` (src/pages/documentation/nav.ts) dipakai berpasangan:
// render di bawah memakai DOC_NAV[index] sebagai key. Panjang yang tidak sama
// membuat entri terakhir undefined dan halaman ini mati tanpa pesan jelas —
// terjadi saat satu section ditambahkan tanpa entri nav. Gagalkan lebih awal
// dengan pesan yang menyebut sebabnya.
if (SECTIONS.length !== DOC_NAV.length) {
  throw new Error(
    `Documentation: SECTIONS (${SECTIONS.length}) dan DOC_NAV (${DOC_NAV.length}) tidak sepanjang`,
  )
}

const HERO_TAGS = [
  'React 19 + Vite',
  'React 19',
  'TypeScript',
  'Redux Toolkit',
  'Supabase Realtime',
  'SCSS',
  'PWA',
  'Zod',
  'React Hook Form',
]

// CTA per peran (`DocShellCtas`) menautkan host peran ke PATH entry perannya,
// mis. `https://sa7tein-c.vercel.app/customer/home`, bukan root host. Root tetap
// 307 di server lewat `vercel.json`, tapi service worker lama bisa menyajikan
// `index.html` dari cache untuk `/` sehingga 307 tak jalan dan app mendarat di
// Landing; menautkan path peran membuat klik selalu mendarat di peran yang benar.
export default function Documentation() {
  const [active, setActive] = useState(0)
  // Sidebar di layar sempit tergeser keluar (`translateX(-100%)`) dan hanya
  // kelas `.open` yang memunculkannya. Sebelum ini tidak ada yang pernah
  // menambah `.open`, sementara tombol hamburger tidak punya handler: jadi di
  // ponsel daftar isi tidak bisa dibuka sama sekali. State ini yang menutupnya.
  const [navOpen, setNavOpen] = useState(false)

  const goTo = (index: number, id: string) => {
    setActive(index)
    setNavOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
    <div className="app-shell">
      <div className="doc-root">
        <div className="doc-topbar">
          <span className="doc-topbar-logo">
            Sa7tein
          </span>
          <button
            className="doc-hamburger"
            aria-label="Buka daftar isi"
            aria-expanded={navOpen}
            aria-controls="doc-nav"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div
          className={`doc-overlay${navOpen ? ' open' : ''}`}
          onClick={() => setNavOpen(false)}
        />
        <aside className={`doc-sidebar${navOpen ? ' open' : ''}`} id="doc-nav">
          <div className="doc-sidebar-logo">
            <span className="doc-logo-mark">
              Sa7tein
            </span>
            <span className="doc-logo-sub">
              Documentation
            </span>
          </div>
          <div className="doc-sidebar-version">
            <span className="doc-version-badge">
              v{APP_VERSION}
            </span>
            <span>
              React 19 · Vite · TypeScript
            </span>
          </div>
          <nav className="doc-nav">
            <div className="doc-nav-label">
              Contents
            </div>
            {DOC_NAV.map((item, index) => (
              <button
                key={item.id}
                className={`doc-nav-item ${active === index ? 'active' : ''}`}
                onClick={() => goTo(index, item.id)}
              >
                <span className="doc-nav-num">
                  {item.num}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="doc-main">
          <div className="doc-hero">
            <div className="doc-hero-eyebrow">
              Documentation
            </div>
            <h1 className="doc-hero-title">
              Sa7tein 
              <span>
                PWA
              </span>
              <br />
              Developer Guide
            </h1>
            <p className="doc-hero-desc">
              Referensi PWA Sa7tein: arsitektur tiap layar, kontrak backend, sistem
              desain, dan riwayat perubahan per role. Data referensi (kurir, dompet,
              insentif merchant, zona, operator SA) dibaca live dari PostgREST lewat{' '}
              <code className="doc-inline">src/api/reference.ts</code> lalu disinkronkan ke
              Redux di root. Repo ini front-end saja: seluruh data mock (AGENTS &sect;1).
            </p>
            <div className="doc-hero-tags">
              {HERO_TAGS.map((tag) => (
                <span key={tag} className="doc-hero-tag">
                  {tag}
                </span>
              ))}
            </div>
            <p className="doc-p">
              Buka UI langsung. Tiap tautan membuka role di tab baru, tanpa login
              (semua data mock):
            </p>
            <DocShellCtas />
            <p className="doc-p">
              Rincian tiap perubahan ada di bagian <strong>Changelog (36)</strong>, dan
              tiap topik punya bagiannya sendiri di daftar isi. Sorotan terbaru:
            </p>
            <ul className="doc-list">
              <li>
                <strong>PRD aktif berganti</strong> ke{' '}
                <code className="doc-inline">sa7tein-mvp-2026-10-11</code> (marketplace +
                delivery), menggantikan <code className="doc-inline">irbid-mvp-v2-2026-09-21</code>{' '}
                yang jadi <code className="doc-inline">superseded</code> (catatan keputusan di{' '}
                <code className="doc-inline">docs/product/prd/decision-sa7tein-mvp.md</code>).
                Migrasi M0–M11 masuk bertahap: M0 menambah tipe domain + konstanta uang
                (Pc/Pm, multiplier Quick, Ft QRIS) dan slice{' '}
                <code className="doc-inline">batch</code>/<code className="doc-inline">partner</code>/
                <code className="doc-inline">quota</code>/<code className="doc-inline">marketing</code>;
                M1 (discovery) menggrup toko per tag, menyembunyikan toko blok-kuota, menonaktifkan
                toko tutup/luar-coverage, dan menambah bilah urut/filter di{' '}
                <code className="doc-inline">/customer/home</code>. Milestone &amp; kriteria
                penerimaan: <code className="doc-inline">docs/product/prd/versions/sa7tein-mvp-2026-10-11/milestones.md</code>.
              </li>
              <li>
                <strong>Keranjang ganda per toko</strong> (M1c): menambah menu dari toko berbeda
                tidak lagi menimpa keranjang sebelumnya — keranjang toko lain disimpan di{' '}
                <code className="doc-inline">cart.carts</code> dan layar{' '}
                <code className="doc-inline">/customer/checkout</code> menampilkan daftar
                &ldquo;Keranjang lain&rdquo; untuk dipindah atau dibuang, plus kolom catatan
                tingkat pesanan (<code className="doc-inline">cart.orderNote</code>); nama toko
                pada checkout kini diambil dari merchant keranjang aktif, daftar
                &ldquo;Keranjang lain&rdquo; tetap tampil walau keranjang aktif kosong, dan
                keranjang aktif disimpan lebih dulu sebelum ditimpa — item tidak hilang saat
                pindah.
              </li>
              <li>
                <strong>Aturan uang PRD baru</strong> (M2a) jadi fungsi murni JOD di{' '}
                <code className="doc-inline">src/data/marketplace.ts</code>:{' '}
                <code className="doc-inline">priceBreakdown()</code> menurunkan{' '}
                <code className="doc-inline">S − Dm − Da + F + Pc + Ft</code> dengan{' '}
                <code className="doc-inline">Ft</code> = 1,5% hanya untuk QRIS,{' '}
                <code className="doc-inline">settlementFor()</code> membelah tiga kolom
                (merchant/kurir/aplikator) yang selalu berjumlah total — kuota{' '}
                <code className="doc-inline">cod</code> memindahkan <code className="doc-inline">Pc</code>{' '}
                ke merchant — dan pembulatan tagihan ke atas ratusan vs payout ke bawah rupiah
                penuh. Diuji <code className="doc-inline">scripts/money-check.mjs</code>; pemasangan di
                Checkout &amp; refund menyusul (M2b/M2c).
              </li>
              <li>
                Checkout kini <strong>tak lagi menelan kegagalan diam-diam</strong>: kalau{' '}
                <code className="doc-inline">POST /orders</code> ditolak BE, order dicatat lokal
                dengan kode yang sama (bukan jatuh ke <code className="doc-inline">mockOrder</code>{' '}
                yang tak nyambung) dan muncul peringatan. Pelacakan customer lalu menampilkan
                pesanan itu; status live menyusul begitu BE menerima tulisannya (flow{' '}
                <strong>f1</strong> / <strong>f18</strong>).
              </li>
              <li>
                Konfirmasi merchant kini <strong>tergerbang pembayaran</strong> (f18): order tetap
                muncul di Antrean begitu checkout, tapi tombol <strong>Terima</strong> nonaktif sampai
                pembayaran terkonfirmasi — DANA VA/QRIS dan saldo harus{' '}
                <code className="doc-inline">paid</code>, COD lewat hold saldo (f2), transfer
                diverifikasi merchant saat diterima. Order belum lunas membawa chip &ldquo;Menunggu
                bayar&rdquo;.
              </li>
              <li>
                Tugas kurir kini dari <strong>satu RPC BE</strong> (
                <code className="doc-inline">courier_orders()</code>): nama/HP customer, alamat,
                lantai/unit, item, dan tip ikut dari database (bukan lagi placeholder{' '}
                <code className="doc-inline">Customer N</code>/<code className="doc-inline">-</code>).
                OTP diverifikasi <strong>di server</strong> — customer membacanya lewat RPC{' '}
                <code className="doc-inline">my_order_otp</code>, kurir lewat{' '}
                <code className="doc-inline">verify_order_otp</code>; tulis status pakai sesi kurir,
                bukan token merchant.
              </li>
              <li>
                Coverage alamat kini dari <strong>RPC BE</strong>{' '}
                <code className="doc-inline">resolve_coverage</code> (poligon zona + radius merchant
                + toggle zona aktif), bukan hitung poligon klien; konsol SA menulis master zona ke
                tabel <code className="doc-inline">zones</code> lewat{' '}
                <code className="doc-inline">updateZonePolygon()</code>.
              </li>
              <li>
                Konsol SA: pengecualian <strong>lebar penuh</strong> kini dikenali gerbang browser
                (<code className="doc-inline">wideShell</code> membaca{' '}
                <code className="doc-inline">.sa-root</code>), target sentuh sidebar dinaikkan ke{' '}
                <code className="doc-inline">--touch-min</code> (44px, select operator + baris tautan),
                dan tautan lompat-ke-konten dibuang mengikuti panel CS.
              </li>
              <li>
                <strong>Promo merchant</strong>: tabel{' '}
                <code className="doc-inline">marketing</code> kini punya{' '}
                <code className="doc-inline">merchant_id</code> + RLS{' '}
                <code className="doc-inline">marketing_merchant</code>, dan validasi dikerjakan
                server lewat RPC <code className="doc-inline">validate_promo</code>. Halaman{' '}
                <code className="doc-inline">/merchant/promos</code> membuat/menghapus kode;
                checkout customer memasangnya (<code className="doc-inline">cart.promo</code> →{' '}
                <code className="doc-inline">orders.promo_id</code> /{' '}
                <code className="doc-inline">promo_amount_jod</code>). Scope produk (MARK-1) masih
                terbuka; kontrak di{' '}
                <code className="doc-inline">docs/integration/promos/be-contract.md</code>.
              </li>
              <li>
                <strong>Ulasan merchant &amp; hidangan</strong>: tabel{' '}
                <code className="doc-inline">rating_reviews</code> menyimpan ulasan toko
                (<code className="doc-inline">merchant_id</code>) dan ulasan hidangan
                (<code className="doc-inline">menu_id</code>) dalam satu baris — dipisah{' '}
                <code className="doc-inline">check ((merchant_id is not null) &lt;&gt; (menu_id is not
                null))</code>. Halaman <code className="doc-inline">/merchant/reviews</code> membaca
                keduanya (ulasan hidangan lewat join{' '}
                <code className="doc-inline">menus.merchant_id</code>) dan membalas ke{' '}
                <code className="doc-inline">review_replies</code>; customer mengirim penilaian toko
                dari <code className="doc-inline">/reviews</code>. Nama pemberi ulasan hanya terbaca
                sesi ops (<code className="doc-inline">customers</code> RLS), jadi daftar dibaca lewat
                sesi referensi. Kontrak di{' '}
                <code className="doc-inline">docs/integration/reviews/be-contract.md</code>.
              </li>
              <li>
                Tulis order kini benar-benar sampai ke BE: <code className="doc-inline">createWithReturn</code>{' '}
                meminta kolom eksplisit (<code className="doc-inline">select=id,code</code>) karena{' '}
                <code className="doc-inline">return=representation</code> tanpa{' '}
                <code className="doc-inline">select</code> menjalankan{' '}
                <code className="doc-inline">RETURNING *</code> yang menyentuh{' '}
                <code className="doc-inline">orders.otp</code> (SELECT-nya dicabut dari{' '}
                <code className="doc-inline">authenticated</code>) — dulu itu membatalkan seluruh INSERT
                dengan <code className="doc-inline">42501</code> dan checkout jatuh ke order lokal. Rincian
                di bagian <strong>Connecting a Real Backend (12)</strong>.
              </li>
              <li>
                Antrean merchant kini <strong>murni dari BE</strong>: state order mulai kosong,
                seed demo <code className="doc-inline">mo-*</code> tak lagi dirender karena
                id-nya non-numerik (Terima/Tolak tak bisa dipersist, kartu "hidup lagi" saat
                reload). Terima pada order nyata pindah ke Diproses dan tetap begitu. Rincian
                di bagian <strong>Merchant Console (13)</strong>.
              </li>
              <li>
                Metode bayar di checkout kini <strong>dibaca dari BE</strong>: tabel publik{' '}
                <code className="doc-inline">payment_methods</code> menyetir daftar, urutan, dan
                status aktifnya (mock jadi cadangan). Label tetap teks kurasi karena kolom deskripsi
                BE memuat kode internal; <code className="doc-inline">key</code> provider lama{' '}
                <code className="doc-inline">xendit_*</code> dipetakan ke DANA di{' '}
                <code className="doc-inline">src/api/payments.ts</code>.
              </li>
              <li>
                Metode bayar <strong>DANA</strong> (keputusan PO 2026-10-13): layar{' '}
                <code className="doc-inline">/customer/payment-dana</code> menampilkan
                nomor Virtual Account atau pola QRIS dengan hitung mundur dan tiga state
                (menunggu / dibayar / kedaluwarsa). Masih mock sandbox; kredensial DANA
                tidak pernah menyentuh browser (kontrak di{' '}
                <code className="doc-inline">docs/integration/dana/be-contract.md</code>).
              </li>
              <li>
                <strong>EDISI 02 (UI v2)</strong>: brand{' '}
                <code className="doc-inline">--sa7tein-orange</code>, latar{' '}
                <code className="doc-inline">--bg-warm</code>, font Plus Jakarta Sans,
                langit-langit radius 32px. Aturan dan cara migrasi di{' '}
                <code className="doc-inline">docs/design/ui-v2.md</code>.
              </li>
              <li>
                Audit mobile 013 sampai 015 (form menu merchant, konsol kurir, panel CS):
                baris aksi sheet jadi sticky, chip kategori menggantikan{' '}
                <code className="doc-inline">&lt;select&gt;</code>, kontras dinaikkan, dan{' '}
                <code className="doc-inline">/admin</code> punya layout desktop dari 901px.
              </li>
              <li>
                Backend live: konsol CS menandai risiko customer lewat registri customers
                dan <code className="doc-inline">customer_risk_flags</code>; checkout
                menulis order lewat <code className="doc-inline">POST /orders</code> dan
                antrean merchant membacanya kembali; notifikasi inbox per audience dengan
                lonceng dan badge.
              </li>
            </ul>
          </div>
          {SECTIONS.map((Section, index) => (
            <Section key={DOC_NAV[index].id} />
          ))}
        </main>
      </div>
    </div>
    </>
  )
}
