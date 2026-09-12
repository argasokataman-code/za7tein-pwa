import { Heart } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { toggleFavorite } from '../../store/slices/favoritesSlice'

interface FavoriteButtonProps {
  id: string
  name: string
  className?: string
}

export function FavoriteButton({ id, name, className = '' }: FavoriteButtonProps) {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((s) => s.favorites.ids.includes(id))

  return (
    <button
      type="button"
      className={`favorite-btn ${isFavorite ? 'active' : ''} ${className}`.trim()}
      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${name} ${isFavorite ? 'from' : 'to'} favorites`}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.stopPropagation()
        dispatch(toggleFavorite(id))
      }}
    >
      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  )
}
