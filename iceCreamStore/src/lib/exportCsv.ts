import type { Booking } from '@/types/booking'

export function exportBookingsCSV(bookings: Booking[]): void {
  const headers = ['Date', 'Time', 'Party Size', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Submitted']
  const rows = bookings.map((b) => [
    b.date,
    b.time,
    b.party_size,
    b.first_name,
    b.last_name,
    b.email,
    b.phone,
    b.status,
    new Date(b.created_at).toLocaleString(),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
