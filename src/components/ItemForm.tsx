import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { MOCK_ITEMS, MOCK_LOCATIONS } from '../hooks/usePantryItems'
import type { InventoryItem } from '../types/pantry'
import styles from './ItemForm.module.css'

// ── Form state type ───────────────────────────────────────────────────────────
// All fields are strings except opened — inputs always return strings,
// so we store them as strings and convert when submitting
interface FormState {
  name: string
  quantity: string
  unit: string
  locationId: string
  category: string
  expiryDate: string
  opened: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────
// Defined outside the component so they aren't recreated on every render
const UNITS = ['unit', 'g', 'kg', 'ml', 'L', 'oz', 'lb', 'box', 'can', 'bag', 'bottle', 'jug', 'carton', 'cup']
const CATEGORIES = ['Dairy', 'Meat', 'Produce', 'Grains', 'Canned goods', 'Frozen', 'Beverages', 'Other']

// ── Initial state builder ─────────────────────────────────────────────────────
// Called once when the component mounts. If an existing item is passed,
// prepopulate the form with its data (edit mode). Otherwise return empty
// defaults (add mode). defaultLocationId comes from the URL query param
// when navigating here from a specific location view.
function getInitialState(existing: InventoryItem | undefined, defaultLocationId?: string): FormState {
  if (existing) {
    return {
      name: existing.name,
      quantity: String(existing.quantity),
      unit: existing.unit,
      locationId: String(existing.locationId),
      category: existing.category ?? '',
      // Convert ISO date string to YYYY-MM-DD format that <input type="date"> expects
      expiryDate: existing.expiryDate
        ? new Date(existing.expiryDate).toISOString().split('T')[0]
        : '',
      opened: existing.opened,
    }
  }
  return {
    name: '',
    quantity: '1',
    unit: 'unit',
    // Use preselected location from URL param, or fall back to first location
    locationId: defaultLocationId ?? String(MOCK_LOCATIONS[0].id),
    category: '',
    expiryDate: '',
    opened: false,
  }
}

// ── FieldWrapper ──────────────────────────────────────────────────────────────
// Wraps every form field with a consistent label, border, and optional error.
// children is whatever input/select goes inside — React.ReactNode accepts any JSX
interface FieldWrapperProps {
  label: string
  error?: string
  last?: boolean         // removes bottom border on the last field in a card
  children: React.ReactNode
}

function FieldWrapper({ label, error, last, children }: FieldWrapperProps) {
  return (
    <div className={`${styles.field} ${last ? styles.fieldLast : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
      {/* Only renders if error string is present */}
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}

// ── FormHeader ────────────────────────────────────────────────────────────────
// Back arrow left, title center, save button right
// Receives isEditing to know which title to show, onSave to trigger validation
interface FormHeaderProps {
  isEditing: boolean
  onSave: () => void
}

function FormHeader({ isEditing, onSave }: FormHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className={styles.header}>
      <button className={styles.iconBtn} onClick={() => navigate(-1)}>←</button>
      <h1 className={styles.title}>{isEditing ? 'Edit item' : 'Add item'}</h1>
      <button className={styles.saveBtn} onClick={onSave}>Save</button>
    </div>
  )
}

// ── ProductSection ────────────────────────────────────────────────────────────
// Name and category fields
interface SectionProps {
  form: FormState
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  errors: Partial<FormState>
}

function ProductSection({ form, set, errors }: SectionProps) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>Product</p>
      <div className={styles.card}>

        <FieldWrapper label="Name" error={errors.name}>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Whole milk"
            value={form.name}
            onChange={e => set('name', e.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper label="Category" last>
          {/* appearance: none in CSS removes the default browser arrow on select */}
          <select
            className={styles.select}
            value={form.category}
            onChange={e => set('category', e.target.value)}
          >
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FieldWrapper>

      </div>
    </div>
  )
}

// ── LocationPicker ────────────────────────────────────────────────────────────
interface LocationPickerProps {
  locationId: string
  onChange: (id: string) => void
}

function LocationPicker({ locationId, onChange }: LocationPickerProps) {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  return (
    <>
      <select
        className={styles.select}
        value={locationId}
        onChange={e => {
          if (e.target.value === 'new') {
            setShowNew(true)
          } else {
            onChange(e.target.value)
            setShowNew(false)
          }
        }}
      >
        {MOCK_LOCATIONS.map(l => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
        <option value="new">+ New location</option>
      </select>

      {showNew && (
        <div className={styles.newLocationField}>
          <label className={styles.fieldLabel}>New location name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Basement freezer"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
        </div>
      )}
    </>
  )
}

// ── InventorySection ──────────────────────────────────────────────────────────
// Quantity, unit, location, expiry, opened fields
interface InventorySectionProps extends SectionProps {
  newLocation: string
  setNewLocation: (v: string) => void
  showNewLocation: boolean
  setShowNewLocation: (v: boolean) => void
}

function InventorySection({ form, set, errors }: SectionProps) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>Inventory</p>
      <div className={styles.card}>

        <FieldWrapper label="Quantity & unit" error={errors.quantity}>
          <div className={styles.qtyRow}>
            <input className={styles.qtyInput} type="number" min="0"
              value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            <select className={styles.select} value={form.unit}
              onChange={e => set('unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </FieldWrapper>

        <FieldWrapper label="Location">
          <LocationPicker locationId={form.locationId} onChange={id => set('locationId', id)} />
        </FieldWrapper>

        <FieldWrapper label="Expiry date">
          <input className={styles.input} type="date"
            value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
        </FieldWrapper>

        <FieldWrapper label="Opened" last>
          <div className={styles.toggleRow}>
            <button
              className={`${styles.toggle} ${form.opened ? styles.toggleOn : ''}`}
              onClick={() => set('opened', !form.opened)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </FieldWrapper>

      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ItemForm() {
  // id is present in the URL when editing (/item/:id/edit), absent when adding (/add)
  const { id } = useParams()
  const navigate = useNavigate()

  // useSearchParams reads the ?key=value part of the URL
  // e.g. /add?locationId=2 → searchParams.get('locationId') === '2'
  const [searchParams] = useSearchParams()
  const preselectedLocationId = searchParams.get('locationId')

  // Determine mode — if id exists in URL we're editing, otherwise adding
  const isEditing = Boolean(id)
  const existing = isEditing ? MOCK_ITEMS.find(i => i.id === Number(id)) : undefined

  // Form state — single object for all fields
  // null → undefined conversion because searchParams.get returns null when missing
  // but getInitialState expects undefined
  const [form, setForm] = useState<FormState>(
    getInitialState(existing, preselectedLocationId ?? undefined)
  )

  // Controls whether the new location input is visible
  const [newLocation, setNewLocation] = useState('')
  const [showNewLocation, setShowNewLocation] = useState(false)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  // ── Generic field updater ─────────────────────────────────────────────────
  // K extends keyof FormState ensures the key and value types always match —
  // you can't accidentally pass a boolean to a string field
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  // TODO: POST to Go API for add, PUT for edit
  // navigate(-1) goes back one step in browser history — works correctly
  // whether you came from home, a location view, or item detail
  function handleSubmit() {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Must be greater than 0'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    console.log('Submitting:', form)
    navigate(-1)
  }

  return (
    <div className={styles.container}>
      <FormHeader isEditing={isEditing} onSave={handleSubmit} />
      <ProductSection form={form} set={set} errors={errors} />
      <InventorySection
        form={form}
        set={set}
        errors={errors}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        showNewLocation={showNewLocation}
        setShowNewLocation={setShowNewLocation}
      />
    </div>
  )
}