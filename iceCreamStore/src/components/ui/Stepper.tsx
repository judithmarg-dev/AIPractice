import { Icon } from '@/components/icons'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /** Accessible group name, e.g. "Cantidad de Pistacho". */
  label: string
  size?: 'sm' | 'md'
}

/** Pill "− n +" control. */
export function Stepper({ value, onChange, min = 0, max = 99, label, size = 'md' }: StepperProps) {
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Quitar uno"
      >
        <Icon name="minus" size={16} strokeWidth={2.4} />
      </button>
      <span className="stepper__value" aria-live="polite">{value}</span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Añadir uno"
      >
        <Icon name="plus" size={16} strokeWidth={2.4} />
      </button>
    </div>
  )
}
