import { useState } from 'react'
import { Icon } from '@/components/icons'
import type { DashboardData } from '@/lib/dashboard'
import { ChartCard } from './ChartCard'

const LIMIT = 8

/** RF-7.4.f — current stock against the low-stock threshold, lowest first. */
export function StockAlerts({ data, threshold }: { data: DashboardData; threshold: number }) {
  const [showAll, setShowAll] = useState(false)
  const alerts = data.alerts
  const visible = showAll ? alerts : alerts.slice(0, LIMIT)
  const soldOut = alerts.filter((a) => a.level === 'agotado').length

  return (
    <ChartCard
      wide
      title="Alertas de stock"
      subtitle={`Stock actual frente al umbral de ${threshold} unidades`}
      actions={
        alerts.length > 0 && (
          <span className="chip chip--danger-solid">
            {soldOut} {soldOut === 1 ? 'agotado' : 'agotados'} · {alerts.length - soldOut} bajo umbral
          </span>
        )
      }
      summary={
        alerts.length
          ? `${alerts.length} productos con stock bajo; ${soldOut} agotados. El más bajo: ${alerts[0].name} con ${alerts[0].stock}.`
          : 'Todo el stock está sobre el umbral'
      }
      values={alerts.map((a) => `${a.name}: ${a.stock} unidades, ${a.level === 'agotado' ? 'agotado' : 'stock bajo'}`)}
      empty={alerts.length ? null : `Todos los productos tienen al menos ${threshold} unidades.`}
      footer={
        alerts.length > LIMIT && (
          <button type="button" className="btn btn--ghost btn--sm dash-card__more" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
            {showAll ? 'Ver menos' : `Ver todas (${alerts.length})`}
          </button>
        )
      }
    >
      <ul className="meter-list meter-list--columns">
        {visible.map((a) => (
          <li key={a.productId} className={`meter meter--${a.level === 'agotado' ? 'danger' : 'warning'}`}>
            <div className="meter__head">
              <span className="meter__name">{a.name}</span>
              <span className={`chip ${a.level === 'agotado' ? 'chip--danger' : 'chip--warning'}`}>
                <Icon name="alert" size={12} /> {a.level === 'agotado' ? 'Agotado' : 'Stock bajo'}
              </span>
            </div>
            <div className="bar-track">
              <span className="bar-track__bar" style={{ width: `${Math.max(a.stock === 0 ? 0 : 4, (a.stock / Math.max(1, threshold)) * 100)}%` }} />
            </div>
            <p className="meter__meta">{a.stock} de {threshold} u.</p>
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}
