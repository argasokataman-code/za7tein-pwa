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
import { BackendSection } from './documentation/sections/BackendSection'
import { MerchantDesignSection } from './documentation/sections/MerchantDesignSection'
import { LayoutExceptionsSection } from './documentation/sections/LayoutExceptionsSection'
import { LandingSection } from './documentation/sections/LandingSection'

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
              v2.4.0
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
              Panduan lengkap PWA marketplace makanan hyperlocal Sa7tein. Setiap layar, route, slice, dan komponen — terdokumentasi.
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
