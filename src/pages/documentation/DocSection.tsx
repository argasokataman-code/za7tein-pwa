import type { ReactNode } from 'react'

interface DocSectionProps {
  id: string
  num: string
  title: string
  children: ReactNode
}

export function DocSection({ id, num, title, children }: DocSectionProps) {
  return (
    <section id={id} className="doc-section">
      <div className="doc-section-header">
        <span className="doc-section-num">{num}</span>
        <h2 className="doc-section-title">{title}</h2>
      </div>
      {children}
    </section>
  )
}
