import type { BookingStatus } from '@/types/booking'

const STATUS_CONFIG: Record<BookingStatus, { label: string; tone: string }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  confirmed: { label: 'Confirmada', tone: 'accent' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, tone } = STATUS_CONFIG[status]
  return <span className={`chip chip--${tone}`}>{label}</span>
}
