import { Icon } from '@/components/icons'
import { formatVariation, type Variation } from '@/lib/dashboard'

/** "+12 %" with an arrow; "Nuevo" when the previous period was 0 (RF-7.2). */
export function VariationPill({ value, suffix }: { value: Variation; suffix?: string }) {
  const tone = value.kind !== 'pct' ? 'neutral' : value.value > 0 ? 'up' : value.value < 0 ? 'down' : 'neutral'
  const icon = tone === 'up' ? 'trend-up' : tone === 'down' ? 'trend-down' : null
  return (
    <span className={`variation variation--${tone}`}>
      {icon && <Icon name={icon} size={14} strokeWidth={2.2} />}
      {formatVariation(value)}
      {suffix && <span className="variation__suffix"> {suffix}</span>}
      <span className="sr-only"> frente al período anterior</span>
    </span>
  )
}
