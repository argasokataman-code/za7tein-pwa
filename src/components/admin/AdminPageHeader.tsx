import type { ReactNode } from 'react'

import { PageHeader } from '../ui/PageHeader'

interface AdminPageHeaderProps {
  title: string
  eyebrow?: string
  back?: string | boolean
  action?: ReactNode
}

/**
 * Header halaman panel CS. Selubung tipis di atas `PageHeader` — struktur dan
 * perilakunya sama dengan header merchant dan kurir.
 */
export function AdminPageHeader({ title, eyebrow, back, action }: AdminPageHeaderProps) {
  return <PageHeader prefix="admin" title={title} eyebrow={eyebrow} back={back} action={action} />
}
