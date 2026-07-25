import { useNavigate, useParams } from 'react-router-dom'
import { type FilterType, usePantryItems } from '../hooks/usePantryItems'
import { useLocations } from '../hooks/useLocations'
import styles from './LocationView.module.css'

export function LocationView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const locationId = id ? Number(id) : undefined
  const { locations } = useLocations()
  const { items, filter, setFilter, category, setCategory, categories, isLoading, error } = usePantryItems(locationId)
  const location = locations.find((entry) => entry.id === locationId)
  const filters: FilterType[] = ['all', 'expiring', 'low']

  if (isLoading) return <div className={styles.container}><p>Loading...</p></div>
  if (error) return <div className={styles.container}><p>{error}</p></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate('/')}>←</button>
        <h1 className={styles.title}>{location?.name ?? 'All items'}</h1>
        <button
          className={styles.iconBtn}
          onClick={() => navigate(locationId ? `/add?locationId=${locationId}` : '/add')}
        >
          +
        </button>
      </div>

      <div className={styles.filterBar}>
        {filters.map((currentFilter) => (
          <button
            key={currentFilter}
            className={`${styles.filterBtn} ${filter === currentFilter ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(currentFilter)}
          >
            {currentFilter}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${category === null ? styles.filterBtnActive : ''}`}
            onClick={() => setCategory(null)}
          >
            All
          </button>
          {categories.map((currentCategory) => (
            <button
              key={currentCategory}
              className={`${styles.filterBtn} ${category === currentCategory ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(currentCategory)}
            >
              {currentCategory}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>No items here</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className={styles.item} onClick={() => navigate(`/item/${item.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className={styles.itemName}>{item.name}</p>
              {item.expiryStatus === 'expiring' && (
                <span className={styles.badgeExpiring}>Expires in {item.daysUntilExpiry}d</span>
              )}
              {item.expiryStatus === 'expired' && (
                <span className={styles.badgeExpired}>Expired</span>
              )}
            </div>
            <p className={styles.itemSub}>{item.quantity} {item.unit} - {item.locationName}</p>
          </div>
        ))
      )}
    </div>
  )
}
