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

  if (!form.date) errors.date = 'Please select a date.'
  else if (form.date < today) errors.date = 'Date must be today or in the future.'

  if (!form.time) errors.time = 'Please select a time slot.'
  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (form.phone.replace(/[^\d]/g, '').length < 7) {
    errors.phone = 'Enter at least 7 digits.'
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
      setServerError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link to="/" className="text-sm mb-6 inline-block" style={{ color: 'var(--accent)' }}>
          ← Back to catalog
        </Link>

        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-h)' }}>
          Book a Table
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text)' }}>
          Reserve your spot — we&apos;ll be ready when you arrive.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <DateInput value={form.date} error={errors.date} onChange={(v) => setField('date', v)} />
            <TimeSelect value={form.time} error={errors.time} onChange={(v) => setField('time', v)} />
          </div>

          <PartySizeInput
            value={form.partySize}
            error={errors.partySize}
            onChange={(v) => setField('partySize', v)}
          />

          <div className="grid grid-cols-2 gap-4">
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
            <p className="text-sm rounded-lg px-4 py-3" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {submitting ? 'Reserving…' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </main>
  )
}
