import type { Scoops } from '../types/flavor'

const OPTIONS: Scoops[] = [1, 2, 3]

function ConeIcon({ scoops }: { scoops: number }) {
  // Cone sits at the bottom; scoops stack upwards so larger sizes read taller.
  const height = 30 + scoops * 14
  const coneTop = height - 28
  return (
    <svg
      width="40"
      height={height}
      viewBox={`0 0 40 ${height}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-picker__icon"
    >
      <path d={`M8 ${coneTop} L20 ${height - 2} L32 ${coneTop} Z`} fill="currentColor" opacity="0.35" />
      {Array.from({ length: scoops }).map((_, i) => (
        <circle
          key={i}
          cx="20"
          cy={coneTop - 6 - i * 12}
          r="10"
          fill="currentColor"
          opacity={0.9 - i * 0.15}
        />
      ))}
    </svg>
  )
}

interface ScoopPickerProps {
  selected: Scoops
  pricePerScoop: number
  onChange: (scoops: Scoops) => void
}

export function ScoopPicker({ selected, pricePerScoop, onChange }: ScoopPickerProps) {
  return (
    <div className="size-picker" role="group" aria-label="Número de bolas">
      <span className="size-picker__label">¿Cuántas bolas?</span>
      <div className="size-picker__buttons">
        {OPTIONS.map((scoops) => (
          <button
            key={scoops}
            type="button"
            className={`size-picker__btn${selected === scoops ? ' size-picker__btn--active' : ''}`}
            onClick={() => onChange(scoops)}
            aria-pressed={selected === scoops}
          >
            <ConeIcon scoops={scoops} />
            <span className="size-picker__name">
              {scoops} {scoops === 1 ? 'bola' : 'bolas'}
            </span>
            <span className="size-picker__meta">${(pricePerScoop * scoops).toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
