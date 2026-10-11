import type { ReactNode } from 'react'

import { PageHeader } from '../ui/PageHeader'

interface AdminPageHeaderProps {
  title: string
  eyebrow?: string
  subtitle?: string
  back?: string | boolean
  action?: ReactNode
  /** Lonceng inbox peran. Default nyala; `false` untuk halaman pra-konsol. */
  bell?: boolean
}

/**
 * Header halaman panel CS. Selubung tipis di atas `PageHeader` — struktur dan
 * perilakunya sama dengan header merchant dan kurir.
 */
export function AdminPageHeader({
  title,
  eyebrow,
  subtitle,
  back,
  action,
  bell = true,
}: AdminPageHeaderProps) {
  return (
    <PageHeader
      prefix="admin"
      title={title}
      eyebrow={eyebrow}
      subtitle={subtitle}
      back={back}
      action={action}
      bell={bell}
      bellPanel
    />
  )
}
