import { PageHeader } from '../ui/PageHeader'

interface CourierPageHeaderProps {
  title: string
  eyebrow?: string
  back?: string | boolean
  /** Lonceng inbox peran. Default mati; hanya beranda akar yang menyalakannya. */
  bell?: boolean
}

/**
 * Header halaman kurir. Selubung tipis di atas `PageHeader` — struktur dan
 * perilakunya sama dengan header merchant dan panel CS.
 *
 * Tidak ada slot aksi di kanan: aksi utama halaman tinggal di zona jempol,
 * bukan di pojok kanan atas header.
 */
export function CourierPageHeader({
  title,
  eyebrow,
  back,
  bell = false,
}: CourierPageHeaderProps) {
  return <PageHeader prefix="courier" title={title} eyebrow={eyebrow} back={back} bell={bell} />
}
