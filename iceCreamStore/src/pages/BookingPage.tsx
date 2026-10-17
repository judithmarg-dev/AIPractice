import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { DateInput } from '@/components/booking/DateInput'
import { TimeSelect } from '@/components/booking/TimeSelect'
import { PartySizeInput } from '@/components/booking/PartySizeInput'
import { ContactFields } from '@/components/booking/ContactFields'
import { submitBooking } from '@/services/bookingService'
import type { BookingFormData, BookingFormErrors } from '@/types/booking'

function validate(form: BookingFormData): BookingFormErrors {
  const errors: BookingFormErrors = {}
  const today = new Date().toISOString().slice(0, 10)

  if (!form.date) errors.date = 'Elige una fecha.'
  else if (form.date < today) errors.date = 'La fecha debe ser hoy o posterior.'

  if (!form.time) errors.time = 'Elige un horario.'
  if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio.'
  if (!form.lastName.trim()) errors.lastName = 'El apellido es obligatorio.'

  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Escribe un correo válido.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio.'
  } else if (form.phone.replace(/[^\d]/g, '').length < 7) {
    errors.phone = 'Escribe al menos 7 dígitos.'
  }

  return errors
}

export default function BookingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<BookingFormData>({
    date: '',
    time: '',
    partySize: 2,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<BookingFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function setField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      await submitBooking(form)
      sessionStorage.setItem('booking_confirmation', JSON.stringify(form))
      navigate('/booking/confirmation')
    } catch {
      setServerError('Algo salió mal. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link to="/" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
          ← Volver al menú
        </Link>

        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-h)' }}>
          Reservar una mesa
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text)' }}>
          Reserva tu lugar y te esperamos con todo listo.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput value={form.date} error={errors.date} onChange={(v) => setField('date', v)} />
            <TimeSelect value={form.time} error={errors.time} onChange={(v) => setField('time', v)} />
          </div>

          <PartySizeInput
            value={form.partySize}
            error={errors.partySize}
            onChange={(v) => setField('partySize', v)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContactFields
              firstName={form.firstName}
              lastName={form.lastName}
              email={form.email}
              phone={form.phone}
              errors={errors}
              onChange={setField}
            />
          </div>

          {serverError && (
            <p className="text-sm rounded-lg px-4 py-3" style={{ background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {submitting ? 'Reservando…' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </main>
  )
}
