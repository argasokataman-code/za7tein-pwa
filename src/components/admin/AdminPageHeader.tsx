import { PageHeader } from '../ui/PageHeader'

interface AdminPageHeaderProps {
  title: string
  eyebrow?: string
  subtitle?: string
  back?: string | boolean
  /** Lonceng inbox peran. Default mati; hanya beranda akar yang menyalakannya. */
  bell?: boolean
}

/**
 * Header halaman panel CS. Selubung tipis di atas `PageHeader` — struktur dan
 * perilakunya sama dengan header merchant dan kurir.
 *
 * Tidak ada slot aksi di kanan: aksi utama halaman tinggal di zona jempol,
 * bukan di pojok kanan atas header.
 */
export function AdminPageHeader({
  title,
  eyebrow,
  subtitle,
  back,
  bell = false,
}: AdminPageHeaderProps) {
  return (
    <PageHeader
      prefix="admin"
      title={title}
      eyebrow={eyebrow}
      subtitle={subtitle}
      back={back}
      bell={bell}
      bellPanel
    />
  )
}
