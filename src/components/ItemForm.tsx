import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  createInventoryItem,
  createLocation,
  createProduct,
  getInventoryItem,
  getProducts,
  updateInventoryItem,
} from '../api/pantry'
import { useLocations } from '../hooks/useLocations'
import styles from './ItemForm.module.css'

interface FormState {
  name: string
  quantity: string
  unit: string
  locationId: string
  category: string
  expiryDate: string
  opened: boolean
}

const UNITS = ['unit', 'g', 'kg', 'ml', 'L', 'oz', 'lb', 'box', 'can', 'bag', 'bottle', 'jug', 'carton', 'cup']
const CATEGORIES = ['Dairy', 'Meat', 'Produce', 'Grains', 'Canned goods', 'Frozen', 'Beverages', 'Other']

function getDefaultState(locationId?: string): FormState {
  return {
    name: '',
    quantity: '1',
    unit: 'unit',
    locationId: locationId ?? '',
    category: '',
    expiryDate: '',
    opened: false,
  }
}

interface FieldWrapperProps {
  label: string
  error?: string
  last?: boolean
  children: ReactNode
}

function FieldWrapper({ label, error, last, children }: FieldWrapperProps) {
  return (
    <div className={`${styles.field} ${last ? styles.fieldLast : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}

export function ItemForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedLocationId = searchParams.get('locationId') ?? undefined

  const isEditing = Boolean(id)
  const itemId = id ? Number(id) : undefined

  const { locations, isLoading: isLocationsLoading, error: locationsError } = useLocations()

  const [form, setForm] = useState<FormState>(getDefaultState(preselectedLocationId))
  const [newLocationName, setNewLocationName] = useState('')
  const [isLoadingItem, setIsLoadingItem] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  useEffect(() => {
    if (!isEditing || !itemId) return
    const editItemId = itemId
    async function loadItem() {
      try {
        setSubmitError(null)
        const item = await getInventoryItem(editItemId)
        setForm({
          name: item.name,
          quantity: String(item.quantity),
          unit: item.unit,
          locationId: String(item.locationId),
          category: item.category ?? '',
          expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
          opened: item.opened,
        })
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to load item')
      } finally {
        setIsLoadingItem(false)
      }
    }
    void loadItem()
  }, [isEditing, itemId])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const selectedLocationId = form.locationId || preselectedLocationId || String(locations[0]?.id ?? '')

  function validate() {
    const nextErrors: Partial<FormState> = {}
    if (!form.name.trim()) nextErrors.name = 'Required'
    if (!form.quantity || Number(form.quantity) <= 0) nextErrors.quantity = 'Must be greater than 0'
    if (!selectedLocationId) nextErrors.locationId = 'Required'
    if (selectedLocationId === 'new' && !newLocationName.trim()) nextErrors.locationId = 'New location name is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function resolveLocationId() {
    if (selectedLocationId !== 'new') return Number(selectedLocationId)
    const createdLocation = await createLocation(newLocationName.trim())
    return createdLocation.id
  }

  async function resolveProductId() {
    const trimmedName = form.name.trim()
    const searchResults = await getProducts({ search: trimmedName })
    const existing = searchResults.find(
      (product) => product.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (existing) return existing.id

    const createdProduct = await createProduct({
      name: trimmedName,
      category: form.category.trim() || 'Other',
      barcode: '',
    })
    return createdProduct.id
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitError(null)
    setIsSaving(true)
    try {
      const locationId = await resolveLocationId()
      const quantity = Number(form.quantity)
      const payload = {
        locationId,
        quantity,
        unit: form.unit,
        expiryDate: form.expiryDate || undefined,
        opened: form.opened,
      }

      if (isEditing && itemId) {
        await updateInventoryItem(itemId, payload)
      } else {
        const productId = await resolveProductId()
        await createInventoryItem({ ...payload, productId })
      }
      navigate(-1)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLocationsLoading || isLoadingItem) {
    return <div className={styles.container}><p>Loading...</p></div>
  }
  if (locationsError) {
    return <div className={styles.container}><p>{locationsError}</p></div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate(-1)}>←</button>
        <h1 className={styles.title}>{isEditing ? 'Edit item' : 'Add item'}</h1>
        <button className={styles.saveBtn} onClick={() => void handleSubmit()} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Product</p>
        <div className={styles.card}>
          <FieldWrapper label="Name" error={errors.name}>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Whole milk"
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper label="Category" last>
            <select
              className={styles.select}
              value={form.category}
              onChange={(event) => set('category', event.target.value)}
            >
              <option value="">Select...</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </FieldWrapper>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Inventory</p>
        <div className={styles.card}>
          <FieldWrapper label="Quantity & unit" error={errors.quantity}>
            <div className={styles.qtyRow}>
              <input
                className={styles.qtyInput}
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => set('quantity', event.target.value)}
              />
              <select
                className={styles.select}
                value={form.unit}
                onChange={(event) => set('unit', event.target.value)}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </FieldWrapper>

          <FieldWrapper label="Location" error={errors.locationId}>
            <select
              className={styles.select}
              value={selectedLocationId}
              onChange={(event) => set('locationId', event.target.value)}
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
              <option value="new">+ New location</option>
            </select>
            {selectedLocationId === 'new' && (
              <div className={styles.newLocationField}>
                <label className={styles.fieldLabel}>New location name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Basement freezer"
                  value={newLocationName}
                  onChange={(event) => setNewLocationName(event.target.value)}
                />
              </div>
            )}
          </FieldWrapper>

          <FieldWrapper label="Expiry date">
            <input
              className={styles.input}
              type="date"
              value={form.expiryDate}
              onChange={(event) => set('expiryDate', event.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper label="Opened" last>
            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggle} ${form.opened ? styles.toggleOn : ''}`}
                onClick={() => set('opened', !form.opened)}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </FieldWrapper>
        </div>
      </div>

      {submitError && <p>{submitError}</p>}
    </div>
  )
}
