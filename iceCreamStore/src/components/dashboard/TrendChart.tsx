import { useState } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardData } from '@/lib/dashboard'
import { formatMoney } from '@/lib/money'
import { CHART, ChartCard, MiniSegmented } from './ChartCard'

type Metric = 'revenue' | 'profit' | 'orders'

const METRICS: { id: Metric; label: string }[] = [
  { id: 'revenue', label: 'Ingresos' },
  { id: 'profit', label: 'Ganancia' },
  { id: 'orders', label: 'Órdenes' },
]

/** RF-7.4.a — by hour for a day, by day for a week or month; previous period dashed. */
export function TrendChart({ data, compare }: { data: DashboardData; compare: boolean }) {
  const [metric, setMetric] = useState<Metric>('revenue')
  const { current: c, prev: p, buckets, future } = data
  const pick = (agg: typeof c, i: number) =>
    metric === 'revenue' ? agg.bucketRevenue[i] : metric === 'profit' ? agg.bucketProfit[i] : agg.bucketOrders[i]
  const prevLen = p.bucketRevenue.length
  const rows = buckets.map((b, i) => ({
    label: b.label,
    current: future[i] ? null : pick(c, i),
    previous: i < prevLen ? pick(p, i) : null,
  }))
  const isMoney = metric !== 'orders'
  const fmt = (v: number) => (isMoney ? formatMoney(v) : `${v} ${v === 1 ? 'orden' : 'órdenes'}`)
  const total = rows.reduce((s, r) => s + (r.current ?? 0), 0)
  const best = rows.reduce<(typeof rows)[number] | null>((b, r) => ((r.current ?? 0) > (b?.current ?? 0) ? r : b), null)
  const label = METRICS.find((m) => m.id === metric)!.label
  const unit = data.period.kind === 'dia' ? 'hora' : 'día'
  const empty = c.registered === 0 && c.chargedCount === 0 && (!compare || (p.registered === 0 && p.chargedCount === 0))

  return (
    <ChartCard
      wide
      title="Tendencia del período"
      subtitle={`${label} por ${unit}${compare ? ' frente al período anterior' : ''}`}
      actions={<MiniSegmented label="Métrica" value={metric} options={METRICS} onChange={setMetric} />}
      summary={`${label} del período: ${fmt(total)}.${best ? ` Mejor ${unit}: ${best.label} con ${fmt(best.current ?? 0)}.` : ''}`}
      values={rows.filter((r) => r.current).map((r) => `${r.label}: ${fmt(r.current ?? 0)}`)}
      empty={empty ? 'No hay órdenes en este período ni en el anterior.' : null}
      footer={
        <p className="legend">
          <span className="legend__item"><span className="legend__swatch legend__swatch--current" /> Período actual</span>
          {compare && <span className="legend__item"><span className="legend__swatch legend__swatch--previous" /> Período anterior</span>}
        </p>
      }
    >
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.current} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART.current} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={CHART.axis} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={12} />
          <YAxis
            tick={CHART.axis}
            tickLine={false}
            axisLine={false}
            width={48}
            allowDecimals={false}
            tickFormatter={(v: number) => (isMoney ? `$${Math.round(v / 100)}` : String(v))}
          />
          <Tooltip
            {...CHART.tooltip}
            formatter={(v, name) => [fmt(Number(v)), name === 'current' ? 'Período actual' : 'Período anterior']}
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke={CHART.current}
            strokeWidth={2.5}
            fill="url(#trend-fill)"
            connectNulls={false}
            isAnimationActive={false}
            activeDot={{ r: 5 }}
          />
          {compare && (
            <Line
              type="monotone"
              dataKey="previous"
              stroke={CHART.previous}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
