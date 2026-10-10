import type { ReactNode } from 'react'

import { PageHeader } from '../ui/PageHeader'

interface MerchantPageHeaderProps {
  title: string
  eyebrow?: string
  back?: string | boolean
  action?: ReactNode
}

/**
 * Header halaman merchant. Selubung tipis di atas `PageHeader`: struktur dan
 * perilakunya sama dengan header kurir dan panel CS, hanya kelasnya yang
 * berbeda. Sebelumnya ketiganya tiga salinan identik.
 */
export function MerchantPageHeader({ title, eyebrow, back, action }: MerchantPageHeaderProps) {
  return <PageHeader prefix="merchant" title={title} eyebrow={eyebrow} back={back} action={action} />
}
