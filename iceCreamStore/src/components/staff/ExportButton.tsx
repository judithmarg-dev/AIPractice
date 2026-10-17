import { exportBookingsCSV } from '@/lib/exportCsv'
import { useAppSelector } from '@/store/hooks'
import { selectAllBookings } from '@/store/slices/bookingsSlice'
import { Icon } from '@/components/icons'

export function ExportButton() {
  const bookings = useAppSelector(selectAllBookings)

  return (
    <button type="button" onClick={() => exportBookingsCSV(bookings)} className="btn btn--secondary btn--sm" disabled={bookings.length === 0}>
      <Icon name="download" size={16} /> Exportar CSV
    </button>
  )
}
