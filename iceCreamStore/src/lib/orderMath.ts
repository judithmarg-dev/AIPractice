// Pure order calculations (requirements §8.1, §8.2, §8.5). Integer cents only.
import { percentOf } from '@/lib/money'
import { T, plural } from '@/lib/texts'
import type { LineBuild, OrderLine, ServiceMode, Settings, Snapshot } from '@/types/models'

const sum = (items: Snapshot[]) => items.reduce((s, i) => s + i.priceCents, 0)

/** §8.1 — every scoop at its own price + container + extras + toppings. */
export function buildUnitPrice(build: LineBuild): number {
  return sum(build.scoops) + (build.container?.priceCents ?? 0) + sum(build.extras) + sum(build.toppings)
}

export function lineSubtotal(line: Pick<OrderLine, 'unitPriceCents' | 'qty'>): number {
  return line.unitPriceCents * line.qty
}

export interface Totals {
  subtotalCents: number
  surchargeCents: number
  ivaCents: number
  totalCents: number
  itemCount: number
}

/** §8.2 — IVA is rounded once, on the whole order. */
export function computeTotals(
  lines: OrderLine[],
  mode: ServiceMode,
  settings: Pick<Settings, 'ivaPercent' | 'deliverySurchargeCents'>
): Totals {
  const subtotalCents = lines.reduce((s, l) => s + lineSubtotal(l), 0)
  const surchargeCents = mode === 'delivery' && lines.length > 0 ? settings.deliverySurchargeCents : 0
  const ivaCents = percentOf(subtotalCents + surchargeCents, settings.ivaPercent)
  return {
    subtotalCents,
    surchargeCents,
    ivaCents,
    totalCents: subtotalCents + surchargeCents + ivaCents,
    itemCount: lines.reduce((s, l) => s + l.qty, 0),
  }
}

/** §8.3 — cost of a line; a missing cost counts 0 and flags the result as incomplete. */
export function lineCost(line: OrderLine): { cents: number; incomplete: boolean } {
  if (!line.build) {
    return { cents: (line.unitCostCents ?? 0) * line.qty, incomplete: line.unitCostCents === undefined }
  }
  const parts = [...line.build.scoops, ...line.build.extras, ...line.build.toppings]
  if (line.build.container) parts.push(line.build.container)
  let unit = 0
  let incomplete = false
  for (const p of parts) {
    if (p.costCents === undefined) incomplete = true
    else unit += p.costCents
  }
  return { cents: unit * line.qty, incomplete }
}

/** Units of stock each product consumes: one per non-buildable item, one per scoop. */
export function stockUsage(lines: OrderLine[]): Record<string, number> {
  const usage: Record<string, number> = {}
  for (const line of lines) {
    if (line.build) {
      for (const scoop of line.build.scoops) usage[scoop.id] = (usage[scoop.id] ?? 0) + line.qty
    } else {
      usage[line.productId] = (usage[line.productId] ?? 0) + line.qty
    }
  }
  return usage
}

/** §8.5 — stock change (to add to current stock) when an order goes from `before` to `after`. */
export function stockDelta(before: OrderLine[], after: OrderLine[]): Record<string, number> {
  const delta: Record<string, number> = {}
  const prev = stockUsage(before)
  const next = stockUsage(after)
  for (const id of new Set([...Object.keys(prev), ...Object.keys(next)])) {
    const d = (prev[id] ?? 0) - (next[id] ?? 0)
    if (d !== 0) delta[id] = d
  }
  return delta
}

export interface Shortage {
  productId: string
  name: string
  available: number
  needed: number
}

/** RF-5.7 — products whose stock would go negative after applying `delta`. */
export function findShortages(
  delta: Record<string, number>,
  products: { id: string; name: string; stock: number }[]
): Shortage[] {
  const shortages: Shortage[] = []
  for (const [id, d] of Object.entries(delta)) {
    if (d >= 0) continue
    const product = products.find((p) => p.id === id)
    const stock = product?.stock ?? 0
    if (stock + d < 0) {
      shortages.push({ productId: id, name: product?.name ?? 'Producto eliminado', available: stock, needed: -d })
    }
  }
  return shortages
}

export function shortageMessage(shortages: Shortage[]): string {
  const parts = shortages.map((s) =>
    s.available === 0 ? `${s.name} (agotado)` : `${s.name} (quedan ${s.available}, se necesitan ${s.needed})`
  )
  return `Sin stock suficiente: ${parts.join(', ')}.`
}

/** Title and detail line shown for an order line (RF-4.9). */
export function describeLine(line: OrderLine): { title: string; detail: string } {
  if (!line.build) return { title: line.productName, detail: line.note ?? '' }
  const { scoops, container, extras, toppings } = line.build
  const parts = [scoops.map((s) => s.name).join(' + ')]
  if (container) parts.push(container.name)
  for (const o of [...extras, ...toppings]) parts.push(o.name)
  return {
    title: `${T.buildLineTitle} · ${plural(scoops.length, 'bola', 'bolas')}`,
    detail: parts.join(' • '),
  }
}

export function toSnapshot(item: { id: string; name: string; priceCents: number; costCents?: number }): Snapshot {
  const snap: Snapshot = { id: item.id, name: item.name, priceCents: item.priceCents }
  if (item.costCents !== undefined) snap.costCents = item.costCents
  return snap
}

/** A configured line for a buildable product; `scoops[0]` is the base. */
export function makeBuildLine(params: {
  lineId: string
  categoryId: string
  scoops: Snapshot[]
  container?: Snapshot
  extras: Snapshot[]
  toppings: Snapshot[]
  qty: number
}): OrderLine {
  const build: LineBuild = {
    scoops: params.scoops,
    extras: params.extras,
    toppings: params.toppings,
  }
  if (params.container) build.container = params.container
  const unitCost = lineCost({ lineId: '', productId: '', productName: '', categoryId: '', qty: 1, unitPriceCents: 0, build })
  return {
    lineId: params.lineId,
    productId: params.scoops[0].id,
    productName: params.scoops[0].name,
    categoryId: params.categoryId,
    qty: params.qty,
    unitPriceCents: buildUnitPrice(build),
    unitCostCents: unitCost.cents,
    build,
  }
}

/** A line for a product sold as is. */
export function makeProductLine(params: {
  lineId: string
  product: { id: string; name: string; priceCents: number; costCents?: number; categoryId: string }
  qty: number
  note?: string
}): OrderLine {
  const { product } = params
  const line: OrderLine = {
    lineId: params.lineId,
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    qty: params.qty,
    unitPriceCents: product.priceCents,
  }
  if (product.costCents !== undefined) line.unitCostCents = product.costCents
  if (params.note) line.note = params.note
  return line
}
