import { useNavigate, useParams } from 'react-router-dom'
import { usePantryItems, type FilterType } from '../hooks/usePantryItems'
import type { Location } from "../types/pantry"
import styles from './LocationView.module.css'

import { MOCK_LOCATIONS } from '../hooks/usePantryItems'






export function LocationView() {
    const { id } = useParams()
    const navigate = useNavigate()

    const locationId = id ? Number(id) : undefined
    const location = MOCK_LOCATIONS.find((l) => l.id === locationId)
    // const {items, filter, setFilter} = usePantryItems(locationId) 
    const { items, filter, setFilter, category, setCategory, categories } = usePantryItems(locationId)
   
    return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate('/')}>←</button>
        <h1 className={styles.title}>{location?.name ?? 'All items'}</h1>
          <button
            className={styles.iconBtn}
            onClick={() => navigate(`/add?locationId=${locationId}`)}
          >
            +
          </button>
      </div>

      <div className={styles.filterBar}>
        {['all', 'expiring', 'low'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(f as FilterType)}
          >
            {f}
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
          {categories.map(c => (
          <button
              key={c}
              className={`${styles.filterBtn} ${category === c ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(c)}
          >
              {c}
          </button>
          ))}
      </div>
      )}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>No items here</p>
        </div>
      ) : (
        items.map(item => (
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
            <p className={styles.itemSub}>{item.quantity} {item.unit} — {item.locationName}</p>
          </div>
        ))
      )}
    </div>
  )
}
