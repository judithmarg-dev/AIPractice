import type { BookingStatus } from '@/types/booking'

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',   bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04' },
  confirmed: { label: 'Confirmed', bg: 'rgba(34,197,94,0.12)',  color: '#16a34a' },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.12)',  color: '#dc2626' },
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, bg, color } = STATUS_CONFIG[status]
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}
