import type { Booking } from '@/types/booking'
import { downloadCsv, toCsv } from '@/lib/csv'

const STATUS: Record<Booking['status'], string> = { pending: 'pendiente', confirmed: 'confirmada', cancelled: 'cancelada' }

export function exportBookingsCSV(bookings: Booking[]): void {
  const headers = ['fecha', 'hora', 'personas', 'nombre', 'apellido', 'correo', 'telefono', 'estado', 'enviada']
  const rows = bookings.map((b) => [
    b.date,
    b.time,
    b.party_size,
    b.first_name,
    b.last_name,
    b.email,
    b.phone,
    STATUS[b.status],
    new Date(b.created_at).toLocaleString('es', { hour12: false }),
  ])
  downloadCsv(`reservas-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(headers, rows))
}
