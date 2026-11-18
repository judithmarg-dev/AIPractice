// Shape of the store data synced with Supabase, the seed used to fill an empty database,
// the migration from older saved shapes, and the local order draft.
import type { Booking } from '@/types/booking'
import type { Category, OptionItem, Product, Settings } from '@/types/models'
import { DEFAULT_SETTINGS, buildSeedCatalog, migrateLegacyItems, type LegacyItem } from './seed'
import { emptyDraft, initialOrderState, type Draft, type OrderState } from './slices/orderSlice'

export const STATE_VERSION = 1

export interface PersistedState {
  inventory: Product[]
  categories: Category[]
  options: OptionItem[]
  order: OrderState
  bookings: { items: Booking[] }
  settings: Settings
}

export function seedPersisted(): PersistedState {
  const catalog = buildSeedCatalog()
  return {
    inventory: catalog.products,
    categories: catalog.categories,
    options: catalog.options,
    order: { ...initialOrderState, draft: emptyDraft() },
    bookings: { items: [] },
    settings: { ...DEFAULT_SETTINGS },
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const asArray = <T,>(v: unknown): T[] | undefined => (Array.isArray(v) ? (v as T[]) : undefined)

/**
 * Turns whatever was stored into the current shape. Version 0 is the pre-persistence
 * in-memory shape (snake_case items priced in dollars); later versions migrate step by step.
 */
export function migrate(raw: unknown): PersistedState | null {
  if (!isObject(raw)) return null
  const seed = seedPersisted()
  const version = typeof raw.version === 'number' ? raw.version : 0
  if (version > STATE_VERSION) return null

  const categories = asArray<Category>(raw.categories) ?? seed.categories
  const options = asArray<OptionItem>(raw.options) ?? seed.options
  const items = asArray<LegacyItem>(raw.inventory)
  // Products always pass through the legacy migration: it is idempotent for current products and
  // moves any product with an unknown category to "Otros" (RF-1.6).
  const catalog = items
    ? migrateLegacyItems(items, categories, options)
    : { products: seed.inventory, categories, options }

  const savedOrder = isObject(raw.order) ? raw.order : {}
  const order: OrderState = {
    ...seed.order,
    ...(version >= 1 ? (savedOrder as Partial<OrderState>) : {}),
  }
  if (typeof savedOrder.nextNumber === 'number') order.nextNumber = savedOrder.nextNumber
  if (!isObject(order.draft) || !Array.isArray(order.draft.lines)) order.draft = emptyDraft()
  if (!Array.isArray(order.orders)) order.orders = []

  const bookings = isObject(raw.bookings) ? asArray<Booking>(raw.bookings.items) : undefined

  return {
    inventory: catalog.products,
    categories: catalog.categories,
    options: catalog.options,
    order,
    bookings: { items: bookings ?? [] },
    settings: { ...DEFAULT_SETTINGS, ...(isObject(raw.settings) ? (raw.settings as Partial<Settings>) : {}) },
  }
}

// ── Order draft: the only state kept in this browser; the rest lives in Supabase ──

export const DRAFT_KEY = 'ics-draft-v1'

export function readDraft(): Draft | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null')
    if (!isObject(raw) || !Array.isArray(raw.lines)) return null
    return { ...emptyDraft(), ...(raw as Partial<Draft>) }
  } catch {
    return null
  }
}

/** False when storage is unavailable or full; the draft keeps working in memory. */
export function writeDraft(draft: Draft): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}
