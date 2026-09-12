import { useMemo } from 'react'
import { useAppSelector } from './useAppStore'
import { selectCatalogItems } from '../store/slices/catalogSlice'
import { categoriesFrom, dealsFrom, popularFrom } from '../data/catalog'

export function useCatalog() {
  const items = useAppSelector(selectCatalogItems)
  return useMemo(() => ({
    items,
    deals: dealsFrom(items),
    popular: popularFrom(items),
    categories: categoriesFrom(items),
    getFood: (id: string) => items.find((item) => item.id === id),
  }), [items])
}
