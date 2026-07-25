import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLocation, deleteLocation } from '../api/pantry'
import { useLocations } from '../hooks/useLocations'
import styles from './LocationsManager.module.css'

export function LocationsManager() {
  const navigate = useNavigate()
  const { locations, isLoading, error, refetch } = useLocations()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleDelete(id: number) {
    try {
      setSaveError(null)
      await deleteLocation(id)
      refetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete location')
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return
    try {
      setSaveError(null)
      setIsSaving(true)
      await createLocation(newName.trim())
      refetch()
      setNewName('')
      setShowAdd(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create location')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className={styles.container}><p>Loading...</p></div>
  if (error) return <div className={styles.container}><p>{error}</p></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate('/')}>←</button>
        <h1 className={styles.title}>Locations</h1>
        <div style={{ width: 36 }} />
      </div>

      <div className={styles.card}>
        {locations.map((location, i) => (
          <div
            key={location.id}
            className={`${styles.row} ${i === locations.length - 1 && !showAdd ? styles.rowLast : ''}`}
          >
            <p className={styles.locationName}>{location.name}</p>
            <button className={styles.deleteBtn} onClick={() => void handleDelete(location.id)}>
              ✕
            </button>
          </div>
        ))}

        {showAdd && (
          <div className={`${styles.row} ${styles.rowLast}`}>
            <input
              className={styles.newInput}
              type="text"
              placeholder="Location name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleAdd()}
              autoFocus
            />
            <button className={styles.confirmBtn} onClick={() => void handleAdd()} disabled={isSaving}>
              {isSaving ? '…' : '✓'}
            </button>
          </div>
        )}
      </div>

      {saveError && <p>{saveError}</p>}

      <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
        + Add location
      </button>
    </div>
  )
}