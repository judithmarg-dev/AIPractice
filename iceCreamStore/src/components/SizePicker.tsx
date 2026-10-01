import type { Size } from '../types/flavor'

const SIZES: { value: Size; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
]

interface SizePickerProps {
  selected: Size
  onChange: (size: Size) => void
}

export function SizePicker({ selected, onChange }: SizePickerProps) {
  return (
    <div className="size-picker" role="group" aria-label="Select size">
      <span className="size-picker__label">Size</span>
      <div className="size-picker__buttons">
        {SIZES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`size-picker__btn${selected === value ? ' size-picker__btn--active' : ''}`}
            onClick={() => onChange(value)}
            aria-pressed={selected === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
