import { useCallback, useEffect, useState } from 'react'
import type { Location } from '../types/pantry'
import { getLocations } from '../api/pantry'

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
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
        const data = await getLocations()
        if (isCancelled) return
        setLocations(data)
        setError(null)
      } catch (err) {
        if (isCancelled) return
        setError(err instanceof Error ? err.message : 'Failed to fetch locations')
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
  }, [reloadToken])

  return { locations, isLoading, error, refetch }
}
