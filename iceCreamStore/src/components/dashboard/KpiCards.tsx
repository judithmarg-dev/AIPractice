import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { Icon, type UiIconId } from '@/components/icons'
import { variation, type DashboardData, type Variation } from '@/lib/dashboard'
import { formatMoney } from '@/lib/money'
import { plural } from '@/lib/texts'
import { VariationPill } from './Variation'
import { CHART } from './ChartCard'

interface KpiProps {
  label: string
  icon: UiIconId
  value: string
  change: Variation
  spark: (number | null)[]
  footLabel: string
  footValue: string
  /** 0–100, drawn as a bar under the footer. */
  progress?: number
  warning?: string
}

function Kpi({ label, icon, value, change, spark, footLabel, footValue, progress, warning }: KpiProps) {
  return (
    <article className="kpi">
      <div className="kpi__head">
        <h3 className="kpi__label">{label}</h3>
        <span className="kpi__icon"><Icon name={icon} size={20} /></span>
      </div>
      <p className="kpi__value">
        {value} <VariationPill value={change} />
      </p>
      {warning && (
        <p className="chip chip--warning kpi__warning">
          <Icon name="alert" size={12} /> {warning}
        </p>
      )}
      <div className="kpi__spark" aria-hidden="true">
        <ResponsiveContainer width="100%" height={36}>
          <LineChart data={spark.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
            <Line type="monotone" dataKey="v" stroke={CHART.current} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="kpi__foot">
        <span>{footLabel}</span>
        <strong>{footValue}</strong>
      </div>
      {progress !== undefined && (
        <div className="progress" aria-hidden="true">
          <span className="progress__bar" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </article>
  )
}

/** RF-7.3: income, profit, registered orders and average ticket, each with a sparkline. */
export function KpiCards({ data }: { data: DashboardData }) {
  const { current: c, prev: p, future } = data
  const masked = (series: number[]) => series.map((v, i) => (future[i] ? null : v))
  const profit = c.revenueCents - c.costCents
  const prevProfit = p.revenueCents - p.costCents
  const ticket = c.chargedCount ? Math.round(c.revenueCents / c.chargedCount) : 0
  const prevTicket = p.chargedCount ? Math.round(p.revenueCents / p.chargedCount) : 0
  const margin = c.revenueCents ? Math.round((profit / c.revenueCents) * 100) : 0

  return (
    <div className="kpi-row" data-pdf-block="wide">
      <Kpi
        label="Ingresos del período"
        icon="money"
        value={formatMoney(c.revenueCents)}
        change={variation(c.revenueCents, p.revenueCents)}
        spark={masked(c.bucketRevenue)}
        footLabel="Cobrado con IVA"
        footValue={formatMoney(c.chargedWithIvaCents)}
      />
      <Kpi
        label="Ganancia"
        icon="trend-up"
        value={formatMoney(profit)}
        change={variation(profit, prevProfit)}
        spark={masked(c.bucketProfit)}
        footLabel="Margen sobre ingresos"
        footValue={`${margin} %`}
        progress={margin}
        warning={c.costIncomplete ? 'Costos incompletos' : undefined}
      />
      <Kpi
        label="Órdenes registradas"
        icon="receipt"
        value={String(c.registered)}
        change={variation(c.registered, p.registered)}
        spark={masked(c.bucketOrders)}
        footLabel={`${plural(c.registeredCharged, 'cobrada', 'cobradas')} · ${c.registeredPending} por cobrar`}
        footValue={`${c.registered ? Math.round((c.registeredCharged / c.registered) * 100) : 0} % cobrado`}
        progress={c.registered ? (c.registeredCharged / c.registered) * 100 : 0}
      />
      <Kpi
        label="Ticket promedio"
        icon="bag"
        value={formatMoney(ticket)}
        change={variation(ticket, prevTicket)}
        spark={masked(c.bucketRevenue.map((r, i) => (c.bucketCharged[i] ? Math.round(r / c.bucketCharged[i]) : 0)))}
        footLabel="Período anterior"
        footValue={formatMoney(prevTicket)}
      />
    </div>
  )
}
