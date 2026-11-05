// Deterministic demo orders (RF-0.4): fixed seed, lunch and afternoon peaks, both services,
// a weekly rhythm and some week-to-week variation. Every order is charged and flagged `demo`.
import { computeTotals, makeBuildLine, makeProductLine, stockUsage, toSnapshot } from '@/lib/orderMath'
import type { Category, OptionItem, Order, OrderLine, Product, ServiceMode, Settings } from '@/types/models'

export const DEMO_DAYS = 62

/** mulberry32: small, fast, good enough for demo data. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickWeighted<T>(items: T[], weights: number[], r: number): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let x = r * total
  for (let i = 0; i < items.length; i++) {
    x -= weights[i]
    if (x <= 0) return items[i]
  }
  return items[items.length - 1]
}

// Orders per weekday (Sunday first) and the share of orders per opening hour (10:00–21:00).
const PER_WEEKDAY = [30, 16, 15, 18, 20, 26, 32]
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
const HOUR_WEIGHTS = [2, 4, 9, 10, 6, 5, 8, 10, 9, 6, 4, 2]
// Stock left after loading, in days of recent consumption, so the supply signals have variety.
const COVERAGE_DAYS = [6, 2.2, 0.6, 4, 9, 1.4, 0, 5, 3.5, 12]

export interface DemoInput {
  products: Product[]
  categories: Category[]
  options: OptionItem[]
  settings: Settings
  firstNumber: number
  now: Date
}

export function generateDemoOrders(input: DemoInput): { orders: Order[]; demoStock: Record<string, number> } {
  const { products, categories, options, settings, now } = input
  const random = rng(20261017)
  const buildable = new Set(categories.filter((c) => c.buildable).map((c) => c.id))
  const known = new Set(categories.map((c) => c.id))
  const flavors = products.filter((p) => buildable.has(p.categoryId))
  const others = products.filter((p) => known.has(p.categoryId) && !buildable.has(p.categoryId))
  if (flavors.length === 0 && others.length === 0) return { orders: [], demoStock: {} }

  // Earlier products sell more, so there is a clear ranking.
  const flavorWeights = flavors.map((_, i) => 1 / (1 + i * 0.35))
  const otherWeights = others.map((_, i) => 1 / (1 + i * 0.25))
  const envases = options.filter((o) => o.kind === 'envase')
  const extras = options.filter((o) => o.kind === 'extra')
  const toppings = options.filter((o) => o.kind === 'topping')

  const orders: Order[] = []
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - DEMO_DAYS)
  let lineSeq = 0

  for (let day = 0; day <= DEMO_DAYS; day++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + day)
    const week = Math.floor(day / 7)
    const rhythm = 1 + 0.18 * Math.sin(week * 1.7) + day * 0.003
    const count = Math.round(PER_WEEKDAY[date.getDay()] * rhythm * (0.85 + random() * 0.3))

    const stamps: Date[] = []
    for (let i = 0; i < count; i++) {
      const hour = pickWeighted(HOURS, HOUR_WEIGHTS, random())
      const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Math.floor(random() * 60))
      if (at.getTime() < now.getTime() - 10 * 60000) stamps.push(at)
    }
    stamps.sort((a, b) => a.getTime() - b.getTime())

    for (const at of stamps) {
      const mode: ServiceMode = random() < 0.34 ? 'delivery' : 'presencial'
      const lines: OrderLine[] = []
      const lineCount = random() < 0.6 ? 1 : random() < 0.75 ? 2 : 3
      for (let l = 0; l < lineCount; l++) {
        const qty = random() < 0.86 ? 1 : 2
        const lineId = `demo-line-${lineSeq++}`
        if (flavors.length && (others.length === 0 || random() < 0.6)) {
          const base = pickWeighted(flavors, flavorWeights, random())
          const scoopCount = Math.min(settings.maxScoops, pickWeighted([1, 2, 3], [35, 45, 20], random()))
          const scoops = [toSnapshot(base)]
          for (let s = 1; s < scoopCount; s++) scoops.push(toSnapshot(pickWeighted(flavors, flavorWeights, random())))
          const container = envases.length && random() < 0.85 ? envases[Math.floor(random() * envases.length)] : undefined
          lines.push(
            makeBuildLine({
              lineId,
              categoryId: base.categoryId,
              scoops,
              container: container ? toSnapshot(container) : undefined,
              extras: extras.length && random() < 0.35 ? [toSnapshot(extras[Math.floor(random() * extras.length)])] : [],
              toppings:
                toppings.length && random() < 0.4 ? [toSnapshot(toppings[Math.floor(random() * toppings.length)])] : [],
              qty,
            })
          )
        } else {
          const product = pickWeighted(others, otherWeights, random())
          lines.push(makeProductLine({ lineId, product, qty }))
        }
      }

      const totals = computeTotals(lines, mode, settings)
      const charged = new Date(at.getTime() + (2 + Math.floor(random() * 7)) * 60000)
      orders.push({
        id: `demo-${at.getTime()}-${orders.length}`,
        number: input.firstNumber + orders.length,
        status: 'cobrado',
        mode,
        lines,
        createdAt: at.toISOString(),
        chargedAt: (charged > now ? now : charged).toISOString(),
        subtotalCents: totals.subtotalCents,
        surchargeCents: totals.surchargeCents,
        ivaCents: totals.ivaCents,
        totalCents: totals.totalCents,
        demo: true,
      })
    }
  }

  // Stock that leaves each product with a different number of days of coverage.
  const weekAgo = now.getTime() - 7 * 86400000
  const recent = stockUsage(orders.filter((o) => new Date(o.createdAt).getTime() >= weekAgo).flatMap((o) => o.lines))
  const demoStock: Record<string, number> = {}
  products.forEach((p, i) => {
    const daily = (recent[p.id] ?? 0) / 7
    demoStock[p.id] = daily === 0 ? p.stock : Math.round(daily * COVERAGE_DAYS[i % COVERAGE_DAYS.length])
  })

  return { orders, demoStock }
}
