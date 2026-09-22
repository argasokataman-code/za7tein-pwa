import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  eyebrow?: string
  action?: ReactNode
}

export function AdminPageHeader({ title, eyebrow, action }: AdminPageHeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header-copy">
        {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
        <h1 className="admin-title">{title}</h1>
      </div>
      {action ? <div className="admin-header-action">{action}</div> : null}
    </header>
  )
}
