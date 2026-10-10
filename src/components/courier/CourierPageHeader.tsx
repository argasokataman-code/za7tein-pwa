import type { ReactNode } from 'react'

import { PageHeader } from '../ui/PageHeader'

interface CourierPageHeaderProps {
  title: string
  eyebrow?: string
  back?: string | boolean
  action?: ReactNode
  /** Lonceng inbox peran. Default nyala; `false` untuk halaman pra-konsol. */
  bell?: boolean
}

/**
 * Header halaman kurir. Selubung tipis di atas `PageHeader` — struktur dan
 * perilakunya sama dengan header merchant dan panel CS.
 */
export function CourierPageHeader({
  title,
  eyebrow,
  back,
  action,
  bell = true,
}: CourierPageHeaderProps) {
  return (
    <PageHeader
      prefix="courier"
      title={title}
      eyebrow={eyebrow}
      back={back}
      action={action}
      bell={bell}
    />
  )
}
