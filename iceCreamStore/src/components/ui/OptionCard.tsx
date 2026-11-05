import type { ReactNode } from 'react'
import { Icon, type IconId } from '@/components/icons'

interface OptionCardProps {
  type: 'radio' | 'checkbox'
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  /** "+$0.50", "Incluido"… */
  price?: string
  icon?: IconId
  image?: string
  /** Swatch colour behind the icon (products). */
  color?: string
  /** Unavailable: dimmed, announced, still focusable (aria-disabled). */
  disabled?: boolean
  /** Reason shown when disabled: "Agotado", "Máximo alcanzado". */
  note?: string
  /** Rendered under the card body, outside the label (e.g. a quantity stepper). */
  children?: ReactNode
}

/** Selectable card with a real radio/checkbox inside (RF-4.7). */
export function OptionCard({
  type, name, checked, onChange, title, price, icon, image, color, disabled = false, note, children,
}: OptionCardProps) {
  const classes = ['option-card', checked && 'option-card--checked', disabled && 'option-card--disabled']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes}>
      <label className="option-card__label">
        <input
          type={type}
          name={name}
          className="option-card__input"
          checked={checked}
          aria-disabled={disabled || undefined}
          onChange={(e) => {
            if (!disabled) onChange(e.target.checked)
          }}
          onClick={(e) => {
            // A checked radio clicked again stays checked; disabled cards never change.
            if (disabled) e.preventDefault()
          }}
        />
        <span
          className="option-card__media"
          style={color ? ({ '--swatch': color } as React.CSSProperties) : undefined}
          aria-hidden="true"
        >
          {image ? <img src={image} alt="" /> : icon ? <Icon name={icon} size={26} /> : null}
        </span>
        <span className="option-card__text">
          <span className="option-card__title">{title}</span>
          {price && <span className="option-card__price">{price}</span>}
          {disabled && note && <span className="option-card__note">{note}</span>}
        </span>
        <span className="option-card__check" aria-hidden="true">
          <Icon name="check" size={14} strokeWidth={3} />
        </span>
      </label>
      {children}
    </div>
  )
}
