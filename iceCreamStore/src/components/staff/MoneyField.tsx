import { useId } from 'react'

interface MoneyFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  required?: boolean
}

/** Dollar amount typed as text ("2.60"); parsed to cents by the form with `parseMoneyInput`. */
export function MoneyField({ label, value, onChange, error, hint, required }: MoneyFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
      </label>
      <div className="field__money">
        <span className="field__prefix" aria-hidden="true">$</span>
        <input
          id={id}
          className="field__input"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined}
        />
      </div>
      {hint && <span id={hintId} className="field__hint">{hint}</span>}
      {error && <span id={errorId} className="field__error" role="alert">{error}</span>}
    </div>
  )
}
