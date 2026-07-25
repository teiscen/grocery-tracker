import { apiRequest } from './client'
import type { InventoryItem, Location, Product } from '../types/pantry'

type InventoryWritePayload = {
  locationId: number
  quantity: number
  unit: string
  expiryDate?: string
  opened: boolean
}

type InventoryCreatePayload = InventoryWritePayload & {
  productId: number
}

export function getLocations() {
  return apiRequest<Location[]>('/api/location')
}

export function createLocation(name: string) {
  return apiRequest<Location>('/api/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function deleteLocation(id: number) {
  return apiRequest<void>(`/api/location/${id}`, { method: 'DELETE' })
}

export function getInventory(locationId?: number) {
  const url = locationId
    ? `/api/inventory?locationId=${locationId}`
    : '/api/inventory'
  return apiRequest<InventoryItem[]>(url)
}

export function getInventoryItem(id: number) {
  return apiRequest<InventoryItem>(`/api/inventory/${id}`)
}

export function createInventoryItem(payload: InventoryCreatePayload) {
  return apiRequest<InventoryItem>('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateInventoryItem(id: number, payload: InventoryWritePayload) {
  return apiRequest<InventoryItem>(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteInventoryItem(id: number) {
  return apiRequest<void>(`/api/inventory/${id}`, { method: 'DELETE' })
}

type ProductSearchParams = {
  search?: string
  barcode?: string
}

export function getProducts(params?: ProductSearchParams) {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  if (params?.barcode) searchParams.set('barcode', params.barcode)
  const query = searchParams.toString()
  const url = query ? `/api/product?${query}` : '/api/product'
  return apiRequest<Product[]>(url)
}

export function createProduct(input: { name: string; category: string; barcode?: string }) {
  return apiRequest<Product>('/api/product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      category: input.category,
      barcode: input.barcode ?? '',
    }),
  })
}
