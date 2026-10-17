import { useId } from 'react'
import { Icon, PICKER_ICONS, type IconId } from '@/components/icons'

/** Radio group of icon cards (RF-0.7). */
export function IconPicker({ value, onChange, label = 'Ícono' }: { value: IconId; onChange: (id: IconId) => void; label?: string }) {
  const name = useId()
  return (
    <fieldset className="icon-picker">
      <legend className="field__label">{label}</legend>
      <div className="icon-picker__grid">
        {PICKER_ICONS.map(({ id, label: iconLabel }) => (
          <label key={id} className={`icon-picker__item${value === id ? ' icon-picker__item--checked' : ''}`} title={iconLabel}>
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === id}
              onChange={() => onChange(id)}
            />
            <Icon name={id} size={22} />
            <span className="sr-only">{iconLabel}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
