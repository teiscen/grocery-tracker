import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_LOCATIONS } from '../hooks/usePantryItems'
import styles from './LocationsManager.module.css'

export function LocationsManager() {
  const navigate = useNavigate()

  // Copy MOCK_LOCATIONS into local state so we can mutate it
  const [locations, setLocations] = useState(MOCK_LOCATIONS)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  function handleDelete(id: number) {
    setLocations(prev => prev.filter(l => l.id !== id))
    // TODO: DELETE to Go API
  }

  function handleAdd() {
    if (!newName.trim()) return
    // Generate a temporary id — Go API will assign the real one
    const tempId = Math.max(...locations.map(l => l.id)) + 1
    setLocations(prev => [...prev, { id: tempId, name: newName.trim() }])
    // TODO: POST to Go API
    setNewName('')
    setShowAdd(false)
  }

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
            <button className={styles.deleteBtn} onClick={() => handleDelete(location.id)}>
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
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <button className={styles.confirmBtn} onClick={handleAdd}>✓</button>
          </div>
        )}
      </div>

      <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
        + Add location
      </button>
    </div>
  )
}