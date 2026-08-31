import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteInventoryItem, getInventory, getInventoryItem } from '../api/pantry'
import type { InventoryItem } from '../types/pantry'
import styles from './ItemDetail.module.css'

function NavigateBack() {
  const navigate = useNavigate()
  return (
    <button className={styles.iconBtn} onClick={() => navigate(-1)}>←</button>
  )
}

function Header({ item }: { item: InventoryItem }) {
  return (
    <div className={styles.header}>
      <NavigateBack />
      <div className={styles.headerText}>
        <p className={styles.locationLabel}>{item.locationName}</p>
        <h1 className={styles.title}>{item.name}</h1>
      </div>
      <div style={{ width: 36, flexShrink: 0 }} />
    </div>
  )
}

function ExpiryBanner({ item }: { item: InventoryItem }) {
  return (
    <>
      {item.expiryStatus === 'expiring' && (
        <div className={styles.bannerWarning}>
          Expires in {item.daysUntilExpiry} day{item.daysUntilExpiry === 1 ? '' : 's'} - use soon
        </div>
      )}
      {item.expiryStatus === 'expired' && (
        <div className={styles.bannerExpired}>This item has expired</div>
      )}
    </>
  )
}

function StatGrid({ item }: { item: InventoryItem }) {
  return (
    <div className={styles.grid}>
      <div className={styles.statCard}>
        <p className={styles.statLabel}>Quantity</p>
        <p className={styles.statValue}>
          {item.quantity} <span className={styles.statUnit}>{item.unit}</span>
        </p>
      </div>
      <div className={styles.statCard}>
        <p className={styles.statLabel}>Status</p>
        <p className={styles.statValue}>{item.opened ? 'Opened' : 'Sealed'}</p>
      </div>
      <div className={styles.statCard}>
        <p className={styles.statLabel}>Expires</p>
        <p className={styles.statValue}>
          {item.expiryDate
            ? new Date(item.expiryDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
            : '-'}
        </p>
      </div>
      <div className={styles.statCard}>
        <p className={styles.statLabel}>Category</p>
        <p className={styles.statValue}>{item.category ?? '-'}</p>
      </div>
    </div>
  )
}

function AlsoInStock({ currentItem, items }: { currentItem: InventoryItem; items: InventoryItem[] }) {
  const navigate = useNavigate()
  const others = items.filter((item) => item.productId === currentItem.productId && item.id !== currentItem.id)

  if (others.length === 0) return null

  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>Also in stock</p>
      <div className={styles.card}>
        {others.map((other, index) => (
          <div
            key={other.id}
            className={`${styles.row} ${index === others.length - 1 ? styles.rowLast : ''}`}
            onClick={() => navigate(`/item/${other.id}`)}
          >
            <div>
              <p className={styles.rowPrimary}>{other.locationName}</p>
              <p className={styles.rowSub}>
                {other.quantity} {other.unit} - {other.opened ? 'opened' : 'sealed'}
              </p>
            </div>
            <span className={styles.chevron}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Actions({
  item,
  onDelete,
  isDeleting,
}: {
  item: InventoryItem
  onDelete: () => Promise<void>
  isDeleting: boolean
}) {
  const navigate = useNavigate()
  return (
    <div className={styles.actions}>
      <button className={styles.actionBtn} onClick={() => void onDelete()} disabled={isDeleting}>
        {isDeleting ? 'Removing...' : 'Mark finished'}
      </button>
      <button className={styles.actionBtn} onClick={() => navigate(`/item/${item.id}/edit`)}>
        Edit item
      </button>
    </div>
  )
}

export function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const itemId = id ? Number(id) : undefined

  const [item, setItem] = useState<InventoryItem | null>(null)
  const [allItems, setAllItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) return
    const currentItemId = itemId

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [itemData, inventoryData] = await Promise.all([
          getInventoryItem(currentItemId),
          getInventory(),
        ])
        setItem(itemData)
        setAllItems(inventoryData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [itemId])

  const content = useMemo(() => {
    if (!itemId) return <p>Invalid item id</p>
    if (isLoading) return <p>Loading...</p>
    if (error) return <p>{error}</p>
    if (!item) return <p>Item not found</p>

    return (
      <>
        <Header item={item} />
        <ExpiryBanner item={item} />
        <StatGrid item={item} />
        <AlsoInStock currentItem={item} items={allItems} />
        <Actions
          item={item}
          isDeleting={isDeleting}
          onDelete={async () => {
            if (!item) return
            try {
              setIsDeleting(true)
              await deleteInventoryItem(item.id)
              navigate(-1)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to delete item')
            } finally {
              setIsDeleting(false)
            }
          }}
        />
      </>
    )
  }, [allItems, error, isDeleting, isLoading, item, itemId, navigate])

  return <div className={styles.container}>{content}</div>
}
