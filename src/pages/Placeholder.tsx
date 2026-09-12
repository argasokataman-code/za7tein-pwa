import { Construction } from 'lucide-react'

import { BottomNav } from '../components/layout/BottomNav'
import { BackButton } from '../components/ui/BackButton'

interface PlaceholderProps {
  title: string
  description?: string
  withNav?: boolean
}

/**
 * Screen shell for routes whose UI has not been rebuilt yet.
 * Keeps every route in the app navigable while pages are ported one by one.
 */
export function Placeholder({ title, description, withNav = false }: PlaceholderProps) {
  return (
    <div className="page-module__screen">
      <header className="profile-flow-header">
        <BackButton />
        <h1 className="profile-flow-title">{title}</h1>
      </header>
      <div className="main-frame" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 64 }}>
        <Construction size={48} color="#fd6931" />
        <h2 className="section-title" style={{ marginTop: 16 }}>
          {title}
        </h2>
        <p style={{ color: '#697586', fontSize: 14, maxWidth: 320 }}>
          {description ?? 'This screen is not rebuilt yet — it is queued for the next milestone.'}
        </p>
      </div>
      {withNav ? <BottomNav /> : null}
    </div>
  )
}
