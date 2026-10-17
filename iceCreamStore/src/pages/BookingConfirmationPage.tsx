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
    { label: 'Fecha', value: new Date(booking.date + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
    { label: 'Hora', value: booking.time },
    { label: 'Personas', value: `${booking.partySize} ${booking.partySize !== 1 ? 'personas' : 'persona'}` },
    { label: 'Nombre', value: `${booking.firstName} ${booking.lastName}` },
    { label: 'Correo', value: booking.email },
    { label: 'Teléfono', value: booking.phone },
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
          ¡Reserva confirmada!
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text)' }}>
          Te esperamos.
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
          Volver al menú
        </Link>
      </div>
    </main>
  )
}
