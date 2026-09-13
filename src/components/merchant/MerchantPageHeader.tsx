import type { ReactNode } from 'react'

interface MerchantPageHeaderProps {
  title: string
  eyebrow?: string
  action?: ReactNode
}

export function MerchantPageHeader({ title, eyebrow, action }: MerchantPageHeaderProps) {
  return (
    <header className="merchant-header">
      <div className="merchant-header-copy">
        {eyebrow ? <p className="merchant-eyebrow">{eyebrow}</p> : null}
        <h1 className="merchant-title">{title}</h1>
      </div>
      {action ? <div className="merchant-header-action">{action}</div> : null}
    </header>
  )
}
