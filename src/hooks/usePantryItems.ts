import { useMemo, useState } from 'react'
import { useInventory } from './useInventory'

export type FilterType = 'all' | 'expiring' | 'low'

export function usePantryItems(locationId?: number) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [category, setCategory] = useState<string | null>(null)
  const { items: sourceItems, isLoading, error, refetch } = useInventory(locationId)

  const items = useMemo(() => sourceItems.filter(item => {
    if (locationId && item.locationId !== locationId) return false
    if (filter === 'expiring') return item.expiryStatus === 'expiring' || item.expiryStatus === 'expired'
    if (filter === 'low') return item.quantity <= 1
    if (category && item.category !== category) return false
    return true
  }), [sourceItems, locationId, filter, category])

  const categories = useMemo(() =>
    [...new Set(
      sourceItems
      .filter(item => locationId ? item.locationId === locationId : true)
      .map(item => item.category)
      .filter(Boolean)
    )] as string[]
  , [sourceItems, locationId])

  return { items, filter, setFilter, category, setCategory, categories, isLoading, error, refetch }
}
