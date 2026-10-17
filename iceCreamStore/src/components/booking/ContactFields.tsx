import type { BookingFormErrors } from '@/types/booking'

interface Props {
  firstName: string
  lastName: string
  email: string
  phone: string
  errors: BookingFormErrors
  onChange: (field: string, value: string) => void
}

function Field({
  id, label, type = 'text', value, error, onChange, placeholder,
}: {
  id: string; label: string; type?: string; value: string
  error?: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
        style={{
          borderColor: error ? 'var(--danger)' : 'var(--border)',
          background: 'var(--bg)',
          color: 'var(--text-h)',
        }}
      />
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}

export function ContactFields({ firstName, lastName, email, phone, errors, onChange }: Props) {
  return (
    <>
      <Field id="firstName" label="Nombre" value={firstName} error={errors.firstName} onChange={(v) => onChange('firstName', v)} />
      <Field id="lastName"  label="Apellido" value={lastName}  error={errors.lastName}  onChange={(v) => onChange('lastName', v)} />
      <Field id="email"  label="Correo" type="email" value={email} error={errors.email} onChange={(v) => onChange('email', v)}  placeholder="tu@correo.com" />
      <Field id="phone"  label="Teléfono" type="tel"   value={phone} error={errors.phone} onChange={(v) => onChange('phone', v)}  placeholder="+1 555 000 0000" />
    </>
  )
}
