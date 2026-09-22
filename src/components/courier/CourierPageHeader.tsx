import type { ReactNode } from 'react'

interface CourierPageHeaderProps {
  title: string
  eyebrow?: string
  action?: ReactNode
}

export function CourierPageHeader({ title, eyebrow, action }: CourierPageHeaderProps) {
  return (
    <header className="courier-header">
      <div className="courier-header-copy">
        {eyebrow ? <p className="courier-eyebrow">{eyebrow}</p> : null}
        <h1 className="courier-title">{title}</h1>
      </div>
      {action ? <div className="courier-header-action">{action}</div> : null}
    </header>
  )
}
