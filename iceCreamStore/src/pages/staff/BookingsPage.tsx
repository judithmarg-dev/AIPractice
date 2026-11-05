import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAllBookings, updateBookingStatus } from '@/store/slices/bookingsSlice'
import { StatusBadge } from '@/components/staff/StatusBadge'
import { ExportButton } from '@/components/staff/ExportButton'
import type { BookingStatus } from '@/types/booking'

export default function BookingsPage() {
  const dispatch = useAppDispatch()
  const bookings = useAppSelector(selectAllBookings)

  function handleStatusChange(id: string, status: BookingStatus) {
    dispatch(updateBookingStatus({ id, status }))
  }

  return (
    <div className="staff-page">
      <header className="staff-page__head">
        <div>
          <h1 className="staff-page__title">Reservas</h1>
          <p className="staff-page__subtitle">Mesas reservadas desde la página pública.</p>
        </div>
        <ExportButton />
      </header>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {['Nombre', 'Fecha', 'Hora', 'Personas', 'Contacto', 'Estado', 'Acciones'].map((h) => (
                <th key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="data-table__strong">{b.first_name} {b.last_name}</td>
                <td>{new Date(b.date + 'T12:00:00').toLocaleDateString('es')}</td>
                <td>{b.time}</td>
                <td>{b.party_size}</td>
                <td>
                  <div>{b.email}</div>
                  <div className="data-table__small">{b.phone}</div>
                </td>
                <td><StatusBadge status={b.status} /></td>
                <td>
                  <div className="data-table__actions">
                    {b.status === 'pending' && (
                      <button type="button" onClick={() => handleStatusChange(b.id, 'confirmed')} className="btn btn--secondary btn--sm">
                        Confirmar
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button type="button" onClick={() => handleStatusChange(b.id, 'cancelled')} className="btn btn--warning btn--sm">
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && <p className="staff-page__empty data-table__empty">Todavía no hay reservas.</p>}
      </div>
    </div>
  )
}
