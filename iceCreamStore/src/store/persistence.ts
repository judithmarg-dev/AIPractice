// Versioned localStorage persistence (RF-0.2).
import type { Booking } from '@/types/booking'
import type { Category, OptionItem, Product, Settings } from '@/types/models'
import { DEFAULT_SETTINGS, buildSeedCatalog, migrateLegacyItems, type LegacyItem } from './seed'
import { emptyDraft, initialOrderState, type OrderState } from './slices/orderSlice'

export const STORAGE_KEY = 'ics-state-v1'
export const STATE_VERSION = 1

export interface PersistedState {
  inventory: Product[]
  categories: Category[]
  options: OptionItem[]
  order: OrderState
  bookings: { items: Booking[] }
  settings: Settings
}

export const PERSISTED_KEYS = ['inventory', 'categories', 'options', 'order', 'bookings', 'settings'] as const

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

export function serialize(state: PersistedState): string {
  const data: Record<string, unknown> = { version: STATE_VERSION }
  for (const key of PERSISTED_KEYS) data[key] = state[key]
  return JSON.stringify(data)
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

export function parseStored(text: string | null): PersistedState | null {
  if (!text) return null
  try {
    return migrate(JSON.parse(text))
  } catch {
    return null
  }
}

export function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** False when storage is unavailable or full; the app keeps working in memory. */
export function writeStored(text: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, text)
    return true
  } catch {
    return false
  }
}
