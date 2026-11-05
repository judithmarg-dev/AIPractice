import { useState } from 'react'
import { Icon } from '@/components/icons'
import type { CoverageLevel, DashboardData } from '@/lib/dashboard'
import { ChartCard } from './ChartCard'

const SCALE_DAYS = 7
const LIMIT = 6
const LEVEL: Record<CoverageLevel, { label: string; tone: string; chip: string }> = {
  hoy: { label: 'Reponer hoy', tone: 'danger', chip: 'chip--danger' },
  pronto: { label: 'Reponer pronto', tone: 'warning', chip: 'chip--warning' },
  ok: { label: 'Cobertura ok', tone: 'accent', chip: 'chip--accent' },
}

const days1 = (d: number) => (Math.round(d * 10) / 10).toLocaleString('es')

/** RF-7.4.g — days of coverage per product with reference marks at 1 and 3 days (§8.4). */
export function SupplySignals({ data }: { data: DashboardData }) {
  const [showAll, setShowAll] = useState(false)
  const signals = data.supply
  const visible = showAll ? signals : signals.slice(0, LIMIT)
  const urgent = signals.filter((s) => s.level !== 'ok').length

  return (
    <ChartCard
      title="Señales de abastecimiento"
      subtitle="Días de cobertura según las ventas de los últimos 7 días"
      actions={urgent > 0 && <span className="chip chip--danger-solid">{urgent} {urgent === 1 ? 'alerta' : 'alertas'}</span>}
      summary={
        signals.length
          ? `${urgent} productos por reponer. Menor cobertura: ${signals[0].name}, ${days1(signals[0].days)} días.`
          : 'Sin ventas recientes'
      }
      values={signals.map((s) => `${s.name}: ${days1(s.days)} días de cobertura, ${LEVEL[s.level].label}`)}
      empty={signals.length ? null : 'No hubo ventas en los últimos 7 días.'}
      footer={
        signals.length > LIMIT && (
          <button type="button" className="btn btn--ghost btn--sm dash-card__more" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
            {showAll ? 'Ver menos' : `Ver todas (${signals.length})`}
          </button>
        )
      }
    >
      <div className="coverage">
        <div className="coverage__scale" aria-hidden="true">
          <span style={{ left: `${(1 / SCALE_DAYS) * 100}%` }}>1 día</span>
          <span style={{ left: `${(3 / SCALE_DAYS) * 100}%` }}>3 días</span>
          <span style={{ left: '100%' }}>{SCALE_DAYS}+</span>
        </div>
        <ul className="meter-list">
          {visible.map((s) => {
            const level = LEVEL[s.level]
            return (
              <li key={s.productId} className={`meter meter--${level.tone}`}>
                <div className="meter__head">
                  <span className="meter__name">{s.name}</span>
                  <span className={`chip ${level.chip}`}>
                    <Icon name={s.level === 'ok' ? 'check' : 'alert'} size={12} /> {level.label}
                  </span>
                </div>
                <div className="bar-track bar-track--ruled">
                  <span className="bar-track__bar" style={{ width: `${Math.max(2, Math.min(1, s.days / SCALE_DAYS) * 100)}%` }} />
                  <span className="bar-track__rule" style={{ left: `${(1 / SCALE_DAYS) * 100}%` }} />
                  <span className="bar-track__rule" style={{ left: `${(3 / SCALE_DAYS) * 100}%` }} />
                </div>
                <p className="meter__meta">
                  {days1(s.days)} días · stock {s.stock} · {days1(s.dailyUnits)} u./día
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </ChartCard>
  )
}
