import { useId, type ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  /** Controls shown in the card header (selectors, badges). */
  actions?: ReactNode
  /** Accessible summary of the chart (RF-7.6), e.g. "Hora pico: 13:00, 18 órdenes". */
  summary: string
  /** Key values for screen readers, visually hidden. */
  values?: string[]
  /** Message shown instead of the chart when there is no data. */
  empty?: string | null
  wide?: boolean
  footer?: ReactNode
  children: ReactNode
}

export function ChartCard({ title, subtitle, actions, summary, values, empty, wide, footer, children }: ChartCardProps) {
  const id = useId()
  return (
    <section className={`dash-card${wide ? ' dash-card--wide' : ''}`} aria-labelledby={id} data-pdf-block={wide ? 'wide' : 'half'}>
      <header className="dash-card__head">
        <div>
          <h2 id={id} className="dash-card__title">{title}</h2>
          {subtitle && <p className="dash-card__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="dash-card__actions">{actions}</div>}
      </header>
      {empty ? (
        <p className="dash-card__empty">{empty}</p>
      ) : (
        <>
          <div className="dash-card__visual" role="img" aria-label={summary}>
            {children}
          </div>
          {values && values.length > 0 && (
            <ul className="sr-only">
              {values.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
          {footer}
        </>
      )}
    </section>
  )
}

/** Small segmented control used inside chart headers. */
export function MiniSegmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="segmented segmented--sm" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`segmented__btn${value === o.id ? ' segmented__btn--active' : ''}`}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Shared Recharts styling, built only from tokens. */
export const CHART = {
  current: 'var(--accent)',
  previous: 'var(--text)',
  grid: 'var(--border)',
  axis: { fontSize: 11, fill: 'var(--text)' },
  tooltip: {
    contentStyle: {
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      fontSize: 12,
      color: 'var(--text-h)',
    },
    labelStyle: { color: 'var(--text-h)', fontWeight: 600 },
  },
} as const

/** Series palette for categories, in category order (documented in DESIGN.md). */
export const SERIES = ['var(--accent)', 'var(--primary)', 'var(--warning)', 'var(--accent-text)', 'var(--text-h)', 'var(--danger)']
