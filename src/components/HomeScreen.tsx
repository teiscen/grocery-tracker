import { useNavigate } from 'react-router-dom'
import { MOCK_LOCATIONS } from '../hooks/usePantryItems'
import styles from './HomeScreen.module.css'

interface HomeScreenProps {
  onToggleTheme: () => void
  theme: 'light' | 'dark'
}

export function HomeScreen({ onToggleTheme, theme }: HomeScreenProps) {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Home</h1>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={() => navigate('/locations')}>⊞</button>
          <button className={styles.iconBtn} onClick={() => navigate('/add')}>+</button>
          <button className={styles.iconBtn} onClick={() => navigate('/scan')}>⊡</button>
          <button className={styles.iconBtn} onClick={onToggleTheme}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>

      {/* All items shortcut */}
      <div className={styles.card} onClick={() => navigate('/items')}>
        <p className={styles.cardTitle}>All items</p>
      </div>

      {/* Location list */}
      <p className={styles.sectionLabel}>Locations</p>
      {MOCK_LOCATIONS.map(location => (
        <div
          key={location.id}
          className={styles.card}
          onClick={() => navigate(`/location/${location.id}`)}
        >
          <p className={styles.cardTitle}>{location.name}</p>
        </div>
      ))}

    </div>
  )
}