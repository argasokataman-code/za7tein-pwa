import type { AuthPhoto } from '../../types'

/**
 * Kepala layar masuk: satu foto penuh, berganti sendiri tanpa kedip.
 *
 * Kenapa bukan `AuthBanner`: banner itu menggeser track (translate), sedangkan
 * di sini foto berganti dengan *fade bertumpuk*. Slide baru memudar di atas
 * slide lama, dan slide lama tidak pernah memudar sendirian. Kalau itu terjadi,
 * dasar kepala menembus dan kepalanya berkedip (kejadian nyata di irisan HTML).
 * Karena itu foto pertama diduplikasi sebagai anak terakhir: saat siklus
 * berakhir, duplikatnya memudar di atas foto pertama yang identik, jadi tidak
 * ada celah sama sekali.
 *
 * Tidak ada state React dan tidak ada timer: seluruh fase diatur CSS
 * (`@keyframes`), jadi tidak ada `setInterval` yang harus dibersihkan dan
 * `prefers-reduced-motion` cukup mematikan animasinya.
 */
interface AuthCoverHeroProps {
  photos: readonly AuthPhoto[]
}

export function AuthCoverHero({ photos }: AuthCoverHeroProps) {
  const [first] = photos
  const slides = first ? [...photos, first] : []

  return (
    <header className="auth-cover" aria-hidden="true">
      {slides.map((photo, index) => (
        <img
          key={`${photo.src}-${index}`}
          className="auth-cover-slide"
          src={photo.src}
          alt=""
          width={photo.width}
          height={photo.height}
          decoding="async"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </header>
  )
}
