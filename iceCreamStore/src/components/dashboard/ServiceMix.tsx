import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Icon } from '@/components/icons'
import type { DashboardData } from '@/lib/dashboard'
import { formatMoney } from '@/lib/money'
import { MODE_LABEL, plural } from '@/lib/texts'
import type { ServiceMode } from '@/types/models'
import { CHART, ChartCard } from './ChartCard'

const COLORS: Record<ServiceMode, string> = { presencial: 'var(--accent)', delivery: 'var(--primary)' }
const MODES: ServiceMode[] = ['presencial', 'delivery']

/** RF-7.4.e — income by service as a donut plus order counts and the winner band. */
export function ServiceMix({ data }: { data: DashboardData }) {
  const s = data.service
  const totalRevenue = s.presencial.revenueCents + s.delivery.revenueCents
  const totalOrders = s.presencial.orders + s.delivery.orders
  const rows = MODES.map((m) => ({ id: m, name: MODE_LABEL[m], value: s[m].revenueCents }))
  const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)
  const band =
    s.winner === 'empate'
      ? 'Empate entre Presencial y Delivery'
      : s.winner
        ? `Gana ${MODE_LABEL[s.winner]} · ${s.revenuePct} % de los ingresos`
        : ''
  const loser = s.winner === 'presencial' ? 'delivery' : 'presencial'

  return (
    <ChartCard
      title="Presencial vs Delivery"
      subtitle="Ingresos y órdenes cobradas por servicio"
      summary={`${band}. Presencial ${formatMoney(s.presencial.revenueCents)} en ${plural(s.presencial.orders, 'orden', 'órdenes')}; Delivery ${formatMoney(s.delivery.revenueCents)} en ${plural(s.delivery.orders, 'orden', 'órdenes')}.`}
      empty={totalOrders ? null : 'No hay órdenes cobradas en este período.'}
    >
      <p className={`callout ${s.winner === 'empate' ? 'callout--neutral' : 'callout--accent'}`}>
        <span><Icon name={s.winner === 'delivery' ? 'bike' : 'store'} size={16} /> <strong>{band}</strong></span>
        {s.winner && s.winner !== 'empate' && (
          <span>+{formatMoney(s.diffCents)} frente a {MODE_LABEL[loser]} · {s.ordersPct} % de las órdenes</span>
        )}
      </p>
      <div className="service">
        <div className="service__donut">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart accessibilityLayer>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="95%" paddingAngle={2} isAnimationActive={false} stroke="var(--bg)">
                {rows.map((r) => (
                  <Cell key={r.id} fill={COLORS[r.id]} />
                ))}
              </Pie>
              <Tooltip {...CHART.tooltip} formatter={(v) => formatMoney(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="service__list">
          {MODES.map((m) => (
            <li key={m} className="service__item">
              <span className="legend__dot" style={{ background: COLORS[m] }} />
              <span className="service__name">
                <Icon name={m === 'delivery' ? 'bike' : 'store'} size={16} /> {MODE_LABEL[m]}
              </span>
              <strong className="service__pct">{pct(s[m].revenueCents, totalRevenue)} %</strong>
              <span className="service__meta">
                {formatMoney(s[m].revenueCents)} · {plural(s[m].orders, 'orden', 'órdenes')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
