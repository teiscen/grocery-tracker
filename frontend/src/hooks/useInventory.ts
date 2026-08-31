import { useCallback, useEffect, useState } from 'react'
import type { InventoryItem } from '../types/pantry'
import { getInventory } from '../api/pantry'

export function useInventory(locationId?: number) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setReloadToken((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function load() {
      try {
        const data = await getInventory(locationId)
        if (isCancelled) return
        setItems(data)
        setError(null)
      } catch (err) {
        if (isCancelled) return
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [locationId, reloadToken])

  return { items, isLoading, error, refetch }
}
