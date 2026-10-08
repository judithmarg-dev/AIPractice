import { exportBookingsCSV } from '@/lib/exportCsv'
import { useAppSelector } from '@/store/hooks'
import { selectAllBookings } from '@/store/slices/bookingsSlice'

export function ExportButton() {
  const bookings = useAppSelector(selectAllBookings)

  function handleExport() {
    exportBookingsCSV(bookings)
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 rounded-lg text-sm font-semibold border"
      style={{ borderColor: 'var(--border)', color: 'var(--text-h)', background: 'var(--bg)' }}
    >
      ↓ Export CSV
    </button>
  )
}
