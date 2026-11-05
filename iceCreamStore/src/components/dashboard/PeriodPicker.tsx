import { Icon } from '@/components/icons'
import { CURRENT_LABEL, PERIOD_KIND_LABEL, canGoNext, isCurrentPeriod, periodLabel, type Period, type PeriodKind } from '@/lib/period'

interface PeriodPickerProps {
  period: Period
  now: Date
  onKind: (kind: PeriodKind) => void
  onShift: (direction: -1 | 1) => void
  onToday: () => void
}

/** RF-7.1: Día | Semana | Mes, previous / next and back to the current period. */
export function PeriodPicker({ period, now, onKind, onShift, onToday }: PeriodPickerProps) {
  const current = isCurrentPeriod(period, now)
  return (
    <div className="period">
      <div className="segmented" role="group" aria-label="Agrupar por">
        {(Object.keys(PERIOD_KIND_LABEL) as PeriodKind[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`segmented__btn${period.kind === k ? ' segmented__btn--active' : ''}`}
            aria-pressed={period.kind === k}
            onClick={() => onKind(k)}
          >
            {PERIOD_KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <div className="period__nav">
        <button type="button" className="icon-btn" onClick={() => onShift(-1)} aria-label="Período anterior">
          <Icon name="chevron-left" size={18} />
        </button>
        <p className="period__label" aria-live="polite">{periodLabel(period)}</p>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onShift(1)}
          disabled={!canGoNext(period, now)}
          aria-label="Período siguiente"
        >
          <Icon name="chevron-right" size={18} />
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onToday} disabled={current}>
          {CURRENT_LABEL[period.kind]}
        </button>
      </div>
    </div>
  )
}
