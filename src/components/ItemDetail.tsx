import { useParams, useNavigate } from "react-router-dom"
import type { InventoryItem } from "../types/pantry"
import styles from './ItemDetail.module.css'

import { MOCK_ITEMS } from "../hooks/usePantryItems"

function getItem(id: string | undefined): InventoryItem | undefined {
    if (!id) return undefined
    return MOCK_ITEMS.find((i) => i.id === Number(id))
}

// --- JSX ---
function NavigateBack() {
    const navigate = useNavigate()
    return (
        <button className={styles.iconBtn} 
            onClick={() => navigate('/')}>← 
        </button>     
    )
}

function NoItemFound() {
    return (
        <div className={styles.container}>
            <NavigateBack/>
            <p> Item not found </p>
        </div>    
    )
}

function Header({item} : {item : InventoryItem}) {
    /* Header — location label above item name, back button left, edit right */
    return (
        <div className={styles.header}>
            <NavigateBack/>
            <div className={styles.headerText} >
                <p className={styles.locationLabel}>{item.locationName}</p>
                <h1 className={styles.title} >{item.name}</h1>
            </div>
            <div style={{ width: 36, flexShrink: 0 }} /> 
        </div>
    )
}

function ExpiryBanner({item} : {item : InventoryItem}) {
    /* Expiry warning banner — only shown when expiring or expired */
    return (
        <>
            {item.expiryStatus === 'expiring' ? 
            <div className={styles.bannerWarning}>
                Expires in {item.daysUntilExpiry} day{item.daysUntilExpiry === 1 ? '' : 's'} — use soon
            </div> : null 
            }
            {item.expiryStatus === 'expired' ? 
            <div className={styles.bannerExpired}>
                This item has expired
            </div> : null
            }
        </>
    )

}

function StatGrid({item} : {item : InventoryItem}) {
    /* Stat grid — key inventory details at a glance */
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
                    : '—'}
                </p>
            </div>
            <div className={styles.statCard}>
                <p className={styles.statLabel}>Category</p>
                <p className={styles.statValue}>{item.category ?? '—'}</p>
            </div>
        </div>
    )
}

function AlsoInStock({item} : {item : InventoryItem}) {
    /* Also in stock — other inventory entries for the same product */
    const navigate = useNavigate()
    const others = MOCK_ITEMS.filter(i => i.productId === item.productId && i.id !== item.id)
    if (others.length === 0) return null
    return (
        <div className={styles.section}>
            <p className={styles.sectionLabel}>Also in stock</p>
`            <div className={styles.card}>
                {others.map((other, i) => (
                <div
                    key={other.id}
                    className={`${styles.row} ${i === others.length - 1 ? styles.rowLast : ''}`}
                    onClick={() => navigate(`/item/${other.id}`)}
                >
                    <div>
                    <p className={styles.rowPrimary}>{other.locationName}</p>
                    <p className={styles.rowSub}>{other.quantity} {other.unit} · {other.opened ? 'opened' : 'sealed'}</p>
                    </div>
                    <span className={styles.chevron}>›</span>
                </div>
                ))}
            </div>`
        </div>
    )


}

function Actions({item} : {item : InventoryItem}) {
    /* Actions */
    const navigate = useNavigate()
    return (
        <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => {
            // TODO: DELETE to Go API
            console.log('marking finished:', item.id)
            navigate(-1)
            }}>
            Mark finished
            </button>
            <button className={styles.actionBtn} onClick={() => navigate(`/item/${id}/edit`)}>
                Edit item
            </button>
        </div>
    )
}

export function ItemDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const item = getItem(id)

    if (!item) return <NoItemFound/>

    return (
        <div  className={styles.container}>
            <Header         item={item}/>
            <ExpiryBanner   item={item}/>
            <StatGrid       item={item}/>
            <AlsoInStock    item={item}/>
            <Actions        item={item}/>
        </div>
    )
}