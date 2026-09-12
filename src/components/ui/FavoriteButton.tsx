import { Heart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { toggleFavorite } from '../../store/slices/favoritesSlice'

interface FavoriteButtonProps {
  id: string
  name: string
  /** Base class only — the card and header variants are styled separately. */
  className?: string
  size?: number
}

export function FavoriteButton({
  id,
  name,
  className = 'favorite-btn',
  size = 18,
}: FavoriteButtonProps) {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((s) => s.favorites.ids.includes(id))

  return (
    <button
      type="button"
      className={`${className}${isFavorite ? ' active' : ''}`}
      aria-label={`${isFavorite ? 'Hapus' : 'Tambah'} ${name} ${isFavorite ? 'dari' : 'ke'} favorit`}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.stopPropagation()
        dispatch(toggleFavorite(id))
      }}
    >
      <Heart size={size} strokeWidth={1.75} color="var(--on-brand)" fill={isFavorite ? 'var(--on-brand)' : 'none'} />
    </button>
  )
}
