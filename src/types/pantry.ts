export type ExpiryStatus = 'expired' | 'expiring' | 'ok'

export interface Location {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  category?: string
  barcode?: string
}

export interface InventoryItem {
  id: number
  productId: number
  name: string
  category?: string
  barcode?: string
  locationId: number
  locationName: string
  quantity: number
  unit: string
  expiryDate?: string
  daysUntilExpiry?: number
  opened: boolean
  expiryStatus: ExpiryStatus
}
