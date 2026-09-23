import { useState } from 'react'

import { DOC_NAV } from './documentation/nav'
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
]

const HERO_TAGS = [
  'React 19 + Vite',
  'React 19',
  'TypeScript',
  'Redux Toolkit',
  'SCSS',
  'PWA',
  'Zod',
  'React Hook Form',
]

export default function Documentation() {
  const [active, setActive] = useState(0)

  const goTo = (index: number, id: string) => {
    setActive(index)
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
          <button className="doc-hamburger" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className="doc-overlay " />
        <aside className="doc-sidebar ">
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
              v2.28.0
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
              Panduan PWA Sa7tein: tiap peran punya prefix URL dan instalasi sendiri (/customer, /merchant, /courier, /admin — panel admin yang dikelola CS). Super Admin adalah role terpisah: website penuh non-PWA di /superadmin. Landing dengan satu aksi utama per section, cache yang aman, scroll native, dan simulator desktop yang scroll-nya terkunci pada layar perangkat.
            </p>
            <div className="doc-hero-tags">
              {HERO_TAGS.map((tag) => (
                <span key={tag} className="doc-hero-tag">
                  {tag}
                </span>
              ))}
            </div>
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
