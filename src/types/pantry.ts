
export type ExpiryStatus = 'expired' | 'expiring' | 'ok'

export interface Location{
    id:     number
    name: string 
}

export interface InventoryItem {
    id:                 number
    productId:          number
    name:               string 
    locationId:         number 
    locationName:       string
    category?:          string
    quantity:           number
    unit:               string 
    expiryDate?:        string
    daysUntilExpiry?:   number
    opened:             boolean
    expiryStatus:       ExpiryStatus
}