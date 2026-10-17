// Seed catalog and the migration from the legacy item shape (dollars, snake_case, free-text container).
import flavorsData from '@/data/flavors.json'
import { isIconId, type IconId } from '@/components/icons'
import { normalizeName } from '@/lib/texts'
import { toCents } from '@/lib/money'
import type { Category, OptionItem, OptionKind, Product, Settings } from '@/types/models'

export const DEFAULT_SETTINGS: Settings = {
  ivaPercent: 10,
  deliverySurchargeCents: 30,
  lowStockThreshold: 5,
  maxScoops: 3,
  queueAmberMinutes: 15,
  queueRedMinutes: 30,
}

export const OTHER_CATEGORY_ID = 'otros'

export const SEED_CATEGORIES: Category[] = [
  { id: 'artesanal', name: 'Artesanales', icon: 'cone', order: 0, buildable: true, protected: true, archived: false },
  { id: 'paleta', name: 'Paletas', icon: 'popsicle', order: 1, buildable: false, archived: false },
  { id: 'milkshake', name: 'Milkshakes', icon: 'shake', order: 2, buildable: false, archived: false },
  { id: 'bebida', name: 'Bebidas', icon: 'coffee', order: 3, buildable: false, archived: false },
]

function seedOption(kind: OptionKind, id: string, name: string, icon: IconId, priceCents: number, costCents: number): OptionItem {
  return { id, kind, name, icon, priceCents, costCents, available: true, example: true }
}

export const SEED_OPTIONS: OptionItem[] = [
  seedOption('envase', 'barquillo-dulce', 'Barquillo dulce', 'waffle', 50, 12),
  seedOption('envase', 'barquillo-salado', 'Barquillo salado', 'waffle', 50, 12),
  seedOption('envase', 'vaso-carton', 'Vaso de cartón', 'cup', 0, 5),
  seedOption('envase', 'vaso-compostable-500', 'Vaso compostable 500 ml', 'cup', 30, 10),
  seedOption('extra', 'salsa-chocolate', 'Salsa de chocolate', 'sauce', 40, 10),
  seedOption('extra', 'crema-batida', 'Crema batida', 'cream', 50, 12),
  seedOption('extra', 'galleta', 'Galleta', 'cookie', 60, 15),
  seedOption('topping', 'chispas', 'Chispas', 'sprinkles', 30, 5),
  seedOption('topping', 'nueces', 'Nueces', 'nut', 30, 10),
  seedOption('topping', 'grageas', 'Grageas', 'candy', 30, 5),
]

/** Seed stock and unit cost per product id (the JSON keeps the legacy shape on purpose). */
const SEED_EXTRAS: Record<string, { stock: number; costCents: number }> = {
  'pistacho-siciliano': { stock: 10, costCents: 95 },
  'dulce-de-leche': { stock: 10, costCents: 80 },
  'chocolate-intenso': { stock: 0, costCents: 90 },
  'fresa-del-huerto': { stock: 4, costCents: 75 },
  'paleta-maracuya': { stock: 12, costCents: 110 },
  'paleta-mango-chile': { stock: 8, costCents: 115 },
  'batido-pistacho-belga': { stock: 15, costCents: 240 },
  'batido-oreo': { stock: 15, costCents: 210 },
  'limonada-menta': { stock: 20, costCents: 60 },
  'cafe-helado': { stock: 20, costCents: 85 },
}

/** Any item shape the app has stored before: legacy `IceCream`, `flavors.json` entries or `Product`. */
export type LegacyItem = Record<string, unknown>

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v : undefined)
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
const squash = (name: string) => normalizeName(name).replace(/\s/g, '')

function guessContainerIcon(name: string): IconId {
  const key = normalizeName(name)
  if (key.includes('barquillo')) return 'waffle'
  if (key.includes('paleta')) return 'popsicle'
  if (key.includes('canasta')) return 'basket'
  return 'cup'
}

/**
 * Converts legacy items into products. Free-text containers become catalog envases with
 * price 0 (or reuse a catalog envase with the same name); unknown categories go to "Otros".
 */
export function migrateLegacyItems(
  items: LegacyItem[],
  categoriesIn: Category[],
  optionsIn: OptionItem[]
): { products: Product[]; categories: Category[]; options: OptionItem[] } {
  const categories = [...categoriesIn]
  const options = [...optionsIn]
  const products: Product[] = []
  const now = new Date().toISOString()

  const containerIdFor = (text: string): string => {
    const existing = options.find((o) => o.kind === 'envase' && squash(o.name) === squash(text))
    if (existing) return existing.id
    const id = `envase-${squash(text).replace(/[^a-z0-9]/g, '') || crypto.randomUUID()}`
    options.push({ id, kind: 'envase', name: text.trim(), icon: guessContainerIcon(text), priceCents: 0, available: true })
    return id
  }

  const categoryIdFor = (raw: string | undefined): string => {
    if (raw && categories.some((c) => c.id === raw)) return raw
    if (!categories.some((c) => c.id === OTHER_CATEGORY_ID)) {
      const order = categories.reduce((max, c) => Math.max(max, c.order), -1) + 1
      categories.push({ id: OTHER_CATEGORY_ID, name: 'Otros', icon: 'grid', order, buildable: false, archived: false })
    }
    return OTHER_CATEGORY_ID
  }

  for (const item of items) {
    const id = str(item.id) ?? crypto.randomUUID()
    const priceCents = num(item.priceCents) ?? toCents(num(item.price) ?? 0)
    const containerText = str(item.container)
    const defaultContainerId =
      str(item.defaultContainerId) ?? (containerText ? containerIdFor(containerText) : undefined)
    products.push({
      id,
      name: str(item.name) ?? 'Producto sin nombre',
      description: typeof item.description === 'string' ? item.description : '',
      categoryId: categoryIdFor(str(item.categoryId) ?? str(item.category)),
      priceCents: Math.max(0, Math.round(priceCents)),
      costCents: num(item.costCents),
      stock: Math.max(0, Math.round(num(item.stock) ?? num(item.inventory_count) ?? num(item.inventoryCount) ?? 0)),
      image: str(item.image),
      color: str(item.color) ?? str(item.image_placeholder) ?? str(item.imagePlaceholder) ?? '#9ca3af',
      defaultContainerId,
      archived: item.archived === true,
      createdAt: str(item.createdAt) ?? str(item.created_at) ?? now,
    })
  }

  return { products, categories, options }
}

export interface CatalogSeed {
  products: Product[]
  categories: Category[]
  options: OptionItem[]
}

export function buildSeedCatalog(): CatalogSeed {
  const migrated = migrateLegacyItems(flavorsData as LegacyItem[], SEED_CATEGORIES, SEED_OPTIONS)
  return {
    ...migrated,
    products: migrated.products.map((p) => ({ ...p, ...SEED_EXTRAS[p.id] })),
    // Envases converted from the seed's free text get a cost so the demo profit is complete.
    options: migrated.options.map((o) => (o.costCents === undefined ? { ...o, costCents: 8 } : o)),
  }
}

export function sanitizeIcon(value: unknown, fallback: IconId): IconId {
  return isIconId(value) ? value : fallback
}

/** Catalog the store starts with (and returns to on reset). */
export const INITIAL_CATALOG: CatalogSeed = buildSeedCatalog()
