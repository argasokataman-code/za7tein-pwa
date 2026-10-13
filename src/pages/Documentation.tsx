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
