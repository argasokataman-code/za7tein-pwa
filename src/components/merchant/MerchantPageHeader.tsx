import { PageHeader } from '../ui/PageHeader'

interface MerchantPageHeaderProps {
  title: string
  eyebrow?: string
  back?: string | boolean
  /** Lonceng inbox peran. Default mati; hanya beranda akar yang menyalakannya. */
  bell?: boolean
}

/**
 * Header halaman merchant. Selubung tipis di atas `PageHeader`: struktur dan
 * perilakunya sama dengan header kurir dan panel CS, hanya kelasnya yang
 * berbeda. Sebelumnya ketiganya tiga salinan identik.
 *
 * Tidak ada slot aksi di kanan: aksi utama halaman (mis. "Buat kode promo")
 * tinggal di zona jempol, bukan di pojok kanan atas header.
 */
export function MerchantPageHeader({
  title,
  eyebrow,
  back,
  bell = false,
}: MerchantPageHeaderProps) {
  return (
    <PageHeader prefix="merchant" title={title} eyebrow={eyebrow} back={back} bell={bell} />
  )
}
