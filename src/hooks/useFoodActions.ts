import toast from 'react-hot-toast'

import { foods } from '../data/foods'
import { addItem } from '../store/slices/cartSlice'
import { toggleFavorite } from '../store/slices/favoritesSlice'
import { useAppDispatch } from './useAppStore'

/**
 * Cart / favourites helpers shared by the ported list screens, so their
 * `aria-label`-driven buttons can talk to the store without each page
 * re-implementing the lookup.
 */
export function useFoodActions() {
  const dispatch = useAppDispatch()

  return {
    addToCart(id: string, quantity = 1) {
      const food = foods.find((f) => f.id === id)
      if (!food) return
      dispatch(addItem({ food, quantity }))
      toast.success(`${food.name} added to cart`)
    },
    toggleFav(id: string) {
      dispatch(toggleFavorite(id))
    },
  }
}
