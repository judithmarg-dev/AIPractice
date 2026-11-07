// Maps the app's camelCase models to the snake_case rows of supabase/migrations/001_initial.sql.
import type { Booking } from '@/types/booking'
import type { Category, IconId, OptionItem, Order, Product, Settings } from '@/types/models'

type Row = Record<string, unknown>

const opt = <T,>(v: T | null | undefined): T | undefined => (v === null ? undefined : v)

/** Postgres returns timestamps as "+00:00"; the app compares ISO strings, so normalize to "Z". */
const iso = (v: unknown): string | undefined => (typeof v === 'string' ? new Date(v).toISOString() : undefined)

export const categoryToRow = (c: Category): Row => ({
  id: c.id,
  name: c.name,
  icon: c.icon,
  sort_order: c.order,
  buildable: c.buildable,
  protected: c.protected ?? false,
  archived: c.archived,
})

export const categoryFromRow = (r: Row): Category => {
  const c: Category = {
    id: r.id as string,
    name: r.name as string,
    icon: r.icon as IconId,
    order: r.sort_order as number,
    buildable: r.buildable as boolean,
    archived: r.archived as boolean,
  }
  if (r.protected) c.protected = true
  return c
}

export const optionToRow = (o: OptionItem): Row => ({
  id: o.id,
  kind: o.kind,
  name: o.name,
  icon: o.icon,
  price_cents: o.priceCents,
  cost_cents: o.costCents ?? null,
  available: o.available,
  example: o.example ?? false,
})

export const optionFromRow = (r: Row): OptionItem => {
  const o: OptionItem = {
    id: r.id as string,
    kind: r.kind as OptionItem['kind'],
    name: r.name as string,
    icon: r.icon as IconId,
    priceCents: r.price_cents as number,
    available: r.available as boolean,
  }
  if (r.cost_cents != null) o.costCents = r.cost_cents as number
  if (r.example) o.example = true
  return o
}

export const productToRow = (p: Product): Row => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category_id: p.categoryId,
  price_cents: p.priceCents,
  cost_cents: p.costCents ?? null,
  stock: p.stock,
  image: p.image ?? null,
  color: p.color,
  default_container_id: p.defaultContainerId ?? null,
  subgroup_id: p.subgroupId ?? null,
  archived: p.archived,
  created_at: p.createdAt,
})

export const productFromRow = (r: Row): Product => ({
  id: r.id as string,
  name: r.name as string,
  description: r.description as string,
  categoryId: r.category_id as string,
  priceCents: r.price_cents as number,
  costCents: opt(r.cost_cents as number | null),
  stock: r.stock as number,
  image: opt(r.image as string | null),
  color: r.color as string,
  defaultContainerId: opt(r.default_container_id as string | null),
  subgroupId: opt(r.subgroup_id as string | null),
  archived: r.archived as boolean,
  createdAt: iso(r.created_at)!,
})

export const orderToRow = (o: Order): Row => ({
  id: o.id,
  number: o.number,
  status: o.status,
  mode: o.mode,
  lines: o.lines,
  customer: o.customer ?? null,
  note: o.note ?? null,
  address: o.address ?? null,
  created_at: o.createdAt,
  charged_at: o.chargedAt ?? null,
  cancelled_at: o.cancelledAt ?? null,
  subtotal_cents: o.subtotalCents,
  surcharge_cents: o.surchargeCents,
  iva_cents: o.ivaCents,
  total_cents: o.totalCents,
  demo: o.demo ?? false,
})

export const orderFromRow = (r: Row): Order => {
  const o: Order = {
    id: r.id as string,
    number: r.number as number,
    status: r.status as Order['status'],
    mode: r.mode as Order['mode'],
    lines: (r.lines as Order['lines']) ?? [],
    createdAt: iso(r.created_at)!,
    subtotalCents: r.subtotal_cents as number,
    surchargeCents: r.surcharge_cents as number,
    ivaCents: r.iva_cents as number,
    totalCents: r.total_cents as number,
  }
  if (r.customer != null) o.customer = r.customer as string
  if (r.note != null) o.note = r.note as string
  if (r.address != null) o.address = r.address as string
  if (r.charged_at != null) o.chargedAt = iso(r.charged_at)
  if (r.cancelled_at != null) o.cancelledAt = iso(r.cancelled_at)
  if (r.demo) o.demo = true
  return o
}

export const bookingToRow = (b: Booking): Row => ({ ...b })

export const bookingFromRow = (r: Row): Booking => ({
  ...(r as unknown as Booking),
  created_at: iso(r.created_at)!,
})

export interface SettingsRowExtras {
  nextNumber: number
  demoStockBackup: Record<string, number> | null
}

export const settingsToRow = (s: Settings, extras: SettingsRowExtras): Row => ({
  id: 1,
  iva_percent: s.ivaPercent,
  delivery_surcharge_cents: s.deliverySurchargeCents,
  low_stock_threshold: s.lowStockThreshold,
  max_scoops: s.maxScoops,
  queue_amber_minutes: s.queueAmberMinutes,
  queue_red_minutes: s.queueRedMinutes,
  next_order_number: extras.nextNumber,
  demo_stock_backup: extras.demoStockBackup,
})

export const settingsFromRow = (r: Row): Settings & SettingsRowExtras => ({
  ivaPercent: Number(r.iva_percent),
  deliverySurchargeCents: r.delivery_surcharge_cents as number,
  lowStockThreshold: r.low_stock_threshold as number,
  maxScoops: r.max_scoops as number,
  queueAmberMinutes: r.queue_amber_minutes as number,
  queueRedMinutes: r.queue_red_minutes as number,
  nextNumber: r.next_order_number as number,
  demoStockBackup: (r.demo_stock_backup as Record<string, number> | null) ?? null,
})
