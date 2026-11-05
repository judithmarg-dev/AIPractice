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

export interface LineBuild {
  /** The first scoop is the base. */
  scoops: Snapshot[]
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
  queueAmberMinutes: number
  queueRedMinutes: number
}
