import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { BookingFormData } from '@/types/booking'

export default function BookingConfirmationPage() {
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingFormData | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('booking_confirmation')
    if (!raw) {
      navigate('/booking', { replace: true })
      return
    }
    setBooking(JSON.parse(raw) as BookingFormData)
  }, [navigate])

  if (!booking) return null

  const rows = [
    { label: 'Date', value: new Date(booking.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
    { label: 'Time', value: booking.time },
    { label: 'Party size', value: `${booking.partySize} guest${booking.partySize !== 1 ? 's' : ''}` },
    { label: 'Name', value: `${booking.firstName} ${booking.lastName}` },
    { label: 'Email', value: booking.email },
    { label: 'Phone', value: booking.phone },
  ]

  return (
    <main className="flex flex-col items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md rounded-2xl p-8 border"
        style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-6 mx-auto"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          ✓
        </div>

        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--text-h)' }}>
          Reservation confirmed!
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text)' }}>
          We look forward to seeing you.
        </p>

        <dl className="flex flex-col gap-3 mb-8">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <dt className="font-medium" style={{ color: 'var(--text)' }}>{label}</dt>
              <dd style={{ color: 'var(--text-h)' }}>{value}</dd>
            </div>
          ))}
        </dl>

        <Link
          to="/"
          className="block w-full text-center py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: 'var(--accent)' }}
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
