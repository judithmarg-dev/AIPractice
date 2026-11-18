import type { IconId } from '@/components/icons'

export type { IconId }

export type OptionKind = 'envase' | 'extra' | 'topping'

export interface Category {
  id: string
  name: string
  icon: IconId
  order: number
  /** Products of this category are built scoop by scoop in the modal. */
  buildable: boolean
  /** Cannot be archived (Artesanales). */
  protected?: boolean
  archived: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  categoryId: string
  /** Per scoop when the category is buildable. */
  priceCents: number
  costCents?: number
  stock: number
  /** Compressed data URL. */
  image?: string
  /** Fallback swatch when there is no image. */
  color: string
  defaultContainerId?: string
  /** Scoop picture of an artisan flavor: id of a cell of the sprite sheets (lib/scoopSprites.ts). */
  sprite?: string
  archived: boolean
  createdAt: string
}

export interface OptionItem {
  id: string
  kind: OptionKind
  name: string
  icon: IconId
  priceCents: number
  costCents?: number
  available: boolean
  /** Seeded example, editable. */
  example?: boolean
}

/** Name, price and cost frozen when the line was added. */
export interface Snapshot {
  id: string
  name: string
  priceCents: number
  costCents?: number
}

/**
 * Artisan presentation with a fixed price: by weight (kilo / ½ kilo, whatever the number of flavors)
 * or a cone (`porcion`), priced by how many scoops it has (1, 2 or 3), not by adding them up.
 */
export interface PackSnapshot {
  kind: 'kilo' | 'medio' | 'porcion'
  label: string
  priceCents: number
}

export interface LineBuild {
  /** The first scoop is the base. */
  scoops: Snapshot[]
  /** Artisan line from the Porciones tab (cone, priced by scoop count) or Por peso (`pack`). */
  presentation?: 'porcion' | 'peso'
  pack?: PackSnapshot
  container?: Snapshot
  extras: Snapshot[]
  toppings: Snapshot[]
}

export interface OrderLine {
  lineId: string
  productId: string
  productName: string
  categoryId: string
  qty: number
  unitPriceCents: number
  unitCostCents?: number
  /** Display-only detail for non-buildable lines, e.g. the default container. */
  note?: string
  build?: LineBuild
}

export type OrderStatus = 'por_cobrar' | 'cobrado' | 'cancelado'
export type ServiceMode = 'presencial' | 'delivery'

export interface Order {
  id: string
  number: number
  status: OrderStatus
  mode: ServiceMode
  lines: OrderLine[]
  customer?: string
  note?: string
  address?: string
  createdAt: string
  chargedAt?: string
  cancelledAt?: string
  subtotalCents: number
  surchargeCents: number
  ivaCents: number
  totalCents: number
  demo?: boolean
}

export interface Settings {
  ivaPercent: number
  deliverySurchargeCents: number
  lowStockThreshold: number
  maxScoops: number
  /** Fixed prices of the Por peso presentation. */
  kiloPriceCents: number
  halfKiloPriceCents: number
  /** Fixed prices of the Porciones presentation (Helados artesanales) by scoop count: 1, 2 and 3 scoops. */
  oneScoopPriceCents: number
  twoScoopsPriceCents: number
  threeScoopsPriceCents: number
  queueAmberMinutes: number
  queueRedMinutes: number
}
