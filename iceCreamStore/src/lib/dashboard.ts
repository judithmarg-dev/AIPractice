// Dashboard figures (requirements §8.3 and §8.4). Pure functions over an index of orders;
// `selectDashboard` memoizes them on the store so changing period only re-aggregates.
import { createSelector } from '@reduxjs/toolkit'
import { describeLine, lineCost } from '@/lib/orderMath'
import {
  dayIndex,
  elapsedDays,
  periodBuckets,
  previousPeriod,
  type Bucket,
  type Period,
} from '@/lib/period'
import type { Category, Order, Product, ServiceMode, Settings } from '@/types/models'

const DAY_MS = 86400000

export interface IndexedOrder {
  order: Order
  created: number
  /** NaN when not charged. */
  charged: number
}

export function indexOrders(orders: Order[]): IndexedOrder[] {
  return orders.map((order) => ({
    order,
    created: new Date(order.createdAt).getTime(),
    charged: order.status === 'cobrado' && order.chargedAt ? new Date(order.chargedAt).getTime() : NaN,
  }))
}

export type Variation = { kind: 'pct'; value: number } | { kind: 'new' } | { kind: 'none' }

/** §8.3 — (current − previous) ÷ previous × 100, rounded; "Nuevo" when previous is 0. */
export function variation(current: number, previous: number): Variation {
  if (previous === 0) return current === 0 ? { kind: 'none' } : { kind: 'new' }
  return { kind: 'pct', value: Math.round(((current - previous) / previous) * 100) }
}

export function formatVariation(v: Variation): string {
  if (v.kind === 'new') return 'Nuevo'
  if (v.kind === 'none') return 'Sin datos previos'
  return `${v.value > 0 ? '+' : v.value < 0 ? '−' : ''}${Math.abs(v.value)} %`
}

interface ProductTally {
  units: number
  revenueCents: number
}

/** Everything the dashboard needs from one period, built in a single pass over the orders. */
export interface PeriodAggregate {
  revenueCents: number
  costCents: number
  costIncomplete: boolean
  chargedWithIvaCents: number
  chargedCount: number
  registered: number
  registeredCharged: number
  registeredPending: number
  byService: Record<ServiceMode, { revenueCents: number; orders: number }>
  products: Record<string, ProductTally>
  /** Scoops sold per flavor (buildable lines only). */
  scoops: Record<string, number>
  containers: Record<string, number>
  buildUnits: number
  /** Per bucket: revenue and profit by charge time, orders by creation time. */
  bucketRevenue: number[]
  bucketProfit: number[]
  bucketCharged: number[]
  bucketOrders: number[]
  bucketPresencial: number[]
  bucketDelivery: number[]
  /** Registered orders per hour of day (0–23). */
  hourly: number[]
  /** Charged orders of the period, newest first. */
  charged: IndexedOrder[]
}

export function aggregatePeriod(index: IndexedOrder[], period: Period): PeriodAggregate {
  const buckets = periodBuckets(period)
  const n = buckets.length
  const start = period.start.getTime()
  const end = period.end.getTime()
  const zeros = () => new Array<number>(n).fill(0)
  const bucketOf = (ts: number) =>
    period.kind === 'dia' ? new Date(ts).getHours() : Math.min(n - 1, dayIndex(period.start, ts))

  const agg: PeriodAggregate = {
    revenueCents: 0,
    costCents: 0,
    costIncomplete: false,
    chargedWithIvaCents: 0,
    chargedCount: 0,
    registered: 0,
    registeredCharged: 0,
    registeredPending: 0,
    byService: { presencial: { revenueCents: 0, orders: 0 }, delivery: { revenueCents: 0, orders: 0 } },
    products: {},
    scoops: {},
    containers: {},
    buildUnits: 0,
    bucketRevenue: zeros(),
    bucketProfit: zeros(),
    bucketCharged: zeros(),
    bucketOrders: zeros(),
    bucketPresencial: zeros(),
    bucketDelivery: zeros(),
    hourly: new Array<number>(24).fill(0),
    charged: [],
  }

  const tally = (id: string, units: number, revenueCents: number) => {
    const t = (agg.products[id] ??= { units: 0, revenueCents: 0 })
    t.units += units
    t.revenueCents += revenueCents
  }

  for (const entry of index) {
    const { order, created, charged } = entry

    if (order.status !== 'cancelado' && created >= start && created < end) {
      const b = bucketOf(created)
      agg.registered++
      if (order.status === 'cobrado') agg.registeredCharged++
      else agg.registeredPending++
      agg.bucketOrders[b]++
      if (order.mode === 'presencial') agg.bucketPresencial[b]++
      else agg.bucketDelivery[b]++
      agg.hourly[new Date(created).getHours()]++
    }

    if (!(charged >= start && charged < end)) continue
    const b = bucketOf(charged)
    const revenue = order.subtotalCents + order.surchargeCents
    let cost = 0
    for (const line of order.lines) {
      const c = lineCost(line)
      cost += c.cents
      if (c.incomplete) agg.costIncomplete = true
      if (line.build) {
        for (const scoop of line.build.scoops) {
          tally(scoop.id, line.qty, scoop.priceCents * line.qty)
          agg.scoops[scoop.id] = (agg.scoops[scoop.id] ?? 0) + line.qty
        }
        const container = line.build.container?.name ?? 'Sin envase'
        agg.containers[container] = (agg.containers[container] ?? 0) + line.qty
        agg.buildUnits += line.qty
      } else {
        tally(line.productId, line.qty, line.unitPriceCents * line.qty)
      }
    }
    agg.revenueCents += revenue
    agg.costCents += cost
    agg.chargedWithIvaCents += order.totalCents
    agg.chargedCount++
    agg.byService[order.mode].revenueCents += revenue
    agg.byService[order.mode].orders++
    agg.bucketRevenue[b] += revenue
    agg.bucketProfit[b] += revenue - cost
    agg.bucketCharged[b]++
    agg.charged.push(entry)
  }
  agg.charged.sort((a, b) => b.charged - a.charged)
  return agg
}

/** §8.3 — earliest hour with the most orders, or null when there are none. */
export function peakHour(hourly: number[]): { hour: number; count: number } | null {
  let best = -1
  for (let h = 0; h < hourly.length; h++) if (hourly[h] > (best === -1 ? 0 : hourly[best])) best = h
  return best === -1 ? null : { hour: best, count: hourly[best] }
}

export type CoverageLevel = 'hoy' | 'pronto' | 'ok'

export interface CoverageSignal {
  productId: string
  name: string
  stock: number
  dailyUnits: number
  days: number
  level: CoverageLevel
}

export function coverageLevel(days: number): CoverageLevel {
  return days < 1 ? 'hoy' : days < 3 ? 'pronto' : 'ok'
}

/** §8.4 — units sold in the 7 days up to `until` ÷ 7 against current stock. */
export function supplySignals(index: IndexedOrder[], products: Product[], until: number): CoverageSignal[] {
  const from = until - 7 * DAY_MS
  const units: Record<string, number> = {}
  for (const { order, charged } of index) {
    if (!(charged >= from && charged < until)) continue
    for (const line of order.lines) {
      if (line.build) for (const s of line.build.scoops) units[s.id] = (units[s.id] ?? 0) + line.qty
      else units[line.productId] = (units[line.productId] ?? 0) + line.qty
    }
  }
  const signals: CoverageSignal[] = []
  for (const p of products) {
    const daily = (units[p.id] ?? 0) / 7
    // Products without sales are left out, except those already out of stock.
    if (daily === 0 && p.stock > 0) continue
    const days = daily === 0 ? 0 : p.stock / daily
    signals.push({ productId: p.id, name: p.name, stock: p.stock, dailyUnits: daily, days, level: coverageLevel(days) })
  }
  return signals.sort((a, b) => a.days - b.days || a.name.localeCompare(b.name))
}

export interface StockAlert {
  productId: string
  name: string
  stock: number
  level: 'agotado' | 'bajo'
}

/** Red at 0, amber under the threshold; lowest first. */
export function stockAlerts(products: Product[], threshold: number): StockAlert[] {
  return products
    .filter((p) => p.stock === 0 || p.stock < threshold)
    .map((p) => ({ productId: p.id, name: p.name, stock: p.stock, level: p.stock === 0 ? 'agotado' : 'bajo' }) as StockAlert)
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name))
}

export interface TopItem {
  productId: string
  name: string
  categoryId: string
  units: number
  revenueCents: number
  /** Share of the chosen metric among all products. */
  sharePct: number
  change: Variation
  stock: number
}

export function topProducts(
  current: PeriodAggregate,
  previous: PeriodAggregate,
  products: Product[],
  metric: 'units' | 'revenue',
  categoryId: string | null,
  limit = 8
): TopItem[] {
  const byId = new Map(products.map((p) => [p.id, p]))
  const rows = Object.entries(current.products)
    .map(([id, t]) => ({ id, t, product: byId.get(id) }))
    .filter((r) => r.product && (!categoryId || r.product.categoryId === categoryId))
  const value = (t: ProductTally) => (metric === 'units' ? t.units : t.revenueCents)
  const total = rows.reduce((s, r) => s + value(r.t), 0)
  return rows
    .sort((a, b) => value(b.t) - value(a.t) || a.product!.name.localeCompare(b.product!.name))
    .slice(0, limit)
    .map(({ id, t, product }) => ({
      productId: id,
      name: product!.name,
      categoryId: product!.categoryId,
      units: t.units,
      revenueCents: t.revenueCents,
      sharePct: total === 0 ? 0 : Math.round((value(t) / total) * 100),
      change: variation(t.units, previous.products[id]?.units ?? 0),
      stock: product!.stock,
    }))
}

export interface StarFlavor {
  productId: string
  name: string
  scoops: number
  pct: number
  image?: string
  color: string
}

export interface StarTicket {
  number: number
  at: string
  detail: string
  totalCents: number
}

/** §8.3 — buildable flavor with the most scoops; podium of three plus its latest tickets. */
export function starFlavor(
  current: PeriodAggregate,
  products: Product[]
): { podium: StarFlavor[]; totalScoops: number; tickets: StarTicket[] } | null {
  const byId = new Map(products.map((p) => [p.id, p]))
  const totalScoops = Object.values(current.scoops).reduce((s, n) => s + n, 0)
  if (totalScoops === 0) return null
  const podium = Object.entries(current.scoops)
    .filter(([id]) => byId.has(id))
    .sort((a, b) => b[1] - a[1] || byId.get(a[0])!.name.localeCompare(byId.get(b[0])!.name))
    .slice(0, 3)
    .map(([id, scoops]) => {
      const p = byId.get(id)!
      return { productId: id, name: p.name, scoops, pct: Math.round((scoops / totalScoops) * 100), image: p.image, color: p.color }
    })
  if (podium.length === 0) return null
  const starId = podium[0].productId
  const tickets: StarTicket[] = []
  for (const { order } of current.charged) {
    const lines = order.lines.filter((l) => l.build?.scoops.some((s) => s.id === starId))
    if (lines.length === 0) continue
    const first = describeLine(lines[0])
    tickets.push({
      number: order.number,
      at: order.chargedAt ?? order.createdAt,
      detail: `${lines[0].qty}× ${first.detail}${lines.length > 1 ? ` y ${lines.length - 1} más` : ''}`,
      totalCents: order.totalCents,
    })
    if (tickets.length === 3) break
  }
  return { podium, totalScoops, tickets }
}

export interface ServiceSplit {
  presencial: { revenueCents: number; orders: number }
  delivery: { revenueCents: number; orders: number }
  winner: ServiceMode | 'empate' | null
  revenuePct: number
  ordersPct: number
  diffCents: number
}

export function serviceSplit(current: PeriodAggregate): ServiceSplit {
  const { presencial, delivery } = current.byService
  const totalRevenue = presencial.revenueCents + delivery.revenueCents
  const totalOrders = presencial.orders + delivery.orders
  if (totalOrders === 0) return { presencial, delivery, winner: null, revenuePct: 0, ordersPct: 0, diffCents: 0 }
  if (presencial.revenueCents === delivery.revenueCents) {
    return { presencial, delivery, winner: 'empate', revenuePct: 50, ordersPct: Math.round((presencial.orders / totalOrders) * 100), diffCents: 0 }
  }
  const winner: ServiceMode = presencial.revenueCents > delivery.revenueCents ? 'presencial' : 'delivery'
  const w = current.byService[winner]
  const l = current.byService[winner === 'presencial' ? 'delivery' : 'presencial']
  return {
    presencial,
    delivery,
    winner,
    revenuePct: Math.round((w.revenueCents / totalRevenue) * 100),
    ordersPct: Math.round((w.orders / totalOrders) * 100),
    diffCents: w.revenueCents - l.revenueCents,
  }
}

export interface DashboardData {
  period: Period
  previous: Period
  buckets: Bucket[]
  current: PeriodAggregate
  prev: PeriodAggregate
  /** Bucket starts later than now (drawn as gaps in the current series). */
  future: boolean[]
  hourlyAverage: number[]
  prevHourlyAverage: number[]
  hourlyIsAverage: boolean
  peak: { hour: number; count: number } | null
  star: ReturnType<typeof starFlavor>
  service: ServiceSplit
  alerts: StockAlert[]
  supply: CoverageSignal[]
  containerMix: { name: string; pct: number }[]
  hasAnyOrders: boolean
}

export function computeDashboard(
  index: IndexedOrder[],
  products: Product[],
  settings: Settings,
  period: Period,
  now: Date
): DashboardData {
  const previous = previousPeriod(period)
  const current = aggregatePeriod(index, period)
  const prev = aggregatePeriod(index, previous)
  const buckets = periodBuckets(period)
  const average = period.kind !== 'dia'
  const days = elapsedDays(period, now)
  const prevDays = elapsedDays(previous, now)
  const active = products.filter((p) => !p.archived)

  return {
    period,
    previous,
    buckets,
    current,
    prev,
    future: buckets.map((b) => b.start > now.getTime()),
    hourlyAverage: current.hourly.map((c) => (average ? c / days : c)),
    prevHourlyAverage: prev.hourly.map((c) => (average ? c / prevDays : c)),
    hourlyIsAverage: average,
    peak: peakHour(current.hourly),
    star: starFlavor(current, products),
    service: serviceSplit(current),
    alerts: stockAlerts(active, settings.lowStockThreshold),
    supply: supplySignals(index, active, Math.min(period.end.getTime(), now.getTime())),
    containerMix: Object.entries(current.containers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, units]) => ({ name, pct: Math.round((units / current.buildUnits) * 100) })),
    hasAnyOrders: index.length > 0,
  }
}

// ── Memoized selectors ───────────────────────────────────────────────────────
type DashboardState = { order: { orders: Order[] }; inventory: Product[]; settings: Settings; categories: Category[] }

export const selectOrderIndex = createSelector([(s: DashboardState) => s.order.orders], indexOrders)

export const selectDashboard = createSelector(
  [
    selectOrderIndex,
    (s: DashboardState) => s.inventory,
    (s: DashboardState) => s.settings,
    (_: DashboardState, period: Period) => period,
    (_: DashboardState, _p: Period, nowMinute: number) => nowMinute,
  ],
  (index, products, settings, period, nowMinute) => computeDashboard(index, products, settings, period, new Date(nowMinute))
)
