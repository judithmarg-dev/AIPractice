import { useMemo, useState } from 'react'
import { Icon } from '@/components/icons'
import { topProducts, type DashboardData, type TopItem } from '@/lib/dashboard'
import { formatMoney } from '@/lib/money'
import type { Category, Product } from '@/types/models'
import { ChartCard, MiniSegmented, SERIES } from './ChartCard'

type Metric = 'units' | 'revenue'

function TrendChip({ item, threshold }: { item: TopItem; threshold: number }) {
  if (item.stock === 0) return <span className="chip chip--danger"><Icon name="alert" size={12} /> Agotado</span>
  if (item.stock < threshold) return <span className="chip chip--warning"><Icon name="alert" size={12} /> Poco stock</span>
  if (item.change.kind === 'new') return <span className="chip chip--accent">Nuevo</span>
  if (item.change.kind === 'pct' && item.change.value >= 10) {
    return <span className="chip chip--accent"><Icon name="trend-up" size={12} /> +{item.change.value} % tendencia</span>
  }
  if (item.change.kind === 'pct' && item.change.value <= -10) {
    return <span className="chip chip--neutral"><Icon name="trend-down" size={12} /> −{Math.abs(item.change.value)} %</span>
  }
  return <span className="chip chip--neutral">Estable</span>
}

/** RF-7.4.c — eight best sellers as ranked horizontal bars, coloured by category. */
export function TopDemand({
  data,
  products,
  categories,
  threshold,
}: {
  data: DashboardData
  products: Product[]
  categories: Category[]
  threshold: number
}) {
  const [metric, setMetric] = useState<Metric>('units')
  const [categoryId, setCategoryId] = useState('')
  const items = useMemo(
    () => topProducts(data.current, data.prev, products, metric, categoryId || null),
    [data, products, metric, categoryId]
  )
  const colorOf = (id: string) => SERIES[Math.max(0, categories.findIndex((c) => c.id === id)) % SERIES.length]
  const value = (i: TopItem) => (metric === 'units' ? i.units : i.revenueCents)
  const max = Math.max(1, ...items.map(value))
  const fmt = (i: TopItem) => (metric === 'units' ? `${i.units} u.` : formatMoney(i.revenueCents))
  const usedCategories = categories.filter((c) => items.some((i) => i.categoryId === c.id))

  return (
    <ChartCard
      wide
      title="Top demanda de productos"
      subtitle="Una bola cuenta como una unidad del sabor elegido"
      actions={
        <>
          <label className="sr-only" htmlFor="top-category">Filtrar por categoría</label>
          <select id="top-category" className="select-pill" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <MiniSegmented
            label="Ordenar por"
            value={metric}
            options={[{ id: 'units', label: 'Unidades' }, { id: 'revenue', label: 'Ingresos' }]}
            onChange={setMetric}
          />
        </>
      }
      summary={items.length ? `Más vendido: ${items[0].name}, ${fmt(items[0])} (${items[0].sharePct} % del total)` : 'Sin ventas'}
      values={items.map((i, n) => `${n + 1}. ${i.name}: ${fmt(i)}, ${i.sharePct} %`)}
      empty={items.length ? null : 'No hay ventas cobradas en este período.'}
      footer={
        <>
          {usedCategories.length > 1 && (
            <p className="legend">
              {usedCategories.map((c) => (
                <span key={c.id} className="legend__item">
                  <span className="legend__dot" style={{ background: colorOf(c.id) }} /> {c.name}
                </span>
              ))}
            </p>
          )}
          {data.containerMix.length > 0 && !categoryId && (
            <p className="dash-card__foot">
              <span><Icon name="waffle" size={16} /> <strong>Envases más elegidos:</strong></span>
              {data.containerMix.map((m) => (
                <span key={m.name}>{m.name}: <strong>{m.pct} %</strong></span>
              ))}
            </p>
          )}
        </>
      }
    >
      <ol className="rank-list">
        {items.map((item, n) => (
          <li key={item.productId} className="rank-list__item">
            <div className="rank-list__head">
              <span className={`rank-list__pos${n === 0 ? ' rank-list__pos--first' : ''}`}>{n + 1}</span>
              <span className="rank-list__name">{item.name}</span>
              <TrendChip item={item} threshold={threshold} />
              <span className="rank-list__value">
                <strong>{fmt(item)}</strong> <span className="rank-list__share">({item.sharePct} % total)</span>
              </span>
            </div>
            <div className="bar-track">
              <span className="bar-track__bar" style={{ width: `${(value(item) / max) * 100}%`, background: colorOf(item.categoryId) }} />
            </div>
          </li>
        ))}
      </ol>
    </ChartCard>
  )
}
