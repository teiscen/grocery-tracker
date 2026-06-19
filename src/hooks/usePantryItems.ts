import { useState } from 'react'
import type { InventoryItem } from '../types/pantry'

export const MOCK_ITEMS: InventoryItem[] = [
  {
    id: 1, productId: 1, name: 'Whole milk',
    category: 'Dairy', quantity: 1, unit: 'jug',
    expiryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    opened: true,
    locationId: 1, locationName: 'Kitchen fridge',
    expiryStatus: 'expiring', daysUntilExpiry: 2,
  },
  {
    id: 2, productId: 2, name: 'Cheddar cheese',
    quantity: 200, unit: 'g',
    expiryDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    opened: true,
    locationId: 1, locationName: 'Kitchen fridge',
    expiryStatus: 'ok', daysUntilExpiry: 12,
  },
  {
    id: 3, productId: 1, name: 'Whole milk',
    category: 'Dairy', quantity: 1, unit: 'jug',
    expiryDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    opened: false,
    locationId: 2, locationName: 'Garage fridge',
    expiryStatus: 'ok', daysUntilExpiry: 8,
  },
  {
    id: 4, productId: 3, name: 'Pasta',
    quantity: 3, unit: 'boxes',
    opened: false,
    locationId: 3, locationName: 'Pantry shelf 2',
    expiryStatus: 'ok',
  },
]

export const MOCK_LOCATIONS = [
  { id: 1, name: 'Kitchen fridge' },
  { id: 2, name: 'Garage fridge' },
  { id: 3, name: 'Pantry shelf 2' },
]

export type FilterType = 'all' | 'expiring' | 'low'

export function usePantryItems(locationId?: number) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [category, setCategory] = useState<string | null>(null)

  const filtered = MOCK_ITEMS.filter(item => {
    if (locationId && item.locationId !== locationId) return false
    if (filter === 'expiring') return item.expiryStatus === 'expiring' || item.expiryStatus === 'expired'
    if (filter === 'low') return item.quantity <= 1
    if (category && item.category !== category) return false
    return true
  })

  // Get unique categories from the current location's items
  const categories = [...new Set(
    MOCK_ITEMS
      .filter(item => locationId ? item.locationId === locationId : true)
      .map(item => item.category)
      .filter(Boolean)
  )] as string[]

  return { items: filtered, filter, setFilter, category, setCategory, categories }
}