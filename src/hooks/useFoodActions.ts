import toast from 'react-hot-toast'

import { addItem } from '../store/slices/cartSlice'
import { selectCatalogItems } from '../store/slices/catalogSlice'
import { toggleFavorite } from '../store/slices/favoritesSlice'
import { useAppDispatch, useAppSelector } from './useAppStore'

/**
 * Cart / favourites helpers shared by the ported list screens, so their
 * `aria-label`-driven buttons can talk to the store without each page
 * re-implementing the lookup.
 */
export function useFoodActions() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCatalogItems)

  return {
    addToCart(id: string, quantity = 1) {
      const food = items.find((f) => f.id === id)
      if (!food) return
      dispatch(addItem({ food, quantity }))
      toast.success(`${food.name} added to cart`)
    },
    toggleFav(id: string) {
      dispatch(toggleFavorite(id))
    },
  }
}
