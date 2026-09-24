import type { ReactNode } from 'react'

import { PageHeader } from '../ui/PageHeader'

interface AdminPageHeaderProps {
  title: string
  eyebrow?: string
  action?: ReactNode
}

/**
 * Header halaman panel CS. Selubung tipis di atas `PageHeader` — struktur dan
 * perilakunya sama dengan header merchant dan kurir.
 */
export function AdminPageHeader({ title, eyebrow, action }: AdminPageHeaderProps) {
  return <PageHeader prefix="admin" title={title} eyebrow={eyebrow} action={action} />
}
