import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAllBookings, updateBookingStatus } from '@/store/slices/bookingsSlice'
import { StatusBadge } from '@/components/staff/StatusBadge'
import type { BookingStatus } from '@/types/booking'

export default function BookingsPage() {
  const dispatch = useAppDispatch()
  const bookings = useAppSelector(selectAllBookings)

  function handleStatusChange(id: string, status: BookingStatus) {
    dispatch(updateBookingStatus({ id, status }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-h)' }}>Bookings</h1>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
              {['Name', 'Date', 'Time', 'Guests', 'Contact', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-h)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-h)' }}>
                  {b.first_name} {b.last_name}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{b.date}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{b.time}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{b.party_size}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                  <div>{b.email}</div>
                  <div className="text-xs">{b.phone}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'confirmed')}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                      >
                        Confirm
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'cancelled')}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text)' }}>No bookings yet.</p>
        )}
      </div>
    </div>
  )
}
