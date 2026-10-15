import type { Size } from '../types/flavor'

const SIZES: { value: Size; label: string; scoops: number }[] = [
  { value: 'small', label: 'Small', scoops: 1 },
  { value: 'medium', label: 'Medium', scoops: 2 },
  { value: 'large', label: 'Large', scoops: 3 },
]

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

interface SizePickerProps {
  selected: Size
  onChange: (size: Size) => void
}

export function SizePicker({ selected, onChange }: SizePickerProps) {
  return (
    <div className="size-picker" role="group" aria-label="Select size">
      <span className="size-picker__label">Size options</span>
      <div className="size-picker__buttons">
        {SIZES.map(({ value, label, scoops }) => (
          <button
            key={value}
            type="button"
            className={`size-picker__btn${selected === value ? ' size-picker__btn--active' : ''}`}
            onClick={() => onChange(value)}
            aria-pressed={selected === value}
          >
            <ConeIcon scoops={scoops} />
            <span className="size-picker__name">{label}</span>
            <span className="size-picker__meta">
              {scoops} {scoops === 1 ? 'scoop' : 'scoops'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
