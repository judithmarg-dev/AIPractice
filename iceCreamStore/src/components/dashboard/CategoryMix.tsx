import type { DashboardData } from '@/lib/dashboard'
import { formatMoney } from '@/lib/money'
import type { Category, Product } from '@/types/models'
import { ChartCard, SERIES } from './ChartCard'

/** RF-7.4.h (C) — income share by category. */
export function CategoryMix({ data, products, categories }: { data: DashboardData; products: Product[]; categories: Category[] }) {
  const byProduct = new Map(products.map((p) => [p.id, p.categoryId]))
  const totals = new Map<string, number>()
  for (const [id, t] of Object.entries(data.current.products)) {
    const cat = byProduct.get(id)
    if (cat) totals.set(cat, (totals.get(cat) ?? 0) + t.revenueCents)
  }
  const sum = [...totals.values()].reduce((s, v) => s + v, 0)
  const rows = categories
    .map((c, i) => ({ c, color: SERIES[i % SERIES.length], cents: totals.get(c.id) ?? 0 }))
    .filter((r) => r.cents > 0)
    .sort((a, b) => b.cents - a.cents)
  const pct = (n: number) => (sum ? Math.round((n / sum) * 100) : 0)

  return (
    <ChartCard
      title="Ventas por categoría"
      subtitle="Ingresos de productos (sin envases ni extras)"
      summary={rows.length ? `Categoría líder: ${rows[0].c.name}, ${pct(rows[0].cents)} % de los ingresos` : 'Sin ventas'}
      values={rows.map((r) => `${r.c.name}: ${formatMoney(r.cents)}, ${pct(r.cents)} %`)}
      empty={rows.length ? null : 'No hay ventas cobradas en este período.'}
    >
      <div className="stack-bar" aria-hidden="true">
        {rows.map((r) => (
          <span key={r.c.id} style={{ width: `${pct(r.cents)}%`, background: r.color }} />
        ))}
      </div>
      <ul className="category-mix">
        {rows.map((r) => (
          <li key={r.c.id}>
            <span className="legend__dot" style={{ background: r.color }} />
            <span className="category-mix__name">{r.c.name}</span>
            <strong>{pct(r.cents)} %</strong>
            <span className="category-mix__value">{formatMoney(r.cents)}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}
